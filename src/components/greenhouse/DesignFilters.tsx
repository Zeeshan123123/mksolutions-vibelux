'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';

interface Filters {
  status: string;
  search: string;
  structureType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface DesignFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'IN_CONSTRUCTION', label: 'In Construction' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' }
];

const STRUCTURE_OPTIONS = [
  { value: '', label: 'All Structures' },
  { value: 'GUTTER_CONNECTED', label: 'Gutter Connected' },
  { value: 'FREESTANDING', label: 'Freestanding' },
  { value: 'TUNNEL', label: 'Tunnel' },
  { value: 'LEAN_TO', label: 'Lean-To' },
  { value: 'RIDGE_FURROW', label: 'Ridge & Furrow' }
];

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'area', label: 'Area' },
  { value: 'status', label: 'Status' }
];

export function DesignFilters({ filters, onFiltersChange, onSearch }: DesignFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string | 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      search: '',
      structureType: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.search) count++;
    if (filters.structureType) count++;
    return count;
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search designs by name or description..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={onSearch} variant="outline">
          Search
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Structure Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Structure:</span>
          <Select
            value={filters.structureType}
            onValueChange={(value) => updateFilter('structureType', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRUCTURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3"
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {/* Active Filters Indicator */}
        {getActiveFilterCount() > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {(filters.status || filters.structureType || filters.search) && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilter('search', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => updateFilter('status', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.structureType && (
            <Badge variant="outline" className="flex items-center gap-1">
              Structure: {STRUCTURE_OPTIONS.find(s => s.value === filters.structureType)?.label}
              <button
                onClick={() => updateFilter('structureType', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Quick Filter Shortcuts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">Quick filters:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilter('status', 'DRAFT')}
          className="h-7 px-2 text-xs"
        >
          My Drafts
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilter('status', 'IN_REVIEW')}
          className="h-7 px-2 text-xs"
        >
          In Review
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilter('status', 'COMPLETED')}
          className="h-7 px-2 text-xs"
        >
          Completed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            updateFilter('sortBy', 'updatedAt');
            updateFilter('sortOrder', 'desc');
          }}
          className="h-7 px-2 text-xs"
        >
          Recently Updated
        </Button>
      </div>
    </div>
  );
}