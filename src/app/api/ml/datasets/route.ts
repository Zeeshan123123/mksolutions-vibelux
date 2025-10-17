import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const datasets = await prisma.dataset.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ datasets });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const dataset = await prisma.dataset.create({ data: { name: body.name, description: body.description, source: body.source } });
  return NextResponse.json({ dataset });
}


