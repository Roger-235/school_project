import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAuthToken, clearAuthToken } from '../lib/auth'

interface User {
  id: number
  email: string
  role: 'admin' | 'school_staff'
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists on mount and restore user session
    const token = getAuthToken()
    if (token) {
      // Restore user from localStorage if available
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          // Invalid stored user, clear it
          localStorage.removeItem('auth_user')
        }
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    setUser(null)
    clearAuthToken()
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
