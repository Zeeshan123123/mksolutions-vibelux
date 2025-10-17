import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
import { logger } from '@/lib/logging/production-logger'

export const dynamic = 'force-dynamic'

function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / (xs.length || 1) }
function sd(xs: number[]) {
  const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1))
}

export const GET = withResearch(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams
  const trialIds = (search.get('trialIds') || '').split(',').map(s => s.trim()).filter(Boolean)
  const metric = search.get('metric') || 'yield'
  if (trialIds.length < 2) return NextResponse.json({ error: 'Provide at least two trialIds' }, { status: 400 })

  const results: any[] = []
  for (const id of trialIds) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT o.value::float as value, tr.name as treatment
       FROM "Observation" o
       JOIN "TrialUnit" tu ON tu.id = o."unitId"
       JOIN "Treatment" tr ON tr.id = tu."treatmentId"
       WHERE o."trialId"=$1 AND o.metric=$2`, id, metric
    )
    const byTreatment: Record<string, number[]> = {}
    rows.forEach(r => {
      if (!byTreatment[r.treatment]) byTreatment[r.treatment] = []
      byTreatment[r.treatment].push(Number(r.value))
    })

    const treatments = Object.entries(byTreatment).map(([t, vals]) => ({
      treatment: t,
      n: vals.length,
      mean: mean(vals),
      sd: sd(vals)
    }))
    const all = rows.map(r => Number(r.value))
    results.push({ trialId: id, metric, n: all.length, mean: mean(all), sd: sd(all), treatments })
  }

  return NextResponse.json({ metric, trials: results })
})


