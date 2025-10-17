import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/auth/access-control';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sub = await getUserSubscription(userId);
    if (!sub) {
      return NextResponse.json({
        tier: 'free',
        status: 'none',
        features: {},
        limits: { projects: 1, zones: 3, fixtures: 50 },
      });
    }

    return NextResponse.json({
      tier: sub.tier,
      status: sub.status,
      features: Object.fromEntries((sub.modules || []).map((m) => [m, true])),
      limits: sub.limits,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}