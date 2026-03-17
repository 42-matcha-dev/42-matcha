import { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="h-screen flex flex-col relative">
      <Header showMenuButton />
      <div className="flex">
        <Navbar className="hidden md:block"/>
        <main className="flex-1 pt-16 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
