'use client';

import React, { useState } from 'react';
import {
  Plus,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Eye,
  Edit3,
  Share2,
  Copy,
  Trash2,
  Star,
  Clock,
  Users,
  Lock,
  Unlock,
  Download,
  Archive,
  Pin,
  MessageCircle,
  BarChart3,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPublic: boolean;
  isStarred: boolean;
  isPinned: boolean;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  viewers: number;
  comments: number;
  lastViewed: string;
  lastModified: string;
  createdAt: string;
  tags: string[];
  chartTypes: string[];
  status: 'active' | 'archived' | 'draft';
  shareUrl: string;
}

export function DashboardManager() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: '1',
      name: 'Q3 Performance Overview',
      description: 'Comprehensive quarterly performance metrics and KPI tracking',
      thumbnail: '/dashboard-thumbnails/q3-overview.png',
      isPublic: false,
      isStarred: true,
      isPinned: true,
      owner: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
      viewers: 24,
      comments: 8,
      lastViewed: '2024-07-19T15:30:00Z',
      lastModified: '2024-07-19T14:22:00Z',
      createdAt: '2024-07-01T10:00:00Z',
      tags: ['quarterly', 'performance', 'kpi'],
      chartTypes: ['line', 'bar', 'pie', 'spider'],
      status: 'active',
      shareUrl: 'https://vibelux.ai/shared/q3-overview'
    },
    {
      id: '2',
      name: 'Energy Efficiency Analytics',
      description: 'Real-time energy consumption and efficiency monitoring across all zones',
      thumbnail: '/dashboard-thumbnails/energy-analytics.png',
      isPublic: true,
      isStarred: false,
      isPinned: false,
      owner: { id: '2', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
      viewers: 156,
      comments: 23,
      lastViewed: '2024-07-19T12:15:00Z',
      lastModified: '2024-07-18T16:45:00Z',
      createdAt: '2024-06-15T09:30:00Z',
      tags: ['energy', 'efficiency', 'monitoring', 'real-time'],
      chartTypes: ['sankey', 'heatmap', 'gauge', 'line'],
      status: 'active',
      shareUrl: 'https://vibelux.ai/shared/energy-analytics'
    },
    {
      id: '3',
      name: 'Project Timeline Dashboard',
      description: 'Project management and timeline tracking with team collaboration',
      thumbnail: '/dashboard-thumbnails/project-timeline.png',
      isPublic: false,
      isStarred: true,
      isPinned: false,
      owner: { id: '3', name: 'Mike Davis', avatar: '/avatars/mike.jpg' },
      viewers: 12,
      comments: 15,
      lastViewed: '2024-07-18T14:20:00Z',
      lastModified: '2024-07-17T11:30:00Z',
      createdAt: '2024-06-20T14:00:00Z',
      tags: ['project', 'timeline', 'collaboration'],
      chartTypes: ['gantt', 'network', 'bar'],
      status: 'active',
      shareUrl: 'https://vibelux.ai/shared/project-timeline'
    },
    {
      id: '4',
      name: 'Environmental Monitoring',
      description: 'Temperature, humidity, and air quality tracking with alerts',
      thumbnail: '/dashboard-thumbnails/environmental.png',
      isPublic: false,
      isStarred: false,
      isPinned: false,
      owner: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
      viewers: 8,
      comments: 3,
      lastViewed: '2024-07-17T09:45:00Z',
      lastModified: '2024-07-16T13:15:00Z',
      createdAt: '2024-07-05T11:20:00Z',
      tags: ['environmental', 'monitoring', 'alerts'],
      chartTypes: ['line', 'heatmap', 'gauge'],
      status: 'draft',
      shareUrl: 'https://vibelux.ai/shared/environmental'
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'viewers' | 'created'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'public' | 'private' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredDashboards = dashboards
    .filter(dashboard => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!dashboard.name.toLowerCase().includes(query) &&
            !dashboard.description.toLowerCase().includes(query) &&
            !dashboard.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Category filter
      switch (filterBy) {
        case 'starred':
          return dashboard.isStarred;
        case 'public':
          return dashboard.isPublic;
        case 'private':
          return !dashboard.isPublic;
        case 'draft':
          return dashboard.status === 'draft';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'modified':
          aValue = new Date(a.lastModified).getTime();
          bValue = new Date(b.lastModified).getTime();
          break;
        case 'viewers':
          aValue = a.viewers;
          bValue = b.viewers;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleDashboardStar = (id: string) => {
    setDashboards(dashboards.map(dashboard => 
      dashboard.id === id ? { ...dashboard, isStarred: !dashboard.isStarred } : dashboard
    ));
  };

  const toggleDashboardPin = (id: string) => {
    setDashboards(dashboards.map(dashboard => 
      dashboard.id === id ? { ...dashboard, isPinned: !dashboard.isPinned } : dashboard
    ));
  };

  const duplicateDashboard = (id: string) => {
    const original = dashboards.find(d => d.id === id);
    if (!original) return;

    const duplicate: Dashboard = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (Copy)`,
      isStarred: false,
      isPinned: false,
      viewers: 0,
      comments: 0,
      lastViewed: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      shareUrl: `https://vibelux.ai/shared/${Date.now()}`
    };

    setDashboards([duplicate, ...dashboards]);
  };

  const deleteDashboard = (id: string) => {
    setDashboards(dashboards.filter(d => d.id !== id));
  };

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'line': return <TrendingUp className="w-3 h-3" />;
      case 'bar': return <BarChart3 className="w-3 h-3" />;
      case 'gantt': return <Calendar className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: Dashboard['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredDashboards.map(dashboard => (
        <Card key={dashboard.id} className="group hover:shadow-lg transition-shadow">
          <div className="relative">
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
              <div className="text-center p-4">
                <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <div className="text-xs text-gray-500">Dashboard Preview</div>
              </div>
            </div>

            {/* Overlay actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <button
                  onClick={() => toggleDashboardStar(dashboard.id)}
                  className={`p-1.5 rounded-full ${
                    dashboard.isStarred ? 'bg-yellow-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                  } transition-colors`}
                >
                  <Star className="w-3 h-3" />
                </button>
                <button
                  onClick={() => toggleDashboardPin(dashboard.id)}
                  className={`p-1.5 rounded-full ${
                    dashboard.isPinned ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                  } transition-colors`}
                >
                  <Pin className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-2 left-2">
              <Badge className={getStatusColor(dashboard.status)}>
                {dashboard.status}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{dashboard.name}</h3>
              <div className="flex items-center gap-1">
                {dashboard.isPublic ? (
                  <Unlock className="w-3 h-3 text-green-500" />
                ) : (
                  <Lock className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{dashboard.description}</p>

            {/* Chart types */}
            <div className="flex flex-wrap gap-1 mb-3">
              {dashboard.chartTypes.slice(0, 3).map(type => (
                <div key={type} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {getChartTypeIcon(type)}
                  {type}
                </div>
              ))}
              {dashboard.chartTypes.length > 3 && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                  +{dashboard.chartTypes.length - 3}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {dashboard.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {dashboard.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{dashboard.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {dashboard.viewers}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {dashboard.comments}
                </span>
              </div>
              <span>{new Date(dashboard.lastModified).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-green-600 rounded">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-purple-600 rounded">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative group">
                <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => duplicateDashboard(dashboard.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Archive className="w-3 h-3" />
                    Archive
                  </button>
                  <button
                    onClick={() => deleteDashboard(dashboard.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viewers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDashboards.map(dashboard => (
              <tr key={dashboard.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {dashboard.isStarred && <Star className="w-3 h-3 text-yellow-500" />}
                      {dashboard.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{dashboard.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{dashboard.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {dashboard.owner.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{dashboard.owner.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(dashboard.status)}>
                      {dashboard.status}
                    </Badge>
                    {dashboard.isPublic ? (
                      <Unlock className="w-3 h-3 text-green-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {dashboard.viewers}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {dashboard.comments}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(dashboard.lastModified).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-green-600 rounded">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-purple-600 rounded">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Library</h1>
          <p className="text-gray-600 mt-1">
            Manage and share your interactive dashboards
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Dashboard
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dashboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-64"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Dashboards</option>
            <option value="starred">Starred</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="modified">Last Modified</option>
            <option value="name">Name</option>
            <option value="viewers">Viewers</option>
            <option value="created">Created Date</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {filteredDashboards.length} dashboard{filteredDashboards.length !== 1 ? 's' : ''} found
      </div>

      {/* Dashboard Grid/List */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* Empty State */}
      {filteredDashboards.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboards found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first dashboard to get started'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Dashboard
          </button>
        </div>
      )}
    </div>
  );
}