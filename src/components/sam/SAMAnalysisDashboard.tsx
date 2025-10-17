/**
 * SAM Analysis Dashboard Component
 * Integrates NREL System Advisor Model with greenhouse energy analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, DollarSign, Zap, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';

import { SAMSystemConfig, SAMFinancialConfig, SAMResults, samIntegration } from '../../lib/sam-integration';
import { AdvancedFinancialConfig, DetailedFinancialResults, samFinancialEngine } from '../../lib/sam-financial-modeling';

interface SAMAnalysisDashboardProps {
  systemConfig?: Partial<SAMSystemConfig>;
  onAnalysisComplete?: (results: DetailedFinancialResults) => void;
}

export default function SAMAnalysisDashboard({ 
  systemConfig: initialConfig,
  onAnalysisComplete 
}: SAMAnalysisDashboardProps) {
  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SAMSystemConfig>({
    systemCapacity: 50,
    moduleType: 0,
    arrayType: 0,
    tilt: 25,
    azimuth: 180,
    gcr: 0.4,
    dcACRatio: 1.2,
    inverterEfficiency: 96,
    systemLosses: 14,
    latitude: 40.7589,
    longitude: -111.8883,
    timezone: -7,
    elevation: 1400,
    shadingFactor: 0.05,
    roofTransmittance: 0.9,
    loadProfile: 'greenhouse',
    useNSRDB: true,
    ...initialConfig
  });

  // Financial configuration state
  const [financialConfig, setFinancialConfig] = useState<AdvancedFinancialConfig>({
    analysisType: 'commercial',
    totalInstalledCost: 2500,
    totalInstalledCostPerWatt: 2.5,
    discountRate: 6,
    inflationRate: 2.5,
    taxRate: 30,
    analysisYears: 25,
    electricityRate: 0.12,
    demandCharge: 15,
    federalTaxCredit: 30,
    omCostFixed: 500,
    omCostVariable: 0.01,
    
    // Advanced configurations
    financing: {
      cashPurchase: true
    },
    incentives: {
      federal: {
        itc: 30,
        depreciation: 'MACRS',
        bonus_depreciation: 80
      },
      state: {
        taxCredit: 5,
        rebate: 400
      },
      utility: {
        rebate: 200
      },
      local: {
        propertyTaxExemption: true,
        salesTaxExemption: true
      }
    },
    market: {
      electricityRateEscalation: 3,
      netMeteringRate: 0.12
    },
    greenhouse: {
      currentEnergyBill: 2500,
      demandCharges: 15,
      cropProductionIncrease: 15,
      cropValueIncrease: 2.5,
      annualCropProduction: 50000,
      carbonCreditValue: 50
    }
  });

  // Analysis results
  const [results, setResults] = useState<DetailedFinancialResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Run SAM analysis
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get weather data
      const weatherData = await samIntegration.getWeatherData(
        systemConfig.latitude,
        systemConfig.longitude
      );
      
      // Run performance analysis
      const performanceResults = await samIntegration.runPerformanceAnalysis(
        systemConfig,
        weatherData
      );
      
      // Run detailed financial analysis
      const financialResults = await samFinancialEngine.analyzeFinancials(
        systemConfig,
        financialConfig,
        performanceResults.annualEnergyProduction!
      );
      
      setResults(financialResults);
      onAnalysisComplete?.(financialResults);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Format percentage
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Prepare chart data
  const cashFlowData = results?.detailedCashFlow.map(cf => ({
    year: cf.year,
    netCashFlow: cf.netCashFlow,
    cumulativeCashFlow: cf.cumulativeCashFlow,
    energyValue: cf.energyValue
  })) || [];

  const sensitivityData = results?.sensitivity.energyPriceChange.map(s => ({
    change: `${s.change}%`,
    npvImpact: s.npvImpact
  })) || [];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">SAM Financial Analysis</h2>
        <Button 
          onClick={runAnalysis} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="financials">Financial Details</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">System Capacity (kW)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={systemConfig.systemCapacity}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        systemCapacity: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tilt">Tilt Angle (°)</Label>
                    <Input
                      id="tilt"
                      type="number"
                      value={systemConfig.tilt}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        tilt: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="azimuth">Azimuth (°)</Label>
                    <Input
                      id="azimuth"
                      type="number"
                      value={systemConfig.azimuth}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        azimuth: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shading">Shading Factor</Label>
                    <Input
                      id="shading"
                      type="number"
                      step="0.01"
                      value={systemConfig.shadingFactor}
                      onChange={(e) => setSystemConfig(prev => ({
                        ...prev,
                        shadingFactor: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">System Cost ($/kW)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={financialConfig.totalInstalledCost}
                      onChange={(e) => setFinancialConfig(prev => ({
                        ...prev,
                        totalInstalledCost: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Electricity Rate ($/kWh)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={financialConfig.electricityRate}
                      onChange={(e) => setFinancialConfig(prev => ({
                        ...prev,
                        electricityRate: Number(e.target.value),
                        market: {
                          ...prev.market,
                          netMeteringRate: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="itc">Federal ITC (%)</Label>
                    <Input
                      id="itc"
                      type="number"
                      value={financialConfig.incentives.federal.itc}
                      onChange={(e) => setFinancialConfig(prev => ({
                        ...prev,
                        incentives: {
                          ...prev.incentives,
                          federal: {
                            ...prev.incentives.federal,
                            itc: Number(e.target.value)
                          }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount Rate (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={financialConfig.discountRate}
                      onChange={(e) => setFinancialConfig(prev => ({
                        ...prev,
                        discountRate: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Production</p>
                        <p className="text-2xl font-bold">
                          {Math.round(results.annualEnergyProduction).toLocaleString()} kWh
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">NPV</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.npv)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">IRR</p>
                        <p className="text-2xl font-bold">
                          {formatPercent(results.irr)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Payback</p>
                        <p className="text-2xl font-bold">
                          {results.paybackPeriod.toFixed(1)} years
                        </p>
                      </div>
                      <Calculator className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="netCashFlow" 
                        stroke="#8884d8" 
                        name="Annual Cash Flow"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCashFlow" 
                        stroke="#82ca9d" 
                        name="Cumulative Cash Flow"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Greenhouse Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Greenhouse Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Energy Savings</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(results.greenhouseBenefits.energyCostSavings)}/year
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Demand Savings</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(results.greenhouseBenefits.demandChargeSavings)}/year
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Production Increase</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(results.greenhouseBenefits.productionIncrease)}/year
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Carbon Credits</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(results.greenhouseBenefits.carbonCredits)}/year
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Run analysis to see results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          {results ? (
            <>
              {/* Financial Ratios */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-xl font-bold">{formatPercent(results.ratios.returnOnInvestment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROE</p>
                      <p className="text-xl font-bold">{formatPercent(results.ratios.returnOnEquity)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">LCOE</p>
                      <p className="text-xl font-bold">${results.lcoe.toFixed(3)}/kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profitability Index</p>
                      <p className="text-xl font-bold">{results.ratios.profitabilityIndex.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Federal Tax Savings</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(results.taxes.federalTaxSavings)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">State Tax Savings</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(results.taxes.stateTaxSavings)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Tax Benefits</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(results.taxes.federalTaxSavings + results.taxes.stateTaxSavings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Run analysis to see financial details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-6">
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle>Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="change" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="npvImpact" fill="#8884d8" name="NPV Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Run analysis to see sensitivity analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}