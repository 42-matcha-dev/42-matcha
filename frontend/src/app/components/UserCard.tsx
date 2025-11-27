"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiHeartOutline, mdiTagOutline } from '@mdi/js';

export interface SearchUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  location: string;
  icon_url: string | null;
  photo_url: string | null;
  fame_rating: number;
  distance: number;
  common_tags: string[] | null;
}

interface UserCardProps {
  user: SearchUser;
}

const UserCard = ({ user }: UserCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/user/${user.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement like logic
    console.log('Like clicked for user', user.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 w-full flex flex-col cursor-pointer"
    >
       {/* Header Info */}
      <div className="flex items-center p-3 gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
             {user.icon_url ? (
               <Image
                 src={user.icon_url}
                 alt={user.username}
                 fill
                 className="object-cover"
                 unoptimized
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                  {user.first_name?.[0]?.toUpperCase()}
               </div>
             )}
        </div>
        <div className="flex flex-col overflow-hidden">
            <h3 className="font-bold text-gray-900 leading-tight truncate">{user.first_name} {user.last_name}</h3>
            <p className="text-xs text-gray-500 truncate">{user.location || 'Unknown'}, {user.age}ans</p>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full bg-gray-100">
        {user.photo_url ? (
          <Image
            src={user.photo_url}
            alt={user.username}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 flex-col gap-2">
            <span>No Image</span>
          </div>
        )}

        {/* Tags Overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[95%]">
            {user.common_tags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {tag}
                </span>
            ))}
            {user.common_tags && user.common_tags.length > 3 && (
                <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                    +{user.common_tags.length - 3}
                </span>
            )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 flex justify-between items-center border-t border-gray-50">
        <div className="flex items-center gap-1 text-gray-600">
            <Icon path={mdiTagOutline} size={0.7} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">{Math.round(user.fame_rating)}%</span>
        </div>
        <button
            onClick={handleLikeClick}
            className="text-gray-400 hover:text-red-500 transition-colors"
        >
            <Icon path={mdiHeartOutline} size={1} />
        </button>
      </div>
    </div>
  );
};

export default UserCard;

