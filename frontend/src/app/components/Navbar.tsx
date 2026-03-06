"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarButtonElement from "./NavbarButtonElement";
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiCog, mdiLogout } from '@mdi/js';
import { getCookie, deleteCookie } from "@/utils/cookie.util";

const Navbar = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const router = useRouter();

    const handleLogout = () => {
        deleteCookie('token');
        router.push('/login');
    };

    useEffect(() => {
        const fetchUnread = async () => {
            const token = getCookie("token");
            if (!token) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/notifications/unread-count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) return;

            const data = await res.json();
            console.log("data:",data.count)
            setNotificationCount(data.count);
        };
        fetchUnread();
    }, [])

    return (
        <div className="flex flex-col w-64">
            <NavbarButtonElement path={mdiAccount} size={1.3} title={"Profile"} color={"black"} onClick={() => router.push('/profile')} />
            <NavbarButtonElement path={mdiMagnify} size={1.3} title={"Search"} color={"black"} onClick={() => router.push('/search')} />
            <NavbarButtonElement path={mdiBell} size={1.3} title={"Notifications"} color={"black"} badgeCount={notificationCount} onClick={() => router.push('/notifications')} />
            <NavbarButtonElement path={mdiChat} size={1.3} title={"Messages"} color={"black"} onClick={() => router.push('/chat')} />
            <NavbarButtonElement path={mdiCog} size={1.3} title={"Settings"} color={"black"} onClick={() => router.push('/settings')} />
            <NavbarButtonElement path={mdiLogout} size={1.3} title={"Logout"} color={"black"} onClick={handleLogout} />
        </div>
    )
}

export default Navbar;
