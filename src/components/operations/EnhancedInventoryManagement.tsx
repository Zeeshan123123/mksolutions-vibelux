'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus,
  Minus,
  RefreshCw,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileText,
  QrCode,
  MapPin,
  Calculator,
  Bell,
  Zap,
  Target,
  Users,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Settings,
  RotateCcw,
  AlertOctagon,
  Shield,
  Database,
  BookOpen,
  X
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  category: 'nutrients' | 'media' | 'supplies' | 'equipment' | 'safety' | 'genetics' | 'packaging';
  sku: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  safetyStock: number;
  location: string;
  supplier: string;
  unitCost: number;
  lastOrdered?: Date;
  lastReceived?: Date;
  expiryDate?: Date;
  lotNumber?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'recalled';
  storageConditions?: string;
  complianceNotes?: string;
  consumptionRate?: number; // units per week
  leadTime?: number; // days
  qrCode?: string;
  certifications?: string[];
  msdsSheet?: string;
}

interface ConsumptionPlan {
  itemId: string;
  cropCycle: string;
  plannedUsage: number;
  startDate: Date;
  endDate: Date;
  room: string;
  notes: string;
}

interface SupplierContract {
  id: string;
  supplier: string;
  items: string[]; // item IDs
  contractType: 'standard' | 'bulk-discount' | 'subscription';
  discountPercent: number;
  minimumOrder: number;
  paymentTerms: string;
  leadTime: number;
  autoReorder: boolean;
  contactInfo: {
    email: string;
    phone: string;
    representative: string;
  };
}

interface QualityCheck {
  id: string;
  itemId: string;
  batchNumber: string;
  checkDate: Date;
  checkedBy: string;
  parameters: Array<{
    parameter: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  overallResult: 'pass' | 'fail' | 'conditional';
  notes: string;
  photos?: string[];
}

export function EnhancedInventoryManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'planning' | 'quality' | 'suppliers' | 'analytics'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced inventory data with cultivation-specific items
  const [inventory] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      name: 'Flora Series Grow',
      category: 'nutrients',
      sku: 'FLO-GRO-1G',
      batchNumber: 'FG240315001',
      quantity: 15,
      unit: 'gallons',
      minStock: 10,
      maxStock: 50,
      reorderPoint: 20,
      safetyStock: 5,
      location: 'Nutrient Storage - Shelf A3',
      supplier: 'General Hydroponics',
      unitCost: 45.99,
      lastOrdered: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
      status: 'low-stock',
      storageConditions: 'Cool, dry place. 60-80°F',
      consumptionRate: 2.5,
      leadTime: 7,
      qrCode: 'QR-FLO-GRO-001',
      certifications: ['OMRI Listed', 'Organic'],
      msdsSheet: 'msds-flora-grow.pdf'
    },
    {
      id: 'inv-2',
      name: 'Rockwool Cubes 4"',
      category: 'media',
      sku: 'RW-4IN-100',
      batchNumber: 'RW240310001',
      quantity: 450,
      unit: 'pieces',
      minStock: 200,
      maxStock: 1000,
      reorderPoint: 300,
      safetyStock: 100,
      location: 'Media Storage - Rack B2',
      supplier: 'Grodan',
      unitCost: 0.85,
      lastReceived: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'in-stock',
      storageConditions: 'Dry storage, protect from moisture',
      consumptionRate: 50,
      leadTime: 14,
      qrCode: 'QR-RW-4IN-001'
    },
    {
      id: 'inv-3',
      name: 'pH Down Solution',
      category: 'nutrients',
      sku: 'PHD-1L',
      batchNumber: 'PHD240301001',
      quantity: 3,
      unit: 'liters',
      minStock: 5,
      maxStock: 20,
      reorderPoint: 8,
      safetyStock: 2,
      location: 'Chemical Storage - Cabinet C',
      supplier: 'Advanced Nutrients',
      unitCost: 12.50,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'out-of-stock',
      storageConditions: 'Secure chemical storage, <70°F',
      consumptionRate: 1.2,
      leadTime: 5,
      certifications: ['SDS Available'],
      msdsSheet: 'msds-ph-down.pdf'
    },
    {
      id: 'inv-4',
      name: 'Clone Dome Kit',
      category: 'equipment',
      sku: 'DOME-KIT-24',
      quantity: 5,
      unit: 'kits',
      minStock: 3,
      maxStock: 15,
      reorderPoint: 5,
      safetyStock: 2,
      location: 'Equipment Storage - Shelf D1',
      supplier: 'Hydrofarm',
      unitCost: 24.99,
      status: 'in-stock',
      consumptionRate: 0.5,
      leadTime: 10
    },
    {
      id: 'inv-5',
      name: 'Mylar Bags 1oz',
      category: 'packaging',
      sku: 'MYL-1OZ-100',
      batchNumber: 'MYL240312001',
      quantity: 2500,
      unit: 'pieces',
      minStock: 1000,
      maxStock: 5000,
      reorderPoint: 1500,
      safetyStock: 500,
      location: 'Packaging Storage - Bay A',
      supplier: 'Uline',
      unitCost: 0.15,
      status: 'in-stock',
      storageConditions: 'Clean, dry environment',
      consumptionRate: 200,
      leadTime: 3,
      complianceNotes: 'Child-resistant, compliant with state packaging laws'
    },
    {
      id: 'inv-6',
      name: 'Blue Dream Seeds',
      category: 'genetics',
      sku: 'BD-FEM-10',
      lotNumber: 'BD240301',
      quantity: 25,
      unit: 'seeds',
      minStock: 10,
      maxStock: 100,
      reorderPoint: 15,
      safetyStock: 5,
      location: 'Genetics Vault - Freezer A',
      supplier: 'Humboldt Seed Co.',
      unitCost: 12.00,
      expiryDate: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000),
      status: 'in-stock',
      storageConditions: 'Frozen storage, -18°C, low humidity',
      consumptionRate: 2,
      leadTime: 21,
      certifications: ['Feminized', 'Lab Tested'],
      complianceNotes: 'Tracked per state seed-to-sale requirements'
    }
  ]);

  const [consumptionPlans] = useState<ConsumptionPlan[]>([
    {
      itemId: 'inv-1',
      cropCycle: 'Cycle 24-A',
      plannedUsage: 8,
      startDate: new Date(),
      endDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000),
      room: 'Flower Room A',
      notes: 'Increased feeding schedule for heavy feeders'
    },
    {
      itemId: 'inv-2',
      cropCycle: 'Cycle 24-B',
      plannedUsage: 144,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000),
      room: 'Veg Room 1',
      notes: 'New propagation setup'
    }
  ]);

  const [suppliers] = useState<SupplierContract[]>([
    {
      id: 'sup-1',
      supplier: 'General Hydroponics',
      items: ['inv-1'],
      contractType: 'bulk-discount',
      discountPercent: 15,
      minimumOrder: 500,
      paymentTerms: 'Net 30',
      leadTime: 7,
      autoReorder: true,
      contactInfo: {
        email: 'orders@genhydro.com',
        phone: '800-374-9376',
        representative: 'Mike Johnson'
      }
    },
    {
      id: 'sup-2',
      supplier: 'Grodan',
      items: ['inv-2'],
      contractType: 'subscription',
      discountPercent: 10,
      minimumOrder: 1000,
      paymentTerms: 'Net 15',
      leadTime: 14,
      autoReorder: false,
      contactInfo: {
        email: 'sales@grodan-na.com',
        phone: '905-683-4797',
        representative: 'Sarah Wilson'
      }
    }
  ]);

  const [qualityChecks] = useState<QualityCheck[]>([
    {
      id: 'qc-1',
      itemId: 'inv-1',
      batchNumber: 'FG240315001',
      checkDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      checkedBy: 'Quality Team',
      parameters: [
        { parameter: 'pH', expected: '5.8-6.2', actual: '6.0', passed: true },
        { parameter: 'EC', expected: '1.2-1.6', actual: '1.4', passed: true },
        { parameter: 'Color', expected: 'Clear amber', actual: 'Clear amber', passed: true },
        { parameter: 'Odor', expected: 'Mild nutrient smell', actual: 'Normal', passed: true }
      ],
      overallResult: 'pass',
      notes: 'All parameters within specification'
    }
  ]);

  // Analytics data
  const consumptionTrend = [
    { week: 'W1', nutrients: 45, media: 120, supplies: 35, genetics: 5 },
    { week: 'W2', nutrients: 52, media: 115, supplies: 42, genetics: 8 },
    { week: 'W3', nutrients: 48, media: 125, supplies: 38, genetics: 3 },
    { week: 'W4', nutrients: 55, media: 130, supplies: 45, genetics: 6 }
  ];

  const expiryAlerts = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  });

  const reorderAlerts = inventory.filter(item => 
    item.quantity <= item.reorderPoint && item.status !== 'out-of-stock'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'low-stock': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'out-of-stock': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'expired': return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
      case 'recalled': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="w-4 h-4" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-stock': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'recalled': return <AlertOctagon className="w-4 h-4" />;
      default: return null;
    }
  };

  const calculateReorderQuantity = (item: InventoryItem) => {
    const avgConsumption = item.consumptionRate || 0;
    const leadTimeDays = item.leadTime || 7;
    const leadTimeConsumption = (avgConsumption * leadTimeDays) / 7;
    const reorderQty = Math.ceil(item.maxStock - item.quantity);
    return Math.max(reorderQty, Math.ceil(leadTimeConsumption + item.safetyStock));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.batchNumber && item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;

  const categoryColors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#6B7280'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'planning', label: 'Consumption Planning', icon: Calculator },
    { id: 'quality', label: 'Quality Control', icon: Shield },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enhanced Inventory Management</h1>
          <p className="text-gray-400">Comprehensive cultivation supply chain management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={() => setShowReorderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Auto Reorder
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(expiryAlerts.length > 0 || reorderAlerts.length > 0) && (
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-4 border border-red-600/30">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiryAlerts.length > 0 && (
              <div className="bg-red-900/20 p-3 rounded-lg border border-red-600/30">
                <p className="text-red-300 font-medium">{expiryAlerts.length} items expiring within 30 days</p>
                <p className="text-sm text-red-400 mt-1">Review and use or dispose</p>
              </div>
            )}
            {reorderAlerts.length > 0 && (
              <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
                <p className="text-yellow-300 font-medium">{reorderAlerts.length} items below reorder point</p>
                <p className="text-sm text-yellow-400 mt-1">Generate purchase orders</p>
              </div>
            )}
          </div>
        </div>
      )}

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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Value</span>
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">${totalInventoryValue.toLocaleString()}</p>
              <p className="text-sm text-green-400">+8.2% from last month</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total SKUs</span>
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{inventory.length}</p>
              <p className="text-sm text-blue-400">Active items</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Reorder Alerts</span>
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">{reorderAlerts.length}</p>
              <p className="text-sm text-yellow-400">Need attention</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Expiry Alerts</span>
                <Clock className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{expiryAlerts.length}</p>
              <p className="text-sm text-red-400">Within 30 days</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Turnover Rate</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">4.2x</p>
              <p className="text-sm text-purple-400">Annual</p>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Inventory by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={['nutrients', 'media', 'supplies', 'equipment', 'safety', 'genetics', 'packaging'].map((category, index) => ({
                        name: category,
                        value: inventory.filter(item => item.category === category).length,
                        fill: categoryColors[index]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {['nutrients', 'media', 'supplies', 'equipment', 'safety', 'genetics', 'packaging'].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Consumption Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consumptionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Line type="monotone" dataKey="nutrients" stroke="#10B981" strokeWidth={2} name="Nutrients" />
                    <Line type="monotone" dataKey="media" stroke="#3B82F6" strokeWidth={2} name="Media" />
                    <Line type="monotone" dataKey="supplies" stroke="#F59E0B" strokeWidth={2} name="Supplies" />
                    <Line type="monotone" dataKey="genetics" stroke="#8B5CF6" strokeWidth={2} name="Genetics" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Critical Items Dashboard */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Items Requiring Attention</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {[...reorderAlerts.slice(0, 3), ...expiryAlerts.slice(0, 2)].map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400">
                          {item.quantity} {item.unit} • {item.category} • {item.location}
                        </p>
                        {item.expiryDate && expiryAlerts.includes(item) && (
                          <p className="text-xs text-red-400 mt-1">
                            Expires: {mounted ? item.expiryDate.toLocaleDateString() : '...'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                        {reorderAlerts.includes(item) ? 'Reorder' : 'Review'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, SKU, or batch number..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="nutrients">Nutrients</option>
              <option value="media">Growing Media</option>
              <option value="supplies">Supplies</option>
              <option value="equipment">Equipment</option>
              <option value="safety">Safety</option>
              <option value="genetics">Genetics</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>

          {/* Enhanced Inventory Table */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Item Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Batch/Expiry</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.sku} • {item.category}</p>
                        {item.qrCode && (
                          <div className="flex items-center gap-1 mt-1">
                            <QrCode className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{item.qrCode}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{item.quantity} {item.unit}</p>
                        <div className="mt-1 w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.quantity > item.reorderPoint ? 'bg-green-500' :
                              item.quantity > item.minStock ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (item.quantity / item.maxStock) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Reorder at {item.reorderPoint}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-300">{item.location}</span>
                      </div>
                      {item.storageConditions && (
                        <p className="text-xs text-gray-500 mt-1">{item.storageConditions}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {item.batchNumber && (
                          <p className="text-sm text-gray-300">Batch: {item.batchNumber}</p>
                        )}
                        {item.expiryDate && (
                          <p className={`text-xs mt-1 ${
                            expiryAlerts.includes(item) ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            Exp: {mounted ? item.expiryDate.toLocaleDateString() : '...'}
                          </p>
                        )}
                        {item.leadTime && (
                          <p className="text-xs text-gray-500 mt-1">Lead: {item.leadTime}d</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">${(item.quantity * item.unitCost).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">${item.unitCost}/unit</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="Quick Reorder"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Consumption Planning</h3>
            <button
              onClick={() => setShowPlanningModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </button>
          </div>

          {/* Crop Cycle Planning */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h4 className="text-lg font-semibold text-white">Active Consumption Plans</h4>
            </div>
            <div className="divide-y divide-gray-800">
              {consumptionPlans.map((plan) => {
                const item = inventory.find(i => i.id === plan.itemId);
                if (!item) return null;
                
                return (
                  <div key={plan.cropCycle + plan.itemId} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-white">{plan.cropCycle}</h5>
                        <p className="text-sm text-gray-400">{item.name} • {plan.room}</p>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Planned Usage</p>
                            <p className="text-white">{plan.plannedUsage} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Duration</p>
                            <p className="text-white">
                              {mounted ? Math.ceil((plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)) : '...'} days
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Weekly Rate</p>
                            <p className="text-white">
                              {mounted ? (plan.plannedUsage / Math.ceil((plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))).toFixed(1) : '...'} {item.unit}/week
                            </p>
                          </div>
                        </div>
                        {plan.notes && (
                          <p className="text-xs text-gray-500 mt-2">{plan.notes}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-900/20 text-green-400 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projected Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">30-Day Projections</h4>
              <div className="space-y-3">
                {inventory.slice(0, 5).map((item) => {
                  const projectedConsumption = (item.consumptionRate || 0) * 4.3; // ~30 days
                  const projectedStock = item.quantity - projectedConsumption;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">Current: {item.quantity} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          projectedStock < item.minStock ? 'text-red-400' : 
                          projectedStock < item.reorderPoint ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {projectedStock.toFixed(1)} {item.unit}
                        </p>
                        <p className="text-xs text-gray-500">Projected</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Reorder Recommendations</h4>
              <div className="space-y-3">
                {inventory.filter(item => item.quantity <= item.reorderPoint * 1.2).slice(0, 5).map((item) => {
                  const reorderQty = calculateReorderQuantity(item);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">Lead time: {item.leadTime || 7} days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-400">{reorderQty} {item.unit}</p>
                        <p className="text-xs text-gray-500">Suggested</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Control Tab */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Quality Control</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              New QC Check
            </button>
          </div>

          {/* Recent Quality Checks */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h4 className="text-lg font-semibold text-white">Recent Quality Checks</h4>
            </div>
            <div className="divide-y divide-gray-800">
              {qualityChecks.map((check) => {
                const item = inventory.find(i => i.id === check.itemId);
                if (!item) return null;
                
                return (
                  <div key={check.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-medium text-white">{item.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            check.overallResult === 'pass' ? 'bg-green-900/20 text-green-400' :
                            check.overallResult === 'conditional' ? 'bg-yellow-900/20 text-yellow-400' :
                            'bg-red-900/20 text-red-400'
                          }`}>
                            {check.overallResult.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Batch: {check.batchNumber} • Checked by: {check.checkedBy} • 
                          {mounted ? check.checkDate.toLocaleDateString() : '...'}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {check.parameters.map((param, index) => (
                            <div key={index} className="text-sm">
                              <p className="text-gray-400">{param.parameter}</p>
                              <p className={`font-medium ${param.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {param.actual}
                              </p>
                              <p className="text-xs text-gray-500">Expected: {param.expected}</p>
                            </div>
                          ))}
                        </div>
                        {check.notes && (
                          <p className="text-sm text-gray-400 mt-3">{check.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QC Schedule */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4">Upcoming QC Schedule</h4>
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No upcoming QC checks scheduled</p>
              <p className="text-sm text-gray-500 mt-1">Create scheduled checks for critical items</p>
            </div>
          </div>
        </div>
      )}

      {/* Auto Reorder Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Automated Reorder System</h3>
              <button
                onClick={() => setShowReorderModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-4 border border-green-600/30">
                <h4 className="font-semibold text-white mb-2">Recommended Actions</h4>
                <p className="text-sm text-gray-300">
                  {reorderAlerts.length} items need reordering. Total estimated cost: $
                  {reorderAlerts.reduce((sum, item) => sum + (calculateReorderQuantity(item) * item.unitCost), 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h4 className="font-semibold text-white">Items for Reorder</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {reorderAlerts.map((item) => {
                    const reorderQty = calculateReorderQuantity(item);
                    const cost = reorderQty * item.unitCost;
                    
                    return (
                      <div key={item.id} className="p-4 border-b border-gray-700 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <div>
                              <p className="font-medium text-white">{item.name}</p>
                              <p className="text-sm text-gray-400">
                                Current: {item.quantity} {item.unit} • Supplier: {item.supplier}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{reorderQty} {item.unit}</p>
                            <p className="text-sm text-gray-400">${cost.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowReorderModal(false);
                    // Add reorder logic here
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Generate Purchase Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}