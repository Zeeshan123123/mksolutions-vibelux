import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': string;
    'blocked-uri': string;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'status-code': number;
    'script-sample'?: string;
  };
}

// Store CSP violations (in production, use a proper logging service)
const violations: CSPReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // CSP reports are sent as application/csp-report or application/json
    if (!contentType || (!contentType.includes('application/csp-report') && !contentType.includes('application/json'))) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const report: CSPReport = await request.json();
    
    // Validate the report structure
    if (!report['csp-report']) {
      return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 });
    }

    const violation = report['csp-report'];
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('api', 'CSP Violation:', { data: {
        directive: violation['violated-directive'], blockedURI: violation['blocked-uri'], documentURI: violation['document-uri'], sourceFile: violation['source-file'], lineNumber: violation['line-number'], columnNumber: violation['column-number'], sample: violation['script-sample']
      } });
    }

    // In production, you would send this to a logging service
    // For now, we'll store in memory (limited to last 100 violations)
    violations.unshift(report);
    if (violations.length > 100) {
      violations.pop();
    }

    // You could also:
    // - Send to Sentry or another error tracking service
    // - Store in a database for analysis
    // - Send alerts for critical violations
    
    // Check for critical violations that might indicate an attack
    const criticalPatterns = [
      /eval\(/,
      /javascript:/,
      /<script/i,
      /onclick/i,
      /onerror/i
    ];
    
    const isCritical = criticalPatterns.some(pattern => 
      pattern.test(violation['blocked-uri']) || 
      (violation['script-sample'] && pattern.test(violation['script-sample']))
    );
    
    if (isCritical) {
      // Log critical violations with higher priority
      logger.error('api', 'CRITICAL CSP Violation detected:', new Error(JSON.stringify(violation)));
      // In production: send immediate alert
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    logger.error('api', 'Error processing CSP report:', error );
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}

// Optional: GET endpoint to view violations (only in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get query parameters for filtering
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const directive = searchParams.get('directive');
  
  let filteredViolations = violations;
  
  if (directive) {
    filteredViolations = violations.filter(v => 
      v['csp-report']['violated-directive'].includes(directive)
    );
  }

  return NextResponse.json({
    total: filteredViolations.length,
    violations: filteredViolations.slice(0, limit).map(v => ({
      timestamp: new Date().toISOString(), // In production, store actual timestamp
      directive: v['csp-report']['violated-directive'],
      blockedUri: v['csp-report']['blocked-uri'],
      documentUri: v['csp-report']['document-uri'],
      sourceFile: v['csp-report']['source-file'],
      lineNumber: v['csp-report']['line-number'],
      sample: v['csp-report']['script-sample']
    }))
  });
}