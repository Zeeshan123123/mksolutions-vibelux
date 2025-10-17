"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Zap,
  Fuel,
  ThermometerSun,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Lightbulb,
  Factory,
  Cloud,
  ArrowUpDown,
  Info,
  Calculator,
  Target,
  Gauge
} from 'lucide-react'
import {
  CHPLightingDecisionMatrix,
  DecisionScenario,
  ElectricityPricing,
  CO2Economics,
  CHPSpecifications,
  LightingSystem,
  LightingZone,
  DecisionOutput,
  HourlyDecision
} from '@/lib/energy/chp-lighting-decision-matrix'

// Chart component for hourly visualization
const HourlyScheduleChart: React.FC<{ 
  schedule: HourlyDecision[],
  showLighting?: boolean,
  showCO2?: boolean 
}> = ({ schedule, showLighting = true, showCO2 = true }) => {
  const maxGridPrice = Math.max(...schedule.map(h => h.economics.gridPrice))
  const maxPower = Math.max(...schedule.map(h => 
    h.chpOperation.powerOutput + 
    h.lightingDecisions.reduce((sum, d) => sum + d.powerLevel, 0)
  ))

  return (
    <div className="relative h-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      {/* Grid for hours */}
      <div className="absolute inset-x-4 inset-y-4 grid grid-cols-24 gap-0">
        {schedule.map((hour, idx) => (
          <div key={idx} className="relative group">
            {/* CHP Operation */}
            <div 
              className={`absolute bottom-0 left-0 right-0 transition-all ${
                hour.chpOperation.run ? 'bg-green-500' : 'bg-gray-300'
              }`}
              style={{ 
                height: `${(hour.chpOperation.powerOutput / maxPower) * 100}%`,
                opacity: hour.chpOperation.run ? 0.8 : 0.2
              }}
            />
            
            {/* Grid Price Line */}
            <div 
              className="absolute left-0 right-0 h-0.5 bg-red-500"
              style={{ 
                bottom: `${(hour.economics.gridPrice / maxGridPrice) * 100}%` 
              }}
            />
            
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap z-10 pointer-events-none">
              <div className="font-semibold">{hour.hour}:00</div>
              <div>Grid: ${hour.economics.gridPrice.toFixed(3)}/kWh</div>
              <div>CHP: {hour.chpOperation.run ? 'ON' : 'OFF'}</div>
              <div>Net: ${hour.economics.netCostBenefit.toFixed(2)}/hr</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>CHP Running</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-red-500" />
          <span>Grid Price</span>
        </div>
      </div>
    </div>
  )
}

// Scenario comparison component
const ScenarioComparison: React.FC<{
  scenarios: Map<string, DecisionOutput>
}> = ({ scenarios }) => {
  const scenarioArray = Array.from(scenarios.entries())
  
  if (scenarioArray.length === 0) return null

  const metrics = [
    { key: 'netProfit', label: 'Daily Profit', format: (v: number) => `$${v.toFixed(2)}`, positive: true },
    { key: 'totalCost', label: 'Total Cost', format: (v: number) => `$${v.toFixed(2)}`, positive: false },
    { key: 'totalRevenue', label: 'Grid Revenue', format: (v: number) => `$${v.toFixed(2)}`, positive: true },
    { key: 'chpOperatingHours', label: 'CHP Hours', format: (v: number) => `${v.toFixed(1)}h`, positive: true },
    { key: 'averageDLI', label: 'Avg DLI', format: (v: number) => `${v.toFixed(1)} mol/m²`, positive: true },
    { key: 'gridExport', label: 'Grid Export', format: (v: number) => `${v.toFixed(0)} kWh`, positive: true },
    { key: 'co2FromCHP', label: 'CO₂ from CHP', format: (v: number) => `${v.toFixed(0)} kg`, positive: true },
    { key: 'gridRevenueCapture', label: 'Revenue Capture', format: (v: number) => `${v.toFixed(0)}%`, positive: true }
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Metric</th>
            {scenarioArray.map(([id, output]) => (
              <th key={id} className="text-center p-2 min-w-[120px]">
                <div className="font-medium">{output.scenario.name}</div>
                <div className="text-xs text-gray-500">{output.scenario.strategy}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(metric => {
            const values = scenarioArray.map(([_, output]) => 
              output.dailySummary[metric.key as keyof typeof output.dailySummary] as number
            )
            const best = metric.positive ? Math.max(...values) : Math.min(...values)
            
            return (
              <tr key={metric.key} className="border-b">
                <td className="p-2 font-medium">{metric.label}</td>
                {scenarioArray.map(([id, output], idx) => {
                  const value = values[idx]
                  const isBest = value === best
                  
                  return (
                    <td key={id} className="text-center p-2">
                      <span className={`${isBest ? 'font-bold text-green-600' : ''}`}>
                        {metric.format(value)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function EnhancedCHPDecisionMatrix() {
  // Default CHP specifications
  const [chpSpecs] = useState<CHPSpecifications>({
    electricalOutput: 500, // kW
    thermalOutput: 400, // kW
    fuelConsumption: 150, // m³/hour
    electricalEfficiency: 42,
    thermalEfficiency: 38,
    totalEfficiency: 80,
    minLoadFactor: 50,
    rampUpTime: 15,
    rampDownTime: 10,
    minRunTime: 2,
    minDownTime: 1,
    maintenanceCost: 25, // $/hour
    mtbf: 8000
  })

  // Default lighting system
  const [lightingSystem] = useState<LightingSystem>({
    totalPower: 300, // kW
    efficacy: 2.7, // μmol/J
    zones: [
      {
        id: 'zone-1',
        name: 'Flowering Room 1',
        power: 150,
        area: 500,
        currentPPFD: 800,
        targetDLI: 35,
        photoperiod: 12,
        cropStage: 'flowering',
        priority: 'critical'
      },
      {
        id: 'zone-2',
        name: 'Veg Room 1',
        power: 100,
        area: 400,
        currentPPFD: 600,
        targetDLI: 25,
        photoperiod: 18,
        cropStage: 'vegetative',
        priority: 'high'
      },
      {
        id: 'zone-3',
        name: 'Propagation',
        power: 50,
        area: 200,
        currentPPFD: 300,
        targetDLI: 15,
        photoperiod: 16,
        cropStage: 'propagation',
        priority: 'medium'
      }
    ],
    dimmable: true,
    minDimLevel: 30,
    powerFactorCorrection: true
  })

  // Scenario management
  const [scenarios, setScenarios] = useState<DecisionScenario[]>([])
  const [activeScenarioId, setActiveScenarioId] = useState<string>('')
  const [results, setResults] = useState<Map<string, DecisionOutput>>(new Map())
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Current scenario being edited
  const [currentScenario, setCurrentScenario] = useState<DecisionScenario>({
    id: 'scenario-1',
    name: 'Current Market Conditions',
    description: 'Analysis based on current electricity and gas prices',
    timeHorizon: 'daily',
    electricityPricing: {
      peakPrice: 0.42,
      midPeakPrice: 0.28,
      offPeakPrice: 0.15,
      feedInTariff: 0.38,
      netMeteringEnabled: true,
      exportLimit: 300,
      demandCharge: 15,
      demandRatchet: 50
    },
    co2Economics: {
      liquidCO2Price: 0.12,
      deliveryCharge: 150,
      storageCapacity: 5000,
      chpCO2Production: 95,
      co2Purity: 98,
      targetPPM: 1000,
      ventilationRate: 0.5,
      greenhouseVolume: 10000,
      plantUptakeRate: 50,
      yieldIncrease: 15,
      cropValuePerKg: 8.50
    },
    naturalGasPrice: 0.035,
    strategy: 'balanced',
    constraints: {
      maxImport: 800,
      maxExport: 300,
      maxCO2Emissions: 2000,
      renewableTarget: 20,
      minDLI: 20,
      minCO2Hours: 8,
      maxDailyCost: 5000,
      minDailyRevenue: 0
    }
  })

  // Initialize decision matrix
  const decisionMatrix = useMemo(() => {
    return new CHPLightingDecisionMatrix(chpSpecs, lightingSystem)
  }, [chpSpecs, lightingSystem])

  // Add initial scenario
  useEffect(() => {
    if (scenarios.length === 0) {
      setScenarios([currentScenario])
      setActiveScenarioId(currentScenario.id)
    }
  }, [])

  // Update electricity pricing
  const updateElectricityPricing = (field: keyof ElectricityPricing, value: any) => {
    setCurrentScenario(prev => ({
      ...prev,
      electricityPricing: {
        ...prev.electricityPricing,
        [field]: value
      }
    }))
  }

  // Update CO2 economics
  const updateCO2Economics = (field: keyof CO2Economics, value: any) => {
    setCurrentScenario(prev => ({
      ...prev,
      co2Economics: {
        ...prev.co2Economics,
        [field]: value
      }
    }))
  }

  // Add scenario
  const addScenario = () => {
    const newScenario = {
      ...currentScenario,
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`
    }
    setScenarios([...scenarios, newScenario])
    setActiveScenarioId(newScenario.id)
  }

  // Duplicate scenario
  const duplicateScenario = (scenario: DecisionScenario) => {
    const newScenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      name: `${scenario.name} (Copy)`
    }
    setScenarios([...scenarios, newScenario])
    setCurrentScenario(newScenario)
    setActiveScenarioId(newScenario.id)
  }

  // Delete scenario
  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id))
    results.delete(id)
    setResults(new Map(results))
    
    if (activeScenarioId === id && scenarios.length > 1) {
      setActiveScenarioId(scenarios[0].id)
    }
  }

  // Run analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      const newResults = new Map<string, DecisionOutput>()
      
      for (const scenario of scenarios) {
        decisionMatrix.addScenario(scenario)
        const output = await decisionMatrix.analyzeScenario(scenario)
        newResults.set(scenario.id, output)
      }
      
      setResults(newResults)
    } catch (error) {
      logger.error('energy', 'Analysis failed:', error )
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Export results
  const exportResults = () => {
    const data = {
      scenarios,
      results: Array.from(results.entries()).map(([id, output]) => ({
        scenarioId: id,
        ...output
      })),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chp-analysis-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const activeResult = activeScenarioId ? results.get(activeScenarioId) : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            CHP & Lighting Decision Matrix
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Multi-scenario optimization for cogeneration and lighting operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            <Calculator className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          <Button variant="outline" onClick={exportResults} disabled={results.size === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeScenarioId} onValueChange={setActiveScenarioId}>
        {/* Scenario Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <TabsList className="flex-1">
            {scenarios.map(scenario => (
              <TabsTrigger key={scenario.id} value={scenario.id}>
                {scenario.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button size="sm" variant="outline" onClick={addScenario}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {scenarios.map(scenario => (
          <TabsContent key={scenario.id} value={scenario.id} className="space-y-6">
            {/* Scenario Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Configuration</CardTitle>
                <CardDescription>
                  Configure electricity pricing, CO₂ economics, and operational strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="electricity">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="electricity">Electricity</TabsTrigger>
                    <TabsTrigger value="co2">CO₂</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="constraints">Constraints</TabsTrigger>
                  </TabsList>

                  {/* Electricity Pricing Tab */}
                  <TabsContent value="electricity" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Peak Price ($/kWh)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.electricityPricing.peakPrice}
                          onChange={(e) => updateElectricityPricing('peakPrice', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Mid-Peak Price ($/kWh)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.electricityPricing.midPeakPrice}
                          onChange={(e) => updateElectricityPricing('midPeakPrice', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Off-Peak Price ($/kWh)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.electricityPricing.offPeakPrice}
                          onChange={(e) => updateElectricityPricing('offPeakPrice', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          Feed-in Tariff ($/kWh)
                          <Info className="w-3 h-3 text-gray-400" />
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.electricityPricing.feedInTariff}
                          onChange={(e) => updateElectricityPricing('feedInTariff', parseFloat(e.target.value))}
                          className="bg-green-50 dark:bg-green-900/20"
                        />
                      </div>
                      <div>
                        <Label>Export Limit (kW)</Label>
                        <Input
                          type="number"
                          value={currentScenario.electricityPricing.exportLimit}
                          onChange={(e) => updateElectricityPricing('exportLimit', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Demand Charge ($/kW)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.electricityPricing.demandCharge}
                          onChange={(e) => updateElectricityPricing('demandCharge', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentScenario.electricityPricing.netMeteringEnabled}
                        onCheckedChange={(checked) => updateElectricityPricing('netMeteringEnabled', checked)}
                      />
                      <Label>Net Metering Enabled</Label>
                    </div>
                  </TabsContent>

                  {/* CO2 Economics Tab */}
                  <TabsContent value="co2" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="flex items-center gap-1">
                          Liquid CO₂ Price ($/kg)
                          <Info className="w-3 h-3 text-gray-400" />
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.co2Economics.liquidCO2Price}
                          onChange={(e) => updateCO2Economics('liquidCO2Price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>CHP CO₂ Production (kg/hr)</Label>
                        <Input
                          type="number"
                          value={currentScenario.co2Economics.chpCO2Production}
                          onChange={(e) => updateCO2Economics('chpCO2Production', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Target PPM</Label>
                        <Input
                          type="number"
                          value={currentScenario.co2Economics.targetPPM}
                          onChange={(e) => updateCO2Economics('targetPPM', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Plant Uptake (kg/hr)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={currentScenario.co2Economics.plantUptakeRate}
                          onChange={(e) => updateCO2Economics('plantUptakeRate', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          Yield Increase (%)
                          <Info className="w-3 h-3 text-gray-400" />
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={currentScenario.co2Economics.yieldIncrease}
                          onChange={(e) => updateCO2Economics('yieldIncrease', parseFloat(e.target.value))}
                          className="bg-green-50 dark:bg-green-900/20"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          Crop Value ($/kg)
                          <Info className="w-3 h-3 text-gray-400" />
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentScenario.co2Economics.cropValuePerKg}
                          onChange={(e) => updateCO2Economics('cropValuePerKg', parseFloat(e.target.value))}
                          className="bg-green-50 dark:bg-green-900/20"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Strategy Tab */}
                  <TabsContent value="strategy" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Optimization Strategy</Label>
                        <Select
                          value={currentScenario.strategy}
                          onValueChange={(value: any) => 
                            setCurrentScenario(prev => ({ ...prev, strategy: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maximize_profit">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Maximize Profit
                              </div>
                            </SelectItem>
                            <SelectItem value="minimize_cost">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4" />
                                Minimize Cost
                              </div>
                            </SelectItem>
                            <SelectItem value="maximize_yield">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Maximize Yield
                              </div>
                            </SelectItem>
                            <SelectItem value="balanced">
                              <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4" />
                                Balanced Approach
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Natural Gas Price ($/m³)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={currentScenario.naturalGasPrice}
                          onChange={(e) => 
                            setCurrentScenario(prev => ({ 
                              ...prev, 
                              naturalGasPrice: parseFloat(e.target.value) 
                            }))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Constraints Tab */}
                  <TabsContent value="constraints" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Import (kW)</Label>
                        <Input
                          type="number"
                          value={currentScenario.constraints.maxImport}
                          onChange={(e) => 
                            setCurrentScenario(prev => ({
                              ...prev,
                              constraints: {
                                ...prev.constraints,
                                maxImport: parseInt(e.target.value)
                              }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Max Export (kW)</Label>
                        <Input
                          type="number"
                          value={currentScenario.constraints.maxExport}
                          onChange={(e) => 
                            setCurrentScenario(prev => ({
                              ...prev,
                              constraints: {
                                ...prev.constraints,
                                maxExport: parseInt(e.target.value)
                              }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Min DLI (mol/m²/day)</Label>
                        <Input
                          type="number"
                          value={currentScenario.constraints.minDLI}
                          onChange={(e) => 
                            setCurrentScenario(prev => ({
                              ...prev,
                              constraints: {
                                ...prev.constraints,
                                minDLI: parseFloat(e.target.value)
                              }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Min CO₂ Hours/Day</Label>
                        <Input
                          type="number"
                          value={currentScenario.constraints.minCO2Hours}
                          onChange={(e) => 
                            setCurrentScenario(prev => ({
                              ...prev,
                              constraints: {
                                ...prev.constraints,
                                minCO2Hours: parseInt(e.target.value)
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateScenario(scenario)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteScenario(scenario.id)}
                    disabled={scenarios.length === 1}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {activeResult && (
              <>
                {/* Daily Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Summary</CardTitle>
                    <CardDescription>
                      Key performance metrics for {scenario.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${activeResult.dailySummary.netProfit.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Daily Profit</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">
                          {activeResult.dailySummary.chpOperatingHours.toFixed(1)}h
                        </div>
                        <div className="text-sm text-gray-600">CHP Runtime</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">
                          {activeResult.dailySummary.gridExport.toFixed(0)} kWh
                        </div>
                        <div className="text-sm text-gray-600">Grid Export</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">
                          {activeResult.dailySummary.averageDLI.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Avg DLI</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hourly Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>24-Hour Schedule</CardTitle>
                    <CardDescription>
                      Optimized hourly operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HourlyScheduleChart schedule={activeResult.hourlySchedule} />
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Actionable insights to improve performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeResult.recommendations.map((rec, idx) => (
                        <Alert key={idx} className={`${
                          rec.priority === 'high' ? 'border-red-500' :
                          rec.priority === 'medium' ? 'border-yellow-500' :
                          'border-blue-500'
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{rec.title}</AlertTitle>
                          <AlertDescription>
                            <p>{rec.description}</p>
                            {rec.impact.costSavings && (
                              <p className="text-sm mt-1">
                                Potential savings: ${rec.impact.costSavings.toFixed(0)}/year
                              </p>
                            )}
                            {rec.impact.revenueIncrease && (
                              <p className="text-sm mt-1">
                                Revenue increase: ${rec.impact.revenueIncrease.toFixed(0)}/year
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sensitivity Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sensitivity Analysis</CardTitle>
                    <CardDescription>
                      Impact of parameter changes on profitability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeResult.sensitivity.variables.map((variable, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{variable.parameter}</span>
                            <span className="text-gray-600">
                              Current: ${variable.currentValue.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  variable.impactOnProfit > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.abs(variable.impactOnProfit) / 10}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm w-24 text-right">
                              ${variable.impactOnProfit.toFixed(2)}/day
                            </span>
                          </div>
                          {variable.breakEvenPoint && (
                            <p className="text-xs text-gray-500">
                              Break-even at: ${variable.breakEvenPoint.toFixed(3)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Scenario Comparison */}
      {results.size > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>
              Compare key metrics across all analyzed scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScenarioComparison scenarios={results} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}