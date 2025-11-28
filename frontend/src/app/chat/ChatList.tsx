'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import SearchModal from './SearchModal'
import { RiMore2Fill } from 'react-icons/ri'
import chatData from '../data/chat'

type User = {
  fullName: string
  lastSeen: {
    seconds: number
  }
}

type Chat = {
  id: number | string
  lastMessage: string
  users: User[]
}

type MessageListProps = {
  chat: Chat
}

function formatTimestamp(seconds: number) {
  const date = new Date(seconds * 1000)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

const MessageList = ({ chat }: MessageListProps) => {
  return (
    <button className="flex flex-row justify-between px-5 pb-2 w-full">
      <div className="flex flex-row p-2 items-center gap-2 flex-grow min-w-0">
        <Image
          src="/default-avatar.png"
          className="flex-shrink-0 border border-black rounded-full"
          alt=""
          width={56}
          height={52}
        />
        <span className="flex flex-col items-start min-w-0">
          <h3 className="font-semibold text-[17px] text-black">{chat?.users[0].fullName}</h3>
          <p className="font-light text-gray-500 max-w-[250px] truncate">{chat?.lastMessage}</p>
        </span>
      </div>
      <p className="py-2 flex-shrink-0 text-xs text-gray-500 text-right">
        {formatTimestamp(chat?.users[0].lastSeen.seconds)}
      </p>
    </button>
  )
}

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    setChats(chatData)
  }, [])

  return (
    <div className="border border-black bg-white h-[100vh] ">
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
            <h3 className="font-semibold text-[17px] text-black">Etienne Desaintjean</h3>
            <p className="font-light text-gray-500">@edesaint</p>
          </span>
        </div>
        <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 items-center justify-center rounded-lg hover:bg-yellow-200">
          <RiMore2Fill color="01AA85" className="w-[18px] h-[18px]" />
        </button>
      </div>
      <div className="w-[100%] px-5 mt-[10px]">
        <div className="flex flex-row items-center justify-between">
          <p className="text-black">Message ({chats?.length})</p>
          <SearchModal />
        </div>
      </div>
      <main>
        {chats?.map((chat) => (
          <MessageList key={chat.id} chat={chat} />
        ))}
      </main>
    </div>
  )
}

export default ChatList
