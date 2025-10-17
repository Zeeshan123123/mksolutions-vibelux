'use client';

import React, { useState, useEffect } from 'react';
import { ModuleFeatureGate } from '@/components/ModuleFeatureGate';
import { ModuleType } from '@/lib/subscription-modules';
import { 
  Calendar,
  Filter,
  ChevronRight,
  Bug,
  AlertCircle,
  Leaf,
  Wind,
  Droplets,
  Clock,
  MapPin,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  timestamp: string;
  issueType: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone?: string | null;
  photos: string[];
  status?: 'submitted' | 'reviewed' | 'resolved';
  actionRequired?: boolean;
}

export default function ScoutingHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other'>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        // Facility context
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
        const items = (data.reports || []).map((r: any) => ({
          id: r.id,
          timestamp: r.timestamp,
          issueType: r.issueType,
          severity: r.severity,
          zone: r.zone,
          photos: r.photos || [],
          status: r.status || 'submitted',
          actionRequired: r.actionRequired || false,
        })) as HistoryItem[];
        setHistory(items);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pest': return Bug;
      case 'disease': return AlertCircle;
      case 'nutrient': return Leaf;
      case 'environmental': return Wind;
      default: return Droplets;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'pest': return 'text-red-500';
      case 'disease': return 'text-orange-500';
      case 'nutrient': return 'text-yellow-500';
      case 'environmental': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-400';
      case 'reviewed': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'pending' && item.status === 'resolved') return false;
    if (filter === 'resolved' && item.status !== 'resolved') return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && item.issueType !== typeFilter) return false;
    if (fromDate && new Date(item.timestamp) < new Date(fromDate)) return false;
    if (toDate && new Date(item.timestamp) > new Date(toDate)) return false;
    return true;
  });

  return (
    <ModuleFeatureGate module={ModuleType.PROFESSIONAL} feature="employee-scouting" soft>
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Scouting History</h1>
            <button className="text-purple-400">
              <Filter className="w-6 h-6" />
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-4 mt-4">
            {(['all', 'pending', 'resolved'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  filter === filterOption
                    ? 'text-purple-400 border-purple-400'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="px-4 py-4 space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Severity</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)} className="bg-gray-900 border border-gray-800 text-gray-200 rounded px-2 py-1">
              {(['all','low','medium','high','critical'] as const).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="bg-gray-900 border border-gray-800 text-gray-200 rounded px-2 py-1">
              {(['all','pest','disease','nutrient','environmental','other'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-900 border border-gray-800 text-gray-200 rounded px-2 py-1"/>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-900 border border-gray-800 text-gray-200 rounded px-2 py-1"/>
          </div>
          <div className="ml-auto">
            <a
              href={`/api/scouting/export${facilityId ? `?facilityId=${encodeURIComponent(facilityId)}` : ''}${fromDate ? `${facilityId ? '&' : '?'}from=${encodeURIComponent(fromDate)}` : ''}${toDate ? `${(facilityId || fromDate) ? '&' : '?'}to=${encodeURIComponent(toDate)}` : ''}`}
              className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm"
            >
              Export CSV
            </a>
            <a
              href={`/api/scouting/report/pdf${facilityId ? `?facilityId=${encodeURIComponent(facilityId)}` : ''}${fromDate ? `${facilityId ? '&' : '?'}from=${encodeURIComponent(fromDate)}` : ''}${toDate ? `${(facilityId || fromDate) ? '&' : '?'}to=${encodeURIComponent(toDate)}` : ''}`}
              className="ml-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm border border-gray-700"
            >
              Export PDF
            </a>
          </div>
        </div>
        {filteredHistory.map((item, index) => {
          const Icon = getIcon(item.issueType);
          
          return (
            <Link key={item.id} href={`/scouting/${item.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-gray-800 rounded-lg ${getIconColor(item.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {item.issueType.charAt(0).toUpperCase() + item.issueType.slice(1)} Issue
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.zone || 'Unknown zone'}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(item.severity)}`} />
                          <span className="text-xs text-gray-400 capitalize">{item.severity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Camera className="w-3 h-3" />
                          {item.photos.length}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.actionRequired && (
                          <span className="text-xs font-medium text-red-400">Action Required</span>
                        )}
                        <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4 gap-1">
          <Link href="/scouting" className="py-3 text-gray-400 text-center">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Scout</span>
          </Link>
          <button className="py-3 text-gray-400 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <Link href="/scouting/map" className="py-3 text-gray-400 text-center">
            <MapPin className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Map</span>
          </Link>
          <button className="py-3 text-purple-500 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">History</span>
          </button>
        </div>
      </div>
    </div>
    </ModuleFeatureGate>
  );
}