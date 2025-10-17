'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Filter,
  Plus,
  Settings,
  FileText,
  Download,
  Share,
  MessageSquare,
  Target,
  DollarSign,
  Activity
} from 'lucide-react';
import { GanttChart } from './GanttChart';
import { ResourceAllocationPanel } from './ResourceAllocationPanel';
import { ProjectTrackingDashboard } from './ProjectTrackingDashboard';
import type {
  Project,
  ProjectTask,
  ProjectMember,
  Milestone,
  Risk,
  ProjectPhase
} from '@/lib/project-management/project-types';

interface ProjectManagementPanelProps {
  project?: Project;
  onProjectUpdate?: (project: Project) => void;
  cogenerationComponents?: any[];
  designState?: any;
}

export function ProjectManagementPanel({
  project,
  onProjectUpdate,
  cogenerationComponents = [],
  designState
}: ProjectManagementPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Generate default cogeneration project structure
  useEffect(() => {
    if (!project && cogenerationComponents.length > 0) {
      const defaultTasks = generateCogenerationTasks(cogenerationComponents);
      setTasks(defaultTasks);
    } else if (project) {
      setTasks(project.tasks);
    }
  }, [project, cogenerationComponents]);

  const generateCogenerationTasks = (components: any[]): ProjectTask[] => {
    const baseDate = new Date();
    const tasks: ProjectTask[] = [];

    // Phase 1: Engineering & Design
    tasks.push({
      id: 'eng-001',
      name: 'Site Survey and Analysis',
      description: 'Conduct detailed site survey and energy analysis',
      category: 'engineering',
      phase: {
        id: 'phase-1',
        name: 'Engineering & Design',
        description: 'Complete engineering design and documentation',
        order: 1,
        color: '#3B82F6',
        plannedStartDate: baseDate,
        plannedEndDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 50000,
        actualCost: 0,
        approvals: [],
        taskIds: ['eng-001', 'eng-002', 'eng-003']
      },
      startDate: baseDate,
      endDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      duration: 5,
      plannedDuration: 5,
      dependencies: [],
      predecessors: [],
      successors: ['eng-002'],
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignedTo: [],
      estimatedHours: 40,
      actualHours: 0,
      cost: { budgeted: 8000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    tasks.push({
      id: 'eng-002',
      name: 'Equipment Selection and Sizing',
      description: 'Select and size cogeneration equipment based on load analysis',
      category: 'engineering',
      phase: {
        id: 'phase-1',
        name: 'Engineering & Design',
        description: 'Complete engineering design and documentation',
        order: 1,
        color: '#3B82F6',
        plannedStartDate: baseDate,
        plannedEndDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 50000,
        actualCost: 0,
        approvals: [],
        taskIds: ['eng-001', 'eng-002', 'eng-003']
      },
      startDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
      duration: 7,
      plannedDuration: 7,
      dependencies: [],
      predecessors: ['eng-001'],
      successors: ['eng-003'],
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignedTo: [],
      estimatedHours: 56,
      actualHours: 0,
      cost: { budgeted: 12000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    tasks.push({
      id: 'eng-003',
      name: 'Design Documentation',
      description: 'Create detailed design drawings and specifications',
      category: 'design',
      phase: {
        id: 'phase-1',
        name: 'Engineering & Design',
        description: 'Complete engineering design and documentation',
        order: 1,
        color: '#3B82F6',
        plannedStartDate: baseDate,
        plannedEndDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 50000,
        actualCost: 0,
        approvals: [],
        taskIds: ['eng-001', 'eng-002', 'eng-003']
      },
      startDate: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
      duration: 9,
      plannedDuration: 9,
      dependencies: [],
      predecessors: ['eng-002'],
      successors: ['proc-001'],
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignedTo: [],
      estimatedHours: 72,
      actualHours: 0,
      cost: { budgeted: 15000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    // Phase 2: Procurement
    tasks.push({
      id: 'proc-001',
      name: 'Equipment Procurement',
      description: 'Order cogeneration units and auxiliary equipment',
      category: 'procurement',
      phase: {
        id: 'phase-2',
        name: 'Procurement',
        description: 'Equipment and material procurement',
        order: 2,
        color: '#F59E0B',
        plannedStartDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 100000,
        actualCost: 0,
        approvals: [],
        taskIds: ['proc-001', 'proc-002']
      },
      startDate: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000),
      duration: 56,
      plannedDuration: 56,
      dependencies: [],
      predecessors: ['eng-003'],
      successors: ['inst-001'],
      status: 'not_started',
      progress: 0,
      priority: 'critical',
      assignedTo: [],
      estimatedHours: 40,
      actualHours: 0,
      cost: { budgeted: 500000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    // Phase 3: Installation
    tasks.push({
      id: 'inst-001',
      name: 'Site Preparation',
      description: 'Prepare site and foundations for equipment installation',
      category: 'construction',
      phase: {
        id: 'phase-3',
        name: 'Installation',
        description: 'Equipment installation and system integration',
        order: 3,
        color: '#EF4444',
        plannedStartDate: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(baseDate.getTime() + 119 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 200000,
        actualCost: 0,
        approvals: [],
        taskIds: ['inst-001', 'inst-002', 'inst-003']
      },
      startDate: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 91 * 24 * 60 * 60 * 1000),
      duration: 14,
      plannedDuration: 14,
      dependencies: [],
      predecessors: ['proc-001'],
      successors: ['inst-002'],
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignedTo: [],
      estimatedHours: 280,
      actualHours: 0,
      cost: { budgeted: 50000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    tasks.push({
      id: 'inst-002',
      name: 'Equipment Installation',
      description: 'Install cogeneration units and auxiliary equipment',
      category: 'construction',
      phase: {
        id: 'phase-3',
        name: 'Installation',
        description: 'Equipment installation and system integration',
        order: 3,
        color: '#EF4444',
        plannedStartDate: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(baseDate.getTime() + 119 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 200000,
        actualCost: 0,
        approvals: [],
        taskIds: ['inst-001', 'inst-002', 'inst-003']
      },
      startDate: new Date(baseDate.getTime() + 91 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 112 * 24 * 60 * 60 * 1000),
      duration: 21,
      plannedDuration: 21,
      dependencies: [],
      predecessors: ['inst-001'],
      successors: ['inst-003'],
      status: 'not_started',
      progress: 0,
      priority: 'critical',
      assignedTo: [],
      estimatedHours: 420,
      actualHours: 0,
      cost: { budgeted: 120000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    tasks.push({
      id: 'comm-001',
      name: 'System Commissioning',
      description: 'Commission and test cogeneration system',
      category: 'commissioning',
      phase: {
        id: 'phase-4',
        name: 'Commissioning',
        description: 'System testing and commissioning',
        order: 4,
        color: '#10B981',
        plannedStartDate: new Date(baseDate.getTime() + 112 * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(baseDate.getTime() + 133 * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: 75000,
        actualCost: 0,
        approvals: [],
        taskIds: ['comm-001']
      },
      startDate: new Date(baseDate.getTime() + 112 * 24 * 60 * 60 * 1000),
      endDate: new Date(baseDate.getTime() + 133 * 24 * 60 * 60 * 1000),
      duration: 21,
      plannedDuration: 21,
      dependencies: [],
      predecessors: ['inst-002'],
      successors: [],
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignedTo: [],
      estimatedHours: 168,
      actualHours: 0,
      cost: { budgeted: 35000, actual: 0, currency: 'USD' },
      deliverables: [],
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    });

    return tasks;
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<ProjectTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const getProjectStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
    
    const totalBudget = tasks.reduce((sum, task) => sum + task.cost.budgeted, 0);
    const actualCost = tasks.reduce((sum, task) => sum + task.cost.actual, 0);
    
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      totalBudget,
      actualCost,
      overallProgress
    };
  };

  const stats = getProjectStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cogeneration Project Management
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive project planning and tracking for cogeneration installations
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Task
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Tasks Complete</p>
                <p className="text-2xl font-bold text-blue-900">{stats.completedTasks}/{stats.totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgressTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Progress</p>
                <p className="text-2xl font-bold text-green-900">{Math.round(stats.overallProgress)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Budget Used</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${(stats.actualCost / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'timeline', name: 'Timeline', icon: Calendar },
            { id: 'tasks', name: 'Tasks', icon: CheckSquare },
            { id: 'team', name: 'Team', icon: Users },
            { id: 'risks', name: 'Risks', icon: AlertTriangle },
            { id: 'reports', name: 'Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <ProjectTrackingDashboard
            project={project}
            tasks={tasks}
            milestones={[]}
            risks={[]}
          />
        )}

        {activeTab === 'timeline' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Gantt Chart</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Download className="w-4 h-4 inline mr-1" />
                  Export
                </button>
              </div>
            </div>
            
            <GanttChart
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskSelect={setSelectedTaskId}
              selectedTaskId={selectedTaskId}
              height={500}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Task
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTaskId === task.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.duration} days
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'critical' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <ResourceAllocationPanel
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {activeTab === 'risks' && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Risk Management</h3>
            <p className="text-gray-500">Risk identification and mitigation tracking features coming soon.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Schedule Performance', description: 'Track project timeline and milestones', icon: Calendar },
                { title: 'Cost Analysis', description: 'Budget vs actual cost analysis', icon: DollarSign },
                { title: 'Resource Utilization', description: 'Team and equipment utilization', icon: Users },
                { title: 'Quality Metrics', description: 'Quality checkpoints and results', icon: CheckSquare },
                { title: 'Risk Dashboard', description: 'Current risks and mitigation status', icon: AlertTriangle },
                { title: 'Executive Summary', description: 'High-level project status report', icon: FileText }
              ].map((report, index) => {
                const Icon = report.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <Icon className="w-6 h-6 text-blue-600 mr-3" />
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Generate Report →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}