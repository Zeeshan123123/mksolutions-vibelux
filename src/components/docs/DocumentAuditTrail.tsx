'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, FileEdit, Eye, Download } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: 'view' | 'edit' | 'download' | 'approve';
  user: string;
  timestamp: string;
  details?: string;
}

function DocumentAuditTrail() {
  const auditLog: AuditEntry[] = [
    {
      id: '1',
      action: 'approve',
      user: 'Admin User',
      timestamp: '2024-01-15 14:30',
      details: 'Approved version 2.1'
    },
    {
      id: '2',
      action: 'edit',
      user: 'John Doe',
      timestamp: '2024-01-15 10:15',
      details: 'Updated safety procedures'
    },
    {
      id: '3',
      action: 'download',
      user: 'Jane Smith',
      timestamp: '2024-01-14 16:45'
    },
    {
      id: '4',
      action: 'view',
      user: 'Mike Johnson',
      timestamp: '2024-01-14 09:20'
    }
  ];

  const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <FileEdit className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'approve': return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'approve': return 'text-green-600';
      case 'edit': return 'text-blue-600';
      case 'download': return 'text-purple-600';
      case 'view': return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Document Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {auditLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={`mt-1 ${getActionColor(entry.action)}`}>
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{entry.user}</span>
                    <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {entry.action} document
                    {entry.details && `: ${entry.details}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export { DocumentAuditTrail };
export default DocumentAuditTrail;