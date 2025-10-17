'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Users,
  BarChart3,
  PieChart,
  FileText,
  Download,
  RefreshCw,
  Filter,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import type {
  Project,
  ProjectTask,
  Milestone,
  Risk,
  ProjectHealth
} from '@/lib/project-management/project-types';

interface ProjectTrackingDashboardProps {
  project?: Project;
  tasks: ProjectTask[];
  milestones?: Milestone[];
  risks?: Risk[];
}

interface ProjectMetrics {
  schedule: {
    currentPhase: string;
    overallProgress: number;
    scheduleVariance: number; // days ahead/behind
    criticalPathStatus: 'on_track' | 'at_risk' | 'delayed';
  };
  budget: {
    totalBudget: number;
    spentToDate: number;
    projectedCost: number;
    costVariance: number;
    burnRate: number;
  };
  quality: {
    qualityScore: number;
    defectRate: number;
    reworkHours: number;
    customerSatisfaction: number;
  };
  resources: {
    teamUtilization: number;
    availableCapacity: number;
    skillGaps: string[];
    atRiskResources: string[];
  };
  risks: {
    openRisks: number;
    highRisks: number;
    mitigatedRisks: number;
    riskScore: number;
  };
}

interface PerformanceKPI {
  id: string;
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export function ProjectTrackingDashboard({
  project,
  tasks,
  milestones = [],
  risks = []
}: ProjectTrackingDashboardProps) {
  const [activeView, setActiveView] = useState('overview');
  const [timeframe, setTimeframe] = useState('week'); // week, month, quarter
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [kpis, setKpis] = useState<PerformanceKPI[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['schedule', 'budget']));

  // Calculate project metrics
  useEffect(() => {
    const calculateMetrics = (): ProjectMetrics => {
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const totalBudget = tasks.reduce((sum, task) => sum + task.cost.budgeted, 0);
      const spentToDate = tasks.reduce((sum, task) => sum + task.cost.actual, 0);
      
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
      const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
      
      return {
        schedule: {
          currentPhase: 'Engineering & Design',
          overallProgress,
          scheduleVariance: -2, // 2 days behind
          criticalPathStatus: delayedTasks > 0 ? 'delayed' : inProgressTasks > 0 ? 'at_risk' : 'on_track'
        },
        budget: {
          totalBudget,
          spentToDate,
          projectedCost: totalBudget * 1.05, // 5% over budget projection
          costVariance: (spentToDate - totalBudget * (overallProgress / 100)) / totalBudget * 100,
          burnRate: spentToDate / Math.max(1, completedTasks) // cost per completed task
        },
        quality: {
          qualityScore: 4.2,
          defectRate: 0.05,
          reworkHours: 24,
          customerSatisfaction: 4.6
        },
        resources: {
          teamUtilization: 78,
          availableCapacity: 120,
          skillGaps: ['AutoCAD Specialist', 'Controls Engineer'],
          atRiskResources: ['Sarah Chen - Overallocated']
        },
        risks: {
          openRisks: risks.filter(r => r.status === 'open').length,
          highRisks: risks.filter(r => r.impact === 'high' || r.impact === 'very_high').length,
          mitigatedRisks: risks.filter(r => r.status === 'mitigated').length,
          riskScore: 6.2
        }
      };
    };

    const calculatedMetrics = calculateMetrics();
    setMetrics(calculatedMetrics);

    // Calculate KPIs
    const calculatedKPIs: PerformanceKPI[] = [
      {
        id: 'schedule_performance',
        name: 'Schedule Performance Index',
        current: 0.95,
        target: 1.0,
        trend: 'down',
        unit: '',
        status: 'warning'
      },
      {
        id: 'cost_performance',
        name: 'Cost Performance Index',
        current: 0.98,
        target: 1.0,
        trend: 'stable',
        unit: '',
        status: 'warning'
      },
      {
        id: 'quality_index',
        name: 'Quality Index',
        current: 4.2,
        target: 4.5,
        trend: 'up',
        unit: '/5',
        status: 'good'
      },
      {
        id: 'team_productivity',
        name: 'Team Productivity',
        current: 85,
        target: 90,
        trend: 'up',
        unit: '%',
        status: 'good'
      }
    ];
    
    setKpis(calculatedKPIs);
  }, [tasks, risks]);

  const getHealthColor = (health: ProjectHealth): string => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100'
    };
    return colors[health];
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Project Performance Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time tracking and analytics for project health and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {(['week', 'month', 'quarter'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeframe === period
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
              <Filter className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Project Health Status */}
        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Project Health:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor('yellow')}`}>
              ⚠️ At Risk
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Last Updated:</span>
            <span className="text-sm text-gray-600">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{kpi.name}</h4>
                {getTrendIcon(kpi.trend)}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                  {kpi.current}
                </span>
                <span className="text-sm text-gray-500">{kpi.unit}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Target: {kpi.target}{kpi.unit}</span>
                <span className={getStatusColor(kpi.status)}>
                  {kpi.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Schedule Performance */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('schedule')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Schedule Performance</h3>
              </div>
              {expandedSections.has('schedule') ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('schedule') && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {Math.round(metrics.schedule.overallProgress)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${metrics.schedule.overallProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${
                      metrics.schedule.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.schedule.scheduleVariance > 0 ? '+' : ''}{metrics.schedule.scheduleVariance}
                    </div>
                    <div className="text-sm text-gray-600">Schedule Variance (days)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {metrics.schedule.currentPhase}
                    </div>
                    <div className="text-sm text-gray-600">Current Phase</div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      metrics.schedule.criticalPathStatus === 'on_track' ? 'bg-green-100 text-green-800' :
                      metrics.schedule.criticalPathStatus === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metrics.schedule.criticalPathStatus.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Budget Performance */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('budget')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Budget Performance</h3>
              </div>
              {expandedSections.has('budget') ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('budget') && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ${(metrics.budget.totalBudget / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-gray-600">Total Budget</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${(metrics.budget.spentToDate / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-gray-600">Spent to Date</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      ${(metrics.budget.projectedCost / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-gray-600">Projected Cost</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${
                      metrics.budget.costVariance <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.budget.costVariance > 0 ? '+' : ''}{metrics.budget.costVariance.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Cost Variance</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Budget Utilization</span>
                    <span>{((metrics.budget.spentToDate / metrics.budget.totalBudget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(metrics.budget.spentToDate / metrics.budget.totalBudget) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quality Metrics */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('quality')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
              </div>
              {expandedSections.has('quality') ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('quality') && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {metrics.quality.qualityScore}
                    </div>
                    <div className="text-sm text-gray-600">Quality Score (/5)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {(metrics.quality.defectRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Defect Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {metrics.quality.reworkHours}h
                    </div>
                    <div className="text-sm text-gray-600">Rework Hours</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {metrics.quality.customerSatisfaction}
                    </div>
                    <div className="text-sm text-gray-600">Customer Satisfaction (/5)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('risks')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              </div>
              {expandedSections.has('risks') ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('risks') && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {metrics.risks.openRisks}
                    </div>
                    <div className="text-sm text-gray-600">Open Risks</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {metrics.risks.highRisks}
                    </div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {metrics.risks.mitigatedRisks}
                    </div>
                    <div className="text-sm text-gray-600">Mitigated</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {metrics.risks.riskScore}
                    </div>
                    <div className="text-sm text-gray-600">Risk Score (/10)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-white rounded border-l-4 border-yellow-400">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Address Schedule Delay</div>
              <div className="text-sm text-gray-600">Project is 2 days behind schedule. Consider resource reallocation or scope adjustment.</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-white rounded border-l-4 border-blue-400">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Resource Optimization</div>
              <div className="text-sm text-gray-600">Sarah Chen is overallocated. Consider redistributing tasks or hiring additional resources.</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-white rounded border-l-4 border-green-400">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Quality Improvement</div>
              <div className="text-sm text-gray-600">Quality metrics are improving. Continue current quality assurance practices.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}