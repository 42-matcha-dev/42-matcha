import NotificationsClient from "./NotificationsClient";
import Navbar from '@/app/components/Navbar';
import Header from '@/app/components/Header';

export default function Page() {
    return (
        <main className="flex flex-col bg-white">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Navbar />
                <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-black">Notifications</h1>
                    <NotificationsClient />
                </div>
                </div>
            </div>
        </main>
    )
}