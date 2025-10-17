import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { rateLimitApiKeyManagement } from '../../middleware';
import { logger } from '@/lib/logging/production-logger';

// POST - Regenerate an API key
export async function POST(
  req: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitApiKeyManagement(req);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId } = params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the existing API key
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
        revokedAt: null
      }
    });

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Generate new API key
    const environment = existingKey.name.toLowerCase().includes('production') ? 'live' : 'test';
    const rawKey = `vb_${environment}_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 8);

    // Update the API key with new hash
    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        keyHash,
        prefix,
        // Reset usage count for regenerated key
        usageCount: 0,
        lastUsedAt: null
      }
    });

    return NextResponse.json({
      id: updatedKey.id,
      name: updatedKey.name,
      key: rawKey, // Only returned once
      keyPreview: `${prefix}...`,
      permissions: updatedKey.permissions,
      rateLimit: updatedKey.rateLimit,
      environment: environment === 'live' ? 'production' : 'development',
      createdAt: updatedKey.createdAt,
      expiresAt: updatedKey.expiresAt,
      status: 'active',
      usage: {
        today: 0,
        thisMonth: 0,
        total: 0
      },
      message: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    logger.error('api', 'Error regenerating API key:', error );
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
      { status: 500 }
    );
  }
}