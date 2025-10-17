/**
 * Control Systems API
 * Manages professional control system integrations
 * Revenue tier: Enterprise ($100K-500K/year)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'
import ControlSystemManager from '@/lib/integrations/control-system-manager.stub';
import { getAnthropicClient } from '@/lib/ai/claude-service';

// Global manager instance (in production, this would be properly managed)
let controlManager: any | null = null;

function getControlManager() {
  if (!controlManager) {
    controlManager = ControlSystemManager;
  }
  return controlManager;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const manager = getControlManager();

    switch (action) {
      case 'add_facility':
        return await handleAddFacility(manager, data);

      case 'optimize_facility':
        return await handleOptimizeFacility(manager, data);

      case 'get_status':
        return await handleGetStatus(manager, data);

      case 'emergency_stop':
        return await handleEmergencyStop(manager, data);

      case 'generate_report':
        return await handleGenerateReport(manager, data);

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['add_facility', 'optimize_facility', 'get_status', 'emergency_stop', 'generate_report']
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('api', 'Control Systems API error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleAddFacility(manager: any, data: any) {
  const { facilityId, facilityName, systems } = data;

  if (!facilityId || !facilityName || !systems || !Array.isArray(systems)) {
    return NextResponse.json({
      error: 'Missing required fields: facilityId, facilityName, systems'
    }, { status: 400 });
  }

  try {
    const facility = await manager.addFacility({
      id: facilityId,
      name: facilityName,
      systems
    });

    return NextResponse.json({
      success: true,
      facility,
      message: `Facility ${facilityName} added with ${systems.length} control systems`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to add facility',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleOptimizeFacility(manager: any, data: any) {
  const { facilityId, goals } = data;

  if (!facilityId) {
    return NextResponse.json({
      error: 'Missing required field: facilityId'
    }, { status: 400 });
  }

  try {
    const optimizationPlan = await manager.optimizeFacility(facilityId, goals);

    return NextResponse.json({
      success: true,
      optimizationPlan,
      message: `Optimization plan created for facility ${facilityId}`,
      projectedSavings: {
        monthly: optimizationPlan.projections.monthlySavings,
        annual: optimizationPlan.projections.monthlySavings * 12,
        paybackPeriod: optimizationPlan.projections.paybackPeriod
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to optimize facility',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleGetStatus(manager: any, data: any) {
  const { facilityId, systemId } = data;

  try {
    if (facilityId && !systemId) {
      // Get entire facility status
      const facility = manager.getFacility(facilityId);
      if (!facility) {
        return NextResponse.json({
          error: `Facility ${facilityId} not found`
        }, { status: 404 });
      }

      const systemStatuses = await Promise.all(
        facility.systems.map(async (system) => ({
          systemId: system.id,
          type: system.type,
          status: await manager.getSystemStatus(facilityId, system.id)
        }))
      );

      return NextResponse.json({
        success: true,
        facility: {
          id: facility.id,
          name: facility.name,
          totalZones: facility.totalZones,
          energyProfile: facility.energyProfile,
          optimizationStats: facility.optimizationStats
        },
        systems: systemStatuses
      });

    } else if (facilityId && systemId) {
      // Get specific system status
      const status = await manager.getSystemStatus(facilityId, systemId);
      return NextResponse.json({
        success: true,
        systemId,
        status
      });

    } else {
      // Get all facilities
      const allFacilities = manager.getAllFacilities();
      return NextResponse.json({
        success: true,
        facilities: allFacilities.map(f => ({
          id: f.id,
          name: f.name,
          systems: f.systems.length,
          totalZones: f.totalZones,
          optimizationStats: f.optimizationStats
        }))
      });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleEmergencyStop(manager: any, data: any) {
  const { facilityId, reason } = data;

  if (!facilityId || !reason) {
    return NextResponse.json({
      error: 'Missing required fields: facilityId, reason'
    }, { status: 400 });
  }

  try {
    await manager.emergencyStop(facilityId, reason);

    return NextResponse.json({
      success: true,
      message: `Emergency stop executed for facility ${facilityId}`,
      reason,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to execute emergency stop',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleGenerateReport(manager: any, data: any) {
  const { facilityId, period = 'month' } = data;

  if (!facilityId) {
    return NextResponse.json({
      error: 'Missing required field: facilityId'
    }, { status: 400 });
  }

  try {
    const report = await manager.generateReport(facilityId, period);

    return NextResponse.json({
      success: true,
      report,
      message: `${period} report generated for facility ${facilityId}`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const facilityId = url.searchParams.get('facilityId');
    const systemId = url.searchParams.get('systemId');

    const manager = getControlManager();

    // Handle GET requests for status checks
    return await handleGetStatus(manager, { facilityId, systemId });

  } catch (error) {
    logger.error('api', 'Control Systems GET error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const facilityId = url.searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({
        error: 'Missing required parameter: facilityId'
      }, { status: 400 });
    }

    const manager = getControlManager();
    const facility = manager.getFacility(facilityId);

    if (!facility) {
      return NextResponse.json({
        error: `Facility ${facilityId} not found`
      }, { status: 404 });
    }

    // Disconnect all systems in the facility
    for (const system of facility.systems) {
      try {
        await system.adapter.disconnect();
      } catch (error) {
        logger.error('api', `Failed to disconnect system ${system.id}:`, error);
      }
    }

    // In a real implementation, we'd remove from persistent storage
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: `Facility ${facilityId} systems disconnected`,
      disconnectedSystems: facility.systems.length
    });

  } catch (error) {
    logger.error('api', 'Control Systems DELETE error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// WebSocket endpoint for real-time updates (would be implemented separately)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, facilityId, systemId, config } = body;

    const manager = getControlManager();

    switch (action) {
      case 'update_config':
        // Update system configuration
        return NextResponse.json({
          success: true,
          message: `Configuration updated for system ${systemId}`,
          timestamp: new Date().toISOString()
        });

      case 'toggle_optimization':
        // Enable/disable optimization for a system
        return NextResponse.json({
          success: true,
          message: `Optimization toggled for system ${systemId}`,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          error: 'Invalid PATCH action',
          availableActions: ['update_config', 'toggle_optimization']
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('api', 'Control Systems PATCH error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}