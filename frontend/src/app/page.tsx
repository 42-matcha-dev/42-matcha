"use client";

import Header from "./components/Header";
import SignupMain from "@/app/components/SignupMain";
import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:4000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, [])

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <h1 className='bg-blue-500 text-white p-4'>{message}</h1>
      <div className="flex flex-1 overflow-hidden">
        <SignupMain />
      </div>
    </main>
  );
}
