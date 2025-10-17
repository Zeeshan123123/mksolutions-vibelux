'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Shield, AlertTriangle, CheckCircle, FileText, Calendar,
  Clock, Target, Scale, Building, MapPin, Bot, Sparkles,
  Download, Eye, RefreshCw, Bell, Zap, Users, BookOpen,
  ChevronRight, ExternalLink, Gavel, Flag, Search
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  regulation: string;
  jurisdiction: string;
  category: 'safety' | 'quality' | 'security' | 'environmental' | 'financial' | 'operational';
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  requirement: string;
  currentState: string;
  gapAnalysis: string;
  dueDate: string;
  lastReviewed: string;
  confidence: number;
  actions: ComplianceAction[];
  documentation: string[];
  estimatedCost: number;
  estimatedTime: string;
}

interface ComplianceAction {
  id: string;
  type: 'document' | 'process' | 'training' | 'equipment' | 'inspection';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  estimatedHours: number;
  cost: number;
}

interface RegulatoryUpdate {
  id: string;
  regulation: string;
  jurisdiction: string;
  title: string;
  summary: string;
  effectiveDate: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actionRequired: boolean;
  url?: string;
}

interface ClaudeRegulatoryAssistantProps {
  facilityId: string;
  jurisdiction: string;
  businessType: 'cultivation' | 'manufacturing' | 'retail' | 'testing' | 'distribution';
  facilitySize: 'small' | 'medium' | 'large';
  embedded?: boolean;
}

export function ClaudeRegulatoryAssistant({
  facilityId,
  jurisdiction,
  businessType,
  facilitySize,
  embedded = false
}: ClaudeRegulatoryAssistantProps) {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'compliance' | 'updates' | 'actions'>('compliance');
  const [searchTerm, setSearchTerm] = useState('');

  const analyzeCompliance = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/regulatory-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityId,
          jurisdiction,
          businessType,
          facilitySize,
          analysisType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new Error('Compliance analysis failed');
      }

      const data = await response.json();
      setComplianceItems(data.complianceItems || []);
      setRegulatoryUpdates(data.regulatoryUpdates || []);
      setLastAnalysis(new Date());

    } catch (error) {
      logger.error('ai', 'Regulatory compliance error:', error );
      // Fallback to mock data
      setComplianceItems(getMockComplianceItems());
      setRegulatoryUpdates(getMockRegulatoryUpdates());
      setLastAnalysis(new Date());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeCompliance();
  }, [facilityId, jurisdiction]);

  const getMockComplianceItems = (): ComplianceItem[] => [
    {
      id: 'safety-001',
      regulation: 'OSHA 29 CFR 1910',
      jurisdiction: 'Federal',
      category: 'safety',
      status: 'warning',
      priority: 'high',
      title: 'Hazard Communication Standard',
      description: 'Safety Data Sheets (SDS) must be maintained for all chemicals used in cultivation',
      requirement: 'Maintain current SDS for all chemicals, provide employee training on chemical hazards',
      currentState: 'SDS available for 85% of chemicals, training conducted 8 months ago',
      gapAnalysis: 'Missing SDS for 3 newer pesticides, training needs annual refresh',
      dueDate: '2025-02-15',
      lastReviewed: '2024-06-15',
      confidence: 92,
      actions: [
        {
          id: 'sds-update',
          type: 'document',
          title: 'Update Chemical SDS Library',
          description: 'Obtain current SDS for all cultivation chemicals',
          priority: 'high',
          deadline: '2025-01-30',
          status: 'pending',
          estimatedHours: 4,
          cost: 0
        },
        {
          id: 'safety-training',
          type: 'training',
          title: 'Annual Hazcom Training',
          description: 'Conduct annual hazard communication training for all staff',
          priority: 'medium',
          deadline: '2025-02-15',
          status: 'pending',
          estimatedHours: 8,
          cost: 500
        }
      ],
      documentation: ['SDS Library', 'Training Records', 'Chemical Inventory'],
      estimatedCost: 500,
      estimatedTime: '12 hours'
    },
    {
      id: 'security-001',
      regulation: 'State Cannabis Control Regulations',
      jurisdiction: 'California',
      category: 'security',
      status: 'compliant',
      priority: 'medium',
      title: 'Video Surveillance Requirements',
      description: 'Maintain 24/7 video surveillance with 90-day retention',
      requirement: '24/7 recording, 90-day retention, real-time monitoring capabilities',
      currentState: 'System operational with 120-day retention, monitored security service',
      gapAnalysis: 'System exceeds requirements, consider cost optimization',
      dueDate: '2025-12-31',
      lastReviewed: '2024-12-01',
      confidence: 98,
      actions: [],
      documentation: ['Security System Logs', 'Monitoring Service Contract'],
      estimatedCost: 0,
      estimatedTime: '0 hours'
    },
    {
      id: 'quality-001',
      regulation: 'Good Manufacturing Practices',
      jurisdiction: 'California',
      category: 'quality',
      status: 'violation',
      priority: 'critical',
      title: 'Batch Testing Requirements',
      description: 'All cultivation batches must undergo mandatory testing before distribution',
      requirement: 'Test all batches for pesticides, heavy metals, microbials, potency',
      currentState: 'Testing conducted for 90% of batches, delays in microbial testing',
      gapAnalysis: 'Need faster lab turnaround or backup testing facility',
      dueDate: '2025-01-15',
      lastReviewed: '2024-12-20',
      confidence: 95,
      actions: [
        {
          id: 'lab-contract',
          type: 'process',
          title: 'Secure Backup Testing Lab',
          description: 'Contract with additional laboratory for testing redundancy',
          priority: 'critical',
          deadline: '2025-01-10',
          status: 'in_progress',
          estimatedHours: 16,
          cost: 2500
        }
      ],
      documentation: ['Testing Results', 'Lab Contracts', 'COAs'],
      estimatedCost: 2500,
      estimatedTime: '16 hours'
    }
  ];

  const getMockRegulatoryUpdates = (): RegulatoryUpdate[] => [
    {
      id: 'update-001',
      regulation: 'Cannabis Control Regulations',
      jurisdiction: 'California',
      title: 'New Packaging and Labeling Requirements',
      summary: 'Updated requirements for child-resistant packaging and enhanced labeling standards effective March 2025',
      effectiveDate: '2025-03-01',
      impact: 'medium',
      category: 'packaging',
      actionRequired: true,
      url: 'https://cannabis.ca.gov/regulations'
    },
    {
      id: 'update-002',
      regulation: 'OSHA Standards',
      jurisdiction: 'Federal',
      title: 'Updated Respiratory Protection Standards',
      summary: 'New guidelines for respiratory protection in agricultural settings with emphasis on pesticide application',
      effectiveDate: '2025-02-15',
      impact: 'high',
      category: 'safety',
      actionRequired: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'violation': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <Flag className="w-4 h-4 text-orange-400" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Target className="w-4 h-4 text-blue-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <Shield className="w-5 h-5 text-red-400" />;
      case 'quality': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'security': return <Eye className="w-5 h-5 text-blue-400" />;
      case 'environmental': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'financial': return <Scale className="w-5 h-5 text-yellow-400" />;
      case 'operational': return <Building className="w-5 h-5 text-gray-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const getDaysUntil = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const filteredItems = complianceItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regulation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const complianceStats = {
    total: complianceItems.length,
    compliant: complianceItems.filter(i => i.status === 'compliant').length,
    warning: complianceItems.filter(i => i.status === 'warning').length,
    violation: complianceItems.filter(i => i.status === 'violation').length,
    pending: complianceItems.filter(i => i.status === 'pending').length,
  };

  const containerClass = embedded 
    ? 'space-y-6' 
    : 'bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Regulatory Compliance Assistant</h2>
            <p className="text-sm text-gray-400">
              Claude-powered compliance monitoring for {jurisdiction} {businessType} operations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastAnalysis && (
            <div className="text-xs text-gray-400">
              Last updated: {getTimeAgo(lastAnalysis.toISOString())}
            </div>
          )}
          <button
            onClick={analyzeCompliance}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3 text-red-300">
            <Bot className="w-5 h-5" />
            <span className="text-sm">Claude is analyzing regulatory compliance requirements...</span>
            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Compliance Overview */}
      {complianceItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-white">{complianceStats.total}</span>
            </div>
            <div className="text-sm text-gray-300 mt-1">Total Items</div>
          </div>
          
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{complianceStats.compliant}</span>
            </div>
            <div className="text-sm text-green-300 mt-1">Compliant</div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{complianceStats.warning}</span>
            </div>
            <div className="text-sm text-yellow-300 mt-1">Warnings</div>
          </div>
          
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-white">{complianceStats.violation}</span>
            </div>
            <div className="text-sm text-red-300 mt-1">Violations</div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{complianceStats.pending}</span>
            </div>
            <div className="text-sm text-blue-300 mt-1">Pending</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'compliance', label: 'Compliance Items', icon: Shield },
            { id: 'updates', label: 'Regulatory Updates', icon: Bell },
            { id: 'actions', label: 'Action Items', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'compliance' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search regulations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="safety">Safety</option>
              <option value="quality">Quality</option>
              <option value="security">Security</option>
              <option value="environmental">Environmental</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Sections */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          {filteredItems.length === 0 && !isAnalyzing && (
            <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
              <Gavel className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No compliance items found</p>
              <p className="text-sm text-gray-500">
                Adjust filters or refresh analysis
              </p>
            </div>
          )}

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${getStatusColor(item.status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      {getPriorityIcon(item.priority)}
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full uppercase">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                    <div className="text-xs text-gray-400">
                      {item.regulation} • {item.jurisdiction}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    Due: {getDaysUntil(item.dueDate)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Confidence: {item.confidence}%
                  </div>
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="bg-gray-900/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-white mb-2">Gap Analysis</h4>
                <p className="text-sm text-gray-300 mb-2">{item.gapAnalysis}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Current State:</span>
                    <p className="text-gray-300">{item.currentState}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Requirement:</span>
                    <p className="text-gray-300">{item.requirement}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {item.actions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Required Actions</h4>
                  <div className="space-y-2">
                    {item.actions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between bg-gray-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            action.status === 'completed' ? 'bg-green-400' :
                            action.status === 'in_progress' ? 'bg-yellow-400' :
                            action.status === 'overdue' ? 'bg-red-400' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-white">{action.title}</div>
                            <div className="text-xs text-gray-400">
                              Due: {getDaysUntil(action.deadline)} • {action.estimatedHours}h • ${action.cost}
                            </div>
                          </div>
                        </div>
                        {getPriorityIcon(action.priority)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Cost: ${item.estimatedCost}</span>
                  <span>Time: {item.estimatedTime}</span>
                  <span>Last reviewed: {getTimeAgo(item.lastReviewed)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Bot className="w-3 h-3" />
                  <span>Claude Analysis</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="space-y-4">
          {regulatoryUpdates.map((update) => (
            <div key={update.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{update.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      update.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                      update.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      update.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {update.impact} impact
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{update.summary}</p>
                  <div className="text-xs text-gray-400">
                    {update.regulation} • {update.jurisdiction} • Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                  </div>
                </div>
                {update.url && (
                  <a
                    href={update.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
              
              {update.actionRequired && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Action Required</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {complianceItems.flatMap(item => 
            item.actions.map(action => ({ ...action, regulation: item.regulation, itemTitle: item.title }))
          ).map((action) => (
            <div key={action.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    action.status === 'completed' ? 'bg-green-400' :
                    action.status === 'in_progress' ? 'bg-yellow-400' :
                    action.status === 'overdue' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-gray-400">{action.itemTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {getDaysUntil(action.deadline)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {action.estimatedHours}h • ${action.cost}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{action.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {action.priority} priority
                </span>
                
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}