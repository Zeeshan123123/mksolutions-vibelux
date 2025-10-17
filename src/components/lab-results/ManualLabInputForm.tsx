'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  FlaskConical, 
  Leaf, 
  Droplets, 
  AlertTriangle,
  Bug,
  Apple,
  Save,
  Upload,
  Calendar
} from 'lucide-react';
import { LabTestResult } from '@/lib/lab-integration/lab-api-service';

interface ManualLabInputFormProps {
  onSubmit: (data: Partial<LabTestResult>) => Promise<void>;
  defaultValues?: Partial<LabTestResult>;
  cropType?: 'cannabis' | 'vegetables' | 'fruits' | 'herbs';
}

export function ManualLabInputForm({ 
  onSubmit, 
  defaultValues,
  cropType = 'cannabis' 
}: ManualLabInputFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LabTestResult>>(defaultValues || {
    sampleId: '',
    batchId: '',
    testDate: new Date(),
    labName: '',
    cannabinoids: {
      thc: 0,
      thca: 0,
      cbd: 0,
      cbda: 0,
      cbg: 0,
      cbga: 0,
      cbn: 0,
      cbc: 0,
      thcv: 0,
      totalCannabinoids: 0,
    },
    terpenes: {
      myrcene: 0,
      limonene: 0,
      pinene: 0,
      linalool: 0,
      caryophyllene: 0,
      humulene: 0,
      terpinolene: 0,
      ocimene: 0,
      bisabolol: 0,
      totalTerpenes: 0,
    },
    nutrients: {
      vitaminA: 0,
      vitaminC: 0,
      vitaminE: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
      magnesium: 0,
      protein: 0,
      carbohydrates: 0,
      fiber: 0,
    },
  });

  const handleInputChange = (category: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => {
      const updated = { ...prev };
      
      if (category === 'basic') {
        (updated as any)[field] = value;
      } else if (category === 'cannabinoids' || category === 'terpenes' || category === 'nutrients') {
        if (!updated[category]) {
          updated[category] = {} as any;
        }
        (updated[category] as any)[field] = numValue;
        
        // Auto-calculate totals
        if (category === 'cannabinoids' && field !== 'totalCannabinoids') {
          const cannabinoids = updated.cannabinoids!;
          cannabinoids.totalCannabinoids = 
            (cannabinoids.thc || 0) + (cannabinoids.thca || 0) * 0.877 +
            (cannabinoids.cbd || 0) + (cannabinoids.cbda || 0) * 0.877 +
            (cannabinoids.cbg || 0) + (cannabinoids.cbga || 0) * 0.878 +
            (cannabinoids.cbn || 0) + (cannabinoids.cbc || 0) + (cannabinoids.thcv || 0);
        }
        
        if (category === 'terpenes' && field !== 'totalTerpenes') {
          const terpenes = updated.terpenes!;
          terpenes.totalTerpenes = 
            (terpenes.myrcene || 0) + (terpenes.limonene || 0) +
            (terpenes.pinene || 0) + (terpenes.linalool || 0) +
            (terpenes.caryophyllene || 0) + (terpenes.humulene || 0) +
            (terpenes.terpinolene || 0) + (terpenes.ocimene || 0) +
            (terpenes.bisabolol || 0);
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sampleId || !formData.batchId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide Sample ID and Batch ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      toast({
        title: 'Success',
        description: 'Lab results saved successfully',
      });
      
      // Reset form
      setFormData({
        sampleId: '',
        batchId: '',
        testDate: new Date(),
        labName: '',
        cannabinoids: {
          thc: 0, thca: 0, cbd: 0, cbda: 0, cbg: 0,
          cbga: 0, cbn: 0, cbc: 0, thcv: 0, totalCannabinoids: 0,
        },
        terpenes: {
          myrcene: 0, limonene: 0, pinene: 0, linalool: 0,
          caryophyllene: 0, humulene: 0, terpinolene: 0,
          ocimene: 0, bisabolol: 0, totalTerpenes: 0,
        },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lab results',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Manual Lab Result Entry
        </CardTitle>
        <CardDescription>
          Enter laboratory test results manually when API integration is not available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sampleId">Sample ID *</Label>
              <Input
                id="sampleId"
                value={formData.sampleId || ''}
                onChange={(e) => handleInputChange('basic', 'sampleId', e.target.value)}
                placeholder="e.g., S-2024-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <Input
                id="batchId"
                value={formData.batchId || ''}
                onChange={(e) => handleInputChange('basic', 'batchId', e.target.value)}
                placeholder="e.g., B-2024-050"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="labName">Lab Name</Label>
              <Input
                id="labName"
                value={formData.labName || ''}
                onChange={(e) => handleInputChange('basic', 'labName', e.target.value)}
                placeholder="e.g., SC Labs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testDate">Test Date</Label>
              <Input
                id="testDate"
                type="date"
                value={formData.testDate ? new Date(formData.testDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('basic', 'testDate', e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue={cropType === 'cannabis' ? 'cannabinoids' : 'nutrients'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {cropType === 'cannabis' && (
                <>
                  <TabsTrigger value="cannabinoids">
                    <Leaf className="h-4 w-4 mr-2" />
                    Cannabinoids
                  </TabsTrigger>
                  <TabsTrigger value="terpenes">
                    <Droplets className="h-4 w-4 mr-2" />
                    Terpenes
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="nutrients">
                <Apple className="h-4 w-4 mr-2" />
                Nutrients
              </TabsTrigger>
            </TabsList>

            {/* Cannabinoids Tab */}
            {cropType === 'cannabis' && (
              <TabsContent value="cannabinoids" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thc">THC (%)</Label>
                    <Input
                      id="thc"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.thc || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'thc', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thca">THCA (%)</Label>
                    <Input
                      id="thca"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.thca || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'thca', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cbd">CBD (%)</Label>
                    <Input
                      id="cbd"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.cbd || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'cbd', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cbda">CBDA (%)</Label>
                    <Input
                      id="cbda"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.cbda || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'cbda', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cbg">CBG (%)</Label>
                    <Input
                      id="cbg"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.cbg || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'cbg', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cbn">CBN (%)</Label>
                    <Input
                      id="cbn"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cannabinoids?.cbn || 0}
                      onChange={(e) => handleInputChange('cannabinoids', 'cbn', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Cannabinoids:</span>
                    <span className="text-lg font-bold">
                      {formData.cannabinoids?.totalCannabinoids?.toFixed(2) || 0}%
                    </span>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Terpenes Tab */}
            {cropType === 'cannabis' && (
              <TabsContent value="terpenes" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="myrcene">Myrcene (%)</Label>
                    <Input
                      id="myrcene"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.myrcene || 0}
                      onChange={(e) => handleInputChange('terpenes', 'myrcene', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="limonene">Limonene (%)</Label>
                    <Input
                      id="limonene"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.limonene || 0}
                      onChange={(e) => handleInputChange('terpenes', 'limonene', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pinene">Pinene (%)</Label>
                    <Input
                      id="pinene"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.pinene || 0}
                      onChange={(e) => handleInputChange('terpenes', 'pinene', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linalool">Linalool (%)</Label>
                    <Input
                      id="linalool"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.linalool || 0}
                      onChange={(e) => handleInputChange('terpenes', 'linalool', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="caryophyllene">β-Caryophyllene (%)</Label>
                    <Input
                      id="caryophyllene"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.caryophyllene || 0}
                      onChange={(e) => handleInputChange('terpenes', 'caryophyllene', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="humulene">Humulene (%)</Label>
                    <Input
                      id="humulene"
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={formData.terpenes?.humulene || 0}
                      onChange={(e) => handleInputChange('terpenes', 'humulene', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Terpenes:</span>
                    <span className="text-lg font-bold">
                      {formData.terpenes?.totalTerpenes?.toFixed(3) || 0}%
                    </span>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Nutrients Tab (for vegetables/fruits) */}
            <TabsContent value="nutrients" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vitaminA">Vitamin A (IU)</Label>
                  <Input
                    id="vitaminA"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nutrients?.vitaminA || 0}
                    onChange={(e) => handleInputChange('nutrients', 'vitaminA', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                  <Input
                    id="vitaminC"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nutrients?.vitaminC || 0}
                    onChange={(e) => handleInputChange('nutrients', 'vitaminC', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vitaminE">Vitamin E (mg)</Label>
                  <Input
                    id="vitaminE"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.nutrients?.vitaminE || 0}
                    onChange={(e) => handleInputChange('nutrients', 'vitaminE', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calcium">Calcium (mg)</Label>
                  <Input
                    id="calcium"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nutrients?.calcium || 0}
                    onChange={(e) => handleInputChange('nutrients', 'calcium', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iron">Iron (mg)</Label>
                  <Input
                    id="iron"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.nutrients?.iron || 0}
                    onChange={(e) => handleInputChange('nutrients', 'iron', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="potassium">Potassium (mg)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nutrients?.potassium || 0}
                    onChange={(e) => handleInputChange('nutrients', 'potassium', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.nutrients?.protein || 0}
                    onChange={(e) => handleInputChange('nutrients', 'protein', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carbohydrates">Carbohydrates (g)</Label>
                  <Input
                    id="carbohydrates"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nutrients?.carbohydrates || 0}
                    onChange={(e) => handleInputChange('nutrients', 'carbohydrates', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.nutrients?.fiber || 0}
                    onChange={(e) => handleInputChange('nutrients', 'fiber', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Lab Results
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}