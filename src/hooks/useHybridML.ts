/**
 * React hook for Hybrid ML Service
 * Provides easy access to client + server ML analysis with instant feedback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { hybridML, ClientPrediction, ServerAnalysis, HybridResult } from '@/lib/ml/hybrid-ml-service';

interface UseHybridMLOptions {
  userId?: string;
  facilityId?: string;
  skipClientPreview?: boolean;
  skipServerAnalysis?: boolean;
  autoAnalyze?: boolean; // Automatically analyze when input changes
}

interface UseHybridMLState {
  isAnalyzing: boolean;
  instantResult: ClientPrediction | null;
  detailedResult: ServerAnalysis | null;
  combinedResult: any;
  error: string | null;
  processingTimes: {
    client?: number;
    server?: number;
    total?: number;
  };
}

export function useHybridML(modelType: string, options: UseHybridMLOptions = {}) {
  const [state, setState] = useState<UseHybridMLState>({
    isAnalyzing: false,
    instantResult: null,
    detailedResult: null,
    combinedResult: null,
    error: null,
    processingTimes: {}
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const analysisStartTime = useRef<number>(0);

  // Listen for instant ML results
  useEffect(() => {
    const handleInstantResult = (event: CustomEvent) => {
      if (event.detail.modelType === modelType) {
        setState(prev => ({
          ...prev,
          instantResult: event.detail.prediction,
          processingTimes: {
            ...prev.processingTimes,
            client: event.detail.prediction.processingTime
          }
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ml-instant-result', handleInstantResult as EventListener);
      return () => {
        window.removeEventListener('ml-instant-result', handleInstantResult as EventListener);
      };
    }
  }, [modelType]);

  // Cancel any ongoing analysis
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isAnalyzing: false }));
  }, []);

  // Perform hybrid analysis
  const analyze = useCallback(async (input: any): Promise<HybridResult | null> => {
    // Cancel any ongoing analysis
    cancelAnalysis();

    // Reset state
    setState({
      isAnalyzing: true,
      instantResult: null,
      detailedResult: null,
      combinedResult: null,
      error: null,
      processingTimes: {}
    });

    analysisStartTime.current = performance.now();
    abortControllerRef.current = new AbortController();

    try {
      const result = await hybridML.analyzeHybrid(modelType as any, input, {
        ...options,
        abortSignal: abortControllerRef.current.signal
      });

      const totalTime = performance.now() - analysisStartTime.current;

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        instantResult: result.instant,
        detailedResult: result.detailed,
        combinedResult: result.combined,
        processingTimes: {
          client: result.instant?.processingTime,
          server: result.detailed?.processingTime,
          total: totalTime
        }
      }));

      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Analysis was cancelled, don't update state
        return null;
      }

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || 'Analysis failed'
      }));

      return null;
    }
  }, [modelType, options, cancelAnalysis]);

  // Server-only analysis for platform intelligence features
  const analyzeServerOnly = useCallback(async (input: any): Promise<ServerAnalysis | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const result = await hybridML.serverOnlyAnalysis(modelType as any, input, options);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        detailedResult: result,
        combinedResult: result.detailed
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || 'Server analysis failed'
      }));

      return null;
    }
  }, [modelType, options]);

  // Get model capabilities
  const capabilities = useCallback(() => {
    const models = hybridML.getAvailableModels();
    return models[modelType] || { hasClient: false, hasServer: false, capabilities: [] };
  }, [modelType]);

  // Auto-analyze when dependencies change
  const autoAnalyzeRef = useRef<any>(null);
  useEffect(() => {
    if (options.autoAnalyze && autoAnalyzeRef.current) {
      const timeoutId = setTimeout(() => {
        analyze(autoAnalyzeRef.current);
      }, 500); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [options.autoAnalyze, analyze]);

  // Update auto-analyze input
  const setAutoAnalyzeInput = useCallback((input: any) => {
    autoAnalyzeRef.current = input;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnalysis();
    };
  }, [cancelAnalysis]);

  return {
    // State
    ...state,
    
    // Actions
    analyze,
    analyzeServerOnly,
    cancel: cancelAnalysis,
    setAutoAnalyzeInput,
    
    // Utilities
    capabilities: capabilities(),
    hasInstantFeedback: capabilities().hasClient,
    hasPlatformIntelligence: capabilities().hasServer,
    
    // Helpers
    isServerOnlyModel: ['energyOptimization', 'recipeOptimization'].includes(modelType),
    
    // Status helpers
    hasResults: state.instantResult || state.detailedResult,
    hasInstantResults: !!state.instantResult,
    hasDetailedResults: !!state.detailedResult,
  };
}

// Specialized hooks for common use cases
export function usePlantHealthAnalysis(options: UseHybridMLOptions = {}) {
  return useHybridML('plantHealth', options);
}

export function useYieldPrediction(options: UseHybridMLOptions = {}) {
  return useHybridML('yieldPrediction', options);
}

export function useDiseaseDetection(options: UseHybridMLOptions = {}) {
  return useHybridML('diseaseDetection', options);
}

export function useEnergyOptimization(options: UseHybridMLOptions = {}) {
  return useHybridML('energyOptimization', options);
}

export function useRecipeOptimization(options: UseHybridMLOptions = {}) {
  return useHybridML('recipeOptimization', options);
}

// Hook for batch analysis
export function useBatchHybridML() {
  const [analyses, setAnalyses] = useState<Map<string, UseHybridMLState>>(new Map());
  const [isRunning, setIsRunning] = useState(false);

  const runBatch = useCallback(async (
    items: Array<{ id: string; modelType: string; input: any; options?: UseHybridMLOptions }>
  ) => {
    setIsRunning(true);
    const results = new Map<string, UseHybridMLState>();

    try {
      const promises = items.map(async (item) => {
        const startTime = performance.now();
        
        try {
          const result = await hybridML.analyzeHybrid(item.modelType as any, item.input, item.options || {});
          const totalTime = performance.now() - startTime;

          results.set(item.id, {
            isAnalyzing: false,
            instantResult: result.instant,
            detailedResult: result.detailed,
            combinedResult: result.combined,
            error: null,
            processingTimes: {
              client: result.instant?.processingTime,
              server: result.detailed?.processingTime,
              total: totalTime
            }
          });
        } catch (error: any) {
          results.set(item.id, {
            isAnalyzing: false,
            instantResult: null,
            detailedResult: null,
            combinedResult: null,
            error: error.message,
            processingTimes: {}
          });
        }
      });

      await Promise.all(promises);
      setAnalyses(results);
    } finally {
      setIsRunning(false);
    }

    return results;
  }, []);

  const getResult = useCallback((id: string) => {
    return analyses.get(id) || null;
  }, [analyses]);

  return {
    analyses,
    isRunning,
    runBatch,
    getResult,
    clear: () => setAnalyses(new Map())
  };
}

// Hook for real-time analysis streaming
export function useStreamingML(modelType: string, options: UseHybridMLOptions = {}) {
  const [results, setResults] = useState<HybridResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = useCallback((inputStream: AsyncIterable<any>) => {
    setIsStreaming(true);
    setResults([]);

    (async () => {
      try {
        for await (const input of inputStream) {
          const result = await hybridML.analyzeHybrid(modelType as any, input, options);
          if (result) {
            setResults(prev => [...prev, result]);
          }
        }
      } catch (error) {
        console.error('Streaming analysis error:', error);
      } finally {
        setIsStreaming(false);
      }
    })();
  }, [modelType, options]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
  }, []);

  return {
    results,
    isStreaming,
    startStreaming,
    stopStreaming,
    latestResult: results[results.length - 1] || null,
    resultCount: results.length
  };
}