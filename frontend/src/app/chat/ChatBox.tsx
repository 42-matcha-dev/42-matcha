'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RiSendPlaneFill } from 'react-icons/ri'
import MessageBubble from './MessageBubble'
import Image from 'next/image'
import { fetchMessages, fetchConversation, type Conversation, type Message } from '@/lib/chat'
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import { getSocket } from '@/lib/socket'


type MessageBubbleFormat = {
  id: number
  author: string
  username: string
  avatar: string
  message: string
  date: string
  isMe: boolean
}

type ParticipantIdentity = {
  id: number
  username: string
  first_name: string | null
  last_name: string | null
  icon_url: string | null
}

function toFullName(first: string | null, last: string | null, fallback: string): string {
  return [first, last].filter(Boolean).join(' ') || fallback || 'Unknown'
}


function mapToBubbleFormat(
  msg: Message,
  currentUser: ParticipantIdentity,
  otherUser: Conversation['otherUser']
): MessageBubbleFormat {
  const isMe = Number(msg.sender_id) === Number(currentUser.id)
  const sender = isMe ? currentUser : otherUser
  const fullName = toFullName(sender.first_name, sender.last_name, sender.username)
  return {
    id: msg.id,
    author: fullName,
    username: sender.username,
    avatar: sender.icon_url || '/default-avatar.png',
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
  const [currentUser, setCurrentUser] = useState<ParticipantIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial load (REST)
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
        const profileId = Number(profile.id)
        if (Number.isNaN(profileId)) {
          throw new Error('Invalid profile id')
        }
        const normalizedCurrentUser: ParticipantIdentity = {
          id: profileId,
          username: profile.username ?? '',
          first_name: profile.first_name ?? null,
          last_name: profile.last_name ?? null,
          icon_url: profile.icon_url ?? null,
        }
        setCurrentUser(normalizedCurrentUser)
        if (!conv) {
          setError('Conversation not found')
          return
        }
        setConversation(conv)
        const bubbles = msgs.map((m) => mapToBubbleFormat(m, normalizedCurrentUser, conv.otherUser))
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

  useEffect(() => {
    if (loading || error || !currentUser || !conversation) return

    const socket = getSocket()
    const markConversationRead = () => {
      socket.emit(
        'markConversationRead',
        { conversationId: Number(conversationId) },
        (res: { ok?: boolean; error?: string }) => {
          if (res?.error) console.error('Mark read error:', res.error)
        }
      )
    }
    socket.emit('joinConversation', { conversationId: Number(conversationId) }, (res: { ok?: boolean; error?: string }) => {
      if (res?.error) console.error('Socket join error:', res.error)
    })

    const onNewMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, mapToBubbleFormat(msg, currentUser, conversation.otherUser)]
      })
      if (Number(msg.sender_id) !== Number(currentUser.id)) {
        markConversationRead()
      }
    }
    socket.on('newMessage', onNewMessage)
    return () => {
      socket.off('newMessage', onNewMessage)
      socket.emit('leaveConversation', { conversationId })
    }
  }, [conversationId, currentUser, conversation, loading, error])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !currentUser || !conversation) return

    const socket = getSocket()
    socket.emit('sendMessage', { conversationId, content: trimmed }, (res: { ok?: boolean; message?: Message; error?: string }) => {
      if (res?.error) {
        console.error('Send error:', res.error)
        return
      }
      if (res?.message) {
        const bubble = mapToBubbleFormat(res.message, currentUser, conversation.otherUser)
        setMessages((prev) => (prev.some((m) => m.id === bubble.id) ? prev : [...prev, bubble]))
      }
      setInput('')
    })
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
      <section className="flex flex-col h-full bg-white w-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </section>
    )
  }
  if (error) {
    return (
      <section className="flex flex-col h-full bg-white w-full items-center justify-center p-4">
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
    <section className="flex flex-col h-full bg-white w-full">
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
          className="w-11 h-11 min-w-11 min-h-11 flex-shrink-0 border border-black rounded-full object-cover aspect-square"
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

export default ChatBox
