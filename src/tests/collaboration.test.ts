/**
 * Real-Time Collaboration System Tests
 * Tests for multi-user collaboration features
 */

import { jest } from '@jest/globals';
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { RealTimeCollaboration, CollaborationUser, CollaborationConfig } from '../lib/collaboration/real-time-collaboration';
import { CADDatabaseLayer } from '../lib/database/cad-database-layer';
import { GreenhouseModel } from '../lib/cad/greenhouse-cad-system';

// Mock external dependencies
jest.mock('socket.io');
jest.mock('@socket.io/redis-adapter');
jest.mock('redis');
jest.mock('@prisma/client');

describe('Real-Time Collaboration Tests', () => {
  let collaboration: RealTimeCollaboration;
  let mockIO: SocketIOServer;
  let mockDatabase: CADDatabaseLayer;
  let mockConfig: CollaborationConfig;
  let mockSocket: any;

  const mockUser1: CollaborationUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'avatar1.jpg',
    role: 'editor',
    permissions: {
      canEdit: true,
      canDelete: true,
      canExport: true,
      canInvite: false,
      canManagePermissions: false
    },
    presence: {
      online: true,
      lastSeen: new Date(),
      currentProject: 'project1',
      currentModel: 'model1',
      cursor: { x: 0, y: 0, z: 0 },
      selection: [],
      activeView: 'model'
    },
    preferences: {
      notifications: true,
      autoSave: true,
      theme: 'light',
      cursorsVisible: true,
      selectionsVisible: true
    }
  };

  const mockUser2: CollaborationUser = {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'avatar2.jpg',
    role: 'viewer',
    permissions: {
      canEdit: false,
      canDelete: false,
      canExport: true,
      canInvite: false,
      canManagePermissions: false
    },
    presence: {
      online: true,
      lastSeen: new Date(),
      currentProject: 'project1',
      currentModel: 'model1',
      cursor: { x: 10, y: 10, z: 0 },
      selection: [],
      activeView: 'model'
    },
    preferences: {
      notifications: true,
      autoSave: true,
      theme: 'dark',
      cursorsVisible: true,
      selectionsVisible: true
    }
  };

  beforeEach(() => {
    // Mock configuration
    mockConfig = {
      maxUsersPerProject: 10,
      lockTimeout: 300000,
      conflictResolutionTimeout: 60000,
      heartbeatInterval: 30000,
      operationHistoryLimit: 1000,
      autoSaveInterval: 60000,
      redis: {
        host: 'localhost',
        port: 6379,
        db: 0
      },
      permissions: {
        defaultRole: 'viewer',
        roleHierarchy: {
          admin: ['admin', 'editor', 'viewer'],
          editor: ['editor', 'viewer'],
          viewer: ['viewer'],
          guest: ['guest'],
          owner: ['owner', 'admin', 'editor', 'viewer', 'guest']
        },
        actionPermissions: {
          'model:create': ['owner', 'admin', 'editor'],
          'model:edit': ['owner', 'admin', 'editor'],
          'model:delete': ['owner', 'admin'],
          'drawing:create': ['owner', 'admin', 'editor'],
          'drawing:edit': ['owner', 'admin', 'editor'],
          'project:export': ['owner', 'admin', 'editor', 'viewer']
        }
      }
    };

    // Mock database
    const mockDbConfig = {
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'vibelux_test',
        username: 'test',
        password: 'test',
        ssl: false,
        poolSize: 10,
        connectionTimeout: 30000
      },
      caching: { enabled: false, ttl: 0, maxSize: 0 },
      backup: { enabled: false, schedule: '', retention: 0, storageType: 'local' as const, storageConfig: {} },
      versioning: { enabled: false, maxVersions: 0, compressionLevel: 0 }
    };
    
    mockDatabase = new CADDatabaseLayer(mockDbConfig);

    // Mock Socket.IO
    const httpServer = createServer();
    mockIO = new SocketIOServer(httpServer);
    
    // Mock socket
    mockSocket = {
      id: 'socket1',
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn()
    };

    // Initialize collaboration system
    collaboration = new RealTimeCollaboration(mockIO, mockDatabase, mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Connection Management', () => {
    test('should handle user authentication', async () => {
      const authData = {
        userId: 'user1',
        token: 'valid-token',
        projectId: 'project1'
      };

      // Mock authentication success
      (collaboration as any).authenticateUser = jest.fn().mockResolvedValue(mockUser1);
      (collaboration as any).checkProjectAccess = jest.fn().mockResolvedValue(true);

      const joinSpy = jest.spyOn(collaboration as any, 'joinCollaborationSession');
      joinSpy.mockResolvedValue(undefined);

      await (collaboration as any).handleUserConnection(mockSocket);
      
      // Simulate authentication event
      const authHandler = mockSocket.on.mock.calls.find(call => call[0] === 'authenticate')[1];
      await authHandler(authData);

      expect((collaboration as any).authenticateUser).toHaveBeenCalledWith('user1', 'valid-token');
      expect((collaboration as any).checkProjectAccess).toHaveBeenCalledWith('user1', 'project1');
      expect(joinSpy).toHaveBeenCalledWith(mockSocket, mockUser1, 'project1');
    });

    test('should reject invalid authentication', async () => {
      const authData = {
        userId: 'user1',
        token: 'invalid-token',
        projectId: 'project1'
      };

      (collaboration as any).authenticateUser = jest.fn().mockResolvedValue(null);

      await (collaboration as any).handleUserConnection(mockSocket);
      
      const authHandler = mockSocket.on.mock.calls.find(call => call[0] === 'authenticate')[1];
      await authHandler(authData);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', { message: 'Authentication failed' });
    });

    test('should handle user disconnection', async () => {
      // Setup user connection first
      (collaboration as any).socketUsers.set('socket1', 'user1');
      (collaboration as any).userSockets.set('user1', new Set(['socket1']));

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);

      await (collaboration as any).handleUserDisconnection(mockSocket);

      expect(mockUser1.presence.online).toBe(false);
      expect((collaboration as any).socketUsers.has('socket1')).toBe(false);
    });
  });

  describe('Component Operations', () => {
    test('should handle component addition', async () => {
      const mockComponent = {
        id: 'comp1',
        name: 'Test Component',
        type: 'frame_post',
        category: 'structure',
        geometry: { position: { x: 0, y: 0, z: 0 } },
        materialId: 'steel1',
        material: { name: 'Steel' },
        properties: {},
        connections: [],
        assembly: {},
        layer: 'structure',
        subLayer: 'frame',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const operationData = {
        operation: 'add' as const,
        component: mockComponent,
        modelId: 'model1'
      };

      // Setup session and user
      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleComponentOperation(mockSocket, operationData);

      expect(mockSocket.to).toHaveBeenCalledWith('project1');
      expect(mockSocket.emit).toHaveBeenCalledWith('operation_acknowledged', 
        expect.objectContaining({ operationId: expect.any(String) })
      );
    });

    test('should handle component modification conflicts', async () => {
      const mockComponent = {
        id: 'comp1',
        name: 'Test Component',
        type: 'frame_post',
        category: 'structure',
        geometry: { position: { x: 0, y: 0, z: 0 } },
        materialId: 'steel1',
        material: { name: 'Steel' },
        properties: {},
        connections: [],
        assembly: {},
        layer: 'structure',
        subLayer: 'frame',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const operationData = {
        operation: 'modify' as const,
        component: mockComponent,
        modelId: 'model1'
      };

      // Setup session with recent conflicting operation
      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1], ['user2', mockUser2]]),
        locks: new Map(),
        history: [
          {
            id: 'op1',
            type: 'component_modified' as const,
            userId: 'user2',
            userName: 'Jane Smith',
            timestamp: new Date(Date.now() - 3000), // 3 seconds ago
            data: { component: mockComponent },
            entityType: 'component',
            entityId: 'comp1',
            projectId: 'project1',
            sessionId: 'session1',
            acknowledged: true
          }
        ],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      // Mock conflict detection
      (collaboration as any).checkForConflicts = jest.fn().mockResolvedValue({
        id: 'conflict1',
        type: 'concurrent_edit',
        entityType: 'component',
        entityId: 'comp1',
        users: ['user1', 'user2'],
        operations: mockSession.history,
        severity: 'medium',
        description: 'Concurrent modification detected',
        createdAt: new Date()
      });

      await (collaboration as any).handleComponentOperation(mockSocket, operationData);

      expect((collaboration as any).checkForConflicts).toHaveBeenCalled();
    });

    test('should respect component locks', async () => {
      const mockComponent = {
        id: 'comp1',
        name: 'Test Component',
        type: 'frame_post',
        category: 'structure',
        geometry: { position: { x: 0, y: 0, z: 0 } },
        materialId: 'steel1',
        material: { name: 'Steel' },
        properties: {},
        connections: [],
        assembly: {},
        layer: 'structure',
        subLayer: 'frame',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const operationData = {
        operation: 'modify' as const,
        component: mockComponent,
        modelId: 'model1'
      };

      // Setup session with locked component
      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map([
          ['model1:comp1', {
            id: 'lock1',
            entityType: 'component' as const,
            entityId: 'comp1',
            userId: 'user2',
            userName: 'Jane Smith',
            lockType: 'exclusive' as const,
            acquiredAt: new Date(),
            expiresAt: new Date(Date.now() + 300000),
            autoRelease: true
          }]
        ]),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleComponentOperation(mockSocket, operationData);

      expect(mockSocket.emit).toHaveBeenCalledWith('operation_error', {
        message: 'Entity is locked by another user',
        lockedBy: 'Jane Smith'
      });
    });
  });

  describe('Lock Management', () => {
    test('should acquire exclusive lock', async () => {
      const lockData = {
        entityType: 'component' as const,
        entityId: 'comp1',
        lockType: 'exclusive' as const
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleLockRequest(mockSocket, lockData);

      expect(mockSession.locks.has('component:comp1')).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('lock_acquired', {
        entityType: 'component',
        entityId: 'comp1',
        lockType: 'exclusive'
      });
    });

    test('should deny conflicting exclusive lock', async () => {
      const lockData = {
        entityType: 'component' as const,
        entityId: 'comp1',
        lockType: 'exclusive' as const
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map([
          ['component:comp1', {
            id: 'lock1',
            entityType: 'component' as const,
            entityId: 'comp1',
            userId: 'user2',
            userName: 'Jane Smith',
            lockType: 'exclusive' as const,
            acquiredAt: new Date(),
            expiresAt: new Date(Date.now() + 300000),
            autoRelease: true
          }]
        ]),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleLockRequest(mockSocket, lockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('lock_denied', {
        message: 'Entity is exclusively locked',
        lockedBy: 'Jane Smith'
      });
    });

    test('should release lock', async () => {
      const releaseData = {
        entityType: 'component' as const,
        entityId: 'comp1'
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map([
          ['component:comp1', {
            id: 'lock1',
            entityType: 'component' as const,
            entityId: 'comp1',
            userId: 'user1',
            userName: 'John Doe',
            lockType: 'exclusive' as const,
            acquiredAt: new Date(),
            expiresAt: new Date(Date.now() + 300000),
            autoRelease: true
          }]
        ]),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleLockRelease(mockSocket, releaseData);

      expect(mockSession.locks.has('component:comp1')).toBe(false);
    });
  });

  describe('Cursor and Selection Tracking', () => {
    test('should track cursor movement', async () => {
      const cursorData = { x: 10, y: 20, z: 0 };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleCursorMove(mockSocket, cursorData);

      expect(mockUser1.presence.cursor).toEqual(cursorData);
      expect(mockSocket.to).toHaveBeenCalledWith('project1');
    });

    test('should track selection changes', async () => {
      const selectionData = { selection: ['comp1', 'comp2'] };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      await (collaboration as any).handleSelectionChange(mockSocket, selectionData);

      expect(mockUser1.presence.selection).toEqual(['comp1', 'comp2']);
      expect(mockSocket.to).toHaveBeenCalledWith('project1');
    });
  });

  describe('Comments and Annotations', () => {
    test('should handle comment addition', async () => {
      const commentData = {
        entityType: 'component',
        entityId: 'comp1',
        comment: 'This needs to be reviewed',
        position: { x: 10, y: 20, z: 0 }
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');
      (collaboration as any).saveComment = jest.fn().mockResolvedValue(undefined);

      await (collaboration as any).handleCommentAdd(mockSocket, commentData);

      expect((collaboration as any).saveComment).toHaveBeenCalled();
      expect(mockIO.to).toHaveBeenCalledWith('project1');
    });
  });

  describe('Conflict Resolution', () => {
    test('should resolve conflicts manually', async () => {
      const conflictData = {
        conflictId: 'conflict1',
        resolution: 'accept_mine' as const,
        finalState: { resolved: true }
      };

      const mockConflict = {
        id: 'conflict1',
        type: 'concurrent_edit' as const,
        entityType: 'component',
        entityId: 'comp1',
        users: ['user1', 'user2'],
        operations: [],
        severity: 'medium' as const,
        description: 'Concurrent modification detected',
        createdAt: new Date()
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user1', mockUser1]]),
        locks: new Map(),
        history: [],
        conflicts: new Map([['conflict1', mockConflict]]),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user1');

      const mockConflictResolver = {
        resolveConflict: jest.fn().mockResolvedValue(undefined)
      };
      (collaboration as any).conflictResolver = mockConflictResolver;

      await (collaboration as any).handleConflictResolve(mockSocket, conflictData);

      expect(mockConflictResolver.resolveConflict).toHaveBeenCalledWith(
        mockConflict,
        'accept_mine',
        { resolved: true },
        'user1'
      );
      expect(mockSession.conflicts.has('conflict1')).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should create new session for project', async () => {
      const projectId = 'project1';
      
      await (collaboration as any).joinCollaborationSession(mockSocket, mockUser1, projectId);

      expect((collaboration as any).sessions.has(projectId)).toBe(true);
      
      const session = (collaboration as any).sessions.get(projectId);
      expect(session.users.has('user1')).toBe(true);
      expect(session.projectId).toBe(projectId);
    });

    test('should join existing session', async () => {
      const projectId = 'project1';
      
      // Create initial session
      await (collaboration as any).joinCollaborationSession(mockSocket, mockUser1, projectId);
      
      // Second user joins
      const mockSocket2 = { ...mockSocket, id: 'socket2' };
      await (collaboration as any).joinCollaborationSession(mockSocket2, mockUser2, projectId);

      const session = (collaboration as any).sessions.get(projectId);
      expect(session.users.size).toBe(2);
      expect(session.users.has('user1')).toBe(true);
      expect(session.users.has('user2')).toBe(true);
    });
  });

  describe('Permission Checks', () => {
    test('should enforce edit permissions', async () => {
      const mockComponent = {
        id: 'comp1',
        name: 'Test Component',
        type: 'frame_post',
        category: 'structure',
        geometry: { position: { x: 0, y: 0, z: 0 } },
        materialId: 'steel1',
        material: { name: 'Steel' },
        properties: {},
        connections: [],
        assembly: {},
        layer: 'structure',
        subLayer: 'frame',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const operationData = {
        operation: 'modify' as const,
        component: mockComponent,
        modelId: 'model1'
      };

      // Create user with viewer permissions (cannot edit)
      const viewerUser = {
        ...mockUser2,
        permissions: {
          canEdit: false,
          canDelete: false,
          canExport: true,
          canInvite: false,
          canManagePermissions: false
        }
      };

      const mockSession = {
        id: 'session1',
        projectId: 'project1',
        users: new Map([['user2', viewerUser]]),
        locks: new Map(),
        history: [],
        conflicts: new Map(),
        createdAt: new Date(),
        lastActivity: new Date()
      };

      (collaboration as any).sessions.set('project1', mockSession);
      (collaboration as any).socketUsers.set('socket1', 'user2');

      await (collaboration as any).handleComponentOperation(mockSocket, operationData);

      expect(mockSocket.emit).toHaveBeenCalledWith('operation_error', {
        message: 'Insufficient permissions'
      });
    });
  });
});