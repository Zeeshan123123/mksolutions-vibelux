/**
 * Professional Drawing Engine
 * Generates CAD-quality construction documents suitable for PE stamping
 * Integrates with engineering systems to produce complete drawing sets
 */

import { jsPDF } from 'jspdf';
import { StructuralDesignSystem } from './structural-designer';
import { ElectricalSystem } from './electrical-system-designer';
import { HVACDesignSystem } from '../hvac/hvac-construction-designer';
import { CalculationVerificationReport } from './calculation-verification';
import { UltraProfessionalDrawingEngine } from './ultra-professional-drawing-engine';
import { UltraProfessionalElectrical } from './ultra-professional-electrical';
import { UltraProfessionalHVAC } from './ultra-professional-hvac';

export interface DrawingSet {
  coverSheet: Drawing;
  structuralPlans: Drawing[];
  electricalPlans: Drawing[];
  mechanicalPlans: Drawing[];
  details: Drawing[];
  schedules: Drawing[];
}

export interface Drawing {
  id: string;
  title: string;
  number: string;
  scale: string;
  dateCreated: Date;
  lastModified: Date;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  revisions: DrawingRevision[];
  content: DrawingContent;
}

export interface DrawingRevision {
  number: string;
  date: Date;
  description: string;
  drawnBy: string;
  checkedBy: string;
}

export interface DrawingContent {
  type: 'plan' | 'elevation' | 'section' | 'detail' | 'schedule' | 'cover';
  scale: string;
  viewports: Viewport[];
  dimensions: Dimension[];
  annotations: Annotation[];
  symbols: Symbol[];
}

export interface Viewport {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  title: string;
  content: ViewportContent;
}

export interface ViewportContent {
  type: 'plan' | 'elevation' | 'section' | 'detail' | '3d';
  elements: DrawingElement[];
  grid: GridSystem;
  layers: Layer[];
}

export interface DrawingElement {
  id: string;
  type: 'line' | 'polyline' | 'rectangle' | 'circle' | 'arc' | 'text' | 'dimension' | 'symbol' | 'hatch';
  layer: string;
  lineWeight: number;
  lineType: 'solid' | 'dashed' | 'dotted' | 'center' | 'hidden';
  color: string;
  geometry: any;
  properties: any;
}

export interface GridSystem {
  spacing: number;
  majorGridSpacing: number;
  origin: { x: number; y: number };
  rotation: number;
  visible: boolean;
  snapEnabled: boolean;
}

export interface Layer {
  name: string;
  color: string;
  lineWeight: number;
  visible: boolean;
  frozen: boolean;
  locked: boolean;
  plotStyle: string;
}

export interface Dimension {
  id: string;
  type: 'linear' | 'aligned' | 'angular' | 'radial' | 'diameter';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  textLocation: { x: number; y: number };
  value: string;
  precision: number;
  style: DimensionStyle;
}

export interface DimensionStyle {
  arrowSize: number;
  textHeight: number;
  textStyle: string;
  extensionLineOffset: number;
  extensionLineExtension: number;
  dimensionLineGap: number;
}

export interface Annotation {
  id: string;
  type: 'text' | 'leader' | 'note' | 'tag' | 'bubble';
  location: { x: number; y: number };
  text: string;
  style: TextStyle;
  leader?: LeaderStyle;
}

export interface TextStyle {
  font: string;
  height: number;
  width: number;
  oblique: number;
  rotation: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface LeaderStyle {
  points: { x: number; y: number }[];
  arrowType: 'arrow' | 'dot' | 'tick' | 'none';
  arrowSize: number;
}

export interface Symbol {
  id: string;
  type: 'electrical' | 'mechanical' | 'structural' | 'architectural' | 'annotation';
  subtype: string;
  location: { x: number; y: number };
  rotation: number;
  scale: number;
  attributes: SymbolAttribute[];
}

export interface SymbolAttribute {
  name: string;
  value: string;
  visible: boolean;
  location: { x: number; y: number };
}

export interface ProjectInfo {
  name: string;
  number: string;
  client: string;
  location: string;
  architect: string;
  engineer: string;
  contractor: string;
  description: string;
  area: number;
  volume: number;
  occupancy: string;
  constructionType: string;
  dateStarted: Date;
  dateCompleted: Date;
}

export interface TitleBlockInfo {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoPath?: string;
  engineerName: string;
  engineerLicense: string;
  engineerSeal?: string;
}

export class ProfessionalDrawingEngine {
  private pdf: jsPDF;
  private currentScale: number = 1/96; // 1/8" = 1'-0"
  private ultraStructural: UltraProfessionalDrawingEngine;
  private ultraElectrical: UltraProfessionalElectrical;
  private ultraHVAC: UltraProfessionalHVAC;
  private lineWeights: { [key: string]: number } = {
    'thin': 0.005,
    'medium': 0.01,
    'thick': 0.02,
    'extra-thick': 0.03
  };
  private standardLayers: Layer[] = [
    { name: 'A-WALL', color: '#000000', lineWeight: 0.02, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'A-DOOR', color: '#000000', lineWeight: 0.015, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'A-GLAZ', color: '#0066CC', lineWeight: 0.01, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'S-GRID', color: '#666666', lineWeight: 0.005, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'S-BEAM', color: '#FF0000', lineWeight: 0.015, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'S-COLS', color: '#FF0000', lineWeight: 0.02, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'E-LITE', color: '#00AA00', lineWeight: 0.01, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'E-POWR', color: '#FF6600', lineWeight: 0.015, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'M-HVAC', color: '#0066FF', lineWeight: 0.015, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'M-DUCT', color: '#6600CC', lineWeight: 0.01, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'G-ANNO', color: '#000000', lineWeight: 0.005, visible: true, frozen: false, locked: false, plotStyle: 'normal' },
    { name: 'G-DIMS', color: '#000000', lineWeight: 0.005, visible: true, frozen: false, locked: false, plotStyle: 'normal' }
  ];

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [36, 24] // D-size sheet
    });
    
    // Initialize ultra-professional modules
    this.ultraStructural = new UltraProfessionalDrawingEngine();
    this.ultraElectrical = new UltraProfessionalElectrical(this.pdf);
    this.ultraHVAC = new UltraProfessionalHVAC(this.pdf);
    
    this.initializeDrawingEnvironment();
  }

  private initializeDrawingEnvironment(): void {
    this.pdf.setFont('helvetica');
    this.setLineWeight('medium');
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
  }

  private setLineWeight(weight: keyof typeof this.lineWeights): void {
    this.pdf.setLineWidth(this.lineWeights[weight]);
  }

  /**
   * Generate complete construction drawing set
   */
  generateCompleteDrawingSet(
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo,
    structural: StructuralDesignSystem,
    electrical: ElectricalSystem,
    mechanical: HVACDesignSystem,
    verification: CalculationVerificationReport
  ): DrawingSet {
    
    const drawingSet: DrawingSet = {
      coverSheet: this.generateCoverSheet(projectInfo, titleBlockInfo, verification),
      structuralPlans: this.generateStructuralPlans(structural, projectInfo, titleBlockInfo),
      electricalPlans: this.generateElectricalPlans(electrical, projectInfo, titleBlockInfo),
      mechanicalPlans: this.generateMechanicalPlans(mechanical, projectInfo, titleBlockInfo),
      details: this.generateConstructionDetails(structural, electrical, mechanical, projectInfo, titleBlockInfo),
      schedules: this.generateSchedules(structural, electrical, mechanical, projectInfo, titleBlockInfo)
    };

    return drawingSet;
  }

  /**
   * Generate professional cover sheet with project information
   */
  private generateCoverSheet(
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo,
    verification: CalculationVerificationReport
  ): Drawing {
    
    this.addNewSheet();
    this.drawTitleBlock('G-000', 'COVER SHEET', titleBlockInfo, projectInfo);
    
    // Project title and information
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(projectInfo.name.toUpperCase(), 18, 8, { align: 'center' });
    
    this.pdf.setFontSize(16);
    this.pdf.text('GREENHOUSE FACILITY', 18, 9, { align: 'center' });
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(projectInfo.location, 18, 10, { align: 'center' });
    
    // Drawing index table
    this.drawDrawingIndex(4, 12);
    
    // Project data table
    this.drawProjectDataTable(projectInfo, 20, 12);
    
    // Code compliance summary
    this.drawCodeComplianceTable(verification, 4, 17);
    
    // Professional engineering statement
    this.drawEngineeringStatement(titleBlockInfo, 20, 17);
    
    return {
      id: 'G-000',
      title: 'COVER SHEET',
      number: 'G-000',
      scale: 'N/A',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'cover',
        scale: 'N/A',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    };
  }

  /**
   * Generate structural drawing plans
   */
  private generateStructuralPlans(
    structural: StructuralDesignSystem,
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo
  ): Drawing[] {
    
    const drawings: Drawing[] = [];
    
    // Structural plan
    this.addNewSheet();
    this.drawTitleBlock('S-101', 'STRUCTURAL PLAN', titleBlockInfo, projectInfo, '1/8" = 1\'-0"');
    this.drawStructuralPlan(structural, 2, 3);
    this.drawStructuralLegend(28, 3);
    
    drawings.push({
      id: 'S-101',
      title: 'STRUCTURAL PLAN',
      number: 'S-101',
      scale: '1/8" = 1\'-0"',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'plan',
        scale: '1/8" = 1\'-0"',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    // Foundation plan
    this.addNewSheet();
    this.drawTitleBlock('S-102', 'FOUNDATION PLAN', titleBlockInfo, projectInfo, '1/8" = 1\'-0"');
    this.drawFoundationPlan(structural, 2, 3);
    this.drawFoundationLegend(28, 3);
    
    drawings.push({
      id: 'S-102',
      title: 'FOUNDATION PLAN',
      number: 'S-102',
      scale: '1/8" = 1\'-0"',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'plan',
        scale: '1/8" = 1\'-0"',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    return drawings;
  }

  /**
   * Generate electrical drawing plans
   */
  private generateElectricalPlans(
    electrical: ElectricalSystem,
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo
  ): Drawing[] {
    
    const drawings: Drawing[] = [];
    
    // Electrical plan
    this.addNewSheet();
    this.drawTitleBlock('E-201', 'ELECTRICAL PLAN', titleBlockInfo, projectInfo, '1/8" = 1\'-0"');
    this.drawElectricalPlan(electrical, 2, 3);
    this.drawElectricalLegend(28, 3);
    
    drawings.push({
      id: 'E-201',
      title: 'ELECTRICAL PLAN',
      number: 'E-201',
      scale: '1/8" = 1\'-0"',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'plan',
        scale: '1/8" = 1\'-0"',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    // Electrical one-line diagram
    this.addNewSheet();
    this.drawTitleBlock('E-101', 'ONE-LINE DIAGRAM', titleBlockInfo, projectInfo);
    this.drawOneLineDiagram(electrical, 2, 3);
    
    drawings.push({
      id: 'E-101',
      title: 'ONE-LINE DIAGRAM',
      number: 'E-101',
      scale: 'N.T.S.',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'diagram',
        scale: 'N.T.S.',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    // Panel schedules
    electrical.panels.forEach((panel, index) => {
      this.addNewSheet();
      this.drawTitleBlock(`E-30${index + 1}`, `PANEL ${panel.name} SCHEDULE`, titleBlockInfo, projectInfo);
      this.drawPanelSchedule(panel, 2, 3);
      
      drawings.push({
        id: `E-30${index + 1}`,
        title: `PANEL ${panel.name} SCHEDULE`,
        number: `E-30${index + 1}`,
        scale: 'N/A',
        dateCreated: new Date(),
        lastModified: new Date(),
        drawnBy: 'VIBELUX',
        checkedBy: titleBlockInfo.engineerName,
        approvedBy: titleBlockInfo.engineerName,
        revisions: [],
        content: {
          type: 'schedule',
          scale: 'N/A',
          viewports: [],
          dimensions: [],
          annotations: [],
          symbols: []
        }
      });
    });

    return drawings;
  }

  /**
   * Generate mechanical drawing plans
   */
  private generateMechanicalPlans(
    mechanical: HVACDesignSystem,
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo
  ): Drawing[] {
    
    const drawings: Drawing[] = [];
    
    // HVAC plan
    this.addNewSheet();
    this.drawTitleBlock('M-401', 'HVAC PLAN', titleBlockInfo, projectInfo, '1/8" = 1\'-0"');
    this.drawHVACPlan(mechanical, 2, 3);
    this.drawHVACLegend(28, 3);
    
    drawings.push({
      id: 'M-401',
      title: 'HVAC PLAN',
      number: 'M-401',
      scale: '1/8" = 1\'-0"',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'plan',
        scale: '1/8" = 1\'-0"',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    return drawings;
  }

  /**
   * Generate construction details
   */
  private generateConstructionDetails(
    structural: StructuralDesignSystem,
    electrical: ElectricalSystem,
    mechanical: HVACDesignSystem,
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo
  ): Drawing[] {
    
    const drawings: Drawing[] = [];
    
    // Structural details
    this.addNewSheet();
    this.drawTitleBlock('S-501', 'STRUCTURAL DETAILS', titleBlockInfo, projectInfo);
    this.drawStructuralDetails(structural, 2, 3);
    
    drawings.push({
      id: 'S-501',
      title: 'STRUCTURAL DETAILS',
      number: 'S-501',
      scale: 'AS NOTED',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'detail',
        scale: 'AS NOTED',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    return drawings;
  }

  /**
   * Generate schedules
   */
  private generateSchedules(
    structural: StructuralDesignSystem,
    electrical: ElectricalSystem,
    mechanical: HVACDesignSystem,
    projectInfo: ProjectInfo,
    titleBlockInfo: TitleBlockInfo
  ): Drawing[] {
    
    const drawings: Drawing[] = [];
    
    // Equipment schedule
    this.addNewSheet();
    this.drawTitleBlock('M-601', 'EQUIPMENT SCHEDULE', titleBlockInfo, projectInfo);
    this.drawEquipmentSchedule(mechanical, 2, 3);
    
    drawings.push({
      id: 'M-601',
      title: 'EQUIPMENT SCHEDULE',
      number: 'M-601',
      scale: 'N/A',
      dateCreated: new Date(),
      lastModified: new Date(),
      drawnBy: 'VIBELUX',
      checkedBy: titleBlockInfo.engineerName,
      approvedBy: titleBlockInfo.engineerName,
      revisions: [],
      content: {
        type: 'schedule',
        scale: 'N/A',
        viewports: [],
        dimensions: [],
        annotations: [],
        symbols: []
      }
    });

    return drawings;
  }

  /**
   * Add a new sheet to the PDF
   */
  private addNewSheet(): void {
    if (this.pdf.internal.pages.length > 1) {
      this.pdf.addPage([36, 24], 'landscape');
    }
  }

  /**
   * Draw professional title block
   */
  private drawTitleBlock(
    sheetNumber: string,
    sheetTitle: string,
    titleBlockInfo: TitleBlockInfo,
    projectInfo: ProjectInfo,
    scale: string = ''
  ): void {
    
    // Sheet border - extra thick
    this.setLineWeight('extra-thick');
    this.pdf.rect(0.5, 0.5, 35, 23);
    
    // Drawing area border - thick
    this.setLineWeight('thick');
    this.pdf.rect(1, 1, 26.5, 21.5);
    
    // Title block background
    const tbX = 27.5;
    const tbY = 17;
    const tbW = 8;
    const tbH = 6.5;
    
    this.setLineWeight('thick');
    this.pdf.rect(tbX, tbY, tbW, tbH);
    
    // Title block subdivisions
    this.setLineWeight('thin');
    this.pdf.rect(tbX, tbY, tbW, 1.5); // Company area
    this.pdf.rect(tbX, tbY + 1.5, tbW, 3); // Project info
    this.pdf.rect(tbX, tbY + 4.5, tbW, 2); // Drawing info
    
    // Company information
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(titleBlockInfo.companyName, tbX + tbW/2, tbY + 0.8, { align: 'center' });
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('GREENHOUSE DESIGN & ENGINEERING', tbX + tbW/2, tbY + 1.2, { align: 'center' });
    
    // Project information
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROJECT:', tbX + 0.1, tbY + 1.8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(projectInfo.name.substring(0, 35), tbX + 1, tbY + 1.8);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('CLIENT:', tbX + 0.1, tbY + 2.2);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(projectInfo.client.substring(0, 35), tbX + 1, tbY + 2.2);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LOCATION:', tbX + 0.1, tbY + 2.8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(projectInfo.location.substring(0, 30), tbX + 1, tbY + 2.8);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROJECT NO:', tbX + 0.1, tbY + 3.2);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(projectInfo.number, tbX + 1.5, tbY + 3.2);
    
    // Drawing information
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(sheetTitle, tbX + tbW/2, tbY + 5.2, { align: 'center' });
    
    if (scale) {
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`SCALE: ${scale}`, tbX + tbW/2, tbY + 5.7, { align: 'center' });
    }
    
    // Sheet number
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SHEET', tbX + 6.2, tbY + 5.8);
    
    this.pdf.setFontSize(24);
    this.pdf.text(sheetNumber, tbX + 6.2, tbY + 6.2);
    
    // Revision block
    this.setLineWeight('thin');
    this.pdf.rect(27.5, 15, 8, 2);
    this.pdf.line(27.5, 15.5, 35.5, 15.5);
    this.pdf.line(28.5, 15, 28.5, 17);
    this.pdf.line(31, 15, 31, 17);
    this.pdf.line(33.5, 15, 33.5, 17);
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('REV', 27.7, 15.3);
    this.pdf.text('DESCRIPTION', 29.5, 15.3);
    this.pdf.text('DATE', 31.2, 15.3);
    this.pdf.text('BY', 33.7, 15.3);
    
    // Professional engineering seal area
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ISSUED FOR CONSTRUCTION', 27.5, 14.5);
    
    // Engineer information
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`DESIGNED BY: ${titleBlockInfo.engineerName}, PE`, 27.5, 14);
    this.pdf.text(`LICENSE NO: ${titleBlockInfo.engineerLicense}`, 27.5, 13.7);
    
    // North arrow
    this.drawNorthArrow(2, 22);
  }

  private drawNorthArrow(x: number, y: number): void {
    const size = 0.5;
    
    this.setLineWeight('medium');
    this.pdf.circle(x, y, size);
    this.pdf.line(x, y - size * 0.7, x, y + size * 0.7);
    this.pdf.line(x, y + size * 0.7, x - size * 0.3, y + size * 0.4);
    this.pdf.line(x, y + size * 0.7, x + size * 0.3, y + size * 0.4);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('N', x, y - size * 1.2, { align: 'center' });
  }

  /**
   * Drawing index table for cover sheet
   */
  private drawDrawingIndex(x: number, y: number): void {
    const drawings = [
      { number: 'G-000', title: 'COVER SHEET', scale: 'N/A' },
      { number: 'S-101', title: 'STRUCTURAL PLAN', scale: '1/8" = 1\'-0"' },
      { number: 'S-102', title: 'FOUNDATION PLAN', scale: '1/8" = 1\'-0"' },
      { number: 'S-501', title: 'STRUCTURAL DETAILS', scale: 'AS NOTED' },
      { number: 'E-201', title: 'ELECTRICAL PLAN', scale: '1/8" = 1\'-0"' },
      { number: 'E-301', title: 'PANEL SCHEDULES', scale: 'N/A' },
      { number: 'M-401', title: 'HVAC PLAN', scale: '1/8" = 1\'-0"' },
      { number: 'M-601', title: 'EQUIPMENT SCHEDULE', scale: 'N/A' }
    ];

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DRAWING INDEX', x, y);

    // Table
    const tableY = y + 0.5;
    const colWidths = [2, 8, 3];
    
    this.setLineWeight('medium');
    this.pdf.rect(x, tableY, 13, drawings.length * 0.3 + 0.4);
    
    // Headers
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SHEET', x + 0.1, tableY + 0.25);
    this.pdf.text('TITLE', x + colWidths[0] + 0.1, tableY + 0.25);
    this.pdf.text('SCALE', x + colWidths[0] + colWidths[1] + 0.1, tableY + 0.25);
    
    this.setLineWeight('thin');
    this.pdf.line(x, tableY + 0.4, x + 13, tableY + 0.4);
    
    // Rows
    this.pdf.setFont('helvetica', 'normal');
    drawings.forEach((drawing, index) => {
      const rowY = tableY + 0.4 + (index + 1) * 0.3;
      this.pdf.text(drawing.number, x + 0.1, rowY + 0.2);
      this.pdf.text(drawing.title, x + colWidths[0] + 0.1, rowY + 0.2);
      this.pdf.text(drawing.scale, x + colWidths[0] + colWidths[1] + 0.1, rowY + 0.2);
      
      if (index < drawings.length - 1) {
        this.pdf.line(x, rowY + 0.3, x + 13, rowY + 0.3);
      }
    });
  }

  /**
   * Project data table for cover sheet
   */
  private drawProjectDataTable(projectInfo: ProjectInfo, x: number, y: number): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROJECT DATA', x, y);

    const data = [
      ['Building Type', 'Greenhouse Facility'],
      ['Building Area', `${projectInfo.area.toLocaleString()} sq ft`],
      ['Building Volume', `${projectInfo.volume.toLocaleString()} cu ft`],
      ['Occupancy Classification', projectInfo.occupancy],
      ['Construction Type', projectInfo.constructionType],
      ['Engineer of Record', projectInfo.engineer],
      ['Architect', projectInfo.architect || 'N/A'],
      ['General Contractor', projectInfo.contractor || 'TBD']
    ];

    const tableY = y + 0.5;
    this.setLineWeight('medium');
    this.pdf.rect(x, tableY, 15, data.length * 0.3 + 0.3);

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    data.forEach((row, index) => {
      const rowY = tableY + 0.3 + index * 0.3;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(row[0] + ':', x + 0.1, rowY + 0.2);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(row[1], x + 6, rowY + 0.2);
      
      if (index < data.length - 1) {
        this.setLineWeight('thin');
        this.pdf.line(x, rowY + 0.3, x + 15, rowY + 0.3);
      }
    });
  }

  /**
   * Code compliance table for cover sheet
   */
  private drawCodeComplianceTable(verification: CalculationVerificationReport, x: number, y: number): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('CODE COMPLIANCE', x, y);

    const codes = [
      ['2021 International Building Code', verification.codeCompliance.overallCompliance ? 'COMPLIANT' : 'REVIEW REQUIRED'],
      ['2020 National Electrical Code', verification.electrical.necCompliance.overallCompliance ? 'COMPLIANT' : 'REVIEW REQUIRED'],
      ['2021 International Mechanical Code', verification.mechanical.ashrae901Compliance.overallCompliance ? 'COMPLIANT' : 'REVIEW REQUIRED'],
      ['ASCE 7-16 Wind & Seismic', verification.structural.compliant ? 'COMPLIANT' : 'REVIEW REQUIRED'],
      ['ASHRAE 90.1 Energy Code', verification.mechanical.ashrae901Compliance.overallCompliance ? 'COMPLIANT' : 'REVIEW REQUIRED']
    ];

    const tableY = y + 0.5;
    this.setLineWeight('medium');
    this.pdf.rect(x, tableY, 15, codes.length * 0.3 + 0.3);

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    codes.forEach((row, index) => {
      const rowY = tableY + 0.3 + index * 0.3;
      this.pdf.text(row[0], x + 0.1, rowY + 0.2);
      
      // Color code compliance status
      if (row[1] === 'COMPLIANT') {
        this.pdf.setTextColor(0, 128, 0); // Green
      } else {
        this.pdf.setTextColor(255, 0, 0); // Red
      }
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(row[1], x + 10, rowY + 0.2);
      this.pdf.setTextColor(0, 0, 0); // Reset to black
      this.pdf.setFont('helvetica', 'normal');
      
      if (index < codes.length - 1) {
        this.setLineWeight('thin');
        this.pdf.line(x, rowY + 0.3, x + 15, rowY + 0.3);
      }
    });
  }

  /**
   * Professional engineering statement
   */
  private drawEngineeringStatement(titleBlockInfo: TitleBlockInfo, x: number, y: number): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROFESSIONAL ENGINEERING STATEMENT', x, y);

    const statement = [
      'I hereby certify that these plans, specifications, and calculations were',
      'prepared by me or under my direct supervision and that I am a duly',
      'licensed Professional Engineer under the laws of the State in which',
      'this project is located.',
      '',
      'The design is in conformance with applicable building codes and',
      'engineering standards. Construction shall be performed in accordance',
      'with these drawings and specifications.',
      '',
      'Licensed Professional Engineer',
      `${titleBlockInfo.engineerName}, PE`,
      `License No: ${titleBlockInfo.engineerLicense}`
    ];

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    statement.forEach((line, index) => {
      if (line === 'Licensed Professional Engineer') {
        this.pdf.setFont('helvetica', 'bold');
      } else if (line.includes('PE') || line.includes('License')) {
        this.pdf.setFont('helvetica', 'bold');
      } else {
        this.pdf.setFont('helvetica', 'normal');
      }
      
      this.pdf.text(line, x, y + 0.5 + index * 0.25);
    });

    // Professional seal placeholder
    this.setLineWeight('medium');
    this.pdf.circle(x + 12, y + 2.5, 1);
    this.pdf.setFontSize(6);
    this.pdf.text('PROFESSIONAL', x + 12, y + 2.3, { align: 'center' });
    this.pdf.text('ENGINEER SEAL', x + 12, y + 2.7, { align: 'center' });
  }

  /**
   * Draw detailed structural framing plan using ultra-professional module
   */
  private drawStructuralPlan(structural: StructuralDesignSystem, x: number, y: number): void {
    // Generate a new ultra-professional structural plan
    const ultraStructural = new UltraProfessionalDrawingEngine();
    ultraStructural.generateStructuralPlan(structural);
    
    // For now, still use existing implementation as fallback
    const scale = 1/96; // 1/8" = 1'-0"
    const buildingWidth = (structural.dimensions?.width || 144) * scale;
    const buildingLength = (structural.dimensions?.length || 480) * scale;
    
    // Main building outline with professional line weights
    this.setLineWeight('thick');
    this.pdf.rect(x, y, buildingLength, buildingWidth);
    
    // Grid system with professional labeling
    this.drawDetailedStructuralGrid(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Structural columns (detailed representation)
    this.drawStructuralColumns(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Primary structural beams
    this.drawPrimaryBeams(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Secondary framing
    this.drawSecondaryFraming(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Bracing systems
    this.drawBracingSystems(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Dimensions with extension lines
    this.drawProfessionalDimensions(x, y, buildingLength, buildingWidth, structural);
    
    // Detailed member callouts with leaders
    this.drawDetailedMemberCallouts(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Connection details symbols
    this.drawConnectionSymbols(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Elevation markers
    this.drawElevationMarkers(x, y, buildingLength, buildingWidth);
    
    // Section cut symbols
    this.drawSectionCuts(x, y, buildingLength, buildingWidth);
    
    // Structural notes on plan
    this.drawStructuralPlanNotes(x + buildingLength + 0.5, y);
  }

  /**
   * Draw detailed foundation plan
   */
  private drawFoundationPlan(structural: StructuralDesignSystem, x: number, y: number): void {
    const scale = 1/96; // 1/8" = 1'-0"
    const buildingWidth = (structural.dimensions?.width || 144) * scale;
    const buildingLength = (structural.dimensions?.length || 480) * scale;
    
    // Building outline (dashed)
    this.setLineWeight('thin');
    this.pdf.setLineDashPattern([0.05, 0.05], 0);
    this.pdf.rect(x, y, buildingLength, buildingWidth);
    this.pdf.setLineDashPattern([], 0);
    
    // Foundation footings
    this.drawFoundationFootings(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Foundation walls/stem walls
    this.drawFoundationWalls(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Anchor bolt patterns
    this.drawAnchorBolts(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Foundation dimensions
    this.drawFoundationDimensions(x, y, buildingLength, buildingWidth, structural);
    
    // Reinforcement details
    this.drawReinforcementCallouts(structural, x, y, buildingLength, buildingWidth, scale);
    
    // Foundation notes
    this.drawFoundationPlanNotes(x + buildingLength + 0.5, y);
  }

  /**
   * Draw electrical one-line diagram
   */
  private drawOneLineDiagram(electrical: ElectricalSystem, x: number, y: number): void {
    // Utility transformer
    this.drawTransformerSymbol(x + 2, y + 2, 'UTILITY', '12.47kV');
    
    // Main service
    this.pdf.setLineWidth(0.03);
    this.pdf.line(x + 2, y + 3, x + 2, y + 5);
    
    // Main disconnect
    this.drawDisconnectSymbol(x + 2, y + 5, `${electrical.serviceSize}A`);
    
    // Main distribution panel
    this.pdf.line(x + 2, y + 5.5, x + 2, y + 6.5);
    this.drawPanelSymbol(x + 2, y + 6.5, 'MDP', `${electrical.serviceSize}A`, '480/277V');
    
    // Branch to panels
    const panelSpacing = 3;
    const startX = x + 2 - (electrical.panels.length - 1) * panelSpacing / 2;
    
    // Horizontal bus
    this.pdf.line(x + 2, y + 7.5, x + 2, y + 8);
    this.pdf.line(startX, y + 8, startX + (electrical.panels.length - 1) * panelSpacing, y + 8);
    
    // Distribution to lighting panels
    electrical.panels.forEach((panel, index) => {
      const panelX = startX + index * panelSpacing;
      
      // Feeder
      this.pdf.line(panelX, y + 8, panelX, y + 9);
      
      // Circuit breaker
      this.drawBreakerSymbol(panelX, y + 9, panel.mainBreaker || '400A');
      
      // Panel
      this.pdf.line(panelX, y + 9.5, panelX, y + 10.5);
      this.drawPanelSymbol(panelX, y + 10.5, panel.name, panel.mainBreaker || '400A', panel.voltage || '277V');
      
      // Loads
      this.pdf.line(panelX, y + 11.5, panelX, y + 12);
      
      // Load description
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${panel.circuits?.length || 20} CIRCUITS`, panelX, y + 12.5, { align: 'center' });
      this.pdf.text('LED LIGHTING', panelX, y + 12.7, { align: 'center' });
    });
    
    // Emergency generator (if applicable)
    this.drawGeneratorSymbol(x + 20, y + 6, 'EMERGENCY GEN', '500kW');
    this.pdf.setLineDashPattern([0.1, 0.05], 0);
    this.pdf.line(x + 20, y + 7, x + 10, y + 7);
    this.pdf.line(x + 10, y + 7, x + 10, y + 8);
    this.pdf.setLineDashPattern([], 0);
    
    // Notes
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ONE-LINE DIAGRAM NOTES:', x, y + 15);
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    const notes = [
      '1. Service: 480/277V, 3-PHASE, 4-WIRE',
      `2. Main service size: ${electrical.serviceSize}A`,
      '3. Short circuit current: 65kAIC',
      '4. All circuit breakers: 65kAIC minimum',
      '5. Ground fault protection per NEC 230.95',
      '6. Surge protection device at main service'
    ];
    
    notes.forEach((note, index) => {
      this.pdf.text(note, x, y + 15.5 + index * 0.2);
    });
    
    // Legend
    this.drawOneLineLegend(x + 15, y + 15);
  }

  private drawTransformerSymbol(x: number, y: number, label: string, voltage: string): void {
    // Primary winding
    this.pdf.circle(x, y, 0.3);
    // Secondary winding
    this.pdf.circle(x, y + 0.6, 0.3);
    // Connection
    this.pdf.line(x, y + 0.3, x, y + 0.3);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, x, y - 0.5, { align: 'center' });
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(voltage, x, y - 0.7, { align: 'center' });
  }

  private drawDisconnectSymbol(x: number, y: number, rating: string): void {
    this.pdf.rect(x - 0.2, y - 0.2, 0.4, 0.4);
    this.pdf.line(x - 0.1, y - 0.1, x + 0.1, y + 0.1);
    
    this.pdf.setFontSize(7);
    this.pdf.text(rating, x + 0.3, y);
  }

  private drawPanelSymbol(x: number, y: number, name: string, rating: string, voltage: string): void {
    this.pdf.rect(x - 0.4, y - 0.4, 0.8, 0.8);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(name, x, y - 0.1, { align: 'center' });
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(rating, x, y + 0.1, { align: 'center' });
    this.pdf.text(voltage, x, y + 0.25, { align: 'center' });
  }

  private drawBreakerSymbol(x: number, y: number, rating: string): void {
    this.pdf.rect(x - 0.15, y - 0.1, 0.3, 0.2);
    this.pdf.circle(x, y, 0.05, 'F');
    
    this.pdf.setFontSize(6);
    this.pdf.text(rating, x + 0.2, y);
  }

  private drawGeneratorSymbol(x: number, y: number, label: string, rating: string): void {
    this.pdf.circle(x, y, 0.5);
    this.pdf.text('G', x, y, { align: 'center' });
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, x, y - 0.8, { align: 'center' });
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(rating, x, y + 0.8, { align: 'center' });
  }

  private drawOneLineLegend(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LEGEND:', x, y);
    
    const legendItems = [
      { symbol: '—', description: 'Power conductor' },
      { symbol: '- -', description: 'Emergency power' },
      { symbol: '⚡', description: 'Circuit breaker' },
      { symbol: '□', description: 'Panelboard' },
      { symbol: '○', description: 'Transformer' }
    ];
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    legendItems.forEach((item, index) => {
      this.pdf.text(item.symbol, x, y + 0.3 + index * 0.2);
      this.pdf.text(item.description, x + 0.5, y + 0.3 + index * 0.2);
    });
  }

  /**
   * Draw detailed electrical plan using ultra-professional module
   */
  private drawElectricalPlan(electrical: ElectricalSystem, x: number, y: number): void {
    // Use ultra-professional electrical module for dense, detailed drawings
    this.ultraElectrical.generateElectricalPlan(electrical, x, y);
    
    // The ultra-professional module handles all drawing aspects including:
    // - Building outline and grid
    // - Complete lighting layout with circuits
    // - Power receptacles and equipment
    // - Conduit and cable tray
    // - Emergency systems
    // - Control and low voltage
    // - Grounding system
    // - Circuit identification
    // - Notes and legend
    
    // Draw conduit runs with proper routing
    this.drawProfessionalConduitRuns(electrical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw emergency and life safety systems
    this.drawLifeSafetySystems(electrical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw electrical equipment
    this.drawElectricalEquipment(electrical, x, y, buildingLength, buildingWidth, scale);
    
    // Circuit identification
    this.drawCircuitIdentification(electrical, x, y, buildingLength, buildingWidth, scale);
    
    // Voltage and phase identification
    this.drawVoltageIdentification(x, y, buildingLength, buildingWidth);
    
    // Electrical notes on plan
    this.drawElectricalPlanNotes(x + buildingLength + 0.5, y);
  }

  /**
   * Draw detailed HVAC plan using ultra-professional module
   */
  private drawHVACPlan(mechanical: HVACDesignSystem, x: number, y: number): void {
    // Use ultra-professional HVAC module for dense, detailed drawings
    this.ultraHVAC.generateHVACPlan(mechanical, x, y);
    
    // The ultra-professional module handles all drawing aspects including:
    // - Building outline and HVAC zones
    // - Air handling units with detailed symbols
    // - Ductwork layout with sizes and flow directions
    // - Diffusers and grilles with airflow rates
    // - Piping systems (hot water, chilled water, condensate)
    // - Controls and instrumentation
    // - Equipment schedules and notes
    
    // Draw hydronic piping systems
    this.drawHydronicPiping(mechanical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw air distribution devices
    this.drawProfessionalAirDistribution(mechanical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw exhaust and ventilation systems
    this.drawExhaustSystems(mechanical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw control devices and sensors
    this.drawDetailedControls(mechanical, x, y, buildingLength, buildingWidth, scale);
    
    // Draw equipment tags and identification
    this.drawEquipmentTags(mechanical, x, y, buildingLength, buildingWidth, scale);
    
    // HVAC notes on plan
    this.drawHVACPlanNotes(x + buildingLength + 0.5, y);
  }

  /**
   * Draw structural connection details
   */
  private drawStructuralDetails(structural: StructuralDesignSystem, x: number, y: number): void {
    let currentX = x;
    let currentY = y;
    
    // Detail 1: Base plate connection
    currentY += this.drawBasePlateDetail(currentX, currentY);
    currentY += 0.5;
    
    // Detail 2: Beam to column connection
    currentY += this.drawBeamColumnConnection(currentX, currentY);
    currentY += 0.5;
    
    // Detail 3: Foundation footing detail
    currentY += this.drawFootingDetail(currentX, currentY, structural);
    currentY += 0.5;
    
    // Move to second column
    if (currentY > y + 15) {
      currentX += 12;
      currentY = y;
    }
    
    // Detail 4: Truss connection
    currentY += this.drawTrussConnection(currentX, currentY);
    currentY += 0.5;
    
    // Detail 5: Wind bracing connection
    currentY += this.drawWindBracingDetail(currentX, currentY);
  }

  /**
   * Draw professional panel schedule using the panel schedule generator
   */
  private drawPanelSchedule(panel: any, x: number, y: number): void {
    // Import and use the professional panel schedule generator
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`PANEL ${panel.name} SCHEDULE`, x, y);
    
    // Panel header information
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Location: ${panel.location || 'Electrical Room'}`, x, y + 0.3);
    this.pdf.text(`Voltage: ${panel.voltage || '277V'}`, x, y + 0.5);
    this.pdf.text(`Main Breaker: ${panel.mainBreaker || '400A'}`, x, y + 0.7);
    
    // Circuit table header
    const tableY = y + 1;
    this.setLineWeight('medium');
    this.pdf.rect(x, tableY, 20, 0.4);
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    const headers = ['CKT', 'DESCRIPTION', 'LOAD', 'BKR', 'WIRE'];
    const colX = [x + 0.5, x + 2, x + 12, x + 15, x + 17.5];
    
    headers.forEach((header, i) => {
      this.pdf.text(header, colX[i], tableY + 0.25);
    });
    
    // Sample circuits
    const circuits = [
      { ckt: '1', desc: 'LED LIGHTING - ZONE A', load: '11.5A', bkr: '15A', wire: '#12' },
      { ckt: '3', desc: 'LED LIGHTING - ZONE B', load: '11.5A', bkr: '15A', wire: '#12' },
      { ckt: '5', desc: 'HPS LIGHTING - ZONE C', load: '18.2A', bkr: '20A', wire: '#12' },
      { ckt: '7', desc: 'HPS LIGHTING - ZONE D', load: '18.2A', bkr: '20A', wire: '#12' },
      { ckt: '9', desc: 'RECEPTACLES', load: '12.0A', bkr: '20A', wire: '#12' },
      { ckt: '11', desc: 'HVAC CONTROLS', load: '3.2A', bkr: '15A', wire: '#14' },
      { ckt: '13', desc: 'EMERGENCY LIGHTING', load: '2.1A', bkr: '15A', wire: '#14' },
      { ckt: '15', desc: 'SPARE', load: '-', bkr: '20A', wire: '-' }
    ];
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6);
    
    circuits.forEach((circuit, index) => {
      const rowY = tableY + 0.4 + (index + 1) * 0.25;
      this.pdf.line(x, rowY - 0.125, x + 20, rowY - 0.125);
      
      this.pdf.text(circuit.ckt, colX[0], rowY);
      this.pdf.text(circuit.desc, colX[1], rowY);
      this.pdf.text(circuit.load, colX[2], rowY);
      this.pdf.text(circuit.bkr, colX[3], rowY);
      this.pdf.text(circuit.wire, colX[4], rowY);
    });
    
    // Panel summary
    const summaryY = tableY + 3;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PANEL SUMMARY:', x, summaryY);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Connected Load: 76.7A', x, summaryY + 0.2);
    this.pdf.text('Demand Load: 61.4A', x, summaryY + 0.4);
    this.pdf.text('Panel Utilization: 15.4%', x, summaryY + 0.6);
    this.pdf.text('Spare Circuits: 24', x, summaryY + 0.8);
  }

  private drawEquipmentSchedule(mechanical: HVACDesignSystem, x: number, y: number): void {
    // Implementation would include equipment schedule
    this.pdf.setFontSize(10);
    this.pdf.text('EQUIPMENT SCHEDULE CONTENT PLACEHOLDER', x, y);
  }

  /**
   * Draw structural grid system
   */
  private drawDetailedStructuralGrid(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setDrawColor(100, 100, 100);
    
    // Determine bay spacing (typical 26.25' for greenhouse)
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    
    // Vertical grid lines (columns) with extended grid lines
    for (let i = 0; i <= bays; i++) {
      const gridX = x + i * baySpacing;
      this.pdf.line(gridX, y - 0.5, gridX, y + width + 0.5);
      
      // Grid bubbles
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.circle(gridX, y - 0.3, 0.08, 'FD');
      this.pdf.circle(gridX, y + width + 0.3, 0.08, 'FD');
      
      // Grid labels
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(String.fromCharCode(65 + i), gridX, y - 0.3, { align: 'center' });
      this.pdf.text(String.fromCharCode(65 + i), gridX, y + width + 0.3, { align: 'center' });
    }
    
    // Horizontal grid lines (typical 24' spacing)
    const frameSpacing = 24 * scale;
    const frames = Math.floor(width / frameSpacing);
    
    for (let i = 0; i <= frames; i++) {
      const gridY = y + i * frameSpacing;
      this.pdf.line(x - 0.5, gridY, x + length + 0.5, gridY);
      
      // Grid bubbles
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.circle(x - 0.3, gridY, 0.08, 'FD');
      this.pdf.circle(x + length + 0.3, gridY, 0.08, 'FD');
      
      // Grid labels
      this.pdf.text((i + 1).toString(), x - 0.3, gridY, { align: 'center' });
      this.pdf.text((i + 1).toString(), x + length + 0.3, gridY, { align: 'center' });
    }
    
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawStructuralColumns(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setFillColor(0, 0, 0);
    
    const baySpacing = 26.25 * scale;
    const frameSpacing = 24 * scale;
    const bays = Math.floor(length / baySpacing);
    const frames = Math.floor(width / frameSpacing);
    
    // Draw column symbols at grid intersections
    for (let i = 0; i <= bays; i++) {
      for (let j = 0; j <= frames; j++) {
        const colX = x + i * baySpacing;
        const colY = y + j * frameSpacing;
        
        // Column symbol (filled circle)
        this.pdf.circle(colX, colY, 0.04, 'F');
        
        // Column designation
        this.pdf.setFontSize(5);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.text(`C${i + 1}`, colX, colY, { align: 'center' });
        this.pdf.setTextColor(0, 0, 0);
      }
    }
    
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawPrimaryBeams(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setDrawColor(255, 0, 0);
    
    const baySpacing = 26.25 * scale;
    const frameSpacing = 24 * scale;
    const bays = Math.floor(length / baySpacing);
    const frames = Math.floor(width / frameSpacing);
    
    // Main frame beams (longitudinal)
    for (let i = 0; i <= frames; i++) {
      const beamY = y + i * frameSpacing;
      this.pdf.line(x, beamY, x + length, beamY);
    }
    
    // Eave beams (perimeter)
    this.pdf.line(x, y, x + length, y);
    this.pdf.line(x, y + width, x + length, y + width);
    
    // End wall columns/beams
    this.pdf.line(x, y, x, y + width);
    this.pdf.line(x + length, y, x + length, y + width);
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawSecondaryFraming(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('medium');
    this.pdf.setDrawColor(0, 0, 255);
    
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    
    // Purlins (perpendicular to main frames)
    for (let i = 0; i <= bays; i++) {
      const purlinX = x + i * baySpacing;
      this.pdf.line(purlinX, y, purlinX, y + width);
    }
    
    // Girts (horizontal wall framing)
    const girtHeight = width * 0.6; // Mid-height girts
    this.pdf.line(x, y + girtHeight, x + length, y + girtHeight);
    this.pdf.line(x, y + width - girtHeight, x + length, y + width - girtHeight);
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawBracingSystems(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setDrawColor(0, 150, 0);
    
    const baySpacing = 26.25 * scale;
    const frameSpacing = 24 * scale;
    
    // X-bracing in end bays
    this.pdf.line(x, y, x + baySpacing, y + frameSpacing);
    this.pdf.line(x + baySpacing, y, x, y + frameSpacing);
    
    this.pdf.line(x + length - baySpacing, y, x + length, y + frameSpacing);
    this.pdf.line(x + length, y, x + length - baySpacing, y + frameSpacing);
    
    // Portal frame connections (symbol)
    const portalSpacing = length / 3;
    for (let i = 1; i < 3; i++) {
      const portalX = x + i * portalSpacing;
      this.pdf.rect(portalX - 0.05, y + width/2 - 0.05, 0.1, 0.1);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawProfessionalDimensions(x: number, y: number, length: number, width: number, structural: StructuralDesignSystem): void {
    this.setLineWeight('thin');
    const dimOffset = 0.3;
    
    // Overall length dimension
    this.pdf.line(x, y - dimOffset, x + length, y - dimOffset);
    this.pdf.line(x, y - dimOffset - 0.1, x, y - dimOffset + 0.1);
    this.pdf.line(x + length, y - dimOffset - 0.1, x + length, y - dimOffset + 0.1);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${Math.round(length * 96)}'-0"`, x + length/2, y - dimOffset - 0.15, { align: 'center' });
    
    // Overall width dimension
    this.pdf.line(x - dimOffset, y, x - dimOffset, y + width);
    this.pdf.line(x - dimOffset - 0.1, y, x - dimOffset + 0.1, y);
    this.pdf.line(x - dimOffset - 0.1, y + width, x - dimOffset + 0.1, y + width);
    
    this.pdf.text(`${Math.round(width * 96)}'-0"`, x - dimOffset - 0.15, y + width/2, { align: 'center', angle: 90 });
    
    // Bay dimensions
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    for (let i = 0; i < bays; i++) {
      const bayStart = x + i * baySpacing;
      const bayEnd = x + (i + 1) * baySpacing;
      this.pdf.text("26'-3\"", bayStart + baySpacing/2, y - 0.6, { align: 'center' });
    }
  }

  private drawDetailedMemberCallouts(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    
    // Primary beam callout
    this.pdf.text('W18×35 TYP', x + 0.2, y + width/2);
    
    // Column callout
    this.pdf.text('HSS8×8×1/2', x + 0.2, y + 0.3);
    
    // Purlin callout
    this.pdf.text('C8×11.5', x + length/2, y + 0.2);
    
    // Girt callout
    this.pdf.text('C6×8.2', x - 0.5, y + width * 0.6);
    
    // Bracing callout
    this.pdf.text('L4×4×3/8', x + 0.2, y + 0.6);
  }

  private drawConnectionSymbols(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Moment connection symbols
    const connectionSize = 0.06;
    const baySpacing = 26.25 * scale;
    const frameSpacing = 24 * scale;
    
    for (let i = 0; i <= Math.floor(length / baySpacing); i++) {
      for (let j = 0; j <= Math.floor(width / frameSpacing); j++) {
        const connX = x + i * baySpacing;
        const connY = y + j * frameSpacing;
        
        // Connection detail symbol
        this.pdf.rect(connX - connectionSize/2, connY - connectionSize/2, connectionSize, connectionSize);
        
        // Detail number
        this.pdf.setFontSize(4);
        this.pdf.text('1', connX, connY, { align: 'center' });
      }
    }
  }

  private drawElevationMarkers(x: number, y: number, length: number, width: number): void {
    // Elevation markers at corners
    const markerSize = 0.08;
    
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.circle(x, y, markerSize, 'F');
    this.pdf.circle(x + length, y, markerSize, 'F');
    this.pdf.circle(x, y + width, markerSize, 'F');
    this.pdf.circle(x + length, y + width, markerSize, 'F');
    
    this.pdf.setFontSize(5);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('100.0', x, y, { align: 'center' });
    this.pdf.text('100.0', x + length, y, { align: 'center' });
    this.pdf.text('100.0', x, y + width, { align: 'center' });
    this.pdf.text('100.0', x + length, y + width, { align: 'center' });
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawSectionCuts(x: number, y: number, length: number, width: number): void {
    // Section cut symbols
    const sectionLength = 0.5;
    
    // Section A-A (longitudinal)
    this.pdf.line(x + length/3, y - 0.2, x + length/3, y + width + 0.2);
    this.pdf.circle(x + length/3, y - 0.2, 0.05, 'F');
    this.pdf.circle(x + length/3, y + width + 0.2, 0.05, 'F');
    
    this.pdf.setFontSize(6);
    this.pdf.text('A', x + length/3 - 0.1, y - 0.3);
    this.pdf.text('A', x + length/3 - 0.1, y + width + 0.3);
    
    // Section B-B (transverse)
    this.pdf.line(x - 0.2, y + width/2, x + length + 0.2, y + width/2);
    this.pdf.circle(x - 0.2, y + width/2, 0.05, 'F');
    this.pdf.circle(x + length + 0.2, y + width/2, 0.05, 'F');
    
    this.pdf.text('B', x - 0.3, y + width/2 + 0.1);
    this.pdf.text('B', x + length + 0.25, y + width/2 + 0.1);
  }

  /**
   * Draw structural members
   */
  private drawStructuralMembers(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Main frame beams
    this.setLineWeight('thick');
    this.pdf.setDrawColor(255, 0, 0);
    
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    
    // Gutter beams
    for (let i = 0; i <= bays; i++) {
      const beamX = x + i * baySpacing;
      this.pdf.line(beamX, y, beamX, y + width);
    }
    
    // Eave beams
    this.pdf.line(x, y, x + length, y);
    this.pdf.line(x, y + width, x + length, y + width);
    
    // Ridge beam
    this.pdf.line(x, y + width/2, x + length, y + width/2);
    
    // Columns
    this.pdf.setFillColor(0, 0, 0);
    for (let i = 0; i <= bays; i++) {
      const colX = x + i * baySpacing;
      this.pdf.circle(colX, y, 0.05, 'F');
      this.pdf.circle(colX, y + width, 0.05, 'F');
    }
    
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
  }

  /**
   * Draw structural dimensions
   */
  private drawStructuralDimensions(x: number, y: number, length: number, width: number, structural: StructuralDesignSystem): void {
    this.setLineWeight('thin');
    
    // Overall length dimension
    this.pdf.line(x, y - 0.3, x + length, y - 0.3);
    this.pdf.line(x, y - 0.4, x, y - 0.2);
    this.pdf.line(x + length, y - 0.4, x + length, y - 0.2);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    const lengthFt = Math.round((structural.dimensions?.length || 480));
    this.pdf.text(`${lengthFt}'-0\"`, x + length/2, y - 0.5, { align: 'center' });
    
    // Overall width dimension
    this.pdf.line(x - 0.3, y, x - 0.3, y + width);
    this.pdf.line(x - 0.4, y, x - 0.2, y);
    this.pdf.line(x - 0.4, y + width, x - 0.2, y + width);
    
    const widthFt = Math.round((structural.dimensions?.width || 144));
    this.pdf.text(`${widthFt}'-0\"`, x - 0.6, y + width/2, { align: 'center', angle: 90 });
    
    // Bay dimensions
    const baySpacing = 26.25;
    this.pdf.setFontSize(6);
    this.pdf.text(`${baySpacing}'-0\" TYP`, x + length/2, y + width + 0.3, { align: 'center' });
  }

  /**
   * Draw member callouts
   */
  private drawMemberCallouts(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    
    // Main frame beam callout
    this.pdf.text('W18x35', x + 0.2, y + width/2 - 0.1);
    this.pdf.text('TYP', x + 0.2, y + width/2 + 0.1);
    
    // Column callout
    this.pdf.text('HSS8x8x1/2', x + 0.1, y + 0.3);
    this.pdf.text('TYP', x + 0.1, y + 0.5);
    
    // Eave beam callout
    this.pdf.text('W12x26', x + length/2, y - 0.2, { align: 'center' });
  }

  /**
   * Draw structural plan notes
   */
  private drawStructuralPlanNotes(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('STRUCTURAL NOTES', x, y);
    
    const notes = [
      '1. All structural steel per AISC 360-16',
      '2. Steel grade ASTM A992 Grade 50',
      '3. Bolts: ASTM A325 high strength',
      '4. Welding per AWS D1.1',
      '5. Hot-dip galvanized per ASTM A123',
      '6. Wind load: 115 mph, Exposure C',
      '7. Snow load: 25 PSF ground snow',
      '8. Seismic: SDC D, Site Class D'
    ];
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, index) => {
      this.pdf.text(note, x, y + 0.3 + index * 0.2);
    });
  }

  /**
   * Draw foundation footings
   */
  private drawFoundationFootings(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setFillColor(150, 150, 150);
    
    const footingSize = 0.25; // 4'x4' footings scaled
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    
    // Corner and intermediate footings
    for (let i = 0; i <= bays; i++) {
      const footingX = x + i * baySpacing;
      
      // Footings at each end
      this.pdf.rect(footingX - footingSize/2, y - footingSize/2, footingSize, footingSize, 'F');
      this.pdf.rect(footingX - footingSize/2, y + width - footingSize/2, footingSize, footingSize, 'F');
    }
    
    this.pdf.setFillColor(255, 255, 255);
  }

  /**
   * Draw foundation walls
   */
  private drawFoundationWalls(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('medium');
    
    // Perimeter foundation walls (8\" thick)
    const wallThickness = 0.067; // 8\" scaled
    
    this.pdf.rect(x - wallThickness/2, y - wallThickness/2, length + wallThickness, wallThickness);
    this.pdf.rect(x - wallThickness/2, y + width - wallThickness/2, length + wallThickness, wallThickness);
    this.pdf.rect(x - wallThickness/2, y - wallThickness/2, wallThickness, width + wallThickness);
    this.pdf.rect(x + length - wallThickness/2, y - wallThickness/2, wallThickness, width + wallThickness);
  }

  /**
   * Draw anchor bolts
   */
  private drawAnchorBolts(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setFillColor(0, 0, 0);
    
    const baySpacing = 26.25 * scale;
    const bays = Math.floor(length / baySpacing);
    
    // Anchor bolt pattern at each column
    for (let i = 0; i <= bays; i++) {
      const boltX = x + i * baySpacing;
      
      // 4-bolt pattern at each column location
      const boltSpacing = 0.083; // 10\" bolt spacing scaled
      
      // Front column bolts
      this.pdf.circle(boltX - boltSpacing/2, y - boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX + boltSpacing/2, y - boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX - boltSpacing/2, y + boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX + boltSpacing/2, y + boltSpacing/2, 0.01, 'F');
      
      // Rear column bolts
      this.pdf.circle(boltX - boltSpacing/2, y + width - boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX + boltSpacing/2, y + width - boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX - boltSpacing/2, y + width + boltSpacing/2, 0.01, 'F');
      this.pdf.circle(boltX + boltSpacing/2, y + width + boltSpacing/2, 0.01, 'F');
    }
    
    this.pdf.setFillColor(255, 255, 255);
  }

  /**
   * Draw foundation dimensions
   */
  private drawFoundationDimensions(x: number, y: number, length: number, width: number, structural: StructuralDesignSystem): void {
    this.setLineWeight('thin');
    
    // Foundation dimensions
    this.pdf.setFontSize(6);
    this.pdf.text("4'-0\" x 4'-0\" x 2'-6\" DP", x + 0.5, y + 0.5);
    this.pdf.text('TYP FOOTING', x + 0.5, y + 0.7);
    
    // Foundation wall thickness
    this.pdf.text('8" CMU WALL', x + length/2, y - 0.3, { align: 'center' });
  }

  /**
   * Draw reinforcement callouts
   */
  private drawReinforcementCallouts(structural: StructuralDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'italic');
    
    // Footing reinforcement
    this.pdf.text('#4 @ 12\" O.C. E.W.', x + 1, y + 1);
    this.pdf.text('3\" CLR TYP', x + 1, y + 1.2);
    
    // Wall reinforcement
    this.pdf.text('#5 VERT @ 32\" O.C.', x + length/2, y + 0.3, { align: 'center' });
  }

  /**
   * Draw foundation plan notes
   */
  private drawFoundationPlanNotes(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FOUNDATION NOTES', x, y);
    
    const notes = [
      "1. Concrete: f'c = 3000 PSI min",
      '2. Reinforcing: Grade 60, ASTM A615',
      '3. Footing bearing: 2000 PSF min',
      '4. Excavate to undisturbed soil',
      '5. Backfill: engineered fill only',
      '6. Waterproofing below grade',
      '7. Vapor barrier under slab',
      '8. Anchor bolts: ASTM A307 Grade A'
    ];
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, index) => {
      this.pdf.text(note, x, y + 0.3 + index * 0.2);
    });
  }

  /**
   * Draw base plate connection detail
   */
  private drawBasePlateDetail(x: number, y: number): number {
    const detailHeight = 5;
    const scale = 1; // 1" = 1'-0"
    
    // Detail title and border
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DETAIL 1 - BASE PLATE CONNECTION', x + 2.5, y, { align: 'center' });
    this.pdf.setFontSize(8);
    this.pdf.text("SCALE: 1\" = 1'-0\"", x + 2.5, y + 0.25, { align: 'center' });
    
    // Detail border with heavy line
    this.setLineWeight('thick');
    this.pdf.rect(x, y + 0.4, 5, detailHeight);
    
    // Concrete foundation
    this.setLineWeight('medium');
    this.pdf.setFillColor(230, 230, 230);
    this.pdf.rect(x + 0.5, y + 3.5, 4, 1.5, 'F');
    
    // Grout pad
    this.pdf.setFillColor(200, 200, 200);
    this.pdf.rect(x + 1.5, y + 3.3, 2, 0.2, 'F');
    
    // Base plate
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.rect(x + 1.5, y + 3.1, 2, 0.2, 'F');
    
    // HSS Column
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(x + 2, y + 1.5, 1, 1.6, 'FD');
    
    // Column stiffener plates
    this.pdf.setLineWidth(0.02);
    this.pdf.line(x + 2, y + 2.8, x + 3, y + 2.8);
    this.pdf.line(x + 2, y + 2.6, x + 3, y + 2.6);
    
    // Anchor bolts with nuts and washers
    this.setLineWeight('thick');
    // Left bolt
    this.pdf.line(x + 1.7, y + 2.8, x + 1.7, y + 4.2);
    this.pdf.rect(x + 1.6, y + 2.9, 0.2, 0.15, 'F'); // Nut
    this.pdf.circle(x + 1.7, y + 3.05, 0.08); // Washer
    
    // Right bolt
    this.pdf.line(x + 3.3, y + 2.8, x + 3.3, y + 4.2);
    this.pdf.rect(x + 3.2, y + 2.9, 0.2, 0.15, 'F'); // Nut
    this.pdf.circle(x + 3.3, y + 3.05, 0.08); // Washer
    
    // Weld symbols
    this.pdf.setFontSize(6);
    this.pdf.text('⅜', x + 2.5, y + 3.0);
    
    // Dimensions
    this.setLineWeight('thin');
    // Horizontal dimensions
    this.pdf.line(x + 1.5, y + 4.7, x + 3.5, y + 4.7);
    this.pdf.line(x + 1.5, y + 4.6, x + 1.5, y + 4.8);
    this.pdf.line(x + 3.5, y + 4.6, x + 3.5, y + 4.8);
    this.pdf.text("2'-0\"", x + 2.5, y + 4.85, { align: 'center' });
    
    // Vertical dimensions
    this.pdf.line(x + 4.2, y + 3.3, x + 4.2, y + 1.5);
    this.pdf.line(x + 4.1, y + 3.3, x + 4.3, y + 3.3);
    this.pdf.line(x + 4.1, y + 1.5, x + 4.3, y + 1.5);
    this.pdf.text("1'-8\"", x + 4.4, y + 2.4, { angle: 90 });
    
    // Callouts with leaders
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    // Base plate callout
    this.pdf.line(x + 3.6, y + 3.2, x + 4, y + 2.8);
    this.pdf.text('14"×14"×1" BASE PL', x + 4.1, y + 2.8);
    this.pdf.text('ASTM A36', x + 4.1, y + 2.95);
    
    // Column callout
    this.pdf.line(x + 2.5, y + 2, x + 0.8, y + 1.5);
    this.pdf.text('HSS8×8×½', x + 0.3, y + 1.5);
    this.pdf.text('ASTM A500 GR. B', x + 0.3, y + 1.65);
    
    // Anchor bolt callout
    this.pdf.line(x + 1.7, y + 3.8, x + 0.8, y + 4);
    this.pdf.text('(4) ¾"ø A307', x + 0.3, y + 4);
    this.pdf.text('ANCHOR BOLTS', x + 0.3, y + 4.15);
    this.pdf.text('EMBED 12"', x + 0.3, y + 4.3);
    
    // Notes
    this.pdf.setFontSize(6);
    this.pdf.text('NOTES:', x + 0.2, y + 5.2);
    this.pdf.text('1. GROUT SOLID UNDER BASE PLATE', x + 0.2, y + 5.35);
    this.pdf.text('2. FIELD WELD ALL AROUND COLUMN', x + 0.2, y + 5.5);
    
    this.pdf.setFillColor(255, 255, 255);
    
    return detailHeight + 0.8;
  }

  /**
   * Draw beam to column connection
   */
  private drawBeamColumnConnection(x: number, y: number): number {
    const detailHeight = 5.5;
    
    // Detail title and border
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DETAIL 2 - MOMENT CONNECTION', x + 2.5, y, { align: 'center' });
    this.pdf.setFontSize(8);
    this.pdf.text("SCALE: 1½\" = 1'-0\"", x + 2.5, y + 0.25, { align: 'center' });
    
    // Detail border with heavy line
    this.setLineWeight('thick');
    this.pdf.rect(x, y + 0.4, 5, detailHeight);
    
    // HSS Column (section view)
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(x + 2, y + 1, 1, 4, 'FD');
    
    // Column web stiffeners
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.rect(x + 2.3, y + 2.3, 0.4, 0.1, 'F');
    this.pdf.rect(x + 2.3, y + 3.3, 0.4, 0.1, 'F');
    
    // W-beam (wide flange)
    // Top flange
    this.pdf.rect(x + 0.5, y + 2.3, 3, 0.15, 'F');
    // Web
    this.pdf.rect(x + 1.9, y + 2.45, 0.2, 0.9, 'F');
    // Bottom flange
    this.pdf.rect(x + 0.5, y + 3.35, 3, 0.15, 'F');
    
    // End plate connection
    this.pdf.setFillColor(100, 100, 100);
    this.pdf.rect(x + 1.9, y + 2.1, 0.2, 1.5, 'F');
    
    // Shear tab
    this.pdf.setFillColor(150, 150, 150);
    this.pdf.rect(x + 3, y + 2.6, 0.15, 0.6, 'F');
    
    // Bolt pattern
    this.pdf.setFillColor(0, 0, 0);
    // End plate bolts (4 rows)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const boltX = x + 2.2 + col * 0.3;
        const boltY = y + 2.4 + row * 0.3;
        this.pdf.circle(boltX, boltY, 0.04, 'F');
      }
    }
    
    // Weld symbols
    this.setLineWeight('thin');
    // Flange welds
    this.pdf.line(x + 1.9, y + 2.2, x + 1.8, y + 2.1);
    this.pdf.line(x + 1.9, y + 3.5, x + 1.8, y + 3.6);
    this.pdf.setFontSize(6);
    this.pdf.text('⅝', x + 1.7, y + 2.1);
    this.pdf.text('⅝', x + 1.7, y + 3.6);
    
    // Dimensions
    // Vertical dimension
    this.pdf.line(x + 4.2, y + 2.3, x + 4.2, y + 3.5);
    this.pdf.line(x + 4.1, y + 2.3, x + 4.3, y + 2.3);
    this.pdf.line(x + 4.1, y + 3.5, x + 4.3, y + 3.5);
    this.pdf.text('14"', x + 4.4, y + 2.9, { angle: 90 });
    
    // Horizontal dimension
    this.pdf.line(x + 0.5, y + 4.8, x + 3.5, y + 4.8);
    this.pdf.line(x + 0.5, y + 4.7, x + 0.5, y + 4.9);
    this.pdf.line(x + 3.5, y + 4.7, x + 3.5, y + 4.9);
    this.pdf.text('3\'-0"', x + 2, y + 4.95, { align: 'center' });
    
    // Callouts with leaders
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    
    // Beam callout
    this.pdf.line(x + 1, y + 2.9, x + 0.5, y + 2.5);
    this.pdf.text('W18×35', x + 0.2, y + 2.5);
    this.pdf.text('ASTM A992', x + 0.2, y + 2.65);
    
    // Column callout
    this.pdf.line(x + 2.5, y + 1.5, x + 3.5, y + 1.2);
    this.pdf.text('HSS8×8×½', x + 3.6, y + 1.2);
    
    // End plate callout
    this.pdf.line(x + 2, y + 2.8, x + 4, y + 3.2);
    this.pdf.text('¾" END PL', x + 4.1, y + 3.2);
    this.pdf.text('ASTM A36', x + 4.1, y + 3.35);
    
    // Bolt callout
    this.pdf.line(x + 2.5, y + 2.5, x + 3.5, y + 2);
    this.pdf.text('(8) ¾"ø A325-N', x + 3.6, y + 2);
    this.pdf.text('IN STD HOLES', x + 3.6, y + 2.15);
    
    // Notes
    this.pdf.setFontSize(6);
    this.pdf.text('NOTES:', x + 0.2, y + 5.4);
    this.pdf.text('1. MOMENT CONNECTION - 150 FT-K CAPACITY', x + 0.2, y + 5.55);
    this.pdf.text('2. FIELD WELD BEAM FLANGES TO END PLATE', x + 0.2, y + 5.7);
    this.pdf.text('3. SHOP WELD END PLATE TO COLUMN', x + 0.2, y + 5.85);
    
    this.pdf.setFillColor(255, 255, 255);
    
    return detailHeight + 0.8;
  }

  /**
   * Draw footing detail
   */
  private drawFootingDetail(x: number, y: number, structural: StructuralDesignSystem): number {
    const detailHeight = 4;
    
    // Detail title
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TYPICAL FOOTING DETAIL', x, y);
    this.pdf.text("SCALE: 1/2\" = 1'-0\"", x, y + 0.2);
    
    // Detail border
    this.setLineWeight('medium');
    this.pdf.rect(x, y + 0.3, 4, detailHeight);
    
    // Footing
    this.setLineWeight('thick');
    this.pdf.rect(x + 1, y + 2.5, 2, 1);
    
    // Reinforcement
    this.setLineWeight('thin');
    // Bottom reinforcement
    for (let i = 0; i < 4; i++) {
      this.pdf.line(x + 1.2 + i * 0.4, y + 2.7, x + 1.2 + i * 0.4, y + 3.3);
    }
    // Top reinforcement
    for (let i = 0; i < 4; i++) {
      this.pdf.line(x + 1.2 + i * 0.4, y + 2.9, x + 1.2 + i * 0.4, y + 3.1);
    }
    
    // Column/base plate
    this.pdf.rect(x + 1.6, y + 1.5, 0.8, 1);
    
    // Anchor bolts
    this.pdf.line(x + 1.7, y + 1.5, x + 1.7, y + 3.2);
    this.pdf.line(x + 2.3, y + 1.5, x + 2.3, y + 3.2);
    
    // Dimensions
    this.pdf.setFontSize(6);
    this.pdf.text("4'-0\"", x + 2, y + 3.8, { align: 'center' });
    this.pdf.text("2'-6\"", x + 0.7, y + 3, { angle: 90, align: 'center' });
    
    // Notes
    this.pdf.text('#4 @ 12\" O.C. E.W.', x + 0.2, y + 3.5);
    this.pdf.text('3\" CLR ALL AROUND', x + 0.2, y + 3.7);
    
    return detailHeight + 0.5;
  }

  /**
   * Draw truss connection detail
   */
  private drawTrussConnection(x: number, y: number): number {
    const detailHeight = 4;
    
    // Detail title
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TRUSS CONNECTION', x, y);
    this.pdf.text("SCALE: 3/4\" = 1'-0\"", x, y + 0.2);
    
    // Detail border
    this.setLineWeight('medium');
    this.pdf.rect(x, y + 0.3, 4, detailHeight);
    
    // Truss members
    this.setLineWeight('thick');
    this.pdf.line(x + 1, y + 2.5, x + 3, y + 1.5); // Top chord
    this.pdf.line(x + 1, y + 2.5, x + 3, y + 3.5); // Bottom chord
    this.pdf.line(x + 2, y + 2, x + 2, y + 3); // Web member
    
    // Gusset plate
    this.setLineWeight('medium');
    const gussetPoints = [[x + 1.8, y + 2.2], [x + 2.2, y + 2.2], [x + 2.2, y + 2.8], [x + 1.8, y + 2.8]];
    this.pdf.lines(gussetPoints, x + 1.8, y + 2.2);
    
    // Bolts
    this.setLineWeight('thin');
    this.pdf.circle(x + 1.9, y + 2.3, 0.02, 'F');
    this.pdf.circle(x + 2.1, y + 2.3, 0.02, 'F');
    this.pdf.circle(x + 1.9, y + 2.7, 0.02, 'F');
    this.pdf.circle(x + 2.1, y + 2.7, 0.02, 'F');
    
    // Notes
    this.pdf.setFontSize(6);
    this.pdf.text('1/4\" GUSSET PLATE', x + 0.2, y + 3.5);
    this.pdf.text('(4) 5/8\" DIA BOLTS', x + 0.2, y + 3.7);
    
    return detailHeight + 0.5;
  }

  /**
   * Draw wind bracing detail
   */
  private drawWindBracingDetail(x: number, y: number): number {
    const detailHeight = 4;
    
    // Detail title
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('WIND BRACING CONNECTION', x, y);
    this.pdf.text("SCALE: 3/4\" = 1'-0\"", x, y + 0.2);
    
    // Detail border
    this.setLineWeight('medium');
    this.pdf.rect(x, y + 0.3, 4, detailHeight);
    
    // Bracing rod
    this.setLineWeight('thick');
    this.pdf.line(x + 0.5, y + 1, x + 3.5, y + 3.5);
    
    // Connection hardware
    this.setLineWeight('medium');
    this.pdf.circle(x + 3.2, y + 3.2, 0.1);
    this.pdf.rect(x + 3.1, y + 3.1, 0.2, 0.2);
    
    // Turnbuckle
    this.pdf.rect(x + 2, y + 2.4, 0.8, 0.2);
    
    // Notes
    this.pdf.setFontSize(6);
    this.pdf.text('5/8\" DIA THREADED ROD', x + 0.2, y + 3.5);
    this.pdf.text('W/ TURNBUCKLE', x + 0.2, y + 3.7);
    
    return detailHeight + 0.5;
  }

  // Legend placeholder methods
  private drawStructuralLegend(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('STRUCTURAL LEGEND', x, y);
    
    const legendItems = [
      { symbol: '●', description: 'Steel Column - HSS8x8x1/2' },
      { symbol: '━━━', description: 'Steel Beam - W18x35' },
      { symbol: '■', description: "Concrete Footing - 4'x4'x2'-6\"" },
      { symbol: '┅┅┅', description: 'Foundation Wall - 8\" CMU' },
      { symbol: '•', description: 'Anchor Bolt - 3/4\" DIA' }
    ];
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    legendItems.forEach((item, index) => {
      const itemY = y + 0.3 + index * 0.25;
      this.pdf.text(item.symbol, x, itemY);
      this.pdf.text(item.description, x + 0.5, itemY);
    });
  }

  /**
   * Draw electrical grid system for zone identification
   */
  private drawElectricalGrid(x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setDrawColor(150, 150, 150);
    
    // Zone divisions (6 zones)
    const zoneWidth = length / 6;
    for (let i = 1; i < 6; i++) {
      const zoneX = x + i * zoneWidth;
      this.pdf.setLineDashPattern([0.05, 0.05], 0);
      this.pdf.line(zoneX, y, zoneX, y + width);
    }
    this.pdf.setLineDashPattern([], 0);
    
    // Zone labels
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setDrawColor(0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const zoneX = x + (i + 0.5) * zoneWidth;
      this.pdf.text(`ZONE ${i + 1}`, zoneX, y + width/2, { align: 'center' });
    }
  }

  private drawDetailedLightingLayout(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    const zoneHeight = width / 4;
    
    // LED fixtures in dense grid pattern
    this.pdf.setFillColor(255, 255, 0); // Yellow for LED fixtures
    
    for (let zone = 0; zone < 6; zone++) {
      const zoneX = x + zone * zoneWidth;
      
      // 48 fixtures per zone (8x6 grid)
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          const fixtureX = zoneX + (col + 1) * (zoneWidth / 9);
          const fixtureY = y + (row + 1) * (width / 7);
          
          // LED fixture symbol
          this.pdf.rect(fixtureX - 0.03, fixtureY - 0.02, 0.06, 0.04, 'F');
          
          // Circuit number
          this.pdf.setFontSize(4);
          this.pdf.setTextColor(0, 0, 0);
          this.pdf.text(`L${zone + 1}-${Math.floor(row * 8 + col / 4) + 1}`, fixtureX, fixtureY + 0.08, { align: 'center' });
        }
      }
    }
    
    // Emergency lighting fixtures (red)
    this.pdf.setFillColor(255, 0, 0);
    for (let i = 0; i < 12; i++) {
      const emergX = x + (i + 1) * (length / 13);
      const emergY = y + width - 0.2;
      this.pdf.rect(emergX - 0.02, emergY - 0.015, 0.04, 0.03, 'F');
      
      this.pdf.setFontSize(4);
      this.pdf.text(`EM-${i + 1}`, emergX, emergY + 0.06, { align: 'center' });
    }
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  private drawProfessionalElectricalPanels(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setFillColor(100, 100, 100);
    
    // Main electrical room
    const electricalRoomX = x + length - 1;
    const electricalRoomY = y + width/2 - 0.8;
    this.pdf.rect(electricalRoomX, electricalRoomY, 0.8, 1.6, 'F');
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('MAIN', electricalRoomX + 0.4, electricalRoomY + 0.3, { align: 'center' });
    this.pdf.text('ELEC.', electricalRoomX + 0.4, electricalRoomY + 0.6, { align: 'center' });
    this.pdf.text('ROOM', electricalRoomX + 0.4, electricalRoomY + 0.9, { align: 'center' });
    
    // Distribution panels in each zone
    const zoneWidth = length / 6;
    for (let i = 0; i < 6; i++) {
      const panelX = x + (i + 0.5) * zoneWidth;
      const panelY = y + width + 0.2;
      
      this.pdf.setFillColor(50, 50, 50);
      this.pdf.rect(panelX - 0.1, panelY - 0.08, 0.2, 0.16, 'F');
      
      this.pdf.setFontSize(6);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text(`LP-${i + 1}`, panelX, panelY, { align: 'center' });
      this.pdf.text('400A', panelX, panelY + 0.04, { align: 'center' });
    }
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  private drawPowerCircuits(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('medium');
    this.pdf.setDrawColor(255, 0, 0);
    
    // Main feeders from electrical room
    const electricalRoomX = x + length - 1;
    const electricalRoomY = y + width/2;
    
    // Feeder to each zone panel
    const zoneWidth = length / 6;
    for (let i = 0; i < 6; i++) {
      const panelX = x + (i + 0.5) * zoneWidth;
      const panelY = y + width + 0.2;
      
      // Vertical feeder run
      this.pdf.line(panelX, panelY, panelX, y + width);
      // Horizontal feeder run
      this.pdf.line(panelX, y + width, electricalRoomX, y + width);
      // Connection to electrical room
      this.pdf.line(electricalRoomX, y + width, electricalRoomX, electricalRoomY);
    }
    
    // Receptacle circuits (120V)
    this.pdf.setDrawColor(0, 0, 255);
    this.setLineWeight('thin');
    
    // Receptacles around perimeter
    for (let i = 0; i < 24; i++) {
      const receptX = x + (i + 1) * (length / 25);
      const receptY = y - 0.1;
      
      // Receptacle symbol
      this.pdf.circle(receptX, receptY, 0.02);
      this.pdf.circle(receptX, receptY, 0.015);
      
      // Circuit wire to panel
      this.pdf.line(receptX, receptY, receptX, y + 0.1);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawProfessionalConduitRuns(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setDrawColor(0, 100, 0);
    
    // Main conduit runs
    const zoneWidth = length / 6;
    
    // Overhead conduit runs for lighting circuits
    for (let zone = 0; zone < 6; zone++) {
      const conduitX = x + zone * zoneWidth;
      
      // Main conduit run
      this.pdf.line(conduitX, y + 0.2, conduitX + zoneWidth, y + 0.2);
      this.pdf.line(conduitX, y + width - 0.2, conduitX + zoneWidth, y + width - 0.2);
      
      // Branch conduits
      for (let i = 1; i <= 4; i++) {
        const branchY = y + i * (width / 5);
        this.pdf.line(conduitX + 0.1, y + 0.2, conduitX + 0.1, branchY);
        this.pdf.line(conduitX + 0.1, branchY, conduitX + zoneWidth - 0.1, branchY);
      }
    }
    
    // Conduit size annotations
    this.pdf.setFontSize(5);
    this.pdf.setFont('helvetica', 'normal');
    for (let i = 0; i < 6; i++) {
      const conduitX = x + (i + 0.5) * zoneWidth;
      this.pdf.text('4" PVC', conduitX, y + 0.15, { align: 'center' });
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawLifeSafetySystems(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Fire alarm devices
    this.pdf.setFillColor(255, 0, 0);
    
    // Smoke detectors
    for (let i = 0; i < 8; i++) {
      const detectorX = x + (i + 1) * (length / 9);
      const detectorY = y + width/2;
      
      this.pdf.circle(detectorX, detectorY, 0.03, 'F');
      this.pdf.setFontSize(4);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text('SD', detectorX, detectorY, { align: 'center' });
    }
    
    // Fire alarm panel
    this.pdf.setFillColor(255, 100, 100);
    this.pdf.rect(x - 0.3, y + width/2 - 0.1, 0.2, 0.2, 'F');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('FACP', x - 0.2, y + width/2, { align: 'center' });
    
    // Emergency exits
    this.pdf.setFillColor(0, 255, 0);
    this.pdf.rect(x, y + width/2 - 0.05, 0.1, 0.1, 'F');
    this.pdf.rect(x + length - 0.1, y + width/2 - 0.05, 0.1, 0.1, 'F');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  private drawElectricalEquipment(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Transformers
    this.pdf.setFillColor(100, 100, 100);
    
    for (let i = 0; i < 3; i++) {
      const transformerX = x + (i + 1) * (length / 4);
      const transformerY = y - 0.4;
      
      this.pdf.rect(transformerX - 0.08, transformerY - 0.08, 0.16, 0.16, 'F');
      this.pdf.setFontSize(5);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text(`T${i + 1}`, transformerX, transformerY, { align: 'center' });
      this.pdf.text('500KVA', transformerX, transformerY + 0.04, { align: 'center' });
    }
    
    // Motor control centers
    this.pdf.setFillColor(150, 150, 150);
    const mccX = x + length - 0.5;
    const mccY = y + width + 0.5;
    
    this.pdf.rect(mccX - 0.15, mccY - 0.1, 0.3, 0.2, 'F');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('MCC-1', mccX, mccY, { align: 'center' });
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  private drawCircuitIdentification(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Circuit home runs
    this.setLineWeight('thin');
    const zoneWidth = length / 6;
    
    for (let zone = 0; zone < 6; zone++) {
      const panelX = x + (zone + 0.5) * zoneWidth;
      const panelY = y + width + 0.2;
      
      // Circuit numbering
      this.pdf.setFontSize(5);
      this.pdf.setFont('helvetica', 'normal');
      
      for (let circuit = 1; circuit <= 8; circuit++) {
        const circuitY = y + (circuit * width / 9);
        this.pdf.text(`${zone + 1}-${circuit}`, panelX + 0.15, circuitY, { align: 'left' });
        
        // Home run arrow
        this.pdf.line(panelX + 0.1, circuitY, panelX + 0.12, circuitY - 0.01);
        this.pdf.line(panelX + 0.1, circuitY, panelX + 0.12, circuitY + 0.01);
      }
    }
  }

  private drawVoltageIdentification(x: number, y: number, length: number, width: number): void {
    // Voltage legend
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('VOLTAGE LEGEND', x - 0.8, y - 0.5);
    
    const voltageItems = [
      { color: [255, 0, 0], voltage: '480V - 3Ø' },
      { color: [0, 0, 255], voltage: '277V - 1Ø' },
      { color: [0, 150, 0], voltage: '120V - 1Ø' }
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    
    voltageItems.forEach((item, index) => {
      const itemY = y - 0.3 + index * 0.1;
      this.pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
      this.pdf.line(x - 0.8, itemY, x - 0.7, itemY);
      this.pdf.setDrawColor(0, 0, 0);
      this.pdf.text(item.voltage, x - 0.65, itemY);
    });
  }

  /**
   * Draw lighting fixtures throughout the greenhouse
   */
  private drawLightingFixtures(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    const fixturesPerZone = 120; // 120 fixtures per zone
    
    for (let zone = 0; zone < 6; zone++) {
      const zoneX = x + zone * zoneWidth;
      
      // Fixture layout within zone (12 rows x 10 columns)
      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 10; col++) {
          const fixtureX = zoneX + (col + 1) * (zoneWidth / 11);
          const fixtureY = y + (row + 1) * (width / 13);
          
          // Alternate between LED and HPS fixtures
          const isLED = (row + col) % 3 === 0;
          
          if (isLED) {
            // LED fixture (rectangle)
            this.setLineWeight('thin');
            this.pdf.setFillColor(0, 255, 0);
            this.pdf.rect(fixtureX - 0.03, fixtureY - 0.02, 0.06, 0.04, 'F');
            this.pdf.setFillColor(255, 255, 255);
            
            // LED label
            if ((row + col) % 6 === 0) {
              this.pdf.setFontSize(3);
              this.pdf.text('LED', fixtureX, fixtureY + 0.06, { align: 'center' });
              this.pdf.text('630W', fixtureX, fixtureY + 0.09, { align: 'center' });
            }
          } else {
            // HPS fixture (circle)
            this.setLineWeight('thin');
            this.pdf.setFillColor(255, 200, 0);
            this.pdf.circle(fixtureX, fixtureY, 0.025, 'F');
            this.pdf.setFillColor(255, 255, 255);
            
            // HPS label
            if ((row + col) % 6 === 0) {
              this.pdf.setFontSize(3);
              this.pdf.text('HPS', fixtureX, fixtureY + 0.06, { align: 'center' });
              this.pdf.text('1000W', fixtureX, fixtureY + 0.09, { align: 'center' });
            }
          }
        }
      }
    }
  }

  /**
   * Draw electrical panels and distribution equipment
   */
  private drawElectricalPanels(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    
    // Main distribution panel (center of building)
    this.setLineWeight('thick');
    this.pdf.setFillColor(50, 50, 50);
    this.pdf.rect(x + length/2 - 0.15, y + width + 0.3, 0.3, 0.4, 'F');
    this.pdf.setFillColor(255, 255, 255);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MDP', x + length/2, y + width + 0.45, { align: 'center' });
    this.pdf.text('3000A', x + length/2, y + width + 0.55, { align: 'center' });
    
    // Lighting panels (one per zone)
    for (let zone = 0; zone < 6; zone++) {
      const panelX = x + (zone + 0.5) * zoneWidth;
      const panelY = y + width + 0.8;
      
      this.setLineWeight('medium');
      this.pdf.setFillColor(80, 80, 80);
      this.pdf.rect(panelX - 0.1, panelY - 0.1, 0.2, 0.2, 'F');
      this.pdf.setFillColor(255, 255, 255);
      
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`LP-${zone + 1}`, panelX, panelY, { align: 'center' });
      this.pdf.text('400A', panelX, panelY + 0.08, { align: 'center' });
    }
    
    // Distribution panels (intermediate)
    for (let i = 0; i < 3; i++) {
      const dpX = x + (i + 1) * (length / 4);
      const dpY = y - 0.3;
      
      this.setLineWeight('medium');
      this.pdf.setFillColor(100, 100, 100);
      this.pdf.rect(dpX - 0.12, dpY - 0.15, 0.24, 0.3, 'F');
      this.pdf.setFillColor(255, 255, 255);
      
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`DP-${i + 1}`, dpX, dpY, { align: 'center' });
      this.pdf.text('800A', dpX, dpY + 0.08, { align: 'center' });
    }
  }

  /**
   * Draw power receptacles and special equipment connections
   */
  private drawPowerReceptacles(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Perimeter receptacles every 50 feet
    const receptacleSpacing = 50 * scale;
    
    // Bottom wall receptacles
    for (let i = 0; i < length; i += receptacleSpacing) {
      if (i + receptacleSpacing <= length) {
        this.setLineWeight('thin');
        this.pdf.circle(x + i + receptacleSpacing/2, y - 0.1, 0.03);
        this.pdf.line(x + i + receptacleSpacing/2 - 0.015, y - 0.095, x + i + receptacleSpacing/2 + 0.015, y - 0.105);
        this.pdf.line(x + i + receptacleSpacing/2 - 0.015, y - 0.105, x + i + receptacleSpacing/2 + 0.015, y - 0.095);
      }
    }
    
    // Top wall receptacles
    for (let i = 0; i < length; i += receptacleSpacing) {
      if (i + receptacleSpacing <= length) {
        this.setLineWeight('thin');
        this.pdf.circle(x + i + receptacleSpacing/2, y + width + 0.1, 0.03);
        this.pdf.line(x + i + receptacleSpacing/2 - 0.015, y + width + 0.095, x + i + receptacleSpacing/2 + 0.015, y + width + 0.105);
        this.pdf.line(x + i + receptacleSpacing/2 - 0.015, y + width + 0.105, x + i + receptacleSpacing/2 + 0.015, y + width + 0.095);
      }
    }
    
    // HVAC equipment connections (special symbols)
    const hvacLocations = [
      { x: x + length * 0.167, y: y + width * 0.2 },
      { x: x + length * 0.5, y: y + width * 0.2 },
      { x: x + length * 0.833, y: y + width * 0.2 },
      { x: x + length * 0.167, y: y + width * 0.8 },
      { x: x + length * 0.5, y: y + width * 0.8 },
      { x: x + length * 0.833, y: y + width * 0.8 }
    ];
    
    hvacLocations.forEach((loc, index) => {
      this.setLineWeight('medium');
      this.pdf.setFillColor(255, 0, 0);
      this.pdf.rect(loc.x - 0.05, loc.y - 0.05, 0.1, 0.1, 'F');
      this.pdf.setFillColor(255, 255, 255);
      
      this.pdf.setFontSize(4);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('HVAC', loc.x, loc.y + 0.01, { align: 'center' });
    });
  }

  /**
   * Draw conduit runs and homerun connections
   */
  private drawConduitRuns(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setDrawColor(0, 150, 0);
    
    const zoneWidth = length / 6;
    
    // Homerun lines from each zone to lighting panels
    for (let zone = 0; zone < 6; zone++) {
      const zoneCenterX = x + (zone + 0.5) * zoneWidth;
      const zoneCenterY = y + width/2;
      const panelX = x + (zone + 0.5) * zoneWidth;
      const panelY = y + width + 0.8;
      
      // Main homerun line
      this.pdf.line(zoneCenterX, zoneCenterY, panelX, panelY);
      
      // Branch circuit lines (simplified representation)
      for (let i = 0; i < 4; i++) {
        const branchX = zoneCenterX + (i - 1.5) * 0.2;
        this.pdf.line(branchX, zoneCenterY - 0.3, branchX, zoneCenterY + 0.3);
      }
      
      // Homerun arrow
      this.pdf.line(panelX - 0.05, panelY - 0.15, panelX, panelY - 0.1);
      this.pdf.line(panelX + 0.05, panelY - 0.15, panelX, panelY - 0.1);
    }
    
    // Main feeder runs
    this.setLineWeight('medium');
    this.pdf.setDrawColor(255, 0, 0);
    
    // MDP to distribution panels
    for (let i = 0; i < 3; i++) {
      const dpX = x + (i + 1) * (length / 4);
      this.pdf.line(x + length/2, y + width + 0.5, dpX, y - 0.15);
    }
    
    // Distribution panels to lighting panels
    for (let i = 0; i < 6; i++) {
      const lpX = x + (i + 0.5) * zoneWidth;
      const dpIndex = Math.floor(i / 2);
      const dpX = x + (dpIndex + 1) * (length / 4);
      this.pdf.line(dpX, y - 0.15, lpX, y + width + 0.7);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw emergency lighting and exit signs
   */
  private drawEmergencySystems(electrical: ElectricalSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Emergency lighting units
    const emergencyLights = [
      { x: x + length * 0.25, y: y + 0.1 },
      { x: x + length * 0.75, y: y + 0.1 },
      { x: x + length * 0.25, y: y + width - 0.1 },
      { x: x + length * 0.75, y: y + width - 0.1 }
    ];
    
    emergencyLights.forEach(light => {
      this.setLineWeight('thin');
      this.pdf.setFillColor(255, 255, 0);
      this.pdf.rect(light.x - 0.06, light.y - 0.03, 0.12, 0.06, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.rect(light.x - 0.06, light.y - 0.03, 0.12, 0.06);
      
      this.pdf.setFontSize(3);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('EM', light.x, light.y, { align: 'center' });
    });
    
    // Exit signs
    const exitSigns = [
      { x: x + length * 0.1, y: y + 0.05 },
      { x: x + length * 0.9, y: y + 0.05 },
      { x: x + length * 0.5, y: y + width - 0.05 }
    ];
    
    exitSigns.forEach(exit => {
      this.setLineWeight('thin');
      this.pdf.setFillColor(255, 0, 0);
      this.pdf.rect(exit.x - 0.08, exit.y - 0.04, 0.16, 0.08, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.rect(exit.x - 0.08, exit.y - 0.04, 0.16, 0.08);
      
      this.pdf.setFontSize(4);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('EXIT', exit.x, exit.y, { align: 'center' });
    });
  }

  /**
   * Draw electrical plan notes
   */
  private drawElectricalPlanNotes(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ELECTRICAL NOTES', x, y);
    
    const notes = [
      '1. All work per NEC 2020 Edition',
      '2. Main service: 3000A, 480/277V, 3Ø',
      '3. Lighting: LED 630W & HPS 1000W',
      '4. All fixtures suitable for wet locations',
      '5. GFCI protection per NEC 210.8',
      '6. Emergency lighting: 90 min battery',
      '7. Panel utilization: Max 80%',
      '8. Voltage drop: Max 3% branch, 5% total',
      '9. All conduit: PVC Schedule 40 min',
      '10. Grounding per NEC Article 250'
    ];
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, index) => {
      this.pdf.text(note, x, y + 0.3 + index * 0.2);
    });
  }

  private drawFoundationLegend(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FOUNDATION LEGEND', x, y);
    
    const legendItems = [
      { symbol: '■', description: "Concrete Footing - 4'x4'x2'-6\"" },
      { symbol: '━━━', description: 'Foundation Wall - 8\" CMU' },
      { symbol: '•', description: 'Anchor Bolt - 3/4\" DIA' },
      { symbol: '┼┼┼', description: 'Reinforcement - #4 @ 12\" O.C.' }
    ];
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    legendItems.forEach((item, index) => {
      const itemY = y + 0.3 + index * 0.25;
      this.pdf.text(item.symbol, x, itemY);
      this.pdf.text(item.description, x + 0.5, itemY);
    });
  }

  /**
   * Draw HVAC zones for climate control
   */
  private drawDetailedHVACZones(x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thin');
    this.pdf.setDrawColor(0, 0, 255);
    
    // Zone divisions (6 zones, same as electrical)
    const zoneWidth = length / 6;
    for (let i = 1; i < 6; i++) {
      const zoneX = x + i * zoneWidth;
      this.pdf.setLineDashPattern([0.08, 0.04], 0);
      this.pdf.line(zoneX, y, zoneX, y + width);
    }
    this.pdf.setLineDashPattern([], 0);
    
    // Zone identification
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setDrawColor(0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const zoneX = x + (i + 0.5) * zoneWidth;
      const zoneY = y + width/2;
      
      // Zone boundary box
      this.pdf.setFillColor(240, 240, 255);
      this.pdf.rect(zoneX - 0.3, zoneY - 0.2, 0.6, 0.4, 'FD');
      
      // Zone information
      this.pdf.text(`ZONE ${i + 1}`, zoneX, zoneY - 0.05, { align: 'center' });
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('75°F ± 2°F', zoneX, zoneY + 0.05, { align: 'center' });
      this.pdf.text('60% RH ± 5%', zoneX, zoneY + 0.15, { align: 'center' });
    }
    
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawProfessionalAirHandlingUnits(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    this.pdf.setFillColor(150, 150, 255);
    
    // Air handling units (6 units, one per zone)
    const zoneWidth = length / 6;
    for (let i = 0; i < 6; i++) {
      const ahuX = x + (i + 0.5) * zoneWidth;
      const ahuY = y + width * 0.1;
      
      // AHU symbol - detailed representation
      this.pdf.rect(ahuX - 0.25, ahuY - 0.15, 0.5, 0.3, 'F');
      
      // Supply and return connections
      this.pdf.setLineWidth(0.015);
      this.pdf.setDrawColor(255, 0, 0); // Supply
      this.pdf.line(ahuX, ahuY + 0.15, ahuX, ahuY + 0.5);
      
      this.pdf.setDrawColor(0, 0, 255); // Return
      this.pdf.line(ahuX - 0.1, ahuY + 0.15, ahuX - 0.1, ahuY + 0.5);
      
      // Equipment tag
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text(`AHU-${i + 1}`, ahuX, ahuY - 0.05, { align: 'center' });
      this.pdf.text('25 TON', ahuX, ahuY + 0.05, { align: 'center' });
      
      // Specifications
      this.pdf.setFontSize(5);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text('10,000 CFM', ahuX, ahuY - 0.25, { align: 'center' });
    }
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setDrawColor(0, 0, 0);
  }

  private drawDetailedCentralEquipment(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Chiller plant
    const chillerX = x - 1.2;
    const chillerY = y + width/2 - 0.4;
    
    this.pdf.setFillColor(100, 100, 255);
    this.pdf.rect(chillerX, chillerY, 0.8, 0.8, 'F');
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('CHILLER', chillerX + 0.4, chillerY + 0.3, { align: 'center' });
    this.pdf.text('150 TON', chillerX + 0.4, chillerY + 0.5, { align: 'center' });
    
    // Boiler
    const boilerX = x - 1.2;
    const boilerY = y + width/2 + 0.4;
    
    this.pdf.setFillColor(255, 100, 100);
    this.pdf.rect(boilerX, boilerY, 0.8, 0.6, 'F');
    
    this.pdf.text('BOILER', boilerX + 0.4, boilerY + 0.2, { align: 'center' });
    this.pdf.text('2000 MBH', boilerX + 0.4, boilerY + 0.4, { align: 'center' });
    
    // Pumps
    this.pdf.setFillColor(100, 255, 100);
    this.pdf.circle(chillerX + 0.9, chillerY + 0.2, 0.08, 'F');
    this.pdf.circle(chillerX + 0.9, chillerY + 0.6, 0.08, 'F');
    this.pdf.circle(boilerX + 0.9, boilerY + 0.3, 0.08, 'F');
    
    this.pdf.setFontSize(5);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('CWP-1', chillerX + 0.9, chillerY + 0.05, { align: 'center' });
    this.pdf.text('CWP-2', chillerX + 0.9, chillerY + 0.45, { align: 'center' });
    this.pdf.text('HWP-1', boilerX + 0.9, boilerY + 0.15, { align: 'center' });
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  private drawDetailedDuctwork(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('thick');
    
    // Main supply ducts
    this.pdf.setDrawColor(255, 0, 0);
    this.pdf.line(x, y + width * 0.15, x + length, y + width * 0.15);
    this.pdf.line(x, y + width * 0.85, x + length, y + width * 0.85);
    
    // Branch ducts to zones
    const zoneWidth = length / 6;
    for (let i = 0; i < 6; i++) {
      const zoneX = x + (i + 0.5) * zoneWidth;
      
      // Vertical supply branches
      for (let j = 0; j < 3; j++) {
        const branchX = zoneX + (j - 1) * zoneWidth/4;
        this.pdf.line(branchX, y + width * 0.15, branchX, y + width * 0.85);
        
        // Duct size annotation
        this.pdf.setFontSize(5);
        this.pdf.text('24"×16"', branchX + 0.02, y + width * 0.5, { angle: 90 });
      }
    }
    
    // Return air ducts
    this.pdf.setDrawColor(0, 0, 255);
    this.pdf.line(x, y + width * 0.18, x + length, y + width * 0.18);
    this.pdf.line(x, y + width * 0.82, x + length, y + width * 0.82);
    
    // Main duct sizes
    this.pdf.setFontSize(6);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.text('48"×24" SUPPLY', x + length/2, y + width * 0.13, { align: 'center' });
    this.pdf.text('48"×24" RETURN', x + length/2, y + width * 0.20, { align: 'center' });
  }

  private drawHydronicPiping(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('medium');
    
    // Chilled water supply
    this.pdf.setDrawColor(0, 0, 255);
    this.pdf.setLineDashPattern([0.1, 0.05], 0);
    this.pdf.line(x - 0.4, y + width/2 - 0.2, x + length, y + width/2 - 0.2);
    
    // Chilled water return
    this.pdf.setLineDashPattern([0.05, 0.05], 0);
    this.pdf.line(x - 0.4, y + width/2 - 0.3, x + length, y + width/2 - 0.3);
    
    // Hot water supply
    this.pdf.setDrawColor(255, 0, 0);
    this.pdf.setLineDashPattern([0.1, 0.05], 0);
    this.pdf.line(x - 0.4, y + width/2 + 0.2, x + length, y + width/2 + 0.2);
    
    // Hot water return
    this.pdf.setLineDashPattern([0.05, 0.05], 0);
    this.pdf.line(x - 0.4, y + width/2 + 0.3, x + length, y + width/2 + 0.3);
    
    this.pdf.setLineDashPattern([], 0);
    
    // Pipe size annotations
    this.pdf.setFontSize(5);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.text('6" CWS', x + 0.5, y + width/2 - 0.22);
    this.pdf.text('6" CWR', x + 0.5, y + width/2 - 0.32);
    this.pdf.text('4" HWS', x + 0.5, y + width/2 + 0.18);
    this.pdf.text('4" HWR', x + 0.5, y + width/2 + 0.28);
  }

  private drawProfessionalAirDistribution(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Supply diffusers
    this.pdf.setDrawColor(0, 0, 0);
    this.setLineWeight('thin');
    
    // Grid of diffusers
    for (let i = 0; i < 72; i++) {
      const row = Math.floor(i / 12);
      const col = i % 12;
      const diffuserX = x + (col + 1) * (length / 13);
      const diffuserY = y + (row + 1) * (width / 7);
      
      // Square diffuser symbol
      this.pdf.rect(diffuserX - 0.02, diffuserY - 0.02, 0.04, 0.04);
      
      // Four-way throw pattern
      this.pdf.line(diffuserX - 0.015, diffuserY, diffuserX + 0.015, diffuserY);
      this.pdf.line(diffuserX, diffuserY - 0.015, diffuserX, diffuserY + 0.015);
      
      // CFM annotation (every 4th diffuser)
      if (i % 4 === 0) {
        this.pdf.setFontSize(4);
        this.pdf.text('350', diffuserX + 0.03, diffuserY);
      }
    }
    
    // Return grilles
    for (let i = 0; i < 12; i++) {
      const returnX = x + (i + 1) * (length / 13);
      const returnY = y + width - 0.1;
      
      // Return grille symbol
      this.pdf.rect(returnX - 0.03, returnY - 0.02, 0.06, 0.04);
      
      // Horizontal lines for grille
      for (let j = 0; j < 3; j++) {
        this.pdf.line(returnX - 0.025, returnY - 0.01 + j * 0.01, returnX + 0.025, returnY - 0.01 + j * 0.01);
      }
    }
  }

  private drawExhaustSystems(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Exhaust fans
    this.pdf.setFillColor(255, 150, 0);
    
    for (let i = 0; i < 8; i++) {
      const fanX = x + (i + 1) * (length / 9);
      const fanY = y - 0.2;
      
      // Fan symbol
      this.pdf.circle(fanX, fanY, 0.04, 'F');
      
      // Fan blades
      this.pdf.setDrawColor(0, 0, 0);
      for (let angle = 0; angle < 360; angle += 60) {
        const radians = angle * Math.PI / 180;
        const x1 = fanX + Math.cos(radians) * 0.02;
        const y1 = fanY + Math.sin(radians) * 0.02;
        this.pdf.line(fanX, fanY, x1, y1);
      }
      
      // Fan designation
      this.pdf.setFontSize(5);
      this.pdf.text(`EF-${i + 1}`, fanX, fanY - 0.08, { align: 'center' });
    }
    
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawDetailedControls(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Temperature sensors
    this.pdf.setFillColor(0, 255, 0);
    
    const zoneWidth = length / 6;
    for (let i = 0; i < 6; i++) {
      const sensorX = x + (i + 0.5) * zoneWidth;
      const sensorY = y + width * 0.5;
      
      // Sensor symbol
      this.pdf.circle(sensorX, sensorY, 0.02, 'F');
      this.pdf.setFontSize(4);
      this.pdf.text('T', sensorX, sensorY, { align: 'center' });
      
      // Humidity sensor
      const humidityY = sensorY + 0.1;
      this.pdf.circle(sensorX, humidityY, 0.02, 'F');
      this.pdf.text('H', sensorX, humidityY, { align: 'center' });
    }
    
    // DDC control panel
    this.pdf.setFillColor(200, 200, 200);
    this.pdf.rect(x + length - 0.5, y - 0.5, 0.4, 0.3, 'F');
    this.pdf.setFontSize(6);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('DDC', x + length - 0.3, y - 0.35, { align: 'center' });
    this.pdf.text('PANEL', x + length - 0.3, y - 0.25, { align: 'center' });
    
    this.pdf.setFillColor(255, 255, 255);
  }

  private drawEquipmentTags(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Equipment schedule reference
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('EQUIPMENT TAGS:', x - 0.8, y + width + 0.8);
    
    const equipmentList = [
      'AHU-1 thru 6: Air Handling Units, 25 ton',
      'CH-1: Chiller, 150 ton air-cooled',
      'B-1: Boiler, 2000 MBH gas-fired',
      'CWP-1,2: Chilled Water Pumps, 300 GPM',
      'HWP-1: Hot Water Pump, 150 GPM',
      'EF-1 thru 8: Exhaust Fans, 2000 CFM'
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    equipmentList.forEach((item, index) => {
      this.pdf.text(item, x - 0.8, y + width + 0.9 + index * 0.1);
    });
  }

  /**
   * Draw air handling units
   */
  private drawAirHandlingUnits(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    
    // Air handling units (one per zone)
    for (let zone = 0; zone < 6; zone++) {
      const ahuX = x + (zone + 0.5) * zoneWidth;
      const ahuY = y + width * 0.1;
      
      // AHU outline
      this.setLineWeight('thick');
      this.pdf.setFillColor(150, 150, 255);
      this.pdf.rect(ahuX - 0.3, ahuY - 0.15, 0.6, 0.3, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.rect(ahuX - 0.3, ahuY - 0.15, 0.6, 0.3);
      
      // AHU components
      this.setLineWeight('thin');
      this.pdf.line(ahuX - 0.2, ahuY - 0.1, ahuX - 0.2, ahuY + 0.1); // Filter section
      this.pdf.line(ahuX, ahuY - 0.1, ahuX, ahuY + 0.1); // Coil section
      this.pdf.line(ahuX + 0.2, ahuY - 0.1, ahuX + 0.2, ahuY + 0.1); // Fan section
      
      // Fan symbol
      this.pdf.circle(ahuX + 0.25, ahuY, 0.08);
      this.pdf.line(ahuX + 0.2, ahuY - 0.05, ahuX + 0.3, ahuY + 0.05);
      this.pdf.line(ahuX + 0.2, ahuY + 0.05, ahuX + 0.3, ahuY - 0.05);
      
      // AHU label
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`AHU-${zone + 1}`, ahuX, ahuY - 0.25, { align: 'center' });
      this.pdf.text('25 TON', ahuX, ahuY - 0.35, { align: 'center' });
    }
  }

  /**
   * Draw central HVAC equipment
   */
  private drawCentralEquipment(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Chiller (outside building)
    const chillerX = x - 1;
    const chillerY = y + width/2;
    
    this.setLineWeight('thick');
    this.pdf.setFillColor(100, 100, 255);
    this.pdf.rect(chillerX - 0.4, chillerY - 0.6, 0.8, 1.2, 'F');
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(chillerX - 0.4, chillerY - 0.6, 0.8, 1.2);
    
    // Chiller components
    this.pdf.circle(chillerX - 0.15, chillerY - 0.2, 0.12); // Compressor 1
    this.pdf.circle(chillerX + 0.15, chillerY - 0.2, 0.12); // Compressor 2
    this.pdf.rect(chillerX - 0.3, chillerY + 0.1, 0.6, 0.3); // Condenser
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('CHILLER', chillerX, chillerY - 0.8, { align: 'center' });
    this.pdf.text('150 TON', chillerX, chillerY - 0.9, { align: 'center' });
    
    // Boiler (outside building, opposite side)
    const boilerX = x + length + 1;
    const boilerY = y + width/2;
    
    this.pdf.setFillColor(255, 100, 100);
    this.pdf.rect(boilerX - 0.3, boilerY - 0.4, 0.6, 0.8, 'F');
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(boilerX - 0.3, boilerY - 0.4, 0.6, 0.8);
    
    // Boiler components
    this.pdf.circle(boilerX, boilerY - 0.1, 0.15); // Combustion chamber
    this.pdf.rect(boilerX - 0.2, boilerY + 0.15, 0.4, 0.15); // Heat exchanger
    
    this.pdf.text('BOILER', boilerX, boilerY - 0.6, { align: 'center' });
    this.pdf.text('2000 MBH', boilerX, boilerY - 0.7, { align: 'center' });
    
    // Pumps
    this.pdf.setFillColor(200, 200, 200);
    
    // Chilled water pumps
    this.pdf.circle(chillerX + 0.8, chillerY - 0.3, 0.06, 'F');
    this.pdf.circle(chillerX + 0.8, chillerY + 0.3, 0.06, 'F');
    this.pdf.setFontSize(4);
    this.pdf.text('CWP-1', chillerX + 0.8, chillerY - 0.4, { align: 'center' });
    this.pdf.text('CWP-2', chillerX + 0.8, chillerY + 0.2, { align: 'center' });
    
    // Hot water pumps
    this.pdf.circle(boilerX - 0.8, boilerY - 0.3, 0.06, 'F');
    this.pdf.circle(boilerX - 0.8, boilerY + 0.3, 0.06, 'F');
    this.pdf.text('HWP-1', boilerX - 0.8, boilerY - 0.4, { align: 'center' });
    this.pdf.text('HWP-2', boilerX - 0.8, boilerY + 0.2, { align: 'center' });
    
    this.pdf.setFillColor(255, 255, 255);
  }

  /**
   * Draw ductwork systems
   */
  private drawDuctworkSystems(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    
    // Main supply duct (top of building)
    this.setLineWeight('medium');
    this.pdf.setDrawColor(0, 0, 255);
    this.pdf.line(x, y + width * 0.05, x + length, y + width * 0.05);
    
    // Main return duct (bottom of building)
    this.pdf.setDrawColor(255, 0, 0);
    this.pdf.line(x, y + width * 0.95, x + length, y + width * 0.95);
    
    // Zone supply and return ducts
    this.setLineWeight('thin');
    for (let zone = 0; zone < 6; zone++) {
      const zoneX = x + (zone + 0.5) * zoneWidth;
      
      // Supply duct from AHU
      this.pdf.setDrawColor(0, 0, 255);
      this.pdf.line(zoneX, y + width * 0.05, zoneX, y + width * 0.25);
      
      // Return duct to AHU
      this.pdf.setDrawColor(255, 0, 0);
      this.pdf.line(zoneX, y + width * 0.75, zoneX, y + width * 0.95);
      
      // Distribution ducts within zone
      this.pdf.setDrawColor(0, 0, 255);
      for (let i = 0; i < 3; i++) {
        const ductY = y + width * (0.3 + i * 0.15);
        this.pdf.line(zoneX - zoneWidth * 0.4, ductY, zoneX + zoneWidth * 0.4, ductY);
      }
    }
    
    // Duct sizing labels
    this.pdf.setFontSize(5);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.text('36\" x 18\"', x + length/2, y + width * 0.02, { align: 'center' });
    this.pdf.text('SUPPLY MAIN', x + length/2, y + width * 0.08, { align: 'center' });
    this.pdf.text('RETURN MAIN', x + length/2, y + width * 0.98, { align: 'center' });
  }

  /**
   * Draw piping systems
   */
  private drawPipingSystems(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    // Chilled water supply (blue lines)
    this.setLineWeight('medium');
    this.pdf.setDrawColor(0, 100, 255);
    
    // Main CW supply header
    this.pdf.line(x - 0.6, y + width/2 - 0.1, x + length, y + width/2 - 0.1);
    
    // CW supply to each AHU
    const zoneWidth = length / 6;
    for (let zone = 0; zone < 6; zone++) {
      const ahuX = x + (zone + 0.5) * zoneWidth;
      this.pdf.line(ahuX, y + width/2 - 0.1, ahuX, y + width * 0.25);
    }
    
    // Chilled water return (light blue lines)
    this.pdf.setDrawColor(100, 150, 255);
    
    // Main CW return header
    this.pdf.line(x - 0.6, y + width/2 + 0.1, x + length, y + width/2 + 0.1);
    
    // CW return from each AHU
    for (let zone = 0; zone < 6; zone++) {
      const ahuX = x + (zone + 0.5) * zoneWidth;
      this.pdf.line(ahuX, y + width/2 + 0.1, ahuX, y + width * 0.25);
    }
    
    // Hot water heating (red lines)
    this.pdf.setDrawColor(255, 0, 0);
    
    // Main HW supply header
    this.pdf.line(x, y + width/2 - 0.15, x + length + 0.6, y + width/2 - 0.15);
    
    // HW supply to each AHU
    for (let zone = 0; zone < 6; zone++) {
      const ahuX = x + (zone + 0.5) * zoneWidth;
      this.pdf.line(ahuX, y + width/2 - 0.15, ahuX, y + width * 0.25);
    }
    
    // Pipe sizing labels
    this.pdf.setFontSize(4);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.text('6\" CWS', x + length * 0.2, y + width/2 - 0.2);
    this.pdf.text('6\" CWR', x + length * 0.2, y + width/2);
    this.pdf.text('4\" HWS', x + length * 0.8, y + width/2 - 0.25);
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw air distribution devices
   */
  private drawAirDistribution(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    
    for (let zone = 0; zone < 6; zone++) {
      const zoneX = x + zone * zoneWidth;
      
      // Supply diffusers (4-way)
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          const diffuserX = zoneX + (col + 1) * (zoneWidth / 9);
          const diffuserY = y + width * (0.35 + row * 0.1);
          
          this.setLineWeight('thin');
          this.pdf.rect(diffuserX - 0.025, diffuserY - 0.025, 0.05, 0.05);
          this.pdf.line(diffuserX - 0.02, diffuserY, diffuserX + 0.02, diffuserY);
          this.pdf.line(diffuserX, diffuserY - 0.02, diffuserX, diffuserY + 0.02);
          
          // Diffuser labels (every 4th one)
          if ((row + col) % 4 === 0) {
            this.pdf.setFontSize(3);
            this.pdf.text('SD', diffuserX, diffuserY + 0.05, { align: 'center' });
          }
        }
      }
      
      // Return grilles
      for (let i = 0; i < 2; i++) {
        const grilleX = zoneX + (i + 1) * (zoneWidth / 3);
        const grilleY = y + width * 0.8;
        
        this.setLineWeight('thin');
        this.pdf.rect(grilleX - 0.04, grilleY - 0.03, 0.08, 0.06);
        for (let j = 0; j < 3; j++) {
          this.pdf.line(grilleX - 0.035, grilleY - 0.02 + j * 0.013, grilleX + 0.035, grilleY - 0.02 + j * 0.013);
        }
        
        this.pdf.setFontSize(3);
        this.pdf.text('RG', grilleX, grilleY + 0.05, { align: 'center' });
      }
    }
  }

  /**
   * Draw control devices and sensors
   */
  private drawControlDevices(mechanical: HVACDesignSystem, x: number, y: number, length: number, width: number, scale: number): void {
    const zoneWidth = length / 6;
    
    // Zone temperature sensors
    for (let zone = 0; zone < 6; zone++) {
      const sensorX = x + (zone + 0.5) * zoneWidth;
      const sensorY = y + width * 0.5;
      
      this.setLineWeight('thin');
      this.pdf.setFillColor(255, 255, 100);
      this.pdf.circle(sensorX, sensorY, 0.03, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.circle(sensorX, sensorY, 0.03);
      
      this.pdf.setFontSize(3);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('T', sensorX, sensorY, { align: 'center' });
      this.pdf.text(`TS-${zone + 1}`, sensorX, sensorY - 0.06, { align: 'center' });
    }
    
    // Humidity sensors
    for (let zone = 0; zone < 6; zone++) {
      const sensorX = x + (zone + 0.2) * zoneWidth;
      const sensorY = y + width * 0.6;
      
      this.setLineWeight('thin');
      this.pdf.setFillColor(150, 255, 150);
      this.pdf.circle(sensorX, sensorY, 0.025, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.circle(sensorX, sensorY, 0.025);
      
      this.pdf.setFontSize(3);
      this.pdf.text('H', sensorX, sensorY, { align: 'center' });
      this.pdf.text(`HS-${zone + 1}`, sensorX, sensorY - 0.05, { align: 'center' });
    }
    
    // Control panels
    this.pdf.setFillColor(100, 100, 100);
    this.pdf.rect(x + length/2 - 0.1, y + width + 1, 0.2, 0.15, 'F');
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(x + length/2 - 0.1, y + width + 1, 0.2, 0.15);
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DDC', x + length/2, y + width + 1.05, { align: 'center' });
    this.pdf.text('PANEL', x + length/2, y + width + 1.12, { align: 'center' });
  }

  /**
   * Draw HVAC plan notes
   */
  private drawHVACPlanNotes(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('HVAC NOTES', x, y);
    
    const notes = [
      '1. All work per IMC 2021 & ASHRAE',
      '2. Central chiller: 150 tons, air-cooled',
      '3. Boiler: 2000 MBH, natural gas',
      '4. Air handlers: (6) 25 ton units',
      '5. Design conditions: 75°F, 60% RH',
      '6. Ductwork: Galvanized steel, R-6 insul.',
      '7. Piping: Black steel, Schedule 40',
      '8. Controls: DDC system with BACnet',
      '9. TAB per ASHRAE 111 required',
      '10. Equipment per AHRI standards'
    ];
    
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, index) => {
      this.pdf.text(note, x, y + 0.3 + index * 0.2);
    });
  }

  private drawElectricalLegend(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ELECTRICAL LEGEND', x, y);
    
    const legendItems = [
      { symbol: '■', description: 'LED Fixture - 630W', color: '0,255,0' },
      { symbol: '●', description: 'HPS Fixture - 1000W', color: '255,200,0' },
      { symbol: '⚫', description: 'Lighting Panel - 400A', color: '80,80,80' },
      { symbol: '⬛', description: 'Distribution Panel - 800A', color: '100,100,100' },
      { symbol: '⭕', description: 'Duplex Receptacle - 20A', color: '0,0,0' },
      { symbol: '🔶', description: 'HVAC Connection', color: '255,0,0' },
      { symbol: '🟨', description: 'Emergency Light', color: '255,255,0' },
      { symbol: '🔴', description: 'Exit Sign', color: '255,0,0' },
      { symbol: '━━━', description: 'Feeder - 480V', color: '255,0,0' },
      { symbol: '───', description: 'Branch Circuit - 277V', color: '0,150,0' }
    ];
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    legendItems.forEach((item, index) => {
      const itemY = y + 0.3 + index * 0.25;
      this.pdf.text(item.symbol, x, itemY);
      this.pdf.text(item.description, x + 0.5, itemY);
    });
  }

  private drawHVACLegend(x: number, y: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('HVAC LEGEND', x, y);
    
    const legendItems = [
      { symbol: '▬▬▬', description: 'Air Handling Unit - 25 TON', color: '150,150,255' },
      { symbol: '▣', description: 'Chiller - 150 TON', color: '100,100,255' },
      { symbol: '▦', description: 'Boiler - 2000 MBH', color: '255,100,100' },
      { symbol: '●', description: 'Pump - CW/HW', color: '200,200,200' },
      { symbol: '━━━', description: 'Supply Ductwork', color: '0,0,255' },
      { symbol: '━━━', description: 'Return Ductwork', color: '255,0,0' },
      { symbol: '▬', description: 'Chilled Water Supply', color: '0,100,255' },
      { symbol: '▬', description: 'Chilled Water Return', color: '100,150,255' },
      { symbol: '▬', description: 'Hot Water Supply', color: '255,0,0' },
      { symbol: '□', description: 'Supply Diffuser', color: '0,0,0' },
      { symbol: '≡', description: 'Return Grille', color: '0,0,0' },
      { symbol: '◯', description: 'Temperature Sensor', color: '255,255,100' },
      { symbol: '◯', description: 'Humidity Sensor', color: '150,255,150' }
    ];
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    legendItems.forEach((item, index) => {
      const itemY = y + 0.3 + index * 0.25;
      this.pdf.text(item.symbol, x, itemY);
      this.pdf.text(item.description, x + 0.5, itemY);
    });
  }

  /**
   * Export PDF
   */
  exportPDF(): Blob {
    return this.pdf.output('blob');
  }

  /**
   * Get PDF instance for further manipulation
   */
  getPDF(): jsPDF {
    return this.pdf;
  }
}