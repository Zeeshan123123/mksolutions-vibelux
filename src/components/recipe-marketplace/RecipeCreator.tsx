/**
 * Recipe Creator Component
 * Allows growers to save and share their proven recipes
 */

"use client"
import { useState } from 'react'
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { 
  Save, Upload, Plus, X, Info, Lightbulb, 
  TrendingUp, DollarSign, Shield, AlertTriangle,
  Zap, Leaf, FlaskConical, Package, Settings
} from 'lucide-react'

import { RECIPE_FEATURES } from '@/lib/recipe-marketplace/recipe-licensing'
import { recipeLicensingService } from '@/lib/recipe-marketplace/recipe-licensing'

interface RecipeCreatorProps {
  existingRecipeId?: string; // For editing existing recipe
  onSave?: (recipeId: string) => void;
}

export function RecipeCreator({ existingRecipeId, onSave }: RecipeCreatorProps) {
  const [activeTab, setActiveTab] = useState('basics')
  const [isSaving, setIsSaving] = useState(false)
  
  // Recipe basics
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [crop, setCrop] = useState('')
  const [strain, setStrain] = useState('')
  const [environmentTypes, setEnvironmentTypes] = useState<string[]>(['sole-source'])
  
  // Recipe settings
  const [lightingSchedule, setLightingSchedule] = useState({
    vegetative: { hours: 18, ppfd: 400, dli: 26 },
    flowering: { hours: 12, ppfd: 600, dli: 26 }
  })
  
  const [spectrum, setSpectrum] = useState({
    vegetative: { blue: 25, green: 15, red: 55, farRed: 5 },
    flowering: { blue: 15, green: 10, red: 65, farRed: 10 }
  })
  
  const [environmental, setEnvironmental] = useState({
    temperature: { day: 75, night: 65 },
    humidity: { vegetative: 65, flowering: 45 },
    co2: 1000
  })
  
  // Features & benefits
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [provenResults, setProvenResults] = useState<any[]>([])
  const [evidence, setEvidence] = useState<File[]>([])
  
  // Pricing model
  const [pricingModel, setPricingModel] = useState<'one-time' | 'subscription' | 'usage-based'>('usage-based')
  const [pricing, setPricing] = useState({
    oneTime: 999,
    monthly: 99,
    perCycle: 500,
    perSqFt: 0.50
  })
  
  // Terms
  const [restrictions, setRestrictions] = useState<string[]>(['Sole-source lighting only'])
  const [supportIncluded, setSupportIncluded] = useState(true)
  const [updateIncluded, setUpdateIncluded] = useState(true)
  
  // Add proven result
  const addProvenResult = () => {
    setProvenResults([...provenResults, {
      metric: '',
      baseline: 0,
      achieved: 0,
      improvement: 0,
      evidence: []
    }])
  }
  
  // Remove proven result
  const removeProvenResult = (index: number) => {
    setProvenResults(provenResults.filter((_, i) => i !== index))
  }
  
  // Update proven result
  const updateProvenResult = (index: number, field: string, value: any) => {
    const updated = [...provenResults]
    updated[index][field] = value
    
    // Calculate improvement
    if (field === 'baseline' || field === 'achieved') {
      const baseline = updated[index].baseline || 1
      const achieved = updated[index].achieved || 0
      updated[index].improvement = ((achieved - baseline) / baseline * 100).toFixed(1)
    }
    
    setProvenResults(updated)
  }
  
  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setEvidence([...evidence, ...Array.from(files)])
    }
  }
  
  // Toggle feature
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }
  
  // Toggle environment type
  const toggleEnvironmentType = (type: string) => {
    setEnvironmentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }
  
  // Validate recipe
  const validateRecipe = () => {
    if (!name || !description || !crop) {
      alert('Please fill in all required fields')
      return false
    }
    if (selectedFeatures.length === 0) {
      alert('Please select at least one feature/benefit')
      return false
    }
    if (provenResults.length === 0) {
      alert('Please add at least one proven result')
      return false
    }
    return true
  }
  
  // Save recipe
  const handleSave = async () => {
    if (!validateRecipe()) return
    
    setIsSaving(true)
    
    try {
      // Prepare pricing based on model
      const pricingData: any = {}
      switch (pricingModel) {
        case 'one-time':
          pricingData.oneTime = pricing.oneTime
          break
        case 'subscription':
          pricingData.monthly = pricing.monthly
          pricingData.yearly = pricing.monthly * 10 // 2 months free
          break
        case 'usage-based':
          pricingData.perCycle = pricing.perCycle
          pricingData.perSqFt = pricing.perSqFt
          break
      }
      
      // Create recipe
      const recipe = await recipeLicensingService.createLicensedRecipe(
        existingRecipeId || 'new-recipe',
        { id: 'current-user', name: 'Current Grower' },
        {
          name,
          description,
          crop,
          features: selectedFeatures,
          provenResults: provenResults.map(r => ({
            metric: r.metric,
            baseline: parseFloat(r.baseline),
            achieved: parseFloat(r.achieved),
            improvement: parseFloat(r.improvement),
            verificationSource: 'self-reported'
          })),
          pricing: { type: pricingModel, ...pricingData },
          termsOfUse: [
            supportIncluded && 'Creator support included',
            updateIncluded && 'Recipe updates included',
            'Performance tracking required',
            'Compliance monitoring enabled'
          ].filter(Boolean) as string[]
        }
      )
      
      // Upload evidence files
      if (evidence.length > 0) {
        // Would upload files and associate with recipe
        logger.info('system', 'Uploading evidence files...')
      }
      
      onSave?.(recipe.id)
    } catch (error) {
      logger.error('system', 'Failed to save recipe:', error )
      alert('Failed to save recipe. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Create Recipe Listing</h2>
          <p className="text-muted-foreground">
            Share your proven light recipe and earn royalties
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Recipe
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High-Yield Tomato Maximizer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what makes your recipe special and the results growers can expect..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crop">Crop Type *</Label>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger id="crop" className="mt-1">
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tomato">Tomato</SelectItem>
                      <SelectItem value="Lettuce">Lettuce</SelectItem>
                      <SelectItem value="Cannabis">Cannabis</SelectItem>
                      <SelectItem value="Strawberry">Strawberry</SelectItem>
                      <SelectItem value="Herbs">Herbs</SelectItem>
                      <SelectItem value="Peppers">Peppers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="strain">Variety/Strain</Label>
                  <Input
                    id="strain"
                    value={strain}
                    onChange={(e) => setStrain(e.target.value)}
                    placeholder="e.g., Beefsteak, Romaine"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Compatible Environment Types *</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sole-source"
                      checked={environmentTypes.includes('sole-source')}
                      onCheckedChange={() => toggleEnvironmentType('sole-source')}
                    />
                    <label htmlFor="sole-source" className="text-sm cursor-pointer">
                      Sole-source lighting (recommended)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supplemental"
                      checked={environmentTypes.includes('supplemental')}
                      onCheckedChange={() => toggleEnvironmentType('supplemental')}
                    />
                    <label htmlFor="supplemental" className="text-sm cursor-pointer">
                      Supplemental lighting
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="greenhouse"
                      checked={environmentTypes.includes('greenhouse')}
                      onCheckedChange={() => toggleEnvironmentType('greenhouse')}
                    />
                    <label htmlFor="greenhouse" className="text-sm cursor-pointer">
                      Greenhouse (results may vary)
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Light Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Vegetative Stage</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Photoperiod (hours)</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.vegetative.hours}
                      onChange={(e) => setLightingSchedule({
                        ...lightingSchedule,
                        vegetative: { ...lightingSchedule.vegetative, hours: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>PPFD (μmol/m²/s)</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.vegetative.ppfd}
                      onChange={(e) => setLightingSchedule({
                        ...lightingSchedule,
                        vegetative: { ...lightingSchedule.vegetative, ppfd: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Target DLI</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.vegetative.dli}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Spectrum (%)</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm">Blue</span>
                      <Slider
                        value={[spectrum.vegetative.blue]}
                        onValueChange={(v) => setSpectrum({
                          ...spectrum,
                          vegetative: { ...spectrum.vegetative, blue: v[0] }
                        })}
                        max={100}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-right">{spectrum.vegetative.blue}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm">Green</span>
                      <Slider
                        value={[spectrum.vegetative.green]}
                        onValueChange={(v) => setSpectrum({
                          ...spectrum,
                          vegetative: { ...spectrum.vegetative, green: v[0] }
                        })}
                        max={100}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-right">{spectrum.vegetative.green}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm">Red</span>
                      <Slider
                        value={[spectrum.vegetative.red]}
                        onValueChange={(v) => setSpectrum({
                          ...spectrum,
                          vegetative: { ...spectrum.vegetative, red: v[0] }
                        })}
                        max={100}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-right">{spectrum.vegetative.red}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm">Far Red</span>
                      <Slider
                        value={[spectrum.vegetative.farRed]}
                        onValueChange={(v) => setSpectrum({
                          ...spectrum,
                          vegetative: { ...spectrum.vegetative, farRed: v[0] }
                        })}
                        max={100}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-right">{spectrum.vegetative.farRed}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Flowering/Fruiting Stage</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Photoperiod (hours)</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.flowering.hours}
                      onChange={(e) => setLightingSchedule({
                        ...lightingSchedule,
                        flowering: { ...lightingSchedule.flowering, hours: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>PPFD (μmol/m²/s)</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.flowering.ppfd}
                      onChange={(e) => setLightingSchedule({
                        ...lightingSchedule,
                        flowering: { ...lightingSchedule.flowering, ppfd: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Target DLI</Label>
                    <Input
                      type="number"
                      value={lightingSchedule.flowering.dli}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Environmental Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Day Temperature (°F)</Label>
                  <Input
                    type="number"
                    value={environmental.temperature.day}
                    onChange={(e) => setEnvironmental({
                      ...environmental,
                      temperature: { ...environmental.temperature, day: parseInt(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Night Temperature (°F)</Label>
                  <Input
                    type="number"
                    value={environmental.temperature.night}
                    onChange={(e) => setEnvironmental({
                      ...environmental,
                      temperature: { ...environmental.temperature, night: parseInt(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vegetative RH (%)</Label>
                  <Input
                    type="number"
                    value={environmental.humidity.vegetative}
                    onChange={(e) => setEnvironmental({
                      ...environmental,
                      humidity: { ...environmental.humidity, vegetative: parseInt(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Flowering RH (%)</Label>
                  <Input
                    type="number"
                    value={environmental.humidity.flowering}
                    onChange={(e) => setEnvironmental({
                      ...environmental,
                      humidity: { ...environmental.humidity, flowering: parseInt(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>CO₂ Level (ppm)</Label>
                <Input
                  type="number"
                  value={environmental.co2}
                  onChange={(e) => setEnvironmental({
                    ...environmental,
                    co2: parseInt(e.target.value)
                  })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Features & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Features (choose all that apply) *</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {RECIPE_FEATURES.slice(0, 12).map(feature => (
                    <div
                      key={feature.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFeatures.includes(feature.id)
                          ? 'bg-purple-50 border-purple-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <Checkbox
                          checked={selectedFeatures.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {feature.category} • {feature.measurable ? 'Measurable' : 'Qualitative'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Proven Results *</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addProvenResult}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Result
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {provenResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Result #{index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProvenResult(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label>Metric</Label>
                          <Input
                            value={result.metric}
                            onChange={(e) => updateProvenResult(index, 'metric', e.target.value)}
                            placeholder="e.g., Yield"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Baseline</Label>
                          <Input
                            type="number"
                            value={result.baseline}
                            onChange={(e) => updateProvenResult(index, 'baseline', e.target.value)}
                            placeholder="40"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Achieved</Label>
                          <Input
                            type="number"
                            value={result.achieved}
                            onChange={(e) => updateProvenResult(index, 'achieved', e.target.value)}
                            placeholder="50"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Improvement</Label>
                          <Input
                            value={`${result.improvement}%`}
                            disabled
                            className="mt-1 bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {provenResults.length === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Add proven results to show the benefits of your recipe
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="evidence">Upload Evidence (optional)</Label>
                <div className="mt-2">
                  <Input
                    id="evidence"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.xlsx,.csv"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lab reports, photos, harvest data (max 10MB per file)
                  </p>
                </div>
                
                {evidence.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {evidence.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEvidence(evidence.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={pricingModel}
                onValueChange={(v) => setPricingModel(v as any)}
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="usage-based" id="usage-based" />
                    <label htmlFor="usage-based" className="flex-1 cursor-pointer">
                      <div className="font-medium">Usage-Based (Recommended)</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Charge per growth cycle or per square foot. Best for proven recipes.
                      </p>
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="one-time" id="pricing-one-time" />
                    <label htmlFor="pricing-one-time" className="flex-1 cursor-pointer">
                      <div className="font-medium">One-Time License</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Single payment for lifetime access. Good for simple recipes.
                      </p>
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="subscription" id="subscription-model" />
                    <label htmlFor="subscription-model" className="flex-1 cursor-pointer">
                      <div className="font-medium">Subscription</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Monthly recurring payment with ongoing support.
                      </p>
                    </label>
                  </div>
                </div>
              </RadioGroup>
              
              <Separator />
              
              {pricingModel === 'usage-based' && (
                <div className="space-y-4">
                  <div>
                    <Label>Per Cycle Fee ($)</Label>
                    <Input
                      type="number"
                      value={pricing.perCycle}
                      onChange={(e) => setPricing({ ...pricing, perCycle: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed fee per growth cycle regardless of size
                    </p>
                  </div>
                  
                  <div>
                    <Label>Per Square Foot Fee ($/sq ft/cycle)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.perSqFt}
                      onChange={(e) => setPricing({ ...pricing, perSqFt: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Scales with facility size, volume discounts available
                    </p>
                  </div>
                  
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-1">Example Revenue:</div>
                      <div className="text-sm space-y-1">
                        <p>• Small facility (1,000 sq ft): ${(pricing.perSqFt * 1000).toFixed(0)}/cycle</p>
                        <p>• Medium facility (5,000 sq ft): ${(pricing.perSqFt * 5000 * 0.9).toFixed(0)}/cycle (10% discount)</p>
                        <p>• Large facility (20,000 sq ft): ${(pricing.perSqFt * 20000 * 0.8).toFixed(0)}/cycle (20% discount)</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {pricingModel === 'one-time' && (
                <div>
                  <Label>One-Time License Fee ($)</Label>
                  <Input
                    type="number"
                    value={pricing.oneTime}
                    onChange={(e) => setPricing({ ...pricing, oneTime: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              )}
              
              {pricingModel === 'subscription' && (
                <div>
                  <Label>Monthly Subscription Fee ($)</Label>
                  <Input
                    type="number"
                    value={pricing.monthly}
                    onChange={(e) => setPricing({ ...pricing, monthly: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Annual plans will offer 2 months free
                  </p>
                </div>
              )}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  VibeLux charges a 15% platform fee on all transactions to cover payment processing,
                  verification, and support services.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>License Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Restrictions</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={restrictions.includes('Sole-source lighting only')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRestrictions([...restrictions, 'Sole-source lighting only'])
                        } else {
                          setRestrictions(restrictions.filter(r => r !== 'Sole-source lighting only'))
                        }
                      }}
                    />
                    <label className="text-sm cursor-pointer">
                      Sole-source lighting only (no natural light variation)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={restrictions.includes('Commercial use only')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRestrictions([...restrictions, 'Commercial use only'])
                        } else {
                          setRestrictions(restrictions.filter(r => r !== 'Commercial use only'))
                        }
                      }}
                    />
                    <label className="text-sm cursor-pointer">
                      Commercial use only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={restrictions.includes('No modifications allowed')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRestrictions([...restrictions, 'No modifications allowed'])
                        } else {
                          setRestrictions(restrictions.filter(r => r !== 'No modifications allowed'))
                        }
                      }}
                    />
                    <label className="text-sm cursor-pointer">
                      No modifications allowed
                    </label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>What's Included</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={supportIncluded}
                      onCheckedChange={(checked) => setSupportIncluded(checked as boolean)}
                    />
                    <label className="text-sm cursor-pointer">
                      Creator support for implementation (5 support tickets)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={updateIncluded}
                      onCheckedChange={(checked) => setUpdateIncluded(checked as boolean)}
                    />
                    <label className="text-sm cursor-pointer">
                      Recipe updates and improvements
                    </label>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Platform Requirements:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Performance tracking and reporting</li>
                    <li>• Compliance monitoring (recipe adherence)</li>
                    <li>• Anonymous aggregated data sharing</li>
                    <li>• Dispute resolution through VibeLux</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Preview Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Recipe Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{name || 'Recipe Name'}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {description || 'Recipe description will appear here...'}
              </p>
            </div>
            
            {selectedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.slice(0, 5).map(featureId => {
                  const feature = RECIPE_FEATURES.find(f => f.id === featureId)
                  return feature ? (
                    <Badge key={featureId} variant="secondary">
                      {feature.name}
                    </Badge>
                  ) : null
                })}
                {selectedFeatures.length > 5 && (
                  <Badge variant="outline">+{selectedFeatures.length - 5} more</Badge>
                )}
              </div>
            )}
            
            {provenResults.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-1">Proven Results:</p>
                <div className="space-y-1">
                  {provenResults.slice(0, 3).map((result, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      • {result.metric}: +{result.improvement}% improvement
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                <span className="font-medium">Pricing: </span>
                {pricingModel === 'usage-based' && `$${pricing.perSqFt}/sq ft/cycle`}
                {pricingModel === 'one-time' && `$${pricing.oneTime} one-time`}
                {pricingModel === 'subscription' && `$${pricing.monthly}/month`}
              </div>
              <div className="flex items-center gap-1">
                {environmentTypes.includes('sole-source') && (
                  <Badge className="text-xs">Sole-source</Badge>
                )}
                {supportIncluded && (
                  <Badge className="text-xs" variant="outline">
                    <Zap className="w-3 h-3 mr-1" />
                    Support
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}