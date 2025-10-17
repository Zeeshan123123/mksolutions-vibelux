import { claudeAI } from './claude-service';
import { prisma } from '@/lib/prisma';

export interface YieldPredictionInput {
  facilityId: string;
  cropType: string;
  area: number; // sq ft
  plantCount: number;
  plantingDate: Date;
  currentStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  cultivar?: string;
}

export interface EnvironmentalAverages {
  temperature: number; // °C
  humidity: number; // %
  ppfd: number; // μmol/m²/s
  dli: number; // mol/m²/day
  co2: number; // ppm
  vpd: number; // kPa
  photoperiod: number; // hours
  ec?: number; // mS/cm
  ph?: number;
  waterTemp?: number; // °C
}

export interface YieldPrediction {
  expectedYield: number;
  unit: string;
  confidence: number;
  harvestDate: Date;
  daysToHarvest: number;
  qualityScore: number; // 0-100
  yieldPerSqFt: number;
  yieldPerPlant: number;
}

export interface YieldFactors {
  positive: Array<{
    factor: string;
    impact: number; // percentage
    description: string;
    currentValue?: any;
    optimalValue?: any;
  }>;
  negative: Array<{
    factor: string;
    impact: number; // negative percentage
    description: string;
    currentValue?: any;
    recommendedValue?: any;
  }>;
}

export interface YieldOptimization {
  potentialYield: number;
  potentialIncrease: number; // percentage
  improvements: Array<{
    action: string;
    expectedIncrease: number; // percentage
    difficulty: 'easy' | 'medium' | 'hard';
    timeToImplement: string;
    cost: string;
    roi: string;
    priority: number; // 1-10
  }>;
}

export interface YieldComparison {
  industryAverage: number;
  topPerformers: number;
  yourRanking: string;
  percentile: number;
  benchmarkSource: string;
}

export interface YieldPredictionResult {
  prediction: YieldPrediction;
  factors: YieldFactors;
  optimization: YieldOptimization;
  comparison: YieldComparison;
  historicalAccuracy?: number;
  confidenceFactors: string[];
}

export class YieldPredictionService {
  private static instance: YieldPredictionService;
  
  // Industry benchmark data (lbs/sq ft/year)
  private readonly industryBenchmarks = {
    'cannabis': {
      average: 0.125,
      good: 0.175,
      excellent: 0.225,
      topPerformers: 0.275,
      factors: {
        optimal_ppfd: 800,
        optimal_co2: 1200,
        optimal_vpd: { veg: 0.8, flower: 1.2 },
        optimal_temperature: { day: 26, night: 20 },
      }
    },
    'tomato': {
      average: 2.5,
      good: 3.5,
      excellent: 4.5,
      topPerformers: 6.0,
      factors: {
        optimal_ppfd: 600,
        optimal_co2: 1000,
        optimal_vpd: { veg: 0.7, fruit: 0.9 },
        optimal_temperature: { day: 24, night: 18 },
      }
    },
    'lettuce': {
      average: 5.0,
      good: 7.0,
      excellent: 9.0,
      topPerformers: 11.0,
      factors: {
        optimal_ppfd: 200,
        optimal_co2: 800,
        optimal_vpd: { all: 0.65 },
        optimal_temperature: { day: 20, night: 16 },
      }
    },
    'basil': {
      average: 1.5,
      good: 2.0,
      excellent: 2.5,
      topPerformers: 3.0,
      factors: {
        optimal_ppfd: 300,
        optimal_co2: 900,
        optimal_vpd: { all: 0.7 },
        optimal_temperature: { day: 24, night: 20 },
      }
    },
  };

  // Growth models for different crops
  private readonly growthModels = {
    'cannabis': {
      stages: {
        seedling: { duration: 14, yieldFactor: 0 },
        vegetative: { duration: 28, yieldFactor: 0 },
        flowering: { duration: 63, yieldFactor: 1.0 },
      },
      yieldCurve: (day: number, totalDays: number) => {
        // S-curve growth model
        const midpoint = totalDays * 0.7;
        const steepness = 0.1;
        return 1 / (1 + Math.exp(-steepness * (day - midpoint)));
      }
    },
    'tomato': {
      stages: {
        seedling: { duration: 21, yieldFactor: 0 },
        vegetative: { duration: 35, yieldFactor: 0 },
        flowering: { duration: 14, yieldFactor: 0.1 },
        fruiting: { duration: 50, yieldFactor: 0.9 },
      },
      yieldCurve: (day: number, totalDays: number) => {
        // Linear increase after fruiting starts
        const fruitStart = 70;
        if (day < fruitStart) return 0;
        return (day - fruitStart) / (totalDays - fruitStart);
      }
    },
  };

  private constructor() {}
  
  static getInstance(): YieldPredictionService {
    if (!this.instance) {
      this.instance = new YieldPredictionService();
    }
    return this.instance;
  }

  /**
   * Predict yield using AI and scientific models
   */
  async predictYield(
    userId: string,
    input: YieldPredictionInput,
    environmentalData: EnvironmentalAverages
  ): Promise<YieldPredictionResult> {
    try {
      // Get historical yield data
      const historicalYields = await this.getHistoricalYields(input.facilityId, input.cropType);
      
      // Calculate base yield using scientific models
      const baseYield = this.calculateBaseYield(input, environmentalData);
      
      // Get AI-enhanced prediction
      const aiResponse = await claudeAI.predictYield(
        userId,
        {
          cropType: input.cropType,
          area: input.area,
          currentStage: input.currentStage,
          plantingDate: input.plantingDate,
        },
        {
          avgTemperature: environmentalData.temperature,
          avgHumidity: environmentalData.humidity,
          avgPPFD: environmentalData.ppfd,
          avgCO2: environmentalData.co2,
          avgVPD: environmentalData.vpd,
        },
        historicalYields
      );

      if (!aiResponse.success || !aiResponse.data) {
        // Fallback to model-based prediction
        return this.modelBasedPrediction(input, environmentalData, baseYield);
      }

      // Combine AI prediction with scientific models
      const combinedPrediction = this.combineP

 redictions(
        aiResponse.data,
        baseYield,
        input,
        environmentalData
      );

      // Calculate historical accuracy if we have past data
      const historicalAccuracy = await this.calculateHistoricalAccuracy(
        input.facilityId,
        input.cropType
      );

      // Log prediction for future learning
      await this.logPrediction({
        facilityId: input.facilityId,
        userId,
        input,
        environmentalData,
        prediction: combinedPrediction.prediction,
        timestamp: new Date(),
      });

      return {
        ...combinedPrediction,
        historicalAccuracy,
        confidenceFactors: this.getConfidenceFactors(input, environmentalData, historicalYields),
      };

    } catch (error) {
      logger.error('api', 'Yield prediction error:', error );
      throw error;
    }
  }

  /**
   * Real-time yield tracking and adjustment
   */
  async trackYieldProgress(
    facilityId: string,
    actualYield: number,
    harvestDate: Date
  ): Promise<{ accuracy: number; learnings: string[] }> {
    try {
      // Get the most recent prediction for this harvest
      const prediction = await prisma.yieldPrediction.findFirst({
        where: {
          facilityId,
          predictedHarvestDate: {
            gte: new Date(harvestDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: new Date(harvestDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!prediction) {
        return { accuracy: 0, learnings: ['No prediction found for this harvest'] };
      }

      // Calculate accuracy
      const accuracy = 1 - Math.abs(actualYield - prediction.expectedYield) / actualYield;
      
      // Update prediction with actual results
      await prisma.yieldPrediction.update({
        where: { id: prediction.id },
        data: {
          actualYield,
          actualHarvestDate: harvestDate,
          accuracy,
        },
      });

      // Extract learnings
      const learnings = await this.extractLearnings(prediction, actualYield, accuracy);

      return { accuracy: accuracy * 100, learnings };

    } catch (error) {
      logger.error('api', 'Error tracking yield progress:', error );
      throw error;
    }
  }

  /**
   * Calculate base yield using scientific models
   */
  private calculateBaseYield(
    input: YieldPredictionInput,
    environmental: EnvironmentalAverages
  ): number {
    const benchmark = this.industryBenchmarks[input.cropType as keyof typeof this.industryBenchmarks];
    if (!benchmark) {
      // Default to average yield for unknown crops
      return input.area * 2.0; // 2 lbs/sq ft as default
    }

    let yieldPerSqFt = benchmark.average;

    // Environmental factor adjustments
    const factors = benchmark.factors;
    
    // PPFD factor (light is critical)
    const ppfdRatio = environmental.ppfd / factors.optimal_ppfd;
    const ppfdFactor = Math.min(1.2, Math.max(0.5, ppfdRatio));
    yieldPerSqFt *= ppfdFactor;

    // CO2 factor
    const co2Ratio = environmental.co2 / factors.optimal_co2;
    const co2Factor = Math.min(1.15, Math.max(0.7, co2Ratio));
    yieldPerSqFt *= co2Factor;

    // VPD factor
    const stage = input.currentStage === 'flowering' || input.currentStage === 'fruiting' ? 'flower' : 'veg';
    const optimalVPD = factors.optimal_vpd[stage as keyof typeof factors.optimal_vpd] || factors.optimal_vpd.all || 1.0;
    const vpdDeviation = Math.abs(environmental.vpd - optimalVPD);
    const vpdFactor = Math.max(0.7, 1 - (vpdDeviation * 0.3));
    yieldPerSqFt *= vpdFactor;

    // Temperature factor
    const tempDeviation = Math.abs(environmental.temperature - factors.optimal_temperature.day);
    const tempFactor = Math.max(0.6, 1 - (tempDeviation * 0.05));
    yieldPerSqFt *= tempFactor;

    // DLI factor (integrated light)
    const optimalDLI = (factors.optimal_ppfd * environmental.photoperiod * 3600) / 1000000;
    const dliFactor = Math.min(1.1, environmental.dli / optimalDLI);
    yieldPerSqFt *= dliFactor;

    // Calculate total yield
    const totalYield = yieldPerSqFt * input.area;
    
    // Adjust for growth stage
    const model = this.growthModels[input.cropType as keyof typeof this.growthModels];
    if (model) {
      const daysSincePlanting = Math.floor(
        (Date.now() - input.plantingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalGrowthDays = Object.values(model.stages).reduce((sum, stage) => sum + stage.duration, 0);
      const growthProgress = model.yieldCurve(daysSincePlanting, totalGrowthDays);
      
      return totalYield * growthProgress;
    }

    return totalYield;
  }

  /**
   * Combine AI predictions with scientific models
   */
  private combinePredictions(
    aiPrediction: any,
    modelYield: number,
    input: YieldPredictionInput,
    environmental: EnvironmentalAverages
  ): Omit<YieldPredictionResult, 'historicalAccuracy' | 'confidenceFactors'> {
    // Weight AI vs model predictions based on confidence
    const aiWeight = aiPrediction.prediction.confidence || 0.7;
    const modelWeight = 1 - aiWeight;
    
    const combinedYield = (aiPrediction.prediction.expectedYield * aiWeight) + (modelYield * modelWeight);
    
    // Calculate harvest date
    const harvestDate = new Date(aiPrediction.prediction.harvestDate);
    const daysToHarvest = Math.ceil((harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Enhanced prediction object
    const prediction: YieldPrediction = {
      expectedYield: combinedYield,
      unit: aiPrediction.prediction.unit || 'lbs',
      confidence: (aiPrediction.prediction.confidence + 0.85) / 2, // Boost confidence with model backing
      harvestDate,
      daysToHarvest,
      qualityScore: aiPrediction.prediction.qualityScore || this.estimateQualityScore(environmental),
      yieldPerSqFt: combinedYield / input.area,
      yieldPerPlant: combinedYield / input.plantCount,
    };

    // Enhance factors with specific environmental data
    const factors: YieldFactors = {
      positive: this.enhanceFactors(aiPrediction.factors.positive, environmental, true),
      negative: this.enhanceFactors(aiPrediction.factors.negative, environmental, false),
    };

    // Calculate realistic optimization potential
    const optimization = this.calculateOptimization(
      prediction,
      factors,
      aiPrediction.optimization,
      environmental
    );

    // Get accurate comparison data
    const comparison = this.getComparison(
      input.cropType,
      prediction.yieldPerSqFt,
      aiPrediction.comparison
    );

    return {
      prediction,
      factors,
      optimization,
      comparison,
    };
  }

  /**
   * Enhance factor analysis with environmental data
   */
  private enhanceFactors(
    factors: any[],
    environmental: EnvironmentalAverages,
    positive: boolean
  ): YieldFactors['positive'] | YieldFactors['negative'] {
    return factors.map(factor => {
      // Add current values based on factor type
      let currentValue: any;
      let optimalValue: any;
      
      if (factor.factor.toLowerCase().includes('light') || factor.factor.toLowerCase().includes('ppfd')) {
        currentValue = `${environmental.ppfd} μmol/m²/s`;
        optimalValue = '600-800 μmol/m²/s';
      } else if (factor.factor.toLowerCase().includes('co2')) {
        currentValue = `${environmental.co2} ppm`;
        optimalValue = '1000-1200 ppm';
      } else if (factor.factor.toLowerCase().includes('temperature')) {
        currentValue = `${environmental.temperature}°C`;
        optimalValue = '24-26°C';
      } else if (factor.factor.toLowerCase().includes('humidity') || factor.factor.toLowerCase().includes('vpd')) {
        currentValue = `${environmental.vpd.toFixed(2)} kPa`;
        optimalValue = '0.8-1.2 kPa';
      }

      return {
        ...factor,
        currentValue,
        ...(positive ? { optimalValue } : { recommendedValue: optimalValue }),
      };
    });
  }

  /**
   * Calculate realistic optimization potential
   */
  private calculateOptimization(
    prediction: YieldPrediction,
    factors: YieldFactors,
    aiOptimization: any,
    environmental: EnvironmentalAverages
  ): YieldOptimization {
    // Calculate realistic potential based on limiting factors
    const limitingFactors = factors.negative.map(f => f.impact).reduce((sum, impact) => sum + Math.abs(impact), 0);
    const potentialIncrease = Math.min(limitingFactors * 0.7, 50); // Cap at 50% increase
    
    const potentialYield = prediction.expectedYield * (1 + potentialIncrease / 100);
    
    // Prioritize improvements
    const improvements = aiOptimization.improvements.map((imp: any, index: number) => ({
      ...imp,
      priority: this.calculatePriority(imp, environmental),
      cost: this.estimateCost(imp.action),
      timeToImplement: this.estimateImplementationTime(imp.difficulty),
    })).sort((a: any, b: any) => b.priority - a.priority);

    return {
      potentialYield,
      potentialIncrease,
      improvements,
    };
  }

  /**
   * Get accurate comparison data
   */
  private getComparison(
    cropType: string,
    yieldPerSqFt: number,
    aiComparison: any
  ): YieldComparison {
    const benchmark = this.industryBenchmarks[cropType as keyof typeof this.industryBenchmarks];
    
    if (!benchmark) {
      return aiComparison; // Use AI comparison if no benchmark data
    }

    // Calculate percentile
    let ranking: string;
    let percentile: number;
    
    if (yieldPerSqFt >= benchmark.topPerformers) {
      ranking = 'Top 5% - Industry Leading';
      percentile = 95;
    } else if (yieldPerSqFt >= benchmark.excellent) {
      ranking = 'Top 20% - Excellent Performance';
      percentile = 80;
    } else if (yieldPerSqFt >= benchmark.good) {
      ranking = 'Top 40% - Good Performance';
      percentile = 60;
    } else if (yieldPerSqFt >= benchmark.average) {
      ranking = 'Average - Room for Improvement';
      percentile = 50;
    } else {
      ranking = 'Below Average - Significant Optimization Needed';
      percentile = Math.max(10, (yieldPerSqFt / benchmark.average) * 50);
    }

    return {
      industryAverage: benchmark.average,
      topPerformers: benchmark.topPerformers,
      yourRanking: ranking,
      percentile,
      benchmarkSource: 'VibeLux Industry Database 2024',
    };
  }

  /**
   * Model-based fallback prediction
   */
  private modelBasedPrediction(
    input: YieldPredictionInput,
    environmental: EnvironmentalAverages,
    baseYield: number
  ): YieldPredictionResult {
    // Calculate days to harvest
    const growthModel = this.growthModels[input.cropType as keyof typeof this.growthModels];
    let daysToHarvest = 30; // Default
    
    if (growthModel) {
      const totalDays = Object.values(growthModel.stages).reduce((sum, stage) => sum + stage.duration, 0);
      const daysSincePlanting = Math.floor(
        (Date.now() - input.plantingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysToHarvest = Math.max(0, totalDays - daysSincePlanting);
    }

    const harvestDate = new Date(Date.now() + daysToHarvest * 24 * 60 * 60 * 1000);

    const prediction: YieldPrediction = {
      expectedYield: baseYield,
      unit: 'lbs',
      confidence: 0.75,
      harvestDate,
      daysToHarvest,
      qualityScore: this.estimateQualityScore(environmental),
      yieldPerSqFt: baseYield / input.area,
      yieldPerPlant: baseYield / input.plantCount,
    };

    const factors = this.analyzeEnvironmentalFactors(environmental, input.cropType);
    const optimization = this.generateOptimizationSuggestions(factors, prediction);
    const comparison = this.getComparison(input.cropType, prediction.yieldPerSqFt, {});

    return {
      prediction,
      factors,
      optimization,
      comparison,
      confidenceFactors: ['Model-based prediction', 'Limited historical data'],
    };
  }

  /**
   * Analyze environmental factors for impact
   */
  private analyzeEnvironmentalFactors(
    environmental: EnvironmentalAverages,
    cropType: string
  ): YieldFactors {
    const benchmark = this.industryBenchmarks[cropType as keyof typeof this.industryBenchmarks];
    const factors: YieldFactors = { positive: [], negative: [] };

    if (!benchmark) return factors;

    // Light analysis
    const ppfdRatio = environmental.ppfd / benchmark.factors.optimal_ppfd;
    if (ppfdRatio >= 0.9 && ppfdRatio <= 1.1) {
      factors.positive.push({
        factor: 'Optimal light intensity',
        impact: 15,
        description: 'PPFD levels are in the optimal range for maximum photosynthesis',
        currentValue: `${environmental.ppfd} μmol/m²/s`,
        optimalValue: `${benchmark.factors.optimal_ppfd} μmol/m²/s`,
      });
    } else if (ppfdRatio < 0.9) {
      factors.negative.push({
        factor: 'Insufficient light',
        impact: -20 * (1 - ppfdRatio),
        description: 'Lower light levels limiting photosynthesis and growth',
        currentValue: `${environmental.ppfd} μmol/m²/s`,
        recommendedValue: `${benchmark.factors.optimal_ppfd} μmol/m²/s`,
      });
    }

    // CO2 analysis
    if (environmental.co2 >= benchmark.factors.optimal_co2 * 0.9) {
      factors.positive.push({
        factor: 'Enhanced CO2 levels',
        impact: 10,
        description: 'Elevated CO2 boosting photosynthesis rate',
        currentValue: `${environmental.co2} ppm`,
        optimalValue: `${benchmark.factors.optimal_co2} ppm`,
      });
    }

    // VPD analysis
    const optimalVPD = benchmark.factors.optimal_vpd.all || 1.0;
    const vpdDeviation = Math.abs(environmental.vpd - optimalVPD);
    if (vpdDeviation < 0.2) {
      factors.positive.push({
        factor: 'Ideal VPD range',
        impact: 8,
        description: 'Optimal vapor pressure deficit for transpiration',
        currentValue: `${environmental.vpd.toFixed(2)} kPa`,
        optimalValue: `${optimalVPD} kPa`,
      });
    } else {
      factors.negative.push({
        factor: 'Suboptimal VPD',
        impact: -10 * vpdDeviation,
        description: 'VPD outside ideal range affecting water uptake',
        currentValue: `${environmental.vpd.toFixed(2)} kPa`,
        recommendedValue: `${optimalVPD} kPa`,
      });
    }

    return factors;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    factors: YieldFactors,
    prediction: YieldPrediction
  ): YieldOptimization {
    const improvements: YieldOptimization['improvements'] = [];
    
    // Analyze negative factors for improvements
    for (const negativeFactor of factors.negative) {
      if (negativeFactor.factor.includes('light')) {
        improvements.push({
          action: 'Increase light intensity or add supplemental lighting',
          expectedIncrease: Math.abs(negativeFactor.impact) * 0.8,
          difficulty: 'medium',
          timeToImplement: '1-2 weeks',
          cost: '$500-2000',
          roi: '3-6 months',
          priority: 9,
        });
      } else if (negativeFactor.factor.includes('VPD')) {
        improvements.push({
          action: 'Adjust temperature and humidity for optimal VPD',
          expectedIncrease: Math.abs(negativeFactor.impact) * 0.6,
          difficulty: 'easy',
          timeToImplement: '1-3 days',
          cost: '$0-200',
          roi: '1 month',
          priority: 8,
        });
      }
    }

    // Always suggest monitoring improvements
    improvements.push({
      action: 'Implement real-time environmental monitoring',
      expectedIncrease: 5,
      difficulty: 'easy',
      timeToImplement: '1 week',
      cost: '$200-500',
      roi: '2 months',
      priority: 7,
    });

    const totalNegativeImpact = factors.negative.reduce((sum, f) => sum + Math.abs(f.impact), 0);
    const potentialIncrease = Math.min(totalNegativeImpact * 0.7, 40);

    return {
      potentialYield: prediction.expectedYield * (1 + potentialIncrease / 100),
      potentialIncrease,
      improvements: improvements.sort((a, b) => b.priority - a.priority),
    };
  }

  /**
   * Estimate quality score based on environmental conditions
   */
  private estimateQualityScore(environmental: EnvironmentalAverages): number {
    let score = 70; // Base score

    // Stable environment bonus
    if (environmental.vpd >= 0.8 && environmental.vpd <= 1.2) score += 10;
    if (environmental.co2 >= 1000) score += 5;
    if (environmental.ppfd >= 600) score += 10;
    if (environmental.dli >= 30) score += 5;

    return Math.min(100, score);
  }

  /**
   * Calculate priority for improvements
   */
  private calculatePriority(improvement: any, environmental: EnvironmentalAverages): number {
    let priority = 5;

    // High impact improvements
    if (improvement.expectedIncrease > 15) priority += 3;
    
    // Easy implementations
    if (improvement.difficulty === 'easy') priority += 2;
    
    // Quick ROI
    if (improvement.roi && improvement.roi.includes('1') && improvement.roi.includes('month')) priority += 2;
    
    // Address critical issues
    if (improvement.action.toLowerCase().includes('light') && environmental.ppfd < 400) priority += 3;
    
    return Math.min(10, priority);
  }

  /**
   * Estimate implementation costs
   */
  private estimateCost(action: string): string {
    const costMap: Record<string, string> = {
      light: '$1000-5000',
      temperature: '$200-1000',
      humidity: '$300-1500',
      co2: '$500-2000',
      monitoring: '$200-800',
      automation: '$1000-3000',
    };

    for (const [key, cost] of Object.entries(costMap)) {
      if (action.toLowerCase().includes(key)) return cost;
    }

    return '$500-2000'; // Default
  }

  /**
   * Estimate implementation time
   */
  private estimateImplementationTime(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '1-3 days';
      case 'medium': return '1-2 weeks';
      case 'hard': return '2-4 weeks';
      default: return '1 week';
    }
  }

  /**
   * Get confidence factors for transparency
   */
  private getConfidenceFactors(
    input: YieldPredictionInput,
    environmental: EnvironmentalAverages,
    historicalData: any[]
  ): string[] {
    const factors: string[] = [];

    if (historicalData.length > 10) {
      factors.push('Strong historical data (10+ harvests)');
    } else if (historicalData.length > 5) {
      factors.push('Moderate historical data (5-10 harvests)');
    } else {
      factors.push('Limited historical data');
    }

    // Environmental stability
    if (environmental.vpd >= 0.8 && environmental.vpd <= 1.2) {
      factors.push('Stable VPD conditions');
    }

    // Growth stage
    if (input.currentStage === 'flowering' || input.currentStage === 'fruiting') {
      factors.push('Late-stage prediction (higher accuracy)');
    } else {
      factors.push('Early-stage prediction (moderate accuracy)');
    }

    // Model confidence
    if (this.industryBenchmarks[input.cropType as keyof typeof this.industryBenchmarks]) {
      factors.push('Crop-specific model available');
    }

    return factors;
  }

  /**
   * Get historical yield data
   */
  private async getHistoricalYields(facilityId: string, cropType: string): Promise<any[]> {
    try {
      const yields = await prisma.harvest.findMany({
        where: {
          facilityId,
          cropType,
          actualYield: { not: null },
        },
        orderBy: { harvestDate: 'desc' },
        take: 20,
        include: {
          environmentalAverages: true,
        },
      });
      return yields;
    } catch (error) {
      logger.error('api', 'Failed to fetch historical yields:', error );
      return [];
    }
  }

  /**
   * Calculate historical prediction accuracy
   */
  private async calculateHistoricalAccuracy(facilityId: string, cropType: string): Promise<number | undefined> {
    try {
      const predictions = await prisma.yieldPrediction.findMany({
        where: {
          facilityId,
          cropType,
          actualYield: { not: null },
          accuracy: { not: null },
        },
        select: { accuracy: true },
        take: 10,
      });

      if (predictions.length === 0) return undefined;

      const avgAccuracy = predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / predictions.length;
      return avgAccuracy * 100;
    } catch (error) {
      logger.error('api', 'Failed to calculate historical accuracy:', error );
      return undefined;
    }
  }

  /**
   * Log prediction for learning
   */
  private async logPrediction(data: any): Promise<void> {
    try {
      await prisma.yieldPrediction.create({
        data: {
          facilityId: data.facilityId,
          userId: data.userId,
          cropType: data.input.cropType,
          expectedYield: data.prediction.expectedYield,
          predictedHarvestDate: data.prediction.harvestDate,
          confidence: data.prediction.confidence,
          qualityScore: data.prediction.qualityScore,
          environmentalData: JSON.stringify(data.environmentalData),
          inputData: JSON.stringify(data.input),
        },
      });
    } catch (error) {
      logger.error('api', 'Failed to log prediction:', error );
    }
  }

  /**
   * Extract learnings from prediction vs actual
   */
  private async extractLearnings(
    prediction: any,
    actualYield: number,
    accuracy: number
  ): Promise<string[]> {
    const learnings: string[] = [];
    
    const percentError = ((prediction.expectedYield - actualYield) / actualYield) * 100;
    
    if (Math.abs(percentError) < 10) {
      learnings.push('Prediction was highly accurate (within 10%)');
    } else if (percentError > 20) {
      learnings.push('Model overestimated yield - check for limiting factors');
      learnings.push('Consider environmental stress or pest/disease impact');
    } else if (percentError < -20) {
      learnings.push('Model underestimated yield - excellent growing conditions');
      learnings.push('Update benchmarks for this facility/cultivar combination');
    }

    // Analyze environmental data if available
    try {
      const envData = JSON.parse(prediction.environmentalData || '{}');
      if (envData.ppfd && accuracy < 0.8) {
        learnings.push('Review light measurement accuracy and coverage');
      }
      if (envData.vpd && (envData.vpd < 0.4 || envData.vpd > 1.4)) {
        learnings.push('Extreme VPD conditions affected prediction accuracy');
      }
    } catch (error) {
      // Ignore parsing errors
    }

    return learnings;
  }
}

// Export singleton instance
export const yieldPrediction = YieldPredictionService.getInstance();