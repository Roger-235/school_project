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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if token exists on mount
    if (getAuthToken()) {
      // Optionally fetch user info from /auth/me
    }
  }, [])

  const logout = () => {
    setUser(null)
    clearAuthToken()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
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
