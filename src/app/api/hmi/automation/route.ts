import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facilityId = req.nextUrl.searchParams.get('facilityId')
  if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
  const rules = await prisma.hMIAutomationRule.findMany({ where: { facilityId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, facilityId, name, enabled = true, conditions = {}, actions = {} } = body || {}
  if (!facilityId || !name) return NextResponse.json({ error: 'facilityId and name required' }, { status: 400 })
  const rule = await prisma.hMIAutomationRule.upsert({
    where: { id: id || '' },
    create: { facilityId, name, enabled, conditions, actions },
    update: { name, enabled, conditions, actions },
  })
  return NextResponse.json(rule)
}

