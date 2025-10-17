/**
 * Hybrid ML Demo Component
 * Demonstrates instant client feedback + detailed server analysis
 * Shows the value of preserving platform intelligence while improving UX
 */

'use client';

import React, { useState, useRef } from 'react';
import { usePlantHealthAnalysis, useYieldPrediction, useDiseaseDetection } from '@/hooks/useHybridML';

export default function HybridMLDemo() {
  const [selectedModel, setSelectedModel] = useState<'plantHealth' | 'yieldPrediction' | 'diseaseDetection'>('plantHealth');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the hybrid ML hooks
  const plantHealth = usePlantHealthAnalysis({ 
    userId: 'demo-user',
    facilityId: 'demo-facility-1' 
  });
  
  const yieldPrediction = useYieldPrediction({ 
    userId: 'demo-user',
    facilityId: 'demo-facility-1' 
  });
  
  const diseaseDetection = useDiseaseDetection({ 
    userId: 'demo-user',
    facilityId: 'demo-facility-1' 
  });

  // Get current hook based on selected model
  const currentHook = {
    plantHealth,
    yieldPrediction,
    diseaseDetection
  }[selectedModel];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    // Convert file to ImageData for ML processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        await currentHook.analyze(imageData);
      }
    };
    
    img.src = imagePreview!;
  };

  const ModelSelector = () => (
    <div className="flex space-x-4 mb-6">
      {[
        { key: 'plantHealth', label: 'Plant Health', icon: '🌱' },
        { key: 'yieldPrediction', label: 'Yield Prediction', icon: '📊' },
        { key: 'diseaseDetection', label: 'Disease Detection', icon: '🔍' }
      ].map(model => (
        <button
          key={model.key}
          onClick={() => setSelectedModel(model.key as any)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedModel === model.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {model.icon} {model.label}
        </button>
      ))}
    </div>
  );

  const ImageUploader = () => (
    <div className="mb-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {imagePreview ? (
          <div className="space-y-4">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-full h-48 object-contain mx-auto rounded-lg"
            />
            <div className="flex space-x-4 justify-center">
              <button
                onClick={analyzeImage}
                disabled={currentHook.isAnalyzing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                          text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {currentHook.isAnalyzing ? 'Analyzing...' : `Analyze with ${selectedModel}`}
              </button>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Upload Plant Image
              </button>
            </div>
            <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );

  const ResultsDisplay = () => {
    if (!currentHook.hasResults) return null;

    return (
      <div className="space-y-6">
        {/* Instant Results */}
        {currentHook.hasInstantResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-green-600">⚡</span>
              <h3 className="font-semibold text-green-800">Instant Analysis</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {currentHook.processingTimes.client?.toFixed(1)}ms
              </span>
            </div>
            <div className="text-sm text-green-700">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(currentHook.instantResult?.prediction, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Loading Detailed Results */}
        {currentHook.isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <span className="text-blue-800">Running detailed server analysis...</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              This includes cross-facility benchmarking and platform intelligence
            </p>
          </div>
        )}

        {/* Detailed Results */}
        {currentHook.hasDetailedResults && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-purple-600">🧠</span>
              <h3 className="font-semibold text-purple-800">Detailed Analysis with Platform Intelligence</h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {currentHook.processingTimes.server?.toFixed(1)}ms
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Detailed Analysis */}
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Analysis Results</h4>
                <div className="text-sm text-purple-700 bg-white p-3 rounded border">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(currentHook.detailedResult?.detailed, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Benchmarking */}
              {currentHook.detailedResult?.benchmarking && (
                <div>
                  <h4 className="font-medium text-purple-700 mb-2">Cross-Facility Benchmarking</h4>
                  <div className="text-sm text-purple-700 bg-white p-3 rounded border">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(currentHook.detailedResult.benchmarking, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Platform Insights */}
              {currentHook.detailedResult?.platformInsights && (
                <div>
                  <h4 className="font-medium text-purple-700 mb-2">Platform Intelligence</h4>
                  <div className="text-sm text-purple-700 bg-white p-3 rounded border">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(currentHook.detailedResult.platformInsights, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-600">Client Processing</div>
              <div className="text-lg font-bold text-green-600">
                {currentHook.processingTimes.client?.toFixed(1) || '-'}ms
              </div>
              <div className="text-xs text-gray-500">Instant feedback</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">Server Processing</div>
              <div className="text-lg font-bold text-blue-600">
                {currentHook.processingTimes.server?.toFixed(1) || '-'}ms
              </div>
              <div className="text-xs text-gray-500">Platform intelligence</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">Total Time</div>
              <div className="text-lg font-bold text-purple-600">
                {currentHook.processingTimes.total?.toFixed(1) || '-'}ms
              </div>
              <div className="text-xs text-gray-500">Complete analysis</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {currentHook.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <h3 className="font-semibold text-red-800">Analysis Error</h3>
            </div>
            <p className="text-sm text-red-700 mt-2">{currentHook.error}</p>
          </div>
        )}
      </div>
    );
  };

  const CapabilitiesInfo = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Model Capabilities</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-gray-600 mb-1">Client-side Processing</div>
          <div className={`px-2 py-1 rounded text-xs ${
            currentHook.hasInstantFeedback 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {currentHook.hasInstantFeedback ? '✓ Available' : '✗ Not Available'}
          </div>
        </div>
        <div>
          <div className="font-medium text-gray-600 mb-1">Platform Intelligence</div>
          <div className={`px-2 py-1 rounded text-xs ${
            currentHook.hasPlatformIntelligence 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {currentHook.hasPlatformIntelligence ? '✓ Available' : '✗ Not Available'}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="font-medium text-gray-600 mb-1">Features</div>
        <div className="flex flex-wrap gap-1">
          {currentHook.capabilities.capabilities.map(capability => (
            <span 
              key={capability}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {capability.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hybrid ML Architecture Demo
        </h1>
        <p className="text-gray-600">
          Experience instant client-side feedback combined with detailed server-side analysis and platform intelligence.
          This preserves VibeLux's competitive advantage while delivering the best user experience.
        </p>
      </div>

      <ModelSelector />
      <CapabilitiesInfo />
      <ImageUploader />
      <ResultsDisplay />

      {/* Architecture Explanation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">🏗️ Hybrid Architecture Benefits</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-start space-x-2">
            <span className="text-green-600 font-bold">⚡</span>
            <div>
              <strong>Instant User Feedback:</strong> Client-side models provide immediate results for better UX
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-600 font-bold">🧠</span>
            <div>
              <strong>Platform Intelligence:</strong> Server-side analysis provides cross-customer insights and benchmarking
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">🏆</span>
            <div>
              <strong>Competitive Advantage:</strong> All data flows to platform learning for industry-leading insights
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-600 font-bold">📊</span>
            <div>
              <strong>Best of Both Worlds:</strong> Fast response times + deep analytical capabilities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}