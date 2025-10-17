"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
  joinDate: string
  avatar: string
  permissions: string[]
  department?: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  invitedBy: string
  inviterName: string
  inviteDate: string
  expiresDate: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

export interface TeamData {
  members: TeamMember[]
  pendingInvites: PendingInvite[]
  subscription: any
  teamMemberLimit: number
}

export function useTeamData() {
  const { user } = useUser()
  const [data, setData] = useState<TeamData>({
    members: [],
    pendingInvites: [],
    subscription: null,
    teamMemberLimit: 1
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh function that can be called externally
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch team members
      const membersRes = await fetch('/api/team/members')
      const membersData = await membersRes.json()

      // Fetch pending invitations
      const invitesRes = await fetch('/api/team/invites')
      const invitesData = await invitesRes.json()

      // Fetch subscription data
      const subscriptionRes = await fetch('/api/subscription')
      const subscriptionData = await subscriptionRes.json()

      // Map subscription tier to team member limit
      const tierLimits: Record<string, number> = {
        'free': 1,
        'startup': 3,
        'greenhouse-basic': 5,
        'commercial-basic': 10,
        'professional': 3,
        'commercial-standard': 15,
        'greenhouse-pro': 20,
        'cultivation-expert': 25,
        'enterprise': 10,
        'commercial-enterprise': 50,
        'greenhouse-enterprise': 100,
        'cultivation-ai': 100,
        'research-academic': 15,
        'consultant-pro': 25,
        'manufacturer-partner': 100
      }

      const limit = tierLimits[subscriptionData.tier] || 1

      setData({
        members: membersData.members || [],
        pendingInvites: invitesData.invites || [],
        subscription: subscriptionData,
        teamMemberLimit: limit
      })
    } catch (err) {
      logger.error('api', 'Error fetching team data:', err)
      setError('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }, [user, refreshKey])

  // Send team invitation
  const sendInvitation = useCallback(async (email: string, role: string, message?: string) => {
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, message })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Refresh data after sending invitation
      refresh()
      
      return data
    } catch (error) {
      logger.error('api', 'Error sending invitation:', error )
      throw error
    }
  }, [refresh])

  // Remove team member
  const removeMember = useCallback(async (memberId: string) => {
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      // Refresh data after removing member
      refresh()
      
      return data
    } catch (error) {
      logger.error('api', 'Error removing member:', error )
      throw error
    }
  }, [refresh])

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update member role')
      }

      // Refresh data after updating role
      refresh()
      
      return data
    } catch (error) {
      logger.error('api', 'Error updating member role:', error )
      throw error
    }
  }, [refresh])

  // Cancel invitation
  const cancelInvitation = useCallback(async (inviteId: string) => {
    try {
      const res = await fetch(`/api/team/invites/${inviteId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel invitation')
      }

      // Refresh data after canceling invitation
      refresh()
      
      return data
    } catch (error) {
      logger.error('api', 'Error canceling invitation:', error )
      throw error
    }
  }, [refresh])

  // Resend invitation
  const resendInvitation = useCallback(async (inviteId: string) => {
    try {
      const res = await fetch(`/api/team/invites/${inviteId}/resend`, {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend invitation')
      }

      // Refresh data after resending invitation
      refresh()
      
      return data
    } catch (error) {
      logger.error('api', 'Error resending invitation:', error )
      throw error
    }
  }, [refresh])

  // Initial fetch
  useEffect(() => {
    fetchTeamData()
  }, [fetchTeamData])

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeamData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchTeamData])

  return {
    data,
    loading,
    error,
    refresh,
    sendInvitation,
    removeMember,
    updateMemberRole,
    cancelInvitation,
    resendInvitation
  }
}