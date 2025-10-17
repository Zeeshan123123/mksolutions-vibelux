import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT l.id, l.title, l.summary, l."licenseType", l."usageRights", l."priceCents", l.currency, l.status, l."createdAt",
           l."trialId", t.name as trialName
    FROM "TrialLicenseListing" l
    JOIN "Trial" t ON t.id = l."trialId"
    WHERE l.id=$1
    LIMIT 1`, id)
  if (!rows?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ listing: rows[0] })
}


