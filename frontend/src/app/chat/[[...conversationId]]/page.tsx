'use client'

import { useParams } from 'next/navigation'
import ChatList from '../ChatList'
import ChatBox from '../ChatBox'
import AppLayout from '@/app/layouts/AppLayout'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId?.[0] ? parseInt(params.conversationId[0], 10) : null
  const isValidId = conversationId !== null && !isNaN(conversationId)

  return (
    <AppLayout>
      <div className="flex h-full flex-col md:flex-row overflow-hidden min-h-0">
        <div
          className={`flex-1 min-w-0 border-r border-gray-200 flex-col md:max-w-[400px] ${isValidId ? 'hidden md:flex' : 'flex'}`}
        >
          <ChatList />
        </div>
        <div
          className={`flex-1 h-full min-w-0 flex min-h-0 ${!isValidId ? 'hidden md:flex md:items-center md:justify-center' : ''}`}
        >
          {isValidId ? (
            <ChatBox conversationId={conversationId!} />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center text-gray-500 p-4 md:p-8">
              <p className="text-center">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
