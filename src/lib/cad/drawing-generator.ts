/**
 * Technical Drawing Generator
 * Automated generation of professional construction drawings from 3D models
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';
import { GreenhouseModel, Component, TechnicalDrawing, Point3D } from './greenhouse-cad-system';
import { MaterialDatabase } from './material-database';
import { BOMGenerator } from './bom-generator';

export type ViewType = 'plan' | 'elevation' | 'section' | 'detail' | 'isometric' | '3d' | 'perspective';
export type DrawingScale = '1:8' | '1:4' | '1:2' | '1:1' | '2:1' | '4:1' | '8:1';
export type PaperSize = 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'ANSI_A' | 'ANSI_B' | 'ANSI_C' | 'ANSI_D' | 'ANSI_E';
export type LineType = 'continuous' | 'dashed' | 'dotted' | 'dash_dot' | 'center' | 'hidden';
export type LineWeight = 0.13 | 0.18 | 0.25 | 0.35 | 0.5 | 0.7 | 1.0 | 1.4 | 2.0;

export interface DrawingElement {
  id: string;
  type: 'line' | 'polyline' | 'arc' | 'circle' | 'ellipse' | 'text' | 'dimension' | 'hatch' | 'block' | 'spline';
  layer: string;
  
  // Geometry
  geometry: {
    points?: Point3D[];
    center?: Point3D;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    text?: string;
    height?: number;
    width?: number;
  };
  
  // Style
  style: {
    color: string;
    lineType: LineType;
    lineWeight: LineWeight;
    fill?: string;
    transparency?: number;
  };
  
  // Properties
  properties: {
    visible: boolean;
    locked: boolean;
    selectable: boolean;
    printable: boolean;
  };
}

export interface DrawingDimension {
  id: string;
  type: 'linear' | 'angular' | 'radial' | 'diameter' | 'ordinate' | 'continuous';
  
  // Geometry
  point1: Point3D;
  point2: Point3D;
  textPosition: Point3D;
  
  // Properties
  value: number;
  unit: string;
  precision: number;
  text: string;
  
  // Style
  style: {
    textHeight: number;
    arrowSize: number;
    extensionLineOffset: number;
    dimensionLineOffset: number;
    color: string;
  };
}

export interface DrawingAnnotation {
  id: string;
  type: 'note' | 'label' | 'title' | 'callout' | 'symbol' | 'detail_marker';
  
  // Position
  position: Point3D;
  
  // Content
  text: string;
  
  // Style
  style: {
    font: string;
    size: number;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: 'left' | 'center' | 'right' | 'justify';
  };
  
  // Leader
  leader?: {
    enabled: boolean;
    points: Point3D[];
    arrowType: 'arrow' | 'dot' | 'none';
  };
}

export interface DrawingLayer {
  name: string;
  color: string;
  lineType: LineType;
  lineWeight: LineWeight;
  visible: boolean;
  locked: boolean;
  printable: boolean;
  description: string;
}

export interface DrawingLayout {
  id: string;
  name: string;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  scale: DrawingScale;
  units: 'inches' | 'feet' | 'millimeters' | 'meters';
  
  // Viewport
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    center: Point3D;
    zoom: number;
  };
  
  // Title Block
  titleBlock: {
    template: string;
    fields: Record<string, string>;
    position: Point3D;
    size: { width: number; height: number };
  };
  
  // Margins
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface DrawingSheet {
  id: string;
  number: string;
  title: string;
  description: string;
  layout: DrawingLayout;
  
  // Content
  elements: DrawingElement[];
  dimensions: DrawingDimension[];
  annotations: DrawingAnnotation[];
  layers: DrawingLayer[];
  
  // Metadata
  createdBy: string;
  checkedBy?: string;
  approvedBy?: string;
  revisions: Array<{
    number: string;
    date: Date;
    description: string;
    by: string;
  }>;
  
  // Status
  status: 'draft' | 'review' | 'approved' | 'issued';
  
  // Export
  exportFormats: Array<{
    format: 'pdf' | 'dwg' | 'dxf' | 'svg' | 'png';
    path: string;
    settings: Record<string, any>;
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingSet {
  id: string;
  name: string;
  description: string;
  
  // Project Information
  project: {
    name: string;
    number: string;
    client: string;
    location: string;
    architect: string;
    contractor: string;
  };
  
  // Sheets
  sheets: DrawingSheet[];
  
  // Standards
  standards: {
    layers: DrawingLayer[];
    textStyles: Record<string, any>;
    dimensionStyles: Record<string, any>;
    lineTypes: Record<string, any>;
  };
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

class DrawingGenerator extends EventEmitter {
  private materialDatabase: MaterialDatabase;
  private bomGenerator: BOMGenerator;
  private drawingStandards: Map<string, any> = new Map();
  private layerStandards: Map<string, DrawingLayer> = new Map();
  private symbolLibrary: Map<string, any> = new Map();

  constructor(materialDatabase: MaterialDatabase, bomGenerator: BOMGenerator) {
    super();
    this.materialDatabase = materialDatabase;
    this.bomGenerator = bomGenerator;
    this.initializeStandards();
  }

  /**
   * Initialize drawing standards and symbols
   */
  private initializeStandards(): void {
    this.initializeLayerStandards();
    this.initializeTextStyles();
    this.initializeDimensionStyles();
    this.initializeSymbolLibrary();
  }

  /**
   * Generate complete drawing set from greenhouse model
   */
  async generateDrawingSet(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSet> {
    try {
      const drawingSet: DrawingSet = {
        id: this.generateId('set'),
        name: `${projectInfo.name} - Construction Drawings`,
        description: `Complete construction drawing set for ${model.name}`,
        project: projectInfo,
        sheets: [],
        standards: {
          layers: Array.from(this.layerStandards.values()),
          textStyles: this.drawingStandards.get('textStyles'),
          dimensionStyles: this.drawingStandards.get('dimensionStyles'),
          lineTypes: this.drawingStandards.get('lineTypes')
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate sheets in order
      drawingSet.sheets.push(await this.generateCoverSheet(model, projectInfo));
      drawingSet.sheets.push(await this.generateSitePlan(model, projectInfo));
      drawingSet.sheets.push(await this.generateFloorPlan(model, projectInfo));
      drawingSet.sheets.push(await this.generateFoundationPlan(model, projectInfo));
      drawingSet.sheets.push(await this.generateFramingPlan(model, projectInfo));
      drawingSet.sheets.push(await this.generateRoofPlan(model, projectInfo));
      drawingSet.sheets.push(...await this.generateElevations(model, projectInfo));
      drawingSet.sheets.push(...await this.generateSections(model, projectInfo));
      drawingSet.sheets.push(...await this.generateDetails(model, projectInfo));
      drawingSet.sheets.push(await this.generateSchedulesSheet(model, projectInfo));

      // Number sheets
      drawingSet.sheets.forEach((sheet, index) => {
        sheet.number = this.generateSheetNumber(index, sheet.title);
      });

      this.emit('drawing-set-generated', drawingSet);
      return drawingSet;
    } catch (error) {
      logger.error('api', 'Failed to generate drawing set:', error );
      throw error;
    }
  }

  /**
   * Generate cover sheet with project information
   */
  private async generateCoverSheet(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'T-001',
      title: 'Title Sheet',
      description: 'Project title and drawing index',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add project title
    sheet.annotations.push({
      id: this.generateId('annotation'),
      type: 'title',
      position: { x: 18, y: 24, z: 0 },
      text: projectInfo.name,
      style: {
        font: 'Arial',
        size: 24,
        color: 'black',
        bold: true,
        italic: false,
        underline: false,
        alignment: 'center'
      }
    });

    // Add project information
    const projectDetails = [
      `Project Number: ${projectInfo.number}`,
      `Client: ${projectInfo.client}`,
      `Location: ${projectInfo.location}`,
      `Architect: ${projectInfo.architect}`,
      `Contractor: ${projectInfo.contractor}`,
      `Greenhouse Type: ${model.parameters.structure.type}`,
      `Dimensions: ${model.parameters.dimensions.length}' × ${model.parameters.dimensions.width}' × ${model.parameters.dimensions.height}'`
    ];

    projectDetails.forEach((detail, index) => {
      sheet.annotations.push({
        id: this.generateId('annotation'),
        type: 'note',
        position: { x: 2, y: 20 - index * 0.5, z: 0 },
        text: detail,
        style: {
          font: 'Arial',
          size: 10,
          color: 'black',
          bold: false,
          italic: false,
          underline: false,
          alignment: 'left'
        }
      });
    });

    // Add drawing index
    sheet.annotations.push({
      id: this.generateId('annotation'),
      type: 'title',
      position: { x: 2, y: 15, z: 0 },
      text: 'DRAWING INDEX',
      style: {
        font: 'Arial',
        size: 14,
        color: 'black',
        bold: true,
        italic: false,
        underline: true,
        alignment: 'left'
      }
    });

    // Add 3D isometric view
    const isometricView = await this.generateIsometricView(model, {
      x: 25, y: 15, z: 0
    }, 10, 10);
    sheet.elements.push(...isometricView);

    return sheet;
  }

  /**
   * Generate site plan showing greenhouse placement
   */
  private async generateSitePlan(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'A-001',
      title: 'Site Plan',
      description: 'Site layout and greenhouse placement',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/16),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add property boundary (example)
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'property',
      geometry: {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 200, y: 0, z: 0 },
          { x: 200, y: 150, z: 0 },
          { x: 0, y: 150, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.35
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add greenhouse outline
    const ghX = 50;
    const ghY = 50;
    const ghLength = model.parameters.dimensions.length;
    const ghWidth = model.parameters.dimensions.width;

    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'building',
      geometry: {
        points: [
          { x: ghX, y: ghY, z: 0 },
          { x: ghX + ghLength, y: ghY, z: 0 },
          { x: ghX + ghLength, y: ghY + ghWidth, z: 0 },
          { x: ghX, y: ghY + ghWidth, z: 0 },
          { x: ghX, y: ghY, z: 0 }
        ]
      },
      style: {
        color: 'blue',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add setbacks and dimensions
    sheet.dimensions.push({
      id: this.generateId('dimension'),
      type: 'linear',
      point1: { x: 0, y: ghY, z: 0 },
      point2: { x: ghX, y: ghY, z: 0 },
      textPosition: { x: 25, y: ghY - 5, z: 0 },
      value: ghX,
      unit: 'ft',
      precision: 0,
      text: `${ghX}'-0"`,
      style: {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      }
    });

    // Add north arrow
    sheet.elements.push(...this.createNorthArrow({ x: 180, y: 140, z: 0 }));

    // Add scale notation
    sheet.annotations.push({
      id: this.generateId('annotation'),
      type: 'note',
      position: { x: 2, y: 2, z: 0 },
      text: 'SCALE: 1" = 16\'',
      style: {
        font: 'Arial',
        size: 8,
        color: 'black',
        bold: false,
        italic: false,
        underline: false,
        alignment: 'left'
      }
    });

    return sheet;
  }

  /**
   * Generate floor plan
   */
  private async generateFloorPlan(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'A-101',
      title: 'Floor Plan',
      description: 'Layout and internal arrangement',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { length, width, baySpacing } = model.parameters.dimensions;

    // Add exterior walls
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'walls',
      geometry: {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: length, y: 0, z: 0 },
          { x: length, y: width, z: 0 },
          { x: 0, y: width, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add structural grid
    const numBays = Math.floor(length / baySpacing);
    for (let i = 1; i < numBays; i++) {
      const x = i * baySpacing;
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'line',
        layer: 'grid',
        geometry: {
          points: [
            { x, y: 0, z: 0 },
            { x, y: width, z: 0 }
          ]
        },
        style: {
          color: 'gray',
          lineType: 'dashed',
          lineWeight: 0.25
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Add grid bubble
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'circle',
        layer: 'grid',
        geometry: {
          center: { x, y: -2, z: 0 },
          radius: 1
        },
        style: {
          color: 'black',
          lineType: 'continuous',
          lineWeight: 0.35
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Add grid label
      sheet.annotations.push({
        id: this.generateId('annotation'),
        type: 'label',
        position: { x, y: -2, z: 0 },
        text: String.fromCharCode(65 + i), // A, B, C, etc.
        style: {
          font: 'Arial',
          size: 8,
          color: 'black',
          bold: true,
          italic: false,
          underline: false,
          alignment: 'center'
        }
      });
    }

    // Add growing benches/areas
    const benchWidth = 4;
    const aisleWidth = 3;
    const numBenches = Math.floor((width - 2) / (benchWidth + aisleWidth));
    
    for (let i = 0; i < numBenches; i++) {
      const y = 1 + i * (benchWidth + aisleWidth);
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'polyline',
        layer: 'equipment',
        geometry: {
          points: [
            { x: 2, y, z: 0 },
            { x: length - 2, y, z: 0 },
            { x: length - 2, y: y + benchWidth, z: 0 },
            { x: 2, y: y + benchWidth, z: 0 },
            { x: 2, y, z: 0 }
          ]
        },
        style: {
          color: 'green',
          lineType: 'continuous',
          lineWeight: 0.35
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Add bench label
      sheet.annotations.push({
        id: this.generateId('annotation'),
        type: 'label',
        position: { x: length / 2, y: y + benchWidth / 2, z: 0 },
        text: `BENCH ${i + 1}`,
        style: {
          font: 'Arial',
          size: 6,
          color: 'green',
          bold: false,
          italic: false,
          underline: false,
          alignment: 'center'
        }
      });
    }

    // Add doors
    const doorWidth = 3;
    const doorPosition = width / 2 - doorWidth / 2;
    
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'arc',
      layer: 'doors',
      geometry: {
        center: { x: 0, y: doorPosition, z: 0 },
        radius: doorWidth,
        startAngle: 0,
        endAngle: 90
      },
      style: {
        color: 'red',
        lineType: 'continuous',
        lineWeight: 0.35
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add dimensions
    sheet.dimensions.push({
      id: this.generateId('dimension'),
      type: 'linear',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: length, y: 0, z: 0 },
      textPosition: { x: length / 2, y: -5, z: 0 },
      value: length,
      unit: 'ft',
      precision: 0,
      text: `${length}'-0"`,
      style: {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      }
    });

    sheet.dimensions.push({
      id: this.generateId('dimension'),
      type: 'linear',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 0, y: width, z: 0 },
      textPosition: { x: -5, y: width / 2, z: 0 },
      value: width,
      unit: 'ft',
      precision: 0,
      text: `${width}'-0"`,
      style: {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      }
    });

    return sheet;
  }

  /**
   * Generate foundation plan
   */
  private async generateFoundationPlan(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'S-101',
      title: 'Foundation Plan',
      description: 'Foundation layout and details',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { length, width, baySpacing } = model.parameters.dimensions;
    const { foundationType } = model.parameters.structure;

    // Add foundation outline
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'foundation',
      geometry: {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: length, y: 0, z: 0 },
          { x: length, y: width, z: 0 },
          { x: 0, y: width, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add foundation details based on type
    switch (foundationType) {
      case 'concrete_slab':
        await this.addConcreteSlab(sheet, model);
        break;
      case 'concrete_footings':
        await this.addConcreteFootings(sheet, model);
        break;
      case 'gravel_pad':
        await this.addGravelPad(sheet, model);
        break;
    }

    // Add column locations
    const numBays = Math.floor(length / baySpacing);
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Left side columns
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'circle',
        layer: 'columns',
        geometry: {
          center: { x, y: 0, z: 0 },
          radius: 0.5
        },
        style: {
          color: 'blue',
          lineType: 'continuous',
          lineWeight: 0.35
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Right side columns
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'circle',
        layer: 'columns',
        geometry: {
          center: { x, y: width, z: 0 },
          radius: 0.5
        },
        style: {
          color: 'blue',
          lineType: 'continuous',
          lineWeight: 0.35
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });
    }

    // Add reinforcement pattern (if concrete)
    if (foundationType === 'concrete_slab') {
      await this.addReinforcementPattern(sheet, model);
    }

    return sheet;
  }

  /**
   * Generate framing plan
   */
  private async generateFramingPlan(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'S-201',
      title: 'Framing Plan',
      description: 'Structural framing layout',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { length, width, baySpacing } = model.parameters.dimensions;
    const { frameType } = model.parameters.structure;

    // Add main frame members
    const numBays = Math.floor(length / baySpacing);
    
    // Add purlins
    for (let i = 0; i < numBays; i++) {
      const x = i * baySpacing;
      
      // Left purlin
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'line',
        layer: 'framing',
        geometry: {
          points: [
            { x, y: 0, z: 0 },
            { x: x + baySpacing, y: 0, z: 0 }
          ]
        },
        style: {
          color: 'red',
          lineType: 'continuous',
          lineWeight: 0.5
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Right purlin
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'line',
        layer: 'framing',
        geometry: {
          points: [
            { x, y: width, z: 0 },
            { x: x + baySpacing, y: width, z: 0 }
          ]
        },
        style: {
          color: 'red',
          lineType: 'continuous',
          lineWeight: 0.5
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });

      // Cross members
      sheet.elements.push({
        id: this.generateId('element'),
        type: 'line',
        layer: 'framing',
        geometry: {
          points: [
            { x, y: 0, z: 0 },
            { x, y: width, z: 0 }
          ]
        },
        style: {
          color: 'red',
          lineType: 'continuous',
          lineWeight: 0.5
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });
    }

    // Add member labels
    sheet.annotations.push({
      id: this.generateId('annotation'),
      type: 'label',
      position: { x: baySpacing / 2, y: -1, z: 0 },
      text: `${frameType.toUpperCase()} PURLIN`,
      style: {
        font: 'Arial',
        size: 6,
        color: 'red',
        bold: false,
        italic: false,
        underline: false,
        alignment: 'center'
      }
    });

    return sheet;
  }

  /**
   * Generate roof plan
   */
  private async generateRoofPlan(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'A-201',
      title: 'Roof Plan',
      description: 'Roof layout and drainage',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { length, width } = model.parameters.dimensions;
    const { roofPitch } = model.parameters.structure;

    // Add roof outline
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'roof',
      geometry: {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: length, y: 0, z: 0 },
          { x: length, y: width, z: 0 },
          { x: 0, y: width, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add roof slope arrows
    const numArrows = 4;
    const arrowSpacing = length / (numArrows + 1);
    
    for (let i = 1; i <= numArrows; i++) {
      const x = i * arrowSpacing;
      sheet.elements.push(...this.createSlopeArrow(
        { x, y: width / 4, z: 0 },
        { x, y: 3 * width / 4, z: 0 },
        roofPitch
      ));
    }

    // Add ventilation openings
    if (model.parameters.ventilation.roofVents.enabled) {
      const ventSpacing = model.parameters.ventilation.roofVents.spacing;
      const ventSize = model.parameters.ventilation.roofVents.size;
      const numVents = Math.floor(length / ventSpacing);
      
      for (let i = 0; i < numVents; i++) {
        const x = (i + 1) * ventSpacing - ventSize.length / 2;
        const y = width / 2 - ventSize.width / 2;
        
        sheet.elements.push({
          id: this.generateId('element'),
          type: 'polyline',
          layer: 'ventilation',
          geometry: {
            points: [
              { x, y, z: 0 },
              { x: x + ventSize.length, y, z: 0 },
              { x: x + ventSize.length, y: y + ventSize.width, z: 0 },
              { x, y: y + ventSize.width, z: 0 },
              { x, y, z: 0 }
            ]
          },
          style: {
            color: 'cyan',
            lineType: 'continuous',
            lineWeight: 0.35
          },
          properties: {
            visible: true,
            locked: false,
            selectable: true,
            printable: true
          }
        });
      }
    }

    return sheet;
  }

  /**
   * Generate elevation drawings
   */
  private async generateElevations(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet[]> {
    const elevations: DrawingSheet[] = [];
    
    // Front elevation
    elevations.push(await this.generateElevation(model, projectInfo, 'front', 'A-301'));
    
    // Side elevation
    elevations.push(await this.generateElevation(model, projectInfo, 'side', 'A-302'));
    
    // End elevation
    elevations.push(await this.generateElevation(model, projectInfo, 'end', 'A-303'));
    
    return elevations;
  }

  /**
   * Generate single elevation view
   */
  private async generateElevation(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project'],
    view: 'front' | 'side' | 'end',
    sheetNumber: string
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: sheetNumber,
      title: `${view.charAt(0).toUpperCase() + view.slice(1)} Elevation`,
      description: `${view} elevation view`,
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { length, width, height, gutterHeight } = model.parameters.dimensions;
    const { roofPitch } = model.parameters.structure;

    // Calculate dimensions based on view
    let viewWidth: number;
    let viewHeight: number;
    
    switch (view) {
      case 'front':
        viewWidth = length;
        viewHeight = height;
        break;
      case 'side':
        viewWidth = width;
        viewHeight = height;
        break;
      case 'end':
        viewWidth = width;
        viewHeight = height;
        break;
    }

    // Add ground line
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'line',
      layer: 'ground',
      geometry: {
        points: [
          { x: -2, y: 0, z: 0 },
          { x: viewWidth + 2, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add building outline
    const roofPeakHeight = gutterHeight + (viewWidth / 2) * Math.tan(roofPitch * Math.PI / 180);
    
    sheet.elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'building',
      geometry: {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 0, y: gutterHeight, z: 0 },
          { x: viewWidth / 2, y: roofPeakHeight, z: 0 },
          { x: viewWidth, y: gutterHeight, z: 0 },
          { x: viewWidth, y: 0, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });

    // Add dimensions
    sheet.dimensions.push({
      id: this.generateId('dimension'),
      type: 'linear',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: viewWidth, y: 0, z: 0 },
      textPosition: { x: viewWidth / 2, y: -3, z: 0 },
      value: viewWidth,
      unit: 'ft',
      precision: 0,
      text: `${viewWidth}'-0"`,
      style: {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      }
    });

    sheet.dimensions.push({
      id: this.generateId('dimension'),
      type: 'linear',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 0, y: gutterHeight, z: 0 },
      textPosition: { x: -3, y: gutterHeight / 2, z: 0 },
      value: gutterHeight,
      unit: 'ft',
      precision: 0,
      text: `${gutterHeight}'-0"`,
      style: {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      }
    });

    return sheet;
  }

  /**
   * Generate section drawings
   */
  private async generateSections(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet[]> {
    const sections: DrawingSheet[] = [];
    
    // Cross section
    sections.push(await this.generateSection(model, projectInfo, 'cross', 'A-401'));
    
    // Longitudinal section
    sections.push(await this.generateSection(model, projectInfo, 'longitudinal', 'A-402'));
    
    return sections;
  }

  /**
   * Generate single section view
   */
  private async generateSection(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project'],
    type: 'cross' | 'longitudinal',
    sheetNumber: string
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: sheetNumber,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      description: `${type} section view`,
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1/4),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add section-specific elements
    if (type === 'cross') {
      await this.addCrossSectionElements(sheet, model);
    } else {
      await this.addLongitudinalSectionElements(sheet, model);
    }

    return sheet;
  }

  /**
   * Generate detail drawings
   */
  private async generateDetails(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet[]> {
    const details: DrawingSheet[] = [];
    
    // Connection details
    details.push(await this.generateDetailSheet(model, projectInfo, 'connections', 'A-501'));
    
    // Foundation details
    details.push(await this.generateDetailSheet(model, projectInfo, 'foundation', 'A-502'));
    
    // Glazing details
    details.push(await this.generateDetailSheet(model, projectInfo, 'glazing', 'A-503'));
    
    return details;
  }

  /**
   * Generate detail sheet
   */
  private async generateDetailSheet(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project'],
    type: 'connections' | 'foundation' | 'glazing',
    sheetNumber: string
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: sheetNumber,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Details`,
      description: `Construction details for ${type}`,
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add detail-specific elements
    switch (type) {
      case 'connections':
        await this.addConnectionDetails(sheet, model);
        break;
      case 'foundation':
        await this.addFoundationDetails(sheet, model);
        break;
      case 'glazing':
        await this.addGlazingDetails(sheet, model);
        break;
    }

    return sheet;
  }

  /**
   * Generate schedules sheet
   */
  private async generateSchedulesSheet(
    model: GreenhouseModel,
    projectInfo: DrawingSet['project']
  ): Promise<DrawingSheet> {
    const sheet: DrawingSheet = {
      id: this.generateId('sheet'),
      number: 'A-601',
      title: 'Schedules',
      description: 'Material and equipment schedules',
      layout: this.createStandardLayout('ANSI_D', 'landscape', 1),
      elements: [],
      dimensions: [],
      annotations: [],
      layers: this.getStandardLayers(),
      createdBy: 'System',
      revisions: [],
      status: 'draft',
      exportFormats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add door schedule
    await this.addDoorSchedule(sheet, model);
    
    // Add window schedule
    await this.addWindowSchedule(sheet, model);
    
    // Add material schedule
    await this.addMaterialSchedule(sheet, model);
    
    return sheet;
  }

  // Helper methods for drawing generation
  
  private initializeLayerStandards(): void {
    const standardLayers: DrawingLayer[] = [
      {
        name: 'defpoints',
        color: 'white',
        lineType: 'continuous',
        lineWeight: 0.13,
        visible: false,
        locked: false,
        printable: false,
        description: 'Definition points'
      },
      {
        name: 'grid',
        color: 'gray',
        lineType: 'dashed',
        lineWeight: 0.25,
        visible: true,
        locked: false,
        printable: true,
        description: 'Structural grid'
      },
      {
        name: 'walls',
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.7,
        visible: true,
        locked: false,
        printable: true,
        description: 'Walls and partitions'
      },
      {
        name: 'doors',
        color: 'red',
        lineType: 'continuous',
        lineWeight: 0.35,
        visible: true,
        locked: false,
        printable: true,
        description: 'Doors and openings'
      },
      {
        name: 'windows',
        color: 'blue',
        lineType: 'continuous',
        lineWeight: 0.35,
        visible: true,
        locked: false,
        printable: true,
        description: 'Windows and glazing'
      },
      {
        name: 'foundation',
        color: 'magenta',
        lineType: 'continuous',
        lineWeight: 0.5,
        visible: true,
        locked: false,
        printable: true,
        description: 'Foundation elements'
      },
      {
        name: 'framing',
        color: 'red',
        lineType: 'continuous',
        lineWeight: 0.5,
        visible: true,
        locked: false,
        printable: true,
        description: 'Structural framing'
      },
      {
        name: 'equipment',
        color: 'green',
        lineType: 'continuous',
        lineWeight: 0.35,
        visible: true,
        locked: false,
        printable: true,
        description: 'Equipment and fixtures'
      },
      {
        name: 'dimensions',
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.25,
        visible: true,
        locked: false,
        printable: true,
        description: 'Dimensions and annotations'
      },
      {
        name: 'text',
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.13,
        visible: true,
        locked: false,
        printable: true,
        description: 'Text and labels'
      },
      {
        name: 'hatch',
        color: 'gray',
        lineType: 'continuous',
        lineWeight: 0.13,
        visible: true,
        locked: false,
        printable: true,
        description: 'Hatching and patterns'
      }
    ];
    
    for (const layer of standardLayers) {
      this.layerStandards.set(layer.name, layer);
    }
  }
  
  private initializeTextStyles(): void {
    this.drawingStandards.set('textStyles', {
      'standard': {
        font: 'Arial',
        size: 8,
        color: 'black',
        bold: false,
        italic: false
      },
      'title': {
        font: 'Arial',
        size: 24,
        color: 'black',
        bold: true,
        italic: false
      },
      'subtitle': {
        font: 'Arial',
        size: 16,
        color: 'black',
        bold: true,
        italic: false
      },
      'notes': {
        font: 'Arial',
        size: 6,
        color: 'black',
        bold: false,
        italic: false
      }
    });
  }
  
  private initializeDimensionStyles(): void {
    this.drawingStandards.set('dimensionStyles', {
      'standard': {
        textHeight: 2,
        arrowSize: 1,
        extensionLineOffset: 1,
        dimensionLineOffset: 3,
        color: 'black'
      },
      'small': {
        textHeight: 1.5,
        arrowSize: 0.75,
        extensionLineOffset: 0.75,
        dimensionLineOffset: 2,
        color: 'black'
      }
    });
  }
  
  private initializeSymbolLibrary(): void {
    // Initialize common symbols
    this.symbolLibrary.set('north_arrow', {
      type: 'north_arrow',
      elements: [
        { type: 'line', points: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 2, z: 0 }] },
        { type: 'line', points: [{ x: -0.5, y: 1.5, z: 0 }, { x: 0, y: 2, z: 0 }] },
        { type: 'line', points: [{ x: 0.5, y: 1.5, z: 0 }, { x: 0, y: 2, z: 0 }] },
        { type: 'text', position: { x: 0.5, y: 1, z: 0 }, text: 'N' }
      ]
    });
  }
  
  private createStandardLayout(
    paperSize: PaperSize,
    orientation: 'portrait' | 'landscape',
    scale: DrawingScale
  ): DrawingLayout {
    const paperSizes = {
      'A4': { width: 8.27, height: 11.69 },
      'A3': { width: 11.69, height: 16.54 },
      'A2': { width: 16.54, height: 23.39 },
      'A1': { width: 23.39, height: 33.11 },
      'A0': { width: 33.11, height: 46.81 },
      'ANSI_A': { width: 8.5, height: 11 },
      'ANSI_B': { width: 11, height: 17 },
      'ANSI_C': { width: 17, height: 22 },
      'ANSI_D': { width: 22, height: 34 },
      'ANSI_E': { width: 34, height: 44 }
    };
    
    const size = paperSizes[paperSize];
    const width = orientation === 'landscape' ? size.height : size.width;
    const height = orientation === 'landscape' ? size.width : size.height;
    
    return {
      id: this.generateId('layout'),
      name: `${paperSize} ${orientation}`,
      paperSize,
      orientation,
      scale,
      units: 'feet',
      viewport: {
        x: 2,
        y: 2,
        width: width - 8,
        height: height - 4,
        center: { x: 0, y: 0, z: 0 },
        zoom: 1
      },
      titleBlock: {
        template: 'standard',
        fields: {
          'title': '',
          'project': '',
          'sheet': '',
          'date': new Date().toLocaleDateString(),
          'scale': `1" = ${scale}'`,
          'drawn_by': 'System',
          'checked_by': '',
          'approved_by': ''
        },
        position: { x: width - 6, y: 0.5, z: 0 },
        size: { width: 5.5, height: 3 }
      },
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    };
  }
  
  private getStandardLayers(): DrawingLayer[] {
    return Array.from(this.layerStandards.values());
  }
  
  private async generateIsometricView(
    model: GreenhouseModel,
    position: Point3D,
    width: number,
    height: number
  ): Promise<DrawingElement[]> {
    const elements: DrawingElement[] = [];
    
    // Simplified isometric view
    const { length, width: ghWidth, height: ghHeight } = model.parameters.dimensions;
    const scale = Math.min(width / length, height / ghHeight) * 0.8;
    
    // Transform coordinates to isometric
    const iso = (x: number, y: number, z: number) => ({
      x: position.x + (x - y) * Math.cos(Math.PI / 6) * scale,
      y: position.y + (x + y) * Math.sin(Math.PI / 6) * scale - z * scale,
      z: 0
    });
    
    // Add building outline
    elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'building',
      geometry: {
        points: [
          iso(0, 0, 0),
          iso(length, 0, 0),
          iso(length, ghWidth, 0),
          iso(0, ghWidth, 0),
          iso(0, 0, 0)
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.5
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    // Add roof outline
    elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'building',
      geometry: {
        points: [
          iso(0, 0, ghHeight),
          iso(length, 0, ghHeight),
          iso(length, ghWidth, ghHeight),
          iso(0, ghWidth, ghHeight),
          iso(0, 0, ghHeight)
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.5
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    // Add vertical edges
    const corners = [
      [0, 0], [length, 0], [length, ghWidth], [0, ghWidth]
    ];
    
    for (const [x, y] of corners) {
      elements.push({
        id: this.generateId('element'),
        type: 'line',
        layer: 'building',
        geometry: {
          points: [
            iso(x, y, 0),
            iso(x, y, ghHeight)
          ]
        },
        style: {
          color: 'black',
          lineType: 'continuous',
          lineWeight: 0.5
        },
        properties: {
          visible: true,
          locked: false,
          selectable: true,
          printable: true
        }
      });
    }
    
    return elements;
  }
  
  private createNorthArrow(position: Point3D): DrawingElement[] {
    const elements: DrawingElement[] = [];
    
    // Arrow shaft
    elements.push({
      id: this.generateId('element'),
      type: 'line',
      layer: 'symbols',
      geometry: {
        points: [
          { x: position.x, y: position.y, z: 0 },
          { x: position.x, y: position.y + 2, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.35
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    // Arrow head
    elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'symbols',
      geometry: {
        points: [
          { x: position.x - 0.5, y: position.y + 1.5, z: 0 },
          { x: position.x, y: position.y + 2, z: 0 },
          { x: position.x + 0.5, y: position.y + 1.5, z: 0 }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.35
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    return elements;
  }
  
  private createSlopeArrow(
    start: Point3D,
    end: Point3D,
    slope: number
  ): DrawingElement[] {
    const elements: DrawingElement[] = [];
    
    // Arrow line
    elements.push({
      id: this.generateId('element'),
      type: 'line',
      layer: 'annotations',
      geometry: {
        points: [start, end]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.25
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    // Arrow head
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;
    
    elements.push({
      id: this.generateId('element'),
      type: 'polyline',
      layer: 'annotations',
      geometry: {
        points: [
          {
            x: end.x - 0.5 * unitX - 0.25 * unitY,
            y: end.y - 0.5 * unitY + 0.25 * unitX,
            z: 0
          },
          end,
          {
            x: end.x - 0.5 * unitX + 0.25 * unitY,
            y: end.y - 0.5 * unitY - 0.25 * unitX,
            z: 0
          }
        ]
      },
      style: {
        color: 'black',
        lineType: 'continuous',
        lineWeight: 0.25
      },
      properties: {
        visible: true,
        locked: false,
        selectable: true,
        printable: true
      }
    });
    
    return elements;
  }
  
  private generateSheetNumber(index: number, title: string): string {
    const prefixes = {
      'Title': 'T',
      'Site': 'C',
      'Floor': 'A',
      'Foundation': 'S',
      'Framing': 'S',
      'Roof': 'A',
      'Elevation': 'A',
      'Section': 'A',
      'Details': 'A',
      'Schedules': 'A'
    };
    
    const category = Object.keys(prefixes).find(key => title.includes(key)) || 'A';
    const prefix = prefixes[category as keyof typeof prefixes];
    const number = String(index + 1).padStart(3, '0');
    
    return `${prefix}-${number}`;
  }
  
  // Placeholder methods for specific drawing elements
  private async addConcreteSlab(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add concrete slab hatching and details
  }
  
  private async addConcreteFootings(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add concrete footings layout
  }
  
  private async addGravelPad(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add gravel pad outline
  }
  
  private async addReinforcementPattern(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add reinforcement bars pattern
  }
  
  private async addCrossSectionElements(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add cross-section view elements
  }
  
  private async addLongitudinalSectionElements(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add longitudinal section elements
  }
  
  private async addConnectionDetails(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add connection detail drawings
  }
  
  private async addFoundationDetails(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add foundation detail drawings
  }
  
  private async addGlazingDetails(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add glazing detail drawings
  }
  
  private async addDoorSchedule(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add door schedule table
  }
  
  private async addWindowSchedule(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add window schedule table
  }
  
  private async addMaterialSchedule(sheet: DrawingSheet, model: GreenhouseModel): Promise<void> {
    // Add material schedule table
  }
  
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { DrawingGenerator };
export default DrawingGenerator;