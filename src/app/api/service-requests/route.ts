import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const whereClause: any = {};

    if (facilityId) {
      whereClause.facilityId = facilityId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (category) {
      whereClause.category = category.toUpperCase().replace(/[^A-Z_]/g, '_');
    }

    if (priority) {
      whereClause.priority = priority.toUpperCase();
    }

    const serviceRequests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: {
        facility: {
          select: { id: true, name: true, address: true, city: true, state: true },
        },
        requester: {
          select: { id: true, name: true, email: true },
        },
        equipment: {
          select: { id: true, name: true, category: true, manufacturer: true, model: true },
        },
        bids: {
          include: {
            serviceProvider: {
              select: { 
                id: true, 
                companyName: true, 
                contactName: true, 
                rating: true, 
                reviewCount: true,
                completedJobs: true,
              },
            },
          },
          orderBy: { amount: 'asc' },
        },
        workOrder: {
          select: { 
            id: true, 
            workOrderNumber: true, 
            status: true, 
            progress: true,
            scheduledDate: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(serviceRequests);
  } catch (error) {
    logger.error('api', 'Error fetching service requests:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Set bidding deadline if bidding is enabled
    let biddingDeadline: Date | null = null;
    if (data.biddingEnabled) {
      biddingDeadline = new Date();
      biddingDeadline.setDate(biddingDeadline.getDate() + (data.biddingDays || 3));
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        facilityId: data.facilityId,
        requesterId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'MEDIUM',
        urgency: data.urgency || 'STANDARD',
        equipmentId: data.equipmentId,
        location: data.location,
        accessInstructions: data.accessInstructions,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        flexibleTiming: data.flexibleTiming !== false,
        emergencyService: data.emergencyService || false,
        budgetRange: data.budgetRange,
        maxBudget: data.maxBudget,
        biddingEnabled: data.biddingEnabled !== false,
        biddingDeadline: biddingDeadline,
        photos: data.photos || [],
        documents: data.documents || [],
      },
      include: {
        facility: {
          select: { id: true, name: true, address: true, city: true, state: true },
        },
        requester: {
          select: { id: true, name: true, email: true },
        },
        equipment: {
          select: { id: true, name: true, category: true, manufacturer: true, model: true },
        },
      },
    });

    // If this is an emergency request, notify nearby emergency service providers
    if (data.emergencyService) {
      // Find emergency service providers in the area
      const facility = await prisma.facility.findUnique({
        where: { id: data.facilityId },
        select: { zipCode: true, name: true, address: true },
      });

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (facility?.zipCode) {
        const emergencyProviders = await prisma.serviceProvider.findMany({
          where: {
            status: 'ACTIVE',
            emergencyService: true,
            serviceAreas: {
              some: {
                zipCode: facility.zipCode,
              },
            },
            specializations: {
              some: {
                category: data.category,
              },
            },
          },
          select: { id: true, email: true, companyName: true },
        });

        // Send emergency notifications to qualified providers
        if (emergencyProviders.length > 0) {
          const { sendEmergencyNotifications } = await import('@/lib/notifications/emergency-notifications');
          
          const notification = {
            serviceRequestId: serviceRequest.id,
            facilityName: facility.name,
            priority: data.priority as 'emergency' | 'urgent' | 'normal',
            category: data.category,
            description: data.description,
            facilityAddress: facility.address || undefined,
            contactPerson: user?.name || user?.email || 'Unknown',
            contactPhone: undefined,
            contactEmail: user?.email
          };

          // Send notifications asynchronously to avoid blocking the response
          sendEmergencyNotifications(notification, emergencyProviders).catch(error => {
            logger.error('api', 'Failed to send emergency notifications:', new Error(`Service Request ID: ${serviceRequest.id}, Error: ${error}`));
          });

          logger.info('api', 'Emergency notifications initiated', {
            serviceRequestId: serviceRequest.id,
            providersNotified: emergencyProviders.length,
            priority: data.priority
          });
        } else {
          logger.warn('api', 'No qualified providers found for emergency request', {
            serviceRequestId: serviceRequest.id,
            category: data.category,
            priority: data.priority
          });
        }
      }
    }

    return NextResponse.json(serviceRequest, { status: 201 });
  } catch (error) {
    logger.error('api', 'Error creating service request:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}