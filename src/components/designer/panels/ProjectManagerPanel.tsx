'use client';

import React, { useState } from 'react';
import { X, Folder, FolderOpen, File, Save, Clock, Users, Tag, Search, Plus, MoreVertical } from 'lucide-react';

interface ProjectManagerPanelProps {
  onClose: () => void;
}

interface Project {
  id: string;
  name: string;
  client: string;
  lastModified: Date;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  type: 'greenhouse' | 'indoor' | 'vertical-farm';
}

export function ProjectManagerPanel({ onClose }: ProjectManagerPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Mock projects data
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Green Valley Greenhouse',
      client: 'Green Valley Farms',
      lastModified: new Date('2024-01-15'),
      status: 'in-progress',
      type: 'greenhouse'
    },
    {
      id: '2',
      name: 'Urban Vertical Farm A',
      client: 'City Greens LLC',
      lastModified: new Date('2024-01-10'),
      status: 'review',
      type: 'vertical-farm'
    },
    {
      id: '3',
      name: 'Indoor Cultivation Facility',
      client: 'Premium Herbs Co',
      lastModified: new Date('2024-01-08'),
      status: 'draft',
      type: 'indoor'
    }
  ]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-600';
      case 'in-progress': return 'bg-blue-600';
      case 'review': return 'bg-yellow-600';
      case 'completed': return 'bg-green-600';
    }
  };

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'greenhouse': return '🌿';
      case 'indoor': return '🏢';
      case 'vertical-farm': return '🌾';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Project Manager
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Search and New Project */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedProject === project.id
                ? 'bg-blue-600/20 border border-blue-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getTypeIcon(project.type)}</span>
                  <h4 className="font-medium text-white">{project.name}</h4>
                </div>
                <p className="text-sm text-gray-400 mb-2">{project.client}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    {project.lastModified.toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-white ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-700 rounded">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Actions */}
      {selectedProject && (
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Project Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
              <FolderOpen className="h-4 w-4" />
              Open
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
              <Users className="h-4 w-4" />
              Share
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
              <Tag className="h-4 w-4" />
              Version
            </button>
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Storage Used</span>
          <span className="text-sm text-white">2.4 GB / 10 GB</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
        </div>
      </div>
    </div>
  );
}