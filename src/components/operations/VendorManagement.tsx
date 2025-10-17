'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Award,
  TrendingDown,
  ShoppingCart,
  Truck,
  CreditCard,
  Target,
  Activity,
  Database,
  Bell,
  X,
  Save,
  Send,
  Archive,
  ExternalLink,
  Calculator,
  Zap,
  MessageSquare,
  UserCheck,
  FileCheck,
  Scale,
  Timer,
  CheckSquare
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Vendor {
  id: string;
  name: string;
  type: 'nutrients' | 'equipment' | 'supplies' | 'services' | 'genetics' | 'packaging' | 'testing';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  businessInfo: {
    businessLicense: string;
    taxId: string;
    established: Date;
    certifications: string[];
    insurance: {
      carrier: string;
      policyNumber: string;
      expiryDate: Date;
    };
  };
  financialInfo: {
    paymentTerms: 'cod' | 'net15' | 'net30' | 'net60';
    creditLimit: number;
    currentBalance: number;
    totalSpend: number;
    averageOrderValue: number;
    currency: string;
  };
  performanceMetrics: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number; // hours
    defectRate: number;
    priceCompetitiveness: number;
    overallScore: number;
  };
  contracts: VendorContract[];
  notes: string;
  tags: string[];
  lastOrderDate?: Date;
  nextReviewDate: Date;
}

interface VendorContract {
  id: string;
  contractNumber: string;
  type: 'purchase' | 'service' | 'maintenance' | 'subscription';
  status: 'active' | 'expired' | 'pending' | 'terminated';
  startDate: Date;
  endDate: Date;
  value: number;
  items: string[];
  terms: string;
  renewalType: 'auto' | 'manual' | 'none';
  minimumOrder?: number;
  discountTiers?: Array<{
    minQuantity: number;
    discountPercent: number;
  }>;
  sla?: {
    deliveryTime: number; // days
    qualityStandard: string;
    supportResponse: number; // hours
  };
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'completed' | 'cancelled';
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod: 'check' | 'wire' | 'ach' | 'credit';
  notes: string;
  attachments: string[];
  approvedBy?: string;
  receivedBy?: string;
}

interface VendorEvaluation {
  id: string;
  vendorId: string;
  evaluationDate: Date;
  evaluatedBy: string;
  period: string; // e.g., "Q1 2024"
  criteria: Array<{
    category: string;
    weight: number;
    score: number; // 1-5
    comments: string;
  }>;
  overallScore: number;
  recommendation: 'continue' | 'improve' | 'replace' | 'expand';
  actionItems: string[];
  nextReviewDate: Date;
}

export function VendorManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'contracts' | 'orders' | 'performance' | 'compliance' | 'analytics'>('overview');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample data
  const [vendors] = useState<Vendor[]>([
    {
      id: 'vendor-1',
      name: 'General Hydroponics',
      type: 'nutrients',
      status: 'active',
      rating: 4.8,
      contactPerson: 'Mike Johnson',
      email: 'mike@genhydro.com',
      phone: '800-374-9376',
      website: 'www.generalhydroponics.com',
      address: {
        street: '2877 Giffen Ave',
        city: 'Santa Rosa',
        state: 'CA',
        zip: '95407'
      },
      businessInfo: {
        businessLicense: 'BL-CA-12345',
        taxId: '12-3456789',
        established: new Date('1976-01-01'),
        certifications: ['OMRI Listed', 'ISO 9001', 'CDFA Organic'],
        insurance: {
          carrier: 'Business Insurance Co',
          policyNumber: 'BIC-2024-789',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      financialInfo: {
        paymentTerms: 'net30',
        creditLimit: 50000,
        currentBalance: 12500,
        totalSpend: 145000,
        averageOrderValue: 2800,
        currency: 'USD'
      },
      performanceMetrics: {
        onTimeDelivery: 96.5,
        qualityScore: 98.2,
        responseTime: 4.2,
        defectRate: 0.8,
        priceCompetitiveness: 85,
        overallScore: 93.6
      },
      contracts: [
        {
          id: 'contract-1',
          contractNumber: 'GH-2024-001',
          type: 'purchase',
          status: 'active',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          value: 100000,
          items: ['Flora Series', 'pH Control', 'Supplements'],
          terms: 'Annual volume discount 15%, Net 30 payment terms',
          renewalType: 'auto',
          minimumOrder: 500,
          discountTiers: [
            { minQuantity: 500, discountPercent: 10 },
            { minQuantity: 1000, discountPercent: 15 },
            { minQuantity: 2500, discountPercent: 20 }
          ],
          sla: {
            deliveryTime: 7,
            qualityStandard: '98% defect-free',
            supportResponse: 24
          }
        }
      ],
      notes: 'Premium vendor, excellent service and quality. Long-term partner.',
      tags: ['preferred', 'organic', 'bulk-discount'],
      lastOrderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vendor-2',
      name: 'Grodan Rockwool',
      type: 'supplies',
      status: 'active',
      rating: 4.5,
      contactPerson: 'Sarah Wilson',
      email: 'sarah@grodan-na.com',
      phone: '905-683-4797',
      website: 'www.grodan101.com',
      address: {
        street: '7650 Danbro Crescent',
        city: 'Mississauga',
        state: 'ON',
        zip: 'L5N 6P9'
      },
      businessInfo: {
        businessLicense: 'BL-ON-67890',
        taxId: '98-7654321',
        established: new Date('1969-01-01'),
        certifications: ['ISO 14001', 'Good Manufacturing Practice'],
        insurance: {
          carrier: 'Industrial Insurance Ltd',
          policyNumber: 'IIL-2024-456',
          expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
        }
      },
      financialInfo: {
        paymentTerms: 'net15',
        creditLimit: 75000,
        currentBalance: 8200,
        totalSpend: 89000,
        averageOrderValue: 4500,
        currency: 'USD'
      },
      performanceMetrics: {
        onTimeDelivery: 92.3,
        qualityScore: 96.8,
        responseTime: 6.5,
        defectRate: 1.2,
        priceCompetitiveness: 78,
        overallScore: 88.2
      },
      contracts: [],
      notes: 'Reliable supplier for growing media. Some delivery delays recently.',
      tags: ['growing-media', 'sustainable'],
      lastOrderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'vendor-3',
      name: 'Colorado Green Lab',
      type: 'testing',
      status: 'active',
      rating: 4.9,
      contactPerson: 'Dr. Amanda Chen',
      email: 'amanda@cogreenlab.com',
      phone: '303-555-0123',
      website: 'www.coloradogreenlab.com',
      address: {
        street: '1234 Science Park Dr',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      },
      businessInfo: {
        businessLicense: 'LAB-CO-001',
        taxId: '45-1234567',
        established: new Date('2014-01-01'),
        certifications: ['ISO/IEC 17025', 'State Certified Lab', 'DEA Licensed'],
        insurance: {
          carrier: 'Lab Insurance Corp',
          policyNumber: 'LIC-2024-123',
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        }
      },
      financialInfo: {
        paymentTerms: 'cod',
        creditLimit: 10000,
        currentBalance: 0,
        totalSpend: 67000,
        averageOrderValue: 850,
        currency: 'USD'
      },
      performanceMetrics: {
        onTimeDelivery: 98.7,
        qualityScore: 99.5,
        responseTime: 2.1,
        defectRate: 0.1,
        priceCompetitiveness: 82,
        overallScore: 96.4
      },
      contracts: [
        {
          id: 'contract-2',
          contractNumber: 'CGL-2024-001',
          type: 'service',
          status: 'active',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          value: 50000,
          items: ['Potency Testing', 'Pesticide Testing', 'Microbial Testing'],
          terms: 'Priority service, 48-hour turnaround',
          renewalType: 'manual',
          sla: {
            deliveryTime: 2,
            qualityStandard: '99.5% accuracy',
            supportResponse: 4
          }
        }
      ],
      notes: 'Excellent testing partner. Fast turnaround and accurate results.',
      tags: ['certified', 'priority-service', 'compliance'],
      lastOrderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      orderNumber: 'PO-2024-0234',
      vendorId: 'vendor-1',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'shipped',
      items: [
        { description: 'Flora Grow - 1 Gallon', quantity: 25, unit: 'bottles', unitPrice: 45.99, total: 1149.75 },
        { description: 'Flora Bloom - 1 Gallon', quantity: 25, unit: 'bottles', unitPrice: 45.99, total: 1149.75 },
        { description: 'pH Down - 1 Liter', quantity: 10, unit: 'bottles', unitPrice: 12.50, total: 125.00 }
      ],
      subtotal: 2424.50,
      tax: 242.45,
      shipping: 75.00,
      total: 2741.95,
      paymentStatus: 'pending',
      paymentMethod: 'ach',
      notes: 'Rush order for inventory replenishment',
      attachments: ['invoice_234.pdf'],
      approvedBy: 'Mike R.'
    },
    {
      id: 'po-2',
      orderNumber: 'PO-2024-0235',
      vendorId: 'vendor-2',
      orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      actualDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      items: [
        { description: 'Rockwool Cubes 4"', quantity: 1000, unit: 'pieces', unitPrice: 0.85, total: 850.00 },
        { description: 'Rockwool Slabs 6"', quantity: 200, unit: 'pieces', unitPrice: 3.25, total: 650.00 }
      ],
      subtotal: 1500.00,
      tax: 150.00,
      shipping: 125.00,
      total: 1775.00,
      paymentStatus: 'paid',
      paymentMethod: 'wire',
      notes: 'Regular monthly order',
      attachments: ['invoice_235.pdf', 'delivery_receipt.pdf'],
      approvedBy: 'Sarah M.',
      receivedBy: 'John D.'
    }
  ]);

  const [evaluations] = useState<VendorEvaluation[]>([
    {
      id: 'eval-1',
      vendorId: 'vendor-1',
      evaluationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      evaluatedBy: 'Procurement Team',
      period: 'Q4 2023',
      criteria: [
        { category: 'Product Quality', weight: 30, score: 5, comments: 'Consistently high quality, no defects' },
        { category: 'Delivery Performance', weight: 25, score: 4.5, comments: 'On-time 96% of orders' },
        { category: 'Pricing', weight: 20, score: 4, comments: 'Competitive with volume discounts' },
        { category: 'Customer Service', weight: 15, score: 5, comments: 'Excellent response and support' },
        { category: 'Innovation', weight: 10, score: 4.5, comments: 'Regular new product offerings' }
      ],
      overallScore: 4.6,
      recommendation: 'expand',
      actionItems: [
        'Negotiate better pricing for 2024',
        'Explore new organic product lines',
        'Increase order volume for better discounts'
      ],
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Analytics data
  const spendByCategory = [
    { name: 'Nutrients', value: 145000, fill: '#8B5CF6' },
    { name: 'Supplies', value: 89000, fill: '#10B981' },
    { name: 'Testing', value: 67000, fill: '#F59E0B' },
    { name: 'Equipment', value: 45000, fill: '#EF4444' },
    { name: 'Services', value: 32000, fill: '#3B82F6' }
  ];

  const vendorPerformanceRadar = [
    { metric: 'On-Time Delivery', A: 96.5, B: 92.3, C: 98.7 },
    { metric: 'Quality', A: 98.2, B: 96.8, C: 99.5 },
    { metric: 'Response Time', A: 85, B: 75, C: 95 },
    { metric: 'Price', A: 85, B: 78, C: 82 },
    { metric: 'Overall', A: 93.6, B: 88.2, C: 96.4 }
  ];

  const monthlySpendTrend = [
    { month: 'Jan', spend: 28000, orders: 12 },
    { month: 'Feb', spend: 32000, orders: 15 },
    { month: 'Mar', spend: 35000, orders: 18 },
    { month: 'Apr', spend: 29000, orders: 14 },
    { month: 'May', spend: 38000, orders: 20 },
    { month: 'Jun', spend: 41000, orders: 22 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'suspended': return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
      case 'inactive': return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
      case 'shipped': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'cancelled': return 'text-red-400 bg-red-900/20 border-red-600/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      );
    }
    return stars;
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesType = filterType === 'all' || vendor.type === filterType;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalSpend = vendors.reduce((sum, v) => sum + v.financialInfo.totalSpend, 0);
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const avgPerformance = vendors.reduce((sum, v) => sum + v.performanceMetrics.overallScore, 0) / vendors.length;
  const contractsExpiringSoon = vendors.flatMap(v => v.contracts).filter(c => {
    const daysUntilExpiry = (c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return c.status === 'active' && daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  }).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Vendor Management</h1>
          <p className="text-gray-400">Supply chain and vendor relationship management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewVendorModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Spend</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">${totalSpend.toLocaleString()}</p>
          <p className="text-sm text-green-400">YTD</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Active Vendors</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{activeVendors}</p>
          <p className="text-sm text-blue-400">Qualified</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Performance</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{avgPerformance.toFixed(1)}%</p>
          <p className="text-sm text-yellow-400">Score</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Pending Orders</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{purchaseOrders.filter(po => po.status !== 'completed' && po.status !== 'cancelled').length}</p>
          <p className="text-sm text-purple-400">Active</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Contracts</span>
            <FileText className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{contractsExpiringSoon}</p>
          <p className="text-sm text-orange-400">Expiring soon</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Savings</span>
            <TrendingDown className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">$24.3K</p>
          <p className="text-sm text-green-400">From contracts</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Vendors */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Top Vendors by Performance</h3>
            <div className="space-y-3">
              {vendors.sort((a, b) => b.performanceMetrics.overallScore - a.performanceMetrics.overallScore).slice(0, 5).map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-600/30">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{vendor.name}</p>
                      <p className="text-sm text-gray-400">{vendor.type} • {vendor.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Performance</p>
                      <p className="text-lg font-semibold text-white">{vendor.performanceMetrics.overallScore.toFixed(1)}%</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRating(vendor.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {purchaseOrders.slice(0, 4).map((order) => {
                  const vendor = vendors.find(v => v.id === order.vendorId);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{order.orderNumber}</p>
                        <p className="text-sm text-gray-400">{vendor?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${order.total.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Contract Renewals</h3>
              <div className="space-y-3">
                {vendors.flatMap(v => v.contracts.map(c => ({ ...c, vendorName: v.name })))
                  .filter(c => c.status === 'active')
                  .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
                  .slice(0, 4)
                  .map((contract) => {
                    const daysUntilExpiry = Math.ceil((contract.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{contract.contractNumber}</p>
                          <p className="text-sm text-gray-400">{contract.vendorName}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            daysUntilExpiry <= 30 ? 'text-red-400' :
                            daysUntilExpiry <= 90 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {daysUntilExpiry} days
                          </p>
                          <p className="text-xs text-gray-500">${contract.value.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="nutrients">Nutrients</option>
              <option value="equipment">Equipment</option>
              <option value="supplies">Supplies</option>
              <option value="services">Services</option>
              <option value="genetics">Genetics</option>
              <option value="packaging">Packaging</option>
              <option value="testing">Testing</option>
            </select>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{vendor.name}</h3>
                    <p className="text-sm text-gray-400">{vendor.type} • {vendor.businessInfo.established.getFullYear()} established</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getRating(vendor.rating)}
                      <span className="text-sm text-gray-400 ml-2">({vendor.rating})</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">Contact</p>
                    <p className="text-white">{vendor.contactPerson}</p>
                    <p className="text-gray-400 text-xs">{vendor.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Spend</p>
                    <p className="text-white font-medium">${vendor.financialInfo.totalSpend.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{vendor.financialInfo.paymentTerms}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">On-Time</p>
                      <p className="text-green-400">{vendor.performanceMetrics.onTimeDelivery}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quality</p>
                      <p className="text-blue-400">{vendor.performanceMetrics.qualityScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Overall</p>
                      <p className="text-purple-400">{vendor.performanceMetrics.overallScore.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spend by Category */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Spend by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Spend Trend */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Spend Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySpendTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Line type="monotone" dataKey="spend" stroke="#8B5CF6" strokeWidth={2} name="Spend" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vendor Performance Comparison */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Vendor Performance Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={vendorPerformanceRadar}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar name="General Hydroponics" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Radar name="Grodan Rockwool" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Radar name="Colorado Green Lab" dataKey="C" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedVendor.name}</h3>
                <p className="text-gray-400">{selectedVendor.type} vendor</p>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-white">{selectedVendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedVendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{selectedVendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Address:</span>
                      <span className="text-white">{selectedVendor.address.city}, {selectedVendor.address.state}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Financial Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Payment Terms:</span>
                      <span className="text-white uppercase">{selectedVendor.financialInfo.paymentTerms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Credit Limit:</span>
                      <span className="text-white">${selectedVendor.financialInfo.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Balance:</span>
                      <span className="text-white">${selectedVendor.financialInfo.currentBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Spend:</span>
                      <span className="text-green-400 font-medium">${selectedVendor.financialInfo.totalSpend.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">On-Time</p>
                    <p className="text-2xl font-bold text-green-400">{selectedVendor.performanceMetrics.onTimeDelivery}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Quality</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedVendor.performanceMetrics.qualityScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Response</p>
                    <p className="text-2xl font-bold text-yellow-400">{selectedVendor.performanceMetrics.responseTime}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Defects</p>
                    <p className="text-2xl font-bold text-red-400">{selectedVendor.performanceMetrics.defectRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-2xl font-bold text-purple-400">{selectedVendor.performanceMetrics.priceCompetitiveness}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Overall</p>
                    <p className="text-2xl font-bold text-white">{selectedVendor.performanceMetrics.overallScore.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Active Contracts */}
              {selectedVendor.contracts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Active Contracts</h4>
                  <div className="space-y-3">
                    {selectedVendor.contracts.map((contract) => (
                      <div key={contract.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{contract.contractNumber}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Value: <span className="text-white">${contract.value.toLocaleString()}</span></p>
                            <p className="text-gray-400">Type: <span className="text-white">{contract.type}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-400">Period: <span className="text-white">{mounted ? contract.startDate.toLocaleDateString() : '...'} - {mounted ? contract.endDate.toLocaleDateString() : '...'}</span></p>
                            <p className="text-gray-400">Renewal: <span className="text-white">{contract.renewalType}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Evaluate Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}