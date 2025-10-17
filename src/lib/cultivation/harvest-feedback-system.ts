/**
 * Harvest Feedback System
 * Connects actual harvest results to growing conditions for continuous improvement
 */

import { logger } from '@/lib/logging/production-logger';
import prisma from '@/lib/prisma';
import { tensorflowService, TrainingData } from '@/lib/ml/real-tensorflow-service';
import { labIntegration, LabTestResult } from '@/lib/lab-integration/lab-api-service';

export interface HarvestData {
  id: string;
  batchId: string;
  strainName: string;
  harvestDate: Date;
  
  // Yield metrics
  wetWeight: number; // grams
  dryWeight: number; // grams
  trimWeight: number; // grams
  wasteWeight: number; // grams
  
  // Quality metrics (from lab or manual)
  labTestResults?: LabTestResult;
  
  // Visual quality (manual grading)
  visualQuality?: {
    budDensity: number; // 1-10
    trichomeCoverage: number; // 1-10
    colorVibrancy: number; // 1-10
    overallAppearance: number; // 1-10
  };
  
  // Growing conditions summary
  environmentalConditions: {
    avgTemperature: number;
    avgHumidity: number;
    avgCO2: number;
    avgPPFD: number;
    avgDLI: number;
    
    // Spectrum distribution
    lightSpectrum: {
      red: number;
      blue: number;
      green: number;
      farRed: number;
      uv: number;
    };
    
    // Nutrients
    avgEC: number;
    avgPH: number;
    nitrogenAvg: number;
    phosphorusAvg: number;
    potassiumAvg: number;
  };
  
  // Growth timeline
  growthTimeline: {
    germinationDate: Date;
    vegetativeStartDate: Date;
    floweringStartDate: Date;
    harvestDate: Date;
    totalDays: number;
    vegetativeDays: number;
    floweringDays: number;
  };
  
  // Problems encountered
  issues?: {
    pests?: string[];
    diseases?: string[];
    nutrientDeficiencies?: string[];
    environmentalStress?: string[];
  };
}

export interface CultivationCycle {
  id: string;
  batchId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'harvested' | 'failed';
  
  // Real-time sensor data
  sensorReadings: {
    timestamp: Date;
    temperature: number;
    humidity: number;
    co2: number;
    ppfd: number;
    ph: number;
    ec: number;
  }[];
  
  // Nutrient applications
  nutrientApplications: {
    date: Date;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    sulfur: number;
    micronutrients: Record<string, number>;
  }[];
  
  // Light settings changes
  lightingChanges: {
    date: Date;
    photoperiod: number;
    intensity: number;
    spectrum: Record<string, number>;
  }[];
}

export class HarvestFeedbackSystem {
  /**
   * Record harvest results and link to growing conditions
   */
  async recordHarvest(harvestData: HarvestData): Promise<void> {
    try {
      logger.info(`Recording harvest for batch ${harvestData.batchId}`);
      
      // Store harvest data
      const harvest = await prisma.harvest.create({
        data: {
          batchId: harvestData.batchId,
          strainName: harvestData.strainName,
          harvestDate: harvestData.harvestDate,
          wetWeight: harvestData.wetWeight,
          dryWeight: harvestData.dryWeight,
          trimWeight: harvestData.trimWeight,
          wasteWeight: harvestData.wasteWeight,
          visualQuality: harvestData.visualQuality,
          environmentalConditions: harvestData.environmentalConditions,
          growthTimeline: harvestData.growthTimeline,
          issues: harvestData.issues,
        }
      });
      
      // If lab results are provided, store them
      if (harvestData.labTestResults) {
        await labIntegration.inputManualResults(harvestData.labTestResults);
      }
      
      // Trigger ML model update with new data
      await this.updateMLModels(harvestData);
      
      // Calculate and store performance metrics
      await this.calculatePerformanceMetrics(harvestData);
      
      logger.info(`Harvest recorded successfully for batch ${harvestData.batchId}`);
    } catch (error) {
      logger.error('Failed to record harvest:', error);
      throw error;
    }
  }
  
  /**
   * Update ML models with new harvest data
   */
  private async updateMLModels(harvestData: HarvestData): Promise<void> {
    try {
      // Prepare training data from harvest
      const trainingData: TrainingData = {
        inputs: {
          avgTemperature: harvestData.environmentalConditions.avgTemperature,
          avgHumidity: harvestData.environmentalConditions.avgHumidity,
          avgCO2: harvestData.environmentalConditions.avgCO2,
          avgPPFD: harvestData.environmentalConditions.avgPPFD,
          avgDLI: harvestData.environmentalConditions.avgDLI,
          redSpectrum: harvestData.environmentalConditions.lightSpectrum.red,
          blueSpectrum: harvestData.environmentalConditions.lightSpectrum.blue,
          greenSpectrum: harvestData.environmentalConditions.lightSpectrum.green,
          farRedSpectrum: harvestData.environmentalConditions.lightSpectrum.farRed,
          uvSpectrum: harvestData.environmentalConditions.lightSpectrum.uv,
          ecLevel: harvestData.environmentalConditions.avgEC,
          phLevel: harvestData.environmentalConditions.avgPH,
          nitrogenPPM: harvestData.environmentalConditions.nitrogenAvg,
          phosphorusPPM: harvestData.environmentalConditions.phosphorusAvg,
          potassiumPPM: harvestData.environmentalConditions.potassiumAvg,
          vegetativeDays: harvestData.growthTimeline.vegetativeDays,
          floweringDays: harvestData.growthTimeline.floweringDays,
          strainGeneticsIndex: this.encodeStrain(harvestData.strainName)
        },
        outputs: {
          thcPercentage: harvestData.labTestResults?.cannabinoids.thc,
          cbdPercentage: harvestData.labTestResults?.cannabinoids.cbd,
          totalCannabinoids: harvestData.labTestResults?.cannabinoids.totalCannabinoids,
          totalTerpenes: harvestData.labTestResults?.terpenes.totalTerpenes,
          yieldGramsPerSqM: harvestData.dryWeight / 10 // Assuming 10 sq m grow area
        }
      };
      
      // Retrain cannabinoid prediction model
      if (harvestData.labTestResults?.cannabinoids) {
        await tensorflowService.retrainModel(
          'cannabinoid-predictor',
          [trainingData],
          { epochs: 20, preserveOldWeights: true }
        );
      }
      
      // Retrain yield prediction model
      await tensorflowService.retrainModel(
        'yield-predictor',
        [trainingData],
        { epochs: 20, preserveOldWeights: true }
      );
      
      logger.info('ML models updated with harvest data');
    } catch (error) {
      logger.error('Failed to update ML models:', error);
    }
  }
  
  /**
   * Calculate performance metrics comparing predictions to actual results
   */
  private async calculatePerformanceMetrics(harvestData: HarvestData): Promise<void> {
    try {
      // Get predictions that were made for this batch
      const predictions = await prisma.mlPrediction.findMany({
        where: {
          batchId: harvestData.batchId,
          type: 'harvest'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });
      
      if (predictions.length === 0) {
        logger.warn(`No predictions found for batch ${harvestData.batchId}`);
        return;
      }
      
      const prediction = predictions[0];
      const predictedData = prediction.prediction as any;
      
      // Calculate accuracy metrics
      const metrics = {
        yieldAccuracy: this.calculateAccuracy(
          predictedData.yieldGramsPerSqM,
          harvestData.dryWeight / 10
        ),
        thcAccuracy: harvestData.labTestResults ? this.calculateAccuracy(
          predictedData.thcPercentage,
          harvestData.labTestResults.cannabinoids.thc
        ) : null,
        cbdAccuracy: harvestData.labTestResults ? this.calculateAccuracy(
          predictedData.cbdPercentage,
          harvestData.labTestResults.cannabinoids.cbd
        ) : null,
      };
      
      // Store performance metrics
      await prisma.performanceMetric.create({
        data: {
          batchId: harvestData.batchId,
          predictionId: prediction.id,
          metricType: 'harvest_accuracy',
          metrics,
          calculatedAt: new Date()
        }
      });
      
      logger.info(`Performance metrics calculated for batch ${harvestData.batchId}:`, metrics);
    } catch (error) {
      logger.error('Failed to calculate performance metrics:', error);
    }
  }
  
  /**
   * Calculate accuracy percentage
   */
  private calculateAccuracy(predicted: number, actual: number): number {
    if (actual === 0) return predicted === 0 ? 100 : 0;
    const error = Math.abs(predicted - actual) / actual;
    return Math.max(0, (1 - error) * 100);
  }
  
  /**
   * Encode strain name to numeric index
   */
  private encodeStrain(strainName: string): number {
    // Simple hash function for strain encoding
    let hash = 0;
    for (let i = 0; i < strainName.length; i++) {
      hash = ((hash << 5) - hash) + strainName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000; // Normalize to 0-999
  }
  
  /**
   * Get correlation analysis between conditions and outcomes
   */
  async analyzeCorrelations(
    startDate: Date,
    endDate: Date
  ): Promise<{
    correlations: Map<string, number>;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      // Fetch harvests in date range
      const harvests = await prisma.harvest.findMany({
        where: {
          harvestDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      if (harvests.length < 5) {
        throw new Error('Insufficient data for correlation analysis (need at least 5 harvests)');
      }
      
      // Extract variables for correlation
      const temperatures = harvests.map(h => (h.environmentalConditions as any).avgTemperature);
      const humidities = harvests.map(h => (h.environmentalConditions as any).avgHumidity);
      const ppfds = harvests.map(h => (h.environmentalConditions as any).avgPPFD);
      const dlis = harvests.map(h => (h.environmentalConditions as any).avgDLI);
      const yields = harvests.map(h => h.dryWeight);
      
      // Calculate correlations
      const correlations = new Map<string, number>();
      correlations.set('temperature_yield', this.pearsonCorrelation(temperatures, yields));
      correlations.set('humidity_yield', this.pearsonCorrelation(humidities, yields));
      correlations.set('ppfd_yield', this.pearsonCorrelation(ppfds, yields));
      correlations.set('dli_yield', this.pearsonCorrelation(dlis, yields));
      
      // Generate insights
      const insights: string[] = [];
      const recommendations: string[] = [];
      
      // Temperature insights
      const tempCorr = correlations.get('temperature_yield')!;
      if (Math.abs(tempCorr) > 0.5) {
        insights.push(`Temperature has a ${tempCorr > 0 ? 'positive' : 'negative'} correlation (${tempCorr.toFixed(2)}) with yield`);
        if (tempCorr < -0.5) {
          recommendations.push('Consider reducing average temperatures to improve yields');
        }
      }
      
      // PPFD insights
      const ppfdCorr = correlations.get('ppfd_yield')!;
      if (ppfdCorr > 0.6) {
        insights.push(`Higher light intensity strongly correlates with better yields (r=${ppfdCorr.toFixed(2)})`);
        recommendations.push('Increasing PPFD levels may further improve yields');
      } else if (ppfdCorr < -0.3) {
        insights.push('Light intensity may be too high, showing negative correlation with yields');
        recommendations.push('Consider reducing light intensity or improving heat management');
      }
      
      // DLI insights
      const dliCorr = correlations.get('dli_yield')!;
      if (dliCorr > 0.7) {
        insights.push(`DLI is the strongest predictor of yield (r=${dliCorr.toFixed(2)})`);
        const avgDLI = dlis.reduce((a, b) => a + b, 0) / dlis.length;
        if (avgDLI < 40) {
          recommendations.push('Increase photoperiod or intensity to achieve DLI of 40-45 mol/m²/day');
        }
      }
      
      return { correlations, insights, recommendations };
      
    } catch (error) {
      logger.error('Failed to analyze correlations:', error);
      throw error;
    }
  }
  
  /**
   * Calculate Pearson correlation coefficient
   */
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  /**
   * Generate optimization recommendations based on historical data
   */
  async generateOptimizationPlan(
    targetStrain: string,
    targetMetric: 'yield' | 'thc' | 'cbd' | 'terpenes'
  ): Promise<{
    recommendedConditions: any;
    expectedImprovement: number;
    confidence: number;
  }> {
    try {
      // Find best performing harvests for this strain
      const topHarvests = await prisma.harvest.findMany({
        where: { strainName: targetStrain },
        orderBy: { dryWeight: 'desc' },
        take: 5
      });
      
      if (topHarvests.length === 0) {
        throw new Error(`No harvest data found for strain ${targetStrain}`);
      }
      
      // Average conditions from top performers
      const avgConditions = {
        temperature: 0,
        humidity: 0,
        co2: 0,
        ppfd: 0,
        dli: 0,
        ec: 0,
        ph: 0,
        vegetativeDays: 0,
        floweringDays: 0
      };
      
      topHarvests.forEach(harvest => {
        const conditions = harvest.environmentalConditions as any;
        const timeline = harvest.growthTimeline as any;
        
        avgConditions.temperature += conditions.avgTemperature;
        avgConditions.humidity += conditions.avgHumidity;
        avgConditions.co2 += conditions.avgCO2;
        avgConditions.ppfd += conditions.avgPPFD;
        avgConditions.dli += conditions.avgDLI;
        avgConditions.ec += conditions.avgEC;
        avgConditions.ph += conditions.avgPH;
        avgConditions.vegetativeDays += timeline.vegetativeDays;
        avgConditions.floweringDays += timeline.floweringDays;
      });
      
      // Calculate averages
      Object.keys(avgConditions).forEach(key => {
        (avgConditions as any)[key] /= topHarvests.length;
      });
      
      // Calculate expected improvement
      const allHarvests = await prisma.harvest.findMany({
        where: { strainName: targetStrain }
      });
      
      const avgYield = allHarvests.reduce((sum, h) => sum + h.dryWeight, 0) / allHarvests.length;
      const topYield = topHarvests.reduce((sum, h) => sum + h.dryWeight, 0) / topHarvests.length;
      const expectedImprovement = ((topYield - avgYield) / avgYield) * 100;
      
      // Calculate confidence based on sample size
      const confidence = Math.min(95, 50 + (allHarvests.length * 5));
      
      return {
        recommendedConditions: {
          temperature: `${avgConditions.temperature.toFixed(1)}°C ± 1°C`,
          humidity: `${avgConditions.humidity.toFixed(0)}% ± 5%`,
          co2: `${avgConditions.co2.toFixed(0)} ppm`,
          ppfd: `${avgConditions.ppfd.toFixed(0)} μmol/m²/s`,
          dli: `${avgConditions.dli.toFixed(1)} mol/m²/day`,
          ec: `${avgConditions.ec.toFixed(1)} mS/cm`,
          ph: `${avgConditions.ph.toFixed(1)} ± 0.2`,
          vegetativePeriod: `${avgConditions.vegetativeDays.toFixed(0)} days`,
          floweringPeriod: `${avgConditions.floweringDays.toFixed(0)} days`,
          notes: [
            'Based on top 20% of harvests',
            `Sample size: ${allHarvests.length} harvests`,
            'Adjust gradually and monitor plant response'
          ]
        },
        expectedImprovement,
        confidence
      };
      
    } catch (error) {
      logger.error('Failed to generate optimization plan:', error);
      throw error;
    }
  }
  
  /**
   * Track cultivation cycle and link to harvest
   */
  async startCultivationCycle(
    batchId: string,
    strainName: string,
    startDate: Date
  ): Promise<CultivationCycle> {
    try {
      const cycle = await prisma.cultivationCycle.create({
        data: {
          batchId,
          strainName,
          startDate,
          status: 'active',
          sensorReadings: [],
          nutrientApplications: [],
          lightingChanges: []
        }
      });
      
      logger.info(`Started cultivation cycle for batch ${batchId}`);
      
      return {
        id: cycle.id,
        batchId: cycle.batchId,
        startDate: cycle.startDate,
        status: cycle.status as any,
        sensorReadings: [],
        nutrientApplications: [],
        lightingChanges: []
      };
    } catch (error) {
      logger.error('Failed to start cultivation cycle:', error);
      throw error;
    }
  }
  
  /**
   * Add sensor reading to cultivation cycle
   */
  async addSensorReading(
    batchId: string,
    reading: CultivationCycle['sensorReadings'][0]
  ): Promise<void> {
    try {
      await prisma.cultivationCycle.update({
        where: { batchId },
        data: {
          sensorReadings: {
            push: reading
          }
        }
      });
    } catch (error) {
      logger.error('Failed to add sensor reading:', error);
    }
  }
}

// Export singleton instance
export const harvestFeedback = new HarvestFeedbackSystem();