import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get affiliate stats
    const [clicksResult, commissionsResult, linksResult] = await Promise.all([
      // Get clicks
      supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .gte('clicked_at', startDate.toISOString()),
      
      // Get commissions
      supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .gte('created_at', startDate.toISOString()),
      
      // Get links
      supabase
        .from('affiliate_links')
        .select(`
          *,
          affiliate_clicks(count)
        `)
        .eq('affiliate_id', affiliate.id)
        .limit(10)
        .order('created_at', { ascending: false })
    ]);

    const clicks = clicksResult.data || [];
    const commissions = commissionsResult.data || [];
    const topLinks = linksResult.data || [];

    // Calculate metrics
    const totalClicks = clicks.length;
    const totalConversions = clicks.filter(c => c.converted_at).length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const totalRevenue = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').length;
    const approvedCommissions = commissions.filter(c => c.status === 'approved').length;

    // Calculate daily stats
    const dailyStats = calculateDailyStats(clicks, commissions, days);

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        code: affiliate.affiliate_code,
        status: affiliate.status,
        commissionRate: affiliate.commission_rate,
        cookieDuration: affiliate.cookie_duration
      },
      metrics: {
        totalClicks,
        totalConversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue,
        pendingCommissions,
        approvedCommissions,
        averageOrderValue: totalConversions > 0 ? 
          commissions.reduce((sum, c) => sum + (c.metadata?.orderValue || 0), 0) / totalConversions : 0
      },
      topLinks: topLinks.map(link => ({
        id: link.id,
        shortCode: link.short_code,
        customAlias: link.custom_alias,
        originalUrl: link.original_url,
        campaign: link.campaign,
        clicks: link.affiliate_clicks?.[0]?.count || 0
      })),
      dailyStats,
      recentActivity: {
        clicks: clicks.slice(-10),
        conversions: clicks.filter(c => c.converted_at).slice(-5)
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}

function calculateDailyStats(clicks: any[], commissions: any[], days: number) {
  const dailyStats: any[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayClicks = clicks.filter(c => 
      c.clicked_at.startsWith(dateStr)
    );
    
    const dayCommissions = commissions.filter(c => 
      c.created_at.startsWith(dateStr)
    );
    
    dailyStats.push({
      date: dateStr,
      clicks: dayClicks.length,
      conversions: dayClicks.filter(c => c.converted_at).length,
      revenue: dayCommissions.reduce((sum, c) => sum + c.amount, 0)
    });
  }
  
  return dailyStats;
}