import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import energyIntegrationService from '@/services/energy-integration.service';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// Validation schemas
const integrationConfigSchema = z.object({
  facilityId: z.string(),
  integrationType: z.enum(['modbus', 'mqtt', 'api', 'csv']),
  connectionDetails: z.record(z.any()),
  pollingInterval: z.number().optional(),
  active: z.boolean().default(true),
});

const csvUploadSchema = z.object({
  facilityId: z.string(),
  csvContent: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if this is a CSV upload
    if (body.csvContent) {
      const validatedData = csvUploadSchema.parse(body);
      const result = await energyIntegrationService.processCsvUpload(
        validatedData.facilityId,
        validatedData.csvContent
      );
      
      return NextResponse.json({
        success: true,
        message: `Processed ${result.processed} readings with ${result.errors} errors`,
        result,
      });
    } else {
      // Regular integration setup
      const validatedData = integrationConfigSchema.parse(body);
      await energyIntegrationService.registerIntegration(validatedData);
      
      return NextResponse.json({
        success: true,
        message: 'Integration registered successfully',
        integration: {
          facilityId: validatedData.facilityId,
          type: validatedData.integrationType,
          active: validatedData.active,
        },
      });
    }
  } catch (error) {
    logger.error('api', 'Error setting up integration:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to setup integration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    
    if (!facilityId) {
      return NextResponse.json(
        { error: 'Missing required parameter: facilityId' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get integration details
    const integration = await prisma.$queryRaw`
      SELECT 
        facility_id,
        integration_type,
        connection_details,
        polling_interval,
        active,
        last_sync_at,
        created_at,
        updated_at
      FROM energy_integrations
      WHERE facility_id = ${facilityId}
      LIMIT 1
    `;

    if (!integration || (integration as any[]).length === 0) {
      return NextResponse.json({
        facilityId,
        configured: false,
      });
    }

    const config = (integration as any[])[0];
    
    // Remove sensitive data from connection details
    const sanitizedDetails = { ...config.connection_details };
    if (sanitizedDetails.password) sanitizedDetails.password = '***';
    if (sanitizedDetails.apiKey) sanitizedDetails.apiKey = '***';

    return NextResponse.json({
      facilityId,
      configured: true,
      integration: {
        type: config.integration_type,
        active: config.active,
        pollingInterval: config.polling_interval,
        lastSyncAt: config.last_sync_at,
        connectionDetails: sanitizedDetails,
      },
    });
  } catch (error) {
    logger.error('api', 'Error fetching integration details:', error );
    return NextResponse.json(
      { error: 'Failed to fetch integration details' },
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

    const body = await request.json();
    const { facilityId, active } = body;

    if (!facilityId || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required parameters: facilityId, active' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Update integration status
    await prisma.$executeRaw`
      UPDATE energy_integrations
      SET active = ${active}, updated_at = ${new Date()}
      WHERE facility_id = ${facilityId}
    `;

    // Start or stop polling based on status
    if (active) {
      const integration = await prisma.$queryRaw`
        SELECT * FROM energy_integrations WHERE facility_id = ${facilityId}
      `;
      
      if (integration && (integration as any[]).length > 0) {
        const config = (integration as any[])[0];
        await energyIntegrationService.startPolling({
          facilityId: config.facility_id,
          integrationType: config.integration_type,
          connectionDetails: config.connection_details,
          pollingInterval: config.polling_interval,
          active: true,
        });
      }
    } else {
      energyIntegrationService.stopPolling(facilityId);
    }

    return NextResponse.json({
      success: true,
      message: `Integration ${active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    logger.error('api', 'Error updating integration:', error );
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}