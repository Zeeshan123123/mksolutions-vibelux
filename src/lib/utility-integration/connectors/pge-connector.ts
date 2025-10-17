/**
 * Pacific Gas & Electric (PG&E) Green Button Connector
 * Implements OAuth 2.0 flow and data retrieval for PG&E customers
 */

import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';
import { UtilityConnector, UsageData, BillingData, AuthorizationResult } from '../types';

export interface PGEConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string;
  environment?: 'sandbox' | 'production';
}

export interface PGEToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  issued_at: number;
}

export interface GreenButtonData {
  IntervalBlock?: {
    interval?: {
      duration: number;
      start: number;
    };
    IntervalReading?: Array<{
      timePeriod: {
        duration: number;
        start: number;
      };
      value: number;
      quality?: string;
    }>;
  };
}

export class PGEConnector implements UtilityConnector {
  private config: PGEConfig;
  private baseUrl: string;
  private xmlParser: XMLParser;

  constructor(config: PGEConfig) {
    this.config = {
      ...config,
      scope: config.scope || 'FB=1_3_4_5_13_14_15_19_32_33_34_35_37_38_39_40',
      environment: config.environment || 'production'
    };

    this.baseUrl = this.config.environment === 'sandbox'
      ? 'https://api.pge.com/GreenButtonConnect/test'
      : 'https://api.pge.com/GreenButtonConnect';

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true
    });
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope!,
      state
    });

    return `${this.baseUrl}/oauth/v1/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<AuthorizationResult> {
    try {
      const tokenUrl = `${this.baseUrl}/oauth/v1/token`;
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        },
        body: params.toString()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${error}`);
      }

      const token: PGEToken = await response.json();
      token.issued_at = Date.now();

      return {
        success: true,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        scope: token.scope,
        raw: token
      };

    } catch (error) {
      logger.error('api', 'PG&E token exchange error:', error );
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
      const tokenUrl = `${this.baseUrl}/oauth/v1/token`;
      
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const token: PGEToken = await response.json();
      token.issued_at = Date.now();

      return {
        success: true,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        scope: token.scope,
        raw: token
      };

    } catch (error) {
      logger.error('api', 'PG&E token refresh error:', error );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  /**
   * Fetch customer usage data
   */
  async fetchUsageData(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    usagePointId?: string
  ): Promise<UsageData[]> {
    try {
      // First, get list of usage points if not provided
      if (!usagePointId) {
        const usagePoints = await this.getUsagePoints(accessToken);
        if (usagePoints.length === 0) {
          throw new Error('No usage points found for customer');
        }
        usagePointId = usagePoints[0].id;
      }

      // Fetch meter reading data
      const url = `${this.baseUrl}/espi/1_1/resource/Subscription/0/UsagePoint/${usagePointId}/MeterReading`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/atom+xml'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage data: ${response.status}`);
      }

      const xmlData = await response.text();
      const parsedData = this.parseGreenButtonXML(xmlData);
      
      return this.convertToUsageData(parsedData, startDate, endDate);

    } catch (error) {
      logger.error('api', 'Error fetching PG&E usage data:', error );
      throw error;
    }
  }

  /**
   * Fetch billing data
   */
  async fetchBillingData(
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<BillingData[]> {
    try {
      const url = `${this.baseUrl}/espi/1_1/resource/Subscription/0/ElectricPowerUsageSummary`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/atom+xml'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch billing data: ${response.status}`);
      }

      const xmlData = await response.text();
      const parsedData = this.parseBillingXML(xmlData);
      
      return this.convertToBillingData(parsedData, startDate, endDate);

    } catch (error) {
      logger.error('api', 'Error fetching PG&E billing data:', error );
      throw error;
    }
  }

  /**
   * Get customer's usage points (service locations)
   */
  private async getUsagePoints(accessToken: string): Promise<Array<{ id: string; serviceKind: string }>> {
    const url = `${this.baseUrl}/espi/1_1/resource/ApplicationInformation`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/atom+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage points: ${response.status}`);
    }

    const xmlData = await response.text();
    const parsed = this.xmlParser.parse(xmlData);
    
    // Extract usage points from the response
    const usagePoints: Array<{ id: string; serviceKind: string }> = [];
    
    // Navigate through the parsed XML structure
    const entries = parsed?.feed?.entry || [];
    const entriesArray = Array.isArray(entries) ? entries : [entries];
    
    for (const entry of entriesArray) {
      if (entry?.content?.UsagePoint) {
        const usagePoint = entry.content.UsagePoint;
        usagePoints.push({
          id: entry.id || crypto.randomUUID(),
          serviceKind: usagePoint.ServiceCategory?.kind || 'ELECTRICITY'
        });
      }
    }
    
    return usagePoints;
  }

  /**
   * Parse Green Button XML format
   */
  private parseGreenButtonXML(xmlData: string): GreenButtonData[] {
    const parsed = this.xmlParser.parse(xmlData);
    const results: GreenButtonData[] = [];
    
    // Navigate through the Atom feed structure
    const entries = parsed?.feed?.entry || [];
    const entriesArray = Array.isArray(entries) ? entries : [entries];
    
    for (const entry of entriesArray) {
      if (entry?.content?.IntervalBlock) {
        results.push(entry.content);
      }
    }
    
    return results;
  }

  /**
   * Parse billing XML data
   */
  private parseBillingXML(xmlData: string): any[] {
    const parsed = this.xmlParser.parse(xmlData);
    const results: any[] = [];
    
    const entries = parsed?.feed?.entry || [];
    const entriesArray = Array.isArray(entries) ? entries : [entries];
    
    for (const entry of entriesArray) {
      if (entry?.content?.ElectricPowerUsageSummary) {
        results.push(entry.content.ElectricPowerUsageSummary);
      }
    }
    
    return results;
  }

  /**
   * Convert Green Button data to standard UsageData format
   */
  private convertToUsageData(
    greenButtonData: GreenButtonData[],
    startDate: Date,
    endDate: Date
  ): UsageData[] {
    const usageData: UsageData[] = [];
    
    for (const block of greenButtonData) {
      if (!block.IntervalBlock?.IntervalReading) continue;
      
      for (const reading of block.IntervalBlock.IntervalReading) {
        const timestamp = new Date(reading.timePeriod.start * 1000);
        
        // Filter by date range
        if (timestamp >= startDate && timestamp <= endDate) {
          usageData.push({
            timestamp,
            usage: reading.value / 1000, // Convert Wh to kWh
            unit: 'kWh',
            quality: reading.quality || 'validated',
            intervalDuration: reading.timePeriod.duration
          });
        }
      }
    }
    
    return usageData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Convert billing XML to standard BillingData format
   */
  private convertToBillingData(
    billingXML: any[],
    startDate: Date,
    endDate: Date
  ): BillingData[] {
    const billingData: BillingData[] = [];
    
    for (const summary of billingXML) {
      const billStart = new Date(summary.billStartDate * 1000);
      const billEnd = new Date(summary.billEndDate * 1000);
      
      if (billEnd >= startDate && billStart <= endDate) {
        billingData.push({
          billDate: billEnd,
          startDate: billStart,
          endDate: billEnd,
          totalAmount: summary.costOfElectricity / 100, // Convert cents to dollars
          usage: summary.totalUsage / 1000, // Convert Wh to kWh
          demand: summary.peakDemand / 1000, // Convert W to kW
          energyCharges: (summary.energyCharge || 0) / 100,
          demandCharges: (summary.demandCharge || 0) / 100,
          otherCharges: (summary.otherCharges || 0) / 100,
          taxes: (summary.taxes || 0) / 100,
          accountNumber: summary.accountNumber || '',
          meterNumber: summary.meterNumber || '',
          rateSchedule: summary.rateSchedule || 'Unknown'
        });
      }
    }
    
    return billingData.sort((a, b) => a.billDate.getTime() - b.billDate.getTime());
  }

  /**
   * Validate customer account
   */
  async validateAccount(
    accessToken: string,
    accountNumber: string
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const usagePoints = await this.getUsagePoints(accessToken);
      
      if (usagePoints.length === 0) {
        return {
          valid: false,
          message: 'No service locations found for this account'
        };
      }
      
      return {
        valid: true,
        message: `Found ${usagePoints.length} service location(s)`
      };
      
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Account validation failed'
      };
    }
  }

  /**
   * Get rate schedule information
   */
  async getRateSchedule(accessToken: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/espi/1_1/resource/ReadingType`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/atom+xml'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rate schedule: ${response.status}`);
      }

      const xmlData = await response.text();
      return this.xmlParser.parse(xmlData);
      
    } catch (error) {
      logger.error('api', 'Error fetching rate schedule:', error );
      throw error;
    }
  }
}

export default PGEConnector;