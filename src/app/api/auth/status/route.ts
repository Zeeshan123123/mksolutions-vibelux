import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const disableClerk = process.env.DISABLE_CLERK === '1' || process.env.NEXT_PUBLIC_DISABLE_CLERK === '1'
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKeySet = Boolean(process.env.CLERK_SECRET_KEY)

  return NextResponse.json({
    disableClerk,
    publishableKeyPresent: Boolean(publishableKey),
    secretKeyPresent: secretKeySet,
    nodeEnv: process.env.NODE_ENV,
  })
}


