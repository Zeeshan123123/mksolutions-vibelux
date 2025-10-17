'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  Target,
  Activity,
  AlertCircle,
  Upload,
  Download,
  Eye,
  Edit,
  Save,
  Send,
  Archive,
  RefreshCw,
  Bell,
  Lock,
  Unlock,
  ChevronRight,
  X,
  Plus,
  Minus,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Database,
  FileCheck,
  Clipboard,
  Camera,
  Mail,
  MessageSquare,
  Book,
  Award,
  Zap,
  Settings,
  Info,
  ExternalLink,
  CheckSquare,
  Square,
  PlusCircle,
  QrCode,
  Hash,
  Fingerprint
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ComplianceWorkflow {
  id: string;
  name: string;
  category: 'cultivation' | 'processing' | 'distribution' | 'testing' | 'security' | 'financial';
  regulatory: 'state' | 'local' | 'federal' | 'internal';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'as-needed';
  steps: WorkflowStep[];
  currentStep: number;
  status: 'not-started' | 'in-progress' | 'pending-review' | 'completed' | 'failed' | 'overdue';
  assignedTo: string[];
  dueDate: Date;
  lastCompleted?: Date;
  completionTime?: number; // minutes
  criticalLevel: 'low' | 'medium' | 'high' | 'critical';
  automationEnabled: boolean;
  notifications: NotificationRule[];
  evidence: Evidence[];
  approvals: Approval[];
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'review' | 'approval' | 'upload' | 'inspection' | 'test';
  assignedTo?: string;
  requiredEvidence?: string[];
  checklistItems?: ChecklistItem[];
  automationScript?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  completedDate?: Date;
  completedBy?: string;
  notes?: string;
  dependencies?: string[]; // step IDs
  estimatedTime: number; // minutes
}

interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedDate?: Date;
  evidence?: string;
}

interface Evidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'signature' | 'test-result' | 'log';
  fileName: string;
  uploadedBy: string;
  uploadedDate: Date;
  verified: boolean;
  verifiedBy?: string;
  metadata?: any;
  hash?: string; // for tamper detection
}

interface Approval {
  id: string;
  stepId: string;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: Date;
  comments?: string;
  signature?: string;
}

interface NotificationRule {
  id: string;
  trigger: 'overdue' | 'step-completed' | 'failed' | 'needs-approval' | 'reminder';
  recipients: string[];
  method: 'email' | 'sms' | 'in-app' | 'all';
  timing?: number; // minutes before/after trigger
  message?: string;
}

interface AuditLog {
  id: string;
  workflowId: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details: any;
  ipAddress?: string;
  deviceId?: string;
}

interface ComplianceReport {
  id: string;
  type: 'state-required' | 'internal' | 'audit' | 'incident';
  title: string;
  generatedDate: Date;
  reportingPeriod: {
    start: Date;
    end: Date;
  };
  submittedTo?: string;
  submissionDate?: Date;
  status: 'draft' | 'ready' | 'submitted' | 'accepted' | 'rejected';
  data: any;
  attachments: string[];
}

export function ComplianceWorkflowEngine() {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'audit' | 'reports' | 'analytics' | 'settings'>('overview');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ComplianceWorkflow | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample workflows
  const [workflows] = useState<ComplianceWorkflow[]>([
    {
      id: 'wf-1',
      name: 'Daily Cultivation Compliance Check',
      category: 'cultivation',
      regulatory: 'state',
      description: 'Daily compliance verification for all cultivation rooms',
      frequency: 'daily',
      steps: [
        {
          id: 'step-1',
          title: 'Environmental Monitoring Check',
          description: 'Verify all environmental sensors are operational and within range',
          type: 'task',
          assignedTo: 'Compliance Team',
          checklistItems: [
            { id: 'cl-1', description: 'Temperature sensors operational', required: true, completed: true },
            { id: 'cl-2', description: 'Humidity sensors operational', required: true, completed: true },
            { id: 'cl-3', description: 'CO2 monitors operational', required: true, completed: false },
            { id: 'cl-4', description: 'Security cameras functional', required: true, completed: false }
          ],
          status: 'in-progress',
          estimatedTime: 30
        },
        {
          id: 'step-2',
          title: 'Plant Count Verification',
          description: 'Verify plant counts match state tracking system',
          type: 'inspection',
          assignedTo: 'Head Grower',
          requiredEvidence: ['Plant count sheet', 'State system screenshot'],
          status: 'pending',
          estimatedTime: 45,
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          title: 'Compliance Manager Review',
          description: 'Review all checks and approve daily compliance',
          type: 'approval',
          assignedTo: 'Compliance Manager',
          status: 'pending',
          estimatedTime: 15,
          dependencies: ['step-2']
        }
      ],
      currentStep: 1,
      status: 'in-progress',
      assignedTo: ['Sarah M.', 'John D.'],
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
      criticalLevel: 'high',
      automationEnabled: true,
      notifications: [
        {
          id: 'notif-1',
          trigger: 'overdue',
          recipients: ['compliance@vibelux.com', 'manager@vibelux.com'],
          method: 'all',
          timing: -30,
          message: 'Daily compliance check due in 30 minutes'
        }
      ],
      evidence: [],
      approvals: []
    },
    {
      id: 'wf-2',
      name: 'Monthly State Reporting',
      category: 'processing',
      regulatory: 'state',
      description: 'Monthly cultivation and sales report for state compliance',
      frequency: 'monthly',
      steps: [
        {
          id: 'step-1',
          title: 'Gather Sales Data',
          description: 'Compile all sales transactions for the month',
          type: 'task',
          assignedTo: 'Sales Manager',
          status: 'completed',
          completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedBy: 'Mike R.',
          estimatedTime: 120
        },
        {
          id: 'step-2',
          title: 'Inventory Reconciliation',
          description: 'Reconcile physical inventory with tracking system',
          type: 'task',
          assignedTo: 'Inventory Manager',
          status: 'completed',
          completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          completedBy: 'Lisa K.',
          estimatedTime: 180
        },
        {
          id: 'step-3',
          title: 'Generate State Report',
          description: 'Generate official state compliance report',
          type: 'task',
          assignedTo: 'Compliance Team',
          automationScript: 'generateStateReport()',
          status: 'in-progress',
          estimatedTime: 60
        },
        {
          id: 'step-4',
          title: 'Legal Review',
          description: 'Legal team reviews report before submission',
          type: 'review',
          assignedTo: 'Legal Team',
          status: 'pending',
          estimatedTime: 60,
          dependencies: ['step-3']
        },
        {
          id: 'step-5',
          title: 'Submit to State',
          description: 'Submit report through state portal',
          type: 'upload',
          assignedTo: 'Compliance Manager',
          requiredEvidence: ['Submission confirmation'],
          status: 'pending',
          estimatedTime: 30,
          dependencies: ['step-4']
        }
      ],
      currentStep: 3,
      status: 'in-progress',
      assignedTo: ['Compliance Team'],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      criticalLevel: 'critical',
      automationEnabled: true,
      notifications: [],
      evidence: [
        {
          id: 'ev-1',
          type: 'document',
          fileName: 'sales_data_march_2024.xlsx',
          uploadedBy: 'Mike R.',
          uploadedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          verified: true,
          verifiedBy: 'Compliance Manager'
        }
      ],
      approvals: []
    },
    {
      id: 'wf-3',
      name: 'Security Audit Checklist',
      category: 'security',
      regulatory: 'state',
      description: 'Weekly security system and protocol verification',
      frequency: 'weekly',
      steps: [
        {
          id: 'step-1',
          title: 'Camera System Check',
          description: 'Verify all security cameras are operational with proper coverage',
          type: 'inspection',
          assignedTo: 'Security Team',
          checklistItems: [
            { id: 'cl-1', description: 'All cameras recording', required: true, completed: false },
            { id: 'cl-2', description: '30-day retention verified', required: true, completed: false },
            { id: 'cl-3', description: 'No blind spots identified', required: true, completed: false }
          ],
          status: 'pending',
          estimatedTime: 60
        },
        {
          id: 'step-2',
          title: 'Access Control Audit',
          description: 'Review access logs and verify authorized personnel only',
          type: 'task',
          assignedTo: 'Security Manager',
          requiredEvidence: ['Access log report'],
          status: 'pending',
          estimatedTime: 45
        }
      ],
      currentStep: 0,
      status: 'not-started',
      assignedTo: ['Security Team'],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      criticalLevel: 'high',
      automationEnabled: false,
      notifications: [],
      evidence: [],
      approvals: []
    }
  ]);

  // Sample audit logs
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'audit-1',
      workflowId: 'wf-1',
      action: 'Step completed',
      performedBy: 'Sarah M.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: { step: 'Environmental Monitoring Check', result: 'Passed with 2 items pending' },
      ipAddress: '192.168.1.100'
    },
    {
      id: 'audit-2',
      workflowId: 'wf-2',
      action: 'Evidence uploaded',
      performedBy: 'Mike R.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: { fileName: 'sales_data_march_2024.xlsx', verified: true },
      ipAddress: '192.168.1.101'
    }
  ]);

  // Analytics data
  const complianceTrend = [
    { month: 'Jan', score: 94, violations: 2, audits: 5 },
    { month: 'Feb', score: 96, violations: 1, audits: 4 },
    { month: 'Mar', score: 92, violations: 3, audits: 6 },
    { month: 'Apr', score: 98, violations: 0, audits: 4 },
    { month: 'May', score: 97, violations: 1, audits: 5 },
    { month: 'Jun', score: 99, violations: 0, audits: 4 }
  ];

  const workflowPerformance = [
    { category: 'Cultivation', completed: 156, overdue: 4, avgTime: 45 },
    { category: 'Processing', completed: 48, overdue: 2, avgTime: 120 },
    { category: 'Security', completed: 52, overdue: 1, avgTime: 60 },
    { category: 'Financial', completed: 24, overdue: 0, avgTime: 180 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'in-progress': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'pending-review': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
      case 'failed': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'overdue': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'not-started': return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const calculateWorkflowProgress = (workflow: ComplianceWorkflow) => {
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const activeWorkflows = workflows.filter(w => w.status === 'in-progress').length;
  const overdueWorkflows = workflows.filter(w => w.status === 'overdue').length;
  const completedToday = workflows.filter(w => 
    w.lastCompleted && w.lastCompleted.toDateString() === new Date().toDateString()
  ).length;
  const complianceScore = 97; // Calculate based on completed vs total

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'workflows', label: 'Workflows', icon: Activity },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Compliance Workflow Engine</h1>
          <p className="text-gray-400">Automated compliance management and regulatory tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import Template
          </button>
        </div>
      </div>

      {/* Compliance Status Banner */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Compliance Score: {complianceScore}%</h2>
              <p className="text-green-400">All critical workflows on track • Next state inspection in 12 days</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{activeWorkflows}</p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{overdueWorkflows}</p>
              <p className="text-sm text-gray-400">Overdue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{completedToday}</p>
              <p className="text-sm text-gray-400">Completed Today</p>
            </div>
          </div>
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
          {/* Critical Alerts */}
          {overdueWorkflows > 0 && (
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-600/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Critical Compliance Alerts</h3>
              </div>
              <div className="mt-3 space-y-2">
                {workflows.filter(w => w.status === 'overdue').map(workflow => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{workflow.name}</p>
                      <p className="text-sm text-red-400">Overdue by {Math.abs(getDaysUntilDue(workflow.dueDate))} days</p>
                    </div>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                      Take Action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredWorkflows.slice(0, 6).map((workflow) => (
              <div key={workflow.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{workflow.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCriticalityColor(workflow.criticalLevel)}`}>
                    {workflow.criticalLevel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-white">{calculateWorkflowProgress(workflow)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculateWorkflowProgress(workflow)}%` }}
                    />
                  </div>
                </div>

                {/* Workflow Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Due</span>
                    <span className="text-white">
                      {mounted ? workflow.dueDate.toLocaleDateString() : '...'} ({getDaysUntilDue(workflow.dueDate)}d)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Assigned</span>
                    <span className="text-white">{workflow.assignedTo[0]}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedWorkflow(workflow)}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </button>
                  {workflow.status === 'in-progress' && (
                    <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      Continue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Workflows Today</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{workflows.filter(w => 
                getDaysUntilDue(w.dueDate) === 0
              ).length}</p>
              <p className="text-sm text-blue-400">Due today</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Automation Rate</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">78%</p>
              <p className="text-sm text-yellow-400">Automated steps</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Completion</span>
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">2.4h</p>
              <p className="text-sm text-green-400">Per workflow</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Compliance Rate</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">99.2%</p>
              <p className="text-sm text-purple-400">Last 30 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="cultivation">Cultivation</option>
              <option value="processing">Processing</option>
              <option value="distribution">Distribution</option>
              <option value="testing">Testing</option>
              <option value="security">Security</option>
              <option value="financial">Financial</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="pending-review">Pending Review</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCriticalityColor(workflow.criticalLevel)}`}>
                        {workflow.criticalLevel}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                      {workflow.automationEnabled && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-900/20 text-blue-400 border border-blue-600/30">
                          <Zap className="w-3 h-3 inline mr-1" />
                          Automated
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-4">{workflow.description}</p>

                    {/* Steps Progress */}
                    <div className="flex items-center gap-2 mb-4">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === 'completed' ? 'bg-green-600 text-white' :
                            step.status === 'in-progress' ? 'bg-blue-600 text-white' :
                            step.status === 'failed' ? 'bg-red-600 text-white' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <div className={`w-12 h-0.5 ${
                              step.status === 'completed' ? 'bg-green-600' : 'bg-gray-700'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Category</p>
                        <p className="text-white capitalize">{workflow.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Frequency</p>
                        <p className="text-white capitalize">{workflow.frequency}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Due Date</p>
                        <p className="text-white">
                          {mounted ? workflow.dueDate.toLocaleDateString() : '...'} 
                          <span className={`ml-1 ${getDaysUntilDue(workflow.dueDate) <= 1 ? 'text-red-400' : 'text-gray-400'}`}>
                            ({getDaysUntilDue(workflow.dueDate)}d)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Assigned To</p>
                        <p className="text-white">{workflow.assignedTo.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Archive className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
              <p className="text-sm text-gray-400">Complete history of all compliance activities</p>
            </div>
            <div className="divide-y divide-gray-800">
              {auditLogs.map((log) => {
                const workflow = workflows.find(w => w.id === log.workflowId);
                
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-600/30">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{log.action}</h4>
                          <p className="text-sm text-gray-400">
                            {workflow?.name} • by {log.performedBy}
                          </p>
                          <div className="mt-1 text-xs text-gray-500">
                            {mounted ? log.timestamp.toLocaleString() : '...'} • IP: {log.ipAddress}
                          </div>
                          {log.details && (
                            <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <Info className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Score Trend */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Compliance Score Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} name="Score %" />
                    <Line type="monotone" dataKey="violations" stroke="#EF4444" strokeWidth={2} name="Violations" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Workflow Performance */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Workflow Performance by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workflowPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Compliance Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">On-Time Completion</span>
                  <span className="text-green-400 font-medium">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">First-Time Pass Rate</span>
                  <span className="text-green-400 font-medium">98.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Automation Success</span>
                  <span className="text-blue-400 font-medium">91.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Review Time</span>
                  <span className="text-yellow-400 font-medium">1.2 hrs</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Regulatory Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">State Inspections Passed</span>
                  <span className="text-green-400 font-medium">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Reports On-Time</span>
                  <span className="text-green-400 font-medium">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Violations YTD</span>
                  <span className="text-red-400 font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Compliance Rating</span>
                  <span className="text-purple-400 font-medium">A+</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Process Efficiency</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Workflows Automated</span>
                  <span className="text-blue-400 font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time Saved Monthly</span>
                  <span className="text-green-400 font-medium">120 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cost Reduction</span>
                  <span className="text-green-400 font-medium">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-red-400 font-medium">0.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedWorkflow.name}</h3>
                <p className="text-gray-400">{selectedWorkflow.description}</p>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Workflow Steps</h4>
              {selectedWorkflow.steps.map((step, index) => (
                <div key={step.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'completed' ? 'bg-green-600 text-white' :
                      step.status === 'in-progress' ? 'bg-blue-600 text-white' :
                      step.status === 'failed' ? 'bg-red-600 text-white' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-white">{step.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                          step.status === 'in-progress' ? 'bg-blue-900/20 text-blue-400' :
                          step.status === 'failed' ? 'bg-red-900/20 text-red-400' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                      
                      {/* Checklist Items */}
                      {step.checklistItems && step.checklistItems.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {step.checklistItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <button className={`w-4 h-4 rounded border ${
                                item.completed 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-gray-600 hover:border-green-600'
                              }`}>
                                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                              </button>
                              <span className={`text-sm ${
                                item.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                              }`}>
                                {item.description}
                                {item.required && <span className="text-red-400 ml-1">*</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>Est: {step.estimatedTime} min</span>
                        {step.assignedTo && <span>Assigned: {step.assignedTo}</span>}
                        {step.completedBy && <span>Completed by: {step.completedBy}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedWorkflow.status === 'in-progress' && (
                <>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Upload Evidence
                  </button>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Continue Workflow
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}