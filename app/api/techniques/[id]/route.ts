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
    
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Technique not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update technique' },
      { status: 500 }
    )
  }
}

// DELETE technique
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const deleted = await db.delete(techniques)
      .where(eq(techniques.id, parseInt(id)))
      .returning()
    
    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Technique not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete technique' },
      { status: 500 }
    )
  }
}