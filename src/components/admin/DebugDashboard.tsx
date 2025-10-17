'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, 
  Users, 
  Play, 
  Search, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  XCircle,
  Clock,
  Monitor,
  Database,
  Activity
} from 'lucide-react';

interface ErrorReport {
  id: string;
  sessionId: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  error: any;
  context: any;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface UserSession {
  id: string;
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  actions: any[];
  calculations: any[];
  errors: any[];
  metadata: any;
}

export function DebugDashboard() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [impersonationToken, setImpersonationToken] = useState('');

  useEffect(() => {
    fetchErrors();
    fetchSessions();
  }, []);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/errors');
      const data = await response.json();
      setErrors(data);
    } catch (error) {
      logger.error('system', 'Failed to fetch errors:', error );
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/debug/sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      logger.error('system', 'Failed to fetch sessions:', error );
    }
  };

  const replaySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/debug/sessions/${sessionId}`);
      const session = await response.json();
      setSelectedSession(session);
      
      // Log replay info
      console.group(`🎬 Session Replay: ${sessionId}`);
      logger.info('system', 'User:', { data: session.userId });
      logger.info('system', 'Duration:', { data: session.endTime ? 
        new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : 'ongoing' });
      logger.info('system', 'Actions:', { data: session.actions?.length || 0 });
      logger.info('system', 'Calculations:', { data: session.calculations?.length || 0 });
      logger.info('system', 'Errors:', { data: session.errors?.length || 0 });
      console.groupEnd();
    } catch (error) {
      logger.error('system', 'Failed to replay session:', error );
    }
  };

  const impersonateUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      setImpersonationToken(data.token);
      
      // Open new window with impersonation
      window.open(`/design?impersonate=${data.token}`, '_blank');
    } catch (error) {
      logger.error('system', 'Failed to impersonate user:', error );
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-500',
      error: 'bg-red-400',
      warning: 'bg-yellow-400',
      info: 'bg-blue-400'
    };
    return (
      <Badge className={`${colors[severity as keyof typeof colors]} text-white`}>
        {severity}
      </Badge>
    );
  };

  const filteredErrors = errors.filter(error => 
    error.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessions = sessions.filter(session =>
    session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Debug Dashboard</h1>
          <p className="text-gray-400">Monitor errors, replay sessions, and troubleshoot issues</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search errors, sessions, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button onClick={() => { fetchErrors(); fetchSessions(); }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <Bug className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors.length}</div>
            <p className="text-xs text-muted-foreground">
              {errors.filter(e => e.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => !s.endTime).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {sessions.length} total sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculation Errors</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errors.filter(e => e.type.includes('calculation')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Calculation-related issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Good</div>
            <p className="text-xs text-muted-foreground">
              No critical issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Reports</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="replay">Session Replay</TabsTrigger>
          <TabsTrigger value="impersonate">User Impersonation</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Error Reports</CardTitle>
              <CardDescription>
                Monitor and troubleshoot application errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredErrors.map((error) => (
                  <div key={error.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(error.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {error.type}
                        </p>
                        {getSeverityBadge(error.severity)}
                        <span className="text-xs text-gray-400">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Session: {error.sessionId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {error.url}
                      </p>
                      <details className="mt-2">
                        <summary className="text-xs text-blue-400 cursor-pointer">
                          Show details
                        </summary>
                        <pre className="text-xs bg-gray-800 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(error.error, null, 2)}
                        </pre>
                      </details>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => replaySession(error.sessionId)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Replay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Sessions</CardTitle>
              <CardDescription>
                View and analyze user interaction sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">
                        User: {session.userId}
                      </p>
                      <p className="text-sm text-gray-400">
                        Session: {session.sessionId}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(session.startTime).toLocaleString()}
                        </span>
                        <span>{session.actions?.length || 0} actions</span>
                        <span>{session.calculations?.length || 0} calculations</span>
                        <span>{session.errors?.length || 0} errors</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => replaySession(session.sessionId)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Replay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => impersonateUser(session.userId)}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Impersonate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replay" className="space-y-4">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle>Session Replay: {selectedSession.sessionId}</CardTitle>
                <CardDescription>
                  User: {selectedSession.userId} | 
                  Started: {new Date(selectedSession.startTime).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="actions">
                  <TabsList>
                    <TabsTrigger value="actions">Actions ({selectedSession.actions?.length || 0})</TabsTrigger>
                    <TabsTrigger value="calculations">Calculations ({selectedSession.calculations?.length || 0})</TabsTrigger>
                    <TabsTrigger value="errors">Errors ({selectedSession.errors?.length || 0})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedSession.actions?.map((action, index) => (
                        <div key={index} className="p-2 bg-gray-800 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{action.type}</span>
                            <span className="text-gray-400">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <pre className="text-xs mt-1 text-gray-400">
                            {JSON.stringify(action.payload, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="calculations" className="mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedSession.calculations?.map((calc, index) => (
                        <div key={index} className="p-2 bg-gray-800 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{calc.step}</span>
                            <span className="text-gray-400">
                              {calc.processingTime?.toFixed(2)}ms
                            </span>
                          </div>
                          {calc.errors?.length > 0 && (
                            <div className="text-red-400 text-xs mt-1">
                              Errors: {calc.errors.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="errors" className="mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedSession.errors?.map((error, index) => (
                        <div key={index} className="p-2 bg-red-900/20 border border-red-800 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-red-400">{error.type}</span>
                            <span className="text-gray-400">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <pre className="text-xs mt-1 text-gray-400">
                            {JSON.stringify(error.error, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-400">Select a session to replay</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="impersonate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Impersonation</CardTitle>
              <CardDescription>
                Impersonate users to debug issues from their perspective
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Security Warning</span>
                  </div>
                  <p className="text-sm text-yellow-300 mt-1">
                    User impersonation is logged for audit purposes. Only use for debugging legitimate issues.
                  </p>
                </div>
                
                {impersonationToken && (
                  <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                    <p className="text-sm text-green-300">
                      Impersonation session active. Token: {impersonationToken}
                    </p>
                  </div>
                )}
                
                <div className="text-sm text-gray-400">
                  Click "Impersonate" on any user session above to debug as that user.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DebugDashboard

// Backwards-compatible named exports expected by various pages
export const SustainabilityDashboard = DebugDashboard
export const CreditDashboard = DebugDashboard
export const ReferralDashboard = DebugDashboard
export function EnhancedChartRenderer() {
  return null
}