"use client";

import React from "react";
import { useRouter } from "next/navigation";
import NavbarButtonElement from "./NavbarButtonElement";
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiCog, mdiLogout } from '@mdi/js';
import { deleteCookie } from "@/utils/cookie.util";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = () => {
        deleteCookie('token');
        router.push('/login');
    };

    return (
        <div className="flex flex-col w-64">
            <NavbarButtonElement path={mdiAccount} size={1.3} title={"Profile"} color={"black"} onClick={() => router.push('/dashboard')} />
            <NavbarButtonElement path={mdiMagnify} size={1.3} title={"Search"} color={"black"} onClick={() => router.push('/search')} />
            <NavbarButtonElement path={mdiBell} size={1.3} title={"Notifications"} color={"black"} onClick={() => router.push('/notifications')} />
            <NavbarButtonElement path={mdiChat} size={1.3} title={"Messages"} color={"black"} onClick={() => router.push('/chat')} />
            <NavbarButtonElement path={mdiCog} size={1.3} title={"Settings"} color={"black"} onClick={() => router.push('/settings')} />
            <NavbarButtonElement path={mdiLogout} size={1.3} title={"Logout"} color={"black"} onClick={handleLogout} />
        </div>
    )
}

export default Navbar;
