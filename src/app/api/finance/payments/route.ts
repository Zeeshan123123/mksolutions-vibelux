import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/payments?facilityId=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
    const payments = await prisma.billingPayment.findMany({ where: { facilityId }, orderBy: { receivedAt: 'desc' } })
    return NextResponse.json(payments)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load payments' }, { status: 500 })
  }
}

// POST /api/finance/payments { facilityId, amount, currency?, invoiceId?, method?, reference?, receivedAt? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, amount } = body || {}
    if (!facilityId || amount == null) return NextResponse.json({ error: 'facilityId and amount required' }, { status: 400 })
    const payment = await prisma.billingPayment.create({
      data: {
        facilityId,
        amount: Number(amount),
        currency: body.currency || 'USD',
        invoiceId: body.invoiceId || null,
        method: body.method || 'other',
        reference: body.reference || null,
        receivedAt: body.receivedAt ? new Date(body.receivedAt) : undefined,
        stripeIntent: body.stripeIntent || null,
      }
    })
    // Auto-mark invoice as paid if amounts match
    if (payment.invoiceId) {
      const inv = await prisma.billingInvoice.findUnique({ where: { id: payment.invoiceId } })
      if (inv) {
        const paidSum = await prisma.billingPayment.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id } })
        if ((paidSum._sum.amount || 0) >= inv.total) {
          await prisma.billingInvoice.update({ where: { id: inv.id }, data: { status: 'paid' } })
        }
      }
    }
    return NextResponse.json(payment, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to record payment' }, { status: 500 })
  }
}


