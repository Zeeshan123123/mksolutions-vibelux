'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  Edit,
  Trash2,
  Download,
  MoreHorizontal,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  Calendar,
  Ruler,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface Design {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_CONSTRUCTION' | 'COMPLETED' | 'ARCHIVED';
  width: number;
  length: number;
  height: number;
  area: number;
  volume: number;
  structureType: string;
  glazingType: string;
  frameType: string;
  facility: {
    id: string;
    name: string;
  };
  zones: Array<{
    id: string;
    name: string;
    zoneType: string;
    area: number;
  }>;
  equipment: Array<{
    id: string;
    name: string;
    equipmentType: string;
    status: string;
  }>;
  _count: {
    zones: number;
    equipment: number;
    exports: number;
    revisions: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DesignCardProps {
  design: Design;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DesignCard({
  design,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}: DesignCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      IN_CONSTRUCTION: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      ARCHIVED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const calculateProgress = () => {
    const totalSteps = 5;
    let completed = 1; // Always have basic design

    if (design._count.zones > 0) completed++;
    if (design._count.equipment > 0) completed++;
    if (design.status === 'IN_REVIEW' || design.status === 'APPROVED') completed++;
    if (design.status === 'COMPLETED') completed++;

    return (completed / totalSteps) * 100;
  };

  const formatStructureType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActiveEquipmentCount = () => {
    return design.equipment.filter(eq => eq.status === 'ACTIVE').length;
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/designs/${design.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportType: 'REPORT',
          format: 'PDF',
          options: {
            includeZones: true,
            includeEquipment: true,
            includeMaterials: true
          }
        })
      });

      if (response.ok) {
        // Handle successful export
        alert('Export initiated. You will receive a download link shortly.');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''
      }`}
      onClick={onView}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="bg-white shadow-sm"
        />
      </div>

      {/* Actions Menu */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 p-0 bg-white shadow-sm hover:bg-gray-50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Design
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3 pt-12">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 truncate pr-2">
              {design.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(design.status)}>
              {design.status.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(design.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Facility Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span className="truncate">{design.facility.name}</span>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Ruler className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">Dimensions</span>
          </div>
          <div className="text-right font-medium">
            {design.width}×{design.length}×{design.height}m
          </div>
          
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">Area</span>
          </div>
          <div className="text-right font-medium">
            {design.area.toFixed(1)} m²
          </div>
        </div>

        {/* Structure Info */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Structure</div>
          <div className="text-sm font-medium">
            {formatStructureType(design.structureType)}
          </div>
          <div className="text-xs text-gray-600">
            {design.glazingType} • {design.frameType}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-blue-600">
              {design._count.zones}
            </div>
            <div className="text-xs text-blue-600">Zones</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-green-600">
              {getActiveEquipmentCount()}
            </div>
            <div className="text-xs text-green-600">Active</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-purple-600">
              {design._count.exports}
            </div>
            <div className="text-xs text-purple-600">Exports</div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion</span>
            <span className="font-medium">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Zone Types Preview */}
        {design.zones.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Zone Types</div>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(design.zones.map(z => z.zoneType))).slice(0, 3).map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {type.toLowerCase().replace('_', ' ')}
                </Badge>
              ))}
              {design.zones.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{design.zones.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {design._count.revisions > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{design._count.revisions} revision{design._count.revisions !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}