/**
 * Financial Analysis Wrapper Component
 * Adds professional financial analysis capabilities to any calculator
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, BarChart3, Target, 
  DollarSign, Calculator, FileText, Info
} from 'lucide-react';

import { 
  FinancialScenario, ScenarioResults, MonteCarloConfig, 
  MonteCarloResults, financialEngine 
} from '@/lib/financial/unified-financial-engine';

interface FinancialAnalysisWrapperProps {
  scenarios: FinancialScenario[];
  onAnalysisComplete?: (results: any) => void;
  showMonteCarloTab?: boolean;
  showSensitivityTab?: boolean;
  customTabs?: React.ReactNode;
}

export function FinancialAnalysisWrapper({
  scenarios,
  onAnalysisComplete,
  showMonteCarloTab = true,
  showSensitivityTab = true,
  customTabs
}: FinancialAnalysisWrapperProps) {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [analyzedScenarios, setAnalyzedScenarios] = useState<FinancialScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Analyze scenarios on mount or change
  useEffect(() => {
    if (scenarios.length > 0) {
      analyzeAllScenarios();
    }
  }, [scenarios]);

  const analyzeAllScenarios = async () => {
    setLoading(true);
    setProgress(0);
    
    const analyzed = scenarios.map((scenario, index) => {
      setProgress((index + 1) / scenarios.length * 100);
      return {
        ...scenario,
        results: financialEngine.analyzeScenario(scenario)
      };
    });
    
    setAnalyzedScenarios(analyzed);
    setSelectedScenario(analyzed[0]?.id || '');
    onAnalysisComplete?.(analyzed);
    setLoading(false);
  };

  const runMonteCarloSimulation = async () => {
    const scenario = analyzedScenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    setLoading(true);
    
    // Configure Monte Carlo simulation
    const config: MonteCarloConfig = {
      iterations: 5000,
      confidenceLevel: 95,
      variables: [
        {
          name: 'revenue',
          distribution: 'normal',
          parameters: {
            mean: scenario.assumptions.revenue[0]?.annualAmount || 0,
            stdDev: (scenario.assumptions.revenue[0]?.annualAmount || 0) * 0.15 // 15% std dev
          }
        },
        {
          name: 'costs',
          distribution: 'normal',
          parameters: {
            mean: scenario.assumptions.operatingCosts[0]?.annualAmount || 0,
            stdDev: (scenario.assumptions.operatingCosts[0]?.annualAmount || 0) * 0.1 // 10% std dev
          }
        }
      ]
    };
    
    const results = financialEngine.runMonteCarloSimulation(scenario, config);
    setMonteCarloResults(results);
    setLoading(false);
  };

  // Get scenario comparison data
  const getComparisonData = () => {
    return analyzedScenarios.map(scenario => ({
      name: scenario.name,
      NPV: scenario.results?.npv || 0,
      IRR: scenario.results?.irr || 0,
      Payback: scenario.results?.paybackPeriod || 0,
      ROI: scenario.results?.roi || 0
    }));
  };

  // Get sensitivity data for selected scenario
  const getSensitivityData = () => {
    const scenario = analyzedScenarios.find(s => s.id === selectedScenario);
    if (!scenario) return [];

    const sensitivityResults = financialEngine.performSensitivityAnalysis(
      scenario,
      [
        { name: 'initialInvestment', variations: [-20, -10, 0, 10, 20] },
        { name: 'discountRate', variations: [-20, -10, 0, 10, 20] }
      ]
    );

    return sensitivityResults[0]?.variations.map(v => ({
      change: `${v.change >= 0 ? '+' : ''}${v.change}%`,
      npvImpact: v.npvImpact,
      irrImpact: v.irrImpact
    })) || [];
  };

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Format percentage
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Analyzing scenarios...</p>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          {showSensitivityTab && <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>}
          {showMonteCarloTab && <TabsTrigger value="montecarlo">Risk Analysis</TabsTrigger>}
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {analyzedScenarios.map((scenario) => {
              const isSelected = scenario.id === selectedScenario;
              return (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      {scenario.recommended && (
                        <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                    {scenario.results && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">NPV</span>
                          <span className="font-semibold">{formatCurrency(scenario.results.npv)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">IRR</span>
                          <span className="font-semibold">{formatPercent(scenario.results.irr)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Payback</span>
                          <span className="font-semibold">{scenario.results.paybackPeriod.toFixed(1)} years</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cash Flow Chart for Selected Scenario */}
          {selectedScenario && (
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={analyzedScenarios.find(s => s.id === selectedScenario)?.results?.yearlyCashFlows}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="netCashFlow" stroke="#8884d8" name="Net Cash Flow" />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                    <Line type="monotone" dataKey="costs" stroke="#ff7c7c" name="Costs" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getComparisonData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  {['NPV', 'IRR', 'ROI'].map((metric, index) => (
                    <Radar
                      key={metric}
                      name={metric}
                      dataKey={metric}
                      stroke={['#8884d8', '#82ca9d', '#ffc658'][index]}
                      fill={['#8884d8', '#82ca9d', '#ffc658'][index]}
                      fillOpacity={0.6}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">NPV</th>
                      <th className="text-right p-2">IRR</th>
                      <th className="text-right p-2">Payback</th>
                      <th className="text-right p-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyzedScenarios.map((scenario) => (
                      <tr key={scenario.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{scenario.name}</td>
                        <td className="p-2 text-right">{formatCurrency(scenario.results?.npv || 0)}</td>
                        <td className="p-2 text-right">{formatPercent(scenario.results?.irr || 0)}</td>
                        <td className="p-2 text-right">{(scenario.results?.paybackPeriod || 0).toFixed(1)} yrs</td>
                        <td className="p-2 text-right">{formatPercent(scenario.results?.roi || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensitivity Tab */}
        {showSensitivityTab && (
          <TabsContent value="sensitivity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getSensitivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="change" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="npvImpact" fill="#8884d8" name="NPV Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This analysis shows how changes in key variables affect the Net Present Value (NPV) of your investment.
              </AlertDescription>
            </Alert>
          </TabsContent>
        )}

        {/* Monte Carlo Tab */}
        {showMonteCarloTab && (
          <TabsContent value="montecarlo" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Monte Carlo Risk Analysis</h3>
              <Button 
                onClick={runMonteCarloSimulation}
                disabled={loading || !selectedScenario}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
            </div>

            {monteCarloResults && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Probability of Success</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPercent(monteCarloResults.probabilityOfSuccess)}
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <Badge className={getRiskColor(monteCarloResults.riskProfile.level)}>
                            {monteCarloResults.riskProfile.level.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expected NPV</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(monteCarloResults.metrics.npv.mean)}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>NPV Distribution (5,000 simulations)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">5th Percentile</p>
                          <p className="font-semibold">{formatCurrency(monteCarloResults.metrics.npv.percentiles.p5)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">25th Percentile</p>
                          <p className="font-semibold">{formatCurrency(monteCarloResults.metrics.npv.percentiles.p25)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Median</p>
                          <p className="font-semibold">{formatCurrency(monteCarloResults.metrics.npv.percentiles.p50)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">75th Percentile</p>
                          <p className="font-semibold">{formatCurrency(monteCarloResults.metrics.npv.percentiles.p75)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">95th Percentile</p>
                          <p className="font-semibold">{formatCurrency(monteCarloResults.metrics.npv.percentiles.p95)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        )}

        {/* Custom tabs from parent component */}
        {customTabs}
      </Tabs>
    </div>
  );
}