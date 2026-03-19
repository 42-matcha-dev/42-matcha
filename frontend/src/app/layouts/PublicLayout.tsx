import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="absolute top-0 w-screen min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16">{children}</main>
      <Footer />
    </div>
  )
}
