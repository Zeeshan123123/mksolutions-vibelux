import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET: tasks for a planting
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const planting = await prisma.planting.findFirst({ where: { id: params.id, crop: { facility: { users: { some: { userId } } } } }, select: { id: true } })
  if (!planting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const tasks = await prisma.cropTask.findMany({ where: { plantingId: params.id }, orderBy: { dueDate: 'asc' } })
  return NextResponse.json({ tasks })
}

// POST: create task
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const planting = await prisma.planting.findFirst({ where: { id: params.id, crop: { facility: { users: { some: { userId } } } } }, select: { id: true } })
  if (!planting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const task = await prisma.cropTask.create({ data: { plantingId: params.id, title: body.title, description: body.description, dueDate: body.dueDate ? new Date(body.dueDate) : null, assignedToUserId: body.assignedToUserId } })
  return NextResponse.json({ task })
}


