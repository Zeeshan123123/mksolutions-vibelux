import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File
    const facilityId = String(form.get('facilityId') || '')
    const folder = String(form.get('folder') || 'uploads')
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const region = process.env.AWS_REGION || 'us-east-1'
    const bucket = process.env.AWS_S3_BUCKET || ''
    if (!bucket) return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const ext = (file.name || 'file').split('.').pop() || 'bin'
    const key = `${folder}/${facilityId || 'general'}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
      Metadata: { userId, facilityId },
    }))

    const urlBase = process.env.AWS_S3_BUCKET_URL || `https://${bucket}.s3.${region}.amazonaws.com`
    return NextResponse.json({ success: true, key, url: `${urlBase}/${key}` })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}


