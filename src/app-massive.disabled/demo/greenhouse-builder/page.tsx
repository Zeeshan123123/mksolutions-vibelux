'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calculator,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Leaf,
  BarChart3,
  MapPin,
  Calendar,
  Settings,
  Download,
  Share2,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';

interface GreenhouseProject {
  id: string;
  name: string;
  location: string;
  size: string;
  cropType: string;
  status: 'planning' | 'design' | 'procurement' | 'construction' | 'commissioning';
  budget: number;
  timeline: string;
  roi: string;
  progress: number;
}

export default function GreenhouseBuilderDemo() {
  const [selectedProject, setSelectedProject] = useState<string>('project-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'design' | 'procurement' | 'timeline' | 'analytics'>('overview');

  const projects: GreenhouseProject[] = [
    {
      id: 'project-1',
      name: 'Premium Tomato Facility',
      location: 'Ontario, Canada',
      size: '50,000 sq ft',
      cropType: 'Tomatoes (Cherry)',
      status: 'design',
      budget: 2850000,
      timeline: '18 months',
      roi: '24%',
      progress: 35
    },
    {
      id: 'project-2',
      name: 'Leafy Greens Complex',
      location: 'California, USA',
      size: '75,000 sq ft',
      cropType: 'Lettuce & Spinach',
      status: 'procurement',
      budget: 3200000,
      timeline: '14 months',
      roi: '28%',
      progress: 58
    },
    {
      id: 'project-3',
      name: 'Cannabis Cultivation',
      location: 'Colorado, USA',
      size: '25,000 sq ft',
      cropType: 'Cannabis',
      status: 'construction',
      budget: 1850000,
      timeline: '12 months',
      roi: '45%',
      progress: 72
    }
  ];

  const currentProject = projects.find(p => p.id === selectedProject) || projects[0];

  const designMetrics = {
    ppfd: {
      target: 400,
      current: 385,
      zones: 24
    },
    energy: {
      consumption: '2.1 MW',
      efficiency: '2.8 µmol/J',
      costPerYear: '$486,000'
    },
    fixtures: {
      total: 156,
      spydr2p: 98,
      razr: 58,
      coverage: '98.5%'
    }
  };

  const procurementStatus = [
    { category: 'LED Fixtures', status: 'ordered', lead: '16 weeks', cost: 425000, supplier: 'Fluence' },
    { category: 'Climate Control', status: 'quoted', lead: '12 weeks', cost: 185000, supplier: 'Priva' },
    { category: 'Irrigation', status: 'pending', lead: '8 weeks', cost: 95000, supplier: 'Netafim' },
    { category: 'Structure', status: 'contracted', lead: '6 weeks', cost: 650000, supplier: 'Nexus Corp' }
  ];

  const timelinePhases = [
    { phase: 'Design & Permits', start: 'Jan 2024', end: 'Mar 2024', status: 'completed', progress: 100 },
    { phase: 'Procurement', start: 'Feb 2024', end: 'Jun 2024', status: 'active', progress: 65 },
    { phase: 'Site Preparation', start: 'Mar 2024', end: 'May 2024', status: 'active', progress: 80 },
    { phase: 'Construction', start: 'May 2024', end: 'Nov 2024', status: 'upcoming', progress: 0 },
    { phase: 'Installation', start: 'Sep 2024', end: 'Dec 2024', status: 'upcoming', progress: 0 },
    { phase: 'Commissioning', start: 'Dec 2024', end: 'Jan 2025', status: 'upcoming', progress: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'active': return 'text-blue-400 bg-blue-900/20';
      case 'upcoming': return 'text-gray-400 bg-gray-700/20';
      case 'delayed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500';
      case 'design': return 'bg-blue-500';
      case 'procurement': return 'bg-purple-500';
      case 'construction': return 'bg-orange-500';
      case 'commissioning': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-green-400" />
                <div>
                  <h1 className="text-xl font-bold">Greenhouse Builder Portal</h1>
                  <p className="text-sm text-gray-400">Advanced CEA Project Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Project Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedProject === project.id
                    ? 'border-green-500 bg-green-900/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{project.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${getProjectStatusColor(project.status)}`}></div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{project.size} • {project.cropType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${(project.budget / 1000000).toFixed(1)}M • {project.roi} ROI</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-green-400">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'design', label: 'Lighting Design', icon: Lightbulb },
              { id: 'procurement', label: 'Procurement', icon: Calculator },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Project Status</p>
                      <p className="text-lg font-semibold capitalize">{currentProject.status}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-400">On Schedule</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Budget</p>
                      <p className="text-lg font-semibold">${(currentProject.budget / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-blue-400">85% Committed</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Timeline</p>
                      <p className="text-lg font-semibold">{currentProject.timeline}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-purple-400">3 months remaining</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expected ROI</p>
                      <p className="text-lg font-semibold">{currentProject.roi}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-orange-400">Above Target</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Lighting Design Approved</h4>
                    <p className="text-sm text-gray-400">PPFD targets met for all growing zones. 156 fixtures specified.</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Procurement Update</h4>
                    <p className="text-sm text-gray-400">Fluence confirmed 16-week delivery for SPYDR fixtures. Alternative sourcing evaluated.</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Permit Status Update</h4>
                    <p className="text-sm text-gray-400">Electrical permits approved. Final building permit expected next week.</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Design Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">PPFD Target</h3>
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Target</span>
                    <span className="font-medium">{designMetrics.ppfd.target} µmol/m²/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Actual</span>
                    <span className="font-medium text-green-400">{designMetrics.ppfd.current} µmol/m²/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Zones</span>
                    <span className="font-medium">{designMetrics.ppfd.zones}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Energy Profile</h3>
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Consumption</span>
                    <span className="font-medium">{designMetrics.energy.consumption}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Efficiency</span>
                    <span className="font-medium text-blue-400">{designMetrics.energy.efficiency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Annual Cost</span>
                    <span className="font-medium">{designMetrics.energy.costPerYear}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Fixtures</h3>
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Count</span>
                    <span className="font-medium">{designMetrics.fixtures.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">SPYDR 2p</span>
                    <span className="font-medium">{designMetrics.fixtures.spydr2p}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Coverage</span>
                    <span className="font-medium text-purple-400">{designMetrics.fixtures.coverage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Visualization Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">3D Facility Visualization</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                    PPFD View
                  </button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                    Fixture Layout
                  </button>
                </div>
              </div>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">3D Visualization</p>
                  <p className="text-sm text-gray-500">Interactive facility model with PPFD heatmap</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'procurement' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Procurement Status</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                    Request Quotes
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export BOM
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {procurementStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span>Supplier: {item.supplier}</span>
                        <span>Lead Time: {item.lead}</span>
                        <span>Cost: ${item.cost.toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Project Timeline</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                    Critical Path View
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Share2 className="w-4 h-4 inline mr-2" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {timelinePhases.map((phase, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(phase.status)}`}>
                          {phase.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                        <span>{phase.start} - {phase.end}</span>
                        <span>{phase.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            phase.status === 'completed' ? 'bg-green-500' :
                            phase.status === 'active' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${phase.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Design Efficiency</span>
                    <span className="text-green-400 font-medium">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Budget Utilization</span>
                    <span className="text-blue-400 font-medium">85.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Schedule Adherence</span>
                    <span className="text-purple-400 font-medium">92.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Quality Score</span>
                    <span className="text-orange-400 font-medium">96.8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Lighting Systems</span>
                    <span className="font-medium">$425K (15%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Structure</span>
                    <span className="font-medium">$650K (23%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Climate Control</span>
                    <span className="font-medium">$185K (6%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Other Systems</span>
                    <span className="font-medium">$1.59M (56%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}