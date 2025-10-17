'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calculator, TrendingUp, Zap, Leaf, Package, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'cost' | 'roi';
  fixtures: any[];
  room: any;
  powerMetrics: any;
}

export default function FinancialAnalysisModal({
  isOpen,
  onClose,
  activeTab,
  fixtures,
  room,
  powerMetrics
}: FinancialAnalysisModalProps) {
  // Cost estimator state
  const [electricityRate, setElectricityRate] = useState(0.12);
  const [hoursPerDay, setHoursPerDay] = useState(18);
  const [installationCost, setInstallationCost] = useState(500);
  
  // ROI calculator state
  const [cropYieldPerSqFt, setCropYieldPerSqFt] = useState(0.5);
  const [pricePerPound, setPricePerPound] = useState(2000);
  const [cyclesPerYear, setCyclesPerYear] = useState(5);
  const [operatingCosts, setOperatingCosts] = useState(1000);

  // Calculate costs
  const totalWattage = fixtures.reduce((sum, f) => sum + f.model.specifications.power, 0);
  const dailyKwh = (totalWattage / 1000) * hoursPerDay;
  const monthlyKwh = dailyKwh * 30;
  const yearlyKwh = dailyKwh * 365;
  const monthlyElectricityCost = monthlyKwh * electricityRate;
  const yearlyElectricityCost = yearlyKwh * electricityRate;
  const fixturesCost = fixtures.reduce((sum, f) => sum + (f.model.price || 500), 0);
  const totalInitialCost = fixturesCost + installationCost;

  // Calculate ROI
  const growArea = (room.dimensions.length * room.dimensions.width) / (room.unit === 'meters' ? 1 : 10.764);
  const yieldPerCycle = growArea * cropYieldPerSqFt;
  const yearlyYield = yieldPerCycle * cyclesPerYear;
  const yearlyRevenue = yearlyYield * pricePerPound;
  const yearlyProfit = yearlyRevenue - yearlyElectricityCost - operatingCosts;
  const paybackPeriod = totalInitialCost / yearlyProfit;
  const fiveYearROI = ((yearlyProfit * 5 - totalInitialCost) / totalInitialCost) * 100;

  // Generate chart data
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    cost: monthlyElectricityCost,
    cumulative: monthlyElectricityCost * (i + 1)
  }));

  const roiData = Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    revenue: yearlyRevenue * (i + 1),
    costs: (yearlyElectricityCost + operatingCosts) * (i + 1) + totalInitialCost,
    profit: yearlyProfit * (i + 1) - totalInitialCost
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-gray-800 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Financial Analysis</DialogTitle>
          <DialogDescription className="text-gray-400">
            Calculate costs and return on investment for your lighting design
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="cost" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Cost Estimator
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              ROI Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Input Parameters */}
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
                    <Input
                      id="electricity-rate"
                      type="number"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                      step="0.01"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours-per-day">Operating Hours/Day</Label>
                    <Input
                      id="hours-per-day"
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installation-cost">Installation Cost ($)</Label>
                    <Input
                      id="installation-cost"
                      type="number"
                      value={installationCost}
                      onChange={(e) => setInstallationCost(parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost Summary */}
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span>Fixtures Cost</span>
                    </div>
                    <span className="font-bold">${fixturesCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Total Power</span>
                    </div>
                    <span className="font-bold">{totalWattage}W</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span>Monthly Electricity</span>
                    </div>
                    <span className="font-bold">${monthlyElectricityCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Yearly Electricity</span>
                    </div>
                    <span className="font-bold">${yearlyElectricityCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Initial Cost</span>
                      <span className="text-2xl font-bold text-green-400">
                        ${totalInitialCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Chart */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Monthly Operating Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#E5E7EB' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Cumulative Cost"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ROI Parameters */}
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Yield Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="yield-per-sqft">Yield per sq ft (lbs)</Label>
                    <Input
                      id="yield-per-sqft"
                      type="number"
                      value={cropYieldPerSqFt}
                      onChange={(e) => setCropYieldPerSqFt(parseFloat(e.target.value))}
                      step="0.1"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-per-pound">Price per pound ($)</Label>
                    <Input
                      id="price-per-pound"
                      type="number"
                      value={pricePerPound}
                      onChange={(e) => setPricePerPound(parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cycles-per-year">Harvest Cycles/Year</Label>
                    <Input
                      id="cycles-per-year"
                      type="number"
                      value={cyclesPerYear}
                      onChange={(e) => setCyclesPerYear(parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating-costs">Other Operating Costs/Year ($)</Label>
                    <Input
                      id="operating-costs"
                      type="number"
                      value={operatingCosts}
                      onChange={(e) => setOperatingCosts(parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ROI Summary */}
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">ROI Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-400" />
                      <span>Yearly Yield</span>
                    </div>
                    <span className="font-bold">{yearlyYield.toFixed(1)} lbs</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span>Yearly Revenue</span>
                    </div>
                    <span className="font-bold">${yearlyRevenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Yearly Profit</span>
                    </div>
                    <span className="font-bold text-green-400">${yearlyProfit.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Payback Period</span>
                    </div>
                    <span className="font-bold">{paybackPeriod.toFixed(1)} years</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">5-Year ROI</span>
                      <span className="text-2xl font-bold text-green-400">
                        {fiveYearROI.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Chart */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">5-Year Financial Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#E5E7EB' }}
                      />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="costs" fill="#EF4444" name="Total Costs" />
                      <Bar dataKey="profit" fill="#8B5CF6" name="Net Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}