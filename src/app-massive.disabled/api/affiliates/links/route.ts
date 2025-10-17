import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/affiliates/links - Get all affiliate links for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get affiliate record
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    // Get all links for this affiliate
    const { data: links, error: linksError } = await supabase
      .from('affiliate_links')
      .select(`
        *,
        stats:affiliate_clicks(
          id,
          clicked_at,
          converted_at
        )
      `)
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false });

    if (linksError) {
      throw linksError;
    }

    // Calculate stats for each link
    const linksWithStats = links.map(link => {
      const clicks = link.stats || [];
      const conversions = clicks.filter(c => c.converted_at);
      
      return {
        id: link.id,
        shortCode: link.short_code,
        originalUrl: link.original_url,
        affiliateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/go/${link.short_code}`,
        customAlias: link.custom_alias,
        campaign: link.campaign,
        source: link.source,
        medium: link.medium,
        isActive: link.is_active,
        expiresAt: link.expires_at,
        stats: {
          clicks: clicks.length,
          uniqueClicks: new Set(clicks.map(c => c.visitor_id)).size,
          conversions: conversions.length,
          revenue: 0 // Would need to join with commissions table
        },
        createdAt: link.created_at
      };
    });

    return NextResponse.json({ 
      success: true, 
      links: linksWithStats 
    });

  } catch (error) {
    console.error('Links API error:', error);
    return NextResponse.json(
      { error: 'Failed to load links' },
      { status: 500 }
    );
  }
}

// POST /api/affiliates/links - Create new affiliate link
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, campaign, source, medium, customAlias, title, description, expiresIn } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Get affiliate record
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    if (affiliate.status !== 'active') {
      return NextResponse.json({ error: 'Affiliate account not active' }, { status: 403 });
    }

    // Generate short code
    const shortCode = customAlias || await generateShortCode();

    // Check if custom alias exists
    if (customAlias) {
      const { data: existing } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Custom alias already exists' }, { status: 409 });
      }
    }

    // Calculate expires_at
    const expiresAt = expiresIn ? 
      new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString() : 
      null;

    // Create the link
    const { data: link, error: linkError } = await supabase
      .from('affiliate_links')
      .insert({
        affiliate_id: affiliate.id,
        original_url: url,
        short_code: shortCode,
        custom_alias: customAlias,
        campaign,
        source,
        medium,
        is_active: true,
        expires_at: expiresAt,
        metadata: {
          title,
          description
        }
      })
      .select()
      .single();

    if (linkError) {
      throw linkError;
    }

    const affiliateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/go/${shortCode}`;

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        shortCode: link.short_code,
        originalUrl: link.original_url,
        affiliateUrl,
        customAlias: link.custom_alias,
        campaign: link.campaign,
        source: link.source,
        medium: link.medium,
        isActive: link.is_active,
        expiresAt: link.expires_at,
        stats: {
          clicks: 0,
          uniqueClicks: 0,
          conversions: 0,
          revenue: 0
        },
        createdAt: link.created_at
      }
    });

  } catch (error) {
    console.error('Create link API error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique short code
async function generateShortCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code exists
    const { data: existing } = await supabase
      .from('affiliate_links')
      .select('id')
      .eq('short_code', code)
      .single();

    if (!existing) {
      return code;
    }

    attempts++;
  }

  throw new Error('Unable to generate unique short code');
}