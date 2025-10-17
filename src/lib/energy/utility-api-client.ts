import { logger } from '@/lib/logging/production-logger';
/**
 * Utility API Client for real-time energy data integration
 * Supports multiple utility providers and standardizes data format
 */

export interface UtilityProvider {
  id: string;
  name: string;
  region: string;
  supportedMetrics: string[];
  apiEndpoint: string;
}

export interface EnergyReading {
  timestamp: Date;
  power: number; // Watts
  energy: number; // kWh
  voltage: number; // Volts
  current: number; // Amps
  powerFactor: number;
  frequency: number; // Hz
}

export interface DemandData {
  timestamp: Date;
  demand: number; // kW
  predicted: number; // kW
  threshold: number; // kW
}

export interface TariffData {
  currentRate: number; // $/kWh
  timeOfUse: {
    offPeak: number;
    midPeak: number;
    onPeak: number;
  };
  demandCharges: {
    threshold: number; // kW
    rate: number; // $/kW
  };
  nextRateChange: Date;
}

export interface GridStatus {
  frequency: number;
  voltage: number;
  stability: 'stable' | 'fluctuating' | 'critical';
  demandResponse: {
    active: boolean;
    incentiveRate: number; // $/kWh
    duration: number; // minutes
  };
}

// Supported utility providers
export const UTILITY_PROVIDERS: UtilityProvider[] = [
  {
    id: 'pge',
    name: 'Pacific Gas & Electric',
    region: 'California',
    supportedMetrics: ['power', 'energy', 'demand', 'tariff', 'grid'],
    apiEndpoint: 'https://api.pge.com/v1'
  },
  {
    id: 'sce',
    name: 'Southern California Edison',
    region: 'Southern California',
    supportedMetrics: ['power', 'energy', 'demand', 'tariff'],
    apiEndpoint: 'https://api.sce.com/v1'
  },
  {
    id: 'coned',
    name: 'Con Edison',
    region: 'New York',
    supportedMetrics: ['power', 'energy', 'demand', 'tariff', 'grid'],
    apiEndpoint: 'https://api.coned.com/v1'
  },
  {
    id: 'duke',
    name: 'Duke Energy',
    region: 'Southeast US',
    supportedMetrics: ['power', 'energy', 'demand'],
    apiEndpoint: 'https://api.duke-energy.com/v1'
  },
  {
    id: 'generic',
    name: 'Generic Utility API',
    region: 'Global',
    supportedMetrics: ['power', 'energy'],
    apiEndpoint: 'https://api.openei.org/utility'
  }
];

export class UtilityAPIClient {
  private provider: UtilityProvider;
  private apiKey: string;
  private accountId: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache
  private allowSimulation: boolean;

  constructor(providerId: string, apiKey: string, accountId: string) {
    const provider = UTILITY_PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Unsupported utility provider: ${providerId}`);
    }
    this.provider = provider;
    this.apiKey = apiKey;
    this.accountId = accountId;
    // Allow simulated fallback unless explicitly disabled
    this.allowSimulation = process.env.NEXT_PUBLIC_UTILITY_ALLOW_SIMULATION !== 'false';
  }

  /**
   * Get real-time energy readings from the utility
   */
  async getRealtimeReadings(): Promise<EnergyReading> {
    const cacheKey = 'realtime-readings';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.provider.apiEndpoint}/accounts/${this.accountId}/readings/current`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Utility API error: ${response.statusText}`);
      }

      const data = await response.json();
      const reading = this.normalizeReading(data);
      this.setCache(cacheKey, reading);
      return reading;
    } catch (error) {
      logger.error('api', 'Error fetching realtime readings:', error );
      if (!this.allowSimulation) throw error;
      return this.generateSimulatedReading();
    }
  }

  /**
   * Get historical energy data
   */
  async getHistoricalData(startDate: Date, endDate: Date, interval: 'hour' | 'day' | 'month' = 'hour') {
    const cacheKey = `historical-${startDate.toISOString()}-${endDate.toISOString()}-${interval}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        interval: interval
      });

      const response = await fetch(
        `${this.provider.apiEndpoint}/accounts/${this.accountId}/usage?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Utility API error: ${response.statusText}`);
      }

      const data = await response.json();
      const normalized = data.readings.map((r: any) => this.normalizeReading(r));
      this.setCache(cacheKey, normalized);
      return normalized;
    } catch (error) {
      logger.error('api', 'Error fetching historical data:', error );
      if (!this.allowSimulation) throw error;
      return this.generateSimulatedHistoricalData(startDate, endDate, interval);
    }
  }

  /**
   * Get current demand data and predictions
   */
  async getDemandData(): Promise<DemandData> {
    if (!this.provider.supportedMetrics.includes('demand')) {
      throw new Error(`Demand data not supported by ${this.provider.name}`);
    }

    const cacheKey = 'demand-data';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.provider.apiEndpoint}/accounts/${this.accountId}/demand/current`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Utility API error: ${response.statusText}`);
      }

      const data = await response.json();
      const demand: DemandData = {
        timestamp: new Date(data.timestamp),
        demand: data.current_demand_kw,
        predicted: data.predicted_demand_kw,
        threshold: data.demand_threshold_kw
      };

      this.setCache(cacheKey, demand);
      return demand;
    } catch (error) {
      logger.error('api', 'Error fetching demand data:', error );
      if (!this.allowSimulation) throw error;
      return this.generateSimulatedDemandData();
    }
  }

  /**
   * Get current tariff rates and time-of-use information
   */
  async getTariffData(): Promise<TariffData> {
    if (!this.provider.supportedMetrics.includes('tariff')) {
      throw new Error(`Tariff data not supported by ${this.provider.name}`);
    }

    const cacheKey = 'tariff-data';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.provider.apiEndpoint}/accounts/${this.accountId}/tariff`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Utility API error: ${response.statusText}`);
      }

      const data = await response.json();
      const tariff: TariffData = {
        currentRate: data.current_rate,
        timeOfUse: {
          offPeak: data.tou_rates.off_peak,
          midPeak: data.tou_rates.mid_peak,
          onPeak: data.tou_rates.on_peak
        },
        demandCharges: {
          threshold: data.demand_charges.threshold_kw,
          rate: data.demand_charges.rate_per_kw
        },
        nextRateChange: new Date(data.next_rate_change)
      };

      this.setCache(cacheKey, tariff);
      return tariff;
    } catch (error) {
      logger.error('api', 'Error fetching tariff data:', error );
      if (!this.allowSimulation) throw error;
      return this.generateSimulatedTariffData();
    }
  }

  /**
   * Get grid status and demand response events
   */
  async getGridStatus(): Promise<GridStatus> {
    if (!this.provider.supportedMetrics.includes('grid')) {
      throw new Error(`Grid status not supported by ${this.provider.name}`);
    }

    const cacheKey = 'grid-status';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.provider.apiEndpoint}/grid/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Utility API error: ${response.statusText}`);
      }

      const data = await response.json();
      const status: GridStatus = {
        frequency: data.frequency_hz,
        voltage: data.voltage_v,
        stability: data.stability_status,
        demandResponse: {
          active: data.demand_response.active,
          incentiveRate: data.demand_response.incentive_rate || 0,
          duration: data.demand_response.duration_minutes || 0
        }
      };

      this.setCache(cacheKey, status);
      return status;
    } catch (error) {
      logger.error('api', 'Error fetching grid status:', error );
      if (!this.allowSimulation) throw error;
      return this.generateSimulatedGridStatus();
    }
  }

  /**
   * Subscribe to real-time updates via WebSocket
   */
  subscribeToUpdates(callbacks: {
    onReading?: (reading: EnergyReading) => void;
    onDemand?: (demand: DemandData) => void;
    onGridEvent?: (status: GridStatus) => void;
  }) {
    // WebSocket connection would be implemented here
    // For now, we'll use polling as a fallback
    const pollInterval = setInterval(async () => {
      try {
        if (callbacks.onReading) {
          const reading = await this.getRealtimeReadings();
          callbacks.onReading(reading);
        }
        if (callbacks.onDemand && this.provider.supportedMetrics.includes('demand')) {
          const demand = await this.getDemandData();
          callbacks.onDemand(demand);
        }
        if (callbacks.onGridEvent && this.provider.supportedMetrics.includes('grid')) {
          const status = await this.getGridStatus();
          callbacks.onGridEvent(status);
        }
      } catch (error) {
        logger.error('api', 'Polling error:', error );
      }
    }, 5000); // Poll every 5 seconds

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  /**
   * Normalize reading data from different utility APIs
   */
  private normalizeReading(data: any): EnergyReading {
    // Each utility has different response formats, normalize them here
    return {
      timestamp: new Date(data.timestamp || data.reading_time || new Date()),
      power: data.power_w || data.demand_kw * 1000 || 0,
      energy: data.energy_kwh || data.usage_kwh || 0,
      voltage: data.voltage_v || data.voltage || 0,
      current: data.current_a || data.amperage || 0,
      powerFactor: data.power_factor || data.pf || 0.95,
      frequency: data.frequency_hz || data.freq || 60
    };
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Simulated data generators for testing/fallback
   */
  private generateSimulatedReading(): EnergyReading {
    const baseLoad = 3000; // Base load in watts
    const variance = Math.random() * 1000 - 500; // ±500W variance
    
    return {
      timestamp: new Date(),
      power: baseLoad + variance,
      energy: (baseLoad + variance) / 1000 * 0.25, // 15-minute interval
      voltage: 480 + Math.random() * 10 - 5, // 480V ±5V
      current: (baseLoad + variance) / 480 / Math.sqrt(3), // 3-phase current
      powerFactor: 0.92 + Math.random() * 0.06, // 0.92-0.98
      frequency: 60 + Math.random() * 0.2 - 0.1 // 60Hz ±0.1Hz
    };
  }

  private generateSimulatedHistoricalData(startDate: Date, endDate: Date, interval: string): EnergyReading[] {
    const readings: EnergyReading[] = [];
    const intervalMs = interval === 'hour' ? 3600000 : interval === 'day' ? 86400000 : 2592000000;
    
    for (let time = startDate.getTime(); time <= endDate.getTime(); time += intervalMs) {
      readings.push({
        ...this.generateSimulatedReading(),
        timestamp: new Date(time)
      });
    }
    
    return readings;
  }

  private generateSimulatedDemandData(): DemandData {
    const baseDemand = 3.5; // kW
    const currentDemand = baseDemand + Math.random() * 1.5;
    
    return {
      timestamp: new Date(),
      demand: currentDemand,
      predicted: currentDemand + Math.random() * 0.5 - 0.25,
      threshold: 5.0 // 5kW threshold
    };
  }

  private generateSimulatedTariffData(): TariffData {
    const hour = new Date().getHours();
    const isOnPeak = hour >= 16 && hour < 21; // 4PM-9PM
    const isMidPeak = (hour >= 12 && hour < 16) || (hour >= 21 && hour < 23); // 12PM-4PM, 9PM-11PM
    
    return {
      currentRate: isOnPeak ? 0.28 : isMidPeak ? 0.18 : 0.12,
      timeOfUse: {
        offPeak: 0.12,
        midPeak: 0.18,
        onPeak: 0.28
      },
      demandCharges: {
        threshold: 5.0,
        rate: 15.50
      },
      nextRateChange: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }

  private generateSimulatedGridStatus(): GridStatus {
    return {
      frequency: 60 + Math.random() * 0.1 - 0.05,
      voltage: 480 + Math.random() * 5 - 2.5,
      stability: Math.random() > 0.95 ? 'fluctuating' : 'stable',
      demandResponse: {
        active: Math.random() > 0.9,
        incentiveRate: Math.random() > 0.9 ? 0.50 : 0,
        duration: Math.random() > 0.9 ? 60 : 0
      }
    };
  }
}

// Factory function to create appropriate client
export function createUtilityClient(config: {
  provider: string;
  apiKey: string;
  accountId: string;
}): UtilityAPIClient {
  return new UtilityAPIClient(config.provider, config.apiKey, config.accountId);
}