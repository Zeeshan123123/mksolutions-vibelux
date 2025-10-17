/**
 * User Account Deletion API Tests
 */

import { NextRequest } from 'next/server'
import { DELETE } from '@/app/api/user/delete/route'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/prisma')
jest.mock('@/lib/csrf', () => ({
  verifyCSRFToken: jest.fn().mockResolvedValue(true)
}))

describe('/api/user/delete', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should require confirmation', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' } as any)

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: false })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Deletion confirmation required')
    })

    it('should delete user data in correct order', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      // Mock all delete operations
      const deleteOperations = {
        userActivity: jest.fn().mockResolvedValue({ count: 10 }),
        lightingDesign: jest.fn().mockResolvedValue({ count: 5 }),
        facilityUser: jest.fn().mockResolvedValue({ count: 2 }),
        projectMember: jest.fn().mockResolvedValue({ count: 3 }),
        user: jest.fn().mockResolvedValue({ id: mockUserId })
      }

      ;(prisma.userActivity.deleteMany as jest.Mock) = deleteOperations.userActivity
      ;(prisma.lightingDesign.deleteMany as jest.Mock) = deleteOperations.lightingDesign
      ;(prisma.facilityUser.deleteMany as jest.Mock) = deleteOperations.facilityUser
      ;(prisma.projectMember.deleteMany as jest.Mock) = deleteOperations.projectMember
      ;(prisma.user.delete as jest.Mock) = deleteOperations.user

      // Mock Clerk deletion
      mockClerkClient.users = {
        deleteUser: jest.fn().mockResolvedValue({ id: mockUserId })
      } as any

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Account successfully deleted')

      // Verify deletion order
      expect(deleteOperations.userActivity).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(deleteOperations.lightingDesign).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(deleteOperations.facilityUser).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(deleteOperations.projectMember).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(deleteOperations.user).toHaveBeenCalledWith({
        where: { id: mockUserId }
      })
      expect(mockClerkClient.users.deleteUser).toHaveBeenCalledWith(mockUserId)
    })

    it('should handle partial deletion failures', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      ;(prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue({ count: 5 })
      ;(prisma.lightingDesign.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')

      // Should not proceed to delete user from Clerk
      expect(mockClerkClient.users.deleteUser).not.toHaveBeenCalled()
    })

    it('should handle Clerk deletion failure', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      // Mock successful database deletions
      ;(prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue({ count: 5 })
      ;(prisma.lightingDesign.deleteMany as jest.Mock).mockResolvedValue({ count: 3 })
      ;(prisma.facilityUser.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
      ;(prisma.projectMember.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
      ;(prisma.user.delete as jest.Mock).mockResolvedValue({ id: mockUserId })

      // Mock Clerk deletion failure
      mockClerkClient.users = {
        deleteUser: jest.fn().mockRejectedValue(new Error('Clerk API error'))
      } as any

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to complete account deletion')
      expect(data.details).toContain('data has been removed')
    })

    it('should handle missing request body', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' } as any)

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        }
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Deletion confirmation required')
    })

    it('should return deletion statistics', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      const deletionStats = {
        activities: 15,
        designs: 8,
        facilities: 3,
        projects: 5
      }

      ;(prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue({ 
        count: deletionStats.activities 
      })
      ;(prisma.lightingDesign.deleteMany as jest.Mock).mockResolvedValue({ 
        count: deletionStats.designs 
      })
      ;(prisma.facilityUser.deleteMany as jest.Mock).mockResolvedValue({ 
        count: deletionStats.facilities 
      })
      ;(prisma.projectMember.deleteMany as jest.Mock).mockResolvedValue({ 
        count: deletionStats.projects 
      })
      ;(prisma.user.delete as jest.Mock).mockResolvedValue({ id: mockUserId })

      mockClerkClient.users = {
        deleteUser: jest.fn().mockResolvedValue({ id: mockUserId })
      } as any

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.statistics).toEqual({
        activitiesDeleted: deletionStats.activities,
        designsDeleted: deletionStats.designs,
        facilitiesLeft: deletionStats.facilities,
        projectsLeft: deletionStats.projects
      })
    })

    it('should handle user not found in database', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      ;(prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.lightingDesign.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.facilityUser.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.projectMember.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.user.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist')
      )

      mockClerkClient.users = {
        deleteUser: jest.fn().mockResolvedValue({ id: mockUserId })
      } as any

      const request = new NextRequest('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-token'
        },
        body: JSON.stringify({ confirmDelete: true })
      })

      const response = await DELETE(request)
      const data = await response.json()

      // Should still succeed and delete from Clerk
      expect(response.status).toBe(200)
      expect(mockClerkClient.users.deleteUser).toHaveBeenCalledWith(mockUserId)
    })
  })
})