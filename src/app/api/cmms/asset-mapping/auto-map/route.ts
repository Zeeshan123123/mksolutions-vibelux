import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
export const dynamic = 'force-dynamic'

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