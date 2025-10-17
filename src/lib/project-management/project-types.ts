/**
 * Project Management Types for VibeLux Design Projects
 * Comprehensive project management for cogeneration and facility design projects
 */

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  phase: ProjectPhase;
  
  // Scheduling
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  plannedDuration: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Dependencies
  dependencies: TaskDependency[];
  predecessors: string[]; // Task IDs
  successors: string[]; // Task IDs
  
  // Progress
  status: TaskStatus;
  progress: number; // 0-100%
  priority: TaskPriority;
  
  // Resources
  assignedTo: ProjectMember[];
  estimatedHours: number;
  actualHours: number;
  cost: {
    budgeted: number;
    actual: number;
    currency: string;
  };
  
  // Deliverables
  deliverables: Deliverable[];
  milestones: Milestone[];
  
  // Quality & Risk
  qualityChecks: QualityCheck[];
  risks: Risk[];
  
  // Documentation
  notes: string;
  attachments: Attachment[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  
  // Timing
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Progress
  status: PhaseStatus;
  progress: number; // 0-100%
  
  // Gates & Approvals
  entryGate?: Gate;
  exitGate?: Gate;
  approvals: Approval[];
  
  // Resources
  budget: number;
  actualCost: number;
  
  // Tasks
  taskIds: string[];
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
  department: string;
  hourlyRate: number;
  availability: number; // 0-100%
  skills: string[];
  certifications: string[];
  contactInfo: {
    phone: string;
    email: string;
    location: string;
  };
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: DeliverableType;
  dueDate: Date;
  status: DeliverableStatus;
  assignedTo: string;
  files: Attachment[];
  reviewers: string[];
  approvalRequired: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  critical: boolean;
  dependencies: string[]; // Task IDs that must complete
  criteria: string[]; // Success criteria
}

export interface QualityCheck {
  id: string;
  name: string;
  description: string;
  type: QualityCheckType;
  checkDate: Date;
  inspector: string;
  status: QualityStatus;
  result: 'pass' | 'fail' | 'conditional';
  notes: string;
  correctiveActions: CorrectiveAction[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: RiskLevel;
  impact: RiskLevel;
  riskScore: number; // probability * impact
  status: RiskStatus;
  owner: string;
  mitigationPlan: string;
  contingencyPlan: string;
  reviewDate: Date;
}

export interface Gate {
  id: string;
  name: string;
  description: string;
  criteria: GateCriteria[];
  status: GateStatus;
  reviewDate?: Date;
  reviewers: string[];
  decision: GateDecision;
  comments: string;
}

export interface Approval {
  id: string;
  title: string;
  description: string;
  requiredBy: Date;
  approver: string;
  status: ApprovalStatus;
  approvedAt?: Date;
  comments: string;
  conditions: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  description?: string;
}

export interface TaskDependency {
  predecessorId: string;
  type: DependencyType;
  lag: number; // days
  description?: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: ActionStatus;
  completedAt?: Date;
}

export interface GateCriteria {
  id: string;
  description: string;
  met: boolean;
  evidence: string;
  verifiedBy: string;
  verifiedAt?: Date;
}

// Project-level interfaces
export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  
  // Client & Location
  client: ClientInfo;
  location: ProjectLocation;
  
  // Timing
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Status & Progress
  status: ProjectStatus;
  overallProgress: number; // 0-100%
  health: ProjectHealth;
  
  // Structure
  phases: ProjectPhase[];
  tasks: ProjectTask[];
  milestones: Milestone[];
  
  // Team & Resources
  projectManager: string;
  team: ProjectMember[];
  stakeholders: Stakeholder[];
  
  // Budget & Contracts
  budget: ProjectBudget;
  contracts: Contract[];
  
  // Quality & Risk
  qualityPlan: QualityPlan;
  riskRegister: Risk[];
  
  // Design Integration
  designData?: {
    facilityId?: string;
    designState?: any; // DesignerState
    cogenerationComponents?: any[];
    drawings?: string[];
    specifications?: string[];
  };
  
  // Communication
  communications: Communication[];
  meetingNotes: MeetingNote[];
  
  // Documentation
  documents: ProjectDocument[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ClientInfo {
  id: string;
  companyName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  facilityType: string;
}

export interface ProjectLocation {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  climate: string;
  utilities: {
    electrical: string;
    gas: string;
    water: string;
    internet: string;
  };
}

export interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  contactInfo: {
    email: string;
    phone: string;
  };
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
}

export interface ProjectBudget {
  totalBudget: number;
  spent: number;
  committed: number;
  remaining: number;
  contingency: number;
  currency: string;
  
  breakdown: BudgetBreakdown[];
  changes: BudgetChange[];
}

export interface BudgetBreakdown {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export interface BudgetChange {
  id: string;
  description: string;
  amount: number;
  type: 'increase' | 'decrease';
  reason: string;
  approvedBy: string;
  approvedAt: Date;
}

export interface Contract {
  id: string;
  title: string;
  contractor: string;
  type: ContractType;
  value: number;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  terms: string;
  deliverables: string[];
}

export interface QualityPlan {
  standards: string[];
  procedures: QualityProcedure[];
  inspectionSchedule: QualityCheck[];
  metrics: QualityMetric[];
}

export interface QualityProcedure {
  id: string;
  name: string;
  description: string;
  steps: string[];
  frequency: string;
  responsible: string;
}

export interface QualityMetric {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface Communication {
  id: string;
  type: CommunicationType;
  subject: string;
  content: string;
  from: string;
  to: string[];
  cc?: string[];
  sentAt: Date;
  priority: MessagePriority;
  relatedTaskId?: string;
  attachments: Attachment[];
}

export interface MeetingNote {
  id: string;
  title: string;
  date: Date;
  attendees: string[];
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
  nextMeeting?: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: ActionStatus;
  priority: TaskPriority;
}

export interface ProjectDocument {
  id: string;
  title: string;
  type: DocumentType;
  version: string;
  file: Attachment;
  category: string;
  status: DocumentStatus;
  reviewers: string[];
  approvers: string[];
}

// Enums and types
export type TaskCategory = 
  | 'design' 
  | 'engineering' 
  | 'procurement' 
  | 'construction' 
  | 'commissioning' 
  | 'testing' 
  | 'documentation' 
  | 'approval' 
  | 'training'
  | 'maintenance';

export type TaskStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'on_hold' 
  | 'completed' 
  | 'cancelled' 
  | 'delayed';

export type TaskPriority = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low';

export type PhaseStatus = 
  | 'planned' 
  | 'active' 
  | 'completed' 
  | 'delayed' 
  | 'cancelled';

export type ProjectRole = 
  | 'project_manager' 
  | 'design_engineer' 
  | 'construction_manager' 
  | 'electrical_engineer' 
  | 'mechanical_engineer' 
  | 'commissioning_agent' 
  | 'quality_inspector' 
  | 'safety_officer' 
  | 'technician'
  | 'contractor'
  | 'client_representative';

export type DeliverableType = 
  | 'drawing' 
  | 'specification' 
  | 'report' 
  | 'calculation' 
  | 'manual' 
  | 'certification' 
  | 'approval' 
  | 'training_material';

export type DeliverableStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'rejected' 
  | 'final';

export type MilestoneStatus = 
  | 'upcoming' 
  | 'current' 
  | 'achieved' 
  | 'missed' 
  | 'cancelled';

export type QualityCheckType = 
  | 'inspection' 
  | 'test' 
  | 'audit' 
  | 'review' 
  | 'verification';

export type QualityStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type RiskCategory = 
  | 'technical' 
  | 'schedule' 
  | 'cost' 
  | 'resource' 
  | 'external' 
  | 'quality' 
  | 'safety';

export type RiskLevel = 
  | 'very_low' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

export type RiskStatus = 
  | 'open' 
  | 'monitoring' 
  | 'mitigated' 
  | 'closed' 
  | 'realized';

export type GateStatus = 
  | 'pending' 
  | 'in_review' 
  | 'approved' 
  | 'conditional' 
  | 'rejected';

export type GateDecision = 
  | 'proceed' 
  | 'proceed_with_conditions' 
  | 'halt' 
  | 'cancel';

export type ApprovalStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'conditional';

export type DependencyType = 
  | 'finish_to_start' 
  | 'start_to_start' 
  | 'finish_to_finish' 
  | 'start_to_finish';

export type ActionStatus = 
  | 'open' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type ProjectType = 
  | 'cogeneration' 
  | 'lighting_design' 
  | 'hvac_design' 
  | 'facility_design' 
  | 'retrofit' 
  | 'maintenance';

export type ProjectStatus = 
  | 'planning' 
  | 'active' 
  | 'on_hold' 
  | 'completed' 
  | 'cancelled';

export type ProjectHealth = 
  | 'green' 
  | 'yellow' 
  | 'red';

export type ContractType = 
  | 'fixed_price' 
  | 'time_materials' 
  | 'cost_plus' 
  | 'design_build';

export type ContractStatus = 
  | 'draft' 
  | 'negotiation' 
  | 'signed' 
  | 'active' 
  | 'completed' 
  | 'terminated';

export type CommunicationType = 
  | 'email' 
  | 'phone' 
  | 'meeting' 
  | 'letter' 
  | 'text' 
  | 'video_call';

export type MessagePriority = 
  | 'urgent' 
  | 'high' 
  | 'normal' 
  | 'low';

export type DocumentType = 
  | 'drawing' 
  | 'specification' 
  | 'report' 
  | 'manual' 
  | 'certificate' 
  | 'contract' 
  | 'correspondence';

export type DocumentStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'superseded' 
  | 'archived';

// Gantt Chart specific types
export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  dependencies: string[];
  assignee: string;
  color: string;
  type: 'task' | 'milestone' | 'summary';
  children?: GanttTask[];
  collapsed?: boolean;
}

export interface GanttConfig {
  timeScale: 'day' | 'week' | 'month';
  showWeekends: boolean;
  showDependencies: boolean;
  showProgress: boolean;
  showCriticalPath: boolean;
  showBaseline: boolean;
  columnWidth: number;
  rowHeight: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  phases: PhaseTemplate[];
  tasks: TaskTemplate[];
  estimatedDuration: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PhaseTemplate {
  name: string;
  description: string;
  durationPercent: number;
  tasks: string[];
}

export interface TaskTemplate {
  name: string;
  description: string;
  category: TaskCategory;
  estimatedHours: number;
  dependencies: string[];
  deliverables: string[];
}

export { };