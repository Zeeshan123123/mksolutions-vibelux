import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/finance/invoices?facilityId=...&status=
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const status = sp.get('status') || undefined
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
    const invoices = await prisma.billingInvoice.findMany({
      where: { facilityId, ...(status ? { status } : {}) },
      orderBy: { issueDate: 'desc' },
      include: { lines: true, payments: true }
    })
    return NextResponse.json(invoices)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load invoices' }, { status: 500 })
  }
}

// POST /api/finance/invoices { facilityId, number, issueDate?, dueDate?, customer?, currency?, lines: [{ description, quantity, unitPrice }] }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, number, lines } = body || {}
    if (!facilityId || !number || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'facilityId, number, and at least one line required' }, { status: 400 })
    }
    const computedLines = lines.map((l: any) => ({
      description: String(l.description || ''),
      quantity: Number(l.quantity || 1),
      unitPrice: Number(l.unitPrice || 0),
      amount: Number(l.quantity || 1) * Number(l.unitPrice || 0)
    }))
    const total = computedLines.reduce((s: number, l: any) => s + l.amount, 0)
    const inv = await prisma.billingInvoice.create({
      data: {
        facilityId,
        number,
        status: body.status || 'draft',
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        customer: body.customer || null,
        currency: body.currency || 'USD',
        total,
        lines: { create: computedLines }
      },
      include: { lines: true }
    })
    return NextResponse.json(inv, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create invoice' }, { status: 500 })
  }
}


