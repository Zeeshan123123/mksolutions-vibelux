'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Calculator,
  TrendingUp,
  Droplets,
  Sun,
  DollarSign,
  Ruler,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Target,
  Settings
} from 'lucide-react';
import {
  NFTSpacingCalculator,
  standardCropSpecs,
  standardGutterSpecs,
  type PlantSpacingData,
  type NFTGutterSpecs,
  type EnvironmentalConstraints,
  type NutrientSystemSpecs
} from '@/lib/horticultural/nft-gutter-engineering';

interface SpacingResult {
  day: number;
  spacing: number;
  plantDensity: number;
  lightInterception: number;
  competitionIndex: number;
  reasoning: string;
  metrics: {
    plantsPerGutter: number;
    totalYieldEstimate: number;
    waterUseEfficiency: number;
    lightUseEfficiency: number;
    economicReturn: number;
    spaceUtilization: number;
  };
}

export default function NFTSpacingAnalyzer() {
  const [selectedCrop, setSelectedCrop] = useState<string>('lettuce_butterhead');
  const [selectedGutter, setSelectedGutter] = useState<string>('standard_4inch');
  const [analysisResults, setAnalysisResults] = useState<SpacingResult[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Environmental parameters (adjustable)
  const [environment, setEnvironment] = useState<EnvironmentalConstraints>({
    minTemperature: 18,
    maxTemperature: 24,
    optimalTemperature: 21,
    minHumidity: 60,
    maxHumidity: 75,
    optimalHumicity: 68,
    minAirVelocity: 0.1,
    maxAirVelocity: 0.3,
    dailyLightIntegral: 17, // mol/m²/day
    maxInstantaneousPPFD: 400, // μmol/m²/s
    photoperiod: 16 // hours
  });

  // Nutrient system specs (adjustable)
  const [nutrientSystem, setNutrientSystem] = useState<NutrientSystemSpecs>({
    ecRange: [1.2, 1.6],
    phRange: [5.8, 6.2],
    temperature: 20,
    dissolvedOxygen: 8.0,
    pumpCapacity: 40, // L/min
    pressureDrop: 15, // kPa
    reservoirVolume: 500, // L
    turnoverRate: 4, // per hour
    ecTolerance: 0.1,
    phTolerance: 0.2,
    temperatureTolerance: 1.0
  });

  // Get current crop and gutter specs
  const cropData = standardCropSpecs[selectedCrop];
  const gutterSpecs = standardGutterSpecs[selectedGutter];

  // Create calculator instance
  const calculator = useMemo(() => {
    if (!cropData || !gutterSpecs) return null;
    return new NFTSpacingCalculator(gutterSpecs, cropData, environment, nutrientSystem);
  }, [cropData, gutterSpecs, environment, nutrientSystem]);

  // Run spacing analysis for full crop cycle
  const runSpacingAnalysis = async () => {
    if (!calculator || !cropData) return;

    setIsAnalyzing(true);
    const results: SpacingResult[] = [];

    // Analyze every 3 days throughout the crop cycle
    for (let day = 1; day <= cropData.daysToHarvest; day += 3) {
      const spacingResult = calculator.calculateOptimalSpacing(day);
      const metrics = calculator.calculateProductionMetrics(spacingResult.spacing);
      
      results.push({
        day,
        ...spacingResult,
        metrics
      });
      
      // Small delay to show progress (remove in production)
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setAnalysisResults(results);
    setIsAnalyzing(false);
  };

  // Run analysis when parameters change
  useEffect(() => {
    runSpacingAnalysis();
  }, [selectedCrop, selectedGutter, environment, nutrientSystem]);

  // Get current day result
  const currentResult = useMemo(() => {
    if (!analysisResults.length) return null;
    return analysisResults.find(r => r.day <= currentDay) || analysisResults[0];
  }, [analysisResults, currentDay]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          NFT Gutter Spacing Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Professional horticultural engineering tool for optimizing plant spacing in 
          Nutrient Film Technique systems based on established plant physiology models.
        </p>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Select your crop variety and gutter specifications for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Crop Variety</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lettuce_butterhead">Lettuce - Butterhead</SelectItem>
                  <SelectItem value="lettuce_romaine">Lettuce - Romaine</SelectItem>
                  <SelectItem value="basil_genovese">Basil - Genovese</SelectItem>
                  <SelectItem value="arugula">Arugula - Wild Rocket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gutter System</label>
              <Select value={selectedGutter} onValueChange={setSelectedGutter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard_4inch">Standard 4" PVC</SelectItem>
                  <SelectItem value="heavy_duty_6inch">Heavy Duty 6" ABS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Day: {currentDay}
              </label>
              <Slider
                value={[currentDay]}
                onValueChange={(value) => setCurrentDay(value[0])}
                min={1}
                max={cropData?.daysToHarvest || 35}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={runSpacingAnalysis} 
                disabled={isAnalyzing}
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Recalculate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Day Analysis */}
      {currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Ruler className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Optimal Spacing
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentResult.spacing.toFixed(1)} cm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Plant Density
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentResult.plantDensity.toFixed(1)}/m²
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Sun className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Light Interception
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercent(currentResult.lightInterception)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Competition Index
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(currentResult.competitionIndex * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Spacing Analysis</TabsTrigger>
          <TabsTrigger value="production">Production Metrics</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="technical">Technical Specs</TabsTrigger>
        </TabsList>

        {/* Spacing Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spacing Requirements Over Time</CardTitle>
                <CardDescription>
                  Optimal plant spacing throughout the growth cycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {/* Simple chart visualization */}
                  <div className="relative h-full">
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-500">
                      <span>40cm</span>
                      <span>30cm</span>
                      <span>20cm</span>
                      <span>10cm</span>
                      <span>0cm</span>
                    </div>
                    
                    <div className="ml-8 h-full relative">
                      {/* X-axis labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                        <span>Day 1</span>
                        <span>Day {Math.floor((cropData?.daysToHarvest || 35) / 2)}</span>
                        <span>Day {cropData?.daysToHarvest || 35}</span>
                      </div>
                      
                      {/* Simple line visualization */}
                      <svg className="w-full h-full">
                        <polyline
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                          points={analysisResults.map((result, index) => {
                            const x = (index / (analysisResults.length - 1)) * 100;
                            const y = 100 - (result.spacing / 40) * 100; // Scale to 40cm max
                            return `${x}%,${y}%`;
                          }).join(' ')}
                        />
                        
                        {/* Current day indicator */}
                        {currentResult && (
                          <circle
                            cx={`${((currentDay - 1) / ((cropData?.daysToHarvest || 35) - 1)) * 100}%`}
                            cy={`${100 - (currentResult.spacing / 40) * 100}%`}
                            r="4"
                            fill="#8b5cf6"
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Reasoning */}
            <Card>
              <CardHeader>
                <CardTitle>Spacing Rationale - Day {currentDay}</CardTitle>
                <CardDescription>
                  Technical reasoning for current spacing recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentResult && (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {currentResult.reasoning}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Canopy Diameter
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {((currentResult.spacing * Math.sqrt(currentResult.plantDensity / 10000)) * 10).toFixed(1)} cm
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Growth Stage
                        </p>
                        <Badge variant="outline">
                          {currentDay < 7 ? 'Seedling' : 
                           currentDay < 21 ? 'Vegetative' : 
                           currentDay < 28 ? 'Maturation' : 'Pre-harvest'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Production Metrics Tab */}
        <TabsContent value="production">
          {currentResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Yield Projections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plants per Gutter:</span>
                    <span className="font-medium">{currentResult.metrics.plantsPerGutter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Yield:</span>
                    <span className="font-medium">{currentResult.metrics.totalYieldEstimate} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Space Utilization:</span>
                    <span className="font-medium">{formatPercent(currentResult.metrics.spaceUtilization)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                    Resource Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Water Use Efficiency:</span>
                    <span className="font-medium">{currentResult.metrics.waterUseEfficiency} kg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Light Use Efficiency:</span>
                    <span className="font-medium">{currentResult.metrics.lightUseEfficiency} kg/mol</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Economic Return:</span>
                    <span className="font-medium">{formatCurrency(currentResult.metrics.economicReturn)}/m²/year</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                    Economic Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Cycle:</span>
                    <span className="font-medium">
                      {formatCurrency(currentResult.metrics.plantsPerGutter * (cropData?.plantValue || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Seedling Costs:</span>
                    <span className="font-medium">
                      {formatCurrency(currentResult.metrics.plantsPerGutter * (cropData?.costPerSeedling || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Margin:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        currentResult.metrics.plantsPerGutter * 
                        ((cropData?.plantValue || 0) - (cropData?.costPerSeedling || 0))
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Parameters</CardTitle>
                <CardDescription>
                  Adjust environmental conditions to see their impact on spacing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum PPFD: {environment.maxInstantaneousPPFD} μmol/m²/s
                  </label>
                  <Slider
                    value={[environment.maxInstantaneousPPFD]}
                    onValueChange={(value) => setEnvironment(prev => ({
                      ...prev,
                      maxInstantaneousPPFD: value[0]
                    }))}
                    min={200}
                    max={800}
                    step={50}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Daily Light Integral: {environment.dailyLightIntegral} mol/m²/day
                  </label>
                  <Slider
                    value={[environment.dailyLightIntegral]}
                    onValueChange={(value) => setEnvironment(prev => ({
                      ...prev,
                      dailyLightIntegral: value[0]
                    }))}
                    min={10}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Optimal Temperature: {environment.optimalTemperature}°C
                  </label>
                  <Slider
                    value={[environment.optimalTemperature]}
                    onValueChange={(value) => setEnvironment(prev => ({
                      ...prev,
                      optimalTemperature: value[0]
                    }))}
                    min={15}
                    max={28}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrient System</CardTitle>
                <CardDescription>
                  Configure nutrient delivery system parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pump Capacity: {nutrientSystem.pumpCapacity} L/min
                  </label>
                  <Slider
                    value={[nutrientSystem.pumpCapacity]}
                    onValueChange={(value) => setNutrientSystem(prev => ({
                      ...prev,
                      pumpCapacity: value[0]
                    }))}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    EC Range: {nutrientSystem.ecRange[0]} - {nutrientSystem.ecRange[1]} mS/cm
                  </label>
                  <div className="flex space-x-2">
                    <Slider
                      value={[nutrientSystem.ecRange[0]]}
                      onValueChange={(value) => setNutrientSystem(prev => ({
                        ...prev,
                        ecRange: [value[0], prev.ecRange[1]]
                      }))}
                      min={0.8}
                      max={2.0}
                      step={0.1}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Solution Temperature: {nutrientSystem.temperature}°C
                  </label>
                  <Slider
                    value={[nutrientSystem.temperature]}
                    onValueChange={(value) => setNutrientSystem(prev => ({
                      ...prev,
                      temperature: value[0]
                    }))}
                    min={16}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Specs Tab */}
        <TabsContent value="technical">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crop Specifications</CardTitle>
                <CardDescription>
                  Technical data for {cropData?.species} ({cropData?.cultivar})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cropData && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Seedling Diameter</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.seedlingDiameter} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Mature Diameter</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.matureCanopyDiameter} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Canopy Height</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.canopyHeight} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Root Spread</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.rootSpread} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Light Saturation</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.lightSaturationPoint} μmol/m²/s</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Days to Harvest</p>
                        <p className="text-gray-600 dark:text-gray-400">{cropData.daysToHarvest} days</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gutter System Specifications</CardTitle>
                <CardDescription>
                  Physical specifications for selected gutter system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gutterSpecs && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Length</p>
                        <p className="text-gray-600 dark:text-gray-400">{gutterSpecs.length} m</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Internal Width</p>
                        <p className="text-gray-600 dark:text-gray-400">{(gutterSpecs.width * 100).toFixed(1)} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Internal Depth</p>
                        <p className="text-gray-600 dark:text-gray-400">{(gutterSpecs.depth * 100).toFixed(1)} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Material</p>
                        <p className="text-gray-600 dark:text-gray-400">{gutterSpecs.material}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Flow Rate</p>
                        <p className="text-gray-600 dark:text-gray-400">{gutterSpecs.flowRate} L/min</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Film Depth</p>
                        <p className="text-gray-600 dark:text-gray-400">{gutterSpecs.filmDepth} mm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Slope</p>
                        <p className="text-gray-600 dark:text-gray-400">1:{Math.round(1/Math.tan(gutterSpecs.slope * Math.PI/180))}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Load Capacity</p>
                        <p className="text-gray-600 dark:text-gray-400">{gutterSpecs.maxLoadCapacity} kg/m</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}