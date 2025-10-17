import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/reports/pl?facilityId=...&month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const month = sp.get('month')
    if (!facilityId || !month) return NextResponse.json({ error: 'facilityId and month required' }, { status: 400 })

    const [year, m] = month.split('-').map(Number)
    const start = new Date(year, (m - 1), 1)
    const end = new Date(year, (m - 1) + 1, 1)

    // Fetch journal lines in period with account types
    const lines = await prisma.journalLine.findMany({
      where: { entry: { facilityId, entryDate: { gte: start, lt: end } } },
      include: { account: true }
    })

    let revenue = 0
    let expenses = 0
    const byAccount: Record<string, { name: string; amount: number; type: string }> = {}

    for (const l of lines) {
      const type = (l.account.type || '').toLowerCase()
      const amount = Number(l.credit || 0) - Number(l.debit || 0)
      if (type === 'revenue') revenue += amount
      if (type === 'expense') expenses += -amount // expense debits positive
      const key = l.accountId
      const amtForAcct = type === 'expense' ? -amount : amount
      byAccount[key] = byAccount[key] || { name: l.account.name, amount: 0, type }
      byAccount[key].amount += amtForAcct
    }

    const net = revenue - expenses
    return NextResponse.json({ month, revenue, expenses, net, accounts: Object.values(byAccount) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to compute P&L' }, { status: 500 })
  }
}


