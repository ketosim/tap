import { NextResponse } from 'next/server'
import { db } from '@/app/db'
import { techniques } from '@/app/db/schema'
import { desc } from 'drizzle-orm'

// GET all techniques
export async function GET() {
  try {
    const allTechniques = await db
      .select()
      .from(techniques)
      .orderBy(desc(techniques.createdAt))

    return NextResponse.json(allTechniques)
  } catch (error) {
    console.error('Fetch techniques error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch techniques',
        details:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST new technique
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('Creating technique:', {
      title: body.title,
      mediaUrl: body.gifUrl,
    })

    if (!body.gifUrl) {
      return NextResponse.json(
        { error: 'Media URL is required' },
        { status: 400 }
      )
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const newTechnique = await db
      .insert(techniques)
      .values({
        // Kept as gifUrl for compatibility with your existing database.
        // This can contain GIF, MP4, MOV, or WebM URLs.
        gifUrl: body.gifUrl,
        title: body.title.trim(),
        note: body.note?.trim() || '',
        tags: Array.isArray(body.tags) ? body.tags : [],
        nextReview: new Date(),
        timesReviewed: 0,
        confidence: 'medium',
      })
      .returning()

    console.log('Technique created:', newTechnique[0]?.id)

    return NextResponse.json(newTechnique[0], {
      status: 201,
    })
  } catch (error) {
    console.error('Create technique error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create technique',
        details:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
