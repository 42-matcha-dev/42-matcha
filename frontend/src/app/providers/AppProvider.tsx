'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie } from '@/utils/cookie.util'
import { getSocket } from '@/lib/socket'

type AppContextType = {
  notificationCount: number
  messageCount: number
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

    useEffect(() => {
    const token = getCookie('token')
    if (!token) return

    const fetchUnread = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      const [notifRes, msgRes] = await Promise.all([
        fetch(`${apiUrl}/api/notifications/unread-count`, { headers }),
        fetch(`${apiUrl}/api/conversations/unread-count`, { headers })
      ])
      if (notifRes.ok) {
        const data = await notifRes.json()
        setNotificationCount(data.count)
      }
      if (msgRes.ok) {
        const data = await msgRes.json()
        setMessageCount(data.count)
      }
    }
    fetchUnread()

    const socket = getSocket()
    const onUnreadMessageCount = (data: { count: number }) => {
      setMessageCount(data.count)
    }
    socket.on('unreadMessageCount', onUnreadMessageCount)

    const onUnreadNotificationCount = (data: { count: number }) => {
      setNotificationCount(data.count)
    }
    socket.on('unreadNotificationCount', onUnreadNotificationCount)
    return () => {
      socket.off('unreadMessageCount', onUnreadMessageCount)
      socket.off('unreadNotificationCount', onUnreadNotificationCount)
    }
  }, [])
  return (
    <AppContext.Provider value={{ notificationCount, messageCount }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)