/**
 * Database Layer Tests
 * Tests for CAD database persistence and operations
 */

import { jest } from '@jest/globals';
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { CADDatabaseLayer, DatabaseConfig } from '../lib/database/cad-database-layer';
import { CADProject } from '../lib/cad/cad-integration-layer';
import { GreenhouseModel } from '../lib/cad/greenhouse-cad-system';
import { StructuralAnalysis } from '../lib/cad/structural-analysis';
import { BillOfMaterials } from '../lib/cad/bom-generator';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('CAD Database Layer Tests', () => {
  let database: CADDatabaseLayer;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockConfig: DatabaseConfig;

  const mockProject: CADProject = {
    id: 'project1',
    name: 'Test Project',
    description: 'Test greenhouse project',
    models: [],
    drawings: [],
    analyses: [],
    boms: [],
    metadata: {
      version: '1.0.0',
      author: 'Test User',
      company: 'VibeLux',
      created: new Date(),
      modified: new Date(),
      units: 'ft',
      precision: 3
    },
    settings: {
      defaultExportFormat: 'dxf',
      layerConfiguration: {},
      materialLibrary: [],
      templateSettings: {}
    }
  };

  const mockModel: GreenhouseModel = {
    id: 'model1',
    name: 'Test Greenhouse',
    parameters: {
      name: 'Test Greenhouse',
      dimensions: { length: 100, width: 50, height: 15 },
      structure: {
        type: 'gable',
        frameType: 'galvanized_steel',
        baySpacing: 10,
        postSpacing: 8,
        roofPitch: 30,
        foundationType: 'concrete_stem'
      },
      glazing: {
        roofType: 'polycarbonate',
        wallType: 'tempered_glass',
        thickness: 8,
        uValue: 0.7,
        lightTransmission: 0.85
      },
      systems: {
        ventilation: {
          type: 'ridge_furrow',
          capacity: 5000,
          automation: true,
          sensors: ['temperature', 'humidity']
        },
        heating: {
          type: 'radiant_floor',
          capacity: 500000,
          zones: 4,
          controls: 'zone_based'
        },
        cooling: {
          type: 'evaporative',
          capacity: 250000,
          automation: true,
          sensors: ['temperature', 'humidity']
        }
      },
      automation: {
        level: 'full',
        sensors: ['soil_moisture', 'ph'],
        controls: ['irrigation', 'climate'],
        connectivity: 'ethernet'
      }
    },
    structure: {
      foundation: [],
      frame: [],
      glazing: [],
      doors: [],
      hardware: []
    },
    systems: {
      ventilation: [],
      electrical: [],
      plumbing: [],
      hvac: [],
      automation: []
    },
    geometry: {
      vertices: [],
      faces: [],
      normals: [],
      boundingBox: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 100, y: 50, z: 15 }
      }
    },
    layers: {
      structure: { visible: true, color: '#888888', opacity: 1 },
      glazing: { visible: true, color: '#87CEEB', opacity: 0.7 },
      systems: { visible: true, color: '#FFD700', opacity: 1 }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockConfig = {
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'vibelux_test',
        username: 'test_user',
        password: 'test_pass',
        ssl: false,
        poolSize: 10,
        connectionTimeout: 30000
      },
      caching: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
        redisUrl: 'redis://localhost:6379'
      },
      backup: {
        enabled: true,
        schedule: '0 2 * * *',
        retention: 30,
        storageType: 'local',
        storageConfig: {
          path: '/backups'
        }
      },
      versioning: {
        enabled: true,
        maxVersions: 50,
        compressionLevel: 6
      }
    };

    // Mock Prisma methods
    mockPrisma = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
      project: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      model: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      component: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      drawing: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      analysis: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      bom: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
      },
      projectVersion: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn()
      },
      projectBranch: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn()
      },
      backup: {
        create: jest.fn(),
        findMany: jest.fn()
      }
    } as any;

    // Mock PrismaClient constructor
    (PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

    database = new CADDatabaseLayer(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Connection', () => {
    test('should initialize database connection', async () => {
      expect(mockPrisma.$connect).toHaveBeenCalled();
    });

    test('should handle connection errors', async () => {
      mockPrisma.$connect.mockRejectedValue(new Error('Connection failed'));
      
      await expect(async () => {
        new CADDatabaseLayer(mockConfig);
      }).rejects.toThrow();
    });
  });

  describe('Project Operations', () => {
    test('should save project successfully', async () => {
      mockPrisma.project.upsert.mockResolvedValue({
        id: 'project1',
        name: 'Test Project',
        description: 'Test description',
        metadata: {},
        settings: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      const projectId = await database.saveProject(mockProject);

      expect(projectId).toBe('project1');
      expect(mockPrisma.project.upsert).toHaveBeenCalledWith({
        where: { id: 'project1' },
        update: {
          name: 'Test Project',
          description: 'Test greenhouse project',
          metadata: mockProject.metadata,
          settings: mockProject.settings,
          modifiedAt: expect.any(Date)
        },
        create: {
          id: 'project1',
          name: 'Test Project',
          description: 'Test greenhouse project',
          metadata: mockProject.metadata,
          settings: mockProject.settings,
          createdAt: expect.any(Date),
          modifiedAt: expect.any(Date)
        }
      });
    });

    test('should load project with all related data', async () => {
      const mockDbProject = {
        id: 'project1',
        name: 'Test Project',
        description: 'Test description',
        metadata: mockProject.metadata,
        settings: mockProject.settings,
        models: [],
        drawings: [],
        analyses: [],
        boms: []
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockDbProject);

      const loadedProject = await database.loadProject('project1');

      expect(loadedProject).toBeDefined();
      expect(loadedProject.id).toBe('project1');
      expect(loadedProject.name).toBe('Test Project');
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project1' },
        include: {
          models: {
            include: {
              components: true,
              geometry: true,
              materials: true
            }
          },
          drawings: {
            include: {
              elements: true,
              dimensions: true,
              annotations: true
            }
          },
          analyses: {
            include: {
              loadConditions: true,
              members: true,
              results: true
            }
          },
          boms: {
            include: {
              lineItems: true,
              assemblies: true
            }
          }
        }
      });
    });

    test('should handle project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(database.loadProject('nonexistent')).rejects.toThrow('Project not found: nonexistent');
    });

    test('should delete project and all related data', async () => {
      mockPrisma.model.findMany.mockResolvedValue([{ id: 'model1' }, { id: 'model2' }]);
      mockPrisma.component.deleteMany.mockResolvedValue({ count: 10 });
      mockPrisma.model.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.drawing.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.analysis.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.bom.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.projectVersion.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.projectBranch.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.project.delete.mockResolvedValue({ id: 'project1' });

      await database.deleteProject('project1');

      expect(mockPrisma.component.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.model.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.drawing.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.analysis.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.bom.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.projectVersion.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.projectBranch.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 'project1' } });
    });
  });

  describe('Model Operations', () => {
    test('should save model with components', async () => {
      mockPrisma.model.upsert.mockResolvedValue({
        id: 'model1',
        projectId: 'project1',
        name: 'Test Greenhouse',
        parameters: {},
        geometry: {},
        layers: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPrisma.component.upsert.mockResolvedValue({
        id: 'comp1',
        modelId: 'model1',
        name: 'Test Component',
        type: 'frame_post',
        category: 'structure',
        geometry: {},
        materialId: 'steel1',
        material: {},
        properties: {},
        connections: [],
        assembly: {},
        layer: 'structure',
        subLayer: 'frame',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await database.saveModel(mockModel, 'project1');

      expect(mockPrisma.model.upsert).toHaveBeenCalledWith({
        where: { id: 'model1' },
        update: expect.objectContaining({
          name: 'Test Greenhouse',
          parameters: mockModel.parameters,
          geometry: expect.objectContaining({
            vertices: [],
            faces: [],
            normals: [],
            boundingBox: mockModel.geometry.boundingBox
          }),
          layers: mockModel.layers
        }),
        create: expect.objectContaining({
          id: 'model1',
          projectId: 'project1',
          name: 'Test Greenhouse'
        })
      });
    });
  });

  describe('Version Control', () => {
    test('should create project version', async () => {
      mockPrisma.projectVersion.findFirst.mockResolvedValue(null);
      mockPrisma.projectVersion.create.mockResolvedValue({
        id: 'version1',
        projectId: 'project1',
        versionNumber: 1,
        majorVersion: 1,
        minorVersion: 0,
        patchVersion: 0,
        label: 'v1.0.0',
        description: 'Initial version',
        changes: [],
        snapshot: {},
        metadata: {}
      });

      const version = await database.createProjectVersion('project1', {
        description: 'Initial version',
        changes: []
      }, 'user1');

      expect(version).toBeDefined();
      expect(version.versionNumber).toBe(1);
      expect(version.label).toBe('v1.0.1');
      expect(mockPrisma.projectVersion.create).toHaveBeenCalled();
    });

    test('should increment version number', async () => {
      mockPrisma.projectVersion.findFirst.mockResolvedValue({
        id: 'version1',
        projectId: 'project1',
        versionNumber: 5,
        majorVersion: 1,
        minorVersion: 2,
        patchVersion: 3,
        label: 'v1.2.3',
        description: 'Previous version',
        changes: [],
        snapshot: {},
        metadata: {}
      });

      mockPrisma.projectVersion.create.mockResolvedValue({
        id: 'version2',
        projectId: 'project1',
        versionNumber: 6,
        majorVersion: 1,
        minorVersion: 2,
        patchVersion: 4,
        label: 'v1.2.4',
        description: 'New version',
        changes: [],
        snapshot: {},
        metadata: {}
      });

      const version = await database.createProjectVersion('project1', {
        description: 'New version',
        changes: []
      }, 'user1');

      expect(version.versionNumber).toBe(6);
      expect(version.patchVersion).toBe(4);
    });
  });

  describe('Branch Management', () => {
    test('should create project branch', async () => {
      mockPrisma.projectBranch.create.mockResolvedValue({
        id: 'branch1',
        projectId: 'project1',
        name: 'feature-branch',
        description: 'Feature development branch',
        parentBranch: 'main',
        currentVersion: '',
        isDefault: false,
        isProtected: false,
        permissions: {},
        createdBy: 'user1',
        createdAt: new Date(),
        lastCommit: new Date()
      });

      const branch = await database.createProjectBranch(
        'project1',
        'feature-branch',
        'Feature development branch',
        'main',
        'user1'
      );

      expect(branch).toBeDefined();
      expect(branch.name).toBe('feature-branch');
      expect(branch.parentBranch).toBe('main');
      expect(branch.createdBy).toBe('user1');
      expect(mockPrisma.projectBranch.create).toHaveBeenCalled();
    });
  });

  describe('Query Operations', () => {
    test('should query projects with filtering', async () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project 1',
          description: 'First project',
          metadata: {},
          settings: {},
          models: [],
          drawings: [],
          analyses: [],
          boms: []
        },
        {
          id: 'project2',
          name: 'Project 2',
          description: 'Second project',
          metadata: {},
          settings: {},
          models: [],
          drawings: [],
          analyses: [],
          boms: []
        }
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const results = await database.queryProjects({
        where: { name: { contains: 'Project' } },
        orderBy: { createdAt: 'desc' },
        limit: 10
      });

      expect(results).toHaveLength(2);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'Project' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: undefined,
        select: undefined,
        include: undefined
      });
    });
  });

  describe('Caching', () => {
    test('should cache project data', async () => {
      const mockDbProject = {
        id: 'project1',
        name: 'Test Project',
        description: 'Test description',
        metadata: mockProject.metadata,
        settings: mockProject.settings,
        models: [],
        drawings: [],
        analyses: [],
        boms: []
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockDbProject);

      // First call - should hit database
      const project1 = await database.loadProject('project1');
      
      // Second call - should use cache
      const project2 = await database.loadProject('project1');

      expect(project1).toEqual(project2);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledTimes(1);
    });

    test('should bypass cache when requested', async () => {
      const mockDbProject = {
        id: 'project1',
        name: 'Test Project',
        description: 'Test description',
        metadata: mockProject.metadata,
        settings: mockProject.settings,
        models: [],
        drawings: [],
        analyses: [],
        boms: []
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockDbProject);

      // First call with cache bypass
      await database.loadProject('project1', { cache: false });
      
      // Second call with cache bypass
      await database.loadProject('project1', { cache: false });

      expect(mockPrisma.project.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('Transaction Management', () => {
    test('should handle transaction rollback on error', async () => {
      mockPrisma.project.upsert.mockRejectedValue(new Error('Database error'));

      await expect(database.saveProject(mockProject)).rejects.toThrow('Database error');
    });
  });

  describe('Backup Operations', () => {
    test('should create backup', async () => {
      mockPrisma.backup.create.mockResolvedValue({
        id: 'backup1',
        timestamp: new Date(),
        path: '/backups/backup1.sql',
        size: 1024,
        checksum: 'abc123',
        storageType: 'local',
        status: 'completed',
        metadata: {}
      });

      const backupId = await database.createBackup();

      expect(backupId).toBeDefined();
      expect(mockPrisma.backup.create).toHaveBeenCalledWith({
        data: {
          id: backupId,
          timestamp: expect.any(Date),
          path: expect.any(String),
          size: 0,
          checksum: '',
          storageType: 'local',
          status: 'completed'
        }
      });
    });
  });

  describe('Database Metrics', () => {
    test('should return database metrics', async () => {
      const metrics = await database.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.connections).toBeDefined();
      expect(metrics.queries).toBeDefined();
      expect(metrics.storage).toBeDefined();
      expect(metrics.cache).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      mockPrisma.$connect.mockRejectedValue(new Error('Connection failed'));

      await expect(async () => {
        new CADDatabaseLayer(mockConfig);
      }).rejects.toThrow();
    });

    test('should handle save errors gracefully', async () => {
      mockPrisma.project.upsert.mockRejectedValue(new Error('Save failed'));

      await expect(database.saveProject(mockProject)).rejects.toThrow('Save failed');
    });

    test('should handle load errors gracefully', async () => {
      mockPrisma.project.findUnique.mockRejectedValue(new Error('Load failed'));

      await expect(database.loadProject('project1')).rejects.toThrow('Load failed');
    });
  });
});