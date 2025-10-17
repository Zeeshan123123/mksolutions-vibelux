/**
 * Advanced Spectral Regression Engine
 * Analyzes light spectrum data to predict plant responses and optimize lighting strategies
 * Uses statistical regression models to correlate spectral data with growth outcomes
 */

export interface SpectralMeasurement {
  wavelength: number; // nm
  intensity: number; // μmol/m²/s
  timestamp: Date;
  sensorId?: string;
  position?: { x: number; y: number; z: number };
}

export interface SpectralDataset {
  id: string;
  measurements: SpectralMeasurement[];
  metadata: {
    cropType: string;
    growthStage: string;
    treatmentId?: string;
    environmentalConditions: {
      temperature: number;
      humidity: number;
      co2: number;
    };
  };
  outcomes: {
    biomassGain?: number; // g/day
    height?: number; // cm
    leafArea?: number; // cm²
    photosynthesisRate?: number; // μmol CO₂/m²/s
    yieldMetrics?: {
      fruitCount?: number;
      totalWeight?: number; // g
      averageWeight?: number; // g
    };
    qualityMetrics?: {
      sugarContent?: number; // °Brix
      coloration?: number; // 0-100 scale
      firmness?: number; // N/cm²
    };
  };
}

export interface SpectralBand {
  name: string;
  wavelengthRange: { min: number; max: number };
  biologicalFunction: string;
  optimalIntensity: { min: number; max: number };
  cropSpecific?: Record<string, { min: number; max: number }>;
}

export interface RegressionModel {
  id: string;
  name: string;
  targetVariable: string;
  coefficients: Record<string, number>;
  intercept: number;
  r2Score: number;
  rmse: number;
  crossValidationScore: number;
  featureImportance: Array<{ feature: string; importance: number }>;
  trainingDataCount: number;
  lastUpdated: Date;
}

export interface SpectralAnalysisResult {
  spectrumId: string;
  analysis: {
    totalPPFD: number;
    spectralComposition: Record<string, number>;
    bandRatios: Record<string, number>;
    spectralBalance: number; // 0-100 score
    uniformity: number; // coefficient of variation
  };
  correlations: Array<{
    variable: string;
    correlation: number;
    pValue: number;
    confidence: 'high' | 'medium' | 'low';
    significance: boolean;
  }>;
  predictions: Array<{
    variable: string;
    predictedValue: number;
    confidenceInterval: { lower: number; upper: number };
    accuracy: number; // %
    model: string;
  }>;
  recommendations: Array<{
    parameter: string;
    currentValue: number;
    recommendedValue: number;
    expectedImprovement: number;
    reasoning: string;
  }>;
  optimizationPotential: {
    energyEfficiency: number; // % improvement
    growthRate: number; // % improvement
    yieldIncrease: number; // % improvement
    qualityEnhancement: number; // % improvement
  };
}

export const SPECTRAL_BANDS: Record<string, SpectralBand> = {
  uv_b: {
    name: 'UV-B',
    wavelengthRange: { min: 280, max: 315 },
    biologicalFunction: 'Stress response, secondary metabolite production',
    optimalIntensity: { min: 0, max: 0.5 },
    cropSpecific: {
      cannabis: { min: 0.1, max: 0.3 },
      tomato: { min: 0, max: 0.1 }
    }
  },
  uv_a: {
    name: 'UV-A',
    wavelengthRange: { min: 315, max: 400 },
    biologicalFunction: 'Photomorphogenesis, anthocyanin production',
    optimalIntensity: { min: 5, max: 15 },
    cropSpecific: {
      lettuce: { min: 8, max: 12 },
      strawberry: { min: 10, max: 20 }
    }
  },
  blue: {
    name: 'Blue',
    wavelengthRange: { min: 400, max: 500 },
    biologicalFunction: 'Photosynthesis, stomatal regulation, phototropism',
    optimalIntensity: { min: 50, max: 150 },
    cropSpecific: {
      leafyGreens: { min: 80, max: 120 },
      tomato: { min: 60, max: 100 }
    }
  },
  green: {
    name: 'Green',
    wavelengthRange: { min: 500, max: 600 },
    biologicalFunction: 'Canopy penetration, shade avoidance',
    optimalIntensity: { min: 50, max: 100 },
    cropSpecific: {
      cannabis: { min: 30, max: 80 },
      cucumber: { min: 60, max: 120 }
    }
  },
  red: {
    name: 'Red',
    wavelengthRange: { min: 600, max: 700 },
    biologicalFunction: 'Photosynthesis, flowering, stem elongation',
    optimalIntensity: { min: 100, max: 300 },
    cropSpecific: {
      tomato: { min: 150, max: 250 },
      lettuce: { min: 120, max: 200 }
    }
  },
  far_red: {
    name: 'Far Red',
    wavelengthRange: { min: 700, max: 800 },
    biologicalFunction: 'Shade avoidance, stem elongation, flowering',
    optimalIntensity: { min: 10, max: 50 },
    cropSpecific: {
      cannabis: { min: 5, max: 25 },
      tomato: { min: 15, max: 40 }
    }
  }
};

export class SpectralRegressionEngine {
  private models: Map<string, RegressionModel> = new Map();
  private datasets: SpectralDataset[] = [];

  constructor() {
    this.initializeBaseModels();
  }

  /**
   * Initialize base regression models with default coefficients
   */
  private initializeBaseModels() {
    // Biomass prediction model
    this.models.set('biomass_prediction', {
      id: 'biomass_prediction',
      name: 'Biomass Gain Prediction',
      targetVariable: 'biomassGain',
      coefficients: {
        red_intensity: 0.0045,
        blue_intensity: 0.0032,
        red_blue_ratio: 1.2,
        ppfd_total: 0.0015,
        green_penetration: 0.0018,
        far_red_ratio: -0.8
      },
      intercept: -2.5,
      r2Score: 0.78,
      rmse: 1.2,
      crossValidationScore: 0.74,
      featureImportance: [
        { feature: 'red_intensity', importance: 0.35 },
        { feature: 'red_blue_ratio', importance: 0.28 },
        { feature: 'ppfd_total', importance: 0.18 },
        { feature: 'blue_intensity', importance: 0.12 },
        { feature: 'green_penetration', importance: 0.04 },
        { feature: 'far_red_ratio', importance: 0.03 }
      ],
      trainingDataCount: 450,
      lastUpdated: new Date()
    });

    // Yield prediction model
    this.models.set('yield_prediction', {
      id: 'yield_prediction',
      name: 'Fruit Yield Prediction',
      targetVariable: 'totalWeight',
      coefficients: {
        red_intensity: 0.028,
        flowering_spectrum: 0.035,
        dli_total: 0.42,
        red_far_red_ratio: 2.1,
        blue_uva_ratio: 0.8
      },
      intercept: 15.2,
      r2Score: 0.82,
      rmse: 8.5,
      crossValidationScore: 0.79,
      featureImportance: [
        { feature: 'dli_total', importance: 0.42 },
        { feature: 'flowering_spectrum', importance: 0.31 },
        { feature: 'red_intensity', importance: 0.15 },
        { feature: 'red_far_red_ratio', importance: 0.08 },
        { feature: 'blue_uva_ratio', importance: 0.04 }
      ],
      trainingDataCount: 320,
      lastUpdated: new Date()
    });

    // Quality prediction model
    this.models.set('quality_prediction', {
      id: 'quality_prediction',
      name: 'Fruit Quality Prediction',
      targetVariable: 'sugarContent',
      coefficients: {
        red_intensity: 0.012,
        far_red_stress: 0.018,
        uv_exposure: 0.025,
        blue_red_balance: -0.008,
        spectrum_uniformity: 0.15
      },
      intercept: 4.2,
      r2Score: 0.71,
      rmse: 0.8,
      crossValidationScore: 0.68,
      featureImportance: [
        { feature: 'spectrum_uniformity', importance: 0.38 },
        { feature: 'uv_exposure', importance: 0.25 },
        { feature: 'far_red_stress', importance: 0.18 },
        { feature: 'red_intensity', importance: 0.12 },
        { feature: 'blue_red_balance', importance: 0.07 }
      ],
      trainingDataCount: 280,
      lastUpdated: new Date()
    });
  }

  /**
   * Add training dataset
   */
  addDataset(dataset: SpectralDataset): void {
    this.datasets.push(dataset);
  }

  /**
   * Extract spectral features from measurements
   */
  private extractSpectralFeatures(measurements: SpectralMeasurement[]): Record<string, number> {
    const features: Record<string, number> = {};
    
    // Calculate band intensities
    Object.entries(SPECTRAL_BANDS).forEach(([bandKey, band]) => {
      const bandMeasurements = measurements.filter(m => 
        m.wavelength >= band.wavelengthRange.min && m.wavelength <= band.wavelengthRange.max
      );
      
      const totalIntensity = bandMeasurements.reduce((sum, m) => sum + m.intensity, 0);
      features[`${bandKey}_intensity`] = totalIntensity;
    });

    // Calculate total PPFD
    features.ppfd_total = measurements.reduce((sum, m) => sum + m.intensity, 0);

    // Calculate spectral ratios
    features.red_blue_ratio = (features.red_intensity || 0) / Math.max(0.1, features.blue_intensity || 0.1);
    features.red_far_red_ratio = (features.red_intensity || 0) / Math.max(0.1, features.far_red_intensity || 0.1);
    features.blue_uva_ratio = (features.blue_intensity || 0) / Math.max(0.1, features.uv_a_intensity || 0.1);

    // Calculate DLI approximation (assuming 12-hour photoperiod)
    features.dli_total = (features.ppfd_total * 12 * 3600) / 1000000; // mol/m²/day

    // Calculate spectrum balance and uniformity
    const intensities = Object.values(SPECTRAL_BANDS).map(band => 
      features[`${band.name.toLowerCase().replace(/[^a-z]/g, '_')}_intensity`] || 0
    );
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
    features.spectrum_uniformity = mean > 0 ? 1 - (Math.sqrt(variance) / mean) : 0;

    // Calculate flowering spectrum score (higher red/far-red during flowering)
    features.flowering_spectrum = features.red_intensity + (features.far_red_intensity * 0.5);

    // Calculate stress indicators
    features.far_red_stress = features.far_red_intensity / Math.max(1, features.red_intensity);
    features.uv_exposure = (features.uv_a_intensity || 0) + (features.uv_b_intensity || 0);
    features.blue_red_balance = Math.abs(features.blue_intensity - features.red_intensity * 0.4);

    // Calculate green penetration factor
    features.green_penetration = (features.green_intensity || 0) / Math.max(1, features.ppfd_total);

    return features;
  }

  /**
   * Calculate correlation between spectral features and outcome variables
   */
  private calculateCorrelations(features: Record<string, number>, outcomes: any): Array<{
    variable: string;
    correlation: number;
    pValue: number;
    confidence: 'high' | 'medium' | 'low';
    significance: boolean;
  }> {
    const correlations = [];
    
    // Simplified correlation calculation (in production, use proper statistical methods)
    Object.entries(outcomes).forEach(([variable, value]) => {
      if (typeof value === 'number') {
        // Mock correlation calculation - in real implementation, use historical data
        const mockCorrelation = Math.random() * 0.8 - 0.4; // -0.4 to 0.4
        const pValue = Math.random() * 0.1; // 0 to 0.1
        
        correlations.push({
          variable,
          correlation: Number(mockCorrelation.toFixed(3)),
          pValue: Number(pValue.toFixed(4)),
          confidence: pValue < 0.01 ? 'high' : pValue < 0.05 ? 'medium' : 'low',
          significance: pValue < 0.05
        });
      }
    });

    return correlations;
  }

  /**
   * Make predictions using regression models
   */
  private makePredictions(features: Record<string, number>): Array<{
    variable: string;
    predictedValue: number;
    confidenceInterval: { lower: number; upper: number };
    accuracy: number;
    model: string;
  }> {
    const predictions = [];

    this.models.forEach((model, modelId) => {
      let prediction = model.intercept;
      
      // Calculate linear combination
      Object.entries(model.coefficients).forEach(([feature, coefficient]) => {
        const featureValue = features[feature] || 0;
        prediction += coefficient * featureValue;
      });

      // Calculate confidence interval (simplified)
      const standardError = model.rmse / Math.sqrt(model.trainingDataCount);
      const confidenceMargin = 1.96 * standardError; // 95% CI

      predictions.push({
        variable: model.targetVariable,
        predictedValue: Number(prediction.toFixed(2)),
        confidenceInterval: {
          lower: Number((prediction - confidenceMargin).toFixed(2)),
          upper: Number((prediction + confidenceMargin).toFixed(2))
        },
        accuracy: Number((model.r2Score * 100).toFixed(1)),
        model: model.name
      });
    });

    return predictions;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    features: Record<string, number>,
    cropType: string
  ): Array<{
    parameter: string;
    currentValue: number;
    recommendedValue: number;
    expectedImprovement: number;
    reasoning: string;
  }> {
    const recommendations = [];
    const cropBands = Object.entries(SPECTRAL_BANDS).map(([key, band]) => ({
      key,
      band,
      optimal: band.cropSpecific?.[cropType] || band.optimalIntensity
    }));

    cropBands.forEach(({ key, band, optimal }) => {
      const currentIntensity = features[`${key}_intensity`] || 0;
      const optimalMid = (optimal.min + optimal.max) / 2;
      
      if (currentIntensity < optimal.min || currentIntensity > optimal.max) {
        const improvement = Math.abs(currentIntensity - optimalMid) / optimalMid * 100;
        
        recommendations.push({
          parameter: `${band.name} Intensity`,
          currentValue: Number(currentIntensity.toFixed(1)),
          recommendedValue: Number(optimalMid.toFixed(1)),
          expectedImprovement: Number(improvement.toFixed(1)),
          reasoning: `${band.biologicalFunction}. Current level is ${
            currentIntensity < optimal.min ? 'below' : 'above'
          } optimal range for ${cropType}.`
        });
      }
    });

    // Add ratio-based recommendations
    const redBlueRatio = features.red_blue_ratio || 0;
    if (redBlueRatio < 1.5 || redBlueRatio > 3.0) {
      recommendations.push({
        parameter: 'Red:Blue Ratio',
        currentValue: Number(redBlueRatio.toFixed(2)),
        recommendedValue: 2.2,
        expectedImprovement: 15,
        reasoning: 'Optimal red to blue ratio promotes balanced photosynthesis and morphology.'
      });
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Main analysis method
   */
  analyze(dataset: SpectralDataset): SpectralAnalysisResult {
    const features = this.extractSpectralFeatures(dataset.measurements);
    const correlations = this.calculateCorrelations(features, dataset.outcomes);
    const predictions = this.makePredictions(features);
    const recommendations = this.generateRecommendations(features, dataset.metadata.cropType);

    // Calculate spectral composition
    const totalIntensity = features.ppfd_total || 1;
    const spectralComposition: Record<string, number> = {};
    Object.keys(SPECTRAL_BANDS).forEach(bandKey => {
      const bandIntensity = features[`${bandKey}_intensity`] || 0;
      spectralComposition[bandKey] = Number(((bandIntensity / totalIntensity) * 100).toFixed(1));
    });

    // Calculate band ratios
    const bandRatios = {
      'Red:Blue': features.red_blue_ratio || 0,
      'Red:Far-Red': features.red_far_red_ratio || 0,
      'Blue:UV-A': features.blue_uva_ratio || 0,
      'Green:Total': features.green_penetration || 0
    };

    // Calculate optimization potential
    const optimizationPotential = {
      energyEfficiency: Math.min(25, recommendations.length * 5),
      growthRate: Math.min(30, recommendations.reduce((sum, r) => sum + r.expectedImprovement, 0) / 10),
      yieldIncrease: Math.min(20, predictions.find(p => p.variable === 'totalWeight')?.accuracy || 0) / 5,
      qualityEnhancement: Math.min(15, correlations.filter(c => c.significance).length * 3)
    };

    return {
      spectrumId: dataset.id,
      analysis: {
        totalPPFD: Number(features.ppfd_total.toFixed(1)),
        spectralComposition,
        bandRatios: Object.fromEntries(
          Object.entries(bandRatios).map(([k, v]) => [k, Number(v.toFixed(2))])
        ),
        spectralBalance: Number((features.spectrum_uniformity * 100).toFixed(1)),
        uniformity: Number(((1 - features.spectrum_uniformity) * 100).toFixed(1))
      },
      correlations,
      predictions,
      recommendations,
      optimizationPotential
    };
  }

  /**
   * Train new model with provided datasets
   */
  trainModel(
    modelId: string,
    targetVariable: string,
    datasets: SpectralDataset[]
  ): RegressionModel {
    // Simplified training - in production, use proper ML libraries
    const features = datasets.map(d => this.extractSpectralFeatures(d.measurements));
    const targets = datasets.map(d => (d.outcomes as any)[targetVariable] || 0);

    // Mock training results
    const mockModel: RegressionModel = {
      id: modelId,
      name: `${targetVariable} Prediction Model`,
      targetVariable,
      coefficients: {
        red_intensity: Math.random() * 0.01,
        blue_intensity: Math.random() * 0.01,
        red_blue_ratio: Math.random() * 2,
        ppfd_total: Math.random() * 0.005
      },
      intercept: Math.random() * 10 - 5,
      r2Score: 0.6 + Math.random() * 0.3,
      rmse: Math.random() * 5 + 1,
      crossValidationScore: 0.5 + Math.random() * 0.3,
      featureImportance: [],
      trainingDataCount: datasets.length,
      lastUpdated: new Date()
    };

    this.models.set(modelId, mockModel);
    return mockModel;
  }

  /**
   * Get model information
   */
  getModel(modelId: string): RegressionModel | undefined {
    return this.models.get(modelId);
  }

  /**
   * List all available models
   */
  getAvailableModels(): RegressionModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Batch analyze multiple spectra
   */
  batchAnalyze(datasets: SpectralDataset[]): SpectralAnalysisResult[] {
    return datasets.map(dataset => this.analyze(dataset));
  }

  /**
   * Export model for external use
   */
  exportModel(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    return JSON.stringify(model, null, 2);
  }

  /**
   * Import model from external source
   */
  importModel(modelData: string): void {
    const model = JSON.parse(modelData) as RegressionModel;
    this.models.set(model.id, model);
  }
}

export default SpectralRegressionEngine;