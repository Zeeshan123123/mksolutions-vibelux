'use client';

/**
 * Admin Billing Dashboard
 * Comprehensive usage tracking and billing analytics
 */

import { useState, useEffect } from 'react';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface UsageMetrics {
  id: string;
  userId: string;
  planTier: string;
  overageStatus: string;
  apiCalls: number;
  aiQueries: number;
  exports: number;
  designsCreated: number;
  roomsCreated: number;
  fixturesAdded: number;
  mlPredictions: number;
  facilityDashboards: number;
  lastSyncedAt: string;
  user: {
    email: string;
    name: string | null;
    subscriptionTier: string;
  };
}

interface AnalyticsData {
  period: string;
  usageByPlan: any[];
  overageDistribution: any[];
  usageTrends: any[];
  topUsers: any[];
  revenue: {
    byPlan: any[];
    total: number;
  };
}

export default function AdminBillingDashboard() {
  const [usageData, setUsageData] = useState<UsageMetrics[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [planFilter, setPlanFilter] = useState('');
  const [overageFilter, setOverageFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load usage data
  useEffect(() => {
    loadUsageData();
    loadAnalytics();
  }, [planFilter, overageFilter, searchQuery, page]);

  async function loadUsageData() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (planFilter) params.append('planTier', planFilter);
      if (overageFilter) params.append('overageStatus', overageFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/billing/usage?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      setUsageData(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load usage data:', error);
      setUsageData([]); // Set to empty array on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/admin/billing/analytics');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(null);
    }
  }

  async function exportToCSV() {
    try {
      setExporting(true);
      const response = await fetch('/api/admin/billing/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  }

  // Chart data
  const usageTrendsChart = (analytics && analytics.usageTrends && analytics.usageTrends.length > 0) ? {
    labels: analytics.usageTrends.map((t) => t.period),
    datasets: [
      {
        label: 'API Calls',
        data: analytics.usageTrends.map((t) => t.apiCalls || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
      {
        label: 'AI Queries',
        data: analytics.usageTrends.map((t) => t.aiQueries || 0),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
      },
      {
        label: 'Exports',
        data: analytics.usageTrends.map((t) => t.exports || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
    ],
  } : null;

  const overageDistributionChart = (analytics && analytics.overageDistribution && analytics.overageDistribution.length > 0) ? {
    labels: analytics.overageDistribution.map((o) => o.overageStatus),
    datasets: [
      {
        data: analytics.overageDistribution.map((o) => o._count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  } : null;

  const revenueByPlanChart = (analytics && analytics.revenue && analytics.revenue.byPlan && analytics.revenue.byPlan.length > 0) ? {
    labels: analytics.revenue.byPlan.map((p) => p.planTier),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: analytics.revenue.byPlan.map((p) => p.monthlyRevenue),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(167, 139, 250, 0.8)',
          'rgba(196, 181, 253, 0.8)',
        ],
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Usage Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor platform usage, track billing, and analyze revenue
          </p>
        </div>

        {/* Summary Cards */}
        {analytics && analytics.revenue && analytics.usageByPlan && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">
                ${(analytics.revenue.total || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Monthly recurring</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Active Users</h3>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.usageByPlan.reduce((sum, p) => sum + (p._count || 0), 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">This billing period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total API Calls</h3>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.usageByPlan.reduce((sum, p) => sum + (p._sum?.apiCalls || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">All plans combined</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">AI Queries</h3>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.usageByPlan.reduce((sum, p) => sum + (p._sum?.aiQueries || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">All plans combined</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usage Trends (6 Months)
            </h3>
            {usageTrendsChart && (
              <Line
                data={usageTrendsChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
            )}
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Plan Tier
            </h3>
            {revenueByPlanChart && (
              <Bar
                data={revenueByPlanChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Overage Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overage Status Distribution
            </h3>
            {overageDistributionChart && (
              <div className="flex justify-center">
                <div style={{ maxWidth: '300px', maxHeight: '300px' }}>
                  <Pie
                    data={overageDistributionChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Users by API Calls
            </h3>
            {analytics && (
              <div className="space-y-2">
                {analytics.topUsers.slice(0, 10).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.user.email}</p>
                        <p className="text-xs text-gray-500">{user.planTier}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {user.apiCalls.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={overageFilter}
              onChange={(e) => setOverageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ok">OK</option>
              <option value="warning_80">Warning 80%</option>
              <option value="warning_90">Warning 90%</option>
              <option value="exceeded_100">Exceeded 100%</option>
            </select>

            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Usage Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">API</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">AI</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Exports</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Designs</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fixtures</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : !usageData || usageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  usageData.map((metrics) => (
                    <tr key={metrics.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{metrics.user.email}</div>
                          {metrics.user.name && (
                            <div className="text-sm text-gray-500">{metrics.user.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {metrics.planTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          metrics.overageStatus === 'ok' ? 'bg-green-100 text-green-800' :
                          metrics.overageStatus === 'warning_80' ? 'bg-yellow-100 text-yellow-800' :
                          metrics.overageStatus === 'warning_90' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metrics.overageStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {metrics.apiCalls.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {metrics.aiQueries.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {metrics.exports.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {metrics.designsCreated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {metrics.fixturesAdded.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

