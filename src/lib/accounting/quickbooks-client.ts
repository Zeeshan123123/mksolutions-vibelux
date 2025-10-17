import { logger } from '@/lib/logging/production-logger';
import axios, { AxiosInstance } from 'axios';

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  realmId: string;
  environment: 'sandbox' | 'production';
}

export interface QBInvoice {
  Id?: string;
  DocNumber?: string;
  TxnDate: string;
  DueDate?: string;
  CustomerRef: {
    value: string;
  };
  Line: Array<{
    Amount: number;
    DetailType: 'SalesItemLineDetail';
    SalesItemLineDetail: {
      ItemRef: {
        value: string;
        name?: string;
      };
      Qty?: number;
      UnitPrice?: number;
    };
  }>;
  TotalAmt?: number;
  Balance?: number;
  EmailStatus?: string;
}

export interface QBCustomer {
  Id?: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  BillAddr?: {
    Line1?: string;
    City?: string;
    Country?: string;
    PostalCode?: string;
  };
}

export interface QBPayment {
  Id?: string;
  TxnDate: string;
  CustomerRef: {
    value: string;
  };
  TotalAmt: number;
  Line: Array<{
    Amount: number;
    LinkedTxn: Array<{
      TxnId: string;
      TxnType: 'Invoice';
    }>;
  }>;
  PaymentMethodRef?: {
    value: string;
  };
}

export class QuickBooksClient {
  private client: AxiosInstance;
  private config: QuickBooksConfig;
  private baseUrl: string;

  constructor(config: QuickBooksConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com';

    this.client = axios.create({
      baseURL: `${this.baseUrl}/v3/company/${config.realmId}`,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          await this.refreshAccessToken();
          error.config.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken
        }), {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.config.accessToken = response.data.access_token;
      this.config.refreshToken = response.data.refresh_token;
      
      logger.info('api', 'Access token refreshed successfully');
    } catch (error) {
      logger.error('api', 'Failed to refresh access token', error as Error);
      throw error;
    }
  }

  // Customer Operations
  async createCustomer(customer: QBCustomer): Promise<QBCustomer> {
    try {
      const response = await this.client.post('/customer', customer);
      return response.data.Customer;
    } catch (error) {
      logger.error('api', 'Failed to create customer', error as Error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<QBCustomer> {
    try {
      const response = await this.client.get(`/customer/${customerId}`);
      return response.data.Customer;
    } catch (error) {
      logger.error('api', 'Failed to get customer', error as Error);
      throw error;
    }
  }

  async queryCustomers(query?: string): Promise<QBCustomer[]> {
    try {
      const sql = query || "SELECT * FROM Customer MAXRESULTS 100";
      const response = await this.client.get('/query', { params: { query: sql } });
      return response.data.QueryResponse.Customer || [];
    } catch (error) {
      logger.error('api', 'Failed to query customers', error as Error);
      throw error;
    }
  }

  // Invoice Operations
  async createInvoice(invoice: QBInvoice): Promise<QBInvoice> {
    try {
      const response = await this.client.post('/invoice', invoice);
      return response.data.Invoice;
    } catch (error) {
      logger.error('api', 'Failed to create invoice', error as Error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<QBInvoice> {
    try {
      const response = await this.client.get(`/invoice/${invoiceId}`);
      return response.data.Invoice;
    } catch (error) {
      logger.error('api', 'Failed to get invoice', error as Error);
      throw error;
    }
  }

  async queryInvoices(query?: string): Promise<QBInvoice[]> {
    try {
      const sql = query || "SELECT * FROM Invoice WHERE Balance > '0' MAXRESULTS 100";
      const response = await this.client.get('/query', { params: { query: sql } });
      return response.data.QueryResponse.Invoice || [];
    } catch (error) {
      logger.error('api', 'Failed to query invoices', error as Error);
      throw error;
    }
  }

  async sendInvoice(invoiceId: string, email: string): Promise<void> {
    try {
      await this.client.post(`/invoice/${invoiceId}/send`, null, {
        params: { sendTo: email }
      });
      logger.info('api', 'Invoice sent successfully', { invoiceId, email });
    } catch (error) {
      logger.error('api', 'Failed to send invoice', error as Error);
      throw error;
    }
  }

  // Payment Operations
  async createPayment(payment: QBPayment): Promise<QBPayment> {
    try {
      const response = await this.client.post('/payment', payment);
      return response.data.Payment;
    } catch (error) {
      logger.error('api', 'Failed to create payment', error as Error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<QBPayment> {
    try {
      const response = await this.client.get(`/payment/${paymentId}`);
      return response.data.Payment;
    } catch (error) {
      logger.error('api', 'Failed to get payment', error as Error);
      throw error;
    }
  }

  async queryPayments(query?: string): Promise<QBPayment[]> {
    try {
      const sql = query || "SELECT * FROM Payment MAXRESULTS 100";
      const response = await this.client.get('/query', { params: { query: sql } });
      return response.data.QueryResponse.Payment || [];
    } catch (error) {
      logger.error('api', 'Failed to query payments', error as Error);
      throw error;
    }
  }

  // Item/Product Operations
  async createItem(item: any): Promise<any> {
    try {
      const response = await this.client.post('/item', item);
      return response.data.Item;
    } catch (error) {
      logger.error('api', 'Failed to create item', error as Error);
      throw error;
    }
  }

  async queryItems(query?: string): Promise<any[]> {
    try {
      const sql = query || "SELECT * FROM Item WHERE Active = true MAXRESULTS 100";
      const response = await this.client.get('/query', { params: { query: sql } });
      return response.data.QueryResponse.Item || [];
    } catch (error) {
      logger.error('api', 'Failed to query items', error as Error);
      throw error;
    }
  }

  // Reports
  async getProfitAndLoss(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.client.get('/reports/ProfitAndLoss', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get profit and loss report', error as Error);
      throw error;
    }
  }

  async getBalanceSheet(asOfDate: string): Promise<any> {
    try {
      const response = await this.client.get('/reports/BalanceSheet', {
        params: {
          as_of_date: asOfDate
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get balance sheet', error as Error);
      throw error;
    }
  }

  // Company Info
  async getCompanyInfo(): Promise<any> {
    try {
      const response = await this.client.get('/companyinfo/1');
      return response.data.CompanyInfo;
    } catch (error) {
      logger.error('api', 'Failed to get company info', error as Error);
      throw error;
    }
  }
}