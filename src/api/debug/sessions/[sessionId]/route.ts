// API route for specific session details - STUB
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // Return stub session data for debugging
  return NextResponse.json({
    sessionId: params.sessionId,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    userAgent: 'Unknown',
    ipAddress: '0.0.0.0'
  });
}