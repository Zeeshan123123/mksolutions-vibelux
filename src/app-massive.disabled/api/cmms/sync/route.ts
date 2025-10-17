import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';

const SyncRequest = z.object({
  id: z.string().min(1),
  syncType: z.enum(['full', 'incremental']).default('incremental'),
});

const GetSyncStatusRequest = z.object({
  id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Admin privilege check would be implemented with proper user role management

    const body = await request.json();
    const { id, syncType } = SyncRequest.parse(body);

    // Start sync operation (this should be run asynchronously in production)
    const syncStatus = await cmmsIntegrationService.syncData(id, syncType);

    return NextResponse.json({
      message: 'Sync operation completed',
      syncStatus,
    });
  } catch (error) {
    logger.error('api', 'Error starting CMMS sync:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync operation failed' },
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

    // Note: Admin privilege check would be implemented with proper user role management

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    // Get sync status from database
    const syncHistory = await getSyncHistory(id);
    const latestSync = syncHistory[0];

    return NextResponse.json({
      id,
      latestSync,
      syncHistory,
    });
  } catch (error) {
    logger.error('api', 'Error fetching sync status:', error );
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}

// Helper function to get sync history from database
async function getSyncHistory(id: string) {
  // This would typically fetch from your database
  // For now, returning empty array as placeholder
  return [];
}