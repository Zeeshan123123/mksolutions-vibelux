/**
 * CAD Export Engine Tests
 * Tests for professional CAD export functionality
 */

import { jest } from '@jest/globals';
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { CADExportEngine, ExportOptions, ExportFormat } from '../lib/cad/cad-export-engine';
import { GreenhouseModel } from '../lib/cad/greenhouse-cad-system';
import { TechnicalDrawing } from '../lib/cad/drawing-generator';
import { BillOfMaterials } from '../lib/cad/bom-generator';
import { StructuralAnalysis } from '../lib/cad/structural-analysis';

// Mock external dependencies
jest.mock('fs');
jest.mock('path');

describe('CAD Export Engine Tests', () => {
  let exportEngine: CADExportEngine;
  
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
      foundation: [
        {
          id: 'found1',
          name: 'Foundation Wall',
          type: 'foundation_wall',
          category: 'foundation',
          geometry: {
            position: { x: 0, y: 0, z: 0 },
            dimensions: { length: 100, width: 1, height: 2 },
            vertices: [],
            faces: [],
            boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 100, y: 1, z: 2 } }
          },
          materialId: 'concrete',
          material: { name: 'Concrete' },
          properties: { strength: 4000 },
          connections: [],
          assembly: {},
          layer: 'foundation',
          subLayer: 'walls',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      frame: [
        {
          id: 'frame1',
          name: 'Frame Post',
          type: 'frame_post',
          category: 'structure',
          geometry: {
            position: { x: 0, y: 0, z: 0 },
            dimensions: { length: 4, width: 4, height: 15 },
            vertices: [],
            faces: [],
            boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 4, y: 4, z: 15 } }
          },
          materialId: 'galvanized_steel',
          material: { name: 'Galvanized Steel' },
          properties: { profile: '4x4x0.125' },
          connections: [],
          assembly: {},
          layer: 'structure',
          subLayer: 'frame',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
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
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 0, z: 0 },
        { x: 100, y: 50, z: 0 },
        { x: 0, y: 50, z: 0 }
      ],
      faces: [
        { vertices: [0, 1, 2, 3], normal: { x: 0, y: 0, z: 1 } }
      ],
      normals: [
        { x: 0, y: 0, z: 1 }
      ],
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

  const mockDrawing: TechnicalDrawing = {
    id: 'drawing1',
    type: 'floor_plan',
    name: 'Floor Plan',
    description: 'Main floor plan',
    scale: 0.25,
    units: 'ft',
    paperSize: 'ANSI_D',
    elements: [
      {
        id: 'elem1',
        type: 'line',
        layer: 'structure',
        properties: {
          start: { x: 0, y: 0 },
          end: { x: 100, y: 0 },
          weight: 0.5,
          color: '#000000'
        }
      },
      {
        id: 'elem2',
        type: 'rectangle',
        layer: 'structure',
        properties: {
          corner1: { x: 0, y: 0 },
          corner2: { x: 100, y: 50 },
          weight: 0.5,
          color: '#000000'
        }
      }
    ],
    dimensions: [
      {
        id: 'dim1',
        type: 'linear',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        offset: 10,
        text: "100'-0\"",
        style: 'standard'
      }
    ],
    notes: [
      {
        id: 'note1',
        position: { x: 50, y: 25 },
        text: 'Test Greenhouse',
        style: 'title'
      }
    ],
    viewport: {
      center: { x: 50, y: 25 },
      scale: 0.25,
      rotation: 0
    },
    titleBlock: {
      title: 'Test Greenhouse',
      projectNumber: 'P001',
      drawing: 'A-101',
      date: '2024-01-01',
      scale: '1/4" = 1\'-0"',
      author: 'Test User',
      checker: '',
      revision: 'A'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const defaultExportOptions: ExportOptions = {
    format: 'dxf',
    type: 'model',
    units: 'ft',
    precision: 3,
    includeMetadata: true,
    includeAnalysis: false,
    includeBOM: false,
    layerConfiguration: {
      separateByMaterial: true,
      separateByComponent: true,
      separateByAssembly: false,
      customLayers: new Map()
    },
    exportSettings: {
      compression: false,
      binaryFormat: false,
      includeHiddenElements: false,
      includeConstructionGeometry: false,
      mergeCoplanarFaces: true,
      tessellationTolerance: 0.01
    }
  };

  beforeEach(() => {
    exportEngine = new CADExportEngine();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Export', () => {
    test('should export model to DXF format', async () => {
      const options = { ...defaultExportOptions, format: 'dxf' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('dxf');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.entityCount).toBeGreaterThan(0);
    });

    test('should export model to DWG format', async () => {
      const options = { ...defaultExportOptions, format: 'dwg' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('dwg');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to STEP format', async () => {
      const options = { ...defaultExportOptions, format: 'step' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('step');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to IGES format', async () => {
      const options = { ...defaultExportOptions, format: 'iges' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('iges');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to IFC format', async () => {
      const options = { ...defaultExportOptions, format: 'ifc' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('ifc');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to STL format', async () => {
      const options = { ...defaultExportOptions, format: 'stl' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('stl');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to OBJ format', async () => {
      const options = { ...defaultExportOptions, format: 'obj' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('obj');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export model to glTF format', async () => {
      const options = { ...defaultExportOptions, format: 'gltf' as ExportFormat };
      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('gltf');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should handle unsupported format', async () => {
      const options = { ...defaultExportOptions, format: 'unknown' as ExportFormat };
      
      await expect(exportEngine.exportModel(mockModel, options)).rejects.toThrow('Unsupported export format: unknown');
    });
  });

  describe('Drawing Export', () => {
    test('should export drawings to PDF format', async () => {
      const options = { ...defaultExportOptions, format: 'pdf' as ExportFormat, type: 'drawing' as const };
      const result = await exportEngine.exportDrawings([mockDrawing], options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export drawings to DXF format', async () => {
      const options = { ...defaultExportOptions, format: 'dxf' as ExportFormat, type: 'drawing' as const };
      const result = await exportEngine.exportDrawings([mockDrawing], options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('dxf');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should export drawings to SVG format', async () => {
      const options = { ...defaultExportOptions, format: 'svg' as ExportFormat, type: 'drawing' as const };
      const result = await exportEngine.exportDrawings([mockDrawing], options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('svg');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should handle multiple drawings', async () => {
      const drawings = [
        mockDrawing,
        { ...mockDrawing, id: 'drawing2', name: 'Elevation' }
      ];
      
      const options = { ...defaultExportOptions, format: 'pdf' as ExportFormat, type: 'drawing' as const };
      const result = await exportEngine.exportDrawings(drawings, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.buffer).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });
  });

  describe('Layer Configuration', () => {
    test('should separate entities by material', async () => {
      const options = {
        ...defaultExportOptions,
        layerConfiguration: {
          separateByMaterial: true,
          separateByComponent: false,
          separateByAssembly: false,
          customLayers: new Map()
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata.layerCount).toBeGreaterThan(0);
    });

    test('should separate entities by component', async () => {
      const options = {
        ...defaultExportOptions,
        layerConfiguration: {
          separateByMaterial: false,
          separateByComponent: true,
          separateByAssembly: false,
          customLayers: new Map()
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata.layerCount).toBeGreaterThan(0);
    });

    test('should use custom layers', async () => {
      const customLayers = new Map([
        ['structure', { name: 'STRUCTURE', color: '#FF0000', lineweight: 0.5 }],
        ['glazing', { name: 'GLAZING', color: '#0000FF', lineweight: 0.3 }]
      ]);

      const options = {
        ...defaultExportOptions,
        layerConfiguration: {
          separateByMaterial: false,
          separateByComponent: false,
          separateByAssembly: false,
          customLayers
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata.layerCount).toBeGreaterThan(0);
    });
  });

  describe('Export Settings', () => {
    test('should handle compression settings', async () => {
      const options = {
        ...defaultExportOptions,
        exportSettings: {
          ...defaultExportOptions.exportSettings,
          compression: true
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    test('should handle binary format settings', async () => {
      const options = {
        ...defaultExportOptions,
        exportSettings: {
          ...defaultExportOptions.exportSettings,
          binaryFormat: true
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    test('should handle tessellation tolerance', async () => {
      const options = {
        ...defaultExportOptions,
        exportSettings: {
          ...defaultExportOptions.exportSettings,
          tessellationTolerance: 0.001
        }
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });
  });

  describe('Units and Precision', () => {
    test('should handle metric units', async () => {
      const options = {
        ...defaultExportOptions,
        units: 'mm' as const,
        precision: 2
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata.units).toBe('mm');
    });

    test('should handle imperial units', async () => {
      const options = {
        ...defaultExportOptions,
        units: 'in' as const,
        precision: 4
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata.units).toBe('in');
    });

    test('should handle different precision levels', async () => {
      const options = {
        ...defaultExportOptions,
        precision: 6
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });
  });

  describe('Metadata Inclusion', () => {
    test('should include metadata when requested', async () => {
      const options = {
        ...defaultExportOptions,
        includeMetadata: true
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.entityCount).toBeGreaterThan(0);
      expect(result.metadata.boundingBox).toBeDefined();
    });

    test('should exclude metadata when not requested', async () => {
      const options = {
        ...defaultExportOptions,
        includeMetadata: false
      };

      const result = await exportEngine.exportModel(mockModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined(); // Basic metadata always included
    });
  });

  describe('Error Handling', () => {
    test('should handle export errors gracefully', async () => {
      const invalidModel = { ...mockModel, geometry: null } as any;
      const options = defaultExportOptions;

      const result = await exportEngine.exportModel(invalidModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle drawing export errors', async () => {
      const invalidDrawing = { ...mockDrawing, elements: null } as any;
      const options = { ...defaultExportOptions, type: 'drawing' as const };

      const result = await exportEngine.exportDrawings([invalidDrawing], options);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle empty model', async () => {
      const emptyModel = {
        ...mockModel,
        structure: {
          foundation: [],
          frame: [],
          glazing: [],
          doors: [],
          hardware: []
        }
      };

      const options = defaultExportOptions;
      const result = await exportEngine.exportModel(emptyModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Model contains no geometry');
    });
  });

  describe('Export Validation', () => {
    test('should validate export options', async () => {
      const invalidOptions = {
        ...defaultExportOptions,
        precision: -1
      };

      const result = await exportEngine.exportModel(mockModel, invalidOptions);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid precision value');
    });

    test('should validate model before export', async () => {
      const invalidModel = {
        ...mockModel,
        geometry: {
          vertices: [],
          faces: [],
          normals: [],
          boundingBox: null
        }
      } as any;

      const options = defaultExportOptions;
      const result = await exportEngine.exportModel(invalidModel, options);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large models efficiently', async () => {
      const largeModel = {
        ...mockModel,
        structure: {
          ...mockModel.structure,
          frame: Array.from({ length: 1000 }, (_, i) => ({
            ...mockModel.structure.frame[0],
            id: `frame${i}`,
            name: `Frame Post ${i}`
          }))
        }
      };

      const startTime = Date.now();
      const result = await exportEngine.exportModel(largeModel, defaultExportOptions);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    test('should handle multiple format exports efficiently', async () => {
      const formats: ExportFormat[] = ['dxf', 'dwg', 'step', 'iges', 'stl'];
      const results = [];

      const startTime = Date.now();
      for (const format of formats) {
        const options = { ...defaultExportOptions, format };
        const result = await exportEngine.exportModel(mockModel, options);
        results.push(result);
      }
      const endTime = Date.now();

      expect(results.length).toBe(5);
      expect(results.every(r => r.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete in under 15 seconds
    });
  });
});