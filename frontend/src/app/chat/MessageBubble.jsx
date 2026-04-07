// src/components/MessageBubble.jsx
import React from "react";
import { useRouter } from "next/navigation";

const MessageBubble = ({ message }) => {
    const router = useRouter();
    const timeStr = new Date(message.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const handleAvatarClick = () => {
        if (message.isMe) {
            router.push('/profile');
        } else {
            router.push(`/user/${message.userId}`);
        }
    };

    return (
        <div className={`flex p-4 ${message.isMe ? "justify-end" : "justify-start"}`}>
            {!message.isMe && (
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="flex-shrink-0 mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01AA85]"
                    aria-label={`View ${message.author}'s profile`}
                >
                    <img
                        src={message.avatar}
                        className="w-11 h-11 min-w-11 min-h-11 border border-black rounded-full object-cover aspect-square hover:opacity-80 transition-opacity cursor-pointer"
                        alt=""
                    />
                </button>
            )}

            <div className="flex flex-col max-w-[85vw] md:max-w-[280px]">
                <div
                    className={`p-3 w-fit max-w-full rounded-2xl ${
                        message.isMe ? "bg-gray-200" : "bg-gray-100"
                    }`}
                >
                    <p className="text-black text-sm md:text-base break-words">{message.message}</p>
                </div>
                <p className="text-right font-light text-gray-500 text-xs mt-1">
                    {timeStr}
                </p>
            </div>

            {message.isMe && (
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="flex-shrink-0 ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01AA85]"
                    aria-label="View your profile"
                >
                    <img
                        src={message.avatar}
                        className="w-11 h-11 min-w-11 min-h-11 border border-black rounded-full object-cover aspect-square hover:opacity-80 transition-opacity cursor-pointer"
                        alt=""
                    />
                </button>
            )}
        </div>
    );
};

export default MessageBubble;
