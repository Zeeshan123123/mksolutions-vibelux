'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Lightbulb,
  Zap,
  BarChart3,
  Calculator,
  Eye,
  Settings,
  Award,
  DollarSign,
  Activity,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Grid3x3,
  Layers,
  Move
} from 'lucide-react';
import {
  MovingRackLightingDesigner as LightingCalculator,
  standardRackConfigs,
  type RackSystemSpecs,
  type LightingLayout
} from '@/lib/lighting/moving-rack-lighting-system';

interface MovingRackLightingDesignerProps {
  onDesignChange?: (analysis: any) => void;
}

export default function MovingRackLightingDesigner({ onDesignChange }: MovingRackLightingDesignerProps) {
  const [selectedConfig, setSelectedConfig] = useState<string>('leafy_greens_5x8');
  const [customSpecs, setCustomSpecs] = useState<RackSystemSpecs>(standardRackConfigs.leafy_greens_5x8);
  const [selectedFixture, setSelectedFixture] = useState<string>('fluence_spydr_2i');
  const [lightingCalculator, setLightingCalculator] = useState<LightingCalculator | null>(null);
  const [systemAnalysis, setSystemAnalysis] = useState<any>(null);
  const [fixtureRecommendations, setFixtureRecommendations] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize calculator when specs change
  useEffect(() => {
    const calculator = new LightingCalculator(customSpecs);
    setLightingCalculator(calculator);
    
    // Get fixture recommendations
    const recommendations = calculator.getFixtureRecommendations();
    setFixtureRecommendations(recommendations);
  }, [customSpecs]);

  // Calculate system analysis when fixture selection changes
  useEffect(() => {
    if (!lightingCalculator) return;
    
    setIsCalculating(true);
    
    // Simulate calculation time for better UX
    setTimeout(() => {
      try {
        const analysis = lightingCalculator.getSystemAnalysis(selectedFixture);
        setSystemAnalysis(analysis);
        onDesignChange?.(analysis);
      } catch (error) {
        console.error('Error calculating lighting system:', error);
      }
      setIsCalculating(false);
    }, 1000);
  }, [lightingCalculator, selectedFixture, onDesignChange]);

  const handleConfigChange = (configKey: string) => {
    setSelectedConfig(configKey);
    setCustomSpecs(standardRackConfigs[configKey]);
  };

  const handleSpecUpdate = (updates: Partial<RackSystemSpecs>) => {
    setCustomSpecs(prev => ({ ...prev, ...updates }));
    setSelectedConfig('custom');
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPower = (watts: number) => `${(watts / 1000).toFixed(1)} kW`;
  const formatEnergy = (kwh: number) => `${kwh.toFixed(1)} kWh`;

  const getUniformityStatus = (uniformity: number) => {
    if (uniformity >= 0.85) return { color: 'text-green-600', status: 'Excellent', icon: CheckCircle };
    if (uniformity >= 0.80) return { color: 'text-yellow-600', status: 'Good', icon: Activity };
    return { color: 'text-red-600', status: 'Poor', icon: AlertTriangle };
  };

  const getPPFDStatus = (ppfd: number, target: number) => {
    const ratio = ppfd / target;
    if (ratio >= 0.9 && ratio <= 1.1) return { color: 'text-green-600', status: 'On Target', icon: CheckCircle };
    if (ratio >= 0.8 && ratio <= 1.2) return { color: 'text-yellow-600', status: 'Close', icon: Activity };
    return { color: 'text-red-600', status: 'Off Target', icon: AlertTriangle };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Moving Rack Lighting Designer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Professional lighting design for 5-rack x 8-level growing systems using DLC-qualified LED fixtures
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
            Select or customize your rack system specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">System Preset</label>
              <Select value={selectedConfig} onValueChange={handleConfigChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leafy_greens_5x8">Leafy Greens - 5x8</SelectItem>
                  <SelectItem value="microgreens_5x8">Microgreens - 5x8</SelectItem>
                  <SelectItem value="herbs_5x8">Herbs - 5x8</SelectItem>
                  <SelectItem value="custom">Custom Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Target PPFD: {customSpecs.targetPPFD} μmol/m²/s
              </label>
              <Slider
                value={[customSpecs.targetPPFD]}
                onValueChange={(value) => handleSpecUpdate({ targetPPFD: value[0] })}
                min={200}
                max={500}
                step={25}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rack Width: {customSpecs.rackWidth}m
              </label>
              <Slider
                value={[customSpecs.rackWidth]}
                onValueChange={(value) => handleSpecUpdate({ rackWidth: value[0] })}
                min={1.0}
                max={4.0}
                step={0.2}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Level Height: {(customSpecs.levelHeight * 100).toFixed(0)}cm
              </label>
              <Slider
                value={[customSpecs.levelHeight]}
                onValueChange={(value) => handleSpecUpdate({ levelHeight: value[0] })}
                min={0.2}
                max={0.6}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      {systemAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Layers className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Growing Levels
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customSpecs.rackCount * customSpecs.levelsPerRack}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Fixtures
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemAnalysis.totalMetrics.totalFixtures}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    System Power
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPower(systemAnalysis.totalMetrics.totalPowerDraw)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Annual Energy Cost
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(systemAnalysis.totalMetrics.annualEnergyCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="fixtures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixtures">Fixture Selection</TabsTrigger>
          <TabsTrigger value="layout">Layout Design</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Fixture Selection Tab */}
        <TabsContent value="fixtures">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DLC-Qualified Fixture Recommendations</CardTitle>
                <CardDescription>
                  Top-rated fixtures for your multi-tier system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fixtureRecommendations.slice(0, 3).map((rec, index) => (
                    <div 
                      key={rec.fixtureKey}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedFixture === rec.fixtureKey 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFixture(rec.fixtureKey)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold flex items-center">
                            {rec.fixture.manufacturer} {rec.fixture.model}
                            {index === 0 && <Award className="h-4 w-4 ml-2 text-yellow-500" />}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {rec.fixture.efficacy} μmol/J • {rec.fixture.powerConsumption}W
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            {rec.suitabilityScore}% Match
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ~{formatCurrency(rec.estimatedCost)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {rec.pros.slice(0, 2).map((pro, i) => (
                          <p key={i} className="text-xs text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {pro}
                          </p>
                        ))}
                        {rec.cons.slice(0, 1).map((con, i) => (
                          <p key={i} className="text-xs text-yellow-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {con}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Fixture Details</CardTitle>
                <CardDescription>
                  Technical specifications and performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Model</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {systemAnalysis.fixture.manufacturer} {systemAnalysis.fixture.model}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">DLC Qualified</p>
                        <Badge className="bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Power Draw</p>
                        <p className="text-gray-600 dark:text-gray-400">{systemAnalysis.fixture.powerConsumption}W</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Efficacy</p>
                        <p className="text-gray-600 dark:text-gray-400">{systemAnalysis.fixture.efficacy} μmol/J</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">PPF Output</p>
                        <p className="text-gray-600 dark:text-gray-400">{systemAnalysis.fixture.ppf} μmol/s</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Lifespan</p>
                        <p className="text-gray-600 dark:text-gray-400">{(systemAnalysis.fixture.lifespan / 1000).toFixed(0)}k hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Dimensions</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {(systemAnalysis.fixture.length * 100).toFixed(0)} × {(systemAnalysis.fixture.width * 100).toFixed(0)} × {(systemAnalysis.fixture.height * 100).toFixed(1)} cm
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Weight</p>
                        <p className="text-gray-600 dark:text-gray-400">{systemAnalysis.fixture.weight} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout Design Tab */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>System Layout Visualization</CardTitle>
              <CardDescription>
                3D representation of fixture placement across all racks and levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isCalculating ? (
                  <div className="text-center">
                    <Calculator className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Calculating optimal fixture layout...</p>
                  </div>
                ) : systemAnalysis ? (
                  <div className="relative w-full h-full p-8">
                    <div className="text-xs text-gray-500 mb-4">
                      System Layout: {customSpecs.rackCount} Racks × {customSpecs.levelsPerRack} Levels
                    </div>
                    
                    {/* Simplified 2D rack visualization */}
                    <div className="grid grid-cols-5 gap-4 h-full">
                      {Array.from({ length: customSpecs.rackCount }, (_, rackIndex) => (
                        <div key={rackIndex} className="bg-white dark:bg-gray-700 rounded border relative">
                          <div className="text-xs font-medium p-2 border-b">
                            Rack {rackIndex + 1}
                          </div>
                          <div className="p-2 space-y-1">
                            {Array.from({ length: customSpecs.levelsPerRack }, (_, levelIndex) => {
                              const layout = systemAnalysis.layouts.find(
                                (l: LightingLayout) => l.rackId === `rack-${rackIndex + 1}` && l.levelId === `level-${levelIndex + 1}`
                              );
                              
                              return (
                                <div key={levelIndex} className="h-6 bg-green-100 dark:bg-green-900 rounded text-xs flex items-center justify-center relative">
                                  <span className="text-green-800 dark:text-green-200">
                                    L{levelIndex + 1}
                                  </span>
                                  {layout && (
                                    <div className="absolute inset-0 flex justify-center items-center">
                                      {Array.from({ length: Math.min(layout.fixtures.length, 4) }, (_, i) => (
                                        <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full mx-0.5" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg">
                      <div className="text-xs font-medium mb-2">Legend</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded mr-2"></div>
                          Growing Level
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                          LED Fixture
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Select a fixture to generate layout</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis Tab */}
        <TabsContent value="analysis">
          {systemAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Light Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average PPFD</span>
                    <div className="flex items-center">
                      {(() => {
                        const status = getPPFDStatus(systemAnalysis.totalMetrics.averagePPFD, customSpecs.targetPPFD);
                        const StatusIcon = status.icon;
                        return (
                          <>
                            <span className={`font-bold mr-2 ${status.color}`}>
                              {Math.round(systemAnalysis.totalMetrics.averagePPFD)} μmol/m²/s
                            </span>
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Target PPFD</span>
                    <span className="font-bold">{customSpecs.targetPPFD} μmol/m²/s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Uniformity</span>
                    <div className="flex items-center">
                      {(() => {
                        const status = getUniformityStatus(systemAnalysis.totalMetrics.systemUniformity);
                        const StatusIcon = status.icon;
                        return (
                          <>
                            <span className={`font-bold mr-2 ${status.color}`}>
                              {(systemAnalysis.totalMetrics.systemUniformity * 100).toFixed(1)}%
                            </span>
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fixtures per Level</span>
                    <span className="font-bold">
                      {systemAnalysis.layouts.length > 0 ? systemAnalysis.layouts[0].fixtures.length : 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Power Density</span>
                    <span className="font-bold">
                      {(systemAnalysis.totalMetrics.totalPowerDraw / (customSpecs.rackCount * customSpecs.rackWidth * customSpecs.rackDepth)).toFixed(1)} W/m²
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Energy Efficiency Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Energy Use</span>
                    <span className="font-bold">
                      {formatEnergy(systemAnalysis.totalMetrics.dailyEnergyConsumption)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Annual Energy Cost</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(systemAnalysis.totalMetrics.annualEnergyCost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Efficacy</span>
                    <span className="font-bold">
                      {systemAnalysis.fixture.efficacy} μmol/J
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">DLC Rebate Eligible</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">vs. HPS Savings</span>
                      <span className="font-bold text-green-600">
                        ~40% Energy Reduction
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="cost">
          {systemAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Installation Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">LED Fixtures ({systemAnalysis.totalMetrics.totalFixtures} units)</span>
                    <span className="font-bold">
                      {formatCurrency(systemAnalysis.totalMetrics.totalFixtures * (systemAnalysis.totalMetrics.estimatedInstallationCost / systemAnalysis.totalMetrics.totalFixtures * 0.7))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Installation Labor</span>
                    <span className="font-bold">
                      {formatCurrency(systemAnalysis.totalMetrics.estimatedInstallationCost * 0.2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Electrical & Controls</span>
                    <span className="font-bold">
                      {formatCurrency(systemAnalysis.totalMetrics.estimatedInstallationCost * 0.1)}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Installation Cost</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(systemAnalysis.totalMetrics.estimatedInstallationCost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Award className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        DLC Rebate Eligible
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Estimated utility rebate: {formatCurrency(systemAnalysis.totalMetrics.estimatedInstallationCost * 0.15)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    ROI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Annual Energy Savings vs HPS</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(systemAnalysis.totalMetrics.annualEnergyCost * 0.4)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Maintenance Savings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(systemAnalysis.totalMetrics.totalFixtures * 50)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Annual Savings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((systemAnalysis.totalMetrics.annualEnergyCost * 0.4) + (systemAnalysis.totalMetrics.totalFixtures * 50))}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payback Period</span>
                      <span className="text-xl font-bold text-blue-600">
                        {(systemAnalysis.totalMetrics.estimatedInstallationCost / ((systemAnalysis.totalMetrics.annualEnergyCost * 0.4) + (systemAnalysis.totalMetrics.totalFixtures * 50))).toFixed(1)} years
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        10-Year NPV
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(((systemAnalysis.totalMetrics.annualEnergyCost * 0.4) + (systemAnalysis.totalMetrics.totalFixtures * 50)) * 10 - systemAnalysis.totalMetrics.estimatedInstallationCost)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}