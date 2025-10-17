import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@/lib/logging/production-logger';
import { s3Client } from '@/lib/storage/s3-client';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const scoutingData = JSON.parse(dataString)
    const computedActionRequired = typeof scoutingData.actionRequired === 'boolean'
      ? scoutingData.actionRequired
      : (scoutingData.severity === 'high' || scoutingData.severity === 'critical')

    // Process uploaded photos
    const photoUrls: string[] = []
    let photoIndex = 0
    
    while (formData.has(`photo_${photoIndex}`)) {
      const photo = formData.get(`photo_${photoIndex}`) as File
      if (photo) {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const fileName = `${uuidv4()}_${photo.name}`
        const key = `scouting/${userId}/${fileName}`
        try {
          await s3Client.upload(key, buffer, {
            contentType: photo.type || 'image/jpeg',
            acl: 'public-read',
            cacheControl: 'public, max-age=31536000',
          })
          const bucket = process.env.AWS_S3_BUCKET || 'vibelux-storage'
          const region = process.env.AWS_REGION || 'us-east-1'
          const bucketUrl = process.env.AWS_S3_BUCKET_URL || `https://${bucket}.s3.${region}.amazonaws.com`
          photoUrls.push(`${bucketUrl}/${key}`)
        } catch (e) {
          const dirPath = join(process.cwd(), 'public', 'uploads', 'scouting')
          await mkdir(dirPath, { recursive: true })
          const uploadPath = join(dirPath, fileName)
          await writeFile(uploadPath, buffer)
          photoUrls.push(`/uploads/scouting/${fileName}`)
        }
      }
      photoIndex++
    }

    // Save to database
    const scoutingRecord = await prisma.scoutingRecord.create({
      data: {
        userId,
        facilityId: scoutingData.facilityId || undefined,
        timestamp: new Date(scoutingData.timestamp),
        latitude: scoutingData.location.latitude,
        longitude: scoutingData.location.longitude,
        zone: scoutingData.location.zone,
        block: scoutingData.location.block,
        issueType: scoutingData.type,
        severity: scoutingData.severity,
        issue: scoutingData.issue,
        notes: scoutingData.notes,
        photos: photoUrls,
        environmental: scoutingData.environmental,
        actionRequired: computedActionRequired,
        assignedTo: scoutingData.assignedTo
      }
    })

    // Create task if action required
    if (computedActionRequired) {
      await prisma.task.create({
        data: {
          title: `Address ${scoutingData.type}: ${scoutingData.issue}`,
          description: scoutingData.notes,
          priority: scoutingData.severity === 'critical' ? 'high' : 'medium',
          status: 'pending',
          taskType: 'ipm',
          assignedTo: scoutingData.assignedTo || userId,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          facilityId: scoutingData.facilityId || undefined,
          createdBy: userId,
          metadata: {
            scoutingRecordId: scoutingRecord.id,
            location: scoutingData.location,
            severity: scoutingData.severity
          }
        }
      })
    }

    // Notify managers/owners on high/critical findings
    try {
      if (computedActionRequired && scoutingData.facilityId) {
        const facilityUsers = await prisma.facilityUser.findMany({
          where: {
            facilityId: scoutingData.facilityId,
            role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
          },
          select: { userId: true }
        })
        const title = `Scouting: ${String(scoutingData.type || '').toUpperCase()} - ${scoutingData.severity}`
        const message = scoutingData.notes || 'A scouting issue requires attention.'
        await Promise.all(
          facilityUsers.map(u =>
            prisma.notification.create({
              data: {
                userId: u.userId,
                type: 'scouting_alert',
                title,
                message,
                data: { scoutingRecordId: scoutingRecord.id }
              }
            })
          )
        )
      }
    } catch (e) {
      logger.error('api: Failed to send scouting notifications', e)
    }

    return NextResponse.json({
      success: true,
      recordId: scoutingRecord.id,
      taskCreated: computedActionRequired
    })
  } catch (error) {
    logger.error('api: Scouting upload error', error )
    return NextResponse.json(
      { error: 'Failed to upload scouting record' },
      { status: 500 }
    )
  }
}