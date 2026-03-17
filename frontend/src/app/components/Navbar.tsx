'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavbarButtonElement from './NavbarButtonElement'
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiLogout, mdiPencil } from '@mdi/js'
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import { getSocket } from '@/lib/socket'

const Navbar = () => {
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie('token')
    router.push('/login')
  }

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
    <div className="sticky top-0 h-screen flex flex-col w-64 pt-16">
      <NavbarButtonElement
        path={mdiAccount}
        size={1.3}
        title={'Profile'}
        color={'black'}
        onClick={() => router.push('/profile')}
      />
      <NavbarButtonElement
        path={mdiPencil}
        size={1.3}
        title={'Edit Profile'}
        color={'black'}
        onClick={() => router.push('/profile/edit')}
      />
      <NavbarButtonElement
        path={mdiMagnify}
        size={1.3}
        title={'Search'}
        color={'black'}
        onClick={() => router.push('/search')}
      />
      <NavbarButtonElement
        path={mdiBell}
        size={1.3}
        title={'Notifications'}
        color={'black'}
        badgeCount={notificationCount}
        onClick={() => router.push('/notifications')}
      />
      <NavbarButtonElement
        path={mdiChat}
        size={1.3}
        title={'Messages'}
        badgeCount={messageCount}
        color={'black'}
        onClick={() => router.push('/chat')}
      />
      <NavbarButtonElement
        path={mdiLogout}
        size={1.3}
        title={'Logout'}
        color={'black'}
        onClick={handleLogout}
      />
    </div>
  )
}

export default Navbar
