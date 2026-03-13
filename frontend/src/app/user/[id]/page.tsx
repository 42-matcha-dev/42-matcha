'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/Navbar'
import Header from '@/app/components/Header'
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import { toast } from 'sonner'

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
  gender: string
  sexualPreferences: string
  biography: string
  fameRating: number
  distance: number
  canLike: boolean
  location: string
  iconUrl: string
  photoUrls: string[]
  tags?: Tag[]
  createdAt: string
  updatedAt: string
  isLiked: boolean
  isMatch: boolean
  conversationId?: boolean
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  // Calculate age from createdAt (or could be a separate field)
  const calculateAge = (): number => {
    // For now, return a placeholder age. In production, you'd calculate from birthdate
    return 24 // Placeholder
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      try {
        const token = getCookie('token')
        if (!token) {
          router.push('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${apiUrl}/api/users/${userId}`, {
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
  }, [userId, router])

  const handleLike = async () => {
    if (!userId || !profile || likeLoading) return

    try {
      setLikeLoading(true)
      const token = getCookie('token')
      if (!token) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const method = profile.isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`${apiUrl}/api/likes/${userId}`, {
        method,
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
        throw new Error(errorData.error || 'Failed to send like')
      }

      const result = await response.json()

      // Update profile state with new like status
      setProfile((prev) => ({
        ...prev!,
        isLiked: !prev!.isLiked,
        isMatch: result.isMatch ?? false,
        conversationId: result.conversationId
      }))

      // Show success message
      if (result.isMatch) {
        const msg = result.message || 'Match! You can now start conversation'
        toast.success(msg)
      } else if (result.isLiked) {
        const msg = result.message || 'Like was sent successfully'
        toast.success(msg)
      } else {
        const msg = result.message || 'Like removed'
        toast.success(msg)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send like'
      toast.error(msg)
    } finally {
      setLikeLoading(false)
    }
  }

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !profile?.photoUrls) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImageIndex < profile.photoUrls.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col h-screen">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-white">Loading profile...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col h-screen">
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

  const displayName =
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username
  const age = calculateAge()
  const photos = profile.photoUrls || []
  const hasPhotos = photos.length > 0

  return (
    <main className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="bg-white rounded-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Profile Information */}
                <div className="flex flex-col space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-6">
                    {/* Profile Picture - Larger */}
                    {profile.iconUrl ? (
                      <Image
                        src={profile.iconUrl}
                        alt="Profile"
                        width={140}
                        height={140}
                        unoptimized
                        className="w-36 h-36 rounded-full object-cover bg-custom-light flex-shrink-0"
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-full bg-custom-light flex items-center justify-center flex-shrink-0">
                        <span className="text-5xl text-custom-medium">
                          {profile.firstName?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Name and Info */}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-3">
                        {displayName}, {age}
                      </h1>
                      <div className="flex items-center mb-4">
                        {/* Location */}
                        {profile.location && (
                          <div className="flex items-center mr-3">
                            <Image src="/icons/location.svg" alt="Logo" width={20} height={20} />
                            <span className="ml-2 text-sm text-custom-medium">
                              {profile.location}
                            </span>
                          </div>
                        )}

                        {/* Fame Rating */}
                        <div className="flex items-center">
                          <Image
                            src="/icons/handshake.svg"
                            alt="Logo"
                            width={20}
                            height={20}
                            className="mr-1"
                          />
                          <span className="ml-2 text-sm text-custom-medium">
                            {profile.fameRating || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`${!profile.canLike ? 'invisible' : ''} flex gap-3`}>
                        <button
                          onClick={handleLike}
                          disabled={likeLoading}
                          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                            profile.isLiked
                              ? 'bg-gray-400 text-white'
                              : 'bg-primary hover:bg-[#A6733A] text-white'
                          } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {likeLoading ? 'Sending...' : profile.isLiked ? 'Unlike' : 'Like'}
                        </button>
                        <button
                          disabled={!profile.isMatch}
                          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                            profile.isMatch
                              ? 'text-custom-heavy bg-custom-light hover:bg-custom-medium hover:text-white'
                              : 'text-custom-heavy bg-custom-light cursor-not-allowed opacity-50'
                          }`}
                          onClick={() => router.push(`/chat/${profile.conversationId}`)}
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  {profile.biography && (
                    <div>
                      <h2 className="text-custom-medium mb-3">About</h2>
                      <p className="leading-relaxed whitespace-pre-wrap">{profile.biography}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {profile.tags && profile.tags.length > 0 && (
                    <div>
                      {/* <h2 className="font-semibold text-custom-medium mb-3">Tags</h2> */}
                      <div className="flex flex-wrap gap-2">
                        {profile.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-custom-medium text-white rounded-sm text-sm font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Image Gallery */}
                <div className="hidden lg:flex gap-4">
                  {/* Main Image */}
                  <div
                    className="flex-1 bg-custom-light rounded-lg overflow-hidden relative min-h-[400px] lg:min-h-[500px]"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {hasPhotos ? (
                      <Image
                        src={photos[selectedImageIndex]}
                        alt={`Photo ${selectedImageIndex + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-custom-medium">
                        <span>No photos available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails - Vertical Stack on Right */}
                  {hasPhotos && photos.length > 1 && (
                    <div className="hidden lg:flex flex-col gap-2">
                      {photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-gray-800'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Image
                            src={photo}
                            alt={`Thumbnail ${index + 1}`}
                            width={80}
                            height={80}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Layout - Column */}
                <div className="lg:hidden flex flex-col gap-4">
                  {hasPhotos ? (
                    photos.map((photo, index) => (
                      <div
                        key={index}
                        className="w-full bg-custom-light rounded-lg overflow-hidden relative h-[400px]"
                      >
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center text-custom-medium">
                      <span>No photos available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
