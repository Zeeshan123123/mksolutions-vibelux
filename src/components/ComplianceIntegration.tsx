'use client';

import React, { useState } from 'react';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Package,
  Truck,
  Users,
  MapPin,
  Hash,
  BarChart3,
  TrendingUp,
  AlertCircle,
  FileText,
  Eye,
  Edit3,
  Share2,
  RefreshCw,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  QrCode,
  Database,
  Link2,
  ExternalLink,
  CheckSquare,
  X as XCircle,
  Settings
} from 'lucide-react';

interface ComplianceRecord {
  id: string;
  type: 'cultivation' | 'harvest' | 'processing' | 'packaging' | 'distribution' | 'sale';
  batchId: string;
  productName: string;
  strain?: string;
  quantity: number;
  unit: string;
  location: string;
  timestamp: Date;
  operator: string;
  status: 'compliant' | 'review' | 'flagged' | 'rejected';
  metrcTag?: string;
  leafDataId?: string;
  bioTrackId?: string;
  tests: TestResult[];
  documents: Document[];
  chainOfCustody: CustodyRecord[];
  flags: ComplianceFlag[];
}

interface TestResult {
  id: string;
  type: 'potency' | 'pesticides' | 'microbials' | 'heavy-metals' | 'mycotoxins' | 'moisture';
  lab: string;
  date: Date;
  result: 'pass' | 'fail' | 'pending';
  certificate?: string;
  values: { name: string; value: number; limit: number; unit: string; status: string }[];
}

interface Document {
  id: string;
  type: string;
  name: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'expired' | 'pending';
  url: string;
}

interface CustodyRecord {
  id: string;
  action: string;
  fromEntity: string;
  toEntity: string;
  timestamp: Date;
  operator: string;
  signature: string;
  notes?: string;
}

interface ComplianceFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

const MOCK_RECORDS: ComplianceRecord[] = [
  {
    id: '1',
    type: 'harvest',
    batchId: 'BATCH-2024-001',
    productName: 'Blue Dream',
    strain: 'Blue Dream',
    quantity: 15.5,
    unit: 'kg',
    location: 'Room A - Section 1',
    timestamp: new Date('2024-11-15T10:30:00'),
    operator: 'John Smith',
    status: 'compliant',
    metrcTag: 'METRC-1234567890',
    tests: [
      {
        id: 't1',
        type: 'potency',
        lab: 'Certified Labs Inc',
        date: new Date('2024-11-20'),
        result: 'pass',
        certificate: 'CERT-2024-1234',
        values: [
          { name: 'THC', value: 18.5, limit: 30, unit: '%', status: 'pass' },
          { name: 'CBD', value: 0.5, limit: 30, unit: '%', status: 'pass' }
        ]
      }
    ],
    documents: [],
    chainOfCustody: [],
    flags: []
  },
  {
    id: '2',
    type: 'processing',
    batchId: 'BATCH-2024-002',
    productName: 'Premium Extract',
    quantity: 2.3,
    unit: 'kg',
    location: 'Processing Lab',
    timestamp: new Date('2024-11-18T14:20:00'),
    operator: 'Sarah Johnson',
    status: 'review',
    leafDataId: 'LEAF-987654321',
    tests: [
      {
        id: 't2',
        type: 'pesticides',
        lab: 'State Testing Lab',
        date: new Date('2024-11-22'),
        result: 'pending',
        values: []
      }
    ],
    documents: [],
    chainOfCustody: [],
    flags: [
      {
        id: 'f1',
        severity: 'medium',
        type: 'testing',
        message: 'Pesticide test results pending - due in 2 days',
        timestamp: new Date(),
        resolved: false
      }
    ]
  }
];

export function ComplianceIntegration() {
  const [records, setRecords] = useState<ComplianceRecord[]>(MOCK_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'testing' | 'reports' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Calculate compliance metrics
  const metrics = {
    totalRecords: records.length,
    compliant: records.filter(r => r.status === 'compliant').length,
    underReview: records.filter(r => r.status === 'review').length,
    flagged: records.filter(r => r.status === 'flagged').length,
    complianceRate: records.length > 0 
      ? (records.filter(r => r.status === 'compliant').length / records.length * 100).toFixed(1)
      : '0',
    pendingTests: records.reduce((acc, r) => 
      acc + r.tests.filter(t => t.result === 'pending').length, 0
    ),
    activeFlags: records.reduce((acc, r) => 
      acc + r.flags.filter(f => !f.resolved).length, 0
    )
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'review': return 'text-yellow-400';
      case 'flagged': return 'text-orange-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20';
      case 'review': return 'bg-yellow-500/20';
      case 'flagged': return 'bg-orange-500/20';
      case 'rejected': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Track & Trace Compliance</h2>
          <p className="text-gray-400 mt-1">
            Integrated compliance management for METRC, Leaf Data, and BioTrack
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Records
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">METRC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Last sync: 5 minutes ago</p>
          <p className="text-xs text-gray-500 mt-1">API v2.0 - CA License: C10-0000123-LIC</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Leaf Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Last sync: 12 minutes ago</p>
          <p className="text-xs text-gray-500 mt-1">WA State System - License: 123456</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">BioTrack</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-sm text-yellow-400">Limited</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Read-only access</p>
          <p className="text-xs text-gray-500 mt-1">Legacy System - View Only</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'records', label: 'Records', icon: FileText },
          { id: 'testing', label: 'Testing', icon: FileCheck },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Compliance Rate</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.complianceRate}%</p>
              <p className="text-sm text-green-400 mt-1">
                {metrics.compliant} of {metrics.totalRecords} records
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Under Review</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.underReview}</p>
              <p className="text-sm text-gray-400 mt-1">Pending approval</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400">Active Flags</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.activeFlags}</p>
              <p className="text-sm text-orange-400 mt-1">Requires attention</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Pending Tests</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.pendingTests}</p>
              <p className="text-sm text-gray-400 mt-1">Awaiting results</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Compliance Activity</h3>
            <div className="space-y-3">
              {records.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusBg(record.status)}`}>
                      <Package className={`w-5 h-5 ${getStatusColor(record.status)}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{record.productName}</p>
                      <p className="text-sm text-gray-400">
                        {record.batchId} • {record.quantity} {record.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {record.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Alerts */}
          {metrics.activeFlags > 0 && (
            <div className="bg-orange-900/20 backdrop-blur-xl rounded-xl p-4 border border-orange-800/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Active Compliance Alerts</h3>
              </div>
              <div className="space-y-2">
                {records.flatMap(r => r.flags.filter(f => !f.resolved)).slice(0, 3).map(flag => (
                  <div key={flag.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        flag.severity === 'critical' ? 'bg-red-500' :
                        flag.severity === 'high' ? 'bg-orange-500' :
                        flag.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-white">{flag.message}</p>
                        <p className="text-sm text-gray-400">
                          {flag.type} • {flag.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch ID, product name, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="compliant">Compliant</option>
              <option value="review">Under Review</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Records Table */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Batch / Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Compliance ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{record.productName}</p>
                        <p className="text-sm text-gray-400">{record.batchId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 capitalize">{record.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{record.quantity} {record.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{record.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {record.metrcTag && (
                          <p className="text-gray-300 flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {record.metrcTag}
                          </p>
                        )}
                        {record.leafDataId && (
                          <p className="text-gray-400 flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {record.leafDataId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(record.status)} ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
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
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
          <FileCheck className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Lab Testing Management</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Track test results, manage COAs, and ensure product safety compliance
          </p>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
          <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Compliance Reports</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Generate audit reports, compliance summaries, and regulatory documentation
          </p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
          <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Integration Settings</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Configure API connections, manage licenses, and set compliance rules
          </p>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal 
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

// Record Details Modal Component
function RecordDetailsModal({ 
  record, 
  onClose 
}: { 
  record: ComplianceRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Compliance Record Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Product</p>
              <p className="text-lg font-medium text-white">{record.productName}</p>
              {record.strain && <p className="text-sm text-gray-400">{record.strain}</p>}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Batch ID</p>
              <p className="text-lg font-medium text-white">{record.batchId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Quantity</p>
              <p className="text-lg font-medium text-white">{record.quantity} {record.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Location</p>
              <p className="text-lg font-medium text-white">{record.location}</p>
            </div>
          </div>

          {/* Compliance IDs */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Compliance Identifiers</h4>
            <div className="grid grid-cols-3 gap-4">
              {record.metrcTag && (
                <div>
                  <p className="text-sm text-gray-400">METRC Tag</p>
                  <p className="font-mono text-white">{record.metrcTag}</p>
                </div>
              )}
              {record.leafDataId && (
                <div>
                  <p className="text-sm text-gray-400">Leaf Data ID</p>
                  <p className="font-mono text-white">{record.leafDataId}</p>
                </div>
              )}
              {record.bioTrackId && (
                <div>
                  <p className="text-sm text-gray-400">BioTrack ID</p>
                  <p className="font-mono text-white">{record.bioTrackId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {record.tests.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Test Results</h4>
              <div className="space-y-3">
                {record.tests.map(test => (
                  <div key={test.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white capitalize">{test.type.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-400">{test.lab} • {test.date.toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.result === 'pass' ? 'bg-green-500/20 text-green-400' :
                      test.result === 'fail' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {test.result.charAt(0).toUpperCase() + test.result.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          {record.flags.length > 0 && (
            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/50">
              <h4 className="font-medium text-white mb-3">Compliance Flags</h4>
              <div className="space-y-2">
                {record.flags.map(flag => (
                  <div key={flag.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-white">{flag.message}</p>
                        <p className="text-sm text-gray-400">{flag.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                    {!flag.resolved && (
                      <button className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}