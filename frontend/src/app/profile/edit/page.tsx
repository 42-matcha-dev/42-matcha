import EditForm from './EditForm'
import AppLayout from '@/app/layouts/AppLayout'

export default function EditPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-16 px-8">
        <EditForm />
      </div>
    </AppLayout>
  )
}
