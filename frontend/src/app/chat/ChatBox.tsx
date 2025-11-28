'use client'

import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { RiSendPlaneFill } from 'react-icons/ri'
import MessageBubble from './MessageBubble'
import Image from 'next/image'

const socket = io(process.env.NEXT_PUBLIC_API_URL)

type Message = {
  id: number
  author: string
  username: string
  avatar: string
  message: string
  date: string
  isMe: boolean
}

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Écoute les messages entrants
  useEffect(() => {
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.off('newMessage')
    }
  }, [])

  // Scroll automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const msg = {
      id: Date.now(),
      author: 'Me',
      username: 'me',
      avatar: '/default-avatar.png',
      message: input,
      date: new Date().toISOString(),
      isMe: true
    }

    socket.emit('sendMessage', msg)
    setInput('')
  }

  return (
    <section className="flex flex-col h-screen bg-white w-full">
      {/* Header */}
      <header className="border-b border-gray-400 h-[70px] p-4 flex items-center">
        <Image
          src="/default-avatar.png"
          className="flex-shrink-0 border border-black rounded-full"
          alt="Avatar"
          width={44}
          height={44}
        />
        <div className="ml-4">
          <h3 className="font-semibold text-[#2A3D39] text-lg">Etienne Desaintjean</h3>
          <p className="font-light text-[#2A3D39] text-sm">@edesaint</p>
        </div>
      </header>

      {/* Conversation */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* User message */}
      <form
        onSubmit={send}
        className="flex flex-row border border-black mb-2 h-[45px] w-full px-2 rounded-lg"
      >
        <input
          className="text-black w-full outline-none"
          type="text"
          placeholder="Écris ton message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="p-4">
          <RiSendPlaneFill color="black" />
        </button>
      </form>
    </section>
  )
}

export default ChatBox
