'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  User, 
  Code, 
  RefreshCw,
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  userId?: string;
  userEmail?: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  resolved: boolean;
}

interface ErrorStats {
  totalErrors: number;
  uniqueErrors: number;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen: Date;
  }>;
  errorsBySource: Array<{
    source: string;
    count: number;
  }>;
}

export function ErrorTrackingDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'unresolved'>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [timeRange]);

  const fetchErrors = async () => {
    try {
      const response = await fetch(`/api/admin/errors?timeRange=${timeRange}&limit=100`);
      const data = await response.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/errors/stats?timeRange=${timeRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      await fetch(`/api/admin/errors/${errorId}/resolve`, {
        method: 'PATCH'
      });
      setErrors(prev => prev.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      ));
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
    }
  };

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !error.resolved;
    return error.level === filter;
  });

  const getLevelIcon = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor and resolve system errors</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button
            onClick={() => { fetchErrors(); fetchStats(); }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{stats.totalErrors}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Errors</p>
                <p className="text-2xl font-bold">{stats.uniqueErrors}</p>
              </div>
              <Code className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{stats.errorRate.toFixed(2)}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">
                  {errors.filter(e => e.resolved).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex space-x-2">
          {(['all', 'error', 'warning', 'unresolved'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {filteredErrors.length} errors
        </span>
      </div>

      {/* Error List */}
      <div className="bg-white rounded-lg border">
        <div className="divide-y">
          {filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                error.resolved ? 'opacity-60' : ''
              }`}
              onClick={() => setSelectedError(error)}
            >
              <div className="flex items-start space-x-3">
                {getLevelIcon(error.level)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {error.message}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {error.resolved && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Source: {error.source}</span>
                    {error.userEmail && (
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {error.userEmail}
                      </span>
                    )}
                    {error.url && <span>URL: {error.url}</span>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!error.resolved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsResolved(error.id);
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Resolve
                    </button>
                  )}
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredErrors.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium">No errors found</h3>
            <p>Everything looks good for the selected time range and filters.</p>
          </div>
        )}
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Error Details</h2>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getLevelColor(selectedError.level)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getLevelIcon(selectedError.level)}
                    <span className="font-medium capitalize">{selectedError.level}</span>
                  </div>
                  <p className="font-medium">{selectedError.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString()}</p>
                      <p><strong>Source:</strong> {selectedError.source}</p>
                      {selectedError.userEmail && (
                        <p><strong>User:</strong> {selectedError.userEmail}</p>
                      )}
                      {selectedError.url && (
                        <p><strong>URL:</strong> {selectedError.url}</p>
                      )}
                      <p><strong>Status:</strong> {selectedError.resolved ? 'Resolved' : 'Unresolved'}</p>
                    </div>
                  </div>
                  
                  {selectedError.userAgent && (
                    <div>
                      <h4 className="font-medium mb-2">User Agent</h4>
                      <p className="text-sm text-gray-600">{selectedError.userAgent}</p>
                    </div>
                  )}
                </div>
                
                {selectedError.stack && (
                  <div>
                    <h4 className="font-medium mb-2">Stack Trace</h4>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  {!selectedError.resolved && (
                    <button
                      onClick={() => {
                        markAsResolved(selectedError.id);
                        setSelectedError(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedError(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Errors */}
      {stats?.topErrors && stats.topErrors.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Top Errors</h2>
          <div className="space-y-3">
            {stats.topErrors.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{error.message}</p>
                  <p className="text-xs text-gray-500">
                    Last seen: {new Date(error.lastSeen).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{error.count}</div>
                  <div className="text-xs text-gray-500">occurrences</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}