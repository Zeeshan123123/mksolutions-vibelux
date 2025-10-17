import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { METRCIntegrationService } from '@/services/metrc-integration.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      facilityId, 
      licenseNumber, 
      state, 
      apiKey, 
      userKey, 
      environment = 'sandbox',
      settings 
    } = body;

    if (!facilityId || !licenseNumber || !state || !apiKey || !userKey) {
      return NextResponse.json(
        { error: 'Missing required fields: facilityId, licenseNumber, state, apiKey, userKey' },
        { status: 400 }
      );
    }

    // Validate state code (2 letters)
    if (!/^[A-Z]{2}$/.test(state.toUpperCase())) {
      return NextResponse.json(
        { error: 'State must be a valid 2-letter state code (e.g., CA, CO, NV)' },
        { status: 400 }
      );
    }

    const service = new METRCIntegrationService();

    const config = {
      facilityId,
      licenseNumber,
      state: state.toUpperCase(),
      apiKey,
      userKey,
      environment,
      settings: {
        autoSyncEnabled: settings?.autoSyncEnabled ?? true,
        syncInterval: settings?.syncInterval ?? 60, // 1 hour default
        lastSyncDate: new Date(),
        complianceSettings: {
          trackPlants: settings?.complianceSettings?.trackPlants ?? true,
          trackPackages: settings?.complianceSettings?.trackPackages ?? true,
          trackHarvests: settings?.complianceSettings?.trackHarvests ?? true,
          trackTransfers: settings?.complianceSettings?.trackTransfers ?? true,
          trackLabTests: settings?.complianceSettings?.trackLabTests ?? true,
          autoCreateMETRCEntries: settings?.complianceSettings?.autoCreateMETRCEntries ?? false,
          requireLabTestApproval: settings?.complianceSettings?.requireLabTestApproval ?? true,
          alertOnComplianceIssues: settings?.complianceSettings?.alertOnComplianceIssues ?? true,
          ...settings?.complianceSettings
        }
      }
    };

    const success = await service.initializeIntegration(config);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to initialize METRC integration' },
        { status: 500 }
      );
    }

    logger.info('api', 'METRC integration connected successfully', { 
      facilityId, 
      licenseNumber, 
      state: config.state 
    });

    return NextResponse.json({
      success: true,
      message: 'METRC integration connected successfully',
      config: {
        facilityId: config.facilityId,
        licenseNumber: config.licenseNumber,
        state: config.state,
        environment: config.environment,
        settings: config.settings
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to connect METRC integration', error as Error);
    return NextResponse.json(
      { error: 'Failed to connect METRC integration', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const service = new METRCIntegrationService();
    const status = await service.getComplianceStatus(facilityId);

    return NextResponse.json({
      success: true,
      facilityId,
      complianceStatus: status
    });

  } catch (error) {
    logger.error('api', 'Failed to get METRC connection status', error as Error);
    return NextResponse.json(
      { error: 'Failed to get connection status', details: (error as Error).message },
      { status: 500 }
    );
  }
}