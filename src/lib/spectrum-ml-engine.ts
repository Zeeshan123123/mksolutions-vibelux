// VibeLux Spectrum ML Engine - Functional Implementation
import { EventEmitter } from 'events';

export interface SpectrumOptimizationParams {
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  currentSpectrum?: SpectrumProfile;
  environmentalFactors: {
    temperature: number;
    humidity: number;
    co2Level: number;
    photoperiod: number;
  };
}

export interface SpectrumProfile {
  red: number;
  blue: number;
  green: number;
  farRed: number;
  uv: number;
  white: number;
}

export interface SpectrumRecommendation {
  spectrum: SpectrumProfile;
  confidence: number;
  expectedYieldIncrease: number;
  energyEfficiency: number;
  reasoning: string[];
}

export class SpectrumMLEngine extends EventEmitter {
  private cropDatabase: Map<string, any> = new Map();
  
  constructor() {
    super();
    this.initializeCropDatabase();
  }
  
  private initializeCropDatabase() {
    // Initialize with proven spectrum data for common crops
    this.cropDatabase.set('lettuce', {
      seedling: { red: 0.25, blue: 0.35, green: 0.15, farRed: 0.10, uv: 0.05, white: 0.10 },
      vegetative: { red: 0.30, blue: 0.30, green: 0.20, farRed: 0.10, uv: 0.05, white: 0.05 },
      flowering: { red: 0.35, blue: 0.25, green: 0.20, farRed: 0.15, uv: 0.02, white: 0.03 }
    });
    
    this.cropDatabase.set('tomato', {
      seedling: { red: 0.30, blue: 0.30, green: 0.15, farRed: 0.15, uv: 0.05, white: 0.05 },
      vegetative: { red: 0.35, blue: 0.25, green: 0.20, farRed: 0.15, uv: 0.03, white: 0.02 },
      flowering: { red: 0.40, blue: 0.20, green: 0.15, farRed: 0.20, uv: 0.02, white: 0.03 },
      fruiting: { red: 0.45, blue: 0.15, green: 0.15, farRed: 0.20, uv: 0.02, white: 0.03 }
    });
    
    this.cropDatabase.set('cannabis', {
      seedling: { red: 0.25, blue: 0.40, green: 0.15, farRed: 0.10, uv: 0.05, white: 0.05 },
      vegetative: { red: 0.30, blue: 0.35, green: 0.20, farRed: 0.10, uv: 0.03, white: 0.02 },
      flowering: { red: 0.50, blue: 0.15, green: 0.15, farRed: 0.15, uv: 0.02, white: 0.03 }
    });
  }
  
  async optimizeSpectrum(params: SpectrumOptimizationParams): Promise<SpectrumRecommendation> {
    const { cropType, growthStage, currentSpectrum, environmentalFactors } = params;
    
    // Get base spectrum for crop and stage
    const cropData = this.cropDatabase.get(cropType.toLowerCase()) || this.getDefaultSpectrum();
    const baseSpectrum = cropData[growthStage] || cropData.vegetative || this.getDefaultSpectrum().vegetative;
    
    // Environmental adjustments
    const adjustedSpectrum = this.adjustForEnvironment(baseSpectrum, environmentalFactors);
    
    // Calculate confidence based on data availability and environmental factors
    const confidence = this.calculateConfidence(cropType, growthStage, environmentalFactors);
    
    // Calculate expected benefits
    const expectedYieldIncrease = this.calculateYieldIncrease(currentSpectrum, adjustedSpectrum, cropType);
    const energyEfficiency = this.calculateEnergyEfficiency(adjustedSpectrum);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(cropType, growthStage, adjustedSpectrum, environmentalFactors);
    
    const recommendation: SpectrumRecommendation = {
      spectrum: adjustedSpectrum,
      confidence,
      expectedYieldIncrease,
      energyEfficiency,
      reasoning
    };
    
    this.emit('optimization-complete', recommendation);
    return recommendation;
  }
  
  private adjustForEnvironment(baseSpectrum: SpectrumProfile, env: any): SpectrumProfile {
    const adjusted = { ...baseSpectrum };
    
    // High temperature adjustments - reduce red, increase blue
    if (env.temperature > 28) {
      adjusted.red = Math.max(0.1, adjusted.red - 0.05);
      adjusted.blue = Math.min(0.5, adjusted.blue + 0.03);
    }
    
    // Low light adjustments - optimize for photosynthetic efficiency
    if (env.photoperiod < 12) {
      adjusted.red = Math.min(0.5, adjusted.red + 0.05);
      adjusted.blue = Math.min(0.4, adjusted.blue + 0.03);
    }
    
    // High CO2 adjustments - can handle more light intensity
    if (env.co2Level > 800) {
      adjusted.red = Math.min(0.5, adjusted.red + 0.03);
      adjusted.farRed = Math.min(0.25, adjusted.farRed + 0.02);
    }
    
    return this.normalizeSpectrum(adjusted);
  }
  
  private normalizeSpectrum(spectrum: SpectrumProfile): SpectrumProfile {
    const total = Object.values(spectrum).reduce((sum, val) => sum + val, 0);
    const normalized = { ...spectrum };
    
    if (total !== 1.0) {
      Object.keys(normalized).forEach(key => {
        normalized[key as keyof SpectrumProfile] /= total;
      });
    }
    
    return normalized;
  }
  
  private calculateConfidence(cropType: string, growthStage: string, env: any): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for well-researched crops
    if (this.cropDatabase.has(cropType.toLowerCase())) {
      confidence += 0.2;
    }
    
    // Environmental factors within optimal ranges increase confidence
    if (env.temperature >= 20 && env.temperature <= 26) confidence += 0.05;
    if (env.humidity >= 50 && env.humidity <= 70) confidence += 0.05;
    if (env.co2Level >= 400 && env.co2Level <= 1200) confidence += 0.05;
    
    return Math.min(0.95, confidence);
  }
  
  private calculateYieldIncrease(current: SpectrumProfile | undefined, optimized: SpectrumProfile, cropType: string): number {
    if (!current) return 15; // Estimated improvement over generic spectrum
    
    // Calculate spectral efficiency difference
    const currentEfficiency = this.calculateSpectralEfficiency(current, cropType);
    const optimizedEfficiency = this.calculateSpectralEfficiency(optimized, cropType);
    
    return Math.max(0, Math.round((optimizedEfficiency - currentEfficiency) * 30));
  }
  
  private calculateSpectralEfficiency(spectrum: SpectrumProfile, cropType: string): number {
    // Simplified efficiency calculation based on photosynthetic action spectrum
    const photosynthetic = {
      red: 0.9,    // High photosynthetic efficiency
      blue: 0.8,   // Good for morphology and photosynthesis
      green: 0.3,  // Lower efficiency but some benefit
      farRed: 0.4, // Morphological effects
      uv: 0.2,     // Stress response, limited benefit
      white: 0.6   // Mixed spectrum benefit
    };
    
    let efficiency = 0;
    Object.entries(spectrum).forEach(([band, value]) => {
      efficiency += value * (photosynthetic[band as keyof typeof photosynthetic] || 0.5);
    });
    
    return efficiency;
  }
  
  private calculateEnergyEfficiency(spectrum: SpectrumProfile): number {
    // LED efficiency varies by wavelength - red LEDs are most efficient
    const ledEfficiency = {
      red: 0.45,
      blue: 0.35,
      green: 0.25,
      farRed: 0.50,
      uv: 0.15,
      white: 0.40
    };
    
    let weightedEfficiency = 0;
    Object.entries(spectrum).forEach(([band, value]) => {
      weightedEfficiency += value * (ledEfficiency[band as keyof typeof ledEfficiency] || 0.3);
    });
    
    return Math.round(weightedEfficiency * 100);
  }
  
  private generateReasoning(cropType: string, growthStage: string, spectrum: SpectrumProfile, env: any): string[] {
    const reasoning = [];
    
    if (spectrum.red > 0.35) {
      reasoning.push(`High red content (${Math.round(spectrum.red * 100)}%) optimized for photosynthetic efficiency during ${growthStage} stage`);
    }
    
    if (spectrum.blue > 0.25) {
      reasoning.push(`Blue spectrum (${Math.round(spectrum.blue * 100)}%) promotes compact growth and leaf development`);
    }
    
    if (spectrum.farRed > 0.15) {
      reasoning.push(`Far-red component (${Math.round(spectrum.farRed * 100)}%) included for stem elongation and flowering triggers`);
    }
    
    if (env.temperature > 28) {
      reasoning.push('Reduced red content to minimize heat stress in high-temperature environment');
    }
    
    if (env.co2Level > 800) {
      reasoning.push('Increased light intensity recommended due to elevated CO2 levels');
    }
    
    return reasoning;
  }
  
  private getDefaultSpectrum() {
    return {
      vegetative: { red: 0.30, blue: 0.30, green: 0.20, farRed: 0.10, uv: 0.05, white: 0.05 },
      flowering: { red: 0.40, blue: 0.20, green: 0.20, farRed: 0.15, uv: 0.03, white: 0.02 }
    };
  }
  
  async updateModel(trainingData: any): Promise<void> {
    // In a real implementation, this would update ML models
    // For now, we can store successful spectrum configurations
    if (trainingData.cropType && trainingData.growthStage && trainingData.spectrum && trainingData.yieldResult) {
      const cropData = this.cropDatabase.get(trainingData.cropType) || {};
      cropData[trainingData.growthStage] = { ...trainingData.spectrum };
      this.cropDatabase.set(trainingData.cropType, cropData);
      
      this.emit('model-updated', { cropType: trainingData.cropType, stage: trainingData.growthStage });
    }
  }
  
  getSupportedCrops(): string[] {
    return Array.from(this.cropDatabase.keys());
  }
  
  getSpectrumForCrop(cropType: string, growthStage: string): SpectrumProfile | null {
    const cropData = this.cropDatabase.get(cropType.toLowerCase());
    return cropData?.[growthStage] || null;
  }
}