import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { headers } from 'next/headers';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');
    
    if (!ref) {
      return NextResponse.json({ error: 'No referral code provided' }, { status: 400 });
    }

    // Get request headers
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';

    // Get UTM parameters
    const utmParams = {
      source: searchParams.get('utm_source') || undefined,
      medium: searchParams.get('utm_medium') || undefined,
      campaign: searchParams.get('utm_campaign') || undefined,
      content: searchParams.get('utm_content') || undefined,
      term: searchParams.get('utm_term') || undefined
    };

    // Track the click
    const trackingResult = await affiliateService.trackClick({
      affiliateCode: ref,
      ipAddress,
      userAgent,
      referrer,
      landingPage: request.url,
      utmParams
    });

    if (!trackingResult) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Create response with tracking cookie
    const response = NextResponse.json({
      success: true,
      clickId: trackingResult.clickId
    });

    // Set tracking cookie
    response.cookies.set('vibelux_ref', JSON.stringify(trackingResult.cookieData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    logger.error('api', 'Error tracking affiliate click:', error );
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateCode, event, data } = body;

    if (!affiliateCode || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle different tracking events
    switch (event) {
      case 'pageview':
        // Track page views for analytics
        break;
      case 'signup':
        // Handle signup tracking
        const { email, userId } = data;
        if (email) {
          await affiliateService.createReferral({
            affiliateId: affiliateCode, // This should be looked up
            referredEmail: email,
            metadata: { userId }
          });
        }
        break;
      case 'conversion':
        // Handle conversion tracking
        const { referredEmail, userId: convertedUserId, amount, type } = data;
        await affiliateService.processConversion({
          referredEmail,
          userId: convertedUserId,
          conversionType: type || 'PAID_SUBSCRIPTION',
          amount,
          subscriptionTier: data.tier
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api', 'Error tracking affiliate event:', error );
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}