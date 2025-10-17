import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface ScoutingReport {
  id?: string;
  facilityId: string;
  employeeId: string;
  location: {
    latitude: number;
    longitude: number;
    zone?: string;
    row?: string;
    block?: string;
  };
  issueType: 'pest' | 'disease' | 'nutrient' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  photos: string[];
  notes: string;
  timestamp: Date;
  status: 'draft' | 'submitted' | 'reviewed' | 'resolved';
  metadata?: {
    deviceInfo?: string;
    weatherConditions?: any;
    cropStage?: string;
    affectedArea?: number; // square meters
  };
}

export interface ScoutingTask {
  id: string;
  facilityId: string;
  assignedTo: string[];
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  instructions: string;
  checkpoints: {
    location: string;
    description: string;
    completed: boolean;
  }[];
}

export class ScoutingService {
  private static instance: ScoutingService;

  static getInstance(): ScoutingService {
    if (!ScoutingService.instance) {
      ScoutingService.instance = new ScoutingService();
    }
    return ScoutingService.instance;
  }

  async createScoutingReport(report: ScoutingReport): Promise<string> {
    try {
      logger.info('api: Creating scouting report', { 
        employeeId: report.employeeId,
        issueType: report.issueType,
        severity: report.severity 
      });

      // Process photos (in production, upload to cloud storage)
      const processedPhotos = await this.processPhotos(report.photos);

      // Persist to DB
      const created = await prisma.scoutingRecord.create({
        data: {
          userId: report.employeeId,
          facilityId: report.facilityId && report.facilityId !== 'DEFAULT-FACILITY' ? report.facilityId : undefined,
          timestamp: report.timestamp ?? new Date(),
          latitude: report.location.latitude,
          longitude: report.location.longitude,
          zone: report.location.zone,
          block: report.location.block,
          issueType: report.issueType,
          severity: report.severity,
          issue: report.issueType,
          notes: report.notes,
          photos: processedPhotos,
          environmental: report.metadata?.weatherConditions as any,
          actionRequired: false,
          assignedTo: undefined,
        }
      });

      // Run AI analysis on photos (non-blocking)
      this.analyzePhotos(processedPhotos)
        .then(async (aiAnalysis) => {
          await this.notifyManagers(report, aiAnalysis);
          await this.logScoutingEvent({
            reportId: created.id,
            employeeId: report.employeeId,
            location: report.location,
            issueType: report.issueType,
            severity: report.severity,
            aiDetection: aiAnalysis
          });
        })
        .catch(() => void 0);

      return created.id;
    } catch (error) {
      logger.error('api: Failed to create scouting report', error);
      throw error;
    }
  }

  async getScoutingTasks(employeeId: string): Promise<ScoutingTask[]> {
    try {
      // In production, fetch from database
      // Mock data for now
      return [
        {
          id: 'TASK-001',
          facilityId: 'FAC-001',
          assignedTo: [employeeId],
          zone: 'Greenhouse A',
          priority: 'high',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          instructions: 'Check all tomato plants in rows 1-10 for signs of spider mites',
          checkpoints: [
            { location: 'Row 1-3', description: 'Check undersides of leaves', completed: false },
            { location: 'Row 4-6', description: 'Look for webbing on stems', completed: false },
            { location: 'Row 7-10', description: 'Inspect new growth', completed: false }
          ]
        }
      ];
    } catch (error) {
      logger.error('api: Failed to get scouting tasks', error);
      throw error;
    }
  }

  private async processPhotos(photos: string[]): Promise<string[]> {
    // In production: resize, compress, and upload to cloud storage
    // Return URLs of processed photos
    return photos;
  }

  private async analyzePhotos(photos: string[]): Promise<any> {
    try {
      // Integrate with pest detection service
      const { pestManagement } = await import('@/lib/pest-management/pest-detection-service');

      const analyses = await Promise.all(
        photos.map(photo => pestManagement.detectFromImage(photo, 'cannabis'))
      );

      const detectedIssues = analyses.map(a => ({
        type: a.detection.type,
        name: a.detection.name,
        severity: a.detection.severity,
        confidence: a.detection.confidence,
      }));
      const confidence = detectedIssues.length > 0 ? Math.max(...detectedIssues.map(d => d.confidence)) : 0;

      return {
        detectedIssues,
        confidence,
        recommendation: this.generateRecommendation(detectedIssues)
      };
    } catch (error) {
      logger.error('api: Failed to analyze photos', error);
      return null;
    }
  }

  private generateRecommendation(detections: any[]): string {
    if (detections.length === 0) {
      return 'No issues detected. Continue regular monitoring.';
    }

    // Simple rule-based recommendations
    const hasPests = detections.some(d => d.type === 'pest');
    const hasDisease = detections.some(d => d.type === 'disease');

    if (hasPests && hasDisease) {
      return 'Multiple issues detected. Immediate intervention recommended. Contact IPM specialist.';
    } else if (hasPests) {
      return 'Pest presence confirmed. Implement IPM protocols immediately.';
    } else if (hasDisease) {
      return 'Disease symptoms detected. Isolate affected plants and begin treatment.';
    }

    return 'Issues detected. Further investigation recommended.';
  }

  private async notifyManagers(report: ScoutingReport, aiAnalysis: any): Promise<void> {
    // In production: send push notifications, emails, SMS
    logger.info('api: Notifying managers of scouting report', {
      severity: report.severity,
      issueType: report.issueType,
      hasAIDetection: !!aiAnalysis
    });
  }

  private async logScoutingEvent(event: any): Promise<void> {
    // In production: save to audit log
    logger.info('api: Scouting event logged', event);
  }

  async getScoutingHistory(
    facilityId: string,
    filters?: {
      employeeId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      issueType?: string;
      severity?: string;
    }
  ): Promise<ScoutingReport[]> {
    try {
      const where: any = {};
      if (facilityId && facilityId !== 'DEFAULT-FACILITY') {
        where.facilityId = facilityId;
      }
      if (filters?.employeeId) where.userId = filters.employeeId;
      if (filters?.issueType) where.issueType = filters.issueType;
      if (filters?.severity) where.severity = filters.severity;
      if (filters?.dateFrom || filters?.dateTo) {
        where.timestamp = {} as any;
        if (filters.dateFrom) where.timestamp.gte = filters.dateFrom;
        if (filters.dateTo) where.timestamp.lte = filters.dateTo;
      }

      const rows = await prisma.scoutingRecord.findMany({
        where,
        orderBy: { timestamp: 'desc' }
      });

      return rows.map((r) => ({
        id: r.id,
        facilityId: r.facilityId || facilityId,
        employeeId: r.userId,
        location: {
          latitude: r.latitude,
          longitude: r.longitude,
          zone: r.zone || undefined,
          block: r.block || undefined,
        },
        issueType: r.issueType as any,
        severity: r.severity as any,
        photos: r.photos || [],
        notes: r.notes || '',
        timestamp: r.timestamp,
        status: 'submitted',
        actionRequired: r.actionRequired,
        assignedTo: r.assignedTo || undefined,
      }));
    } catch (error) {
      logger.error('api: Failed to get scouting history', error);
      throw error;
    }
  }

  async getScoutingAnalytics(facilityId: string): Promise<any> {
    try {
      // Calculate metrics like:
      // - Most common issues by zone
      // - Average response time
      // - Issue resolution rate
      // - Employee performance metrics
      
      return {
        totalReports: 0,
        issuesByType: {},
        avgResponseTime: 0,
        resolutionRate: 0,
        topScouts: []
      };
    } catch (error) {
      logger.error('api: Failed to get scouting analytics', error);
      throw error;
    }
  }

  async generateScoutingRoute(
    facilityId: string,
    employeeId: string
  ): Promise<any> {
    try {
      // Generate optimal scouting route based on:
      // - Historical issue locations
      // - Time since last inspection
      // - Priority areas
      // - Employee location

      return {
        route: [],
        estimatedTime: 0,
        priorityZones: [],
        checkpoints: []
      };
    } catch (error) {
      logger.error('api: Failed to generate scouting route', error);
      throw error;
    }
  }
}