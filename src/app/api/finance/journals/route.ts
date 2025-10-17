import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/journals?facilityId=...&month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const month = sp.get('month')
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    let where: any = { facilityId }
    if (month) {
      const [year, m] = month.split('-').map(Number)
      const start = new Date(year, (m - 1), 1)
      const end = new Date(year, (m - 1) + 1, 1)
      where.entryDate = { gte: start, lt: end }
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      include: { lines: { include: { account: true } } }
    })
    return NextResponse.json(entries)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load journal entries' }, { status: 500 })
  }
}

// POST /api/finance/journals
// Body: { facilityId, entryDate?, memo?, debit: { accountName, type, amount, description? }, credit: { accountName, type, amount, description? } }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, debit, credit } = body || {}
    if (!facilityId || !debit?.accountName || !credit?.accountName) {
      return NextResponse.json({ error: 'facilityId, debit.accountName, credit.accountName required' }, { status: 400 })
    }
    const amount = Number(body.debit?.amount)
    const amountCr = Number(body.credit?.amount)
    if (!(amount > 0) || !(amountCr > 0) || Math.abs(amount - amountCr) > 1e-6) {
      return NextResponse.json({ error: 'Debit and credit amounts must be positive and equal' }, { status: 400 })
    }

    // Upsert accounts by name/type for this facility
    async function upsertAccount(name: string, type: string | undefined) {
      const safeType = (type || 'expense').toLowerCase()
      const existing = await prisma.account.findFirst({ where: { facilityId, name } })
      if (existing) return existing
      return prisma.account.create({ data: { facilityId, name, type: safeType } })
    }

    const debitAccount = await upsertAccount(debit.accountName, debit.type)
    const creditAccount = await upsertAccount(credit.accountName, credit.type)

    const entry = await prisma.journalEntry.create({
      data: {
        facilityId,
        entryDate: body.entryDate ? new Date(body.entryDate) : undefined,
        memo: body.memo || null,
        lines: {
          create: [
            {
              accountId: debitAccount.id,
              description: debit.description || null,
              debit: amount,
              credit: 0
            },
            {
              accountId: creditAccount.id,
              description: credit.description || null,
              debit: 0,
              credit: amount
            }
          ]
        }
      },
      include: { lines: { include: { account: true } } }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to post journal entry' }, { status: 500 })
  }
}


