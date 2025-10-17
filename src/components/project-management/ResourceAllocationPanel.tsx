'use client';

import React, { useState } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Settings,
  Download,
  BarChart3,
  Target
} from 'lucide-react';
import type {
  ProjectMember,
  ProjectTask,
  ProjectRole
} from '@/lib/project-management/project-types';

interface ResourceAllocationPanelProps {
  tasks: ProjectTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
}

interface TeamMember extends ProjectMember {
  currentAssignments: string[]; // Task IDs
  utilization: number; // 0-100%
  workload: {
    thisWeek: number;
    nextWeek: number;
    thisMonth: number;
  };
  performance: {
    tasksCompleted: number;
    avgCompletionTime: number;
    qualityScore: number;
  };
}

interface ResourceAllocation {
  taskId: string;
  memberId: string;
  allocatedHours: number;
  startDate: Date;
  endDate: Date;
  role: string;
}

export function ResourceAllocationPanel({ tasks, onTaskUpdate }: ResourceAllocationPanelProps) {
  const [activeTab, setActiveTab] = useState('team');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>();

  // Mock team data - in production this would come from a database
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 'tm-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@vibelux.ai',
      role: 'project_manager',
      department: 'Engineering',
      hourlyRate: 75,
      availability: 95,
      skills: ['Project Management', 'PMP Certified', 'Risk Management', 'Stakeholder Management'],
      certifications: ['PMP', 'PRINCE2'],
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'sarah.chen@vibelux.ai',
        location: 'San Francisco, CA'
      },
      currentAssignments: ['eng-001', 'eng-002'],
      utilization: 85,
      workload: {
        thisWeek: 35,
        nextWeek: 40,
        thisMonth: 140
      },
      performance: {
        tasksCompleted: 23,
        avgCompletionTime: 95, // % of planned time
        qualityScore: 4.8
      }
    },
    {
      id: 'tm-002',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@vibelux.ai',
      role: 'design_engineer',
      department: 'Engineering',
      hourlyRate: 85,
      availability: 100,
      skills: ['AutoCAD', 'Mechanical Design', 'Cogeneration Systems', 'Heat Transfer'],
      certifications: ['PE License', 'ASHRAE Member'],
      contactInfo: {
        phone: '(555) 234-5678',
        email: 'michael.rodriguez@vibelux.ai',
        location: 'Austin, TX'
      },
      currentAssignments: ['eng-003'],
      utilization: 75,
      workload: {
        thisWeek: 30,
        nextWeek: 32,
        thisMonth: 120
      },
      performance: {
        tasksCompleted: 18,
        avgCompletionTime: 88,
        qualityScore: 4.9
      }
    },
    {
      id: 'tm-003',
      name: 'Jennifer Walsh',
      email: 'jennifer.walsh@vibelux.ai',
      role: 'electrical_engineer',
      department: 'Engineering',
      hourlyRate: 80,
      availability: 90,
      skills: ['Electrical Design', 'Power Systems', 'Protection Systems', 'IEEE Standards'],
      certifications: ['PE License', 'IEEE Member'],
      contactInfo: {
        phone: '(555) 345-6789',
        email: 'jennifer.walsh@vibelux.ai',
        location: 'Denver, CO'
      },
      currentAssignments: [],
      utilization: 60,
      workload: {
        thisWeek: 24,
        nextWeek: 28,
        thisMonth: 96
      },
      performance: {
        tasksCompleted: 15,
        avgCompletionTime: 92,
        qualityScore: 4.7
      }
    },
    {
      id: 'tm-004',
      name: 'David Thompson',
      email: 'david.thompson@vibelux.ai',
      role: 'construction_manager',
      department: 'Construction',
      hourlyRate: 70,
      availability: 100,
      skills: ['Construction Management', 'Site Safety', 'Quality Control', 'Scheduling'],
      certifications: ['CCM', 'OSHA 30'],
      contactInfo: {
        phone: '(555) 456-7890',
        email: 'david.thompson@vibelux.ai',
        location: 'Phoenix, AZ'
      },
      currentAssignments: [],
      utilization: 45,
      workload: {
        thisWeek: 18,
        nextWeek: 20,
        thisMonth: 72
      },
      performance: {
        tasksCompleted: 12,
        avgCompletionTime: 102,
        qualityScore: 4.6
      }
    }
  ]);

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    if (utilization >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const getUtilizationBg = (utilization: number): string => {
    if (utilization >= 90) return 'bg-red-100';
    if (utilization >= 75) return 'bg-yellow-100';
    if (utilization >= 50) return 'bg-green-100';
    return 'bg-blue-100';
  };

  const getRoleColor = (role: ProjectRole): string => {
    const colors: Record<ProjectRole, string> = {
      project_manager: 'bg-purple-100 text-purple-800',
      design_engineer: 'bg-blue-100 text-blue-800',
      construction_manager: 'bg-orange-100 text-orange-800',
      electrical_engineer: 'bg-yellow-100 text-yellow-800',
      mechanical_engineer: 'bg-green-100 text-green-800',
      commissioning_agent: 'bg-indigo-100 text-indigo-800',
      quality_inspector: 'bg-pink-100 text-pink-800',
      safety_officer: 'bg-red-100 text-red-800',
      technician: 'bg-gray-100 text-gray-800',
      contractor: 'bg-cyan-100 text-cyan-800',
      client_representative: 'bg-emerald-100 text-emerald-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const calculateTeamStats = () => {
    const totalMembers = teamMembers.length;
    const avgUtilization = teamMembers.reduce((sum, member) => sum + member.utilization, 0) / totalMembers;
    const overutilizedMembers = teamMembers.filter(m => m.utilization >= 90).length;
    const availableCapacity = teamMembers.reduce((sum, member) => {
      const capacity = member.availability * 40; // 40 hours per week
      const current = member.workload.thisWeek;
      return sum + Math.max(0, capacity - current);
    }, 0);

    return {
      totalMembers,
      avgUtilization,
      overutilizedMembers,
      availableCapacity
    };
  };

  const stats = calculateTeamStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Resource Management
            </h2>
            <p className="text-gray-600 mt-1">
              Team allocation, workload management, and resource optimization
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4 inline mr-2" />
              Export Report
            </button>
            <button 
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Team Size</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Avg Utilization</p>
                <p className="text-2xl font-bold text-green-900">{Math.round(stats.avgUtilization)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Overallocated</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.overutilizedMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Available Hours</p>
                <p className="text-2xl font-bold text-purple-900">{Math.round(stats.availableCapacity)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'team', name: 'Team Overview', icon: Users },
            { id: 'allocation', name: 'Task Allocation', icon: Target },
            { id: 'workload', name: 'Workload Analysis', icon: BarChart3 },
            { id: 'performance', name: 'Performance', icon: TrendingUp }
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
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedMember === member.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMember(member.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      {/* Member Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBg(member.utilization)} ${getUtilizationColor(member.utilization)}`}>
                            {member.utilization}% Utilized
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {member.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {member.contactInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {member.contactInfo.location}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Current Assignments */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Current Tasks:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.currentAssignments.map((taskId) => {
                              const task = tasks.find(t => t.id === taskId);
                              return task ? (
                                <span key={taskId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {task.name}
                                </span>
                              ) : null;
                            })}
                            {member.currentAssignments.length === 0 && (
                              <span className="text-xs text-gray-500">No current assignments</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{member.performance.tasksCompleted}</div>
                        <div className="text-xs text-gray-500">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{member.performance.avgCompletionTime}%</div>
                        <div className="text-xs text-gray-500">Avg Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{member.performance.qualityScore}/5</div>
                        <div className="text-xs text-gray-500">Quality Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">${member.hourlyRate}</div>
                        <div className="text-xs text-gray-500">Hourly Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Task Assignment Matrix</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effort (hrs)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.name}</div>
                          <div className="text-sm text-gray-500">{task.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignedTo.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.assignedTo.map((member, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {member.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.estimatedHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Assign
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Workload Analysis</h3>
            
            <div className="grid gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUtilizationBg(member.utilization)} ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}% Utilized
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">This Week</div>
                      <div className="text-lg font-semibold text-gray-900">{member.workload.thisWeek}h</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(member.workload.thisWeek / 40) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Next Week</div>
                      <div className="text-lg font-semibold text-gray-900">{member.workload.nextWeek}h</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(member.workload.nextWeek / 40) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">This Month</div>
                      <div className="text-lg font-semibold text-gray-900">{member.workload.thisMonth}h</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(member.workload.thisMonth / 160) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Availability: {member.availability}% • Rate: ${member.hourlyRate}/hr
                    </span>
                    {member.utilization >= 90 && (
                      <span className="text-red-600 font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Overallocated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Dashboard</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{member.performance.tasksCompleted}</div>
                      <div className="text-sm text-green-700">Tasks Completed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{member.performance.avgCompletionTime}%</div>
                      <div className="text-sm text-blue-700">On-Time Delivery</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{member.performance.qualityScore}</div>
                      <div className="text-sm text-purple-700">Quality Rating</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{member.utilization}%</div>
                      <div className="text-sm text-orange-700">Utilization</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Overall Performance</span>
                      <span className={`font-medium ${
                        member.performance.qualityScore >= 4.5 ? 'text-green-600' :
                        member.performance.qualityScore >= 4.0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {member.performance.qualityScore >= 4.5 ? 'Excellent' :
                         member.performance.qualityScore >= 4.0 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}