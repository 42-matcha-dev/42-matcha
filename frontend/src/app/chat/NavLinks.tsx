import React, { useState } from "react";
import NavbarButtonElement from "../components/NavbarButtonElement";
import {
    mdiAccount,
    mdiMagnify,
    mdiBell,
    mdiChat,
    mdiCog,
    mdiLogout,
    mdiMenu,
    mdiClose
} from '@mdi/js';
import Icon from '@mdi/react';

const NavLinks = () => {

    const [open, setOpen] = useState(false);

    return (
        <section className="md:static top-0 flex md:flex-col items-center h-[12vh] md:h-[100vh] w-full md:w-[200px] bg-[#01AA85]">
            <button
                className="md:hidden p-6"
                onClick={() => setOpen(!open)}
            >
                <Icon path={open ? mdiClose : mdiMenu} size={1.5} color="black" />
            </button>
            <main
                className={`
                    absolute md:static top-14 left-0 
                    bg-[#01AA85] md:bg-transparent 
                    w-full md:w-auto
                    transition-all duration-300
                    ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 md:opacity-100 md:max-h-none"}
                    overflow-hidden md:overflow-visible
                `}
            >
                <div className="flex flex-col w-full items-center justify-center gap-4 py-4 md:py-0">

                    <span className="w-full h-full border-b border-black flex justify-center py-2">
                        <img
                            src="/logo_apple.jpg"
                            className="w-[56px] h-[52px] object-contain"
                            alt=""
                        />
                    </span>

                    <NavbarButtonElement path={mdiAccount} size={1.3} title={"Profile"} color={"black"} />
                    <NavbarButtonElement path={mdiMagnify} size={1.3} title={"Search"} color={"black"} />
                    <NavbarButtonElement path={mdiBell} size={1.3} title={"Notifications"} color={"black"} />
                    <NavbarButtonElement path={mdiChat} size={1.3} title={"Messages"} color={"black"} />
                    <NavbarButtonElement path={mdiCog} size={1.3} title={"Settings"} color={"black"} />
                    <NavbarButtonElement path={mdiLogout} size={1.3} title={"Logout"} color={"black"} />
                </div>
            </main>

        </section>
    );
};

export default NavLinks;
