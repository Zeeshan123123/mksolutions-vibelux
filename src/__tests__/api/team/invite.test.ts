/**
 * Team Invite API Endpoint Tests
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/team/invite/route'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendTeamInviteEmail } from '@/lib/email/team-invite'

// Mock dependencies
jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/prisma')
jest.mock('@/lib/email/team-invite')
jest.mock('@/lib/csrf', () => ({
  verifyCSRFToken: jest.fn().mockResolvedValue(true)
}))

describe('/api/team/invite', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockSendEmail = sendTeamInviteEmail as jest.MockedFunction<typeof sendTeamInviteEmail>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should validate required fields', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          role: 'invalid-role'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.issues).toBeDefined()
    })

    it('should check user permissions', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      ;(prisma.facilityUser.findFirst as jest.Mock).mockResolvedValue({
        role: 'viewer' // viewer cannot invite
      })

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Insufficient permissions')
    })

    it('should check for existing invites', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      ;(prisma.facilityUser.findFirst as jest.Mock).mockResolvedValue({
        role: 'admin'
      })

      ;(prisma.facilityInvite.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-invite'
      })

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User already has pending invite')
    })

    it('should check for existing team members', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      ;(prisma.facilityUser.findFirst as jest.Mock)
        .mockResolvedValueOnce({ role: 'admin' }) // inviter
        .mockResolvedValueOnce({ id: 'existing-member' }) // invitee

      ;(prisma.facilityInvite.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User is already a team member')
    })

    it('should create invite and send email successfully', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      const mockFacility = {
        id: 'test-facility',
        name: 'Test Facility'
      }

      const mockInvite = {
        id: 'new-invite',
        token: 'invite-token',
        facility: mockFacility,
        invitedBy: {
          name: 'Test User'
        }
      }

      ;(prisma.facilityUser.findFirst as jest.Mock)
        .mockResolvedValueOnce({ role: 'admin' })
        .mockResolvedValueOnce(null)

      ;(prisma.facilityInvite.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacility)
      ;(prisma.facilityInvite.create as jest.Mock).mockResolvedValue(mockInvite)

      mockSendEmail.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.invite).toEqual(mockInvite)

      expect(prisma.facilityInvite.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility',
          invitedById: 'test-user',
          token: expect.any(String),
          expiresAt: expect.any(Date)
        },
        include: {
          facility: true,
          invitedBy: true
        }
      })

      expect(sendTeamInviteEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        inviterName: 'Test User',
        facilityName: 'Test Facility',
        role: 'viewer',
        inviteUrl: expect.stringContaining('invite-token')
      })
    })

    it('should handle email sending failures gracefully', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      ;(prisma.facilityUser.findFirst as jest.Mock)
        .mockResolvedValueOnce({ role: 'admin' })
        .mockResolvedValueOnce(null)

      ;(prisma.facilityInvite.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue({
        id: 'test-facility',
        name: 'Test Facility'
      })
      ;(prisma.facilityInvite.create as jest.Mock).mockResolvedValue({
        id: 'new-invite',
        token: 'invite-token'
      })

      mockSendEmail.mockRejectedValue(new Error('Email service error'))

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still succeed but delete the invite
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send invitation email')
      expect(prisma.facilityInvite.delete).toHaveBeenCalledWith({
        where: { id: 'new-invite' }
      })
    })

    it('should enforce team size limits', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user' } as any)

      ;(prisma.facilityUser.findFirst as jest.Mock).mockResolvedValue({
        role: 'admin'
      })
      ;(prisma.facilityInvite.findFirst as jest.Mock).mockResolvedValue(null)
      
      // Mock count to exceed limit
      ;(prisma.facilityUser.count as jest.Mock).mockResolvedValue(50)

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'viewer',
          facilityId: 'test-facility'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Team size limit reached')
    })
  })
})