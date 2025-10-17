// API route for receiving error reports
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json();
    
    // Log errors for debugging (simplified approach)
    for (const errorReport of errors) {
      logger.error('api', 'Client-side error reported:', undefined, {
        sessionId: errorReport.sessionId,
        type: errorReport.type,
        severity: errorReport.severity,
        errorMessage: errorReport.error,
        context: errorReport.context,
        timestamp: errorReport.timestamp,
        url: errorReport.url,
        userAgent: errorReport.userAgent
      });
    }
    
    return NextResponse.json({ success: true, processed: errors.length });
  } catch (error) {
    logger.error('api', 'Failed to process error reports:', error);
    return NextResponse.json({ error: 'Failed to process errors' }, { status: 500 });
  }
}