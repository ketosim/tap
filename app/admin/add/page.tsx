
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'

export default function AddTechnique() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    const allowedTypes = [
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a GIF, MP4, MOV, or WebM file.')
      e.target.value = ''
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title) {
      alert('Please add a GIF or video and a title')
      return
    }

    setUploading(true)

    try {
      // Create unique filename with timestamp
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}-${file.name}`

      // Upload directly to Blob from client
      const blob = await upload(uniqueFilename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
        multipart: true,
      })

      // Save technique to database
      const createRes = await fetch('/api/techniques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gifUrl: blob.url,
          title,
          note,
          tags: [],
        }),
      })

      if (!createRes.ok) {
        throw new Error('Failed to save technique')
      }

      // Success! Redirect to main page
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add technique: ' + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Technique</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GIF or Video File
            </label>

            <input
              type="file"
              accept=".gif,.mp4,.mov,.webm,image/gif,video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-800 file:text-white
                hover:file:bg-gray-700"
            />
          </div>

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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Triangle from Closed Guard"
              required
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
              onChange={(e) => setNote(e.target.value)}
              placeholder="Key details to remember..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading || !file || !title}
              className="flex-1 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Add Technique'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

