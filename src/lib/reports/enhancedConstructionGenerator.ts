/**
 * Enhanced Construction Document Generator
 * Integrates Vibelux electrical, HVAC, and layout modules for complete construction documentation
 */

import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { CircuitPlanner } from '../circuit-planner';
import { ElectricalSystemDesigner } from '../construction/electrical-system-designer';
import { layoutGenerator } from '../drawing/layoutGenerator';
import type { ElectricalSystem, Panel, Circuit } from '../construction/electrical-system-designer';

export interface EnhancedConstructionConfig {
  project: {
    name: string;
    number: string;
    location: string;
    client: string;
    date: Date;
  };
  dimensions: {
    width: number;
    length: number;
    gutterHeight: number;
    ridgeHeight: number;
  };
  zones: number;
  fixtures: Array<{
    id: string;
    type: string;
    wattage: number;
    voltage: number;
    position: { x: number; y: number; z: number };
  }>;
  hvac: {
    coolingCapacity: number;
    heatingCapacity: number;
    fanCoilUnits: number;
  };
  electrical: {
    serviceSize: number;
    voltage: string;
  };
}

interface DrawingContext {
  config: EnhancedConstructionConfig;
  electricalSystem: ElectricalSystem;
  layout: any;
  wireSchedule: WireSchedule[];
  conduitSchedule: ConduitSchedule[];
}

interface WireSchedule {
  circuitId: string;
  from: string;
  to: string;
  wireSize: string;
  wireType: string;
  length: number;
  conduitSize: string;
}

interface ConduitSchedule {
  id: string;
  size: string;
  type: string;
  length: number;
  fittings: string;
}

export async function generateEnhancedConstructionDocuments(config: EnhancedConstructionConfig): Promise<Blob> {
  // Initialize system designers
  const electricalDesigner = new ElectricalSystemDesigner();
  
  // Generate electrical system design
  const mainPanel = electricalDesigner.addMainPanel('MDP-1', config.electrical.serviceSize, 84);
  const lightingPanels: Panel[] = [];
  
  // Create sub-panels for each zone
  for (let i = 0; i < config.zones; i++) {
    const subPanel = electricalDesigner.addSubPanel(
      `LP-${i + 1}`,
      400,
      42,
      mainPanel.id,
      400
    );
    lightingPanels.push(subPanel);
  }
  
  // Generate lighting circuits using actual fixture data
  const fixturesPerZone = Math.floor(config.fixtures.length / config.zones);
  for (let i = 0; i < config.zones; i++) {
    const zoneFixtures = config.fixtures
      .slice(i * fixturesPerZone, (i + 1) * fixturesPerZone)
      .map(f => ({
        id: f.id,
        wattage: f.wattage,
        voltage: f.voltage || 277,
        quantity: 1
      }));
    
    electricalDesigner.generateLightingCircuits(lightingPanels[i].id, zoneFixtures);
  }
  
  // Add HVAC circuits
  const hvacPanel = electricalDesigner.addSubPanel(
    'HP-1',
    600,
    42,
    mainPanel.id,
    600
  );
  
  // Add chiller circuit
  electricalDesigner.addCircuit(hvacPanel.id, 'Chiller', [
    {
      id: 'chiller-1',
      name: 'Main Chiller',
      voltage: 480,
      amperage: config.hvac.coolingCapacity / 1000, // Rough estimate
      phase: 'three',
      continuousDuty: true,
      powerFactor: 0.85,
      location: { zone: 'Mechanical', x: 0, y: 0 }
    }
  ], 480);
  
  // Calculate voltage drops and generate schedules
  electricalDesigner.calculateVoltageDrops();
  electricalDesigner.generateLoadSchedule();
  const electricalSystem = electricalDesigner.exportDesign();
  
  // Generate wire and conduit schedules
  const wireSchedule = generateWireSchedule(electricalSystem);
  const conduitSchedule = generateConduitSchedule(electricalSystem);
  
  // Generate room layout using layoutGenerator
  const roomSpec = {
    id: 'greenhouse-main',
    name: config.project.name,
    type: 'greenhouse' as const,
    dimensions: {
      width: config.dimensions.width,
      height: config.dimensions.length,
      depth: config.dimensions.gutterHeight
    },
    area: config.dimensions.width * config.dimensions.length,
    doors: [{ position: { x: 0, y: config.dimensions.length / 2 }, width: 10, height: 7 }],
    windows: [],
    walls: []
  };
  
  const layout = await layoutGenerator.generateLayout(roomSpec, {
    tableType: 'rolling',
    lightType: 'hps',
    targetPPFD: 700,
    hvacRedundancy: true
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [24, 36] // D-size drawings
  });
  
  // Pass electrical system to drawing functions
  const drawingContext: DrawingContext = {
    config,
    electricalSystem,
    layout,
    wireSchedule,
    conduitSchedule
  };

  // Generate comprehensive drawing set
  generateCoverSheet(pdf, drawingContext);
  
  // Architectural drawings
  pdf.addPage();
  generateSitePlan(pdf, drawingContext);
  
  pdf.addPage();
  generateFloorPlan(pdf, drawingContext);
  
  pdf.addPage();
  generateElevations(pdf, drawingContext);
  
  pdf.addPage();
  generateBuildingSections(pdf, drawingContext);
  
  // Structural drawings
  pdf.addPage();
  generateFoundationPlan(pdf, drawingContext);
  
  pdf.addPage();
  generateFramingPlan(pdf, drawingContext);
  
  // Electrical drawings
  pdf.addPage();
  generateElectricalSitePlan(pdf, drawingContext);
  
  pdf.addPage();
  generateLightingPlan(pdf, drawingContext);
  
  pdf.addPage();
  generatePowerPlan(pdf, drawingContext);
  
  pdf.addPage();
  generateSingleLineDiagram(pdf, drawingContext);
  
  pdf.addPage();
  generatePanelSchedules(pdf, drawingContext);
  
  pdf.addPage();
  generateWireSchedule(pdf, drawingContext);
  
  // Mechanical drawings
  pdf.addPage();
  generateHVACPlan(pdf, drawingContext);
  
  pdf.addPage();
  generateDuctworkPlan(pdf, drawingContext);
  
  pdf.addPage();
  generatePipingPlan(pdf, drawingContext);
  
  pdf.addPage();
  generateEquipmentSchedule(pdf, drawingContext);
  
  // Plumbing drawings
  pdf.addPage();
  generateIrrigationPlan(pdf, drawingContext);
  
  pdf.addPage();
  generatePlumbingIsometric(pdf, drawingContext);
  
  // Details
  pdf.addPage();
  generateTypicalDetails(pdf, drawingContext);
  
  pdf.addPage();
  generateControlDiagrams(pdf, drawingContext);

  return pdf.output('blob');
}

function generateCoverSheet(pdf: jsPDF, context: DrawingContext) {
  const { config } = context;
  
  // Title block
  pdf.setFontSize(24);
  pdf.text('CONSTRUCTION DOCUMENTS', 18, 10, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text(config.project.name.toUpperCase(), 18, 11);
  
  pdf.setFontSize(12);
  pdf.text(config.project.location, 18, 12);
  pdf.text(`Project No: ${config.project.number}`, 18, 13);
  pdf.text(`Date: ${format(config.project.date, 'MMMM d, yyyy')}`, 18, 14);
  
  // Drawing index
  pdf.setFontSize(14);
  pdf.text('DRAWING INDEX', 4, 6);
  
  const drawings = [
    { number: 'G-001', title: 'COVER SHEET & DRAWING INDEX' },
    { number: 'A-001', title: 'SITE PLAN' },
    { number: 'A-101', title: 'FLOOR PLAN' },
    { number: 'A-201', title: 'ELEVATIONS' },
    { number: 'A-301', title: 'BUILDING SECTIONS' },
    { number: 'S-101', title: 'FOUNDATION PLAN' },
    { number: 'S-201', title: 'FRAMING PLAN' },
    { number: 'E-001', title: 'ELECTRICAL SITE PLAN' },
    { number: 'E-101', title: 'LIGHTING PLAN' },
    { number: 'E-102', title: 'POWER PLAN' },
    { number: 'E-201', title: 'SINGLE LINE DIAGRAM' },
    { number: 'E-301', title: 'PANEL SCHEDULES' },
    { number: 'E-401', title: 'WIRE & CONDUIT SCHEDULE' },
    { number: 'M-101', title: 'HVAC PLAN' },
    { number: 'M-201', title: 'DUCTWORK PLAN' },
    { number: 'M-301', title: 'PIPING PLAN' },
    { number: 'M-401', title: 'EQUIPMENT SCHEDULE' },
    { number: 'P-101', title: 'IRRIGATION PLAN' },
    { number: 'P-201', title: 'PLUMBING ISOMETRIC' },
    { number: 'D-101', title: 'TYPICAL DETAILS' },
    { number: 'D-201', title: 'CONTROL DIAGRAMS' }
  ];
  
  pdf.setFontSize(10);
  drawings.forEach((dwg, idx) => {
    const y = 7 + idx * 0.3;
    pdf.text(dwg.number, 4, y);
    pdf.text(dwg.title, 6, y);
  });
}

function generateSitePlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'A-001', 'SITE PLAN', '1" = 40\'');
  
  const { config } = context;
  const scale = 0.025; // 1" = 40'
  
  // Property boundary
  pdf.setLineWidth(0.5);
  pdf.rect(4, 4, 28, 16);
  
  // Building footprint
  const buildingWidth = config.dimensions.width * scale;
  const buildingLength = config.dimensions.length * scale;
  const buildingX = 18 - buildingWidth / 2;
  const buildingY = 12 - buildingLength / 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(buildingX, buildingY, buildingWidth, buildingLength, 'FD');
  
  // Electrical service
  pdf.setLineWidth(1);
  pdf.line(4, 12, buildingX, 12);
  pdf.text('ELECTRICAL SERVICE', 5, 11.5);
  pdf.text(`${config.electrical.voltage}`, 5, 11.8);
  pdf.text(`${config.electrical.serviceSize}A`, 5, 12.1);
  
  // North arrow
  drawNorthArrow(pdf, 30, 6);
}

function generateFloorPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'A-101', 'FLOOR PLAN', '1/8" = 1\'-0"');
  
  const { config, layout, electricalSystem } = context;
  const scale = 1/96; // 1/8" = 1'-0"
  
  const startX = 4;
  const startY = 4;
  
  // Draw greenhouse outline
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  
  pdf.setLineWidth(0.5);
  pdf.rect(startX, startY, scaledWidth, scaledLength);
  
  // Draw zones
  const zoneWidth = scaledWidth / config.zones;
  for (let i = 1; i < config.zones; i++) {
    const x = startX + i * zoneWidth;
    pdf.setLineDash([0.1, 0.1]);
    pdf.line(x, startY, x, startY + scaledLength);
  }
  pdf.setLineDash([]);
  
  // Draw tables from layout
  pdf.setFillColor(220, 220, 220);
  layout.tables.forEach((table: any) => {
    const tableX = startX + table.position.x * scale;
    const tableY = startY + table.position.y * scale;
    const tableWidth = table.dimensions.width * scale;
    const tableDepth = table.dimensions.depth * scale;
    
    pdf.rect(tableX, tableY, tableWidth, tableDepth, 'F');
  });
  
  // Draw electrical panels
  pdf.setFillColor(200, 200, 200);
  electricalSystem.panels.forEach((panel, idx) => {
    const panelX = startX + 0.5 + idx * 0.3;
    const panelY = startY + scaledLength / 2;
    
    pdf.rect(panelX, panelY, 0.2, 0.3, 'F');
    pdf.setFontSize(6);
    pdf.text(panel.name, panelX + 0.1, panelY - 0.1, { align: 'center' });
  });
  
  // Add dimensions
  addDimension(pdf, startX, startY - 0.5, startX + scaledWidth, startY - 0.5, 
    `${config.dimensions.width}'-0"`);
  addDimension(pdf, startX - 0.5, startY, startX - 0.5, startY + scaledLength,
    `${config.dimensions.length}'-0"`, true);
  
  // Zone labels
  pdf.setFontSize(10);
  for (let i = 0; i < config.zones; i++) {
    const zoneX = startX + (i + 0.5) * zoneWidth;
    pdf.text(`ZONE ${i + 1}`, zoneX, startY + scaledLength + 0.5, { align: 'center' });
  }
}

function generateLightingPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'E-101', 'LIGHTING PLAN', '1/8" = 1\'-0"');
  
  const { config, electricalSystem } = context;
  const scale = 1/96;
  const startX = 4;
  const startY = 4;
  
  // Draw building outline
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  
  pdf.setLineWidth(0.3);
  pdf.rect(startX, startY, scaledWidth, scaledLength);
  
  // Draw fixture layout
  const fixturesPerRow = Math.sqrt(config.fixtures.length * scaledWidth / scaledLength);
  const rows = Math.ceil(Math.sqrt(config.fixtures.length * scaledLength / scaledWidth));
  const cols = Math.ceil(config.fixtures.length / rows);
  
  const fixtureSpacingX = scaledWidth / cols;
  const fixtureSpacingY = scaledLength / rows;
  
  // Draw fixtures with circuit assignments
  let fixtureIndex = 0;
  const circuitColors = [
    [255, 0, 0],    // Red
    [0, 255, 0],    // Green
    [0, 0, 255],    // Blue
    [255, 165, 0],  // Orange
    [128, 0, 128]   // Purple
  ];
  
  // Map fixtures to circuits
  const fixtureCircuitMap = new Map<string, string>();
  electricalSystem.panels.forEach(panel => {
    panel.circuits.forEach(circuit => {
      circuit.loads.forEach(load => {
        if (load.fixtureCount && load.fixtureCount > 0) {
          for (let i = 0; i < load.fixtureCount; i++) {
            fixtureCircuitMap.set(load.id, `${panel.name}-${circuit.number}`);
          }
        }
      });
    });
  });
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (fixtureIndex < config.fixtures.length) {
        const x = startX + (col + 0.5) * fixtureSpacingX;
        const y = startY + (row + 0.5) * fixtureSpacingY;
        
        // Draw fixture symbol
        pdf.setLineWidth(0.5);
        pdf.rect(x - 0.05, y - 0.1, 0.1, 0.2);
        
        // Draw homerun to panel
        const panelIndex = Math.floor(fixtureIndex / (config.fixtures.length / config.zones));
        const circuitIndex = fixtureIndex % 20;
        const color = circuitColors[circuitIndex % circuitColors.length];
        
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.3);
        
        // Draw homerun line
        const panelX = startX + 0.5 + panelIndex * 0.3;
        const panelY = startY + scaledLength / 2;
        
        // Draw with curved homerun indicator
        const controlX = x - (x - panelX) * 0.3;
        const controlY = y - (y - panelY) * 0.3;
        
        pdf.lines([
          [panelX - x, panelY - y],
          [controlX - x, controlY - y],
          [0, 0]
        ], x, y);
        
        // Add circuit label every 10th fixture
        if (fixtureIndex % 10 === 0) {
          pdf.setFontSize(6);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`LP-${panelIndex + 1}-${circuitIndex + 1}`, x + 0.1, y);
        }
        
        fixtureIndex++;
      }
    }
  }
  
  // Reset colors
  pdf.setDrawColor(0, 0, 0);
  pdf.setTextColor(0, 0, 0);
  
  // Add legend
  pdf.setFontSize(8);
  pdf.text('LEGEND:', 28, 5);
  pdf.rect(28, 5.5, 0.1, 0.2);
  pdf.text('- HPS FIXTURE', 28.5, 5.6);
  
  // Circuit color legend
  circuitColors.forEach((color, idx) => {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(28, 6 + idx * 0.3, 0.2, 0.2, 'F');
    pdf.text(`CIRCUIT GROUP ${idx + 1}`, 28.5, 6.15 + idx * 0.3);
  });
}

function generateSingleLineDiagram(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'E-201', 'SINGLE LINE DIAGRAM', 'NTS');
  
  const { electricalSystem } = context;
  const diagram = electricalSystem.singleLineDiagram;
  
  // Scale and offset for drawing
  const scale = 0.02;
  const offsetX = 10;
  const offsetY = 5;
  
  // Draw all diagram elements
  diagram.elements.forEach(element => {
    const x = element.position.x * scale + offsetX;
    const y = element.position.y * scale + offsetY;
    
    pdf.setLineWidth(0.5);
    
    switch (element.type) {
      case 'service':
        pdf.rect(x - 1, y, 2, 1);
        pdf.setFontSize(10);
        pdf.text(element.label, x, y + 0.5, { align: 'center' });
        pdf.setFontSize(8);
        pdf.text(element.specs, x, y + 0.8, { align: 'center' });
        break;
      
      case 'meter':
        pdf.circle(x, y, 0.4);
        pdf.setFontSize(8);
        pdf.text('M', x, y, { align: 'center' });
        pdf.text(element.specs, x + 0.6, y);
        break;
      
      case 'panel':
        pdf.rect(x - 0.6, y - 0.4, 1.2, 0.8);
        pdf.setFontSize(8);
        pdf.text(element.label, x, y - 0.1, { align: 'center' });
        pdf.setFontSize(6);
        pdf.text(element.specs, x, y + 0.2, { align: 'center' });
        break;
      
      case 'disconnect':
        pdf.circle(x, y, 0.2);
        pdf.line(x - 0.15, y - 0.15, x + 0.15, y + 0.15);
        pdf.line(x - 0.15, y + 0.15, x + 0.15, y - 0.15);
        break;
    }
  });
  
  // Draw connections with wire labels
  pdf.setLineWidth(0.8);
  diagram.connections.forEach(conn => {
    const from = diagram.elements.find(e => e.id === conn.from);
    const to = diagram.elements.find(e => e.id === conn.to);
    
    if (from && to) {
      const x1 = from.position.x * scale + offsetX;
      const y1 = from.position.y * scale + offsetY + 0.5;
      const x2 = to.position.x * scale + offsetX;
      const y2 = to.position.y * scale + offsetY - 0.5;
      
      pdf.line(x1, y1, x2, y2);
      
      // Add wire and conduit labels
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      pdf.setFontSize(7);
      pdf.text(conn.wire, midX + 0.2, midY);
      if (conn.conduit) {
        pdf.text(conn.conduit, midX + 0.2, midY + 0.2);
      }
      if (conn.label) {
        pdf.text(conn.label, midX - 0.5, midY);
      }
    }
  });
  
  // Add notes
  pdf.setFontSize(8);
  let noteY = 18;
  diagram.annotations.forEach(note => {
    if (note.type === 'note') {
      pdf.text(note.text, 4, noteY);
      noteY += 0.3;
    }
  });
  
  // Add one-line diagram notes
  pdf.text('NOTES:', 4, 19);
  pdf.setFontSize(7);
  pdf.text('1. ALL CONDUCTORS SHALL BE COPPER WITH THHN/THWN-2 INSULATION', 4, 19.3);
  pdf.text('2. PROVIDE 20% SPARE BREAKERS IN ALL PANELS', 4, 19.6);
  pdf.text('3. COORDINATE ALL ELECTRICAL CONNECTIONS WITH EQUIPMENT SUPPLIERS', 4, 19.9);
}

function generatePanelSchedules(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'E-301', 'PANEL SCHEDULES', 'NTS');
  
  const { electricalSystem } = context;
  let yOffset = 4;
  let currentPage = 0;
  
  electricalSystem.panels.forEach((panel, panelIdx) => {
    // Check if we need a new page
    if (yOffset > 15) {
      pdf.addPage();
      addTitleBlock(pdf, `E-301.${++currentPage}`, 'PANEL SCHEDULES (CONT\'D)', 'NTS');
      yOffset = 4;
    }
    
    // Panel header
    pdf.setFillColor(230, 230, 230);
    pdf.rect(4, yOffset, 28, 0.5, 'F');
    pdf.setFontSize(10);
    pdf.text(`PANEL ${panel.name}`, 18, yOffset + 0.35, { align: 'center' });
    
    // Panel info
    yOffset += 0.5;
    pdf.setFontSize(8);
    pdf.text(`Location: ${panel.location}`, 4.2, yOffset + 0.3);
    pdf.text(`Voltage: ${panel.specs.voltage}`, 10, yOffset + 0.3);
    pdf.text(`Phase: ${panel.specs.phase === 'three' ? '3\u03C6' : '1\u03C6'}`, 14, yOffset + 0.3);
    pdf.text(`Main: ${panel.specs.amperage}A`, 17, yOffset + 0.3);
    pdf.text(`Mounting: ${panel.specs.mounting}`, 20, yOffset + 0.3);
    pdf.text(`Spaces: ${panel.specs.spaces}`, 24, yOffset + 0.3);
    
    // Schedule header
    yOffset += 0.5;
    const columns = ['CKT#', 'DESCRIPTION', 'LOAD', 'BKR', 'WIRE', 'PHASE', '%'];
    const colWidths = [1, 10, 2, 1.5, 3, 2, 1.5];
    const colX = [4, 5, 15, 17, 18.5, 21.5, 23.5];
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(4, yOffset, 21, 0.4, 'F');
    
    pdf.setFontSize(7);
    columns.forEach((col, idx) => {
      pdf.text(col, colX[idx] + colWidths[idx] / 2, yOffset + 0.25, { align: 'center' });
    });
    
    // Circuit rows
    yOffset += 0.4;
    panel.circuits.forEach(circuit => {
      pdf.setLineWidth(0.1);
      pdf.rect(4, yOffset, 21, 0.3);
      
      pdf.setFontSize(7);
      // Circuit number
      pdf.text(circuit.number.toString(), colX[0] + 0.5, yOffset + 0.2, { align: 'center' });
      
      // Description
      const desc = circuit.name.length > 40 ? circuit.name.substring(0, 37) + '...' : circuit.name;
      pdf.text(desc, colX[1] + 0.1, yOffset + 0.2);
      
      // Load
      const kw = (circuit.actualLoad * circuit.voltage / 1000).toFixed(1);
      pdf.text(`${kw}kW`, colX[2] + 1, yOffset + 0.2, { align: 'center' });
      
      // Breaker
      pdf.text(`${circuit.breaker.amperage}A`, colX[3] + 0.75, yOffset + 0.2, { align: 'center' });
      
      // Wire
      pdf.text(circuit.wire.gauge, colX[4] + 0.1, yOffset + 0.2);
      
      // Phase (for 3-phase panels)
      if (panel.specs.phase === 'three') {
        const phase = ['A', 'B', 'C'][circuit.number % 3];
        pdf.text(phase, colX[5] + 1, yOffset + 0.2, { align: 'center' });
      }
      
      // Percent load
      pdf.text(`${circuit.percentLoad.toFixed(0)}%`, colX[6] + 0.75, yOffset + 0.2, { align: 'center' });
      
      yOffset += 0.3;
    });
    
    // Panel summary
    yOffset += 0.2;
    pdf.setFontSize(8);
    pdf.text(`Total Connected Load: ${panel.totalLoad.toFixed(0)}A (${(panel.totalLoad * panel.specs.amperage / 1000).toFixed(1)}kW)`, 
      4.2, yOffset + 0.2);
    pdf.text(`Demand Load: ${panel.demandLoad.toFixed(0)}A`, 12, yOffset + 0.2);
    pdf.text(`Spare Spaces: ${panel.specs.spaces - panel.circuits.length * panel.circuits[0].breaker.poles}`, 
      18, yOffset + 0.2);
    
    yOffset += 0.8;
  });
  
  // Add load calculation summary
  if (yOffset < 18) {
    yOffset += 0.5;
    pdf.setFontSize(9);
    pdf.text('LOAD CALCULATION SUMMARY', 4, yOffset);
    yOffset += 0.3;
    
    pdf.setFontSize(8);
    pdf.text(`Total Connected Load: ${electricalSystem.totalConnectedLoad.toFixed(0)}A`, 4.2, yOffset);
    pdf.text(`Total Demand Load: ${electricalSystem.totalDemandLoad.toFixed(0)}A`, 10, yOffset);
    pdf.text(`Service Size: ${electricalSystem.service.serviceSize}A`, 16, yOffset);
    pdf.text(`Percent Utilization: ${(electricalSystem.totalDemandLoad / electricalSystem.service.serviceSize * 100).toFixed(0)}%`, 
      20, yOffset);
  }
}

function generateWireSchedule(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'E-401', 'WIRE & CONDUIT SCHEDULE', 'NTS');
  
  const { wireSchedule, conduitSchedule } = context;
  
  // Wire schedule
  pdf.setFontSize(10);
  pdf.text('WIRE SCHEDULE', 4, 4);
  
  const wireColumns = ['FROM', 'TO', 'WIRE SIZE', 'TYPE', 'LENGTH', 'CONDUIT'];
  const wireColWidths = [4, 4, 2, 2, 2, 2];
  let xPos = 4;
  
  // Header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(4, 4.5, 16, 0.4, 'F');
  
  pdf.setFontSize(8);
  wireColumns.forEach((col, idx) => {
    pdf.text(col, xPos + wireColWidths[idx] / 2, 4.75, { align: 'center' });
    xPos += wireColWidths[idx];
  });
  
  // Wire entries
  let yOffset = 4.9;
  wireSchedule.forEach(wire => {
    xPos = 4;
    pdf.setLineWidth(0.1);
    
    pdf.rect(xPos, yOffset, wireColWidths[0], 0.3);
    pdf.text(wire.from, xPos + 0.1, yOffset + 0.2);
    xPos += wireColWidths[0];
    
    pdf.rect(xPos, yOffset, wireColWidths[1], 0.3);
    pdf.text(wire.to, xPos + 0.1, yOffset + 0.2);
    xPos += wireColWidths[1];
    
    pdf.rect(xPos, yOffset, wireColWidths[2], 0.3);
    pdf.text(wire.wireSize, xPos + wireColWidths[2] / 2, yOffset + 0.2, { align: 'center' });
    xPos += wireColWidths[2];
    
    pdf.rect(xPos, yOffset, wireColWidths[3], 0.3);
    pdf.text(wire.wireType, xPos + wireColWidths[3] / 2, yOffset + 0.2, { align: 'center' });
    xPos += wireColWidths[3];
    
    pdf.rect(xPos, yOffset, wireColWidths[4], 0.3);
    pdf.text(`${wire.length}'`, xPos + wireColWidths[4] / 2, yOffset + 0.2, { align: 'center' });
    xPos += wireColWidths[4];
    
    pdf.rect(xPos, yOffset, wireColWidths[5], 0.3);
    pdf.text(wire.conduitSize, xPos + wireColWidths[5] / 2, yOffset + 0.2, { align: 'center' });
    
    yOffset += 0.3;
  });
  
  // Conduit schedule
  yOffset += 1;
  pdf.setFontSize(10);
  pdf.text('CONDUIT SCHEDULE', 4, yOffset);
  
  const conduitColumns = ['ID', 'SIZE', 'TYPE', 'LENGTH', 'FITTINGS'];
  const conduitColWidths = [2, 2, 2, 2, 8];
  
  yOffset += 0.5;
  xPos = 4;
  
  // Header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(4, yOffset, 16, 0.4, 'F');
  
  pdf.setFontSize(8);
  conduitColumns.forEach((col, idx) => {
    pdf.text(col, xPos + conduitColWidths[idx] / 2, yOffset + 0.25, { align: 'center' });
    xPos += conduitColWidths[idx];
  });
  
  // Conduit entries
  yOffset += 0.4;
  conduitSchedule.forEach(conduit => {
    xPos = 4;
    
    pdf.rect(xPos, yOffset, conduitColWidths[0], 0.3);
    pdf.text(conduit.id, xPos + conduitColWidths[0] / 2, yOffset + 0.2, { align: 'center' });
    xPos += conduitColWidths[0];
    
    pdf.rect(xPos, yOffset, conduitColWidths[1], 0.3);
    pdf.text(conduit.size, xPos + conduitColWidths[1] / 2, yOffset + 0.2, { align: 'center' });
    xPos += conduitColWidths[1];
    
    pdf.rect(xPos, yOffset, conduitColWidths[2], 0.3);
    pdf.text(conduit.type, xPos + conduitColWidths[2] / 2, yOffset + 0.2, { align: 'center' });
    xPos += conduitColWidths[2];
    
    pdf.rect(xPos, yOffset, conduitColWidths[3], 0.3);
    pdf.text(`${conduit.length}'`, xPos + conduitColWidths[3] / 2, yOffset + 0.2, { align: 'center' });
    xPos += conduitColWidths[3];
    
    pdf.rect(xPos, yOffset, conduitColWidths[4], 0.3);
    pdf.text(conduit.fittings, xPos + 0.1, yOffset + 0.2);
    
    yOffset += 0.3;
  });
}

// Helper functions
function addTitleBlock(pdf: jsPDF, sheetNumber: string, title: string, scale: string) {
  // Border
  pdf.setLineWidth(0.5);
  pdf.rect(0.5, 0.5, 35, 23);
  pdf.rect(0.75, 0.75, 34.5, 22.5);
  
  // Title block
  pdf.rect(28, 20, 7.5, 3.5);
  pdf.line(28, 21, 35.5, 21);
  pdf.line(28, 22, 35.5, 22);
  pdf.line(31.75, 20, 31.75, 23.5);
  
  // Text
  pdf.setFontSize(10);
  pdf.text(title, 31.75, 20.7, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text(`SCALE: ${scale}`, 31.75, 21.5, { align: 'center' });
  pdf.text('DATE:', 28.2, 22.3);
  pdf.text(format(new Date(), 'MM/dd/yyyy'), 31.75, 22.3, { align: 'center' });
  pdf.text('SHEET:', 28.2, 23.2);
  pdf.text(sheetNumber, 31.75, 23.2, { align: 'center' });
}

function drawNorthArrow(pdf: jsPDF, x: number, y: number) {
  // Circle
  pdf.circle(x, y, 0.3);
  
  // Arrow
  pdf.line(x, y - 0.3, x, y + 0.3);
  pdf.line(x, y - 0.3, x - 0.1, y - 0.2);
  pdf.line(x, y - 0.3, x + 0.1, y - 0.2);
  
  // N
  pdf.setFontSize(8);
  pdf.text('N', x, y - 0.5, { align: 'center' });
}

function addDimension(pdf: jsPDF, x1: number, y1: number, x2: number, y2: number, text: string, vertical = false) {
  pdf.setLineWidth(0.1);
  
  if (vertical) {
    // Vertical dimension
    pdf.line(x1 - 0.1, y1, x1 + 0.1, y1);
    pdf.line(x1 - 0.1, y2, x1 + 0.1, y2);
    pdf.line(x1, y1, x2, y2);
    
    // Text
    pdf.save();
    pdf.text(text, x1 - 0.2, (y1 + y2) / 2, { angle: 90 });
    pdf.restore();
  } else {
    // Horizontal dimension
    pdf.line(x1, y1 - 0.1, x1, y1 + 0.1);
    pdf.line(x2, y1 - 0.1, x2, y1 + 0.1);
    pdf.line(x1, y1, x2, y2);
    
    // Text
    pdf.text(text, (x1 + x2) / 2, y1 - 0.2, { align: 'center' });
  }
}

// Generate wire schedule from electrical system
function generateWireSchedule(system: ElectricalSystem): WireSchedule[] {
  const schedule: WireSchedule[] = [];
  
  system.panels.forEach(panel => {
    // Feeder to panel
    if (panel.feeder) {
      schedule.push({
        circuitId: `feeder-${panel.id}`,
        from: panel.feeder.fromPanel,
        to: panel.name,
        wireSize: panel.feeder.wire,
        wireType: 'THHN',
        length: panel.feeder.length,
        conduitSize: panel.feeder.conduit
      });
    }
    
    // Branch circuits
    panel.circuits.forEach(circuit => {
      schedule.push({
        circuitId: circuit.id,
        from: panel.name,
        to: circuit.name,
        wireSize: circuit.wire.gauge,
        wireType: circuit.wire.type,
        length: circuit.wire.length,
        conduitSize: circuit.conduit.size
      });
    });
  });
  
  return schedule;
}

// Generate conduit schedule
function generateConduitSchedule(system: ElectricalSystem): ConduitSchedule[] {
  const schedule: ConduitSchedule[] = [];
  let conduitId = 1;
  
  // Group by conduit size and type
  const conduitGroups = new Map<string, number>();
  
  system.panels.forEach(panel => {
    panel.circuits.forEach(circuit => {
      const key = `${circuit.conduit.size}-${circuit.conduit.type}`;
      const current = conduitGroups.get(key) || 0;
      conduitGroups.set(key, current + circuit.wire.length);
    });
  });
  
  conduitGroups.forEach((length, key) => {
    const [size, type] = key.split('-');
    schedule.push({
      id: `C-${conduitId++}`,
      size,
      type,
      length,
      fittings: 'LBs, couplings, and straps as required'
    });
  });
  
  return schedule;
}

// Stub functions for remaining drawings
function generateElevations(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'A-201', 'ELEVATIONS', '1/8" = 1\'-0"');
  // Implementation would show building elevations
}

function generateBuildingSections(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'A-301', 'BUILDING SECTIONS', '1/8" = 1\'-0"');
  // Implementation would show cross-sections
}

function generateFoundationPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'S-101', 'FOUNDATION PLAN', '1/8" = 1\'-0"');
  // Implementation would show foundation details
}

function generateFramingPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'S-201', 'FRAMING PLAN', '1/8" = 1\'-0"');
  // Implementation would show structural framing
}

function generatePowerPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'E-102', 'POWER PLAN', '1/8" = 1\'-0"');
  // Implementation would show receptacles and equipment connections
}

function generateHVACPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'M-101', 'HVAC PLAN', '1/8" = 1\'-0"');
  // Implementation would show HVAC equipment layout
}

function generateDuctworkPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'M-201', 'DUCTWORK PLAN', '1/8" = 1\'-0"');
  // Implementation would show duct routing
}

function generatePipingPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'M-301', 'PIPING PLAN', '1/8" = 1\'-0"');
  // Implementation would show piping layout
}

function generateEquipmentSchedule(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'M-401', 'EQUIPMENT SCHEDULE', 'NTS');
  // Implementation would list all equipment specs
}

function generateIrrigationPlan(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'P-101', 'IRRIGATION PLAN', '1/8" = 1\'-0"');
  // Implementation would show irrigation zones and piping
}

function generatePlumbingIsometric(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'P-201', 'PLUMBING ISOMETRIC', 'NTS');
  // Implementation would show 3D piping diagram
}

function generateTypicalDetails(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'D-101', 'TYPICAL DETAILS', 'VARIES');
  // Implementation would show construction details
}

function generateControlDiagrams(pdf: jsPDF, context: DrawingContext) {
  addTitleBlock(pdf, 'D-201', 'CONTROL DIAGRAMS', 'NTS');
  // Implementation would show control sequences
}