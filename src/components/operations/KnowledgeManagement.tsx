'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Award,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Star,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Folder,
  Tag,
  MessageSquare,
  Bell,
  Shield,
  Target,
  Zap,
  RefreshCw,
  X,
  Save,
  Share2,
  Printer,
  History,
  UserCheck,
  GraduationCap,
  PlayCircle,
  Pause,
  Check,
  ChevronRight,
  ExternalLink,
  Copy,
  Archive,
  Lock,
  Unlock,
  Info,
  HelpCircle
} from 'lucide-react';

interface SOP {
  id: string;
  title: string;
  category: 'cultivation' | 'processing' | 'quality' | 'safety' | 'compliance' | 'equipment' | 'general';
  subcategory: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  description: string;
  content: SOPContent[];
  author: string;
  reviewedBy: string[];
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  effectiveDate: Date;
  reviewDate: Date;
  tags: string[];
  attachments: Attachment[];
  relatedSOPs: string[];
  requiredTraining?: string;
  complianceRequirements?: string[];
  criticalControlPoints?: string[];
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  completions: number;
  averageRating: number;
}

interface SOPContent {
  id: string;
  type: 'text' | 'checklist' | 'warning' | 'tip' | 'image' | 'video';
  order: number;
  title?: string;
  content: string;
  checklistItems?: Array<{
    id: string;
    text: string;
    required: boolean;
    checked?: boolean;
  }>;
  imageUrl?: string;
  videoUrl?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface TrainingRecord {
  id: string;
  userId: string;
  userName: string;
  sopId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  certificationExpiry?: Date;
  attempts: number;
  feedback?: string;
  supervisorSignoff?: {
    signedBy: string;
    signedAt: Date;
    comments?: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  sopCount: number;
  subcategories: string[];
}

export function KnowledgeManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'training' | 'create' | 'analytics' | 'compliance'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSOPModal, setShowNewSOPModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample data
  const [sops] = useState<SOP[]>([
    {
      id: 'sop-1',
      title: 'Plant Propagation - Cloning Procedure',
      category: 'cultivation',
      subcategory: 'Propagation',
      version: '2.1',
      status: 'approved',
      description: 'Standard procedure for taking and maintaining healthy clones from mother plants',
      content: [
        {
          id: 'content-1',
          type: 'text',
          order: 1,
          title: 'Purpose and Scope',
          content: 'This SOP outlines the standardized process for taking cuttings from mother plants and establishing healthy clones. This procedure ensures consistent clone quality and minimizes disease transmission.'
        },
        {
          id: 'content-2',
          type: 'checklist',
          order: 2,
          title: 'Required Materials',
          content: 'Gather all necessary materials before beginning',
          checklistItems: [
            { id: 'item-1', text: 'Sterile razor blades or scissors', required: true },
            { id: 'item-2', text: 'Cloning gel or powder', required: true },
            { id: 'item-3', text: 'Rockwool cubes (pre-soaked pH 5.5)', required: true },
            { id: 'item-4', text: 'Propagation dome and tray', required: true },
            { id: 'item-5', text: 'Spray bottle with pH adjusted water', required: true },
            { id: 'item-6', text: 'Nitrile gloves', required: true },
            { id: 'item-7', text: '70% isopropyl alcohol', required: true }
          ]
        },
        {
          id: 'content-3',
          type: 'warning',
          order: 3,
          content: 'Always sanitize tools between mother plants to prevent disease transmission. Never take clones from plants showing signs of pests or disease.'
        },
        {
          id: 'content-4',
          type: 'text',
          order: 4,
          title: 'Step-by-Step Procedure',
          content: '1. Select healthy growth tips 4-6 inches long\n2. Make 45-degree cut below node\n3. Remove lower leaves\n4. Dip in cloning gel immediately\n5. Insert into rockwool cube\n6. Place in propagation dome\n7. Maintain 70-80% humidity\n8. Check daily for root development'
        },
        {
          id: 'content-5',
          type: 'tip',
          order: 5,
          content: 'Pro Tip: Take clones during the mother plant\'s vegetative photoperiod for best results. Early morning is optimal when plants are fully hydrated.'
        }
      ],
      author: 'Sarah Mitchell',
      reviewedBy: ['Mike Rodriguez', 'Dr. Amanda Chen'],
      approvedBy: 'John Davidson',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-01'),
      effectiveDate: new Date('2024-03-15'),
      reviewDate: new Date('2025-03-15'),
      tags: ['cloning', 'propagation', 'vegetative', 'mother-plants'],
      attachments: [
        {
          id: 'att-1',
          name: 'Cloning_Checklist.pdf',
          type: 'application/pdf',
          size: 245000,
          url: '/docs/cloning-checklist.pdf',
          uploadedBy: 'Sarah Mitchell',
          uploadedAt: new Date('2024-01-15')
        }
      ],
      relatedSOPs: ['sop-2', 'sop-3'],
      requiredTraining: 'Basic Cultivation Techniques',
      complianceRequirements: ['State Plant Tracking', 'Sanitation Protocols'],
      criticalControlPoints: ['Tool sanitation', 'Clone labeling', 'Environmental conditions'],
      estimatedTime: 45,
      difficulty: 'beginner',
      views: 342,
      completions: 127,
      averageRating: 4.7
    },
    {
      id: 'sop-2',
      title: 'Integrated Pest Management (IPM) Weekly Inspection',
      category: 'cultivation',
      subcategory: 'Pest Management',
      version: '3.0',
      status: 'approved',
      description: 'Comprehensive inspection procedure for early pest and disease detection',
      content: [
        {
          id: 'content-1',
          type: 'text',
          order: 1,
          title: 'Inspection Overview',
          content: 'Weekly IPM inspections are critical for early detection and prevention of pest infestations. This systematic approach ensures all plants are thoroughly examined.'
        },
        {
          id: 'content-2',
          type: 'checklist',
          order: 2,
          title: 'Inspection Checklist',
          content: 'Complete for each room/zone',
          checklistItems: [
            { id: 'item-1', text: 'Check undersides of leaves', required: true },
            { id: 'item-2', text: 'Inspect stem junctions', required: true },
            { id: 'item-3', text: 'Examine soil surface', required: true },
            { id: 'item-4', text: 'Look for webbing or eggs', required: true },
            { id: 'item-5', text: 'Check sticky traps', required: true },
            { id: 'item-6', text: 'Document all findings', required: true }
          ]
        }
      ],
      author: 'Mike Rodriguez',
      reviewedBy: ['Sarah Mitchell', 'Lisa Kim'],
      approvedBy: 'John Davidson',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-15'),
      effectiveDate: new Date('2024-03-01'),
      reviewDate: new Date('2025-03-01'),
      tags: ['ipm', 'pest-control', 'inspection', 'prevention'],
      attachments: [],
      relatedSOPs: ['sop-1', 'sop-4'],
      requiredTraining: 'IPM Certification',
      complianceRequirements: ['Pesticide Application License', 'State IPM Requirements'],
      criticalControlPoints: ['Early detection', 'Accurate identification', 'Proper documentation'],
      estimatedTime: 60,
      difficulty: 'intermediate',
      views: 458,
      completions: 198,
      averageRating: 4.8
    },
    {
      id: 'sop-3',
      title: 'Harvest and Post-Harvest Handling',
      category: 'processing',
      subcategory: 'Harvest',
      version: '1.5',
      status: 'approved',
      description: 'Procedures for harvesting, handling, and initial processing of cannabis flowers',
      content: [
        {
          id: 'content-1',
          type: 'text',
          order: 1,
          title: 'Harvest Timing',
          content: 'Proper harvest timing is crucial for optimal cannabinoid and terpene profiles. Use jeweler\'s loupe to examine trichomes - harvest when 70-80% are cloudy/milky.'
        },
        {
          id: 'content-2',
          type: 'warning',
          order: 2,
          content: 'Critical: All harvest activities must be documented in state tracking system within 24 hours. Failure to comply may result in regulatory violations.'
        }
      ],
      author: 'Dr. Amanda Chen',
      reviewedBy: ['Sarah Mitchell', 'Mike Rodriguez'],
      approvedBy: 'John Davidson',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-28'),
      effectiveDate: new Date('2024-03-01'),
      reviewDate: new Date('2025-03-01'),
      tags: ['harvest', 'processing', 'compliance', 'quality'],
      attachments: [],
      relatedSOPs: ['sop-5', 'sop-6'],
      requiredTraining: 'Harvest Procedures Training',
      complianceRequirements: ['State Tracking Requirements', 'Chain of Custody'],
      criticalControlPoints: ['Weight documentation', 'Batch identification', 'Contamination prevention'],
      estimatedTime: 90,
      difficulty: 'intermediate',
      views: 567,
      completions: 234,
      averageRating: 4.9
    }
  ]);

  const [trainingRecords] = useState<TrainingRecord[]>([
    {
      id: 'training-1',
      userId: 'user-1',
      userName: 'Sarah Mitchell',
      sopId: 'sop-1',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      score: 95,
      status: 'completed',
      certificationExpiry: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000),
      attempts: 1,
      supervisorSignoff: {
        signedBy: 'John Davidson',
        signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        comments: 'Excellent understanding of procedures'
      }
    },
    {
      id: 'training-2',
      userId: 'user-2',
      userName: 'Mike Rodriguez',
      sopId: 'sop-2',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'in-progress',
      attempts: 1
    }
  ]);

  const categories: Category[] = [
    {
      id: 'cultivation',
      name: 'Cultivation',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400',
      sopCount: sops.filter(s => s.category === 'cultivation').length,
      subcategories: ['Propagation', 'Vegetative', 'Flowering', 'Pest Management', 'Nutrients']
    },
    {
      id: 'processing',
      name: 'Processing',
      icon: <Package className="w-5 h-5" />,
      color: 'text-blue-400',
      sopCount: sops.filter(s => s.category === 'processing').length,
      subcategories: ['Harvest', 'Drying', 'Curing', 'Trimming', 'Packaging']
    },
    {
      id: 'quality',
      name: 'Quality Control',
      icon: <Award className="w-5 h-5" />,
      color: 'text-purple-400',
      sopCount: sops.filter(s => s.category === 'quality').length,
      subcategories: ['Testing', 'Inspection', 'Documentation', 'Corrective Actions']
    },
    {
      id: 'safety',
      name: 'Safety',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-red-400',
      sopCount: sops.filter(s => s.category === 'safety').length,
      subcategories: ['PPE', 'Chemical Handling', 'Emergency Response', 'Equipment Safety']
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-yellow-400',
      sopCount: sops.filter(s => s.category === 'compliance').length,
      subcategories: ['State Regulations', 'Record Keeping', 'Audits', 'Reporting']
    },
    {
      id: 'equipment',
      name: 'Equipment',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-orange-400',
      sopCount: sops.filter(s => s.category === 'equipment').length,
      subcategories: ['Operation', 'Maintenance', 'Calibration', 'Troubleshooting']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'review': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'draft': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'archived': return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'expired': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredSOPs = sops.filter(sop => {
    const matchesCategory = selectedCategory === 'all' || sop.category === selectedCategory;
    const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sop.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Metrics
  const totalSOPs = sops.length;
  const approvedSOPs = sops.filter(s => s.status === 'approved').length;
  const trainingCompliance = trainingRecords.filter(t => t.status === 'completed').length / trainingRecords.length * 100;
  const avgRating = sops.reduce((sum, s) => sum + s.averageRating, 0) / sops.length;
  const totalViews = sops.reduce((sum, s) => sum + s.views, 0);
  const totalCompletions = sops.reduce((sum, s) => sum + s.completions, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'library', label: 'SOP Library', icon: BookOpen },
    { id: 'training', label: 'Training Records', icon: GraduationCap },
    { id: 'create', label: 'Create/Edit', icon: Edit },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Knowledge Management</h1>
          <p className="text-gray-400">Standard Operating Procedures and training resources</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewSOPModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New SOP
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total SOPs</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalSOPs}</p>
          <p className="text-sm text-green-400">{approvedSOPs} approved</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Training Compliance</span>
            <GraduationCap className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{trainingCompliance.toFixed(0)}%</p>
          <p className="text-sm text-green-400">Up to date</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Rating</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-yellow-400">User satisfaction</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Views</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalViews}</p>
          <p className="text-sm text-blue-400">This month</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Completions</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalCompletions}</p>
          <p className="text-sm text-green-400">Training sessions</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Updates Due</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-sm text-orange-400">Next 30 days</p>
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
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-gray-800 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400">{category.sopCount} SOPs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <div key={sub} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{sub}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  ))}
                  {category.subcategories.length > 3 && (
                    <p className="text-xs text-gray-500">+{category.subcategories.length - 3} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Recently Updated SOPs</h3>
              <div className="space-y-3">
                {sops.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5).map((sop) => (
                  <div key={sop.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{sop.title}</p>
                      <p className="text-sm text-gray-400">v{sop.version} • {sop.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {mounted ? sop.updatedAt.toLocaleDateString() : '...'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(sop.status)}`}>
                        {sop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
              <div className="space-y-3">
                {trainingRecords.slice(0, 5).map((record) => {
                  const sop = sops.find(s => s.id === record.sopId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{record.userName}</p>
                        <p className="text-sm text-gray-400">{sop?.title}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {record.score && (
                          <p className="text-sm text-green-400 mt-1">{record.score}%</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SOPs..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SOPs Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSOPs.map((sop) => (
                <div key={sop.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{sop.title}</h3>
                      <p className="text-sm text-gray-400">v{sop.version} • {sop.subcategory}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(sop.status)}`}>
                      {sop.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{sop.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Difficulty</span>
                      <span className={getDifficultyColor(sop.difficulty)}>{sop.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Est. Time</span>
                      <span className="text-white">{sop.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{sop.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSOP(sop)}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    >
                      View SOP
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">SOP Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Version</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Updated</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSOPs.map((sop) => (
                    <tr key={sop.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{sop.title}</p>
                          <p className="text-sm text-gray-400">{sop.author}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{sop.category}</p>
                        <p className="text-sm text-gray-400">{sop.subcategory}</p>
                      </td>
                      <td className="px-4 py-3 text-white">v{sop.version}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(sop.status)}`}>
                          {sop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {mounted ? sop.updatedAt.toLocaleDateString() : '...'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedSOP(sop)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SOP Detail Modal */}
      {selectedSOP && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedSOP.title}</h3>
                <p className="text-gray-400">Version {selectedSOP.version} • {selectedSOP.category}</p>
              </div>
              <button
                onClick={() => setSelectedSOP(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* SOP Content */}
              <div className="space-y-4">
                {selectedSOP.content.map((content) => {
                  switch (content.type) {
                    case 'text':
                      return (
                        <div key={content.id} className="bg-gray-800 rounded-lg p-4">
                          {content.title && (
                            <h4 className="font-semibold text-white mb-2">{content.title}</h4>
                          )}
                          <p className="text-gray-300 whitespace-pre-wrap">{content.content}</p>
                        </div>
                      );
                    case 'checklist':
                      return (
                        <div key={content.id} className="bg-gray-800 rounded-lg p-4">
                          {content.title && (
                            <h4 className="font-semibold text-white mb-2">{content.title}</h4>
                          )}
                          <p className="text-gray-400 mb-3">{content.content}</p>
                          <div className="space-y-2">
                            {content.checklistItems?.map((item) => (
                              <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  defaultChecked={item.checked}
                                />
                                <span className={`text-sm ${item.required ? 'text-white' : 'text-gray-400'}`}>
                                  {item.text}
                                  {item.required && <span className="text-red-400 ml-1">*</span>}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    case 'warning':
                      return (
                        <div key={content.id} className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300">{content.content}</p>
                          </div>
                        </div>
                      );
                    case 'tip':
                      return (
                        <div key={content.id} className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-blue-300">{content.content}</p>
                          </div>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-sm text-gray-400">Author</p>
                  <p className="text-white">{selectedSOP.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Effective Date</p>
                  <p className="text-white">{mounted ? selectedSOP.effectiveDate.toLocaleDateString() : '...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Review Date</p>
                  <p className="text-white">{mounted ? selectedSOP.reviewDate.toLocaleDateString() : '...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Required Training</p>
                  <p className="text-white">{selectedSOP.requiredTraining || 'None'}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedSOP(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Start Training
                </button>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}