import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// PATCH: update a task (status, title, dueDate, assignedToUserId)
export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure planting belongs to user's facility scope
  const planting = await prisma.planting.findFirst({ where: { id: params.id, crop: { facility: { users: { some: { userId } } } } }, select: { id: true } })
  if (!planting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const data: any = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.description === 'string') data.description = body.description
  if (typeof body.status === 'string') data.status = body.status
  if (typeof body.assignedToUserId === 'string' || body.assignedToUserId === null) data.assignedToUserId = body.assignedToUserId
  if (body.dueDate) data.dueDate = new Date(body.dueDate)

  const updated = await prisma.cropTask.update({ where: { id: params.taskId }, data })
  return NextResponse.json({ task: updated })
}


