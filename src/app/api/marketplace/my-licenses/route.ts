import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserEntitlements } from '@/lib/marketplace/entitlements'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entitlements = await getUserEntitlements(userId)
  return NextResponse.json({ entitlements })
}


