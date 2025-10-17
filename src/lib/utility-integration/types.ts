/**
 * Utility Integration Types and Interfaces
 * Common types used across all utility connectors
 */

export interface UtilityConnector {
  // OAuth/Authentication methods
  getAuthorizationUrl?(state: string): string;
  exchangeCodeForToken?(code: string): Promise<AuthorizationResult>;
  refreshAccessToken?(refreshToken: string): Promise<AuthorizationResult>;
  
  // Data retrieval methods
  fetchUsageData(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<UsageData[]>;
  
  fetchBillingData(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<BillingData[]>;
  
  // Validation methods
  validateAccount?(
    accessToken: string,
    accountNumber: string
  ): Promise<{ valid: boolean; message?: string }>;
}

export interface AuthorizationResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  error?: string;
  raw?: any;
}

export interface UsageData {
  timestamp: Date;
  usage: number;
  unit: 'kWh' | 'therm' | 'ccf' | 'gal';
  quality: 'actual' | 'estimated' | 'validated' | 'manual';
  intervalDuration?: number; // seconds
  demand?: number;
  demandUnit?: 'kW' | 'kVA';
  powerFactor?: number;
  voltage?: number;
  current?: number;
}

export interface BillingData {
  billDate: Date;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  usage: number;
  usageUnit?: string;
  demand?: number;
  demandUnit?: string;
  energyCharges: number;
  demandCharges?: number;
  otherCharges?: number;
  taxes?: number;
  accountNumber: string;
  meterNumber?: string;
  rateSchedule?: string;
  pdf?: string; // Base64 encoded PDF
  raw?: any; // Original data from utility
}

export interface TimeOfUseData {
  period: 'peak' | 'off-peak' | 'shoulder' | 'super-off-peak';
  usage: number;
  rate: number;
  cost: number;
  startHour: number;
  endHour: number;
}

export interface DemandData {
  timestamp: Date;
  demand: number;
  unit: 'kW' | 'kVA';
  interval: '15min' | '30min' | 'hourly' | 'daily';
  isBillingDemand: boolean;
}

export interface UtilityAccount {
  accountNumber: string;
  meterNumber?: string;
  serviceAddress: string;
  serviceType: 'electric' | 'gas' | 'water';
  rateSchedule?: string;
  accountStatus: 'active' | 'inactive' | 'pending';
  billingCycle?: string;
}

export interface RateSchedule {
  code: string;
  name: string;
  type: 'tiered' | 'time-of-use' | 'demand' | 'flat' | 'dynamic';
  effectiveDate: Date;
  rates: RateComponent[];
  seasons?: SeasonDefinition[];
  holidays?: Date[];
}

export interface RateComponent {
  name: string;
  type: 'energy' | 'demand' | 'fixed' | 'minimum';
  rate: number;
  unit: string;
  tier?: number;
  tierLimit?: number;
  timeOfUse?: string;
  season?: string;
}

export interface SeasonDefinition {
  name: 'summer' | 'winter' | 'spring' | 'fall';
  startMonth: number;
  endMonth: number;
  rates?: RateComponent[];
}

export interface UtilityError extends Error {
  code: string;
  statusCode?: number;
  utility?: string;
  details?: any;
}

export class UtilityAPIError extends Error implements UtilityError {
  code: string;
  statusCode?: number;
  utility?: string;
  details?: any;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'UtilityAPIError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Utility provider configurations
export interface UtilityProviderConfig {
  id: string;
  name: string;
  type: 'electric' | 'gas' | 'water' | 'multi';
  region: string[];
  authMethod: 'oauth' | 'basic' | 'api_key' | 'form';
  dataFormats: ('green_button' | 'json' | 'csv' | 'xml')[];
  capabilities: UtilityCapabilities;
  rateSchedules?: string[];
  website?: string;
  supportEmail?: string;
  apiDocumentation?: string;
}

export interface UtilityCapabilities {
  realTimeData: boolean;
  intervalData: boolean;
  billingData: boolean;
  demandData: boolean;
  netMetering: boolean;
  timeOfUseRates: boolean;
  rateScheduleAccess: boolean;
  historicalDataMonths: number;
  dataGranularity: '15min' | '30min' | 'hourly' | 'daily' | 'monthly';
}

// Green Button specific types
export interface GreenButtonScope {
  FB: string; // Function Block
  description: string;
  dataElements: string[];
}

export const GREEN_BUTTON_SCOPES: Record<string, GreenButtonScope> = {
  usage: {
    FB: '1_4_5',
    description: 'Energy usage information',
    dataElements: ['IntervalBlock', 'ReadingType', 'UsagePoint']
  },
  billing: {
    FB: '13_14_39',
    description: 'Billing and cost information',
    dataElements: ['ElectricPowerUsageSummary', 'BillingPeriod']
  },
  customer: {
    FB: '15_32',
    description: 'Customer account information',
    dataElements: ['Customer', 'CustomerAccount', 'CustomerAgreement']
  }
};

// Data quality indicators
export enum DataQuality {
  VALIDATED = 'validated',
  ESTIMATED = 'estimated',
  MANUAL = 'manual',
  MISSING = 'missing',
  INVALID = 'invalid'
}

// Common utility response format
export interface UtilityResponse<T> {
  success: boolean;
  data?: T;
  error?: UtilityError;
  metadata?: {
    utility: string;
    requestId?: string;
    timestamp: Date;
    dataQuality?: DataQuality;
    warnings?: string[];
  };
}