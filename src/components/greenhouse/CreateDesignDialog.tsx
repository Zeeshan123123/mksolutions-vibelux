'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calculator, Building, Ruler } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Facility {
  id: string;
  name: string;
  type: string;
}

interface CreateDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDesignCreated: (design: any) => void;
  facilityId?: string;
}

const STRUCTURE_TYPES = [
  { value: 'GUTTER_CONNECTED', label: 'Gutter Connected', description: 'Multiple spans connected by gutters' },
  { value: 'FREESTANDING', label: 'Freestanding', description: 'Single independent structure' },
  { value: 'TUNNEL', label: 'Tunnel', description: 'Semi-circular tunnel design' },
  { value: 'LEAN_TO', label: 'Lean-To', description: 'Single slope against existing structure' },
  { value: 'RIDGE_FURROW', label: 'Ridge & Furrow', description: 'Multiple ridges with connecting valleys' }
];

const GLAZING_TYPES = [
  { value: 'GLASS', label: 'Glass', description: 'Traditional greenhouse glass' },
  { value: 'POLYCARBONATE', label: 'Polycarbonate', description: 'Durable plastic panels' },
  { value: 'POLYETHYLENE', label: 'Polyethylene', description: 'Flexible plastic film' },
  { value: 'ACRYLIC', label: 'Acrylic', description: 'Clear acrylic panels' }
];

const FRAME_TYPES = [
  { value: 'STEEL', label: 'Steel', description: 'Galvanized steel frame' },
  { value: 'ALUMINUM', label: 'Aluminum', description: 'Lightweight aluminum frame' },
  { value: 'WOOD', label: 'Wood', description: 'Traditional wooden frame' },
  { value: 'COMPOSITE', label: 'Composite', description: 'Mixed material frame' }
];

const ROOF_TYPES = [
  { value: 'GABLE', label: 'Gable', description: 'Traditional peaked roof' },
  { value: 'GOTHIC', label: 'Gothic', description: 'Curved arch design' },
  { value: 'BARREL_VAULT', label: 'Barrel Vault', description: 'Continuous curved roof' },
  { value: 'SAWTOOTH', label: 'Sawtooth', description: 'Angled sections for ventilation' },
  { value: 'FLAT', label: 'Flat', description: 'Flat or low-slope roof' }
];

export function CreateDesignDialog({
  open,
  onOpenChange,
  onDesignCreated,
  facilityId
}: CreateDesignDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facilityId: facilityId || '',
    width: '',
    length: '',
    height: '',
    sideHeight: '',
    structureType: '',
    glazingType: '',
    frameType: '',
    roofType: '',
    designData: {}
  });

  const [calculatedValues, setCalculatedValues] = useState({
    area: 0,
    volume: 0,
    perimeter: 0,
    glazingArea: 0
  });

  useEffect(() => {
    if (open && !facilityId) {
      fetchFacilities();
    }
  }, [open, facilityId]);

  useEffect(() => {
    calculateValues();
  }, [formData.width, formData.length, formData.height, formData.sideHeight]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      }
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  const calculateValues = () => {
    const width = parseFloat(formData.width) || 0;
    const length = parseFloat(formData.length) || 0;
    const height = parseFloat(formData.height) || 0;
    const sideHeight = parseFloat(formData.sideHeight) || height * 0.6;

    if (width > 0 && length > 0 && height > 0) {
      const area = width * length;
      const volume = area * ((sideHeight + height) / 2);
      const perimeter = 2 * (width + length);
      
      // Estimate glazing area (simplified calculation)
      const roofArea = length * Math.sqrt(Math.pow(width/2, 2) + Math.pow(height - sideHeight, 2)) * 2;
      const wallArea = 2 * (length * sideHeight + width * sideHeight);
      const glazingArea = roofArea + wallArea;

      setCalculatedValues({
        area: Math.round(area * 100) / 100,
        volume: Math.round(volume * 100) / 100,
        perimeter: Math.round(perimeter * 100) / 100,
        glazingArea: Math.round(glazingArea * 100) / 100
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.facilityId;
      case 2:
        return formData.width && formData.length && formData.height && 
               parseFloat(formData.width) > 0 && parseFloat(formData.length) > 0 && parseFloat(formData.height) > 0;
      case 3:
        return formData.structureType && formData.glazingType && formData.frameType && formData.roofType;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        width: parseFloat(formData.width),
        length: parseFloat(formData.length),
        height: parseFloat(formData.height),
        sideHeight: formData.sideHeight ? parseFloat(formData.sideHeight) : undefined,
        designData: {
          calculatedValues,
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create design');
      }

      const newDesign = await response.json();
      onDesignCreated(newDesign);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        facilityId: facilityId || '',
        width: '',
        length: '',
        height: '',
        sideHeight: '',
        structureType: '',
        glazingType: '',
        frameType: '',
        roofType: '',
        designData: {}
      });
      setCurrentStep(1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Design Name *</Label>
              <Input
                id="name"
                placeholder="Enter design name..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your greenhouse design..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {!facilityId && (
              <div className="space-y-2">
                <Label htmlFor="facility">Facility *</Label>
                <Select
                  value={formData.facilityId}
                  onValueChange={(value) => handleInputChange('facilityId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name} ({facility.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (m) *</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="10.0"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (m) *</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="20.0"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Peak Height (m) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="4.0"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sideHeight">Side Height (m)</Label>
                <Input
                  id="sideHeight"
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="2.5"
                  value={formData.sideHeight}
                  onChange={(e) => handleInputChange('sideHeight', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to auto-calculate (60% of peak height)
                </p>
              </div>
            </div>

            {calculatedValues.area > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculated Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Area:</span>
                    <span className="font-medium">{calculatedValues.area} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{calculatedValues.volume} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perimeter:</span>
                    <span className="font-medium">{calculatedValues.perimeter} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Glazing:</span>
                    <span className="font-medium">{calculatedValues.glazingArea} m²</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Structure Type *</Label>
              <div className="grid grid-cols-1 gap-2">
                {STRUCTURE_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.structureType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('structureType', type.value)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                      {formData.structureType === type.value && (
                        <Badge className="bg-green-100 text-green-800">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Glazing Material *</Label>
                <Select
                  value={formData.glazingType}
                  onValueChange={(value) => handleInputChange('glazingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select glazing" />
                  </SelectTrigger>
                  <SelectContent>
                    {GLAZING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frame Material *</Label>
                <Select
                  value={formData.frameType}
                  onValueChange={(value) => handleInputChange('frameType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frame" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAME_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Roof Design *</Label>
                <Select
                  value={formData.roofType}
                  onValueChange={(value) => handleInputChange('roofType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roof" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOF_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Greenhouse Design</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Dimensions' :
              'Structure Configuration'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !validateStep(3)}>
                {loading ? 'Creating...' : 'Create Design'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}