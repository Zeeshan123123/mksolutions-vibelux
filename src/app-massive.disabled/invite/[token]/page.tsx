"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, XCircle, Clock, Users, Shield, Settings, Eye, Crown } from 'lucide-react'
import { logger } from '@/lib/logging/production-logger';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface InviteData {
  id: string
  email: string
  role: string
  invitedBy: string
  createdAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  inviterName: string
  message?: string
}

export default function InvitePage() {
  const params = useParams()
  const token = params?.token as string
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchInvite()
  }, [token])

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invite/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid invitation')
        return
      }

      setInvite(data)
    } catch (error) {
      logger.error('system', 'Error fetching invite:', error )
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    if (!invite || !user) return

    setAccepting(true)
    setError('')

    try {
      const res = await fetch(`/api/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation')
        return
      }

      setAccepted(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      logger.error('system', 'Error accepting invite:', error )
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'manager': return Users
      case 'operator': return Settings
      case 'viewer': return Eye
      default: return Users
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400'
      case 'manager': return 'text-yellow-400'
      case 'operator': return 'text-green-400'
      case 'viewer': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to manage team members, projects, and system settings'
      case 'manager': return 'Manage cultivation projects and view team analytics'
      case 'operator': return 'Monitor and control cultivation systems and daily operations'
      case 'viewer': return 'Read-only access to dashboards and reports'
      default: return 'Team member access'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading invitation..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <ErrorMessage
          title="Invitation Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <ErrorMessage
          title="Invitation Not Found"
          message="The invitation link you're looking for doesn't exist or has expired."
        />
      </div>
    )
  }

  // Check if invitation is expired
  const isExpired = new Date(invite.expiresAt) < new Date()
  const RoleIcon = getRoleIcon(invite.role)

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-500/10 p-4 rounded-full mb-4 inline-block">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to the team!</h1>
          <p className="text-gray-400 mb-4">
            You've successfully joined {invite.inviterName}'s team as a {invite.role}.
          </p>
          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Team Invitation</h1>
            <p className="text-purple-100">You've been invited to join VibeLux</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {isExpired ? (
              <div className="text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4 inline-block">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Invitation Expired</h2>
                <p className="text-gray-400 text-sm">
                  This invitation expired on {new Date(invite.expiresAt).toLocaleDateString()}.
                  Please contact {invite.inviterName} for a new invitation.
                </p>
              </div>
            ) : invite.status === 'accepted' ? (
              <div className="text-center">
                <div className="bg-green-500/10 p-4 rounded-full mb-4 inline-block">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Already Accepted</h2>
                <p className="text-gray-400 text-sm">
                  This invitation has already been accepted. You can access the team dashboard directly.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Invitation Details */}
                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    <strong className="text-white">{invite.inviterName}</strong> has invited you to join their team
                  </p>
                  
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <RoleIcon className={`w-5 h-5 ${getRoleColor(invite.role)}`} />
                      <span className="text-white font-medium capitalize">{invite.role}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{getRoleDescription(invite.role)}</p>
                  </div>

                  {invite.message && (
                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <h3 className="text-white font-medium mb-2">Personal Message:</h3>
                      <p className="text-gray-300 text-sm italic">"{invite.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                    <Clock className="w-4 h-4" />
                    <span>Expires on {new Date(invite.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Email Check */}
                {isLoaded && user && user.emailAddresses?.[0]?.emailAddress !== invite.email && (
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>Note:</strong> This invitation was sent to {invite.email}, but you're signed in as {user.emailAddresses?.[0]?.emailAddress}.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {!isLoaded ? (
                    <LoadingSpinner text="Loading..." />
                  ) : !user ? (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm text-center">
                        You need to sign in to accept this invitation
                      </p>
                      <button
                        onClick={() => router.push('/sign-in')}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Sign In to Accept
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={acceptInvite}
                      disabled={accepting}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {accepting ? 'Accepting...' : 'Accept Invitation'}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}