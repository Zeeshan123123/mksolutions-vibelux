import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
export const dynamic = 'force-dynamic'

const TestConnectionRequest = z.object({
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
    const { id } = TestConnectionRequest.parse(body);

    const startTime = Date.now();
    const isConnected = await cmmsIntegrationService.testConnection(id);
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      id,
      connected: isConnected,
      responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('api', 'Error testing CMMS connection:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Connection test failed',
        connected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}