"use client"

import { useEffect, useState } from "react";
import { getCookie } from "@/utils/cookie.util";
import { useRouter } from "next/navigation";

interface Notification {
    id: number;
    type: "LIKE" | "MATCH" | "VIEW" | "MESSAGE" | "UNLIKE";
    actor_id: number;
    reference_id?: number;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = getCookie('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                const response = await fetch(`${apiUrl}/api/notifications`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setNotifications(data);
            } catch (err){
                console.error("Failed to fetch notifications:", err);
            }
        }
        fetchNotifications();
    }, []);

    const handleClick = async(n: Notification) => {
        //read the notification
        // await fetch(`/api/notifications/${n.id}/read`, {
        //     method: "PATCH",
        //     credentials: "include",
        // });

        switch (n.type) {
            case "MESSAGE":
            case "MATCH":
                if (n.reference_id) router.push(`/chat/${n.reference_id}`);
                break;

            case "LIKE":
            case "VIEW":
            case "UNLIKE":
                if (n.reference_id) router.push(`/user/${n.reference_id}`);
                break;
        }
    };

    return (
        <div className="">
            {notifications.length === 0 && (
                <div>
                    No notifications yet
                </div>
            )}

            <div className="space-y-3">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`p-4 rounded-lg border cursor-pointer transition ${
                        n.is_read
                            ? "bg-white hover:bg-gray-50"
                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-800">
                                {renderNotificationText(n)}
                            </p>

                            {!n.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )


}

function renderNotificationText(n: Notification) {
  switch (n.type) {
    case "LIKE":
      return `User ${n.actor_id} liked your profile`;

    case "MATCH":
      return `You matched with user ${n.actor_id}`;

    case "VIEW":
      return `User ${n.actor_id} viewed your profile`;

    case "MESSAGE":
      return `New message from user ${n.actor_id}`;

    case "UNLIKE":
      return `User ${n.actor_id} unmatched you`;

    default:
      return "";
  }
}