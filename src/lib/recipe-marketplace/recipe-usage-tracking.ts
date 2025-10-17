/**
 * Recipe Usage Tracking System
 * Tracks recipe implementations and calculates royalties based on usage metrics
 */

import { LicensedRecipe, RecipeLicense } from './recipe-licensing'

export interface RecipeImplementation {
  id: string;
  licenseId: string;
  recipeId: string;
  facilityId: string;
  
  // Implementation details
  implementation: {
    startDate: Date;
    endDate?: Date;
    status: 'planning' | 'active' | 'completed' | 'paused';
    environmentType: 'sole-source' | 'supplemental' | 'greenhouse';
    growArea: number; // square feet
    plantCount: number;
    cycleNumber: number; // Which cycle using this recipe
  };
  
  // Recipe settings snapshot
  recipeSettings: {
    lightingSchedule: any; // Photoperiod, intensity ramping
    spectrumSettings: any; // Spectral ratios by growth phase
    environmentalTargets: any; // Temperature, humidity, CO2
    nutrientSchedule: any; // Feed charts
    version: string; // Recipe version used
  };
  
  // Tracking metrics
  metrics: {
    actualDLI: number[];
    spectrumCompliance: number; // % following recipe
    environmentalCompliance: number; // % in target ranges
    recipeAdherence: number; // Overall compliance score
  };
  
  // Royalty calculation
  royalty: {
    model: 'per-cycle' | 'per-sqft' | 'per-plant' | 'tiered';
    rate: number;
    calculated: number;
    status: 'pending' | 'invoiced' | 'paid';
    dueDate?: Date;
  };
}

export interface UsageReport {
  recipeId: string;
  period: { start: Date; end: Date };
  
  // Usage statistics
  totalImplementations: number;
  activeImplementations: number;
  totalArea: number; // sq ft
  totalPlants: number;
  averageCompliance: number;
  
  // Performance metrics (from implementations)
  averageResults: {
    yieldPerSqFt?: number;
    qualityScore?: number;
    cycleTime?: number;
    energyEfficiency?: number;
  };
  
  // Revenue
  royaltiesGenerated: number;
  royaltiesCollected: number;
  royaltiesPending: number;
}

export interface RoyaltyModel {
  type: 'per-cycle' | 'per-sqft' | 'per-plant' | 'tiered';
  
  // Per-cycle: Fixed fee per growth cycle
  perCycle?: {
    rate: number; // $ per cycle
    minimumArea?: number; // Minimum sq ft to qualify
  };
  
  // Per-sqft: Based on growing area
  perSqFt?: {
    rate: number; // $ per sq ft per cycle
    volumeDiscounts?: { area: number; discount: number }[];
  };
  
  // Per-plant: Based on plant count
  perPlant?: {
    rate: number; // $ per plant
    minimumPlants?: number;
  };
  
  // Tiered: Different rates based on facility size
  tiered?: {
    tiers: {
      name: string;
      maxArea: number;
      rate: number; // $ per cycle
    }[];
  };
}

export class RecipeUsageTracker {
  /**
   * Start tracking a recipe implementation
   */
  async startImplementation(
    license: RecipeLicense,
    recipe: LicensedRecipe,
    facilityDetails: {
      facilityId: string;
      environmentType: 'sole-source' | 'supplemental' | 'greenhouse';
      growArea: number;
      plantCount: number;
    }
  ): Promise<RecipeImplementation> {
    // Validate environment type
    if (recipe.licensing.restrictions?.includes('Sole-source lighting only') && 
        facilityDetails.environmentType !== 'sole-source') {
      throw new Error('This recipe is restricted to sole-source lighting environments');
    }
    
    // Create implementation record
    const implementation: RecipeImplementation = {
      id: this.generateId(),
      licenseId: license.id,
      recipeId: recipe.id,
      facilityId: facilityDetails.facilityId,
      implementation: {
        startDate: new Date(),
        status: 'active',
        environmentType: facilityDetails.environmentType,
        growArea: facilityDetails.growArea,
        plantCount: facilityDetails.plantCount,
        cycleNumber: await this.getCycleNumber(license.id) + 1
      },
      recipeSettings: {
        lightingSchedule: await this.getRecipeSettings(recipe.id, 'lighting'),
        spectrumSettings: await this.getRecipeSettings(recipe.id, 'spectrum'),
        environmentalTargets: await this.getRecipeSettings(recipe.id, 'environment'),
        nutrientSchedule: await this.getRecipeSettings(recipe.id, 'nutrients'),
        version: recipe.updatedAt.toISOString()
      },
      metrics: {
        actualDLI: [],
        spectrumCompliance: 0,
        environmentalCompliance: 0,
        recipeAdherence: 0
      },
      royalty: {
        model: this.getRoyaltyModel(recipe),
        rate: this.calculateRoyaltyRate(recipe, facilityDetails),
        calculated: 0,
        status: 'pending'
      }
    };
    
    // Calculate initial royalty
    implementation.royalty.calculated = this.calculateRoyalty(
      implementation.royalty.model,
      implementation.royalty.rate,
      facilityDetails
    );
    
    // Set due date (end of cycle or monthly)
    const cycleLength = this.getExpectedCycleLength(recipe.crop);
    implementation.royalty.dueDate = new Date(
      Date.now() + cycleLength * 24 * 60 * 60 * 1000
    );
    
    // Save implementation
    await this.saveImplementation(implementation);
    
    // Start monitoring compliance
    this.startComplianceMonitoring(implementation.id);
    
    return implementation;
  }
  
  /**
   * Update implementation metrics from sensor data
   */
  async updateImplementationMetrics(
    implementationId: string,
    sensorData: {
      timestamp: Date;
      ppfd: number;
      spectrum: any;
      temperature: number;
      humidity: number;
      co2: number;
    }
  ): Promise<void> {
    const implementation = await this.getImplementation(implementationId);
    
    // Update DLI tracking
    implementation.metrics.actualDLI.push(
      this.calculateDLI(sensorData.ppfd, implementation.recipeSettings.lightingSchedule)
    );
    
    // Check spectrum compliance
    const spectrumMatch = this.checkSpectrumCompliance(
      sensorData.spectrum,
      implementation.recipeSettings.spectrumSettings
    );
    
    // Check environmental compliance  
    const envMatch = this.checkEnvironmentalCompliance(
      { temperature: sensorData.temperature, humidity: sensorData.humidity, co2: sensorData.co2 },
      implementation.recipeSettings.environmentalTargets
    );
    
    // Update rolling averages
    implementation.metrics.spectrumCompliance = this.updateRollingAverage(
      implementation.metrics.spectrumCompliance,
      spectrumMatch
    );
    
    implementation.metrics.environmentalCompliance = this.updateRollingAverage(
      implementation.metrics.environmentalCompliance,
      envMatch
    );
    
    // Calculate overall adherence
    implementation.metrics.recipeAdherence = (
      implementation.metrics.spectrumCompliance * 0.4 +
      implementation.metrics.environmentalCompliance * 0.6
    );
    
    await this.saveImplementation(implementation);
  }
  
  /**
   * Complete a growth cycle and finalize royalty
   */
  async completeImplementation(
    implementationId: string,
    results: {
      actualYield: number;
      qualityMetrics: any;
      cycleLength: number;
    }
  ): Promise<{ royaltyDue: number; invoice: any }> {
    const implementation = await this.getImplementation(implementationId);
    implementation.implementation.endDate = new Date();
    implementation.implementation.status = 'completed';
    
    // Adjust royalty based on compliance
    // Higher compliance = full royalty, lower compliance = discounted
    const complianceMultiplier = this.getComplianceMultiplier(
      implementation.metrics.recipeAdherence
    );
    
    const finalRoyalty = implementation.royalty.calculated * complianceMultiplier;
    implementation.royalty.calculated = finalRoyalty;
    implementation.royalty.status = 'invoiced';
    
    // Create invoice
    const invoice = {
      id: this.generateId(),
      implementationId,
      licenseId: implementation.licenseId,
      recipeId: implementation.recipeId,
      amount: finalRoyalty,
      details: {
        baseRoyalty: implementation.royalty.calculated / complianceMultiplier,
        complianceScore: implementation.metrics.recipeAdherence,
        complianceMultiplier,
        growArea: implementation.implementation.growArea,
        plantCount: implementation.implementation.plantCount,
        cycleLength: results.cycleLength
      },
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'pending'
    };
    
    await this.saveImplementation(implementation);
    await this.createInvoice(invoice);
    
    // Update recipe performance stats
    await this.updateRecipePerformance(implementation.recipeId, {
      implementation,
      results
    });
    
    return { royaltyDue: finalRoyalty, invoice };
  }
  
  /**
   * Get usage report for a recipe
   */
  async getUsageReport(
    recipeId: string,
    period: { start: Date; end: Date }
  ): Promise<UsageReport> {
    const implementations = await this.getRecipeImplementations(recipeId, period);
    
    const activeCount = implementations.filter(i => i.implementation.status === 'active').length;
    const totalArea = implementations.reduce((sum, i) => sum + i.implementation.growArea, 0);
    const totalPlants = implementations.reduce((sum, i) => sum + i.implementation.plantCount, 0);
    const avgCompliance = implementations.reduce((sum, i) => sum + i.metrics.recipeAdherence, 0) / implementations.length;
    
    const royaltiesGenerated = implementations.reduce((sum, i) => sum + i.royalty.calculated, 0);
    const royaltiesCollected = implementations
      .filter(i => i.royalty.status === 'paid')
      .reduce((sum, i) => sum + i.royalty.calculated, 0);
    
    // Get performance metrics from completed cycles
    const completedImplementations = implementations.filter(i => i.implementation.status === 'completed');
    const performanceData = await this.getPerformanceMetrics(completedImplementations);
    
    return {
      recipeId,
      period,
      totalImplementations: implementations.length,
      activeImplementations: activeCount,
      totalArea,
      totalPlants,
      averageCompliance: avgCompliance,
      averageResults: performanceData,
      royaltiesGenerated,
      royaltiesCollected,
      royaltiesPending: royaltiesGenerated - royaltiesCollected
    };
  }
  
  /**
   * Calculate royalty based on model
   */
  private calculateRoyalty(
    model: RoyaltyModel['type'],
    rate: number,
    details: { growArea: number; plantCount: number }
  ): number {
    switch (model) {
      case 'per-cycle':
        return rate; // Fixed per cycle
        
      case 'per-sqft':
        return rate * details.growArea;
        
      case 'per-plant':
        return rate * details.plantCount;
        
      case 'tiered':
        // Rate already calculated based on tier
        return rate;
        
      default:
        return 0;
    }
  }
  
  /**
   * Get royalty model from recipe
   */
  private getRoyaltyModel(recipe: LicensedRecipe): RoyaltyModel['type'] {
    // Determine from recipe pricing structure
    if (recipe.licensing.pricing.royaltyPercent) {
      // Convert percentage to fixed model based on typical yields
      return 'per-sqft'; // Most practical for tracking
    }
    return 'per-cycle'; // Default
  }
  
  /**
   * Calculate royalty rate based on model and facility
   */
  private calculateRoyaltyRate(
    recipe: LicensedRecipe,
    facility: { growArea: number; plantCount: number }
  ): number {
    const model = this.getRoyaltyModel(recipe);
    
    switch (model) {
      case 'per-sqft':
        // Base rate with volume discounts
        let baseRate = 0.50; // $0.50 per sq ft per cycle
        if (facility.growArea > 10000) baseRate = 0.40;
        if (facility.growArea > 50000) baseRate = 0.30;
        return baseRate;
        
      case 'per-cycle':
        // Tiered based on facility size
        if (facility.growArea < 1000) return 500;
        if (facility.growArea < 5000) return 1500;
        if (facility.growArea < 20000) return 3000;
        return 5000;
        
      case 'per-plant':
        return 2.00; // $2 per plant
        
      default:
        return 0;
    }
  }
  
  /**
   * Get compliance multiplier for royalty adjustment
   */
  private getComplianceMultiplier(adherenceScore: number): number {
    if (adherenceScore >= 90) return 1.0; // Full royalty
    if (adherenceScore >= 75) return 0.9; // 10% discount
    if (adherenceScore >= 60) return 0.75; // 25% discount
    if (adherenceScore >= 40) return 0.5; // 50% discount
    return 0.25; // Minimum 25% for poor compliance
  }
  
  // Helper methods
  private async getCycleNumber(licenseId: string): Promise<number> {
    // Count previous implementations
    return 0; // Mock
  }
  
  private async getRecipeSettings(recipeId: string, type: string): Promise<any> {
    // Fetch recipe settings
    return {}; // Mock
  }
  
  private getExpectedCycleLength(crop: string): number {
    // Return typical cycle length in days
    const cycleLengths: Record<string, number> = {
      'Lettuce': 35,
      'Tomato': 120,
      'Cannabis': 84,
      'Herbs': 28,
      'Strawberry': 90
    };
    return cycleLengths[crop] || 60;
  }
  
  private calculateDLI(ppfd: number, schedule: any): number {
    // Calculate daily light integral
    const photoperiod = 12; // hours, would get from schedule
    return (ppfd * photoperiod * 3600) / 1000000;
  }
  
  private checkSpectrumCompliance(actual: any, target: any): number {
    // Compare actual spectrum to target
    return 85; // Mock % match
  }
  
  private checkEnvironmentalCompliance(actual: any, target: any): number {
    // Check if environmental conditions match targets
    return 92; // Mock % compliance
  }
  
  private updateRollingAverage(current: number, newValue: number): number {
    // Update rolling average (weighted)
    return current * 0.95 + newValue * 0.05;
  }
  
  private startComplianceMonitoring(implementationId: string): void {
    // Start background monitoring
    logger.info('api', `Monitoring compliance for ${implementationId}`);
  }
  
  private async getImplementation(id: string): Promise<RecipeImplementation> {
    // Mock - would fetch from database
    throw new Error('Implementation not found');
  }
  
  private async saveImplementation(implementation: RecipeImplementation): Promise<void> {
    // Save to database
    logger.info('api', 'Saving implementation', { data: implementation.id });
  }
  
  private async createInvoice(invoice: any): Promise<void> {
    // Create invoice record
    logger.info('api', 'Creating invoice', { data: invoice.id });
  }
  
  private async getRecipeImplementations(
    recipeId: string,
    period: { start: Date; end: Date }
  ): Promise<RecipeImplementation[]> {
    // Fetch implementations in period
    return [];
  }
  
  private async getPerformanceMetrics(
    implementations: RecipeImplementation[]
  ): Promise<any> {
    // Calculate average performance
    return {
      yieldPerSqFt: 45.2,
      qualityScore: 8.7,
      cycleTime: 32,
      energyEfficiency: 0.82
    };
  }
  
  private async updateRecipePerformance(
    recipeId: string,
    data: any
  ): Promise<void> {
    // Update recipe's proven results
    logger.info('api', 'Updating recipe performance', { data: recipeId });
  }
  
  private generateId(): string {
    return `impl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const recipeUsageTracker = new RecipeUsageTracker();