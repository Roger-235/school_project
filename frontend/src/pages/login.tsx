import { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { setAuthToken } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import { loginSchema, LoginForm } from '../lib/validation'

// 登入 API 使用本地 Mock API（後端認證尚未實作）
const authApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await authApi.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setAuthToken(data.data.token)
      // Store user in localStorage for session persistence
      localStorage.setItem('auth_user', JSON.stringify(data.data.user))
      setUser(data.data.user)
      router.push('/dashboard')
    },
    onError: (error: any) => {
      setError(error.response?.data?.error?.message || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    loginMutation.mutate(result.data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
