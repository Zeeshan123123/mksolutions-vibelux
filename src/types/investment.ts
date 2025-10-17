export enum InvestmentType {
  GAAS = 'GAAS',
  YEP = 'YEP',
  HYBRID = 'HYBRID'
}

export interface Investment {
  id: string;
  investorId: string;
  userId?: string; 
  facilityId: string;
  investmentType: InvestmentType;
  status: DealStatus;
  totalInvestmentAmount: number;
  equipmentValue: number;
  amount?: number;
  currency?: string;
  contractStartDate: Date;
  contractEndDate: Date;
  contractTermMonths: number;
  paymentFrequency: PaymentFrequency;
  monthlyServiceFee: number;
  yieldSharePercentage: number;
  baselineYield: number;
  targetYieldImprovement: number;
  targetEnergyReduction: number;
  minimumPerformanceThreshold: number;
  riskScore: number;
  projectedIRR: number;
  projectedPaybackMonths: number;
  facility?: Facility;
  performanceRecords?: PerformanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  investmentId: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentType: 'service_fee' | 'yield_share' | 'equipment';
}

export interface InvestmentRound {
  id: string;
  name: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate: Date;
  minimumInvestment: number;
  status: 'open' | 'closed' | 'upcoming';
}

export interface Investor {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  investorType: InvestorType;
  totalCapitalAvailable: number;
  totalCapitalDeployed: number;
  preferredInvestmentSizeMin: number;
  preferredInvestmentSizeMax: number;
  targetIRR: number;
  riskTolerance: RiskTolerance;
  preferredFacilityTypes: string[];
  preferredCropTypes: string[];
  active: boolean;
  verified: boolean;
  totalInvested?: number;
  investments?: Investment[];
  tier?: 'seed' | 'angel' | 'series-a' | 'series-b';
  createdAt: Date;
  updatedAt: Date;
}

// Additional types for investment data generator
export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
  ANGEL = 'ANGEL',
  VENTURE_CAPITAL = 'VENTURE_CAPITAL',
  FAMILY_OFFICE = 'FAMILY_OFFICE',
  STRATEGIC = 'STRATEGIC',
  RETAIL = 'RETAIL'
}

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE',
  HIGH = 'HIGH'
}

export enum DealStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PROSPECTING = 'PROSPECTING',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  NEGOTIATION = 'NEGOTIATION',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY'
}

export interface PerformanceRecord {
  id: string;
  investmentId: string;
  facilityId: string;
  recordDate: Date;
  cycleNumber: number;
  actualYieldPerSqft: number;
  baselineYieldPerSqft: number;
  yieldImprovementPercentage: number;
  thcPercentage?: number;
  qualityScore: number;
  avgTemperature: number;
  avgHumidity: number;
  avgCo2Ppm: number;
  avgPpfd: number;
  avgDli: number;
  kwhConsumed: number;
  kwhPerGram: number;
  waterGalConsumed: number;
  revenueGenerated: number;
  yepPaymentDue: number;
  energyCostSavings: number;
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  location: string;
  facilityType: 'greenhouse' | 'indoor' | 'vertical';
  totalCanopySqft: number;
  activeGrowSqft: number;
  numberOfRooms: number;
  climateZones: number;
  currentYieldPerSqft: number;
  currentCyclesPerYear: number;
  currentEnergyUsageKwh: number;
  currentWaterUsageGal: number;
  currentLightingType: 'HPS' | 'LED' | 'CMH' | 'Hybrid';
  currentPpfdAverage: number;
  currentDliAverage: number;
  yearsInOperation: number;
  annualRevenue: number;
  operatingMargin: number;
  pricePerGram: number;
  complianceScore: number;
  facilityConditionScore: number;
  managementExperienceYears: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface YieldBaseline {
  id: string;
  facilityId: string;
  cropType: string;
  yieldPerSqft: number;
  qualityMetrics: Record<string, number>;
  baselineDate: Date;
}

export interface Payment {
  id: string;
  investmentId: string;
  amount: number;
  currency: string;
  date: Date;
  status: string;
  paymentType: string;
  transactionId?: string;
}

export interface PortfolioMetrics {
  id: string;
  investorId: string;
  totalInvestments: number;
  totalCapitalDeployed: number;
  totalMonthlyRevenue: number;
  portfolioIRR: number;
  avgYieldImprovement: number;
  avgEnergyReduction: number;
  portfolioRiskScore: number;
  concentrationRisk: number;
  gaasInvestments: number;
  yepInvestments: number;
  gaasRevenue: number;
  yepRevenue: number;
  totalRevenueToDate: number;
  bestPerformingFacility: string;
  worstPerformingFacility: string;
  lastUpdated: Date;
}

export interface InvestmentProposal {
  id: string;
  investorId: string;
  facilityId: string;
  proposedInvestmentType: InvestmentType;
  proposedAmount: number;
  proposedTerms: Record<string, any>;
  status: DealStatus;
  createdAt: Date;
}