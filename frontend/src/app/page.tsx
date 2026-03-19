'use client'

import Header from './components/Header'
import Footer from './components/Footer'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      {message && <h1 className="bg-blue-500 text-white p-4">{message}</h1>}
      <main className="flex flex-col items-center justify-center flex-1 pb-16">
        <h2 className="text-2xl mb-4 text-black">Welcome to Matcha</h2>
        <button
          onClick={() => router.push('/signup')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Sign Up
        </button>
      </main>
      <Footer />
    </div>
  )
}
