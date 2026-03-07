'use client'

import React, { useEffect, useState, useRef } from 'react'
// import io from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { RiSendPlaneFill } from 'react-icons/ri'
import MessageBubble from './MessageBubble'
import Image from 'next/image'
import { fetchMessages, sendMessage, fetchConversation, type Conversation, type Message } from '@/lib/chat'
import { getCookie, deleteCookie } from '@/utils/cookie.util'

// const socket = io(process.env.NEXT_PUBLIC_API_URL)

type MessageBubbleFormat = {
  id: number
  author: string
  username: string
  avatar: string
  message: string
  date: string
  isMe: boolean
}

function mapToBubbleFormat(msg: Message, currentUserId: number, otherUser: Conversation['otherUser']): MessageBubbleFormat {
  const isMe = msg.sender_id === currentUserId
  const fullName = [otherUser.first_name, otherUser.last_name].filter(Boolean).join(' ') || 'Unknown'
  return {
    id: msg.id,
    author: isMe ? 'Me' : fullName,
    username: otherUser.username,
    avatar: otherUser.icon_url || '/default-avatar.png',
    message: msg.content,
    date: msg.created_at,
    isMe,
  }
}

type ChatBoxProps = {
  conversationId: number
}

const ChatBox = ({ conversationId }: ChatBoxProps) => {
  const router = useRouter()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<MessageBubbleFormat[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    const load = async () => {
      const token = getCookie('token')
      if (!token) {
        router.push('/login')
        return
      }
      try {
        setLoading(true)
        setError(null)
        const [profileRes, conv, msgs] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchConversation(conversationId),
          fetchMessages(conversationId),
        ])
        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            deleteCookie('token')
            router.push('/login')
            return
          }
          throw new Error('Failed to load profile')
        }
        const profile = await profileRes.json()
        setCurrentUserId(profile.id)
        if (!conv) {
          setError('Conversation not found')
          return
        }
        setConversation(conv)
        const bubbles = msgs.map((m) => mapToBubbleFormat(m, profile.id, conv.otherUser))
        setMessages(bubbles)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load conversation'
        setError(msg)
        if (msg === 'Unauthorized') {
          deleteCookie('token')
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [conversationId, router])
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !currentUserId || !conversation) return
    try {
      const newMsg = await sendMessage(conversationId, trimmed)
      const bubble = mapToBubbleFormat(newMsg, currentUserId, conversation.otherUser)
      setMessages((prev) => [...prev, bubble])
      setInput('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }
  const handleBack = () => {
    router.push('/chat')
  }
  const otherUser = conversation?.otherUser
  const fullName = otherUser
    ? [otherUser.first_name, otherUser.last_name].filter(Boolean).join(' ') || 'Unknown'
    : ''
  if (loading) {
    return (
      <section className="flex flex-col h-screen bg-white w-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </section>
    )
  }
  if (error) {
    return (
      <section className="flex flex-col h-screen bg-white w-full items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          type="button"
          onClick={handleBack}
          className="text-[#01AA85] underline"
        >
          Back to messages
        </button>
      </section>
    )
  }
  return (
    <section className="flex flex-col h-screen bg-white w-full">
      <header className="border-b border-gray-400 h-[70px] p-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="md:hidden p-1 -ml-1"
          aria-label="Back"
        >
          <span className="text-2xl">←</span>
        </button>
        <Image
          src={otherUser?.icon_url || '/default-avatar.png'}
          className="flex-shrink-0 border border-black rounded-full"
          alt=""
          width={44}
          height={44}
        />
        <div className="ml-2">
          <h3 className="font-semibold text-[#2A3D39] text-lg">{fullName}</h3>
          <p className="font-light text-[#2A3D39] text-sm">@{otherUser?.username ?? ''}</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>
      <form
        onSubmit={handleSend}
        className="flex flex-row border border-black mb-2 h-[45px] w-full px-2 rounded-lg"
      >
        <input
          className="text-black w-full outline-none"
          type="text"
          placeholder="Écris ton message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="p-4">
          <RiSendPlaneFill color="black" />
        </button>
      </form>
    </section>
  )
}

// // const ChatBox = () => {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState('')
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   // Écoute les messages entrants
//   useEffect(() => {
//     socket.on('newMessage', (msg) => {
//       setMessages((prev) => [...prev, msg])
//     })

//     return () => {
//       socket.off('newMessage')
//     }
//   }, [])

//   // Scroll automatique vers le dernier message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const send = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!input.trim()) return

//     const msg = {
//       id: Date.now(),
//       author: 'Me',
//       username: 'me',
//       avatar: '/default-avatar.png',
//       message: input,
//       date: new Date().toISOString(),
//       isMe: true
//     }

//     socket.emit('sendMessage', msg)
//     setInput('')
//   }

//   return (
//     <section className="flex flex-col h-screen bg-white w-full">
//       {/* Header */}
//       <header className="border-b border-gray-400 h-[70px] p-4 flex items-center">
//         <Image
//           src="/default-avatar.png"
//           className="flex-shrink-0 border border-black rounded-full"
//           alt="Avatar"
//           width={44}
//           height={44}
//         />
//         <div className="ml-4">
//           <h3 className="font-semibold text-[#2A3D39] text-lg">Etienne Desaintjean</h3>
//           <p className="font-light text-[#2A3D39] text-sm">@edesaint</p>
//         </div>
//       </header>

//       {/* Conversation */}
//       <main className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg) => (
//           <MessageBubble key={msg.id} message={msg} />
//         ))}
//         <div ref={messagesEndRef} />
//       </main>

//       {/* User message */}
//       <form
//         onSubmit={send}
//         className="flex flex-row border border-black mb-2 h-[45px] w-full px-2 rounded-lg"
//       >
//         <input
//           className="text-black w-full outline-none"
//           type="text"
//           placeholder="Écris ton message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button className="p-4">
//           <RiSendPlaneFill color="black" />
//         </button>
//       </form>
//     </section>
//   )
// }

export default ChatBox
