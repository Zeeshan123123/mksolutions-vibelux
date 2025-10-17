/**
 * Real Laboratory Testing API Integration Service
 * Connects to actual cannabis testing labs for real analytical results
 */

import { logger } from '@/lib/logging/production-logger';
import prisma from '@/lib/prisma';

export interface LabTestResult {
  id: string;
  sampleId: string;
  batchId: string;
  testDate: Date;
  labName: string;
  
  // Cannabinoids (%)
  cannabinoids: {
    thc: number;
    thca: number;
    cbd: number;
    cbda: number;
    cbg: number;
    cbga: number;
    cbn: number;
    cbc: number;
    thcv: number;
    totalCannabinoids: number;
  };
  
  // Terpenes (%)
  terpenes: {
    myrcene: number;
    limonene: number;
    pinene: number;
    linalool: number;
    caryophyllene: number;
    humulene: number;
    terpinolene: number;
    ocimene: number;
    bisabolol: number;
    totalTerpenes: number;
  };
  
  // Heavy Metals (ppb)
  heavyMetals?: {
    arsenic: number;
    cadmium: number;
    lead: number;
    mercury: number;
    passed: boolean;
  };
  
  // Pesticides
  pesticides?: {
    detected: string[];
    passed: boolean;
  };
  
  // Microbials (CFU/g)
  microbials?: {
    totalYeastMold: number;
    totalAerobicCount: number;
    totalColiform: number;
    eColi: number;
    salmonella: boolean;
    passed: boolean;
  };
  
  // Moisture & Water Activity
  moisture?: {
    moistureContent: number;
    waterActivity: number;
  };
  
  // Additional nutrients for vegetables/fruits
  nutrients?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminE?: number;
    calcium?: number;
    iron?: number;
    potassium?: number;
    magnesium?: number;
    protein?: number;
    carbohydrates?: number;
    fiber?: number;
  };
}

export interface LabAPIConfig {
  provider: 'sc_labs' | 'steep_hill' | 'confident_cannabis' | 'manual';
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  accountId?: string;
}

/**
 * SC Labs API Integration
 * One of the largest cannabis testing labs in California
 */
class SCLabsAPI {
  private config: LabAPIConfig;
  private baseUrl = 'https://api.sclabs.com/v1';
  
  constructor(config: LabAPIConfig) {
    this.config = config;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          apiSecret: this.config.apiSecret,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`SC Labs authentication failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      logger.error('SC Labs authentication failed:', error);
      throw error;
    }
  }
  
  async fetchTestResults(sampleId: string): Promise<LabTestResult> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/results/${sampleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch SC Labs results: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Map SC Labs format to our standard format
      return this.mapSCLabsResult(data);
    } catch (error) {
      logger.error('Failed to fetch SC Labs results:', error);
      throw error;
    }
  }
  
  async fetchBatchResults(batchId: string): Promise<LabTestResult[]> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/batches/${batchId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch batch results: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.results.map((r: any) => this.mapSCLabsResult(r));
    } catch (error) {
      logger.error('Failed to fetch SC Labs batch results:', error);
      throw error;
    }
  }
  
  private mapSCLabsResult(data: any): LabTestResult {
    return {
      id: data.id,
      sampleId: data.sample_id,
      batchId: data.batch_id,
      testDate: new Date(data.test_date),
      labName: 'SC Labs',
      
      cannabinoids: {
        thc: data.cannabinoids?.thc || 0,
        thca: data.cannabinoids?.thca || 0,
        cbd: data.cannabinoids?.cbd || 0,
        cbda: data.cannabinoids?.cbda || 0,
        cbg: data.cannabinoids?.cbg || 0,
        cbga: data.cannabinoids?.cbga || 0,
        cbn: data.cannabinoids?.cbn || 0,
        cbc: data.cannabinoids?.cbc || 0,
        thcv: data.cannabinoids?.thcv || 0,
        totalCannabinoids: data.cannabinoids?.total || 0,
      },
      
      terpenes: {
        myrcene: data.terpenes?.myrcene || 0,
        limonene: data.terpenes?.limonene || 0,
        pinene: data.terpenes?.alpha_pinene || 0,
        linalool: data.terpenes?.linalool || 0,
        caryophyllene: data.terpenes?.beta_caryophyllene || 0,
        humulene: data.terpenes?.humulene || 0,
        terpinolene: data.terpenes?.terpinolene || 0,
        ocimene: data.terpenes?.ocimene || 0,
        bisabolol: data.terpenes?.bisabolol || 0,
        totalTerpenes: data.terpenes?.total || 0,
      },
      
      heavyMetals: data.heavy_metals ? {
        arsenic: data.heavy_metals.arsenic,
        cadmium: data.heavy_metals.cadmium,
        lead: data.heavy_metals.lead,
        mercury: data.heavy_metals.mercury,
        passed: data.heavy_metals.status === 'PASS',
      } : undefined,
      
      pesticides: data.pesticides ? {
        detected: data.pesticides.detected || [],
        passed: data.pesticides.status === 'PASS',
      } : undefined,
      
      microbials: data.microbials ? {
        totalYeastMold: data.microbials.total_yeast_mold,
        totalAerobicCount: data.microbials.total_aerobic_count,
        totalColiform: data.microbials.total_coliform,
        eColi: data.microbials.e_coli,
        salmonella: data.microbials.salmonella === 'DETECTED',
        passed: data.microbials.status === 'PASS',
      } : undefined,
      
      moisture: data.moisture ? {
        moistureContent: data.moisture.moisture_content,
        waterActivity: data.moisture.water_activity,
      } : undefined,
    };
  }
}

/**
 * Steep Hill Labs API Integration
 * Pioneer in cannabis testing
 */
class SteepHillAPI {
  private config: LabAPIConfig;
  private baseUrl = 'https://api.steephill.com/v2';
  
  constructor(config: LabAPIConfig) {
    this.config = config;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.apiKey || '',
          client_secret: this.config.apiSecret || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Steep Hill authentication failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Steep Hill authentication failed:', error);
      throw error;
    }
  }
  
  async fetchTestResults(sampleId: string): Promise<LabTestResult> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/samples/${sampleId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Steep Hill results: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.mapSteepHillResult(data);
    } catch (error) {
      logger.error('Failed to fetch Steep Hill results:', error);
      throw error;
    }
  }
  
  private mapSteepHillResult(data: any): LabTestResult {
    // Map Steep Hill's format to our standard format
    return {
      id: data.result_id,
      sampleId: data.sample_number,
      batchId: data.batch_number,
      testDate: new Date(data.date_tested),
      labName: 'Steep Hill',
      
      cannabinoids: {
        thc: data.cannabinoid_profile?.delta9_thc || 0,
        thca: data.cannabinoid_profile?.thca || 0,
        cbd: data.cannabinoid_profile?.cbd || 0,
        cbda: data.cannabinoid_profile?.cbda || 0,
        cbg: data.cannabinoid_profile?.cbg || 0,
        cbga: data.cannabinoid_profile?.cbga || 0,
        cbn: data.cannabinoid_profile?.cbn || 0,
        cbc: data.cannabinoid_profile?.cbc || 0,
        thcv: data.cannabinoid_profile?.thcv || 0,
        totalCannabinoids: data.cannabinoid_profile?.total_cannabinoids || 0,
      },
      
      terpenes: {
        myrcene: data.terpene_profile?.myrcene || 0,
        limonene: data.terpene_profile?.limonene || 0,
        pinene: data.terpene_profile?.pinene || 0,
        linalool: data.terpene_profile?.linalool || 0,
        caryophyllene: data.terpene_profile?.caryophyllene || 0,
        humulene: data.terpene_profile?.humulene || 0,
        terpinolene: data.terpene_profile?.terpinolene || 0,
        ocimene: data.terpene_profile?.ocimene || 0,
        bisabolol: data.terpene_profile?.bisabolol || 0,
        totalTerpenes: data.terpene_profile?.total_terpenes || 0,
      },
    };
  }
}

/**
 * Main Lab Integration Service
 */
export class LabIntegrationService {
  private config: LabAPIConfig;
  private provider: SCLabsAPI | SteepHillAPI | null = null;
  
  constructor(config?: LabAPIConfig) {
    this.config = config || {
      provider: 'manual',
    };
    
    this.initializeProvider();
  }
  
  private initializeProvider() {
    switch (this.config.provider) {
      case 'sc_labs':
        this.provider = new SCLabsAPI(this.config);
        break;
      case 'steep_hill':
        this.provider = new SteepHillAPI(this.config);
        break;
      default:
        this.provider = null;
    }
  }
  
  /**
   * Fetch test results from configured lab API
   */
  async fetchTestResults(sampleId: string): Promise<LabTestResult | null> {
    if (!this.provider) {
      logger.warn('No lab API provider configured, using manual input');
      return null;
    }
    
    try {
      const result = await this.provider.fetchTestResults(sampleId);
      
      // Store in database for ML training
      await this.storeTestResult(result);
      
      return result;
    } catch (error) {
      logger.error('Failed to fetch lab test results:', error);
      
      // Fall back to manual input
      return null;
    }
  }
  
  /**
   * Manually input lab test results when API is not available
   */
  async inputManualResults(data: Partial<LabTestResult>): Promise<LabTestResult> {
    const result: LabTestResult = {
      id: `manual-${Date.now()}`,
      sampleId: data.sampleId || `sample-${Date.now()}`,
      batchId: data.batchId || `batch-${Date.now()}`,
      testDate: data.testDate || new Date(),
      labName: data.labName || 'Manual Entry',
      
      cannabinoids: data.cannabinoids || {
        thc: 0,
        thca: 0,
        cbd: 0,
        cbda: 0,
        cbg: 0,
        cbga: 0,
        cbn: 0,
        cbc: 0,
        thcv: 0,
        totalCannabinoids: 0,
      },
      
      terpenes: data.terpenes || {
        myrcene: 0,
        limonene: 0,
        pinene: 0,
        linalool: 0,
        caryophyllene: 0,
        humulene: 0,
        terpinolene: 0,
        ocimene: 0,
        bisabolol: 0,
        totalTerpenes: 0,
      },
      
      heavyMetals: data.heavyMetals,
      pesticides: data.pesticides,
      microbials: data.microbials,
      moisture: data.moisture,
      nutrients: data.nutrients,
    };
    
    // Store in database
    await this.storeTestResult(result);
    
    return result;
  }
  
  /**
   * Store test results in database for ML training
   */
  private async storeTestResult(result: LabTestResult): Promise<void> {
    try {
      await prisma.labTestResult.create({
        data: {
          externalId: result.id,
          sampleId: result.sampleId,
          batchId: result.batchId,
          testDate: result.testDate,
          labName: result.labName,
          cannabinoids: result.cannabinoids,
          terpenes: result.terpenes,
          heavyMetals: result.heavyMetals,
          pesticides: result.pesticides,
          microbials: result.microbials,
          moisture: result.moisture,
          nutrients: result.nutrients,
        },
      });
      
      logger.info(`Stored lab test result ${result.id} in database`);
    } catch (error) {
      logger.error('Failed to store lab test result:', error);
    }
  }
  
  /**
   * Fetch historical test results for ML training
   */
  async getHistoricalResults(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      batchId?: string;
      minThc?: number;
      maxThc?: number;
    }
  ): Promise<LabTestResult[]> {
    try {
      const where: any = {};
      
      if (filters?.startDate || filters?.endDate) {
        where.testDate = {};
        if (filters.startDate) {
          where.testDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.testDate.lte = filters.endDate;
        }
      }
      
      if (filters?.batchId) {
        where.batchId = filters.batchId;
      }
      
      const results = await prisma.labTestResult.findMany({
        where,
        orderBy: { testDate: 'desc' },
      });
      
      return results.map(r => ({
        id: r.externalId,
        sampleId: r.sampleId,
        batchId: r.batchId,
        testDate: r.testDate,
        labName: r.labName,
        cannabinoids: r.cannabinoids as any,
        terpenes: r.terpenes as any,
        heavyMetals: r.heavyMetals as any,
        pesticides: r.pesticides as any,
        microbials: r.microbials as any,
        moisture: r.moisture as any,
        nutrients: r.nutrients as any,
      }));
    } catch (error) {
      logger.error('Failed to fetch historical lab results:', error);
      return [];
    }
  }
  
  /**
   * Calculate correlations between growing conditions and test results
   */
  async calculateCorrelations(
    batchId: string,
    environmentalData: {
      avgTemp: number;
      avgHumidity: number;
      avgCO2: number;
      avgPPFD: number;
      avgDLI: number;
      spectrum: any;
    }
  ): Promise<{
    correlations: Map<string, number>;
    pValues: Map<string, number>;
    r2Values: Map<string, number>;
  }> {
    try {
      const testResults = await this.getHistoricalResults({ batchId });
      
      if (testResults.length === 0) {
        throw new Error('No test results found for batch');
      }
      
      // Calculate actual correlations using real data
      const correlations = new Map<string, number>();
      const pValues = new Map<string, number>();
      const r2Values = new Map<string, number>();
      
      // Temperature vs THC correlation
      const tempThcCorr = this.calculatePearsonCorrelation(
        [environmentalData.avgTemp],
        testResults.map(r => r.cannabinoids.thc)
      );
      correlations.set('temp_thc', tempThcCorr.r);
      pValues.set('temp_thc', tempThcCorr.p);
      r2Values.set('temp_thc', tempThcCorr.r * tempThcCorr.r);
      
      // PPFD vs Total Cannabinoids
      const ppfdCannabinoidCorr = this.calculatePearsonCorrelation(
        [environmentalData.avgPPFD],
        testResults.map(r => r.cannabinoids.totalCannabinoids)
      );
      correlations.set('ppfd_cannabinoids', ppfdCannabinoidCorr.r);
      pValues.set('ppfd_cannabinoids', ppfdCannabinoidCorr.p);
      r2Values.set('ppfd_cannabinoids', ppfdCannabinoidCorr.r * ppfdCannabinoidCorr.r);
      
      // DLI vs Terpenes
      const dliTerpeneCorr = this.calculatePearsonCorrelation(
        [environmentalData.avgDLI],
        testResults.map(r => r.terpenes.totalTerpenes)
      );
      correlations.set('dli_terpenes', dliTerpeneCorr.r);
      pValues.set('dli_terpenes', dliTerpeneCorr.p);
      r2Values.set('dli_terpenes', dliTerpeneCorr.r * dliTerpeneCorr.r);
      
      return { correlations, pValues, r2Values };
    } catch (error) {
      logger.error('Failed to calculate correlations:', error);
      throw error;
    }
  }
  
  /**
   * Calculate Pearson correlation coefficient
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): { r: number; p: number } {
    const n = Math.min(x.length, y.length);
    
    if (n < 2) {
      return { r: 0, p: 1 };
    }
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const r = (n * sumXY - sumX * sumY) / 
              Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    // Calculate p-value (simplified - should use t-distribution)
    const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
    const p = 2 * (1 - this.tDistributionCDF(Math.abs(t), n - 2));
    
    return { r, p };
  }
  
  /**
   * Simplified t-distribution CDF
   */
  private tDistributionCDF(t: number, df: number): number {
    // Simplified approximation
    const x = df / (df + t * t);
    return 0.5 + 0.5 * Math.sign(t) * Math.sqrt(1 - x);
  }
}

// Export singleton instance
export const labIntegration = new LabIntegrationService({
  provider: process.env.LAB_API_PROVIDER as any || 'manual',
  apiKey: process.env.LAB_API_KEY,
  apiSecret: process.env.LAB_API_SECRET,
  baseUrl: process.env.LAB_API_URL,
  accountId: process.env.LAB_ACCOUNT_ID,
});