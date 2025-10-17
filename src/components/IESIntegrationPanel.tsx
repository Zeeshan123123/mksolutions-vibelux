'use client';

import React, { useState, useCallback } from 'react';
import { FileText, AlertTriangle, CheckCircle, Settings, Eye, Zap } from 'lucide-react';
import { IESUploader } from './IESUploader';
import { 
  createEnhancedLightSource, 
  validateIESCompatibility, 
  calculateIESScalingFactor,
  type EnhancedLightSource 
} from '@/lib/lighting-calculations';
import type { LightSource } from '@/lib/lighting-design';
import type { ParsedIESFile } from '@/lib/ies-parser';

interface IESIntegrationPanelProps {
  lightSources: LightSource[];
  onLightSourcesUpdated: (sources: EnhancedLightSource[]) => void;
  className?: string;
}

interface IESBinding {
  sourceIndex: number;
  iesFile: ParsedIESFile;
  scalingFactor: number;
  isActive: boolean;
  warnings: string[];
}

export function IESIntegrationPanel({
  lightSources,
  onLightSourcesUpdated,
  className = ''
}: IESIntegrationPanelProps) {
  const [uploadedIESFiles, setUploadedIESFiles] = useState<ParsedIESFile[]>([]);
  const [iesBindings, setIESBindings] = useState<IESBinding[]>([]);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleIESUploaded = useCallback((iesFile: ParsedIESFile) => {
    setUploadedIESFiles(prev => {
      // Replace if same filename, otherwise add
      const existingIndex = prev.findIndex(f => f.header.filename === iesFile.header.filename);
      if (existingIndex >= 0) {
        const newFiles = [...prev];
        newFiles[existingIndex] = iesFile;
        return newFiles;
      }
      return [...prev, iesFile];
    });
  }, []);

  const bindIESToSource = useCallback((sourceIndex: number, iesFile: ParsedIESFile) => {
    const source = lightSources[sourceIndex];
    if (!source) return;

    // Validate compatibility
    const validation = validateIESCompatibility(source, iesFile);
    
    // Calculate scaling factor to match target PPF
    const scalingFactor = calculateIESScalingFactor(iesFile, source.ppf);

    const newBinding: IESBinding = {
      sourceIndex,
      iesFile,
      scalingFactor,
      isActive: validation.compatible,
      warnings: validation.warnings
    };

    setIESBindings(prev => {
      // Replace existing binding for this source
      const filtered = prev.filter(b => b.sourceIndex !== sourceIndex);
      return [...filtered, newBinding];
    });

    // Update the light sources array
    updateLightSources();
  }, [lightSources]);

  const unbindIESFromSource = useCallback((sourceIndex: number) => {
    setIESBindings(prev => prev.filter(b => b.sourceIndex !== sourceIndex));
    updateLightSources();
  }, []);

  const toggleBindingActive = useCallback((sourceIndex: number) => {
    setIESBindings(prev => 
      prev.map(binding => 
        binding.sourceIndex === sourceIndex 
          ? { ...binding, isActive: !binding.isActive }
          : binding
      )
    );
    updateLightSources();
  }, []);

  const updateScalingFactor = useCallback((sourceIndex: number, scalingFactor: number) => {
    setIESBindings(prev => 
      prev.map(binding => 
        binding.sourceIndex === sourceIndex 
          ? { ...binding, scalingFactor }
          : binding
      )
    );
    updateLightSources();
  }, []);

  const updateLightSources = useCallback(() => {
    const enhancedSources: EnhancedLightSource[] = lightSources.map((source, index) => {
      const binding = iesBindings.find(b => b.sourceIndex === index);
      
      if (binding && binding.isActive) {
        return createEnhancedLightSource(source, binding.iesFile, true);
      }
      
      return createEnhancedLightSource(source, undefined, false);
    });

    onLightSourcesUpdated(enhancedSources);
  }, [lightSources, iesBindings, onLightSourcesUpdated]);

  const getBindingForSource = useCallback((sourceIndex: number): IESBinding | undefined => {
    return iesBindings.find(b => b.sourceIndex === sourceIndex);
  }, [iesBindings]);

  const getTotalActiveBindings = useCallback(() => {
    return iesBindings.filter(b => b.isActive).length;
  }, [iesBindings]);

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            IES Photometric Integration
          </h2>
          <p className="text-gray-400 text-sm">
            Use real measured photometric data for accurate light distribution calculations
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Active:</span>
          <span className="text-green-400 font-medium">{getTotalActiveBindings()}</span>
          <span className="text-gray-400">of</span>
          <span className="text-gray-300">{lightSources.length}</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <IESUploader 
          onIESUploaded={handleIESUploaded}
          className="mb-4"
        />
        
        {uploadedIESFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedIESFiles.map((iesFile, index) => (
              <IESFileCard
                key={`${iesFile.header.filename}-${index}`}
                iesFile={iesFile}
                onBindToSource={(sourceIndex) => bindIESToSource(sourceIndex, iesFile)}
                lightSources={lightSources}
                usedBySourceIndex={iesBindings.find(b => b.iesFile.header.filename === iesFile.header.filename)?.sourceIndex}
              />
            ))}
          </div>
        )}
      </div>

      {/* Light Source Bindings */}
      {lightSources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Light Source Configuration</h3>
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              Advanced
            </button>
          </div>

          <div className="space-y-3">
            {lightSources.map((source, index) => (
              <LightSourceBindingRow
                key={index}
                source={source}
                sourceIndex={index}
                binding={getBindingForSource(index)}
                onUnbind={() => unbindIESFromSource(index)}
                onToggleActive={() => toggleBindingActive(index)}
                onUpdateScaling={(factor) => updateScalingFactor(index, factor)}
                showAdvanced={showAdvancedSettings}
                onSelect={() => setSelectedSourceIndex(index)}
                isSelected={selectedSourceIndex === index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {iesBindings.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Impact
          </h4>
          <div className="text-sm text-blue-200 space-y-1">
            <p>
              <strong>{getTotalActiveBindings()}</strong> light sources using real IES photometric data
            </p>
            <p>
              Calculations will be more accurate but may take slightly longer due to interpolation
            </p>
            {iesBindings.some(b => b.warnings.length > 0) && (
              <p className="text-yellow-300">
                ⚠️ Some bindings have compatibility warnings - check individual sources
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface IESFileCardProps {
  iesFile: ParsedIESFile;
  onBindToSource: (sourceIndex: number) => void;
  lightSources: LightSource[];
  usedBySourceIndex?: number;
}

function IESFileCard({ iesFile, onBindToSource, lightSources, usedBySourceIndex }: IESFileCardProps) {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
  const { header, photometry } = iesFile;

  const handleBind = () => {
    if (selectedSourceIndex !== null) {
      onBindToSource(selectedSourceIndex);
      setSelectedSourceIndex(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-medium text-sm truncate">{header.filename}</h4>
          <p className="text-gray-400 text-xs">{header.manufacturer}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-xs">{photometry.analysis.distribution}</p>
          <p className="text-gray-400 text-xs">{photometry.analysis.beamAngle.toFixed(0)}° beam</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="text-gray-400">Peak:</span>
          <span className="text-white ml-1">{photometry.analysis.peak.toFixed(0)} cd</span>
        </div>
        <div>
          <span className="text-gray-400">Lumens:</span>
          <span className="text-white ml-1">{photometry.totalLumens}</span>
        </div>
      </div>

      {usedBySourceIndex !== undefined ? (
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <CheckCircle className="w-3 h-3" />
          Bound to Light Source {usedBySourceIndex + 1}
        </div>
      ) : (
        <div className="space-y-2">
          <select
            value={selectedSourceIndex ?? ''}
            onChange={(e) => setSelectedSourceIndex(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full bg-gray-700 border border-gray-600 rounded text-white text-xs p-2"
          >
            <option value="">Select Light Source</option>
            {lightSources.map((source, index) => (
              <option key={index} value={index}>
                Light Source {index + 1} ({source.ppf} μmol/s)
              </option>
            ))}
          </select>
          
          <button
            onClick={handleBind}
            disabled={selectedSourceIndex === null}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed 
                     text-white text-xs py-2 px-3 rounded transition-colors"
          >
            Bind to Source
          </button>
        </div>
      )}
    </div>
  );
}

interface LightSourceBindingRowProps {
  source: LightSource;
  sourceIndex: number;
  binding?: IESBinding;
  onUnbind: () => void;
  onToggleActive: () => void;
  onUpdateScaling: (factor: number) => void;
  showAdvanced: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

function LightSourceBindingRow({
  source,
  sourceIndex,
  binding,
  onUnbind,
  onToggleActive,
  onUpdateScaling,
  showAdvanced,
  onSelect,
  isSelected
}: LightSourceBindingRowProps) {
  return (
    <div 
      className={`bg-gray-800 rounded-lg border p-4 transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-900/20' 
          : binding?.isActive 
            ? 'border-green-500/30' 
            : 'border-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-white font-medium">Light Source {sourceIndex + 1}</h4>
            <span className="text-gray-400 text-sm">{source.ppf} μmol/s</span>
            
            {binding && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive();
                  }}
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    binding.isActive 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {binding.iesFile.header.filename}
                </span>
              </div>
            )}
          </div>

          {binding?.warnings.length > 0 && (
            <div className="mt-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-300 text-xs">
                {binding.warnings.map((warning, index) => (
                  <p key={index}>{warning}</p>
                ))}
              </div>
            </div>
          )}

          {binding && showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Scaling Factor:</label>
                <input
                  type="number"
                  value={binding.scalingFactor.toFixed(2)}
                  onChange={(e) => onUpdateScaling(parseFloat(e.target.value) || 1)}
                  step="0.01"
                  min="0.1"
                  max="10"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="text-gray-300">
                <p>IES Peak: {binding.iesFile.photometry.analysis.peak.toFixed(0)} cd</p>
                <p>IES Beam: {binding.iesFile.photometry.analysis.beamAngle.toFixed(0)}°</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {binding && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnbind();
              }}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              title="Remove IES Binding"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}