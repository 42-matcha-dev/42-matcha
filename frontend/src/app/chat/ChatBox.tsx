'use client'

import React, { useEffect, useState, useRef } from 'react'
import KebabMenu from '../components/KebabMenu'
import { useRouter } from 'next/navigation'
import { RiSendPlaneFill } from 'react-icons/ri'
import MessageBubble from './MessageBubble'
import Image from 'next/image'
import { fetchMessages, fetchConversation, blockUser as apiBlock, reportUser as apiReport, type Conversation, type Message, type ReportReason } from '@/lib/chat'
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
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState<ReportReason>('FAKE_ACCOUNT')
  const [reportDescription, setReportDescription] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  
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
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
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
          first_name: profile.firstName ?? null,
          last_name: profile.lastName ?? null,
          icon_url: profile.iconUrl ?? null,
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
        setError(res.error)
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

  const handleBlock = async () => {
    if (!conversation?.otherUser?.id || actionLoading) return
    try {
      setActionLoading(true)
      await apiBlock(conversation.otherUser.id)
      router.push('/chat')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to block user')
    } finally {
      setActionLoading(false)
      // setMenuOpen(false)
    }
  }

  const handleReport = async () => {
    if (!conversation?.otherUser?.id || actionLoading) return
    try {
      setActionLoading(true)
      await apiReport(conversation.otherUser.id, reportReason, reportDescription || undefined)
      setShowReportModal(false)
      router.push('/chat')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to report user')
    } finally {
      setActionLoading(false)
    }
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
        <div className="ml-2 flex-1">
          <h3 className="font-semibold text-[#2A3D39] text-lg">{fullName}</h3>
          <p className="font-light text-[#2A3D39] text-sm">@{otherUser?.username ?? ''}</p>
        </div>
      <KebabMenu
         items={[
           { label: 'Block user', onClick: handleBlock, disabled: actionLoading },
           { label: 'Report user', onClick: () => setShowReportModal(true), disabled: actionLoading, className: 'text-red-600' },
         ]}
       />
      </header>
      <main className="flex-1 max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-250px)] overflow-y-auto p-4 space-y-4">
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
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report User</h3>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as ReportReason)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="FAKE_ACCOUNT">Fake Account</option>
              <option value="SPAM">Spam</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="INAPPROPRIATE">Inappropriate Content</option>
              <option value="OTHER">Other</option>
            </select>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              rows={3}
              placeholder="Add details..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ChatBox
