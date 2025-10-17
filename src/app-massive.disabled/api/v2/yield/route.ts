import { NextRequest, NextResponse } from 'next/server';

// V2 Yield API - temporarily disabled
// TODO: Implement proper PublicApiService interface

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'V2 Yield API is under development',
    status: 'disabled'
  });
}