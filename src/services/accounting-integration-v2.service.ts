/**
 * Accounting Integration Service V2
 * Actual implementation with QuickBooks Online and Xero APIs
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';
import { QuickBooksClient, QBInvoice, QBCustomer, QBPayment } from '@/lib/accounting/quickbooks-client';
import { XeroClient, XeroInvoice, XeroContact, XeroPayment } from '@/lib/accounting/xero-client';
import { AccountingIntegrationConfig, Invoice, Payment, Customer, SyncResult } from './accounting-integration.service';

export class AccountingIntegrationServiceV2 {
  private readonly cachePrefix = 'accounting:v2:';
  private readonly cacheTTL = 3600; // 1 hour
  private quickbooksClient?: QuickBooksClient;
  private xeroClient?: XeroClient;

  /**
   * Initialize accounting integration with actual API clients
   */
  async initializeIntegration(config: AccountingIntegrationConfig): Promise<boolean> {
    try {
      logger.info('api', `Initializing ${config.provider} integration for facility ${config.facilityId}`);

      // Initialize the appropriate client
      if (config.provider === 'quickbooks') {
        this.quickbooksClient = new QuickBooksClient({
          clientId: config.credentials.clientId,
          clientSecret: config.credentials.clientSecret,
          accessToken: config.credentials.accessToken,
          refreshToken: config.credentials.refreshToken,
          realmId: config.credentials.realmId!,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        // Test connection by getting company info
        const companyInfo = await this.quickbooksClient.getCompanyInfo();
        logger.info('api', 'QuickBooks connected to company:', { 
          companyName: companyInfo.CompanyName 
        });
      } else if (config.provider === 'xero') {
        this.xeroClient = new XeroClient({
          clientId: config.credentials.clientId,
          clientSecret: config.credentials.clientSecret,
          accessToken: config.credentials.accessToken,
          refreshToken: config.credentials.refreshToken,
          tenantId: config.credentials.tenantId!
        });

        // Test connection by getting organisation info
        const org = await this.xeroClient.getOrganisation();
        logger.info('api', 'Xero connected to organisation:', { 
          orgName: org.Name 
        });
      }

      // Store configuration
      await this.storeConfiguration(config);

      logger.info('api', `${config.provider} integration initialized successfully`);
      return true;

    } catch (error) {
      logger.error('api', 'Failed to initialize accounting integration:', error);
      return false;
    }
  }

  /**
   * Create invoice in accounting system
   */
  async createInvoice(facilityId: string, invoice: Omit<Invoice, 'id'>): Promise<string> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error('Accounting integration not configured');
      }

      let invoiceId: string;

      if (config.provider === 'quickbooks' && this.quickbooksClient) {
        // First, ensure customer exists
        const customerId = await this.ensureQuickBooksCustomer(invoice.customerId);

        const qbInvoice: QBInvoice = {
          TxnDate: invoice.date.toISOString().split('T')[0],
          DueDate: invoice.dueDate?.toISOString().split('T')[0],
          CustomerRef: {
            value: customerId
          },
          Line: invoice.items.map(item => ({
            Amount: item.quantity * item.unitPrice,
            DetailType: 'SalesItemLineDetail' as const,
            SalesItemLineDetail: {
              ItemRef: {
                value: item.productId || '1', // Default to generic item
                name: item.description
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            }
          }))
        };

        const createdInvoice = await this.quickbooksClient.createInvoice(qbInvoice);
        invoiceId = createdInvoice.Id!;

        // Send invoice email if requested
        if (invoice.sendEmail && invoice.customerEmail) {
          await this.quickbooksClient.sendInvoice(invoiceId, invoice.customerEmail);
        }

      } else if (config.provider === 'xero' && this.xeroClient) {
        // Ensure customer exists in Xero
        const contact = await this.ensureXeroContact(invoice.customerId);

        const xeroInvoice: XeroInvoice = {
          Type: 'ACCREC',
          Contact: {
            ContactID: contact.ContactID
          },
          Date: invoice.date.toISOString().split('T')[0],
          DueDate: invoice.dueDate?.toISOString().split('T')[0],
          LineItems: invoice.items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitAmount: item.unitPrice,
            AccountCode: '200', // Default sales account
            TaxType: item.taxRate ? 'OUTPUT' : 'NONE'
          })),
          Status: 'AUTHORISED'
        };

        const createdInvoice = await this.xeroClient.createInvoice(xeroInvoice);
        invoiceId = createdInvoice.InvoiceID!;

        // Send invoice email if requested
        if (invoice.sendEmail) {
          await this.xeroClient.emailInvoice(invoiceId);
        }
      } else {
        throw new Error('Accounting client not initialized');
      }

      logger.info('api', 'Invoice created successfully', { invoiceId, provider: config.provider });
      return invoiceId;

    } catch (error) {
      logger.error('api', 'Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Record payment in accounting system
   */
  async recordPayment(facilityId: string, payment: Omit<Payment, 'id'>): Promise<string> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error('Accounting integration not configured');
      }

      let paymentId: string;

      if (config.provider === 'quickbooks' && this.quickbooksClient) {
        // Get invoice details
        const invoice = await this.quickbooksClient.getInvoice(payment.invoiceId);
        
        const qbPayment: QBPayment = {
          TxnDate: payment.date.toISOString().split('T')[0],
          CustomerRef: {
            value: invoice.CustomerRef.value
          },
          TotalAmt: payment.amount,
          Line: [{
            Amount: payment.amount,
            LinkedTxn: [{
              TxnId: payment.invoiceId,
              TxnType: 'Invoice'
            }]
          }]
        };

        const createdPayment = await this.quickbooksClient.createPayment(qbPayment);
        paymentId = createdPayment.Id!;

      } else if (config.provider === 'xero' && this.xeroClient) {
        // Get default bank account
        const accounts = await this.xeroClient.getAccounts({ where: 'Type=="BANK"' });
        const bankAccount = accounts[0];

        const xeroPayment: XeroPayment = {
          Invoice: {
            InvoiceID: payment.invoiceId
          },
          Account: {
            AccountID: bankAccount.AccountID
          },
          Date: payment.date.toISOString().split('T')[0],
          Amount: payment.amount,
          Reference: payment.reference
        };

        const createdPayment = await this.xeroClient.createPayment(xeroPayment);
        paymentId = createdPayment.PaymentID!;
      } else {
        throw new Error('Accounting client not initialized');
      }

      logger.info('api', 'Payment recorded successfully', { paymentId, provider: config.provider });
      return paymentId;

    } catch (error) {
      logger.error('api', 'Failed to record payment:', error);
      throw error;
    }
  }

  /**
   * Sync invoices from accounting system
   */
  async syncInvoices(facilityId: string): Promise<Invoice[]> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error('Accounting integration not configured');
      }

      const invoices: Invoice[] = [];

      if (config.provider === 'quickbooks' && this.quickbooksClient) {
        const qbInvoices = await this.quickbooksClient.queryInvoices();
        
        for (const qbInvoice of qbInvoices) {
          invoices.push({
            id: qbInvoice.Id!,
            number: qbInvoice.DocNumber || `INV-${qbInvoice.Id}`,
            customerId: qbInvoice.CustomerRef.value,
            date: new Date(qbInvoice.TxnDate),
            dueDate: qbInvoice.DueDate ? new Date(qbInvoice.DueDate) : undefined,
            items: qbInvoice.Line.filter(line => line.DetailType === 'SalesItemLineDetail').map(line => ({
              description: line.SalesItemLineDetail.ItemRef.name || 'Item',
              quantity: line.SalesItemLineDetail.Qty || 1,
              unitPrice: line.SalesItemLineDetail.UnitPrice || line.Amount,
              amount: line.Amount
            })),
            subtotal: qbInvoice.TotalAmt || 0,
            total: qbInvoice.TotalAmt || 0,
            status: qbInvoice.Balance === 0 ? 'paid' : 'sent',
            paymentStatus: qbInvoice.Balance === 0 ? 'paid' : 'pending'
          });
        }

      } else if (config.provider === 'xero' && this.xeroClient) {
        const xeroInvoices = await this.xeroClient.getInvoices({ where: 'Type=="ACCREC"' });
        
        for (const xeroInvoice of xeroInvoices) {
          invoices.push({
            id: xeroInvoice.InvoiceID!,
            number: xeroInvoice.InvoiceNumber || `INV-${xeroInvoice.InvoiceID}`,
            customerId: xeroInvoice.Contact.ContactID!,
            date: new Date(xeroInvoice.Date),
            dueDate: xeroInvoice.DueDate ? new Date(xeroInvoice.DueDate) : undefined,
            items: xeroInvoice.LineItems.map(line => ({
              description: line.Description,
              quantity: line.Quantity,
              unitPrice: line.UnitAmount,
              amount: line.LineAmount || line.Quantity * line.UnitAmount
            })),
            subtotal: xeroInvoice.Total || 0,
            total: xeroInvoice.Total || 0,
            status: xeroInvoice.Status === 'PAID' ? 'paid' : 'sent',
            paymentStatus: xeroInvoice.AmountDue === 0 ? 'paid' : 'pending'
          });
        }
      }

      logger.info('api', `Synced ${invoices.length} invoices from ${config.provider}`);
      return invoices;

    } catch (error) {
      logger.error('api', 'Failed to sync invoices:', error);
      throw error;
    }
  }

  /**
   * Sync payments from accounting system (minimal for persistence)
   */
  async syncPayments(facilityId: string): Promise<Payment[]> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error('Accounting integration not configured');
      }

      const payments: Payment[] = [];

      if (config.provider === 'quickbooks' && this.quickbooksClient) {
        const qbPayments = await this.quickbooksClient.queryPayments();
        for (const p of qbPayments) {
          payments.push({
            id: p.Id!,
            invoiceId: (p.Line?.[0]?.LinkedTxn?.[0]?.TxnId) || '',
            amount: p.TotalAmt || 0,
            date: new Date(p.TxnDate),
            method: 'other',
            reference: undefined,
            notes: undefined
          });
        }
      } else if (config.provider === 'xero' && this.xeroClient) {
        const xeroPayments = await this.xeroClient.getPayments({});
        for (const p of xeroPayments) {
          payments.push({
            id: p.PaymentID!,
            invoiceId: p.Invoice?.InvoiceID || '',
            amount: p.Amount || 0,
            date: new Date(p.Date),
            method: 'other',
            reference: p.Reference,
            notes: undefined
          });
        }
      }

      logger.info('api', `Synced ${payments.length} payments from ${config.provider}`);
      return payments;
    } catch (error) {
      logger.error('api', 'Failed to sync payments:', error);
      throw error;
    }
  }

  /**
   * Get financial reports
   */
  async getFinancialReports(facilityId: string, reportType: 'profit_loss' | 'balance_sheet', params: any): Promise<any> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error('Accounting integration not configured');
      }

      if (config.provider === 'quickbooks' && this.quickbooksClient) {
        if (reportType === 'profit_loss') {
          return await this.quickbooksClient.getProfitAndLoss(params.startDate, params.endDate);
        } else {
          return await this.quickbooksClient.getBalanceSheet(params.asOfDate);
        }
      } else if (config.provider === 'xero' && this.xeroClient) {
        if (reportType === 'profit_loss') {
          return await this.xeroClient.getProfitAndLoss(params);
        } else {
          return await this.xeroClient.getBalanceSheet(params);
        }
      }

      throw new Error('Accounting client not initialized');

    } catch (error) {
      logger.error('api', 'Failed to get financial reports:', error);
      throw error;
    }
  }

  // Helper methods

  private async ensureQuickBooksCustomer(customerId: string): Promise<string> {
    try {
      // Check if customer exists
      const customers = await this.quickbooksClient!.queryCustomers(`SELECT * FROM Customer WHERE DisplayName = '${customerId}'`);
      
      if (customers.length > 0) {
        return customers[0].Id!;
      }

      // Create new customer
      const newCustomer = await this.quickbooksClient!.createCustomer({
        DisplayName: customerId,
        CompanyName: customerId
      });

      return newCustomer.Id!;
    } catch (error) {
      logger.error('api', 'Failed to ensure QuickBooks customer:', error);
      throw error;
    }
  }

  private async ensureXeroContact(customerId: string): Promise<XeroContact> {
    try {
      // Check if contact exists
      const contacts = await this.xeroClient!.getContacts({ where: `Name="${customerId}"` });
      
      if (contacts.length > 0) {
        return contacts[0];
      }

      // Create new contact
      return await this.xeroClient!.createContact({
        Name: customerId,
        IsCustomer: true
      });
    } catch (error) {
      logger.error('api', 'Failed to ensure Xero contact:', error);
      throw error;
    }
  }

  private async storeConfiguration(config: AccountingIntegrationConfig): Promise<void> {
    const key = `${this.cachePrefix}config:${config.facilityId}`;
    await redis.setex(key, this.cacheTTL * 24, JSON.stringify(config)); // Store for 24 hours
  }

  private async getConfiguration(facilityId: string): Promise<AccountingIntegrationConfig | null> {
    const key = `${this.cachePrefix}config:${facilityId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }
}