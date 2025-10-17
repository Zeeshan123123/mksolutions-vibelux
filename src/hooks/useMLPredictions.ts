/**
 * React hook for easy ML predictions
 * Zero configuration required - just works!
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeBrowserML, yieldPredictor, diseasePredictor } from '@/lib/ml/browser-ml-engine';

interface MLPredictions {
  yield: {
    value: number;
    confidence: number;
    factors: Record<string, any>;
  } | null;
  diseases: Array<{
    name: string;
    risk: number;
    confidence: number;
  }>;
  loading: boolean;
  ready: boolean;
  usingML: boolean;
}

export function useMLPredictions(
  environmentalData?: {
    temperature: number;
    humidity: number;
    ppfd?: number;
    co2?: number;
    vpd?: number;
    ec?: number;
    ph?: number;
  },
  cropType: string = 'lettuce'
) {
  const [predictions, setPredictions] = useState<MLPredictions>({
    yield: null,
    diseases: [],
    loading: true,
    ready: false,
    usingML: false
  });

  // Initialize ML once
  useEffect(() => {
    initializeBrowserML().then(() => {
      setPredictions(prev => ({ ...prev, ready: true, loading: false }));
    });
  }, []);

  // Prediction function
  const predict = useCallback(async () => {
    if (!predictions.ready || !environmentalData || !yieldPredictor || !diseasePredictor) {
      return;
    }

    setPredictions(prev => ({ ...prev, loading: true }));

    try {
      // Prepare data with defaults
      const data = {
        temperature: environmentalData.temperature,
        humidity: environmentalData.humidity,
        ppfd: environmentalData.ppfd || 400,
        co2: environmentalData.co2 || 800,
        vpd: environmentalData.vpd || calculateVPD(environmentalData.temperature, environmentalData.humidity),
        ec: environmentalData.ec || 1.8,
        ph: environmentalData.ph || 6.0,
        cropType,
        growthStage: 'vegetative',
        plantAge: 30,
        leafWetness: environmentalData.humidity > 80 ? 8 : 2
      };

      // Run predictions in parallel
      const [yieldResult, diseaseResult] = await Promise.all([
        yieldPredictor.predict(data),
        diseasePredictor.predict(data)
      ]);

      setPredictions({
        yield: {
          value: yieldResult.yield,
          confidence: yieldResult.confidence,
          factors: yieldResult.factors
        },
        diseases: diseaseResult.diseases,
        loading: false,
        ready: true,
        usingML: yieldResult.confidence > 0.8
      });
    } catch (error) {
      console.error('ML prediction error:', error);
      setPredictions(prev => ({ ...prev, loading: false }));
    }
  }, [environmentalData, cropType, predictions.ready]);

  // Auto-predict when data changes
  useEffect(() => {
    if (predictions.ready && environmentalData) {
      predict();
    }
  }, [environmentalData, cropType, predictions.ready, predict]);

  return predictions;
}

// Helper function
function calculateVPD(temp: number, humidity: number): number {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const avp = (humidity / 100) * svp;
  return svp - avp;
}

// Simplified hook for just yield prediction
export function useYieldPrediction(
  temperature?: number,
  humidity?: number,
  ppfd?: number,
  cropType: string = 'lettuce'
) {
  const data = temperature && humidity ? { temperature, humidity, ppfd } : undefined;
  const predictions = useMLPredictions(data, cropType);
  
  return {
    yield: predictions.yield?.value,
    confidence: predictions.yield?.confidence,
    loading: predictions.loading,
    ready: predictions.ready
  };
}