// src/components/MessageBubble.jsx
import React from "react";

const MessageBubble = ({ message }) => {
    return (
        <div className={`flex p-4 ${message.isMe ? "justify-end" : "justify-start"}`}>
            {!message.isMe && (
                <img
                    src={message.avatar}
                    className="flex-shrink-0 border border-black w-11 h-11 rounded-full mr-2"
                    alt=""
                />
            )}

            <div className="flex flex-col">
                <div
                    className={`p-2 w-fit max-w-[250px] rounded-full ${
                        message.isMe ? "bg-green-400" : "bg-blue-200"
                    }`}
                >
                    <h3 className="text-black">{message.message}</h3>
                </div>

                <p className="text-right font-light text-[#2A3D39] text-sm">
                    {new Date(message.date).toLocaleDateString()}
                </p>
            </div>

            {message.isMe && (
                <img
                    src={message.avatar}
                    className="flex-shrink-0 border border-black w-11 h-11 rounded-full ml-2"
                    alt=""
                />
            )}
        </div>
    );
};

export default MessageBubble;
