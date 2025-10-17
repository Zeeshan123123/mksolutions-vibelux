'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  MousePointer, 
  TrendingUp,
  Copy,
  Download,
  Mail,
  Share2,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Zap,
  Target,
  Eye,
  Package,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { logger } from '@/lib/client-logger';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AffiliateDashboardProps {
  affiliateId: string;
  className?: string;
}

interface AffiliateData {
  profile: {
    id: string;
    code: string;
    tier: string;
    status: string;
    baseCommission: number;
    bonusCommission: number;
    totalReferrals: number;
    activeReferrals: number;
    totalRevenue: number;
    totalCommission: number;
    pendingBalance: number;
    joinedAt: string;
  };
  metrics: {
    last30Days: {
      clicks: number;
      conversions: number;
      conversionRate: string;
      revenue: number;
    };
    lifetime: {
      referrals: number;
      activeReferrals: number;
      totalEarnings: number;
      totalClicks: number;
    };
  };
  charts: Array<{
    month: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  referralLink: string;
  marketingAssets: {
    links: Record<string, string>;
    banners: Array<{ size: string; url: string }>;
    emailTemplates: Array<{ name: string; subject: string; preview: string }>;
    socialMedia: Record<string, string>;
  };
}

const TIER_COLORS = {
  BRONZE: 'bg-amber-600',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-purple-600'
};

const TIER_BENEFITS = {
  BRONZE: { rate: 20, perks: ['Basic marketing materials', 'Monthly payouts'] },
  SILVER: { rate: 25, perks: ['Premium banners', 'Priority support', 'Weekly payouts'] },
  GOLD: { rate: 30, perks: ['Custom landing pages', 'Dedicated manager', 'Daily payouts'] },
  PLATINUM: { rate: 35, perks: ['White-label options', 'API access', 'Instant payouts'] }
};

export default function AffiliateDashboard({ affiliateId, className = '' }: AffiliateDashboardProps) {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [affiliateId]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`/api/affiliate/dashboard?id=${affiliateId}`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      logger.error('system', 'Failed to load affiliate dashboard:', error );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestPayout = async () => {
    try {
      const response = await fetch(`/api/affiliate/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId })
      });
      
      if (response.ok) {
        setShowPayoutModal(false);
        loadDashboardData(); // Refresh data
        alert('Payout requested successfully!');
      }
    } catch (error) {
      logger.error('system', 'Failed to request payout:', error );
      alert('Failed to request payout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-xl p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading affiliate dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-gray-800 rounded-xl p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-300">Failed to load affiliate data</p>
      </div>
    );
  }

  const performanceChartData = {
    labels: data.charts.map(d => d.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.charts.map(d => d.revenue),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Conversions',
        data: data.charts.map(d => d.conversions),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        tension: 0.4
      }
    ]
  };

  const clicksChartData = {
    labels: data.charts.map(d => d.month),
    datasets: [
      {
        label: 'Clicks',
        data: data.charts.map(d => d.clicks),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Affiliate Dashboard</h2>
            <p className="text-gray-400">Track your performance and earnings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${TIER_COLORS[data.profile.tier as keyof typeof TIER_COLORS]} text-white font-medium flex items-center gap-2`}>
              <Award className="w-4 h-4" />
              {data.profile.tier} Tier
            </div>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={data.profile.pendingBalance < 50}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Request Payout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <div className="text-2xl font-bold text-white">${data.profile.pendingBalance.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Pending Balance</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400">+{data.metrics.last30Days.conversions}</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.profile.activeReferrals}</div>
            <div className="text-sm text-gray-400">Active Referrals</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-purple-400">{data.metrics.last30Days.conversionRate}%</span>
            </div>
            <div className="text-2xl font-bold text-white">${data.profile.totalCommission.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-yellow-400">Last 30d</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.metrics.last30Days.clicks}</div>
            <div className="text-sm text-gray-400">Recent Clicks</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {['overview', 'referrals', 'marketing', 'payouts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Referral Link */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Your Referral Link</h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={data.referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
                <button
                  onClick={() => copyToClipboard(data.referralLink)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Share this link to start earning {data.profile.baseCommission}% commission on referrals
              </p>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Revenue & Conversions</h3>
                <Line 
                  data={performanceChartData}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: { color: '#9CA3AF' }
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                      },
                      y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                      },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#9CA3AF' }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Click Performance</h3>
                <Bar 
                  data={clicksChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                      },
                      y: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Tier Progress */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Tier Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Current Tier</span>
                    <span className={`px-3 py-1 rounded text-white text-sm ${TIER_COLORS[data.profile.tier as keyof typeof TIER_COLORS]}`}>
                      {data.profile.tier}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Commission Rate: {data.profile.baseCommission + data.profile.bonusCommission}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Active Referrals</span>
                    <span className="text-white font-medium">{data.profile.activeReferrals}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min((data.profile.activeReferrals / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {data.profile.tier === 'PLATINUM' 
                      ? 'Maximum tier reached!' 
                      : `${Math.max(0, (data.profile.tier === 'GOLD' ? 51 : data.profile.tier === 'SILVER' ? 21 : 6) - data.profile.activeReferrals)} more referrals to next tier`}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tier Benefits</h4>
                  <ul className="space-y-1">
                    {TIER_BENEFITS[data.profile.tier as keyof typeof TIER_BENEFITS].perks.map((perk, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referrals Table */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">Recent Referrals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Signed Up</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Converted</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample referral rows - replace with actual data */}
                    <tr className="border-b border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-300">john.doe@example.com</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded bg-green-600/20 text-green-400">Converted</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">Mar 15, 2024</td>
                      <td className="px-4 py-3 text-sm text-gray-400">Mar 18, 2024</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">$49.80</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.marketingAssets.links).map(([name, url]) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300 capitalize">{name}</span>
                    <button
                      onClick={() => copyToClipboard(url)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Banners */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Marketing Banners</h3>
              <div className="grid grid-cols-3 gap-4">
                {data.marketingAssets.banners.map((banner) => (
                  <div key={banner.size} className="text-center">
                    <div className="bg-gray-800 rounded p-4 mb-2">
                      <img 
                        src={banner.url} 
                        alt={`Banner ${banner.size}`}
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-400">{banner.size}</p>
                    <button className="mt-1 text-xs text-purple-400 hover:text-purple-300">
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Email Templates</h3>
              <div className="space-y-3">
                {data.marketingAssets.emailTemplates.map((template) => (
                  <div key={template.name} className="p-3 bg-gray-800 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{template.name}</h4>
                      <button className="text-purple-400 hover:text-purple-300">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Subject: {template.subject}</p>
                    <p className="text-xs text-gray-500">{template.preview}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Social Media Posts</h3>
              <div className="space-y-3">
                {Object.entries(data.marketingAssets.socialMedia).map(([platform, text]) => (
                  <div key={platform} className="p-3 bg-gray-800 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white capitalize">{platform}</h4>
                      <button
                        onClick={() => copyToClipboard(text)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">${data.profile.pendingBalance.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Available for Payout</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">$0.00</div>
                <div className="text-sm text-gray-400">Processing</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">${data.profile.totalCommission.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Total Paid Out</div>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">Payout History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-300">Mar 1, 2024</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">$249.00</td>
                      <td className="px-4 py-3 text-sm text-gray-400">Stripe</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded bg-green-600/20 text-green-400">Completed</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">tr_1234...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Minimum Payout Notice */}
            {data.profile.pendingBalance < 50 && (
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-300 mb-1">Minimum Payout Amount</h4>
                  <p className="text-xs text-yellow-200">
                    You need at least $50 in pending balance to request a payout. 
                    Current balance: ${data.profile.pendingBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Request Payout</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Available Balance</label>
                <div className="text-2xl font-bold text-white">${data.profile.pendingBalance.toFixed(2)}</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Payout Method</label>
                <select className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white">
                  <option>Stripe (Default)</option>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-500">
                Payouts are typically processed within 1-3 business days.
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={requestPayout}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}