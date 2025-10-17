'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useCloudSave } from '@/hooks/useCloudSave';
import { 
  Cloud, CloudOff, Plus, Search, Filter, Grid, List,
  Download, Trash2, Share2, Copy, Edit2, Eye, EyeOff,
  Clock, Star, FolderOpen, Tag, MoreVertical, 
  ChevronDown, Home, ArrowLeft, Settings, Users,
  FileText, Calendar, TrendingUp, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

export default function MyDesignsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'name'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');

  const {
    isLoading,
    savedDesigns,
    loadFromCloud,
    deleteFromCloud,
    saveToCloud,
  } = useCloudSave();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect=/designs/my-designs');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      loadFromCloud({
        sortBy,
        sortOrder,
        type: filterType === 'all' ? undefined : filterType,
        search: searchQuery,
      });
    }
  }, [isSignedIn, sortBy, sortOrder, filterType, searchQuery]);

  const handleOpenDesign = (designId: string) => {
    // Navigate to the designer with the design loaded
    router.push(`/design/advanced?load=${designId}`);
  };

  const handleDuplicateDesign = async (design: any) => {
    const duplicated = {
      ...design,
      id: undefined,
      name: `${design.name} (Copy)`,
    };
    await saveToCloud(duplicated);
    await loadFromCloud(); // Refresh the list
  };

  const handleDeleteDesign = async (designId: string, designName: string) => {
    if (confirm(`Are you sure you want to delete "${designName}"?`)) {
      const success = await deleteFromCloud(designId);
      if (success) {
        toast.success('Design deleted');
        await loadFromCloud(); // Refresh the list
      }
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDesigns.size === 0) return;

    switch (bulkAction) {
      case 'delete':
        if (confirm(`Delete ${selectedDesigns.size} selected designs?`)) {
          for (const id of selectedDesigns) {
            await deleteFromCloud(id);
          }
          setSelectedDesigns(new Set());
          await loadFromCloud();
          toast.success(`Deleted ${selectedDesigns.size} designs`);
        }
        break;
      case 'export':
        // Export selected designs
        toast.info('Bulk export coming soon!');
        break;
      case 'share':
        // Share selected designs
        toast.info('Bulk sharing coming soon!');
        break;
    }
    setBulkAction('');
  };

  const toggleSelectDesign = (designId: string) => {
    const newSelected = new Set(selectedDesigns);
    if (newSelected.has(designId)) {
      newSelected.delete(designId);
    } else {
      newSelected.add(designId);
    }
    setSelectedDesigns(newSelected);
  };

  const selectAllDesigns = () => {
    if (selectedDesigns.size === savedDesigns.length) {
      setSelectedDesigns(new Set());
    } else {
      setSelectedDesigns(new Set(savedDesigns.map(d => d.id)));
    }
  };

  // Filter designs
  const filteredDesigns = savedDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          design.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || design.designType === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    total: savedDesigns.length,
    lighting: savedDesigns.filter(d => d.designType === 'lighting').length,
    hvac: savedDesigns.filter(d => d.designType === 'hvac').length,
    integrated: savedDesigns.filter(d => d.designType === 'integrated').length,
    public: savedDesigns.filter(d => d.isPublic).length,
    templates: savedDesigns.filter(d => d.isTemplate).length,
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Cloud className="w-8 h-8 animate-pulse text-gray-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <Home className="w-5 h-5" />
              </Link>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
              <h1 className="text-2xl font-bold text-gray-900">My Designs</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/design/advanced">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Design
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lighting</p>
                  <p className="text-2xl font-bold">{stats.lighting}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">HVAC</p>
                  <p className="text-2xl font-bold">{stats.hvac}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Integrated</p>
                  <p className="text-2xl font-bold">{stats.integrated}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Public</p>
                  <p className="text-2xl font-bold">{stats.public}</p>
                </div>
                <Eye className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Templates</p>
                  <p className="text-2xl font-bold">{stats.templates}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Saved Designs</CardTitle>
                <CardDescription>
                  Manage and organize your lighting and HVAC designs
                </CardDescription>
              </div>
              
              {/* Bulk Actions */}
              {selectedDesigns.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedDesigns.size} selected
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Bulk actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="share">Share</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAction} size="sm">
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="integrated">Integrated</SelectItem>
                    <SelectItem value="cad">CAD</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Last Modified</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Select All */}
            {filteredDesigns.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={selectedDesigns.size === filteredDesigns.length}
                  onChange={selectAllDesigns}
                  className="rounded"
                />
                <label className="text-sm text-gray-600">
                  Select all ({filteredDesigns.length})
                </label>
              </div>
            )}

            {/* Designs Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <Cloud className="w-12 h-12 mx-auto animate-pulse text-gray-400" />
                <p className="mt-4 text-gray-600">Loading your designs...</p>
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="text-center py-12">
                <CloudOff className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-600">No designs found</p>
                <Link href="/design/advanced">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Design
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'space-y-2'
              }>
                {filteredDesigns.map((design) => (
                  <Card 
                    key={design.id} 
                    className={`cursor-pointer hover:shadow-lg transition-all ${
                      selectedDesigns.has(design.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedDesigns.has(design.id)}
                          onChange={() => toggleSelectDesign(design.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        
                        <div 
                          className="flex-1 mx-3"
                          onClick={() => handleOpenDesign(design.id)}
                        >
                          <h3 className="font-semibold text-gray-900 truncate">
                            {design.name}
                          </h3>
                          {design.description && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {design.description}
                            </p>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDesign(design.id)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Open in Designer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateDesign(design)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteDesign(design.id, design.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        {/* Design Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {design.designType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(design.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {/* Room Dimensions */}
                        {design.width && design.length && (
                          <div className="text-xs text-gray-600">
                            {design.width} × {design.length} × {design.height} {design.unit || 'ft'}
                          </div>
                        )}

                        {/* Metrics */}
                        {design.designData?.calculations && (
                          <div className="flex gap-2 text-xs">
                            {design.designData.calculations.avgPPFD && (
                              <Badge variant="secondary">
                                {Math.round(design.designData.calculations.avgPPFD)} PPFD
                              </Badge>
                            )}
                            {design.designData.calculations.totalPower && (
                              <Badge variant="secondary">
                                {design.designData.calculations.totalPower}W
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Tags and Status */}
                        <div className="flex items-center gap-2">
                          {design.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {design.isTemplate && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Template
                            </Badge>
                          )}
                          {design.version && design.version > 1 && (
                            <Badge variant="outline" className="text-xs">
                              v{design.version}
                            </Badge>
                          )}
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {formatDistanceToNow(new Date(design.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}