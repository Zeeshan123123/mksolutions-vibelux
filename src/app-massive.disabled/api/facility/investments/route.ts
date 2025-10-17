import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Validation schema for creating investment opportunity
const createInvestmentSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['EXPANSION', 'EQUIPMENT', 'TECHNOLOGY', 'OPERATIONS', 'RESEARCH']),
  description: z.string().min(1).max(1000),
  minInvestment: z.number().positive(),
  maxInvestment: z.number().positive(),
  targetAmount: z.number().positive(),
  expectedReturn: z.number().positive().max(100),
  duration: z.number().positive(), // months
  paymentSchedule: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'AT_MATURITY']),
  documents: z.any().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// GET /api/facility/investments - Get facility's investment opportunities
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get facility ID from user
    const facility = await db.facilities.findByUserId(userId);
    
    if (!facility) {
      return NextResponse.json({ error: 'No facility found for user' }, { status: 404 });
    }
    
    // Get all investment opportunities for the facility
    const opportunities = await db.investments.findOpportunities(facility.id);
    
    // Format the response with calculated fields
    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      facilityId: opp.facilityId,
      title: opp.title,
      type: opp.type,
      status: opp.status,
      created: opp.createdAt,
      targetAmount: opp.targetAmount,
      raisedAmount: opp.currentAmount,
      investors: opp.investments.length,
      documents: opp.documents ? (Array.isArray(opp.documents) ? opp.documents.length : 0) : 0,
      lastUpdate: opp.updatedAt,
      closingDate: opp.endDate,
      description: opp.description,
      minInvestment: opp.minInvestment,
      maxInvestment: opp.maxInvestment,
      expectedReturn: opp.expectedReturn,
      duration: opp.duration,
      paymentSchedule: opp.paymentSchedule,
    }));
    
    return NextResponse.json({ opportunities: formattedOpportunities });
  } catch (error) {
    logger.error('api', 'Error fetching facility investments:', error );
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

// POST /api/facility/investments - Create new investment opportunity
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Implement facility role checking
    const facilityId = 'facility-1'; // TODO: Get from user context
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = createInvestmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Create investment opportunity in database
    const opportunity = await db.investments.createOpportunity({
      facilityId: facilityId!,
      title: data.title,
      description: data.description,
      type: data.type,
      minInvestment: data.minInvestment,
      maxInvestment: data.maxInvestment,
      targetAmount: data.targetAmount,
      expectedReturn: data.expectedReturn,
      duration: data.duration,
      paymentSchedule: data.paymentSchedule,
      documents: data.documents,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    
    return NextResponse.json({ 
      opportunity: {
        ...opportunity,
        raisedAmount: 0,
        investors: 0,
        documents: data.documents ? (Array.isArray(data.documents) ? data.documents.length : 0) : 0,
      }
    });
  } catch (error) {
    logger.error('api', 'Error creating investment opportunity:', error );
    return NextResponse.json(
      { error: 'Failed to create investment opportunity' },
      { status: 500 }
    );
  }
}

// PUT /api/facility/investments/[id] - Update investment opportunity
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Investment ID required' }, { status: 400 });
    }
    
    const body = await req.json();
    
    // Get the opportunity to verify ownership
    const opportunity = await db.investments.findOpportunityById(id);
    
    if (!opportunity) {
      return NextResponse.json({ error: 'Investment opportunity not found' }, { status: 404 });
    }
    
    // Verify user has permission to update
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: opportunity.facilityId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update investment' },
        { status: 403 }
      );
    }
    
    // Validate that opportunity can be updated (only draft and active can be modified)
    if (!['DRAFT', 'ACTIVE'].includes(opportunity.status)) {
      return NextResponse.json(
        { error: 'Cannot update investment in current status' },
        { status: 400 }
      );
    }
    
    // Update in database
    const updated = await db.investments.updateOpportunity(id, body);
    
    return NextResponse.json({ 
      message: 'Investment opportunity updated',
      opportunity: updated
    });
  } catch (error) {
    logger.error('api', 'Error updating investment opportunity:', error );
    return NextResponse.json(
      { error: 'Failed to update investment opportunity' },
      { status: 500 }
    );
  }
}

// DELETE /api/facility/investments/[id] - Delete draft investment opportunity
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Investment ID required' }, { status: 400 });
    }
    
    // Get the opportunity to verify ownership and status
    const opportunity = await db.investments.findOpportunityById(id);
    
    if (!opportunity) {
      return NextResponse.json({ error: 'Investment opportunity not found' }, { status: 404 });
    }
    
    // Verify user has permission to delete
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: opportunity.facilityId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete investment' },
        { status: 403 }
      );
    }
    
    // Only allow deletion of draft opportunities
    if (opportunity.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft investment opportunities' },
        { status: 400 }
      );
    }
    
    // Check if there are any investments
    if (opportunity.investments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete opportunity with existing investments' },
        { status: 400 }
      );
    }
    
    // Delete from database
    await db.investments.deleteOpportunity(id);
    
    return NextResponse.json({ 
      message: 'Investment opportunity deleted',
      id 
    });
  } catch (error) {
    logger.error('api', 'Error deleting investment opportunity:', error );
    return NextResponse.json(
      { error: 'Failed to delete investment opportunity' },
      { status: 500 }
    );
  }
}