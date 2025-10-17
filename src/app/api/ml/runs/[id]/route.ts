import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// PATCH: update run status/metrics
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const data: any = {};
  if (typeof body.status === 'string') data.status = body.status;
  if (body.metrics) data.metrics = body.metrics;
  if (body.status === 'completed' || body.status === 'failed') data.finishedAt = new Date();
  const run = await prisma.modelTrainingRun.update({ where: { id: params.id }, data });
  return NextResponse.json({ run });
}


