'use client';

import React, { useState, useMemo } from 'react';
import { Droplets, Waves, Wind, Zap, Settings, TrendingUp, AlertTriangle, Info, X } from 'lucide-react';
import { 
  analyzeNFTSystem,
  analyzeEbbFlowSystem,
  analyzeDWCSystem,
  analyzeAeroponicSystem,
  floodTablePresets,
  getFloodTableRecommendations,
  NFTSystemAnalysis,
  EbbFlowAnalysis,
  DWCAnalysis,
  AeroponicAnalysis
} from '@/lib/flow-measurement';

interface HydroponicAnalysisPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SystemType = 'nft' | 'ebb-flow' | 'dwc' | 'aeroponic';

export function HydroponicAnalysisPanel({ isOpen = true, onClose }: HydroponicAnalysisPanelProps) {
  const [selectedSystem, setSelectedSystem] = useState<SystemType>('nft');

  // NFT System State
  const [nftChannels, setNftChannels] = useState(6);
  const [nftChannelLength, setNftChannelLength] = useState(8);
  const [nftChannelSlope, setNftChannelSlope] = useState(2);
  const [nftFlowRate, setNftFlowRate] = useState(2);
  const [nftChannelWidth, setNftChannelWidth] = useState(4);

  // Ebb & Flow System State
  const [ebbTablePreset, setEbbTablePreset] = useState('4x8');
  const [ebbTableLength, setEbbTableLength] = useState(8);
  const [ebbTableWidth, setEbbTableWidth] = useState(4);
  const [ebbTableArea, setEbbTableArea] = useState(32);
  const [ebbTankVolume, setEbbTankVolume] = useState(100);
  const [ebbFloodDepth, setEbbFloodDepth] = useState(3);
  const [ebbFloodDuration, setEbbFloodDuration] = useState(15);
  const [ebbDrainDuration, setEbbDrainDuration] = useState(45);
  const [ebbPumpFlowRate, setEbbPumpFlowRate] = useState(15);
  const [ebbCustomDimensions, setEbbCustomDimensions] = useState(false);

  // DWC System State
  const [dwcReservoirVolume, setDwcReservoirVolume] = useState(20);
  const [dwcAirPumpCFM, setDwcAirPumpCFM] = useState(2);
  const [dwcWaterTemp, setDwcWaterTemp] = useState(68);
  const [dwcCirculationGPH, setDwcCirculationGPH] = useState(100);
  const [dwcTargetDO, setDwcTargetDO] = useState(8);

  // Aeroponic System State
  const [aeroMistingPressure, setAeroMistingPressure] = useState(80);
  const [aeroNozzleCount, setAeroNozzleCount] = useState(12);
  const [aeroSprayVolume, setAeroSprayVolume] = useState(50);
  const [aeroMistingOn, setAeroMistingOn] = useState(15);
  const [aeroMistingOff, setAeroMistingOff] = useState(5);
  const [aeroRootZoneArea, setAeroRootZoneArea] = useState(48);

  // Calculate analyses
  const nftAnalysis = useMemo(() => 
    analyzeNFTSystem(nftChannels, nftChannelLength, nftChannelSlope, nftFlowRate, nftChannelWidth),
    [nftChannels, nftChannelLength, nftChannelSlope, nftFlowRate, nftChannelWidth]
  );

  const ebbFlowAnalysis = useMemo(() => 
    analyzeEbbFlowSystem(ebbTableArea, ebbTankVolume, ebbFloodDepth, ebbFloodDuration, ebbDrainDuration, ebbPumpFlowRate, ebbTableLength, ebbTableWidth),
    [ebbTableArea, ebbTankVolume, ebbFloodDepth, ebbFloodDuration, ebbDrainDuration, ebbPumpFlowRate, ebbTableLength, ebbTableWidth]
  );

  // Handle preset changes
  const handlePresetChange = (preset: string) => {
    setEbbTablePreset(preset);
    const config = floodTablePresets[preset as keyof typeof floodTablePresets];
    if (config) {
      setEbbTableLength(config.length);
      setEbbTableWidth(config.width);
      setEbbTableArea(config.area);
      setEbbTankVolume(config.tankSize);
      setEbbPumpFlowRate(config.recommendedPump);
    }
  };

  // Update area when dimensions change
  const updateAreaFromDimensions = () => {
    const newArea = ebbTableLength * ebbTableWidth;
    setEbbTableArea(newArea);
  };

  const dwcAnalysis = useMemo(() => 
    analyzeDWCSystem(dwcReservoirVolume, dwcAirPumpCFM, dwcWaterTemp, dwcCirculationGPH, dwcTargetDO),
    [dwcReservoirVolume, dwcAirPumpCFM, dwcWaterTemp, dwcCirculationGPH, dwcTargetDO]
  );

  const aeroAnalysis = useMemo(() => 
    analyzeAeroponicSystem(aeroMistingPressure, aeroNozzleCount, aeroSprayVolume, aeroMistingOn, aeroMistingOff, aeroRootZoneArea),
    [aeroMistingPressure, aeroNozzleCount, aeroSprayVolume, aeroMistingOn, aeroMistingOff, aeroRootZoneArea]
  );

  if (!isOpen) return null;

  const renderSystemTabs = () => (
    <div className="flex gap-1 p-2 bg-gray-800 overflow-x-auto">
      <button
        onClick={() => setSelectedSystem('nft')}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
          selectedSystem === 'nft' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Waves className="w-3 h-3" />
        NFT
      </button>
      <button
        onClick={() => setSelectedSystem('ebb-flow')}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
          selectedSystem === 'ebb-flow' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Droplets className="w-3 h-3" />
        Ebb & Flow
      </button>
      <button
        onClick={() => setSelectedSystem('dwc')}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
          selectedSystem === 'dwc' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Wind className="w-3 h-3" />
        DWC
      </button>
      <button
        onClick={() => setSelectedSystem('aeroponic')}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
          selectedSystem === 'aeroponic' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Zap className="w-3 h-3" />
        Aeroponic
      </button>
    </div>
  );

  const renderNFTSystem = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          NFT System Configuration
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Channels</label>
            <input
              type="number"
              value={nftChannels}
              onChange={(e) => setNftChannels(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Channel Length (ft)</label>
            <input
              type="number"
              value={nftChannelLength}
              onChange={(e) => setNftChannelLength(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Channel Slope (°)</label>
            <input
              type="number"
              step="0.1"
              value={nftChannelSlope}
              onChange={(e) => setNftChannelSlope(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Flow Rate (L/min)</label>
            <input
              type="number"
              step="0.1"
              value={nftFlowRate}
              onChange={(e) => setNftFlowRate(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Flow Analysis
        </h3>
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Film Thickness:</span>
            <span className={`font-medium ${
              nftAnalysis.filmThickness >= 1 && nftAnalysis.filmThickness <= 3 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {nftAnalysis.filmThickness.toFixed(2)} mm
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flow Velocity:</span>
            <span className={`font-medium ${
              nftAnalysis.velocity >= 0.1 && nftAnalysis.velocity <= 3 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {nftAnalysis.velocity.toFixed(2)} cm/s
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Retention Time:</span>
            <span className={`font-medium ${
              nftAnalysis.retentionTime <= 3 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {nftAnalysis.retentionTime.toFixed(1)} min
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flow Distribution:</span>
            <span className={`font-medium ${
              nftAnalysis.uniformity.flowDistribution > 90 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {nftAnalysis.uniformity.flowDistribution.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {renderRecommendations(nftAnalysis.recommendations)}
    </div>
  );

  const renderEbbFlowSystem = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Ebb & Flow Configuration
        </h3>
        
        {/* Table Size Presets */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Table Size Preset</label>
          <select
            value={ebbTablePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm mb-2"
          >
            {Object.entries(floodTablePresets).map(([size, config]) => (
              <option key={size} value={size}>
                {size} ({config.area} sq ft) - {config.length}' × {config.width}'
              </option>
            ))}
            <option value="custom">Custom Dimensions</option>
          </select>
          
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="customDimensions"
              checked={ebbCustomDimensions}
              onChange={(e) => setEbbCustomDimensions(e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="customDimensions" className="text-xs text-gray-400">
              Use custom dimensions
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ebbCustomDimensions && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Length (ft)</label>
                <input
                  type="number"
                  value={ebbTableLength}
                  onChange={(e) => {
                    setEbbTableLength(Number(e.target.value));
                    updateAreaFromDimensions();
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={ebbTableWidth}
                  onChange={(e) => {
                    setEbbTableWidth(Number(e.target.value));
                    updateAreaFromDimensions();
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Table Area (sq ft)</label>
            <input
              type="number"
              value={ebbTableArea}
              onChange={(e) => setEbbTableArea(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              disabled={!ebbCustomDimensions}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tank Volume (gal)</label>
            <input
              type="number"
              value={ebbTankVolume}
              onChange={(e) => setEbbTankVolume(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Flood Depth (in)</label>
            <input
              type="number"
              value={ebbFloodDepth}
              onChange={(e) => setEbbFloodDepth(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pump Rate (GPM)</label>
            <input
              type="number"
              value={ebbPumpFlowRate}
              onChange={(e) => setEbbPumpFlowRate(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Flood Duration (min)</label>
            <input
              type="number"
              value={ebbFloodDuration}
              onChange={(e) => setEbbFloodDuration(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Drain Duration (min)</label>
            <input
              type="number"
              value={ebbDrainDuration}
              onChange={(e) => setEbbDrainDuration(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Cycle Analysis
        </h3>
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Table Dimensions:</span>
            <span className="text-white">{ebbTableLength}' × {ebbTableWidth}' ({ebbTableArea} sq ft)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Aspect Ratio:</span>
            <span className="text-white">{(Math.max(ebbTableLength, ebbTableWidth) / Math.min(ebbTableLength, ebbTableWidth)).toFixed(1)}:1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flood Volume:</span>
            <span className="text-white">{ebbFlowAnalysis.floodVolume.toFixed(1)} gal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flood Rate:</span>
            <span className="text-white">{ebbFlowAnalysis.flowRates.flood.toFixed(1)} GPM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Drain Rate:</span>
            <span className="text-white">{ebbFlowAnalysis.flowRates.drain.toFixed(1)} GPM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Water Efficiency:</span>
            <span className={`font-medium ${
              ebbFlowAnalysis.efficiency.waterUse > 90 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {ebbFlowAnalysis.efficiency.waterUse.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cycle Time:</span>
            <span className="text-white">{ebbFlowAnalysis.cycleTime.total} min</span>
          </div>
        </div>
      </div>

      {renderRecommendations(ebbFlowAnalysis.recommendations)}
    </div>
  );

  const renderDWCSystem = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          DWC System Configuration
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Reservoir (gal)</label>
            <input
              type="number"
              value={dwcReservoirVolume}
              onChange={(e) => setDwcReservoirVolume(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Air Pump (CFM)</label>
            <input
              type="number"
              step="0.1"
              value={dwcAirPumpCFM}
              onChange={(e) => setDwcAirPumpCFM(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Water Temp (°F)</label>
            <input
              type="number"
              value={dwcWaterTemp}
              onChange={(e) => setDwcWaterTemp(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Circulation (GPH)</label>
            <input
              type="number"
              value={dwcCirculationGPH}
              onChange={(e) => setDwcCirculationGPH(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Oxygenation Analysis
        </h3>
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Dissolved Oxygen:</span>
            <span className={`font-medium ${
              dwcAnalysis.dissolvedOxygen >= dwcTargetDO ? 'text-green-400' : 'text-red-400'
            }`}>
              {dwcAnalysis.dissolvedOxygen.toFixed(1)} mg/L
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Target DO:</span>
            <span className="text-gray-300">{dwcTargetDO} mg/L</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Oxygenation Efficiency:</span>
            <span className={`font-medium ${
              dwcAnalysis.oxygenationEfficiency > 90 ? 'text-green-400' : 
              dwcAnalysis.oxygenationEfficiency > 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {dwcAnalysis.oxygenationEfficiency.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Turnover Rate:</span>
            <span className={`font-medium ${
              dwcAnalysis.turnoverRate >= 1 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {dwcAnalysis.turnoverRate.toFixed(1)}x/hr
            </span>
          </div>
        </div>
      </div>

      {renderRecommendations(dwcAnalysis.recommendations)}
    </div>
  );

  const renderAeroponicSystem = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Aeroponic Configuration
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pressure (PSI)</label>
            <input
              type="number"
              value={aeroMistingPressure}
              onChange={(e) => setAeroMistingPressure(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nozzle Count</label>
            <input
              type="number"
              value={aeroNozzleCount}
              onChange={(e) => setAeroNozzleCount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Spray Volume (ml/min)</label>
            <input
              type="number"
              value={aeroSprayVolume}
              onChange={(e) => setAeroSprayVolume(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Root Zone (sq ft)</label>
            <input
              type="number"
              value={aeroRootZoneArea}
              onChange={(e) => setAeroRootZoneArea(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Misting On (sec)</label>
            <input
              type="number"
              value={aeroMistingOn}
              onChange={(e) => setAeroMistingOn(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Misting Off (min)</label>
            <input
              type="number"
              value={aeroMistingOff}
              onChange={(e) => setAeroMistingOff(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Misting Analysis
        </h3>
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Droplet Size:</span>
            <span className={`font-medium ${
              aeroAnalysis.dropletSize >= 5 && aeroAnalysis.dropletSize <= 50 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {aeroAnalysis.dropletSize.toFixed(1)} μm
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Spray Pattern:</span>
            <span className="text-white capitalize">{aeroAnalysis.sprayPattern}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Coverage:</span>
            <span className={`font-medium ${
              aeroAnalysis.coverage >= 80 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {aeroAnalysis.coverage.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cycle Frequency:</span>
            <span className="text-white">{aeroAnalysis.mistingCycle.frequency.toFixed(1)}/hr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Water Efficiency:</span>
            <span className={`font-medium ${
              aeroAnalysis.efficiency.water > 85 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {aeroAnalysis.efficiency.water.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {renderRecommendations(aeroAnalysis.recommendations)}
    </div>
  );

  const renderRecommendations = (recommendations: string[]) => {
    if (recommendations.length === 0) return null;

    return (
      <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
        <div className="flex items-center gap-2 text-blue-400 font-medium text-sm mb-2">
          <Info className="w-4 h-4" />
          Optimization Recommendations
        </div>
        <div className="space-y-1 text-xs">
          {recommendations.map((rec, i) => (
            <div key={i} className="text-blue-300">• {rec}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Hydroponic Systems Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400">Flow analysis for NFT, Ebb & Flow, DWC, and Aeroponic systems</p>
      </div>

      {/* System Type Tabs */}
      {renderSystemTabs()}

      {/* System Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSystem === 'nft' && renderNFTSystem()}
        {selectedSystem === 'ebb-flow' && renderEbbFlowSystem()}
        {selectedSystem === 'dwc' && renderDWCSystem()}
        {selectedSystem === 'aeroponic' && renderAeroponicSystem()}
      </div>
    </div>
  );
}