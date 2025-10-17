// Admin API for managing system updates and feature rollouts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { UpdateManager } from '@/lib/update-manager';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

// Validation schemas
const createUpdateSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['feature', 'improvement', 'bugfix', 'security', 'breaking']),
  severity: z.enum(['minor', 'major', 'critical']),
  affectedPlans: z.array(z.string()),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  scheduledFor: z.string().datetime().optional(),
  features: z.object({
    added: z.array(z.string()).default([]),
    changed: z.array(z.string()).default([]),
    deprecated: z.array(z.string()).default([]),
    removed: z.array(z.string()).default([])
  }).default({})
});

const updateRolloutSchema = z.object({
  featureName: z.string().min(1),
  rolloutPercentage: z.number().min(0).max(100)
});

// POST /api/admin/updates - Create and deploy a new update
export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated, userId, error } = await authenticateRequest(request);

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper role checking for super admin
    // For now we'll skip role check since authenticateRequest doesn't return role

    const body = await request.json();
    const validationResult = createUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid update data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Create the update
    const update = {
      id: `update-${Date.now()}`,
      version: updateData.version,
      title: updateData.title,
      description: updateData.description,
      type: updateData.type,
      severity: updateData.severity,
      affectedPlans: updateData.affectedPlans,
      rolloutPercentage: updateData.rolloutPercentage,
      scheduledFor: updateData.scheduledFor ? new Date(updateData.scheduledFor) : new Date(),
      features: updateData.features
    };

    // Deploy the update
    await UpdateManager.deployUpdate(update);

    // TODO: Fix audit log schema - commenting out temporarily
    // await prisma.auditLog.create({
    //   data: {
    //     userId: userId,
    //     action: 'UPDATE_DEPLOYED',
    //     resourceType: 'system_update',
    //     resourceId: update.id,
    //     metadata: {
    //       version: update.version,
    //       type: update.type,
    //       severity: update.severity,
    //       rolloutPercentage: update.rolloutPercentage
    //     },
    //     createdAt: new Date()
    //   }
    // });

    return NextResponse.json({
      success: true,
      update: {
        id: update.id,
        version: update.version,
        rolloutPercentage: update.rolloutPercentage
      },
      message: 'Update deployed successfully'
    });

  } catch (error) {
    logger.error('api', 'Update deployment error:', error );
    return NextResponse.json(
      { error: 'Failed to deploy update' },
      { status: 500 }
    );
  }
}

// GET /api/admin/updates - List all updates
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, userId, error } = await authenticateRequest(request);

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper role checking
    // For now we'll skip role check since authenticateRequest doesn't return role

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (severity) whereClause.severity = severity;

    const updates = await prisma.systemUpdate.findMany({
      where: whereClause,
      orderBy: { releasedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            affectedUsers: true
          }
        }
      }
    });

    const total = await prisma.systemUpdate.count({ where: whereClause });

    return NextResponse.json({
      updates,
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    logger.error('api', 'Updates listing error:', error );
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/updates/rollout - Update rollout percentage
export async function PATCH(request: NextRequest) {
  try {
    const { isAuthenticated, userId, error } = await authenticateRequest(request);

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper role checking for super admin

    const body = await request.json();
    const validationResult = updateRolloutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid rollout data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { featureName, rolloutPercentage } = validationResult.data;

    // Update the rollout
    await UpdateManager.increaseRollout(featureName, rolloutPercentage);

    // TODO: Fix audit log schema - commenting out temporarily
    // await prisma.auditLog.create({
    //   data: {
    //     userId: userId,
    //     action: 'ROLLOUT_UPDATED',
    //     resourceType: 'feature_flag',
    //     resourceId: featureName,
    //     metadata: {
    //       featureName,
    //       newRolloutPercentage: rolloutPercentage
    //     },
    //     createdAt: new Date()
    //   }
    // });

    return NextResponse.json({
      success: true,
      featureName,
      rolloutPercentage,
      message: 'Rollout percentage updated successfully'
    });

  } catch (error) {
    logger.error('api', 'Rollout update error:', error );
    return NextResponse.json(
      { error: 'Failed to update rollout' },
      { status: 500 }
    );
  }
}