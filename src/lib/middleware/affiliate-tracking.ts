/**
 * Affiliate Tracking Middleware
 * Handles automatic tracking of affiliate referrals
 */

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';

export async function handleAffiliateTracking(request: NextRequest) {
  const response = NextResponse.next();
  const url = new URL(request.url);
  
  // Check for affiliate referral code in URL
  const ref = url.searchParams.get('ref');
  
  if (ref) {
    try {
      // Track the click
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.ip || 
                       '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';
      const referrer = request.headers.get('referer') || '';
      
      const utmParams = {
        source: url.searchParams.get('utm_source'),
        medium: url.searchParams.get('utm_medium'),
        campaign: url.searchParams.get('utm_campaign'),
        content: url.searchParams.get('utm_content'),
        term: url.searchParams.get('utm_term')
      };
      
      const trackingResult = await affiliateService.trackClick({
        affiliateCode: ref,
        ipAddress,
        userAgent,
        referrer,
        landingPage: request.url,
        utmParams
      });
      
      if (trackingResult) {
        // Set tracking cookie
        response.cookies.set('vibelux_ref', JSON.stringify(trackingResult.cookieData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        });
      }
    } catch (error) {
      logger.error('api', 'Error tracking affiliate click:', error );
    }
  }
  
  return response;
}

export function getAffiliateFromCookie(request: NextRequest): string | null {
  try {
    const cookieData = request.cookies.get('vibelux_ref');
    if (cookieData) {
      const data = JSON.parse(cookieData.value);
      return data.aff;
    }
  } catch (error) {
    logger.error('api', 'Error parsing affiliate cookie:', error );
  }
  return null;
}