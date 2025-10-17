/**
 * Third-Party Integrations Manager
 * Handles all external system integrations including ERP, accounting, payment processing, etc.
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type IntegrationType = 'erp' | 'accounting' | 'payment' | 'crm' | 'shipping' | 'inventory' | 'analytics' | 'marketing' | 'communication';
export type IntegrationStatus = 'active' | 'inactive' | 'pending' | 'error' | 'suspended';
export type SyncStatus = 'synced' | 'pending' | 'failed' | 'partial';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  
  // Configuration
  apiUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  
  // Settings
  syncInterval: number; // minutes
  lastSync: Date;
  nextSync: Date;
  
  // Mapping Configuration
  fieldMappings: Record<string, any>;
  webhookUrl?: string;
  
  // Metadata
  version: string;
  documentation?: string;
  supportContact?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
  errorCount: number;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  type: 'import' | 'export' | 'sync';
  entity: string;
  status: SyncStatus;
  
  // Data
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Error Handling
  errors: Array<{
    record: string;
    message: string;
    code?: string;
  }>;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPIntegration {
  // Common ERP systems: SAP, Oracle, Microsoft Dynamics, NetSuite
  customers: any[];
  vendors: any[];
  products: any[];
  orders: any[];
  inventory: any[];
  financials: any[];
}

export interface AccountingIntegration {
  // QuickBooks, Xero, Sage, etc.
  chartOfAccounts: any[];
  transactions: any[];
  invoices: any[];
  bills: any[];
  payments: any[];
  reports: any[];
}

export interface PaymentIntegration {
  // Stripe, PayPal, Square, etc.
  customers: any[];
  payments: any[];
  subscriptions: any[];
  invoices: any[];
  disputes: any[];
  payouts: any[];
}

class ThirdPartyIntegrationManager extends EventEmitter {
  private facilityId: string;
  private userId: string;
  private integrations: Map<string, Integration> = new Map();

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
    this.loadIntegrations();
  }

  /**
   * Add new integration
   */
  async addIntegration(integrationData: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration> {
    try {
      const integration: Integration = {
        id: this.generateIntegrationId(),
        ...integrationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveIntegration(integration);
      this.integrations.set(integration.id, integration);

      // Test connection
      await this.testConnection(integration.id);

      // Start sync schedule
      this.scheduleSync(integration.id);

      this.emit('integration-added', integration);
      logger.info('api', `Added integration: ${integration.name}`);
      
      return integration;
    } catch (error) {
      logger.error('api', 'Failed to add integration:', error );
      throw error;
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) throw new Error('Integration not found');

      switch (integration.type) {
        case 'erp':
          return await this.testERPConnection(integration);
        case 'accounting':
          return await this.testAccountingConnection(integration);
        case 'payment':
          return await this.testPaymentConnection(integration);
        default:
          return await this.testGenericConnection(integration);
      }
    } catch (error) {
      logger.error('api', 'Connection test failed:', error );
      return { success: false, message: error.message };
    }
  }

  /**
   * Sync data with integration
   */
  async syncIntegration(integrationId: string, entity?: string): Promise<SyncJob> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) throw new Error('Integration not found');

      const syncJob: SyncJob = {
        id: this.generateSyncJobId(),
        integrationId,
        type: 'sync',
        entity: entity || 'all',
        status: 'pending',
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsError: 0,
        startTime: new Date(),
        errors: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSyncJob(syncJob);

      // Perform sync based on integration type
      switch (integration.type) {
        case 'erp':
          await this.syncERP(integration, syncJob);
          break;
        case 'accounting':
          await this.syncAccounting(integration, syncJob);
          break;
        case 'payment':
          await this.syncPayment(integration, syncJob);
          break;
        case 'crm':
          await this.syncCRM(integration, syncJob);
          break;
        case 'inventory':
          await this.syncInventory(integration, syncJob);
          break;
        default:
          await this.syncGeneric(integration, syncJob);
      }

      syncJob.endTime = new Date();
      syncJob.duration = syncJob.endTime.getTime() - syncJob.startTime.getTime();
      syncJob.status = syncJob.recordsError > 0 ? 'partial' : 'synced';
      
      await this.saveSyncJob(syncJob);

      // Update integration last sync
      integration.lastSync = new Date();
      integration.nextSync = new Date(Date.now() + integration.syncInterval * 60 * 1000);
      await this.saveIntegration(integration);

      this.emit('sync-completed', syncJob);
      logger.info('api', `Sync completed: ${syncJob.id}`);
      
      return syncJob;
    } catch (error) {
      logger.error('api', 'Sync failed:', error );
      throw error;
    }
  }

  /**
   * QuickBooks Integration
   */
  async setupQuickBooksIntegration(config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'QuickBooks Online',
      type: 'accounting',
      status: 'pending',
      apiUrl: 'https://quickbooks-api.intuit.com',
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      syncInterval: 60,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 60 * 60 * 1000),
      fieldMappings: {
        customer: {
          name: 'Name',
          email: 'PrimaryEmailAddr.Address',
          phone: 'PrimaryPhone.FreeFormNumber'
        },
        invoice: {
          number: 'DocNumber',
          date: 'TxnDate',
          total: 'TotalAmt'
        }
      },
      version: '3.0',
      documentation: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Xero Integration
   */
  async setupXeroIntegration(config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'Xero',
      type: 'accounting',
      status: 'pending',
      apiUrl: 'https://api.xero.com',
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      syncInterval: 60,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 60 * 60 * 1000),
      fieldMappings: {
        contact: {
          name: 'Name',
          email: 'EmailAddress',
          phone: 'Phones[0].PhoneNumber'
        },
        invoice: {
          number: 'InvoiceNumber',
          date: 'Date',
          total: 'Total'
        }
      },
      version: '2.0',
      documentation: 'https://developer.xero.com/documentation/api/accounting/overview',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Stripe Integration
   */
  async setupStripeIntegration(config: {
    secretKey: string;
    webhookSecret: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'Stripe',
      type: 'payment',
      status: 'pending',
      apiUrl: 'https://api.stripe.com',
      apiKey: config.secretKey,
      syncInterval: 15,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 15 * 60 * 1000),
      fieldMappings: {
        customer: {
          name: 'name',
          email: 'email',
          phone: 'phone'
        },
        payment: {
          id: 'id',
          amount: 'amount',
          currency: 'currency',
          status: 'status'
        }
      },
      webhookUrl: `/webhooks/stripe`,
      version: '2023-10-16',
      documentation: 'https://stripe.com/docs/api',
      errorCount: 0
    });

    return integration;
  }

  /**
   * NetSuite ERP Integration
   */
  async setupNetSuiteIntegration(config: {
    accountId: string;
    consumerKey: string;
    consumerSecret: string;
    tokenId: string;
    tokenSecret: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'NetSuite',
      type: 'erp',
      status: 'pending',
      apiUrl: `https://${config.accountId}.suitetalk.api.netsuite.com`,
      clientId: config.consumerKey,
      clientSecret: config.consumerSecret,
      syncInterval: 120,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 120 * 60 * 1000),
      fieldMappings: {
        customer: {
          name: 'companyName',
          email: 'email',
          phone: 'phone'
        },
        salesOrder: {
          number: 'tranId',
          date: 'tranDate',
          total: 'total'
        }
      },
      version: '2023.1',
      documentation: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1540391670.html',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Salesforce CRM Integration
   */
  async setupSalesforceIntegration(config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    domain: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'Salesforce',
      type: 'crm',
      status: 'pending',
      apiUrl: `https://${config.domain}.salesforce.com`,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      syncInterval: 30,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 30 * 60 * 1000),
      fieldMappings: {
        account: {
          name: 'Name',
          email: 'Email__c',
          phone: 'Phone'
        },
        opportunity: {
          name: 'Name',
          amount: 'Amount',
          stage: 'StageName'
        }
      },
      version: '58.0',
      documentation: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Mailchimp Marketing Integration
   */
  async setupMailchimpIntegration(config: {
    apiKey: string;
    serverPrefix: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'Mailchimp',
      type: 'marketing',
      status: 'pending',
      apiUrl: `https://${config.serverPrefix}.api.mailchimp.com/3.0`,
      apiKey: config.apiKey,
      syncInterval: 60,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 60 * 60 * 1000),
      fieldMappings: {
        member: {
          email: 'email_address',
          name: 'merge_fields.FNAME',
          status: 'status'
        },
        campaign: {
          title: 'settings.title',
          subject: 'settings.subject_line',
          status: 'status'
        }
      },
      version: '3.0',
      documentation: 'https://mailchimp.com/developer/marketing/api/',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Shopify Integration
   */
  async setupShopifyIntegration(config: {
    shop: string;
    accessToken: string;
  }): Promise<Integration> {
    const integration = await this.addIntegration({
      name: 'Shopify',
      type: 'erp',
      status: 'pending',
      apiUrl: `https://${config.shop}.myshopify.com/admin/api/2023-10`,
      accessToken: config.accessToken,
      syncInterval: 30,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 30 * 60 * 1000),
      fieldMappings: {
        customer: {
          name: 'first_name',
          email: 'email',
          phone: 'phone'
        },
        order: {
          number: 'order_number',
          date: 'created_at',
          total: 'total_price'
        },
        product: {
          title: 'title',
          sku: 'variants[0].sku',
          price: 'variants[0].price'
        }
      },
      version: '2023-10',
      documentation: 'https://shopify.dev/docs/api/admin-rest',
      errorCount: 0
    });

    return integration;
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(integrationId: string): Promise<{
    integration: Integration;
    health: 'healthy' | 'warning' | 'error';
    lastSync: Date;
    nextSync: Date;
    recentSyncJobs: SyncJob[];
    errors: string[];
  }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    const recentSyncJobs = await this.getRecentSyncJobs(integrationId, 5);
    const errors = recentSyncJobs.flatMap(job => job.errors.map(e => e.message));
    
    let health: 'healthy' | 'warning' | 'error' = 'healthy';
    if (integration.errorCount > 5) health = 'error';
    else if (integration.errorCount > 0) health = 'warning';

    return {
      integration,
      health,
      lastSync: integration.lastSync,
      nextSync: integration.nextSync,
      recentSyncJobs,
      errors
    };
  }

  /**
   * Get all integrations
   */
  async getAllIntegrations(): Promise<Integration[]> {
    return Array.from(this.integrations.values());
  }

  /**
   * Remove integration
   */
  async removeIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    // Cancel scheduled sync
    this.cancelSync(integrationId);

    // Remove from database
    await this.deleteIntegration(integrationId);

    // Remove from memory
    this.integrations.delete(integrationId);

    this.emit('integration-removed', integration);
    logger.info('api', `Removed integration: ${integration.name}`);
  }

  // Private methods for specific integrations

  private async testERPConnection(integration: Integration): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${integration.apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'ERP connection successful' };
      } else {
        return { success: false, message: `ERP connection failed: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: `ERP connection error: ${error.message}` };
    }
  }

  private async testAccountingConnection(integration: Integration): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${integration.apiUrl}/v3/company/companyinfo`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'Accounting connection successful' };
      } else {
        return { success: false, message: `Accounting connection failed: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: `Accounting connection error: ${error.message}` };
    }
  }

  private async testPaymentConnection(integration: Integration): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${integration.apiUrl}/v1/account`, {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'Payment connection successful' };
      } else {
        return { success: false, message: `Payment connection failed: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: `Payment connection error: ${error.message}` };
    }
  }

  private async testGenericConnection(integration: Integration): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(integration.apiUrl, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken || integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful' };
      } else {
        return { success: false, message: `Connection failed: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: `Connection error: ${error.message}` };
    }
  }

  private async syncERP(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement ERP-specific sync logic
    logger.info('api', `Syncing ERP: ${integration.name}`);
  }

  private async syncAccounting(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement accounting-specific sync logic
    logger.info('api', `Syncing Accounting: ${integration.name}`);
  }

  private async syncPayment(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement payment-specific sync logic
    logger.info('api', `Syncing Payment: ${integration.name}`);
  }

  private async syncCRM(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement CRM-specific sync logic
    logger.info('api', `Syncing CRM: ${integration.name}`);
  }

  private async syncInventory(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement inventory-specific sync logic
    logger.info('api', `Syncing Inventory: ${integration.name}`);
  }

  private async syncGeneric(integration: Integration, syncJob: SyncJob): Promise<void> {
    // Implement generic sync logic
    logger.info('api', `Syncing Generic: ${integration.name}`);
  }

  // Database operations
  private async loadIntegrations(): Promise<void> {
    try {
      const integrations = await prisma.integration.findMany({
        where: { facilityId: this.facilityId }
      });

      integrations.forEach(integration => {
        this.integrations.set(integration.id, integration);
        this.scheduleSync(integration.id);
      });
    } catch (error) {
      logger.error('api', 'Failed to load integrations:', error );
    }
  }

  private async saveIntegration(integration: Integration): Promise<void> {
    await prisma.integration.upsert({
      where: { id: integration.id },
      create: { ...integration, facilityId: this.facilityId },
      update: integration
    });
  }

  private async saveSyncJob(syncJob: SyncJob): Promise<void> {
    await prisma.syncJob.upsert({
      where: { id: syncJob.id },
      create: syncJob,
      update: syncJob
    });
  }

  private async deleteIntegration(integrationId: string): Promise<void> {
    await prisma.integration.delete({
      where: { id: integrationId }
    });
  }

  private async getRecentSyncJobs(integrationId: string, limit: number): Promise<SyncJob[]> {
    return await prisma.syncJob.findMany({
      where: { integrationId },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Scheduling
  private scheduleSync(integrationId: string): void {
    const integration = this.integrations.get(integrationId);
    if (!integration) return;

    const timeUntilNextSync = integration.nextSync.getTime() - Date.now();
    if (timeUntilNextSync > 0) {
      setTimeout(() => {
        this.syncIntegration(integrationId);
      }, timeUntilNextSync);
    }
  }

  private cancelSync(integrationId: string): void {
    // Cancel any scheduled sync for this integration
    // Implementation depends on the scheduling mechanism used
  }

  // ID generators
  private generateIntegrationId(): string {
    return `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSyncJobId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { ThirdPartyIntegrationManager };
export default ThirdPartyIntegrationManager;