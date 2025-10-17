import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import Stripe from 'stripe'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})

const CreateSchema = z.object({
  trialId: z.string(),
  title: z.string().min(3),
  summary: z.string().optional(),
  licenseType: z.enum(['ONE_TIME_LICENSE', 'ROYALTY_BASED', 'SUBSCRIPTION', 'CUSTOM']),
  usageRights: z.enum(['PERSONAL', 'COMMERCIAL', 'UNLIMITED', 'RESEARCH_ONLY']),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default('USD'),
  royaltyPercent: z.number().optional(),
  territory: z.array(z.string()).optional(),
  exclusive: z.boolean().optional()
})

export async function GET() {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT l.id, l.title, l.summary, l.licenseType, l.usageRights, l.priceCents, l.currency, l.status, l.createdAt,
           t.name as trialName
    FROM "TrialLicenseListing" l
    JOIN "Trial" t ON t.id = l."trialId"
    WHERE l.status='active'
    ORDER BY l."createdAt" DESC
    LIMIT 200`)
  return NextResponse.json({ listings: rows })
}

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data = CreateSchema.parse(body)

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const id = `trial_license_${Date.now()}`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "TrialLicenseListing" (id, "trialId", "ownerId", title, summary, "licenseType", "usageRights", "priceCents", currency, "royaltyPercent", territory, exclusive, status, "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active', NOW(), NOW())`,
    id, data.trialId, dbUser.id, data.title, data.summary || null, data.licenseType, data.usageRights, data.priceCents, data.currency, data.royaltyPercent || null, data.territory || [], data.exclusive || false
  )
  return NextResponse.json({ success: true, id })
}


