import { NextResponse } from 'next/server'
import { db } from '@/app/db'
import { techniques } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

// UPDATE technique
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updated = await db.update(techniques)
      .set({
        title: body.title,
        note: body.note,
        updatedAt: new Date(),
      })
      .where(eq(techniques.id, parseInt(id)))
      .returning()
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update technique' },
      { status: 500 }
    )
  }
}