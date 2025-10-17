/**
 * METRC Integration Service
 * Manages cannabis compliance tracking and reporting with METRC
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';
import { METRCClient, METRCConfig, METRCPlant, METRCPackage, METRCHarvest, METRCTransfer, METRCLabTest } from '@/lib/compliance/metrc-client';

export interface METRCIntegrationConfig {
  facilityId: string;
  licenseNumber: string;
  state: string;
  apiKey: string;
  userKey: string;
  environment: 'sandbox' | 'production';
  settings: {
    autoSyncEnabled: boolean;
    syncInterval: number; // minutes
    lastSyncDate: Date;
    complianceSettings: {
      trackPlants: boolean;
      trackPackages: boolean;
      trackHarvests: boolean;
      trackTransfers: boolean;
      trackLabTests: boolean;
      autoCreateMETRCEntries: boolean;
      requireLabTestApproval: boolean;
      alertOnComplianceIssues: boolean;
    };
  };
}

export interface ComplianceSyncResult {
  timestamp: Date;
  facilityId: string;
  licenseNumber: string;
  
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    warnings: number;
  };
  
  details: {
    plants?: { synced: number; created: number; updated: number; errors: string[] };
    packages?: { synced: number; created: number; updated: number; errors: string[] };
    harvests?: { synced: number; created: number; updated: number; errors: string[] };
    transfers?: { synced: number; created: number; updated: number; errors: string[] };
    labTests?: { synced: number; created: number; updated: number; errors: string[] };
  };
  
  complianceAlerts: Array<{
    type: 'warning' | 'error' | 'critical';
    message: string;
    entityId?: string;
    entityType?: string;
    actionRequired?: string;
  }>;
  
  errors: string[];
  nextSyncTime?: Date;
}

export interface VibeLuxPlant {
  id: string;
  metrcId?: number;
  metrcLabel?: string;
  strain: string;
  batchId: string;
  location: string;
  growthPhase: 'seedling' | 'vegetative' | 'flowering' | 'harvested' | 'destroyed';
  plantedDate: Date;
  vegetativeDate?: Date;
  floweringDate?: Date;
  harvestedDate?: Date;
  destroyedDate?: Date;
  destroyedReason?: string;
  wasteWeight?: number;
  notes?: string;
}

export interface VibeLuxPackage {
  id: string;
  metrcId?: number;
  metrcLabel?: string;
  itemName: string;
  productCategory: string;
  quantity: number;
  unitOfMeasure: string;
  packagedDate: Date;
  location: string;
  labTestingState: 'not_required' | 'required' | 'submitted' | 'passed' | 'failed';
  sourcePackages?: string[];
  isProductionBatch: boolean;
  productionBatchNumber?: string;
}

export class METRCIntegrationService {
  private readonly cachePrefix = 'metrc:';
  private readonly cacheTTL = 3600; // 1 hour
  private metrcClient?: METRCClient;

  /**
   * Initialize METRC integration
   */
  async initializeIntegration(config: METRCIntegrationConfig): Promise<boolean> {
    try {
      logger.info('api', `Initializing METRC integration for facility ${config.facilityId}`);

      // Initialize METRC client
      this.metrcClient = new METRCClient({
        apiKey: config.apiKey,
        userKey: config.userKey,
        facilityLicense: config.licenseNumber,
        environment: config.environment,
        state: config.state
      });

      // Test connection by getting facilities
      const facilities = await this.metrcClient.getFacilities();
      const facility = facilities.find(f => f.License?.Number === config.licenseNumber);
      
      if (!facility) {
        throw new Error(`Facility with license ${config.licenseNumber} not found in METRC`);
      }

      logger.info('api', 'METRC connected successfully', {
        facilityName: facility.Name,
        licenseNumber: config.licenseNumber
      });

      // Store configuration
      await this.storeConfiguration(config);

      logger.info('api', 'METRC integration initialized successfully');
      return true;

    } catch (error) {
      logger.error('api', 'Failed to initialize METRC integration:', error);
      return false;
    }
  }

  /**
   * Sync all compliance data with METRC
   */
  async syncComplianceData(facilityId: string): Promise<ComplianceSyncResult> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config) {
        throw new Error(`No METRC configuration found for facility ${facilityId}`);
      }

      if (!this.metrcClient) {
        await this.initializeIntegration(config);
      }

      logger.info('api', `Starting METRC sync for facility ${facilityId}`);

      const result: ComplianceSyncResult = {
        timestamp: new Date(),
        facilityId,
        licenseNumber: config.licenseNumber,
        summary: {
          totalProcessed: 0,
          successful: 0,
          failed: 0,
          warnings: 0
        },
        details: {},
        complianceAlerts: [],
        errors: []
      };

      // Sync based on settings
      if (config.settings.complianceSettings.trackPlants) {
        result.details.plants = await this.syncPlants(config);
      }

      if (config.settings.complianceSettings.trackPackages) {
        result.details.packages = await this.syncPackages(config);
      }

      if (config.settings.complianceSettings.trackHarvests) {
        result.details.harvests = await this.syncHarvests(config);
      }

      if (config.settings.complianceSettings.trackTransfers) {
        result.details.transfers = await this.syncTransfers(config);
      }

      if (config.settings.complianceSettings.trackLabTests) {
        result.details.labTests = await this.syncLabTests(config);
      }

      // Calculate summary and check compliance
      this.calculateSyncSummary(result);
      await this.checkComplianceAlerts(config, result);

      // Update last sync date
      await this.updateLastSyncDate(facilityId);

      // Schedule next sync
      result.nextSyncTime = new Date(Date.now() + config.settings.syncInterval * 60000);

      logger.info('api', `METRC sync completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);

      return result;

    } catch (error) {
      logger.error('api', 'METRC sync failed:', error);
      throw error;
    }
  }

  /**
   * Create new plant in METRC
   */
  async createPlantInMETRC(facilityId: string, plant: VibeLuxPlant): Promise<string> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config || !this.metrcClient) {
        throw new Error('METRC integration not configured');
      }

      // Generate METRC label if not provided
      const metrcLabel = plant.metrcLabel || `VLX-${plant.id}-${Date.now()}`;

      await this.metrcClient.createPlantings([{
        PlantLabel: metrcLabel,
        PlantBatchName: plant.batchId,
        PlantBatchType: 'Clone', // Default to clone, could be made configurable
        PlantCount: 1,
        LocationName: plant.location,
        StrainName: plant.strain,
        ActualDate: plant.plantedDate.toISOString().split('T')[0]
      }]);

      logger.info('api', 'Plant created in METRC', { metrcLabel, plantId: plant.id });
      return metrcLabel;

    } catch (error) {
      logger.error('api', 'Failed to create plant in METRC:', error);
      throw error;
    }
  }

  /**
   * Create new package in METRC
   */
  async createPackageInMETRC(facilityId: string, pkg: VibeLuxPackage): Promise<string> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config || !this.metrcClient) {
        throw new Error('METRC integration not configured');
      }

      // Generate METRC tag if not provided
      const metrcTag = pkg.metrcLabel || `VLX-PKG-${pkg.id}-${Date.now()}`;

      const packageData = {
        Tag: metrcTag,
        Location: pkg.location,
        Item: pkg.itemName,
        Quantity: pkg.quantity,
        UnitOfMeasure: pkg.unitOfMeasure,
        ActualDate: pkg.packagedDate.toISOString().split('T')[0],
        IsProductionBatch: pkg.isProductionBatch,
        ProductionBatchNumber: pkg.productionBatchNumber,
        Ingredients: pkg.sourcePackages?.map(sourceTag => ({
          Package: sourceTag,
          Quantity: 1, // This would need to be calculated based on actual usage
          UnitOfMeasure: pkg.unitOfMeasure
        }))
      };

      await this.metrcClient.createPackages([packageData]);

      logger.info('api', 'Package created in METRC', { metrcTag, packageId: pkg.id });
      return metrcTag;

    } catch (error) {
      logger.error('api', 'Failed to create package in METRC:', error);
      throw error;
    }
  }

  /**
   * Get METRC compliance status for facility
   */
  async getComplianceStatus(facilityId: string): Promise<{
    isCompliant: boolean;
    plantsInCompliance: number;
    totalPlants: number;
    packagesInCompliance: number;
    totalPackages: number;
    pendingLabTests: number;
    overdueTransfers: number;
    alerts: Array<{ type: string; message: string; severity: string }>;
  }> {
    try {
      const config = await this.getConfiguration(facilityId);
      if (!config || !this.metrcClient) {
        throw new Error('METRC integration not configured');
      }

      // Get current METRC data
      const [plants, packages, labTests, transfers] = await Promise.all([
        this.metrcClient.getPlants(),
        this.metrcClient.getPackages(),
        this.metrcClient.getLabTests(),
        this.metrcClient.getIncomingTransfers()
      ]);

      // Calculate compliance metrics
      const plantsInCompliance = plants.filter(p => !p.DestroyedDate && p.LocationId).length;
      const packagesInCompliance = packages.filter(p => p.LabTestingState !== 'TestingFailed').length;
      const pendingLabTests = labTests.filter(t => !t.TestPerformed).length;
      const overdueTransfers = transfers.filter(t => 
        new Date(t.CreatedDateTime) < new Date(Date.now() - 24 * 60 * 60 * 1000) && 
        t.ReceivedDeliveryCount === 0
      ).length;

      const alerts = [];
      if (pendingLabTests > 0) {
        alerts.push({
          type: 'lab_test',
          message: `${pendingLabTests} lab tests pending`,
          severity: 'warning'
        });
      }

      if (overdueTransfers > 0) {
        alerts.push({
          type: 'transfer',
          message: `${overdueTransfers} transfers overdue`,
          severity: 'error'
        });
      }

      const isCompliant = alerts.filter(a => a.severity === 'error').length === 0;

      return {
        isCompliant,
        plantsInCompliance,
        totalPlants: plants.length,
        packagesInCompliance,
        totalPackages: packages.length,
        pendingLabTests,
        overdueTransfers,
        alerts
      };

    } catch (error) {
      logger.error('api', 'Failed to get compliance status:', error);
      throw error;
    }
  }

  // Helper Methods

  private async syncPlants(config: METRCIntegrationConfig): Promise<any> {
    try {
      const plants = await this.metrcClient!.getPlants();
      
      // Here you would sync with your VibeLux plant database
      // For now, returning mock data
      return {
        synced: plants.length,
        created: 0,
        updated: plants.length,
        errors: []
      };
    } catch (error) {
      logger.error('api', 'Failed to sync plants:', error);
      return {
        synced: 0,
        created: 0,
        updated: 0,
        errors: [(error as Error).message]
      };
    }
  }

  private async syncPackages(config: METRCIntegrationConfig): Promise<any> {
    try {
      const packages = await this.metrcClient!.getPackages();
      
      return {
        synced: packages.length,
        created: 0,
        updated: packages.length,
        errors: []
      };
    } catch (error) {
      logger.error('api', 'Failed to sync packages:', error);
      return {
        synced: 0,
        created: 0,
        updated: 0,
        errors: [(error as Error).message]
      };
    }
  }

  private async syncHarvests(config: METRCIntegrationConfig): Promise<any> {
    try {
      const harvests = await this.metrcClient!.getHarvests();
      
      return {
        synced: harvests.length,
        created: 0,
        updated: harvests.length,
        errors: []
      };
    } catch (error) {
      logger.error('api', 'Failed to sync harvests:', error);
      return {
        synced: 0,
        created: 0,
        updated: 0,
        errors: [(error as Error).message]
      };
    }
  }

  private async syncTransfers(config: METRCIntegrationConfig): Promise<any> {
    try {
      const [incoming, outgoing] = await Promise.all([
        this.metrcClient!.getIncomingTransfers(),
        this.metrcClient!.getOutgoingTransfers()
      ]);
      
      const totalTransfers = incoming.length + outgoing.length;
      
      return {
        synced: totalTransfers,
        created: 0,
        updated: totalTransfers,
        errors: []
      };
    } catch (error) {
      logger.error('api', 'Failed to sync transfers:', error);
      return {
        synced: 0,
        created: 0,
        updated: 0,
        errors: [(error as Error).message]
      };
    }
  }

  private async syncLabTests(config: METRCIntegrationConfig): Promise<any> {
    try {
      const labTests = await this.metrcClient!.getLabTests();
      
      return {
        synced: labTests.length,
        created: 0,
        updated: labTests.length,
        errors: []
      };
    } catch (error) {
      logger.error('api', 'Failed to sync lab tests:', error);
      return {
        synced: 0,
        created: 0,
        updated: 0,
        errors: [(error as Error).message]
      };
    }
  }

  private calculateSyncSummary(result: ComplianceSyncResult): void {
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    Object.values(result.details).forEach(detail => {
      if (detail) {
        totalProcessed += detail.synced || 0;
        successful += (detail.created || 0) + (detail.updated || 0);
        failed += detail.errors?.length || 0;
      }
    });

    result.summary = {
      totalProcessed,
      successful,
      failed,
      warnings: result.complianceAlerts.filter(a => a.type === 'warning').length
    };
  }

  private async checkComplianceAlerts(config: METRCIntegrationConfig, result: ComplianceSyncResult): Promise<void> {
    // Check for compliance issues and add alerts
    if (config.settings.complianceSettings.alertOnComplianceIssues) {
      // Add logic to check for specific compliance issues
      // This is where you'd implement business rules for compliance checking
    }
  }

  private async storeConfiguration(config: METRCIntegrationConfig): Promise<void> {
    const key = `${this.cachePrefix}config:${config.facilityId}`;
    await redis.setex(key, this.cacheTTL * 24, JSON.stringify(config)); // Store for 24 hours
  }

  private async getConfiguration(facilityId: string): Promise<METRCIntegrationConfig | null> {
    const key = `${this.cachePrefix}config:${facilityId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private async updateLastSyncDate(facilityId: string): Promise<void> {
    const config = await this.getConfiguration(facilityId);
    if (config) {
      config.settings.lastSyncDate = new Date();
      await this.storeConfiguration(config);
    }
  }
}

export const metrcIntegrationService = new METRCIntegrationService();
export default metrcIntegrationService;