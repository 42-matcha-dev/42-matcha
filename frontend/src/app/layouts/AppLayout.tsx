'use client'

import { ReactNode, useState } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="h-screen flex flex-col relative">
      <Header showMenuButton onMenuClick={() => setMenuOpen(!menuOpen)} />
      <div className="flex">
        <Navbar className="hidden md:block sticky top-0 h-screen flex flex-col w-64 pt-16 border-r border-gray-200" />
        <main className="flex-1 pt-16 min-h-screen">{children}</main>
      </div>
      <Navbar
        className={`
            fixed top-0 left-0 h-screen w-64 bg-white shadow-lg
            transform transition-transform duration-300
            md:hidden z-40 pt-16
            ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
      />
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}
