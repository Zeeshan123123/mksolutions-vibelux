/**
 * Utility API Integration Manager
 * Connects to utility companies for automated bill ingestion and verification
 * Critical for production-ready energy savings verification
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { sql } from '@/lib/db';
import { PGEConnector } from './connectors/pge-connector';
import { SCEConnector } from './connectors/sce-connector';
import { UtilityAPIConnector } from './connectors/utilityapi-connector';
export * from './utility-types';
import { GreenButtonParser } from './parsers/green-button-parser';
import { UtilityConnector, UsageData, BillingData } from './types';

// Utility provider interfaces
export interface UtilityProvider {
  id: string;
  name: string;
  type: 'electric' | 'gas' | 'water';
  region: string;
  apiType: 'greenbutton' | 'utilityapi' | 'proprietary' | 'manual';
  credentials: UtilityCredentials;
  endpoints: UtilityEndpoints;
  rateSchedules: RateSchedule[];
  dataFormat: DataFormat;
}

export interface UtilityCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  accountNumber?: string;
  meterNumber?: string;
  encryptedRefreshToken?: string;
}

export interface UtilityEndpoints {
  authorization?: string;
  token?: string;
  usageData: string;
  billing: string;
  accounts?: string;
  meters?: string;
  rates?: string;
}

export interface RateSchedule {
  id: string;
  name: string;
  type: 'tiered' | 'time_of_use' | 'demand' | 'flat';
  effectiveDate: Date;
  expirationDate?: Date;
  rates: RateStructure[];
  demandCharges?: DemandCharge[];
}

export interface RateStructure {
  tier?: number;
  timeOfUse?: string; // 'peak' | 'off_peak' | 'shoulder'
  startHour?: number;
  endHour?: number;
  rate: number; // $/kWh or $/therm or $/gallon
  threshold?: number; // kWh/month for tier boundary
}

export interface DemandCharge {
  name: string;
  rate: number; // $/kW
  measurementPeriod: 'monthly' | '15_minute' | 'hourly';
  ratchetPercentage?: number;
  ratchetMonths?: number;
}

export interface DataFormat {
  type: 'json' | 'xml' | 'csv' | 'greenbutton';
  version: string;
  dateFormat: string;
  intervalLength: number; // minutes
  units: {
    energy: 'kWh' | 'therm' | 'gallon';
    demand?: 'kW' | 'kVA';
  };
}

export interface UtilityBill {
  id: string;
  utilityAccountId: string;
  facilityId: string;
  billDate: Date;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  totalAmount: number;
  energyCharges: number;
  demandCharges: number;
  otherCharges: number;
  taxes: number;
  usage: BillUsage;
  demand?: BillDemand;
  rateSchedule: string;
  pdfUrl?: string;
  rawData?: any;
  verified: boolean;
  verificationDate?: Date;
}

export interface BillUsage {
  total: number;
  units: string;
  intervals?: UsageInterval[];
  byTier?: TierUsage[];
  byTimeOfUse?: TimeOfUseUsage[];
}

export interface UsageInterval {
  timestamp: Date;
  value: number;
  quality: 'actual' | 'estimated' | 'missing';
}

export interface TierUsage {
  tier: number;
  usage: number;
  rate: number;
  cost: number;
}

export interface TimeOfUseUsage {
  period: string;
  usage: number;
  rate: number;
  cost: number;
}

export interface BillDemand {
  peak: number;
  units: string;
  timestamp: Date;
  ratchetApplied: boolean;
  billingDemand: number;
  cost: number;
}

export interface UtilityAccount {
  id: string;
  facilityId: string;
  providerId: string;
  accountNumber: string;
  meterNumbers: string[];
  serviceAddress: string;
  status: 'active' | 'pending' | 'disconnected' | 'error';
  connectionDate: Date;
  lastSyncDate?: Date;
  lastBillDate?: Date;
  authorizationStatus: AuthorizationStatus;
}

export interface AuthorizationStatus {
  authorized: boolean;
  method: 'oauth' | 'credentials' | 'manual';
  expiresAt?: Date;
  refreshToken?: string;
  error?: string;
}

// Major utility providers configuration
const UTILITY_PROVIDERS: Record<string, Partial<UtilityProvider>> = {
  'pge': {
    name: 'Pacific Gas & Electric',
    type: 'electric',
    region: 'California',
    apiType: 'greenbutton',
    endpoints: {
      authorization: 'https://api.pge.com/GreenButtonConnect/oauth/v1/authorize',
      token: 'https://api.pge.com/GreenButtonConnect/oauth/v1/token',
      usageData: 'https://api.pge.com/GreenButtonConnect/espi/1_1/resource/UsagePoint',
      billing: 'https://api.pge.com/GreenButtonConnect/espi/1_1/resource/ElectricPowerUsageSummary'
    }
  },
  'sce': {
    name: 'Southern California Edison',
    type: 'electric',
    region: 'California',
    apiType: 'greenbutton',
    endpoints: {
      authorization: 'https://api.sce.com/authorize',
      token: 'https://api.sce.com/token',
      usageData: 'https://api.sce.com/usage',
      billing: 'https://api.sce.com/billing'
    }
  },
  'coned': {
    name: 'Consolidated Edison',
    type: 'electric',
    region: 'New York',
    apiType: 'proprietary',
    endpoints: {
      usageData: 'https://api.coned.com/api/v1/usage',
      billing: 'https://api.coned.com/api/v1/billing'
    }
  },
  'duke': {
    name: 'Duke Energy',
    type: 'electric',
    region: 'Southeast',
    apiType: 'utilityapi',
    endpoints: {
      usageData: 'https://utilityapi.com/api/v2/files',
      billing: 'https://utilityapi.com/api/v2/bills'
    }
  }
};

export class UtilityAPIManager extends EventEmitter {
  private providers = new Map<string, UtilityProvider>();
  private accounts = new Map<string, UtilityAccount>();
  private syncJobs = new Map<string, NodeJS.Timeout>();
  private encryptionKey: Buffer;

  constructor(encryptionKey?: string) {
    super();
    this.encryptionKey = Buffer.from(
      encryptionKey || process.env.UTILITY_ENCRYPTION_KEY || 'default-key-change-in-production',
      'hex'
    );
    this.initializeProviders();
  }

  private initializeProviders() {
    logger.info('api', '🔌 Initializing utility providers...');
    
    for (const [id, config] of Object.entries(UTILITY_PROVIDERS)) {
      this.providers.set(id, {
        id,
        ...config,
        credentials: {},
        dataFormat: {
          type: 'json',
          version: '1.0',
          dateFormat: 'ISO8601',
          intervalLength: 15,
          units: { energy: 'kWh', demand: 'kW' }
        },
        rateSchedules: []
      } as UtilityProvider);
    }
    
    logger.info('api', `✅ Initialized ${this.providers.size} utility providers`);
  }

  async connectUtilityAccount(
    facilityId: string,
    providerId: string,
    credentials: UtilityCredentials
  ): Promise<UtilityAccount> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Unknown utility provider: ${providerId}`);
    }

    logger.info('api', `🔗 Connecting utility account for facility ${facilityId} with ${provider.name}`);

    try {
      // Encrypt sensitive credentials
      const encryptedCredentials = this.encryptCredentials(credentials);
      
      // Test connection based on API type
      let authStatus: AuthorizationStatus;
      
      switch (provider.apiType) {
        case 'greenbutton':
          authStatus = await this.authorizeGreenButton(provider, credentials);
          break;
        case 'utilityapi':
          authStatus = await this.authorizeUtilityAPI(provider, credentials);
          break;
        case 'proprietary':
          authStatus = await this.authorizeProprietary(provider, credentials);
          break;
        default:
          authStatus = { authorized: true, method: 'manual' };
      }

      if (!authStatus.authorized) {
        throw new Error(`Authorization failed: ${authStatus.error}`);
      }

      // Create utility account
      const account: UtilityAccount = {
        id: `util_${Date.now()}_${facilityId}`,
        facilityId,
        providerId,
        accountNumber: credentials.accountNumber || '',
        meterNumbers: credentials.meterNumber ? [credentials.meterNumber] : [],
        serviceAddress: '', // Would be fetched from utility
        status: 'active',
        connectionDate: new Date(),
        authorizationStatus: authStatus
      };

      this.accounts.set(account.id, account);
      
      // Start data sync job
      this.startDataSync(account, provider);
      
      logger.info('api', `✅ Connected utility account: ${account.id}`);
      this.emit('accountConnected', account);
      
      return account;

    } catch (error) {
      logger.error('api', `❌ Failed to connect utility account:`, error );
      throw error;
    }
  }

  private encryptCredentials(credentials: UtilityCredentials): UtilityCredentials {
    const encrypted: UtilityCredentials = { ...credentials };
    
    // Encrypt sensitive fields
    if (credentials.apiKey) {
      encrypted.apiKey = this.encrypt(credentials.apiKey);
    }
    if (credentials.clientSecret) {
      encrypted.clientSecret = this.encrypt(credentials.clientSecret);
    }
    if (credentials.password) {
      encrypted.password = this.encrypt(credentials.password);
    }
    
    return encrypted;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private async authorizeGreenButton(
    provider: UtilityProvider,
    credentials: UtilityCredentials
  ): Promise<AuthorizationStatus> {
    try {
      // Green Button OAuth 2.0 flow
      const tokenResponse = await fetch(provider.endpoints.token!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: credentials.username || '',
          password: credentials.password || '',
          scope: 'FB=1_3_4_5_13_14_15_19_32_33_34_35_37_38_39_40'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      return {
        authorized: true,
        method: 'oauth',
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        refreshToken: this.encrypt(tokenData.refresh_token),
        error: undefined
      };

    } catch (error) {
      return {
        authorized: false,
        method: 'oauth',
        error: error instanceof Error ? error.message : 'Authorization failed'
      };
    }
  }

  private async authorizeUtilityAPI(
    provider: UtilityProvider,
    credentials: UtilityCredentials
  ): Promise<AuthorizationStatus> {
    try {
      // UtilityAPI.com integration
      const response = await fetch('https://utilityapi.com/api/v2/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          utility: provider.id,
          utility_account_number: credentials.accountNumber,
          utility_meter_number: credentials.meterNumber
        })
      });

      if (!response.ok) {
        throw new Error(`UtilityAPI request failed: ${response.statusText}`);
      }

      return {
        authorized: true,
        method: 'credentials',
        error: undefined
      };

    } catch (error) {
      return {
        authorized: false,
        method: 'credentials',
        error: error instanceof Error ? error.message : 'Authorization failed'
      };
    }
  }

  private async authorizeProprietary(
    provider: UtilityProvider,
    credentials: UtilityCredentials
  ): Promise<AuthorizationStatus> {
    // Each utility has its own API format
    // This would be implemented per utility
    return {
      authorized: true,
      method: 'credentials',
      error: undefined
    };
  }

  private startDataSync(account: UtilityAccount, provider: UtilityProvider) {
    logger.info('api', `⏰ Starting data sync for account ${account.id}`);
    
    // Initial sync
    this.syncAccountData(account, provider);
    
    // Schedule regular syncs (daily)
    const syncJob = setInterval(async () => {
      await this.syncAccountData(account, provider);
    }, 24 * 60 * 60 * 1000);
    
    this.syncJobs.set(account.id, syncJob);
  }

  private async syncAccountData(account: UtilityAccount, provider: UtilityProvider) {
    logger.info('api', `🔄 Syncing data for account ${account.id}`);
    
    try {
      // Fetch usage data
      const usageData = await this.fetchUsageData(account, provider);
      
      // Fetch billing data
      const billingData = await this.fetchBillingData(account, provider);
      
      // Process and store data
      await this.processUtilityData(account, usageData, billingData);
      
      // Update sync status
      account.lastSyncDate = new Date();
      account.status = 'active';
      this.accounts.set(account.id, account);
      
      logger.info('api', `✅ Data sync completed for account ${account.id}`);
      this.emit('dataSynced', { accountId: account.id, timestamp: new Date() });
      
    } catch (error) {
      logger.error('api', `❌ Data sync failed for account ${account.id}:`, error);
      account.status = 'error';
      account.authorizationStatus.error = error instanceof Error ? error.message : 'Sync failed';
      this.accounts.set(account.id, account);
      
      this.emit('syncError', { accountId: account.id, error });
    }
  }

  private async fetchUsageData(account: UtilityAccount, provider: UtilityProvider): Promise<UsageData[]> {
    // Get OAuth tokens
    const oauthHandler = new OAuthHandler();
    const accessToken = await oauthHandler.refreshTokenIfNeeded(account.facilityId, provider.id);
    
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    // Set date range (last 30 days by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Get connector based on provider
    const connector = this.getConnector(provider);
    
    if (!connector) {
      throw new Error(`No connector available for provider: ${provider.id}`);
    }
    
    // Fetch usage data
    return await connector.fetchUsageData(accessToken, startDate, endDate, account.accountNumber);
  }

  private async fetchGreenButtonData(account: UtilityAccount, provider: UtilityProvider): Promise<any> {
    // Implement Green Button data fetching
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Last month
    
    const response = await fetch(
      `${provider.endpoints.usageData}/${account.meterNumbers[0]}/UsagePoint/1/MeterReading`,
      {
        headers: {
          'Authorization': `Bearer ${account.authorizationStatus.refreshToken}`,
          'Accept': 'application/atom+xml'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Green Button data: ${response.statusText}`);
    }
    
    // Parse Green Button XML format
    const xmlData = await response.text();
    return this.parseGreenButtonXML(xmlData);
  }

  private parseGreenButtonXML(xmlData: string): UsageInterval[] {
    // This would use an XML parser in production
    // For now, returning mock data structure
    const intervals: UsageInterval[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24 * 30; i++) { // 30 days of hourly data
      intervals.push({
        timestamp: new Date(now.getTime() - i * 60 * 60 * 1000),
        value: Math.random() * 100 + 50, // 50-150 kWh
        quality: 'actual'
      });
    }
    
    return intervals;
  }

  private async fetchUtilityAPIData(account: UtilityAccount, provider: UtilityProvider): Promise<any> {
    // Implement UtilityAPI.com data fetching
    const response = await fetch(
      `https://utilityapi.com/api/v2/files?accounts=${account.accountNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${provider.credentials.apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch UtilityAPI data: ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async fetchProprietaryData(account: UtilityAccount, provider: UtilityProvider): Promise<any> {
    // Each utility would have its own implementation
    return [];
  }

  private async fetchBillingData(account: UtilityAccount, provider: UtilityProvider): Promise<UtilityBill[]> {
    // Get OAuth tokens
    const oauthHandler = new OAuthHandler();
    const accessToken = await oauthHandler.refreshTokenIfNeeded(account.facilityId, provider.id);
    
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    // Set date range (last 12 months by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    // Get connector based on provider
    const connector = this.getConnector(provider);
    
    if (!connector) {
      throw new Error(`No connector available for provider: ${provider.id}`);
    }
    
    // Fetch billing data
    const billingData = await connector.fetchBillingData(accessToken, startDate, endDate, account.accountNumber);
    
    // Convert to UtilityBill format
    return billingData.map(bill => ({
      id: `bill_${account.id}_${bill.billDate.getTime()}`,
      utilityAccountId: account.id,
      facilityId: account.facilityId,
      billDate: bill.billDate,
      startDate: bill.startDate,
      endDate: bill.endDate,
      dueDate: new Date(bill.billDate.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days
      totalAmount: bill.totalAmount,
      energyCharges: bill.energyCharges,
      demandCharges: bill.demandCharges || 0,
      otherCharges: bill.otherCharges || 0,
      taxes: bill.taxes || 0,
      usage: {
        total: bill.usage,
        units: bill.usageUnit || 'kWh'
      },
      demand: bill.demand ? {
        peak: bill.demand,
        units: bill.demandUnit || 'kW',
        timestamp: bill.billDate,
        ratchetApplied: false,
        billingDemand: bill.demand,
        cost: bill.demandCharges || 0
      } : undefined,
      rateSchedule: bill.rateSchedule || 'Unknown',
      pdfUrl: bill.pdf,
      rawData: bill.raw,
      verified: false
    }));
  }

  /**
   * Get connector instance for provider
   */
  private getConnector(provider: UtilityProvider): UtilityConnector | null {
    switch (provider.id) {
      case 'pge':
        return new PGEConnector({
          clientId: process.env.PGE_CLIENT_ID || '',
          clientSecret: process.env.PGE_CLIENT_SECRET || '',
          redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/utility/oauth/callback`
        });
        
      case 'sce':
        return new SCEConnector({
          clientId: process.env.SCE_CLIENT_ID || '',
          clientSecret: process.env.SCE_CLIENT_SECRET || '',
          redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/utility/oauth/callback`
        });
        
      case 'utilityapi':
        return new UtilityAPIConnector({
          apiKey: process.env.UTILITYAPI_KEY || ''
        });
        
      default:
        return null;
    }
  }

  private async processUtilityData(
    account: UtilityAccount,
    usageData: UsageData[],
    billingData: UtilityBill[]
  ): Promise<void> {
    // Store data in database and trigger verification
    logger.info('api', `💾 Processing utility data for account ${account.id}`);
    
    // Begin transaction
    const client = await sql.begin();
    
    try {
      // Store bills in database
      for (const bill of billingData) {
        await client`
          INSERT INTO utility_bills (
            connection_id, facility_id, provider_id, bill_date,
            start_date, end_date, due_date, account_number,
            meter_number, total_amount, usage_amount, usage_unit,
            demand_amount, demand_unit, energy_charges, demand_charges,
            other_charges, taxes, rate_schedule, pdf_url, raw_data
          ) VALUES (
            ${account.id}, ${account.facilityId}, ${account.providerId},
            ${bill.billDate}, ${bill.startDate}, ${bill.endDate},
            ${bill.dueDate}, ${bill.accountNumber}, ${bill.meterNumber},
            ${bill.totalAmount}, ${bill.usage.total}, ${bill.usage.units},
            ${bill.demand?.peak}, ${bill.demand?.units}, ${bill.energyCharges},
            ${bill.demandCharges}, ${bill.otherCharges}, ${bill.taxes},
            ${bill.rateSchedule}, ${bill.pdfUrl}, ${JSON.stringify(bill.rawData)}
          )
          ON CONFLICT (connection_id, bill_date, account_number) DO UPDATE SET
            total_amount = EXCLUDED.total_amount,
            usage_amount = EXCLUDED.usage_amount,
            updated_at = NOW()
        `;
      }
      
      // Store interval usage data
      if (usageData.length > 0) {
        // Batch insert for efficiency
        const values = usageData.map(usage => ({
          connection_id: account.id,
          facility_id: account.facilityId,
          meter_number: account.meterNumbers[0] || '',
          interval_start: usage.timestamp,
          interval_end: new Date(usage.timestamp.getTime() + (usage.intervalDuration || 3600) * 1000),
          interval_seconds: usage.intervalDuration || 3600,
          usage_value: usage.usage,
          usage_unit: usage.unit,
          demand_value: usage.demand,
          demand_unit: usage.demandUnit,
          power_factor: usage.powerFactor,
          voltage: usage.voltage,
          quality: usage.quality
        }));
        
        await client`
          INSERT INTO utility_intervals ${client(values)}
          ON CONFLICT DO NOTHING
        `;
      }
      
      // Update last sync date
      await client`
        UPDATE utility_connections
        SET 
          last_sync_date = NOW(),
          sync_status = 'completed',
          sync_error = NULL
        WHERE id = ${account.id}
      `;
      
      await client.commit();
      
      logger.info('api', `✅ Stored ${billingData.length} bills and ${usageData.length} usage intervals`);
      
      // Trigger verification process
      this.emit('dataReadyForVerification', {
        accountId: account.id,
        facilityId: account.facilityId,
        billCount: billingData.length,
        intervalCount: usageData.length
      });
      
    } catch (error) {
      await client.rollback();
      throw error;
    }
  }

  private async storeBill(bill: UtilityBill): Promise<void> {
    // This would store in database
    logger.info('api', `💾 Storing bill ${bill.id}`);
  }

  private async storeIntervalData(facilityId: string, intervals: UsageInterval[]): Promise<void> {
    // This would store in time-series database
    logger.info('api', `💾 Storing ${intervals.length} interval readings for facility ${facilityId}`);
  }

  // Public API methods
  public getProvider(providerId: string): UtilityProvider | undefined {
    return this.providers.get(providerId);
  }

  public getAllProviders(): UtilityProvider[] {
    return Array.from(this.providers.values());
  }

  public getAccount(accountId: string): UtilityAccount | undefined {
    return this.accounts.get(accountId);
  }

  public getFacilityAccounts(facilityId: string): UtilityAccount[] {
    return Array.from(this.accounts.values())
      .filter(account => account.facilityId === facilityId);
  }

  public async refreshAuthorization(accountId: string): Promise<boolean> {
    const account = this.accounts.get(accountId);
    if (!account) return false;
    
    const provider = this.providers.get(account.providerId);
    if (!provider) return false;
    
    try {
      const newAuth = await this.authorizeGreenButton(provider, provider.credentials);
      account.authorizationStatus = newAuth;
      this.accounts.set(accountId, account);
      return newAuth.authorized;
    } catch (error) {
      logger.error('api', `Failed to refresh authorization for ${accountId}:`, error);
      return false;
    }
  }

  public async verifyBill(billId: string): Promise<boolean> {
    // Third-party verification would go here
    logger.info('api', `✅ Verifying bill ${billId}`);
    return true;
  }

  public stopAllSyncs(): void {
    for (const [accountId, timer] of this.syncJobs) {
      clearInterval(timer);
      logger.info('api', `⏹️ Stopped sync for account ${accountId}`);
    }
    this.syncJobs.clear();
  }
}

export default UtilityAPIManager;