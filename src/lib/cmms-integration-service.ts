import { z } from 'zod';

// CMMS Platform Types
export type CMMSPlatform = 'servicenow' | 'sap_pm' | 'maximo' | 'upkeep' | 'fiix';

// Configuration schemas for different CMMS platforms
export const ServiceNowConfigSchema = z.object({
  platform: z.literal('servicenow'),
  instanceUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  apiVersion: z.string().default('v1'),
});

export const SAPPMConfigSchema = z.object({
  platform: z.literal('sap_pm'),
  serverUrl: z.string().url(),
  client: z.string(),
  username: z.string(),
  password: z.string(),
  language: z.string().default('EN'),
  apiVersion: z.string().default('v1'),
});

export const MaximoConfigSchema = z.object({
  platform: z.literal('maximo'),
  serverUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
  apiKey: z.string().optional(),
  maxauth: z.string().optional(),
  apiVersion: z.string().default('v1'),
});

export const UpKeepConfigSchema = z.object({
  platform: z.literal('upkeep'),
  apiKey: z.string(),
  baseUrl: z.string().url().default('https://api.onupkeep.com'),
  apiVersion: z.string().default('v2'),
});

export const FiixConfigSchema = z.object({
  platform: z.literal('fiix'),
  serverUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
  appKey: z.string(),
  authToken: z.string().optional(),
  apiVersion: z.string().default('v1'),
});

export const CMMSConfigSchema = z.union([
  ServiceNowConfigSchema,
  SAPPMConfigSchema,
  MaximoConfigSchema,
  UpKeepConfigSchema,
  FiixConfigSchema,
]);

export type CMMSConfig = z.infer<typeof CMMSConfigSchema>;

// Work Order Types
export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assetId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  cost?: number;
  notes?: string;
  attachments?: string[];
  location?: string;
  workType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  externalId?: string;
  lastSyncAt?: Date;
}

// Asset Types
export interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: Date;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  vibeluxEquipmentId?: string;
  externalId?: string;
  lastSyncAt?: Date;
  specifications?: Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule[];
}

// Maintenance Schedule Types
export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  frequencyValue: number;
  lastPerformed?: Date;
  nextDue: Date;
  estimatedHours: number;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  instructions?: string;
  requiredParts?: string[];
  isActive: boolean;
  externalId?: string;
  lastSyncAt?: Date;
}

// Sync Status Types
export interface SyncStatus {
  id: string;
  platform: CMMSPlatform;
  lastSync: Date;
  nextSync: Date;
  status: 'success' | 'error' | 'in_progress';
  recordsSynced: number;
  errorCount: number;
  errorMessages: string[];
  syncDuration: number;
  syncType: 'full' | 'incremental';
}

// Asset Mapping Types
export interface AssetMapping {
  id: string;
  vibeluxEquipmentId: string;
  cmmsAssetId: string;
  platform: CMMSPlatform;
  mappingType: 'automatic' | 'manual';
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// CMMS Integration Service
export class CMMSIntegrationService {
  private configs: Map<string, CMMSConfig> = new Map();
  private retryAttempts = 3;
  private retryDelay = 1000;

  // Configuration Management
  async addCMMSConfig(id: string, config: CMMSConfig): Promise<void> {
    const validatedConfig = CMMSConfigSchema.parse(config);
    this.configs.set(id, validatedConfig);
    
    try {
      await this.testConnection(id);
      await this.saveCMMSConfig(id, validatedConfig);
    } catch (error) {
      this.configs.delete(id);
      throw new Error(`Failed to add CMMS configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCMMSConfig(id: string, config: CMMSConfig): Promise<void> {
    const validatedConfig = CMMSConfigSchema.parse(config);
    
    try {
      await this.testConnection(id, validatedConfig);
      this.configs.set(id, validatedConfig);
      await this.saveCMMSConfig(id, validatedConfig);
    } catch (error) {
      throw new Error(`Failed to update CMMS configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeCMMSConfig(id: string): Promise<void> {
    this.configs.delete(id);
    await this.deleteCMMSConfig(id);
  }

  // Connection Testing
  async testConnection(id: string, config?: CMMSConfig): Promise<boolean> {
    const configToTest = config || this.configs.get(id);
    if (!configToTest) {
      throw new Error(`CMMS configuration not found: ${id}`);
    }

    try {
      switch (configToTest.platform) {
        case 'servicenow':
          return await this.testServiceNowConnection(configToTest);
        case 'sap_pm':
          return await this.testSAPPMConnection(configToTest);
        case 'maximo':
          return await this.testMaximoConnection(configToTest);
        case 'upkeep':
          return await this.testUpKeepConnection(configToTest);
        case 'fiix':
          return await this.testFiixConnection(configToTest);
        default:
          throw new Error(`Unsupported CMMS platform: ${configToTest.platform}`);
      }
    } catch (error) {
      logger.error('api', `Connection test failed for ${id}:`, error);
      return false;
    }
  }

  // Data Synchronization
  async syncData(id: string, syncType: 'full' | 'incremental' = 'incremental'): Promise<SyncStatus> {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`CMMS configuration not found: ${id}`);
    }

    const startTime = Date.now();
    const syncStatus: SyncStatus = {
      id: `${id}-${Date.now()}`,
      platform: config.platform,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'in_progress',
      recordsSynced: 0,
      errorCount: 0,
      errorMessages: [],
      syncDuration: 0,
      syncType,
    };

    try {
      // Sync Assets
      const assets = await this.syncAssets(id, syncType);
      syncStatus.recordsSynced += assets.length;

      // Sync Work Orders
      const workOrders = await this.syncWorkOrders(id, syncType);
      syncStatus.recordsSynced += workOrders.length;

      // Sync Maintenance Schedules
      const schedules = await this.syncMaintenanceSchedules(id, syncType);
      syncStatus.recordsSynced += schedules.length;

      // Update asset mappings
      await this.updateAssetMappings(id, assets);

      syncStatus.status = 'success';
      syncStatus.syncDuration = Date.now() - startTime;

      await this.saveSyncStatus(syncStatus);
      return syncStatus;
    } catch (error) {
      syncStatus.status = 'error';
      syncStatus.errorCount = 1;
      syncStatus.errorMessages.push(error instanceof Error ? error.message : 'Unknown error');
      syncStatus.syncDuration = Date.now() - startTime;

      await this.saveSyncStatus(syncStatus);
      throw error;
    }
  }

  // Work Order Management
  async createWorkOrder(id: string, workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`CMMS configuration not found: ${id}`);
    }

    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: `wo-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const externalId = await this.createExternalWorkOrder(id, newWorkOrder);
      newWorkOrder.externalId = externalId;
      
      await this.saveWorkOrder(newWorkOrder);
      return newWorkOrder;
    } catch (error) {
      throw new Error(`Failed to create work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWorkOrder(id: string, workOrderId: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`CMMS configuration not found: ${id}`);
    }

    const existingWorkOrder = await this.getWorkOrder(workOrderId);
    if (!existingWorkOrder) {
      throw new Error(`Work order not found: ${workOrderId}`);
    }

    const updatedWorkOrder: WorkOrder = {
      ...existingWorkOrder,
      ...updates,
      updatedAt: new Date(),
    };

    try {
      if (existingWorkOrder.externalId) {
        await this.updateExternalWorkOrder(id, existingWorkOrder.externalId, updates);
      }
      
      await this.saveWorkOrder(updatedWorkOrder);
      return updatedWorkOrder;
    } catch (error) {
      throw new Error(`Failed to update work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Asset Mapping Management
  async createAssetMapping(
    vibeluxEquipmentId: string,
    cmmsAssetId: string,
    platform: CMMSPlatform,
    mappingType: 'automatic' | 'manual' = 'manual'
  ): Promise<AssetMapping> {
    const mapping: AssetMapping = {
      id: `mapping-${Date.now()}`,
      vibeluxEquipmentId,
      cmmsAssetId,
      platform,
      mappingType,
      confidence: mappingType === 'manual' ? 1.0 : 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await this.saveAssetMapping(mapping);
    return mapping;
  }

  async updateAssetMapping(id: string, updates: Partial<AssetMapping>): Promise<AssetMapping> {
    const existingMapping = await this.getAssetMapping(id);
    if (!existingMapping) {
      throw new Error(`Asset mapping not found: ${id}`);
    }

    const updatedMapping: AssetMapping = {
      ...existingMapping,
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveAssetMapping(updatedMapping);
    return updatedMapping;
  }

  async deleteAssetMapping(id: string): Promise<void> {
    await this.removeAssetMapping(id);
  }

  // Automated Asset Mapping
  async autoMapAssets(id: string): Promise<AssetMapping[]> {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`CMMS configuration not found: ${id}`);
    }

    const vibeluxEquipment = await this.getVibeluxEquipment();
    const cmmsAssets = await this.getCMMSAssets(id);
    const mappings: AssetMapping[] = [];

    for (const equipment of vibeluxEquipment) {
      const matches = this.findAssetMatches(equipment, cmmsAssets);
      
      if (matches.length > 0) {
        const bestMatch = matches[0];
        const mapping = await this.createAssetMapping(
          equipment.id,
          bestMatch.asset.id,
          config.platform,
          'automatic'
        );
        mapping.confidence = bestMatch.confidence;
        mappings.push(mapping);
      }
    }

    return mappings;
  }

  // Platform-specific connection tests
  private async testServiceNowConnection(config: z.infer<typeof ServiceNowConfigSchema>): Promise<boolean> {
    const response = await this.makeAPIRequest(
      'GET',
      `${config.instanceUrl}/api/now/table/sys_user?sysparm_limit=1`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok;
  }

  private async testSAPPMConnection(config: z.infer<typeof SAPPMConfigSchema>): Promise<boolean> {
    const response = await this.makeAPIRequest(
      'GET',
      `${config.serverUrl}/sap/opu/odata/sap/API_MAINTENANCEORDER/MaintenanceOrder?$top=1`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok;
  }

  private async testMaximoConnection(config: z.infer<typeof MaximoConfigSchema>): Promise<boolean> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['apikey'] = config.apiKey;
    } else {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
    }

    if (config.maxauth) {
      headers['maxauth'] = config.maxauth;
    }

    const response = await this.makeAPIRequest(
      'GET',
      `${config.serverUrl}/maximo/oslc/os/mxasset?lean=1&oslc.limit=1`,
      { headers }
    );
    return response.ok;
  }

  private async testUpKeepConnection(config: z.infer<typeof UpKeepConfigSchema>): Promise<boolean> {
    const response = await this.makeAPIRequest(
      'GET',
      `${config.baseUrl}/${config.apiVersion}/users/me`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok;
  }

  private async testFiixConnection(config: z.infer<typeof FiixConfigSchema>): Promise<boolean> {
    const response = await this.makeAPIRequest(
      'POST',
      `${config.serverUrl}/api/`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'FindUser',
          username: config.username,
          password: config.password,
          appkey: config.appKey,
        }),
      }
    );
    return response.ok;
  }

  // HTTP Request Helper with retry logic
  private async makeAPIRequest(
    method: string,
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          ...options,
        });

        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // Server error (5xx), retry if not last attempt
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }
        
        throw lastError;
      }
    }

    throw lastError || new Error('Unknown error');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Asset matching algorithm
  private findAssetMatches(
    vibeluxEquipment: any,
    cmmsAssets: Asset[]
  ): Array<{ asset: Asset; confidence: number }> {
    const matches: Array<{ asset: Asset; confidence: number }> = [];

    for (const asset of cmmsAssets) {
      let confidence = 0;

      // Match by name
      if (this.similarityScore(vibeluxEquipment.name, asset.name) > 0.8) {
        confidence += 0.4;
      }

      // Match by model
      if (vibeluxEquipment.model && asset.model && 
          this.similarityScore(vibeluxEquipment.model, asset.model) > 0.8) {
        confidence += 0.3;
      }

      // Match by serial number
      if (vibeluxEquipment.serialNumber && asset.serialNumber &&
          vibeluxEquipment.serialNumber === asset.serialNumber) {
        confidence += 0.5;
      }

      // Match by location
      if (vibeluxEquipment.location && asset.location &&
          this.similarityScore(vibeluxEquipment.location, asset.location) > 0.7) {
        confidence += 0.2;
      }

      if (confidence > 0.6) {
        matches.push({ asset, confidence });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  // Simple string similarity score
  private similarityScore(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Database operations (to be implemented based on your database setup)
  private async saveCMMSConfig(id: string, config: CMMSConfig): Promise<void> {
    // Implementation depends on your database setup
    // Store encrypted configuration
  }

  private async deleteCMMSConfig(id: string): Promise<void> {
    // Implementation depends on your database setup
  }

  private async saveWorkOrder(workOrder: WorkOrder): Promise<void> {
    // Implementation depends on your database setup
  }

  private async getWorkOrder(id: string): Promise<WorkOrder | null> {
    // Implementation depends on your database setup
    return null;
  }

  private async saveAssetMapping(mapping: AssetMapping): Promise<void> {
    // Implementation depends on your database setup
  }

  private async getAssetMapping(id: string): Promise<AssetMapping | null> {
    // Implementation depends on your database setup
    return null;
  }

  private async removeAssetMapping(id: string): Promise<void> {
    // Implementation depends on your database setup
  }

  private async saveSyncStatus(status: SyncStatus): Promise<void> {
    // Implementation depends on your database setup
  }

  private async getVibeluxEquipment(): Promise<any[]> {
    // Implementation depends on your database setup
    return [];
  }

  private async getCMMSAssets(id: string): Promise<Asset[]> {
    // Implementation depends on your database setup
    return [];
  }

  private async syncAssets(id: string, syncType: 'full' | 'incremental'): Promise<Asset[]> {
    // Implementation depends on CMMS platform
    return [];
  }

  private async syncWorkOrders(id: string, syncType: 'full' | 'incremental'): Promise<WorkOrder[]> {
    // Implementation depends on CMMS platform
    return [];
  }

  private async syncMaintenanceSchedules(id: string, syncType: 'full' | 'incremental'): Promise<MaintenanceSchedule[]> {
    // Implementation depends on CMMS platform
    return [];
  }

  private async updateAssetMappings(id: string, assets: Asset[]): Promise<void> {
    // Implementation depends on your database setup
  }

  private async createExternalWorkOrder(id: string, workOrder: WorkOrder): Promise<string> {
    // Implementation depends on CMMS platform
    return `external-${Date.now()}`;
  }

  private async updateExternalWorkOrder(id: string, externalId: string, updates: Partial<WorkOrder>): Promise<void> {
    // Implementation depends on CMMS platform
  }
}

// Singleton instance
export const cmmsIntegrationService = new CMMSIntegrationService();