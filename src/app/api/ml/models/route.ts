import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const models = await prisma.modelRegistry.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ models });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const model = await prisma.modelRegistry.create({ data: { name: body.name, version: body.version || 'v1', type: body.type || 'generic', status: body.status || 'ready', metrics: body.metrics || {} } });
  return NextResponse.json({ model });
}


