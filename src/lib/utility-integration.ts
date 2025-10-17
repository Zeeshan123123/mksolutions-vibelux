'use client';

import { z } from 'zod';

// Types and Interfaces
export interface UtilityProvider {
  id: string;
  name: string;
  region: string;
  rateSchedules: RateSchedule[];
  demandResponsePrograms: DemandResponseProgram[];
  apiConfig?: UtilityAPIConfig;
  complianceRequirements: ComplianceRequirement[];
}

export interface RateSchedule {
  id: string;
  name: string;
  type: 'tiered' | 'time-of-use' | 'demand' | 'peak-demand';
  timeZone: string;
  rates: {
    period: string;
    startTime: string;
    endTime: string;
    days: string[];
    months: string[];
    rate: number; // $/kWh
    demandCharge?: number; // $/kW
  }[];
  baseCharge: number;
  taxes: {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
  }[];
}

export interface DemandResponseProgram {
  id: string;
  name: string;
  type: 'peak-shaving' | 'load-shifting' | 'frequency-regulation' | 'reserves';
  incentiveRate: number; // $/kWh or $/kW
  maxDuration: number; // hours
  advanceNotice: number; // minutes
  eligibilityCriteria: {
    minCapacity: number; // kW
    maxCapacity?: number; // kW
    facilityType: string[];
  };
  seasonalAvailability: {
    startMonth: number;
    endMonth: number;
  };
}

export interface ComplianceRequirement {
  id: string;
  type: 'reporting' | 'metering' | 'notification' | 'verification';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  deadline: string; // relative to period end
  requiredData: string[];
  format: 'XML' | 'JSON' | 'CSV' | 'PDF';
  submissionMethod: 'API' | 'portal' | 'email' | 'ftp';
}

export interface UtilityAPIConfig {
  baseUrl: string;
  authType: 'api-key' | 'oauth' | 'certificate';
  endpoints: {
    billData: string;
    usage: string;
    rates: string;
    demandResponse: string;
  };
  rateLimit: {
    requests: number;
    period: number; // seconds
  };
}

export interface BillParsingResult {
  success: boolean;
  data?: {
    accountNumber: string;
    serviceAddress: string;
    billDate: Date;
    billingPeriod: {
      start: Date;
      end: Date;
    };
    usage: {
      kWh: number;
      peak: number;
      offPeak?: number;
      demand: number;
    };
    charges: {
      energy: number;
      demand: number;
      delivery: number;
      taxes: number;
      total: number;
    };
    rateSchedule: string;
  };
  errors?: string[];
}

// Utility Provider Database
export class UtilityProviderService {
  private static readonly PROVIDERS: UtilityProvider[] = [
    {
      id: 'pge',
      name: 'Pacific Gas & Electric',
      region: 'California',
      rateSchedules: [
        {
          id: 'ag-1a',
          name: 'Agricultural Schedule AG-1A',
          type: 'time-of-use',
          timeZone: 'America/Los_Angeles',
          rates: [
            {
              period: 'peak',
              startTime: '12:00',
              endTime: '18:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              months: ['May', 'June', 'July', 'August', 'September', 'October'],
              rate: 0.28,
              demandCharge: 18.50
            },
            {
              period: 'off-peak',
              startTime: '18:00',
              endTime: '12:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              rate: 0.12
            }
          ],
          baseCharge: 35.50,
          taxes: [
            { name: 'Public Purpose Programs', type: 'percentage', value: 0.025 },
            { name: 'Nuclear Decommissioning', type: 'percentage', value: 0.003 }
          ]
        }
      ],
      demandResponsePrograms: [
        {
          id: 'pge-bip',
          name: 'Base Interruptible Program',
          type: 'peak-shaving',
          incentiveRate: 7.00,
          maxDuration: 4,
          advanceNotice: 30,
          eligibilityCriteria: {
            minCapacity: 100,
            facilityType: ['commercial', 'industrial', 'agricultural']
          },
          seasonalAvailability: {
            startMonth: 5,
            endMonth: 10
          }
        }
      ],
      complianceRequirements: [
        {
          id: 'pge-monthly-report',
          type: 'reporting',
          description: 'Monthly energy usage and demand response participation report',
          frequency: 'monthly',
          deadline: '15th of following month',
          requiredData: ['usage', 'demand', 'dr-events', 'baseline'],
          format: 'XML',
          submissionMethod: 'API'
        }
      ]
    },
    {
      id: 'sce',
      name: 'Southern California Edison',
      region: 'California',
      rateSchedules: [
        {
          id: 'tou-8',
          name: 'General Service TOU-8',
          type: 'time-of-use',
          timeZone: 'America/Los_Angeles',
          rates: [
            {
              period: 'on-peak',
              startTime: '12:00',
              endTime: '18:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              months: ['June', 'July', 'August', 'September'],
              rate: 0.32,
              demandCharge: 21.75
            },
            {
              period: 'mid-peak',
              startTime: '08:00',
              endTime: '12:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              months: ['June', 'July', 'August', 'September'],
              rate: 0.18
            },
            {
              period: 'off-peak',
              startTime: '18:00',
              endTime: '08:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              rate: 0.11
            }
          ],
          baseCharge: 42.00,
          taxes: [
            { name: 'Public Purpose Programs', type: 'percentage', value: 0.034 }
          ]
        }
      ],
      demandResponsePrograms: [
        {
          id: 'sce-cbp',
          name: 'Capacity Bidding Program',
          type: 'load-shifting',
          incentiveRate: 0.50,
          maxDuration: 6,
          advanceNotice: 60,
          eligibilityCriteria: {
            minCapacity: 200,
            facilityType: ['commercial', 'industrial']
          },
          seasonalAvailability: {
            startMonth: 5,
            endMonth: 10
          }
        }
      ],
      complianceRequirements: [
        {
          id: 'sce-settlement',
          type: 'verification',
          description: 'Demand response settlement data verification',
          frequency: 'monthly',
          deadline: '10th of following month',
          requiredData: ['meter-data', 'baseline', 'adjustments'],
          format: 'CSV',
          submissionMethod: 'portal'
        }
      ]
    }
  ];

  static getProvider(id: string): UtilityProvider | undefined {
    return this.PROVIDERS.find(provider => provider.id === id);
  }

  static getProviderByName(name: string): UtilityProvider | undefined {
    return this.PROVIDERS.find(provider => 
      provider.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  static getProvidersInRegion(region: string): UtilityProvider[] {
    return this.PROVIDERS.filter(provider => 
      provider.region.toLowerCase() === region.toLowerCase()
    );
  }

  static getAllProviders(): UtilityProvider[] {
    return this.PROVIDERS;
  }
}

// Bill Parsing Service
export class BillParsingService {
  private static readonly BILL_PATTERNS = {
    accountNumber: [
      /Account\s*(?:Number|#)[\s:]*(\d{10,})/i,
      /Service\s*Account[\s:]*(\d{10,})/i,
      /Acct[\s:]*(\d{10,})/i
    ],
    billingPeriod: [
      /(?:Billing|Service)\s*Period[\s:]*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /From\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*to\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i
    ],
    usage: {
      kWh: [
        /Total\s*(?:kWh|Energy)\s*Used[\s:]*([0-9,]+)/i,
        /Energy\s*Charges[\s\S]*?([0-9,]+)\s*kWh/i
      ],
      demand: [
        /(?:Peak\s*)?Demand[\s:]*([0-9,.]+)\s*kW/i,
        /Maximum\s*Demand[\s:]*([0-9,.]+)/i
      ]
    },
    charges: {
      total: [
        /Total\s*(?:Amount\s*)?(?:Due|Charges?)[\s:]*\$([0-9,]+\.?\d*)/i,
        /Amount\s*Due[\s:]*\$([0-9,]+\.?\d*)/i
      ],
      energy: [
        /Energy\s*Charges?[\s:]*\$([0-9,]+\.?\d*)/i,
        /Electricity\s*Charges?[\s:]*\$([0-9,]+\.?\d*)/i
      ]
    }
  };

  static async parseBill(billText: string, utilityId: string): Promise<BillParsingResult> {
    try {
      const provider = UtilityProviderService.getProvider(utilityId);
      if (!provider) {
        return {
          success: false,
          errors: [`Unknown utility provider: ${utilityId}`]
        };
      }

      const result: BillParsingResult = { success: false };
      const data: any = {};
      const errors: string[] = [];

      // Parse account number
      for (const pattern of this.BILL_PATTERNS.accountNumber) {
        const match = billText.match(pattern);
        if (match) {
          data.accountNumber = match[1];
          break;
        }
      }

      if (!data.accountNumber) {
        errors.push('Could not find account number');
      }

      // Parse billing period
      for (const pattern of this.BILL_PATTERNS.billingPeriod) {
        const match = billText.match(pattern);
        if (match) {
          data.billingPeriod = {
            start: new Date(match[1]),
            end: new Date(match[2])
          };
          break;
        }
      }

      if (!data.billingPeriod) {
        errors.push('Could not find billing period');
      }

      // Parse usage data
      data.usage = {};
      
      // kWh usage
      for (const pattern of this.BILL_PATTERNS.usage.kWh) {
        const match = billText.match(pattern);
        if (match) {
          data.usage.kWh = parseInt(match[1].replace(/,/g, ''));
          break;
        }
      }

      // Demand
      for (const pattern of this.BILL_PATTERNS.usage.demand) {
        const match = billText.match(pattern);
        if (match) {
          data.usage.demand = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }

      // Parse charges
      data.charges = {};
      
      // Total charges
      for (const pattern of this.BILL_PATTERNS.charges.total) {
        const match = billText.match(pattern);
        if (match) {
          data.charges.total = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }

      // Energy charges
      for (const pattern of this.BILL_PATTERNS.charges.energy) {
        const match = billText.match(pattern);
        if (match) {
          data.charges.energy = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }

      if (errors.length === 0 && data.usage.kWh && data.charges.total) {
        result.success = true;
        result.data = data;
      } else {
        result.success = false;
        result.errors = errors;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        errors: [`Parsing error: ${error}`]
      };
    }
  }

  static validateBillData(data: any, provider: UtilityProvider): string[] {
    const errors: string[] = [];

    if (!data.accountNumber || data.accountNumber.length < 8) {
      errors.push('Invalid account number format');
    }

    if (!data.usage?.kWh || data.usage.kWh <= 0) {
      errors.push('Invalid kWh usage value');
    }

    if (!data.charges?.total || data.charges.total <= 0) {
      errors.push('Invalid total charges amount');
    }

    if (!data.billingPeriod?.start || !data.billingPeriod?.end) {
      errors.push('Invalid billing period dates');
    }

    // Validate against reasonable ranges
    if (data.usage?.kWh > 1000000) {
      errors.push('kWh usage exceeds reasonable limits');
    }

    if (data.charges?.total > 100000) {
      errors.push('Total charges exceed reasonable limits');
    }

    return errors;
  }
}

// Weather Data Integration
export class WeatherIntegrationService {
  private static readonly WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  static async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const start = Math.floor(startDate.getTime() / 1000);
      const end = Math.floor(endDate.getTime() / 1000);
      
      const response = await fetch(
        `${this.BASE_URL}/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${start}&appid=${this.WEATHER_API_KEY}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }

  static calculateDegreeDays(
    weatherData: any,
    baseTemp: number = 65
  ): { heating: number; cooling: number } {
    const avgTemp = (weatherData.temp.min + weatherData.temp.max) / 2;
    
    return {
      heating: Math.max(0, baseTemp - avgTemp),
      cooling: Math.max(0, avgTemp - baseTemp)
    };
  }
}

// Compliance Management
export class ComplianceManagementService {
  static async generateComplianceReport(
    providerId: string,
    requirementId: string,
    periodStart: Date,
    periodEnd: Date,
    data: any
  ): Promise<{ success: boolean; report?: any; errors?: string[] }> {
    try {
      const provider = UtilityProviderService.getProvider(providerId);
      if (!provider) {
        return { success: false, errors: ['Unknown utility provider'] };
      }

      const requirement = provider.complianceRequirements.find(
        req => req.id === requirementId
      );
      if (!requirement) {
        return { success: false, errors: ['Unknown compliance requirement'] };
      }

      const report = {
        header: {
          providerId,
          requirementId,
          periodStart,
          periodEnd,
          generatedAt: new Date(),
          format: requirement.format
        },
        data: this.formatDataForRequirement(data, requirement),
        validation: this.validateComplianceData(data, requirement)
      };

      return { success: true, report };
    } catch (error) {
      return { success: false, errors: [`Report generation error: ${error}`] };
    }
  }

  private static formatDataForRequirement(data: any, requirement: ComplianceRequirement): any {
    const formatted: any = {};

    requirement.requiredData.forEach(field => {
      switch (field) {
        case 'usage':
          formatted.usage = {
            totalKwh: data.usage?.totalKwh || 0,
            peakDemand: data.usage?.peakDemand || 0,
            loadFactor: data.usage?.loadFactor || 0
          };
          break;
        case 'demand':
          formatted.demand = {
            maxDemand: data.demand?.max || 0,
            avgDemand: data.demand?.avg || 0,
            demandCharges: data.demand?.charges || 0
          };
          break;
        case 'dr-events':
          formatted.demandResponseEvents = data.drEvents || [];
          break;
        case 'baseline':
          formatted.baseline = {
            established: data.baseline?.established || false,
            value: data.baseline?.value || 0,
            adjustments: data.baseline?.adjustments || []
          };
          break;
        default:
          formatted[field] = data[field];
      }
    });

    return formatted;
  }

  private static validateComplianceData(data: any, requirement: ComplianceRequirement): any {
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    requirement.requiredData.forEach(field => {
      if (!data[field]) {
        validation.isValid = false;
        validation.errors.push(`Missing required field: ${field}`);
      }
    });

    return validation;
  }

  static async submitComplianceReport(
    provider: UtilityProvider,
    requirement: ComplianceRequirement,
    report: any
  ): Promise<{ success: boolean; confirmationId?: string; errors?: string[] }> {
    try {
      switch (requirement.submissionMethod) {
        case 'API':
          return await this.submitViaAPI(provider, requirement, report);
        case 'portal':
          return await this.submitViaPortal(provider, requirement, report);
        case 'email':
          return await this.submitViaEmail(provider, requirement, report);
        case 'ftp':
          return await this.submitViaFTP(provider, requirement, report);
        default:
          return { success: false, errors: ['Unknown submission method'] };
      }
    } catch (error) {
      return { success: false, errors: [`Submission error: ${error}`] };
    }
  }

  private static async submitViaAPI(
    provider: UtilityProvider,
    requirement: ComplianceRequirement,
    report: any
  ): Promise<{ success: boolean; confirmationId?: string; errors?: string[] }> {
    // Implementation would depend on specific utility API
    // This is a placeholder for the actual API integration
    return {
      success: true,
      confirmationId: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private static async submitViaPortal(
    provider: UtilityProvider,
    requirement: ComplianceRequirement,
    report: any
  ): Promise<{ success: boolean; confirmationId?: string; errors?: string[] }> {
    // Implementation would integrate with utility web portal
    // This is a placeholder
    return {
      success: true,
      confirmationId: `PORTAL-${Date.now()}`
    };
  }

  private static async submitViaEmail(
    provider: UtilityProvider,
    requirement: ComplianceRequirement,
    report: any
  ): Promise<{ success: boolean; confirmationId?: string; errors?: string[] }> {
    // Implementation would send email with report attachment
    // This is a placeholder
    return {
      success: true,
      confirmationId: `EMAIL-${Date.now()}`
    };
  }

  private static async submitViaFTP(
    provider: UtilityProvider,
    requirement: ComplianceRequirement,
    report: any
  ): Promise<{ success: boolean; confirmationId?: string; errors?: string[] }> {
    // Implementation would upload to FTP server
    // This is a placeholder
    return {
      success: true,
      confirmationId: `FTP-${Date.now()}`
    };
  }
}

// Demand Response Management
export class DemandResponseService {
  static async evaluatePrograms(
    facilityData: any,
    location: { lat: number; lon: number }
  ): Promise<{
    eligiblePrograms: any[];
    recommendations: any[];
  }> {
    // Get all utility providers in the area
    const providers = UtilityProviderService.getAllProviders();
    const eligiblePrograms: any[] = [];
    const recommendations: any[] = [];

    for (const provider of providers) {
      for (const program of provider.demandResponsePrograms) {
        const eligibility = this.checkEligibility(facilityData, program);
        
        if (eligibility.isEligible) {
          const potential = this.calculatePotential(facilityData, program);
          
          eligiblePrograms.push({
            provider: provider.name,
            program,
            eligibility,
            potential
          });

          if (potential.annualRevenue > 5000) {
            recommendations.push({
              provider: provider.name,
              program: program.name,
              reason: `Potential annual revenue: $${potential.annualRevenue.toLocaleString()}`,
              priority: potential.annualRevenue > 20000 ? 'high' : 'medium'
            });
          }
        }
      }
    }

    return { eligiblePrograms, recommendations };
  }

  private static checkEligibility(facilityData: any, program: DemandResponseProgram): any {
    const reasons: string[] = [];
    let isEligible = true;

    // Check capacity requirements
    if (facilityData.peakDemand < program.eligibilityCriteria.minCapacity) {
      isEligible = false;
      reasons.push(`Facility peak demand (${facilityData.peakDemand}kW) below minimum requirement (${program.eligibilityCriteria.minCapacity}kW)`);
    }

    if (program.eligibilityCriteria.maxCapacity && facilityData.peakDemand > program.eligibilityCriteria.maxCapacity) {
      isEligible = false;
      reasons.push(`Facility peak demand (${facilityData.peakDemand}kW) exceeds maximum limit (${program.eligibilityCriteria.maxCapacity}kW)`);
    }

    // Check facility type
    if (!program.eligibilityCriteria.facilityType.includes(facilityData.type)) {
      isEligible = false;
      reasons.push(`Facility type (${facilityData.type}) not eligible for this program`);
    }

    return { isEligible, reasons };
  }

  private static calculatePotential(facilityData: any, program: DemandResponseProgram): any {
    // Estimate curtailable load (typically 10-30% of peak demand)
    const curtailableLoad = facilityData.peakDemand * 0.2; // 20% assumption
    
    // Estimate number of events per year (varies by program and region)
    const eventsPerYear = program.type === 'peak-shaving' ? 10 : 25;
    
    // Calculate revenue potential
    const revenuePerEvent = curtailableLoad * program.maxDuration * program.incentiveRate;
    const annualRevenue = revenuePerEvent * eventsPerYear;

    return {
      curtailableLoad,
      eventsPerYear,
      revenuePerEvent,
      annualRevenue,
      paybackPeriod: 0 // Immediate revenue for demand response
    };
  }
}

// Export all services
export {
  UtilityProviderService,
  BillParsingService,
  WeatherIntegrationService,
  ComplianceManagementService,
  DemandResponseService
};