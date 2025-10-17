'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Settings, TrendingUp, AlertTriangle, Info, X, Wrench, FileText, Zap, Gauge } from 'lucide-react';
import { 
  analyzeHydraulicSystem,
  professionalSoilDatabase,
  pipeSpecifications,
  fittingLossCoefficients,
  calculateReynoldsNumber,
  calculateDistributionUniformity,
  HydraulicCalculationParams,
  PipeSpecifications,
  FittingLosses,
  SoilProperties,
  HydraulicAnalysisResult
} from '@/lib/hydraulic-engineering';

interface ProfessionalIrrigationPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProfessionalIrrigationPanel({ isOpen = true, onClose }: ProfessionalIrrigationPanelProps) {
  // System Design Parameters
  const [designFlowRate, setDesignFlowRate] = useState(50); // GPM
  const [peakFlowRate, setPeakFlowRate] = useState(75); // GPM
  const [simultaneityFactor, setSimultaneityFactor] = useState(0.8);
  
  // Pressure System
  const [inletPressure, setInletPressure] = useState(60); // PSI
  const [requiredOutletPressure, setRequiredOutletPressure] = useState(30); // PSI
  const [pressureRegulatorLoss, setPressureRegulatorLoss] = useState(5); // PSI
  
  // System Geometry
  const [totalLength, setTotalLength] = useState(500); // feet
  const [elevationGain, setElevationGain] = useState(10); // feet
  const [waterTemperature, setWaterTemperature] = useState(68); // °F
  
  // Pipe Specifications
  const [pipeMaterial, setPipeMaterial] = useState<'PVC' | 'HDPE' | 'steel'>('PVC');
  const [nominalDiameter, setNominalDiameter] = useState(4); // inches
  const [innerDiameter, setInnerDiameter] = useState(3.826); // inches
  const [customCFactor, setCustomCFactor] = useState(150);
  const [workingPressure, setWorkingPressure] = useState(200); // PSI
  
  // Soil Properties
  const [soilType, setSoilType] = useState<keyof typeof professionalSoilDatabase>('loam');
  const [customHydraulicConductivity, setCustomHydraulicConductivity] = useState(1.0);
  const [customInfiltrationRate, setCustomInfiltrationRate] = useState(1.0);
  const [leachingFraction, setLeachingFraction] = useState(0.15);
  
  // Safety and Standards
  const [velocityLimit, setVelocityLimit] = useState(5.0); // ft/s
  const [pressureVariation, setPressureVariation] = useState(10); // %
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  
  // Fittings and Components
  const [fittings, setFittings] = useState<FittingLosses[]>([
    { type: 'elbow_90', quantity: 8, nominalSize: 4, lossCoefficient: 0.9 },
    { type: 'tee_branch', quantity: 4, nominalSize: 4, lossCoefficient: 1.8 },
    { type: 'valve_ball', quantity: 2, nominalSize: 4, lossCoefficient: 0.05 }
  ]);
  
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useCustomSoil, setUseCustomSoil] = useState(false);
  const [includeWaterHammer, setIncludeWaterHammer] = useState(true);
  const [asabeCompliance, setAsabeCompliance] = useState(true);

  // Build pipe specifications
  const pipeSpec: PipeSpecifications = {
    ...pipeSpecifications[pipeMaterial],
    nominalDiameter,
    innerDiameter,
    roughnessCoefficient: customCFactor,
    workingPressure,
    safetyFactor
  };

  // Build hydraulic parameters
  const hydraulicParams: HydraulicCalculationParams = {
    designFlowRate,
    peakFlowRate,
    simultaneityFactor,
    inletPressure,
    requiredOutletPressure,
    pressureRegulatorLoss,
    totalLength,
    elevationGain,
    numberOfFittings: fittings,
    waterTemperature,
    ambientTemperature: 75,
    operatingHours: 8,
    velocityLimit,
    pressureVariation,
    leachingFraction
  };

  // Get soil properties
  const soilProps = useCustomSoil ? {
    ...professionalSoilDatabase[soilType],
    hydraulicConductivity: customHydraulicConductivity,
    infiltrationRate: customInfiltrationRate
  } : professionalSoilDatabase[soilType];

  // Perform hydraulic analysis
  const analysis = useMemo(() => 
    analyzeHydraulicSystem(hydraulicParams, pipeSpec, soilProps),
    [hydraulicParams, pipeSpec, soilProps]
  );

  // Update pipe inner diameter based on nominal size and material
  const updatePipeDimensions = (material: string, nominal: number) => {
    // Standard pipe dimensions (simplified)
    const pipeDimensions: Record<string, Record<number, number>> = {
      PVC: {
        2: 1.939, 3: 2.864, 4: 3.826, 6: 5.761, 8: 7.625
      },
      HDPE: {
        2: 1.860, 3: 2.760, 4: 3.640, 6: 5.500, 8: 7.280
      },
      steel: {
        2: 1.939, 3: 2.900, 4: 3.826, 6: 5.761, 8: 7.625
      }
    };
    
    const innerDiam = pipeDimensions[material]?.[nominal] || nominal - 0.2;
    setInnerDiameter(innerDiam);
    setCustomCFactor(pipeSpecifications[material as keyof typeof pipeSpecifications]?.roughnessCoefficient || 150);
  };

  const addFitting = () => {
    setFittings([...fittings, {
      type: 'elbow_90',
      quantity: 1,
      nominalSize: nominalDiameter,
      lossCoefficient: 0.9
    }]);
  };

  const removeFitting = (index: number) => {
    setFittings(fittings.filter((_, i) => i !== index));
  };

  const updateFitting = (index: number, field: keyof FittingLosses, value: any) => {
    const newFittings = [...fittings];
    newFittings[index] = { ...newFittings[index], [field]: value };
    if (field === 'type') {
      newFittings[index].lossCoefficient = fittingLossCoefficients[value] || 1.0;
    }
    setFittings(newFittings);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-[500px] h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Professional Irrigation Engineering</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400">ASABE Standards Compliant Hydraulic Design & Analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Flow Design Parameters */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Flow Design Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Design Flow Rate (GPM)</label>
              <input
                type="number"
                value={designFlowRate}
                onChange={(e) => setDesignFlowRate(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Peak Flow Rate (GPM)</label>
              <input
                type="number"
                value={peakFlowRate}
                onChange={(e) => setPeakFlowRate(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Simultaneity Factor</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={simultaneityFactor}
                onChange={(e) => setSimultaneityFactor(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Leaching Fraction</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="0.5"
                value={leachingFraction}
                onChange={(e) => setLeachingFraction(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pressure System Design */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Pressure System Design
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Inlet Pressure (PSI)</label>
              <input
                type="number"
                value={inletPressure}
                onChange={(e) => setInletPressure(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Required Outlet (PSI)</label>
              <input
                type="number"
                value={requiredOutletPressure}
                onChange={(e) => setRequiredOutletPressure(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Regulator Loss (PSI)</label>
              <input
                type="number"
                value={pressureRegulatorLoss}
                onChange={(e) => setPressureRegulatorLoss(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Pressure Variation (%)</label>
              <input
                type="number"
                value={pressureVariation}
                onChange={(e) => setPressureVariation(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pipe Specifications */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pipe Specifications
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Material</label>
              <select
                value={pipeMaterial}
                onChange={(e) => {
                  const material = e.target.value as 'PVC' | 'HDPE' | 'steel';
                  setPipeMaterial(material);
                  updatePipeDimensions(material, nominalDiameter);
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="PVC">PVC</option>
                <option value="HDPE">HDPE</option>
                <option value="steel">Steel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nominal Diameter (in)</label>
              <select
                value={nominalDiameter}
                onChange={(e) => {
                  const diameter = Number(e.target.value);
                  setNominalDiameter(diameter);
                  updatePipeDimensions(pipeMaterial, diameter);
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value={2}>2"</option>
                <option value={3}>3"</option>
                <option value={4}>4"</option>
                <option value={6}>6"</option>
                <option value={8}>8"</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Inner Diameter (in)</label>
              <input
                type="number"
                step="0.001"
                value={innerDiameter}
                onChange={(e) => setInnerDiameter(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">C-Factor (Hazen-Williams)</label>
              <input
                type="number"
                value={customCFactor}
                onChange={(e) => setCustomCFactor(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Working Pressure (PSI)</label>
              <input
                type="number"
                value={workingPressure}
                onChange={(e) => setWorkingPressure(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Velocity Limit (ft/s)</label>
              <input
                type="number"
                step="0.1"
                value={velocityLimit}
                onChange={(e) => setVelocityLimit(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* System Geometry */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">System Geometry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total Length (ft)</label>
              <input
                type="number"
                value={totalLength}
                onChange={(e) => setTotalLength(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Elevation Gain (ft)</label>
              <input
                type="number"
                value={elevationGain}
                onChange={(e) => setElevationGain(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Water Temperature (°F)</label>
              <input
                type="number"
                value={waterTemperature}
                onChange={(e) => setWaterTemperature(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Safety Factor</label>
              <input
                type="number"
                step="0.1"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Soil Properties */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Soil/Media Properties</h3>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as keyof typeof professionalSoilDatabase)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            >
              {Object.entries(professionalSoilDatabase).map(([key, soil]) => (
                <option key={key} value={key}>
                  {soil.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="customSoil"
              checked={useCustomSoil}
              onChange={(e) => setUseCustomSoil(e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="customSoil" className="text-xs text-gray-400">
              Use custom soil parameters
            </label>
          </div>

          {useCustomSoil && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hydraulic Conductivity (cm/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customHydraulicConductivity}
                  onChange={(e) => setCustomHydraulicConductivity(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Infiltration Rate (cm/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customInfiltrationRate}
                  onChange={(e) => setCustomInfiltrationRate(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded p-3 mt-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Field Capacity:</span>
                <span className="text-white ml-1">{soilProps.fieldCapacity}%</span>
              </div>
              <div>
                <span className="text-gray-400">Wilting Point:</span>
                <span className="text-white ml-1">{soilProps.wiltingPoint}%</span>
              </div>
              <div>
                <span className="text-gray-400">Available Water:</span>
                <span className="text-white ml-1">{soilProps.availableWater}%</span>
              </div>
              <div>
                <span className="text-gray-400">Bulk Density:</span>
                <span className="text-white ml-1">{soilProps.bulkDensity} g/cm³</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fittings and Components */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center justify-between">
            <span>Fittings & Components</span>
            <button
              onClick={addFitting}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            >
              Add Fitting
            </button>
          </h3>
          <div className="space-y-2">
            {fittings.map((fitting, index) => (
              <div key={index} className="bg-gray-800 rounded p-2">
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={fitting.type}
                    onChange={(e) => updateFitting(index, 'type', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white text-xs"
                  >
                    {Object.keys(fittingLossCoefficients).map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={fitting.quantity}
                    onChange={(e) => updateFitting(index, 'quantity', Number(e.target.value))}
                    placeholder="Qty"
                    className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={fitting.lossCoefficient}
                    onChange={(e) => updateFitting(index, 'lossCoefficient', Number(e.target.value))}
                    placeholder="K-factor"
                    className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white text-xs"
                  />
                  <button
                    onClick={() => removeFitting(index)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded px-1 py-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hydraulic Analysis Results */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Hydraulic Analysis Results
          </h3>
          
          {/* Flow Characteristics */}
          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="text-xs font-medium text-blue-400 mb-2">Flow Characteristics</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity:</span>
                <span className={`font-medium ${
                  analysis.velocity <= velocityLimit ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analysis.velocity.toFixed(2)} ft/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reynolds Number:</span>
                <span className="text-white">{analysis.reynoldsNumber.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Flow Regime:</span>
                <span className="text-white capitalize">{analysis.flowRegime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity Head:</span>
                <span className="text-white">{analysis.velocityHead.toFixed(3)} ft</span>
              </div>
            </div>
          </div>

          {/* Pressure Analysis */}
          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="text-xs font-medium text-yellow-400 mb-2">Pressure Analysis</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Friction Loss:</span>
                <span className="text-white">{analysis.frictionLoss.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Elevation Loss:</span>
                <span className="text-white">{analysis.elevationLoss.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Minor Losses:</span>
                <span className="text-white">{analysis.minorLosses.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total System Loss:</span>
                <span className="text-orange-400 font-medium">{analysis.totalSystemLoss.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available Pressure:</span>
                <span className="text-white">{analysis.availablePressure.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pressure Margin:</span>
                <span className={`font-medium ${
                  analysis.pressureMargin > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analysis.pressureMargin.toFixed(2)} PSI
                </span>
              </div>
            </div>
          </div>

          {/* Water Hammer Analysis */}
          {includeWaterHammer && (
            <div className="bg-gray-800 rounded p-3 mb-3">
              <div className="text-xs font-medium text-red-400 mb-2">Water Hammer Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Wave Speed:</span>
                  <span className="text-white">{analysis.waveSpeed.toFixed(0)} ft/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Pressure Rise:</span>
                  <span className={`font-medium ${
                    analysis.waterHammerRisk === 'low' ? 'text-green-400' :
                    analysis.waterHammerRisk === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysis.maxPressureRise.toFixed(0)} PSI
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-400">Risk Level:</span>
                  <span className={`font-medium uppercase ${
                    analysis.waterHammerRisk === 'low' ? 'text-green-400' :
                    analysis.waterHammerRisk === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysis.waterHammerRisk}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="text-xs font-medium text-green-400 mb-2">Performance Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Distribution Uniformity:</span>
                <span className={`font-medium ${
                  analysis.distributionUniformity >= 85 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {analysis.distributionUniformity.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Application Efficiency:</span>
                <span className={`font-medium ${
                  analysis.applicationEfficiency >= 80 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {analysis.applicationEfficiency.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Emission Uniformity:</span>
                <span className={`font-medium ${
                  analysis.emissionUniformity >= 85 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {analysis.emissionUniformity.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Dynamic Head:</span>
                <span className="text-white">{analysis.totalDynamicHead.toFixed(1)} ft</span>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="text-xs font-medium text-purple-400 mb-2">Standards Compliance</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">ASABE Compliance:</span>
                <span className={`font-medium ${analysis.asabeCompliance ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.asabeCompliance ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity Compliance:</span>
                <span className={`font-medium ${analysis.velocityCompliance ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.velocityCompliance ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pressure Compliance:</span>
                <span className={`font-medium ${analysis.pressureCompliance ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.pressureCompliance ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings and Recommendations */}
        {(analysis.warnings.length > 0 || analysis.recommendations.length > 0) && (
          <div>
            {analysis.warnings.length > 0 && (
              <div className="bg-red-900/20 border border-red-700/50 rounded p-3 mb-3">
                <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Engineering Warnings
                </div>
                <div className="space-y-1 text-xs">
                  {analysis.warnings.map((warning, i) => (
                    <div key={i} className="text-red-300">• {warning}</div>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
                <div className="flex items-center gap-2 text-blue-400 font-medium text-sm mb-2">
                  <Info className="w-4 h-4" />
                  Engineering Recommendations
                </div>
                <div className="space-y-1 text-xs">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="text-blue-300">• {rec}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-300 mb-3"
          >
            <span>Advanced Engineering Options</span>
            <span className="text-xs">{showAdvanced ? '▼' : '▶'}</span>
          </button>
          
          {showAdvanced && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeWaterHammer"
                    checked={includeWaterHammer}
                    onChange={(e) => setIncludeWaterHammer(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <label htmlFor="includeWaterHammer" className="text-xs text-gray-400">
                    Include Water Hammer Analysis
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="asabeCompliance"
                    checked={asabeCompliance}
                    onChange={(e) => setAsabeCompliance(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <label htmlFor="asabeCompliance" className="text-xs text-gray-400">
                    ASABE Standards Check
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}