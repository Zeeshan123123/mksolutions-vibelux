'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface RoleContextType {
  role: string | null
  isAdmin: boolean
  isLoading: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      // In production, fetch role from API
      // For now, provide default role
      setRole('user')
      setIsLoading(false)
    } else {
      setRole(null)
      setIsLoading(false)
    }
  }, [userId])

  const isAdmin = role === 'admin'

  return (
    <RoleContext.Provider value={{ role, isAdmin, isLoading }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}