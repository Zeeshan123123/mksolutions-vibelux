import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// Demo worker: marks one pending run as completed with example metrics
export async function GET() {
  try {
    const run = await prisma.modelTrainingRun.findFirst({ where: { status: 'running' }, orderBy: { startedAt: 'asc' } })
    if (!run) return NextResponse.json({ processed: 0 })

    const accuracy = Math.round((0.75 + Math.random() * 0.2) * 1000) / 1000
    await prisma.modelTrainingRun.update({ where: { id: run.id }, data: { status: 'completed', finishedAt: new Date(), metrics: { accuracy } } })
    return NextResponse.json({ processed: 1, runId: run.id, metrics: { accuracy } })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


