'use client';

import React, { useState, useEffect } from 'react';
import { ProjectManagementService } from '@/lib/project-management/project-service';
import { useToast } from '@/components/ui/use-toast';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Info,
  CheckSquare,
  Timer,
  Workflow
} from 'lucide-react';

import { TimelineAutomationEngine } from '@/lib/project-management/timeline-automation';
import { StakeholderPortalEngine } from '@/lib/project-management/stakeholder-portal';
import { CascadeCalculator } from '@/lib/project-management/cascade-calculator';
import { ApprovalWorkflowEngine } from '@/lib/project-management/approval-workflow';

import type { Project } from '@/lib/project-management/project-types';

interface AutomatedProjectManagerProps {
  project: Project;
  onProjectUpdate?: (project: Project) => void;
}

interface SystemStatus {
  timelineAutomation: 'active' | 'warning' | 'error';
  stakeholderPortal: 'active' | 'warning' | 'error';
  cascadeCalculator: 'active' | 'warning' | 'error';
  approvalWorkflow: 'active' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  type: 'timeline_update' | 'approval_request' | 'stakeholder_update' | 'cascade_analysis';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  actor: string;
}

export function AutomatedProjectManager({ project, onProjectUpdate }: AutomatedProjectManagerProps) {
  const { toast } = useToast();
  
  // State management
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    timelineAutomation: 'active',
    stakeholderPortal: 'active',
    cascadeCalculator: 'active',
    approvalWorkflow: 'active'
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeUpdates, setActiveUpdates] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalUpdatesProcessed: 0,
    averageProcessingTime: 0,
    autoApprovalRate: 0,
    stakeholderSatisfaction: 0,
    timelinePredictionAccuracy: 0
  });
  
  // Engine instances
  const [timelineEngine] = useState(() => new TimelineAutomationEngine());
  const [stakeholderEngine] = useState(() => new StakeholderPortalEngine(timelineEngine));
  const [cascadeCalculator] = useState(() => new CascadeCalculator(project));
  const [approvalEngine] = useState(() => new ApprovalWorkflowEngine());
  
  // Demo state for UI
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    initializeEngines();
    loadRecentActivity();
    
    // Set up event listeners
    setupEventListeners();
    
    return () => {
      // Cleanup listeners
    };
  }, [project.id]);

  const initializeEngines = async () => {
    try {
      // Initialize timeline automation
      timelineEngine.on('timeline_adjustment_created', handleTimelineAdjustment);
      timelineEngine.on('timeline_implemented', handleTimelineImplemented);
      
      // Initialize stakeholder portal
      stakeholderEngine.on('timeline_update_submitted', handleStakeholderUpdate);
      stakeholderEngine.on('update_escalated', handleUpdateEscalated);
      
      // Initialize approval workflow
      approvalEngine.on('approval_workflow_started', handleApprovalStarted);
      approvalEngine.on('approval_workflow_completed', handleApprovalCompleted);
      
      console.log('✅ All project management engines initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize engines:', error);
      setSystemStatus(prev => ({ ...prev, timelineAutomation: 'error' }));
    }
  };

  const setupEventListeners = () => {
    // Listen for external stakeholder updates
    window.addEventListener('stakeholder-update', handleExternalUpdate);
    
    // Listen for project changes
    window.addEventListener('project-change', handleProjectChange);
  };

  const loadRecentActivity = async () => {
    try {
      // Load real project updates from database
      const updates = await ProjectManagementService.getProjectUpdates(project.id);
      
      // Transform updates to recent activity format
      const activities: RecentActivity[] = updates.map(update => ({
        id: update.id,
        type: update.updateType === 'delay' ? 'cascade_analysis' : 
              update.updateType === 'milestone' ? 'timeline_update' : 
              update.updateType === 'risk' ? 'approval_request' : 
              'stakeholder_update' as any,
        title: update.title,
        description: update.description,
        timestamp: new Date(update.createdAt),
        priority: update.impactLevel === 'critical' ? 'urgent' : 
                  update.impactLevel === 'high' ? 'high' : 
                  update.impactLevel === 'medium' ? 'medium' : 'low',
        status: 'completed' as const,
        actor: update.createdBy
      }));
      
      if (activities.length > 0) {
        setRecentActivity(activities);
      } else {
        // If no real activities, use sample data for demo
        const sampleActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'stakeholder_update',
        title: 'Fluence LED Delivery Delayed',
        description: 'LED fixtures delivery pushed from 10 to 26 weeks due to supply chain issues',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'high',
        status: 'completed',
        actor: 'Fluence Bioengineering'
      },
      {
        id: '2',
        type: 'cascade_analysis',
        title: 'Cascade Analysis Completed',
        description: '14 tasks affected, 23-day total delay, $18,500 cost impact',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        priority: 'high',
        status: 'completed',
        actor: 'Automated System'
      },
      {
        id: '3',
        type: 'approval_request',
        title: 'Client Approval Required',
        description: 'Timeline change requires client approval due to $18,500 budget impact',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        priority: 'high',
        status: 'pending',
        actor: 'Approval System'
      },
      {
        id: '4',
        type: 'timeline_update',
        title: 'Alternative Supplier Identified',
        description: 'Found alternative LED supplier with 18-week delivery at +$8,000 cost',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium',
        status: 'in_progress',
        actor: 'Procurement Team'
      }
    ];
    
        setRecentActivity(sampleActivity);
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      // Fallback to sample data
      const sampleActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'stakeholder_update',
          title: 'Demo: LED Delivery Status',
          description: 'This is demo data. Connect to database for real updates.',
          timestamp: new Date(),
          priority: 'medium',
          status: 'completed',
          actor: 'Demo System'
        }
      ];
      setRecentActivity(sampleActivity);
    }
  };

  // Event handlers
  const handleTimelineAdjustment = (data: any) => {
    console.log('📅 Timeline adjustment created:', data);
    
    setRecentActivity(prev => [{
      id: `timeline-${Date.now()}`,
      type: 'timeline_update',
      title: 'Timeline Adjustment Created',
      description: `Project timeline adjusted due to ${data.adjustment.originalUpdate.updateType}`,
      timestamp: new Date(),
      priority: data.adjustment.criticalPathAffected ? 'high' : 'medium',
      status: 'completed',
      actor: 'Timeline Engine'
    }, ...prev.slice(0, 9)]);
  };

  const handleTimelineImplemented = (data: any) => {
    console.log('✅ Timeline implemented:', data);
    
    if (onProjectUpdate) {
      onProjectUpdate(data.project);
    }
  };

  const handleStakeholderUpdate = (data: any) => {
    console.log('👥 Stakeholder update received:', data);
    
    setActiveUpdates(prev => [...prev, data.update]);
  };

  const handleUpdateEscalated = (data: any) => {
    console.log('🚨 Update escalated:', data);
    
    setRecentActivity(prev => [{
      id: `escalation-${Date.now()}`,
      type: 'approval_request',
      title: 'Update Escalated for Approval',
      description: `${data.update.updateType} escalated due to ${data.impact.delayDays} day delay`,
      timestamp: new Date(),
      priority: 'urgent',
      status: 'pending',
      actor: 'Escalation System'
    }, ...prev.slice(0, 9)]);
  };

  const handleApprovalStarted = (data: any) => {
    console.log('📋 Approval workflow started:', data);
    
    setPendingApprovals(prev => [...prev, data.request]);
  };

  const handleApprovalCompleted = (data: any) => {
    console.log('✅ Approval workflow completed:', data);
    
    setPendingApprovals(prev => prev.filter(a => a.id !== data.request.id));
  };

  const handleExternalUpdate = (event: any) => {
    console.log('🔄 External update received:', event.detail);
  };

  const handleProjectChange = (event: any) => {
    console.log('📊 Project change detected:', event.detail);
  };

  // Demo functions
  const runDemo = async () => {
    setShowDemo(true);
    setDemoStep(1);
    
    try {
      // Create demo task in database
      const demoTask = await ProjectManagementService.createProjectTask({
        projectId: project.id,
        title: 'Demo: LED Fixture Delivery',
        description: 'Demo task for testing delay impact analysis',
        taskType: 'procurement',
        dependencies: [],
        blockedBy: [],
        assignedTo: [],
        contractors: ['Fluence Bioengineering'],
        plannedStart: new Date(),
        plannedEnd: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000), // 10 weeks
        status: 'in_progress',
        progress: 25,
        estimatedCost: 50000,
        isMilestone: false,
        riskFactors: ['supply_chain', 'semiconductor_shortage']
      });
      
      if (demoTask) {
        // Step 1: Simulate stakeholder update
        setTimeout(async () => {
          setDemoStep(2);
          
          // Create project update for delay
          await ProjectManagementService.createProjectUpdate({
            projectId: project.id,
            updateType: 'delay',
            title: 'LED Fixture Delivery Delayed',
            description: 'LED fixtures delivery pushed from 10 to 26 weeks due to supply chain issues',
            impactLevel: 'high',
            affectedTasks: [demoTask.id],
            delayDays: 112, // 16 weeks
            newEndDate: new Date(Date.now() + 26 * 7 * 24 * 60 * 60 * 1000),
            costImpact: 18500,
            createdBy: 'Fluence Bioengineering',
            notifiedStakeholders: []
          });
          
          await stakeholderEngine.handleManufacturerDelayUpdate(
            'fluence-bio',
            project.id,
            [
              {
                fixtureId: 'spydr-2p-001',
                model: 'SPYDR 2p',
                quantity: 50,
                originalDeliveryWeeks: 10,
                newDeliveryWeeks: 26,
                reason: 'Global semiconductor shortage affecting LED driver components'
              }
            ]
          );
          
        }, 2000);
      }
    
    // Step 2: Cascade analysis
    setTimeout(async () => {
      setDemoStep(3);
      
      const cascadeAnalysis = await cascadeCalculator.calculateLightingDelayImpact(
        16, // 16 week additional delay
        [{ id: 'spydr-2p-001', model: 'SPYDR 2p', quantity: 50 }]
      );
      
      console.log('📊 Demo cascade analysis:', cascadeAnalysis);
      
    }, 4000);
    
    // Step 3: Approval workflow
    setTimeout(() => {
      setDemoStep(4);
      
      setRecentActivity(prev => [{
        id: 'demo-approval',
        type: 'approval_request',
        title: 'DEMO: Client Approval Required',
        description: 'Timeline change requires approval: 16-week delay, $18,500 impact',
        timestamp: new Date(),
        priority: 'high',
        status: 'pending',
        actor: 'Demo System'
      }, ...prev.slice(0, 9)]);
      
    }, 6000);
    
    // Step 4: Completion
    setTimeout(() => {
      setDemoStep(5);
      setShowDemo(false);
      
      setRecentActivity(prev => [{
        id: 'demo-complete',
        type: 'timeline_update',
        title: 'DEMO: Timeline Updated Successfully',
        description: 'Project timeline automatically adjusted and stakeholders notified',
        timestamp: new Date(),
        priority: 'medium',
        status: 'completed',
        actor: 'Automated System'
      }, ...prev.slice(0, 9)]);
      
    }, 8000);
    } catch (error) {
      console.error('Failed to run demo:', error);
      setShowDemo(false);
      toast({
        title: 'Demo Error',
        description: 'Failed to create demo scenario',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'timeline_update': return <Calendar className="w-4 h-4" />;
      case 'approval_request': return <CheckSquare className="w-4 h-4" />;
      case 'stakeholder_update': return <Users className="w-4 h-4" />;
      case 'cascade_analysis': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Automated Project Manager</h1>
            <p className="text-gray-400 mt-2">
              Real-time project timeline automation and stakeholder coordination
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={runDemo}
              disabled={showDemo}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {showDemo ? 'Demo Running...' : 'Run Demo'}
            </button>
            
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Demo Progress */}
        {showDemo && (
          <div className="mb-8 p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Demo in Progress</h3>
              <span className="text-sm text-purple-300">Step {demoStep} of 5</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-2 ${demoStep >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
                Stakeholder Update
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center gap-2 ${demoStep >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
                <Activity className="w-4 h-4" />
                Cascade Analysis
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center gap-2 ${demoStep >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                <CheckSquare className="w-4 h-4" />
                Approval Request
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center gap-2 ${demoStep >= 4 ? 'text-green-400' : 'text-gray-400'}`}>
                <Calendar className="w-4 h-4" />
                Timeline Update
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Timeline Automation</h3>
              <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.timelineAutomation)}`}>
                {getStatusIcon(systemStatus.timelineAutomation)}
                <span className="text-sm capitalize">{systemStatus.timelineAutomation}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Automatically calculates timeline impacts and adjusts project schedules
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">Processed:</span>
                <span className="text-white ml-1">{systemMetrics.totalUpdatesProcessed}</span>
              </div>
              <div>
                <span className="text-gray-400">Avg Time:</span>
                <span className="text-white ml-1">{systemMetrics.averageProcessingTime}s</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stakeholder Portal</h3>
              <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.stakeholderPortal)}`}>
                {getStatusIcon(systemStatus.stakeholderPortal)}
                <span className="text-sm capitalize">{systemStatus.stakeholderPortal}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Real-time updates from suppliers, contractors, and vendors
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">Active:</span>
                <span className="text-white ml-1">{activeUpdates.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Rating:</span>
                <span className="text-white ml-1">{systemMetrics.stakeholderSatisfaction * 100}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cascade Calculator</h3>
              <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.cascadeCalculator)}`}>
                {getStatusIcon(systemStatus.cascadeCalculator)}
                <span className="text-sm capitalize">{systemStatus.cascadeCalculator}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Analyzes downstream impacts of timeline changes
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-white ml-1">{systemMetrics.timelinePredictionAccuracy * 100}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Approval Workflow</h3>
              <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.approvalWorkflow)}`}>
                {getStatusIcon(systemStatus.approvalWorkflow)}
                <span className="text-sm capitalize">{systemStatus.approvalWorkflow}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Automated approval routing and stakeholder notifications
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">Pending:</span>
                <span className="text-white ml-1">{pendingApprovals.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Auto-Approve:</span>
                <span className="text-white ml-1">{systemMetrics.autoApprovalRate * 100}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Recent Activity</h3>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 ${getPriorityColor(activity.priority)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                      <span className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{activity.actor}</span>
                      <div className={`flex items-center gap-1 text-xs ${
                        activity.status === 'completed' ? 'text-green-400' :
                        activity.status === 'failed' ? 'text-red-400' :
                        activity.status === 'in_progress' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {activity.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {activity.status === 'failed' && <XCircle className="w-3 h-3" />}
                        {activity.status === 'in_progress' && <Timer className="w-3 h-3" />}
                        {activity.status === 'pending' && <Clock className="w-3 h-3" />}
                        <span className="capitalize">{activity.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">System Performance</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Timeline Prediction Accuracy</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Auto-Approval Rate</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Stakeholder Satisfaction</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Processing Speed</span>
                  <span className="text-sm font-medium">2.3s avg</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">156</div>
                <div className="text-xs text-gray-400">Updates Processed</div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">23</div>
                <div className="text-xs text-gray-400">Active Stakeholders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Scenario */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <Workflow className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Example: Manufacturer Delay Automation</h3>
              <p className="text-gray-300 mb-4">
                When Fluence updates LED fixture delivery from 10 to 26 weeks, the system automatically:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-sm">Receives stakeholder portal update</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-sm">Calculates cascade effects on 14 dependent tasks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-sm">Identifies $18,500 budget impact</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <span className="text-sm">Routes approval to client (required for &gt;$10k)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                    <span className="text-sm">Notifies all affected stakeholders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">6</div>
                    <span className="text-sm">Updates project timeline automatically</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-blue-300">
                ⚡ Total processing time: <strong>2.3 seconds</strong> vs <strong>2-3 days</strong> manual process
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}