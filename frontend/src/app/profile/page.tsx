'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/app/components/Header'
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import AppLayout from '../layouts/AppLayout'

interface LikeUser {
  id: number
  username: string
  first_name: string
  last_name: string
  icon_url: string | null
  created_at: string
}

interface Tag {
  id: number
  name: string
  category: string
}

interface UserProfile {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  birthday: string
  gender: string
  lookingFor: string
  description: string
  location: string
  iconUrl: string
  photoUrls: string[]
  tags?: Tag[]
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likesSent, setLikesSent] = useState<LikeUser[]>([])
  const [likesReceived, setLikesReceived] = useState<LikeUser[]>([])
  const [likesTab, setLikesTab] = useState<'sent' | 'received'>('received')
  const [likesLoading, setLikesLoading] = useState(true)
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
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const token = getCookie('token')
        if (!token) return
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const [sentRes, receivedRes] = await Promise.all([
          fetch(`${apiUrl}/api/likes/likes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/likes/liked-by`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        if (sentRes.ok) setLikesSent(await sentRes.json())
        if (receivedRes.ok) setLikesReceived(await receivedRes.json())
      } catch {
        /* non-critical */
      } finally {
        setLikesLoading(false)
      }
    }
    fetchLikes()
  }, [])

  if (loading) {
    return (
      <main className="flex flex-col bg-white">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading profile...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col bg-white">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const calculateAge = (birthday?: string): string => {
    if (!birthday) return 'N/A'
    const birth = new Date(birthday)
    if (Number.isNaN(birth.getTime())) return 'N/A'
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? String(age) : 'N/A'
  }
  const age = calculateAge(profile.birthday)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-16 px-6 md:px-16">
        <div className="mb-8 flex items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <button
            type="button"
            onClick={() => router.push('/profile/edit')}
            className="bg-black text-white text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-md whitespace-nowrap hover:opacity-90"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-black">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2">
              {profile.iconUrl ? (
                <div className="flex justify-center mb-6">
                  <Image
                    src={profile.iconUrl}
                    alt="Profile"
                    width={128}
                    height={128}
                    unoptimized
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-500">
                      {profile.firstName?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <p className="text-black text-lg">{profile.firstName || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <p className="text-black text-lg">{profile.lastName || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <p className="text-black text-lg">{profile.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-black text-lg break-words">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p className="text-black text-lg capitalize">{profile.gender || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking For</label>
              <p className="text-black text-lg capitalize">{profile.lookingFor || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p className="text-black text-lg">{profile.location || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <p className="text-black text-lg">{age}</p>
            </div>

            {/* Biography */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
              <p className="text-black text-lg whitespace-pre-wrap">
                {profile.description || 'No biography provided.'}
              </p>
            </div>

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {profile.photoUrls && profile.photoUrls.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Photos</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.photoUrls.map((photo, index) => (
                    <Image
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      width={200}
                      height={192}
                      unoptimized
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Likes Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Likes</h2>
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setLikesTab('received')}
              className={`px-4 py-2 text-sm font-medium -mb-px ${
                likesTab === 'received'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Received ({likesReceived.length})
            </button>
            <button
              type="button"
              onClick={() => setLikesTab('sent')}
              className={`px-4 py-2 text-sm font-medium -mb-px ${
                likesTab === 'sent'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Sent ({likesSent.length})
            </button>
          </div>

          {likesLoading && <p className="text-gray-500 text-sm">Loading...</p>}

          {!likesLoading && (
            <>
              {(likesTab === 'received' ? likesReceived : likesSent).length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {likesTab === 'received'
                    ? 'No one has liked you yet.'
                    : "You haven't liked anyone yet."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {(likesTab === 'received' ? likesReceived : likesSent).map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/profile/${user.username}`)}
                        className="flex items-center gap-3 py-3 w-full hover:bg-gray-50 rounded px-2"
                      >
                        {user.icon_url ? (
                          <img
                            src={user.icon_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {user.first_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm font-medium text-black">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
