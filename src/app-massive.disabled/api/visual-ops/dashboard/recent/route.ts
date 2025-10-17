import { NextRequest, NextResponse } from 'next/server';

// Visual Ops Dashboard API - temporarily disabled  
// TODO: Implement proper Prisma models for photoReport, qualityReport, etc.

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Visual Ops dashboard API is under development',
    status: 'disabled',
    data: {
      reports: [],
      total: 0
    }
  });
}