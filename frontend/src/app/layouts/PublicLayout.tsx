import Header from '@/app/components/Header'

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="absolute top-0 w-screen">
      <Header />
      <main>{children}</main>
    </div>
  )
}
