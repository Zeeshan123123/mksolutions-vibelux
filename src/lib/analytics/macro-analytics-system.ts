/**
 * VibeLux Macro Analytics System
 * Centralized analytics for business intelligence and trend analysis
 * This runs on VibeLux servers with full access to anonymized aggregate data
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface MacroAnalytics {
  // Business Metrics
  totalFacilities: number;
  activeFacilities: number;
  totalGrowArea: number; // sq ft
  totalPredictions: number;
  averageAccuracy: number;
  
  // Production Insights
  aggregateYield: {
    total: number; // kg
    byMonth: Record<string, number>;
    byCrop: Record<string, number>;
    byRegion: Record<string, number>;
  };
  
  // Environmental Trends
  optimalConditions: {
    byCrop: Record<string, {
      temperature: { min: number; max: number; optimal: number };
      humidity: { min: number; max: number; optimal: number };
      ppfd: { min: number; max: number; optimal: number };
      co2: { min: number; max: number; optimal: number };
    }>;
  };
  
  // Disease Patterns
  diseaseOutbreaks: {
    frequency: Record<string, number>;
    seasonality: Record<string, Record<string, number>>;
    environmentalCorrelations: Record<string, any>;
  };
  
  // Technology Adoption
  featureUsage: {
    mlPredictions: number;
    diseaseDetection: number;
    yieldOptimization: number;
    energySavings: number;
  };
  
  // Economic Impact
  economicMetrics: {
    totalRevenueFacilitated: number;
    averageROI: number;
    energySavingsAchieved: number;
    yieldImprovements: number; // %
  };
}

export class MacroAnalyticsSystem {
  private static instance: MacroAnalyticsSystem;
  
  static getInstance(): MacroAnalyticsSystem {
    if (!MacroAnalyticsSystem.instance) {
      MacroAnalyticsSystem.instance = new MacroAnalyticsSystem();
    }
    return MacroAnalyticsSystem.instance;
  }
  
  /**
   * Get comprehensive macro view of all customer data
   */
  async getMacroAnalytics(): Promise<MacroAnalytics> {
    const [
      facilities,
      predictions,
      harvests,
      diseases,
      environmental
    ] = await Promise.all([
      this.getFacilityMetrics(),
      this.getPredictionMetrics(),
      this.getHarvestMetrics(),
      this.getDiseaseMetrics(),
      this.getEnvironmentalTrends()
    ]);
    
    return {
      totalFacilities: facilities.total,
      activeFacilities: facilities.active,
      totalGrowArea: facilities.totalArea,
      totalPredictions: predictions.total,
      averageAccuracy: predictions.averageAccuracy,
      aggregateYield: harvests,
      optimalConditions: environmental.optimal,
      diseaseOutbreaks: diseases,
      featureUsage: await this.getFeatureUsage(),
      economicMetrics: await this.getEconomicImpact()
    };
  }
  
  /**
   * Identify industry-wide trends
   */
  async getIndustryTrends(timeframe: 'month' | 'quarter' | 'year'): Promise<{
    emerging: TrendInsight[];
    declining: TrendInsight[];
    opportunities: BusinessOpportunity[];
  }> {
    const trends = await this.analyzeTrends(timeframe);
    
    return {
      emerging: trends.filter(t => t.direction === 'up' && t.significance > 0.7),
      declining: trends.filter(t => t.direction === 'down'),
      opportunities: this.identifyOpportunities(trends)
    };
  }
  
  /**
   * Get detailed customer segments
   */
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    const segments = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN f.size < 5000 THEN 'Small'
          WHEN f.size < 20000 THEN 'Medium'
          ELSE 'Large'
        END as size_category,
        f.primary_crop as crop_type,
        COUNT(DISTINCT f.id) as facility_count,
        AVG(m.accuracy) as avg_ml_accuracy,
        AVG(h.yield_per_sqft) as avg_yield,
        SUM(h.total_yield) as total_production,
        AVG(e.monthly_savings) as avg_energy_savings
      FROM facilities f
      LEFT JOIN ml_predictions m ON f.id = m.facility_id
      LEFT JOIN harvests h ON f.id = h.facility_id
      LEFT JOIN energy_metrics e ON f.id = e.facility_id
      GROUP BY size_category, crop_type
      ORDER BY facility_count DESC
    `;
    
    return segments.map(s => ({
      ...s,
      insights: this.generateSegmentInsights(s),
      recommendations: this.generateSegmentRecommendations(s)
    }));
  }
  
  /**
   * Predictive analytics for business planning
   */
  async getPredictiveAnalytics(): Promise<{
    revenueProjection: ProjectionData;
    userGrowth: ProjectionData;
    marketExpansion: MarketOpportunity[];
  }> {
    const historicalData = await this.getHistoricalMetrics();
    
    return {
      revenueProjection: this.projectRevenue(historicalData),
      userGrowth: this.projectUserGrowth(historicalData),
      marketExpansion: this.identifyMarketOpportunities(historicalData)
    };
  }
  
  /**
   * Competitive intelligence from aggregate data
   */
  async getCompetitiveIntelligence(): Promise<{
    marketPosition: MarketPosition;
    competitiveAdvantages: string[];
    threatAnalysis: ThreatAnalysis[];
  }> {
    const performance = await this.getPerformanceMetrics();
    
    return {
      marketPosition: this.calculateMarketPosition(performance),
      competitiveAdvantages: [
        `${performance.mlAccuracy}% ML accuracy vs industry avg 65%`,
        `${performance.yieldImprovement}% yield improvement vs 10% industry standard`,
        `Network effects from ${performance.totalFacilities} facilities`,
        `${performance.dataPoints}M data points for training`
      ],
      threatAnalysis: this.identifyThreats(performance)
    };
  }
  
  /**
   * Real-time monitoring dashboard data
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const now = new Date();
    const onlineDevices = await this.getOnlineDevices();
    const activeUsers = await this.getActiveUsers();
    const currentPredictions = await this.getCurrentPredictions();
    
    return {
      timestamp: now,
      online: {
        facilities: onlineDevices.facilities,
        sensors: onlineDevices.sensors,
        users: activeUsers.count
      },
      activity: {
        predictionsPerHour: currentPredictions.rate,
        dataPointsPerMinute: onlineDevices.dataRate,
        alertsActive: await this.getActiveAlerts()
      },
      health: {
        systemLoad: await this.getSystemLoad(),
        mlModelStatus: await this.getModelStatus(),
        apiLatency: await this.getAPILatency()
      }
    };
  }
  
  /**
   * Generate executive reports
   */
  async generateExecutiveReport(period: 'weekly' | 'monthly' | 'quarterly'): Promise<ExecutiveReport> {
    const analytics = await this.getMacroAnalytics();
    const trends = await this.getIndustryTrends(period as any);
    const segments = await this.getCustomerSegments();
    
    return {
      period,
      generatedAt: new Date(),
      keyMetrics: {
        totalRevenue: analytics.economicMetrics.totalRevenueFacilitated,
        activeCustomers: analytics.activeFacilities,
        growthRate: this.calculateGrowthRate(period),
        nps: await this.getNetPromoterScore()
      },
      highlights: this.generateHighlights(analytics, trends),
      concerns: this.identifyConcerns(analytics, trends),
      recommendations: this.generateStrategicRecommendations(analytics, trends, segments)
    };
  }
  
  // Private helper methods
  private async getFacilityMetrics() {
    const facilities = await prisma.facility.findMany({
      include: {
        _count: {
          select: { predictions: true }
        }
      }
    });
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const active = facilities.filter(f => 
      f._count.predictions > 0 && 
      f.lastActivity > thirtyDaysAgo
    );
    
    return {
      total: facilities.length,
      active: active.length,
      totalArea: facilities.reduce((sum, f) => sum + (f.size || 0), 0)
    };
  }
  
  private async getEnvironmentalTrends() {
    // Analyze optimal conditions by crop from successful harvests
    const successfulHarvests = await prisma.harvest.findMany({
      where: {
        quality: { in: ['A', 'B'] },
        yield: { gt: 0 }
      },
      include: {
        environmentalConditions: true,
        facility: {
          select: { primaryCrop: true }
        }
      }
    });
    
    const optimalByCrop: Record<string, any> = {};
    
    // Group by crop and calculate optimal ranges
    for (const harvest of successfulHarvests) {
      const crop = harvest.facility.primaryCrop;
      if (!optimalByCrop[crop]) {
        optimalByCrop[crop] = {
          temperature: { values: [] },
          humidity: { values: [] },
          ppfd: { values: [] },
          co2: { values: [] }
        };
      }
      
      // Collect environmental values
      const env = harvest.environmentalConditions;
      optimalByCrop[crop].temperature.values.push(env.temperature);
      optimalByCrop[crop].humidity.values.push(env.humidity);
      optimalByCrop[crop].ppfd.values.push(env.ppfd);
      optimalByCrop[crop].co2.values.push(env.co2);
    }
    
    // Calculate optimal ranges
    for (const crop in optimalByCrop) {
      for (const metric in optimalByCrop[crop]) {
        const values = optimalByCrop[crop][metric].values.sort((a: number, b: number) => a - b);
        optimalByCrop[crop][metric] = {
          min: values[Math.floor(values.length * 0.1)],
          max: values[Math.floor(values.length * 0.9)],
          optimal: values[Math.floor(values.length * 0.5)]
        };
      }
    }
    
    return { optimal: optimalByCrop };
  }
  
  private identifyOpportunities(trends: TrendInsight[]): BusinessOpportunity[] {
    const opportunities: BusinessOpportunity[] = [];
    
    // High-growth crop types
    const growthCrops = trends.filter(t => 
      t.category === 'crop_adoption' && 
      t.direction === 'up' && 
      t.growthRate > 0.2
    );
    
    for (const crop of growthCrops) {
      opportunities.push({
        type: 'market_expansion',
        title: `${crop.name} Growing Rapidly`,
        description: `${crop.growthRate * 100}% growth in ${crop.name} cultivation`,
        estimatedValue: crop.marketSize * crop.growthRate,
        confidence: crop.significance
      });
    }
    
    // Technology adoption gaps
    const lowAdoption = trends.filter(t =>
      t.category === 'feature_usage' &&
      t.adoptionRate < 0.3
    );
    
    for (const feature of lowAdoption) {
      opportunities.push({
        type: 'feature_adoption',
        title: `Increase ${feature.name} Usage`,
        description: `Only ${feature.adoptionRate * 100}% using ${feature.name}`,
        estimatedValue: feature.potentialRevenue,
        confidence: 0.8
      });
    }
    
    return opportunities;
  }
}

// Type definitions
interface TrendInsight {
  category: string;
  name: string;
  direction: 'up' | 'down' | 'stable';
  significance: number;
  growthRate: number;
  adoptionRate?: number;
  marketSize?: number;
  potentialRevenue?: number;
}

interface BusinessOpportunity {
  type: string;
  title: string;
  description: string;
  estimatedValue: number;
  confidence: number;
}

interface CustomerSegment {
  sizeCategory: string;
  cropType: string;
  facilityCount: number;
  avgMlAccuracy: number;
  avgYield: number;
  totalProduction: number;
  avgEnergySavings: number;
  insights: string[];
  recommendations: string[];
}

interface ProjectionData {
  current: number;
  projected: Record<string, number>;
  confidence: number;
  factors: string[];
}

interface MarketOpportunity {
  region: string;
  potential: number;
  competition: string;
  requirements: string[];
}

interface MarketPosition {
  rank: number;
  marketShare: number;
  growthRate: number;
  strengths: string[];
  weaknesses: string[];
}

interface ThreatAnalysis {
  threat: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface RealTimeMetrics {
  timestamp: Date;
  online: {
    facilities: number;
    sensors: number;
    users: number;
  };
  activity: {
    predictionsPerHour: number;
    dataPointsPerMinute: number;
    alertsActive: number;
  };
  health: {
    systemLoad: number;
    mlModelStatus: string;
    apiLatency: number;
  };
}

interface ExecutiveReport {
  period: string;
  generatedAt: Date;
  keyMetrics: {
    totalRevenue: number;
    activeCustomers: number;
    growthRate: number;
    nps: number;
  };
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

// Export singleton
export const macroAnalytics = MacroAnalyticsSystem.getInstance();