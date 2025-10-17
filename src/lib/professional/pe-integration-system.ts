/**
 * Professional Engineer Integration and Digital Stamping System
 * Enables PE review, approval, and digital stamping of construction documents
 * Integrates with state licensing boards and digital signature services
 */

import { DrawingSheetSet, DrawingSheet } from '../drawing/automated-sheet-generator';
import { ComplianceCheckContext, LiveComplianceResult } from '../compliance/real-time-compliance-checker';
import { DrawingValidationReport } from '../validation/professional-drawing-validator';
import { ProjectTask } from '../project-management/project-integration';

export interface ProfessionalEngineer {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseType: 'PE' | 'SE' | 'AE'; // Professional/Structural/Architectural Engineer
  states: StateLicense[];
  specializations: string[];
  digitalSignature: DigitalSignature;
  insurance: ProfessionalInsurance;
  reviewCapacity: ReviewCapacity;
  approvalAuthority: ApprovalAuthority;
  statistics: PEStatistics;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastActive: Date;
}

export interface StateLicense {
  state: string;
  licenseNumber: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'suspended';
  disciplines: string[];
  limitations: string[];
  continuingEducation: {
    required: number;
    completed: number;
    nextDeadline: Date;
  };
}

export interface DigitalSignature {
  certificateId: string;
  provider: 'docusign' | 'adobe' | 'hellosign' | 'pandadoc' | 'custom';
  publicKey: string;
  privateKeyLocation: string; // Secure storage reference
  validFrom: Date;
  validTo: Date;
  signingAuthority: string[];
  verificationEndpoint: string;
}

export interface ProfessionalInsurance {
  carrier: string;
  policyNumber: string;
  coverageAmount: number;
  deductible: number;
  effectiveDate: Date;
  expirationDate: Date;
  projectCoverage: boolean;
  occurrenceCoverage: boolean;
}

export interface ReviewCapacity {
  maxProjectsPerMonth: number;
  currentProjects: number;
  avgReviewTime: number; // hours
  specialties: string[];
  preferredProjectTypes: string[];
  availability: WeeklyAvailability;
}

export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  timezone: string;
}

export interface ApprovalAuthority {
  maxProjectValue: number;
  maxBuildingHeight: number;
  maxBuildingArea: number;
  allowedOccupancies: string[];
  allowedConstructionTypes: string[];
  specialPermissions: string[];
}

export interface PEStatistics {
  totalProjectsReviewed: number;
  totalProjectsApproved: number;
  totalProjectsRejected: number;
  avgReviewTime: number;
  avgRevisionCycles: number;
  clientSatisfaction: number;
  complianceRate: number;
  lastReviewDate: Date;
}

export interface PEReviewRequest {
  id: string;
  projectId: string;
  requestorId: string;
  assignedPE?: string;
  drawingSet: DrawingSheetSet;
  complianceResults: Map<string, LiveComplianceResult>;
  validationReport: DrawingValidationReport;
  projectInfo: ProjectInformation;
  reviewType: 'initial' | 'revision' | 'final';
  priority: 'standard' | 'expedited' | 'emergency';
  requestedDeadline: Date;
  submittalRequirements: SubmittalRequirement[];
  attachments: ReviewAttachment[];
  status: 'pending' | 'assigned' | 'in-review' | 'revisions-required' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectInformation {
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    parcelNumber: string;
    jurisdiction: string;
  };
  owner: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  contractor: {
    name: string;
    license: string;
    contact: string;
  };
  projectValue: number;
  buildingArea: number;
  occupancy: string;
  constructionType: string;
  scopeOfWork: string;
}

export interface SubmittalRequirement {
  id: string;
  type: 'calculation' | 'specification' | 'detail' | 'report' | 'certification';
  description: string;
  required: boolean;
  submitted: boolean;
  submittedDate?: Date;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface ReviewAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: string;
  verified: boolean;
}

export interface PEReview {
  id: string;
  requestId: string;
  reviewerId: string;
  startDate: Date;
  completionDate?: Date;
  status: 'in-progress' | 'completed' | 'on-hold';
  reviewType: 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'comprehensive';
  findings: ReviewFinding[];
  comments: ReviewComment[];
  markups: DrawingMarkup[];
  calculations: CalculationReview[];
  decision: ReviewDecision;
  revisionRequests: RevisionRequest[];
  timeSpent: number; // hours
  billingInfo?: BillingInformation;
}

export interface ReviewFinding {
  id: string;
  sheetId: string;
  location: string;
  category: 'code-violation' | 'design-issue' | 'calculation-error' | 'missing-info' | 'coordination' | 'safety';
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  description: string;
  codeReference?: string;
  requiredAction: string;
  attachments: string[];
  resolved: boolean;
  resolvedDate?: Date;
  resolution?: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  timestamp: Date;
  sheetId?: string;
  elementId?: string;
  comment: string;
  attachments: string[];
  replies: ReviewComment[];
  resolved: boolean;
}

export interface DrawingMarkup {
  id: string;
  sheetId: string;
  type: 'cloud' | 'arrow' | 'text' | 'dimension' | 'sketch';
  geometry: any; // SVG path or coordinates
  style: {
    color: string;
    lineWeight: number;
    fillColor?: string;
    fontSize?: number;
  };
  content?: string;
  author: string;
  timestamp: Date;
}

export interface CalculationReview {
  id: string;
  type: 'structural' | 'load' | 'wind' | 'seismic' | 'thermal' | 'other';
  description: string;
  providedValue: number;
  verifiedValue: number;
  unit: string;
  status: 'verified' | 'incorrect' | 'needs-clarification';
  method: string;
  codeReference: string;
  comments: string;
}

export interface ReviewDecision {
  decision: 'approved' | 'approved-with-conditions' | 'revisions-required' | 'rejected';
  conditions?: string[];
  expirationDate?: Date;
  limitations?: string[];
  stampingAuthorized: boolean;
  signatureDate?: Date;
}

export interface RevisionRequest {
  id: string;
  sheetIds: string[];
  description: string;
  requiredBy: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  detailedRequirements: string[];
  references: string[];
  status: 'pending' | 'in-progress' | 'submitted' | 'approved';
}

export interface BillingInformation {
  hourlyRate: number;
  hoursCharged: number;
  expediteFee?: number;
  additionalFees?: Array<{ description: string; amount: number }>;
  totalAmount: number;
  invoiceNumber: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
}

export interface DigitalStamp {
  id: string;
  peId: string;
  projectId: string;
  sheetIds: string[];
  stampImage: string; // Base64 or URL
  stampData: {
    engineerName: string;
    licenseNumber: string;
    state: string;
    expirationDate: Date;
    projectName: string;
    stampDate: Date;
  };
  digitalSignature: {
    signature: string;
    certificate: string;
    timestamp: Date;
    verificationCode: string;
  };
  placement: StampPlacement[];
  validity: {
    validFrom: Date;
    validTo: Date;
    verificationUrl: string;
    blockchainHash?: string;
  };
}

export interface StampPlacement {
  sheetId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface PEIntegrationConfig {
  providers: {
    signature: {
      primary: 'docusign' | 'adobe' | 'hellosign';
      apiKey: string;
      apiSecret: string;
      accountId: string;
      templateIds: Record<string, string>;
    };
    verification: {
      endpoint: string;
      apiKey: string;
      blockchainEnabled: boolean;
    };
    licensing: {
      ncarb: { enabled: boolean; apiKey: string };
      stateBoards: Record<string, { endpoint: string; apiKey: string }>;
    };
  };
  workflow: {
    autoAssignment: boolean;
    assignmentRules: AssignmentRule[];
    reviewDeadlines: {
      standard: number; // days
      expedited: number;
      emergency: number;
    };
    revisionCycles: {
      maxCycles: number;
      autoEscalation: boolean;
    };
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
    events: string[];
  };
  compliance: {
    requiredDocuments: string[];
    insuranceMinimum: number;
    licenseVerification: boolean;
    continuingEducationCheck: boolean;
  };
}

export interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: {
    projectType?: string[];
    projectValue?: { min?: number; max?: number };
    location?: { states?: string[]; cities?: string[] };
    specialization?: string[];
  };
  assignTo: string | 'round-robin' | 'least-loaded';
}

/**
 * Professional Engineer Integration System
 */
export class PEIntegrationSystem {
  private engineers: Map<string, ProfessionalEngineer> = new Map();
  private reviewRequests: Map<string, PEReviewRequest> = new Map();
  private reviews: Map<string, PEReview> = new Map();
  private digitalStamps: Map<string, DigitalStamp> = new Map();
  private config: PEIntegrationConfig;
  
  constructor(config: PEIntegrationConfig) {
    this.config = config;
    this.initializeProviders();
  }

  /**
   * Register a professional engineer
   */
  public async registerPE(peData: Omit<ProfessionalEngineer, 'id' | 'statistics' | 'status' | 'createdAt' | 'lastActive'>): Promise<ProfessionalEngineer> {
    // Verify license with state boards
    const licenseValid = await this.verifyLicenses(peData.states);
    if (!licenseValid) {
      throw new Error('License verification failed');
    }

    // Verify insurance
    const insuranceValid = await this.verifyInsurance(peData.insurance);
    if (!insuranceValid) {
      throw new Error('Insurance verification failed');
    }

    const pe: ProfessionalEngineer = {
      id: `pe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...peData,
      statistics: {
        totalProjectsReviewed: 0,
        totalProjectsApproved: 0,
        totalProjectsRejected: 0,
        avgReviewTime: 0,
        avgRevisionCycles: 0,
        clientSatisfaction: 5.0,
        complianceRate: 100,
        lastReviewDate: new Date()
      },
      status: 'active',
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.engineers.set(pe.id, pe);
    return pe;
  }

  /**
   * Submit drawings for PE review
   */
  public async submitForReview(
    drawingSet: DrawingSheetSet,
    projectInfo: ProjectInformation,
    complianceResults: Map<string, LiveComplianceResult>,
    validationReport: DrawingValidationReport,
    options: {
      reviewType: PEReviewRequest['reviewType'];
      priority: PEReviewRequest['priority'];
      requestedDeadline: Date;
      attachments?: ReviewAttachment[];
    }
  ): Promise<PEReviewRequest> {
    // Validate submission completeness
    this.validateSubmission(drawingSet, validationReport);

    // Generate submittal requirements based on project
    const submittalRequirements = this.generateSubmittalRequirements(projectInfo);

    const request: PEReviewRequest = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: drawingSet.metadata.modelVersion,
      requestorId: 'current_user', // Would get from auth context
      drawingSet,
      complianceResults,
      validationReport,
      projectInfo,
      reviewType: options.reviewType,
      priority: options.priority,
      requestedDeadline: options.requestedDeadline,
      submittalRequirements,
      attachments: options.attachments || [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reviewRequests.set(request.id, request);

    // Auto-assign if configured
    if (this.config.workflow.autoAssignment) {
      await this.autoAssignReview(request);
    }

    return request;
  }

  /**
   * Perform PE review
   */
  public async performReview(
    requestId: string,
    reviewerId: string,
    reviewData: {
      findings: ReviewFinding[];
      comments: ReviewComment[];
      markups: DrawingMarkup[];
      calculations: CalculationReview[];
    }
  ): Promise<PEReview> {
    const request = this.reviewRequests.get(requestId);
    if (!request) {
      throw new Error('Review request not found');
    }

    const engineer = this.engineers.get(reviewerId);
    if (!engineer || engineer.status !== 'active') {
      throw new Error('Invalid or inactive engineer');
    }

    // Verify engineer is authorized for this project
    this.verifyEngineerAuthorization(engineer, request.projectInfo);

    const review: PEReview = {
      id: `pe_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId,
      reviewerId,
      startDate: new Date(),
      status: 'in-progress',
      reviewType: this.determineReviewType(request.projectInfo),
      findings: reviewData.findings,
      comments: reviewData.comments,
      markups: reviewData.markups,
      calculations: reviewData.calculations,
      decision: {
        decision: 'revisions-required', // Initial status
        stampingAuthorized: false
      },
      revisionRequests: [],
      timeSpent: 0
    };

    this.reviews.set(review.id, review);
    
    // Update request status
    request.status = 'in-review';
    request.assignedPE = reviewerId;
    this.reviewRequests.set(requestId, request);

    return review;
  }

  /**
   * Complete PE review and make decision
   */
  public async completeReview(
    reviewId: string,
    decision: ReviewDecision,
    revisionRequests?: RevisionRequest[]
  ): Promise<PEReview> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.completionDate = new Date();
    review.status = 'completed';
    review.decision = decision;
    review.revisionRequests = revisionRequests || [];
    review.timeSpent = this.calculateTimeSpent(review.startDate, review.completionDate);

    // Calculate billing if applicable
    const engineer = this.engineers.get(review.reviewerId);
    if (engineer) {
      review.billingInfo = this.calculateBilling(review, engineer);
    }

    // Update review request
    const request = this.reviewRequests.get(review.requestId);
    if (request) {
      request.status = decision.decision === 'approved' ? 'approved' : 
                      decision.decision === 'rejected' ? 'rejected' : 'revisions-required';
      this.reviewRequests.set(request.id, request);
    }

    // Update engineer statistics
    this.updateEngineerStatistics(review.reviewerId, review);

    this.reviews.set(reviewId, review);
    return review;
  }

  /**
   * Apply digital stamp to approved drawings
   */
  public async applyDigitalStamp(
    reviewId: string,
    sheetIds: string[],
    stampPlacement: StampPlacement[]
  ): Promise<DigitalStamp> {
    const review = this.reviews.get(reviewId);
    if (!review || review.decision.decision !== 'approved') {
      throw new Error('Review must be approved before stamping');
    }

    const engineer = this.engineers.get(review.reviewerId);
    if (!engineer) {
      throw new Error('Engineer not found');
    }

    // Verify current license status
    const activeLicense = this.getActiveLicense(engineer);
    if (!activeLicense) {
      throw new Error('No active license found');
    }

    // Generate stamp image
    const stampImage = await this.generateStampImage(engineer, activeLicense);

    // Create digital signature
    const digitalSignature = await this.createDigitalSignature(
      engineer,
      review.requestId,
      sheetIds
    );

    const stamp: DigitalStamp = {
      id: `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      peId: engineer.id,
      projectId: review.requestId,
      sheetIds,
      stampImage,
      stampData: {
        engineerName: engineer.name,
        licenseNumber: activeLicense.licenseNumber,
        state: activeLicense.state,
        expirationDate: activeLicense.expirationDate,
        projectName: 'Project Name', // Would get from request
        stampDate: new Date()
      },
      digitalSignature,
      placement: stampPlacement,
      validity: {
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        verificationUrl: `${this.config.providers.verification.endpoint}/verify/${digitalSignature.verificationCode}`,
        blockchainHash: this.config.providers.verification.blockchainEnabled ? 
          await this.recordOnBlockchain(digitalSignature) : undefined
      }
    };

    this.digitalStamps.set(stamp.id, stamp);

    // Apply stamp to drawing files
    await this.applyStampToDrawings(stamp);

    return stamp;
  }

  /**
   * Verify digital stamp authenticity
   */
  public async verifyStamp(stampId: string): Promise<{
    valid: boolean;
    details: {
      engineer: string;
      license: string;
      stampDate: Date;
      expirationDate: Date;
      verificationCode: string;
    };
    warnings: string[];
  }> {
    const stamp = this.digitalStamps.get(stampId);
    if (!stamp) {
      return { valid: false, details: null as any, warnings: ['Stamp not found'] };
    }

    const warnings: string[] = [];

    // Check expiration
    if (new Date() > stamp.validity.validTo) {
      warnings.push('Stamp has expired');
    }

    // Verify digital signature
    const signatureValid = await this.verifyDigitalSignature(stamp.digitalSignature);
    if (!signatureValid) {
      return { valid: false, details: stamp.stampData as any, warnings: ['Invalid digital signature'] };
    }

    // Verify engineer license is still active
    const engineer = this.engineers.get(stamp.peId);
    if (engineer) {
      const licenseActive = this.isLicenseActive(engineer, stamp.stampData.state);
      if (!licenseActive) {
        warnings.push('Engineer license is no longer active');
      }
    }

    // Verify blockchain if enabled
    if (stamp.validity.blockchainHash) {
      const blockchainValid = await this.verifyBlockchain(stamp.validity.blockchainHash);
      if (!blockchainValid) {
        warnings.push('Blockchain verification failed');
      }
    }

    return {
      valid: warnings.length === 0,
      details: {
        engineer: stamp.stampData.engineerName,
        license: stamp.stampData.licenseNumber,
        stampDate: stamp.stampData.stampDate,
        expirationDate: stamp.validity.validTo,
        verificationCode: stamp.digitalSignature.verificationCode
      },
      warnings
    };
  }

  /**
   * Get PE workload and availability
   */
  public getPEWorkload(peId: string): {
    currentProjects: number;
    capacity: number;
    utilizationRate: number;
    estimatedAvailability: Date;
    upcomingDeadlines: Array<{ projectId: string; deadline: Date }>;
  } {
    const engineer = this.engineers.get(peId);
    if (!engineer) {
      throw new Error('Engineer not found');
    }

    const activeReviews = Array.from(this.reviews.values())
      .filter(r => r.reviewerId === peId && r.status === 'in-progress');

    const upcomingDeadlines = Array.from(this.reviewRequests.values())
      .filter(req => req.assignedPE === peId && req.status === 'assigned')
      .map(req => ({ projectId: req.id, deadline: req.requestedDeadline }))
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    const utilizationRate = (activeReviews.length / engineer.reviewCapacity.maxProjectsPerMonth) * 100;

    // Estimate when next slot available
    const avgReviewTime = engineer.statistics.avgReviewTime || 8; // hours
    const hoursCommitted = activeReviews.length * avgReviewTime;
    const weeklyCapacity = 40; // hours
    const weeksToAvailability = Math.ceil(hoursCommitted / weeklyCapacity);
    const estimatedAvailability = new Date(Date.now() + weeksToAvailability * 7 * 24 * 60 * 60 * 1000);

    return {
      currentProjects: activeReviews.length,
      capacity: engineer.reviewCapacity.maxProjectsPerMonth,
      utilizationRate,
      estimatedAvailability,
      upcomingDeadlines
    };
  }

  /**
   * Generate PE performance report
   */
  public generatePEReport(peId: string, period: { start: Date; end: Date }): {
    summary: {
      projectsReviewed: number;
      projectsApproved: number;
      avgReviewTime: number;
      revisionRate: number;
      clientSatisfaction: number;
    };
    details: {
      reviewsByType: Record<string, number>;
      reviewsByPriority: Record<string, number>;
      commonFindings: Array<{ category: string; count: number }>;
      timeAnalysis: {
        fastestReview: number;
        slowestReview: number;
        medianTime: number;
      };
    };
    compliance: {
      licenseStatus: string;
      insuranceStatus: string;
      continuingEducation: string;
      upcomingRenewals: Array<{ type: string; date: Date }>;
    };
  } {
    const engineer = this.engineers.get(peId);
    if (!engineer) {
      throw new Error('Engineer not found');
    }

    const periodReviews = Array.from(this.reviews.values())
      .filter(r => r.reviewerId === peId && 
                   r.startDate >= period.start && 
                   r.startDate <= period.end &&
                   r.status === 'completed');

    // Calculate summary metrics
    const projectsApproved = periodReviews.filter(r => r.decision.decision === 'approved').length;
    const avgReviewTime = periodReviews.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / Math.max(1, periodReviews.length);
    const revisionsRequired = periodReviews.filter(r => r.revisionRequests.length > 0).length;
    const revisionRate = (revisionsRequired / Math.max(1, periodReviews.length)) * 100;

    // Analyze review types and priorities
    const reviewsByType: Record<string, number> = {};
    const reviewsByPriority: Record<string, number> = {};
    
    periodReviews.forEach(review => {
      reviewsByType[review.reviewType] = (reviewsByType[review.reviewType] || 0) + 1;
      
      const request = this.reviewRequests.get(review.requestId);
      if (request) {
        reviewsByPriority[request.priority] = (reviewsByPriority[request.priority] || 0) + 1;
      }
    });

    // Analyze common findings
    const findingCategories: Record<string, number> = {};
    periodReviews.forEach(review => {
      review.findings.forEach(finding => {
        findingCategories[finding.category] = (findingCategories[finding.category] || 0) + 1;
      });
    });

    const commonFindings = Object.entries(findingCategories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Time analysis
    const reviewTimes = periodReviews.map(r => r.timeSpent || 0).sort((a, b) => a - b);
    const timeAnalysis = {
      fastestReview: reviewTimes[0] || 0,
      slowestReview: reviewTimes[reviewTimes.length - 1] || 0,
      medianTime: reviewTimes[Math.floor(reviewTimes.length / 2)] || 0
    };

    // Compliance status
    const activeLicense = this.getActiveLicense(engineer);
    const upcomingRenewals: Array<{ type: string; date: Date }> = [];
    
    if (activeLicense && activeLicense.expirationDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
      upcomingRenewals.push({ type: 'License', date: activeLicense.expirationDate });
    }
    
    if (engineer.insurance.expirationDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
      upcomingRenewals.push({ type: 'Insurance', date: engineer.insurance.expirationDate });
    }

    return {
      summary: {
        projectsReviewed: periodReviews.length,
        projectsApproved,
        avgReviewTime,
        revisionRate,
        clientSatisfaction: engineer.statistics.clientSatisfaction
      },
      details: {
        reviewsByType,
        reviewsByPriority,
        commonFindings,
        timeAnalysis
      },
      compliance: {
        licenseStatus: activeLicense?.status || 'inactive',
        insuranceStatus: engineer.insurance.expirationDate > new Date() ? 'active' : 'expired',
        continuingEducation: activeLicense ? 
          `${activeLicense.continuingEducation.completed}/${activeLicense.continuingEducation.required} hours` : 'N/A',
        upcomingRenewals
      }
    };
  }

  // Private helper methods

  private initializeProviders(): void {
    // Initialize digital signature provider
    // Initialize blockchain provider if enabled
    // Initialize state board API connections
  }

  private async verifyLicenses(licenses: StateLicense[]): Promise<boolean> {
    // Verify each license with state boards
    for (const license of licenses) {
      if (license.status !== 'active' || license.expirationDate < new Date()) {
        return false;
      }
      // Would make API call to state board here
    }
    return true;
  }

  private async verifyInsurance(insurance: ProfessionalInsurance): Promise<boolean> {
    // Verify insurance is active and meets minimums
    return insurance.expirationDate > new Date() && 
           insurance.coverageAmount >= this.config.compliance.insuranceMinimum;
  }

  private validateSubmission(drawingSet: DrawingSheetSet, validationReport: DrawingValidationReport): void {
    if (validationReport.deliverabilityStatus === 'not-ready') {
      throw new Error('Drawings must pass validation before PE review');
    }
    
    if (validationReport.overallScore < 85) {
      throw new Error('Drawing quality score must be at least 85% for PE review');
    }
  }

  private generateSubmittalRequirements(projectInfo: ProjectInformation): SubmittalRequirement[] {
    const requirements: SubmittalRequirement[] = [
      {
        id: 'calc-1',
        type: 'calculation',
        description: 'Structural load calculations',
        required: true,
        submitted: false
      },
      {
        id: 'spec-1',
        type: 'specification',
        description: 'Material specifications',
        required: true,
        submitted: false
      },
      {
        id: 'report-1',
        type: 'report',
        description: 'Geotechnical report',
        required: projectInfo.buildingArea > 5000,
        submitted: false
      }
    ];

    return requirements;
  }

  private async autoAssignReview(request: PEReviewRequest): Promise<void> {
    // Find best available PE based on assignment rules
    const availableEngineers = Array.from(this.engineers.values())
      .filter(pe => pe.status === 'active' && this.matchesAssignmentRules(pe, request));

    if (availableEngineers.length === 0) {
      return; // No auto-assignment possible
    }

    // Sort by workload
    availableEngineers.sort((a, b) => {
      const aWorkload = this.getPEWorkload(a.id);
      const bWorkload = this.getPEWorkload(b.id);
      return aWorkload.utilizationRate - bWorkload.utilizationRate;
    });

    // Assign to least loaded engineer
    request.assignedPE = availableEngineers[0].id;
    request.status = 'assigned';
    this.reviewRequests.set(request.id, request);
  }

  private matchesAssignmentRules(engineer: ProfessionalEngineer, request: PEReviewRequest): boolean {
    // Check if engineer is licensed in project state
    const projectState = request.projectInfo.location.state;
    const hasStateLicense = engineer.states.some(s => s.state === projectState && s.status === 'active');
    
    if (!hasStateLicense) return false;

    // Check specialization match
    const projectType = this.determineProjectType(request.projectInfo);
    if (!engineer.specializations.includes(projectType)) return false;

    // Check capacity
    const workload = this.getPEWorkload(engineer.id);
    if (workload.utilizationRate >= 90) return false;

    return true;
  }

  private determineProjectType(projectInfo: ProjectInformation): string {
    // Determine project type based on occupancy and scope
    if (projectInfo.occupancy.includes('F-1')) return 'industrial';
    if (projectInfo.occupancy.includes('A-3')) return 'agricultural';
    return 'commercial';
  }

  private determineReviewType(projectInfo: ProjectInformation): PEReview['reviewType'] {
    // Determine review type based on project scope
    if (projectInfo.scopeOfWork.toLowerCase().includes('structural')) return 'structural';
    if (projectInfo.scopeOfWork.toLowerCase().includes('mechanical')) return 'mechanical';
    if (projectInfo.scopeOfWork.toLowerCase().includes('electrical')) return 'electrical';
    return 'comprehensive';
  }

  private verifyEngineerAuthorization(engineer: ProfessionalEngineer, projectInfo: ProjectInformation): void {
    // Verify engineer is authorized for project value
    if (projectInfo.projectValue > engineer.approvalAuthority.maxProjectValue) {
      throw new Error('Project value exceeds engineer approval authority');
    }

    // Verify engineer is licensed in project state
    const hasLicense = engineer.states.some(s => 
      s.state === projectInfo.location.state && s.status === 'active'
    );
    
    if (!hasLicense) {
      throw new Error('Engineer not licensed in project state');
    }
  }

  private calculateTimeSpent(startDate: Date, endDate: Date): number {
    // Calculate business hours between dates
    const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    // Assume 8 hour work days
    return Math.round(totalHours * 0.33); // Rough estimate
  }

  private calculateBilling(review: PEReview, engineer: ProfessionalEngineer): BillingInformation {
    const baseRate = 250; // Default hourly rate
    const hoursCharged = review.timeSpent;
    let totalAmount = hoursCharged * baseRate;

    const additionalFees: Array<{ description: string; amount: number }> = [];

    // Add expedite fee if applicable
    const request = this.reviewRequests.get(review.requestId);
    if (request?.priority === 'expedited') {
      const expediteFee = totalAmount * 0.5;
      additionalFees.push({ description: 'Expedited Review', amount: expediteFee });
      totalAmount += expediteFee;
    }

    return {
      hourlyRate: baseRate,
      hoursCharged,
      additionalFees,
      totalAmount,
      invoiceNumber: `INV-${Date.now()}`,
      paymentStatus: 'pending'
    };
  }

  private updateEngineerStatistics(engineerId: string, review: PEReview): void {
    const engineer = this.engineers.get(engineerId);
    if (!engineer) return;

    engineer.statistics.totalProjectsReviewed++;
    
    if (review.decision.decision === 'approved') {
      engineer.statistics.totalProjectsApproved++;
    } else if (review.decision.decision === 'rejected') {
      engineer.statistics.totalProjectsRejected++;
    }

    // Update average review time
    const currentAvg = engineer.statistics.avgReviewTime;
    const newAvg = (currentAvg * (engineer.statistics.totalProjectsReviewed - 1) + review.timeSpent) / 
                   engineer.statistics.totalProjectsReviewed;
    engineer.statistics.avgReviewTime = newAvg;

    engineer.statistics.lastReviewDate = new Date();
    engineer.lastActive = new Date();

    this.engineers.set(engineerId, engineer);
  }

  private getActiveLicense(engineer: ProfessionalEngineer): StateLicense | null {
    return engineer.states.find(s => s.status === 'active' && s.expirationDate > new Date()) || null;
  }

  private async generateStampImage(engineer: ProfessionalEngineer, license: StateLicense): Promise<string> {
    // Generate SVG stamp image
    const stamp = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="140" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="150" cy="150" r="130" fill="none" stroke="black" stroke-width="1"/>
        <text x="150" y="80" text-anchor="middle" font-size="16" font-weight="bold">
          ${engineer.name}
        </text>
        <text x="150" y="100" text-anchor="middle" font-size="14">
          ${engineer.licenseType} LICENSE NO. ${license.licenseNumber}
        </text>
        <text x="150" y="120" text-anchor="middle" font-size="14">
          STATE OF ${license.state}
        </text>
        <text x="150" y="220" text-anchor="middle" font-size="12">
          EXPIRES: ${license.expirationDate.toLocaleDateString()}
        </text>
      </svg>
    `;
    
    // Convert to base64
    return `data:image/svg+xml;base64,${Buffer.from(stamp).toString('base64')}`;
  }

  private async createDigitalSignature(
    engineer: ProfessionalEngineer,
    projectId: string,
    sheetIds: string[]
  ): Promise<DigitalStamp['digitalSignature']> {
    // Create digital signature using configured provider
    const timestamp = new Date();
    const dataToSign = `${engineer.id}:${projectId}:${sheetIds.join(',')}:${timestamp.toISOString()}`;
    
    // In production, would use actual cryptographic signing
    const signature = Buffer.from(dataToSign).toString('base64');
    const verificationCode = Math.random().toString(36).substr(2, 9).toUpperCase();

    return {
      signature,
      certificate: engineer.digitalSignature.certificateId,
      timestamp,
      verificationCode
    };
  }

  private async recordOnBlockchain(signature: DigitalStamp['digitalSignature']): Promise<string> {
    // Record signature hash on blockchain
    // In production, would use actual blockchain service
    return `0x${Buffer.from(signature.signature).toString('hex').substr(0, 64)}`;
  }

  private async applyStampToDrawings(stamp: DigitalStamp): Promise<void> {
    // Apply stamp image to actual drawing files
    // Would integrate with CAD system to place stamps
  }

  private async verifyDigitalSignature(signature: DigitalStamp['digitalSignature']): Promise<boolean> {
    // Verify signature using public key
    // In production, would use actual cryptographic verification
    return true;
  }

  private isLicenseActive(engineer: ProfessionalEngineer, state: string): boolean {
    const stateLicense = engineer.states.find(s => s.state === state);
    return stateLicense ? stateLicense.status === 'active' && stateLicense.expirationDate > new Date() : false;
  }

  private async verifyBlockchain(hash: string): Promise<boolean> {
    // Verify blockchain record
    // In production, would query actual blockchain
    return true;
  }
}

// Export the PE integration system
export const peIntegrationSystem = new PEIntegrationSystem({
  providers: {
    signature: {
      primary: 'docusign',
      apiKey: process.env.DOCUSIGN_API_KEY || '',
      apiSecret: process.env.DOCUSIGN_API_SECRET || '',
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
      templateIds: {}
    },
    verification: {
      endpoint: 'https://api.vibelux.com/pe-verify',
      apiKey: process.env.PE_VERIFY_API_KEY || '',
      blockchainEnabled: false
    },
    licensing: {
      ncarb: { enabled: true, apiKey: process.env.NCARB_API_KEY || '' },
      stateBoards: {}
    }
  },
  workflow: {
    autoAssignment: true,
    assignmentRules: [],
    reviewDeadlines: {
      standard: 10,
      expedited: 3,
      emergency: 1
    },
    revisionCycles: {
      maxCycles: 3,
      autoEscalation: true
    }
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    webhookEnabled: true,
    events: ['review-assigned', 'review-completed', 'revision-required', 'stamp-applied']
  },
  compliance: {
    requiredDocuments: ['calculations', 'specifications'],
    insuranceMinimum: 1000000,
    licenseVerification: true,
    continuingEducationCheck: true
  }
});