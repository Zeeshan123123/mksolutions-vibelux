import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/compliance/certificates?facilityId=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
    const certs = await prisma.complianceCertificate.findMany({ where: { facilityId }, orderBy: { expiryDate: 'asc' } })
    return NextResponse.json(certs)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load certificates' }, { status: 500 })
  }
}

// POST /api/compliance/certificates
// Body: { facilityId, certType, issuer, identifier?, issueDate?, expiryDate?, fileUrl?, status? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, certType, issuer } = body || {}
    if (!facilityId || !certType || !issuer) return NextResponse.json({ error: 'facilityId, certType, issuer required' }, { status: 400 })
    const cert = await prisma.complianceCertificate.create({
      data: {
        facilityId,
        certType,
        issuer,
        identifier: body.identifier ?? null,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        fileUrl: body.fileUrl ?? null,
        status: body.status ?? 'active',
      }
    })
    return NextResponse.json(cert, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create certificate' }, { status: 500 })
  }
}


