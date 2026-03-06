'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SearchModal from './SearchModal'
import { RiMore2Fill } from 'react-icons/ri'
import { fetchConversations, type Conversation } from '@/lib/chat'
import { getCookie, deleteCookie} from '@/utils/cookie.util'


function formatTimestamp(isoDate: string | null): string {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

function getFullName(first: string | null, last: string | null): string {
  const parts = [first, last].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Unknown'
}

type MessageListProps = {
  conversation: Conversation
}

const MessageList = ({ conversation }: MessageListProps) => {
  const router = useRouter()
  const { otherUser, lastMessage, id } = conversation
  const fullName = getFullName(otherUser.first_name, otherUser.last_name)
  const timestamp = lastMessage?.created_at ?? conversation.created_at

  return (
    <button
    type="button"
    className="flex flex-row justify-between px-5 pb-2 w-full"
    onClick={() => router.push(`/chat/${id}`)}
    >
      <div className="flex flex-row p-2 items-center gap-2 flex-grow min-w-0">
        <Image
          src={otherUser.icon_url || '/default-avatar.png'}
          className="flex-shrink-0 border border-black rounded-full"
          alt=""
          width={56}
          height={52}
        />
        <span className="flex flex-col items-start min-w-0">
          <h3 className="font-semibold text-[17px] text-black">{fullName}</h3>
          <p className="font-light text-gray-500 max-w-[250px] truncate">
            {lastMessage?.content ?? 'No messages yet'}
          </p>
        </span>
      </div>
      <p className="py-2 flex-shrink-0 text-xs text-gray-500 text-right">
        {formatTimestamp(timestamp)}
      </p>
    </button>
  )
}

const ChatList = () => {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    }
    load()
  }, [router])
  return (
    <div className="border border-black bg-white h-[100vh]">
      <div className="flex items-center justify-between p-4 border-b border-b-1 border-[#898989b9]">
        <div className="flex flex-row p-2 gap-2">
          <Image
            src="/default-avatar.png"
            className="border border-black rounded-full"
            alt=""
            width={56}
            height={52}
          />
          <span>
            <h3 className="font-semibold text-[17px] text-black">Messages</h3>
            <p className="font-light text-gray-500">Your conversations</p>
          </span>
        </div>
        <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 items-center justify-center rounded-lg hover:bg-yellow-200">
          <RiMore2Fill color="01AA85" className="w-[18px] h-[18px]" />
        </button>
      </div>
      <div className="w-[100%] px-5 mt-[10px]">
        <div className="flex flex-row items-center justify-between">
          <p className="text-black">Message ({conversations.length})</p>
          <SearchModal />
        </div>
      </div>
      <main>
        {loading && (
          <p className="p-4 text-gray-500">Loading...</p>
        )}
        {error && !loading && (
          <p className="p-4 text-red-500">{error}</p>
        )}
        {!loading && !error && conversations.length === 0 && (
          <p className="p-4 text-gray-500">No conversations yet. Start a chat from the search page!</p>
        )}
        {!loading && !error && conversations.map((conv) => (
          <MessageList key={conv.id} conversation={conv} />
        ))}
      </main>
    </div>
  )
}


export default ChatList
