import NotificationsClient from './NotificationsClient'
import AppLayout from '../layouts/AppLayout'

export default function Page() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-16 px-8">
        <h1 className="text-3xl font-bold mb-8 text-black">Notifications</h1>
        <NotificationsClient />
      </div>
    </AppLayout>
  )
}
