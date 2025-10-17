import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
export const dynamic = 'force-dynamic'

const QUICKBOOKS_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const provider = (body.provider || 'QUICKBOOKS') as 'QUICKBOOKS' | 'XERO'

  // Resolve user's facility
  const facility = await prisma.facility.findFirst({ where: { users: { some: { userId, role: { in: ['OWNER','ADMIN','MANAGER'] } } } }, select: { id: true } })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })

  const conn = await prisma.eRPConnection.findUnique({ where: { facilityId_provider: { facilityId: facility.id, provider } } })
  if (!conn || !conn.refreshToken) return NextResponse.json({ error: 'No refresh token' }, { status: 400 })

  try {
    if (provider === 'QUICKBOOKS') {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: conn.refreshToken,
      })
      const resp = await axios.post(QUICKBOOKS_TOKEN_URL, params, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      const tokens = resp.data
      const updated = await prisma.eRPConnection.update({ where: { id: conn.id }, data: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token || conn.refreshToken, status: 'CONNECTED', updatedAt: new Date() } })
      return NextResponse.json({ success: true, connection: updated })
    } else {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: conn.refreshToken,
        client_id: process.env.XERO_CLIENT_ID || '',
        client_secret: process.env.XERO_CLIENT_SECRET || '',
      })
      const resp = await axios.post(XERO_TOKEN_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      const tokens = resp.data
      const updated = await prisma.eRPConnection.update({ where: { id: conn.id }, data: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token || conn.refreshToken, status: 'CONNECTED', updatedAt: new Date() } })
      return NextResponse.json({ success: true, connection: updated })
    }
  } catch (e: any) {
    await prisma.eRPConnection.update({ where: { id: conn.id }, data: { status: 'ERROR' } }).catch(() => null)
    return NextResponse.json({ error: 'refresh_failed', details: e?.message }, { status: 500 })
  }
}


