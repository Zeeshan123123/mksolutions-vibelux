import { logger } from '@/lib/logging/production-logger';
/**
 * Vendor Onboarding System
 * Comprehensive vendor registration, verification, and management
 */

export interface VendorApplication {
  id: string;
  businessInfo: BusinessInfo;
  verification: VerificationDocuments;
  products: ProductCatalog;
  compliance: ComplianceInfo;
  financial: FinancialInfo;
  status: ApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  feedback?: string[];
  completionPercentage: number;
}

export interface BusinessInfo {
  companyName: string;
  legalName: string;
  businessType: 'manufacturer' | 'distributor' | 'grower' | 'service_provider';
  yearEstablished: number;
  taxId: string;
  dunsNumber?: string;
  website: string;
  description: string;
  
  // Contact Information
  primaryContact: ContactPerson;
  secondaryContact?: ContactPerson;
  
  // Address
  headquarters: Address;
  warehouses: Address[];
  
  // Business Details
  employeeCount: string;
  annualRevenue: string;
  publicCompany: boolean;
  parentCompany?: string;
}

export interface ContactPerson {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: 'headquarters' | 'warehouse' | 'office' | 'farm';
}

export interface VerificationDocuments {
  businessLicense: DocumentUpload;
  taxCertificate: DocumentUpload;
  insuranceCertificate: DocumentUpload;
  bankingInfo: BankingVerification;
  references: BusinessReference[];
  certifications: Certification[];
  productSamples?: ProductSample[];
}

export interface DocumentUpload {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  expiryDate?: Date;
  notes?: string;
}

export interface BankingVerification {
  bankName: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
  accountNumberLast4: string;
  verified: boolean;
  microDepositsCompleted?: boolean;
}

export interface BusinessReference {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  relationshipType: 'customer' | 'supplier' | 'partner';
  yearsOfRelationship: number;
  verified: boolean;
  verificationDate?: Date;
  rating?: number;
  feedback?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  documentUrl: string;
  type: 'organic' | 'gap' | 'gmp' | 'iso' | 'fair_trade' | 'other';
  verified: boolean;
}

export interface ProductSample {
  productName: string;
  sku: string;
  category: string;
  description: string;
  images: string[];
  testResults?: TestResult[];
  qualityScore?: number;
  reviewNotes?: string;
}

export interface TestResult {
  testType: 'potency' | 'pesticides' | 'heavy_metals' | 'microbials' | 'other';
  labName: string;
  testDate: Date;
  resultUrl: string;
  passed: boolean;
  notes?: string;
}

export interface ProductCatalog {
  categories: string[];
  totalProducts: number;
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  catalogUrl?: string;
  productDataFeed?: {
    format: 'csv' | 'json' | 'xml';
    url: string;
    updateFrequency: 'daily' | 'weekly' | 'monthly';
  };
  minimumOrderValue: number;
  leadTimes: {
    standard: number; // days
    expedited?: number;
  };
  shippingMethods: string[];
  returnPolicy: string;
  warrantyInfo: string;
}

export interface ComplianceInfo {
  licenses: License[];
  stateCompliance: StateCompliance[];
  industryCompliance: {
    metrc?: boolean;
    leafLink?: boolean;
    bioTrack?: boolean;
  };
  amlCompliance: {
    completed: boolean;
    completedDate?: Date;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  dataPrivacy: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    privacyPolicyUrl: string;
  };
}

export interface License {
  type: string;
  number: string;
  state: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended';
  documentUrl: string;
}

export interface StateCompliance {
  state: string;
  compliant: boolean;
  licenses: string[];
  restrictions?: string[];
  lastUpdated: Date;
}

export interface FinancialInfo {
  paymentTerms: PaymentTerms;
  creditReferences: CreditReference[];
  insurance: InsuranceInfo[];
  financialStatements?: FinancialStatement[];
  creditScore?: {
    score: number;
    agency: string;
    date: Date;
  };
}

export interface PaymentTerms {
  standardTerms: 'net30' | 'net60' | 'net90' | 'prepay' | 'custom';
  customTerms?: string;
  acceptedPaymentMethods: string[];
  earlyPaymentDiscount?: {
    percentage: number;
    days: number;
  };
  creditLimit?: number;
  personalGuaranteeRequired: boolean;
}

export interface CreditReference {
  companyName: string;
  contactInfo: string;
  accountNumber?: string;
  averagePaymentDays: number;
  creditLimit: number;
  verified: boolean;
}

export interface InsuranceInfo {
  type: 'general_liability' | 'product_liability' | 'cargo' | 'cyber' | 'other';
  carrier: string;
  policyNumber: string;
  coverageAmount: number;
  effectiveDate: Date;
  expiryDate: Date;
  documentUrl: string;
}

export interface FinancialStatement {
  type: 'balance_sheet' | 'income_statement' | 'cash_flow';
  year: number;
  quarter?: number;
  auditedBy?: string;
  documentUrl: string;
}

export interface ApplicationStatus {
  stage: 'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 
         'approved' | 'rejected' | 'on_hold';
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  lastUpdatedAt: Date;
  timeline: StatusUpdate[];
}

export interface StatusUpdate {
  stage: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
  action?: string;
}

// Onboarding workflow steps
export const ONBOARDING_STEPS = [
  {
    id: 'business-info',
    title: 'Business Information',
    description: 'Basic company details and contact information',
    required: true,
    fields: [
      'companyName', 'legalName', 'businessType', 'yearEstablished',
      'taxId', 'website', 'primaryContact', 'headquarters'
    ]
  },
  {
    id: 'verification',
    title: 'Verification Documents',
    description: 'Upload required business documents',
    required: true,
    documents: [
      'businessLicense', 'taxCertificate', 'insuranceCertificate'
    ]
  },
  {
    id: 'product-catalog',
    title: 'Product Catalog',
    description: 'Information about your products and services',
    required: true,
    fields: [
      'categories', 'brands', 'priceRange', 'minimumOrderValue'
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Licensing',
    description: 'Industry and state compliance information',
    required: true,
    fields: [
      'licenses', 'stateCompliance', 'industryCompliance'
    ]
  },
  {
    id: 'financial',
    title: 'Financial Information',
    description: 'Payment terms and financial verification',
    required: true,
    fields: [
      'paymentTerms', 'creditReferences', 'insurance'
    ]
  },
  {
    id: 'references',
    title: 'Business References',
    description: 'Provide business references for verification',
    required: true,
    minimumReferences: 3
  },
  {
    id: 'agreement',
    title: 'Vendor Agreement',
    description: 'Review and sign vendor agreement',
    required: true,
    documents: ['vendorAgreement', 'termsOfService']
  }
];

export class VendorOnboardingManager {
  private applications: Map<string, VendorApplication> = new Map();
  private verificationQueue: string[] = [];

  /**
   * Start a new vendor application
   */
  startApplication(userId: string, businessInfo: Partial<BusinessInfo>): VendorApplication {
    const application: VendorApplication = {
      id: `app_${Date.now()}`,
      businessInfo: businessInfo as BusinessInfo,
      verification: {} as VerificationDocuments,
      products: {} as ProductCatalog,
      compliance: {} as ComplianceInfo,
      financial: {} as FinancialInfo,
      status: {
        stage: 'draft',
        currentStep: 0,
        totalSteps: ONBOARDING_STEPS.length,
        startedAt: new Date(),
        lastUpdatedAt: new Date(),
        timeline: [{
          stage: 'draft',
          timestamp: new Date(),
          updatedBy: userId,
          action: 'Application started'
        }]
      },
      submittedAt: new Date(),
      completionPercentage: this.calculateCompletion({} as VendorApplication)
    };

    this.applications.set(application.id, application);
    return application;
  }

  /**
   * Update application data
   */
  updateApplication(
    applicationId: string, 
    section: keyof VendorApplication, 
    data: any
  ): VendorApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    // Update the specific section
    (application as any)[section] = { ...application[section as any], ...data };
    
    // Update completion percentage
    application.completionPercentage = this.calculateCompletion(application);
    
    // Update status
    application.status.lastUpdatedAt = new Date();
    application.status.timeline.push({
      stage: application.status.stage,
      timestamp: new Date(),
      updatedBy: 'system',
      action: `Updated ${section}`
    });

    return application;
  }

  /**
   * Submit application for review
   */
  submitApplication(applicationId: string): boolean {
    const application = this.applications.get(applicationId);
    if (!application || application.completionPercentage < 100) {
      return false;
    }

    application.status.stage = 'submitted';
    application.submittedAt = new Date();
    application.status.timeline.push({
      stage: 'submitted',
      timestamp: new Date(),
      updatedBy: 'system',
      action: 'Application submitted for review'
    });

    // Add to verification queue
    this.verificationQueue.push(applicationId);
    
    // Trigger automated checks
    this.performAutomatedChecks(applicationId);

    return true;
  }

  /**
   * Perform automated verification checks
   */
  private async performAutomatedChecks(applicationId: string) {
    const application = this.applications.get(applicationId);
    if (!application) return;

    // Update status
    application.status.stage = 'under_review';
    
    // Simulate automated checks
    const checks = [
      this.verifyBusinessLicense(application),
      this.verifyTaxId(application),
      this.verifyInsurance(application),
      this.checkCreditScore(application),
      this.verifyReferences(application)
    ];

    // In a real implementation, these would be actual API calls
    await Promise.all(checks);
  }

  /**
   * Calculate application completion percentage
   */
  private calculateCompletion(application: VendorApplication): number {
    let completed = 0;
    let total = 0;

    ONBOARDING_STEPS.forEach(step => {
      if (step.fields) {
        step.fields.forEach(field => {
          total++;
          if (this.isFieldComplete(application, field)) {
            completed++;
          }
        });
      }
      if (step.documents) {
        step.documents.forEach(doc => {
          total++;
          if (this.isDocumentUploaded(application, doc)) {
            completed++;
          }
        });
      }
    });

    return Math.round((completed / total) * 100);
  }

  /**
   * Check if a field is complete
   */
  private isFieldComplete(application: VendorApplication, field: string): boolean {
    // Check nested fields in the application
    const sections = ['businessInfo', 'verification', 'products', 'compliance', 'financial'];
    
    for (const section of sections) {
      const sectionData = (application as any)[section];
      if (sectionData && sectionData[field]) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if a document is uploaded
   */
  private isDocumentUploaded(application: VendorApplication, docType: string): boolean {
    const docs = application.verification;
    return !!(docs && (docs as any)[docType]);
  }

  /**
   * Simulated verification methods
   */
  private async verifyBusinessLicense(application: VendorApplication): Promise<void> {
    // Simulate API call to verify business license
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (application.verification.businessLicense) {
      application.verification.businessLicense.verified = true;
      application.verification.businessLicense.verifiedAt = new Date();
    }
  }

  private async verifyTaxId(application: VendorApplication): Promise<void> {
    // Simulate TIN matching with IRS
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Update verification status
  }

  private async verifyInsurance(application: VendorApplication): Promise<void> {
    // Simulate insurance verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (application.verification.insuranceCertificate) {
      application.verification.insuranceCertificate.verified = true;
      application.verification.insuranceCertificate.verifiedAt = new Date();
    }
  }

  private async checkCreditScore(application: VendorApplication): Promise<void> {
    // Simulate credit check
    await new Promise(resolve => setTimeout(resolve, 3000));
    application.financial.creditScore = {
      score: 720 + Math.floor(Math.random() * 80),
      agency: 'Experian Business',
      date: new Date()
    };
  }

  private async verifyReferences(application: VendorApplication): Promise<void> {
    // Simulate reference verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (application.verification.references) {
      application.verification.references.forEach(ref => {
        ref.verified = true;
        ref.verificationDate = new Date();
        ref.rating = 4 + Math.random();
      });
    }
  }

  /**
   * Get application by ID
   */
  getApplication(applicationId: string): VendorApplication | undefined {
    return this.applications.get(applicationId);
  }

  /**
   * Get all applications for review
   */
  getApplicationsForReview(): VendorApplication[] {
    return Array.from(this.applications.values())
      .filter(app => app.status.stage === 'under_review');
  }

  /**
   * Approve vendor application
   */
  approveApplication(
    applicationId: string, 
    reviewedBy: string, 
    notes?: string
  ): boolean {
    const application = this.applications.get(applicationId);
    if (!application) return false;

    application.status.stage = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = reviewedBy;
    application.status.timeline.push({
      stage: 'approved',
      timestamp: new Date(),
      updatedBy: reviewedBy,
      notes,
      action: 'Application approved'
    });

    // Create vendor account
    this.createVendorAccount(application);

    return true;
  }

  /**
   * Create vendor account from approved application
   */
  private createVendorAccount(application: VendorApplication) {
    // This would integrate with the main vendor system
    const vendorData = {
      id: `vendor_${Date.now()}`,
      applicationId: application.id,
      name: application.businessInfo.companyName,
      legalName: application.businessInfo.legalName,
      type: application.businessInfo.businessType,
      status: 'active',
      tier: this.determineVendorTier(application),
      createdAt: new Date()
    };

    // Trigger vendor account creation
    logger.info('api', 'Creating vendor account:', { data: vendorData });
  }

  /**
   * Determine vendor tier based on application data
   */
  private determineVendorTier(application: VendorApplication): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const score = application.financial.creditScore?.score || 0;
    const revenue = this.parseRevenue(application.businessInfo.annualRevenue);
    
    if (score > 800 && revenue > 10000000) return 'platinum';
    if (score > 750 && revenue > 5000000) return 'gold';
    if (score > 700 && revenue > 1000000) return 'silver';
    return 'bronze';
  }

  /**
   * Parse revenue string to number
   */
  private parseRevenue(revenueStr: string): number {
    // Simple parser for revenue strings like "$1M", "$500K", etc.
    const match = revenueStr.match(/\$?(\d+\.?\d*)([MK]?)/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const multiplier = match[2].toUpperCase() === 'M' ? 1000000 : 
                      match[2].toUpperCase() === 'K' ? 1000 : 1;
    
    return value * multiplier;
  }
}