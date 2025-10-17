import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { auditLog } from '@/lib/audit-log';
import { withRateLimit } from '@/lib/rate-limit';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting - TODO: implement proper rate limiting

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get facilities that the user has access to
    const facilities = await prisma.facility.findMany({
      where: {
        OR: [
          {
            users: {
              some: {
                userId: userId,
              },
            },
          },
          {
            ownerId: userId,
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        size: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Log data access
    await auditLog.logDataAccess(
      userId,
      'facilities',
      'list',
      'view'
    );

    return NextResponse.json(facilities);
  } catch (error) {
    // Error handling for facilities fetching
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}