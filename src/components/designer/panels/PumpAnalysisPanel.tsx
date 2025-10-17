'use client';

import React, { useState, useMemo } from 'react';
import { Gauge, Zap, TrendingUp, AlertTriangle, Settings, Activity, DollarSign, Wrench } from 'lucide-react';
import { 
  pumpPerformanceDatabase, 
  findOptimalPumpOperatingPoint,
  PumpPerformance,
  PumpCurve 
} from '@/lib/flow-measurement';

interface PumpAnalysisPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PumpAnalysisPanel({ isOpen = true, onClose }: PumpAnalysisPanelProps) {
  const [selectedPump, setSelectedPump] = useState<string>('little-giant-nk-2');
  const [systemFlowDemand, setSystemFlowDemand] = useState(15); // GPM
  const [systemPressureDemand, setSystemPressureDemand] = useState(25); // PSI
  const [operatingHours, setOperatingHours] = useState(8); // hours per day
  const [electricityCost, setElectricityCost] = useState(0.12); // $/kWh
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const pump = pumpPerformanceDatabase[selectedPump];

  // Find optimal operating point
  const operatingAnalysis = useMemo(() => {
    if (!pump) return null;
    return findOptimalPumpOperatingPoint(pump, {
      flowRate: systemFlowDemand,
      pressure: systemPressureDemand
    });
  }, [pump, systemFlowDemand, systemPressureDemand]);

  // Calculate daily operating costs
  const operatingCosts = useMemo(() => {
    if (!operatingAnalysis) return null;
    
    const dailyPowerConsumption = (operatingAnalysis.powerConsumption * operatingHours) / 1000; // kWh
    const dailyCost = dailyPowerConsumption * electricityCost;
    const monthlyCost = dailyCost * 30;
    const annualCost = dailyCost * 365;
    
    return {
      dailyPowerConsumption,
      dailyCost,
      monthlyCost,
      annualCost
    };
  }, [operatingAnalysis, operatingHours, electricityCost]);

  // Calculate pump efficiency at different operating points
  const efficiencyAnalysis = useMemo(() => {
    if (!pump) return null;
    
    const currentEfficiency = operatingAnalysis?.efficiency || 0;
    const peakEfficiency = pump.peakEfficiency;
    const efficiencyRatio = currentEfficiency / peakEfficiency;
    
    // Calculate energy waste
    const idealPowerDraw = operatingAnalysis ? 
      (operatingAnalysis.powerConsumption * peakEfficiency) / currentEfficiency : 0;
    const powerWaste = operatingAnalysis ? 
      operatingAnalysis.powerConsumption - idealPowerDraw : 0;
    
    return {
      currentEfficiency,
      peakEfficiency,
      efficiencyRatio,
      powerWaste,
      efficiencyStatus: efficiencyRatio > 0.9 ? 'excellent' : 
                      efficiencyRatio > 0.8 ? 'good' : 
                      efficiencyRatio > 0.7 ? 'fair' : 'poor'
    };
  }, [pump, operatingAnalysis]);

  // System head calculations
  const systemHead = useMemo(() => {
    // Basic system head calculation
    const staticHead = 10; // Assume 10 ft static head
    const frictionHead = systemPressureDemand * 2.31; // Convert PSI to feet
    const totalHead = staticHead + frictionHead;
    
    return {
      staticHead,
      frictionHead,
      totalHead,
      totalPressure: totalHead / 2.31 // Convert back to PSI
    };
  }, [systemPressureDemand]);

  // NPSH calculations
  const npshAnalysis = useMemo(() => {
    if (!pump) return null;
    
    const atmosphericPressure = 14.7; // PSI at sea level
    const vaporPressure = 0.5; // PSI for water at 70°F
    const suctionLoss = 2; // Assume 2 PSI suction line losses
    
    const npshAvailable = ((atmosphericPressure - vaporPressure - suctionLoss) * 2.31); // Convert to feet
    const npshMargin = npshAvailable - pump.npshr;
    
    return {
      npshAvailable,
      npshRequired: pump.npshr,
      npshMargin,
      adequate: npshMargin > 3 // Need at least 3 ft margin
    };
  }, [pump]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Pump Analysis</h2>
        </div>
        <p className="text-sm text-gray-400">Precision pump performance and efficiency analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pump Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pump Model</label>
          <select
            value={selectedPump}
            onChange={(e) => setSelectedPump(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {Object.entries(pumpPerformanceDatabase).map(([id, pump]) => (
              <option key={id} value={id}>
                {pump.manufacturer} {pump.model}
              </option>
            ))}
          </select>
          
          {pump && (
            <div className="mt-2 p-3 bg-gray-800 rounded text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Max Flow:</span>
                  <span className="text-white ml-1">{pump.maxFlowRate} GPM</span>
                </div>
                <div>
                  <span className="text-gray-400">Max Pressure:</span>
                  <span className="text-white ml-1">{pump.maxPressure} PSI</span>
                </div>
                <div>
                  <span className="text-gray-400">Motor HP:</span>
                  <span className="text-white ml-1">{pump.motorHP} HP</span>
                </div>
                <div>
                  <span className="text-gray-400">Peak Efficiency:</span>
                  <span className="text-green-400 ml-1">{pump.peakEfficiency}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Demand */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Demand
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Flow Rate (GPM)</label>
              <input
                type="number"
                value={systemFlowDemand}
                onChange={(e) => setSystemFlowDemand(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pressure (PSI)</label>
              <input
                type="number"
                value={systemPressureDemand}
                onChange={(e) => setSystemPressureDemand(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Operating Hours/Day</label>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Electricity Cost ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={electricityCost}
                onChange={(e) => setElectricityCost(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Operating Point Analysis */}
        {operatingAnalysis && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Operating Point
            </h3>
            <div className="bg-gray-800 rounded p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Actual Flow Rate:</span>
                <span className="text-white">{operatingAnalysis.operatingPoint.flowRate} GPM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Actual Pressure:</span>
                <span className="text-white">{operatingAnalysis.operatingPoint.pressure} PSI</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Operating Efficiency:</span>
                <span className={`font-medium ${
                  operatingAnalysis.efficiency > 70 ? 'text-green-400' :
                  operatingAnalysis.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {operatingAnalysis.efficiency}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Power Draw:</span>
                <span className="text-white">{operatingAnalysis.powerConsumption} W</span>
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Analysis */}
        {efficiencyAnalysis && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Efficiency Analysis
            </h3>
            <div className="bg-gray-800 rounded p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Efficiency:</span>
                <span className={`font-medium ${
                  efficiencyAnalysis.efficiencyStatus === 'excellent' ? 'text-green-400' :
                  efficiencyAnalysis.efficiencyStatus === 'good' ? 'text-blue-400' :
                  efficiencyAnalysis.efficiencyStatus === 'fair' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {efficiencyAnalysis.currentEfficiency}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Peak Efficiency:</span>
                <span className="text-green-400">{efficiencyAnalysis.peakEfficiency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Efficiency Ratio:</span>
                <span className="text-white">{(efficiencyAnalysis.efficiencyRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Power Waste:</span>
                <span className="text-red-400">{efficiencyAnalysis.powerWaste.toFixed(0)} W</span>
              </div>
              
              {/* Efficiency Status Badge */}
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  efficiencyAnalysis.efficiencyStatus === 'excellent' ? 'bg-green-900/50 text-green-400' :
                  efficiencyAnalysis.efficiencyStatus === 'good' ? 'bg-blue-900/50 text-blue-400' :
                  efficiencyAnalysis.efficiencyStatus === 'fair' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'
                }`}>
                  {efficiencyAnalysis.efficiencyStatus.toUpperCase()} Efficiency
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Operating Costs */}
        {operatingCosts && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Operating Costs
            </h3>
            <div className="bg-gray-800 rounded p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Daily Power:</span>
                <span className="text-white">{operatingCosts.dailyPowerConsumption.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Daily Cost:</span>
                <span className="text-green-400">${operatingCosts.dailyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly Cost:</span>
                <span className="text-yellow-400">${operatingCosts.monthlyCost.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Annual Cost:</span>
                <span className="text-red-400">${operatingCosts.annualCost.toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Pump Curve Visualization */}
        {pump && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Curve
            </h3>
            <div className="bg-gray-800 rounded p-3">
              <div className="h-32 relative bg-gray-900 rounded overflow-hidden">
                {/* Draw pump curve */}
                {pump.curves.map((point, i) => {
                  const x = (point.flowRate / pump.maxFlowRate) * 100;
                  const y = 100 - (point.pressure / pump.maxPressure) * 100;
                  const nextPoint = pump.curves[i + 1];
                  
                  return (
                    <div key={i}>
                      {/* Point */}
                      <div
                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${point.flowRate} GPM @ ${point.pressure} PSI (${point.efficiency}%)`}
                      />
                      {/* Line to next point */}
                      {nextPoint && (
                        <svg className="absolute inset-0 pointer-events-none">
                          <line
                            x1={`${x}%`}
                            y1={`${y}%`}
                            x2={`${(nextPoint.flowRate / pump.maxFlowRate) * 100}%`}
                            y2={`${100 - (nextPoint.pressure / pump.maxPressure) * 100}%`}
                            stroke="#60a5fa"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
                
                {/* Operating point */}
                {operatingAnalysis && (
                  <div
                    className="absolute w-3 h-3 bg-red-400 rounded-full border-2 border-white"
                    style={{
                      left: `${(operatingAnalysis.operatingPoint.flowRate / pump.maxFlowRate) * 100}%`,
                      top: `${100 - (operatingAnalysis.operatingPoint.pressure / pump.maxPressure) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title="Current Operating Point"
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 GPM</span>
                <span>{pump.maxFlowRate} GPM</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Pressure: 0 - {pump.maxPressure} PSI
              </div>
            </div>
          </div>
        )}

        {/* NPSH Analysis */}
        {npshAnalysis && (
          <div>
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-300 mb-3"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Advanced Metrics
              </div>
              <span className="text-xs">{showAdvancedMetrics ? '▼' : '▶'}</span>
            </button>
            
            {showAdvancedMetrics && (
              <div className="space-y-4">
                {/* System Head */}
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-xs font-medium text-gray-300 mb-2">System Head Analysis</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Static Head:</span>
                      <span className="text-white">{systemHead.staticHead} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Friction Head:</span>
                      <span className="text-white">{systemHead.frictionHead.toFixed(1)} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Head:</span>
                      <span className="text-white">{systemHead.totalHead.toFixed(1)} ft</span>
                    </div>
                  </div>
                </div>

                {/* NPSH Analysis */}
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-xs font-medium text-gray-300 mb-2">NPSH Analysis</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">NPSH Available:</span>
                      <span className="text-white">{npshAnalysis.npshAvailable.toFixed(1)} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NPSH Required:</span>
                      <span className="text-white">{npshAnalysis.npshRequired} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NPSH Margin:</span>
                      <span className={npshAnalysis.adequate ? 'text-green-400' : 'text-red-400'}>
                        {npshAnalysis.npshMargin.toFixed(1)} ft
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        npshAnalysis.adequate ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {npshAnalysis.adequate ? 'ADEQUATE' : 'INSUFFICIENT'} NPSH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {((efficiencyAnalysis?.efficiencyStatus === 'poor') || (npshAnalysis && !npshAnalysis.adequate)) && (
          <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              Performance Alerts
            </div>
            <div className="space-y-1 text-xs">
              {efficiencyAnalysis?.efficiencyStatus === 'poor' && (
                <div className="text-red-400">
                  • Poor efficiency ({efficiencyAnalysis.currentEfficiency}%) - consider pump sizing or system modifications
                </div>
              )}
              {npshAnalysis && !npshAnalysis.adequate && (
                <div className="text-red-400">
                  • Insufficient NPSH - risk of cavitation. Check suction line and elevation.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}