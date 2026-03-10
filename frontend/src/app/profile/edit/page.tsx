import Navbar from '@/app/components/Navbar';
import Header from '@/app/components/Header';
import EditForm from './EditForm';

export default function EditPage() {
  return (
    <main className="flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <EditForm/>
          </div>
        </div>
      </div>
    </main>
  );
}