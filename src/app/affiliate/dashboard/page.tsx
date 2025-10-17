'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  DollarSign, TrendingUp, Users, MousePointer, Link2, Copy,
  Download, Calendar, ChevronRight, Award, Zap, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  pendingPayout: number;
  activeReferrals: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierProgress: number;
}

interface AffiliateLink {
  id: string;
  url: string;
  shortCode: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: Date;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'trial' | 'active' | 'churned';
  plan: string;
  monthlyValue: number;
  lifetimeValue: number;
  signedUpAt: Date;
  lastActiveAt: Date;
}

export default function AffiliateDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      const [statsRes, linksRes, referralsRes] = await Promise.all([
        fetch('/api/affiliate/stats'),
        fetch('/api/affiliate/links'),
        fetch('/api/affiliate/referrals')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setAffiliateCode(data.affiliateCode);
      }

      if (linksRes.ok) {
        const data = await linksRes.json();
        setLinks(data.links);
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateLink = async () => {
    if (!newLinkUrl) return;
    
    setCreatingLink(true);
    try {
      const response = await fetch('/api/affiliate/links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://vibelux.ai${newLinkUrl}` 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLinks([data.link, ...links]);
        setNewLinkUrl('');
        toast.success('Affiliate link created!');
      }
    } catch (error) {
      toast.error('Failed to create link');
    } finally {
      setCreatingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-400';
      case 'silver': return 'text-gray-300';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'trial': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'churned': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading affiliate dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <Award className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Become a VibeLux Affiliate</h2>
            <p className="text-gray-400 mb-6">
              Earn up to 40% recurring commission by referring customers to VibeLux
            </p>
            <button
              onClick={() => router.push('/affiliate/register')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
              <p className="text-gray-400">
                Your affiliate code: 
                <span className="ml-2 font-mono text-purple-400">{affiliateCode}</span>
                <button
                  onClick={() => copyToClipboard(affiliateCode)}
                  className="ml-2 text-gray-500 hover:text-white"
                >
                  <Copy className="w-4 h-4 inline" />
                </button>
              </p>
            </div>
            <div className={`flex items-center gap-2 ${getTierColor(stats.tier)}`}>
              <Award className="w-6 h-6" />
              <span className="text-lg font-semibold capitalize">{stats.tier} Partner</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-500">All Time</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Clicks</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-green-400">
                {stats.conversionRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalConversions}</div>
            <div className="text-sm text-gray-400">Conversions</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-500">Lifetime</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${stats.totalCommission.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Earned</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-yellow-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${stats.pendingPayout.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Next Payout</div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tier Progress</h3>
            <span className="text-sm text-gray-400">
              {stats.activeReferrals} active referrals
            </span>
          </div>
          <div className="relative">
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${stats.nextTierProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Current: {stats.tier}</span>
              <span className="text-xs text-gray-500">
                Next tier at {stats.tier === 'bronze' ? '11' : stats.tier === 'silver' ? '51' : '101'} referrals
              </span>
            </div>
          </div>
        </div>

        {/* Create Link Section */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Create Affiliate Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="Enter page URL (e.g., /pricing)"
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={createAffiliateLink}
              disabled={creatingLink || !newLinkUrl}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creatingLink ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Your Affiliate Links</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3">Link</th>
                  <th className="pb-3">Clicks</th>
                  <th className="pb-3">Conversions</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {links.map((link) => (
                  <tr key={link.id} className="border-t border-gray-800">
                    <td className="py-3">
                      <div className="font-mono text-sm text-purple-400">
                        vibelux.ai/{link.shortCode}
                      </div>
                      <div className="text-xs text-gray-500">{link.url}</div>
                    </td>
                    <td className="py-3">{link.clicks}</td>
                    <td className="py-3">{link.conversions}</td>
                    <td className="py-3">${link.revenue.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(`https://vibelux.ai/${link.shortCode}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Referrals</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Monthly Value</th>
                  <th className="pb-3">Lifetime Value</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-t border-gray-800">
                    <td className="py-3">
                      <div className="text-sm">{referral.email}</div>
                    </td>
                    <td className="py-3">
                      <span className={`text-sm ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{referral.plan}</td>
                    <td className="py-3">${referral.monthlyValue}</td>
                    <td className="py-3">${referral.lifetimeValue.toLocaleString()}</td>
                    <td className="py-3 text-sm text-gray-400">
                      {new Date(referral.signedUpAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}