import { prisma } from '@/lib/prisma'

export async function userHasTrialAccess(userId: string, trialId: string): Promise<boolean> {
  // Use raw SQL since TrialLicenseEntitlement may not be in Prisma schema
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM "TrialLicenseEntitlement" WHERE "buyerId"=$1 AND "trialId"=$2 AND status='active' LIMIT 1`,
    userId,
    trialId
  )
  return rows?.length > 0
}

export async function getUserEntitlements(userId: string) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT e.id, e."trialId", e."listingId", e.status, e."grantedAt",
            t.name as trialName, l.title as listingTitle
     FROM "TrialLicenseEntitlement" e
     LEFT JOIN "Trial" t ON t.id = e."trialId"
     LEFT JOIN "TrialLicenseListing" l ON l.id = e."listingId"
     WHERE e."buyerId"=$1
     ORDER BY e."grantedAt" DESC`,
    userId
  )
  return rows
}

export async function getSellerListings(userId: string) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, "trialId", title, summary, "priceCents", currency, status, "createdAt", exclusive
     FROM "TrialLicenseListing"
     WHERE "ownerId"=$1
     ORDER BY "createdAt" DESC`,
    userId
  )
  return rows
}

export async function getSellerPurchases(userId: string) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT p.id, p."listingId", p."buyerId", p."amountCents", p.currency, p.status, p."createdAt",
            u.email as buyerEmail, l.title as listingTitle
     FROM "TrialLicensePurchase" p
     JOIN "TrialLicenseListing" l ON l.id = p."listingId"
     LEFT JOIN "User" u ON u.id = p."buyerId"
     WHERE l."ownerId"=$1
     ORDER BY p."createdAt" DESC`,
    userId
  )
  return rows
}


