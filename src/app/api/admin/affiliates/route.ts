import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/affiliate-queries';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin permission check
    // const isAdmin = await checkAdminPermission(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const affiliates = await db.affiliates.list({
      status: status as any,
      tier: tier as any,
      search,
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json(affiliates);
  } catch (error) {
    logger.error('api', 'Failed to fetch affiliates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}