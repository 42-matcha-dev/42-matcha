'use client'

import Link from 'next/link'
import { useApp } from '../providers/AppProvider'

type Props = {
  showMenuButton?: boolean
  onMenuClick?: () => void
}

const Header = ({ showMenuButton, onMenuClick }: Props) => {
  const app = useApp()
  const notificationCount = app?.notificationCount ?? 0
  const messageCount = app?.messageCount ?? 0
  return (
    <header className="flex items-center justify-between bg-primary h-16 text-white p-4 fixed top-0 left-0 w-full z-10">
      <Link href="/">
        <h1 className="text-xl text-left font-bold cursor-pointer">Matcha</h1>
      </Link>
      {showMenuButton && (
        <button className="md:hidden text-3xl" onClick={onMenuClick}>
          ☰
          {notificationCount + messageCount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">
              {notificationCount + messageCount}
            </span>
          )}
        </button>
      )}
    </header>
  )
}

export default Header
