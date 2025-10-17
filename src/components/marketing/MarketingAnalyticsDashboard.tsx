'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Mail, 
  MessageSquare, 
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MarketingMetrics {
  pixel_tracking: {
    total_events: number;
    unique_visitors: number;
    conversion_rate: number;
    top_events: { event: string; count: number; value?: number }[];
    platform_performance: {
      facebook: { reach: number; clicks: number; conversions: number; cost: number };
      google: { impressions: number; clicks: number; conversions: number; cost: number };
      linkedin: { impressions: number; clicks: number; conversions: number; cost: number };
      tiktok: { views: number; clicks: number; conversions: number; cost: number };
      twitter: { impressions: number; clicks: number; conversions: number; cost: number };
    };
  };
  retargeting: {
    active_audiences: number;
    total_audience_size: number;
    campaigns_running: number;
    average_cpm: number;
    retargeting_conversion_rate: number;
    audience_performance: {
      audience_id: string;
      name: string;
      size: number;
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
      roas: number;
    }[];
  };
  abandoned_cart: {
    total_abandoned: number;
    total_recovered: number;
    recovery_rate: number;
    recovery_value: number;
    avg_time_to_recovery: number;
    recovery_by_channel: {
      email: { sent: number; recovered: number; rate: number; value: number };
      sms: { sent: number; recovered: number; rate: number; value: number };
      push: { sent: number; recovered: number; rate: number; value: number };
      retargeting: { impressions: number; recovered: number; rate: number; value: number };
    };
    recovery_timeline: { stage: string; count: number; value: number }[];
  };
  overall_performance: {
    total_revenue: number;
    marketing_spend: number;
    roas: number;
    customer_acquisition_cost: number;
    lifetime_value: number;
    conversion_funnel: {
      visitors: number;
      leads: number;
      trials: number;
      customers: number;
      rates: { visitor_to_lead: number; lead_to_trial: number; trial_to_customer: number };
    };
  };
}

export function MarketingAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'pixels' | 'retargeting' | 'cart_recovery'>('overview');

  useEffect(() => {
    loadMarketingMetrics();
  }, [timeframe]);

  const loadMarketingMetrics = async () => {
    try {
      setLoading(true);
      
      // In production, this would fetch from your analytics API
      const mockMetrics: MarketingMetrics = {
        pixel_tracking: {
          total_events: 45234,
          unique_visitors: 12456,
          conversion_rate: 3.2,
          top_events: [
            { event: 'page_view', count: 23456, value: 0 },
            { event: 'view_content', count: 8934, value: 0 },
            { event: 'add_to_cart', count: 1234, value: 89456 },
            { event: 'start_trial', count: 456, value: 23456 },
            { event: 'purchase', count: 189, value: 45678 }
          ],
          platform_performance: {
            facebook: { reach: 125000, clicks: 3456, conversions: 123, cost: 2345 },
            google: { impressions: 456000, clicks: 8934, conversions: 234, cost: 4567 },
            linkedin: { impressions: 89000, clicks: 1234, conversions: 45, cost: 1234 },
            tiktok: { views: 234000, clicks: 2345, conversions: 67, cost: 1567 },
            twitter: { impressions: 67000, clicks: 892, conversions: 23, cost: 678 }
          }
        },
        retargeting: {
          active_audiences: 7,
          total_audience_size: 23456,
          campaigns_running: 12,
          average_cpm: 4.56,
          retargeting_conversion_rate: 5.8,
          audience_performance: [
            { audience_id: 'doc_mgmt_visitors', name: 'Document Management Visitors', size: 5432, impressions: 45678, clicks: 1234, conversions: 67, cost: 567, roas: 4.2 },
            { audience_id: 'template_browsers', name: 'Template Browsers', size: 3456, impressions: 34567, clicks: 892, conversions: 45, cost: 445, roas: 3.8 },
            { audience_id: 'trial_starters', name: 'Trial Starters', size: 2345, impressions: 23456, clicks: 567, conversions: 34, cost: 234, roas: 6.7 },
            { audience_id: 'cart_abandoners', name: 'Cart Abandoners', size: 1234, impressions: 12345, clicks: 345, conversions: 23, cost: 189, roas: 8.9 },
            { audience_id: 'pricing_visitors', name: 'Pricing Visitors', size: 4567, impressions: 56789, clicks: 1456, conversions: 89, cost: 678, roas: 5.2 }
          ]
        },
        abandoned_cart: {
          total_abandoned: 1456,
          total_recovered: 234,
          recovery_rate: 16.1,
          recovery_value: 12456,
          avg_time_to_recovery: 18.5,
          recovery_by_channel: {
            email: { sent: 1456, recovered: 145, rate: 10.0, value: 7890 },
            sms: { sent: 456, recovered: 45, rate: 9.9, value: 2345 },
            push: { sent: 789, recovered: 23, rate: 2.9, value: 1234 },
            retargeting: { impressions: 23456, recovered: 21, rate: 0.09, value: 987 }
          },
          recovery_timeline: [
            { stage: 'email_1', count: 89, value: 4567 },
            { stage: 'email_2', count: 56, value: 3456 },
            { stage: 'email_3', count: 34, value: 2345 },
            { stage: 'sms_sent', count: 34, value: 1789 },
            { stage: 'retargeting', count: 21, value: 299 }
          ]
        },
        overall_performance: {
          total_revenue: 125456,
          marketing_spend: 23456,
          roas: 5.35,
          customer_acquisition_cost: 124,
          lifetime_value: 1456,
          conversion_funnel: {
            visitors: 12456,
            leads: 2345,
            trials: 456,
            customers: 189,
            rates: { visitor_to_lead: 18.8, lead_to_trial: 19.4, trial_to_customer: 41.4 }
          }
        }
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading marketing metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Analytics</h1>
          <p className="text-gray-600">Comprehensive view of all marketing performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <Button variant="outline" onClick={loadMarketingMetrics}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.overall_performance.total_revenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12.5% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROAS</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.overall_performance.roas.toFixed(1)}x
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8.3% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cart Recovery Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPercentage(metrics.abandoned_cart.recovery_rate)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+3.2% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatPercentage(metrics.pixel_tracking.conversion_rate)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-1.1% vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'pixels', label: 'Pixel Tracking', icon: <Eye className="w-4 h-4" /> },
          { id: 'retargeting', label: 'Retargeting', icon: <Target className="w-4 h-4" /> },
          { id: 'cart_recovery', label: 'Cart Recovery', icon: <ShoppingCart className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatNumber(metrics.overall_performance.conversion_funnel.visitors)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Visitors</div>
                  <div className="h-2 bg-blue-200 rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatNumber(metrics.overall_performance.conversion_funnel.leads)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Leads</div>
                  <div className="text-sm text-green-600 mb-2">
                    {formatPercentage(metrics.overall_performance.conversion_funnel.rates.visitor_to_lead)}
                  </div>
                  <div className="h-2 bg-green-200 rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatNumber(metrics.overall_performance.conversion_funnel.trials)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Trials</div>
                  <div className="text-sm text-purple-600 mb-2">
                    {formatPercentage(metrics.overall_performance.conversion_funnel.rates.lead_to_trial)}
                  </div>
                  <div className="h-2 bg-purple-200 rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatNumber(metrics.overall_performance.conversion_funnel.customers)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Customers</div>
                  <div className="text-sm text-orange-600 mb-2">
                    {formatPercentage(metrics.overall_performance.conversion_funnel.rates.trial_to_customer)}
                  </div>
                  <div className="h-2 bg-orange-200 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Top Events ({timeframe})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.pixel_tracking.top_events.map((event, index) => (
                  <div key={event.event} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium capitalize">{event.event.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">{formatNumber(event.count)} events</div>
                      </div>
                    </div>
                    {event.value > 0 && (
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatCurrency(event.value)}</div>
                        <div className="text-sm text-gray-600">Total Value</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'pixels' && (
        <div className="space-y-8">
          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.pixel_tracking.platform_performance).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm capitalize">{platform[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium capitalize">{platform}</div>
                        <div className="text-sm text-gray-600">
                          {'reach' in data ? `${formatNumber(data.reach)} reach` : `${formatNumber(data.impressions)} impressions`}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="font-semibold">{formatNumber(data.clicks)}</div>
                        <div className="text-sm text-gray-600">Clicks</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatNumber(data.conversions)}</div>
                        <div className="text-sm text-gray-600">Conversions</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatCurrency(data.cost)}</div>
                        <div className="text-sm text-gray-600">Spend</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'retargeting' && (
        <div className="space-y-8">
          {/* Retargeting Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.retargeting.active_audiences}</div>
                <div className="text-sm text-gray-600">Active Audiences</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(metrics.retargeting.total_audience_size)}</div>
                <div className="text-sm text-gray-600">Total Audience Size</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.retargeting.campaigns_running}</div>
                <div className="text-sm text-gray-600">Running Campaigns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{formatPercentage(metrics.retargeting.retargeting_conversion_rate)}</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Audience Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.retargeting.audience_performance.map((audience) => (
                  <div key={audience.audience_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium">{audience.name}</div>
                        <div className="text-sm text-gray-600">{formatNumber(audience.size)} people</div>
                      </div>
                      <Badge className={audience.roas >= 4 ? 'bg-green-100 text-green-800' : audience.roas >= 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {audience.roas.toFixed(1)}x ROAS
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="font-semibold">{formatNumber(audience.impressions)}</div>
                        <div className="text-sm text-gray-600">Impressions</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatNumber(audience.clicks)}</div>
                        <div className="text-sm text-gray-600">Clicks</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatNumber(audience.conversions)}</div>
                        <div className="text-sm text-gray-600">Conversions</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatCurrency(audience.cost)}</div>
                        <div className="text-sm text-gray-600">Spend</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'cart_recovery' && (
        <div className="space-y-8">
          {/* Cart Recovery Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">{formatNumber(metrics.abandoned_cart.total_abandoned)}</div>
                <div className="text-sm text-gray-600">Carts Abandoned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(metrics.abandoned_cart.total_recovered)}</div>
                <div className="text-sm text-gray-600">Carts Recovered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatPercentage(metrics.abandoned_cart.recovery_rate)}</div>
                <div className="text-sm text-gray-600">Recovery Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.abandoned_cart.recovery_value)}</div>
                <div className="text-sm text-gray-600">Revenue Recovered</div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Performance by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(metrics.abandoned_cart.recovery_by_channel).map(([channel, data]) => (
                  <div key={channel} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {channel === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                      {channel === 'sms' && <MessageSquare className="w-5 h-5 text-green-600" />}
                      {channel === 'push' && <Bell className="w-5 h-5 text-purple-600" />}
                      {channel === 'retargeting' && <Target className="w-5 h-5 text-orange-600" />}
                      <h4 className="font-medium capitalize">{channel}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sent/Shown:</span>
                        <span className="font-medium">{formatNumber('sent' in data ? data.sent : data.impressions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recovered:</span>
                        <span className="font-medium">{formatNumber(data.recovered)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium text-green-600">{formatPercentage(data.rate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium">{formatCurrency(data.value)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recovery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.abandoned_cart.recovery_timeline.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{stage.stage.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-600">{formatNumber(stage.count)} recoveries</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{formatCurrency(stage.value)}</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}