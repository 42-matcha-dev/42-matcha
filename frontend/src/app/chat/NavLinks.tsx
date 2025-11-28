'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavbarButtonElement from '../components/NavbarButtonElement'
import {
  mdiAccount,
  mdiMagnify,
  mdiBell,
  mdiChat,
  mdiCog,
  mdiLogout,
  mdiMenu,
  mdiClose
} from '@mdi/js'
import Icon from '@mdi/react'
import { deleteCookie } from '@/utils/cookie.util'
import Image from 'next/image'

const NavLinks = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie('token')
    router.push('/login')
  }

  return (
    <section className="md:static top-0 flex md:flex-col items-center h-[9vh] md:h-[100vh] w-full md:w-[200px] bg-[#01AA85]">
      <div className="w-[100%] flex flex-row items-center">
        <button className="md:hidden p-4" onClick={() => setOpen(!open)}>
          <Icon path={open ? mdiClose : mdiMenu} size={1.5} color="black" />
        </button>
        <span className="w-full h-full flex justify-center py-2">
          <Image src="/logo_apple.jpg" className="object-contain" alt="" width={56} height={52} />
        </span>
      </div>
      <main
        className={`
                    absolute md:static top-14 left-0
                    bg-[#01AA85] md:bg-transparent
                    w-full md:w-auto
                    transition-all duration-300
                    ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:opacity-100 md:max-h-none'}
                    overflow-hidden md:overflow-visible
                `}
      >
        <div className="flex flex-col w-full items-center justify-center gap-4 py-4 md:py-0">
          <NavbarButtonElement
            path={mdiAccount}
            size={1.3}
            title={'Profile'}
            color={'black'}
            onClick={() => router.push('/dashboard')}
          />
          <NavbarButtonElement
            path={mdiMagnify}
            size={1.3}
            title={'Search'}
            color={'black'}
            onClick={() => router.push('/search')}
          />
          <NavbarButtonElement
            path={mdiBell}
            size={1.3}
            title={'Notifications'}
            color={'black'}
            onClick={() => router.push('/notifications')}
          />
          <NavbarButtonElement
            path={mdiChat}
            size={1.3}
            title={'Messages'}
            color={'black'}
            onClick={() => router.push('/chat')}
          />
          <NavbarButtonElement
            path={mdiCog}
            size={1.3}
            title={'Settings'}
            color={'black'}
            onClick={() => router.push('/settings')}
          />
          <NavbarButtonElement
            path={mdiLogout}
            size={1.3}
            title={'Logout'}
            color={'black'}
            onClick={handleLogout}
          />
        </div>
      </main>
    </section>
  )
}

export default NavLinks
