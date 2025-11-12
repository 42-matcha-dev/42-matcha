"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Icon from '@mdi/react';
import { mdiMapMarker, mdiDiamond } from '@mdi/js';
import Navbar from '@/app/components/Navbar';
import Header from '@/app/components/Header';
import { getCookie, deleteCookie } from '@/utils/cookie.util';

interface Tag {
  id: number;
  name: string;
  category: string;
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string;
  sexual_preferences: string;
  biography: string;
  fame_rating: number;
  location: string;
  icon_url: string;
  photo_urls: string[];
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  // Calculate age from created_at (or could be a separate field)
  const calculateAge = (): number => {
    // For now, return a placeholder age. In production, you'd calculate from birthdate
    return 24; // Placeholder
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            deleteCookie('token');
            router.push('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, router]);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !profile?.photo_urls) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImageIndex < profile.photo_urls.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col h-screen bg-gray-800">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-white">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col h-screen bg-gray-800">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;
  const age = calculateAge();
  const photos = profile.photo_urls || [];
  const hasPhotos = photos.length > 0;

  return (
    <main className="flex flex-col h-screen bg-gray-800">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto bg-gray-800">
          <div className="max-w-7xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Profile Information */}
                <div className="flex flex-col space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-6">
                    {/* Profile Picture */}
                    {profile.icon_url ? (
                      <Image
                        src={profile.icon_url}
                        alt="Profile"
                        width={120}
                        height={120}
                        unoptimized
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl text-gray-500">
                          {profile.first_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Name and Info */}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {displayName}, {age}
                      </h1>

                      {/* Location */}
                      {profile.location && (
                        <div className="flex items-center text-gray-600 mb-1">
                          <Icon path={mdiMapMarker} size={1} className="mr-1" />
                          <span>{profile.location}</span>
                        </div>
                      )}

                      {/* Fame Rating */}
                      <div className="flex items-center text-gray-600">
                        <Icon path={mdiDiamond} size={1} className="mr-1" />
                        <span>{profile.fame_rating || 0}%</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4">
                        <button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                          Like
                        </button>
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
                          Message
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  {profile.biography && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {profile.biography}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {profile.tags && profile.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Image Slider */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Main Image */}
                  <div
                    className="flex-1 bg-gray-200 rounded-lg overflow-hidden relative min-h-[400px] lg:min-h-[500px]"
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No photos available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails - Desktop Only */}
                  {hasPhotos && photos.length > 1 && (
                    <div className="hidden lg:flex flex-col gap-2">
                      {photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-amber-700 ring-2 ring-amber-300'
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

                  {/* Mobile Navigation Dots */}
                  {hasPhotos && photos.length > 1 && (
                    <div className="lg:hidden flex justify-center gap-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            selectedImageIndex === index
                              ? 'bg-amber-700 w-8'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

