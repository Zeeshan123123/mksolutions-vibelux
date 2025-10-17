import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

// V2 Yield API - temporarily disabled
// TODO: Implement proper PublicApiService interface

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'V2 Yield API is under development',
    status: 'disabled'
  });
}