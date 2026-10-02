'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function AddTechnique() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const ffmpegRef = useRef<FFmpeg | null>(null)

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) {
      return ffmpegRef.current
    }

    setStatus('Loading video compressor...')

    const ffmpeg = new FFmpeg()

    const baseURL =
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'

    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    })

    ffmpegRef.current = ffmpeg

    return ffmpeg
  }

  const compressVideo = async (originalFile: File): Promise<File> => {
    const ffmpeg = await loadFFmpeg()

    setStatus('Compressing video...')

    const inputExtension =
      originalFile.name.split('.').pop()?.toLowerCase() || 'mov'

    const inputName = `input.${inputExtension}`
    const outputName = 'compressed.mp4'

    await ffmpeg.writeFile(
      inputName,
      await fetchFile(originalFile)
    )

    await ffmpeg.exec([
      '-i',
      inputName,

      // Resize to maximum 720p while preserving aspect ratio
      '-vf',
      'scale=-2:min(720\\,ih)',

      // H.264 video
      '-c:v',
      'libx264',

      // Compression quality
      '-crf',
      '28',

      // Faster encoding
      '-preset',
      'veryfast',

      // Remove audio to save more space
      '-an',

      // Better web playback
      '-movflags',
      '+faststart',

      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)

    const buffer = data instanceof Uint8Array
      ? data.slice().buffer
      : new TextEncoder().encode(data).buffer

    const compressedBlob = new Blob(
      [buffer],
      { type: 'video/mp4' }
    )

    const newName =
      originalFile.name.replace(/\.[^/.]+$/, '') +
      '-compressed.mp4'

    const compressedFile = new File(
      [compressedBlob],
      newName,
      {
        type: 'video/mp4',
      }
    )

    console.log(
      `Original: ${(originalFile.size / 1024 / 1024).toFixed(1)} MB`
    )

    console.log(
      `Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(1)} MB`
    )

    return compressedFile
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    const allowedTypes = [
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-m4v',
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a GIF, MP4, MOV, M4V, or WebM file.')
      e.target.value = ''
      return
    }

    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!file || !title) {
      alert('Please add a GIF or video and a title')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let fileToUpload = file

      // Compress videos only.
      // GIFs stay unchanged.
      if (file.type.startsWith('video/')) {
        fileToUpload = await compressVideo(file)

        setStatus(
          `Compressed to ${(fileToUpload.size / 1024 / 1024).toFixed(1)} MB`
        )
      }

      const timestamp = Date.now()

      const uniqueFilename =
        `${timestamp}-${fileToUpload.name}`

      setStatus('Uploading...')

      const blob = await upload(
        uniqueFilename,
        fileToUpload,
        {
          access: 'public',
          handleUploadUrl: '/api/upload-url',
          multipart: true,

          onUploadProgress: (progress) => {
            setUploadProgress(
              Math.round(progress.percentage)
            )
          },
        }
      )

      setStatus('Saving technique...')

      const createRes = await fetch(
        '/api/techniques',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            gifUrl: blob.url,
            title,
            note,
            tags: [],
          }),
        }
      )

      if (!createRes.ok) {
        const errorText = await createRes.text()

        throw new Error(
          errorText || 'Failed to save technique'
        )
      }

      setStatus('Done')

      router.push('/')

    } catch (error) {
      console.error('Upload error:', error)

      alert(
        'Failed to add technique: ' +
        (error as Error).message
      )

    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Add New Technique
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* File Upload */}
          <div>

            <label className="block text-sm font-medium mb-2">
              GIF or Video File
            </label>

            <input
              type="file"
              accept=".gif,.mp4,.mov,.m4v,.webm,image/gif,video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-800 file:text-white
                hover:file:bg-gray-700"
            />

          </div>

          {/* File Size */}
          {file && (

            <div className="text-sm text-gray-400">

              Original size:{' '}

              {(file.size / 1024 / 1024).toFixed(1)} MB

              {file.type.startsWith('video/') && (

                <span className="ml-2">
                  — will be compressed before upload
                </span>

              )}

            </div>

          )}

          {/* Preview */}
          {preview && file && (

            <div>

              <label className="block text-sm font-medium mb-2">
                Preview
              </label>

              {file.type.startsWith('video/') ? (

                <video
                  src={preview}
                  controls
                  playsInline
                  loop
                  className="w-full max-w-md rounded-lg"
                />

              ) : (

                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg"
                />

              )}

            </div>

          )}

          {/* Title */}
          <div>

            <label className="block text-sm font-medium mb-2">
              Technique Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g., Triangle from Closed Guard"
              required
              disabled={uploading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />

          </div>

          {/* Note */}
          <div>

            <label className="block text-sm font-medium mb-2">
              Quick Note
            </label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Key details to remember..."
              rows={3}
              disabled={uploading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />

          </div>

          {/* Status */}
          {uploading && (

            <div className="bg-gray-900 rounded-lg p-4">

              <div className="text-sm font-medium">
                {status}
              </div>

              {status === 'Uploading...' && (

                <div className="mt-2">

                  <div className="text-sm text-gray-400">
                    {uploadProgress}%
                  </div>

                  <div className="w-full bg-gray-800 rounded-full h-2 mt-1">

                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />

                  </div>

                </div>

              )}

            </div>

          )}

          {/* Buttons */}
          <div className="flex gap-4">

            <button
              type="submit"
              disabled={
                uploading ||
                !file ||
                !title
              }
              className="flex-1 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {uploading
                ? status || 'Processing...'
                : 'Add Technique'}

            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                router.push('/')
              }
              className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
            >

              Cancel

            </button>

          </div>

        </form>

      </div>

    </div>
  )
}