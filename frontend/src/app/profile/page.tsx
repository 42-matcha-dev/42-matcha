"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/user/me`, {
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
  }, [router]);

  if (loading) {
    return (
      <main className="flex flex-col bg-white">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col bg-white">
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

  return (
    <main className="flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-black">Dashboard</h1>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-black">Profile</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div className="md:col-span-2">
                  {profile.icon_url ? (
                    <div className="flex justify-center mb-6">
                      <Image
                        src={profile.icon_url}
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
                          {profile.first_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-black text-lg">{profile.first_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-black text-lg">{profile.last_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-black text-lg">{profile.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-black text-lg">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-black text-lg capitalize">{profile.gender || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Looking For</label>
                  <p className="text-black text-lg capitalize">{profile.sexual_preferences || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-black text-lg">{profile.location || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fame Rating</label>
                  <p className="text-black text-lg">{profile.fame_rating}</p>
                </div>

                {/* Biography */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                  <p className="text-black text-lg whitespace-pre-wrap">{profile.biography || 'No biography provided.'}</p>
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
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {profile.photo_urls && profile.photo_urls.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Photos</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profile.photo_urls.map((photo, index) => (
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
          </div>
        </div>
      </div>
    </main>
  );
}
