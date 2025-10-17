'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  PieChart, 
  BarChart3, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Building,
  Droplets,
  Wind,
  Lightbulb,
  Activity
} from 'lucide-react';
import { useFacilityDesign } from '../context/FacilityDesignContext';
import { useDesigner } from '../context/DesignerContext';

interface CostAnalysisPanelProps {
  onClose: () => void;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  icon: React.ComponentType<any>;
  color: string;
  details: {
    equipment: number;
    installation: number;
    maintenance: number;
    energy: number;
  };
}

interface ROIProjection {
  year: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  energySavings: number;
  maintenanceCosts: number;
  operatingCosts: number;
}

export function CostAnalysisPanel({ onClose }: CostAnalysisPanelProps) {
  const { state: facilityState, exportFacilityReport } = useFacilityDesign();
  const { state } = useDesigner();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1-year' | '5-year' | '10-year' | '20-year'>('10-year');
  const [energyRate, setEnergyRate] = useState(0.12); // $/kWh
  const [inflationRate, setInflationRate] = useState(0.03); // 3%
  const [discountRate, setDiscountRate] = useState(0.05); // 5%
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [roiProjections, setROIProjections] = useState<ROIProjection[]>([]);
  const [paybackPeriod, setPaybackPeriod] = useState(0);
  const [npv, setNPV] = useState(0);
  const [irr, setIRR] = useState(0);

  // Calculate comprehensive cost analysis
  useEffect(() => {
    calculateCostAnalysis();
  }, [facilityState, selectedTimeframe, energyRate, inflationRate, discountRate]);

  const calculateCostAnalysis = () => {
    const { metrics, systems } = facilityState;
    
    // Calculate cost breakdown by system
    const breakdown: CostBreakdown[] = [];
    const totalCost = metrics.totalCost.equipment + metrics.totalCost.installation + 
                     metrics.totalCost.maintenance + metrics.totalCost.energy;
    
    const systemCategories = [
      { key: 'electrical', name: 'Electrical & Lighting', icon: Lightbulb, color: '#fbbf24' },
      { key: 'hvac', name: 'HVAC Systems', icon: Wind, color: '#60a5fa' },
      { key: 'structural', name: 'Structural & Racking', icon: Building, color: '#a78bfa' },
      { key: 'irrigation', name: 'Irrigation Systems', icon: Droplets, color: '#34d399' },
      { key: 'environmental', name: 'Environmental Controls', icon: Activity, color: '#f87171' }
    ];

    systemCategories.forEach(category => {
      const systemList = Object.values(systems).filter(sys => sys.type === category.key);
      const systemCost = systemList.reduce((sum, sys) => 
        sum + sys.costs.equipment + sys.costs.installation + sys.costs.maintenance + sys.costs.energy, 0);
      
      if (systemCost > 0) {
        breakdown.push({
          category: category.name,
          amount: systemCost,
          percentage: (systemCost / totalCost) * 100,
          icon: category.icon,
          color: category.color,
          details: {
            equipment: systemList.reduce((sum, sys) => sum + sys.costs.equipment, 0),
            installation: systemList.reduce((sum, sys) => sum + sys.costs.installation, 0),
            maintenance: systemList.reduce((sum, sys) => sum + sys.costs.maintenance, 0),
            energy: systemList.reduce((sum, sys) => sum + sys.costs.energy, 0)
          }
        });
      }
    });

    setCostBreakdown(breakdown);

    // Calculate ROI projections
    const years = selectedTimeframe === '1-year' ? 1 : 
                  selectedTimeframe === '5-year' ? 5 :
                  selectedTimeframe === '10-year' ? 10 : 20;
    
    const initialInvestment = metrics.totalCost.equipment + metrics.totalCost.installation;
    const annualEnergyCost = metrics.totalElectricalLoad * 8760 / 1000 * energyRate; // kWh/year * $/kWh
    const annualEnergySavings = annualEnergyCost * 0.25; // Assume 25% energy savings from efficient design
    const annualMaintenanceCost = metrics.totalCost.maintenance;
    
    const projections: ROIProjection[] = [];
    let cumulativeCashFlow = -initialInvestment;
    let foundPayback = false;
    
    for (let year = 1; year <= years; year++) {
      const inflationFactor = Math.pow(1 + inflationRate, year - 1);
      const yearlyEnergySavings = annualEnergySavings * inflationFactor;
      const yearlyMaintenanceCost = annualMaintenanceCost * inflationFactor;
      const yearlyOperatingCost = yearlyMaintenanceCost + (annualEnergyCost - yearlyEnergySavings);
      
      const cashFlow = yearlyEnergySavings - yearlyMaintenanceCost;
      cumulativeCashFlow += cashFlow;
      
      if (!foundPayback && cumulativeCashFlow > 0) {
        setPaybackPeriod(year);
        foundPayback = true;
      }
      
      projections.push({
        year,
        cashFlow,
        cumulativeCashFlow,
        energySavings: yearlyEnergySavings,
        maintenanceCosts: yearlyMaintenanceCost,
        operatingCosts: yearlyOperatingCost
      });
    }
    
    setROIProjections(projections);
    
    // Calculate NPV
    const npvValue = projections.reduce((sum, proj) => {
      const discountFactor = Math.pow(1 + discountRate, proj.year);
      return sum + (proj.cashFlow / discountFactor);
    }, -initialInvestment);
    
    setNPV(npvValue);
    
    // Calculate IRR (simplified)
    const totalCashFlow = projections.reduce((sum, proj) => sum + proj.cashFlow, 0);
    const irrValue = (totalCashFlow / initialInvestment) * (1 / years) * 100;
    setIRR(irrValue);
  };

  const exportCostReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      facility: exportFacilityReport().facility,
      costAnalysis: {
        totalInvestment: facilityState.metrics.totalCost.equipment + facilityState.metrics.totalCost.installation,
        annualOperatingCost: facilityState.metrics.totalCost.maintenance + facilityState.metrics.totalCost.energy,
        costBreakdown,
        roiMetrics: {
          paybackPeriod,
          npv,
          irr
        },
        projections: roiProjections,
        assumptions: {
          energyRate,
          inflationRate,
          discountRate,
          timeframe: selectedTimeframe
        }
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-cost-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalInvestment = facilityState.metrics.totalCost.equipment + facilityState.metrics.totalCost.installation;
  const annualOperatingCost = facilityState.metrics.totalCost.maintenance + facilityState.metrics.totalCost.energy;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cost Analysis & ROI</h2>
              <p className="text-gray-400">Comprehensive financial analysis of facility design</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1-year">1 Year</option>
              <option value="5-year">5 Years</option>
              <option value="10-year">10 Years</option>
              <option value="20-year">20 Years</option>
            </select>
            <button
              onClick={exportCostReport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Summary Cards */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Investment Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Investment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Investment:</span>
                    <span className="text-white font-medium">{formatCurrency(totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annual Operating:</span>
                    <span className="text-white font-medium">{formatCurrency(annualOperatingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Area:</span>
                    <span className="text-white font-medium">{facilityState.metrics.totalArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost per sq ft:</span>
                    <span className="text-white font-medium">{formatCurrency(totalInvestment / facilityState.metrics.totalArea)}</span>
                  </div>
                </div>
              </div>

              {/* ROI Metrics */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">ROI Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payback Period:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{paybackPeriod} years</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">NPV ({selectedTimeframe}):</span>
                    <div className="flex items-center gap-1">
                      {npv >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-medium ${npv >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(npv)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">IRR:</span>
                    <div className="flex items-center gap-1">
                      {irr >= 10 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={`font-medium ${irr >= 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {irr.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Settings */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Analysis Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Energy Rate ($/kWh)</label>
                    <input
                      type="number"
                      value={energyRate}
                      onChange={(e) => setEnergyRate(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Inflation Rate (%)</label>
                    <input
                      type="number"
                      value={inflationRate * 100}
                      onChange={(e) => setInflationRate(Number(e.target.value) / 100)}
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      value={discountRate * 100}
                      onChange={(e) => setDiscountRate(Number(e.target.value) / 100)}
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Charts and Breakdown */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Cost Breakdown */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Cost Breakdown by System</h3>
                  <button
                    onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showDetailedBreakdown ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <div className="space-y-3">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded" style={{ backgroundColor: item.color + '20' }}>
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <div>
                            <div className="text-white font-medium">{item.category}</div>
                            <div className="text-sm text-gray-400">{item.percentage.toFixed(1)}% of total</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(item.amount)}</div>
                        </div>
                      </div>
                      {showDetailedBreakdown && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Equipment:</span>
                              <span className="text-white">{formatCurrency(item.details.equipment)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Installation:</span>
                              <span className="text-white">{formatCurrency(item.details.installation)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Maintenance:</span>
                              <span className="text-white">{formatCurrency(item.details.maintenance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Energy:</span>
                              <span className="text-white">{formatCurrency(item.details.energy)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Projections */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">ROI Projections ({selectedTimeframe})</h3>
                <div className="space-y-2">
                  {roiProjections.slice(0, 10).map((proj, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="text-sm text-gray-400">Year {proj.year}</div>
                      <div className="text-sm text-white">{formatCurrency(proj.cashFlow)}</div>
                      <div className={`text-sm font-medium ${proj.cumulativeCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(proj.cumulativeCashFlow)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Recommendations</h3>
                <div className="space-y-3">
                  {npv >= 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-green-400 font-medium">Positive NPV</div>
                        <div className="text-sm text-gray-300">
                          This project shows positive net present value, indicating it's financially viable.
                        </div>
                      </div>
                    </div>
                  )}
                  {paybackPeriod <= 5 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-blue-400 font-medium">Favorable Payback Period</div>
                        <div className="text-sm text-gray-300">
                          {paybackPeriod} year payback period is within acceptable range for facility investments.
                        </div>
                      </div>
                    </div>
                  )}
                  {irr >= 15 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-purple-400 font-medium">Strong IRR</div>
                        <div className="text-sm text-gray-300">
                          {irr.toFixed(1)}% internal rate of return exceeds typical cost of capital.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}