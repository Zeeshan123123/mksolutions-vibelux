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
    const { facilityId, operation = 'sync' } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const service = new METRCIntegrationService();

    switch (operation) {
      case 'sync': {
        logger.info('api', 'Starting METRC compliance sync', { facilityId });
        
        const result = await service.syncComplianceData(facilityId);
        
        return NextResponse.json({
          success: true,
          message: 'METRC sync completed successfully',
          data: result
        });
      }

      case 'create_plant': {
        const { plant } = body;
        if (!plant) {
          return NextResponse.json(
            { error: 'Plant data is required' },
            { status: 400 }
          );
        }

        const metrcLabel = await service.createPlantInMETRC(facilityId, {
          ...plant,
          plantedDate: new Date(plant.plantedDate),
          vegetativeDate: plant.vegetativeDate ? new Date(plant.vegetativeDate) : undefined,
          floweringDate: plant.floweringDate ? new Date(plant.floweringDate) : undefined,
          harvestedDate: plant.harvestedDate ? new Date(plant.harvestedDate) : undefined,
          destroyedDate: plant.destroyedDate ? new Date(plant.destroyedDate) : undefined
        });

        return NextResponse.json({
          success: true,
          metrcLabel,
          message: 'Plant created in METRC successfully'
        });
      }

      case 'create_package': {
        const { package: pkg } = body;
        if (!pkg) {
          return NextResponse.json(
            { error: 'Package data is required' },
            { status: 400 }
          );
        }

        const metrcTag = await service.createPackageInMETRC(facilityId, {
          ...pkg,
          packagedDate: new Date(pkg.packagedDate)
        });

        return NextResponse.json({
          success: true,
          metrcTag,
          message: 'Package created in METRC successfully'
        });
      }

      case 'compliance_check': {
        const status = await service.getComplianceStatus(facilityId);
        
        return NextResponse.json({
          success: true,
          complianceStatus: status,
          message: 'Compliance status retrieved successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'METRC operation failed', error as Error);
    return NextResponse.json(
      { error: 'METRC operation failed', details: (error as Error).message },
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
    const dataType = searchParams.get('type') || 'status';

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const service = new METRCIntegrationService();

    switch (dataType) {
      case 'status': {
        const status = await service.getComplianceStatus(facilityId);
        
        return NextResponse.json({
          success: true,
          facilityId,
          complianceStatus: status,
          timestamp: new Date()
        });
      }

      case 'sync_history': {
        // This would retrieve sync history from database
        // For now, return mock data
        return NextResponse.json({
          success: true,
          facilityId,
          syncHistory: [
            {
              timestamp: new Date(),
              status: 'completed',
              summary: {
                totalProcessed: 45,
                successful: 42,
                failed: 3,
                warnings: 2
              }
            }
          ]
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid data type. Use: status, sync_history' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Failed to get METRC data', error as Error);
    return NextResponse.json(
      { error: 'Failed to get METRC data', details: (error as Error).message },
      { status: 500 }
    );
  }
}