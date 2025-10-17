import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET: list ERP connections for the user's facility
export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const facility = await prisma.facility.findFirst({
    where: { users: { some: { userId } } },
    select: { id: true }
  })
  if (!facility) return NextResponse.json({ connections: [] })

  const connections = await prisma.eRPConnection.findMany({ where: { facilityId: facility.id } })
  return NextResponse.json({ connections })
}

// PUT: upsert a connection (provider, status, tokens optional)
export async function PUT(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const facility = await prisma.facility.findFirst({
    where: { users: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
    select: { id: true }
  })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })

  const body = await req.json()
  const provider = body.provider as 'QUICKBOOKS' | 'XERO' | 'NETSUITE'
  if (!provider) return NextResponse.json({ error: 'provider required' }, { status: 400 })

  const data: any = {}
  if (body.status) data.status = body.status
  if (typeof body.accessToken === 'string') data.accessToken = body.accessToken
  if (typeof body.refreshToken === 'string') data.refreshToken = body.refreshToken
  if (typeof body.realmId === 'string') data.realmId = body.realmId
  if (body.setConnected === true) data.status = 'CONNECTED'
  if (body.setDisconnected === true) data.status = 'DISCONNECTED'

  const upserted = await prisma.eRPConnection.upsert({
    where: { facilityId_provider: { facilityId: facility.id, provider } },
    create: { facilityId: facility.id, provider, ...data },
    update: { ...data, updatedAt: new Date() }
  })

  return NextResponse.json({ connection: upserted })
}


