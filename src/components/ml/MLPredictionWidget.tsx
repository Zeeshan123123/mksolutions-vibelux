'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { initializeBrowserML, yieldPredictor, diseasePredictor } from '@/lib/ml/browser-ml-engine';

interface MLPredictionWidgetProps {
  facilityId?: string;
  cropType?: string;
  environmentalData?: {
    temperature: number;
    humidity: number;
    ppfd: number;
    co2: number;
    vpd: number;
    ec?: number;
    ph?: number;
  };
}

export function MLPredictionWidget({ 
  facilityId,
  cropType = 'lettuce',
  environmentalData 
}: MLPredictionWidgetProps) {
  const [mlReady, setMlReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any>(null);
  const [usingML, setUsingML] = useState(false);

  // Initialize ML on component mount
  useEffect(() => {
    initializeBrowserML().then(() => {
      setMlReady(true);
      setLoading(false);
    });
  }, []);

  // Run predictions when data changes
  useEffect(() => {
    if (!mlReady || !environmentalData) return;
    
    runPredictions();
  }, [mlReady, environmentalData, cropType]);

  const runPredictions = async () => {
    if (!yieldPredictor || !diseasePredictor || !environmentalData) return;
    
    setLoading(true);
    
    try {
      // Run yield prediction
      const yieldResult = await yieldPredictor.predict({
        ...environmentalData,
        ec: environmentalData.ec || 1.8,
        ph: environmentalData.ph || 6.0,
        cropType,
        growthStage: 'vegetative',
        plantAge: 30
      });
      
      // Run disease prediction
      const diseaseResult = await diseasePredictor.predict({
        ...environmentalData,
        leafWetness: environmentalData.humidity > 80 ? 8 : 2,
        vpd: environmentalData.vpd || 1.0,
        cropType
      });
      
      setPredictions({
        yield: yieldResult,
        diseases: diseaseResult.diseases
      });
      
      // Check if we're using ML or rules
      setUsingML(yieldResult.confidence > 0.8);
      
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!environmentalData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Waiting for environmental data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className={`h-6 w-6 ${usingML ? 'text-purple-600' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold">AI Predictions</h3>
          {usingML && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              ML Powered
            </span>
          )}
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
      </div>

      {predictions && (
        <>
          {/* Yield Prediction */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Yield Forecast</h4>
                </div>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {predictions.yield.yield.toFixed(1)} kg/m²
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Confidence: {(predictions.yield.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-600">vs optimal</p>
                <p className="text-lg font-semibold text-green-700">
                  {predictions.yield.yield > 2 ? '+' : ''}{((predictions.yield.yield - 2.5) / 2.5 * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Key Factors */}
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs font-medium text-green-700 mb-2">Key Factors:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(predictions.yield.factors).slice(0, 4).map(([key, factor]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-green-600 capitalize">{key}:</span>
                    <span className={`font-medium ${factor.impact > 0 ? 'text-green-700' : 'text-orange-600'}`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disease Risk */}
          {predictions.diseases && predictions.diseases.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">Disease Risks</h4>
              </div>
              <div className="space-y-2">
                {predictions.diseases.map((disease: any) => (
                  <div key={disease.name} className="flex items-center justify-between">
                    <span className="text-sm text-orange-700 capitalize">
                      {disease.name.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${disease.risk}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-orange-700 w-10 text-right">
                        {disease.risk.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ML Status Footer */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t">
        {usingML ? (
          <span>🤖 Using trained ML models • Runs entirely in your browser</span>
        ) : (
          <span>📊 Using scientific calculations • ML models loading...</span>
        )}
      </div>
    </div>
  );
}