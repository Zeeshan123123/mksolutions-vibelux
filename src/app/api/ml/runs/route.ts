import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const runs = await prisma.modelTrainingRun.findMany({ orderBy: { startedAt: 'desc' }, include: { model: true, dataset: true } });
  return NextResponse.json({ runs });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const run = await prisma.modelTrainingRun.create({ data: { modelId: body.modelId, datasetId: body.datasetId || null, status: 'running' } });
  return NextResponse.json({ run });
}


