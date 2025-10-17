'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Phone,
  Mail,
  Calendar,
  FileText,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  MessageSquare,
  Building2,
  Lightbulb,
  Zap,
  Leaf
} from 'lucide-react';

interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  type: 'greenhouse' | 'indoor_farm' | 'research' | 'retail';
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  lastContact: string;
  nextAction: string;
  products: string[];
  notes: string;
}

interface Sale {
  id: string;
  customer: string;
  project: string;
  value: number;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  status: 'active' | 'completed' | 'delayed';
  closeDate: string;
  commission: number;
}

export default function SalesDemo() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'opportunities' | 'customers' | 'products' | 'reports'>('dashboard');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const leads: Lead[] = [
    {
      id: 'lead-1',
      company: 'Green Valley Farms',
      contact: 'Sarah Johnson',
      email: 'sarah@greenvalley.com',
      phone: '+1 555-0123',
      type: 'greenhouse',
      stage: 'proposal',
      value: 485000,
      probability: 75,
      lastContact: '2024-01-28',
      nextAction: 'Follow up on proposal',
      products: ['SPYDR 2p', 'RAZR', 'PhysioSpec'],
      notes: 'Interested in 50,000 sq ft tomato facility. Budget approved for Q2.'
    },
    {
      id: 'lead-2',
      company: 'Urban Harvest Co',
      contact: 'Mike Chen',
      email: 'mike@urbanharvest.com',
      phone: '+1 555-0124',
      type: 'indoor_farm',
      stage: 'negotiation',
      value: 750000,
      probability: 85,
      lastContact: '2024-01-30',
      nextAction: 'Schedule contract review',
      products: ['SPYDR 2p', 'VYPR 3p'],
      notes: 'Vertical farming facility. Needs custom spectrum. Very hot lead.'
    },
    {
      id: 'lead-3',
      company: 'AgriTech Research',
      contact: 'Dr. Lisa Wang',
      email: 'lwang@agritech.edu',
      phone: '+1 555-0125',
      type: 'research',
      stage: 'qualified',
      value: 125000,
      probability: 60,
      lastContact: '2024-01-25',
      nextAction: 'Send technical specifications',
      products: ['PhysioSpec', 'RAZR'],
      notes: 'University research lab. Grant funding secured. Long sales cycle.'
    },
    {
      id: 'lead-4',
      company: 'Fresh Leaf Dispensary',
      contact: 'Tony Rodriguez',
      email: 'tony@freshleaf.com',
      phone: '+1 555-0126',
      type: 'retail',
      stage: 'lead',
      value: 95000,
      probability: 35,
      lastContact: '2024-01-20',
      nextAction: 'Schedule site visit',
      products: ['SPYDR 2p'],
      notes: 'Cannabis cultivation. Compliance requirements. Price sensitive.'
    }
  ];

  const recentSales: Sale[] = [
    {
      id: 'sale-1',
      customer: 'Apex Farms',
      project: 'Tomato Facility Expansion',
      value: 425000,
      products: [
        { name: 'SPYDR 2p', quantity: 85, price: 4200 },
        { name: 'Installation', quantity: 1, price: 68000 }
      ],
      status: 'completed',
      closeDate: '2024-01-15',
      commission: 21250
    },
    {
      id: 'sale-2',
      customer: 'Greentech Solutions',
      project: 'R&D Laboratory',
      value: 185000,
      products: [
        { name: 'PhysioSpec', quantity: 12, price: 12500 },
        { name: 'RAZR', quantity: 8, price: 3800 }
      ],
      status: 'active',
      closeDate: '2024-02-28',
      commission: 9250
    }
  ];

  const salesMetrics = {
    thisMonth: {
      revenue: 825000,
      deals: 7,
      pipeline: 2450000,
      conversion: 18.5
    },
    thisQuarter: {
      revenue: 2100000,
      deals: 23,
      pipeline: 3850000,
      conversion: 22.1
    },
    targets: {
      monthlyRevenue: 900000,
      quarterlyRevenue: 2800000,
      deals: 25,
      newLeads: 40
    }
  };

  const productCatalog = [
    {
      name: 'SPYDR 2p',
      category: 'Full Spectrum LED',
      price: 4200,
      efficiency: '2.9 µmol/J',
      coverage: '4x4 ft',
      applications: ['Greenhouse', 'Indoor Farm'],
      inStock: true
    },
    {
      name: 'VYPR 3p',
      category: 'High PPFD LED',
      price: 5800,
      efficiency: '3.1 µmol/J',
      coverage: '5x5 ft',
      applications: ['Vertical Farming', 'Cannabis'],
      inStock: true
    },
    {
      name: 'PhysioSpec',
      category: 'Research LED',
      price: 12500,
      efficiency: '2.8 µmol/J',
      coverage: '3x3 ft',
      applications: ['Research', 'Breeding'],
      inStock: false
    },
    {
      name: 'RAZR',
      category: 'Supplemental LED',
      price: 3800,
      efficiency: '2.7 µmol/J',
      coverage: '6x2 ft',
      applications: ['Greenhouse Supplement'],
      inStock: true
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-500';
      case 'qualified': return 'bg-blue-500';
      case 'proposal': return 'bg-yellow-500';
      case 'negotiation': return 'bg-orange-500';
      case 'closed_won': return 'bg-green-500';
      case 'closed_lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'greenhouse': return <Building2 className="w-4 h-4" />;
      case 'indoor_farm': return <Leaf className="w-4 h-4" />;
      case 'research': return <Target className="w-4 h-4" />;
      case 'retail': return <Users className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold">Sales Portal</h1>
                  <p className="text-sm text-gray-400">Horticultural Lighting Solutions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Lead
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Sales Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Revenue MTD</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesMetrics.thisMonth.revenue)}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-green-400">
              {((salesMetrics.thisMonth.revenue / salesMetrics.targets.monthlyRevenue) * 100).toFixed(1)}% of target
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pipeline</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesMetrics.thisMonth.pipeline)}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-400">15 active opportunities</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold">{salesMetrics.thisMonth.conversion}%</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-400">+2.3% vs last month</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Deals Closed</p>
                  <p className="text-2xl font-bold">{salesMetrics.thisMonth.deals}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-orange-400">7 this month</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'opportunities', label: 'Opportunities', icon: Target },
              { id: 'customers', label: 'Customers', icon: Building2 },
              { id: 'products', label: 'Products', icon: Lightbulb },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Hot Opportunities</h3>
                <div className="space-y-4">
                  {leads.filter(l => l.probability >= 70).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(lead.type)}
                        <div>
                          <h4 className="font-medium">{lead.company}</h4>
                          <p className="text-sm text-gray-400">{lead.contact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">{formatCurrency(lead.value)}</p>
                        <p className="text-sm text-gray-400">{lead.probability}% probability</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          sale.status === 'completed' ? 'bg-green-500' :
                          sale.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium">{sale.customer}</h4>
                          <p className="text-sm text-gray-400">{sale.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(sale.value)}</p>
                        <p className="text-sm text-green-400">+{formatCurrency(sale.commission)} commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales Funnel */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {[
                  { stage: 'Leads', count: 24, value: 1200000, color: 'bg-gray-600' },
                  { stage: 'Qualified', count: 18, value: 980000, color: 'bg-blue-600' },
                  { stage: 'Proposal', count: 12, value: 750000, color: 'bg-yellow-600' },
                  { stage: 'Negotiation', count: 8, value: 540000, color: 'bg-orange-600' },
                  { stage: 'Closed Won', count: 5, value: 425000, color: 'bg-green-600' },
                  { stage: 'Closed Lost', count: 3, value: 0, color: 'bg-red-600' }
                ].map((stage, index) => (
                  <div key={index} className="text-center">
                    <div className={`${stage.color} rounded-lg p-4 mb-2`}>
                      <div className="text-2xl font-bold">{stage.count}</div>
                      <div className="text-sm opacity-90">{stage.stage}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatCurrency(stage.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option>All Stages</option>
                    <option>Lead</option>
                    <option>Qualified</option>
                    <option>Proposal</option>
                    <option>Negotiation</option>
                  </select>
                  <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option>All Types</option>
                    <option>Greenhouse</option>
                    <option>Indoor Farm</option>
                    <option>Research</option>
                    <option>Retail</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Filter className="w-4 h-4 inline mr-2" />
                    Filters
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer"
                    onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(lead.type)}
                          <div>
                            <h4 className="font-medium">{lead.company}</h4>
                            <p className="text-sm text-gray-400">{lead.contact} • {lead.email}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs text-white ${getStageColor(lead.stage)}`}>
                          {lead.stage.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">{formatCurrency(lead.value)}</p>
                        <p className="text-sm text-gray-400">{lead.probability}% probability</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <span>Products: {lead.products.join(', ')}</span>
                        <span>Last contact: {new Date(lead.lastContact).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-white">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {selectedLead === lead.id && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Next Action</h5>
                            <p className="text-sm text-gray-400">{lead.nextAction}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Notes</h5>
                            <p className="text-sm text-gray-400">{lead.notes}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                            Update Stage
                          </button>
                          <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                            Create Quote
                          </button>
                          <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm">
                            Schedule Call
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Product Catalog</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Price List
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Download className="w-4 h-4 inline mr-2" />
                    Catalog PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productCatalog.map((product, index) => (
                  <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-400" />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-400">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">{formatCurrency(product.price)}</p>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          product.inStock ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Backorder'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Efficiency:</span>
                        <p className="font-medium">{product.efficiency}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Coverage:</span>
                        <p className="font-medium">{product.coverage}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-gray-400 text-sm">Applications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.applications.map((app, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-600 rounded-full text-xs">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                        Add to Quote
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Performance Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Revenue Analytics</p>
                    <p className="text-sm text-gray-500">Monthly performance tracking</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">SPYDR 2p</span>
                    <span className="text-green-400 font-medium">$1.2M (45%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">VYPR 3p</span>
                    <span className="text-blue-400 font-medium">$850K (32%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">PhysioSpec</span>
                    <span className="text-purple-400 font-medium">$420K (16%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">RAZR</span>
                    <span className="text-orange-400 font-medium">$185K (7%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">127</div>
                  <p className="text-sm text-gray-400">Calls Made</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">89</div>
                  <p className="text-sm text-gray-400">Emails Sent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">24</div>
                  <p className="text-sm text-gray-400">Meetings Held</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-2">15</div>
                  <p className="text-sm text-gray-400">Proposals Sent</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}