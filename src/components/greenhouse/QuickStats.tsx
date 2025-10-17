'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ruler,
  Activity
} from 'lucide-react';

interface Design {
  id: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_CONSTRUCTION' | 'COMPLETED' | 'ARCHIVED';
  area: number;
  volume: number;
  _count: {
    zones: number;
    equipment: number;
    exports: number;
    revisions: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuickStatsProps {
  designs: Design[];
}

export function QuickStats({ designs }: QuickStatsProps) {
  const calculateStats = () => {
    const total = designs.length;
    const byStatus = designs.reduce((acc, design) => {
      acc[design.status] = (acc[design.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalArea = designs.reduce((sum, design) => sum + design.area, 0);
    const totalVolume = designs.reduce((sum, design) => sum + design.volume, 0);
    const totalZones = designs.reduce((sum, design) => sum + design._count.zones, 0);
    const totalEquipment = designs.reduce((sum, design) => sum + design._count.equipment, 0);

    const recentlyUpdated = designs.filter(design => {
      const updatedDate = new Date(design.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedDate > weekAgo;
    }).length;

    const averageArea = total > 0 ? totalArea / total : 0;

    return {
      total,
      byStatus,
      totalArea,
      totalVolume,
      totalZones,
      totalEquipment,
      recentlyUpdated,
      averageArea
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'text-gray-600',
      IN_REVIEW: 'text-yellow-600',
      APPROVED: 'text-green-600',
      IN_CONSTRUCTION: 'text-blue-600',
      COMPLETED: 'text-purple-600',
      ARCHIVED: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      DRAFT: Clock,
      IN_REVIEW: AlertTriangle,
      APPROVED: CheckCircle,
      IN_CONSTRUCTION: Activity,
      COMPLETED: CheckCircle,
      ARCHIVED: AlertTriangle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Designs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.recentlyUpdated} updated this week
          </p>
        </CardContent>
      </Card>

      {/* Total Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
          <Ruler className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalArea.toLocaleString()} m²
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {stats.averageArea.toFixed(0)} m² per design
          </p>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.byStatus.IN_CONSTRUCTION || 0) + (stats.byStatus.IN_REVIEW || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.byStatus.COMPLETED || 0} completed
          </p>
        </CardContent>
      </Card>

      {/* Equipment Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEquipment}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalZones} zones configured
          </p>
        </CardContent>
      </Card>

      {/* Status Breakdown - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Project Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>

          {/* Progress Visualization */}
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-600 mb-2">Project Distribution:</div>
            <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const percentage = (count / stats.total) * 100;
                const colors = {
                  DRAFT: 'bg-gray-400',
                  IN_REVIEW: 'bg-yellow-400',
                  APPROVED: 'bg-green-400',
                  IN_CONSTRUCTION: 'bg-blue-400',
                  COMPLETED: 'bg-purple-400',
                  ARCHIVED: 'bg-red-400'
                };
                const color = colors[status as keyof typeof colors] || 'bg-gray-400';
                
                return percentage > 0 ? (
                  <div
                    key={status}
                    className={`${color} h-full`}
                    style={{ width: `${percentage}%` }}
                    title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
                  />
                ) : null;
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Distribution by status</span>
              <span>{stats.total} total projects</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {Math.round(((stats.byStatus.COMPLETED || 0) / Math.max(stats.total, 1)) * 100)}%
              </div>
              <div className="text-xs text-gray-600">Completion Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {stats.totalVolume.toLocaleString()} m³
              </div>
              <div className="text-xs text-gray-600">Total Volume</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {(stats.totalZones / Math.max(stats.total, 1)).toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Avg Zones/Design</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {(stats.totalEquipment / Math.max(stats.total, 1)).toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Avg Equipment/Design</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}