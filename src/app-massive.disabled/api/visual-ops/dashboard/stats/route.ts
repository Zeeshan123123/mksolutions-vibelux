import { NextRequest, NextResponse } from 'next/server';

// Visual Ops Dashboard Stats API - temporarily disabled  
// TODO: Implement proper Prisma models for photoReport, qualityReport, etc.

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Visual Ops dashboard stats API is under development',
    status: 'disabled',
    data: {
      totalReports: 0,
      completedTasks: 0,
      activeIssues: 0,
      trends: {}
    }
  });
}