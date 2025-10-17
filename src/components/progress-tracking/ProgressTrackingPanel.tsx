'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Bell,
  BellOff,
  Activity,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  MessageSquare,
  Mail,
  Smartphone,
  Slack,
  AlertCircle,
  Info,
  XCircle,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';

import type {
  Project
} from '@/lib/project-management/project-types';
import {
  ProgressTracker,
  type ProgressMetrics,
  type ProgressInsight,
  type Notification,
  type NotificationRule,
  type ProgressUpdate
} from '@/lib/progress-tracking/progress-tracker';

interface ProgressTrackingPanelProps {
  project: Project;
  onProgressUpdate?: (update: ProgressUpdate) => void;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

export function ProgressTrackingPanel({
  project,
  onProgressUpdate,
  onNotificationAction
}: ProgressTrackingPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'notifications' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAutoUpdate, setShowAutoUpdate] = useState(true);
  
  const progressTracker = new ProgressTracker();

  useEffect(() => {
    loadProgressData();
    
    if (showAutoUpdate) {
      const interval = setInterval(loadProgressData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [project.id, showAutoUpdate]);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      // Calculate current metrics
      const currentMetrics = progressTracker.calculateProgressMetrics(project);
      setMetrics(currentMetrics);
      
      // Generate insights
      const currentInsights = await progressTracker.generateProgressInsights(project);
      setInsights(currentInsights);
      
      // Get notifications
      const currentNotifications = progressTracker.getNotifications(project.id);
      setNotifications(currentNotifications);
      
      // Get rules
      const currentRules = progressTracker.getRules();
      setRules(currentRules);
      
    } catch (error) {
      logger.error('system', 'Failed to load progress data:', error );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskProgressUpdate = async (taskId: string, newProgress: number) => {
    try {
      const update = await progressTracker.updateTaskProgress(
        project,
        taskId,
        newProgress,
        'current-user', // Would get from auth context
        `Progress updated to ${newProgress}%`
      );
      
      if (onProgressUpdate) {
        onProgressUpdate(update);
      }
      
      // Reload data to reflect changes
      await loadProgressData();
    } catch (error) {
      logger.error('system', 'Failed to update task progress:', error );
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress: number): string => {
    if (progress >= 90) return 'bg-green-600';
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'on_track': 'text-green-600',
      'at_risk': 'text-yellow-600',
      'delayed': 'text-red-600',
      'completed': 'text-blue-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'normal': 'bg-blue-100 text-blue-800 border-blue-200',
      'low': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'slack':
        return <Slack className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading progress data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Progress Tracking & Notifications
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time progress monitoring and intelligent notifications for {project.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAutoUpdate(!showAutoUpdate)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAutoUpdate
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showAutoUpdate ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              Auto-Update
            </button>
            
            <button
              onClick={loadProgressData}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'insights', name: 'Insights', icon: Zap },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
              {tab.id === 'notifications' && notifications.filter(n => n.status !== 'read').length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {notifications.filter(n => n.status !== 'read').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="p-6">
          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Overall Progress</p>
                  <p className={`text-2xl font-bold ${getProgressColor(metrics.overallProgress)}`}>
                    {metrics.overallProgress.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-3">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBgColor(metrics.overallProgress)}`}
                    style={{ width: `${metrics.overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Schedule Performance</p>
                  <p className={`text-2xl font-bold ${
                    metrics.schedulePerformance.schedulePerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(metrics.schedulePerformance.schedulePerformanceIndex * 100).toFixed(0)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-sm mt-2">
                {metrics.schedulePerformance.scheduleVariance > 0 ? 'Ahead' : 'Behind'} by {Math.abs(metrics.schedulePerformance.scheduleVariance).toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Tasks Completed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {metrics.taskMetrics.completedTasks}/{metrics.taskMetrics.totalTasks}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-purple-600 text-sm mt-2">
                {((metrics.taskMetrics.completedTasks / metrics.taskMetrics.totalTasks) * 100).toFixed(1)}% complete
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Milestones Hit</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {metrics.milestoneMetrics.achievedMilestones}/{metrics.milestoneMetrics.totalMilestones}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-orange-600 text-sm mt-2">
                {(metrics.milestoneMetrics.milestoneHitRate * 100).toFixed(1)}% hit rate
              </p>
            </div>
          </div>

          {/* Phase Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Progress</h3>
              <div className="space-y-4">
                {metrics.phaseMetrics.map((phase) => (
                  <div key={phase.phaseId} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{phase.phaseName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        phase.status === 'on_track' ? 'bg-blue-100 text-blue-800' :
                        phase.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {phase.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {phase.actualProgress.toFixed(1)}%</span>
                      <span>Tasks: {phase.tasksCompleted}/{phase.totalTasks}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressBgColor(phase.actualProgress)}`}
                        style={{ width: `${phase.actualProgress}%` }}
                      />
                    </div>
                    
                    {Math.abs(phase.variance) > 5 && (
                      <div className="mt-2 flex items-center text-sm">
                        {phase.variance > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={phase.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                          {phase.variance > 0 ? '+' : ''}{phase.variance.toFixed(1)}% vs planned
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analysis</h3>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Estimated Completion</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.predictions.estimatedCompletionDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {metrics.predictions.confidenceLevel}%
                </p>
              </div>

              {metrics.predictions.riskFactors.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {metrics.predictions.riskFactors.map((risk, index) => (
                      <li key={index} className="text-sm text-yellow-800">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {metrics.predictions.recommendedActions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {metrics.predictions.recommendedActions.map((action, index) => (
                      <li key={index} className="text-sm text-blue-800">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
            <span className="text-sm text-gray-500">
              {insights.length} insight{insights.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600">
                Insights will appear as the system analyzes project progress patterns.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {insights.map((insight) => (
                <div key={insight.id} className={`rounded-lg border-l-4 p-6 ${
                  insight.severity === 'critical' ? 'bg-red-50 border-red-400' :
                  insight.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(insight.severity)}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-gray-700 mb-3">{insight.description}</p>
                        
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Impact:</h5>
                          <p className="text-gray-700">{insight.impact}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-gray-700">• {rec}</li>
                            ))}
                          </ul>
                        </div>

                        {Object.keys(insight.metrics).length > 0 && (
                          <div className="bg-white rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 mb-2">Metrics:</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(insight.metrics).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                  <span className="font-medium ml-1">
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.confidence}% Confidence
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {insight.generatedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-1 inline" />
                Filter
              </button>
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                You'll receive notifications here when project events occur.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`rounded-lg border p-4 ${
                  notification.status === 'read' ? 'bg-gray-50' : 'bg-white border-blue-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.createdAt.toLocaleString()}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Channels:</span>
                          {notification.channels.map((channel, index) => (
                            <span key={index} className="text-gray-600">
                              {getChannelIcon(channel)}
                            </span>
                          ))}
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                          notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          notification.status === 'read' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status !== 'read' && (
                        <button
                          onClick={() => onNotificationAction?.(notification.id, 'mark_read')}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Rules</h3>
          
          <div className="space-y-6">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                    <p className="text-gray-600 text-sm">{rule.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Triggers:</span>
                    <div className="font-medium">
                      {rule.triggers.map(t => t.type).join(', ')}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Channels:</span>
                    <div className="flex items-center space-x-1">
                      {rule.channels.map((channel, index) => (
                        <span key={index}>{getChannelIcon(channel)}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Frequency:</span>
                    <div className="font-medium">{rule.frequency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add New Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}