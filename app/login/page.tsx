'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check PIN (change '1234' to your desired PIN)
    if (pin === 'pppppppp') {
      // Store auth in localStorage and cookie
      localStorage.setItem('tap-auth', 'true')
      document.cookie = 'tap-auth=true; path=/; max-age=31536000'
      router.push('/')
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Tap</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError('')
              }}
              placeholder="••••"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}