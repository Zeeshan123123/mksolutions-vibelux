import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export interface SOPDocument {
  id: string
  title: string
  category: string
  subcategory?: string | null
  version: string
  status: string
  description: string
  content: any // JSON content
  materials: string[]
  safetyNotes: string[]
  tags: string[]
  estimatedTime: number
  difficulty: string
  frequency?: string | null
  createdBy: string
  reviewedBy: string[]
  approvedBy?: string | null
  approvedDate?: Date | null
  facilityId?: string | null
  views: number
  completions: number
  averageRating?: number | null
  effectiveDate: Date
  reviewDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface SOPCheckIn {
  id: string
  sopId: string
  userId: string
  startTime: Date
  endTime?: Date | null
  completedSteps: any
  notes?: string | null
  issues: string[]
  facilityId?: string | null
  locationId?: string | null
  batchId?: string | null
  verified: boolean
  verifiedBy?: string | null
  verifiedAt?: Date | null
  status: string
  completionRate?: number | null
  createdAt: Date
  updatedAt: Date
}

export class SOPService {
  /**
   * Get all SOPs for a facility or user
   */
  static async getSOPs(params?: {
    facilityId?: string
    category?: string
    status?: string
    search?: string
  }): Promise<SOPDocument[]> {
    try {
      const where: any = {}
      
      if (params?.facilityId) {
        where.facilityId = params.facilityId
      }
      
      if (params?.category && params.category !== 'all') {
        where.category = params.category
      }
      
      if (params?.status) {
        where.status = params.status
      }
      
      if (params?.search) {
        where.OR = [
          { title: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { tags: { has: params.search } }
        ]
      }
      
      const sops = await prisma.sOPDocument.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { category: 'asc' },
          { title: 'asc' }
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      return sops as SOPDocument[]
    } catch (error) {
      console.error('Failed to fetch SOPs:', error)
      return []
    }
  }
  
  /**
   * Get a single SOP by ID
   */
  static async getSOP(id: string): Promise<SOPDocument | null> {
    try {
      const sop = await prisma.sOPDocument.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          checkIns: {
            orderBy: { startTime: 'desc' },
            take: 10
          }
        }
      })
      
      // Increment view count
      if (sop) {
        await prisma.sOPDocument.update({
          where: { id },
          data: { views: { increment: 1 } }
        })
      }
      
      return sop as SOPDocument | null
    } catch (error) {
      console.error('Failed to fetch SOP:', error)
      return null
    }
  }
  
  /**
   * Create a new SOP
   */
  static async createSOP(data: {
    title: string
    category: string
    subcategory?: string
    description: string
    content: any
    materials?: string[]
    safetyNotes?: string[]
    tags?: string[]
    estimatedTime: number
    difficulty: string
    frequency?: string
    facilityId?: string
  }, userId: string): Promise<SOPDocument | null> {
    try {
      const sop = await prisma.sOPDocument.create({
        data: {
          ...data,
          version: '1.0',
          status: 'draft',
          materials: data.materials || [],
          safetyNotes: data.safetyNotes || [],
          tags: data.tags || [],
          createdBy: userId,
          reviewedBy: [],
          views: 0,
          completions: 0,
          effectiveDate: new Date()
        }
      })
      
      return sop as SOPDocument
    } catch (error) {
      console.error('Failed to create SOP:', error)
      return null
    }
  }
  
  /**
   * Update an existing SOP
   */
  static async updateSOP(
    id: string,
    data: Partial<Omit<SOPDocument, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string
  ): Promise<SOPDocument | null> {
    try {
      // Get current SOP for revision history
      const currentSOP = await prisma.sOPDocument.findUnique({
        where: { id }
      })
      
      if (!currentSOP) return null
      
      // Create revision record if version changed
      if (data.version && data.version !== currentSOP.version) {
        await prisma.sOPRevision.create({
          data: {
            sopId: id,
            previousVersion: currentSOP.version,
            newVersion: data.version,
            changeLog: `Updated from version ${currentSOP.version} to ${data.version}`,
            changedBy: userId,
            previousContent: currentSOP.content
          }
        })
      }
      
      // Update SOP
      const updatedSOP = await prisma.sOPDocument.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
      
      return updatedSOP as SOPDocument
    } catch (error) {
      console.error('Failed to update SOP:', error)
      return null
    }
  }
  
  /**
   * Delete an SOP (soft delete by archiving)
   */
  static async deleteSOP(id: string): Promise<boolean> {
    try {
      await prisma.sOPDocument.update({
        where: { id },
        data: { status: 'archived' }
      })
      return true
    } catch (error) {
      console.error('Failed to delete SOP:', error)
      return false
    }
  }
  
  /**
   * Start a check-in for an SOP
   */
  static async startCheckIn(data: {
    sopId: string
    userId: string
    facilityId?: string
    locationId?: string
    batchId?: string
    clientIp?: string
    userAgent?: string
  }): Promise<SOPCheckIn | null> {
    try {
      const checkIn = await prisma.sOPCheckIn.create({
        data: {
          ...data,
          startTime: new Date(),
          completedSteps: [],
          issues: [],
          verified: false,
          status: 'in_progress',
          completionRate: 0,
          clientIp: data.clientIp,
          userAgent: data.userAgent
        }
      })
      
      return checkIn as SOPCheckIn
    } catch (error) {
      console.error('Failed to start check-in:', error)
      return null
    }
  }
  
  /**
   * Update check-in progress
   */
  static async updateCheckIn(
    id: string,
    data: {
      completedSteps?: any
      notes?: string
      issues?: string[]
      completionRate?: number
    }
  ): Promise<SOPCheckIn | null> {
    try {
      const checkIn = await prisma.sOPCheckIn.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
      
      return checkIn as SOPCheckIn
    } catch (error) {
      console.error('Failed to update check-in:', error)
      return null
    }
  }
  
  /**
   * Complete a check-in
   */
  static async completeCheckIn(
    id: string,
    data: {
      notes?: string
      issues?: string[]
    }
  ): Promise<SOPCheckIn | null> {
    try {
      const checkIn = await prisma.sOPCheckIn.update({
        where: { id },
        data: {
          ...data,
          endTime: new Date(),
          status: 'completed',
          completionRate: 100,
          updatedAt: new Date()
        }
      })
      
      // Update SOP completion count
      await prisma.sOPDocument.update({
        where: { id: checkIn.sopId },
        data: { completions: { increment: 1 } }
      })
      
      return checkIn as SOPCheckIn
    } catch (error) {
      console.error('Failed to complete check-in:', error)
      return null
    }
  }
  
  /**
   * Get check-in history for a user or SOP
   */
  static async getCheckIns(params: {
    userId?: string
    sopId?: string
    facilityId?: string
    status?: string
  }): Promise<SOPCheckIn[]> {
    try {
      const where: any = {}
      
      if (params.userId) where.userId = params.userId
      if (params.sopId) where.sopId = params.sopId
      if (params.facilityId) where.facilityId = params.facilityId
      if (params.status) where.status = params.status
      
      const checkIns = await prisma.sOPCheckIn.findMany({
        where,
        orderBy: { startTime: 'desc' },
        include: {
          sop: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      return checkIns as SOPCheckIn[]
    } catch (error) {
      console.error('Failed to fetch check-ins:', error)
      return []
    }
  }
  
  /**
   * Generate default SOPs for a facility
   */
  static async generateDefaultSOPs(facilityId: string, userId: string): Promise<void> {
    const defaultSOPs = [
      {
        title: 'Daily Lighting System Check',
        category: 'lighting',
        description: 'Comprehensive daily inspection routine for LED grow light systems',
        difficulty: 'beginner',
        estimatedTime: 20,
        frequency: 'daily',
        content: {
          sections: [
            {
              id: 'prep',
              title: 'Preparation',
              steps: [
                'Put on appropriate PPE (safety glasses)',
                'Gather inspection tools (PAR meter, thermal camera if available)',
                'Review previous inspection notes'
              ]
            },
            {
              id: 'visual',
              title: 'Visual Inspection',
              steps: [
                'Check all fixtures for proper mounting and alignment',
                'Look for any damaged or flickering LEDs',
                'Verify all cooling fans are operational',
                'Inspect power cables for damage or wear'
              ]
            },
            {
              id: 'measurements',
              title: 'Performance Measurements',
              steps: [
                'Measure PPFD at canopy level (record in log)',
                'Check fixture temperatures with thermal camera or IR thermometer',
                'Verify timer settings and photoperiod schedule',
                'Test dimming controls if applicable'
              ]
            },
            {
              id: 'documentation',
              title: 'Documentation',
              steps: [
                'Record all measurements in daily log',
                'Note any issues or concerns',
                'Schedule maintenance for any identified problems',
                'Update maintenance tracking system'
              ]
            }
          ]
        },
        materials: ['PAR meter', 'Thermal camera or IR thermometer', 'Inspection log', 'PPE'],
        safetyNotes: ['Never look directly at high-intensity LEDs', 'Ensure fixtures are cool before touching', 'Use proper ladder safety when checking overhead fixtures'],
        tags: ['daily', 'LED', 'inspection', 'PPFD']
      },
      {
        title: 'Nutrient Solution Preparation',
        category: 'nutrients',
        description: 'Standard procedure for mixing and preparing hydroponic nutrient solutions',
        difficulty: 'intermediate',
        estimatedTime: 45,
        frequency: 'weekly',
        content: {
          sections: [
            {
              id: 'prep',
              title: 'Preparation',
              steps: [
                'Clean and sanitize mixing tank',
                'Calibrate pH and EC meters',
                'Gather all required nutrients and additives',
                'Fill tank with appropriate water volume'
              ]
            },
            {
              id: 'mixing',
              title: 'Mixing Process',
              steps: [
                'Add base nutrients according to feed chart',
                'Mix thoroughly between each addition',
                'Add calcium and magnesium supplements if needed',
                'Add micronutrients and beneficial additives',
                'Allow solution to mix for 15 minutes'
              ]
            },
            {
              id: 'adjustment',
              title: 'pH and EC Adjustment',
              steps: [
                'Measure initial EC/TDS',
                'Adjust EC to target range if needed',
                'Measure initial pH',
                'Adjust pH to 5.8-6.2 using pH up/down',
                'Re-test after 10 minutes and fine-tune'
              ]
            },
            {
              id: 'quality',
              title: 'Quality Control',
              steps: [
                'Record final EC and pH values',
                'Check solution temperature (65-75°F ideal)',
                'Take sample for lab analysis if required',
                'Label tank with date and batch number'
              ]
            }
          ]
        },
        materials: ['pH meter', 'EC meter', 'Measuring cups', 'Mixing pump', 'Nutrients', 'pH adjusters'],
        safetyNotes: ['Wear gloves when handling concentrated nutrients', 'Add acid to water, never water to acid', 'Ensure adequate ventilation'],
        tags: ['nutrients', 'hydroponic', 'mixing', 'pH', 'EC']
      },
      {
        title: 'Integrated Pest Management Weekly Scout',
        category: 'pest_management',
        description: 'Systematic scouting procedure for early pest and disease detection',
        difficulty: 'intermediate',
        estimatedTime: 60,
        frequency: 'weekly',
        content: {
          sections: [
            {
              id: 'prep',
              title: 'Preparation',
              steps: [
                'Review previous scouting reports',
                'Prepare scouting forms and tools',
                'Put on clean clothing to prevent contamination',
                'Start from cleanest to potentially infected areas'
              ]
            },
            {
              id: 'inspection',
              title: 'Plant Inspection',
              steps: [
                'Randomly select 10% of plants for detailed inspection',
                'Check upper and lower leaf surfaces',
                'Inspect stems and growth tips',
                'Look for signs of pest damage or disease',
                'Use hand lens for detailed examination'
              ]
            },
            {
              id: 'monitoring',
              title: 'Monitoring Tools',
              steps: [
                'Check and replace sticky traps',
                'Record trap counts by pest type',
                'Inspect indicator plants if present',
                'Review environmental data for disease-favorable conditions'
              ]
            },
            {
              id: 'action',
              title: 'Action Items',
              steps: [
                'Identify any pests or diseases found',
                'Determine action thresholds',
                'Recommend treatment if thresholds exceeded',
                'Schedule follow-up inspection',
                'Report findings to management'
              ]
            }
          ]
        },
        materials: ['Hand lens', 'Sticky traps', 'Scouting forms', 'Sample bags', 'Camera'],
        safetyNotes: ['Wash hands between rooms', 'Dispose of infected material properly', 'Report quarantine needs immediately'],
        tags: ['IPM', 'scouting', 'pest', 'disease', 'monitoring']
      }
    ]
    
    for (const sopData of defaultSOPs) {
      await this.createSOP(
        {
          ...sopData,
          facilityId
        },
        userId
      )
    }
  }
}