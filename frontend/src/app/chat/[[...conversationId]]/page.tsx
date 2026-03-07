'use client'

import { useParams } from "next/navigation"
import NavLinks from "../NavLinks"
import ChatList from "../ChatList"
import ChatBox from "../ChatBox"


export default function ChatPage() {
    const params = useParams()
    const conversationId = params.conversationId?.[0]
        ? parseInt(params.conversationId[0], 10)
        : null
    
    const isValidId = conversationId !== null && !isNaN(conversationId)

    return (
        <div>
          <div className="flex md:flex-row flex-col items-start bg-black">
            <NavLinks />
            <div className={`flex-1 w-full ${isValidId ? 'hidden md:block' : ''}`}>
              <ChatList />
            </div>
            <div className={`flex-1 w-full ${!isValidId ? 'hidden md:flex md:items-center md:justify-center' : ''}`}>
              {isValidId ? (
                <ChatBox conversationId={conversationId!} />
              ) : (
                <div className="flex flex-col h-screen bg-white w-full items-center justify-center text-gray-500 p-4">
                  <p className="text-center">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
    )
}
