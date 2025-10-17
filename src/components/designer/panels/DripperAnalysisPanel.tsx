'use client';

import React, { useState, useMemo } from 'react';
import { Droplets, Calculator, TrendingUp, AlertTriangle, Target, Gauge, Info, Settings } from 'lucide-react';
import { 
  dripperNozzleDatabase, 
  calculateDripperFlowRate, 
  calculatePressureLoss, 
  analyzeDripperLineUniformity,
  recommendDripperSpacing,
  calculateSystemFlowRequirements,
  DripperNozzle 
} from '@/lib/flow-measurement';

interface DripperAnalysisPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DripperAnalysisPanel({ isOpen = true, onClose }: DripperAnalysisPanelProps) {
  const [selectedDripper, setSelectedDripper] = useState<string>('netafim-pc-cnl-05');
  const [lineLength, setLineLength] = useState(100); // feet
  const [tubeDiameter, setTubeDiameter] = useState(0.5); // inches
  const [systemPressure, setSystemPressure] = useState(15); // PSI
  const [elevation, setElevation] = useState(0); // feet
  const [plantCount, setPlantCount] = useState(50);
  const [dripperSpacing, setDripperSpacing] = useState(12); // inches
  const [soilType, setSoilType] = useState<'sand' | 'loam' | 'clay' | 'coco' | 'rockwool'>('coco');
  const [irrigationDuration, setIrrigationDuration] = useState(15); // minutes
  const [cyclesPerDay, setCyclesPerDay] = useState(4);
  const [simulatedFlowRates, setSimulatedFlowRates] = useState<number[]>([]);

  const dripper = dripperNozzleDatabase[selectedDripper];

  // Calculate actual flow rate at system pressure
  const actualFlowRate = useMemo(() => {
    if (!dripper) return 0;
    return calculateDripperFlowRate(dripper, systemPressure);
  }, [dripper, systemPressure]);

  // Calculate pressure losses
  const pressureLoss = useMemo(() => {
    const flowRateGPM = (plantCount * actualFlowRate) / 60; // Convert GPH to GPM
    return calculatePressureLoss(lineLength, tubeDiameter, flowRateGPM, elevation);
  }, [lineLength, tubeDiameter, actualFlowRate, elevation, plantCount]);

  // Calculate pressure at end of line
  const endPressure = systemPressure - pressureLoss.total;

  // Generate simulated flow rates along the line
  const lineAnalysis = useMemo(() => {
    if (!dripper) return null;
    
    const dripperCount = Math.ceil(lineLength * 12 / dripperSpacing); // Convert feet to inches
    const rates: number[] = [];
    
    for (let i = 0; i < dripperCount; i++) {
      const position = (i / (dripperCount - 1)); // 0 to 1
      const pressureAtPosition = systemPressure - (pressureLoss.total * position);
      const flowAtPosition = calculateDripperFlowRate(dripper, pressureAtPosition);
      rates.push(flowAtPosition);
    }
    
    return {
      dripperCount,
      flowRates: rates,
      uniformity: analyzeDripperLineUniformity(rates)
    };
  }, [dripper, lineLength, dripperSpacing, systemPressure, pressureLoss]);

  // Calculate system requirements
  const systemRequirements = useMemo(() => {
    return calculateSystemFlowRequirements(
      plantCount,
      actualFlowRate,
      irrigationDuration,
      cyclesPerDay
    );
  }, [plantCount, actualFlowRate, irrigationDuration, cyclesPerDay]);

  // Get spacing recommendations
  const spacingRecommendation = useMemo(() => {
    return recommendDripperSpacing(soilType, actualFlowRate, 24); // Assume 24" plant spacing
  }, [soilType, actualFlowRate]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Dripper Analysis</h2>
        </div>
        <p className="text-sm text-gray-400">Precision flow measurement and uniformity analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dripper Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Dripper Type</label>
          <select
            value={selectedDripper}
            onChange={(e) => setSelectedDripper(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {Object.entries(dripperNozzleDatabase).map(([id, dripper]) => (
              <option key={id} value={id}>
                {dripper.manufacturer} {dripper.model}
              </option>
            ))}
          </select>
          
          {dripper && (
            <div className="mt-2 p-3 bg-gray-800 rounded text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Nominal Flow:</span>
                  <span className="text-white ml-1">{dripper.nominalFlowRate} GPH</span>
                </div>
                <div>
                  <span className="text-gray-400">Rated Pressure:</span>
                  <span className="text-white ml-1">{dripper.ratedPressure} PSI</span>
                </div>
                <div>
                  <span className="text-gray-400">CV:</span>
                  <span className="text-white ml-1">{dripper.coefficientOfVariation}%</span>
                </div>
                <div>
                  <span className="text-gray-400">PC:</span>
                  <span className={`ml-1 ${dripper.pressureCompensating ? 'text-green-400' : 'text-red-400'}`}>
                    {dripper.pressureCompensating ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Configuration */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Configuration
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">System Pressure (PSI)</label>
              <input
                type="number"
                value={systemPressure}
                onChange={(e) => setSystemPressure(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Line Length (ft)</label>
              <input
                type="number"
                value={lineLength}
                onChange={(e) => setLineLength(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tube Diameter (in)</label>
              <select
                value={tubeDiameter}
                onChange={(e) => setTubeDiameter(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value={0.375}>3/8"</option>
                <option value={0.5}>1/2"</option>
                <option value={0.625}>5/8"</option>
                <option value={0.75}>3/4"</option>
                <option value={1}>1"</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Elevation (ft)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Plant Count</label>
              <input
                type="number"
                value={plantCount}
                onChange={(e) => setPlantCount(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dripper Spacing (in)</label>
              <input
                type="number"
                value={dripperSpacing}
                onChange={(e) => setDripperSpacing(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Flow Performance */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Flow Performance
          </h3>
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Actual Flow Rate:</span>
              <span className={`font-medium ${
                Math.abs(actualFlowRate - dripper.nominalFlowRate) / dripper.nominalFlowRate > 0.1 
                  ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {actualFlowRate.toFixed(3)} GPH
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pressure at End:</span>
              <span className={`font-medium ${
                endPressure < dripper.minPressure ? 'text-red-400' : 
                endPressure > dripper.maxPressure ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {endPressure.toFixed(1)} PSI
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Friction Loss:</span>
              <span className="text-white">{pressureLoss.friction.toFixed(2)} PSI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Elevation Loss:</span>
              <span className="text-white">{pressureLoss.elevation.toFixed(2)} PSI</span>
            </div>
          </div>
        </div>

        {/* Line Uniformity Analysis */}
        {lineAnalysis && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Line Uniformity
            </h3>
            <div className="bg-gray-800 rounded p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Dripper Count:</span>
                <span className="text-white">{lineAnalysis.dripperCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uniformity Coefficient:</span>
                <span className={`font-medium ${
                  lineAnalysis.uniformity.coefficient > 95 ? 'text-green-400' :
                  lineAnalysis.uniformity.coefficient > 90 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {lineAnalysis.uniformity.coefficient.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Distribution Uniformity:</span>
                <span className={`font-medium ${
                  lineAnalysis.uniformity.distribution > 90 ? 'text-green-400' :
                  lineAnalysis.uniformity.distribution > 85 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {lineAnalysis.uniformity.distribution.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Emission Uniformity:</span>
                <span className={`font-medium ${
                  lineAnalysis.uniformity.emission > 95 ? 'text-green-400' :
                  lineAnalysis.uniformity.emission > 90 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {lineAnalysis.uniformity.emission.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Flow Rate Chart */}
            <div className="mt-3 bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 mb-2">Flow Rate Along Line</div>
              <div className="h-20 relative bg-gray-900 rounded overflow-hidden">
                {lineAnalysis.flowRates.map((rate, i) => {
                  const height = (rate / Math.max(...lineAnalysis.flowRates)) * 100;
                  const position = (i / (lineAnalysis.flowRates.length - 1)) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute bottom-0 w-1 bg-blue-400"
                      style={{
                        left: `${position}%`,
                        height: `${height}%`
                      }}
                      title={`Position ${i + 1}: ${rate.toFixed(3)} GPH`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Start: {lineAnalysis.flowRates[0]?.toFixed(3)} GPH</span>
                <span>End: {lineAnalysis.flowRates[lineAnalysis.flowRates.length - 1]?.toFixed(3)} GPH</span>
              </div>
            </div>
          </div>
        )}

        {/* System Requirements */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            System Requirements
          </h3>
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Irrigation Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={irrigationDuration}
                    onChange={(e) => setIrrigationDuration(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    placeholder="Duration (min)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={cyclesPerDay}
                    onChange={(e) => setCyclesPerDay(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    placeholder="Cycles/day"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Daily Water:</span>
              <span className="text-white">{systemRequirements.totalDailyFlow.toFixed(0)} gal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Peak Flow Rate:</span>
              <span className="text-white">{systemRequirements.peakFlowRate.toFixed(1)} GPM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Flow Rate:</span>
              <span className="text-white">{systemRequirements.averageFlowRate.toFixed(2)} GPM</span>
            </div>
          </div>
        </div>

        {/* Spacing Recommendations */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Spacing Recommendations
          </h3>
          <div className="mb-2">
            <label className="block text-xs text-gray-400 mb-1">Growing Medium</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value="sand">Sand</option>
              <option value="loam">Loam</option>
              <option value="clay">Clay</option>
              <option value="coco">Coco Coir</option>
              <option value="rockwool">Rockwool</option>
            </select>
          </div>
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Recommended Spacing:</span>
              <span className="text-green-400 font-medium">
                {spacingRecommendation.recommendedSpacing.toFixed(0)}"
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Wet Pattern:</span>
              <span className="text-white">
                {spacingRecommendation.wetPattern.diameter}" × {spacingRecommendation.wetPattern.depth}"
              </span>
            </div>
            <div className="text-xs text-gray-400 italic mt-2">
              {spacingRecommendation.reasoning}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(endPressure < dripper.minPressure || lineAnalysis?.uniformity.distribution < 85) && (
          <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              Performance Alerts
            </div>
            <div className="space-y-1 text-xs">
              {endPressure < dripper.minPressure && (
                <div className="text-red-400">
                  • End pressure ({endPressure.toFixed(1)} PSI) below minimum ({dripper.minPressure} PSI)
                </div>
              )}
              {lineAnalysis?.uniformity.distribution < 85 && (
                <div className="text-red-400">
                  • Poor distribution uniformity ({lineAnalysis.uniformity.distribution.toFixed(1)}%) - consider shorter lines or larger tubing
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}