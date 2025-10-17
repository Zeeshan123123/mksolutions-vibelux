import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

export interface CloudDesign {
  id?: string;
  name: string;
  description?: string;
  designType?: 'lighting' | 'hvac' | 'integrated' | 'cad';
  room: any;
  fixtures: any[];
  equipment?: any[];
  zones?: any[];
  calculations?: any;
  metadata?: {
    version?: string;
    tags?: string[];
    thumbnail?: string;
    isPublic?: boolean;
    isTemplate?: boolean;
  };
  settings?: any;
}

export interface UseCloudSaveOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  onSaveSuccess?: (design: any) => void;
  onSaveError?: (error: any) => void;
  onLoadSuccess?: (designs: any[]) => void;
  onLoadError?: (error: any) => void;
}

export function useCloudSave(options: UseCloudSaveOptions = {}) {
  const { isSignedIn } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);

  // Save design to cloud
  const saveToCloud = useCallback(async (design: CloudDesign) => {
    if (!isSignedIn) {
      toast.error('Please sign in to save designs to the cloud');
      return null;
    }

    setIsSaving(true);
    try {
      // Add current design ID if updating
      const designToSave = currentDesignId 
        ? { ...design, id: currentDesignId }
        : design;

      const response = await fetch('/api/designs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save design');
      }

      const result = await response.json();
      
      if (result.success) {
        setLastSaved(new Date());
        setCurrentDesignId(result.design.id);
        
        toast.success(result.message || 'Design saved to cloud!', {
          description: `${result.design.name} has been saved`,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to saved designs or show modal
              window.location.href = '/designs/my-designs';
            }
          }
        });

        if (options.onSaveSuccess) {
          options.onSaveSuccess(result.design);
        }

        // Update local saved designs list
        setSavedDesigns(prev => {
          const index = prev.findIndex(d => d.id === result.design.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = result.design;
            return updated;
          }
          return [result.design, ...prev];
        });

        return result.design;
      } else {
        throw new Error(result.error || 'Failed to save design');
      }
    } catch (error) {
      logger.error('cloud-save', 'Failed to save design', error);
      toast.error('Failed to save design to cloud', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      
      if (options.onSaveError) {
        options.onSaveError(error);
      }
      
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [isSignedIn, currentDesignId, options]);

  // Load designs from cloud
  const loadFromCloud = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    if (!isSignedIn) {
      toast.error('Please sign in to load cloud designs');
      return [];
    }

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/designs/save?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to load designs');
      }

      const result = await response.json();
      setSavedDesigns(result.designs || []);
      
      if (options.onLoadSuccess) {
        options.onLoadSuccess(result.designs || []);
      }

      return result;
    } catch (error) {
      logger.error('cloud-save', 'Failed to load designs', error);
      toast.error('Failed to load designs from cloud');
      
      if (options.onLoadError) {
        options.onLoadError(error);
      }
      
      return { designs: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, options]);

  // Delete design from cloud
  const deleteFromCloud = useCallback(async (designId: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to delete cloud designs');
      return false;
    }

    try {
      const response = await fetch(`/api/designs/save?id=${designId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete design');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Design deleted from cloud');
        setSavedDesigns(prev => prev.filter(d => d.id !== designId));
        
        if (currentDesignId === designId) {
          setCurrentDesignId(null);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('cloud-save', 'Failed to delete design', error);
      toast.error('Failed to delete design from cloud');
      return false;
    }
  }, [isSignedIn, currentDesignId]);

  // Auto-save functionality
  const setupAutoSave = useCallback((design: CloudDesign) => {
    if (!options.autoSave || !isSignedIn) return;

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      saveToCloud(design);
    }, options.autoSaveInterval || 30000); // Default 30 seconds

    setAutoSaveTimer(timer);
  }, [options.autoSave, options.autoSaveInterval, isSignedIn, autoSaveTimer, saveToCloud]);

  // Quick save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save through a custom event
        window.dispatchEvent(new CustomEvent('cloud-save-trigger'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Load user's designs on mount
  useEffect(() => {
    if (isSignedIn) {
      loadFromCloud();
    }
  }, [isSignedIn]);

  return {
    // State
    isSaving,
    isLoading,
    savedDesigns,
    lastSaved,
    currentDesignId,
    isSignedIn,
    
    // Actions
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    setupAutoSave,
    setCurrentDesignId,
    
    // Utils
    canSave: isSignedIn && !isSaving,
    hasUnsavedChanges: currentDesignId && !lastSaved,
  };
}