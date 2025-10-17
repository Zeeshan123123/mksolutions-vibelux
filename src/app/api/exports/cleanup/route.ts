import { NextResponse } from 'next/server'
import { exportService } from '@/lib/api/export-service'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await exportService.cleanupExpiredExports()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Cleanup failed' }, { status: 500 })
  }
}


