import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/sop/revisions?sopId=...&limit=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const sopId = sp.get('sopId') || undefined
    const limit = Math.min(Number(sp.get('limit') || 20), 100)

    const where: any = {}
    if (sopId) where.sopId = sopId

    const rows = await prisma.sOPRevision.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        sopId: true,
        previousVersion: true,
        newVersion: true,
        changeLog: true,
        changedBy: true,
        diffSummary: true,
        reviewedByUserId: true,
        createdAt: true,
        sop: { select: { title: true } }
      }
    })

    return NextResponse.json({ revisions: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch SOP revisions' }, { status: 500 })
  }
}


