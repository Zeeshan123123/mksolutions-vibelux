import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import crypto from 'crypto';

export async function apiAuthMiddleware(req: NextRequest) {
  // Check for API key in headers
  const apiKey = req.headers.get('x-api-key');
  
  if (apiKey) {
    // Validate API key using timing-safe comparison
    const secretKey = process.env.API_SECRET_KEY;
    if (secretKey && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(secretKey))) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Fall back to user authentication
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// Validate API key and return user/app details
export async function validateAPIKey(apiKey: string): Promise<{ valid: boolean; userId?: string; appId?: string }> {
  if (!apiKey) {
    return { valid: false };
  }

  try {
    // In production, this would check against a database of API keys
    // For now, we'll do a secure timing-safe check
    const secretKey = process.env.API_SECRET_KEY;
    if (secretKey && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(secretKey))) {
      return { valid: true, appId: 'system' };
    }

    // Check database for API key
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (apiKeyRecord && apiKeyRecord.active) {
      return { 
        valid: true, 
        userId: apiKeyRecord.userId,
        appId: apiKeyRecord.id 
      };
    }

    return { valid: false };
  } catch (error) {
    logger.error('api', 'API key validation error:', error );
    return { valid: false };
  }
}

// Track API usage for rate limiting and analytics
export async function trackAPIUsage(apiKey: string, endpoint: string, method: string): Promise<void> {
  try {
    await prisma.apiUsage.create({
      data: {
        apiKey,
        endpoint,
        method,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('api', 'Failed to track API usage:', error );
  }
}

// Generate standardized error response
export function generateErrorResponse(error: string, status: number = 400, details?: any) {
  return NextResponse.json({
    error,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }, { status });
}

// Generate standardized API response
export function generateAPIResponse(data: any, meta?: any) {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(meta && { meta })
  });
}