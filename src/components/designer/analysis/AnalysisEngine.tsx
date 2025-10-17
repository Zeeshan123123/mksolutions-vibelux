'use client';

import { useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/client-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Thermometer, 
  Zap, 
  Eye, 
  BarChart3, 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Info,
  Lightbulb,
  Activity
} from 'lucide-react';

interface FixtureData {
  id: string;
  position: { x: number; y: number; z: number };
  model: {
    wattage: number;
    ppf: number;
    efficacy: number;
    beamAngle: number;
    width: number;
    length: number;
  };
  enabled: boolean;
  dimmingLevel: number;
}

interface AnalysisEngineProps {
  placedFixtures: FixtureData[];
  roomDimensions: {
    length: number;
    width: number;
    height: number;
  };
  targetPPFD: number;
  targetDLI: number;
  onAnalysisComplete?: (results: any) => void;
}

interface AnalysisResults {
  ppfd: {
    average: number;
    uniformity: number;
    min: number;
    max: number;
    coverage: number;
    grid: number[][];
  };
  thermal: {
    averageTemp: number;
    hotSpots: Array<{ x: number; y: number; temp: number }>;
    coolingRequired: number;
    efficiency: number;
  };
  energy: {
    totalWattage: number;
    efficiency: number;
    dailyConsumption: number;
    annualCost: number;
    carbonFootprint: number;
  };
  recommendations: Array<{
    type: 'warning' | 'suggestion' | 'optimization';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export function AnalysisEngine({
  placedFixtures,
  roomDimensions,
  targetPPFD,
  targetDLI,
  onAnalysisComplete
}: AnalysisEngineProps) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('ppfd');

  // Calculate PPFD distribution across the room
  const calculatePPFDDistribution = (fixtures: FixtureData[]): { average: number; uniformity: number; min: number; max: number; grid: number[][] } => {
    const gridResolution = 20; // 20x20 grid
    const stepX = roomDimensions.length / gridResolution;
    const stepY = roomDimensions.width / gridResolution;
    
    const grid: number[][] = [];
    const ppfdValues: number[] = [];

    for (let i = 0; i < gridResolution; i++) {
      grid[i] = [];
      for (let j = 0; j < gridResolution; j++) {
        const x = i * stepX + stepX / 2;
        const y = j * stepY + stepY / 2;
        const z = 0; // Canopy level

        let totalPPFD = 0;

        // Calculate contribution from each fixture
        fixtures.forEach(fixture => {
          if (!fixture.enabled) return;

          const dx = x - fixture.position.x;
          const dy = y - fixture.position.y;
          const dz = fixture.position.z - z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance === 0) return; // Avoid division by zero

          // Calculate angle from fixture to point
          const angle = Math.acos(Math.abs(dz) / distance) * (180 / Math.PI);
          
          // Check if point is within beam angle
          const beamAngle = fixture.model.beamAngle || 120;
          if (angle <= beamAngle / 2) {
            // Inverse square law with cosine falloff
            const intensity = fixture.model.ppf * (fixture.dimmingLevel / 100);
            const cosAngle = Math.cos(angle * Math.PI / 180);
            const ppfdContribution = (intensity * cosAngle) / (distance * distance);
            totalPPFD += ppfdContribution * 0.5; // Scaling factor for realistic values
          }
        });

        grid[i][j] = Math.max(0, totalPPFD);
        ppfdValues.push(totalPPFD);
      }
    }

    const average = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    const min = Math.min(...ppfdValues);
    const max = Math.max(...ppfdValues);
    const uniformity = average > 0 ? min / max : 0;

    return { average, uniformity, min, max, grid };
  };

  // Calculate thermal analysis
  const calculateThermalAnalysis = (fixtures: FixtureData[]): { averageTemp: number; hotSpots: Array<{ x: number; y: number; temp: number }>; coolingRequired: number; efficiency: number } => {
    const baseTemp = 25; // Base room temperature (°C)
    const totalWattage = fixtures.reduce((sum, f) => f.enabled ? sum + f.model.wattage * (f.dimmingLevel / 100) : sum, 0);
    
    // Simple thermal model: 1W = ~0.003°C temperature rise per m³
    const roomVolume = roomDimensions.length * roomDimensions.width * roomDimensions.height;
    const tempRise = (totalWattage * 0.003) / (roomVolume / 100); // Adjust for room size
    const averageTemp = baseTemp + tempRise;

    // Identify hot spots near high-wattage fixtures
    const hotSpots: Array<{ x: number; y: number; temp: number }> = [];
    fixtures.forEach(fixture => {
      if (fixture.enabled && fixture.model.wattage > 200) {
        const localTempRise = fixture.model.wattage * 0.01; // Local heating effect
        hotSpots.push({
          x: fixture.position.x,
          y: fixture.position.y,
          temp: baseTemp + tempRise + localTempRise
        });
      }
    });

    // Estimate cooling requirements (simplified)
    const coolingRequired = totalWattage * 3.412; // BTU/hr (rough conversion)
    const efficiency = totalWattage > 0 ? (roomVolume / totalWattage) * 100 : 100;

    return { averageTemp, hotSpots, coolingRequired, efficiency };
  };

  // Calculate energy analysis
  const calculateEnergyAnalysis = (fixtures: FixtureData[]): { totalWattage: number; efficiency: number; dailyConsumption: number; annualCost: number; carbonFootprint: number } => {
    const totalWattage = fixtures.reduce((sum, f) => f.enabled ? sum + f.model.wattage * (f.dimmingLevel / 100) : sum, 0);
    const totalPPF = fixtures.reduce((sum, f) => f.enabled ? sum + f.model.ppf * (f.dimmingLevel / 100) : sum, 0);
    
    const efficiency = totalWattage > 0 ? totalPPF / totalWattage : 0; // μmol/J
    const photoperiod = 18; // hours/day (typical for cannabis)
    const dailyConsumption = (totalWattage * photoperiod) / 1000; // kWh/day
    const electricityRate = 0.12; // $/kWh (US average)
    const annualCost = dailyConsumption * 365 * electricityRate;
    
    // Carbon footprint: ~0.92 lbs CO2/kWh (US average)
    const carbonFootprint = dailyConsumption * 365 * 0.92 * 0.453592; // kg CO2/year

    return { totalWattage, efficiency, dailyConsumption, annualCost, carbonFootprint };
  };

  // Generate recommendations based on analysis
  const generateRecommendations = (ppfd: any, thermal: any, energy: any): Array<{ type: 'warning' | 'suggestion' | 'optimization'; message: string; impact: 'high' | 'medium' | 'low' }> => {
    const recommendations: Array<{ type: 'warning' | 'suggestion' | 'optimization'; message: string; impact: 'high' | 'medium' | 'low' }> = [];

    // PPFD analysis
    if (ppfd.uniformity < 0.7) {
      recommendations.push({
        type: 'warning',
        message: `Light uniformity is ${(ppfd.uniformity * 100).toFixed(1)}%. Consider redistributing fixtures for better coverage.`,
        impact: 'high'
      });
    }

    if (ppfd.average < targetPPFD * 0.9) {
      recommendations.push({
        type: 'suggestion',
        message: `Average PPFD (${ppfd.average.toFixed(0)}) is below target (${targetPPFD}). Add more fixtures or increase dimming levels.`,
        impact: 'high'
      });
    }

    if (ppfd.average > targetPPFD * 1.2) {
      recommendations.push({
        type: 'optimization',
        message: `Average PPFD exceeds target by ${((ppfd.average / targetPPFD - 1) * 100).toFixed(1)}%. Consider dimming fixtures to save energy.`,
        impact: 'medium'
      });
    }

    // Thermal analysis
    if (thermal.averageTemp > 30) {
      recommendations.push({
        type: 'warning',
        message: `Room temperature (${thermal.averageTemp.toFixed(1)}°C) is too high. Increase cooling capacity.`,
        impact: 'high'
      });
    }

    if (thermal.hotSpots.length > 0) {
      recommendations.push({
        type: 'suggestion',
        message: `${thermal.hotSpots.length} hot spots detected. Consider improving air circulation around high-wattage fixtures.`,
        impact: 'medium'
      });
    }

    // Energy analysis
    if (energy.efficiency < 2.0) {
      recommendations.push({
        type: 'optimization',
        message: `System efficiency (${energy.efficiency.toFixed(2)} μmol/J) is below 2.0. Consider upgrading to more efficient fixtures.`,
        impact: 'medium'
      });
    }

    if (energy.annualCost > 10000) {
      recommendations.push({
        type: 'suggestion',
        message: `Annual electricity cost ($${energy.annualCost.toFixed(0)}) is high. Consider implementing energy management strategies.`,
        impact: 'low'
      });
    }

    return recommendations;
  };

  // Main analysis function
  const runAnalysis = async () => {
    if (placedFixtures.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progressive analysis
      setAnalysisProgress(25);
      await new Promise(resolve => setTimeout(resolve, 500));

      const ppfdResults = calculatePPFDDistribution(placedFixtures);
      setAnalysisProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      const thermalResults = calculateThermalAnalysis(placedFixtures);
      setAnalysisProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      const energyResults = calculateEnergyAnalysis(placedFixtures);
      setAnalysisProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));

      const recommendations = generateRecommendations(ppfdResults, thermalResults, energyResults);

      const results: AnalysisResults = {
        ppfd: {
          ...ppfdResults,
          coverage: (ppfdResults.average / targetPPFD) * 100
        },
        thermal: thermalResults,
        energy: energyResults,
        recommendations
      };

      setAnalysisResults(results);
      setAnalysisProgress(100);
      onAnalysisComplete?.(results);

    } catch (error) {
      logger.error('system', 'Analysis failed:', error );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis when fixtures change
  useEffect(() => {
    if (placedFixtures.length > 0) {
      const debounceTimer = setTimeout(runAnalysis, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [placedFixtures, targetPPFD, targetDLI]);

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  if (placedFixtures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Fixtures to Analyze</h3>
          <p className="text-gray-500">Place some fixtures in the design mode to see analysis results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Lighting Analysis
            </h2>
            <p className="text-sm text-gray-400">
              {placedFixtures.length} fixtures • {placedFixtures.filter(f => f.enabled).length} active
            </p>
          </div>
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
        {isAnalyzing && (
          <Progress value={analysisProgress} className="mt-3" />
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedAnalysisType} onValueChange={setSelectedAnalysisType} className="h-full flex flex-col">
          <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none p-0">
            <TabsTrigger value="ppfd" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              PPFD Analysis
            </TabsTrigger>
            <TabsTrigger value="thermal" className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Thermal Analysis
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energy Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {analysisResults ? (
              <>
                <TabsContent value="ppfd" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Average PPFD</p>
                            <p className="text-2xl font-bold text-green-400">
                              {formatNumber(analysisResults.ppfd.average, 0)}
                            </p>
                            <p className="text-xs text-gray-500">μmol/m²/s</p>
                          </div>
                          <Activity className="w-8 h-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Uniformity</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {formatNumber(analysisResults.ppfd.uniformity * 100, 0)}%
                            </p>
                            <p className="text-xs text-gray-500">Min/Max ratio</p>
                          </div>
                          <Target className="w-8 h-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Min PPFD</p>
                            <p className="text-2xl font-bold text-yellow-400">
                              {formatNumber(analysisResults.ppfd.min, 0)}
                            </p>
                            <p className="text-xs text-gray-500">μmol/m²/s</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Max PPFD</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {formatNumber(analysisResults.ppfd.max, 0)}
                            </p>
                            <p className="text-xs text-gray-500">μmol/m²/s</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">PPFD Distribution Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-900 rounded-lg p-4 relative overflow-hidden">
                        <div className="grid grid-cols-20 gap-px h-full">
                          {analysisResults.ppfd.grid.flat().map((ppfd, i) => {
                            const intensity = Math.min(ppfd / (analysisResults.ppfd.max || 1), 1);
                            const hue = intensity * 120; // Green to red scale
                            return (
                              <div
                                key={i}
                                className="aspect-square rounded-sm"
                                style={{
                                  backgroundColor: `hsl(${hue}, 70%, ${30 + intensity * 40}%)`
                                }}
                                title={`PPFD: ${ppfd.toFixed(0)}`}
                              />
                            );
                          })}
                        </div>
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                          Red = High PPFD • Green = Low PPFD
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="thermal" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Average Temperature</p>
                            <p className="text-2xl font-bold text-orange-400">
                              {formatNumber(analysisResults.thermal.averageTemp)}°C
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatNumber(analysisResults.thermal.averageTemp * 9/5 + 32)}°F
                            </p>
                          </div>
                          <Thermometer className="w-8 h-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Cooling Required</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {formatNumber(analysisResults.thermal.coolingRequired / 1000, 1)}k
                            </p>
                            <p className="text-xs text-gray-500">BTU/hr</p>
                          </div>
                          <RefreshCw className="w-8 h-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Hot Spots</p>
                            <p className="text-2xl font-bold text-red-400">
                              {analysisResults.thermal.hotSpots.length}
                            </p>
                            <p className="text-xs text-gray-500">Areas detected</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analysisResults.thermal.hotSpots.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg">Hot Spot Locations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysisResults.thermal.hotSpots.map((spot, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                              <div>
                                <span className="text-sm text-gray-300">
                                  Position: ({formatNumber(spot.x)}, {formatNumber(spot.y)})
                                </span>
                              </div>
                              <div className="text-red-400 font-medium">
                                {formatNumber(spot.temp)}°C
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="energy" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Total Power</p>
                            <p className="text-2xl font-bold text-yellow-400">
                              {formatNumber(analysisResults.energy.totalWattage / 1000, 1)}kW
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatNumber(analysisResults.energy.totalWattage, 0)}W
                            </p>
                          </div>
                          <Zap className="w-8 h-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Efficiency</p>
                            <p className="text-2xl font-bold text-green-400">
                              {formatNumber(analysisResults.energy.efficiency, 2)}
                            </p>
                            <p className="text-xs text-gray-500">μmol/J</p>
                          </div>
                          <Activity className="w-8 h-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Daily Consumption</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {formatNumber(analysisResults.energy.dailyConsumption, 1)}
                            </p>
                            <p className="text-xs text-gray-500">kWh/day</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Annual Cost</p>
                            <p className="text-2xl font-bold text-red-400">
                              ${formatNumber(analysisResults.energy.annualCost, 0)}
                            </p>
                            <p className="text-xs text-gray-500">USD/year</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Carbon Footprint</p>
                            <p className="text-2xl font-bold text-orange-400">
                              {formatNumber(analysisResults.energy.carbonFootprint / 1000, 1)}t
                            </p>
                            <p className="text-xs text-gray-500">CO₂/year</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4 m-0">
                  {analysisResults.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {analysisResults.recommendations.map((rec, i) => (
                        <Card key={i} className={`bg-gray-800 border-l-4 ${
                          rec.type === 'warning' ? 'border-l-red-500' :
                          rec.type === 'suggestion' ? 'border-l-yellow-500' :
                          'border-l-green-500'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {rec.type === 'warning' ? (
                                  <AlertTriangle className="w-5 h-5 text-red-400" />
                                ) : rec.type === 'suggestion' ? (
                                  <Info className="w-5 h-5 text-yellow-400" />
                                ) : (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${
                                    rec.type === 'warning' ? 'text-red-400' :
                                    rec.type === 'suggestion' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}>
                                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    rec.impact === 'high' ? 'bg-red-900 text-red-300' :
                                    rec.impact === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                    'bg-blue-900 text-blue-300'
                                  }`}>
                                    {rec.impact} impact
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm">{rec.message}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">All Good!</h3>
                      <p className="text-gray-500">No issues or recommendations found in your lighting design.</p>
                    </div>
                  )}
                </TabsContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Analyze</h3>
                  <p className="text-gray-500 mb-4">Click "Run Analysis" to calculate lighting metrics.</p>
                  <Button onClick={runAnalysis} className="bg-purple-600 hover:bg-purple-700">
                    <Calculator className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}