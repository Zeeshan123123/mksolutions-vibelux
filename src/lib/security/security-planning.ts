// Enhanced Security Planning Module
// Builds on existing security infrastructure to provide formal planning capabilities

import { AccessZone, Camera, Door, SecurityLevel, ZoneType, SecurityMetrics, IncidentType } from './security-types';

// Security Plan Types
export interface SecurityPlan {
  id: string;
  facilityId: string;
  version: string;
  status: SecurityPlanStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  effectiveDate: Date;
  expiryDate?: Date;
  
  // Plan Components
  executiveSummary: string;
  riskAssessment: RiskAssessment;
  physicalSecurity: PhysicalSecurityPlan;
  personnelSecurity: PersonnelSecurityPlan;
  operationalProcedures: OperationalProcedures;
  emergencyProtocols: EmergencyProtocols;
  complianceMatrix: ComplianceMatrix;
  implementationPlan: ImplementationPlan;
  
  // State/Regulatory Specific
  jurisdictionRequirements: JurisdictionRequirements;
  regulatoryCompliance: RegulatoryCompliance;
}

export interface RiskAssessment {
  id: string;
  facilityId: string;
  assessmentDate: Date;
  assessorName: string;
  assessorCredentials: string;
  
  // Risk Categories
  threats: ThreatAnalysis[];
  vulnerabilities: VulnerabilityAnalysis[];
  riskMatrix: RiskMatrix;
  mitigationStrategies: MitigationStrategy[];
  
  // Scoring
  overallRiskScore: number;
  categoryScores: {
    physical: number;
    personnel: number;
    operational: number;
    cyber: number;
    regulatory: number;
  };
  
  recommendations: Recommendation[];
  nextAssessmentDate: Date;
}

export interface ThreatAnalysis {
  id: string;
  category: ThreatCategory;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  sources: string[];
  indicators: string[];
  mitigationMeasures: string[];
}

export interface VulnerabilityAnalysis {
  id: string;
  area: VulnerabilityArea;
  description: string;
  severity: RiskLevel;
  exploitability: RiskLevel;
  currentControls: string[];
  gaps: string[];
  recommendations: string[];
}

export interface PhysicalSecurityPlan {
  id: string;
  perimeterSecurity: PerimeterSecurity;
  accessControl: AccessControlPlan;
  surveillance: SurveillancePlan;
  lighting: LightingPlan;
  barriers: BarrierPlan;
  alarmSystems: AlarmSystemPlan;
  
  // Zone-based Security
  securityZones: SecurityZoneDefinition[];
  transitionalAreas: TransitionalArea[];
  
  // Physical Layout Integration
  facilityLayout: FacilityLayout;
  securityCheckpoints: SecurityCheckpoint[];
}

export interface AccessControlPlan {
  id: string;
  philosophy: string;
  credentialingSystem: CredentialingSystem;
  accessLevels: AccessLevelDefinition[];
  visititorManagement: VisitorManagementPlan;
  contractorAccess: ContractorAccessPlan;
  emergencyAccess: EmergencyAccessPlan;
  
  // Technical Systems
  badgeSystem: BadgeSystemSpec;
  biometricSystems: BiometricSystemSpec[];
  lockingMechanisms: LockingMechanismSpec[];
  
  // Procedures
  enrollmentProcedures: string[];
  maintenanceProcedures: string[];
  auditProcedures: string[];
}

export interface SurveillancePlan {
  id: string;
  coverageRequirements: CoverageRequirement[];
  cameraSpecifications: CameraSpecification[];
  recordingRequirements: RecordingRequirements;
  monitoringProcedures: MonitoringProcedures;
  
  // Analytics & Intelligence
  videoAnalytics: VideoAnalyticsSpec;
  alertManagement: AlertManagementSpec;
  
  // Compliance
  retentionPolicies: RetentionPolicy[];
  privacyProtections: PrivacyProtection[];
  auditRequirements: AuditRequirement[];
}

export interface PersonnelSecurityPlan {
  id: string;
  backgroundChecks: BackgroundCheckPolicy;
  trainingProgram: SecurityTrainingProgram;
  certificationRequirements: CertificationRequirement[];
  continuousMonitoring: ContinuousMonitoringProgram;
  
  // Role-Based Security
  securityRoles: SecurityRole[];
  responsibilityMatrix: ResponsibilityMatrix;
  
  // Insider Threat Program
  insiderThreatProgram: InsiderThreatProgram;
  reportingMechanisms: ReportingMechanism[];
}

export interface OperationalProcedures {
  id: string;
  dailyOperations: DailySecurityOperations;
  shiftChangeProcedures: ShiftChangeProcedure[];
  keyManagement: KeyManagementProcedure;
  inventoryControls: InventoryControlProcedure;
  
  // Cannabis-Specific
  seedToSaleTracking: SeedToSaleTrackingProcedure;
  transportSecurity: TransportSecurityProcedure;
  wasteDisposal: WasteDisposalProcedure;
  
  // Quality Assurance
  auditProcedures: AuditProcedure[];
  correctionActions: CorrectionActionProcedure[];
}

export interface EmergencyProtocols {
  id: string;
  responseTeam: EmergencyResponseTeam;
  emergencyTypes: EmergencyType[];
  evacuationProcedures: EvacuationProcedure[];
  communicationPlan: CommunicationPlan;
  
  // Coordination
  lawEnforcementCoordination: LawEnforcementCoordination;
  fireEmergencyCoordination: FireEmergencyCoordination;
  medicalEmergencyCoordination: MedicalEmergencyCoordination;
  
  // Recovery
  businessContinuityPlan: BusinessContinuityPlan;
  disasterRecoveryPlan: DisasterRecoveryPlan;
}

export interface ComplianceMatrix {
  id: string;
  applicableRegulations: ApplicableRegulation[];
  complianceStatus: ComplianceStatus[];
  auditSchedule: AuditSchedule;
  documentationRequirements: DocumentationRequirement[];
  
  // State-Specific
  cannabisRegulations: CannabisRegulation[];
  buildingCodes: BuildingCode[];
  fireCodesCompliance: FireCodeCompliance[];
  
  // Certifications
  requiredCertifications: RequiredCertification[];
  certificationStatus: CertificationStatus[];
}

export interface ImplementationPlan {
  id: string;
  phases: ImplementationPhase[];
  timeline: ProjectTimeline;
  budget: SecurityBudget;
  resources: ResourceRequirement[];
  
  // Risk Management
  implementationRisks: ImplementationRisk[];
  mitigationPlans: MitigationPlan[];
  
  // Success Metrics
  kpis: SecurityKPI[];
  testingProcedures: TestingProcedure[];
  validationCriteria: ValidationCriteria[];
}

// Supporting Interfaces
export interface SecurityZoneDefinition {
  id: string;
  name: string;
  type: ZoneType;
  securityLevel: SecurityLevel;
  purpose: string;
  threatLevel: RiskLevel;
  
  // Physical Characteristics
  boundaries: Boundary[];
  entryPoints: EntryPoint[];
  exitPoints: ExitPoint[];
  
  // Security Controls
  requiredControls: SecurityControl[];
  optionalControls: SecurityControl[];
  
  // Operational Requirements
  operatingHours: OperatingHours;
  occupancyLimits: OccupancyLimits;
  specialRequirements: string[];
}

export interface SecurityControl {
  id: string;
  type: SecurityControlType;
  description: string;
  implementation: string;
  effectiveness: number;
  cost: number;
  maintenanceRequirements: string[];
}

export interface Recommendation {
  id: string;
  priority: Priority;
  category: RecommendationCategory;
  description: string;
  rationale: string;
  expectedBenefit: string;
  estimatedCost: number;
  timeline: string;
  implementationSteps: string[];
  successMetrics: string[];
}

export interface SecurityKPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  owner: string;
  
  // Calculation
  formula: string;
  dataSource: string;
  
  // Thresholds
  greenThreshold: number;
  yellowThreshold: number;
  redThreshold: number;
}

// Enums
export enum SecurityPlanStatus {
  Draft = 'Draft',
  Review = 'Under Review',
  Approved = 'Approved',
  Active = 'Active',
  Expired = 'Expired',
  Superseded = 'Superseded'
}

export enum ThreatCategory {
  External = 'External Threats',
  Internal = 'Internal Threats',
  Natural = 'Natural Disasters',
  Cyber = 'Cyber Threats',
  Operational = 'Operational Threats',
  Regulatory = 'Regulatory Threats'
}

export enum VulnerabilityArea {
  Physical = 'Physical Security',
  Personnel = 'Personnel Security',
  Information = 'Information Security',
  Operational = 'Operational Security',
  Technical = 'Technical Security'
}

export enum RiskLevel {
  VeryLow = 'Very Low',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'Very High'
}

export enum SecurityControlType {
  Physical = 'Physical',
  Technical = 'Technical',
  Administrative = 'Administrative',
  Procedural = 'Procedural'
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum RecommendationCategory {
  Physical = 'Physical Security',
  Personnel = 'Personnel Security',
  Procedures = 'Procedures',
  Technology = 'Technology',
  Training = 'Training',
  Compliance = 'Compliance'
}

// Additional supporting interfaces would continue...
// This provides the foundation for comprehensive security planning

export interface SecurityPlanningService {
  createSecurityPlan(facilityId: string, requirements: SecurityRequirements): Promise<SecurityPlan>;
  conductRiskAssessment(facilityId: string): Promise<RiskAssessment>;
  generateRecommendations(riskAssessment: RiskAssessment): Promise<Recommendation[]>;
  validateCompliance(plan: SecurityPlan, jurisdiction: string): Promise<ComplianceResult>;
  generateImplementationPlan(plan: SecurityPlan): Promise<ImplementationPlan>;
  exportSecurityPlan(planId: string, format: 'pdf' | 'word' | 'excel'): Promise<Buffer>;
}

// State-specific requirements interfaces
export interface JurisdictionRequirements {
  state: string;
  county?: string;
  city?: string;
  regulatoryBody: string;
  
  // Cannabis-specific
  cannabisLicenseType: string;
  securityRequirements: StateSecurityRequirement[];
  auditRequirements: StateAuditRequirement[];
  reportingRequirements: StateReportingRequirement[];
}

export interface StateSecurityRequirement {
  id: string;
  requirement: string;
  description: string;
  mandatory: boolean;
  penaltyForNonCompliance: string;
  implementationGuidance: string;
  relatedControls: string[];
}

// This structure provides a comprehensive foundation for formal security planning
// while building on the existing security infrastructure in the VibeLux platform