'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Flower, 
  Ruler, 
  Upload, 
  Grid3x3, 
  ChevronRight,
  Info,
  FileUp,
  AlertCircle,
  Fish
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { CADUsageTracker, CADUsageStats } from '@/lib/cad-usage-tracker';
import { logger } from '@/lib/client-logger';

interface DesignOnboardingProps {
  onComplete: (config: {
    spaceType: 'indoor' | 'greenhouse' | 'aquaculture';
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    unit: 'feet' | 'meters';
    includeCAD: boolean;
  }) => void;
  onCADImport: () => void;
}

export function DesignOnboarding({ onComplete, onCADImport }: DesignOnboardingProps) {
  const { user } = useUser();
  const [step, setStep] = useState<'space-type' | 'dimensions' | 'summary'>(
    'space-type'
  );
  const [spaceType, setSpaceType] = useState<'indoor' | 'greenhouse' | 'aquaculture' | null>(null);
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [cadUsage, setCadUsage] = useState<CADUsageStats | null>(null);

  useEffect(() => {
    async function fetchCADUsage() {
      if (!user) return;
      
      try {
        const subscriptionTier = user.publicMetadata?.subscriptionTier as string || 'free';
        const stats = await CADUsageTracker.getUsage(user.id, subscriptionTier);
        setCadUsage(stats);
      } catch (error) {
        logger.error('system', 'Failed to fetch CAD usage:', error );
      }
    }

    if (step === 'summary') {
      fetchCADUsage();
    }
  }, [user, step]);

  const handleSpaceTypeSelect = (type: 'indoor' | 'greenhouse' | 'aquaculture') => {
    setSpaceType(type);
    setStep('dimensions');
  };

  const handleDimensionsSubmit = () => {
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      alert('Please enter all dimensions');
      return;
    }
    setStep('summary');
  };

  const handleComplete = (includeCAD: boolean) => {
    if (!spaceType) return;
    
    if (includeCAD) {
      onCADImport();
    } else {
      onComplete({
        spaceType,
        dimensions: {
          length: parseFloat(dimensions.length),
          width: parseFloat(dimensions.width),
          height: parseFloat(dimensions.height)
        },
        unit,
        includeCAD: false
      });
    }
  };

  if (step === 'space-type') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-2xl">
          <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Building className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Create New Design</h3>
          <p className="text-gray-400 max-w-lg mb-8 mx-auto">
            Let's start by understanding your growing space. This helps us provide 
            accurate lighting recommendations and calculations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button 
              onClick={() => handleSpaceTypeSelect('indoor')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 hover:border-purple-500 transition-all text-left group"
            >
              <Building className="w-8 h-8 text-purple-400 mb-3 group-hover:text-purple-300" />
              <h4 className="text-lg font-medium mb-2">Indoor Space</h4>
              <p className="text-sm text-gray-400">
                Grow rooms, warehouses, basements, and other enclosed spaces
              </p>
            </button>
            
            <button 
              onClick={() => handleSpaceTypeSelect('greenhouse')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 hover:border-purple-500 transition-all text-left group"
            >
              <Flower className="w-8 h-8 text-green-400 mb-3 group-hover:text-green-300" />
              <h4 className="text-lg font-medium mb-2">Greenhouse</h4>
              <p className="text-sm text-gray-400">
                Glass houses, hoop houses, and other naturally lit structures
              </p>
            </button>
            
            <button 
              onClick={() => handleSpaceTypeSelect('aquaculture')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 hover:border-purple-500 transition-all text-left group"
            >
              <Fish className="w-8 h-8 text-blue-400 mb-3 group-hover:text-blue-300" />
              <h4 className="text-lg font-medium mb-2">Aquaculture</h4>
              <p className="text-sm text-gray-400">
                RAS systems, aquaponics, and fish farming facilities
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'dimensions') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Ruler className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Space Dimensions</h3>
          <p className="text-gray-400 mb-8">
            Enter your {spaceType === 'indoor' ? 'grow room' : spaceType === 'greenhouse' ? 'greenhouse' : 'facility'} dimensions 
            to calculate accurate {spaceType === 'aquaculture' ? 'system' : 'lighting'} requirements.
          </p>
          
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUnit('feet')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  unit === 'feet' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  unit === 'meters' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Meters
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Length ({unit})
                </label>
                <input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width ({unit})
                </label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height ({unit})
                </label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setStep('space-type')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleDimensionsSubmit}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const area = parseFloat(dimensions.length) * parseFloat(dimensions.width);
    const volume = area * parseFloat(dimensions.height);
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Grid3x3 className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Ready to Design</h3>
          <p className="text-gray-400 mb-6">
            Your {spaceType === 'indoor' ? 'grow room' : 'greenhouse'} is ready for lighting design.
          </p>
          
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400">Space Type</div>
                <div className="font-medium capitalize">{spaceType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Dimensions</div>
                <div className="font-medium">
                  {dimensions.length} × {dimensions.width} × {dimensions.height} {unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Floor Area</div>
                <div className="font-medium">{area.toFixed(1)} sq {unit}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Volume</div>
                <div className="font-medium">{volume.toFixed(1)} cu {unit}</div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-400 mb-1">
                    Optional: Import CAD Files
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Have architectural drawings? Import them for precise fixture placement and advanced features.
                  </div>
                  {cadUsage && (
                    <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                      {cadUsage.limit === 0 ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">CAD import not available in Free tier</span>
                        </div>
                      ) : cadUsage.remaining === 0 ? (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">Monthly CAD import limit reached</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">CAD imports remaining</span>
                            <span className="text-white font-medium">
                              {cadUsage.limit === Infinity ? 'Unlimited' : `${cadUsage.remaining} / ${cadUsage.limit}`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Supported: {cadUsage.formats[0] === 'all' 
                              ? '60+ formats' 
                              : cadUsage.formats.map(f => f.toUpperCase()).join(', ')}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setStep('dimensions')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button 
              onClick={() => handleComplete(true)}
              disabled={cadUsage?.limit === 0 || cadUsage?.remaining === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                cadUsage?.limit === 0 || cadUsage?.remaining === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Import CAD
            </button>
            <button 
              onClick={() => handleComplete(false)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Start Designing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}