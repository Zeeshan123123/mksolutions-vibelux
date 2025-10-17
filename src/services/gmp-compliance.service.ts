/**
 * GMP Compliance Service
 * Complete Good Manufacturing Practice compliance system for regulated facilities
 */
import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';

export interface GMPDocument {
  id: string;
  documentNumber: string;
  title: string;
  version: string;
  documentType: 'SOP' | 'Batch_Record' | 'Specification' | 'Protocol' | 'Report' | 'Policy' | 'Form';
  status: 'Draft' | 'Review' | 'Approved' | 'Effective' | 'Obsolete';
  effectiveDate?: string;
  expirationDate?: string;
  
  // 21 CFR Part 11 Compliance
  electronicSignatures: ElectronicSignature[];
  auditTrail: AuditTrailEntry[];
  
  // Document Control
  approvalWorkflow: ApprovalWorkflow;
  distributionList: string[];
  trainingRequired: boolean;
  
  // Content and Metadata
  content: string;
  attachments: DocumentAttachment[];
  relatedDocuments: string[];
  tags: string[];
  
  // Change Control
  changeHistory: ChangeControlRecord[];
  currentChange?: string;
  
  facilityId: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

export interface ElectronicSignature {
  signerUserId: string;
  signerName: string;
  signatureType: 'Author' | 'Reviewer' | 'Approver' | 'QA' | 'QU';
  signedAt: string;
  reason: string;
  biometricData?: string; // Encrypted biometric hash
  ipAddress: string;
  browserFingerprint: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'Created' | 'Modified' | 'Reviewed' | 'Approved' | 'Signed' | 'Printed' | 'Accessed' | 'Deleted';
  oldValue?: string;
  newValue?: string;
  fieldChanged?: string;
  reason?: string;
  ipAddress: string;
  browserInfo: string;
}

export interface ApprovalWorkflow {
  steps: ApprovalStep[];
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface ApprovalStep {
  stepNumber: number;
  stepType: 'Author' | 'Technical_Review' | 'QA_Review' | 'Management_Approval' | 'Final_Approval';
  assignedTo: string[];
  requiredSignatures: number;
  completedSignatures: ElectronicSignature[];
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ChangeControlRecord {
  changeNumber: string;
  changeType: 'Major' | 'Minor' | 'Administrative';
  reason: string;
  impact: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  implementedAt?: string;
  status: 'Requested' | 'Under_Review' | 'Approved' | 'Implemented' | 'Rejected';
  affectedSystems: string[];
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  impactAnalysis: string;
  mitigationPlan: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface DocumentAttachment {
  id: string;
  filename: string;
  fileType: string;
  size: number;
  checksum: string;
  uploadedBy: string;
  uploadedAt: string;
  encrypted: boolean;
}

export interface BatchRecord {
  batchId: string;
  masterRecordId: string;
  facilityId: string;
  productName: string;
  lotNumber: string;
  
  // Manufacturing Data
  startDate: string;
  endDate?: string;
  quantity: number;
  unit: string;
  
  // Process Steps
  processSteps: ProcessStep[];
  deviations: Deviation[];
  
  // Quality Control
  specifications: QualitySpecification[];
  testResults: TestResult[];
  
  // Personnel
  operators: BatchOperator[];
  qaReviewer?: string;
  qaApproval?: ElectronicSignature;
  
  status: 'In_Progress' | 'Completed' | 'Released' | 'Rejected' | 'On_Hold';
}

export interface ProcessStep {
  stepNumber: number;
  stepDescription: string;
  
  // Process Parameters
  temperature?: ParameterControl;
  humidity?: ParameterControl;
  pH?: ParameterControl;
  ec?: ParameterControl;
  lightLevel?: ParameterControl;
  co2Level?: ParameterControl;
  
  // Execution
  startTime: string;
  endTime?: string;
  operatorId: string;
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  
  // Deviations
  deviations: string[];
}

export interface ParameterControl {
  target: number;
  tolerance: number;
  actual: number;
  unit: string;
  inSpec: boolean;
  measuredAt: string;
  instrumentId?: string;
}

export interface Deviation {
  id: string;
  deviationNumber: string;
  description: string;
  severity: 'Minor' | 'Major' | 'Critical';
  
  // Investigation
  investigation: DeviationInvestigation;
  
  // CAPA (Corrective and Preventive Action)
  capa?: CAPARecord;
  
  // Status
  status: 'Open' | 'Under_Investigation' | 'CAPA_Required' | 'Closed';
  reportedBy: string;
  reportedAt: string;
  closedBy?: string;
  closedAt?: string;
}

export interface DeviationInvestigation {
  investigator: string;
  startedAt: string;
  completedAt?: string;
  
  // Root Cause Analysis
  rootCause?: string;
  contributingFactors: string[];
  
  // Impact Assessment
  impactOnProduct: string;
  impactOnOthers: string;
  
  // Evidence
  evidence: string[];
  attachments: DocumentAttachment[];
}

export interface CAPARecord {
  capaNumber: string;
  correctiveActions: CAPAAction[];
  preventiveActions: CAPAAction[];
  
  // Effectiveness Check
  effectivenessCheck?: EffectivenessCheck;
  
  status: 'Open' | 'Implementation' | 'Verification' | 'Closed';
}

export interface CAPAAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  verification: string;
  effectiveness?: string;
}

export interface EffectivenessCheck {
  checkedBy: string;
  checkedAt: string;
  effective: boolean;
  comments: string;
  followUpRequired: boolean;
}

export interface QualitySpecification {
  parameter: string;
  specification: string;
  testMethod: string;
  acceptanceCriteria: string;
}

export interface TestResult {
  testId: string;
  parameter: string;
  result: string;
  unit?: string;
  specification: string;
  pass: boolean;
  testedBy: string;
  testedAt: string;
  instrumentId?: string;
  certificateNumber?: string;
}

export interface BatchOperator {
  userId: string;
  name: string;
  role: string;
  trainingRecords: TrainingRecord[];
  signedAt: string;
}

export interface TrainingRecord {
  courseId: string;
  courseName: string;
  completedAt: string;
  certificateNumber: string;
  expiresAt?: string;
  valid: boolean;
}

class GMPComplianceService {
  private documentCache = new Map<string, GMPDocument>();

  async createDocument(facilityId: string, documentData: Partial<GMPDocument>): Promise<GMPDocument> {
    try {
      const document: GMPDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentNumber: await this.generateDocumentNumber(documentData.documentType!),
        version: '1.0',
        status: 'Draft',
        electronicSignatures: [],
        auditTrail: [],
        approvalWorkflow: this.createDefaultWorkflow(documentData.documentType!),
        distributionList: [],
        trainingRequired: false,
        content: '',
        attachments: [],
        relatedDocuments: [],
        tags: [],
        changeHistory: [],
        facilityId,
        createdBy: 'system', // Should be actual user
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ...documentData
      };

      // Add creation audit entry
      document.auditTrail.push({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: document.createdBy,
        userName: 'System User',
        action: 'Created',
        ipAddress: '127.0.0.1',
        browserInfo: 'System'
      });

      // Cache document
      this.documentCache.set(document.id, document);

      logger.info('api', `Document ${document.documentNumber} created successfully`);
      return document;
    } catch (error) {
      logger.error('api', 'Failed to create document:', error);
      throw error;
    }
  }

  async signDocument(documentId: string, signature: Omit<ElectronicSignature, 'signedAt'>): Promise<void> {
    try {
      const document = this.documentCache.get(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Validate signer authorization
      await this.validateSignerAuthorization(document, signature.signerUserId, signature.signatureType);

      // Create electronic signature
      const electronicSignature: ElectronicSignature = {
        ...signature,
        signedAt: new Date().toISOString()
      };

      document.electronicSignatures.push(electronicSignature);

      // Add audit trail entry
      document.auditTrail.push({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: signature.signerUserId,
        userName: signature.signerName,
        action: 'Signed',
        newValue: signature.signatureType,
        ipAddress: signature.ipAddress,
        browserInfo: signature.browserFingerprint
      });

      // Update approval workflow
      await this.updateApprovalWorkflow(document, signature.signatureType);

      // Update document
      document.lastModified = new Date().toISOString();
      this.documentCache.set(documentId, document);

      logger.info('api', `Document ${document.documentNumber} signed by ${signature.signerName}`);
    } catch (error) {
      logger.error('api', 'Failed to sign document:', error);
      throw error;
    }
  }

  async createBatchRecord(facilityId: string, batchData: Partial<BatchRecord>): Promise<BatchRecord> {
    try {
      const batchRecord: BatchRecord = {
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        masterRecordId: batchData.masterRecordId || '',
        facilityId,
        productName: batchData.productName || '',
        lotNumber: await this.generateLotNumber(),
        startDate: new Date().toISOString(),
        quantity: batchData.quantity || 0,
        unit: batchData.unit || 'kg',
        processSteps: [],
        deviations: [],
        specifications: [],
        testResults: [],
        operators: [],
        status: 'In_Progress',
        ...batchData
      };

      logger.info('api', `Batch record ${batchRecord.batchId} created for facility ${facilityId}`);
      return batchRecord;
    } catch (error) {
      logger.error('api', 'Failed to create batch record:', error);
      throw error;
    }
  }

  async reportDeviation(facilityId: string, deviationData: {
    description: string;
    severity: 'Minor' | 'Major' | 'Critical';
    reportedBy: string;
    batchId?: string;
  }): Promise<Deviation> {
    try {
      const deviation: Deviation = {
        id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviationNumber: await this.generateDeviationNumber(),
        description: deviationData.description,
        severity: deviationData.severity,
        investigation: {
          investigator: '',
          startedAt: '',
          contributingFactors: [],
          impactOnProduct: '',
          impactOnOthers: '',
          evidence: [],
          attachments: []
        },
        status: 'Open',
        reportedBy: deviationData.reportedBy,
        reportedAt: new Date().toISOString()
      };

      // Auto-assign investigator based on severity
      if (deviationData.severity === 'Critical') {
        // Assign to QA manager
        deviation.investigation.investigator = 'qa_manager';
      }

      logger.info('api', `Deviation ${deviation.deviationNumber} reported for facility ${facilityId}`);
      return deviation;
    } catch (error) {
      logger.error('api', 'Failed to report deviation:', error);
      throw error;
    }
  }

  async validateTrainingCompliance(userId: string, requiredTraining: string[]): Promise<{
    compliant: boolean;
    missingTraining: string[];
    expiredTraining: string[];
  }> {
    try {
      // Mock training validation - in production, would query training database
      const userTraining = await this.getUserTrainingRecords(userId);
      
      const missingTraining: string[] = [];
      const expiredTraining: string[] = [];
      
      for (const required of requiredTraining) {
        const training = userTraining.find(t => t.courseId === required);
        
        if (!training) {
          missingTraining.push(required);
        } else if (training.expiresAt && new Date(training.expiresAt) < new Date()) {
          expiredTraining.push(required);
        }
      }

      const compliant = missingTraining.length === 0 && expiredTraining.length === 0;

      return {
        compliant,
        missingTraining,
        expiredTraining
      };
    } catch (error) {
      logger.error('api', 'Failed to validate training compliance:', error);
      throw error;
    }
  }

  // Private helper methods
  private async generateDocumentNumber(documentType: string): Promise<string> {
    const year = new Date().getFullYear();
    const typePrefix = {
      'SOP': 'SOP',
      'Batch_Record': 'BR',
      'Specification': 'SPEC',
      'Protocol': 'PROT',
      'Report': 'RPT',
      'Policy': 'POL',
      'Form': 'FORM'
    }[documentType] || 'DOC';
    
    // In production, would query database for next sequential number
    const sequence = Math.floor(Math.random() * 999) + 1;
    
    return `${typePrefix}-${year}-${sequence.toString().padStart(3, '0')}`;
  }

  private async generateLotNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().substr(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 999) + 1;
    
    return `${year}${month}${day}-${sequence.toString().padStart(3, '0')}`;
  }

  private async generateDeviationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `DEV-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  private createDefaultWorkflow(documentType: string): ApprovalWorkflow {
    const baseSteps: ApprovalStep[] = [
      {
        stepNumber: 1,
        stepType: 'Technical_Review',
        assignedTo: ['technical_reviewer'],
        requiredSignatures: 1,
        completedSignatures: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        completed: false
      },
      {
        stepNumber: 2,
        stepType: 'QA_Review',
        assignedTo: ['qa_reviewer'],
        requiredSignatures: 1,
        completedSignatures: [],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
        completed: false
      }
    ];

    // Add management approval for SOPs and Policies
    if (documentType === 'SOP' || documentType === 'Policy') {
      baseSteps.push({
        stepNumber: 3,
        stepType: 'Management_Approval',
        assignedTo: ['facility_manager'],
        requiredSignatures: 1,
        completedSignatures: [],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        completed: false
      });
    }

    return {
      steps: baseSteps,
      currentStep: 1,
      completed: false,
      startedAt: new Date().toISOString()
    };
  }

  private async validateSignerAuthorization(document: GMPDocument, userId: string, signatureType: string): Promise<void> {
    // In production, would validate against user roles and permissions
    // For now, allow all signatures
    return Promise.resolve();
  }

  private async updateApprovalWorkflow(document: GMPDocument, signatureType: string): Promise<void> {
    const workflow = document.approvalWorkflow;
    const currentStep = workflow.steps[workflow.currentStep - 1];
    
    if (!currentStep) return;

    // Check if step is completed
    if (currentStep.completedSignatures.length >= currentStep.requiredSignatures) {
      currentStep.completed = true;
      currentStep.completedAt = new Date().toISOString();
      
      // Move to next step
      if (workflow.currentStep < workflow.steps.length) {
        workflow.currentStep++;
      } else {
        // Workflow completed
        workflow.completed = true;
        workflow.completedAt = new Date().toISOString();
        document.status = 'Approved';
      }
    }
  }

  private async getUserTrainingRecords(userId: string): Promise<TrainingRecord[]> {
    // Mock training records - in production, would query training database
    return [
      {
        courseId: 'gmp_basics',
        courseName: 'GMP Basics',
        completedAt: '2024-01-15T00:00:00Z',
        certificateNumber: 'CERT-2024-001',
        expiresAt: '2025-01-15T00:00:00Z',
        valid: true
      },
      {
        courseId: 'document_control',
        courseName: 'Document Control',
        completedAt: '2024-02-10T00:00:00Z',
        certificateNumber: 'CERT-2024-002',
        expiresAt: '2025-02-10T00:00:00Z',
        valid: true
      }
    ];
  }
}

export const gmpComplianceService = new GMPComplianceService();