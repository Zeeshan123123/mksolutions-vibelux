import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/compliance/coc?batchCode=...&facilityId=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const batchCode = sp.get('batchCode')
    if (!facilityId || !batchCode) return NextResponse.json({ error: 'facilityId and batchCode required' }, { status: 400 })

    const batch = await prisma.complianceBatch.findFirst({ where: { facilityId, batchCode }, include: { transfersFrom: true, transfersTo: true, coas: true, children: true, parent: true } })
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })

    // Trace one-up and one-back
    const parents = batch.parent ? [batch.parent] : []
    const children = batch.children

    return NextResponse.json({ batch, parents, children, transfersFrom: batch.transfersFrom, transfersTo: batch.transfersTo, coas: batch.coas })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to trace batch' }, { status: 500 })
  }
}

// POST /api/compliance/coc/batch - create or merge/split batches
// Body: { facilityId, batchCode, batchType, parentCode? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, batchCode, batchType, parentCode } = body || {}
    if (!facilityId || !batchCode || !batchType) return NextResponse.json({ error: 'facilityId, batchCode, batchType required' }, { status: 400 })

    let parent = null as any
    if (parentCode) {
      parent = await prisma.complianceBatch.findFirst({ where: { facilityId, batchCode: parentCode } })
    }

    const batch = await prisma.complianceBatch.upsert({
      where: { facilityId_batchCode: { facilityId, batchCode } },
      create: { facilityId, batchCode, batchType, parentId: parent?.id || null },
      update: { batchType, parentId: parent?.id || null },
      include: { parent: true }
    })
    return NextResponse.json(batch, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create batch' }, { status: 500 })
  }
}


