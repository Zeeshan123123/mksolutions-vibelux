import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function affiliateTrackingMiddleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Check for affiliate code in query params
  const { searchParams } = new URL(req.url);
  const affiliateCode = searchParams.get('ref') || searchParams.get('affiliate');
  
  if (affiliateCode) {
    // Set affiliate cookie
    response.cookies.set('affiliate_code', affiliateCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Track affiliate visit
    try {
      await trackAffiliateVisit(affiliateCode, req);
    } catch (error) {
      logger.error('api', 'Failed to track affiliate visit:', error );
    }
  }
  
  return response;
}

async function trackAffiliateVisit(affiliateCode: string, req: NextRequest) {
  // Add your affiliate tracking logic here
  const data = {
    affiliateCode,
    url: req.url,
    referrer: req.headers.get('referer'),
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  };
  
  // Log or send to analytics service
  logger.info('api', 'Affiliate visit:', { data: data });
}

export async function trackAffiliateConversion(
  affiliateId: string, 
  conversionType: string, 
  conversionValue: number,
  metadata?: Record<string, any>
) {
  const data = {
    affiliateId,
    conversionType,
    conversionValue,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  // Log conversion event
  logger.info('api', 'Affiliate conversion:', { data: data });
  
  // In a real implementation, this would send to analytics services
  // like Google Analytics, Mixpanel, Segment, etc.
}