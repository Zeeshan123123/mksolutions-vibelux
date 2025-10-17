'use client';

import React, { useState, useEffect } from 'react';
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
  date: Date;
  type: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'submitted' | 'reviewed' | 'resolved';
  photoCount: number;
}

export default function ScoutingHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    // Mock data - in production, fetch from API
    setHistory([
      {
        id: 'RPT-001',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'pest',
        severity: 'high',
        location: 'Greenhouse A - Row 12',
        status: 'reviewed',
        photoCount: 3
      },
      {
        id: 'RPT-002',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'disease',
        severity: 'medium',
        location: 'Greenhouse B - Row 5',
        status: 'resolved',
        photoCount: 5
      },
      {
        id: 'RPT-003',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        type: 'nutrient',
        severity: 'low',
        location: 'Greenhouse A - Row 8',
        status: 'resolved',
        photoCount: 2
      }
    ]);
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

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status !== 'resolved';
    return item.status === 'resolved';
  });

  return (
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
        {filteredHistory.map((item, index) => {
          const Icon = getIcon(item.type);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg p-4 border border-gray-800"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-gray-800 rounded-lg ${getIconColor(item.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Issue
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
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
                        {item.photoCount}
                      </div>
                    </div>
                    
                    <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
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
          <button className="py-3 text-gray-400 text-center">
            <MapPin className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Map</span>
          </button>
          <button className="py-3 text-purple-500 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">History</span>
          </button>
        </div>
      </div>
    </div>
  );
}