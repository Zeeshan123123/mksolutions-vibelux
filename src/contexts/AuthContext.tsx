'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth as useClerkAuth } from '@clerk/nextjs'

interface AuthContextType {
  isLoaded: boolean
  isSignedIn: boolean
  userId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useClerkAuth()

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn: isSignedIn || false, userId: userId || null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}