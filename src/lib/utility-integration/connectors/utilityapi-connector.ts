/**
 * UtilityAPI.com Connector
 * Universal utility data aggregator supporting 100+ utilities across North America
 */

import { UtilityConnector, UsageData, BillingData, AuthorizationResult, UtilityAPIError } from '../types';

export interface UtilityAPIConfig {
  apiKey: string;
  environment?: 'sandbox' | 'production';
  webhookUrl?: string;
}

export interface UtilityAPIForm {
  uid: string;
  created: string;
  updated: string;
  utility: string;
  template: string;
  https_auth_url: string;
  email_auth_url: string;
  sms_auth_url: string;
  authorization_uid?: string;
}

export interface UtilityAPIAuthorization {
  uid: string;
  created: string;
  updated: string;
  is_archived: boolean;
  user_uid: string;
  utility: string;
  status: string;
  status_message?: string;
  status_ts?: string;
  expires_ts?: string;
  meters: UtilityAPIMeter[];
}

export interface UtilityAPIMeter {
  uid: string;
  created: string;
  updated: string;
  authorization: string;
  utility_meter_number: string;
  utility_service_address: string;
  is_activated: boolean;
  status: string;
  bills?: UtilityAPIBill[];
  intervals?: UtilityAPIInterval[];
}

export interface UtilityAPIBill {
  uid: string;
  created: string;
  updated: string;
  meter_uid: string;
  utility: string;
  utility_service_id: string;
  utility_billing_account: string;
  utility_service_address: string;
  utility_meter_number: string;
  utility_tariff_name: string;
  bill_start_date: string;
  bill_end_date: string;
  bill_days: number;
  bill_statement_date: string;
  bill_total_kWh?: number;
  bill_total_unit?: string;
  bill_total_volume?: number;
  bill_total_cost: number;
  source: string;
  download_url?: string;
  line_items?: Array<{
    name: string;
    rate?: number;
    unit?: string;
    volume?: number;
    total: number;
  }>;
}

export interface UtilityAPIInterval {
  meter_uid: string;
  utility: string;
  utility_service_id: string;
  utility_service_address: string;
  utility_meter_number: string;
  utility_tariff_name?: string;
  interval_start: string;
  interval_end: string;
  interval_kWh?: number;
  interval_kW?: number;
  interval_unit?: string;
  interval_volume?: number;
  source: string;
}

export class UtilityAPIConnector implements UtilityConnector {
  private config: UtilityAPIConfig;
  private baseUrl: string;

  constructor(config: UtilityAPIConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'sandbox'
      ? 'https://utilityapi.com/api/v2/sandbox'
      : 'https://utilityapi.com/api/v2';
  }

  /**
   * Create authorization form for customer
   */
  async createAuthorizationForm(
    utility: string,
    customerEmail?: string,
    accountNumber?: string
  ): Promise<UtilityAPIForm> {
    const response = await fetch(`${this.baseUrl}/forms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        utility,
        template: 'default',
        customer_email: customerEmail,
        utility_account_number: accountNumber,
        webhook_url: this.config.webhookUrl
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new UtilityAPIError(
        error.message || 'Failed to create form',
        error.code || 'FORM_CREATE_ERROR',
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Get authorization status
   */
  async getAuthorization(authorizationUid: string): Promise<UtilityAPIAuthorization> {
    const response = await fetch(`${this.baseUrl}/authorizations/${authorizationUid}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new UtilityAPIError(
        'Failed to get authorization',
        'AUTH_FETCH_ERROR',
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Fetch usage data from UtilityAPI
   */
  async fetchUsageData(
    accessToken: string, // This is the authorization UID for UtilityAPI
    startDate: Date,
    endDate: Date
  ): Promise<UsageData[]> {
    try {
      // Get meters for this authorization
      const auth = await this.getAuthorization(accessToken);
      const usageData: UsageData[] = [];

      for (const meter of auth.meters) {
        if (!meter.is_activated || meter.status !== 'active') continue;

        // Fetch interval data for the meter
        const intervals = await this.fetchMeterIntervals(
          meter.uid,
          startDate,
          endDate
        );

        // Convert to standard format
        for (const interval of intervals) {
          if (interval.interval_kWh !== undefined) {
            usageData.push({
              timestamp: new Date(interval.interval_start),
              usage: interval.interval_kWh,
              unit: 'kWh',
              quality: 'validated',
              intervalDuration: this.calculateIntervalDuration(
                interval.interval_start,
                interval.interval_end
              ),
              demand: interval.interval_kW,
              demandUnit: interval.interval_kW ? 'kW' : undefined
            });
          }
        }
      }

      return usageData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    } catch (error) {
      logger.error('api', 'Error fetching UtilityAPI usage data:', error );
      throw error;
    }
  }

  /**
   * Fetch billing data from UtilityAPI
   */
  async fetchBillingData(
    accessToken: string, // Authorization UID
    startDate: Date,
    endDate: Date
  ): Promise<BillingData[]> {
    try {
      const auth = await this.getAuthorization(accessToken);
      const billingData: BillingData[] = [];

      for (const meter of auth.meters) {
        if (!meter.is_activated || meter.status !== 'active') continue;

        // Fetch bills for the meter
        const bills = await this.fetchMeterBills(meter.uid, startDate, endDate);

        // Convert to standard format
        for (const bill of bills) {
          const billData: BillingData = {
            billDate: new Date(bill.bill_statement_date),
            startDate: new Date(bill.bill_start_date),
            endDate: new Date(bill.bill_end_date),
            totalAmount: bill.bill_total_cost,
            usage: bill.bill_total_kWh || 0,
            usageUnit: bill.bill_total_unit || 'kWh',
            energyCharges: 0,
            demandCharges: 0,
            otherCharges: 0,
            taxes: 0,
            accountNumber: bill.utility_billing_account,
            meterNumber: bill.utility_meter_number,
            rateSchedule: bill.utility_tariff_name,
            pdf: bill.download_url
          };

          // Parse line items if available
          if (bill.line_items) {
            for (const item of bill.line_items) {
              const itemName = item.name.toLowerCase();
              
              if (itemName.includes('energy') || itemName.includes('usage')) {
                billData.energyCharges += item.total;
              } else if (itemName.includes('demand')) {
                billData.demandCharges += item.total;
              } else if (itemName.includes('tax')) {
                billData.taxes += item.total;
              } else {
                billData.otherCharges += item.total;
              }
            }
          }

          billingData.push(billData);
        }
      }

      return billingData.sort((a, b) => a.billDate.getTime() - b.billDate.getTime());

    } catch (error) {
      logger.error('api', 'Error fetching UtilityAPI billing data:', error );
      throw error;
    }
  }

  /**
   * Fetch interval data for a specific meter
   */
  private async fetchMeterIntervals(
    meterUid: string,
    startDate: Date,
    endDate: Date
  ): Promise<UtilityAPIInterval[]> {
    const params = new URLSearchParams({
      meters: meterUid,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    const response = await fetch(`${this.baseUrl}/intervals?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new UtilityAPIError(
        'Failed to fetch intervals',
        'INTERVALS_FETCH_ERROR',
        response.status
      );
    }

    const data = await response.json();
    return data.intervals || [];
  }

  /**
   * Fetch bills for a specific meter
   */
  private async fetchMeterBills(
    meterUid: string,
    startDate: Date,
    endDate: Date
  ): Promise<UtilityAPIBill[]> {
    const params = new URLSearchParams({
      meters: meterUid,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    const response = await fetch(`${this.baseUrl}/bills?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new UtilityAPIError(
        'Failed to fetch bills',
        'BILLS_FETCH_ERROR',
        response.status
      );
    }

    const data = await response.json();
    return data.bills || [];
  }

  /**
   * List supported utilities
   */
  async listSupportedUtilities(): Promise<Array<{ id: string; name: string; type: string }>> {
    const response = await fetch(`${this.baseUrl}/utilities`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch utilities list');
    }

    const data = await response.json();
    return data.utilities || [];
  }

  /**
   * Delete authorization (customer disconnect)
   */
  async deleteAuthorization(authorizationUid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/authorizations/${authorizationUid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new UtilityAPIError(
        'Failed to delete authorization',
        'AUTH_DELETE_ERROR',
        response.status
      );
    }
  }

  /**
   * Download bill PDF
   */
  async downloadBillPDF(billUid: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/bills/${billUid}/pdf`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
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
   * Calculate interval duration in seconds
   */
  private calculateIntervalDuration(start: string, end: string): number {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return (endTime - startTime) / 1000;
  }

  /**
   * Webhook handler for UtilityAPI events
   */
  async handleWebhook(payload: any): Promise<void> {
    const { type, data } = payload;

    switch (type) {
      case 'authorization_created':
        logger.info('api', 'New authorization created:', { data: data.uid });
        break;
      
      case 'authorization_updated':
        logger.info('api', 'Authorization updated:', { data: { uid: data.uid, status: data.status } });
        break;
      
      case 'meter_activated':
        logger.info('api', 'Meter activated:', { data: data.uid });
        break;
      
      case 'bills_added':
        logger.info('api', 'New bills added for meter:', { data: data.meter_uid });
        break;
      
      case 'intervals_added':
        logger.info('api', 'New intervals added for meter:', { data: data.meter_uid });
        break;
      
      default:
        logger.info('api', 'Unknown webhook event:', { data: type });
    }
  }
}

export default UtilityAPIConnector;