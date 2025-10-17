'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Terminal, 
  BarChart3,
  Server,
  Database,
  Wifi,
  Clock,
  Cpu,
  HardDrive,
  Monitor,
  Shield
} from 'lucide-react';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { ErrorTrackingDashboard } from '@/components/admin/ErrorTrackingDashboard';
import { DebugUtilities } from '@/components/admin/DebugUtilities';

export function AdminMonitoringContent() {
  const [activeMonitoringTab, setActiveMonitoringTab] = useState('health');
  const [health, setHealth] = useState<any>(null)
  const [errors, setErrors] = useState<any[]>([])
  const [audits, setAudits] = useState<any[]>([])
  const [loadingErrors, setLoadingErrors] = useState(false)
  const [loadingAudits, setLoadingAudits] = useState(false)
  const [errorQuery, setErrorQuery] = useState('')
  const [auditQuery, setAuditQuery] = useState('')
  const [selectedError, setSelectedError] = useState<any | null>(null)

  useEffect(() => {
    // Fetch real health from our APIs
    (async () => {
      try {
        const [s3Res, supaRes, apiRes, dbRes, authRes, cacheRes, extRes, influxRes] = await Promise.all([
          fetch('/api/admin/health/storage').then(r => r.json()).catch(() => null),
          fetch('/api/health/supabase').then(r => r.json()).catch(() => null),
          fetch('/api/admin/health/api').then(r => r.json()).catch(() => null),
          fetch('/api/admin/health/database').then(r => r.json()).catch(() => null),
          fetch('/api/admin/health/auth').then(r => r.json()).catch(() => null),
          fetch('/api/admin/health/cache').then(r => r.json()).catch(() => null),
          fetch('/api/admin/health/external').then(r => r.json()).catch(() => null),
          fetch('/api/health/influxdb').then(r => r.json()).catch(() => null)
        ])
        setHealth({ s3: s3Res, supabase: supaRes, api: apiRes, db: dbRes, auth: authRes, cache: cacheRes, external: extRes, influx: influxRes })
      } catch {}
    })()
  }, [])

  useEffect(() => {
    // Load error logs
    (async () => {
      try {
        setLoadingErrors(true)
        const res = await fetch('/api/admin/errors').catch(() => null)
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}))
          setErrors(Array.isArray(data?.errors) ? data.errors : [])
        }
      } finally {
        setLoadingErrors(false)
      }
    })()
    // Load audit logs
    (async () => {
      try {
        setLoadingAudits(true)
        const res = await fetch('/api/admin/audit-logs').catch(() => null)
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}))
          setAudits(Array.isArray(data?.logs) ? data.logs : [])
        }
      } finally {
        setLoadingAudits(false)
      }
    })()
  }, [])

  const resolveError = async (id: string) => {
    await fetch(`/api/admin/errors/${encodeURIComponent(id)}/resolve`, { method: 'POST' }).catch(() => null)
    // Optimistic update
    setErrors(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e))
  }

  const monitoringTabs = [
    {
      value: 'health',
      label: 'System Health',
      icon: Activity,
      description: 'Real-time system monitoring'
    },
    {
      value: 'errors',
      label: 'Error Tracking',
      icon: AlertTriangle,
      description: 'Error logs and resolution'
    },
    {
      value: 'debug',
      label: 'Debug Tools',
      icon: Terminal,
      description: 'Diagnostic commands'
    },
    {
      value: 'performance',
      label: 'Performance',
      icon: BarChart3,
      description: 'Performance metrics'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Monitoring Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Status</p>
                <p className="text-2xl font-bold text-green-400">{health?.s3?.status === 'up' || health?.s3?.status === 'ok' || health?.s3?.status === 'healthy' ? 'Healthy' : 'Checking...'}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">API Health</p>
                <p className="text-2xl font-bold text-white">{health?.api?.status || 'unknown'}</p>
              </div>
              <Wifi className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Supabase Health</p>
                <p className="text-2xl font-bold text-white">{health?.supabase?.status || 'unknown'}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Database Health</p>
                <p className="text-2xl font-bold text-white">{health?.db?.status || 'unknown'}</p>
              </div>
              <Database className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Auth Health</p>
                <p className="text-2xl font-bold text-white">{health?.auth?.status || 'unknown'}</p>
              </div>
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cache Health</p>
                <p className="text-2xl font-bold text-white">{health?.cache?.status || 'unknown'}</p>
              </div>
              <HardDrive className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">External/Influx</p>
                <p className="text-2xl font-bold text-white">{health?.external?.status || health?.influx?.status || 'unknown'}</p>
              </div>
              <Wifi className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Tabs */}
      <Tabs value={activeMonitoringTab} onValueChange={setActiveMonitoringTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          {monitoringTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="health" className="space-y-6 mt-6">
          <SystemHealthDashboard />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6 mt-6">
          {/* Error Stats */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Error Summary</CardTitle>
              <CardDescription>Counts by status/severity (recent)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{errors.filter(e => (e.status||'open')==='open').length}</div>
                  <div className="text-xs text-gray-400">Open</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{errors.filter(e => e.status==='resolved').length}</div>
                  <div className="text-xs text-gray-400">Resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{errors.filter(e => (e.severity||'error').toLowerCase()==='error').length}</div>
                  <div className="text-xs text-gray-400">Error</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{errors.filter(e => (e.severity||'').toLowerCase()==='warning').length}</div>
                  <div className="text-xs text-gray-400">Warning</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Logs */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Errors</CardTitle>
              <CardDescription>Server and job errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <input
                  value={errorQuery}
                  onChange={e=>setErrorQuery(e.target.value)}
                  placeholder="Filter by message/status/severity"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder:text-gray-500"
                />
                <div className="text-right mt-2">
                  <button
                    className="text-purple-300 text-sm underline"
                    onClick={() => {
                      const header = 'id,message,severity,status,createdAt'
                      const rows = errors
                        .filter(e => !errorQuery || JSON.stringify(e).toLowerCase().includes(errorQuery.toLowerCase()))
                        .slice(0, 200)
                        .map((e: any) => [e.id, JSON.stringify(e.message||''), e.severity||'', e.status||'open', e.createdAt||''])
                        .map(r => r.join(','))
                        .join('\n')
                      const csv = header + '\n' + rows
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'errors.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-300">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Message</th>
                      <th className="text-left p-2">Severity</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingErrors && (
                      <tr><td className="p-3 text-gray-400" colSpan={6}>Loading...</td></tr>
                    )}
                    {!loadingErrors && errors.length === 0 && (
                      <tr><td className="p-3 text-gray-400" colSpan={6}>No recent errors</td></tr>
                    )}
                    {errors
                      .filter(e => !errorQuery || JSON.stringify(e).toLowerCase().includes(errorQuery.toLowerCase()))
                      .slice(0, 10)
                      .map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer" onClick={() => setSelectedError(e)}>
                        <td className="p-2 text-white">{e.id}</td>
                        <td className="p-2 text-gray-300 truncate max-w-[360px]" title={e.message}>{e.message}</td>
                        <td className="p-2"><Badge className="bg-red-900/30 text-red-400">{e.severity || 'error'}</Badge></td>
                        <td className="p-2"><Badge className={e.status==='resolved' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700'}>{e.status || 'open'}</Badge></td>
                        <td className="p-2 text-gray-300">{e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}</td>
                        <td className="p-2 text-right">
                          {e.status !== 'resolved' && (
                            <button className="text-purple-300" onClick={() => resolveError(e.id)}>Resolve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Audit Logs</CardTitle>
              <CardDescription>Security and admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <input
                  value={auditQuery}
                  onChange={e=>setAuditQuery(e.target.value)}
                  placeholder="Filter audits (actor/action/details)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder:text-gray-500"
                />
                <div className="text-right mt-2">
                  <button
                    className="text-purple-300 text-sm underline"
                    onClick={() => {
                      const header = 'time,actor,action,details'
                      const rows = audits
                        .filter(a => !auditQuery || JSON.stringify(a).toLowerCase().includes(auditQuery.toLowerCase()))
                        .slice(0, 500)
                        .map((a: any) => [a.createdAt||'', a.actor||a.user||'system', a.action||a.event||'', JSON.stringify(a.details||a.meta||'')])
                        .map(r => r.join(','))
                        .join('\n')
                      const csv = header + '\n' + rows
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'audit_logs.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-300">
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Actor</th>
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAudits && (
                      <tr><td className="p-3 text-gray-400" colSpan={4}>Loading...</td></tr>
                    )}
                    {!loadingAudits && audits.length === 0 && (
                      <tr><td className="p-3 text-gray-400" colSpan={4}>No recent audit entries</td></tr>
                    )}
                    {audits
                      .filter(a => !auditQuery || JSON.stringify(a).toLowerCase().includes(auditQuery.toLowerCase()))
                      .slice(0, 10)
                      .map((a: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="p-2 text-gray-300">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                        <td className="p-2 text-white">{a.actor || a.user || 'system'}</td>
                        <td className="p-2 text-gray-300">{a.action || a.event || 'event'}</td>
                        <td className="p-2 text-gray-400 truncate max-w-[360px]" title={a.details || a.meta}>{a.details || a.meta || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Error detail modal */}
          {selectedError && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedError(null)}>
              <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg">Error Details</h3>
                  <button className="text-gray-400 hover:text-white" onClick={() => setSelectedError(null)}>×</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">ID: </span><span className="text-white">{selectedError.id}</span></div>
                  <div><span className="text-gray-400">Message: </span><span className="text-white">{String(selectedError.message)}</span></div>
                  <div><span className="text-gray-400">Severity: </span><span className="text-white">{selectedError.severity || 'error'}</span></div>
                  <div><span className="text-gray-400">Status: </span><span className="text-white">{selectedError.status || 'open'}</span></div>
                  <div><span className="text-gray-400">Time: </span><span className="text-white">{selectedError.createdAt ? new Date(selectedError.createdAt).toLocaleString() : '—'}</span></div>
                </div>
                {selectedError.stack && (
                  <pre className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-200 overflow-auto max-h-64">{selectedError.stack}</pre>
                )}
                {selectedError.meta && (
                  <pre className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-200 overflow-auto max-h-64">{JSON.stringify(selectedError.meta, null, 2)}</pre>
                )}
                <div className="mt-4 text-right">
                  {selectedError.status !== 'resolved' && (
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm" onClick={() => resolveError(selectedError.id)}>Resolve</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="debug" className="space-y-6 mt-6">
          <DebugUtilities />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Metrics */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>Server Metrics</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Current server performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">CPU Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={32} className="w-24 h-2" />
                      <span className="text-sm text-white">32%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Memory Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={48} className="w-24 h-2" />
                      <span className="text-sm text-white">48%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Disk Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={23} className="w-24 h-2" />
                      <span className="text-sm text-white">23%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Performance */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-400" />
                  <span>Database Performance</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Database connection and query metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">142ms</p>
                    <p className="text-xs text-gray-400">Avg Query Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">1,247</p>
                    <p className="text-xs text-gray-400">Queries/min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">12</p>
                    <p className="text-xs text-gray-400">Active Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-xs text-gray-400">Slow Queries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Performance */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-purple-400" />
                  <span>API Performance</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  API endpoint response times and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">/api/v1/sensors</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-900/30 text-green-400">98ms</Badge>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">/api/fixtures</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-900/30 text-blue-400">156ms</Badge>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">/api/auth</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-900/30 text-green-400">87ms</Badge>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-orange-400" />
                  <span>System Resources</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Overall system resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">42%</div>
                    <div className="text-sm text-gray-400">Overall Load</div>
                    <Badge className="bg-green-900/30 text-green-400 mt-2">Healthy</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-white font-medium">1.2GB</div>
                      <div className="text-gray-400">Memory Free</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">47GB</div>
                      <div className="text-gray-400">Disk Free</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">4.2%</div>
                      <div className="text-gray-400">Load Avg</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}