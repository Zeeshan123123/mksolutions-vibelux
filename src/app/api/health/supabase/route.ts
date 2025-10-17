import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    return NextResponse.json({
      status: 'unconfigured',
      error: 'NEXT_PUBLIC_SUPABASE_URL not set'
    }, { status: 200 })
  }

  const healthUrl = `${url.replace(/\/$/, '')}/auth/v1/health`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(healthUrl, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      return NextResponse.json({ status: 'healthy', url })
    }
    return NextResponse.json({ status: 'unhealthy', code: res.status, url }, { status: 503 })
  } catch (err) {
    clearTimeout(timeout)
    return NextResponse.json({ status: 'unhealthy', error: (err as Error).message, url }, { status: 503 })
  }
}


