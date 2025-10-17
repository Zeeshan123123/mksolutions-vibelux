'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Document {
  id: string;
  title: string;
  version: string;
  lastModified: string;
  status: 'draft' | 'review' | 'approved';
}

function SOPDocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Greenhouse Operation Procedures',
      version: '2.1',
      lastModified: '2024-01-15',
      status: 'approved'
    },
    {
      id: '2',
      title: 'Safety Protocol Manual',
      version: '1.5',
      lastModified: '2024-01-10',
      status: 'review'
    },
    {
      id: '3',
      title: 'Equipment Maintenance Guide',
      version: '3.0',
      lastModified: '2024-01-08',
      status: 'draft'
    }
  ]);

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
    }
  };

  const [activity, setActivity] = useState<Array<{ type: 'revision' | 'checkin'; title: string; by: string; at: string; meta?: string }>>([])

  useEffect(() => {
    // Fetch recent revisions and check-ins
    const load = async () => {
      try {
        const [revRes, ckRes] = await Promise.all([
          fetch('/api/sop/revisions?limit=10'),
          fetch('/api/sop/checkin?status=completed')
        ])
        const rev = revRes.ok ? await revRes.json() : { revisions: [] }
        const ck = ckRes.ok ? await ckRes.json() : []
        const revItems = (rev.revisions || []).map((r: any) => ({
          type: 'revision' as const,
          title: `Revision ${r.previousVersion} → ${r.newVersion} (${r.sop?.title || 'SOP'})`,
          by: r.changedBy || '—',
          at: r.createdAt,
          meta: r.diffSummary || (r.changeLog ? r.changeLog.slice(0, 120) : '')
        }))
        const ckItems = (ck || []).slice(0, 10).map((c: any) => ({
          type: 'checkin' as const,
          title: `${c.sop?.title || 'SOP'} Check-in ${c.status === 'completed' ? 'Completed' : ''}`,
          by: c.user?.name || c.userId || '—',
          at: c.updatedAt || c.startTime,
          meta: [c.clientIp, c.userAgent].filter(Boolean).join(' · ')
        }))
        setActivity([...revItems, ...ckItems].sort((a,b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 12))
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SOP Document Manager
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Version {doc.version}</span>
                      <span>Modified {doc.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {activity.map((a, i) => (
                <div key={i} className="text-sm border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-muted-foreground">
                      {a.type === 'revision' ? 'Revision' : 'Check-in'} • {a.by} • {new Date(a.at).toLocaleString()}
                      {a.meta ? ` • ${a.meta}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              {activity.length === 0 && <div className="text-sm text-muted-foreground">No recent activity.</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { SOPDocumentManager };
export default SOPDocumentManager;