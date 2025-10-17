import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing complex form state with filters and UI state
 * Reduces hook complexity in heavy components
 */
interface UseComplexFormStateOptions<T> {
  initialData?: T[];
  initialFilters?: Record<string, any>;
  searchFields?: (keyof T)[];
}

interface ComplexFormState<T> {
  // Data state
  data: T[];
  filteredData: T[];
  
  // Search and filters
  searchTerm: string;
  filters: Record<string, any>;
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedItems: string[];
  
  // View state
  viewMode: 'grid' | 'list';
  showFilters: boolean;
  activeTab: string;
  
  // Actions
  setData: (data: T[]) => void;
  setSearchTerm: (term: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setActiveTab: (tab: string) => void;
  toggleFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useComplexFormState<T extends { id: string }>({
  initialData = [],
  initialFilters = {},
  searchFields = []
}: UseComplexFormStateOptions<T> = {}): ComplexFormState<T> {
  // Core data state
  const [data, setData] = useState<T[]>(initialData);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  
  // UI state consolidated into single object
  const [uiState, setUiState] = useState({
    loading: false,
    error: null as string | null,
    selectedItems: [] as string[],
    viewMode: 'grid' as 'grid' | 'list',
    showFilters: false,
    activeTab: 'all'
  });
  
  // Memoized filtered data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply search
    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(term);
        })
      );
    }
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => {
          const itemValue = (item as any)[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });
    
    return result;
  }, [data, searchTerm, filters, searchFields]);
  
  // Optimized action creators
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
  }, [initialFilters]);
  
  const toggleSelection = useCallback((id: string) => {
    setUiState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(item => item !== id)
        : [...prev.selectedItems, id]
    }));
  }, []);
  
  const clearSelection = useCallback(() => {
    setUiState(prev => ({ ...prev, selectedItems: [] }));
  }, []);
  
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setUiState(prev => ({ ...prev, viewMode: mode }));
  }, []);
  
  const setActiveTab = useCallback((tab: string) => {
    setUiState(prev => ({ ...prev, activeTab: tab }));
  }, []);
  
  const toggleFilters = useCallback(() => {
    setUiState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    setUiState(prev => ({ ...prev, loading }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setUiState(prev => ({ ...prev, error }));
  }, []);
  
  return {
    // Data
    data,
    filteredData,
    
    // Search and filters
    searchTerm,
    filters,
    
    // UI state (destructured for easier access)
    loading: uiState.loading,
    error: uiState.error,
    selectedItems: uiState.selectedItems,
    viewMode: uiState.viewMode,
    showFilters: uiState.showFilters,
    activeTab: uiState.activeTab,
    
    // Actions
    setData,
    setSearchTerm,
    setFilter,
    clearFilters,
    toggleSelection,
    clearSelection,
    setViewMode,
    setActiveTab,
    toggleFilters,
    setLoading,
    setError,
  };
}