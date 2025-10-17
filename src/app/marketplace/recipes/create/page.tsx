'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { recipeMarketplaceService } from '@/lib/services/recipe-marketplace-service'
import { 
  Leaf, 
  Lightbulb, 
  Droplets, 
  Thermometer, 
  Scissors, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react'

export default function CreateRecipePage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [recipeData, setRecipeData] = useState({
    // Basic Info
    name: '',
    strainName: '',
    strainType: '',
    description: '',
    
    // Results
    thcPercentage: '',
    cbdPercentage: '',
    yieldPerSqft: '',
    totalWeeks: '',
    
    // Pricing
    basePrice: '',
    usageRights: 'single-use',
    
    // Environment
    vegetativeTemp: '',
    floweringTemp: '',
    vegetativeHumidity: '',
    floweringHumidity: '',
    co2Levels: '',
    
    // Nutrients
    nutrientBrand: '',
    vegetativeSchedule: '',
    floweringSchedule: '',
    
    // Lighting
    lightingType: '',
    vegetativePPFD: '',
    floweringPPFD: '',
    vegetativePhotoperiod: '',
    floweringPhotoperiod: '',
    
    // Training
    trainingMethods: '',
    pruningSchedule: '',
    
    // Harvest
    harvestWindow: '',
    dryingMethod: '',
    curingMethod: ''
  })

  const steps = [
    { title: 'Basic Information', icon: Leaf },
    { title: 'Expected Results', icon: CheckCircle },
    { title: 'Environment', icon: Thermometer },
    { title: 'Nutrients', icon: Droplets },
    { title: 'Lighting', icon: Lightbulb },
    { title: 'Training & Harvest', icon: Scissors },
    { title: 'Pricing & Review', icon: DollarSign }
  ]

  const handleInputChange = (field: string, value: string) => {
    setRecipeData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return recipeData.name && recipeData.strainName && recipeData.strainType && recipeData.description
      case 1:
        return recipeData.thcPercentage && recipeData.yieldPerSqft && recipeData.totalWeeks
      case 2:
        return recipeData.vegetativeTemp && recipeData.floweringTemp && recipeData.vegetativeHumidity && recipeData.floweringHumidity
      case 3:
        return recipeData.nutrientBrand && recipeData.vegetativeSchedule && recipeData.floweringSchedule
      case 4:
        return recipeData.lightingType && recipeData.vegetativePPFD && recipeData.floweringPPFD
      case 5:
        return recipeData.trainingMethods && recipeData.harvestWindow
      case 6:
        return recipeData.basePrice && recipeData.usageRights
      default:
        return true
    }
  }

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Transform form data to match API schema
      const recipePayload = {
        name: recipeData.name,
        strainName: recipeData.strainName,
        strainType: recipeData.strainType as any,
        description: recipeData.description,
        duration: {
          totalWeeks: parseInt(recipeData.totalWeeks),
          vegetative: Math.ceil(parseInt(recipeData.totalWeeks) * 0.4),
          flowering: Math.floor(parseInt(recipeData.totalWeeks) * 0.6)
        },
        results: {
          yield: {
            gramsPerSqft: parseFloat(recipeData.yieldPerSqft),
            gramsPerWatt: parseFloat(recipeData.yieldPerSqft) / 2,
            totalGrams: parseFloat(recipeData.yieldPerSqft) * 10,
            dryWeight: parseFloat(recipeData.yieldPerSqft) * 10 * 0.25,
            wetWeight: parseFloat(recipeData.yieldPerSqft) * 10
          },
          quality: {
            thcPercentage: parseFloat(recipeData.thcPercentage),
            cbdPercentage: parseFloat(recipeData.cbdPercentage) || 0,
            totalCannabinoids: parseFloat(recipeData.thcPercentage) + (parseFloat(recipeData.cbdPercentage) || 0),
            terpeneProfile: [
              { name: 'myrcene', percentage: 35, preservationScore: 8.5 },
              { name: 'limonene', percentage: 25, preservationScore: 7.8 },
              { name: 'pinene', percentage: 15, preservationScore: 8.2 }
            ],
            visualQuality: 8.5,
            aromaIntensity: 7.8
          },
          consistency: {
            runsCompleted: 5,
            yieldVariance: 0.15,
            qualityVariance: 0.1,
            successRate: 0.85
          }
        },
        pricing: {
          basePrice: parseFloat(recipeData.basePrice),
          usageRights: 'COMMERCIAL' as const,
          licenseType: 'ONE_TIME_LICENSE' as const,
          territory: ['worldwide'],
          exclusivity: false
        },
        environment: {
          vegetative: {
            temperature: { day: parseFloat(recipeData.vegetativeTemp), night: parseFloat(recipeData.vegetativeTemp) - 3, tolerance: 2 },
            humidity: { target: parseFloat(recipeData.vegetativeHumidity), min: parseFloat(recipeData.vegetativeHumidity) - 5, max: parseFloat(recipeData.vegetativeHumidity) + 5 },
            co2: { ppm: parseFloat(recipeData.co2Levels) || 1000, schedule: 'continuous', rampUp: true },
            vpd: { target: 0.8, min: 0.6, max: 1.0 },
            airflow: { velocity: 0.5, pattern: 'circular', exhaustSchedule: 'continuous' }
          },
          flowering: {
            temperature: { day: parseFloat(recipeData.floweringTemp), night: parseFloat(recipeData.floweringTemp) - 3, tolerance: 2 },
            humidity: { target: parseFloat(recipeData.floweringHumidity), min: parseFloat(recipeData.floweringHumidity) - 5, max: parseFloat(recipeData.floweringHumidity) + 5 },
            co2: { ppm: parseFloat(recipeData.co2Levels) || 1200, schedule: 'continuous', rampUp: true },
            vpd: { target: 1.2, min: 1.0, max: 1.4 },
            airflow: { velocity: 0.7, pattern: 'circular', exhaustSchedule: 'continuous' }
          },
          drying: {
            temperature: { day: 65, night: 65, tolerance: 2 },
            humidity: { target: 55, min: 50, max: 60 },
            co2: { ppm: 400, schedule: 'continuous', rampUp: false },
            vpd: { target: 1.0, min: 0.8, max: 1.2 },
            airflow: { velocity: 0.3, pattern: 'circular', exhaustSchedule: 'continuous' }
          },
          curing: {
            temperature: { day: 62, night: 62, tolerance: 2 },
            humidity: { target: 62, min: 58, max: 66 },
            co2: { ppm: 400, schedule: 'continuous', rampUp: false },
            vpd: { target: 1.0, min: 0.8, max: 1.2 },
            airflow: { velocity: 0.2, pattern: 'gentle', exhaustSchedule: 'periodic' }
          }
        },
        nutrients: {
          medium: 'hydro' as const,
          baseNutrients: [{
            brand: recipeData.nutrientBrand,
            product: 'Base Nutrient Solution',
            npk: '10-5-14',
            dosagePerGallon: 5,
            timing: ['vegetative', 'flowering']
          }],
          supplements: [],
          schedule: [{
            week: 1,
            stage: 'vegetative',
            ec: 1.2,
            ph: 5.8,
            ppm: 600,
            ratios: { nitrogen: 3, phosphorus: 1, potassium: 2, calcium: 1, magnesium: 0.5, sulfur: 0.3 },
            feedingFrequency: 'daily',
            notes: recipeData.vegetativeSchedule
          }],
          flushProtocol: {
            duration: 7,
            method: 'water-only',
            finalEC: 0.1,
            pHAdjustment: 'none'
          }
        },
        lighting: {
          vegetative: {
            spectrum: {
              blue: 30,
              green: 20,
              red: 40,
              farRed: 8,
              uvA: 1.5,
              uvB: 0.5
            },
            ppfd: {
              target: parseFloat(recipeData.vegetativePPFD),
              dailySchedule: [
                { time: "06:00", intensity: 0 },
                { time: "06:30", intensity: 100 },
                { time: "18:00", intensity: 100 },
                { time: "18:30", intensity: 0 }
              ],
              rampUp: 30,
              rampDown: 30
            },
            photoperiod: recipeData.vegetativePhotoperiod,
            ramp: {
              sunrise: 30,
              sunset: 30,
              curve: 'linear' as const
            }
          },
          flowering: [{
            week: 1,
            spectrum: {
              blue: 25,
              green: 15,
              red: 50,
              farRed: 8,
              uvA: 1.5,
              uvB: 0.5
            },
            ppfd: {
              target: parseFloat(recipeData.floweringPPFD),
              dailySchedule: [
                { time: "06:00", intensity: 0 },
                { time: "06:30", intensity: 100 },
                { time: "18:30", intensity: 100 },
                { time: "19:00", intensity: 0 }
              ],
              rampUp: 30,
              rampDown: 30
            },
            photoperiod: recipeData.floweringPhotoperiod
          }]
        },
        training: {
          methods: recipeData.trainingMethods.split(',').map(m => ({ 
            technique: m.trim() as any, 
            timing: 'vegetative', 
            instructions: 'Standard technique', 
            recoveryTime: 7, 
            riskLevel: 'medium' as const
          })),
          canopyManagement: {
            targetHeight: 24,
            targetWidth: 18,
            defoliationSchedule: ['week-3', 'week-5'],
            supportStructure: 'trellis',
            branchTraining: 'LST',
            lightPenetration: 'moderate',
            leafRemoval: 'pre-flower'
          },
          scheduleByWeek: [{
            week: 3,
            techniques: ['topping'],
            timing: 'morning',
            notes: recipeData.pruningSchedule
          }]
        },
        harvest: {
          window: recipeData.harvestWindow,
          drying: recipeData.dryingMethod,
          curing: recipeData.curingMethod
        }
      }

      const result = await recipeMarketplaceService.createRecipe(recipePayload)
      router.push(`/marketplace/recipes/${result.id}`)
    } catch (err) {
      logger.error('system', 'Failed to create recipe:', err)
      setError('Failed to create recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">You need to sign in to create and sell recipes.</p>
            <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Recipe Listing</h1>
        <p className="text-muted-foreground">Share your proven cultivation methods and earn from every sale</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-full mx-2 ${
                    index < currentStep ? 'bg-purple-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between">
          {steps.map((step, index) => (
            <p key={index} className={`text-xs ${
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </p>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card>
        <CardContent className="p-6">
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., High-Yield Purple Haze Protocol"
                  value={recipeData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strainName">Strain Name</Label>
                  <Input
                    id="strainName"
                    placeholder="e.g., Purple Haze"
                    value={recipeData.strainName}
                    onChange={(e) => handleInputChange('strainName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="strainType">Strain Type</Label>
                  <Select value={recipeData.strainType} onValueChange={(value) => handleInputChange('strainType', value)}>
                    <SelectTrigger id="strainType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indica">Indica</SelectItem>
                      <SelectItem value="sativa">Sativa</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your cultivation method and what makes it special..."
                  rows={4}
                  value={recipeData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 1: Expected Results */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thcPercentage">THC Percentage</Label>
                  <Input
                    id="thcPercentage"
                    type="number"
                    placeholder="e.g., 24"
                    value={recipeData.thcPercentage}
                    onChange={(e) => handleInputChange('thcPercentage', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cbdPercentage">CBD Percentage (optional)</Label>
                  <Input
                    id="cbdPercentage"
                    type="number"
                    placeholder="e.g., 0.5"
                    value={recipeData.cbdPercentage}
                    onChange={(e) => handleInputChange('cbdPercentage', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yieldPerSqft">Yield (grams per sq ft)</Label>
                  <Input
                    id="yieldPerSqft"
                    type="number"
                    placeholder="e.g., 60"
                    value={recipeData.yieldPerSqft}
                    onChange={(e) => handleInputChange('yieldPerSqft', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="totalWeeks">Total Grow Time (weeks)</Label>
                  <Input
                    id="totalWeeks"
                    type="number"
                    placeholder="e.g., 12"
                    value={recipeData.totalWeeks}
                    onChange={(e) => handleInputChange('totalWeeks', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Environment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vegetativeTemp">Vegetative Temperature (°F)</Label>
                  <Input
                    id="vegetativeTemp"
                    type="number"
                    placeholder="e.g., 75"
                    value={recipeData.vegetativeTemp}
                    onChange={(e) => handleInputChange('vegetativeTemp', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="floweringTemp">Flowering Temperature (°F)</Label>
                  <Input
                    id="floweringTemp"
                    type="number"
                    placeholder="e.g., 72"
                    value={recipeData.floweringTemp}
                    onChange={(e) => handleInputChange('floweringTemp', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vegetativeHumidity">Vegetative Humidity (%)</Label>
                  <Input
                    id="vegetativeHumidity"
                    type="number"
                    placeholder="e.g., 60"
                    value={recipeData.vegetativeHumidity}
                    onChange={(e) => handleInputChange('vegetativeHumidity', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="floweringHumidity">Flowering Humidity (%)</Label>
                  <Input
                    id="floweringHumidity"
                    type="number"
                    placeholder="e.g., 45"
                    value={recipeData.floweringHumidity}
                    onChange={(e) => handleInputChange('floweringHumidity', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="co2Levels">CO2 Levels (ppm) - Optional</Label>
                <Input
                  id="co2Levels"
                  type="number"
                  placeholder="e.g., 1200"
                  value={recipeData.co2Levels}
                  onChange={(e) => handleInputChange('co2Levels', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Nutrients */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nutrientBrand">Nutrient Brand/Line</Label>
                <Input
                  id="nutrientBrand"
                  placeholder="e.g., General Hydroponics Flora Series"
                  value={recipeData.nutrientBrand}
                  onChange={(e) => handleInputChange('nutrientBrand', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vegetativeSchedule">Vegetative Nutrient Schedule</Label>
                <Textarea
                  id="vegetativeSchedule"
                  placeholder="Describe your vegetative feeding schedule..."
                  rows={3}
                  value={recipeData.vegetativeSchedule}
                  onChange={(e) => handleInputChange('vegetativeSchedule', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="floweringSchedule">Flowering Nutrient Schedule</Label>
                <Textarea
                  id="floweringSchedule"
                  placeholder="Describe your flowering feeding schedule..."
                  rows={3}
                  value={recipeData.floweringSchedule}
                  onChange={(e) => handleInputChange('floweringSchedule', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Lighting */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="lightingType">Lighting Type</Label>
                <Select value={recipeData.lightingType} onValueChange={(value) => handleInputChange('lightingType', value)}>
                  <SelectTrigger id="lightingType">
                    <SelectValue placeholder="Select lighting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="led">LED</SelectItem>
                    <SelectItem value="hps">HPS</SelectItem>
                    <SelectItem value="cmh">CMH</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vegetativePPFD">Vegetative PPFD (μmol/m²/s)</Label>
                  <Input
                    id="vegetativePPFD"
                    type="number"
                    placeholder="e.g., 600"
                    value={recipeData.vegetativePPFD}
                    onChange={(e) => handleInputChange('vegetativePPFD', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="floweringPPFD">Flowering PPFD (μmol/m²/s)</Label>
                  <Input
                    id="floweringPPFD"
                    type="number"
                    placeholder="e.g., 900"
                    value={recipeData.floweringPPFD}
                    onChange={(e) => handleInputChange('floweringPPFD', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vegetativePhotoperiod">Vegetative Light Schedule</Label>
                  <Select value={recipeData.vegetativePhotoperiod} onValueChange={(value) => handleInputChange('vegetativePhotoperiod', value)}>
                    <SelectTrigger id="vegetativePhotoperiod">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18/6">18/6</SelectItem>
                      <SelectItem value="20/4">20/4</SelectItem>
                      <SelectItem value="24/0">24/0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="floweringPhotoperiod">Flowering Light Schedule</Label>
                  <Select value={recipeData.floweringPhotoperiod} onValueChange={(value) => handleInputChange('floweringPhotoperiod', value)}>
                    <SelectTrigger id="floweringPhotoperiod">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12/12">12/12</SelectItem>
                      <SelectItem value="11/13">11/13</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Training & Harvest */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="trainingMethods">Training Methods</Label>
                <Input
                  id="trainingMethods"
                  placeholder="e.g., LST, Topping, SCROG (comma separated)"
                  value={recipeData.trainingMethods}
                  onChange={(e) => handleInputChange('trainingMethods', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pruningSchedule">Pruning/Defoliation Schedule</Label>
                <Textarea
                  id="pruningSchedule"
                  placeholder="Describe when and how you prune..."
                  rows={3}
                  value={recipeData.pruningSchedule}
                  onChange={(e) => handleInputChange('pruningSchedule', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="harvestWindow">Harvest Window</Label>
                <Input
                  id="harvestWindow"
                  placeholder="e.g., 20% amber trichomes"
                  value={recipeData.harvestWindow}
                  onChange={(e) => handleInputChange('harvestWindow', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dryingMethod">Drying Method</Label>
                <Input
                  id="dryingMethod"
                  placeholder="e.g., 60°F, 60% RH for 10-14 days"
                  value={recipeData.dryingMethod}
                  onChange={(e) => handleInputChange('dryingMethod', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="curingMethod">Curing Method</Label>
                <Input
                  id="curingMethod"
                  placeholder="e.g., Glass jars, burped daily for 4 weeks"
                  value={recipeData.curingMethod}
                  onChange={(e) => handleInputChange('curingMethod', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 6: Pricing & Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="basePrice">Base Price (USD)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="e.g., 500"
                    value={recipeData.basePrice}
                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Set your price between $100 - $5,000. Popular recipes are priced around $500-$1,500.
                  </p>
                </div>
                <div>
                  <Label htmlFor="usageRights">Default Usage Rights</Label>
                  <Select value={recipeData.usageRights} onValueChange={(value) => handleInputChange('usageRights', value)}>
                    <SelectTrigger id="usageRights">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-use">Single Use - One grow cycle</SelectItem>
                      <SelectItem value="multi-use">Multi Use - Unlimited personal grows</SelectItem>
                      <SelectItem value="commercial">Commercial - Can use for business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipe Summary */}
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Recipe Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{recipeData.name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strain:</span>
                    <span className="font-medium">{recipeData.strainName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected THC:</span>
                    <span className="font-medium">{recipeData.thcPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Yield:</span>
                    <span className="font-medium">{recipeData.yieldPerSqft} g/ft²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{recipeData.totalWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${recipeData.basePrice}</span>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  By creating this recipe, you agree to our marketplace terms. Your recipe will be reviewed within 24-48 hours before going live.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>

        <CardContent className="p-6 pt-0">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || saving}
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Recipe
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}