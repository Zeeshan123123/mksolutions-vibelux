/**
 * Real-Time Collaboration System
 * Professional multi-user collaboration for CAD projects with conflict resolution
 */

import { EventEmitter } from 'events';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { GreenhouseModel, Component, TechnicalDrawing } from '../cad/greenhouse-cad-system';
import { CADProject } from '../cad/cad-integration-layer';
import { CADDatabaseLayer } from '../database/cad-database-layer';

export type CollaborationEvent = 
  | 'user_joined' 
  | 'user_left' 
  | 'cursor_moved' 
  | 'selection_changed'
  | 'component_added' 
  | 'component_modified' 
  | 'component_deleted'
  | 'drawing_modified'
  | 'analysis_started'
  | 'analysis_completed'
  | 'comment_added'
  | 'lock_acquired'
  | 'lock_released'
  | 'conflict_detected'
  | 'conflict_resolved';

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canInvite: boolean;
    canManagePermissions: boolean;
  };
  presence: {
    online: boolean;
    lastSeen: Date;
    currentProject?: string;
    currentModel?: string;
    cursor?: { x: number; y: number; z: number };
    selection?: string[];
    activeView?: 'model' | 'drawing' | 'analysis' | 'bom';
  };
  preferences: {
    notifications: boolean;
    autoSave: boolean;
    theme: 'light' | 'dark';
    cursorsVisible: boolean;
    selectionsVisible: boolean;
  };
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: Map<string, CollaborationUser>;
  locks: Map<string, EntityLock>;
  history: CollaborationOperation[];
  conflicts: Map<string, Conflict>;
  createdAt: Date;
  lastActivity: Date;
}

export interface EntityLock {
  id: string;
  entityType: 'model' | 'component' | 'drawing' | 'analysis' | 'bom';
  entityId: string;
  userId: string;
  userName: string;
  lockType: 'exclusive' | 'shared' | 'intent';
  acquiredAt: Date;
  expiresAt: Date;
  autoRelease: boolean;
}

export interface CollaborationOperation {
  id: string;
  type: CollaborationEvent;
  userId: string;
  userName: string;
  timestamp: Date;
  data: any;
  entityType?: string;
  entityId?: string;
  projectId: string;
  sessionId: string;
  acknowledged: boolean;
  metadata?: {
    clientId: string;
    version: number;
    dependencies: string[];
  };
}

export interface Conflict {
  id: string;
  type: 'concurrent_edit' | 'lock_violation' | 'version_mismatch' | 'permission_denied';
  entityType: string;
  entityId: string;
  users: string[];
  operations: CollaborationOperation[];
  resolution?: {
    type: 'auto' | 'manual' | 'user_choice';
    resolvedBy: string;
    resolvedAt: Date;
    finalState: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface CollaborationConfig {
  maxUsersPerProject: number;
  lockTimeout: number; // milliseconds
  conflictResolutionTimeout: number; // milliseconds
  heartbeatInterval: number; // milliseconds
  operationHistoryLimit: number;
  autoSaveInterval: number; // milliseconds
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  permissions: {
    defaultRole: UserRole;
    roleHierarchy: Record<UserRole, UserRole[]>;
    actionPermissions: Record<string, UserRole[]>;
  };
}

class RealTimeCollaboration extends EventEmitter {
  private io: SocketIOServer;
  private database: CADDatabaseLayer;
  private config: CollaborationConfig;
  private sessions: Map<string, CollaborationSession> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socket IDs
  private socketUsers: Map<string, string> = new Map(); // socket ID -> userId
  private operationQueue: Map<string, CollaborationOperation[]> = new Map();
  private conflictResolver: ConflictResolver;
  private redisClient: any;
  private pubClient: any;
  private subClient: any;

  constructor(
    io: SocketIOServer,
    database: CADDatabaseLayer,
    config: CollaborationConfig
  ) {
    super();
    this.io = io;
    this.database = database;
    this.config = config;
    this.conflictResolver = new ConflictResolver(this);
    this.initializeRedis();
    this.setupSocketHandlers();
    this.startHeartbeat();
    this.startAutoSave();
  }

  /**
   * Initialize Redis for multi-server collaboration
   */
  private async initializeRedis(): Promise<void> {
    this.pubClient = createClient({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db
    });

    this.subClient = this.pubClient.duplicate();
    
    await this.pubClient.connect();
    await this.subClient.connect();

    // Setup Redis adapter for Socket.IO
    this.io.adapter(createAdapter(this.pubClient, this.subClient));
    
    this.emit('redis-connected');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleUserConnection(socket);
    });
  }

  /**
   * Handle user connection to collaboration session
   */
  private handleUserConnection(socket: Socket): void {
    // Authentication and user setup
    socket.on('authenticate', async (data: { userId: string; token: string; projectId: string }) => {
      try {
        const user = await this.authenticateUser(data.userId, data.token);
        if (!user) {
          socket.emit('auth_error', { message: 'Authentication failed' });
          return;
        }

        // Check project permissions
        const hasAccess = await this.checkProjectAccess(user.id, data.projectId);
        if (!hasAccess) {
          socket.emit('auth_error', { message: 'Access denied' });
          return;
        }

        // Join collaboration session
        await this.joinCollaborationSession(socket, user, data.projectId);

      } catch (error) {
        socket.emit('auth_error', { message: 'Authentication error' });
      }
    });

    // Collaboration events
    socket.on('cursor_move', (data) => this.handleCursorMove(socket, data));
    socket.on('selection_change', (data) => this.handleSelectionChange(socket, data));
    socket.on('component_operation', (data) => this.handleComponentOperation(socket, data));
    socket.on('drawing_operation', (data) => this.handleDrawingOperation(socket, data));
    socket.on('lock_request', (data) => this.handleLockRequest(socket, data));
    socket.on('lock_release', (data) => this.handleLockRelease(socket, data));
    socket.on('comment_add', (data) => this.handleCommentAdd(socket, data));
    socket.on('conflict_resolve', (data) => this.handleConflictResolve(socket, data));

    // Disconnect handling
    socket.on('disconnect', () => this.handleUserDisconnection(socket));
  }

  /**
   * Join collaboration session
   */
  private async joinCollaborationSession(
    socket: Socket,
    user: CollaborationUser,
    projectId: string
  ): Promise<void> {
    let session = this.sessions.get(projectId);
    
    if (!session) {
      session = {
        id: this.generateId('session'),
        projectId,
        users: new Map(),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };
      this.sessions.set(projectId, session);
    }

    // Add user to session
    session.users.set(user.id, {
      ...user,
      presence: {
        ...user.presence,
        online: true,
        lastSeen: new Date(),
        currentProject: projectId
      }
    });

    // Track socket-user mapping
    this.socketUsers.set(socket.id, user.id);
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set());
    }
    this.userSockets.get(user.id)!.add(socket.id);

    // Join socket room
    socket.join(projectId);

    // Send initial session state
    socket.emit('session_joined', {
      sessionId: session.id,
      users: Array.from(session.users.values()),
      locks: Array.from(session.locks.values()),
      recentHistory: session.history.slice(-50)
    });

    // Notify other users
    socket.to(projectId).emit('user_joined', {
      user: session.users.get(user.id),
      timestamp: new Date()
    });

    // Add to operation history
    this.addOperation(session, {
      type: 'user_joined',
      userId: user.id,
      userName: user.name,
      data: { user },
      projectId,
      sessionId: session.id
    });

    this.emit('user-joined', { user, projectId, sessionId: session.id });
  }

  /**
   * Handle cursor movement
   */
  private handleCursorMove(socket: Socket, data: { x: number; y: number; z: number }): void {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user) return;

    // Update user cursor position
    user.presence.cursor = data;
    user.presence.lastSeen = new Date();

    // Broadcast to other users
    socket.to(session.projectId).emit('cursor_moved', {
      userId,
      cursor: data,
      timestamp: new Date()
    });
  }

  /**
   * Handle selection change
   */
  private handleSelectionChange(socket: Socket, data: { selection: string[] }): void {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user) return;

    // Update user selection
    user.presence.selection = data.selection;
    user.presence.lastSeen = new Date();

    // Broadcast to other users
    socket.to(session.projectId).emit('selection_changed', {
      userId,
      selection: data.selection,
      timestamp: new Date()
    });
  }

  /**
   * Handle component operations (add, modify, delete)
   */
  private async handleComponentOperation(
    socket: Socket,
    data: { 
      operation: 'add' | 'modify' | 'delete';
      component: Component;
      modelId: string;
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user || !user.permissions.canEdit) {
      socket.emit('operation_error', { message: 'Insufficient permissions' });
      return;
    }

    try {
      // Check for locks
      const lockKey = `${data.modelId}:${data.component.id}`;
      const existingLock = session.locks.get(lockKey);
      
      if (existingLock && existingLock.userId !== userId) {
        socket.emit('operation_error', { 
          message: 'Entity is locked by another user',
          lockedBy: existingLock.userName
        });
        return;
      }

      // Check for conflicts
      const conflict = await this.checkForConflicts(session, data.operation, data.component);
      if (conflict) {
        await this.handleConflict(session, conflict);
        return;
      }

      // Process operation
      const operation: CollaborationOperation = {
        id: this.generateId('op'),
        type: data.operation === 'add' ? 'component_added' : 
              data.operation === 'modify' ? 'component_modified' : 'component_deleted',
        userId,
        userName: user.name,
        timestamp: new Date(),
        data: { component: data.component, modelId: data.modelId },
        entityType: 'component',
        entityId: data.component.id,
        projectId: session.projectId,
        sessionId: session.id,
        acknowledged: false
      };

      // Add to operation queue
      await this.queueOperation(session, operation);

      // Broadcast to other users
      socket.to(session.projectId).emit('component_operation', {
        operation: data.operation,
        component: data.component,
        modelId: data.modelId,
        userId,
        userName: user.name,
        timestamp: new Date()
      });

      // Acknowledge to sender
      socket.emit('operation_acknowledged', { operationId: operation.id });

    } catch (error) {
      socket.emit('operation_error', { message: 'Operation failed' });
    }
  }

  /**
   * Handle drawing operations
   */
  private async handleDrawingOperation(
    socket: Socket,
    data: {
      operation: 'modify';
      drawing: TechnicalDrawing;
      changes: any;
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user || !user.permissions.canEdit) {
      socket.emit('operation_error', { message: 'Insufficient permissions' });
      return;
    }

    try {
      // Check for locks
      const lockKey = `drawing:${data.drawing.id}`;
      const existingLock = session.locks.get(lockKey);
      
      if (existingLock && existingLock.userId !== userId) {
        socket.emit('operation_error', { 
          message: 'Drawing is locked by another user',
          lockedBy: existingLock.userName
        });
        return;
      }

      // Process operation
      const operation: CollaborationOperation = {
        id: this.generateId('op'),
        type: 'drawing_modified',
        userId,
        userName: user.name,
        timestamp: new Date(),
        data: { drawing: data.drawing, changes: data.changes },
        entityType: 'drawing',
        entityId: data.drawing.id,
        projectId: session.projectId,
        sessionId: session.id,
        acknowledged: false
      };

      // Add to operation queue
      await this.queueOperation(session, operation);

      // Broadcast to other users
      socket.to(session.projectId).emit('drawing_operation', {
        operation: data.operation,
        drawing: data.drawing,
        changes: data.changes,
        userId,
        userName: user.name,
        timestamp: new Date()
      });

      // Acknowledge to sender
      socket.emit('operation_acknowledged', { operationId: operation.id });

    } catch (error) {
      socket.emit('operation_error', { message: 'Operation failed' });
    }
  }

  /**
   * Handle lock requests
   */
  private async handleLockRequest(
    socket: Socket,
    data: {
      entityType: 'model' | 'component' | 'drawing' | 'analysis' | 'bom';
      entityId: string;
      lockType: 'exclusive' | 'shared' | 'intent';
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user) return;

    const lockKey = `${data.entityType}:${data.entityId}`;
    const existingLock = session.locks.get(lockKey);

    // Check if lock can be acquired
    if (existingLock) {
      if (existingLock.userId === userId) {
        // User already has lock
        socket.emit('lock_acquired', { entityType: data.entityType, entityId: data.entityId });
        return;
      }

      if (existingLock.lockType === 'exclusive' || data.lockType === 'exclusive') {
        socket.emit('lock_denied', { 
          message: 'Entity is exclusively locked',
          lockedBy: existingLock.userName
        });
        return;
      }
    }

    // Acquire lock
    const lock: EntityLock = {
      id: this.generateId('lock'),
      entityType: data.entityType,
      entityId: data.entityId,
      userId,
      userName: user.name,
      lockType: data.lockType,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.lockTimeout),
      autoRelease: true
    };

    session.locks.set(lockKey, lock);

    // Notify user
    socket.emit('lock_acquired', { 
      entityType: data.entityType, 
      entityId: data.entityId,
      lockType: data.lockType
    });

    // Notify other users
    socket.to(session.projectId).emit('lock_acquired', {
      lock,
      userId,
      userName: user.name,
      timestamp: new Date()
    });

    // Add to operation history
    this.addOperation(session, {
      type: 'lock_acquired',
      userId,
      userName: user.name,
      data: { lock },
      projectId: session.projectId,
      sessionId: session.id
    });

    // Set auto-release timer
    setTimeout(() => {
      if (session.locks.get(lockKey)?.id === lock.id) {
        this.releaseLock(session, lockKey, userId);
      }
    }, this.config.lockTimeout);
  }

  /**
   * Handle lock release
   */
  private async handleLockRelease(
    socket: Socket,
    data: {
      entityType: 'model' | 'component' | 'drawing' | 'analysis' | 'bom';
      entityId: string;
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const lockKey = `${data.entityType}:${data.entityId}`;
    await this.releaseLock(session, lockKey, userId);
  }

  /**
   * Release lock
   */
  private async releaseLock(session: CollaborationSession, lockKey: string, userId: string): Promise<void> {
    const lock = session.locks.get(lockKey);
    if (!lock || lock.userId !== userId) return;

    session.locks.delete(lockKey);

    // Notify all users
    this.io.to(session.projectId).emit('lock_released', {
      entityType: lock.entityType,
      entityId: lock.entityId,
      userId,
      timestamp: new Date()
    });

    // Add to operation history
    this.addOperation(session, {
      type: 'lock_released',
      userId,
      userName: lock.userName,
      data: { lock },
      projectId: session.projectId,
      sessionId: session.id
    });
  }

  /**
   * Handle comment addition
   */
  private async handleCommentAdd(
    socket: Socket,
    data: {
      entityType: string;
      entityId: string;
      comment: string;
      position?: { x: number; y: number; z: number };
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const user = session.users.get(userId);
    if (!user) return;

    const comment = {
      id: this.generateId('comment'),
      userId,
      userName: user.name,
      text: data.comment,
      entityType: data.entityType,
      entityId: data.entityId,
      position: data.position,
      timestamp: new Date()
    };

    // Save comment to database
    await this.saveComment(session.projectId, comment);

    // Broadcast to all users
    this.io.to(session.projectId).emit('comment_added', comment);

    // Add to operation history
    this.addOperation(session, {
      type: 'comment_added',
      userId,
      userName: user.name,
      data: { comment },
      projectId: session.projectId,
      sessionId: session.id
    });
  }

  /**
   * Handle conflict resolution
   */
  private async handleConflictResolve(
    socket: Socket,
    data: {
      conflictId: string;
      resolution: 'accept_mine' | 'accept_theirs' | 'merge' | 'custom';
      finalState?: any;
    }
  ): Promise<void> {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    const conflict = session.conflicts.get(data.conflictId);
    if (!conflict) return;

    const user = session.users.get(userId);
    if (!user) return;

    // Resolve conflict
    await this.conflictResolver.resolveConflict(conflict, data.resolution, data.finalState, userId);

    // Remove from conflicts
    session.conflicts.delete(data.conflictId);

    // Notify all users
    this.io.to(session.projectId).emit('conflict_resolved', {
      conflictId: data.conflictId,
      resolution: data.resolution,
      resolvedBy: user.name,
      timestamp: new Date()
    });
  }

  /**
   * Handle user disconnection
   */
  private handleUserDisconnection(socket: Socket): void {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const session = this.findSessionByUserId(userId);
    if (!session) return;

    // Remove socket from user's socket set
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // If no more sockets, user is offline
      if (userSockets.size === 0) {
        const user = session.users.get(userId);
        if (user) {
          user.presence.online = false;
          user.presence.lastSeen = new Date();
          
          // Release all locks held by user
          for (const [lockKey, lock] of session.locks.entries()) {
            if (lock.userId === userId) {
              this.releaseLock(session, lockKey, userId);
            }
          }
          
          // Notify other users
          socket.to(session.projectId).emit('user_left', {
            userId,
            userName: user.name,
            timestamp: new Date()
          });
          
          // Add to operation history
          this.addOperation(session, {
            type: 'user_left',
            userId,
            userName: user.name,
            data: { user },
            projectId: session.projectId,
            sessionId: session.id
          });
        }
      }
    }

    // Clean up mappings
    this.socketUsers.delete(socket.id);
  }

  /**
   * Queue operation for processing
   */
  private async queueOperation(session: CollaborationSession, operation: CollaborationOperation): Promise<void> {
    const projectId = session.projectId;
    
    if (!this.operationQueue.has(projectId)) {
      this.operationQueue.set(projectId, []);
    }
    
    this.operationQueue.get(projectId)!.push(operation);
    
    // Process queue asynchronously
    setImmediate(() => this.processOperationQueue(projectId));
  }

  /**
   * Process operation queue
   */
  private async processOperationQueue(projectId: string): Promise<void> {
    const operations = this.operationQueue.get(projectId);
    if (!operations || operations.length === 0) return;

    const session = this.sessions.get(projectId);
    if (!session) return;

    // Process operations in order
    for (const operation of operations) {
      try {
        await this.applyOperation(session, operation);
        operation.acknowledged = true;
      } catch (error) {
        // Handle operation error
        this.emit('operation-error', { operation, error });
      }
    }

    // Clear processed operations
    this.operationQueue.set(projectId, []);
  }

  /**
   * Apply operation to project
   */
  private async applyOperation(session: CollaborationSession, operation: CollaborationOperation): Promise<void> {
    switch (operation.type) {
      case 'component_added':
      case 'component_modified':
      case 'component_deleted':
        await this.applyComponentOperation(session, operation);
        break;
      case 'drawing_modified':
        await this.applyDrawingOperation(session, operation);
        break;
      default:
        // Other operations don't need database persistence
        break;
    }

    // Add to session history
    this.addOperation(session, operation);
  }

  /**
   * Apply component operation to database
   */
  private async applyComponentOperation(session: CollaborationSession, operation: CollaborationOperation): Promise<void> {
    const { component, modelId } = operation.data;
    
    // Load current project
    const project = await this.database.loadProject(session.projectId);
    const model = project.models.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Apply operation based on type
    switch (operation.type) {
      case 'component_added':
        model.structure.frame.push(component);
        break;
      case 'component_modified':
        const existingIndex = model.structure.frame.findIndex(c => c.id === component.id);
        if (existingIndex !== -1) {
          model.structure.frame[existingIndex] = component;
        }
        break;
      case 'component_deleted':
        const deleteIndex = model.structure.frame.findIndex(c => c.id === component.id);
        if (deleteIndex !== -1) {
          model.structure.frame.splice(deleteIndex, 1);
        }
        break;
    }

    // Save to database
    await this.database.saveProject(project);
  }

  /**
   * Apply drawing operation to database
   */
  private async applyDrawingOperation(session: CollaborationSession, operation: CollaborationOperation): Promise<void> {
    const { drawing, changes } = operation.data;
    
    // Load current project
    const project = await this.database.loadProject(session.projectId);
    const existingDrawing = project.drawings.find(d => d.id === drawing.id);
    
    if (existingDrawing) {
      // Apply changes
      Object.assign(existingDrawing, changes);
      
      // Save to database
      await this.database.saveProject(project);
    }
  }

  /**
   * Check for conflicts
   */
  private async checkForConflicts(
    session: CollaborationSession,
    operation: string,
    component: Component
  ): Promise<Conflict | null> {
    // Check for concurrent modifications
    const recentOperations = session.history
      .filter(op => op.entityId === component.id && op.timestamp > new Date(Date.now() - 5000))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (recentOperations.length > 1) {
      return {
        id: this.generateId('conflict'),
        type: 'concurrent_edit',
        entityType: 'component',
        entityId: component.id,
        users: recentOperations.map(op => op.userId),
        operations: recentOperations,
        severity: 'medium',
        description: `Concurrent modification detected on component ${component.name}`,
        createdAt: new Date()
      };
    }

    return null;
  }

  /**
   * Handle conflict
   */
  private async handleConflict(session: CollaborationSession, conflict: Conflict): Promise<void> {
    session.conflicts.set(conflict.id, conflict);
    
    // Notify all involved users
    for (const userId of conflict.users) {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        for (const socketId of userSockets) {
          this.io.to(socketId).emit('conflict_detected', conflict);
        }
      }
    }

    // Start auto-resolution timer
    setTimeout(() => {
      if (session.conflicts.has(conflict.id)) {
        this.conflictResolver.autoResolveConflict(conflict);
      }
    }, this.config.conflictResolutionTimeout);
  }

  /**
   * Start heartbeat for maintaining user presence
   */
  private startHeartbeat(): void {
    setInterval(() => {
      for (const session of this.sessions.values()) {
        for (const user of session.users.values()) {
          if (user.presence.online) {
            const timeSinceLastSeen = Date.now() - user.presence.lastSeen.getTime();
            if (timeSinceLastSeen > this.config.heartbeatInterval * 2) {
              // Mark user as offline
              user.presence.online = false;
              
              // Notify other users
              this.io.to(session.projectId).emit('user_status_changed', {
                userId: user.id,
                status: 'offline',
                timestamp: new Date()
              });
            }
          }
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start auto-save process
   */
  private startAutoSave(): void {
    setInterval(async () => {
      for (const session of this.sessions.values()) {
        if (session.history.length > 0) {
          try {
            await this.saveSessionState(session);
          } catch (error) {
            this.emit('autosave-error', { sessionId: session.id, error });
          }
        }
      }
    }, this.config.autoSaveInterval);
  }

  // Helper methods
  private findSessionByUserId(userId: string): CollaborationSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.users.has(userId)) {
        return session;
      }
    }
    return undefined;
  }

  private addOperation(session: CollaborationSession, operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'acknowledged'>): void {
    const fullOperation: CollaborationOperation = {
      id: this.generateId('op'),
      timestamp: new Date(),
      acknowledged: true,
      ...operation
    };

    session.history.push(fullOperation);
    session.lastActivity = new Date();

    // Limit history size
    if (session.history.length > this.config.operationHistoryLimit) {
      session.history.splice(0, session.history.length - this.config.operationHistoryLimit);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder methods for complete implementation
  private async authenticateUser(userId: string, token: string): Promise<CollaborationUser | null> {
    // Implement JWT token validation
    return null;
  }

  private async checkProjectAccess(userId: string, projectId: string): Promise<boolean> {
    // Check database for project access
    return true;
  }

  private async saveComment(projectId: string, comment: any): Promise<void> {
    // Save comment to database
  }

  private async saveSessionState(session: CollaborationSession): Promise<void> {
    // Save session state to database
  }
}

/**
 * Conflict Resolution System
 */
class ConflictResolver {
  private collaboration: RealTimeCollaboration;

  constructor(collaboration: RealTimeCollaboration) {
    this.collaboration = collaboration;
  }

  async resolveConflict(
    conflict: Conflict,
    resolution: string,
    finalState: any,
    userId: string
  ): Promise<void> {
    conflict.resolution = {
      type: resolution === 'auto' ? 'auto' : 'manual',
      resolvedBy: userId,
      resolvedAt: new Date(),
      finalState
    };

    conflict.resolvedAt = new Date();

    // Apply resolution based on type
    switch (resolution) {
      case 'accept_mine':
        await this.applyUserVersion(conflict, userId);
        break;
      case 'accept_theirs':
        await this.applyOtherVersion(conflict, userId);
        break;
      case 'merge':
        await this.applyMergedVersion(conflict, finalState);
        break;
      case 'custom':
        await this.applyCustomVersion(conflict, finalState);
        break;
    }
  }

  async autoResolveConflict(conflict: Conflict): Promise<void> {
    // Implement automatic conflict resolution based on conflict type
    switch (conflict.type) {
      case 'concurrent_edit':
        await this.resolveConflict(conflict, 'merge', null, 'system');
        break;
      case 'lock_violation':
        await this.resolveConflict(conflict, 'accept_theirs', null, 'system');
        break;
      default:
        await this.resolveConflict(conflict, 'accept_mine', null, 'system');
    }
  }

  private async applyUserVersion(conflict: Conflict, userId: string): Promise<void> {
    // Apply the user's version of the entity
  }

  private async applyOtherVersion(conflict: Conflict, userId: string): Promise<void> {
    // Apply the other user's version of the entity
  }

  private async applyMergedVersion(conflict: Conflict, finalState: any): Promise<void> {
    // Apply a merged version of the entity
  }

  private async applyCustomVersion(conflict: Conflict, finalState: any): Promise<void> {
    // Apply a custom version provided by the user
  }
}

export {
  RealTimeCollaboration,
  ConflictResolver,
  CollaborationUser,
  CollaborationSession,
  EntityLock,
  CollaborationOperation,
  Conflict,
  CollaborationConfig,
  CollaborationEvent,
  UserRole
};

export default RealTimeCollaboration;