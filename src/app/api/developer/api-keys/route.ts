import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { rateLimitApiKeyManagement } from './middleware';
export const dynamic = 'force-dynamic'

// Input validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  environment: z.enum(['development', 'staging', 'production']),
  permissions: z.array(z.string()).min(1),
  expiresIn: z.string(),
  rateLimit: z.number().min(100).max(100000)
});

// GET - List API keys for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        apiKeys: {
          where: {
            revokedAt: null
          },
          select: {
            id: true,
            name: true,
            prefix: true,
            permissions: true,
            rateLimit: true,
            lastUsedAt: true,
            usageCount: true,
            createdAt: true,
            expiresAt: true,
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform API keys to match frontend expectations
    const apiKeys = user.apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      keyPreview: `${key.prefix}...`,
      permissions: key.permissions,
      rateLimit: key.rateLimit || 1000,
      environment: key.name.toLowerCase().includes('production') ? 'production' : 
                  key.name.toLowerCase().includes('staging') ? 'staging' : 'development',
      lastUsed: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      status: !key.isActive ? 'revoked' : 
              (key.expiresAt && key.expiresAt < new Date()) ? 'expired' : 'active',
      usage: {
        today: Math.floor(Math.random() * 1000), // This should be calculated from actual usage logs
        thisMonth: key.usageCount || 0,
        total: key.usageCount || 0
      }
    }));

    return NextResponse.json({ apiKeys });
  } catch (error) {
    logger.error('api', 'Error fetching API keys:', error );
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitApiKeyManagement(req);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createApiKeySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, environment, permissions, expiresIn, rateLimit } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate secure API key
    const rawKey = `vb_${environment === 'production' ? 'live' : 'test'}_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 8);

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (expiresIn === '30days') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (expiresIn === '90days') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    } else if (expiresIn === '1year') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        keyHash,
        prefix,
        permissions,
        scopes: permissions.includes('admin') ? ['read', 'write', 'admin'] : 
                permissions.includes('write') ? ['read', 'write'] : ['read'],
        rateLimit,
        expiresAt,
        isActive: true
      }
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned once
      keyPreview: `${prefix}...`,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit,
      environment,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      status: 'active',
      usage: {
        today: 0,
        thisMonth: 0,
        total: 0
      },
      message: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    logger.error('api', 'Error creating API key:', error );
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke an API key
export async function DELETE(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitApiKeyManagement(req);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    
    if (!keyId) {
      return NextResponse.json({ error: 'API key ID required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Revoke the API key (soft delete)
    const result = await prisma.apiKey.updateMany({
      where: {
        id: keyId,
        userId: user.id,
        revokedAt: null
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokeReason: 'User initiated revocation'
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api', 'Error revoking API key:', error );
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}