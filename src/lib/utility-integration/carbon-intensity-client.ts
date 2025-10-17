/**
 * Carbon Intensity Client
 * Integrates with multiple APIs to provide real-time grid carbon intensity data
 * Critical for carbon footprint tracking and demand response optimization
 */

import { EventEmitter } from 'events';

export interface CarbonIntensityData {
  region: string;
  timestamp: Date;
  intensity: number; // gCO2/kWh
  unit: 'gCO2/kWh' | 'lbsCO2/MWh';
  quality: 'actual' | 'forecast' | 'estimated';
  source: 'watttime' | 'electricity_maps' | 'uk_carbon' | 'epa_egrid';
  gridMix?: GridMixData;
  forecast?: CarbonForecast[];
}

export interface GridMixData {
  coal?: number;
  gas?: number;
  nuclear?: number;
  hydro?: number;
  wind?: number;
  solar?: number;
  biomass?: number;
  other?: number;
  unknown?: number;
}

export interface CarbonForecast {
  timestamp: Date;
  intensity: number;
  confidence: number; // 0-100%
}

export interface WattTimeData {
  ba: string;
  freq: string;
  market: string;
  percent: number;
  point_time: string;
}

export interface ElectricityMapsData {
  carbonIntensity: number;
  datetime: string;
  updatedAt: string;
  zone: string;
  powerConsumptionBreakdown: GridMixData;
  powerProductionBreakdown: GridMixData;
}

export interface UKCarbonData {
  data: Array<{
    from: string;
    to: string;
    intensity: {
      forecast: number;
      actual?: number;
      index: string;
    };
  }>;
}

export class CarbonIntensityClient extends EventEmitter {
  private wattTimeToken?: string;
  private electricityMapsToken?: string;
  private cache = new Map<string, { data: CarbonIntensityData; expires: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(config: {
    wattTimeToken?: string;
    electricityMapsToken?: string;
  }) {
    super();
    this.wattTimeToken = config.wattTimeToken;
    this.electricityMapsToken = config.electricityMapsToken;
  }

  /**
   * Get current carbon intensity for a region
   */
  async getCurrentCarbonIntensity(region: string): Promise<CarbonIntensityData | null> {
    // Check cache first
    const cacheKey = `current_${region}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    // Try different sources based on region
    let data: CarbonIntensityData | null = null;

    // US regions - try WattTime first
    if (this.isUSRegion(region) && this.wattTimeToken) {
      data = await this.getWattTimeData(region);
    }

    // Global regions - try Electricity Maps
    if (!data && this.electricityMapsToken) {
      data = await this.getElectricityMapsData(region);
    }

    // UK regions - try UK Carbon Intensity API
    if (!data && this.isUKRegion(region)) {
      data = await this.getUKCarbonData(region);
    }

    // EPA eGRID as fallback for US
    if (!data && this.isUSRegion(region)) {
      data = await this.getEPAeGRIDData(region);
    }

    if (data) {
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        expires: Date.now() + this.cacheTimeout
      });
    }

    return data;
  }

  /**
   * Get carbon intensity forecast
   */
  async getCarbonForecast(region: string, hours: number = 24): Promise<CarbonForecast[]> {
    const cacheKey = `forecast_${region}_${hours}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data.forecast || [];
    }

    let forecast: CarbonForecast[] = [];

    // UK has excellent forecasting
    if (this.isUKRegion(region)) {
      forecast = await this.getUKCarbonForecast(region, hours);
    }
    
    // WattTime for US forecasts
    else if (this.isUSRegion(region) && this.wattTimeToken) {
      forecast = await this.getWattTimeForecast(region, hours);
    }

    return forecast;
  }

  /**
   * Get real-time grid mix data
   */
  async getGridMix(region: string): Promise<GridMixData | null> {
    if (this.electricityMapsToken) {
      const data = await this.getElectricityMapsData(region);
      return data?.gridMix || null;
    }

    return null;
  }

  /**
   * Calculate carbon footprint for energy usage
   */
  async calculateCarbonFootprint(
    region: string,
    energyUsage: number, // kWh
    timestamp?: Date
  ): Promise<{
    carbonEmissions: number; // kg CO2
    intensity: number; // gCO2/kWh
    source: string;
  }> {
    const intensity = timestamp 
      ? await this.getHistoricalCarbonIntensity(region, timestamp)
      : await this.getCurrentCarbonIntensity(region);

    const carbonIntensity = intensity?.intensity || 400; // Default US average
    const carbonEmissions = (energyUsage * carbonIntensity) / 1000; // Convert g to kg

    return {
      carbonEmissions,
      intensity: carbonIntensity,
      source: intensity?.source || 'default'
    };
  }

  /**
   * WattTime API integration (US grids)
   */
  private async getWattTimeData(region: string): Promise<CarbonIntensityData | null> {
    if (!this.wattTimeToken) return null;

    try {
      // Map region to balancing authority
      const ba = this.mapRegionToBA(region);
      
      const response = await fetch(`https://api2.watttime.org/v2/index?ba=${ba}`, {
        headers: {
          'Authorization': `Bearer ${this.wattTimeToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`WattTime API error: ${response.status}`);
      }

      const data: WattTimeData = await response.json();

      return {
        region,
        timestamp: new Date(data.point_time),
        intensity: data.percent * 10, // Convert to approximate gCO2/kWh
        unit: 'gCO2/kWh',
        quality: 'actual',
        source: 'watttime'
      };

    } catch (error) {
      logger.error('api', 'WattTime API error:', error );
      return null;
    }
  }

  /**
   * Electricity Maps API integration (Global)
   */
  private async getElectricityMapsData(region: string): Promise<CarbonIntensityData | null> {
    if (!this.electricityMapsToken) return null;

    try {
      const zone = this.mapRegionToElectricityMapsZone(region);
      
      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${zone}`,
        {
          headers: {
            'auth-token': this.electricityMapsToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Electricity Maps API error: ${response.status}`);
      }

      const data: ElectricityMapsData = await response.json();

      return {
        region,
        timestamp: new Date(data.datetime),
        intensity: data.carbonIntensity,
        unit: 'gCO2/kWh',
        quality: 'actual',
        source: 'electricity_maps',
        gridMix: data.powerConsumptionBreakdown
      };

    } catch (error) {
      logger.error('api', 'Electricity Maps API error:', error );
      return null;
    }
  }

  /**
   * UK Carbon Intensity API (Free, no auth required)
   */
  private async getUKCarbonData(region: string): Promise<CarbonIntensityData | null> {
    try {
      const endpoint = region === 'UK' 
        ? 'https://api.carbonintensity.org.uk/intensity'
        : `https://api.carbonintensity.org.uk/regional/intensity/${region}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`UK Carbon API error: ${response.status}`);
      }

      const data: UKCarbonData = await response.json();
      const latest = data.data[0];

      if (!latest) return null;

      return {
        region,
        timestamp: new Date(latest.from),
        intensity: latest.intensity.actual || latest.intensity.forecast,
        unit: 'gCO2/kWh',
        quality: latest.intensity.actual ? 'actual' : 'forecast',
        source: 'uk_carbon'
      };

    } catch (error) {
      logger.error('api', 'UK Carbon API error:', error );
      return null;
    }
  }

  /**
   * EPA eGRID data (US regional averages)
   */
  private async getEPAeGRIDData(region: string): Promise<CarbonIntensityData | null> {
    // This would use static EPA eGRID data
    // For now, return regional averages
    const eGRIDFactors: Record<string, number> = {
      'CAISO': 268, // California
      'ERCOT': 455, // Texas
      'PJM': 374,   // Mid-Atlantic
      'NYISO': 275, // New York
      'NEISO': 303, // New England
      'SPP': 567,   // Southwest Power Pool
      'MISO': 476,  // Midwest
      'SERC': 445,  // Southeast
      'FRCC': 478,  // Florida
      'default': 418 // US Average
    };

    const ba = this.mapRegionToBA(region);
    const intensity = eGRIDFactors[ba] || eGRIDFactors.default;

    return {
      region,
      timestamp: new Date(),
      intensity,
      unit: 'gCO2/kWh',
      quality: 'estimated',
      source: 'epa_egrid'
    };
  }

  /**
   * Get UK carbon forecast
   */
  private async getUKCarbonForecast(region: string, hours: number): Promise<CarbonForecast[]> {
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      
      const endpoint = region === 'UK'
        ? `https://api.carbonintensity.org.uk/intensity/${start}/${end}`
        : `https://api.carbonintensity.org.uk/regional/intensity/${start}/${end}/${region}`;

      const response = await fetch(endpoint);
      const data: UKCarbonData = await response.json();

      return data.data.map(item => ({
        timestamp: new Date(item.from),
        intensity: item.intensity.forecast,
        confidence: 85 // UK forecasts are quite reliable
      }));

    } catch (error) {
      logger.error('api', 'UK Carbon forecast error:', error );
      return [];
    }
  }

  /**
   * Get WattTime forecast
   */
  private async getWattTimeForecast(region: string, hours: number): Promise<CarbonForecast[]> {
    if (!this.wattTimeToken) return [];

    try {
      const ba = this.mapRegionToBA(region);
      const start = new Date().toISOString();
      const end = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const response = await fetch(
        `https://api2.watttime.org/v2/forecast?ba=${ba}&starttime=${start}&endtime=${end}`,
        {
          headers: {
            'Authorization': `Bearer ${this.wattTimeToken}`
          }
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      return data.map((item: any) => ({
        timestamp: new Date(item.point_time),
        intensity: item.percent * 10,
        confidence: 70 // WattTime forecasts have moderate confidence
      }));

    } catch (error) {
      logger.error('api', 'WattTime forecast error:', error );
      return [];
    }
  }

  /**
   * Get historical carbon intensity
   */
  private async getHistoricalCarbonIntensity(
    region: string, 
    timestamp: Date
  ): Promise<CarbonIntensityData | null> {
    // This would query historical data from various sources
    // For now, return current data as approximation
    return await this.getCurrentCarbonIntensity(region);
  }

  /**
   * Map region to balancing authority
   */
  private mapRegionToBA(region: string): string {
    const baMapping: Record<string, string> = {
      'CA': 'CAISO',
      'california': 'CAISO',
      'pge': 'CAISO',
      'sce': 'CAISO',
      'sdge': 'CAISO',
      'TX': 'ERCOT',
      'texas': 'ERCOT',
      'NY': 'NYISO',
      'newyork': 'NYISO',
      'coned': 'NYISO',
      'FL': 'FRCC',
      'florida': 'FRCC',
      'fpl': 'FRCC'
    };

    return baMapping[region.toLowerCase()] || 'CAISO';
  }

  /**
   * Map region to Electricity Maps zone
   */
  private mapRegionToElectricityMapsZone(region: string): string {
    const zoneMapping: Record<string, string> = {
      'CA': 'US-CAL-CISO',
      'california': 'US-CAL-CISO',
      'TX': 'US-TEX-ERCO',
      'texas': 'US-TEX-ERCO',
      'NY': 'US-NY-NYIS',
      'newyork': 'US-NY-NYIS',
      'UK': 'GB',
      'germany': 'DE',
      'france': 'FR',
      'spain': 'ES'
    };

    return zoneMapping[region.toLowerCase()] || 'US-CAL-CISO';
  }

  /**
   * Check if region is in US
   */
  private isUSRegion(region: string): boolean {
    const usRegions = ['CA', 'TX', 'NY', 'FL', 'california', 'texas', 'newyork', 'florida', 'pge', 'sce', 'coned'];
    return usRegions.includes(region.toLowerCase());
  }

  /**
   * Check if region is in UK
   */
  private isUKRegion(region: string): boolean {
    const ukRegions = ['UK', 'england', 'scotland', 'wales', 'northernireland'];
    return ukRegions.includes(region.toLowerCase());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get optimal energy usage time based on carbon intensity
   */
  async getOptimalUsageTime(
    region: string,
    hours: number = 24
  ): Promise<{ timestamp: Date; intensity: number; rank: number }[]> {
    const forecast = await this.getCarbonForecast(region, hours);
    
    return forecast
      .map((f, index) => ({
        timestamp: f.timestamp,
        intensity: f.intensity,
        rank: index + 1
      }))
      .sort((a, b) => a.intensity - b.intensity)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}

export default CarbonIntensityClient;