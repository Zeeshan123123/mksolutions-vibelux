'use client';

import React, { useState } from 'react';
import { 
  Folder, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Grid, 
  List, 
  Calendar,
  Users,
  MapPin,
  Clock,
  Star,
  Edit,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';

export default function DesignerProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const projects = [
    {
      id: 1,
      name: 'Aurora Cannabis - Phase 2',
      description: 'Indoor cultivation facility expansion',
      status: 'active',
      type: 'Cannabis',
      size: '15,000 sq ft',
      location: 'Denver, CO',
      lastModified: '2 hours ago',
      collaborators: 3,
      starred: true,
      progress: 75,
      thumbnail: '/projects/aurora-phase2.jpg'
    },
    {
      id: 2,
      name: 'Vertical Greens Tower B',
      description: 'Multi-tier vertical farming setup',
      status: 'active',
      type: 'Vertical Farm',
      size: '8,000 sq ft',
      location: 'Portland, OR',
      lastModified: '1 day ago',
      collaborators: 2,
      starred: false,
      progress: 45,
      thumbnail: '/projects/vertical-tower.jpg'
    },
    {
      id: 3,
      name: 'Research Lab - UC Davis',
      description: 'University research facility upgrade',
      status: 'completed',
      type: 'Research',
      size: '3,500 sq ft',
      location: 'Davis, CA',
      lastModified: '3 days ago',
      collaborators: 5,
      starred: true,
      progress: 100,
      thumbnail: '/projects/uc-davis.jpg'
    },
    {
      id: 4,
      name: 'Greenhouse Supplemental',
      description: 'LED supplemental lighting design',
      status: 'active',
      type: 'Greenhouse',
      size: '25,000 sq ft',
      location: 'Salinas, CA',
      lastModified: '5 days ago',
      collaborators: 1,
      starred: false,
      progress: 30,
      thumbnail: '/projects/greenhouse-supp.jpg'
    },
    {
      id: 5,
      name: 'Legacy Cannabis - Retrofit',
      description: 'HPS to LED conversion project',
      status: 'archived',
      type: 'Cannabis',
      size: '12,000 sq ft',
      location: 'Las Vegas, NV',
      lastModified: '2 weeks ago',
      collaborators: 2,
      starred: false,
      progress: 100,
      thumbnail: '/projects/legacy-retrofit.jpg'
    }
  ];

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'completed':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'archived':
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Cannabis':
        return 'bg-purple-400/10 text-purple-400';
      case 'Vertical Farm':
        return 'bg-green-400/10 text-green-400';
      case 'Greenhouse':
        return 'bg-yellow-400/10 text-yellow-400';
      case 'Research':
        return 'bg-blue-400/10 text-blue-400';
      default:
        return 'bg-gray-400/10 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Folder className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Projects</h1>
                <p className="text-gray-400">Manage your lighting design projects</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group">
                {/* Project Thumbnail */}
                <div className="aspect-video bg-gray-800 rounded-t-xl flex items-center justify-center relative">
                  <Folder className="w-12 h-12 text-gray-600" />
                  {project.starred && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current absolute top-3 right-3" />
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                      {project.name}
                    </h3>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-800 rounded transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getTypeColor(project.type)}`}>
                      {project.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Grid className="w-3 h-3" />
                      {project.size}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Modified {project.lastModified}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full transition-all" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">{project.collaborators} collaborators</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                        <Edit className="w-3 h-3 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Folder className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-white">{project.name}</h3>
                        {project.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                        <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getTypeColor(project.type)}`}>
                          {project.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{project.size}</div>
                      <div className="text-xs text-gray-400">{project.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{project.progress}%</div>
                      <div className="text-xs text-gray-400">Modified {project.lastModified}</div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Development Notice */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Folder className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Project Management Coming Soon</h3>
              <p className="text-sm text-gray-400">
                Full project management features are in development. Current projects can be accessed through the{' '}
                <a href="/design/advanced" className="text-yellow-400 hover:text-yellow-300">advanced designer</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}