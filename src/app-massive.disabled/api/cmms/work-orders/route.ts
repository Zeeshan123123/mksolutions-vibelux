import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';

const CreateWorkOrderRequest = z.object({
  cmmsId: z.string().min(1),
  workOrder: z.object({
    number: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    assetId: z.string().min(1),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().positive().optional(),
    location: z.string().optional(),
    workType: z.enum(['preventive', 'corrective', 'predictive', 'emergency']),
    notes: z.string().optional(),
  }),
});

const UpdateWorkOrderRequest = z.object({
  cmmsId: z.string().min(1),
  workOrderId: z.string().min(1),
  updates: z.object({
    status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
    assignedTo: z.string().optional(),
    actualHours: z.number().positive().optional(),
    completedAt: z.string().optional(),
    notes: z.string().optional(),
    cost: z.number().positive().optional(),
  }),
});

const GetWorkOrdersRequest = z.object({
  cmmsId: z.string().min(1),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
  assetId: z.string().optional(),
  assignedTo: z.string().optional(),
  workType: z.enum(['preventive', 'corrective', 'predictive', 'emergency']).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cmmsId, workOrder } = CreateWorkOrderRequest.parse(body);

    const newWorkOrder = await cmmsIntegrationService.createWorkOrder(cmmsId, {
      ...workOrder,
      status: 'open',
      dueDate: workOrder.dueDate ? new Date(workOrder.dueDate) : undefined,
    });

    return NextResponse.json({
      message: 'Work order created successfully',
      workOrder: newWorkOrder,
    });
  } catch (error) {
    logger.error('api', 'Error creating work order:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create work order' },
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

    const body = await request.json();
    const { cmmsId, workOrderId, updates } = UpdateWorkOrderRequest.parse(body);

    const processedUpdates = {
      ...updates,
      completedAt: updates.completedAt ? new Date(updates.completedAt) : undefined,
    };

    const updatedWorkOrder = await cmmsIntegrationService.updateWorkOrder(
      cmmsId,
      workOrderId,
      processedUpdates
    );

    return NextResponse.json({
      message: 'Work order updated successfully',
      workOrder: updatedWorkOrder,
    });
  } catch (error) {
    logger.error('api', 'Error updating work order:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update work order' },
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
    const params = {
      cmmsId: searchParams.get('cmmsId') || '',
      status: searchParams.get('status') as any,
      assetId: searchParams.get('assetId') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      workType: searchParams.get('workType') as any,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const { cmmsId, status, assetId, assignedTo, workType, page, limit } = 
      GetWorkOrdersRequest.parse(params);

    // Get work orders from database
    const workOrders = await getWorkOrders({
      cmmsId,
      status,
      assetId,
      assignedTo,
      workType,
      page,
      limit,
    });

    return NextResponse.json({
      workOrders: workOrders.data,
      pagination: {
        page,
        limit,
        total: workOrders.total,
        totalPages: Math.ceil(workOrders.total / limit),
      },
    });
  } catch (error) {
    logger.error('api', 'Error fetching work orders:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch work orders' },
      { status: 500 }
    );
  }
}

// Helper function to get work orders from database
async function getWorkOrders(params: {
  cmmsId: string;
  status?: string;
  assetId?: string;
  assignedTo?: string;
  workType?: string;
  page: number;
  limit: number;
}) {
  // This would typically fetch from your database
  // For now, returning empty results as placeholder
  return {
    data: [],
    total: 0,
  };
}