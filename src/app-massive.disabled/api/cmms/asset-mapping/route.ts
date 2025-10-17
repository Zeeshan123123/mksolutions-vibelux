import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';

const CreateAssetMappingRequest = z.object({
  vibeluxEquipmentId: z.string().min(1),
  cmmsAssetId: z.string().min(1),
  platform: z.enum(['servicenow', 'sap_pm', 'maximo', 'upkeep', 'fiix']),
  mappingType: z.enum(['automatic', 'manual']).default('manual'),
});

const UpdateAssetMappingRequest = z.object({
  id: z.string().min(1),
  updates: z.object({
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const AutoMapRequest = z.object({
  cmmsId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin privileges
    // Skip admin check for now - role not available in session

    const body = await request.json();
    const { vibeluxEquipmentId, cmmsAssetId, platform, mappingType } = 
      CreateAssetMappingRequest.parse(body);

    const assetMapping = await cmmsIntegrationService.createAssetMapping(
      vibeluxEquipmentId,
      cmmsAssetId,
      platform,
      mappingType
    );

    return NextResponse.json({
      message: 'Asset mapping created successfully',
      assetMapping,
    });
  } catch (error) {
    logger.error('api', 'Error creating asset mapping:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create asset mapping' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin privileges
    // Skip admin check for now - role not available in session

    const body = await request.json();
    const { id, updates } = UpdateAssetMappingRequest.parse(body);

    const updatedMapping = await cmmsIntegrationService.updateAssetMapping(id, updates);

    return NextResponse.json({
      message: 'Asset mapping updated successfully',
      assetMapping: updatedMapping,
    });
  } catch (error) {
    logger.error('api', 'Error updating asset mapping:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update asset mapping' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin privileges
    // Skip admin check for now - role not available in session

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    await cmmsIntegrationService.deleteAssetMapping(id);

    return NextResponse.json({
      message: 'Asset mapping deleted successfully',
      id,
    });
  } catch (error) {
    logger.error('api', 'Error deleting asset mapping:', error );
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete asset mapping' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vibeluxEquipmentId = searchParams.get('vibeluxEquipmentId');
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('isActive');

    // Get asset mappings from database
    const assetMappings = await getAssetMappings({
      vibeluxEquipmentId,
      platform,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    return NextResponse.json({
      assetMappings,
    });
  } catch (error) {
    logger.error('api', 'Error fetching asset mappings:', error );
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch asset mappings' },
      { status: 500 }
    );
  }
}

// Auto-mapping endpoint
export async function POST_AUTO_MAP(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin privileges
    // Skip admin check for now - role not available in session

    const body = await request.json();
    const { cmmsId } = AutoMapRequest.parse(body);

    const mappings = await cmmsIntegrationService.autoMapAssets(cmmsId);

    return NextResponse.json({
      message: 'Auto-mapping completed successfully',
      mappings,
      count: mappings.length,
    });
  } catch (error) {
    logger.error('api', 'Error auto-mapping assets:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auto-mapping failed' },
      { status: 500 }
    );
  }
}

// Helper function to get asset mappings from database
async function getAssetMappings(params: {
  vibeluxEquipmentId?: string | null;
  platform?: string | null;
  isActive?: boolean;
}) {
  // This would typically fetch from your database
  // For now, returning empty array as placeholder
  return [];
}