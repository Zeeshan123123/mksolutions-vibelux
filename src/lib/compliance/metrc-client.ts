/**
 * METRC (Marijuana Enforcement Tracking Reporting Compliance) API Client
 * Cannabis compliance tracking for licensed facilities
 */

import { logger } from '@/lib/logging/production-logger';
import axios, { AxiosInstance } from 'axios';

export interface METRCConfig {
  apiKey: string;
  userKey: string;
  facilityLicense: string;
  environment: 'sandbox' | 'production';
  state: string; // Two-letter state code (e.g., 'CA', 'CO', 'NV')
}

export interface METRCPlant {
  Id: number;
  Label: string;
  State: string;
  GrowthPhase: string;
  PlantBatchId: number;
  PlantBatchName: string;
  PlantBatchTypeName: string;
  StrainId: number;
  StrainName: string;
  LocationId: number;
  LocationName: string;
  LocationTypeName: string;
  PatientLicenseNumber?: string;
  HarvestId?: number;
  HarvestedDate?: string;
  DestroyedDate?: string;
  DestroyedNote?: string;
  PlantedDate: string;
  VegetativeDate?: string;
  FloweringDate?: string;
  WasteWeight?: number;
  WasteUnitOfMeasureName?: string;
  WasteMethodName?: string;
  WasteReasonName?: string;
  LastModified: string;
}

export interface METRCPackage {
  Id: number;
  Label: string;
  PackageType: string;
  ProductId: number;
  ProductName: string;
  ProductCategoryName: string;
  Quantity: number;
  UnitOfMeasureName: string;
  PackagedDate: string;
  InitialLabTestingState: string;
  LabTestingState: string;
  LabTestingStateDate: string;
  IsProductionBatch: boolean;
  ProductionBatchNumber?: string;
  SourcePackageLabels?: string;
  LocationId: number;
  LocationName: string;
  Item: METRCItem;
  LastModified: string;
}

export interface METRCItem {
  Id: number;
  Name: string;
  ProductCategoryName: string;
  ProductCategoryType: string;
  QuantityType: string;
  DefaultLabTestingState: string;
  UnitOfMeasureName?: string;
  ApprovalStatus: string;
  ApprovalStatusDateTime: string;
  StrainId?: number;
  StrainName?: string;
  AdministrationMethod?: string;
  UnitCbdPercent?: number;
  UnitCbdContent?: number;
  UnitCbdContentUnitOfMeasureName?: string;
  UnitThcPercent?: number;
  UnitThcContent?: number;
  UnitThcContentUnitOfMeasureName?: string;
  UnitVolume?: number;
  UnitVolumeUnitOfMeasureName?: string;
  UnitWeight?: number;
  UnitWeightUnitOfMeasureName?: string;
  ServingSize?: string;
  SupplyDurationDays?: number;
  Ingredients?: string;
  Description?: string;
  IsUsed: boolean;
}

export interface METRCHarvest {
  Id: number;
  Name: string;
  HarvestType: string;
  SourceStrainId: number;
  SourceStrainName: string;
  DryingLocationId: number;
  DryingLocationName: string;
  PatientLicenseNumber?: string;
  ActualDate: string;
  TotalWasteWeight: number;
  TotalRestoredWeight: number;
  TotalWetWeight: number;
  TotalDryWeight: number;
  UnitOfWeightName: string;
  LabTestingState: string;
  LabTestingStateDate: string;
  IsOnHold: boolean;
  HoldReason?: string;
  IsFinished: boolean;
  ArchivedDate?: string;
  LastModified: string;
}

export interface METRCTransfer {
  Id: number;
  ManifestNumber: string;
  ShipmentTypeName: string;
  ShipmentTransactionType: string;
  ShipperFacilityLicenseNumber: string;
  ShipperFacilityName: string;
  TransporterFacilityLicenseNumber?: string;
  TransporterFacilityName?: string;
  DriverOccupationalLicenseNumber?: string;
  DriverName?: string;
  DriverLicenseNumber?: string;
  PhoneNumberForQuestions?: string;
  VehicleMake?: string;
  VehicleModel?: string;
  VehicleLicensePlateNumber?: string;
  DeliveryCount: number;
  ReceivedDeliveryCount: number;
  PackageCount: number;
  ReceivedPackageCount: number;
  ContainsPlantPackage: boolean;
  ContainsProductPackage: boolean;
  ContainsTestingSample: boolean;
  ContainsProductRequiresRemediation: boolean;
  ContainsRemediatedProductPackage: boolean;
  CreatedDateTime: string;
  CreatedByUserName: string;
  LastModified: string;
}

export interface METRCLabTest {
  Id: number;
  RequestId: number;
  Label: string;
  PackageId: number;
  ProductName: string;
  ProductCategoryName: string;
  TestPerformed: boolean;
  OverallPassed: boolean;
  TestTypeName: string;
  TestPassed: boolean;
  TestComment?: string;
  ThcPercent?: number;
  ThcPercentDecarboxylated?: number;
  CbdPercent?: number;
  MoisturePercent?: number;
  TestPerformedDate?: string;
  ResultReleaseDateTime?: string;
  LabTestDetailId: number;
  TestBatchId?: number;
  TestBatchName?: string;
  LastModified: string;
}

export class METRCClient {
  private client: AxiosInstance;
  private config: METRCConfig;

  constructor(config: METRCConfig) {
    this.config = config;

    const baseURL = config.environment === 'production' 
      ? `https://api-${config.state.toLowerCase()}.metrc.com`
      : `https://sandbox-api-${config.state.toLowerCase()}.metrc.com`;

    this.client = axios.create({
      baseURL,
      auth: {
        username: config.apiKey,
        password: config.userKey
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      config => {
        logger.info('api', 'Making METRC API request', {
          method: config.method,
          url: config.url,
          facilityLicense: this.config.facilityLicense
        });
        return config;
      },
      error => {
        logger.error('api', 'METRC request error', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      response => {
        logger.info('api', 'METRC API response received', {
          status: response.status,
          dataLength: Array.isArray(response.data) ? response.data.length : 'object'
        });
        return response;
      },
      error => {
        logger.error('api', 'METRC API error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  // Plant Operations
  async getPlants(params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCPlant[]> {
    try {
      const response = await this.client.get('/plants/v1/active', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get plants', error as Error);
      throw error;
    }
  }

  async getPlantById(id: number, licenseNumber?: string): Promise<METRCPlant> {
    try {
      const response = await this.client.get(`/plants/v1/${id}`, {
        params: {
          licenseNumber: licenseNumber || this.config.facilityLicense
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get plant by ID', error as Error);
      throw error;
    }
  }

  async createPlantings(plantings: Array<{
    PlantLabel: string;
    PlantBatchName: string;
    PlantBatchType: string;
    PlantCount: number;
    LocationName: string;
    StrainName: string;
    PatientLicenseNumber?: string;
    ActualDate: string;
  }>): Promise<void> {
    try {
      await this.client.post(`/plants/v1/create/plantings`, plantings, {
        params: {
          licenseNumber: this.config.facilityLicense
        }
      });
      logger.info('api', 'Plant plantings created successfully');
    } catch (error) {
      logger.error('api', 'Failed to create plant plantings', error as Error);
      throw error;
    }
  }

  // Package Operations
  async getPackages(params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCPackage[]> {
    try {
      const response = await this.client.get('/packages/v1/active', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get packages', error as Error);
      throw error;
    }
  }

  async getPackageById(id: number, licenseNumber?: string): Promise<METRCPackage> {
    try {
      const response = await this.client.get(`/packages/v1/${id}`, {
        params: {
          licenseNumber: licenseNumber || this.config.facilityLicense
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get package by ID', error as Error);
      throw error;
    }
  }

  async createPackages(packages: Array<{
    Tag: string;
    Location: string;
    Item: string;
    Quantity: number;
    UnitOfMeasure: string;
    PatientLicenseNumber?: string;
    Note?: string;
    IsProductionBatch: boolean;
    ProductionBatchNumber?: string;
    IsDonation?: boolean;
    ProductRequiresRemediation?: boolean;
    UseSameItem?: boolean;
    ActualDate: string;
    Ingredients?: Array<{
      Package: string;
      Quantity: number;
      UnitOfMeasure: string;
    }>;
  }>): Promise<void> {
    try {
      await this.client.post('/packages/v1/create', packages, {
        params: {
          licenseNumber: this.config.facilityLicense
        }
      });
      logger.info('api', 'Packages created successfully');
    } catch (error) {
      logger.error('api', 'Failed to create packages', error as Error);
      throw error;
    }
  }

  // Harvest Operations
  async getHarvests(params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCHarvest[]> {
    try {
      const response = await this.client.get('/harvests/v1/active', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get harvests', error as Error);
      throw error;
    }
  }

  async createHarvest(harvest: {
    Name: string;
    HarvestType: string;
    UnitOfWeight: string;
    DryingLocation: string;
    PatientLicenseNumber?: string;
    ActualDate: string;
    Strains: Array<{
      StrainName: string;
      TotalWasteWeight: number;
      TotalWetWeight: number;
    }>;
  }): Promise<void> {
    try {
      await this.client.post('/harvests/v1/create/packages', [harvest], {
        params: {
          licenseNumber: this.config.facilityLicense
        }
      });
      logger.info('api', 'Harvest created successfully');
    } catch (error) {
      logger.error('api', 'Failed to create harvest', error as Error);
      throw error;
    }
  }

  // Transfer Operations
  async getIncomingTransfers(params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCTransfer[]> {
    try {
      const response = await this.client.get('/transfers/v1/incoming', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get incoming transfers', error as Error);
      throw error;
    }
  }

  async getOutgoingTransfers(params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCTransfer[]> {
    try {
      const response = await this.client.get('/transfers/v1/outgoing', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get outgoing transfers', error as Error);
      throw error;
    }
  }

  // Lab Test Operations
  async getLabTests(packageId?: number, params?: {
    licenseNumber?: string;
    lastModifiedStart?: string;
    lastModifiedEnd?: string;
  }): Promise<METRCLabTest[]> {
    try {
      const endpoint = packageId 
        ? `/labtests/v1/results` 
        : '/labtests/v1/states';
      
      const response = await this.client.get(endpoint, {
        params: {
          packageId,
          licenseNumber: params?.licenseNumber || this.config.facilityLicense,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get lab tests', error as Error);
      throw error;
    }
  }

  // Item Operations
  async getItems(params?: {
    licenseNumber?: string;
  }): Promise<METRCItem[]> {
    try {
      const response = await this.client.get('/items/v1/active', {
        params: {
          licenseNumber: params?.licenseNumber || this.config.facilityLicense
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get items', error as Error);
      throw error;
    }
  }

  async createItems(items: Array<{
    ItemCategory: string;
    Name: string;
    UnitOfMeasure: string;
    Strain?: string;
    AdministrationMethod?: string;
    UnitCbdPercent?: number;
    UnitCbdContent?: number;
    UnitCbdContentUnitOfMeasure?: string;
    UnitThcPercent?: number;
    UnitThcContent?: number;
    UnitThcContentUnitOfMeasure?: string;
    UnitVolume?: number;
    UnitVolumeUnitOfMeasure?: string;
    UnitWeight?: number;
    UnitWeightUnitOfMeasure?: string;
    ServingSize?: string;
    SupplyDurationDays?: number;
    Ingredients?: string;
  }>): Promise<void> {
    try {
      await this.client.post('/items/v1/create', items, {
        params: {
          licenseNumber: this.config.facilityLicense
        }
      });
      logger.info('api', 'Items created successfully');
    } catch (error) {
      logger.error('api', 'Failed to create items', error as Error);
      throw error;
    }
  }

  // Utility Methods
  async getFacilities(): Promise<any[]> {
    try {
      const response = await this.client.get('/facilities/v1/');
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get facilities', error as Error);
      throw error;
    }
  }

  async getStrains(licenseNumber?: string): Promise<any[]> {
    try {
      const response = await this.client.get('/strains/v1/active', {
        params: {
          licenseNumber: licenseNumber || this.config.facilityLicense
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get strains', error as Error);
      throw error;
    }
  }

  async getLocations(licenseNumber?: string): Promise<any[]> {
    try {
      const response = await this.client.get('/locations/v1/active', {
        params: {
          licenseNumber: licenseNumber || this.config.facilityLicense
        }
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Failed to get locations', error as Error);
      throw error;
    }
  }
}