'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getCookie } from '@/utils/cookie.util'
import { useRouter } from 'next/navigation'
import { formatTimeAgo } from '@/utils/format'
import { getSocket } from '@/lib/socket'

interface Notification {
  id: number
  type: 'LIKE' | 'MATCH' | 'VIEW' | 'MESSAGE' | 'UNLIKE'
  actor_id: number
  username: string
  first_name: string
  last_name: string
  icon_url: string
  reference_id?: number
  is_read: boolean
  created_at: string
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          router.push('/login')
          return
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        const response = await fetch(`${apiUrl}/api/notifications`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }
    fetchNotifications()
  }, [router])

  useEffect(() => {
    const socket = getSocket()
    const onNewNotification = (notification: Notification) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev
        const filtered = prev.filter(
          n => !(n.actor_id === notification.actor_id && isSuperseded(n.type, notification.type))
        )
        return [notification, ...filtered]
      })
    }
    const onRemoveNotification = ({ actorId, type }: { userId: number; actorId: number; type: Notification['type'] }) => {
      setNotifications(prev => prev.filter(n => !(n.actor_id === actorId && n.type === type)))
    }
    socket.on('newNotification', onNewNotification)
    socket.on('removeNotification', onRemoveNotification)
    return () => {
      socket.off('newNotification', onNewNotification)
      socket.off('removeNotification', onRemoveNotification)
    }
  }, [])

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        const token = getCookie('token')
        if (!token) {
          router.push('/login')
          return
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        //read the notification
        await fetch(`${apiUrl}/api/notifications/${n.id}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (err) {
        console.error('Network error while updating notification:', err)
      }
    }

    switch (n.type) {
      case 'MESSAGE':
      case 'MATCH':
        if (n.reference_id) router.push(`/chat/${n.reference_id}`)
        break

      case 'LIKE':
      case 'VIEW':
      case 'UNLIKE':
        router.push(`/profile/${n.username}`)
        break
    }
  }

  return (
    <div className="">
      {notifications.length === 0 && <div>No notifications yet</div>}

      <div className='border-t border-gray-200'>
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`p-4 cursor-pointer transition border-b border-gray-200 ${
              n.is_read ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <div className='flex'>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                {n.icon_url ? (
                  <Image
                    src={n.icon_url}
                    alt={n.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                    {n.first_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className='flex-1 ml-2'>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-800">{renderNotificationText(n)}</p>

                  {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(n.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function isSuperseded(existing: Notification['type'], incoming: Notification['type']): boolean {
  if (incoming === 'MATCH' && (existing === 'LIKE' || existing === 'UNLIKE')) return true
  if (incoming === 'UNLIKE' && existing === 'MATCH') return true
  if (incoming === 'LIKE' && existing === 'UNLIKE') return true
  return false
}

function renderNotificationText(n: Notification) {
  const name = <span className="font-semibold">{n.first_name}</span>

  switch (n.type) {
    case 'LIKE':
      return <>{name} liked your profile</>

    case 'MATCH':
      return <>You matched with {name}</>

    case 'VIEW':
      return <>{name} viewed your profile</>

    case 'MESSAGE':
      return <>New message from {name}</>

    case 'UNLIKE':
      return <>{name} unmatched you</>

    default:
      return null
  }
}
