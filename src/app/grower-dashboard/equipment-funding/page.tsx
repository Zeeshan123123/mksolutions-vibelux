'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Package, DollarSign, Users, Clock, TrendingUp, Eye,
  MessageSquare, FileText, Settings, Plus, Filter,
  BarChart3, Calendar, AlertCircle, CheckCircle,
  ChevronRight, Download, Shield, Zap, Building
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface EquipmentRequest {
  id: string;
  title: string;
  equipmentType: string;
  requestedAmount: number;
  status: 'draft' | 'active' | 'funded' | 'closed';
  viewCount: number;
  offerCount: number;
  averageOffer: number;
  bestOffer: number;
  createdAt: string;
  fundingProgress: number;
}

interface ActiveAgreement {
  id: string;
  equipmentName: string;
  investorName: string;
  investmentAmount: number;
  revenueShare: number;
  monthlyPayment: number;
  totalPaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
  performance: 'on-track' | 'ahead' | 'behind';
}

export default function GrowerEquipmentDashboard() {
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'agreements' | 'analytics'>('overview');
  
  // Mock data
  const [requests, setRequests] = useState<EquipmentRequest[]>([
    {
      id: '1',
      title: 'LED Lighting Upgrade for Flower Room A',
      equipmentType: 'Lighting',
      requestedAmount: 125000,
      status: 'active',
      viewCount: 156,
      offerCount: 4,
      averageOffer: 118000,
      bestOffer: 125000,
      createdAt: '2025-01-28',
      fundingProgress: 85
    },
    {
      id: '2',
      title: 'Automated Irrigation System',
      equipmentType: 'Irrigation',
      requestedAmount: 45000,
      status: 'funded',
      viewCount: 89,
      offerCount: 3,
      averageOffer: 43000,
      bestOffer: 45000,
      createdAt: '2025-01-15',
      fundingProgress: 100
    }
  ]);

  const [agreements, setAgreements] = useState<ActiveAgreement[]>([
    {
      id: '1',
      equipmentName: 'HVAC System Upgrade',
      investorName: 'Green Capital Partners',
      investmentAmount: 85000,
      revenueShare: 12,
      monthlyPayment: 1416,
      totalPaid: 12744,
      remainingBalance: 72256,
      nextPaymentDate: '2025-02-15',
      performance: 'on-track'
    }
  ]);

  const dashboardMetrics = {
    totalRequested: requests.reduce((sum, r) => sum + r.requestedAmount, 0),
    totalFunded: agreements.reduce((sum, a) => sum + a.investmentAmount, 0),
    activeRequests: requests.filter(r => r.status === 'active').length,
    totalOffers: requests.reduce((sum, r) => sum + r.offerCount, 0),
    monthlyPayments: agreements.reduce((sum, a) => sum + a.monthlyPayment, 0),
    avgFundingTime: 7 // days
  };

  const performanceData = [
    { month: 'Aug', revenue: 100000, equipmentROI: 0 },
    { month: 'Sep', revenue: 105000, equipmentROI: 2000 },
    { month: 'Oct', revenue: 108000, equipmentROI: 3500 },
    { month: 'Nov', revenue: 115000, equipmentROI: 5200 },
    { month: 'Dec', revenue: 118000, equipmentROI: 6800 },
    { month: 'Jan', revenue: 125000, equipmentROI: 8500 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm">Active Requests</p>
          <p className="text-2xl font-bold text-white">{dashboardMetrics.activeRequests}</p>
          <p className="text-xs text-gray-500 mt-1">{dashboardMetrics.totalOffers} total offers</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm">Total Funded</p>
          <p className="text-2xl font-bold text-white">
            ${dashboardMetrics.totalFunded.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${dashboardMetrics.totalRequested.toLocaleString()} requested
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">Monthly Payments</p>
          <p className="text-2xl font-bold text-white">
            ${dashboardMetrics.monthlyPayments.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">All agreements</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm">Avg. Funding Time</p>
          <p className="text-2xl font-bold text-white">{dashboardMetrics.avgFundingTime} days</p>
          <p className="text-xs text-gray-500 mt-1">From post to funded</p>
        </div>
      </div>

      {/* Revenue Impact Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Revenue Impact from Equipment</h3>
          <select className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white">
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6B7280"
              strokeWidth={2}
              name="Total Revenue"
            />
            <Line
              type="monotone"
              dataKey="equipmentROI"
              stroke="#10B981"
              strokeWidth={2}
              name="Equipment ROI"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Equipment investments have generated{' '}
            <span className="text-green-400 font-semibold">$28,500</span> in additional revenue,
            representing a <span className="text-green-400 font-semibold">22.8%</span> return on investment.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/equipment-board/create"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <Plus className="w-8 h-8 text-purple-400" />
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-white font-semibold mb-1">New Equipment Request</h3>
          <p className="text-sm text-gray-400">Post a new funding request</p>
        </Link>

        <Link
          href="/marketplace/equipment-funding"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-white font-semibold mb-1">Browse Investors</h3>
          <p className="text-sm text-gray-400">See active investor profiles</p>
        </Link>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">Facility Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400">92</span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      {/* Request List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Equipment Requests</h3>
          <Link
            href="/equipment-board/create"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Best Offer
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{request.title}</p>
                      <p className="text-xs text-gray-400">{request.equipmentType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    ${request.requestedAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'active' 
                        ? 'bg-green-400/10 text-green-400'
                        : request.status === 'funded'
                        ? 'bg-blue-400/10 text-blue-400'
                        : 'bg-gray-400/10 text-gray-400'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>{request.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{request.offerCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {request.bestOffer > 0 ? (
                      <div>
                        <p className="text-white font-medium">
                          ${request.bestOffer.toLocaleString()}
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${request.fundingProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No offers yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/equipment-board/${request.id}/manage`}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Manage
                      </Link>
                      {request.offerCount > 0 && (
                        <Link
                          href={`/equipment-board/${request.id}/offers`}
                          className="text-green-400 hover:text-green-300 text-sm font-medium"
                        >
                          View Offers
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAgreements = () => (
    <div className="space-y-6">
      {/* Active Agreements */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Active Revenue Share Agreements</h3>
        </div>
        
        <div className="divide-y divide-gray-800">
          {agreements.map((agreement) => (
            <div key={agreement.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {agreement.equipmentName}
                  </h4>
                  <p className="text-gray-400">
                    Investor: {agreement.investorName} • {agreement.revenueShare}% revenue share
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  agreement.performance === 'on-track' 
                    ? 'bg-green-400/10 text-green-400'
                    : agreement.performance === 'ahead'
                    ? 'bg-blue-400/10 text-blue-400'
                    : 'bg-yellow-400/10 text-yellow-400'
                }`}>
                  {agreement.performance}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Investment Amount</p>
                  <p className="text-lg font-semibold text-white">
                    ${agreement.investmentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Monthly Payment</p>
                  <p className="text-lg font-semibold text-white">
                    ${agreement.monthlyPayment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Paid</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${agreement.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Remaining</p>
                  <p className="text-lg font-semibold text-white">
                    ${agreement.remainingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Next payment due: {new Date(agreement.nextPaymentDate).toLocaleDateString()}
                  </span>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  Make Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Coming Soon */}
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
        <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Equipment ROI Analytics</h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Detailed analytics showing equipment performance, ROI calculations, and optimization 
          recommendations will be available here. Track which equipment provides the best returns 
          and make data-driven investment decisions.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Equipment Funding Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage equipment requests and investor relationships</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace/equipment-funding"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                View Marketplace
              </Link>
              <Link
                href="/equipment-board/create"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'requests', label: 'Requests', icon: Package },
              { id: 'agreements', label: 'Agreements', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'agreements' && renderAgreements()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
}