'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ModuleFeatureGate } from '@/components/ModuleFeatureGate';
import { ModuleType } from '@/lib/subscription-modules';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ReportDetail {
  id: string;
  timestamp: string;
  issueType: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone?: string | null;
  notes?: string | null;
  photos: string[];
  location?: { latitude: number; longitude: number };
  actionRequired?: boolean;
  assignedTo?: string | null;
}

export default function ScoutingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [actionRequired, setActionRequired] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/scouting/report/${params.id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setReport(data as ReportDetail);
        setNotes(data.notes || '');
        setAssignedTo(data.assignedTo || '');
        setActionRequired(!!data.actionRequired);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const save = async () => {
    try {
      setSaving(true);
      await fetch(`/api/scouting/report/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, assignedTo: assignedTo || null, actionRequired })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleFeatureGate module={ModuleType.PROFESSIONAL} feature="employee-scouting" soft>
      <div className="min-h-screen bg-gray-950">
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Scouting Report</h1>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
        ) : report ? (
          <div className="p-4 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">{new Date(report.timestamp).toLocaleString()}</div>
                  <div className="text-white font-semibold capitalize">{report.issueType} - {report.severity}</div>
                </div>
                <div className="text-sm text-gray-400">{report.zone || 'Unknown zone'}</div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <h2 className="text-white font-semibold mb-3">Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {report.photos?.map((url, i) => (
                  <img key={i} src={url} alt={`Photo ${i+1}`} className="w-full h-28 object-cover rounded-lg border border-gray-800" />
                ))}
                {(!report.photos || report.photos.length === 0) && (
                  <div className="text-sm text-gray-500">No photos</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input id="actionRequired" type="checkbox" className="accent-purple-600" checked={actionRequired} onChange={(e) => setActionRequired(e.target.checked)} />
                <label htmlFor="actionRequired" className="text-sm text-gray-200">Action required</label>
              </div>
              <div>
                <Link href="/compliance/dashboard" className="text-sm text-purple-400 hover:text-purple-300 underline">
                  Record pesticide application
                </Link>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assign to (user ID)</label>
                <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="user_..." className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
              </div>
              <div className="flex justify-end">
                <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-gray-400">Not found</div>
        )}
      </div>
    </ModuleFeatureGate>
  );
}


