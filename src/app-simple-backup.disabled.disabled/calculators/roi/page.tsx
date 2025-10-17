'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ROICalculatorPage() {
  const [initialCost, setInitialCost] = useState(50000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(8000);
  const [monthlyOperating, setMonthlyOperating] = useState(3000);
  const [roiMonths, setRoiMonths] = useState(0);
  const [annualProfit, setAnnualProfit] = useState(0);
  const [roiPercentage, setRoiPercentage] = useState(0);

  // Calculate ROI metrics
  useEffect(() => {
    const monthlyProfit = monthlyRevenue - monthlyOperating;
    const yearlyProfit = monthlyProfit * 12;
    
    if (monthlyProfit > 0) {
      const paybackMonths = initialCost / monthlyProfit;
      setRoiMonths(paybackMonths);
      setAnnualProfit(yearlyProfit);
      setRoiPercentage((yearlyProfit / initialCost) * 100);
    } else {
      setRoiMonths(0);
      setAnnualProfit(0);
      setRoiPercentage(0);
    }
  }, [initialCost, monthlyRevenue, monthlyOperating]);

  const getROIStatus = () => {
    if (roiMonths <= 12) return { status: 'Excellent', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (roiMonths <= 24) return { status: 'Good', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    if (roiMonths <= 36) return { status: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    if (roiMonths <= 60) return { status: 'Poor', color: 'text-orange-400', bg: 'bg-orange-900/20' };
    return { status: 'Very Poor', color: 'text-red-400', bg: 'bg-red-900/20' };
  };

  const roiStatus = getROIStatus();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/calculators">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Calculators
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ROI Calculator</h1>
              <p className="text-gray-400">Return on Investment analysis for facility projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Financial Inputs
              </CardTitle>
              <CardDescription>
                Enter your project costs and revenue projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <DollarSign className="w-4 h-4" />
                  Initial Investment ($)
                </label>
                <input
                  type="number"
                  value={initialCost}
                  onChange={(e) => setInitialCost(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  step="1000"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Total upfront costs (equipment, installation, setup)
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Monthly Revenue ($)
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  step="100"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Expected gross monthly revenue
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Operating Costs ($)
                </label>
                <input
                  type="number"
                  value={monthlyOperating}
                  onChange={(e) => setMonthlyOperating(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  step="100"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Electricity, labor, materials, maintenance
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Cost Breakdown Guide</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <div>• Electricity: 30-50% of operating costs</div>
                  <div>• Labor: 20-35% of operating costs</div>
                  <div>• Materials: 15-25% of operating costs</div>
                  <div>• Other: 5-15% of operating costs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>
                  Investment return calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-4xl font-bold mb-1">{roiMonths > 0 ? roiMonths.toFixed(1) : '∞'}</div>
                    <div className="text-gray-400 mb-2">Months to Break Even</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${roiStatus.bg} ${roiStatus.color} font-semibold text-sm`}>
                      {roiStatus.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{roiPercentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">Annual ROI</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">${annualProfit.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Annual Profit</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Monthly Revenue:</span>
                  <span className="font-semibold text-green-400">${monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Costs:</span>
                  <span className="font-semibold text-red-400">-${monthlyOperating.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Monthly Profit:</span>
                    <span className={`font-semibold ${(monthlyRevenue - monthlyOperating) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(monthlyRevenue - monthlyOperating).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span>Excellent ROI</span>
                  <span className="font-semibold">{'< 12 months'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span>Good ROI</span>
                  <span className="font-semibold">12-24 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg">
                  <span>Acceptable ROI</span>
                  <span className="font-semibold">24-36 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                  <span>High Risk</span>
                  <span className="font-semibold">{'> 36 months'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5-Year Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Year 1 Profit:</span>
                    <span>${annualProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5-Year Total:</span>
                    <span className="font-semibold text-green-400">${(annualProfit * 5).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total ROI:</span>
                    <span className="font-semibold text-blue-400">{((annualProfit * 5 / initialCost) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-400 font-semibold">🚀 Test Mode - Full ROI Calculator Available</p>
        </div>
      </div>
    </div>
  );
}