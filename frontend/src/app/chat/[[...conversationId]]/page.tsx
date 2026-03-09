'use client'

import { useParams } from "next/navigation"
import ChatList from "../ChatList"
import ChatBox from "../ChatBox"
import Navbar from "@/app/components/Navbar"
import Header from "@/app/components/Header"


export default function ChatPage() {
    const params = useParams()
    const conversationId = params.conversationId?.[0]
        ? parseInt(params.conversationId[0], 10)
        : null
    
    const isValidId = conversationId !== null && !isNaN(conversationId)

    return (
      <main className="flex flex-col h-screen bg-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <div className={`flex-1 ${isValidId ? 'hidden md:block' : ''}`}>
              <ChatList />
            </div>
            <div className={`flex-1 ${!isValidId ? 'hidden md:flex md:items-center md:justify-center' : ''}`}>
              {isValidId ? (
                <ChatBox conversationId={conversationId!} />
              ) : (
                <div className="flex flex-col h-full w-full items-center justify-center text-gray-500 p-4">
                  <p className="text-center">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    )
}
