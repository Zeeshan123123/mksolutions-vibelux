/**
 * Market Volatility Modeling Engine
 * Advanced price forecasting and risk analysis for construction materials and labor
 */

import { MaterialCost, LaborRate } from './cost-estimator';

// Market data interfaces
export interface MarketDataPoint {
  date: Date;
  value: number;
  volume?: number;
  source: string;
}

export interface CommodityIndex {
  name: string;
  symbol: string;
  category: 'metal' | 'energy' | 'lumber' | 'aggregate' | 'labor';
  currentValue: number;
  yearOverYearChange: number;
  volatility: number; // Standard deviation
  correlation: Record<string, number>; // Correlation with other indices
}

export interface MarketForecast {
  commodity: string;
  currentPrice: number;
  predictions: {
    period: string; // '1M', '3M', '6M', '1Y'
    expectedPrice: number;
    confidence: number; // 0-100%
    range: { low: number; high: number };
    volatilityIndex: number;
  }[];
  drivers: MarketDriver[];
  riskFactors: MarketRisk[];
}

export interface MarketDriver {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
}

export interface MarketRisk {
  name: string;
  probability: number; // 0-100%
  impact: number; // % price change if occurs
  timeframe: string;
  mitigation?: string;
}

export interface VolatilityMetrics {
  historicalVolatility: number; // Annualized %
  impliedVolatility?: number; // From options/futures if available
  betaToMarket: number; // Sensitivity to overall market
  valueAtRisk: number; // 95% confidence worst case
  conditionalValueAtRisk: number; // Expected loss beyond VaR
}

export interface SupplyChainRisk {
  material: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    geopolitical: number; // 0-10
    weatherRelated: number; // 0-10
    supplierConcentration: number; // 0-10
    transportationRisk: number; // 0-10
    demandVolatility: number; // 0-10
  };
  alternativeSuppliers: number;
  stockpileRecommendation: number; // Days of inventory
}

// Historical correlations between commodities
const COMMODITY_CORRELATIONS: Record<string, Record<string, number>> = {
  steel: {
    aluminum: 0.75,
    copper: 0.82,
    oil: 0.65,
    lumber: 0.45,
    concrete: 0.38
  },
  copper: {
    steel: 0.82,
    aluminum: 0.88,
    oil: 0.71,
    electricalComponents: 0.92
  },
  lumber: {
    steel: 0.45,
    labor: 0.55,
    housingStarts: 0.85,
    interestRates: -0.62
  },
  labor: {
    inflation: 0.78,
    unemployment: -0.85,
    construction: 0.92,
    lumber: 0.55
  }
};

// Volatility factors by material category
const VOLATILITY_FACTORS: Record<string, { base: number; seasonal: number; geopolitical: number }> = {
  steel: { base: 0.25, seasonal: 0.05, geopolitical: 0.15 },
  copper: { base: 0.35, seasonal: 0.08, geopolitical: 0.20 },
  aluminum: { base: 0.30, seasonal: 0.06, geopolitical: 0.18 },
  lumber: { base: 0.45, seasonal: 0.20, geopolitical: 0.05 },
  concrete: { base: 0.15, seasonal: 0.10, geopolitical: 0.02 },
  electrical: { base: 0.28, seasonal: 0.05, geopolitical: 0.12 },
  labor: { base: 0.12, seasonal: 0.15, geopolitical: 0.03 }
};

export class MarketVolatilityEngine {
  private historicalData: Map<string, MarketDataPoint[]> = new Map();
  private indices: Map<string, CommodityIndex> = new Map();

  constructor() {
    this.initializeMarketIndices();
  }

  /**
   * Initialize market indices with current data
   */
  private initializeMarketIndices() {
    // Initialize with representative commodity indices
    this.indices.set('steel', {
      name: 'Hot Rolled Steel',
      symbol: 'HRC',
      category: 'metal',
      currentValue: 850, // $/ton
      yearOverYearChange: 15.2,
      volatility: 0.25,
      correlation: COMMODITY_CORRELATIONS.steel
    });

    this.indices.set('copper', {
      name: 'Copper Futures',
      symbol: 'HG',
      category: 'metal',
      currentValue: 4.25, // $/lb
      yearOverYearChange: 8.5,
      volatility: 0.35,
      correlation: COMMODITY_CORRELATIONS.copper
    });

    this.indices.set('lumber', {
      name: 'Lumber Futures',
      symbol: 'LBS',
      category: 'lumber',
      currentValue: 550, // $/1000 board feet
      yearOverYearChange: -12.3,
      volatility: 0.45,
      correlation: COMMODITY_CORRELATIONS.lumber
    });

    this.indices.set('labor', {
      name: 'Construction Labor Index',
      symbol: 'CLI',
      category: 'labor',
      currentValue: 135.2, // Index value
      yearOverYearChange: 4.8,
      volatility: 0.12,
      correlation: COMMODITY_CORRELATIONS.labor
    });
  }

  /**
   * Generate market forecast for a specific commodity
   */
  generateMarketForecast(
    commodity: string,
    currentPrice: number,
    historicalData?: MarketDataPoint[]
  ): MarketForecast {
    const volatility = this.calculateVolatility(commodity, historicalData);
    const trend = this.identifyTrend(historicalData || []);
    const seasonality = this.calculateSeasonality(commodity);

    // Generate predictions for different time periods
    const periods = ['1M', '3M', '6M', '1Y'];
    const predictions = periods.map(period => {
      const months = this.periodToMonths(period);
      const drift = trend * months;
      const randomWalk = this.generateRandomWalk(volatility.historicalVolatility, months);
      const seasonal = seasonality * (months / 12);

      const expectedPrice = currentPrice * (1 + drift + seasonal);
      const confidence = Math.max(20, 100 - volatility.historicalVolatility * months * 5);
      const range = this.calculatePriceRange(expectedPrice, volatility.historicalVolatility, months, confidence);

      return {
        period,
        expectedPrice,
        confidence,
        range,
        volatilityIndex: volatility.historicalVolatility * Math.sqrt(months / 12)
      };
    });

    // Identify market drivers
    const drivers = this.identifyMarketDrivers(commodity, trend);
    const riskFactors = this.identifyRiskFactors(commodity, volatility);

    return {
      commodity,
      currentPrice,
      predictions,
      drivers,
      riskFactors
    };
  }

  /**
   * Calculate volatility metrics for a commodity
   */
  calculateVolatility(
    commodity: string,
    historicalData?: MarketDataPoint[]
  ): VolatilityMetrics {
    const baseVolatility = VOLATILITY_FACTORS[commodity]?.base || 0.20;
    
    // Calculate historical volatility from data if available
    let historicalVolatility = baseVolatility;
    if (historicalData && historicalData.length > 30) {
      const returns = this.calculateReturns(historicalData);
      historicalVolatility = this.standardDeviation(returns) * Math.sqrt(252); // Annualized
    }

    // Calculate Value at Risk (95% confidence)
    const valueAtRisk = historicalVolatility * 1.645; // 95% confidence
    const conditionalValueAtRisk = historicalVolatility * 2.063; // Expected loss beyond VaR

    // Beta calculation (simplified)
    const index = this.indices.get(commodity);
    const betaToMarket = index ? 1 + (index.volatility - 0.15) / 0.15 : 1.0;

    return {
      historicalVolatility,
      impliedVolatility: historicalVolatility * 1.1, // Typically higher than historical
      betaToMarket,
      valueAtRisk,
      conditionalValueAtRisk
    };
  }

  /**
   * Analyze supply chain risks for materials
   */
  analyzeSupplyChainRisk(material: MaterialCost): SupplyChainRisk {
    // Calculate risk factors based on material characteristics
    const factors = {
      geopolitical: this.calculateGeopoliticalRisk(material),
      weatherRelated: this.calculateWeatherRisk(material),
      supplierConcentration: this.calculateSupplierConcentration(material),
      transportationRisk: this.calculateTransportationRisk(material),
      demandVolatility: this.calculateDemandVolatility(material)
    };

    // Overall risk level based on factors
    const avgRisk = Object.values(factors).reduce((sum, val) => sum + val, 0) / 5;
    const riskLevel = avgRisk < 3 ? 'low' : 
                     avgRisk < 5 ? 'medium' : 
                     avgRisk < 7 ? 'high' : 'critical';

    // Stockpile recommendation based on risk and lead time
    const baseStockDays = material.leadTime * 1.5;
    const riskMultiplier = 1 + (avgRisk / 10);
    const stockpileRecommendation = Math.round(baseStockDays * riskMultiplier);

    return {
      material: material.name,
      riskLevel,
      factors,
      alternativeSuppliers: this.estimateAlternativeSuppliers(material),
      stockpileRecommendation
    };
  }

  /**
   * Generate procurement timing recommendations
   */
  generateProcurementRecommendations(
    materials: MaterialCost[],
    projectStartDate: Date,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): {
    material: string;
    currentPrice: number;
    recommendation: 'buy_now' | 'wait' | 'hedge' | 'split_orders';
    optimalTiming: Date;
    reasoning: string;
    potentialSavings: number;
  }[] {
    return materials.map(material => {
      const forecast = this.generateMarketForecast(
        material.category,
        material.unitCost
      );

      const monthsUntilNeeded = this.monthsBetween(new Date(), projectStartDate) - 
                               (material.leadTime / 30);

      // Analyze price trend
      const priceTrend = forecast.predictions.find(p => p.period === '3M');
      const expectedPriceChange = priceTrend ? 
        (priceTrend.expectedPrice - material.unitCost) / material.unitCost : 0;

      // Generate recommendation based on trend and risk tolerance
      let recommendation: 'buy_now' | 'wait' | 'hedge' | 'split_orders';
      let optimalTiming = new Date();
      let reasoning = '';

      if (expectedPriceChange > 0.05 && riskTolerance !== 'aggressive') {
        recommendation = 'buy_now';
        reasoning = `Prices expected to rise ${(expectedPriceChange * 100).toFixed(1)}% in next 3 months`;
      } else if (expectedPriceChange < -0.05 && monthsUntilNeeded > 2) {
        recommendation = 'wait';
        optimalTiming = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 2 months
        reasoning = `Prices expected to fall ${Math.abs(expectedPriceChange * 100).toFixed(1)}% in next 3 months`;
      } else if (priceTrend && priceTrend.volatilityIndex > 0.3) {
        recommendation = 'hedge';
        reasoning = `High volatility (${(priceTrend.volatilityIndex * 100).toFixed(0)}%) suggests hedging strategy`;
      } else {
        recommendation = 'split_orders';
        reasoning = 'Stable prices suggest splitting orders to average costs';
      }

      const potentialSavings = Math.abs(expectedPriceChange) * material.unitCost * 
                              (material.minimumOrder || 1);

      return {
        material: material.name,
        currentPrice: material.unitCost,
        recommendation,
        optimalTiming,
        reasoning,
        potentialSavings
      };
    });
  }

  /**
   * Calculate labor cost projections with market factors
   */
  projectLaborCosts(
    baseRates: LaborRate[],
    projectDuration: number, // months
    location: string
  ): {
    role: string;
    currentRate: number;
    projectedRate: number;
    confidence: number;
    factors: string[];
  }[] {
    const laborIndex = this.indices.get('labor');
    const inflationRate = 0.035; // 3.5% annual
    const marketTightness = this.calculateLaborMarketTightness(location);

    return baseRates.map(rate => {
      // Base inflation adjustment
      const inflationFactor = Math.pow(1 + inflationRate, projectDuration / 12);
      
      // Market tightness adjustment
      const tightnessFactor = 1 + (marketTightness * 0.1);
      
      // Skill premium adjustment
      const skillPremium = rate.skillLevel === 'expert' ? 1.15 : 
                          rate.skillLevel === 'senior' ? 1.08 : 1.0;
      
      // Union vs non-union differential
      const unionFactor = rate.unionRate ? 1.12 : 1.0;

      const projectedRate = rate.hourlyRate * inflationFactor * tightnessFactor * 
                           skillPremium * unionFactor;

      // Confidence based on project duration and market volatility
      const confidence = Math.max(50, 100 - (projectDuration * 2) - 
                                  (laborIndex?.volatility || 0.12) * 100);

      const factors = [];
      if (inflationFactor > 1.02) factors.push('Inflation adjustment');
      if (tightnessFactor > 1.05) factors.push('Tight labor market');
      if (skillPremium > 1) factors.push('Skill shortage premium');
      if (unionFactor > 1) factors.push('Union rates');

      return {
        role: rate.role,
        currentRate: rate.hourlyRate,
        projectedRate,
        confidence,
        factors
      };
    });
  }

  /**
   * Helper methods
   */
  private calculateReturns(data: MarketDataPoint[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].value - data[i - 1].value) / data[i - 1].value);
    }
    return returns;
  }

  private standardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private identifyTrend(data: MarketDataPoint[]): number {
    if (data.length < 2) return 0;
    
    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgValue = sumY / n;
    
    return slope / avgValue; // Normalized trend
  }

  private calculateSeasonality(commodity: string): number {
    const seasonal = VOLATILITY_FACTORS[commodity]?.seasonal || 0.1;
    const month = new Date().getMonth();
    
    // Simple seasonal pattern (peak in summer for construction materials)
    const seasonalFactor = Math.sin((month - 3) * Math.PI / 6) * seasonal;
    return seasonalFactor;
  }

  private generateRandomWalk(volatility: number, months: number): number {
    // Simplified random walk for demonstration
    return (Math.random() - 0.5) * volatility * Math.sqrt(months / 12);
  }

  private calculatePriceRange(
    expectedPrice: number,
    volatility: number,
    months: number,
    confidence: number
  ): { low: number; high: number } {
    const stdev = volatility * Math.sqrt(months / 12) * expectedPrice;
    const zScore = confidence === 95 ? 1.96 : confidence === 90 ? 1.645 : 1.28;
    
    return {
      low: expectedPrice - zScore * stdev,
      high: expectedPrice + zScore * stdev
    };
  }

  private periodToMonths(period: string): number {
    const map: Record<string, number> = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12
    };
    return map[period] || 3;
  }

  private identifyMarketDrivers(commodity: string, trend: number): MarketDriver[] {
    const drivers: MarketDriver[] = [];
    
    if (trend > 0.02) {
      drivers.push({
        name: 'Strong demand growth',
        impact: 'positive',
        strength: 'strong',
        description: 'Construction activity increasing above historical averages'
      });
    }
    
    if (commodity === 'steel' || commodity === 'aluminum') {
      drivers.push({
        name: 'Energy costs',
        impact: trend > 0 ? 'negative' : 'positive',
        strength: 'moderate',
        description: 'Energy-intensive production affected by power prices'
      });
    }
    
    if (commodity === 'lumber') {
      drivers.push({
        name: 'Housing starts',
        impact: 'positive',
        strength: 'strong',
        description: 'Residential construction driving demand'
      });
    }
    
    return drivers;
  }

  private identifyRiskFactors(commodity: string, volatility: VolatilityMetrics): MarketRisk[] {
    const risks: MarketRisk[] = [];
    
    if (volatility.historicalVolatility > 0.3) {
      risks.push({
        name: 'Price volatility',
        probability: 80,
        impact: volatility.valueAtRisk * 100,
        timeframe: '3 months',
        mitigation: 'Consider hedging or fixed-price contracts'
      });
    }
    
    const geopoliticalRisk = VOLATILITY_FACTORS[commodity]?.geopolitical || 0.1;
    if (geopoliticalRisk > 0.15) {
      risks.push({
        name: 'Supply chain disruption',
        probability: 30,
        impact: 25,
        timeframe: '6 months',
        mitigation: 'Diversify suppliers and maintain strategic inventory'
      });
    }
    
    return risks;
  }

  private calculateGeopoliticalRisk(material: MaterialCost): number {
    // Simplified geopolitical risk based on supplier location
    const riskLocations: Record<string, number> = {
      'China': 7,
      'Russia': 8,
      'Middle East': 6,
      'Europe': 3,
      'North America': 2,
      'Domestic': 1
    };
    
    return riskLocations[material.location] || 5;
  }

  private calculateWeatherRisk(material: MaterialCost): number {
    // Weather sensitivity by category
    const weatherSensitive = ['concrete', 'lumber', 'aggregates'];
    return weatherSensitive.includes(material.category) ? 6 : 2;
  }

  private calculateSupplierConcentration(material: MaterialCost): number {
    // Assume higher risk for specialized materials
    return material.specifications && Object.keys(material.specifications).length > 5 ? 7 : 4;
  }

  private calculateTransportationRisk(material: MaterialCost): number {
    // Based on lead time as proxy for transportation complexity
    return Math.min(10, material.leadTime / 3);
  }

  private calculateDemandVolatility(material: MaterialCost): number {
    // Category-based demand volatility
    const volatileCategories = ['electrical', 'controls', 'safety'];
    return volatileCategories.includes(material.category) ? 6 : 3;
  }

  private estimateAlternativeSuppliers(material: MaterialCost): number {
    // Estimate based on material category
    const commonMaterials = ['concrete', 'steel', 'lumber'];
    return commonMaterials.includes(material.category) ? 10 : 3;
  }

  private calculateLaborMarketTightness(location: string): number {
    // Simplified labor market tightness by location
    const tightMarkets: Record<string, number> = {
      'San Francisco': 0.9,
      'New York': 0.85,
      'Austin': 0.8,
      'Denver': 0.75,
      'Phoenix': 0.7,
      'Default': 0.5
    };
    
    return tightMarkets[location] || tightMarkets['Default'];
  }

  private monthsBetween(date1: Date, date2: Date): number {
    return (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24 * 30);
  }
}

// Export singleton instance
export const marketVolatilityEngine = new MarketVolatilityEngine();