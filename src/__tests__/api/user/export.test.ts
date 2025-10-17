/**
 * User Data Export API Tests
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/user/export/route'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/prisma')

describe('/api/user/export', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should export user data successfully', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      const mockUserData = {
        id: mockUserId,
        email: 'user@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-03-01')
      }

      const mockFacilities = [
        {
          id: 'facility-1',
          name: 'Test Facility 1',
          role: 'admin',
          joinedAt: new Date('2024-01-15'),
          facility: {
            name: 'Test Facility 1',
            type: 'greenhouse',
            location: 'Test Location'
          }
        }
      ]

      const mockActivities = [
        {
          id: 'activity-1',
          action: 'create_project',
          details: { projectName: 'Test Project' },
          createdAt: new Date('2024-02-01')
        }
      ]

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          description: 'Test Description',
          createdAt: new Date('2024-02-01'),
          role: 'owner'
        }
      ]

      const mockLightingDesigns = [
        {
          id: 'design-1',
          name: 'Test Design',
          roomDimensions: { width: 10, length: 20, height: 3 },
          createdAt: new Date('2024-02-15')
        }
      ]

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData)
      ;(prisma.facilityUser.findMany as jest.Mock).mockResolvedValue(mockFacilities)
      ;(prisma.userActivity.findMany as jest.Mock).mockResolvedValue(mockActivities)
      ;(prisma.projectMember.findMany as jest.Mock).mockResolvedValue(mockProjects)
      ;(prisma.lightingDesign.findMany as jest.Mock).mockResolvedValue(mockLightingDesigns)

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Content-Disposition')).toContain('attachment')
      expect(response.headers.get('Content-Disposition')).toContain('vibelux-data-export')

      const data = await response.json()

      expect(data).toHaveProperty('exportedAt')
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('facilities')
      expect(data).toHaveProperty('activities')
      expect(data).toHaveProperty('projects')
      expect(data).toHaveProperty('lightingDesigns')

      expect(data.user).toEqual({
        id: mockUserId,
        email: 'user@example.com',
        name: 'Test User',
        accountCreated: '2024-01-01T00:00:00.000Z',
        lastLogin: '2024-03-01T00:00:00.000Z'
      })

      expect(data.facilities).toHaveLength(1)
      expect(data.activities).toHaveLength(1)
      expect(data.projects).toHaveLength(1)
      expect(data.lightingDesigns).toHaveLength(1)
    })

    it('should handle user not found', async () => {
      mockAuth.mockReturnValue({ userId: 'non-existent-user' } as any)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should handle partial data availability', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: 'user@example.com'
      })
      ;(prisma.facilityUser.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.userActivity.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.projectMember.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.lightingDesign.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.facilities).toEqual([])
      expect(data.activities).toEqual([])
      expect(data.projects).toEqual([])
      expect(data.lightingDesigns).toEqual([])
    })

    it('should format dates correctly', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      const testDate = new Date('2024-03-15T10:30:00Z')

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: 'user@example.com',
        createdAt: testDate,
        lastLogin: testDate
      })
      ;(prisma.facilityUser.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.userActivity.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.projectMember.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.lightingDesign.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(data.user.accountCreated).toBe('2024-03-15T10:30:00.000Z')
      expect(data.user.lastLogin).toBe('2024-03-15T10:30:00.000Z')
    })

    it('should set correct Content-Disposition header', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: 'user@example.com'
      })
      ;(prisma.facilityUser.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.userActivity.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.projectMember.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.lightingDesign.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)

      const contentDisposition = response.headers.get('Content-Disposition')
      expect(contentDisposition).toMatch(/attachment; filename="vibelux-data-export-\d{4}-\d{2}-\d{2}\.json"/)
    })

    it('should handle database errors gracefully', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' } as any)
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should include complete activity details', async () => {
      const mockUserId = 'test-user-id'
      mockAuth.mockReturnValue({ userId: mockUserId } as any)

      const mockActivities = [
        {
          id: 'activity-1',
          action: 'create_project',
          details: {
            projectName: 'Test Project',
            projectId: 'project-123'
          },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date('2024-02-01')
        },
        {
          id: 'activity-2',
          action: 'update_facility',
          details: {
            facilityId: 'facility-123',
            changes: ['name', 'location']
          },
          ipAddress: '192.168.1.2',
          userAgent: 'Chrome/120.0',
          createdAt: new Date('2024-02-02')
        }
      ]

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: 'user@example.com'
      })
      ;(prisma.facilityUser.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.userActivity.findMany as jest.Mock).mockResolvedValue(mockActivities)
      ;(prisma.projectMember.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.lightingDesign.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/export')
      const response = await GET(request)
      const data = await response.json()

      expect(data.activities).toHaveLength(2)
      expect(data.activities[0]).toHaveProperty('action', 'create_project')
      expect(data.activities[0]).toHaveProperty('details')
      expect(data.activities[0]).toHaveProperty('timestamp')
      expect(data.activities[1]).toHaveProperty('action', 'update_facility')
    })
  })
})