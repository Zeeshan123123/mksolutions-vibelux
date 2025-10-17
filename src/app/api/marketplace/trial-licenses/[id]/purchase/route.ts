import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const listingId = params.id
  const [listing]: any[] = await prisma.$queryRawUnsafe(`
    SELECT l.*, t.name as trialName FROM "TrialLicenseListing" l
    JOIN "Trial" t ON t.id = l."trialId" WHERE l.id=$1`, listingId)
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(listing.priceCents),
    currency: listing.currency || 'usd',
    customer: dbUser.stripeCustomerId || undefined,
    metadata: {
      listingId,
      trialId: listing.trialId,
      licenseType: listing.licenseType,
      usageRights: listing.usageRights,
      exclusive: String(listing.exclusive),
    },
    description: `VibeLux Trial License: ${listing.title}`
  })

  const purchaseId = `tlp_${Date.now()}`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "TrialLicensePurchase" (id, "listingId", "buyerId", "amountCents", currency, "usageRights", territory, exclusive, "stripePaymentIntentId", status, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',NOW())`,
    purchaseId, listingId, dbUser.id, listing.priceCents, listing.currency, listing.usageRights, listing.territory || [], listing.exclusive || false, paymentIntent.id
  )

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, purchaseId })
}


