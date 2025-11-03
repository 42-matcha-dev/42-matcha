"use client";

import Header from "./components/Header";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [message, setMessage] = useState('')
  const router = useRouter();

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/api/hello`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, [])

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <h1 className='bg-blue-500 text-white p-4'>{message}</h1>
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl mb-4">Welcome to Matcha</h2>
        <button
          onClick={() => router.push('/signup')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
}
