'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { ModuleFeatureGate } from '@/components/ModuleFeatureGate';
import { ModuleType } from '@/lib/subscription-modules';

interface ReportPoint {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issueType: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  zone?: string | null;
  timestamp: string;
}

export default function ScoutingMapPage() {
  const [points, setPoints] = useState<ReportPoint[]>([]);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [showOnlyActionRequired, setShowOnlyActionRequired] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Get facility
        const fRes = await fetch('/api/facility');
        let facilityQuery = '';
        if (fRes.ok) {
          const f = await fRes.json();
          if (f?.facility?.id) {
            setFacilityId(f.facility.id);
            facilityQuery = `?facilityId=${encodeURIComponent(f.facility.id)}`;
          }
        }

        const res = await fetch(`/api/scouting/report${facilityQuery}`);
        if (!res.ok) return;
        const data = await res.json();
        const pts = (data.reports || []).map((r: any) => ({
          id: r.id,
          latitude: r.location?.latitude ?? r.location?.lat ?? r.latitude,
          longitude: r.location?.longitude ?? r.location?.lng ?? r.longitude,
          severity: r.severity,
          issueType: r.issueType,
          zone: r.zone,
          timestamp: r.timestamp,
          actionRequired: r.actionRequired,
        }));
        setPoints(pts);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ModuleFeatureGate module={ModuleType.PROFESSIONAL} feature="employee-scouting" soft>
      <div className="min-h-screen bg-gray-950">
        <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">Scouting Map</h1>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <p>Recent scouting reports by location</p>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" checked={showOnlyActionRequired} onChange={(e) => setShowOnlyActionRequired(e.target.checked)} />
              Show only action required
            </label>
          </div>
        </div>
        {/* Simple faux-map grid with markers (no external map lib to keep deps minimal) */}
        <div className="p-4">
          <div className="relative w-full h-[520px] bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-gray-800/40" />
              ))}
            </div>
            {/* Render markers */}
            <div className="absolute inset-0">
              {(showOnlyActionRequired ? points.filter(p => (p as any).actionRequired) : points).map((p) => (
                <div
                  key={p.id}
                  title={`${p.issueType} - ${p.severity}${p.zone ? ` @ ${p.zone}` : ''}`}
                  className={`absolute w-4 h-4 rounded-full ${severityColor(p.severity)} shadow-lg ${((p as any).actionRequired ? 'ring-2 ring-red-400' : '')}`}
                  style={{
                    // naive projection: assume lat/long normalized in local range, just scatter visually
                    left: `${Math.abs(((p.longitude ?? 0) % 1)) * 100}%`,
                    top: `${Math.abs(((p.latitude ?? 0) % 1)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    No scouting points yet
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleFeatureGate>
  );
}


