'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  RefreshCw,
  X,
  Save,
  Send,
  Archive,
  Star,
  MessageSquare,
  QrCode,
  Scale,
  Clipboard,
  Bell,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Calculator,
  Zap,
  Shield
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Customer {
  id: string;
  name: string;
  type: 'dispensary' | 'processor' | 'distributor' | 'direct';
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  licenseNumber: string;
  paymentTerms: 'cod' | 'net15' | 'net30' | 'prepaid';
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'inactive' | 'suspended';
  preferredProducts: string[];
  averageOrderValue: number;
  totalOrders: number;
  lastOrderDate: Date;
  rating: number;
  notes: string;
}

interface Product {
  id: string;
  name: string;
  strain: string;
  category: 'flower' | 'trim' | 'biomass' | 'clone' | 'seed';
  grade: 'A' | 'B' | 'C';
  thcContent: number;
  cbdContent: number;
  availableQuantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: Date;
  testResults?: {
    lab: string;
    testDate: Date;
    passed: boolean;
    results: any;
  };
  complianceStatus: 'compliant' | 'pending' | 'failed';
  batchNumber: string;
  roomLocation: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: Date;
  requestedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'draft' | 'submitted' | 'confirmed' | 'in-production' | 'ready' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  paymentMethod: 'cash' | 'check' | 'wire' | 'ach';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  trackingNumber?: string;
  notes: string;
  assignedTo: string;
  complianceChecked: boolean;
  qualityApproved: boolean;
}

interface OrderMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
  conversionRate: number;
  onTimeDelivery: number;
  customerSatisfaction: number;
}

export function CustomerOrderManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'products' | 'fulfillment' | 'analytics' | 'compliance'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample data
  const [customers] = useState<Customer[]>([
    {
      id: 'cust-1',
      name: 'Green Valley Dispensary',
      type: 'dispensary',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@greenvalley.com',
      phone: '555-0123',
      address: {
        street: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      },
      licenseNumber: 'DISP-CO-001234',
      paymentTerms: 'net30',
      creditLimit: 50000,
      currentBalance: 12500,
      status: 'active',
      preferredProducts: ['Blue Dream', 'OG Kush'],
      averageOrderValue: 3200,
      totalOrders: 45,
      lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rating: 4.8,
      notes: 'Premium customer, always pays on time'
    },
    {
      id: 'cust-2',
      name: 'Mountain High Processing',
      type: 'processor',
      contactPerson: 'Mike Chen',
      email: 'mike@mtnhigh.com',
      phone: '555-0456',
      address: {
        street: '456 Industrial Blvd',
        city: 'Boulder',
        state: 'CO',
        zip: '80301'
      },
      licenseNumber: 'PROC-CO-005678',
      paymentTerms: 'net15',
      creditLimit: 100000,
      currentBalance: 0,
      status: 'active',
      preferredProducts: ['Trim', 'Biomass'],
      averageOrderValue: 8500,
      totalOrders: 23,
      lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rating: 4.9,
      notes: 'Large volume orders, excellent partner'
    },
    {
      id: 'cust-3',
      name: 'Rocky Mountain Distribution',
      type: 'distributor',
      contactPerson: 'Lisa Rodriguez',
      email: 'lisa@rmdistr.com',
      phone: '555-0789',
      address: {
        street: '789 Commerce Way',
        city: 'Aurora',
        state: 'CO',
        zip: '80012'
      },
      licenseNumber: 'DIST-CO-009012',
      paymentTerms: 'cod',
      creditLimit: 25000,
      currentBalance: 5200,
      status: 'active',
      preferredProducts: ['Premium Flower'],
      averageOrderValue: 1800,
      totalOrders: 67,
      lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rating: 4.2,
      notes: 'Regular small orders, cash on delivery preferred'
    }
  ]);

  const [products] = useState<Product[]>([
    {
      id: 'prod-1',
      name: 'Blue Dream',
      strain: 'Blue Dream',
      category: 'flower',
      grade: 'A',
      thcContent: 24.5,
      cbdContent: 0.8,
      availableQuantity: 2.5,
      unit: 'lbs',
      pricePerUnit: 2800,
      harvestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      testResults: {
        lab: 'Colorado Green Lab',
        testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        passed: true,
        results: { pesticides: 'pass', microbials: 'pass', heavy_metals: 'pass' }
      },
      complianceStatus: 'compliant',
      batchNumber: 'BD240315001',
      roomLocation: 'Flower Room A'
    },
    {
      id: 'prod-2',
      name: 'OG Kush',
      strain: 'OG Kush',
      category: 'flower',
      grade: 'A',
      thcContent: 26.2,
      cbdContent: 0.5,
      availableQuantity: 1.8,
      unit: 'lbs',
      pricePerUnit: 3200,
      harvestDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      testResults: {
        lab: 'Colorado Green Lab',
        testDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        passed: true,
        results: { pesticides: 'pass', microbials: 'pass', heavy_metals: 'pass' }
      },
      complianceStatus: 'compliant',
      batchNumber: 'OG240301001',
      roomLocation: 'Flower Room B'
    },
    {
      id: 'prod-3',
      name: 'Purple Punch Trim',
      strain: 'Purple Punch',
      category: 'trim',
      grade: 'B',
      thcContent: 12.8,
      cbdContent: 0.3,
      availableQuantity: 15.2,
      unit: 'lbs',
      pricePerUnit: 450,
      harvestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      complianceStatus: 'compliant',
      batchNumber: 'PP240310001',
      roomLocation: 'Processing Room'
    },
    {
      id: 'prod-4',
      name: 'Blue Dream Clones',
      strain: 'Blue Dream',
      category: 'clone',
      grade: 'A',
      thcContent: 0,
      cbdContent: 0,
      availableQuantity: 144,
      unit: 'plants',
      pricePerUnit: 15,
      harvestDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      complianceStatus: 'compliant',
      batchNumber: 'BDC240301001',
      roomLocation: 'Clone Room'
    }
  ]);

  const [orders] = useState<Order[]>([
    {
      id: 'order-1',
      orderNumber: 'ORD-2024-0156',
      customerId: 'cust-1',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      requestedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      priority: 'high',
      items: [
        { productId: 'prod-1', quantity: 1, unitPrice: 2800 },
        { productId: 'prod-2', quantity: 0.5, unitPrice: 3200 }
      ],
      subtotal: 4400,
      tax: 440,
      shipping: 50,
      total: 4890,
      paymentStatus: 'pending',
      paymentMethod: 'ach',
      shippingAddress: {
        street: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      },
      notes: 'Rush order for weekend inventory',
      assignedTo: 'Mike R.',
      complianceChecked: true,
      qualityApproved: true
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-2024-0157',
      customerId: 'cust-2',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'in-production',
      priority: 'medium',
      items: [
        { productId: 'prod-3', quantity: 10, unitPrice: 450 }
      ],
      subtotal: 4500,
      tax: 450,
      shipping: 75,
      total: 5025,
      paymentStatus: 'paid',
      paymentMethod: 'wire',
      shippingAddress: {
        street: '456 Industrial Blvd',
        city: 'Boulder',
        state: 'CO',
        zip: '80301'
      },
      notes: 'Regular bulk trim order',
      assignedTo: 'Sarah M.',
      complianceChecked: true,
      qualityApproved: true
    },
    {
      id: 'order-3',
      orderNumber: 'ORD-2024-0158',
      customerId: 'cust-3',
      orderDate: new Date(),
      requestedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'ready',
      priority: 'urgent',
      items: [
        { productId: 'prod-1', quantity: 0.25, unitPrice: 2800 },
        { productId: 'prod-4', quantity: 12, unitPrice: 15 }
      ],
      subtotal: 880,
      tax: 88,
      shipping: 25,
      total: 993,
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      shippingAddress: {
        street: '789 Commerce Way',
        city: 'Aurora',
        state: 'CO',
        zip: '80012'
      },
      trackingNumber: 'TRK123456789',
      notes: 'COD delivery',
      assignedTo: 'John D.',
      complianceChecked: true,
      qualityApproved: true
    }
  ]);

  // Analytics data
  const salesTrend = [
    { month: 'Jan', revenue: 45000, orders: 28, aov: 1607 },
    { month: 'Feb', revenue: 52000, orders: 32, aov: 1625 },
    { month: 'Mar', revenue: 48000, orders: 29, aov: 1655 },
    { month: 'Apr', revenue: 61000, orders: 35, aov: 1743 },
    { month: 'May', revenue: 58000, orders: 33, aov: 1758 },
    { month: 'Jun', revenue: 67000, orders: 38, aov: 1763 }
  ];

  const customerTypeDist = [
    { name: 'Dispensaries', value: 45, fill: '#8B5CF6' },
    { name: 'Processors', value: 30, fill: '#10B981' },
    { name: 'Distributors', value: 20, fill: '#F59E0B' },
    { name: 'Direct', value: 5, fill: '#EF4444' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
      case 'submitted': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'confirmed': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'in-production': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'ready': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
      case 'shipped': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'delivered': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'cancelled': return 'text-red-400 bg-red-900/20 border-red-600/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'partial': return 'text-orange-400 bg-orange-900/20';
      case 'overdue': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const currentMetrics: OrderMetrics = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
    orderCount: orders.length,
    conversionRate: 87.5,
    onTimeDelivery: 94.2,
    customerSatisfaction: 4.6
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Order Management</h1>
          <p className="text-gray-400">Complete order-to-cash workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Revenue</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">${currentMetrics.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-400">+12.3% this month</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Orders</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentMetrics.orderCount}</p>
          <p className="text-sm text-blue-400">Active orders</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">AOV</span>
            <Calculator className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">${currentMetrics.averageOrderValue.toFixed(0)}</p>
          <p className="text-sm text-purple-400">Average order value</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Conversion</span>
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentMetrics.conversionRate}%</p>
          <p className="text-sm text-orange-400">Quote to order</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">On-Time</span>
            <Clock className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentMetrics.onTimeDelivery}%</p>
          <p className="text-sm text-green-400">Delivery rate</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Satisfaction</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentMetrics.customerSatisfaction}</p>
          <p className="text-sm text-yellow-400">Customer rating</p>
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
          {/* Sales Pipeline */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Sales Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['submitted', 'confirmed', 'in-production', 'ready', 'shipped'].map((status, index) => {
                const statusOrders = orders.filter(o => o.status === status);
                const statusValue = statusOrders.reduce((sum, o) => sum + o.total, 0);
                
                return (
                  <div key={status} className="text-center">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 capitalize mb-2">{status.replace('-', ' ')}</h4>
                      <p className="text-2xl font-bold text-white">{statusOrders.length}</p>
                      <p className="text-sm text-gray-400">${statusValue.toLocaleString()}</p>
                    </div>
                    {index < 4 && (
                      <div className="flex justify-center my-2">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <button className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
            </div>
            <div className="divide-y divide-gray-800">
              {orders.slice(0, 5).map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-600/30">
                          <ShoppingCart className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{order.orderNumber}</h4>
                          <p className="text-sm text-gray-400">{customer?.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">${order.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">
                          {mounted ? order.orderDate.toLocaleDateString() : '...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Customers & Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{customer.name}</p>
                      <p className="text-sm text-gray-400">{customer.totalOrders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${(customer.averageOrderValue * customer.totalOrders).toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">{customer.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.category} • Grade {product.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${product.pricePerUnit}/{product.unit}</p>
                      <p className="text-xs text-gray-400">{product.availableQuantity} {product.unit} available</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or customers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-production">In Production</option>
              <option value="ready">Ready</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Delivery</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customerId);
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{order.orderNumber}</p>
                          <p className="text-sm text-gray-400">
                            {mounted ? order.orderDate.toLocaleDateString() : '...'} • {order.items.length} items
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.priority === 'urgent' ? 'bg-red-900/20 text-red-400' :
                              order.priority === 'high' ? 'bg-orange-900/20 text-orange-400' :
                              order.priority === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {order.priority}
                            </span>
                            {order.trackingNumber && (
                              <span className="text-xs text-blue-400">#{order.trackingNumber}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{customer?.name}</p>
                          <p className="text-sm text-gray-400">{customer?.type}</p>
                          <p className="text-sm text-gray-400">{order.assignedTo}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">${order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-400">Subtotal: ${order.subtotal.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          {order.complianceChecked && <CheckCircle className="w-3 h-3 inline text-green-400 mr-1" />}
                          {order.qualityApproved && <Award className="w-3 h-3 inline text-purple-400 mr-1" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white">
                            {mounted ? order.requestedDeliveryDate.toLocaleDateString() : '...'}
                          </p>
                          {order.actualDeliveryDate && (
                            <p className="text-xs text-green-400">
                              Delivered: {mounted ? order.actualDeliveryDate.toLocaleDateString() : '...'}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Sales Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerTypeDist}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerTypeDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Order Performance</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Processing Time</span>
                  <span className="text-white font-medium">2.3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Order Accuracy</span>
                  <span className="text-green-400 font-medium">98.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Return Rate</span>
                  <span className="text-red-400 font-medium">1.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Financial Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gross Margin</span>
                  <span className="text-green-400 font-medium">68.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">DSO (Days Sales Outstanding)</span>
                  <span className="text-yellow-400 font-medium">23 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Collection Rate</span>
                  <span className="text-green-400 font-medium">96.8%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Customer Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Customer Retention</span>
                  <span className="text-green-400 font-medium">92.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Repeat Order Rate</span>
                  <span className="text-blue-400 font-medium">78.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Customer LTV</span>
                  <span className="text-purple-400 font-medium">$45.2K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Order</h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requested Delivery Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="ach">ACH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Notes</label>
                <textarea
                  placeholder="Add any special instructions or notes..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowNewOrderModal(false);
                    // Add order creation logic here
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}