'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  FlaskConical, Target, Shuffle, Grid, Calculator, 
  Download, Save, Play, Settings, Info, Plus, X,
  ChevronRight, ChevronDown, BarChart3, Users
} from 'lucide-react';
import { ExperimentDesigner, ExperimentDesign, SampleSizeParams } from '@/lib/research/experiment-designer';

interface ExperimentDesignerProps {
  onDesignCreated?: (design: ExperimentDesign) => void;
  onSaveDesign?: (design: ExperimentDesign) => void;
}

export default function ExperimentDesignerComponent({ 
  onDesignCreated, 
  onSaveDesign 
}: ExperimentDesignerProps) {
  const [activeStep, setActiveStep] = useState<'setup' | 'design' | 'sample' | 'review'>('setup');
  const [designType, setDesignType] = useState<'CRD' | 'RCBD' | 'Factorial' | 'LatinSquare'>('CRD');
  const [treatments, setTreatments] = useState<string[]>(['Control', 'Treatment 1']);
  const [replications, setReplications] = useState(3);
  const [numBlocks, setNumBlocks] = useState(3);
  const [factors, setFactors] = useState<{ name: string; levels: string[] }[]>([
    { name: 'Factor A', levels: ['Low', 'High'] },
    { name: 'Factor B', levels: ['Level 1', 'Level 2'] }
  ]);
  const [currentDesign, setCurrentDesign] = useState<ExperimentDesign | null>(null);
  const [sampleSizeParams, setSampleSizeParams] = useState<SampleSizeParams>({
    alpha: 0.05,
    power: 0.8,
    effectSize: 0.5,
    variability: 1,
    designType: 'CRD',
    numTreatments: 2
  });
  const [sampleSizeResult, setSampleSizeResult] = useState<any>(null);
  const [randomSeed, setRandomSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const steps = [
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'design', label: 'Design', icon: Grid },
    { id: 'sample', label: 'Sample Size', icon: Calculator },
    { id: 'review', label: 'Review', icon: Target }
  ];

  useEffect(() => {
    setSampleSizeParams(prev => ({
      ...prev,
      designType,
      numTreatments: treatments.length,
      numBlocks: designType === 'RCBD' ? numBlocks : undefined
    }));
  }, [designType, treatments.length, numBlocks]);

  const calculateSampleSize = () => {
    try {
      const result = ExperimentDesigner.calculateSampleSize(sampleSizeParams);
      setSampleSizeResult(result);
    } catch (error) {
      logger.error('system', 'Sample size calculation error:', error );
    }
  };

  const generateDesign = () => {
    try {
      let design: ExperimentDesign;

      switch (designType) {
        case 'CRD':
          design = ExperimentDesigner.createCRD(treatments, replications, randomSeed);
          break;
        case 'RCBD':
          design = ExperimentDesigner.createRCBD(treatments, numBlocks, randomSeed);
          break;
        case 'Factorial':
          design = ExperimentDesigner.createFactorial(factors, replications, randomSeed);
          break;
        case 'LatinSquare':
          if (treatments.length < 3) {
            alert('Latin Square requires at least 3 treatments');
            return;
          }
          design = ExperimentDesigner.createLatinSquare(treatments, randomSeed);
          break;
        default:
          throw new Error(`Unsupported design type: ${designType}`);
      }

      setCurrentDesign(design);
      onDesignCreated?.(design);
    } catch (error) {
      logger.error('system', 'Design generation error:', error );
      alert('Error generating design. Please check your parameters.');
    }
  };

  const addTreatment = () => {
    setTreatments([...treatments, `Treatment ${treatments.length + 1}`]);
  };

  const removeTreatment = (index: number) => {
    if (treatments.length > 2) {
      setTreatments(treatments.filter((_, i) => i !== index));
    }
  };

  const updateTreatment = (index: number, value: string) => {
    const newTreatments = [...treatments];
    newTreatments[index] = value;
    setTreatments(newTreatments);
  };

  const addFactor = () => {
    setFactors([...factors, { name: `Factor ${factors.length + 1}`, levels: ['Low', 'High'] }]);
  };

  const removeFactor = (index: number) => {
    if (factors.length > 1) {
      setFactors(factors.filter((_, i) => i !== index));
    }
  };

  const updateFactor = (index: number, field: 'name' | 'levels', value: string | string[]) => {
    const newFactors = [...factors];
    if (field === 'levels' && Array.isArray(value)) {
      newFactors[index].levels = value;
    } else if (field === 'name' && typeof value === 'string') {
      newFactors[index].name = value;
    }
    setFactors(newFactors);
  };

  const exportDesign = () => {
    if (!currentDesign) return;
    
    const dataStr = JSON.stringify(currentDesign, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `experiment_design_${currentDesign.type}_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const generateProtocol = () => {
    if (!currentDesign) return;

    const metadata = {
      title: `${currentDesign.type} Experiment Design`,
      objectives: ['Evaluate treatment effects', 'Determine statistical significance'],
      hypothesis: 'At least one treatment will show significant difference',
      duration: '4-6 weeks',
      location: 'Research facility',
      personnel: ['Principal Investigator', 'Research Assistant']
    };

    const protocol = ExperimentDesigner.generateProtocol(currentDesign, metadata);
    
    const blob = new Blob([protocol], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_protocol_${currentDesign.type}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Experiment Designer</h1>
              <p className="text-gray-600">Create statistically rigorous experimental designs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeStep === step.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Setup Step */}
      {activeStep === 'setup' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Experimental Setup</h2>
          
          <div className="space-y-6">
            {/* Design Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Type
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(['CRD', 'RCBD', 'Factorial', 'LatinSquare'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setDesignType(type)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      designType === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{type}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {type === 'CRD' && 'Completely Randomized'}
                        {type === 'RCBD' && 'Randomized Complete Block'}
                        {type === 'Factorial' && 'Factorial Design'}
                        {type === 'LatinSquare' && 'Latin Square'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Treatments */}
            {designType !== 'Factorial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatments
                </label>
                <div className="space-y-2">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={treatment}
                        onChange={(e) => updateTreatment(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`Treatment ${index + 1}`}
                      />
                      <button
                        onClick={() => removeTreatment(index)}
                        disabled={treatments.length <= 2}
                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTreatment}
                    className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-800"
                  >
                    <Plus className="w-4 h-4" />
                    Add Treatment
                  </button>
                </div>
              </div>
            )}

            {/* Factors for Factorial Design */}
            {designType === 'Factorial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factors
                </label>
                <div className="space-y-4">
                  {factors.map((factor, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={factor.name}
                          onChange={(e) => updateFactor(index, 'name', e.target.value)}
                          className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none"
                          placeholder="Factor name"
                        />
                        <button
                          onClick={() => removeFactor(index)}
                          disabled={factors.length <= 1}
                          className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {factor.levels.map((level, levelIndex) => (
                          <input
                            key={levelIndex}
                            type="text"
                            value={level}
                            onChange={(e) => {
                              const newLevels = [...factor.levels];
                              newLevels[levelIndex] = e.target.value;
                              updateFactor(index, 'levels', newLevels);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder={`Level ${levelIndex + 1}`}
                          />
                        ))}
                        <button
                          onClick={() => {
                            const newLevels = [...factor.levels, `Level ${factor.levels.length + 1}`];
                            updateFactor(index, 'levels', newLevels);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-800"
                        >
                          <Plus className="w-4 h-4" />
                          Add Level
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addFactor}
                    className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-800"
                  >
                    <Plus className="w-4 h-4" />
                    Add Factor
                  </button>
                </div>
              </div>
            )}

            {/* Replications */}
            {designType !== 'RCBD' && designType !== 'LatinSquare' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replications
                </label>
                <input
                  type="number"
                  value={replications}
                  onChange={(e) => setReplications(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            {/* Blocks */}
            {designType === 'RCBD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Blocks
                </label>
                <input
                  type="number"
                  value={numBlocks}
                  onChange={(e) => setNumBlocks(parseInt(e.target.value) || 1)}
                  min="2"
                  max="20"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            {/* Random Seed */}
            {showAdvanced && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Random Seed (for reproducibility)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={randomSeed}
                    onChange={(e) => setRandomSeed(parseInt(e.target.value) || 0)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={() => setRandomSeed(Math.floor(Math.random() * 1000000))}
                    className="px-3 py-2 text-purple-600 hover:text-purple-800"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setActiveStep('design')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next: Generate Design
            </button>
          </div>
        </div>
      )}

      {/* Design Generation Step */}
      {activeStep === 'design' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Design</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Design Summary</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <p>Type: {designType}</p>
                  <p>
                    {designType === 'Factorial' 
                      ? `Factors: ${factors.map(f => `${f.name} (${f.levels.length} levels)`).join(', ')}`
                      : `Treatments: ${treatments.length}`
                    }
                  </p>
                  <p>
                    {designType === 'RCBD' 
                      ? `Blocks: ${numBlocks}`
                      : designType === 'LatinSquare'
                      ? `Size: ${treatments.length}×${treatments.length}`
                      : `Replications: ${replications}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={generateDesign}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Generate Design
              </button>
            </div>

            {currentDesign && (
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Generated Design</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Design Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <p>Total Units: {currentDesign.totalUnits}</p>
                      <p>Treatments: {currentDesign.treatments.length}</p>
                      <p>Replications: {currentDesign.replications}</p>
                      {currentDesign.blocks && <p>Blocks: {currentDesign.blocks.length}</p>}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Randomization</h4>
                    <div className="space-y-1 text-sm">
                      <p>Method: {currentDesign.randomization.method}</p>
                      <p>Seed: {currentDesign.randomization.seed}</p>
                      <p>Assignments: {currentDesign.randomization.assignments.length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={exportDesign}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Design
                  </button>
                  <button
                    onClick={generateProtocol}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate Protocol
                  </button>
                  {onSaveDesign && (
                    <button
                      onClick={() => onSaveDesign(currentDesign)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Design
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('setup')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back: Setup
            </button>
            <button
              onClick={() => setActiveStep('sample')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next: Sample Size
            </button>
          </div>
        </div>
      )}

      {/* Sample Size Step */}
      {activeStep === 'sample' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Size Analysis</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Power Analysis Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alpha (Type I Error Rate)
                    </label>
                    <input
                      type="number"
                      value={sampleSizeParams.alpha}
                      onChange={(e) => setSampleSizeParams({...sampleSizeParams, alpha: parseFloat(e.target.value) || 0.05})}
                      step="0.01"
                      min="0.01"
                      max="0.20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power (1 - Beta)
                    </label>
                    <input
                      type="number"
                      value={sampleSizeParams.power}
                      onChange={(e) => setSampleSizeParams({...sampleSizeParams, power: parseFloat(e.target.value) || 0.8})}
                      step="0.05"
                      min="0.50"
                      max="0.99"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effect Size
                    </label>
                    <input
                      type="number"
                      value={sampleSizeParams.effectSize}
                      onChange={(e) => setSampleSizeParams({...sampleSizeParams, effectSize: parseFloat(e.target.value) || 0.5})}
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variability (σ)
                    </label>
                    <input
                      type="number"
                      value={sampleSizeParams.variability}
                      onChange={(e) => setSampleSizeParams({...sampleSizeParams, variability: parseFloat(e.target.value) || 1})}
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={calculateSampleSize}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate Sample Size
                </button>
              </div>
              
              {sampleSizeResult && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Sample Size Results</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sample Size per Group:</span>
                      <span className="font-medium">{sampleSizeResult.sampleSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Units:</span>
                      <span className="font-medium">{sampleSizeResult.totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Achieved Power:</span>
                      <span className="font-medium">{(sampleSizeResult.power * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Detectable Effect:</span>
                      <span className="font-medium">{sampleSizeResult.detectable}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('design')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back: Design
            </button>
            <button
              onClick={() => setActiveStep('review')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Review Step */}
      {activeStep === 'review' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Review & Finalize</h2>
          
          <div className="space-y-6">
            {currentDesign && (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Design Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Design Details</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Type:</strong> {currentDesign.type}</p>
                        <p><strong>Treatments:</strong> {currentDesign.treatments.length}</p>
                        <p><strong>Total Units:</strong> {currentDesign.totalUnits}</p>
                        <p><strong>Replications:</strong> {currentDesign.replications}</p>
                        {currentDesign.blocks && <p><strong>Blocks:</strong> {currentDesign.blocks.length}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Statistical Power</h4>
                      <div className="text-sm space-y-1">
                        {sampleSizeResult && (
                          <>
                            <p><strong>Power:</strong> {(sampleSizeResult.power * 100).toFixed(1)}%</p>
                            <p><strong>Alpha:</strong> {sampleSizeParams.alpha}</p>
                            <p><strong>Effect Size:</strong> {sampleSizeParams.effectSize}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Export Design</h4>
                    <p className="text-sm text-gray-600">Download the experimental design as JSON for your records</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Generate Protocol</h4>
                    <p className="text-sm text-gray-600">Create a detailed experimental protocol document</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Start Data Collection</h4>
                    <p className="text-sm text-gray-600">Use the mobile data logger to collect experimental data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep('sample')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back: Sample Size
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/research/data-logger'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Start Data Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}