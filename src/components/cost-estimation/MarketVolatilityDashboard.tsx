/**
 * Market Volatility Dashboard
 * Real-time market analysis and procurement recommendations
 */

"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, 
  Package, Calendar, Shield, BarChart3, Info, Clock
} from 'lucide-react'

import { 
  marketVolatilityEngine, 
  MarketForecast, 
  SupplyChainRisk,
  VolatilityMetrics 
} from '@/lib/cost-estimation/market-volatility-engine'
import { MaterialCost, LaborRate } from '@/lib/cost-estimation/cost-estimator'

// Sample materials for demonstration
const sampleMaterials: MaterialCost[] = [
  {
    id: '1',
    name: 'Structural Steel Beams',
    category: 'structural',
    unit: 'ton',
    unitCost: 850,
    currency: 'USD',
    supplier: 'Steel Corp International',
    leadTime: 45,
    minimumOrder: 10,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: 'China',
    specifications: { grade: 'A36', width: '12"', weight: '45lb/ft' },
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'Copper Wire #12 AWG',
    category: 'electrical',
    unit: '1000 ft',
    unitCost: 425,
    currency: 'USD',
    supplier: 'ElectroSupply Co',
    leadTime: 14,
    minimumOrder: 50,
    priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    location: 'North America',
    specifications: { gauge: '12', insulation: 'THHN', voltage: '600V' },
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'LED Fixtures - Industrial',
    category: 'electrical',
    unit: 'unit',
    unitCost: 1200,
    currency: 'USD',
    supplier: 'Lighting Solutions Ltd',
    leadTime: 30,
    minimumOrder: 25,
    priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    location: 'Europe',
    specifications: { wattage: '400W', lumens: '52000', lifespan: '50000hrs' },
    lastUpdated: new Date()
  }
];

const sampleLaborRates: LaborRate[] = [
  {
    id: '1',
    role: 'Master Electrician',
    skillLevel: 'expert',
    hourlyRate: 85,
    currency: 'USD',
    location: 'San Francisco',
    unionRate: true,
    benefits: 35,
    overhead: 25,
    availability: 'low',
    certifications: ['Master License', 'OSHA 30'],
    lastUpdated: new Date()
  },
  {
    id: '2',
    role: 'Journeyman Plumber',
    skillLevel: 'mid',
    hourlyRate: 65,
    currency: 'USD',
    location: 'San Francisco',
    unionRate: true,
    benefits: 30,
    overhead: 20,
    availability: 'medium',
    certifications: ['Journeyman License'],
    lastUpdated: new Date()
  }
];

export default function MarketVolatilityDashboard() {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCost>(sampleMaterials[0])
  const [forecast, setForecast] = useState<MarketForecast | null>(null)
  const [supplyChainRisk, setSupplyChainRisk] = useState<SupplyChainRisk | null>(null)
  const [volatilityMetrics, setVolatilityMetrics] = useState<VolatilityMetrics | null>(null)
  const [projectStartDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) // 3 months out
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate')
  const [activeTab, setActiveTab] = useState('market-forecast')

  // Generate forecasts on material selection
  useEffect(() => {
    if (selectedMaterial) {
      const materialCategory = selectedMaterial.category === 'structural' ? 'steel' : 
                              selectedMaterial.category === 'electrical' ? 'copper' : 
                              'general';
      
      const newForecast = marketVolatilityEngine.generateMarketForecast(
        materialCategory,
        selectedMaterial.unitCost
      );
      setForecast(newForecast);

      const risk = marketVolatilityEngine.analyzeSupplyChainRisk(selectedMaterial);
      setSupplyChainRisk(risk);

      const volatility = marketVolatilityEngine.calculateVolatility(materialCategory);
      setVolatilityMetrics(volatility);
    }
  }, [selectedMaterial]);

  // Get procurement recommendations
  const procurementRecommendations = marketVolatilityEngine.generateProcurementRecommendations(
    sampleMaterials,
    projectStartDate,
    riskTolerance
  );

  // Get labor projections
  const laborProjections = marketVolatilityEngine.projectLaborCosts(
    sampleLaborRates,
    3, // 3 months
    'San Francisco'
  );

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Get recommendation icon
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy_now': return <TrendingUp className="w-4 h-4" />
      case 'wait': return <Clock className="w-4 h-4" />
      case 'hedge': return <Shield className="w-4 h-4" />
      case 'split_orders': return <Package className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Market Volatility Analysis</h2>
          <p className="text-muted-foreground">
            Real-time pricing forecasts and procurement recommendations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={riskTolerance} onValueChange={(value: any) => setRiskTolerance(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Volatility</p>
                <p className="text-2xl font-bold">
                  {volatilityMetrics ? `${(volatilityMetrics.historicalVolatility * 100).toFixed(1)}%` : '-'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Supply Chain Risk</p>
                <Badge className={supplyChainRisk ? getRiskColor(supplyChainRisk.riskLevel) : ''}>
                  {supplyChainRisk?.riskLevel.toUpperCase() || '-'}
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
                <p className="text-sm text-muted-foreground">3M Price Forecast</p>
                <p className="text-xl font-bold">
                  {forecast?.predictions[1] ? 
                    <span className={forecast.predictions[1].expectedPrice > forecast.currentPrice ? 'text-red-600' : 'text-green-600'}>
                      {forecast.predictions[1].expectedPrice > forecast.currentPrice ? '+' : ''}
                      {((forecast.predictions[1].expectedPrice - forecast.currentPrice) / forecast.currentPrice * 100).toFixed(1)}%
                    </span> : '-'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimal Stock Days</p>
                <p className="text-2xl font-bold">
                  {supplyChainRisk?.stockpileRecommendation || '-'} days
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market-forecast">Market Forecast</TabsTrigger>
          <TabsTrigger value="procurement">Procurement Strategy</TabsTrigger>
          <TabsTrigger value="supply-chain">Supply Chain Risk</TabsTrigger>
          <TabsTrigger value="labor-costs">Labor Projections</TabsTrigger>
        </TabsList>

        {/* Market Forecast Tab */}
        <TabsContent value="market-forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Price Forecast Analysis</span>
                <Select 
                  value={selectedMaterial.id} 
                  onValueChange={(id) => {
                    const material = sampleMaterials.find(m => m.id === id)
                    if (material) setSelectedMaterial(material)
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleMaterials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecast && (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={[
                        { period: 'Current', price: forecast.currentPrice, min: forecast.currentPrice, max: forecast.currentPrice },
                        ...forecast.predictions.map(p => ({
                          period: p.period,
                          price: p.expectedPrice,
                          min: p.range.low,
                          max: p.range.high
                        }))
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="max" stroke="#fbbf24" fill="#fef3c7" name="Upper Range" />
                        <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#dbeafe" name="Expected Price" />
                        <Area type="monotone" dataKey="min" stroke="#10b981" fill="#d1fae5" name="Lower Range" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Market Drivers</h4>
                      <div className="space-y-2">
                        {forecast.drivers.map((driver, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant={driver.impact === 'positive' ? 'default' : 'secondary'}>
                              {driver.impact}
                            </Badge>
                            <span className="text-sm">{driver.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Risk Factors</h4>
                      <div className="space-y-2">
                        {forecast.riskFactors.map((risk, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{risk.name}</span>
                              <Badge variant="outline">{risk.probability}% likely</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procurement Strategy Tab */}
        <TabsContent value="procurement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procurementRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{rec.material}</h4>
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation)}
                        <Badge className={
                          rec.recommendation === 'buy_now' ? 'bg-green-100 text-green-800' :
                          rec.recommendation === 'wait' ? 'bg-blue-100 text-blue-800' :
                          rec.recommendation === 'hedge' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {rec.recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Price:</span>
                        <p className="font-medium">{formatCurrency(rec.currentPrice)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Optimal Timing:</span>
                        <p className="font-medium">{rec.optimalTiming.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Potential Savings:</span>
                        <p className="font-medium text-green-600">{formatCurrency(rec.potentialSavings)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Recommendations are based on historical price patterns, current market conditions, and your selected risk tolerance. 
              Always consult with procurement specialists for large purchases.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Supply Chain Risk Tab */}
        <TabsContent value="supply-chain" className="space-y-6">
          {supplyChainRisk && (
            <Card>
              <CardHeader>
                <CardTitle>Supply Chain Risk Analysis: {selectedMaterial.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Risk Factor Analysis</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={Object.entries(supplyChainRisk.factors).map(([key, value]) => ({
                        factor: key.replace(/([A-Z])/g, ' $1').trim(),
                        risk: value
                      }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarRadiusAxis domain={[0, 10]} />
                        <Radar name="Risk Level" dataKey="risk" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Risk Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Overall Risk Level:</span>
                          <Badge className={getRiskColor(supplyChainRisk.riskLevel)}>
                            {supplyChainRisk.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Alternative Suppliers:</span>
                          <span className="font-medium">{supplyChainRisk.alternativeSuppliers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommended Stock:</span>
                          <span className="font-medium">{supplyChainRisk.stockpileRecommendation} days</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Mitigation Strategies</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Diversify supplier base across regions</li>
                        <li>• Maintain {supplyChainRisk.stockpileRecommendation} days of safety stock</li>
                        <li>• Consider long-term contracts for price stability</li>
                        <li>• Monitor geopolitical developments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Labor Projections Tab */}
        <TabsContent value="labor-costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Labor Cost Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {laborProjections.map((projection, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{projection.role}</h4>
                      <Badge variant={projection.confidence > 80 ? 'default' : 'secondary'}>
                        {projection.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Current Rate:</span>
                        <p className="text-xl font-medium">{formatCurrency(projection.currentRate)}/hr</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Projected Rate:</span>
                        <p className="text-xl font-medium">{formatCurrency(projection.projectedRate)}/hr</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Change:</span>
                        <p className="text-xl font-medium text-orange-600">
                          +{((projection.projectedRate - projection.currentRate) / projection.currentRate * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {projection.factors.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">Contributing factors:</span>
                        <div className="flex gap-2 mt-1">
                          {projection.factors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Labor costs in major markets are projected to increase 4-8% annually due to skilled worker shortages 
              and inflation. Consider locking in rates through long-term contracts where possible.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}