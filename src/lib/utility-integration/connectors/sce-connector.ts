/**
 * Southern California Edison (SCE) API Connector
 * Implements SCE's proprietary API for energy data retrieval
 */

import { UtilityConnector, UsageData, BillingData, AuthorizationResult, UtilityAPIError } from '../types';

export interface SCEConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment?: 'sandbox' | 'production';
}

export interface SCEAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  customer_id: string;
  account_numbers: string[];
}

export interface SCEUsageResponse {
  data: Array<{
    date: string;
    hour: string;
    usage: number;
    cost: number;
    tier?: string;
    temperature?: number;
  }>;
  summary: {
    totalUsage: number;
    totalCost: number;
    avgDailyUsage: number;
    peakDemand?: number;
  };
}

export interface SCEBillResponse {
  bills: Array<{
    billDate: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    currentCharges: number;
    usage: number;
    avgDailyUsage: number;
    daysInBillingPeriod: number;
    energyCharges: number;
    deliveryCharges: number;
    taxes: number;
    credits?: number;
    peakDemand?: number;
    rateSchedule: string;
  }>;
}

export class SCEConnector implements UtilityConnector {
  private config: SCEConfig;
  private baseUrl: string;

  constructor(config: SCEConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'sandbox'
      ? 'https://api-sandbox.sce.com'
      : 'https://api.sce.com';
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'usage billing account',
      state,
      access_type: 'offline'
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<AuthorizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new UtilityAPIError(
          error.error_description || 'Token exchange failed',
          error.error || 'TOKEN_EXCHANGE_ERROR',
          response.status
        );
      }

      const token: SCEAuthToken = await response.json();

      return {
        success: true,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        raw: token
      };

    } catch (error) {
      logger.error('api', 'SCE token exchange error:', error );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token exchange failed'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthorizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new UtilityAPIError(
          'Token refresh failed',
          'TOKEN_REFRESH_ERROR',
          response.status
        );
      }

      const token: SCEAuthToken = await response.json();

      return {
        success: true,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        raw: token
      };

    } catch (error) {
      logger.error('api', 'SCE token refresh error:', error );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  /**
   * Fetch usage data from SCE
   */
  async fetchUsageData(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<UsageData[]> {
    try {
      // Get account info if not provided
      if (!accountId) {
        const accounts = await this.getAccounts(accessToken);
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }
        accountId = accounts[0].accountNumber;
      }

      // SCE API expects dates in YYYY-MM-DD format
      const startStr = this.formatDate(startDate);
      const endStr = this.formatDate(endDate);

      const url = `${this.baseUrl}/api/v1/accounts/${accountId}/usage?` +
        `startDate=${startStr}&endDate=${endStr}&granularity=hourly`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new UtilityAPIError(
          'Failed to fetch usage data',
          'USAGE_FETCH_ERROR',
          response.status
        );
      }

      const sceData: SCEUsageResponse = await response.json();
      return this.convertToUsageData(sceData);

    } catch (error) {
      logger.error('api', 'Error fetching SCE usage data:', error );
      throw error;
    }
  }

  /**
   * Fetch billing data from SCE
   */
  async fetchBillingData(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<BillingData[]> {
    try {
      // Get account info if not provided
      if (!accountId) {
        const accounts = await this.getAccounts(accessToken);
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }
        accountId = accounts[0].accountNumber;
      }

      const url = `${this.baseUrl}/api/v1/accounts/${accountId}/bills?` +
        `startDate=${this.formatDate(startDate)}&endDate=${this.formatDate(endDate)}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new UtilityAPIError(
          'Failed to fetch billing data',
          'BILLING_FETCH_ERROR',
          response.status
        );
      }

      const sceData: SCEBillResponse = await response.json();
      return this.convertToBillingData(sceData, accountId);

    } catch (error) {
      logger.error('api', 'Error fetching SCE billing data:', error );
      throw error;
    }
  }

  /**
   * Get customer accounts
   */
  private async getAccounts(accessToken: string): Promise<Array<{ accountNumber: string; address: string }>> {
    const response = await fetch(`${this.baseUrl}/api/v1/customer/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new UtilityAPIError(
        'Failed to fetch accounts',
        'ACCOUNTS_FETCH_ERROR',
        response.status
      );
    }

    const data = await response.json();
    return data.accounts || [];
  }

  /**
   * Convert SCE usage data to standard format
   */
  private convertToUsageData(sceData: SCEUsageResponse): UsageData[] {
    const usageData: UsageData[] = [];

    for (const reading of sceData.data) {
      const [year, month, day] = reading.date.split('-').map(Number);
      const hour = parseInt(reading.hour);
      
      usageData.push({
        timestamp: new Date(year, month - 1, day, hour),
        usage: reading.usage,
        unit: 'kWh',
        quality: 'validated',
        intervalDuration: 3600 // 1 hour in seconds
      });
    }

    return usageData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Convert SCE billing data to standard format
   */
  private convertToBillingData(sceData: SCEBillResponse, accountNumber: string): BillingData[] {
    return sceData.bills.map(bill => ({
      billDate: new Date(bill.billDate),
      startDate: new Date(bill.startDate),
      endDate: new Date(bill.endDate),
      totalAmount: bill.totalAmount,
      usage: bill.usage,
      usageUnit: 'kWh',
      demand: bill.peakDemand,
      demandUnit: 'kW',
      energyCharges: bill.energyCharges,
      demandCharges: bill.deliveryCharges, // SCE includes demand in delivery
      otherCharges: bill.credits ? -bill.credits : 0,
      taxes: bill.taxes,
      accountNumber,
      rateSchedule: bill.rateSchedule
    }));
  }

  /**
   * Validate customer account
   */
  async validateAccount(
    accessToken: string,
    accountNumber: string
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const accounts = await this.getAccounts(accessToken);
      const found = accounts.find(acc => acc.accountNumber === accountNumber);
      
      return {
        valid: !!found,
        message: found ? 'Account validated successfully' : 'Account not found'
      };
      
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Account validation failed'
      };
    }
  }

  /**
   * Get time-of-use periods for rate analysis
   */
  async getTimeOfUsePeriods(
    accessToken: string,
    accountId: string
  ): Promise<Array<{ period: string; startHour: number; endHour: number; rate: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/accounts/${accountId}/rate-schedule`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate schedule');
      }

      const data = await response.json();
      return data.timeOfUsePeriods || [];
      
    } catch (error) {
      logger.error('api', 'Error fetching TOU periods:', error );
      return [];
    }
  }

  /**
   * Download bill PDF
   */
  async downloadBillPDF(
    accessToken: string,
    accountId: string,
    billDate: Date
  ): Promise<string> {
    const url = `${this.baseUrl}/api/v1/accounts/${accountId}/bills/${this.formatDate(billDate)}/pdf`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download bill PDF');
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }

  /**
   * Format date for SCE API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export default SCEConnector;