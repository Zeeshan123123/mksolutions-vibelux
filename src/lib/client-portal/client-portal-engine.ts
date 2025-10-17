/**
 * Client Portal and Stakeholder Communication Engine
 * Secure client access to project information and communication tools
 */

import type {
  Project,
  ProjectTask,
  ProjectPhase,
  ProjectMilestone
} from '@/lib/project-management/project-types';
import type { CostEstimate } from '@/lib/cost-estimation/cost-estimator';
import type { ProgressMetrics } from '@/lib/progress-tracking/progress-tracker';

// Client Portal Types
export interface ClientPortalUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: ClientRole;
  avatar?: string;
  permissions: ClientPermissions;
  preferences: ClientPreferences;
  lastLogin: Date;
  isActive: boolean;
  projects: string[]; // Project IDs they have access to
  contactInfo: ContactInfo;
}

export type ClientRole = 'client' | 'stakeholder' | 'contractor' | 'consultant' | 'observer';

export interface ClientPermissions {
  canViewProject: boolean;
  canViewFinancials: boolean;
  canViewSchedule: boolean;
  canViewDocuments: boolean;
  canDownloadFiles: boolean;
  canSubmitFeedback: boolean;
  canRequestChanges: boolean;
  canApproveDeliverables: boolean;
  canViewSensitiveData: boolean;
  canInviteOthers: boolean;
}

export interface ClientPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  dashboard: {
    defaultView: 'overview' | 'schedule' | 'financials' | 'documents';
    showAdvancedMetrics: boolean;
    timezone: string;
  };
  communication: {
    language: string;
    preferredChannel: 'email' | 'phone' | 'portal';
    availableHours: TimeRange;
  };
}

export interface ContactInfo {
  phone: string;
  alternateEmail?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;
  timezone: string;
}

// Project View Types
export interface ClientProjectView {
  id: string;
  projectId: string;
  clientId: string;
  customizations: ViewCustomization;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewCustomization {
  hiddenSections: string[];
  customLabels: Record<string, string>;
  pinnedItems: string[];
  dashboardLayout: DashboardWidget[];
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export type WidgetType = 
  | 'project_status'
  | 'schedule_overview'
  | 'budget_summary'
  | 'recent_updates'
  | 'milestone_progress'
  | 'document_library'
  | 'team_members'
  | 'upcoming_meetings'
  | 'change_requests'
  | 'quality_metrics';

// Communication Types
export interface ClientMessage {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserIds: string[];
  subject: string;
  content: string;
  messageType: MessageType;
  priority: MessagePriority;
  status: MessageStatus;
  attachments: MessageAttachment[];
  createdAt: Date;
  readBy: MessageRead[];
  replies: ClientMessage[];
  tags: string[];
  isInternal: boolean;
}

export type MessageType = 'general' | 'change_request' | 'approval' | 'feedback' | 'update' | 'alert';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'archived';

export interface MessageAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  isConfidential: boolean;
}

export interface MessageRead {
  userId: string;
  readAt: Date;
  device: string;
  location?: string;
}

// Document Management
export interface ClientDocument {
  id: string;
  projectId: string;
  name: string;
  description: string;
  category: DocumentCategory;
  version: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
  url: string;
  permissions: DocumentPermissions;
  approvals: DocumentApproval[];
  revisions: DocumentRevision[];
  tags: string[];
  expiresAt?: Date;
}

export type DocumentCategory = 
  | 'contract'
  | 'drawing'
  | 'specification'
  | 'report'
  | 'photo'
  | 'permit'
  | 'invoice'
  | 'proposal'
  | 'change_order'
  | 'warranty';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';

export interface DocumentPermissions {
  canView: ClientRole[];
  canDownload: ClientRole[];
  canComment: ClientRole[];
  canApprove: ClientRole[];
  requiresApproval: boolean;
}

export interface DocumentApproval {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  timestamp: Date;
  signature?: string;
}

export interface DocumentRevision {
  id: string;
  version: string;
  changes: string;
  createdBy: string;
  createdAt: Date;
  url: string;
}

// Change Management
export interface ChangeRequest {
  id: string;
  projectId: string;
  requestedBy: string;
  title: string;
  description: string;
  category: ChangeCategory;
  priority: ChangePriority;
  status: ChangeStatus;
  costImpact: CostImpact;
  scheduleImpact: ScheduleImpact;
  scopeImpact: string;
  justification: string;
  alternativeOptions: string[];
  approvers: ChangeApprover[];
  attachments: MessageAttachment[];
  timeline: ChangeTimeline[];
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
}

export type ChangeCategory = 'scope' | 'schedule' | 'budget' | 'quality' | 'design' | 'regulatory';
export type ChangePriority = 'low' | 'medium' | 'high' | 'critical';
export type ChangeStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented' | 'cancelled';

export interface CostImpact {
  amount: number;
  breakdown: Record<string, number>;
  contingencyUsed: number;
  explanation: string;
}

export interface ScheduleImpact {
  delayDays: number;
  affectedTasks: string[];
  criticalPathImpact: boolean;
  explanation: string;
}

export interface ChangeApprover {
  userId: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  timestamp?: Date;
  signature?: string;
}

export interface ChangeTimeline {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  notes: string;
}

// Meeting Management
export interface ClientMeeting {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: MeetingType;
  scheduledAt: Date;
  duration: number; // minutes
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  attendees: MeetingAttendee[];
  agenda: AgendaItem[];
  documents: string[]; // Document IDs
  status: MeetingStatus;
  minutes?: MeetingMinutes;
  recordings?: MeetingRecording[];
  createdAt: Date;
  updatedAt: Date;
}

export type MeetingType = 'kickoff' | 'progress' | 'milestone' | 'design_review' | 'change_review' | 'closure';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

export interface MeetingAttendee {
  userId: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  joinedAt?: Date;
  leftAt?: Date;
  notes?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  presenter: string;
  documents: string[];
  order: number;
  completed: boolean;
}

export interface MeetingMinutes {
  id: string;
  content: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  attendees: string[];
  nextMeeting?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

export interface Decision {
  id: string;
  description: string;
  madeBy: string;
  impact: string;
  relatedItems: string[];
}

export interface MeetingRecording {
  id: string;
  filename: string;
  duration: number;
  url: string;
  transcription?: string;
  createdAt: Date;
}

// Reports and Analytics
export interface ClientReport {
  id: string;
  projectId: string;
  title: string;
  type: ReportType;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string;
  data: ReportData;
  format: ReportFormat;
  recipients: string[];
  isAutomated: boolean;
  nextGeneration?: Date;
}

export type ReportType = 'progress' | 'financial' | 'quality' | 'milestone' | 'executive' | 'custom';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'project_lifecycle';
export type ReportFormat = 'pdf' | 'excel' | 'html' | 'json';

export interface ReportData {
  summary: ReportSummary;
  metrics: Record<string, number>;
  charts: ChartData[];
  tables: TableData[];
  attachments: string[];
}

export interface ReportSummary {
  projectStatus: string;
  keyAchievements: string[];
  upcomingMilestones: string[];
  risksAndIssues: string[];
  recommendations: string[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: any[];
  config: Record<string, any>;
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
  config: Record<string, any>;
}

export class ClientPortalEngine {
  private clients: Map<string, ClientPortalUser> = new Map();
  private messages: Map<string, ClientMessage[]> = new Map();
  private documents: Map<string, ClientDocument[]> = new Map();
  private changeRequests: Map<string, ChangeRequest[]> = new Map();
  private meetings: Map<string, ClientMeeting[]> = new Map();
  private reports: Map<string, ClientReport[]> = new Map();

  constructor() {
    this.initializeDefaultClients();
  }

  /**
   * Register a new client or stakeholder
   */
  async registerClient(client: Omit<ClientPortalUser, 'id' | 'lastLogin' | 'isActive'>): Promise<ClientPortalUser> {
    const newClient: ClientPortalUser = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastLogin: new Date(),
      isActive: true,
      ...client
    };

    this.clients.set(newClient.id, newClient);
    this.messages.set(newClient.id, []);
    
    return newClient;
  }

  /**
   * Get client dashboard data
   */
  async getClientDashboard(clientId: string, projectId: string): Promise<ClientDashboard> {
    const client = this.clients.get(clientId);
    if (!client || !client.projects.includes(projectId)) {
      throw new Error('Client not found or no access to project');
    }

    // In a real implementation, this would fetch actual project data
    return {
      projectOverview: {
        id: projectId,
        name: 'Cogeneration System Installation',
        status: 'In Progress',
        progress: 65,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
        nextMilestone: 'Equipment Installation Complete',
        nextMilestoneDate: new Date('2024-04-15')
      },
      recentUpdates: [
        {
          id: 'update-1',
          title: 'Equipment Delivered',
          description: 'Main cogeneration unit has been delivered to site',
          date: new Date(),
          type: 'milestone',
          priority: 'normal'
        },
        {
          id: 'update-2',
          title: 'Permit Approved',
          description: 'Environmental permit has been approved by city',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'approval',
          priority: 'high'
        }
      ],
      upcomingMeetings: this.getUpcomingMeetings(projectId),
      pendingApprovals: this.getPendingApprovals(clientId, projectId),
      budgetSummary: {
        totalBudget: 2500000,
        spent: 1625000,
        remaining: 875000,
        forecasted: 2400000,
        variance: 100000
      },
      scheduleHealth: {
        status: 'on_track',
        daysAhead: 3,
        criticalTasks: 2,
        upcomingDeadlines: 5
      }
    };
  }

  /**
   * Send message to client
   */
  async sendMessage(
    fromUserId: string,
    toUserIds: string[],
    projectId: string,
    subject: string,
    content: string,
    messageType: MessageType = 'general',
    priority: MessagePriority = 'normal',
    attachments: MessageAttachment[] = []
  ): Promise<ClientMessage> {
    const message: ClientMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      fromUserId,
      toUserIds,
      subject,
      content,
      messageType,
      priority,
      status: 'sent',
      attachments,
      createdAt: new Date(),
      readBy: [],
      replies: [],
      tags: [],
      isInternal: false
    };

    // Add to each recipient's message list
    toUserIds.forEach(userId => {
      const userMessages = this.messages.get(userId) || [];
      userMessages.push(message);
      this.messages.set(userId, userMessages);
    });

    return message;
  }

  /**
   * Submit change request
   */
  async submitChangeRequest(
    requestData: Omit<ChangeRequest, 'id' | 'status' | 'timeline' | 'createdAt' | 'updatedAt'>
  ): Promise<ChangeRequest> {
    const changeRequest: ChangeRequest = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'submitted',
      timeline: [{
        id: `timeline-${Date.now()}`,
        action: 'Change request submitted',
        performedBy: requestData.requestedBy,
        timestamp: new Date(),
        notes: 'Initial submission'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...requestData
    };

    const projectChanges = this.changeRequests.get(requestData.projectId) || [];
    projectChanges.push(changeRequest);
    this.changeRequests.set(requestData.projectId, projectChanges);

    return changeRequest;
  }

  /**
   * Schedule meeting
   */
  async scheduleMeeting(
    meetingData: Omit<ClientMeeting, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<ClientMeeting> {
    const meeting: ClientMeeting = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...meetingData
    };

    const projectMeetings = this.meetings.get(meetingData.projectId) || [];
    projectMeetings.push(meeting);
    this.meetings.set(meetingData.projectId, projectMeetings);

    return meeting;
  }

  /**
   * Generate client report
   */
  async generateReport(
    projectId: string,
    reportType: ReportType,
    period: ReportPeriod,
    generatedBy: string
  ): Promise<ClientReport> {
    const report: ClientReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${period}`,
      type: reportType,
      period,
      generatedAt: new Date(),
      generatedBy,
      format: 'pdf',
      recipients: [],
      isAutomated: false,
      data: {
        summary: {
          projectStatus: 'In Progress',
          keyAchievements: [
            'Equipment delivery completed',
            'Environmental permits approved',
            'Site preparation 90% complete'
          ],
          upcomingMilestones: [
            'Equipment installation start',
            'Electrical connections',
            'System commissioning'
          ],
          risksAndIssues: [
            'Weather delays possible',
            'Supply chain monitoring required'
          ],
          recommendations: [
            'Continue monitoring weather forecasts',
            'Prepare contingency plans for installation'
          ]
        },
        metrics: {
          overallProgress: 65,
          budgetUtilization: 65,
          schedulePerformance: 103,
          qualityScore: 95
        },
        charts: [],
        tables: [],
        attachments: []
      }
    };

    const projectReports = this.reports.get(projectId) || [];
    projectReports.push(report);
    this.reports.set(projectId, projectReports);

    return report;
  }

  /**
   * Get client's accessible projects
   */
  getClientProjects(clientId: string): string[] {
    const client = this.clients.get(clientId);
    return client ? client.projects : [];
  }

  /**
   * Get client messages
   */
  getClientMessages(clientId: string): ClientMessage[] {
    return this.messages.get(clientId) || [];
  }

  /**
   * Get project documents for client
   */
  getProjectDocuments(projectId: string, clientId: string): ClientDocument[] {
    const client = this.clients.get(clientId);
    if (!client || !client.projects.includes(projectId)) {
      return [];
    }

    const documents = this.documents.get(projectId) || [];
    return documents.filter(doc => 
      doc.permissions.canView.includes(client.role)
    );
  }

  /**
   * Get project change requests
   */
  getProjectChangeRequests(projectId: string): ChangeRequest[] {
    return this.changeRequests.get(projectId) || [];
  }

  /**
   * Get project meetings
   */
  getProjectMeetings(projectId: string): ClientMeeting[] {
    return this.meetings.get(projectId) || [];
  }

  // Private helper methods
  private initializeDefaultClients(): void {
    // Initialize with sample clients
    const sampleClient: ClientPortalUser = {
      id: 'client-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'ABC Manufacturing',
      role: 'client',
      permissions: {
        canViewProject: true,
        canViewFinancials: true,
        canViewSchedule: true,
        canViewDocuments: true,
        canDownloadFiles: true,
        canSubmitFeedback: true,
        canRequestChanges: true,
        canApproveDeliverables: true,
        canViewSensitiveData: false,
        canInviteOthers: false
      },
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
          frequency: 'daily'
        },
        dashboard: {
          defaultView: 'overview',
          showAdvancedMetrics: false,
          timezone: 'America/New_York'
        },
        communication: {
          language: 'en',
          preferredChannel: 'email',
          availableHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'America/New_York'
          }
        }
      },
      lastLogin: new Date(),
      isActive: true,
      projects: ['project-001'],
      contactInfo: {
        phone: '+1-555-123-4567',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      }
    };

    this.clients.set(sampleClient.id, sampleClient);
    this.messages.set(sampleClient.id, []);
  }

  private getUpcomingMeetings(projectId: string): ClientMeeting[] {
    const meetings = this.meetings.get(projectId) || [];
    return meetings
      .filter(meeting => meeting.scheduledAt > new Date() && meeting.status === 'scheduled')
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, 3);
  }

  private getPendingApprovals(clientId: string, projectId: string): any[] {
    const changeRequests = this.changeRequests.get(projectId) || [];
    return changeRequests.filter(change => 
      change.status === 'under_review' && 
      change.approvers.some(approver => approver.userId === clientId && approver.status === 'pending')
    );
  }
}

// Dashboard types
interface ClientDashboard {
  projectOverview: {
    id: string;
    name: string;
    status: string;
    progress: number;
    startDate: Date;
    endDate: Date;
    nextMilestone: string;
    nextMilestoneDate: Date;
  };
  recentUpdates: {
    id: string;
    title: string;
    description: string;
    date: Date;
    type: string;
    priority: string;
  }[];
  upcomingMeetings: ClientMeeting[];
  pendingApprovals: any[];
  budgetSummary: {
    totalBudget: number;
    spent: number;
    remaining: number;
    forecasted: number;
    variance: number;
  };
  scheduleHealth: {
    status: string;
    daysAhead: number;
    criticalTasks: number;
    upcomingDeadlines: number;
  };
}

