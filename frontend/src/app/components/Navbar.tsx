'use client'

import { useRouter } from 'next/navigation'
import NavbarButtonElement from './NavbarButtonElement'
import { mdiAccount, mdiMagnify, mdiBell, mdiChat, mdiLogout, mdiCog } from '@mdi/js'
import { deleteCookie } from '@/utils/cookie.util'
import { useApp } from '../providers/AppProvider'

type Props = {
  className?: string
}

const Navbar = ({ className }: Props) => {
  const app = useApp()
  const router = useRouter()

  const notificationCount = app?.notificationCount ?? 0
  const messageCount = app?.messageCount ?? 0
  const handleLogout = () => {
    deleteCookie('token')
    router.push('/login')
  }

  return (
    <div className={className}>
      <NavbarButtonElement
        path={mdiAccount}
        size={1.2}
        title={'Profile'}
        color={'black'}
        onClick={() => router.push('/profile')}
      />
      <NavbarButtonElement
        path={mdiMagnify}
        size={1.2}
        title={'Search'}
        color={'black'}
        onClick={() => router.push('/search')}
      />
      <NavbarButtonElement
        path={mdiBell}
        size={1.2}
        title={'Notifications'}
        color={'black'}
        badgeCount={notificationCount}
        onClick={() => router.push('/notifications')}
      />
      <NavbarButtonElement
        path={mdiChat}
        size={1.2}
        title={'Messages'}
        badgeCount={messageCount}
        color={'black'}
        onClick={() => router.push('/chat')}
      />
      <NavbarButtonElement
        path={mdiCog}
        size={1.2}
        title={'Settings'}
        color={'black'}
        onClick={() => router.push('/settings')}
      />
      <NavbarButtonElement
        path={mdiLogout}
        size={1.2}
        title={'Logout'}
        color={'black'}
        onClick={handleLogout}
      />
    </div>
  )
}

export default Navbar
