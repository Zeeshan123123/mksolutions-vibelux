'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Calendar,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileArchive,
  Server,
  Zap,
  Info,
  X,
  ChevronRight,
  Lock,
  Unlock,
  History,
  AlertCircle,
  TrendingUp,
  Eye,
  FolderOpen,
  Timer,
  CheckSquare,
  Plus
} from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  source: string;
  destination: 'local' | 'cloud' | 'hybrid';
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  size: number; // MB
  duration?: number; // seconds
  retention: number; // days
  encrypted: boolean;
  compressed: boolean;
  progress?: number;
}

interface BackupHistory {
  id: string;
  jobId: string;
  jobName: string;
  timestamp: Date;
  type: string;
  size: number;
  duration: number;
  status: 'success' | 'failed' | 'partial';
  filesBackedUp: number;
  errors: number;
  location: string;
  checksum?: string;
}

interface RecoveryPoint {
  id: string;
  name: string;
  timestamp: Date;
  type: 'backup' | 'snapshot' | 'replica';
  size: number;
  location: string;
  dataTypes: string[];
  recoverable: boolean;
  verified: boolean;
  encrypted: boolean;
}

const MOCK_JOBS: BackupJob[] = [
  {
    id: '1',
    name: 'Production Database - Full',
    type: 'full',
    schedule: 'daily',
    source: 'PostgreSQL Production',
    destination: 'cloud',
    lastRun: new Date(Date.now() - 18 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'completed',
    size: 2048,
    duration: 320,
    retention: 30,
    encrypted: true,
    compressed: true
  },
  {
    id: '2',
    name: 'Sensor Data - Incremental',
    type: 'incremental',
    schedule: 'hourly',
    source: 'Time Series Database',
    destination: 'hybrid',
    lastRun: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 0.5 * 60 * 60 * 1000),
    status: 'running',
    size: 512,
    retention: 7,
    encrypted: true,
    compressed: true,
    progress: 67
  },
  {
    id: '3',
    name: 'Document Store',
    type: 'differential',
    schedule: 'weekly',
    source: 'MongoDB Documents',
    destination: 'local',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'idle',
    size: 1024,
    duration: 180,
    retention: 60,
    encrypted: true,
    compressed: false
  }
];

const MOCK_HISTORY: BackupHistory[] = [
  {
    id: '1',
    jobId: '1',
    jobName: 'Production Database - Full',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    type: 'full',
    size: 2048,
    duration: 320,
    status: 'success',
    filesBackedUp: 15420,
    errors: 0,
    location: 's3://vibelux-backups/prod-db/2024-11-27-full.tar.gz',
    checksum: 'sha256:a4b7c9d2e3f5...'
  },
  {
    id: '2',
    jobId: '2',
    jobName: 'Sensor Data - Incremental',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    type: 'incremental',
    size: 256,
    duration: 45,
    status: 'success',
    filesBackedUp: 3200,
    errors: 0,
    location: 'local:/backups/sensor/2024-11-28-inc.tar'
  },
  {
    id: '3',
    jobId: '1',
    jobName: 'Production Database - Full',
    timestamp: new Date(Date.now() - 42 * 60 * 60 * 1000),
    type: 'full',
    size: 2012,
    duration: 298,
    status: 'failed',
    filesBackedUp: 12500,
    errors: 3,
    location: 's3://vibelux-backups/prod-db/2024-11-26-full-failed.tar.gz'
  }
];

const MOCK_RECOVERY_POINTS: RecoveryPoint[] = [
  {
    id: '1',
    name: 'Latest Production Backup',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    type: 'backup',
    size: 2048,
    location: 'AWS S3',
    dataTypes: ['Database', 'Configuration', 'User Data'],
    recoverable: true,
    verified: true,
    encrypted: true
  },
  {
    id: '2',
    name: 'Weekly Snapshot',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'snapshot',
    size: 8192,
    location: 'Local NAS',
    dataTypes: ['Full System', 'All Databases', 'File Storage'],
    recoverable: true,
    verified: false,
    encrypted: true
  }
];

export function DataBackupRecovery() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'history' | 'recovery' | 'settings'>('overview');
  const [jobs, setJobs] = useState<BackupJob[]>(MOCK_JOBS);
  const [history, setHistory] = useState<BackupHistory[]>(MOCK_HISTORY);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>(MOCK_RECOVERY_POINTS);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  // Calculate metrics
  const metrics = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'running').length,
    successRate: history.length > 0 
      ? (history.filter(h => h.status === 'success').length / history.length * 100).toFixed(1)
      : '0',
    totalBackupSize: jobs.reduce((sum, j) => sum + j.size, 0),
    lastBackup: jobs
      .filter(j => j.lastRun)
      .sort((a, b) => (b.lastRun?.getTime() || 0) - (a.lastRun?.getTime() || 0))[0]?.lastRun,
    nextBackup: jobs
      .filter(j => j.nextRun)
      .sort((a, b) => (a.nextRun?.getTime() || 0) - (b.nextRun?.getTime() || 0))[0]?.nextRun,
    dataProtected: (jobs.reduce((sum, j) => sum + j.size, 0) / 1024).toFixed(1), // GB
    recoveryPoints: recoveryPoints.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'paused': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return 'bg-green-500/20';
      case 'running': return 'bg-blue-500/20';
      case 'failed': return 'bg-red-500/20';
      case 'paused': return 'bg-yellow-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Backup & Recovery</h2>
          <p className="text-gray-400 mt-1">
            Automated backup management and disaster recovery system
          </p>
        </div>
        <div className="flex items-center gap-3">
          {recoveryMode ? (
            <>
              <button 
                onClick={() => setRecoveryMode(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Exit Recovery Mode
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Start Recovery
              </button>
            </>
          ) : (
            <>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button 
                onClick={() => setShowJobModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Backup Job
              </button>
            </>
          )}
        </div>
      </div>

      {/* Critical Alert */}
      {metrics.successRate && parseFloat(metrics.successRate) < 95 && (
        <div className="bg-red-900/20 backdrop-blur-xl rounded-xl p-4 border border-red-800/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="text-white font-medium">Backup Success Rate Below Threshold</p>
              <p className="text-sm text-gray-400 mt-1">
                Current success rate: {metrics.successRate}%. Review failed backups and adjust settings.
              </p>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              View Issues
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'jobs', label: 'Backup Jobs', icon: Database },
          { id: 'history', label: 'History', icon: History },
          { id: 'recovery', label: 'Recovery Points', icon: RotateCcw },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Data Protected</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.dataProtected} GB</p>
              <p className="text-sm text-green-400 mt-1">Across all backups</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Success Rate</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.successRate}%</p>
              <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">Last Backup</span>
              </div>
              <p className="text-lg font-bold text-white">
                {metrics.lastBackup ? `${Math.floor((Date.now() - metrics.lastBackup.getTime()) / 3600000)}h ago` : 'Never'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {metrics.lastBackup?.toLocaleTimeString() || 'No backups yet'}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400">Recovery Points</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.recoveryPoints}</p>
              <p className="text-sm text-gray-400 mt-1">Available now</p>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Active Backup Jobs</h3>
            <div className="space-y-3">
              {jobs.filter(j => j.status === 'running').map(job => (
                <div key={job.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Database className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{job.name}</p>
                        <p className="text-sm text-gray-400">{job.source}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{job.progress}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {jobs.filter(j => j.status === 'running').length === 0 && (
                <p className="text-center text-gray-400 py-8">No active backup jobs</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Backup Activity</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusBg(item.status)}`}>
                      {item.status === 'success' ? (
                        <CheckCircle className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.jobName}</p>
                      <p className="text-sm text-gray-400">
                        {formatSize(item.size)} • {item.filesBackedUp.toLocaleString()} files
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getStatusBg(job.status)}`}>
                      <Database className={`w-6 h-6 ${getStatusColor(job.status)}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{job.name}</h3>
                      <p className="text-gray-400 mt-1">{job.source}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-400">
                          Type: <span className="text-white capitalize">{job.type}</span>
                        </span>
                        <span className="text-gray-400">
                          Schedule: <span className="text-white capitalize">{job.schedule}</span>
                        </span>
                        <span className="text-gray-400">
                          Destination: <span className="text-white capitalize">{job.destination}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    {job.status === 'running' ? (
                      <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                        <Pause className="w-5 h-5" />
                      </button>
                    ) : (
                      <button className="p-2 text-green-400 hover:text-green-300 transition-colors">
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-400">Last Run</p>
                    <p className="text-white">
                      {job.lastRun ? job.lastRun.toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Next Run</p>
                    <p className="text-white">
                      {job.nextRun ? job.nextRun.toLocaleString() : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Size</p>
                    <p className="text-white">{formatSize(job.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Retention</p>
                    <p className="text-white">{job.retention} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  {job.encrypted && (
                    <div className="flex items-center gap-1 text-sm text-green-400">
                      <Lock className="w-4 h-4" />
                      Encrypted
                    </div>
                  )}
                  {job.compressed && (
                    <div className="flex items-center gap-1 text-sm text-blue-400">
                      <FileArchive className="w-4 h-4" />
                      Compressed
                    </div>
                  )}
                </div>

                {job.status === 'running' && job.progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Backup Progress</span>
                      <span className="text-white">{job.progress}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{item.jobName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{item.timestamp.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 capitalize">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{formatSize(item.size)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{formatDuration(item.duration)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{item.filesBackedUp.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(item.status)} ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recovery Tab */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          {!recoveryMode ? (
            <>
              <div className="bg-amber-900/20 backdrop-blur-xl rounded-xl p-4 border border-amber-800/50">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-400" />
                  <p className="text-white">
                    Select a recovery point below to restore your data. Ensure you have verified the backup integrity before proceeding.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {recoveryPoints.map(point => (
                  <div key={point.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <History className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{point.name}</h3>
                          <p className="text-gray-400 mt-1">
                            {point.timestamp.toLocaleString()} • {formatSize(point.size)}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm text-gray-400">
                              Location: <span className="text-white">{point.location}</span>
                            </span>
                            <span className="text-sm text-gray-400">
                              Type: <span className="text-white capitalize">{point.type}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {point.dataTypes.map((type, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {point.verified ? (
                          <div className="flex items-center gap-1 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </div>
                        ) : (
                          <button className="text-sm text-yellow-400 hover:text-yellow-300">
                            Verify Backup
                          </button>
                        )}
                        {point.encrypted && (
                          <div className="flex items-center gap-1 text-sm text-blue-400">
                            <Lock className="w-4 h-4" />
                            Encrypted
                          </div>
                        )}
                      </div>
                    </div>
                    {point.recoverable && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => setRecoveryMode(true)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Start Recovery
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <RecoveryWizard onCancel={() => setRecoveryMode(false)} />
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
          <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Backup Settings</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Configure backup schedules, retention policies, and storage destinations
          </p>
        </div>
      )}
    </div>
  );
}

// Recovery Wizard Component
function RecoveryWizard({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [recoveryType, setRecoveryType] = useState<'full' | 'selective' | 'point-in-time'>('full');

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recovery Wizard</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step >= i ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}>
              {i}
            </div>
            {i < 4 && (
              <div className={`w-full h-1 mx-2 ${
                step > i ? 'bg-purple-600' : 'bg-gray-800'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white mb-4">Select Recovery Type</h4>
          <div className="grid gap-3">
            {[
              { id: 'full', label: 'Full System Recovery', desc: 'Restore entire system to recovery point' },
              { id: 'selective', label: 'Selective Recovery', desc: 'Choose specific databases or files' },
              { id: 'point-in-time', label: 'Point-in-Time Recovery', desc: 'Restore to a specific timestamp' }
            ].map(type => (
              <label key={type.id} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="recoveryType"
                  value={type.id}
                  checked={recoveryType === type.id}
                  onChange={(e) => setRecoveryType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-white">{type.label}</p>
                  <p className="text-sm text-gray-400">{type.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-8">
          <Timer className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">Verifying Recovery Point</h4>
          <p className="text-gray-400">This may take a few moments...</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setStep(Math.min(4, step + 1))}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {step === 4 ? 'Start Recovery' : 'Next'}
        </button>
      </div>
    </div>
  );
}