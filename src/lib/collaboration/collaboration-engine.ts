/**
 * Real-time Collaboration Engine
 * Multi-user collaboration system with live editing, comments, and video conferencing
 */

import type {
  Project,
  ProjectTask,
  ProjectPhase
} from '@/lib/project-management/project-types';

// Collaboration Types
export interface CollaborationSession {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: SessionType;
  status: SessionStatus;
  host: CollaborationUser;
  participants: CollaborationUser[];
  activeUsers: ActiveUser[];
  permissions: SessionPermissions;
  settings: SessionSettings;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // milliseconds
  metadata?: Record<string, any>;
}

export type SessionType = 
  | 'design_review'
  | 'project_meeting'
  | 'client_presentation'
  | 'team_standup'
  | 'technical_discussion'
  | 'quality_review'
  | 'milestone_review'
  | 'training_session';

export type SessionStatus = 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  company?: string;
  timezone: string;
  preferences: UserPreferences;
  status: UserStatus;
  lastSeen: Date;
}

export type UserRole = 'admin' | 'project_manager' | 'engineer' | 'designer' | 'client' | 'contractor' | 'viewer';
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  collaboration: {
    showCursor: boolean;
    allowScreenShare: boolean;
    autoJoinVideo: boolean;
  };
  display: {
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    language: string;
  };
}

export interface ActiveUser {
  userId: string;
  user: CollaborationUser;
  joinedAt: Date;
  isActive: boolean;
  currentView: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  permissions: UserPermissions;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  viewId: string;
  timestamp: Date;
}

export interface SelectionRange {
  elementId: string;
  elementType: string;
  startOffset?: number;
  endOffset?: number;
  timestamp: Date;
}

export interface SessionPermissions {
  canEdit: UserRole[];
  canComment: UserRole[];
  canShare: UserRole[];
  canInvite: UserRole[];
  canModerate: UserRole[];
  canRecord: UserRole[];
}

export interface UserPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canInvite: boolean;
  canModerate: boolean;
  canRecord: boolean;
  canViewSensitive: boolean;
}

export interface SessionSettings {
  isRecording: boolean;
  allowGuests: boolean;
  requireApproval: boolean;
  maxParticipants: number;
  sessionTimeout: number; // minutes
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  qualitySettings: {
    videoQuality: 'low' | 'medium' | 'high' | 'auto';
    audioQuality: 'low' | 'medium' | 'high';
    screenShareQuality: 'low' | 'medium' | 'high';
  };
}

// Real-time Editing
export interface CollaborativeEdit {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  type: EditType;
  targetId: string;
  targetType: string;
  operation: EditOperation;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  applied: boolean;
  conflicted: boolean;
}

export type EditType = 
  | 'create'
  | 'update'
  | 'delete'
  | 'move'
  | 'resize'
  | 'property_change'
  | 'text_change'
  | 'style_change';

export interface EditOperation {
  path: string;
  action: 'insert' | 'delete' | 'replace' | 'move';
  position?: number;
  length?: number;
  content?: any;
  attributes?: Record<string, any>;
}

// Comments and Annotations
export interface Comment {
  id: string;
  sessionId?: string;
  projectId: string;
  targetId: string;
  targetType: 'task' | 'phase' | 'component' | 'document' | 'general';
  content: string;
  author: CollaborationUser;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  priority: CommentPriority;
  status: CommentStatus;
  attachments: CommentAttachment[];
  replies: CommentReply[];
  mentions: string[]; // user IDs
  tags: string[];
  position?: CommentPosition;
  thread: boolean;
}

export type CommentPriority = 'low' | 'normal' | 'high' | 'critical';
export type CommentStatus = 'active' | 'resolved' | 'archived';

export interface CommentReply {
  id: string;
  content: string;
  author: CollaborationUser;
  createdAt: Date;
  updatedAt?: Date;
  attachments: CommentAttachment[];
  mentions: string[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'link';
  url: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface CommentPosition {
  x: number;
  y: number;
  viewId: string;
  elementId?: string;
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

// Video Conferencing
export interface VideoConference {
  id: string;
  sessionId: string;
  roomId: string;
  status: ConferenceStatus;
  participants: VideoParticipant[];
  settings: ConferenceSettings;
  recording?: ConferenceRecording;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  quality: ConnectionQuality;
}

export type ConferenceStatus = 'waiting' | 'active' | 'paused' | 'ended';

export interface VideoParticipant {
  userId: string;
  user: CollaborationUser;
  connectionId: string;
  joinedAt: Date;
  leftAt?: Date;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  isModerator: boolean;
  connectionQuality: ConnectionQuality;
  deviceInfo: DeviceInfo;
}

export interface ConnectionQuality {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  video: number; // 0-100
  audio: number; // 0-100
  network: number; // 0-100
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  camera?: string;
  microphone?: string;
  speaker?: string;
}

export interface ConferenceSettings {
  maxParticipants: number;
  allowGuests: boolean;
  requireApproval: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  backgroundNoise: boolean;
  virtualBackground: boolean;
}

export interface ConferenceRecording {
  id: string;
  filename: string;
  duration: number;
  size: number;
  format: string;
  quality: string;
  url: string;
  startedAt: Date;
  endedAt: Date;
  participants: string[];
  transcription?: string;
  highlights: RecordingHighlight[];
}

export interface RecordingHighlight {
  timestamp: number;
  duration: number;
  title: string;
  description: string;
  type: 'decision' | 'action_item' | 'important' | 'question';
  participants: string[];
}

// Screen Sharing
export interface ScreenShare {
  id: string;
  sessionId: string;
  userId: string;
  type: ShareType;
  title: string;
  startedAt: Date;
  endedAt?: Date;
  viewers: string[];
  quality: 'low' | 'medium' | 'high';
  allowControl: boolean;
  controlledBy?: string;
  annotations: ScreenAnnotation[];
}

export type ShareType = 'screen' | 'window' | 'tab' | 'application';

export interface ScreenAnnotation {
  id: string;
  userId: string;
  type: 'pointer' | 'highlight' | 'draw' | 'text';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style: AnnotationStyle;
  content?: string;
  timestamp: Date;
  duration?: number;
}

export interface AnnotationStyle {
  color: string;
  thickness: number;
  opacity: number;
  style: 'solid' | 'dashed' | 'dotted';
}

// Chat and Messaging
export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  user: CollaborationUser;
  content: string;
  type: MessageType;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  mentions: string[];
  replyTo?: string;
  thread?: boolean;
  metadata?: Record<string, any>;
}

export type MessageType = 'text' | 'file' | 'image' | 'system' | 'action' | 'poll' | 'reminder';

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  thumbnail?: string;
}

// Collaboration Events
export interface CollaborationEvent {
  id: string;
  sessionId: string;
  type: EventType;
  data: any;
  userId: string;
  timestamp: Date;
  broadcast: boolean;
  recipients?: string[];
}

export type EventType =
  | 'user_joined'
  | 'user_left'
  | 'cursor_moved'
  | 'selection_changed'
  | 'edit_applied'
  | 'comment_added'
  | 'comment_resolved'
  | 'video_enabled'
  | 'video_disabled'
  | 'audio_enabled'
  | 'audio_disabled'
  | 'screen_share_started'
  | 'screen_share_ended'
  | 'recording_started'
  | 'recording_ended'
  | 'permission_changed'
  | 'session_paused'
  | 'session_resumed'
  | 'session_ended';

export class CollaborationEngine {
  private sessions: Map<string, CollaborationSession> = new Map();
  private activeEdits: Map<string, CollaborativeEdit[]> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private events: CollaborationEvent[] = [];
  
  // WebSocket connections (in real implementation)
  private connections: Map<string, any> = new Map();

  constructor() {
    this.initializeEventHandlers();
  }

  /**
   * Create a new collaboration session
   */
  async createSession(
    projectId: string,
    host: CollaborationUser,
    type: SessionType,
    settings: Partial<SessionSettings> = {}
  ): Promise<CollaborationSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultSettings: SessionSettings = {
      isRecording: false,
      allowGuests: false,
      requireApproval: true,
      maxParticipants: 50,
      sessionTimeout: 480, // 8 hours
      autoSave: true,
      autoSaveInterval: 30,
      qualitySettings: {
        videoQuality: 'auto',
        audioQuality: 'high',
        screenShareQuality: 'high'
      }
    };

    const defaultPermissions: SessionPermissions = {
      canEdit: ['admin', 'project_manager', 'engineer', 'designer'],
      canComment: ['admin', 'project_manager', 'engineer', 'designer', 'client', 'contractor'],
      canShare: ['admin', 'project_manager', 'engineer', 'designer'],
      canInvite: ['admin', 'project_manager'],
      canModerate: ['admin', 'project_manager'],
      canRecord: ['admin', 'project_manager']
    };

    const session: CollaborationSession = {
      id: sessionId,
      projectId,
      name: `${type.replace('_', ' ').toUpperCase()} - ${new Date().toLocaleDateString()}`,
      type,
      status: 'scheduled',
      host,
      participants: [host],
      activeUsers: [],
      permissions: defaultPermissions,
      settings: { ...defaultSettings, ...settings },
      createdAt: new Date()
    };

    this.sessions.set(sessionId, session);
    this.activeEdits.set(sessionId, []);
    this.comments.set(sessionId, []);
    this.messages.set(sessionId, []);

    await this.broadcastEvent(sessionId, 'session_created', session, host.id);
    
    return session;
  }

  /**
   * Join a collaboration session
   */
  async joinSession(sessionId: string, user: CollaborationUser): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Check if user is already a participant
    const isParticipant = session.participants.some(p => p.id === user.id);
    if (!isParticipant) {
      session.participants.push(user);
    }

    // Add to active users
    const activeUser: ActiveUser = {
      userId: user.id,
      user,
      joinedAt: new Date(),
      isActive: true,
      currentView: 'main',
      permissions: this.calculateUserPermissions(user, session),
      videoEnabled: false,
      audioEnabled: false,
      screenSharing: false
    };

    session.activeUsers.push(activeUser);

    // Start session if not already started
    if (session.status === 'scheduled') {
      session.status = 'active';
      session.startedAt = new Date();
    }

    await this.broadcastEvent(sessionId, 'user_joined', { user }, user.id);
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Remove from active users
    session.activeUsers = session.activeUsers.filter(u => u.userId !== userId);

    // End session if no active users
    if (session.activeUsers.length === 0) {
      session.status = 'ended';
      session.endedAt = new Date();
      if (session.startedAt) {
        session.duration = session.endedAt.getTime() - session.startedAt.getTime();
      }
    }

    await this.broadcastEvent(sessionId, 'user_left', { userId }, userId);
  }

  /**
   * Apply a collaborative edit
   */
  async applyEdit(
    sessionId: string,
    userId: string,
    edit: Omit<CollaborativeEdit, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'applied' | 'conflicted'>
  ): Promise<CollaborativeEdit> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const user = session.activeUsers.find(u => u.userId === userId);
    if (!user || !user.permissions.canEdit) {
      throw new Error('User does not have edit permissions');
    }

    const collaborativeEdit: CollaborativeEdit = {
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      timestamp: new Date(),
      applied: false,
      conflicted: false,
      ...edit
    };

    // Check for conflicts
    const sessionEdits = this.activeEdits.get(sessionId) || [];
    const conflicts = this.detectConflicts(collaborativeEdit, sessionEdits);
    
    if (conflicts.length > 0) {
      collaborativeEdit.conflicted = true;
      collaborativeEdit.metadata = { ...collaborativeEdit.metadata, conflicts };
    }

    // Apply edit
    try {
      await this.executeEdit(collaborativeEdit);
      collaborativeEdit.applied = true;
    } catch (error) {
      collaborativeEdit.conflicted = true;
      collaborativeEdit.metadata = { ...collaborativeEdit.metadata, error: error.message };
    }

    // Store edit
    sessionEdits.push(collaborativeEdit);
    this.activeEdits.set(sessionId, sessionEdits);

    // Broadcast to other users
    await this.broadcastEvent(sessionId, 'edit_applied', collaborativeEdit, userId);

    return collaborativeEdit;
  }

  /**
   * Add a comment
   */
  async addComment(
    sessionId: string,
    userId: string,
    comment: Omit<Comment, 'id' | 'sessionId' | 'author' | 'createdAt' | 'replies'>
  ): Promise<Comment> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const user = session.activeUsers.find(u => u.userId === userId);
    if (!user || !user.permissions.canComment) {
      throw new Error('User does not have comment permissions');
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      author: user.user,
      createdAt: new Date(),
      replies: [],
      ...comment
    };

    // Store comment
    const sessionComments = this.comments.get(sessionId) || [];
    sessionComments.push(newComment);
    this.comments.set(sessionId, sessionComments);

    // Send notifications to mentioned users
    if (newComment.mentions.length > 0) {
      await this.notifyMentionedUsers(sessionId, newComment);
    }

    // Broadcast to session
    await this.broadcastEvent(sessionId, 'comment_added', newComment, userId);

    return newComment;
  }

  /**
   * Send chat message
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
    type: MessageType = 'text',
    attachments: MessageAttachment[] = []
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const user = session.activeUsers.find(u => u.userId === userId);
    if (!user) {
      throw new Error('User not found in session');
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      user: user.user,
      content,
      type,
      timestamp: new Date(),
      reactions: [],
      attachments,
      mentions: this.extractMentions(content)
    };

    // Store message
    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(sessionId, sessionMessages);

    // Broadcast to session
    await this.broadcastEvent(sessionId, 'message_sent', message, userId);

    return message;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(
    sessionId: string,
    userId: string,
    type: ShareType,
    title: string
  ): Promise<ScreenShare> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const user = session.activeUsers.find(u => u.userId === userId);
    if (!user || !user.permissions.canShare) {
      throw new Error('User does not have share permissions');
    }

    // End any existing screen shares by this user
    await this.endScreenShare(sessionId, userId);

    const screenShare: ScreenShare = {
      id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      type,
      title,
      startedAt: new Date(),
      viewers: [],
      quality: 'high',
      allowControl: false,
      annotations: []
    };

    // Update user status
    user.screenSharing = true;

    // Broadcast to session
    await this.broadcastEvent(sessionId, 'screen_share_started', screenShare, userId);

    return screenShare;
  }

  /**
   * Update cursor position
   */
  async updateCursor(
    sessionId: string,
    userId: string,
    position: CursorPosition
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const user = session.activeUsers.find(u => u.userId === userId);
    if (!user) return;

    user.cursor = position;

    // Broadcast to other users (throttled in real implementation)
    await this.broadcastEvent(sessionId, 'cursor_moved', { userId, position }, userId, false);
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get session comments
   */
  getComments(sessionId: string): Comment[] {
    return this.comments.get(sessionId) || [];
  }

  /**
   * Get session messages
   */
  getMessages(sessionId: string): ChatMessage[] {
    return this.messages.get(sessionId) || [];
  }

  /**
   * Get session edits
   */
  getEdits(sessionId: string): CollaborativeEdit[] {
    return this.activeEdits.get(sessionId) || [];
  }

  // Private helper methods
  private initializeEventHandlers(): void {
    // In a real implementation, this would set up WebSocket handlers
  }

  private calculateUserPermissions(user: CollaborationUser, session: CollaborationSession): UserPermissions {
    const isHost = session.host.id === user.id;
    
    return {
      canEdit: isHost || session.permissions.canEdit.includes(user.role),
      canComment: isHost || session.permissions.canComment.includes(user.role),
      canShare: isHost || session.permissions.canShare.includes(user.role),
      canInvite: isHost || session.permissions.canInvite.includes(user.role),
      canModerate: isHost || session.permissions.canModerate.includes(user.role),
      canRecord: isHost || session.permissions.canRecord.includes(user.role),
      canViewSensitive: isHost || ['admin', 'project_manager'].includes(user.role)
    };
  }

  private detectConflicts(edit: CollaborativeEdit, existingEdits: CollaborativeEdit[]): string[] {
    const conflicts: string[] = [];
    
    // Check for concurrent edits to the same target
    const recentEdits = existingEdits.filter(e => 
      e.targetId === edit.targetId && 
      e.timestamp.getTime() > Date.now() - 5000 // 5 seconds
    );

    if (recentEdits.length > 0) {
      conflicts.push('concurrent_edit');
    }

    return conflicts;
  }

  private async executeEdit(edit: CollaborativeEdit): Promise<void> {
    // In a real implementation, this would apply the edit to the actual data
    // For now, just simulate success
    return Promise.resolve();
  }

  private async notifyMentionedUsers(sessionId: string, comment: Comment): Promise<void> {
    // In a real implementation, this would send notifications
    logger.info('api', `Notifying users ${comment.mentions.join(', ')} about mention in comment ${comment.id}`);
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  private async endScreenShare(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const user = session.activeUsers.find(u => u.userId === userId);
    if (user) {
      user.screenSharing = false;
    }

    await this.broadcastEvent(sessionId, 'screen_share_ended', { userId }, userId);
  }

  private async broadcastEvent(
    sessionId: string,
    type: EventType,
    data: any,
    userId: string,
    store: boolean = true
  ): Promise<void> {
    const event: CollaborationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      type,
      data,
      userId,
      timestamp: new Date(),
      broadcast: true
    };

    if (store) {
      this.events.push(event);
    }

    // In a real implementation, this would broadcast via WebSocket
    logger.info('api', `Broadcasting event ${type} to session ${sessionId}:`, { data: data });
  }
}

export { CollaborationEngine };