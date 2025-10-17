import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// Creates notifications for tasks due today (server-side cron can call this daily)
export async function GET() {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const dueTasks = await prisma.cropTask.findMany({
      where: {
        status: { not: 'done' },
        dueDate: { gte: start, lte: end },
      },
      include: {
        planting: { include: { crop: { include: { facility: { select: { id: true } } } } } },
      }
    })

    let created = 0
    for (const t of dueTasks) {
      const assigned = t.assignedToUserId
      if (assigned) {
        await prisma.notification.create({
          data: {
            userId: assigned,
            type: 'task_due',
            title: 'Task Due Today',
            message: `${t.title} is due today`,
            data: { taskId: t.id, plantingId: t.plantingId },
          }
        })
        created++
      } else {
        // Notify facility managers if no assignee
        const facilityId = t.planting.crop.facility.id
        const managers = await prisma.facilityUser.findMany({ where: { facilityId, role: { in: ['OWNER','ADMIN','MANAGER'] } }, select: { userId: true } })
        await Promise.all(managers.map(m => prisma.notification.create({ data: { userId: m.userId, type: 'task_due', title: 'Unassigned Task Due', message: `${t.title} is due today`, data: { taskId: t.id, plantingId: t.plantingId } } })))
        created += managers.length
      }
    }

    return NextResponse.json({ success: true, notified: created })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


