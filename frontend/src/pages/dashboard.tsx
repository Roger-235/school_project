import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">ICACP Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-semibold mb-4">Welcome to ICACP</h2>
            <p className="text-gray-600">
              User Authentication System is ready. Backend API integration pending.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
