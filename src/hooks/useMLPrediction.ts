import { useState, useCallback, useEffect } from 'react';
import { setupBrowserML, yieldPredictor, diseasePredictor } from '@/lib/ml/browser-ml-engine';

type PredictionType = 'yield' | 'disease';

interface YieldPrediction {
  yield: number;
  confidence: number;
  optimal: {
    temperature: number;
    humidity: number;
    ppfd: number;
  };
}

interface DiseasePrediction {
  diseases: Array<{
    name: string;
    risk: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  overallRisk: number;
  recommendations: string[];
}

export function useMLPrediction(type: PredictionType) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldPrediction | DiseasePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mlReady, setMlReady] = useState(false);

  useEffect(() => {
    setupBrowserML().then(() => {
      setMlReady(true);
    }).catch((err) => {
      setError('Failed to initialize ML engine');
      console.error('ML initialization error:', err);
    });
  }, []);

  const predict = useCallback(async (data: any) => {
    if (!mlReady) {
      throw new Error('ML engine not ready');
    }

    setLoading(true);
    setError(null);

    try {
      let prediction;
      
      if (type === 'yield') {
        prediction = await yieldPredictor.predict({
          ...data,
          growthStage: data.growthStage || 'vegetative',
          daysInStage: data.daysInStage || 14
        });
      } else {
        prediction = await diseasePredictor.predict({
          ...data,
          leafWetness: data.humidity > 80 ? 8 : 2,
          vpd: data.vpd || 1.0,
          cropType: data.cropType || 'lettuce'
        });
      }

      setResult(prediction);
      return prediction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [type, mlReady]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    predict,
    loading,
    result,
    error,
    mlReady,
    reset
  };
}