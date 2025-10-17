/**
 * Utility Intelligence Service
 * Combines carbon intensity, solar potential, and rate data for optimal energy management
 * Provides comprehensive utility intelligence for energy optimization
 */

import { EventEmitter } from 'events';
import { CarbonIntensityClient, CarbonIntensityData } from './carbon-intensity-client';
import { SolarDataClient, SolarPotentialData } from './solar-data-client';
import { RateDatabaseClient, UtilityRateData, RateCostAnalysis } from './rate-database-client';

export interface UtilityIntelligence {
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  carbonIntensity: CarbonIntensityData | null;
  solarPotential: SolarPotentialData | null;
  currentRate: UtilityRateData | null;
  optimalUsageWindows: OptimalUsageWindow[];
  energyRecommendations: EnergyRecommendation[];
  costOptimization: CostOptimization;
  carbonOptimization: CarbonOptimization;
  timestamp: Date;
}

export interface OptimalUsageWindow {
  startTime: Date;
  endTime: Date;
  type: 'low_carbon' | 'low_cost' | 'high_solar' | 'off_peak';
  carbonIntensity: number; // gCO2/kWh
  electricityRate: number; // $/kWh
  solarProduction: number; // kW
  score: number; // 0-100, higher is better
  reason: string;
}

export interface EnergyRecommendation {
  category: 'demand_response' | 'solar_optimization' | 'rate_switching' | 'load_shifting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: {
    annual: number; // USD
    carbon: number; // kg CO2
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'complex';
    timeframe: string;
    requirements: string[];
  };
  confidence: number; // 0-100%
}

export interface CostOptimization {
  currentAnnualCost: number;
  optimizedAnnualCost: number;
  potentialSavings: number;
  paybackPeriod?: number; // months
  strategies: CostStrategy[];
}

export interface CostStrategy {
  type: 'rate_change' | 'demand_response' | 'solar_installation' | 'load_shifting';
  description: string;
  annualSavings: number;
  implementationCost: number;
  paybackMonths: number;
}

export interface CarbonOptimization {
  currentAnnualEmissions: number; // kg CO2
  optimizedAnnualEmissions: number;
  emissionReduction: number;
  reductionPercentage: number;
  strategies: CarbonStrategy[];
}

export interface CarbonStrategy {
  type: 'solar_generation' | 'grid_timing' | 'efficiency_upgrade' | 'demand_response';
  description: string;
  annualReduction: number; // kg CO2
  costPerTonneCO2: number; // $/tonne
  cobenefits: string[];
}

export interface FacilityProfile {
  facilityId: string;
  lat: number;
  lng: number;
  annualUsage: number; // kWh
  monthlyUsage: number[]; // 12 months
  peakDemand: number; // kW
  operatingHours: {
    start: number; // 0-23
    end: number; // 0-23
    weekdays: boolean;
    weekends: boolean;
  };
  currentUtility: string;
  currentRate?: string;
  hasBackupGeneration: boolean;
  hasBatteryStorage: boolean;
  solarInstalled: boolean;
  solarCapacity?: number; // kW
}

export class UtilityIntelligenceService extends EventEmitter {
  private carbonClient: CarbonIntensityClient;
  private solarClient: SolarDataClient;
  private rateClient: RateDatabaseClient;
  private cache = new Map<string, { data: any; expires: number }>();

  constructor(config: {
    wattTimeToken?: string;
    electricityMapsToken?: string;
    googleSolarApiKey: string;
    nrelApiKey: string;
  }) {
    super();
    
    this.carbonClient = new CarbonIntensityClient({
      wattTimeToken: config.wattTimeToken,
      electricityMapsToken: config.electricityMapsToken
    });
    
    this.solarClient = new SolarDataClient({
      googleApiKey: config.googleSolarApiKey,
      nrelApiKey: config.nrelApiKey
    });
    
    this.rateClient = new RateDatabaseClient(config.nrelApiKey);
  }

  /**
   * Get comprehensive utility intelligence for a facility
   */
  async getUtilityIntelligence(facility: FacilityProfile): Promise<UtilityIntelligence> {
    const cacheKey = `intelligence_${facility.facilityId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    logger.info('api', `🧠 Analyzing utility intelligence for facility ${facility.facilityId}`);

    // Gather data from all sources in parallel
    const [carbonIntensity, solarPotential, availableRates] = await Promise.all([
      this.carbonClient.getCurrentCarbonIntensity(this.getRegionFromCoords(facility.lat, facility.lng)),
      this.solarClient.getSolarPotential(facility.lat, facility.lng),
      this.rateClient.searchRatesByLocation(facility.lat, facility.lng, 'Commercial')
    ]);

    // Find current or optimal rate
    const currentRate = await this.findCurrentRate(facility, availableRates);

    // Generate optimal usage windows
    const optimalWindows = await this.generateOptimalUsageWindows(
      facility, carbonIntensity, currentRate, solarPotential
    );

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      facility, carbonIntensity, solarPotential, availableRates
    );

    // Calculate optimizations
    const costOptimization = await this.calculateCostOptimization(
      facility, availableRates, solarPotential
    );

    const carbonOptimization = await this.calculateCarbonOptimization(
      facility, carbonIntensity, solarPotential
    );

    const intelligence: UtilityIntelligence = {
      location: {
        lat: facility.lat,
        lng: facility.lng
      },
      carbonIntensity,
      solarPotential,
      currentRate,
      optimalUsageWindows: optimalWindows,
      energyRecommendations: recommendations,
      costOptimization,
      carbonOptimization,
      timestamp: new Date()
    };

    // Cache for 30 minutes
    this.cache.set(cacheKey, {
      data: intelligence,
      expires: Date.now() + 30 * 60 * 1000
    });

    this.emit('intelligenceGenerated', { facilityId: facility.facilityId, intelligence });

    return intelligence;
  }

  /**
   * Generate optimal usage windows for next 24 hours
   */
  private async generateOptimalUsageWindows(
    facility: FacilityProfile,
    carbonIntensity: CarbonIntensityData | null,
    rate: UtilityRateData | null,
    solar: SolarPotentialData | null
  ): Promise<OptimalUsageWindow[]> {
    const windows: OptimalUsageWindow[] = [];
    const now = new Date();

    // Get 24-hour forecasts
    const region = this.getRegionFromCoords(facility.lat, facility.lng);
    const [carbonForecast, solarForecast] = await Promise.all([
      this.carbonClient.getCarbonForecast(region, 24),
      solar ? this.solarClient.getSolarForecast(facility.lat, facility.lng, solar.panelCapacity) : []
    ]);

    // Analyze each hour
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setHours(timestamp.getHours() + hour, 0, 0, 0);

      const carbonData = carbonForecast.find(f => 
        Math.abs(f.timestamp.getTime() - timestamp.getTime()) < 60 * 60 * 1000
      );

      const solarData = solarForecast.find(f =>
        Math.abs(f.timestamp.getTime() - timestamp.getTime()) < 60 * 60 * 1000
      );

      // Calculate scores for different optimization types
      const carbonScore = this.calculateCarbonScore(carbonData?.intensity || 400);
      const costScore = this.calculateCostScore(timestamp, rate);
      const solarScore = this.calculateSolarScore(solarData?.production || 0, solar?.panelCapacity || 0);

      // Generate windows based on scores
      if (carbonScore > 80) {
        windows.push({
          startTime: timestamp,
          endTime: new Date(timestamp.getTime() + 60 * 60 * 1000),
          type: 'low_carbon',
          carbonIntensity: carbonData?.intensity || 400,
          electricityRate: this.getCurrentRate(timestamp, rate),
          solarProduction: solarData?.production || 0,
          score: carbonScore,
          reason: 'Low grid carbon intensity - optimal for high energy use'
        });
      }

      if (costScore > 80) {
        windows.push({
          startTime: timestamp,
          endTime: new Date(timestamp.getTime() + 60 * 60 * 1000),
          type: 'low_cost',
          carbonIntensity: carbonData?.intensity || 400,
          electricityRate: this.getCurrentRate(timestamp, rate),
          solarProduction: solarData?.production || 0,
          score: costScore,
          reason: 'Low electricity rates - cost-effective usage window'
        });
      }

      if (solarScore > 80 && facility.solarInstalled) {
        windows.push({
          startTime: timestamp,
          endTime: new Date(timestamp.getTime() + 60 * 60 * 1000),
          type: 'high_solar',
          carbonIntensity: carbonData?.intensity || 400,
          electricityRate: this.getCurrentRate(timestamp, rate),
          solarProduction: solarData?.production || 0,
          score: solarScore,
          reason: 'High solar production - maximize self-consumption'
        });
      }
    }

    // Sort by score and return top windows
    return windows
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Generate energy recommendations
   */
  private async generateRecommendations(
    facility: FacilityProfile,
    carbonIntensity: CarbonIntensityData | null,
    solar: SolarPotentialData | null,
    rates: UtilityRateData[]
  ): Promise<EnergyRecommendation[]> {
    const recommendations: EnergyRecommendation[] = [];

    // Solar installation recommendation
    if (!facility.solarInstalled && solar && solar.financialAnalysis.paybackPeriod < 10) {
      recommendations.push({
        category: 'solar_optimization',
        priority: 'high',
        title: 'Install Solar PV System',
        description: `Install ${solar.panelCapacity.toFixed(1)}kW solar system with ${solar.financialAnalysis.paybackPeriod.toFixed(1)} year payback`,
        potentialSavings: {
          annual: solar.financialAnalysis.monthlySavings * 12,
          carbon: solar.carbonOffset
        },
        implementation: {
          difficulty: 'complex',
          timeframe: '3-6 months',
          requirements: ['Roof assessment', 'Utility interconnection', 'Permits']
        },
        confidence: 85
      });
    }

    // Rate switching recommendation
    if (rates.length > 1) {
      const currentCost = this.rateClient.calculateBillCost(
        rates[0], 
        facility.annualUsage / 12, 
        facility.peakDemand
      );
      
      const comparison = await this.rateClient.compareRates(
        rates, 
        facility.annualUsage / 12, 
        facility.peakDemand
      );

      if (comparison.length > 1) {
        const savings = currentCost.totalCost - comparison[0].analysis.totalCost;
        if (savings > 100) { // $100/month savings
          recommendations.push({
            category: 'rate_switching',
            priority: 'medium',
            title: 'Switch to Optimal Rate Schedule',
            description: `Switch to ${comparison[0].rate.rateName} to save $${(savings * 12).toFixed(0)}/year`,
            potentialSavings: {
              annual: savings * 12,
              carbon: 0
            },
            implementation: {
              difficulty: 'easy',
              timeframe: '1 month',
              requirements: ['Contact utility', 'Rate change application']
            },
            confidence: 95
          });
        }
      }
    }

    // Demand response recommendation
    if (facility.peakDemand > 100) { // kW
      recommendations.push({
        category: 'demand_response',
        priority: 'medium',
        title: 'Enroll in Demand Response Program',
        description: 'Participate in utility demand response to earn credits and reduce peak charges',
        potentialSavings: {
          annual: facility.peakDemand * 50, // Estimate $50/kW/year
          carbon: facility.peakDemand * 100 // Estimate carbon savings
        },
        implementation: {
          difficulty: 'medium',
          timeframe: '2-3 months',
          requirements: ['DR-capable equipment', 'Utility enrollment', 'Control systems']
        },
        confidence: 75
      });
    }

    // Load shifting recommendation
    const avgCarbonIntensity = carbonIntensity?.intensity || 400;
    const carbonForecast = await this.carbonClient.getCarbonForecast(
      this.getRegionFromCoords(facility.lat, facility.lng), 24
    );
    
    const maxVariation = Math.max(...carbonForecast.map(f => f.intensity)) - 
                        Math.min(...carbonForecast.map(f => f.intensity));
    
    if (maxVariation > 100) { // Significant carbon variation
      recommendations.push({
        category: 'load_shifting',
        priority: 'medium',
        title: 'Implement Smart Load Shifting',
        description: 'Shift flexible loads to times with lower grid carbon intensity',
        potentialSavings: {
          annual: 500, // Estimate
          carbon: facility.annualUsage * 0.05 // 5% carbon reduction
        },
        implementation: {
          difficulty: 'medium',
          timeframe: '1-2 months',
          requirements: ['Smart controls', 'Flexible equipment', 'Monitoring system']
        },
        confidence: 70
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate cost optimization opportunities
   */
  private async calculateCostOptimization(
    facility: FacilityProfile,
    rates: UtilityRateData[],
    solar: SolarPotentialData | null
  ): Promise<CostOptimization> {
    const currentRate = rates[0]; // Assume first rate is current
    const currentAnalysis = this.rateClient.calculateBillCost(
      currentRate,
      facility.annualUsage / 12,
      facility.peakDemand
    );
    
    const currentAnnualCost = currentAnalysis.totalCost * 12;
    const strategies: CostStrategy[] = [];
    let optimizedCost = currentAnnualCost;

    // Rate switching strategy
    if (rates.length > 1) {
      const comparison = await this.rateClient.compareRates(
        rates,
        facility.annualUsage / 12,
        facility.peakDemand
      );
      
      const bestRate = comparison[0];
      const savings = currentAnalysis.totalCost - bestRate.analysis.totalCost;
      
      if (savings > 0) {
        strategies.push({
          type: 'rate_change',
          description: `Switch to ${bestRate.rate.rateName}`,
          annualSavings: savings * 12,
          implementationCost: 0,
          paybackMonths: 0
        });
        
        optimizedCost -= savings * 12;
      }
    }

    // Solar installation strategy
    if (!facility.solarInstalled && solar) {
      strategies.push({
        type: 'solar_installation',
        description: `Install ${solar.panelCapacity.toFixed(1)}kW solar system`,
        annualSavings: solar.financialAnalysis.monthlySavings * 12,
        implementationCost: solar.financialAnalysis.installationCost,
        paybackMonths: solar.financialAnalysis.paybackPeriod * 12
      });
      
      optimizedCost -= solar.financialAnalysis.monthlySavings * 12;
    }

    // Demand response strategy
    if (facility.peakDemand > 50) {
      const drSavings = facility.peakDemand * 30; // $30/kW/year estimate
      strategies.push({
        type: 'demand_response',
        description: 'Enroll in utility demand response program',
        annualSavings: drSavings,
        implementationCost: 5000, // Control equipment
        paybackMonths: (5000 / drSavings) * 12
      });
      
      optimizedCost -= drSavings;
    }

    return {
      currentAnnualCost,
      optimizedAnnualCost: Math.max(0, optimizedCost),
      potentialSavings: currentAnnualCost - optimizedCost,
      strategies
    };
  }

  /**
   * Calculate carbon optimization opportunities
   */
  private async calculateCarbonOptimization(
    facility: FacilityProfile,
    carbonIntensity: CarbonIntensityData | null,
    solar: SolarPotentialData | null
  ): Promise<CarbonOptimization> {
    const gridIntensity = carbonIntensity?.intensity || 400; // gCO2/kWh
    const currentAnnualEmissions = (facility.annualUsage * gridIntensity) / 1000; // kg CO2
    
    const strategies: CarbonStrategy[] = [];
    let optimizedEmissions = currentAnnualEmissions;

    // Solar generation strategy
    if (solar && !facility.solarInstalled) {
      strategies.push({
        type: 'solar_generation',
        description: `Install ${solar.panelCapacity.toFixed(1)}kW solar system`,
        annualReduction: solar.carbonOffset,
        costPerTonneCO2: solar.financialAnalysis.installationCost / (solar.carbonOffset / 1000),
        cobenefits: ['Energy cost savings', 'Energy independence', 'Property value increase']
      });
      
      optimizedEmissions -= solar.carbonOffset;
    }

    // Grid timing strategy
    const region = this.getRegionFromCoords(facility.lat, facility.lng);
    const carbonForecast = await this.carbonClient.getCarbonForecast(region, 24);
    const optimalTimes = await this.carbonClient.getOptimalUsageTime(region, 24);
    
    if (optimalTimes.length > 0) {
      const avgOptimalIntensity = optimalTimes.slice(0, 8).reduce((sum, t) => sum + t.intensity, 0) / 8;
      const timingReduction = facility.annualUsage * (gridIntensity - avgOptimalIntensity) * 0.3 / 1000; // 30% flexible load
      
      if (timingReduction > 0) {
        strategies.push({
          type: 'grid_timing',
          description: 'Shift flexible loads to low-carbon grid times',
          annualReduction: timingReduction,
          costPerTonneCO2: 2000 / (timingReduction / 1000), // Control system cost
          cobenefits: ['Potential cost savings', 'Grid support', 'Reduced peak demand']
        });
        
        optimizedEmissions -= timingReduction;
      }
    }

    return {
      currentAnnualEmissions,
      optimizedAnnualEmissions: Math.max(0, optimizedEmissions),
      emissionReduction: currentAnnualEmissions - optimizedEmissions,
      reductionPercentage: ((currentAnnualEmissions - optimizedEmissions) / currentAnnualEmissions) * 100,
      strategies
    };
  }

  // Helper methods
  private async findCurrentRate(facility: FacilityProfile, rates: UtilityRateData[]): Promise<UtilityRateData | null> {
    if (facility.currentRate) {
      return rates.find(r => r.rateCode === facility.currentRate) || rates[0] || null;
    }
    return rates[0] || null;
  }

  private getRegionFromCoords(lat: number, lng: number): string {
    // Simple region mapping - could be enhanced
    if (lat >= 32 && lat <= 42 && lng >= -124 && lng <= -114) return 'CA';
    if (lat >= 25 && lat <= 36 && lng >= -106 && lng <= -93) return 'TX';
    if (lat >= 40 && lat <= 45 && lng >= -80 && lng <= -71) return 'NY';
    return 'US';
  }

  private calculateCarbonScore(intensity: number): number {
    // Score based on carbon intensity (lower is better)
    const maxIntensity = 800; // High carbon intensity
    const minIntensity = 50;  // Very low carbon intensity
    return Math.max(0, Math.min(100, ((maxIntensity - intensity) / (maxIntensity - minIntensity)) * 100));
  }

  private calculateCostScore(timestamp: Date, rate: UtilityRateData | null): number {
    if (!rate) return 50; // Default neutral score
    
    const hour = timestamp.getHours();
    
    // Simple TOU scoring - off-peak hours get higher scores
    if (hour >= 22 || hour <= 6) return 90; // Night
    if (hour >= 7 && hour <= 10) return 70; // Morning shoulder
    if (hour >= 11 && hour <= 17) return 30; // Peak
    if (hour >= 18 && hour <= 21) return 70; // Evening shoulder
    
    return 50;
  }

  private calculateSolarScore(production: number, capacity: number): number {
    if (capacity === 0) return 0;
    return Math.min(100, (production / capacity) * 100);
  }

  private getCurrentRate(timestamp: Date, rate: UtilityRateData | null): number {
    if (!rate || !rate.rateStructure.flatRate) return 0.12; // Default rate
    return rate.rateStructure.flatRate;
  }
}

export default UtilityIntelligenceService;