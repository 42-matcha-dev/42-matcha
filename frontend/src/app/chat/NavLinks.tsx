import React from "react";
import NavbarButtonElement from "../components/NavbarButtonElement";
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiCog, mdiLogout } from '@mdi/js';

const NavLinks = () => {
    return (
        <section className="sticky lg:static top-0 flex items-center lg:items-start lg:justify-start h-[7vh] lg:h-[100vh] w-[100%] lg:w-[125px] py-8 lg:py-0 bg-[#01AA85]">
            <main className="w-[100vh]">
                <div>
                    <span>
                        <img src="/logo_apple.jpg" className="w-[56px] h-[52px] object-contain" alt="" />
                    </span>
                </div>
                <div className="flex flex-col w-[100%] items-center justify-center">
                    <NavbarButtonElement path={mdiAccount} size={1.3} title={"Profile"} color={"black"} />
                    <NavbarButtonElement path={mdiMagnify} size={1.3} title={"Search"} color={"black"} />
                    <NavbarButtonElement path={mdiBell} size={1.3} title={"Notifications"} color={"black"} />
                    <NavbarButtonElement path={mdiChat} size={1.3} title={"Messages"} color={"black"} />
                    <NavbarButtonElement path={mdiCog} size={1.3} title={"Settings"} color={"black"} />
                    <NavbarButtonElement path={mdiLogout} size={1.3} title={"Logout"} color={"black"} />
                </div>
            </main>
        </section>
    )
}

export default NavLinks;