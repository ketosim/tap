import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  console.log('=== UPLOAD API CALLED ===')
  
  try {
    console.log('Getting formData...')
    const formData = await request.formData()
    
    console.log('Getting file...')
    const file = formData.get('file') as File
    
    console.log('File received:', file?.name, file?.size, 'bytes')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Uploading to Vercel Blob...')
    const blob = await put(file.name, file, {
      access: 'public',
    })

    console.log('Upload successful:', blob.url)
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}