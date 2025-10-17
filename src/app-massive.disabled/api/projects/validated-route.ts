import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import {
  withValidation,
  withAuth,
  withRateLimit,
  withSecurityHeaders
} from '@/lib/validation/middleware';
import { projectCreateSchema } from '@/lib/validation/schemas/project';
import { paginationSchema } from '@/lib/validation/schemas/common';

// GET /api/projects - List user's projects with pagination
async function getHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const { page, limit, sortBy, sortOrder } = (req as any).validated.query;

    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.project.count({
      where: { ownerId: user.id }
    });

    // Get paginated projects
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: {
        spaces: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        experiments: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            spaces: true,
            experiments: true,
            savedDesigns: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('api', 'Error fetching projects:', error );
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
async function postHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const validatedData = (req as any).validated.body;

    // Check subscription limits
    const projectCount = await prisma.project.count({
      where: { ownerId: user.id }
    });

    const limits = {
      FREE: 1,
      BASIC: 5,
      PRO: 20,
      ENTERPRISE: -1 // Unlimited
    };

    const limit = limits[user.subscriptionTier as keyof typeof limits] || 1;
    
    if (limit !== -1 && projectCount >= limit) {
      return NextResponse.json(
        {
          error: 'Project limit reached',
          message: `Your ${user.subscriptionTier} plan allows only ${limit} project(s). Please upgrade to create more projects.`
        },
        { status: 403 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log project creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'project_created',
        entityType: 'project',
        entityId: project.id,
        details: {
          projectName: project.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      project,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    logger.error('api', 'Error creating project:', error );
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A project with this name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// Export routes with middleware
export const GET = withSecurityHeaders(
  withRateLimit(
    withAuth(
      withValidation(getHandler, {
        query: paginationSchema
      }),
      { requireAuth: true }
    ),
    { max: 100, windowMs: 60000 }
  )
);

export const POST = withSecurityHeaders(
  withRateLimit(
    withAuth(
      withValidation(postHandler, {
        body: projectCreateSchema
      }),
      { requireAuth: true }
    ),
    { max: 20, windowMs: 60000 }
  )
);