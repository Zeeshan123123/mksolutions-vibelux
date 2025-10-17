'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Truck,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Settings,
  MoreHorizontal,
  Star,
  Shield,
  Target,
  Activity,
  RefreshCw,
  Zap,
  Award,
  Building2,
  Phone,
  Mail,
  Globe,
  FileText,
  CreditCard,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Circle,
  CheckSquare,
  X,
  ExternalLink,
  Layers,
  Box,
  Navigation,
  Timer,
  Scale,
  Gauge
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { SupplyChainManager, Supplier, PurchaseOrder, Shipment, SupplyChainMetrics } from '@/lib/supply-chain/supply-chain-management';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'orders' | 'shipments' | 'inventory' | 'reports'>('overview');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const supplyChain = new SupplyChainManager('default-facility', 'current-user');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockSuppliers: Supplier[] = [
        {
          id: 'sup-1',
          name: 'GrowTech Solutions',
          type: 'manufacturer',
          status: 'active',
          contactPerson: 'John Smith',
          email: 'john@growtech.com',
          phone: '(555) 123-4567',
          website: 'https://growtech.com',
          address: {
            street: '123 Industrial Blvd',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814',
            country: 'USA'
          },
          businessLicense: 'BL-12345',
          certifications: ['ISO 9001', 'FDA Approved'],
          paymentTerms: 'Net 30',
          creditLimit: 50000,
          currentBalance: 12500,
          totalSpent: 125000,
          onTimeDeliveryRate: 0.95,
          qualityScore: 92,
          responsiveness: 88,
          priceCompetitiveness: 85,
          overallRating: 90,
          products: ['LED Lights', 'Grow Tents', 'Ventilation'],
          services: ['Installation', 'Maintenance'],
          minimumOrderValue: 1000,
          leadTimeInDays: 7,
          shippingMethods: ['Ground', 'Express'],
          complianceScore: 95,
          tags: ['preferred', 'lighting'],
          notes: 'Excellent quality and service',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-07-10'),
          lastOrderDate: new Date('2024-07-05'),
          lastEvaluationDate: new Date('2024-06-01')
        },
        {
          id: 'sup-2',
          name: 'Hydro Nutrients Inc',
          type: 'distributor',
          status: 'active',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@hydronutrients.com',
          phone: '(555) 987-6543',
          address: {
            street: '456 Commerce Ave',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202',
            country: 'USA'
          },
          businessLicense: 'BL-67890',
          certifications: ['Organic Certified', 'OMRI Listed'],
          paymentTerms: 'Net 45',
          creditLimit: 25000,
          currentBalance: 8750,
          totalSpent: 87500,
          onTimeDeliveryRate: 0.88,
          qualityScore: 89,
          responsiveness: 92,
          priceCompetitiveness: 78,
          overallRating: 87,
          products: ['Nutrients', 'pH Solutions', 'Supplements'],
          services: ['Consulting', 'Training'],
          minimumOrderValue: 500,
          leadTimeInDays: 5,
          shippingMethods: ['Standard', 'Expedited'],
          complianceScore: 88,
          tags: ['nutrients', 'organic'],
          notes: 'Competitive pricing for bulk orders',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-07-08'),
          lastOrderDate: new Date('2024-07-03'),
          lastEvaluationDate: new Date('2024-05-15')
        }
      ];

      const mockOrders: PurchaseOrder[] = [
        {
          id: 'po-1',
          orderNumber: 'PO-202407-001',
          supplierId: 'sup-1',
          status: 'approved',
          orderDate: new Date('2024-07-01'),
          expectedDeliveryDate: new Date('2024-07-08'),
          items: [
            {
              productId: 'prod-1',
              sku: 'LED-PRO-1000',
              description: 'LED Grow Light Pro 1000W',
              quantity: 10,
              unitPrice: 299.99,
              discount: 0.1,
              totalPrice: 2699.91,
              receivedQuantity: 0,
              qualityStatus: 'pending'
            }
          ],
          subtotal: 2699.91,
          taxAmount: 216.00,
          shippingCost: 50.00,
          totalAmount: 2965.91,
          shippingAddress: {
            street: '789 Farm Road',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814',
            country: 'USA'
          },
          shippingMethod: 'Ground',
          paymentTerms: 'Net 30',
          paymentStatus: 'pending',
          requestedBy: 'user-1',
          approvedBy: 'manager-1',
          approvalDate: new Date('2024-07-01'),
          notes: 'Urgent order for expansion',
          attachments: [],
          createdAt: new Date('2024-07-01'),
          updatedAt: new Date('2024-07-01')
        }
      ];

      const mockShipments: Shipment[] = [
        {
          id: 'ship-1',
          shipmentNumber: 'SH-202407-001',
          purchaseOrderId: 'po-1',
          supplierId: 'sup-1',
          status: 'in_transit',
          shippingDate: new Date('2024-07-05'),
          expectedDeliveryDate: new Date('2024-07-08'),
          carrier: 'FedEx',
          trackingNumber: '1234567890',
          shippingMethod: 'Ground',
          items: [
            {
              productId: 'prod-1',
              sku: 'LED-PRO-1000',
              quantity: 10,
              condition: 'good'
            }
          ],
          trackingEvents: [
            {
              timestamp: new Date('2024-07-05T08:00:00'),
              location: 'Sacramento, CA',
              status: 'Picked Up',
              description: 'Package picked up from supplier'
            },
            {
              timestamp: new Date('2024-07-06T14:30:00'),
              location: 'Reno, NV',
              status: 'In Transit',
              description: 'Package in transit'
            }
          ],
          inspectionRequired: true,
          notes: 'Handle with care - fragile items',
          attachments: [],
          createdAt: new Date('2024-07-05'),
          updatedAt: new Date('2024-07-06')
        }
      ];

      const mockMetrics: SupplyChainMetrics = {
        totalSuppliers: 25,
        activeSuppliers: 22,
        averageLeadTime: 6.5,
        onTimeDeliveryRate: 92.5,
        qualityScore: 88.7,
        costSavings: 15000,
        inventoryTurnover: 8.2,
        supplierDiversityIndex: 0.75,
        riskScore: 23.5,
        sustainabilityScore: 78.3
      };

      setSuppliers(mockSuppliers);
      setOrders(mockOrders);
      setShipments(mockShipments);
      setMetrics(mockMetrics);

    } catch (error) {
      logger.error('system', 'Failed to load dashboard data:', error );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'inactive': return 'text-gray-400 bg-gray-900/20';
      case 'suspended': return 'text-red-400 bg-red-900/20';
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'ordered': return 'text-blue-400 bg-blue-900/20';
      case 'received': return 'text-green-400 bg-green-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      case 'in_transit': return 'text-blue-400 bg-blue-900/20';
      case 'delivered': return 'text-green-400 bg-green-900/20';
      case 'delayed': return 'text-orange-400 bg-orange-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getSupplierTypeIcon = (type: string) => {
    switch (type) {
      case 'manufacturer': return Building2;
      case 'distributor': return Truck;
      case 'wholesaler': return Package;
      case 'retailer': return Users;
      default: return Building2;
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const performanceData = [
    { month: 'Jan', onTime: 88, quality: 92, cost: 85 },
    { month: 'Feb', onTime: 91, quality: 89, cost: 88 },
    { month: 'Mar', onTime: 85, quality: 94, cost: 82 },
    { month: 'Apr', onTime: 93, quality: 87, cost: 90 },
    { month: 'May', onTime: 89, quality: 93, cost: 86 },
    { month: 'Jun', onTime: 95, quality: 91, cost: 89 },
    { month: 'Jul', onTime: 92, quality: 88, cost: 92 }
  ];

  const supplierTypeData = [
    { name: 'Manufacturer', value: 40, color: '#8b5cf6' },
    { name: 'Distributor', value: 30, color: '#06b6d4' },
    { name: 'Wholesaler', value: 20, color: '#10b981' },
    { name: 'Retailer', value: 10, color: '#f59e0b' }
  ];

  const riskData = [
    { subject: 'Financial', A: 85, B: 90, fullMark: 100 },
    { subject: 'Operational', A: 78, B: 85, fullMark: 100 },
    { subject: 'Geographic', A: 92, B: 88, fullMark: 100 },
    { subject: 'Regulatory', A: 88, B: 92, fullMark: 100 },
    { subject: 'Reputation', A: 95, B: 87, fullMark: 100 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading Supply Chain Dashboard...</p>
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
            <h1 className="text-2xl font-bold text-white">Supply Chain Management</h1>
            <p className="text-gray-400">Manage suppliers, orders, and logistics</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Package className="w-4 h-4" />
              Create Order
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
            { id: 'suppliers', label: 'Suppliers', icon: Users },
            { id: 'orders', label: 'Purchase Orders', icon: Package },
            { id: 'shipments', label: 'Shipments', icon: Truck },
            { id: 'inventory', label: 'Inventory', icon: Box },
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
                  <div className="p-2 bg-purple-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metrics?.activeSuppliers}
                </div>
                <div className="text-sm text-gray-400">Active Suppliers</div>
                <div className="text-xs text-green-400 mt-1">+3 from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metrics?.onTimeDeliveryRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">On-Time Delivery</div>
                <div className="text-xs text-green-400 mt-1">+2.5% from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-900/20 rounded-lg">
                    <Star className="w-5 h-5 text-blue-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metrics?.qualityScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Quality Score</div>
                <div className="text-xs text-blue-400 mt-1">+1.2 from last month</div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${metrics?.costSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Cost Savings</div>
                <div className="text-xs text-green-400 mt-1">+$5K from last month</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Supply Chain Performance</h3>
                  <p className="text-sm text-gray-400">Key performance indicators over time</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">On-Time</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Cost</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
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
                    dataKey="onTime" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Supplier Distribution and Risk Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier Types */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Supplier Types</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={supplierTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {supplierTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Current"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name="Target"
                        dataKey="B"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Order PO-202407-001 approved</p>
                    <p className="text-sm text-gray-400">$2,965.91 order from GrowTech Solutions</p>
                  </div>
                  <div className="text-sm text-gray-400">2 hours ago</div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-blue-900/20 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Shipment SH-202407-001 in transit</p>
                    <p className="text-sm text-gray-400">Expected delivery: July 8, 2024</p>
                  </div>
                  <div className="text-sm text-gray-400">4 hours ago</div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Low stock alert: LED-PRO-500</p>
                    <p className="text-sm text-gray-400">Current stock: 5 units (reorder point: 10)</p>
                  </div>
                  <div className="text-sm text-gray-400">6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
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
                {filteredSuppliers.length} suppliers
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => {
                const TypeIcon = getSupplierTypeIcon(supplier.type);
                return (
                  <div key={supplier.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-900/20 rounded-lg">
                          <TypeIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{supplier.name}</h3>
                          <p className="text-sm text-gray-400">{supplier.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{supplier.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{supplier.address.city}, {supplier.address.state}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Quality Score</div>
                        <div className="text-lg font-semibold text-white">{supplier.qualityScore}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">On-Time Rate</div>
                        <div className="text-lg font-semibold text-white">{(supplier.onTimeDeliveryRate * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Total Spent: <span className="text-white">${supplier.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowSupplierModal(true);
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Purchase Orders List */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Purchase Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Expected Delivery
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                            <div className="text-sm text-gray-400">{order.orderDate.toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {suppliers.find(s => s.id === order.supplierId)?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          ${order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {order.expectedDeliveryDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-purple-400 hover:text-purple-300">
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

        {activeTab === 'shipments' && (
          <div className="space-y-6">
            {/* Shipments List */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Shipments</h3>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-medium">{shipment.shipmentNumber}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-gray-400">Carrier</div>
                            <div className="text-white">{shipment.carrier}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Tracking</div>
                            <div className="text-white">{shipment.trackingNumber}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Expected Delivery: {shipment.expectedDeliveryDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
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

      {/* Supplier Details Modal */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Supplier Details</h2>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Name:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Type:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.type}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Contact:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Email:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.email}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Phone:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Performance Metrics</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Quality Score:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.qualityScore}/100</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">On-Time Delivery:</span>
                    <span className="text-sm text-white ml-2">{(selectedSupplier.onTimeDeliveryRate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Responsiveness:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.responsiveness}/100</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Overall Rating:</span>
                    <span className="text-sm text-white ml-2">{selectedSupplier.overallRating}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}