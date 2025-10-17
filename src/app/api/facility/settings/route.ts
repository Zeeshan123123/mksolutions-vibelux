import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    // Get user's default facility if none specified
    const facility = facilityId 
      ? await prisma.facility.findFirst({
          where: { id: facilityId, ownerId: userId }
        })
      : await prisma.facility.findFirst({
          where: { ownerId: userId }
        });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Return facility settings
    return NextResponse.json({
      success: true,
      settings: {
        // General Settings
        facilityName: facility.name,
        facilityType: facility.type,
        location: `${facility.address}, ${facility.city}, ${facility.state}`,
        timezone: (facility.settings as any)?.timezone || 'America/Denver',
        currency: (facility.settings as any)?.currency || 'USD',
        operatingHours: (facility.settings as any)?.operatingHours || {
          start: '06:00',
          end: '22:00'
        },
        
        // Operations Settings
        defaultLightCycle: (facility.settings as any)?.defaultLightCycle || '18/6',
        temperatureUnit: (facility.settings as any)?.temperatureUnit || 'fahrenheit',
        autoHarvest: (facility.settings as any)?.autoHarvest || true,
        autoIrrigation: (facility.settings as any)?.autoIrrigation || true,
        yieldTracking: (facility.settings as any)?.yieldTracking || true,
        qualityControl: (facility.settings as any)?.qualityControl || true,
        
        // Notifications
        emailAlerts: (facility.settings as any)?.notifications?.emailAlerts !== false,
        smsAlerts: (facility.settings as any)?.notifications?.smsAlerts || false,
        systemMaintenance: (facility.settings as any)?.notifications?.systemMaintenance !== false,
        harvestReminders: (facility.settings as any)?.notifications?.harvestReminders !== false,
        environmentalAlerts: (facility.settings as any)?.notifications?.environmentalAlerts !== false,
        equipmentFailure: (facility.settings as any)?.notifications?.equipmentFailure !== false,
        
        // Security
        twoFactor: (facility.settings as any)?.security?.twoFactor !== false,
        sessionTimeout: (facility.settings as any)?.security?.sessionTimeout || 30,
        ipWhitelist: (facility.settings as any)?.security?.ipWhitelist || '',
        auditLogging: (facility.settings as any)?.security?.auditLogging !== false,
        
        // Integration
        scadaEnabled: (facility.settings as any)?.integration?.scadaEnabled || false,
        apiAccess: (facility.settings as any)?.integration?.apiAccess !== false,
        webhookURL: (facility.settings as any)?.integration?.webhookURL || '',
        apiKey: (facility.settings as any)?.integration?.apiKey || ''
      }
    });
  } catch (error) {
    logger.error('api', 'Error fetching facility settings:', error );
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    // Get user's default facility if none specified
    const facility = facilityId 
      ? await prisma.facility.findFirst({
          where: { id: facilityId, ownerId: userId }
        })
      : await prisma.facility.findFirst({
          where: { ownerId: userId }
        });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Extract location components
    const locationParts = settings.location?.split(', ') || [];
    const [address = '', city = '', state = ''] = locationParts;

    // Update facility settings
    const updatedFacility = await prisma.facility.update({
      where: { id: facility.id },
      data: {
        name: settings.facilityName,
        type: settings.facilityType,
        address,
        city,
        state,
        settings: {
          // General
          timezone: settings.timezone,
          currency: settings.currency,
          operatingHours: settings.operatingHours,
          // Operations
          defaultLightCycle: settings.defaultLightCycle,
          temperatureUnit: settings.temperatureUnit,
          autoHarvest: settings.autoHarvest,
          autoIrrigation: settings.autoIrrigation,
          yieldTracking: settings.yieldTracking,
          qualityControl: settings.qualityControl,
          
          // Notifications
          notifications: {
            emailAlerts: settings.emailAlerts,
            smsAlerts: settings.smsAlerts,
            systemMaintenance: settings.systemMaintenance,
            harvestReminders: settings.harvestReminders,
            environmentalAlerts: settings.environmentalAlerts,
            equipmentFailure: settings.equipmentFailure
          },
          
          // Security
          security: {
            twoFactor: settings.twoFactor,
            sessionTimeout: settings.sessionTimeout,
            ipWhitelist: settings.ipWhitelist,
            auditLogging: settings.auditLogging
          },
          
          // Integration
          integration: {
            scadaEnabled: settings.scadaEnabled,
            apiAccess: settings.apiAccess,
            webhookURL: settings.webhookURL
          }
        },
        updatedAt: new Date()
      }
    });

    // Log settings change for audit
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'facility_settings_updated',
        entityType: 'facility',
        entityId: facility.id,
        details: {
          before: facility.settings,
          after: updatedFacility.settings
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    logger.error('api', 'Error updating facility settings:', error );
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}