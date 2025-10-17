// CMMS Integration Types
export type CMMSPlatform = 'servicenow' | 'sap_pm' | 'maximo' | 'upkeep' | 'fiix';

// Base CMMS Configuration Interface
export interface BaseCMMSConfig {
  platform: CMMSPlatform;
  apiVersion?: string;
}

// Platform-specific Configuration Interfaces
export interface ServiceNowConfig extends BaseCMMSConfig {
  platform: 'servicenow';
  instanceUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
}

export interface SAPPMConfig extends BaseCMMSConfig {
  platform: 'sap_pm';
  serverUrl: string;
  client: string;
  username: string;
  password: string;
  language?: string;
}

export interface MaximoConfig extends BaseCMMSConfig {
  platform: 'maximo';
  serverUrl: string;
  username: string;
  password: string;
  apiKey?: string;
  maxauth?: string;
}

export interface UpKeepConfig extends BaseCMMSConfig {
  platform: 'upkeep';
  apiKey: string;
  baseUrl?: string;
}

export interface FiixConfig extends BaseCMMSConfig {
  platform: 'fiix';
  serverUrl: string;
  username: string;
  password: string;
  appKey: string;
  authToken?: string;
}

// Union type for all CMMS configurations
export type CMMSConfig = ServiceNowConfig | SAPPMConfig | MaximoConfig | UpKeepConfig | FiixConfig;

// Work Order Status and Priority Types
export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderType = 'preventive' | 'corrective' | 'predictive' | 'emergency';

// Work Order Interface
export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
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
  attachments?: WorkOrderAttachment[];
  location?: string;
  workType: WorkOrderType;
  externalId?: string;
  lastSyncAt?: Date;
  cmmsSource?: CMMSPlatform;
  customFields?: Record<string, any>;
}

// Work Order Attachment Interface
export interface WorkOrderAttachment {
  id: string;
  workOrderId: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

// Asset Status and Criticality Types
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired';
export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';

// Asset Interface
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
  status: AssetStatus;
  criticality: AssetCriticality;
  vibeluxEquipmentId?: string;
  externalId?: string;
  lastSyncAt?: Date;
  specifications?: Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule[];
  parentAssetId?: string;
  children?: Asset[];
  cmmsSource?: CMMSPlatform;
}

// Maintenance Schedule Types
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  name: string;
  description: string;
  frequency: MaintenanceFrequency;
  frequencyValue: number;
  lastPerformed?: Date;
  nextDue: Date;
  estimatedHours: number;
  assignedTo?: string;
  priority: WorkOrderPriority;
  instructions?: string;
  requiredParts?: string[];
  requiredTools?: string[];
  skillsRequired?: string[];
  isActive: boolean;
  externalId?: string;
  lastSyncAt?: Date;
  cmmsSource?: CMMSPlatform;
  customFields?: Record<string, any>;
}

// Sync Status Types
export type SyncStatusType = 'success' | 'error' | 'in_progress' | 'pending';
export type SyncType = 'full' | 'incremental';

export interface SyncStatus {
  id: string;
  platform: CMMSPlatform;
  lastSync: Date;
  nextSync: Date;
  status: SyncStatusType;
  recordsSynced: number;
  errorCount: number;
  errorMessages: string[];
  syncDuration: number;
  syncType: SyncType;
  syncDetails?: SyncDetails;
}

export interface SyncDetails {
  assetsProcessed: number;
  workOrdersProcessed: number;
  schedulesProcessed: number;
  mappingsCreated: number;
  conflictsResolved: number;
  dataVolume: number;
}

// Asset Mapping Types
export type MappingType = 'automatic' | 'manual';

export interface AssetMapping {
  id: string;
  vibeluxEquipmentId: string;
  cmmsAssetId: string;
  platform: CMMSPlatform;
  mappingType: MappingType;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: AssetMappingMetadata;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface AssetMappingMetadata {
  matchingCriteria?: string[];
  similarityScores?: Record<string, number>;
  manualReview?: boolean;
  notes?: string;
  customAttributes?: Record<string, any>;
}

// Integration Status Types
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'testing';

export interface CMMSIntegrationStatus {
  id: string;
  platform: CMMSPlatform;
  status: IntegrationStatus;
  lastChecked: Date;
  lastError?: string;
  connectionDetails?: ConnectionDetails;
  capabilities?: PlatformCapabilities;
}

export interface ConnectionDetails {
  responseTime: number;
  version: string;
  serverInfo?: string;
  endpointStatus?: Record<string, boolean>;
}

export interface PlatformCapabilities {
  supportsAssetHierarchy: boolean;
  supportsCustomFields: boolean;
  supportsAttachments: boolean;
  supportsAutomation: boolean;
  supportsReporting: boolean;
  supportsWebhooks: boolean;
  supportsBulkOperations: boolean;
  maxBatchSize?: number;
  rateLimits?: RateLimits;
}

export interface RateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage?: number;
}

// Maintenance Metrics Types
export interface MaintenanceMetrics {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  mttr: number; // Mean Time To Repair
  mtbf: number; // Mean Time Between Failures
  maintenanceCost: number;
  equipmentUptime: number;
  preventiveMaintenanceRatio: number;
  emergencyMaintenanceRatio: number;
  costPerWorkOrder: number;
  laborEfficiency: number;
}

// Predictive Maintenance Types
export interface PredictiveAlert {
  id: string;
  assetId: string;
  assetName: string;
  alertType: 'failure_prediction' | 'performance_degradation' | 'maintenance_due' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  timeToFailure: number; // in hours
  recommendedAction: string;
  affectedSystems: string[];
  potentialImpact: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  isActive: boolean;
  modelVersion: string;
  confidence: number;
  historicalData?: PredictiveDataPoint[];
}

export interface PredictiveDataPoint {
  timestamp: Date;
  value: number;
  parameter: string;
  unit: string;
  threshold?: number;
  status: 'normal' | 'warning' | 'critical';
}

// Equipment Health Types
export interface EquipmentHealth {
  assetId: string;
  overallScore: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  lastAssessment: Date;
  assessmentFrequency: number; // in hours
  healthFactors: HealthFactor[];
  recommendations: HealthRecommendation[];
  trends: HealthTrend[];
}

export interface HealthFactor {
  factor: string;
  score: number;
  weight: number;
  status: 'normal' | 'warning' | 'critical';
  description: string;
  lastReading?: Date;
  threshold?: number;
}

export interface HealthRecommendation {
  id: string;
  priority: WorkOrderPriority;
  action: string;
  reason: string;
  estimatedCost?: number;
  estimatedHours?: number;
  dueDate?: Date;
  isUrgent: boolean;
}

export interface HealthTrend {
  parameter: string;
  trend: 'improving' | 'stable' | 'degrading';
  changeRate: number;
  periodDays: number;
  projectedFailureDate?: Date;
}

// API Response Types
export interface CMMSAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: Record<string, any>;
}

export interface WorkOrderCreateRequest {
  cmmsId: string;
  workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'externalId' | 'lastSyncAt'>;
}

export interface WorkOrderUpdateRequest {
  cmmsId: string;
  workOrderId: string;
  updates: Partial<Pick<WorkOrder, 'status' | 'assignedTo' | 'actualHours' | 'completedAt' | 'notes' | 'cost'>>;
}

export interface AssetMappingCreateRequest {
  vibeluxEquipmentId: string;
  cmmsAssetId: string;
  platform: CMMSPlatform;
  mappingType?: MappingType;
  metadata?: AssetMappingMetadata;
}

export interface SyncRequest {
  id: string;
  syncType?: SyncType;
  includedDataTypes?: ('assets' | 'workOrders' | 'schedules')[];
  filters?: SyncFilters;
}

export interface SyncFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  assetCategories?: string[];
  workOrderStatuses?: WorkOrderStatus[];
  priorityLevels?: WorkOrderPriority[];
}

// Event Types for WebSocket/Real-time Updates
export interface CMMSEvent {
  type: 'work_order_created' | 'work_order_updated' | 'sync_completed' | 'alert_created' | 'asset_updated';
  timestamp: Date;
  source: CMMSPlatform;
  data: any;
  userId?: string;
}

// Error Types
export interface CMMSError extends Error {
  code: string;
  platform?: CMMSPlatform;
  details?: any;
  isRetryable: boolean;
}

// Configuration Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Search and Filter Types
export interface WorkOrderSearchParams {
  query?: string;
  status?: WorkOrderStatus[];
  priority?: WorkOrderPriority[];
  workType?: WorkOrderType[];
  assignedTo?: string[];
  assetId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  cmmsSource?: CMMSPlatform[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AssetSearchParams {
  query?: string;
  category?: string[];
  status?: AssetStatus[];
  criticality?: AssetCriticality[];
  location?: string[];
  cmmsSource?: CMMSPlatform[];
  hasMappings?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'installationDate' | 'criticality' | 'status';
  sortOrder?: 'asc' | 'desc';
}