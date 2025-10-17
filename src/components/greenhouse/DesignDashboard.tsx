'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { DesignCard } from './DesignCard';
import { CreateDesignDialog } from './CreateDesignDialog';
import { DesignFilters } from './DesignFilters';
import { QuickStats } from './QuickStats';

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

interface DesignDashboardProps {
  facilityId?: string;
}

export function DesignDashboard({ facilityId }: DesignDashboardProps) {
  const router = useRouter();
  const { user } = useUser();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    structureType: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchDesigns();
  }, [filters, pagination.page, facilityId]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(facilityId && { facilityId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.structureType && { structureType: filters.structureType }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/designs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch designs');
      }

      const data = await response.json();
      setDesigns(data.designs);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDesign = () => {
    setShowCreateDialog(true);
  };

  const handleDesignCreated = (newDesign: Design) => {
    setDesigns(prev => [newDesign, ...prev]);
    setShowCreateDialog(false);
  };

  const handleViewDesign = (designId: string) => {
    router.push(`/dashboard/designs/${designId}`);
  };

  const handleEditDesign = (designId: string) => {
    router.push(`/dashboard/designs/${designId}/edit`);
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to archive this design?')) return;

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete design');
      }

      setDesigns(prev => prev.filter(d => d.id !== designId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete design');
    }
  };

  const handleBulkExport = async () => {
    if (selectedDesigns.length === 0) return;

    try {
      // Export selected designs
      for (const designId of selectedDesigns) {
        const response = await fetch(`/api/designs/${designId}/export`, {
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

        if (!response.ok) {
          console.error(`Failed to export design ${designId}`);
        }
      }

      setSelectedDesigns([]);
      alert('Export requests submitted. You will receive download links shortly.');
    } catch (err) {
      setError('Failed to export designs');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      IN_CONSTRUCTION: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      ARCHIVED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const calculateProgress = (design: Design) => {
    const totalSteps = 5; // Design, Zones, Equipment, Review, Complete
    let completed = 1; // Always have basic design

    if (design._count.zones > 0) completed++;
    if (design._count.equipment > 0) completed++;
    if (design.status === 'IN_REVIEW' || design.status === 'APPROVED') completed++;
    if (design.status === 'COMPLETED') completed++;

    return (completed / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Greenhouse Designs</h1>
          <p className="text-gray-600">
            Manage and monitor your greenhouse design projects
          </p>
        </div>
        <div className="flex gap-2">
          {selectedDesigns.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Selected ({selectedDesigns.length})
            </Button>
          )}
          <Button onClick={handleCreateDesign} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Design
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats designs={designs} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <DesignFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={fetchDesigns}
          />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Designs Grid */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {designs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <Plus className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No designs found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first greenhouse design
                  </p>
                  <Button onClick={handleCreateDesign}>
                    Create Design
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  isSelected={selectedDesigns.includes(design.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedDesigns(prev => [...prev, design.id]);
                    } else {
                      setSelectedDesigns(prev => prev.filter(id => id !== design.id));
                    }
                  }}
                  onView={() => handleViewDesign(design.id)}
                  onEdit={() => handleEditDesign(design.id)}
                  onDelete={() => handleDeleteDesign(design.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Design
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimensions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {designs.map((design) => (
                      <tr key={design.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {design.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {design.facility.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(design.status)}>
                            {design.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {design.width}m × {design.length}m × {design.height}m
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={calculateProgress(design)}
                              className="w-16"
                            />
                            <span className="text-xs text-gray-500">
                              {Math.round(calculateProgress(design))}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(design.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDesign(design.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDesign(design.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDesign(design.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} designs
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Design Dialog */}
      <CreateDesignDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onDesignCreated={handleDesignCreated}
        facilityId={facilityId}
      />
    </div>
  );
}