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
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch techniques' },
      { status: 500 }
    )
  }
}

// POST new technique
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newTechnique = await db.insert(techniques).values({
      gifUrl: body.gifUrl,
      title: body.title,
      note: body.note || '',
      tags: body.tags || [],
      nextReview: new Date(),
      timesReviewed: 0,
      confidence: 'medium',
    }).returning()
    
    return NextResponse.json(newTechnique[0])
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create technique' },
      { status: 500 }
    )
  }
}