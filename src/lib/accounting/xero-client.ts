import { logger } from '@/lib/logging/production-logger';
import axios, { AxiosInstance } from 'axios';

export interface XeroConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  tenantId: string;
}

export interface XeroInvoice {
  InvoiceID?: string;
  InvoiceNumber?: string;
  Type: 'ACCREC' | 'ACCPAY';
  Contact: {
    ContactID?: string;
    Name?: string;
  };
  Date: string;
  DueDate?: string;
  LineItems: Array<{
    Description: string;
    Quantity: number;
    UnitAmount: number;
    AccountCode?: string;
    TaxType?: string;
    LineAmount?: number;
  }>;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  Total?: number;
  AmountDue?: number;
}

export interface XeroContact {
  ContactID?: string;
  Name: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  ContactPersons?: Array<{
    FirstName?: string;
    LastName?: string;
    EmailAddress?: string;
    IncludeInEmails?: boolean;
  }>;
  BankAccountDetails?: string;
  Addresses?: Array<{
    AddressType?: 'STREET' | 'POSTAL';
    AddressLine1?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  }>;
  Phones?: Array<{
    PhoneType?: 'DEFAULT' | 'DDI' | 'MOBILE' | 'FAX';
    PhoneNumber?: string;
  }>;
  IsSupplier?: boolean;
  IsCustomer?: boolean;
}

export interface XeroPayment {
  PaymentID?: string;
  Invoice: {
    InvoiceID: string;
  };
  Account: {
    AccountID: string;
  };
  Date: string;
  Amount: number;
  Reference?: string;
  IsReconciled?: boolean;
}

export interface XeroItem {
  ItemID?: string;
  Code: string;
  Name: string;
  Description?: string;
  PurchaseDetails?: {
    UnitPrice?: number;
    AccountCode?: string;
    TaxType?: string;
  };
  SalesDetails?: {
    UnitPrice?: number;
    AccountCode?: string;
    TaxType?: string;
  };
  IsTrackedAsInventory?: boolean;
  InventoryAssetAccountCode?: string;
  IsSold?: boolean;
  IsPurchased?: boolean;
}

export class XeroClient {
  private client: AxiosInstance;
  private config: XeroConfig;

  constructor(config: XeroConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: 'https://api.xero.com/api.xro/2.0',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'xero-tenant-id': config.tenantId,
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
      const response = await axios.post('https://identity.xero.com/connect/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        }), {
          headers: {
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

  // Contact Operations
  async createContact(contact: XeroContact): Promise<XeroContact> {
    try {
      const response = await this.client.post('/Contacts', { Contacts: [contact] });
      return response.data.Contacts[0];
    } catch (error) {
      logger.error('api', 'Failed to create contact', error as Error);
      throw error;
    }
  }

  async getContact(contactId: string): Promise<XeroContact> {
    try {
      const response = await this.client.get(`/Contacts/${contactId}`);
      return response.data.Contacts[0];
    } catch (error) {
      logger.error('api', 'Failed to get contact', error as Error);
      throw error;
    }
  }

  async getContacts(params?: { 
    where?: string; 
    order?: string; 
    page?: number; 
    includeArchived?: boolean 
  }): Promise<XeroContact[]> {
    try {
      const response = await this.client.get('/Contacts', { params });
      return response.data.Contacts || [];
    } catch (error) {
      logger.error('api', 'Failed to get contacts', error as Error);
      throw error;
    }
  }

  // Invoice Operations
  async createInvoice(invoice: XeroInvoice): Promise<XeroInvoice> {
    try {
      const response = await this.client.post('/Invoices', { Invoices: [invoice] });
      return response.data.Invoices[0];
    } catch (error) {
      logger.error('api', 'Failed to create invoice', error as Error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<XeroInvoice> {
    try {
      const response = await this.client.get(`/Invoices/${invoiceId}`);
      return response.data.Invoices[0];
    } catch (error) {
      logger.error('api', 'Failed to get invoice', error as Error);
      throw error;
    }
  }

  async getInvoices(params?: {
    where?: string;
    order?: string;
    page?: number;
    includeArchived?: boolean;
    summaryOnly?: boolean;
  }): Promise<XeroInvoice[]> {
    try {
      const response = await this.client.get('/Invoices', { params });
      return response.data.Invoices || [];
    } catch (error) {
      logger.error('api', 'Failed to get invoices', error as Error);
      throw error;
    }
  }

  async emailInvoice(invoiceId: string): Promise<void> {
    try {
      await this.client.post(`/Invoices/${invoiceId}/Email`, {});
      logger.info('api', 'Invoice emailed successfully', { invoiceId });
    } catch (error) {
      logger.error('api', 'Failed to email invoice', error as Error);
      throw error;
    }
  }

  // Payment Operations
  async createPayment(payment: XeroPayment): Promise<XeroPayment> {
    try {
      const response = await this.client.post('/Payments', { Payments: [payment] });
      return response.data.Payments[0];
    } catch (error) {
      logger.error('api', 'Failed to create payment', error as Error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<XeroPayment> {
    try {
      const response = await this.client.get(`/Payments/${paymentId}`);
      return response.data.Payments[0];
    } catch (error) {
      logger.error('api', 'Failed to get payment', error as Error);
      throw error;
    }
  }

  async getPayments(params?: {
    where?: string;
    order?: string;
    page?: number;
  }): Promise<XeroPayment[]> {
    try {
      const response = await this.client.get('/Payments', { params });
      return response.data.Payments || [];
    } catch (error) {
      logger.error('api', 'Failed to get payments', error as Error);
      throw error;
    }
  }

  // Item Operations
  async createItem(item: XeroItem): Promise<XeroItem> {
    try {
      const response = await this.client.post('/Items', { Items: [item] });
      return response.data.Items[0];
    } catch (error) {
      logger.error('api', 'Failed to create item', error as Error);
      throw error;
    }
  }

  async getItem(itemId: string): Promise<XeroItem> {
    try {
      const response = await this.client.get(`/Items/${itemId}`);
      return response.data.Items[0];
    } catch (error) {
      logger.error('api', 'Failed to get item', error as Error);
      throw error;
    }
  }

  async getItems(params?: {
    where?: string;
    order?: string;
    unitdp?: number;
  }): Promise<XeroItem[]> {
    try {
      const response = await this.client.get('/Items', { params });
      return response.data.Items || [];
    } catch (error) {
      logger.error('api', 'Failed to get items', error as Error);
      throw error;
    }
  }

  // Reports
  async getProfitAndLoss(params: {
    fromDate?: string;
    toDate?: string;
    periods?: number;
    timeframe?: 'MONTH' | 'QUARTER' | 'YEAR';
    trackingCategoryID?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get('/Reports/ProfitAndLoss', { params });
      return response.data.Reports[0];
    } catch (error) {
      logger.error('api', 'Failed to get profit and loss report', error as Error);
      throw error;
    }
  }

  async getBalanceSheet(params: {
    date?: string;
    periods?: number;
    timeframe?: 'MONTH' | 'QUARTER' | 'YEAR';
  }): Promise<any> {
    try {
      const response = await this.client.get('/Reports/BalanceSheet', { params });
      return response.data.Reports[0];
    } catch (error) {
      logger.error('api', 'Failed to get balance sheet', error as Error);
      throw error;
    }
  }

  // Organisation Info
  async getOrganisation(): Promise<any> {
    try {
      const response = await this.client.get('/Organisation');
      return response.data.Organisations[0];
    } catch (error) {
      logger.error('api', 'Failed to get organisation info', error as Error);
      throw error;
    }
  }

  // Bank Transactions
  async getBankTransactions(params?: {
    where?: string;
    order?: string;
    page?: number;
    unitdp?: number;
  }): Promise<any[]> {
    try {
      const response = await this.client.get('/BankTransactions', { params });
      return response.data.BankTransactions || [];
    } catch (error) {
      logger.error('api', 'Failed to get bank transactions', error as Error);
      throw error;
    }
  }

  // Accounts
  async getAccounts(params?: {
    where?: string;
    order?: string;
  }): Promise<any[]> {
    try {
      const response = await this.client.get('/Accounts', { params });
      return response.data.Accounts || [];
    } catch (error) {
      logger.error('api', 'Failed to get accounts', error as Error);
      throw error;
    }
  }
}