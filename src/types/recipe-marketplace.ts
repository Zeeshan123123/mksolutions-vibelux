/**
 * Recipe Marketplace Types
 * TypeScript interfaces for the cultivation recipe marketplace
 */

import { StrainType, DifficultyLevel, PurchaseType, UsageRights, ExecutionStatus, CorrelationType } from '@prisma/client';

// ====================================================================
// CORE RECIPE INTERFACES
// ====================================================================

export interface CultivationRecipeData {
  id: string;
  name: string;
  description?: string;
  strainName: string;
  strainType: StrainType;
  difficulty: DifficultyLevel;
  isPublic: boolean;
  isVerified: boolean;
  tags: string[];
  
  // Recipe protocol data
  lighting: LightingProtocol;
  nutrients: NutrientProtocol;
  environment: EnvironmentalProtocol;
  training: TrainingProtocol;
  harvestTiming: HarvestProtocol;
  drying: DryingProtocol;
  curing: CuringProtocol;
  
  // Results and validation
  results: RecipeResults;
  verification: RecipeVerification;
  pricing: RecipePricing;
  
  // Metadata
  creator: {
    id: string;
    name: string;
    reputation: number;
    verified: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// LIGHTING PROTOCOL
// ====================================================================

export interface LightingProtocol {
  vegetative: {
    spectrum: SpectrumProfile;
    ppfd: PPFDSchedule;
    photoperiod: string;
    ramp: RampSettings;
  };
  flowering: WeeklyLightingSchedule[];
  specialProtocols?: SpecialLightingProtocol[];
}

export interface SpectrumProfile {
  blue: number;      // 400-500nm percentage
  green: number;     // 500-600nm percentage
  red: number;       // 600-700nm percentage
  farRed: number;    // 700-800nm percentage
  uvA: number;       // 315-400nm percentage
  uvB: number;       // 280-315nm percentage
}

export interface PPFDSchedule {
  target: number;                    // μmol/m²/s
  dailySchedule: DailyLightCurve[];
  rampUp?: number;                   // minutes
  rampDown?: number;                 // minutes
}

export interface DailyLightCurve {
  time: string;      // "06:00"
  intensity: number; // 0-100% of target PPFD
}

export interface RampSettings {
  sunrise: number;   // minutes
  sunset: number;    // minutes
  curve: 'linear' | 'sigmoid' | 'exponential';
}

export interface WeeklyLightingSchedule {
  week: number;
  spectrum: SpectrumProfile;
  ppfd: PPFDSchedule;
  photoperiod: string;
  notes?: string;
}

export interface SpecialLightingProtocol {
  name: string;
  timing: string;
  duration: string;
  purpose: string;
  settings: Record<string, any>;
}

// ====================================================================
// NUTRIENT PROTOCOL
// ====================================================================

export interface NutrientProtocol {
  medium: 'hydro' | 'soil' | 'coco' | 'rockwool' | 'aeroponic';
  baseNutrients: NutrientProduct[];
  supplements: NutrientSupplement[];
  schedule: WeeklyNutrientSchedule[];
  flushProtocol: FlushProtocol;
}

export interface NutrientProduct {
  brand: string;
  product: string;
  npk: string;        // "20-20-20"
  dosagePerGallon: number;
  timing: string[];   // ["vegetative", "early_flower"]
}

export interface NutrientSupplement {
  name: string;
  purpose: string;
  dosage: string;
  timing: string;
  optional: boolean;
}

export interface WeeklyNutrientSchedule {
  week: number;
  stage: string;
  ec: number;         // Electrical conductivity
  ph: number;         // pH target
  ppm: number;        // Total dissolved solids
  ratios: NPKRatios;
  feedingFrequency: string;
  notes?: string;
}

export interface NPKRatios {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
}

export interface FlushProtocol {
  duration: number;   // days
  method: string;
  finalEC: number;
  pHAdjustment: string;
}

// ====================================================================
// ENVIRONMENTAL PROTOCOL
// ====================================================================

export interface EnvironmentalProtocol {
  vegetative: EnvironmentalStage;
  flowering: EnvironmentalStage;
  drying: EnvironmentalStage;
  curing: EnvironmentalStage;
}

export interface EnvironmentalStage {
  temperature: TemperatureRange;
  humidity: HumidityRange;
  vpd: VPDRange;
  co2: CO2Settings;
  airflow: AirflowSettings;
}

export interface TemperatureRange {
  day: number;        // Celsius
  night: number;      // Celsius
  tolerance: number;  // ± degrees
}

export interface HumidityRange {
  target: number;     // % RH
  min: number;        // % RH
  max: number;        // % RH
}

export interface VPDRange {
  target: number;     // kPa
  min: number;        // kPa
  max: number;        // kPa
}

export interface CO2Settings {
  ppm: number;
  schedule: string;
  rampUp?: boolean;
}

export interface AirflowSettings {
  velocity: number;   // m/s
  pattern: string;
  exhaustSchedule?: string;
}

// ====================================================================
// TRAINING & TECHNIQUES
// ====================================================================

export interface TrainingProtocol {
  methods: TrainingMethod[];
  canopyManagement: CanopyManagement;
  scheduleByWeek: WeeklyTrainingSchedule[];
}

export interface TrainingMethod {
  technique: 'topping' | 'lst' | 'scrog' | 'sog' | 'defoliation' | 'lollipopping' | 'supercropping';
  timing: string;
  instructions: string;
  recoveryTime: number;   // days
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CanopyManagement {
  targetHeight: number;   // cm
  branchTraining: string;
  lightPenetration: string;
  leafRemoval: string;
}

export interface WeeklyTrainingSchedule {
  week: number;
  techniques: string[];
  notes: string;
}

// ====================================================================
// HARVEST & POST-PROCESSING
// ====================================================================

export interface HarvestProtocol {
  timing: HarvestTiming;
  preparation: string[];
  method: string;
  qualityIndicators: string[];
}

export interface HarvestTiming {
  trichomeRatio: string;      // "70% cloudy, 20% amber"
  pistilColor: string;
  timeOfDay: string;
  environmentalConditions: string;
}

export interface DryingProtocol {
  temperature: number;        // Celsius
  humidity: number;           // % RH
  airflow: string;
  duration: string;
  milestones: DryingMilestone[];
}

export interface DryingMilestone {
  day: number;
  checkpoints: string[];
  adjustments?: string[];
}

export interface CuringProtocol {
  humidity: number;           // % RH
  temperature: number;        // Celsius
  burpingSchedule: BurpingSchedule[];
  duration: number;           // weeks
  qualityChecks: string[];
}

export interface BurpingSchedule {
  week: number;
  frequency: string;
  duration: string;          // minutes per burp
}

// ====================================================================
// RESULTS & VERIFICATION
// ====================================================================

export interface RecipeResults {
  yield: YieldMetrics;
  quality: QualityMetrics;
  consistency: ConsistencyMetrics;
  labResults?: LabResults[];
}

export interface YieldMetrics {
  totalGrams: number;
  gramsPerWatt: number;
  gramsPerSqft: number;
  dryWeight: number;
  wetWeight: number;
}

export interface QualityMetrics {
  thcPercentage: number;
  cbdPercentage: number;
  totalCannabinoids: number;
  terpeneProfile: TerpeneData[];
  visualQuality: number;      // 1-10 scale
  aromaIntensity: number;     // 1-10 scale
}

export interface TerpeneData {
  name: string;
  percentage: number;
  preservationScore: number;  // How well preserved vs fresh
}

export interface ConsistencyMetrics {
  runsCompleted: number;
  yieldVariance: number;      // % variation
  qualityVariance: number;    // % variation
  successRate: number;        // % of successful runs
}

export interface LabResults {
  labName: string;
  testDate: Date;
  coaUrl: string;
  batchId: string;
  results: Record<string, number>;
}

// ====================================================================
// VERIFICATION & PRICING
// ====================================================================

export interface RecipeVerification {
  status: 'unverified' | 'pending' | 'verified' | 'certified';
  verifiedBy?: string;
  verificationDate?: Date;
  thirdPartyValidated: boolean;
  replicationCount: number;
  peerReviews: number;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface RecipePricing {
  licenseType: PurchaseType;
  basePrice: number;
  royaltyPercentage?: number;
  usageRights: UsageRights;
  territory: string[];
  exclusivity: boolean;
  bulkDiscounts?: BulkDiscount[];
}

export interface BulkDiscount {
  quantity: number;
  discountPercentage: number;
}

// ====================================================================
// SEARCH & FILTERING
// ====================================================================

export interface RecipeSearchFilters {
  strainType?: StrainType[];
  difficulty?: DifficultyLevel[];
  thcRange?: [number, number];
  cbdRange?: [number, number];
  yieldRange?: [number, number];     // grams per sqft
  priceRange?: [number, number];
  verified?: boolean;
  terpenes?: string[];
  techniques?: string[];
  growingMedium?: string[];
  creator?: string;
  tags?: string[];
}

export interface RecipeSearchResult {
  recipes: CultivationRecipeData[];
  totalCount: number;
  filters: SearchFilterOptions;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchFilterOptions {
  availableStrainTypes: StrainType[];
  priceRange: [number, number];
  yieldRange: [number, number];
  popularTerpenes: string[];
  availableTechniques: string[];
}

// ====================================================================
// EXECUTION TRACKING
// ====================================================================

export interface RecipeExecutionData {
  id: string;
  recipeId: string;
  status: ExecutionStatus;
  startDate: Date;
  expectedHarvestDate?: Date;
  actualHarvestDate?: Date;
  
  adherenceScore?: number;    // 0-100%
  deviations: RecipeDeviation[];
  environmentalLogs: EnvironmentalLogEntry[];
  
  actualResults?: RecipeResults;
  feedback?: string;
}

export interface RecipeDeviation {
  parameter: string;
  targetValue: number | string;
  actualValue: number | string;
  week: number;
  impact: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface EnvironmentalLogEntry {
  timestamp: Date;
  temperature: number;
  humidity: number;
  vpd: number;
  co2: number;
  ppfd: number;
  spectrum?: SpectrumProfile;
}

// ====================================================================
// CORRELATION DISCOVERY
// ====================================================================

export interface RecipeCorrelationData {
  id: string;
  type: CorrelationType;
  parameter: string;        // "red_light_percentage"
  outcome: string;          // "thc_percentage"
  correlation: number;      // -1 to 1
  confidence: number;       // 0 to 1
  sampleSize: number;
  discoveredAt: Date;
  validated: boolean;
}

export interface CorrelationInsight {
  title: string;
  description: string;
  correlation: RecipeCorrelationData;
  actionableRecommendation: string;
  expectedImpact: string;
  confidenceLevel: 'low' | 'medium' | 'high';
}

// ====================================================================
// RECIPE MARKETPLACE API
// ====================================================================

export interface RecipeMarketplaceAPI {
  // Recipe Discovery
  searchRecipes: (filters: RecipeSearchFilters) => Promise<RecipeSearchResult>;
  getRecipeById: (id: string) => Promise<CultivationRecipeData>;
  getFeaturedRecipes: () => Promise<CultivationRecipeData[]>;
  getPopularRecipes: () => Promise<CultivationRecipeData[]>;
  
  // Recipe Management
  createRecipe: (recipe: Partial<CultivationRecipeData>) => Promise<CultivationRecipeData>;
  updateRecipe: (id: string, updates: Partial<CultivationRecipeData>) => Promise<CultivationRecipeData>;
  deleteRecipe: (id: string) => Promise<void>;
  
  // Purchase & Licensing
  purchaseRecipe: (recipeId: string, licenseType: PurchaseType) => Promise<string>; // Returns payment URL
  getUserPurchases: () => Promise<RecipePurchaseData[]>;
  
  // Execution Tracking
  startExecution: (recipeId: string) => Promise<RecipeExecutionData>;
  updateExecution: (executionId: string, data: Partial<RecipeExecutionData>) => Promise<RecipeExecutionData>;
  getExecutionHistory: () => Promise<RecipeExecutionData[]>;
  
  // Reviews & Ratings
  addReview: (recipeId: string, review: RecipeReviewData) => Promise<void>;
  getRecipeReviews: (recipeId: string) => Promise<RecipeReviewData[]>;
  
  // Correlations & Insights
  getCorrelations: (recipeId: string) => Promise<RecipeCorrelationData[]>;
  getInsights: () => Promise<CorrelationInsight[]>;
}

export interface RecipePurchaseData {
  id: string;
  recipeId: string;
  recipe: CultivationRecipeData;
  purchaseType: PurchaseType;
  amount: number;
  usageRights: UsageRights;
  purchasedAt: Date;
}

export interface RecipeReviewData {
  id: string;
  rating: number;           // 1-5 stars
  title?: string;
  content: string;
  yieldRating?: number;
  qualityRating?: number;
  clarityRating?: number;
  verified: boolean;
  helpful: number;
  reviewer: {
    name: string;
    verified: boolean;
  };
  createdAt: Date;
}