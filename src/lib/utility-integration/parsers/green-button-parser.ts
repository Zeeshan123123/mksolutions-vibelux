/**
 * Green Button XML Parser
 * Parses energy usage data in Green Button format (ESPI standard)
 */

import { XMLParser } from 'fast-xml-parser';
import { UsageData, BillingData, TimeOfUseData } from '../types';

export interface GreenButtonFeed {
  feed: {
    entry: GreenButtonEntry | GreenButtonEntry[];
    updated?: string;
    title?: string;
  };
}

export interface GreenButtonEntry {
  id: string;
  title?: string;
  published?: string;
  updated?: string;
  link?: GreenButtonLink | GreenButtonLink[];
  content?: GreenButtonContent;
}

export interface GreenButtonLink {
  '@_rel': string;
  '@_href': string;
  '@_type'?: string;
}

export interface GreenButtonContent {
  UsagePoint?: UsagePoint;
  MeterReading?: MeterReading;
  ReadingType?: ReadingType;
  IntervalBlock?: IntervalBlock;
  ElectricPowerUsageSummary?: ElectricPowerUsageSummary;
  ElectricPowerQualitySummary?: ElectricPowerQualitySummary;
}

export interface UsagePoint {
  ServiceCategory?: {
    kind: number; // 0=electricity, 1=gas, 2=water, etc.
  };
  ServiceDeliveryPoint?: {
    name?: string;
    tariffProfile?: string;
    customerAgreement?: string;
  };
}

export interface MeterReading {
  ReadingType?: string;
  readingTypeRef?: string;
}

export interface ReadingType {
  accumulationBehaviour?: number;
  commodity?: number; // 1=electricity, 7=gas, etc.
  dataQualifier?: number;
  defaultQuality?: number;
  flowDirection?: number; // 1=forward, 19=reverse (net metering)
  intervalLength?: number; // seconds
  kind?: number; // 12=energy, 37=demand
  multiplier?: number;
  powerOfTenMultiplier?: number;
  timeAttribute?: number;
  uom?: number; // 72=Wh, 119=kWh, 169=therms, etc.
}

export interface IntervalBlock {
  interval?: {
    duration?: number;
    start?: number;
  };
  IntervalReading?: IntervalReading | IntervalReading[];
}

export interface IntervalReading {
  cost?: number;
  quality?: number;
  timePeriod?: {
    duration: number;
    start: number;
  };
  value?: number;
  ReadingQuality?: {
    quality: number;
  };
}

export interface ElectricPowerUsageSummary {
  billLastPeriod?: number;
  billToDate?: number;
  costAdditionalLastPeriod?: number;
  currency?: number; // 840=USD
  qualityOfReading?: number;
  statusTimeStamp?: number;
  commodity?: number;
  tariffProfile?: string;
  readCycle?: string;
  billingPeriod?: {
    duration?: number;
    start?: number;
  };
  currentBillingPeriodOverAllConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  currentDayLastYearNetConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  currentDayNetConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  currentDayOverallConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  peakDemand?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  previousDayLastYearOverallConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  previousDayNetConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  previousDayOverallConsumption?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
  ratchetDemand?: {
    powerOfTenMultiplier?: number;
    timeStamp?: number;
    uom?: number;
    value?: number;
  };
}

export interface ElectricPowerQualitySummary {
  flickerPlt?: number;
  flickerPst?: number;
  harmonicVoltage?: number;
  longInterruptions?: number;
  mainsVoltage?: number;
  measurementProtocol?: number;
  powerFrequency?: number;
  rapidVoltageChanges?: number;
  shortInterruptions?: number;
  summaryInterval?: {
    duration?: number;
    start?: number;
  };
  supplyVoltageDips?: number;
  supplyVoltageImbalance?: number;
  supplyVoltageVariations?: number;
  tempOvervoltage?: number;
}

export class GreenButtonParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: true
    });
  }

  /**
   * Parse Green Button XML data
   */
  parseXML(xmlData: string): GreenButtonFeed {
    try {
      const parsed = this.xmlParser.parse(xmlData);
      return parsed as GreenButtonFeed;
    } catch (error) {
      logger.error('api', 'Error parsing Green Button XML:', error );
      throw new Error('Invalid Green Button XML format');
    }
  }

  /**
   * Extract usage data from Green Button feed
   */
  extractUsageData(feed: GreenButtonFeed): UsageData[] {
    const usageData: UsageData[] = [];
    const entries = this.normalizeEntries(feed.feed.entry);
    
    // First, extract reading types
    const readingTypes = new Map<string, ReadingType>();
    entries.forEach(entry => {
      if (entry.content?.ReadingType) {
        readingTypes.set(entry.id, entry.content.ReadingType);
      }
    });

    // Then extract interval data
    entries.forEach(entry => {
      if (entry.content?.IntervalBlock) {
        const intervalBlock = entry.content.IntervalBlock;
        const intervals = this.normalizeIntervals(intervalBlock.IntervalReading);
        
        // Find associated reading type
        let readingType: ReadingType | undefined;
        const links = Array.isArray(entry.link) ? entry.link : [entry.link].filter(Boolean);
        const readingTypeLink = links.find(link => link['@_rel'] === 'up');
        if (readingTypeLink) {
          const readingTypeId = readingTypeLink['@_href'].split('/').pop();
          readingType = readingTypes.get(readingTypeId || '');
        }

        // Process each interval
        intervals.forEach(interval => {
          if (interval.value !== undefined && interval.timePeriod) {
            const usage = this.convertValue(
              interval.value,
              readingType?.powerOfTenMultiplier,
              readingType?.uom
            );

            usageData.push({
              timestamp: new Date(interval.timePeriod.start * 1000),
              usage: usage.value,
              unit: usage.unit as 'kWh',
              quality: this.mapQuality(interval.quality),
              intervalDuration: interval.timePeriod.duration
            });
          }
        });
      }
    });

    return usageData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Extract billing data from Green Button feed
   */
  extractBillingData(feed: GreenButtonFeed): BillingData[] {
    const billingData: BillingData[] = [];
    const entries = this.normalizeEntries(feed.feed.entry);

    entries.forEach(entry => {
      if (entry.content?.ElectricPowerUsageSummary) {
        const summary = entry.content.ElectricPowerUsageSummary;
        
        if (summary.billingPeriod) {
          const startDate = new Date(summary.billingPeriod.start! * 1000);
          const endDate = new Date((summary.billingPeriod.start! + summary.billingPeriod.duration!) * 1000);
          
          const billData: BillingData = {
            billDate: endDate,
            startDate,
            endDate,
            totalAmount: (summary.billLastPeriod || 0) / 100, // cents to dollars
            usage: this.extractUsageValue(summary.currentBillingPeriodOverAllConsumption),
            energyCharges: ((summary.billLastPeriod || 0) - (summary.costAdditionalLastPeriod || 0)) / 100,
            demandCharges: 0,
            otherCharges: (summary.costAdditionalLastPeriod || 0) / 100,
            taxes: 0,
            accountNumber: '',
            rateSchedule: summary.tariffProfile
          };

          // Extract peak demand if available
          if (summary.peakDemand) {
            billData.demand = this.convertValue(
              summary.peakDemand.value!,
              summary.peakDemand.powerOfTenMultiplier,
              summary.peakDemand.uom
            ).value;
            billData.demandUnit = 'kW';
          }

          billingData.push(billData);
        }
      }
    });

    return billingData;
  }

  /**
   * Extract time-of-use data
   */
  extractTimeOfUseData(feed: GreenButtonFeed): TimeOfUseData[] {
    const touData: TimeOfUseData[] = [];
    // Implementation depends on utility-specific TOU data format
    // This would parse TOU-specific interval blocks
    return touData;
  }

  /**
   * Get service information
   */
  extractServiceInfo(feed: GreenButtonFeed): {
    serviceType: string;
    accountNumber?: string;
    meterNumber?: string;
    tariff?: string;
  } {
    const entries = this.normalizeEntries(feed.feed.entry);
    
    for (const entry of entries) {
      if (entry.content?.UsagePoint) {
        const usagePoint = entry.content.UsagePoint;
        const serviceType = this.mapServiceCategory(usagePoint.ServiceCategory?.kind);
        
        return {
          serviceType,
          tariff: usagePoint.ServiceDeliveryPoint?.tariffProfile
        };
      }
    }

    return { serviceType: 'electric' };
  }

  /**
   * Convert value based on multipliers and units
   */
  private convertValue(
    value: number,
    powerOfTenMultiplier?: number,
    uom?: number
  ): { value: number; unit: string } {
    let convertedValue = value;
    let unit = 'kWh'; // default

    // Apply power of ten multiplier
    if (powerOfTenMultiplier !== undefined) {
      convertedValue *= Math.pow(10, powerOfTenMultiplier);
    }

    // Convert units
    switch (uom) {
      case 72: // Wh
        convertedValue /= 1000; // Convert to kWh
        unit = 'kWh';
        break;
      case 119: // kWh
        unit = 'kWh';
        break;
      case 132: // MWh
        convertedValue *= 1000; // Convert to kWh
        unit = 'kWh';
        break;
      case 169: // therms
        unit = 'therm';
        break;
      case 38: // W
        convertedValue /= 1000; // Convert to kW
        unit = 'kW';
        break;
      case 61: // kW
        unit = 'kW';
        break;
    }

    return { value: convertedValue, unit };
  }

  /**
   * Extract usage value from consumption object
   */
  private extractUsageValue(consumption?: any): number {
    if (!consumption) return 0;
    
    const converted = this.convertValue(
      consumption.value || 0,
      consumption.powerOfTenMultiplier,
      consumption.uom
    );
    
    return converted.value;
  }

  /**
   * Map quality codes to standard quality types
   */
  private mapQuality(qualityCode?: number): 'actual' | 'estimated' | 'validated' | 'manual' {
    switch (qualityCode) {
      case 0: return 'validated';
      case 7: return 'manual';
      case 8: return 'estimated';
      case 9: return 'estimated';
      case 10: return 'validated';
      case 11: return 'validated';
      case 14: return 'actual';
      case 17: return 'actual';
      default: return 'validated';
    }
  }

  /**
   * Map service category to service type
   */
  private mapServiceCategory(kind?: number): string {
    switch (kind) {
      case 0: return 'electric';
      case 1: return 'gas';
      case 2: return 'water';
      case 3: return 'time';
      case 4: return 'heat';
      case 5: return 'refuse';
      case 6: return 'sewerage';
      case 7: return 'rates';
      case 8: return 'tvLicense';
      case 9: return 'internet';
      default: return 'electric';
    }
  }

  /**
   * Normalize entries to array
   */
  private normalizeEntries(entry: GreenButtonEntry | GreenButtonEntry[]): GreenButtonEntry[] {
    return Array.isArray(entry) ? entry : [entry].filter(Boolean);
  }

  /**
   * Normalize intervals to array
   */
  private normalizeIntervals(intervals?: IntervalReading | IntervalReading[]): IntervalReading[] {
    if (!intervals) return [];
    return Array.isArray(intervals) ? intervals : [intervals];
  }

  /**
   * Validate Green Button data
   */
  validateData(xmlData: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const feed = this.parseXML(xmlData);
      
      if (!feed.feed) {
        errors.push('Missing feed element');
      }
      
      if (!feed.feed.entry) {
        errors.push('No entries found in feed');
      }
      
      const entries = this.normalizeEntries(feed.feed.entry);
      
      // Check for required entry types
      const hasUsagePoint = entries.some(e => e.content?.UsagePoint);
      const hasIntervalData = entries.some(e => e.content?.IntervalBlock);
      
      if (!hasUsagePoint) {
        errors.push('No UsagePoint found');
      }
      
      if (!hasIntervalData) {
        errors.push('No interval data found');
      }
      
    } catch (error) {
      errors.push('Invalid XML format');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default GreenButtonParser;