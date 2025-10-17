/**
 * Enhanced TCO Calculator V2
 * Demonstrates integration with Unified Financial Engine
 * Adds Monte Carlo simulation, sensitivity analysis, and scenario comparison
 */

"use client"
import { useState, useEffect } from 'react'
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Lightbulb,
  Info
} from 'lucide-react'

import { FinancialAnalysisWrapper } from './financial/FinancialAnalysisWrapper'
import { FinancialScenario } from '@/lib/financial/unified-financial-engine'

interface LightingSystem {
  technology: 'LED' | 'HPS' | 'CMH' | 'Fluorescent'
  fixtures: number
  wattsPerFixture: number
  costPerFixture: number
  lifespan: number // hours
  maintenanceInterval: number // months
  maintenanceCost: number // per event
  efficacyLoss: number // % per year
}

interface FacilityConfig {
  area: number // sq ft
  operatingHours: number // hours per day
  daysPerYear: number
  electricityRate: number // $/kWh
  laborRate: number // $/hour
  discountRate: number // %
  analysisYears: number
}

export default function EnhancedTCOCalculatorV2() {
  const [facility, setFacility] = useState<FacilityConfig>({
    area: 10000,
    operatingHours: 16,
    daysPerYear: 365,
    electricityRate: 0.12,
    laborRate: 35,
    discountRate: 6,
    analysisYears: 10
  });

  const [systems] = useState<{ [key: string]: LightingSystem }>({
    led: {
      technology: 'LED',
      fixtures: 100,
      wattsPerFixture: 660,
      costPerFixture: 1800,
      lifespan: 50000,
      maintenanceInterval: 24,
      maintenanceCost: 50,
      efficacyLoss: 3
    },
    hps: {
      technology: 'HPS',
      fixtures: 120,
      wattsPerFixture: 1000,
      costPerFixture: 450,
      lifespan: 24000,
      maintenanceInterval: 6,
      maintenanceCost: 75,
      efficacyLoss: 5
    },
    cmh: {
      technology: 'CMH',
      fixtures: 110,
      wattsPerFixture: 630,
      costPerFixture: 550,
      lifespan: 20000,
      maintenanceInterval: 12,
      maintenanceCost: 65,
      efficacyLoss: 4
    }
  });

  const [financialScenarios, setFinancialScenarios] = useState<FinancialScenario[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Convert lighting systems to financial scenarios
  useEffect(() => {
    const scenarios = Object.entries(systems).map(([key, system]) => {
      const initialInvestment = calculateInitialInvestment(system);
      const annualEnergy = calculateAnnualEnergyCost(system, facility);
      const annualMaintenance = calculateAnnualMaintenance(system, facility);
      
      const scenario: FinancialScenario = {
        id: key,
        name: `${system.technology} Lighting System`,
        description: `${system.fixtures} fixtures @ ${system.wattsPerFixture}W each`,
        assumptions: {
          initialInvestment,
          revenue: [], // TCO doesn't have revenue
          operatingCosts: [
            {
              name: 'Energy',
              annualAmount: annualEnergy,
              inflationRate: 3.5 // Energy inflation
            },
            {
              name: 'Maintenance',
              annualAmount: annualMaintenance,
              inflationRate: 2.5 // Labor inflation
            },
            {
              name: 'Replacement',
              annualAmount: calculateAnnualReplacementCost(system, facility),
              inflationRate: 2.0
            }
          ],
          discountRate: facility.discountRate,
          taxRate: 0, // TCO typically doesn't include tax benefits
          analysisYears: facility.analysisYears,
          riskFactors: [
            {
              name: 'Energy Price Volatility',
              category: 'market',
              impact: system.technology === 'HPS' ? 'high' : 'medium',
              probability: 70,
              financialImpact: annualEnergy * 0.2 // 20% potential increase
            },
            {
              name: 'Equipment Failure',
              category: 'operational',
              impact: 'medium',
              probability: 20,
              financialImpact: initialInvestment * 0.1,
              mitigation: 'Extended warranty coverage'
            }
          ]
        },
        recommended: key === 'led' // LED typically recommended
      };
      
      return scenario;
    });
    
    setFinancialScenarios(scenarios);
  }, [systems, facility]);

  // Calculate initial investment
  const calculateInitialInvestment = (system: LightingSystem): number => {
    const fixtureCost = system.fixtures * system.costPerFixture;
    const installationCost = system.fixtures * 150; // $150/fixture installation
    const controlsCost = system.technology === 'LED' ? 15000 : 5000; // Smart controls for LED
    const electricalUpgrade = system.technology === 'HPS' ? 20000 : 0; // May need electrical upgrade
    
    return fixtureCost + installationCost + controlsCost + electricalUpgrade;
  };

  // Calculate annual energy cost
  const calculateAnnualEnergyCost = (system: LightingSystem, config: FacilityConfig): number => {
    const totalWatts = system.fixtures * system.wattsPerFixture;
    const annualHours = config.operatingHours * config.daysPerYear;
    const annualKWh = (totalWatts / 1000) * annualHours;
    
    // Apply efficiency loss over time (average over analysis period)
    const avgEfficiencyLoss = (system.efficacyLoss * config.analysisYears) / 2;
    const adjustedKWh = annualKWh * (1 + avgEfficiencyLoss / 100);
    
    return adjustedKWh * config.electricityRate;
  };

  // Calculate annual maintenance cost
  const calculateAnnualMaintenance = (system: LightingSystem, config: FacilityConfig): number => {
    const maintenanceEventsPerYear = 12 / system.maintenanceInterval;
    const laborHoursPerEvent = system.fixtures * 0.1; // 0.1 hour per fixture
    const laborCost = laborHoursPerEvent * config.laborRate * maintenanceEventsPerYear;
    const partsCost = system.maintenanceCost * system.fixtures * maintenanceEventsPerYear / 12;
    
    return laborCost + partsCost;
  };

  // Calculate annual replacement cost
  const calculateAnnualReplacementCost = (system: LightingSystem, config: FacilityConfig): number => {
    const annualHours = config.operatingHours * config.daysPerYear;
    const yearsToReplacement = system.lifespan / annualHours;
    
    if (yearsToReplacement >= config.analysisYears) {
      return 0; // No replacement needed during analysis period
    }
    
    const replacementCost = system.fixtures * system.costPerFixture;
    return replacementCost / yearsToReplacement;
  };

  // Handle analysis completion
  const handleAnalysisComplete = (results: any) => {
    setAnalysisComplete(true);
    logger.info('system', 'Analysis results:', { data: results });
  };

  // Custom TCO-specific tabs
  const customTCOTabs = (
    <>
      <TabsContent value="energy-analysis" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Energy Consumption Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(systems).map(([key, system]) => {
                const annualKWh = (system.fixtures * system.wattsPerFixture / 1000) * 
                                 (facility.operatingHours * facility.daysPerYear);
                return (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{system.technology}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Annual kWh:</span>
                        <span className="font-medium">{Math.round(annualKWh).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Cost:</span>
                        <span className="font-medium">
                          ${Math.round(annualKWh * facility.electricityRate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>W/sq ft:</span>
                        <span className="font-medium">
                          {((system.fixtures * system.wattsPerFixture) / facility.area).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Energy costs typically represent 40-60% of total operating expenses in horticultural lighting. 
            LED systems can reduce energy consumption by 40-50% compared to HPS.
          </AlertDescription>
        </Alert>
      </TabsContent>

      <TabsContent value="replacement-schedule" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Replacement Schedule & Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(systems).map(([key, system]) => {
                const annualHours = facility.operatingHours * facility.daysPerYear;
                const replacementYears = system.lifespan / annualHours;
                const replacementsNeeded = Math.floor(facility.analysisYears / replacementYears);
                
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{system.technology} System</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lifespan:</span>
                        <p className="font-medium">{system.lifespan.toLocaleString()} hours</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Years to Replace:</span>
                        <p className="font-medium">{replacementYears.toFixed(1)} years</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Replacements in {facility.analysisYears}y:</span>
                        <p className="font-medium">{replacementsNeeded}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Replace Cost:</span>
                        <p className="font-medium">
                          ${(replacementsNeeded * system.fixtures * system.costPerFixture).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Enhanced TCO Calculator</h2>
          <p className="text-muted-foreground">
            Professional financial analysis with Monte Carlo simulation
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          Unified Financial Engine
        </Badge>
      </div>

      {/* Facility Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Facility Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="area">Facility Area (sq ft)</Label>
              <Input
                id="area"
                type="number"
                value={facility.area}
                onChange={(e) => setFacility(prev => ({ ...prev, area: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="hours">Operating Hours/Day</Label>
              <Input
                id="hours"
                type="number"
                value={facility.operatingHours}
                onChange={(e) => setFacility(prev => ({ ...prev, operatingHours: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="rate">Electricity Rate ($/kWh)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={facility.electricityRate}
                onChange={(e) => setFacility(prev => ({ ...prev, electricityRate: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="years">Analysis Period (years)</Label>
              <Input
                id="years"
                type="number"
                value={facility.analysisYears}
                onChange={(e) => setFacility(prev => ({ ...prev, analysisYears: Number(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Analysis Wrapper */}
      <FinancialAnalysisWrapper
        scenarios={financialScenarios}
        onAnalysisComplete={handleAnalysisComplete}
        showMonteCarloTab={true}
        showSensitivityTab={true}
        customTabs={customTCOTabs}
      />

      {/* Key Insights */}
      {analysisComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Energy Efficiency:</strong> LED systems typically offer 40-50% energy savings 
                  compared to HPS, resulting in significant operational cost reductions over the analysis period.
                </AlertDescription>
              </Alert>
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <strong>Total Cost Impact:</strong> While LED systems have higher upfront costs, 
                  the reduced energy consumption and longer lifespan typically result in the lowest 
                  total cost of ownership over 5-10 years.
                </AlertDescription>
              </Alert>
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Risk Analysis:</strong> Energy price volatility represents the highest risk factor. 
                  LED systems are less sensitive to electricity rate increases due to lower consumption.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}