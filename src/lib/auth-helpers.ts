import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * Get the facility ID for the authenticated user
 * Returns null if user has no facility
 */
export async function getUserFacility(userId: string) {
  try {
    // First check if user has a facility through FacilityUser relationship
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: { userId },
      include: { facility: true }
    })
    
    if (facilityUser?.facility) {
      return facilityUser.facility
    }
    
    // Fallback: Check if user owns a facility directly
    const facility = await db.prisma.facility.findFirst({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      }
    })
    
    return facility
  } catch (error) {
    logger.error('api', 'Error getting user facility:', error )
    return null
  }
}

/**
 * Middleware helper to ensure user has facility access
 * Use this in API routes that require facility context
 */
export async function requireFacilityAccess() {
  const { userId } = await auth()
  
  if (!userId) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null,
      facility: null
    }
  }
  
  const facility = await getUserFacility(userId)
  
  if (!facility) {
    return {
      error: NextResponse.json(
        { error: 'No facility found. Please contact support.' },
        { status: 403 }
      ),
      userId,
      facility: null
    }
  }
  
  return {
    error: null,
    userId,
    facility
  }
}

/**
 * Get user's role in a facility
 */
export async function getUserFacilityRole(userId: string, facilityId: string) {
  const facilityUser = await db.prisma.facilityUser.findFirst({
    where: {
      userId,
      facilityId
    }
  })
  
  return facilityUser?.role || null
}