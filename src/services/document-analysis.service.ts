/**
 * Document Analysis Service
 * Manages OCR processing and document analysis workflows
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';
import { 
  DocumentProcessor, 
  createDocumentProcessor,
  OCRConfig,
  DocumentAnalysisResult,
  ComplianceDocument,
  LabReport,
  ManifestDocument
} from '@/lib/ocr/document-processor';

export interface DocumentAnalysisConfig {
  facilityId: string;
  ocrProvider: 'tesseract' | 'google_vision' | 'aws_textract' | 'azure_vision';
  apiCredentials?: {
    apiKey?: string;
    region?: string;
    endpoint?: string;
  };
  processingOptions: {
    autoClassifyDocuments: boolean;
    confidenceThreshold: number;
    requireManualReview: boolean;
    enableCompliance: boolean;
    retentionDays: number;
  };
  complianceRules: {
    requiredDocuments: string[];
    expirationWarningDays: number;
    alertOnFailedTests: boolean;
    validateLicenseNumbers: boolean;
  };
}

export interface DocumentUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  uploadedBy: string;
  uploadedAt: Date;
  documentType?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  facilityId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'review_required';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: DocumentAnalysisResult;
  retryCount: number;
  maxRetries: number;
}

export interface ComplianceAlert {
  id: string;
  facilityId: string;
  documentId: string;
  alertType: 'expiration_warning' | 'failed_test' | 'missing_document' | 'invalid_license' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  dueDate?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class DocumentAnalysisService {
  private readonly cachePrefix = 'doc_analysis:';
  private readonly cacheTTL = 3600 * 24; // 24 hours
  private processors: Map<string, DocumentProcessor> = new Map();

  /**
   * Initialize document analysis for a facility
   */
  async initializeAnalysis(config: DocumentAnalysisConfig): Promise<boolean> {
    try {
      logger.info('api', `Initializing document analysis for facility ${config.facilityId}`);

      // Create OCR processor
      const ocrConfig: OCRConfig = {
        provider: config.ocrProvider,
        apiKey: config.apiCredentials?.apiKey,
        region: config.apiCredentials?.region,
        endpoint: config.apiCredentials?.endpoint,
        options: {
          language: 'eng',
          confidenceThreshold: config.processingOptions.confidenceThreshold,
          preprocessImage: true,
          dpi: 300
        }
      };

      const processor = createDocumentProcessor(ocrConfig);
      this.processors.set(config.facilityId, processor);

      // Store configuration
      await this.storeConfiguration(config);

      logger.info('api', `Document analysis initialized for facility ${config.facilityId}`);
      return true;

    } catch (error) {
      logger.error('api', 'Failed to initialize document analysis:', error);
      return false;
    }
  }

  /**
   * Process uploaded document
   */
  async processDocument(upload: DocumentUpload, facilityId: string): Promise<ProcessingJob> {
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create processing job
      const job: ProcessingJob = {
        id: jobId,
        documentId: upload.id,
        facilityId,
        status: 'pending',
        priority: this.determinePriority(upload.documentType),
        createdAt: new Date(),
        retryCount: 0,
        maxRetries: 3
      };

      await this.storeJob(job);

      // Start processing asynchronously
      this.startProcessing(job, upload).catch(error => {
        logger.error('api', 'Background processing failed', { jobId, error });
      });

      logger.info('api', 'Document processing job created', {
        jobId,
        documentId: upload.id,
        documentType: upload.documentType,
        priority: job.priority
      });

      return job;

    } catch (error) {
      logger.error('api', 'Failed to create processing job:', error);
      throw error;
    }
  }

  /**
   * Get processing job status
   */
  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    try {
      const key = `${this.cachePrefix}job:${jobId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('api', 'Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get processed document results
   */
  async getDocumentResults(documentId: string): Promise<DocumentAnalysisResult | null> {
    try {
      const key = `${this.cachePrefix}result:${documentId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('api', 'Failed to get document results:', error);
      return null;
    }
  }

  /**
   * Search documents by type and content
   */
  async searchDocuments(
    facilityId: string,
    filters: {
      documentType?: string;
      dateRange?: { start: Date; end: Date };
      searchText?: string;
      tags?: string[];
      status?: string;
    }
  ): Promise<DocumentAnalysisResult[]> {
    try {
      // In a real implementation, this would query a database
      // For now, return mock search results
      const mockResults: DocumentAnalysisResult[] = [
        {
          id: 'doc_001',
          documentType: 'lab_report',
          extractedText: 'Sample ID: SAMPLE-ABC-789, THC: 22.45%, CBD: 0.85%, Result: PASS',
          confidence: 0.94,
          structuredData: {
            sampleId: 'SAMPLE-ABC-789',
            thc: 22.45,
            cbd: 0.85,
            overallResult: 'pass'
          },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          processingTime: 1250,
          errors: [],
          metadata: {
            pageCount: 1,
            imageFormat: 'pdf',
            fileSize: 245760
          }
        },
        {
          id: 'doc_002',
          documentType: 'license',
          extractedText: 'License Number: CCL-24-0001234, Expiration: 01/14/2025, Type: Adult-Use Cultivation',
          confidence: 0.91,
          structuredData: {
            licenseNumber: 'CCL-24-0001234',
            expirationDate: new Date('2025-01-14'),
            licenseType: 'Adult-Use Cultivation'
          },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          processingTime: 890,
          errors: [],
          metadata: {
            pageCount: 2,
            imageFormat: 'pdf',
            fileSize: 189432
          }
        }
      ];

      // Apply filters
      let results = mockResults.filter(doc => doc.extractedText.toLowerCase().includes(facilityId.toLowerCase()));

      if (filters.documentType) {
        results = results.filter(doc => doc.documentType === filters.documentType);
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        results = results.filter(doc => 
          doc.extractedText.toLowerCase().includes(searchLower) ||
          JSON.stringify(doc.structuredData).toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateRange) {
        results = results.filter(doc => 
          doc.timestamp >= filters.dateRange!.start && 
          doc.timestamp <= filters.dateRange!.end
        );
      }

      return results;

    } catch (error) {
      logger.error('api', 'Document search failed:', error);
      return [];
    }
  }

  /**
   * Get compliance alerts for facility
   */
  async getComplianceAlerts(facilityId: string, activeOnly: boolean = true): Promise<ComplianceAlert[]> {
    try {
      // Mock compliance alerts
      const alerts: ComplianceAlert[] = [
        {
          id: 'alert_001',
          facilityId,
          documentId: 'doc_license_001',
          alertType: 'expiration_warning',
          severity: 'medium',
          message: 'Cannabis license expires in 30 days',
          details: {
            licenseNumber: 'CCL-24-0001234',
            expirationDate: '2025-01-14',
            daysUntilExpiration: 30
          },
          status: 'active',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'alert_002',
          facilityId,
          documentId: 'doc_lab_002',
          alertType: 'failed_test',
          severity: 'high',
          message: 'Lab test failed for batch BATCH-2024-002',
          details: {
            batchId: 'BATCH-2024-002',
            testType: 'Pesticide Screening',
            failedTests: ['Myclobutanil'],
            sampleId: 'SAMPLE-DEF-456'
          },
          status: 'active',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ];

      return activeOnly ? alerts.filter(alert => alert.status === 'active') : alerts;

    } catch (error) {
      logger.error('api', 'Failed to get compliance alerts:', error);
      return [];
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    facilityId: string,
    reportType: 'summary' | 'detailed' | 'audit',
    dateRange: { start: Date; end: Date }
  ): Promise<{
    reportId: string;
    facilityId: string;
    reportType: string;
    generatedAt: Date;
    period: { start: Date; end: Date };
    summary: {
      totalDocuments: number;
      processedDocuments: number;
      failedProcessing: number;
      complianceIssues: number;
      expiringSoon: number;
    };
    documentBreakdown: Record<string, number>;
    complianceStatus: 'compliant' | 'issues_found' | 'critical_issues';
    issues: ComplianceAlert[];
    recommendations: string[];
  }> {
    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get documents for the period
      const documents = await this.searchDocuments(facilityId, { dateRange });
      const alerts = await this.getComplianceAlerts(facilityId);

      // Calculate summary statistics
      const summary = {
        totalDocuments: documents.length,
        processedDocuments: documents.filter(doc => doc.confidence > 0.8).length,
        failedProcessing: documents.filter(doc => doc.errors.length > 0).length,
        complianceIssues: alerts.length,
        expiringSoon: alerts.filter(alert => alert.alertType === 'expiration_warning').length
      };

      // Document type breakdown
      const documentBreakdown: Record<string, number> = {};
      documents.forEach(doc => {
        documentBreakdown[doc.documentType] = (documentBreakdown[doc.documentType] || 0) + 1;
      });

      // Determine compliance status
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
      const complianceStatus = criticalAlerts.length > 0 ? 'critical_issues' : 
                              alerts.length > 0 ? 'issues_found' : 'compliant';

      // Generate recommendations
      const recommendations = this.generateRecommendations(summary, alerts);

      const report = {
        reportId,
        facilityId,
        reportType,
        generatedAt: new Date(),
        period: dateRange,
        summary,
        documentBreakdown,
        complianceStatus,
        issues: alerts,
        recommendations
      };

      // Store report
      await this.storeReport(report);

      logger.info('api', 'Compliance report generated', {
        reportId,
        facilityId,
        reportType,
        complianceStatus,
        totalIssues: alerts.length
      });

      return report;

    } catch (error) {
      logger.error('api', 'Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Acknowledge compliance alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): Promise<boolean> {
    try {
      // In a real implementation, this would update the database
      const key = `${this.cachePrefix}alert:${alertId}`;
      const alertData = await redis.get(key);
      
      if (alertData) {
        const alert: ComplianceAlert = JSON.parse(alertData);
        alert.status = 'acknowledged';
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        
        await redis.setex(key, this.cacheTTL, JSON.stringify(alert));
        
        logger.info('api', 'Alert acknowledged', {
          alertId,
          acknowledgedBy,
          alertType: alert.alertType
        });
        
        return true;
      }
      
      return false;

    } catch (error) {
      logger.error('api', 'Failed to acknowledge alert:', error);
      return false;
    }
  }

  // Private helper methods

  private async startProcessing(job: ProcessingJob, upload: DocumentUpload): Promise<void> {
    try {
      // Update job status
      job.status = 'processing';
      job.startedAt = new Date();
      await this.storeJob(job);

      // Get processor for facility
      const processor = this.processors.get(job.facilityId);
      if (!processor) {
        throw new Error(`No processor configured for facility ${job.facilityId}`);
      }

      // Process document
      const result = await processor.processDocument(
        upload.buffer,
        upload.documentType || 'unknown',
        {
          filename: upload.originalName,
          fileSize: upload.size
        }
      );

      // Validate compliance
      const complianceCheck = await processor.validateDocumentCompliance(result);
      
      // Update job with result
      job.status = complianceCheck.isCompliant && result.confidence > 0.8 ? 'completed' : 'review_required';
      job.completedAt = new Date();
      job.result = result;
      await this.storeJob(job);

      // Store result
      await this.storeResult(result);

      // Generate compliance alerts if needed
      if (!complianceCheck.isCompliant) {
        await this.createComplianceAlerts(job.facilityId, upload.id, complianceCheck.issues);
      }

      // Check for specific document alerts
      await this.checkDocumentAlerts(job.facilityId, result);

    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        job.status = 'pending';
        // Schedule retry (would use a queue in production)
        setTimeout(() => {
          this.startProcessing(job, upload).catch(retryError => {
            logger.error('api', 'Retry failed', { jobId: job.id, retryError });
          });
        }, 5000 * job.retryCount); // Exponential backoff
      }
      
      await this.storeJob(job);
      throw error;
    }
  }

  private determinePriority(documentType?: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentTypes = ['license', 'inspection', 'violation'];
    const highTypes = ['lab_report', 'manifest', 'permit'];
    const mediumTypes = ['invoice', 'receipt'];
    
    if (!documentType) return 'low';
    
    if (urgentTypes.includes(documentType)) return 'urgent';
    if (highTypes.includes(documentType)) return 'high';
    if (mediumTypes.includes(documentType)) return 'medium';
    
    return 'low';
  }

  private async createComplianceAlerts(facilityId: string, documentId: string, issues: string[]): Promise<void> {
    for (const issue of issues) {
      const alert: ComplianceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        facilityId,
        documentId,
        alertType: 'compliance_violation',
        severity: 'medium',
        message: issue,
        details: { documentId, issue },
        status: 'active',
        createdAt: new Date()
      };

      await this.storeAlert(alert);
    }
  }

  private async checkDocumentAlerts(facilityId: string, result: DocumentAnalysisResult): Promise<void> {
    // Check for license expiration
    if (result.documentType === 'license') {
      const licenseData = result.structuredData as ComplianceDocument;
      if (licenseData.expirationDate) {
        const daysUntilExpiration = Math.ceil(
          (licenseData.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );
        
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
          const alert: ComplianceAlert = {
            id: `alert_exp_${Date.now()}`,
            facilityId,
            documentId: result.id,
            alertType: 'expiration_warning',
            severity: daysUntilExpiration <= 7 ? 'high' : 'medium',
            message: `License expires in ${daysUntilExpiration} days`,
            details: {
              licenseNumber: licenseData.documentNumber,
              expirationDate: licenseData.expirationDate,
              daysUntilExpiration
            },
            status: 'active',
            createdAt: new Date(),
            dueDate: licenseData.expirationDate
          };

          await this.storeAlert(alert);
        }
      }
    }

    // Check for failed lab tests
    if (result.documentType === 'lab_report') {
      const labData = result.structuredData as LabReport;
      if (labData.overallResult === 'fail') {
        const alert: ComplianceAlert = {
          id: `alert_lab_${Date.now()}`,
          facilityId,
          documentId: result.id,
          alertType: 'failed_test',
          severity: 'high',
          message: `Lab test failed for sample ${labData.sampleId}`,
          details: {
            sampleId: labData.sampleId,
            testType: labData.testType,
            result: labData.overallResult
          },
          status: 'active',
          createdAt: new Date()
        };

        await this.storeAlert(alert);
      }
    }
  }

  private generateRecommendations(summary: any, alerts: ComplianceAlert[]): string[] {
    const recommendations: string[] = [];

    if (summary.failedProcessing > 0) {
      recommendations.push('Review and rescan documents with processing failures');
    }

    if (alerts.some(alert => alert.alertType === 'expiration_warning')) {
      recommendations.push('Renew expiring licenses and permits immediately');
    }

    if (alerts.some(alert => alert.alertType === 'failed_test')) {
      recommendations.push('Investigate failed lab tests and implement corrective actions');
    }

    if (summary.totalDocuments < 10) {
      recommendations.push('Consider implementing regular document scanning schedule');
    }

    if (recommendations.length === 0) {
      recommendations.push('All compliance documents are current and properly processed');
    }

    return recommendations;
  }

  private async storeConfiguration(config: DocumentAnalysisConfig): Promise<void> {
    const key = `${this.cachePrefix}config:${config.facilityId}`;
    await redis.setex(key, this.cacheTTL, JSON.stringify(config));
  }

  private async storeJob(job: ProcessingJob): Promise<void> {
    const key = `${this.cachePrefix}job:${job.id}`;
    await redis.setex(key, this.cacheTTL, JSON.stringify(job));
  }

  private async storeResult(result: DocumentAnalysisResult): Promise<void> {
    const key = `${this.cachePrefix}result:${result.id}`;
    await redis.setex(key, this.cacheTTL * 7, JSON.stringify(result)); // Store for 7 days
  }

  private async storeAlert(alert: ComplianceAlert): Promise<void> {
    const key = `${this.cachePrefix}alert:${alert.id}`;
    await redis.setex(key, this.cacheTTL * 30, JSON.stringify(alert)); // Store for 30 days
  }

  private async storeReport(report: any): Promise<void> {
    const key = `${this.cachePrefix}report:${report.reportId}`;
    await redis.setex(key, this.cacheTTL * 90, JSON.stringify(report)); // Store for 90 days
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
export default documentAnalysisService;