import React from "react";
import NavbarButtonElement from "../components/NavbarButtonElement";
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiCog, mdiLogout } from '@mdi/js';

const NavLinks = () => {
    return (
        <section className="sticky md:static top-0 flex items-center md:items-start md:justify-start h-[7vh] md:h-[100vh] w-[100%] md:w-[200px] py-8 md:py-0 bg-[#01AA85]">
            <main className="w-[100vh]">
                <div className="flex flex-col w-[100%] items-center justify-center">
                    <span className="w-full h-full border border-b-black items-">
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
    )
}

export default NavLinks;