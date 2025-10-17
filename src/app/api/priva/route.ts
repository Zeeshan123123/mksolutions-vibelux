/**
 * Priva Integration API Routes
 * Handles Priva configuration, data fetching, and control commands
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic'
import { privaConfig } from '@/lib/integrations/priva/priva-config-service';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'config':
        // Get user's Priva configuration
        const config = await privaConfig.loadConfiguration(userId);
        return NextResponse.json({ config });

      case 'realtime':
        // Get real-time data for a compartment
        const compartmentId = searchParams.get('compartmentId');
        if (!compartmentId) {
          return NextResponse.json(
            { error: 'Compartment ID required' },
            { status: 400 }
          );
        }

        const userConfig = await privaConfig.loadConfiguration(userId);
        if (!userConfig) {
          return NextResponse.json(
            { error: 'No Priva configuration found' },
            { status: 404 }
          );
        }

        const realtimeData = await privaConfig.getRealtimeData(userConfig, compartmentId);
        return NextResponse.json({ data: realtimeData });

      case 'historical':
        // Get historical data
        const compartmentIdHist = searchParams.get('compartmentId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const resolution = searchParams.get('resolution') as 'minute' | 'hour' | 'day' || 'hour';

        if (!compartmentIdHist || !startDate || !endDate) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        const configHist = await privaConfig.loadConfiguration(userId);
        if (!configHist) {
          return NextResponse.json(
            { error: 'No Priva configuration found' },
            { status: 404 }
          );
        }

        const historicalData = await privaConfig.getHistoricalData(
          configHist,
          compartmentIdHist,
          new Date(startDate),
          new Date(endDate),
          resolution
        );

        return NextResponse.json({ data: historicalData });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Priva API error:', error);
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'saveConfig':
        // Save Priva configuration
        const { credentials, isDemo } = body;
        const savedConfig = await privaConfig.saveConfiguration(
          userId,
          credentials,
          isDemo
        );

        return NextResponse.json({
          success: true,
          config: savedConfig
        });

      case 'testConnection':
        // Test Priva connection
        const testConfig = await privaConfig.loadConfiguration(userId);
        if (!testConfig) {
          return NextResponse.json(
            { error: 'No configuration found' },
            { status: 404 }
          );
        }

        const success = await privaConfig.testConnection(testConfig);
        return NextResponse.json({
          success,
          status: testConfig.connectionStatus,
          error: testConfig.lastError
        });

      case 'updateSetpoint':
        // Update a setpoint in Priva
        const { compartmentId, parameter, value } = body;

        if (!compartmentId || !parameter || value === undefined) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        const updateConfig = await privaConfig.loadConfiguration(userId);
        if (!updateConfig) {
          return NextResponse.json(
            { error: 'No configuration found' },
            { status: 404 }
          );
        }

        const updated = await privaConfig.updateSetpoint(
          updateConfig,
          compartmentId,
          parameter,
          value
        );

        return NextResponse.json({
          success: updated,
          message: updated ? 'Setpoint updated' : 'Failed to update setpoint'
        });

      case 'startPolling':
        // Start polling for real-time data
        const { compartmentId: pollCompartment, interval } = body;

        if (!pollCompartment) {
          return NextResponse.json(
            { error: 'Compartment ID required' },
            { status: 400 }
          );
        }

        const pollConfig = await privaConfig.loadConfiguration(userId);
        if (!pollConfig) {
          return NextResponse.json(
            { error: 'No configuration found' },
            { status: 404 }
          );
        }

        privaConfig.startPolling(pollConfig, pollCompartment, interval || 30000);

        return NextResponse.json({
          success: true,
          message: 'Polling started'
        });

      case 'stopPolling':
        // Stop polling
        privaConfig.stopPolling();

        return NextResponse.json({
          success: true,
          message: 'Polling stopped'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Priva API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { credentials, isDemo } = body;

    // Update existing configuration
    const updatedConfig = await privaConfig.saveConfiguration(
      userId,
      credentials,
      isDemo
    );

    return NextResponse.json({
      success: true,
      config: updatedConfig
    });

  } catch (error) {
    logger.error('Priva API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Stop any active polling
    privaConfig.stopPolling();

    // Delete configuration from database
    await prisma.privaConfiguration.delete({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted'
    });

  } catch (error) {
    logger.error('Priva API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}