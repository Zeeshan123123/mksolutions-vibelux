import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { cmmsIntegrationService, CMMSConfigSchema } from '@/lib/cmms-integration-service';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';

const CreateConfigRequest = z.object({
  id: z.string().min(1),
  config: CMMSConfigSchema,
});

const UpdateConfigRequest = z.object({
  id: z.string().min(1),
  config: CMMSConfigSchema,
});

const DeleteConfigRequest = z.object({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    // Replace this with your actual authorization logic
    // TODO: Check admin role - not available in session
    // Skip admin check for now 
    if (false) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all CMMS configurations (without sensitive data)
    const configs = await getCMMSConfigurations();
    
    return NextResponse.json({ configs });
  } catch (error) {
    logger.error('api', 'Error fetching CMMS configurations:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Admin privilege check would be implemented with proper user role management

    const body = await request.json();
    const { id, config } = CreateConfigRequest.parse(body);

    await cmmsIntegrationService.addCMMSConfig(id, config);

    return NextResponse.json({ 
      message: 'CMMS configuration added successfully',
      id 
    });
  } catch (error) {
    logger.error('api', 'Error adding CMMS configuration:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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

    // Note: Admin privilege check would be implemented with proper user role management

    const body = await request.json();
    const { id, config } = UpdateConfigRequest.parse(body);

    await cmmsIntegrationService.updateCMMSConfig(id, config);

    return NextResponse.json({ 
      message: 'CMMS configuration updated successfully',
      id 
    });
  } catch (error) {
    logger.error('api', 'Error updating CMMS configuration:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Admin privilege check would be implemented with proper user role management

    const body = await request.json();
    const { id } = DeleteConfigRequest.parse(body);

    await cmmsIntegrationService.removeCMMSConfig(id);

    return NextResponse.json({ 
      message: 'CMMS configuration deleted successfully',
      id 
    });
  } catch (error) {
    logger.error('api', 'Error deleting CMMS configuration:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get configurations from database
async function getCMMSConfigurations() {
  // This would typically fetch from your database
  // For now, returning empty array as placeholder
  return [];
}