import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { energySystemStartup } from '@/services/energy-system-startup';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'd implement this check)
    // const isAdmin = await checkUserIsAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    // Check if system is already running
    const status = energySystemStartup.getStatus();
    if (status.initialized) {
      return NextResponse.json({ 
        message: 'Energy system already running',
        status 
      });
    }

    // Initialize the energy system
    await energySystemStartup.initialize();

    // Log the startup (using logger since energy_system_alerts model doesn't exist)
    logger.info('api', 'Energy System Started', {
      userId,
      timestamp: new Date(),
      action: 'system_startup'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Energy optimization system started successfully',
      status: energySystemStartup.getStatus()
    });

  } catch (error: any) {
    logger.error('api', 'Failed to start energy system:', error );
    return NextResponse.json(
      { error: error.message || 'Failed to start energy system' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = energySystemStartup.getStatus();
    
    // Mock system stats since energy_system_alerts model doesn't exist
    const stats = {
      _count: {
        _all: 0
      }
    };

    // Mock counts since models don't exist yet
    const activeConfigs = 0;
    const recentOptimizations = 0;

    return NextResponse.json({
      ...status,
      stats: {
        alertsLast24h: stats._count._all,
        activeConfigs,
        optimizationsLastHour: recentOptimizations
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to get energy system status:', error );
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}