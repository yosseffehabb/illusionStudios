// app/admin/layout.js

import { getUserServer } from '../../services/apiAuth'
import AdminHeader from '@/components/AdminHeader'


export default async function AdminLayout({ children }) {
  // Don't redirect here - middleware handles it
  const user = await getUserServer()
  console.log(user)

  // If middleware didn't catch it, user should exist
  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading authentication...</p>
      </div>
    )
  }

  return (
    <div>
    <AdminHeader />
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      {children}
    </main>
  </div>
  )
}