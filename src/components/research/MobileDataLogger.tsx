'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Save, 
  Wifi, 
  WifiOff, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Eye,
  Ruler,
  Hash,
  Calendar,
  User,
  FileText,
  X
} from 'lucide-react';

interface DataEntry {
  id?: string;
  experimentId: string;
  treatmentId?: string;
  blockId?: string;
  replication: number;
  measurements: Record<string, any>;
  notes?: string;
  photoUrl?: string;
  enteredBy: string;
  enteredAt: Date;
  isOffline: boolean;
  syncedAt?: Date;
  position?: { x: number; y: number };
  gpsCoordinates?: { lat: number; lng: number };
}

interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'range' | 'pattern';
  min?: number;
  max?: number;
  pattern?: string;
  message: string;
}

interface MobileDataLoggerProps {
  experimentId: string;
  treatments: { id: string; name: string }[];
  blocks?: { id: string; name: string }[];
  measurementFields: {
    name: string;
    type: 'number' | 'text' | 'select' | 'boolean';
    label: string;
    required?: boolean;
    options?: string[];
    unit?: string;
    min?: number;
    max?: number;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  validationRules?: ValidationRule[];
  onDataSaved?: (entry: DataEntry) => void;
  offline?: boolean;
}

export default function MobileDataLogger({
  experimentId,
  treatments,
  blocks,
  measurementFields,
  validationRules = [],
  onDataSaved,
  offline = false,
}: MobileDataLoggerProps) {
  const [isOnline, setIsOnline] = useState(!offline);
  const [currentEntry, setCurrentEntry] = useState<Partial<DataEntry>>({
    experimentId,
    measurements: {},
    replication: 1,
    isOffline: !isOnline,
  });
  const [offlineEntries, setOfflineEntries] = useState<DataEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline entries from IndexedDB
  useEffect(() => {
    loadOfflineEntries();
  }, []);

  // Get GPS location if enabled
  useEffect(() => {
    if (gpsEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          logger.error('system', 'GPS error:', error );
        }
      );
    }
  }, [gpsEnabled]);

  const loadOfflineEntries = async () => {
    try {
      const entries = await getOfflineEntries();
      setOfflineEntries(entries);
    } catch (error) {
      logger.error('system', 'Failed to load offline entries:', error );
    }
  };

  const validateEntry = (entry: Partial<DataEntry>): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!entry.treatmentId) {
      newErrors.treatmentId = 'Treatment is required';
    }

    if (!entry.replication || entry.replication < 1) {
      newErrors.replication = 'Replication must be at least 1';
    }

    // Measurement field validation
    measurementFields.forEach(field => {
      const value = entry.measurements?.[field.name];
      
      if (field.required && (value === undefined || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === 'number' && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a number`;
        } else {
          if (field.min !== undefined && numValue < field.min) {
            newErrors[field.name] = `${field.label} must be at least ${field.min}`;
          }
          if (field.max !== undefined && numValue > field.max) {
            newErrors[field.name] = `${field.label} must be at most ${field.max}`;
          }
        }
      }
    });

    // Custom validation rules
    validationRules.forEach(rule => {
      const value = entry.measurements?.[rule.field];
      
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === '') {
            newErrors[rule.field] = rule.message;
          }
          break;
        case 'numeric':
          if (value && isNaN(Number(value))) {
            newErrors[rule.field] = rule.message;
          }
          break;
        case 'range':
          if (value) {
            const num = Number(value);
            if (rule.min !== undefined && num < rule.min) {
              newErrors[rule.field] = rule.message;
            }
            if (rule.max !== undefined && num > rule.max) {
              newErrors[rule.field] = rule.message;
            }
          }
          break;
        case 'pattern':
          if (value && rule.pattern && !new RegExp(rule.pattern).test(value)) {
            newErrors[rule.field] = rule.message;
          }
          break;
      }
    });

    return newErrors;
  };

  const handleSave = async () => {
    const entry = {
      ...currentEntry,
      enteredAt: new Date(),
      enteredBy: 'current-user', // Replace with actual user ID
      gpsCoordinates: currentLocation,
    } as DataEntry;

    const validationErrors = validateEntry(entry);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Upload photo if present
      if (photo) {
        const photoUrl = await uploadPhoto(photo);
        entry.photoUrl = photoUrl;
      }

      if (isOnline) {
        // Save to server
        await saveToServer(entry);
      } else {
        // Save offline
        await saveOfflineEntry(entry);
        setOfflineEntries(prev => [...prev, entry]);
      }

      // Reset form
      setCurrentEntry({
        experimentId,
        measurements: {},
        replication: 1,
        isOffline: !isOnline,
      });
      setPhoto(null);
      setPhotoPreview(null);

      onDataSaved?.(entry);
    } catch (error) {
      logger.error('system', 'Save error:', error );
      setErrors({ general: 'Failed to save data' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline || offlineEntries.length === 0) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/research/data-entry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: offlineEntries }),
      });

      if (response.ok) {
        await clearOfflineEntries();
        setOfflineEntries([]);
      }
    } catch (error) {
      logger.error('system', 'Sync error:', error );
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderMeasurementField = (field: typeof measurementFields[0]) => {
    const Icon = field.icon || Hash;
    const value = currentEntry.measurements?.[field.name] || '';
    const error = errors[field.name];

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {field.unit && <span className="text-gray-500">({field.unit})</span>}
        </Label>
        
        {field.type === 'number' && (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => setCurrentEntry(prev => ({
              ...prev,
              measurements: {
                ...prev.measurements,
                [field.name]: e.target.value,
              },
            }))}
            min={field.min}
            max={field.max}
            className={error ? 'border-red-500' : ''}
          />
        )}
        
        {field.type === 'text' && (
          <Input
            id={field.name}
            type="text"
            value={value}
            onChange={(e) => setCurrentEntry(prev => ({
              ...prev,
              measurements: {
                ...prev.measurements,
                [field.name]: e.target.value,
              },
            }))}
            className={error ? 'border-red-500' : ''}
          />
        )}
        
        {field.type === 'select' && (
          <select
            id={field.name}
            value={value}
            onChange={(e) => setCurrentEntry(prev => ({
              ...prev,
              measurements: {
                ...prev.measurements,
                [field.name]: e.target.value,
              },
            }))}
            className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors ${error ? 'border-red-500' : ''}`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
        
        {field.type === 'boolean' && (
          <div className="flex items-center space-x-2">
            <input
              id={field.name}
              type="checkbox"
              checked={value === true}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                measurements: {
                  ...prev.measurements,
                  [field.name]: e.target.checked,
                },
              }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor={field.name} className="text-sm">
              {field.label}
            </Label>
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {offlineEntries.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {offlineEntries.length} offline entries
          </Badge>
        )}
      </div>

      {/* Sync Button */}
      {isOnline && offlineEntries.length > 0 && (
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full"
          variant="outline"
        >
          {isSyncing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Syncing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Sync {offlineEntries.length} entries
            </div>
          )}
        </Button>
      )}

      {/* Main Form */}
      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Data Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Treatment Selection */}
              <div className="space-y-2">
                <Label htmlFor="treatment">
                  Treatment <span className="text-red-500">*</span>
                </Label>
                <select
                  id="treatment"
                  value={currentEntry.treatmentId || ''}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    treatmentId: e.target.value,
                  }))}
                  className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors ${errors.treatmentId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Treatment</option>
                  {treatments.map(treatment => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </option>
                  ))}
                </select>
                {errors.treatmentId && (
                  <p className="text-sm text-red-500">{errors.treatmentId}</p>
                )}
              </div>

              {/* Block Selection */}
              {blocks && blocks.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="block">Block</Label>
                  <select
                    id="block"
                    value={currentEntry.blockId || ''}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      blockId: e.target.value,
                    }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="">Select Block</option>
                    {blocks.map(block => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Replication */}
              <div className="space-y-2">
                <Label htmlFor="replication">
                  Replication <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="replication"
                  type="number"
                  min="1"
                  value={currentEntry.replication || ''}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    replication: parseInt(e.target.value) || 1,
                  }))}
                  className={errors.replication ? 'border-red-500' : ''}
                />
                {errors.replication && (
                  <p className="text-sm text-red-500">{errors.replication}</p>
                )}
              </div>

              {/* Measurement Fields */}
              {measurementFields.map(renderMeasurementField)}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={currentEntry.notes || ''}
                  onChange={(e) => setCurrentEntry(prev => ({
                    ...prev,
                    notes: e.target.value,
                  }))}
                  placeholder="Any additional observations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="photo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photo Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No photo captured</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => document.getElementById('photo-input')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {photoPreview ? 'Retake' : 'Take Photo'}
                </Button>
                
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gps-toggle">Enable GPS</Label>
                <input
                  id="gps-toggle"
                  type="checkbox"
                  checked={gpsEnabled}
                  onChange={(e) => setGpsEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>
              
              {gpsEnabled && currentLocation && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Location captured</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Lat: {currentLocation.lat.toFixed(6)}, 
                    Lng: {currentLocation.lng.toFixed(6)}
                  </div>
                </div>
              )}
              
              {gpsEnabled && !currentLocation && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Getting location...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Messages */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Saving...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Entry
          </div>
        )}
      </Button>
    </div>
  );
}

// IndexedDB utilities for offline storage
async function getOfflineEntries(): Promise<DataEntry[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ResearchDataLogger', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['entries'], 'readonly');
      const store = transaction.objectStore('entries');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
        store.createIndex('experimentId', 'experimentId', { unique: false });
        store.createIndex('enteredAt', 'enteredAt', { unique: false });
      }
    };
  });
}

async function saveOfflineEntry(entry: DataEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ResearchDataLogger', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['entries'], 'readwrite');
      const store = transaction.objectStore('entries');
      const addRequest = store.add(entry);
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
}

async function clearOfflineEntries(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ResearchDataLogger', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['entries'], 'readwrite');
      const store = transaction.objectStore('entries');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

async function saveToServer(entry: DataEntry): Promise<void> {
  const response = await fetch('/api/research/data-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save to server');
  }
}

async function uploadPhoto(photo: File): Promise<string> {
  // In production, upload to your file storage service
  // For now, return a placeholder URL
  return `https://example.com/photos/${Date.now()}-${photo.name}`;
}