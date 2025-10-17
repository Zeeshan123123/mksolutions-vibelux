/**
 * Multi-Site Facility Management System
 * Centralized management for multiple cultivation facilities with consolidated analytics
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type FacilityStatus = 'active' | 'maintenance' | 'inactive' | 'construction';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
export type ComparisonMetric = 'yield' | 'quality' | 'cost' | 'efficiency' | 'compliance';

export interface FacilityProfile {
  id: string;
  name: string;
  code: string;
  status: FacilityStatus;
  
  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  
  // Facility Details
  type: 'indoor' | 'greenhouse' | 'hybrid';
  totalArea: number; // sq ft
  canopyArea: number; // sq ft
  roomCount: number;
  
  // Licensing
  licenses: Array<{
    type: string;
    number: string;
    expiryDate: Date;
    jurisdiction: string;
  }>;
  
  // Management
  facilityManager: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  
  // Capabilities
  capabilities: {
    cultivation: boolean;
    processing: boolean;
    packaging: boolean;
    distribution: boolean;
  };
  
  // Metrics
  currentPlantCount: number;
  activeRooms: number;
  employeeCount: number;
  
  // Status
  operationalSince: Date;
  lastInspection: Date;
  complianceScore: number;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsolidatedMetrics {
  facilityId: string;
  period: { startDate: Date; endDate: Date };
  
  // Production Metrics
  totalYield: number;
  yieldPerSqFt: number;
  plantCount: number;
  harvestCount: number;
  
  // Quality Metrics
  averageQuality: number;
  topShelfPercentage: number;
  defectRate: number;
  
  // Financial Metrics
  revenue: number;
  expenses: number;
  profitMargin: number;
  costPerGram: number;
  
  // Operational Metrics
  laborHours: number;
  energyConsumption: number;
  waterUsage: number;
  
  // Efficiency Metrics
  plantsPerEmployee: number;
  gramsPerKwh: number;
  cycleTime: number;
  
  // Compliance
  complianceScore: number;
  violations: number;
  inspectionsPassed: number;
}

export interface CrossFacilityAlert {
  id: string;
  level: AlertLevel;
  type: string;
  title: string;
  description: string;
  
  // Affected Facilities
  facilityIds: string[];
  
  // Context
  metric?: string;
  threshold?: number;
  actualValue?: number;
  
  // Resolution
  status: 'open' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface FacilityBenchmark {
  metric: ComparisonMetric;
  period: { startDate: Date; endDate: Date };
  
  // Rankings
  rankings: Array<{
    facilityId: string;
    facilityName: string;
    value: number;
    rank: number;
    percentile: number;
  }>;
  
  // Statistics
  average: number;
  median: number;
  best: number;
  worst: number;
  standardDeviation: number;
  
  // Trends
  trends: Array<{
    facilityId: string;
    trend: 'improving' | 'stable' | 'declining';
    changePercent: number;
  }>;
}

export interface ResourceSharing {
  id: string;
  type: 'equipment' | 'personnel' | 'inventory' | 'knowledge';
  
  // Resource Details
  resourceName: string;
  description: string;
  
  // Sharing Details
  fromFacilityId: string;
  toFacilityId: string;
  
  // Timeline
  requestDate: Date;
  startDate: Date;
  endDate: Date;
  
  // Terms
  quantity?: number;
  cost?: number;
  terms: string;
  
  // Status
  status: 'requested' | 'approved' | 'active' | 'completed' | 'cancelled';
  approvedBy?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionalCompliance {
  region: string;
  facilities: string[];
  
  // Compliance Status
  overallCompliance: number;
  
  // Requirements
  requirements: Array<{
    name: string;
    description: string;
    deadline: Date;
    status: 'compliant' | 'pending' | 'non_compliant';
    affectedFacilities: string[];
  }>;
  
  // Reporting
  reportsDue: Array<{
    reportType: string;
    dueDate: Date;
    facilities: string[];
    status: 'pending' | 'submitted';
  }>;
  
  // Audits
  upcomingAudits: Array<{
    facilityId: string;
    auditType: string;
    scheduledDate: Date;
    auditor: string;
  }>;
}

export interface ConsolidatedInventory {
  itemId: string;
  itemName: string;
  category: string;
  
  // Total Across Facilities
  totalQuantity: number;
  totalValue: number;
  
  // By Facility
  facilityBreakdown: Array<{
    facilityId: string;
    facilityName: string;
    quantity: number;
    value: number;
    lastUpdated: Date;
  }>;
  
  // Movement
  recentTransfers: Array<{
    fromFacility: string;
    toFacility: string;
    quantity: number;
    date: Date;
  }>;
  
  // Optimization
  suggestedRedistribution?: Array<{
    fromFacility: string;
    toFacility: string;
    quantity: number;
    reason: string;
  }>;
}

class MultiSiteManagementSystem extends EventEmitter {
  private userId: string;
  private facilities: Map<string, FacilityProfile> = new Map();

  constructor(userId: string) {
    super();
    this.userId = userId;
    this.initializeSystem();
  }

  /**
   * Initialize multi-site system
   */
  private async initializeSystem(): Promise<void> {
    try {
      await this.loadFacilities();
      this.startCrossFacilitySync();
    } catch (error) {
      logger.error('api', 'Failed to initialize multi-site system:', error );
    }
  }
}