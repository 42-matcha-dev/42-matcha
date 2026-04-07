'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AppLayout from '../layouts/AppLayout'
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import { toast } from 'sonner'

interface UserSettingsProfile {
  email: string
}

interface BlockedUser {
  id: number
  username: string
  first_name: string
  last_name: string
  icon_url: string | null
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserSettingsProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [blockedLoading, setBlockedLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          router.push('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${apiUrl}/api/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            deleteCookie('token')
            router.push('/login')
            return
          }
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch profile')
        }

        const data = await response.json()
        setProfile({ email: data.email })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = getCookie('token')
        if (!token) return
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${apiUrl}/api/blocks/blocked`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          setBlockedUsers(await response.json())
        }
      } catch {
        /* non-critical */
      } finally {
        setBlockedLoading(false)
      }
    }
    fetchBlockedUsers()
  }, [])

  const handleUnblock = async (userId: number) => {
    try {
      setUnblockingId(userId)
      const token = getCookie('token')
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/blocks/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to unblock user')
        return
      }
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success('User unblocked')
    } catch {
      toast.error('Network error')
    } finally {
      setUnblockingId(null)
    }
  }

  const handleEmailUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = newEmail.trim().toLowerCase()
    const trimmedPassword = currentPassword.trim()

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please enter a new email and your current password')
      return
    }

    try {
      setIsSavingEmail(true)
      const token = getCookie('token')
      if (!token) {
        deleteCookie('token')
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/users/me/email`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newEmail: trimmedEmail,
          currentPassword: trimmedPassword
        })
      })

      const payload = await response.json()
      if (!response.ok) {
        toast.error(payload.error || 'Failed to request email change')
        return
      }

      setNewEmail('')
      setCurrentPassword('')
      toast.success(payload.message || 'Verification email sent')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSavingEmail(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-16">
        <h1 className="text-3xl font-bold mb-8 text-black">Settings</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 space-y-8">
          {loading && <div className="text-black">Loading settings...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}

          {!loading && !error && profile && (
            <>
              <section className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-black mb-4">Change Email</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
                  <p className="text-black">{profile.email}</p>
                </div>
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(event) => setNewEmail(event.target.value)}
                      placeholder="new-email@example.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="Enter your current password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingEmail}
                    className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-60"
                  >
                    {isSavingEmail ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </section>

              <section className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-black mb-2">Reset Password</h2>
                <p className="text-gray-600 mb-4">
                  Use the existing reset flow to send a password reset email.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Go to Password Reset
                </button>
              </section>

              <section className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-black mb-4">Blocked Accounts</h2>
                {blockedLoading && <p className="text-gray-500 text-sm">Loading...</p>}
                {!blockedLoading && blockedUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No blocked users.</p>
                )}
                {!blockedLoading && blockedUsers.length > 0 && (
                  <ul className="divide-y divide-gray-100">
                    {blockedUsers.map((user) => (
                      <li key={user.id} className="flex items-center justify-between py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/profile/${user.username}`)}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          {user.icon_url ? (
                            <Image
                              src={user.icon_url}
                              alt={user.username}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                              {user.first_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-sm font-medium text-black">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          disabled={unblockingId === user.id}
                          onClick={() => handleUnblock(user.id)}
                          className="text-sm text-red-600 border border-red-300 px-3 py-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                          {unblockingId === user.id ? 'Unblocking...' : 'Unblock'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
