import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's enterprise facilities
    const facilities = await prisma.facility.findMany({
      where: {
        users: {
          some: {
            userId: userId,
            role: { in: ['OWNER', 'ADMIN', 'MANAGER'] } // Only enterprise roles
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        harvestBatches: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        waterUsage: {
          where: {
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        },
        waterAlerts: {
          where: {
            acknowledged: false
          }
        },
        scoutingRecords: {
          where: {
            timestamp: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }
      }
    })

    // Transform data for enterprise dashboard
    const enterpriseFacilities = facilities.map(facility => {
      // Calculate metrics (using facility size since spaces relation doesn't exist)
      const totalArea = facility.size || 0
      const activeZones = 1 // Default to 1 active zone
      
      const recentHarvests = facility.harvestBatches.filter(batch => 
        batch.status === 'completed'
      )
      const dailyYield = recentHarvests.reduce((sum, batch) => 
        sum + batch.actualYield, 0
      ) / Math.max(1, recentHarvests.length)
      
      const monthlyYield = facility.harvestBatches.reduce((sum, batch) => 
        sum + (batch.actualYield || batch.estimatedYield), 0
      )
      
      // Calculate efficiency (yield vs estimated)
      const efficiency = recentHarvests.length > 0 ? 
        recentHarvests.reduce((sum, batch) => 
          sum + ((batch.actualYield / batch.estimatedYield) * 100), 0
        ) / recentHarvests.length : 85 // Default if no data
      
      // Water usage metrics
      const waterUsage = facility.waterUsage.reduce((sum, usage) => 
        sum + usage.usage, 0
      )
      
      // Alert counts
      const criticalAlerts = facility.waterAlerts.filter(alert => 
        alert.severity === 'critical'
      ).length
      const warningAlerts = facility.waterAlerts.filter(alert => 
        alert.severity === 'medium' || alert.severity === 'high'
      ).length
      const infoAlerts = facility.waterAlerts.filter(alert => 
        alert.severity === 'low'
      ).length
      
      // Find facility manager
      const manager = facility.users.find(fu => 
        fu.role === 'MANAGER' || fu.role === 'ADMIN'
      )?.user
      
      return {
        id: facility.id,
        name: facility.name,
        location: `${facility.city || ''}, ${facility.state || ''}`.trim().replace(/^,|,$/, '') || 'Unknown',
        type: facility.type?.toLowerCase() || 'indoor',
        status: 'operational', // Default status since field doesn't exist
        manager: {
          name: manager?.name || 'Unassigned',
          email: manager?.email || '',
          avatar: '/avatars/default.jpg'
        },
        metrics: {
          totalArea: Math.round(totalArea),
          activeZones,
          totalZones: 1, // Default since spaces relation doesn't exist
          dailyYield: Math.round(dailyYield * 10) / 10,
          monthlyYield: Math.round(monthlyYield * 10) / 10,
          efficiency: Math.round(efficiency),
          energyUsage: Math.round(totalArea * 0.15), // Estimated based on area
          waterUsage: Math.round(waterUsage),
          laborHours: 8, // Estimated since spaces relation doesn't exist
          revenue: Math.round(monthlyYield * 850), // Estimated at $850/kg
          profit: Math.round(monthlyYield * 850 * 0.25), // 25% margin
          profitMargin: 25
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          info: infoAlerts
        },
        compliance: {
          environmental: Math.max(85, 100 - criticalAlerts * 5 - warningAlerts * 2),
          safety: Math.max(80, 95 - criticalAlerts * 3),
          quality: Math.max(85, 98 - criticalAlerts * 4)
        },
        lastUpdate: new Date()
      }
    })

    return NextResponse.json(enterpriseFacilities)
  } catch (error) {
    logger.error('api', 'Error fetching enterprise facilities:', error )
    return NextResponse.json(
      { error: 'Failed to fetch enterprise facilities' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    // Create new facility
    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        city: data.location, // Using city field since location doesn't exist
        type: data.type?.toUpperCase() || 'INDOOR',
        // status: 'COMMISSIONING', // Removing since status field doesn't exist
        settings: data.settings || {},
        users: {
          create: {
            userId: userId,
            role: 'OWNER'
          }
        }
      }
    })

    // Note: Space creation removed since Space model belongs to Project, not Facility

    return NextResponse.json(facility, { status: 201 })
  } catch (error) {
    logger.error('api', 'Error creating enterprise facility:', error )
    return NextResponse.json(
      { error: 'Failed to create enterprise facility' },
      { status: 500 }
    )
  }
}