// src/components/MessageBubble.jsx
import React from "react";

const MessageBubble = ({ message }) => {
    const timeStr = new Date(message.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return (
        <div className={`flex p-4 ${message.isMe ? "justify-end" : "justify-start"}`}>
            {!message.isMe && (
                <img
                    src={message.avatar}
                    className="w-11 h-11 min-w-11 min-h-11 flex-shrink-0 border border-black rounded-full object-cover aspect-square mr-2"
                    alt=""
                />
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
                <img
                    src={message.avatar}
                    className="w-11 h-11 min-w-11 min-h-11 flex-shrink-0 border border-black rounded-full object-cover aspect-square ml-2"
                    alt=""
                />
            )}
        </div>
    );
};

export default MessageBubble;
