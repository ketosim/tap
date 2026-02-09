'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Technique } from './db/schema'

export default function Tap() {
  const router = useRouter()
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editNote, setEditNote] = useState('')
  const [loading, setLoading] = useState(true)

  const current = techniques[currentIndex]

  // Load techniques
  useEffect(() => {
    fetch('/api/techniques')
      .then(res => res.json())
      .then(data => {
        setTechniques(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load:', err)
        setLoading(false)
      })
  }, [])

  // Sync edit fields when technique changes
  useEffect(() => {
    if (current) {
      setEditTitle(current.title)
      setEditNote(current.note || '')
    }
  }, [current])

  const handleTap = () => {
    if (!editMode && techniques.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % techniques.length)
    }
  }

  const handleSave = async () => {
    if (!current) return

    try {
      const response = await fetch(`/api/techniques/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          note: editNote,
        })
      })

      const updated = await response.json()
      
      setTechniques(prev => prev.map(t => 
        t.id === current.id ? updated : t
      ))
      
      setEditMode(false)
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save changes')
    }
  }

  const handleDelete = async () => {
    if (!current) return
    
    const confirmed = confirm(`Delete "${current.title}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/techniques/${current.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Delete failed')

      // Remove from local state
      const newTechniques = techniques.filter(t => t.id !== current.id)
      setTechniques(newTechniques)
      
      // Reset to first technique or show empty state
      if (newTechniques.length > 0) {
        setCurrentIndex(0)
      }
      setEditMode(false)
      
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete technique')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (techniques.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <h2 className="text-2xl font-bold mb-4">No techniques yet</h2>
        <p className="text-gray-400 mb-8">Add your first technique to get started</p>
        <button
          onClick={() => router.push('/admin/add')}
          className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
        >
          Add First Technique
        </button>
      </div>
    )
  }

  return (
    <div 
      onClick={editMode ? undefined : handleTap}
      className="min-h-screen flex flex-col bg-black text-white cursor-pointer"
    >      
      {/* Top buttons - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-center gap-8">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push('/admin/add')
            }}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            + Add New
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditMode(!editMode)
            }}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* GIF - Center */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-64">
        <div className="max-w-2xl w-full">
          <img 
            src={current.gifUrl} 
            alt={current.title}
            className="w-full rounded-lg"
          />
        </div>
      </div>

      {/* Bottom content - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-black p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Title */}
          {editMode ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-3xl font-bold text-center bg-gray-900 border border-gray-700 rounded-lg p-3"
            />
          ) : (
            <h2 className="text-3xl font-bold text-center">
              {current.title}
            </h2>
          )}
          
          {/* Note */}
          {editMode ? (
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              rows={3}
              className="w-full text-gray-300 text-center text-lg bg-gray-900 border border-gray-700 rounded-lg p-3"
              placeholder="Add a note..."
            />
          ) : (
            current.note && (
              <p className="text-gray-300 text-center text-lg">
                {current.note}
              </p>
            )
          )}

          {/* Save and Delete buttons */}
          {editMode && (
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 font-semibold"
              >
                Delete
              </button>
            </div>
          )}
          
          {/* Progress */}
          <p className="text-gray-500 text-center">
            {currentIndex + 1} of {techniques.length}
          </p>
          
          {!editMode && (
            <p className="text-gray-600 text-center text-sm">
              Tap anywhere to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}