import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/compliance/pesticides/inventory?facilityId=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    const items = await prisma.pesticideInventoryItem.findMany({
      where: { facilityId },
      orderBy: [{ expiryDate: 'asc' }, { productName: 'asc' }]
    })
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load inventory' }, { status: 500 })
  }
}

// POST /api/compliance/pesticides/inventory
// Body: { facilityId, productName, epaRegNo?, lotNumber?, quantity?, unit?, expiryDate?, notes? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, productName } = body || {}
    if (!facilityId || !productName) return NextResponse.json({ error: 'facilityId and productName required' }, { status: 400 })

    const item = await prisma.pesticideInventoryItem.create({
      data: {
        facilityId,
        productName,
        epaRegNo: body.epaRegNo ?? null,
        lotNumber: body.lotNumber ?? null,
        quantity: Number(body.quantity ?? 0),
        unit: body.unit ?? 'L',
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes ?? null,
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create item' }, { status: 500 })
  }
}


