'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Clock, Download, Eye, Copy, Trash2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocumentAccess {
  id: string;
  documentPath: string;
  documentTitle: string;
  accessType: 'view' | 'download' | 'print' | 'copy';
  timestamp: string;
  accessLevel: string;
  ipAddress: string;
}

interface ActivitySummary {
  totalDocumentsAccessed: number;
  documentsAccessedToday: number;
  documentsAccessedThisWeek: number;
  documentsAccessedThisMonth: number;
  lastActivityDate: string;
}

export function MyDocumentHistory() {
  const { user } = useUser();
  const [history, setHistory] = useState<DocumentAccess[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyHistory();
    }
  }, [user]);

  const fetchMyHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents/my-history');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }

      const data = await response.json();
      setHistory(data.history || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document history');
      console.error('Error fetching document history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldHistory = async (days: number) => {
    try {
      const response = await fetch('/api/documents/my-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ olderThanDays: days })
      });

      if (response.ok) {
        await fetchMyHistory(); // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting history:', err);
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'print': return <FileText className="w-4 h-4" />;
      case 'copy': return <Copy className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      authenticated: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
      internal: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please sign in to view your document history.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2">Loading your document history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          <p>Error: {error}</p>
          <Button onClick={fetchMyHistory} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Privacy Protected</p>
              <p>
                This page shows only YOUR document access history. We never share your 
                activity data with other customers or display other users' information to you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {summary.totalDocumentsAccessed}
              </div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.documentsAccessedToday}
              </div>
              <div className="text-sm text-gray-600">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.documentsAccessedThisWeek}
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summary.documentsAccessedThisMonth}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Your Document Access History
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteOldHistory(90)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete 90+ days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteOldHistory(365)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete 1+ year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No document access history found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((access) => (
                <div 
                  key={access.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getAccessTypeIcon(access.accessType)}
                      <Badge className={getAccessLevelColor(access.accessLevel)}>
                        {access.accessLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">{access.documentTitle}</div>
                      <div className="text-sm text-gray-500">
                        {access.accessType} • {new Date(access.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Your IP: {access.ipAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Control */}
      <Card>
        <CardHeader>
          <CardTitle>Data Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You have full control over your document access history. This data is used 
              for security purposes and to improve your experience.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchMyHistory}>
                Refresh History
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDeleteOldHistory(30)}
              >
                Delete 30+ days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}