import axios from 'axios'

const api = axios.create({
  // In production: /backend (proxied to real backend via Vercel rewrites)
  // In development: /api/v1 (uses Next.js mock API routes)
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
