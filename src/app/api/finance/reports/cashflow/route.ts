import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/reports/cashflow?facilityId=...&month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const month = sp.get('month') // YYYY-MM
    if (!facilityId || !month) return NextResponse.json({ error: 'facilityId and month required' }, { status: 400 })

    const [year, m] = month.split('-').map(Number)
    const start = new Date(year, (m - 1), 1)
    const end = new Date(year, (m - 1) + 1, 1)

    const paymentsIn = await prisma.billingPayment.aggregate({ _sum: { amount: true }, where: { facilityId, receivedAt: { gte: start, lt: end } } })
    const invoicesOut = await prisma.billingInvoice.aggregate({ _sum: { total: true }, where: { facilityId, issueDate: { gte: start, lt: end } } })

    return NextResponse.json({ month, cashIn: paymentsIn._sum.amount || 0, billedOut: invoicesOut._sum.total || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to compute cash flow' }, { status: 500 })
  }
}


