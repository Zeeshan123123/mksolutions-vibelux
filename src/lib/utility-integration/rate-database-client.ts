import { logger } from '@/lib/logging/production-logger';
/**
 * Rate Database Client
 * Integrates with OpenEI URDB and NREL APIs for comprehensive utility rate data
 * Provides real-time rate analysis and cost optimization
 */

export interface UtilityRateData {
  utilityName: string;
  rateName: string;
  rateCode: string;
  sector: 'Residential' | 'Commercial' | 'Industrial';
  description: string;
  effectiveDate: Date;
  endDate?: Date;
  rateStructure: RateStructure;
  demandStructure?: DemandStructure;
  fixedCharges: FixedCharge[];
  timeOfUseSchedule?: TimeOfUseSchedule;
  seasonDefinitions?: SeasonDefinition[];
  netMeteringPolicy?: NetMeteringPolicy;
  source: 'openei' | 'nrel' | 'utility_direct';
  lastUpdated: Date;
}

export interface RateStructure {
  type: 'tiered' | 'time_of_use' | 'flat' | 'real_time' | 'variable_peak';
  tiers?: RateTier[];
  touPeriods?: TimeOfUsePeriod[];
  flatRate?: number;
  unit: '$/kWh' | '$/therm' | '$/ccf';
}

export interface RateTier {
  tier: number;
  maxUsage?: number; // kWh threshold
  rate: number; // $/kWh
  applicableMonths?: number[]; // 1-12
}

export interface TimeOfUsePeriod {
  name: string;
  rate: number; // $/kWh
  startHour: number;
  endHour: number;
  weekdays: boolean;
  weekends: boolean;
  months: number[]; // 1-12
}

export interface DemandStructure {
  type: 'flat' | 'time_of_use' | 'coincident_peak';
  periods?: DemandPeriod[];
  flatRate?: number; // $/kW
  ratchetPercentage?: number; // % of peak for billing
  ratchetMonths?: number;
}

export interface DemandPeriod {
  name: string;
  rate: number; // $/kW
  startHour: number;
  endHour: number;
  months: number[];
}

export interface FixedCharge {
  name: string;
  amount: number; // $ per billing period
  frequency: 'monthly' | 'daily' | 'annual';
  applicableMonths?: number[];
}

export interface TimeOfUseSchedule {
  weekdaySchedule: HourlyPeriod[];
  weekendSchedule: HourlyPeriod[];
  holidaySchedule: HourlyPeriod[];
}

export interface HourlyPeriod {
  hour: number; // 0-23
  period: string; // 'peak', 'off_peak', 'shoulder'
}

export interface SeasonDefinition {
  name: 'summer' | 'winter' | 'spring' | 'fall';
  startMonth: number;
  endMonth: number;
  startDay?: number;
  endDay?: number;
}

export interface NetMeteringPolicy {
  available: boolean;
  creditRate: number; // $/kWh or % of retail rate
  rolloverPolicy: 'monthly' | 'annual' | 'none';
  maxSystemSize?: number; // kW
  interconnectionFee?: number; // $
}

export interface RateCostAnalysis {
  totalCost: number;
  energyCost: number;
  demandCost: number;
  fixedCost: number;
  breakdown: {
    peakCost?: number;
    offPeakCost?: number;
    shoulderCost?: number;
    tierCosts?: Array<{ tier: number; cost: number; usage: number }>;
  };
  averageRate: number; // $/kWh
  marginalRate: number; // $/kWh for next kWh
}

// OpenEI API Response Types
export interface OpenEIResponse {
  version: string;
  count: number;
  items: OpenEIRateItem[];
}

export interface OpenEIRateItem {
  label: string;
  utility: string;
  sector: string;
  description: string;
  source: string;
  sourcedescription: string;
  startdate: number;
  enddate?: number;
  uri: string;
  rateschedule: OpenEIRateSchedule[];
}

export interface OpenEIRateSchedule {
  name: string;
  energyratestructure?: OpenEIEnergyRate[][];
  demandratestructure?: OpenEIDemandRate[][];
  energyweekdayschedule?: number[][];
  energyweekendschedule?: number[][];
  demandweekdayschedule?: number[][];
  demandweekendschedule?: number[][];
  fixedmonthlycharge?: number;
  minmonthlycharge?: number;
  maxmonthlycharge?: number;
  flatdemandstructure?: OpenEIDemandRate[][];
  coincidentratestructure?: OpenEIDemandRate[][];
}

export interface OpenEIEnergyRate {
  max?: number;
  rate: number;
  unit: string;
  adjustment?: number;
  sell?: number;
}

export interface OpenEIDemandRate {
  max?: number;
  rate: number;
  unit: string;
  adjustment?: number;
}

export class RateDatabaseClient {
  private nrelApiKey: string;
  private cache = new Map<string, { data: any; expires: number }>();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor(nrelApiKey: string) {
    this.nrelApiKey = nrelApiKey;
  }

  /**
   * Search for utility rates by location
   */
  async searchRatesByLocation(
    lat: number, 
    lng: number, 
    sector: 'Residential' | 'Commercial' | 'Industrial' = 'Commercial'
  ): Promise<UtilityRateData[]> {
    const cacheKey = `rates_location_${lat}_${lng}_${sector}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        api_key: this.nrelApiKey,
        lat: lat.toString(),
        lon: lng.toString(),
        sector: sector,
        detail: 'full',
        format: 'json'
      });

      const response = await fetch(
        `https://api.openei.org/utility_rates?${params}`
      );

      if (!response.ok) {
        throw new Error(`OpenEI API error: ${response.status}`);
      }

      const data: OpenEIResponse = await response.json();
      const rates = data.items.map(item => this.parseOpenEIRate(item));

      // Cache results
      this.cache.set(cacheKey, {
        data: rates,
        expires: Date.now() + this.cacheTimeout
      });

      return rates;

    } catch (error) {
      logger.error('api', 'Rate search error:', error );
      return [];
    }
  }

  /**
   * Search rates by utility name
   */
  async searchRatesByUtility(
    utilityName: string,
    sector: 'Residential' | 'Commercial' | 'Industrial' = 'Commercial'
  ): Promise<UtilityRateData[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.nrelApiKey,
        utility_name: utilityName,
        sector: sector,
        detail: 'full',
        format: 'json'
      });

      const response = await fetch(
        `https://api.openei.org/utility_rates?${params}`
      );

      if (!response.ok) {
        throw new Error(`OpenEI API error: ${response.status}`);
      }

      const data: OpenEIResponse = await response.json();
      return data.items.map(item => this.parseOpenEIRate(item));

    } catch (error) {
      logger.error('api', 'Utility rate search error:', error );
      return [];
    }
  }

  /**
   * Get specific rate by URI
   */
  async getRateByURI(uri: string): Promise<UtilityRateData | null> {
    try {
      const params = new URLSearchParams({
        api_key: this.nrelApiKey,
        detail: 'full',
        format: 'json'
      });

      const response = await fetch(`${uri}?${params}`);

      if (!response.ok) {
        throw new Error(`OpenEI API error: ${response.status}`);
      }

      const data: OpenEIResponse = await response.json();
      if (data.items.length === 0) return null;

      return this.parseOpenEIRate(data.items[0]);

    } catch (error) {
      logger.error('api', 'Rate retrieval error:', error );
      return null;
    }
  }

  /**
   * Calculate bill cost using rate structure
   */
  calculateBillCost(
    rate: UtilityRateData,
    usage: number, // kWh
    demand?: number, // kW
    billingDays: number = 30
  ): RateCostAnalysis {
    let energyCost = 0;
    let demandCost = 0;
    let fixedCost = 0;
    const breakdown: any = {};

    // Calculate energy costs
    if (rate.rateStructure.type === 'tiered' && rate.rateStructure.tiers) {
      const tierCosts: Array<{ tier: number; cost: number; usage: number }> = [];
      let remainingUsage = usage;

      for (const tier of rate.rateStructure.tiers) {
        if (remainingUsage <= 0) break;

        const tierUsage = tier.maxUsage 
          ? Math.min(remainingUsage, tier.maxUsage)
          : remainingUsage;
        
        const tierCost = tierUsage * tier.rate;
        energyCost += tierCost;
        
        tierCosts.push({
          tier: tier.tier,
          cost: tierCost,
          usage: tierUsage
        });

        remainingUsage -= tierUsage;
      }

      breakdown.tierCosts = tierCosts;
    } 
    else if (rate.rateStructure.type === 'flat' && rate.rateStructure.flatRate) {
      energyCost = usage * rate.rateStructure.flatRate;
    }
    else if (rate.rateStructure.type === 'time_of_use' && rate.rateStructure.touPeriods) {
      // Simplified TOU calculation (would need actual hourly usage data)
      // For now, assume even distribution across periods
      for (const period of rate.rateStructure.touPeriods) {
        const periodHours = period.endHour - period.startHour;
        const periodUsage = usage * (periodHours / 24); // Rough approximation
        const periodCost = periodUsage * period.rate;
        energyCost += periodCost;

        if (period.name.toLowerCase().includes('peak')) {
          breakdown.peakCost = (breakdown.peakCost || 0) + periodCost;
        } else if (period.name.toLowerCase().includes('off')) {
          breakdown.offPeakCost = (breakdown.offPeakCost || 0) + periodCost;
        } else {
          breakdown.shoulderCost = (breakdown.shoulderCost || 0) + periodCost;
        }
      }
    }

    // Calculate demand costs
    if (demand && rate.demandStructure) {
      if (rate.demandStructure.type === 'flat' && rate.demandStructure.flatRate) {
        demandCost = demand * rate.demandStructure.flatRate;
      } else if (rate.demandStructure.periods) {
        // Simplified demand calculation
        demandCost = demand * (rate.demandStructure.periods[0]?.rate || 0);
      }
    }

    // Calculate fixed costs
    for (const charge of rate.fixedCharges) {
      if (charge.frequency === 'monthly') {
        fixedCost += charge.amount;
      } else if (charge.frequency === 'daily') {
        fixedCost += charge.amount * billingDays;
      } else if (charge.frequency === 'annual') {
        fixedCost += charge.amount / 12; // Monthly portion
      }
    }

    const totalCost = energyCost + demandCost + fixedCost;
    const averageRate = usage > 0 ? totalCost / usage : 0;
    
    // Calculate marginal rate (cost of next kWh)
    const marginalRate = this.calculateMarginalRate(rate, usage);

    return {
      totalCost,
      energyCost,
      demandCost,
      fixedCost,
      breakdown,
      averageRate,
      marginalRate
    };
  }

  /**
   * Compare multiple rates for given usage
   */
  async compareRates(
    rates: UtilityRateData[],
    usage: number,
    demand?: number
  ): Promise<Array<{
    rate: UtilityRateData;
    analysis: RateCostAnalysis;
    rank: number;
  }>> {
    const comparisons = rates.map(rate => ({
      rate,
      analysis: this.calculateBillCost(rate, usage, demand)
    }));

    // Sort by total cost
    comparisons.sort((a, b) => a.analysis.totalCost - b.analysis.totalCost);

    // Add rankings
    return comparisons.map((comp, index) => ({
      ...comp,
      rank: index + 1
    }));
  }

  /**
   * Find optimal rate for facility usage pattern
   */
  async findOptimalRate(
    lat: number,
    lng: number,
    monthlyUsage: number[], // 12 months of usage
    monthlyDemand?: number[] // 12 months of demand
  ): Promise<{
    recommendedRate: UtilityRateData;
    annualCost: number;
    potentialSavings: number;
    comparison: Array<{
      rate: UtilityRateData;
      annualCost: number;
    }>;
  }> {
    const rates = await this.searchRatesByLocation(lat, lng, 'Commercial');
    
    if (rates.length === 0) {
      throw new Error('No rates found for location');
    }

    const comparisons = rates.map(rate => {
      let annualCost = 0;
      
      for (let month = 0; month < 12; month++) {
        const analysis = this.calculateBillCost(
          rate, 
          monthlyUsage[month], 
          monthlyDemand?.[month]
        );
        annualCost += analysis.totalCost;
      }

      return { rate, annualCost };
    });

    // Sort by annual cost
    comparisons.sort((a, b) => a.annualCost - b.annualCost);

    const recommendedRate = comparisons[0].rate;
    const lowestCost = comparisons[0].annualCost;
    const highestCost = comparisons[comparisons.length - 1].annualCost;
    const potentialSavings = highestCost - lowestCost;

    return {
      recommendedRate,
      annualCost: lowestCost,
      potentialSavings,
      comparison: comparisons
    };
  }

  /**
   * Parse OpenEI rate data
   */
  private parseOpenEIRate(item: OpenEIRateItem): UtilityRateData {
    const schedule = item.rateschedule[0] || {};
    
    return {
      utilityName: item.utility,
      rateName: item.label,
      rateCode: item.label,
      sector: item.sector as any,
      description: item.description,
      effectiveDate: new Date(item.startdate * 1000),
      endDate: item.enddate ? new Date(item.enddate * 1000) : undefined,
      rateStructure: this.parseRateStructure(schedule),
      demandStructure: this.parseDemandStructure(schedule),
      fixedCharges: this.parseFixedCharges(schedule),
      timeOfUseSchedule: this.parseTimeOfUseSchedule(schedule),
      source: 'openei',
      lastUpdated: new Date()
    };
  }

  /**
   * Parse rate structure from OpenEI data
   */
  private parseRateStructure(schedule: OpenEIRateSchedule): RateStructure {
    if (schedule.energyratestructure) {
      const energyRates = schedule.energyratestructure[0] || [];
      
      if (energyRates.length > 1) {
        // Tiered structure
        const tiers: RateTier[] = energyRates.map((rate, index) => ({
          tier: index + 1,
          maxUsage: rate.max,
          rate: rate.rate
        }));

        return {
          type: 'tiered',
          tiers,
          unit: '$/kWh'
        };
      } else if (energyRates.length === 1) {
        // Flat rate
        return {
          type: 'flat',
          flatRate: energyRates[0].rate,
          unit: '$/kWh'
        };
      }
    }

    // Check for TOU structure
    if (schedule.energyweekdayschedule || schedule.energyweekendschedule) {
      return {
        type: 'time_of_use',
        touPeriods: [], // Would need more complex parsing
        unit: '$/kWh'
      };
    }

    // Default flat rate
    return {
      type: 'flat',
      flatRate: 0.1, // Default rate
      unit: '$/kWh'
    };
  }

  /**
   * Parse demand structure
   */
  private parseDemandStructure(schedule: OpenEIRateSchedule): DemandStructure | undefined {
    if (schedule.demandratestructure || schedule.flatdemandstructure) {
      const demandRates = schedule.demandratestructure?.[0] || schedule.flatdemandstructure?.[0];
      
      if (demandRates && demandRates.length > 0) {
        return {
          type: 'flat',
          flatRate: demandRates[0].rate
        };
      }
    }

    return undefined;
  }

  /**
   * Parse fixed charges
   */
  private parseFixedCharges(schedule: OpenEIRateSchedule): FixedCharge[] {
    const charges: FixedCharge[] = [];

    if (schedule.fixedmonthlycharge) {
      charges.push({
        name: 'Monthly Service Charge',
        amount: schedule.fixedmonthlycharge,
        frequency: 'monthly'
      });
    }

    return charges;
  }

  /**
   * Parse time-of-use schedule
   */
  private parseTimeOfUseSchedule(schedule: OpenEIRateSchedule): TimeOfUseSchedule | undefined {
    if (schedule.energyweekdayschedule && schedule.energyweekendschedule) {
      // Would need complex parsing of schedule arrays
      return undefined; // Simplified for now
    }

    return undefined;
  }

  /**
   * Calculate marginal rate (cost of next kWh)
   */
  private calculateMarginalRate(rate: UtilityRateData, currentUsage: number): number {
    if (rate.rateStructure.type === 'tiered' && rate.rateStructure.tiers) {
      let usageSoFar = 0;
      
      for (const tier of rate.rateStructure.tiers) {
        const tierMax = tier.maxUsage || Infinity;
        
        if (currentUsage <= usageSoFar + tierMax) {
          return tier.rate;
        }
        
        usageSoFar += tierMax;
      }
      
      // If we're beyond all tiers, use the last tier rate
      return rate.rateStructure.tiers[rate.rateStructure.tiers.length - 1].rate;
    }
    
    if (rate.rateStructure.flatRate) {
      return rate.rateStructure.flatRate;
    }
    
    // For TOU, would need current time context
    return 0.1; // Default
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default RateDatabaseClient;