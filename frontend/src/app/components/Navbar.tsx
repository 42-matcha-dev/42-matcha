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
        <div className="flex flex-col w-1/8">
            <NavbarButtonElement path={mdiAccount} size={1.5} title={"Profile"} color={"black"} />
            <NavbarButtonElement path={mdiMagnify} size={1.5} title={"Search"} color={"black"} />
            <NavbarButtonElement path={mdiBell} size={1.5} title={"Notifications"} color={"black"} />
            <NavbarButtonElement path={mdiChat} size={1.5} title={"Messages"} color={"black"} />
            <NavbarButtonElement path={mdiCog} size={1.5} title={"Settings"} color={"black"} />
            <NavbarButtonElement path={mdiLogout} size={1.5} title={"Logout"} color={"black"} onClick={handleLogout} />
        </div>
    )
}

export default Navbar;
