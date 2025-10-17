import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/budgets?facilityId=...&periodMonth=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const periodMonth = sp.get('periodMonth') || undefined
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
    const where = { facilityId, ...(periodMonth ? { periodMonth } : {}) }
    const rows = await prisma.budget.findMany({ where, orderBy: [{ periodMonth: 'desc' }, { category: 'asc' }] })
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load budgets' }, { status: 500 })
  }
}

// POST /api/finance/budgets { facilityId, periodMonth, category, amount }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, periodMonth, category, amount } = body || {}
    if (!facilityId || !periodMonth || !category || amount == null) {
      return NextResponse.json({ error: 'facilityId, periodMonth, category, amount required' }, { status: 400 })
    }
    const row = await prisma.budget.upsert({
      where: { facilityId_periodMonth_category: { facilityId, periodMonth, category } },
      create: { facilityId, periodMonth, category, amount: Number(amount) },
      update: { amount: Number(amount) }
    })
    return NextResponse.json(row, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to upsert budget' }, { status: 500 })
  }
}


