'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  PieChart,
  TrendingDown,
  Award,
  Building2,
  MapPin,
  Tag,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  MessageSquare,
  UserPlus,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Settings,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  Circle,
  CheckSquare,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { CustomerRelationshipManager, Customer, Opportunity, Interaction, CRMTask, SalesMetrics, PipelineStage } from '@/lib/crm/customer-management';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export function CRMDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'opportunities' | 'tasks' | 'reports'>('overview');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [pipeline, setPipeline] = useState<Record<PipelineStage, Opportunity[]>>({
    qualified_lead: [],
    discovery: [],
    demo: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
    closed_lost: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const crm = new CustomerRelationshipManager('default-facility', 'current-user');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be API calls
      const mockCustomers: Customer[] = [
        {
          id: 'cust-1',
          type: 'business',
          status: 'customer',
          companyName: 'Green Valley Farms',
          email: 'contact@greenvalley.com',
          phone: '(555) 123-4567',
          address: {
            street: '123 Farm Road',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814',
            country: 'USA'
          },
          industry: 'agriculture',
          companySize: '51-100',
          annualRevenue: 2500000,
          leadSource: 'website',
          leadScore: 85,
          qualificationStatus: 'qualified',
          totalSpent: 145000,
          lifetimeValue: 250000,
          customFields: {},
          tags: ['premium', 'california'],
          notes: 'Large operation with expansion plans',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-07-10'),
          lastContactDate: new Date('2024-07-10'),
          nextFollowUpDate: new Date('2024-07-20')
        },
        {
          id: 'cust-2',
          type: 'business',
          status: 'prospect',
          companyName: 'Urban Grow Systems',
          email: 'info@urbangrow.com',
          phone: '(555) 987-6543',
          address: {
            street: '456 City Plaza',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202',
            country: 'USA'
          },
          industry: 'hydroponics',
          companySize: '11-50',
          annualRevenue: 800000,
          leadSource: 'trade_show',
          leadScore: 72,
          qualificationStatus: 'qualified',
          totalSpent: 0,
          lifetimeValue: 0,
          customFields: {},
          tags: ['colorado', 'hydroponics'],
          notes: 'Interested in vertical farming solutions',
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-07-12'),
          lastContactDate: new Date('2024-07-12'),
          nextFollowUpDate: new Date('2024-07-18')
        }
      ];

      const mockOpportunities: Opportunity[] = [
        {
          id: 'opp-1',
          customerId: 'cust-1',
          name: 'Facility Expansion Project',
          description: 'LED lighting upgrade for 10,000 sq ft facility',
          value: 85000,
          probability: 80,
          stage: 'proposal',
          status: 'open',
          expectedCloseDate: new Date('2024-08-15'),
          assignedTo: 'sales-rep-1',
          products: [
            {
              id: 'prod-1',
              name: 'VibeLux Pro Series',
              quantity: 50,
              unitPrice: 1500,
              discount: 0.1,
              totalPrice: 67500
            }
          ],
          createdAt: new Date('2024-06-15'),
          updatedAt: new Date('2024-07-10'),
          tags: ['expansion', 'lighting'],
          notes: 'Customer needs financing options'
        },
        {
          id: 'opp-2',
          customerId: 'cust-2',
          name: 'Vertical Growing Setup',
          description: 'Complete vertical growing system for urban facility',
          value: 45000,
          probability: 60,
          stage: 'demo',
          status: 'open',
          expectedCloseDate: new Date('2024-08-30'),
          assignedTo: 'sales-rep-2',
          products: [
            {
              id: 'prod-2',
              name: 'VibeLux Vertical System',
              quantity: 1,
              unitPrice: 45000,
              discount: 0,
              totalPrice: 45000
            }
          ],
          createdAt: new Date('2024-07-01'),
          updatedAt: new Date('2024-07-12'),
          tags: ['vertical', 'demo'],
          notes: 'Scheduled demo for next week'
        }
      ];

      const mockTasks: CRMTask[] = [
        {
          id: 'task-1',
          customerId: 'cust-1',
          opportunityId: 'opp-1',
          title: 'Send financing options',
          description: 'Customer requested financing options for expansion project',
          type: 'follow_up',
          priority: 'high',
          status: 'pending',
          assignedTo: 'sales-rep-1',
          assignedBy: 'manager-1',
          dueDate: new Date('2024-07-18'),
          tags: ['financing', 'follow_up'],
          attachments: [],
          createdAt: new Date('2024-07-15'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'task-2',
          customerId: 'cust-2',
          opportunityId: 'opp-2',
          title: 'Schedule product demo',
          description: 'Schedule on-site demo of vertical growing system',
          type: 'demo',
          priority: 'medium',
          status: 'pending',
          assignedTo: 'sales-rep-2',
          assignedBy: 'manager-1',
          dueDate: new Date('2024-07-20'),
          tags: ['demo', 'on_site'],
          attachments: [],
          createdAt: new Date('2024-07-12'),
          updatedAt: new Date('2024-07-12')
        }
      ];

      const mockMetrics: SalesMetrics = {
        totalRevenue: 145000,
        newCustomers: 12,
        churnRate: 2.5,
        conversionRate: 15.8,
        averageDealSize: 65000,
        salesCycleLength: 45,
        pipelineValue: 250000,
        customerLifetimeValue: 180000,
        customerAcquisitionCost: 2500,
        monthlyRecurringRevenue: 25000,
        netPromoterScore: 68,
        customerSatisfactionScore: 4.2
      };

      setCustomers(mockCustomers);
      setOpportunities(mockOpportunities);
      setTasks(mockTasks);
      setMetrics(mockMetrics);

      // Build pipeline
      const pipelineData: Record<PipelineStage, Opportunity[]> = {
        qualified_lead: [],
        discovery: [],
        demo: [mockOpportunities[1]],
        proposal: [mockOpportunities[0]],
        negotiation: [],
        closed_won: [],
        closed_lost: []
      };
      setPipeline(pipelineData);

    } catch (error) {
      logger.error('system', 'Failed to load dashboard data:', error );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'text-green-400 bg-green-900/20';
      case 'prospect': return 'text-blue-400 bg-blue-900/20';
      case 'lead': return 'text-yellow-400 bg-yellow-900/20';
      case 'inactive': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-blue-400 bg-blue-900/20';
      case 'low': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'qualified_lead': return 'bg-gray-600';
      case 'discovery': return 'bg-blue-600';
      case 'demo': return 'bg-purple-600';
      case 'proposal': return 'bg-yellow-600';
      case 'negotiation': return 'bg-orange-600';
      case 'closed_won': return 'bg-green-600';
      case 'closed_lost': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const revenueData = [
    { month: 'Jan', revenue: 85000, target: 100000 },
    { month: 'Feb', revenue: 92000, target: 100000 },
    { month: 'Mar', revenue: 78000, target: 100000 },
    { month: 'Apr', revenue: 105000, target: 100000 },
    { month: 'May', revenue: 98000, target: 100000 },
    { month: 'Jun', revenue: 112000, target: 100000 },
    { month: 'Jul', revenue: 125000, target: 100000 }
  ];

  const pipelineData = [
    { stage: 'Qualified Lead', value: 50000, count: 5 },
    { stage: 'Discovery', value: 85000, count: 8 },
    { stage: 'Demo', value: 45000, count: 3 },
    { stage: 'Proposal', value: 85000, count: 2 },
    { stage: 'Negotiation', value: 65000, count: 4 },
    { stage: 'Closed Won', value: 145000, count: 6 }
  ];

  const leadSourceData = [
    { name: 'Website', value: 35, color: '#8b5cf6' },
    { name: 'Referral', value: 25, color: '#06b6d4' },
    { name: 'Trade Show', value: 20, color: '#10b981' },
    { name: 'Social Media', value: 15, color: '#f59e0b' },
    { name: 'Cold Outreach', value: 5, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading CRM Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Relationship Management</h1>
            <p className="text-gray-400">Manage customers, opportunities, and sales pipeline</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Target className="w-4 h-4" />
              New Opportunity
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'opportunities', label: 'Opportunities', icon: Target },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${metrics?.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-xs text-green-400 mt-1">+12% from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metrics?.newCustomers}
                </div>
                <div className="text-sm text-gray-400">New Customers</div>
                <div className="text-xs text-blue-400 mt-1">+25% from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-900/20 rounded-lg">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <ArrowDown className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${metrics?.pipelineValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Pipeline Value</div>
                <div className="text-xs text-red-400 mt-1">-5% from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-900/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metrics?.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
                <div className="text-xs text-green-400 mt-1">+2% from last month</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
                  <p className="text-sm text-gray-400">Monthly revenue vs target</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Target</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#6b7280', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline and Lead Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Pipeline */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sales Pipeline</h3>
                <div className="space-y-3">
                  {Object.entries(pipeline).map(([stage, opportunities]) => (
                    <div key={stage} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStageColor(stage as PipelineStage)}`}></div>
                        <span className="text-sm text-white capitalize">{stage.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{opportunities.length} deals</span>
                        <span className="text-sm text-white font-medium">
                          ${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Sources */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <div className="text-sm text-gray-400">
                {filteredCustomers.length} customers
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Lead Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {customer.companyName?.charAt(0) || customer.firstName?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {customer.companyName || `${customer.firstName} ${customer.lastName}`}
                              </div>
                              <div className="text-sm text-gray-400">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-white">{customer.leadScore}</div>
                            <div className="ml-2 w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${customer.leadScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          ${customer.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {customer.lastContactDate ? customer.lastContactDate.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerModal(true);
                              }}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-300">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            {/* Opportunities List */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Opportunities</h3>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-medium">{opportunity.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(opportunity.stage)} text-white`}>
                            {opportunity.stage.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{opportunity.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Value: ${opportunity.value.toLocaleString()}</span>
                          <span>Probability: {opportunity.probability}%</span>
                          <span>Expected Close: {opportunity.expectedCloseDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Tasks List */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">My Tasks</h3>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Due: {task.dueDate.toLocaleDateString()}</span>
                            <span>Type: {task.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <CheckSquare className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Customer Details</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-400">Company:</span>
                      <span className="text-sm text-white ml-2">{selectedCustomer.companyName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Email:</span>
                      <span className="text-sm text-white ml-2">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Phone:</span>
                      <span className="text-sm text-white ml-2">{selectedCustomer.phone}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Industry:</span>
                      <span className="text-sm text-white ml-2">{selectedCustomer.industry}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Financial Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-400">Total Spent:</span>
                      <span className="text-sm text-white ml-2">${selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Lifetime Value:</span>
                      <span className="text-sm text-white ml-2">${selectedCustomer.lifetimeValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Lead Score:</span>
                      <span className="text-sm text-white ml-2">{selectedCustomer.leadScore}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ml-2 ${getStatusColor(selectedCustomer.status)}`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">Notes</h3>
                <p className="text-sm text-gray-400">{selectedCustomer.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}