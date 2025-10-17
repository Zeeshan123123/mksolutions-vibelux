/**
 * Unified Financial Dashboard
 * Comprehensive financial analysis center combining all calculators:
 * - SAM Solar Analysis
 * - TCO Calculator  
 * - Energy Savings Calculator
 * - Equipment Leasing Calculator
 * - Cost Estimation Engine
 * - Business Case Generator
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Building, 
  Leaf, 
  Sun, 
  FileText, 
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  Package,
  Users,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

// Import our financial analysis components
import IntegratedSAMTCOCalculator from './IntegratedSAMTCOCalculator';
import SAMAnalysisDashboard from './sam/SAMAnalysisDashboard';

// Financial analysis interfaces
interface FinancialSummary {
  totalInvestment: number;
  annualSavings: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0-100%
}

interface ScenarioComparison {
  name: string;
  investment: number;
  annualSavings: number;
  roi: number;
  payback: number;
  npv: number;
  sustainability: number; // CO2 reduction
  recommended: boolean;
}

interface BusinessMetrics {
  // Revenue Impact
  revenueIncrease: number; // % from improved yields/quality
  marketPremium: number; // $ premium for sustainable produce
  
  // Operational Efficiency
  energyEfficiency: number; // % improvement
  laborProductivity: number; // % improvement
  maintenanceReduction: number; // % reduction
  
  // Risk Mitigation
  energyPriceHedging: number; // % protection from rate increases
  sustainabilityCompliance: boolean;
  gridIndependence: number; // % self-sufficiency
  
  // Market Position
  competitiveAdvantage: string[];
  certificationEligible: string[];
}

export default function UnifiedFinancialDashboard() {
  const [activeAnalysis, setActiveAnalysis] = useState<'overview' | 'sam-tco' | 'sam-only' | 'scenarios' | 'business-case'>('overview');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Sample scenario data - would be calculated from different configurations
  const scenarios: ScenarioComparison[] = [
    {
      name: 'Solar + Greenhouse Optimization',
      investment: 3700000,
      annualSavings: 485000,
      roi: 13.1,
      payback: 7.6,
      npv: 2100000,
      sustainability: 280000, // kg CO2/year
      recommended: true
    },
    {
      name: 'Greenhouse Only (No Solar)',
      investment: 2500000,
      annualSavings: 120000,
      roi: 4.8,
      payback: 20.8,
      npv: -450000,
      sustainability: 0,
      recommended: false
    },
    {
      name: 'Solar + Basic Facility',
      investment: 2200000,
      annualSavings: 280000,
      roi: 12.7,
      payback: 7.9,
      npv: 1650000,
      sustainability: 250000,
      recommended: false
    },
    {
      name: 'Leased Solar + Greenhouse',
      investment: 2800000, // Lower upfront, higher ongoing
      annualSavings: 365000,
      roi: 13.0,
      payback: 7.7,
      npv: 1890000,
      sustainability: 280000,
      recommended: false
    }
  ];

  const businessMetrics: BusinessMetrics = {
    revenueIncrease: 15, // 15% yield increase + premium pricing
    marketPremium: 1.85, // $1.85/lb premium for carbon-neutral produce
    energyEfficiency: 45, // 45% reduction in energy costs
    laborProductivity: 25, // 25% improvement from automation
    maintenanceReduction: 20, // 20% lower maintenance costs
    energyPriceHedging: 80, // 80% protection from utility rate increases
    sustainabilityCompliance: true,
    gridIndependence: 75, // 75% energy self-sufficiency
    competitiveAdvantage: [
      'Carbon-neutral certification',
      'Premium pricing for sustainable produce',
      'Energy cost predictability',
      'Grid independence resilience',
      'ESG investment attraction'
    ],
    certificationEligible: [
      'LEED Gold/Platinum',
      'Organic certification compatibility',
      'Carbon-neutral produce labeling',
      'Renewable energy certificates (RECs)',
      'Corporate sustainability reporting'
    ]
  };

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Format percentage
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Format large numbers
  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Chart data for scenario comparison
  const scenarioChartData = scenarios.map(scenario => ({
    name: scenario.name.split(' ')[0], // Shortened name for chart
    ROI: scenario.roi,
    Payback: scenario.payback,
    NPV: scenario.npv / 1000000, // Convert to millions
    Investment: scenario.investment / 1000000
  }));

  // Risk assessment colors
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Financial Analysis Center</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive financial modeling for smart greenhouse operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Business Case
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-xl font-bold">{formatCurrency(3700000)}</p>
              </div>
              <Building className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Savings</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(485000)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combined ROI</p>
                <p className="text-xl font-bold text-green-600">13.1%</p>
              </div>
              <Calculator className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payback Period</p>
                <p className="text-xl font-bold">7.6 years</p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
                <p className="text-xl font-bold text-green-600">280K kg/yr</p>
              </div>
              <Leaf className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeAnalysis} onValueChange={(value) => setActiveAnalysis(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sam-tco">Integrated Analysis</TabsTrigger>
          <TabsTrigger value="sam-only">Solar Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="business-case">Business Case</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Investment vs Returns Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Investment" fill="#3b82f6" name="Investment ($M)" />
                    <Bar dataKey="NPV" fill="#10b981" name="NPV ($M)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ROI Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="ROI" stroke="#8b5cf6" strokeWidth={3} name="ROI %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Energy Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Energy Cost Reduction</span>
                  <Badge className="bg-green-100 text-green-800">{formatPercent(businessMetrics.energyEfficiency)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Grid Independence</span>
                  <Badge className="bg-blue-100 text-blue-800">{formatPercent(businessMetrics.gridIndependence)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Price Protection</span>
                  <Badge className="bg-purple-100 text-purple-800">{formatPercent(businessMetrics.energyPriceHedging)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Revenue Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Yield Increase</span>
                  <Badge className="bg-green-100 text-green-800">{formatPercent(businessMetrics.revenueIncrease)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Premium Pricing</span>
                  <Badge className="bg-green-100 text-green-800">${businessMetrics.marketPremium}/lb</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Labor Productivity</span>
                  <Badge className="bg-blue-100 text-blue-800">{formatPercent(businessMetrics.laborProductivity)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Sustainability Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>CO₂ Reduction</span>
                  <Badge className="bg-green-100 text-green-800">280K kg/yr</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Renewable Energy</span>
                  <Badge className="bg-green-100 text-green-800">100%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ESG Compliance</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment & Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Low Risk Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Technology maturity (LED/Solar)</li>
                    <li>• Proven market demand</li>
                    <li>• Government incentives</li>
                    <li>• Long equipment lifespans</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">Medium Risk Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Energy price volatility</li>
                    <li>• Crop market pricing</li>
                    <li>• Initial learning curve</li>
                    <li>• Weather variability</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Risk Mitigation</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 25-year solar performance warranty</li>
                    <li>• Diversified crop portfolio</li>
                    <li>• Performance monitoring systems</li>
                    <li>• Insurance coverage available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sam-tco">
          <IntegratedSAMTCOCalculator />
        </TabsContent>

        <TabsContent value="sam-only">
          <SAMAnalysisDashboard />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Scenario</th>
                      <th className="text-right p-3">Investment</th>
                      <th className="text-right p-3">Annual Savings</th>
                      <th className="text-right p-3">ROI</th>
                      <th className="text-right p-3">Payback</th>
                      <th className="text-right p-3">NPV</th>
                      <th className="text-right p-3">CO₂ Impact</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario, index) => (
                      <tr key={index} className={`border-b ${scenario.recommended ? 'bg-green-50' : ''}`}>
                        <td className="p-3 font-medium">{scenario.name}</td>
                        <td className="p-3 text-right">{formatCurrency(scenario.investment)}</td>
                        <td className="p-3 text-right text-green-600">{formatCurrency(scenario.annualSavings)}</td>
                        <td className="p-3 text-right">{formatPercent(scenario.roi)}</td>
                        <td className="p-3 text-right">{scenario.payback.toFixed(1)} years</td>
                        <td className="p-3 text-right">{formatCurrency(scenario.npv)}</td>
                        <td className="p-3 text-right">{formatNumber(scenario.sustainability)} kg</td>
                        <td className="p-3 text-center">
                          {scenario.recommended ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          ) : (
                            <Badge variant="outline">Alternative</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sensitivity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Variables Impact on NPV</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Electricity Rate +20%</span>
                      <span className="text-green-600 font-bold">+$420K NPV</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>System Cost -10%</span>
                      <span className="text-green-600 font-bold">+$370K NPV</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Crop Price +15%</span>
                      <span className="text-green-600 font-bold">+$1.2M NPV</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span>Solar Production -15%</span>
                      <span className="text-red-600 font-bold">-$315K NPV</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Break-Even Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Min Solar Production:</span>
                      <span className="font-bold">750,000 kWh/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max System Cost:</span>
                      <span className="font-bold">$2,800/kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Electricity Rate:</span>
                      <span className="font-bold">$0.095/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Crop Yield:</span>
                      <span className="font-bold">0.42 lbs/sq ft</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-case" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Investment Recommendation: PROCEED</strong> - The integrated solar greenhouse project demonstrates strong financial returns with significant sustainability benefits and competitive advantages.
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none">
                <p>
                  The proposed smart greenhouse facility with integrated solar energy system represents a compelling investment opportunity 
                  that delivers both financial returns and strategic market positioning. The project achieves a 13.1% ROI with 7.6-year 
                  payback while establishing carbon-neutral operations that command premium pricing in the marketplace.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {businessMetrics.competitiveAdvantage.map((advantage, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certification Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {businessMetrics.certificationEligible.map((cert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">
                        <Lightbulb className="w-3 h-3 mr-1" />
                      </Badge>
                      <span className="text-sm">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Implementation Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Phase 1: Engineering & Permits (Months 1-3)</h4>
                    <p className="text-sm text-muted-foreground">Detailed engineering, permitting, financing, and contractor selection</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Phase 2: Site Preparation (Months 4-6)</h4>
                    <p className="text-sm text-muted-foreground">Site preparation, foundation, structural work, and utility connections</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Phase 3: System Installation (Months 7-9)</h4>
                    <p className="text-sm text-muted-foreground">Solar system, greenhouse equipment, and control systems installation</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Phase 4: Commissioning & Production (Months 10-12)</h4>
                    <p className="text-sm text-muted-foreground">System testing, crop trials, staff training, and commercial production ramp-up</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}