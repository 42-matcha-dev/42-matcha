// frontend/src/app/page.tsx (ou autre composant React)
'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  const api = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    fetch(`${api}/api/hello`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, [])

  return (
    <main>
      <h1>{message}</h1>
    </main>
  )
}
