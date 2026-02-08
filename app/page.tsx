'use client'

import { useState } from 'react'
import { techniques } from './data/techniques'

export default function Tap() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = techniques[currentIndex]

  const handleTap = () => {
    setCurrentIndex((prev) => (prev + 1) % techniques.length)
  }

  return (
    <div 
      onClick={handleTap}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white cursor-pointer select-none"
    >
      <div className="max-w-2xl w-full space-y-6">
        <img 
          src={current.gifPath} 
          alt={current.name}
          className="w-full rounded-lg"
        />
        
        <h2 className="text-3xl font-bold text-center">
          {current.name}
        </h2>
        
        <p className="text-gray-300 text-center text-lg">
          {current.note}
        </p>
        
        <p className="text-gray-500 text-center">
          {currentIndex + 1} of {techniques.length}
        </p>
        
        <p className="text-gray-600 text-center text-sm">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  )
}