'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { RiChatNewLine, RiChat3Line } from 'react-icons/ri'
import { fetchConversations, type Conversation } from '@/lib/chat'
import { getSocket } from '@/lib/socket'
import { getCookie, deleteCookie} from '@/utils/cookie.util'


function formatListTimestamp(isoDate: string | null): string {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true})
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function getFullName(first: string | null, last: string | null): string {
  const parts = [first, last].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Unknown'
}

type NewMatchItemProps = {
  conversation: Conversation
}
const NewMatchItem = ({ conversation }: NewMatchItemProps) => {
  const router = useRouter()
  const { otherUser, id } = conversation
  const fullName = getFullName(otherUser.first_name, otherUser.last_name)
  return (
    <button
      type="button"
      className="flex flex-row items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      onClick={() => router.push(`/chat/${id}`)}
    >
      <div className="relative flex-shrink-0">
        <Image
          src={otherUser.icon_url || '/default-avatar.png'}
          className="w-12 h-12 min-w-12 rounded-full object-cover border border-gray-200 aspect-square"
          alt=""
          width={48}
          height={48}
        />
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          otherUser.is_online ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-black truncate">{fullName}</h3>
          <span className="flex-shrink-0 text-xs text-gray-500">
            {formatListTimestamp(conversation.created_at)}
          </span>
        </div>
        <p className="text-sm text-blue-600 underline mt-0.5">
          You have matched with {fullName}!
        </p>
      </div>
    </button>
  )
}

type MessageListProps = {
  conversation: Conversation
}

const MessageListItem = ({ conversation }: MessageListProps) => {
  const router = useRouter()
  const { otherUser, lastMessage, id, unread_count = 0 } = conversation
  const fullName = getFullName(otherUser.first_name, otherUser.last_name)
  const timestamp = lastMessage?.created_at ?? conversation.created_at

  return (
    <button
      type="button"
      className="flex flex-row items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      onClick={() => router.push(`/chat/${id}`)}
    >
      <div className="relative flex-shrink-0">
        <Image
          src={otherUser.icon_url || '/default-avatar.png'}
          className="w-12 h-12 min-w-12 rounded-full object-cover border border-gray-200 aspect-square"
          alt=""
          width={48}
          height={48}
        />
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          otherUser.is_online ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-black truncate">{fullName}</h3>
          <span className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">
              {formatListTimestamp(timestamp)}
            </span>
            {unread_count > 0 && (
              <span className="bg-black text-white text-xs font-medium min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                {unread_count > 99 ? '99+' : unread_count}
              </span>
            )}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate mt-0.5">
          {lastMessage?.content ?? 'No messages yet'}
        </p>
      </div>
    </button>
  )
}

const ChatList = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeConversationId = useMemo(() => {
    const match = pathname.match(/^\/chat\/(\d+)/)
    if (!match) return null
    const id = Number(match[1])
    return Number.isNaN(id) ? null : id
  }, [pathname])

  const { newMatches, allMessages } = useMemo(() => {
    const newMatches = conversations.filter((c) => !c.lastMessage)
    const allMessages = conversations.filter((c) => c.lastMessage)
    return { newMatches, allMessages }
  }, [conversations])

  const loadConversations = useCallback(async () => {
    const token = getCookie('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchConversations()
      setConversations(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversations'
      setError(msg)
      if (msg === 'Unauthorized') {
        deleteCookie('token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  const upsertConversation = useCallback((incoming: Conversation) => {
    setConversations((prev) => {
      const nextConversation =
        activeConversationId !== null && Number(incoming.id) === Number(activeConversationId)
          ? { ...incoming, unread_count: 0 }
          : incoming
      const rest = prev.filter((c) => Number(c.id) !== Number(incoming.id))
      return [nextConversation, ...rest]
    })
  }, [activeConversationId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    const socket = getSocket()
    const onConversationUpdated = (conversation: Conversation) => {
      upsertConversation(conversation)
    }
    socket.on('conversationUpdated', onConversationUpdated)
    return () => {
      socket.off('conversationUpdated', onConversationUpdated)
    }
  }, [upsertConversation])

  useEffect(() => {
    const socket = getSocket()
    const onStatusChanged = ({ userId, isOnline }: { userId: number; isOnline: boolean }) => {
      setConversations(prev =>
        prev.map(c =>
          c.otherUser.id === userId
            ? { ...c, otherUser: { ...c.otherUser, is_online: isOnline } }
            : c
        )
      )
    }
    socket.on('userStatusChanged', onStatusChanged)
    return () => {
      socket.off('userStatusChanged', onStatusChanged)
    }
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0 bg-white w-full">
      <main className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <p className="p-4 text-gray-500">Loading...</p>
        )}
        {error && !loading && (
          <p className="p-4 text-red-500">{error}</p>
        )}
        {!loading && !error && conversations.length === 0 && (
          <p className="p-4 text-gray-500">No conversations yet. Start a chat from the search page!</p>
        )}
        {!loading && !error && newMatches.length > 0 && (
          <section className="py-2">
            <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
              <RiChatNewLine className="w-5 h-5" />
              <span className="font-medium text-sm">New Matches</span>
            </div>
            {newMatches.map((conv) => (
              <NewMatchItem key={conv.id} conversation={conv} />
            ))}
          </section>
        )}
        {!loading && !error && allMessages.length > 0 && (
          <section className="py-2 border-t border-gray-100">
            <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
              <RiChat3Line className="w-5 h-5" />
              <span className="font-medium text-sm">All Messages</span>
            </div>
            {allMessages.map((conv) => (
              <MessageListItem key={conv.id} conversation={conv} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default ChatList
