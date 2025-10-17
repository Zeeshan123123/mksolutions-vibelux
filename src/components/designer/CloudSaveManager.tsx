'use client';

import React, { useState, useEffect } from 'react';
import { useCloudSave } from '@/hooks/useCloudSave';
import { useDesigner } from '@/components/designer/context/DesignerContext';
import { 
  Cloud, CloudOff, Save, Download, Trash2, Share2, 
  Lock, Unlock, Clock, Search, Filter, Grid, List,
  ChevronDown, MoreVertical, Star, Copy, Edit2,
  FolderOpen, Tag, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { formatDistanceToNow } from 'date-fns';

interface CloudSaveManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoadDesign?: (design: any) => void;
  currentDesign?: any; // Optional design data if not using DesignerContext
}

export function CloudSaveManager({ 
  isOpen = false, 
  onClose,
  onLoadDesign,
  currentDesign 
}: CloudSaveManagerProps) {
  // Try to use DesignerContext if available, otherwise use props
  let state: any = null;
  let dispatch: any = null;
  
  try {
    const designerContext = useDesigner();
    state = designerContext.state;
    dispatch = designerContext.dispatch;
  } catch (e) {
    // Context not available, use currentDesign prop
    state = currentDesign;
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    isSaving,
    isLoading,
    savedDesigns,
    lastSaved,
    currentDesignId,
    isSignedIn,
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    canSave,
  } = useCloudSave({
    autoSave: true,
    autoSaveInterval: 60000, // Auto-save every minute
    onSaveSuccess: (design) => {
      toast.success('Design saved to cloud!');
      setSaveDialogOpen(false);
    },
  });

  // Quick save current design
  const handleQuickSave = async () => {
    if (!canSave) {
      toast.error('Please sign in to save to cloud');
      return;
    }

    if (!state) {
      toast.error('No design data available to save');
      return;
    }

    const design = {
      id: currentDesignId || undefined,
      name: designName || `Design ${new Date().toLocaleDateString()}`,
      description: designDescription,
      room: state.room,
      fixtures: state.objects?.filter?.(obj => obj.type === 'fixture') || state.fixtures || [],
      equipment: state.objects?.filter?.(obj => obj.type === 'equipment') || state.equipment || [],
      zones: state.objects?.filter?.(obj => obj.type === 'zone') || state.zones || [],
      calculations: state.calculations || {},
      metadata: {
        version: '1.0.0',
        tags: selectedTags,
        isPublic,
        thumbnail: generateThumbnail(),
      },
      settings: {
        selectedCrop: state.ui?.selectedCrop || state.selectedCrop,
        dliTarget: state.ui?.dliTarget || state.dliTarget,
        photoperiod: state.ui?.photoperiod || state.photoperiod,
      },
    };

    await saveToCloud(design);
  };

  // Generate thumbnail from current canvas
  const generateThumbnail = () => {
    // This would capture the canvas and create a base64 thumbnail
    // For now, returning placeholder
    return null;
  };

  // Load a saved design
  const handleLoadDesign = (design: any) => {
    if (onLoadDesign) {
      onLoadDesign(design);
    } else {
      // Default load behavior
      dispatch({ type: 'LOAD_PROJECT', payload: design });
    }
    toast.success(`Loaded: ${design.name}`);
    if (onClose) onClose();
  };

  // Delete a design
  const handleDeleteDesign = async (designId: string, designName: string) => {
    if (confirm(`Are you sure you want to delete "${designName}"?`)) {
      const success = await deleteFromCloud(designId);
      if (success) {
        toast.success('Design deleted');
      }
    }
  };

  // Duplicate a design
  const handleDuplicateDesign = async (design: any) => {
    const duplicated = {
      ...design,
      id: undefined,
      name: `${design.name} (Copy)`,
    };
    await saveToCloud(duplicated);
  };

  // Filter designs
  const filteredDesigns = savedDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          design.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || design.designType === filterType;
    return matchesSearch && matchesType;
  });

  // Listen for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleSaveShortcut = () => {
      if (currentDesignId || designName) {
        handleQuickSave();
      } else {
        setSaveDialogOpen(true);
      }
    };

    window.addEventListener('cloud-save-trigger', handleSaveShortcut);
    return () => window.removeEventListener('cloud-save-trigger', handleSaveShortcut);
  }, [currentDesignId, designName]);

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CloudOff className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">Sign in to use Cloud Save</h3>
            <p className="text-sm text-gray-600">
              Save your designs to the cloud and access them from any device
            </p>
            <Button className="w-full">
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Main Cloud Save Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleQuickSave}
          disabled={!canSave}
          variant={currentDesignId ? 'default' : 'outline'}
          size="sm"
        >
          {isSaving ? (
            <>
              <Cloud className="w-4 h-4 mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {currentDesignId ? 'Save' : 'Save to Cloud'}
            </>
          )}
        </Button>

        {lastSaved && (
          <span className="text-xs text-gray-500">
            Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </span>
        )}

        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <FolderOpen className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Cloud Designs</DialogTitle>
              <DialogDescription>
                Manage your saved designs in the cloud
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="my-designs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-designs">My Designs</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="shared">Shared with Me</TabsTrigger>
              </TabsList>

              <TabsContent value="my-designs" className="space-y-4">
                {/* Search and Filter Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search designs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilterType('all')}>
                        All Designs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('lighting')}>
                        Lighting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('hvac')}>
                        HVAC
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('integrated')}>
                        Integrated
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Designs Grid/List */}
                <div className="overflow-y-auto max-h-[400px]">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Cloud className="w-8 h-8 mx-auto animate-pulse text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Loading designs...</p>
                    </div>
                  ) : filteredDesigns.length === 0 ? (
                    <div className="text-center py-8">
                      <CloudOff className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">No designs found</p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-2 md:grid-cols-3 gap-4' 
                      : 'space-y-2'
                    }>
                      {filteredDesigns.map((design) => (
                        <Card 
                          key={design.id} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleLoadDesign(design)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm truncate">
                                  {design.name}
                                </h4>
                                {design.description && (
                                  <p className="text-xs text-gray-600 truncate">
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
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadDesign(design);
                                  }}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Load
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateDesign(design);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    // Share functionality
                                  }}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDesign(design.id, design.name);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(design.updatedAt), { addSuffix: true })}
                            </div>

                            <div className="flex gap-1 mt-2">
                              {design.isPublic && (
                                <Badge variant="secondary" className="text-xs">
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Public
                                </Badge>
                              )}
                              {design.metadata?.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="templates">
                <div className="text-center py-8">
                  <Star className="w-8 h-8 mx-auto text-yellow-500" />
                  <p className="mt-2 text-sm text-gray-600">
                    Browse community templates coming soon!
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="shared">
                <div className="text-center py-8">
                  <Share2 className="w-8 h-8 mx-auto text-blue-500" />
                  <p className="mt-2 text-sm text-gray-600">
                    Designs shared with you will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design to Cloud</DialogTitle>
            <DialogDescription>
              Give your design a name and description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="My Awesome Design"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={designDescription}
                onChange={(e) => setDesignDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="public" className="text-sm">
                Make this design public (others can view and use as template)
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickSave} disabled={!designName || isSaving}>
                {isSaving ? 'Saving...' : 'Save to Cloud'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}