import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
import { logger } from '@/lib/logging/production-logger'
export const dynamic = 'force-dynamic'

// Simple one-way ANOVA and Tukey HSD implementation for treatment comparison

export const GET = withResearch(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams
  const metric = search.get('metric') || 'yield'
  const trialId = req.nextUrl.pathname.split('/').filter(Boolean).slice(-2)[0]

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT o.value, tu."treatmentId", tr.name AS treatment
     FROM "Observation" o
     JOIN "TrialUnit" tu ON tu.id = o."unitId"
     JOIN "Treatment" tr ON tr.id = tu."treatmentId"
     WHERE o."trialId"=$1 AND o.metric=$2`,
    trialId, metric
  )

  const groups: Record<string, number[]> = {}
  rows.forEach((r) => {
    if (!groups[r.treatment]) groups[r.treatment] = []
    groups[r.treatment].push(Number(r.value))
  })

  const anova = oneWayANOVA(groups)
  const tukey = anova ? tukeyHSD(groups, anova.mse) : null

  return NextResponse.json({ metric, groups: Object.keys(groups), anova, tukey })
})

function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / (xs.length || 1) }
function variance(xs: number[], m: number) { return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1 || 1) }

function oneWayANOVA(groups: Record<string, number[]>) {
  const treatments = Object.keys(groups)
  if (treatments.length < 2) return null
  const ns = treatments.map((t) => groups[t].length)
  const means = treatments.map((t) => mean(groups[t]))
  const all = treatments.flatMap((t) => groups[t])
  const grandMean = mean(all)
  const k = treatments.length
  const N = all.length
  if (N <= k) return null

  // Between-group sum of squares (SSB)
  const ssb = treatments.reduce((s, t, i) => s + ns[i] * (means[i] - grandMean) ** 2, 0)
  // Within-group sum of squares (SSW)
  const ssw = treatments.reduce((s, t, i) => s + groups[t].reduce((a, v) => a + (v - means[i]) ** 2, 0), 0)
  const dfb = k - 1
  const dfw = N - k
  const msb = ssb / dfb
  const mse = ssw / dfw
  const F = msb / mse
  // P-value requires F-distribution; for now return F and dfs (UI can interpret)
  return { k, N, ssb, ssw, dfb, dfw, msb, mse, F }
}

function tukeyHSD(groups: Record<string, number[]>, mse: number) {
  const treatments = Object.keys(groups)
  const nPer = treatments.map((t) => groups[t].length)
  const mPer = treatments.map((t) => mean(groups[t]))
  const results: Array<{ a: string; b: string; diff: number; se: number; q: number }> = []
  // Equal n assumption for SE; if unequal, use harmonic mean approximation
  const nHarm = treatments.length / nPer.reduce((s, n) => s + 1 / (n || 1), 0)
  const se = Math.sqrt(mse / nHarm)
  for (let i = 0; i < treatments.length; i++) {
    for (let j = i + 1; j < treatments.length; j++) {
      const diff = Math.abs(mPer[i] - mPer[j])
      const q = diff / se
      results.push({ a: treatments[i], b: treatments[j], diff, se, q })
    }
  }
  return { comparisons: results }
}


