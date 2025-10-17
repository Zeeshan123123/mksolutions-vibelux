import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSellerListings, getSellerPurchases } from '@/lib/marketplace/entitlements'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [listings, purchases] = await Promise.all([
    getSellerListings(userId),
    getSellerPurchases(userId)
  ])
  return NextResponse.json({ listings, purchases })
}


