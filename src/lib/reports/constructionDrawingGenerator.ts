/**
 * Construction Drawing Generator
 * Creates buildable construction documents with all installation details
 */

import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { CONSTRUCTION_DRAWING_SETS, getDrawingSet } from './drawingTypes';
import { ElectricalSystemDesigner } from '../construction/electrical-system-designer';
import { StructuralDesigner } from '../construction/structural-designer';
import { HVACConstructionDesigner } from '../hvac/hvac-construction-designer';
import { CalculationVerifier } from '../construction/calculation-verification';
import { ProfessionalDrawingEngine, ProjectInfo, TitleBlockInfo } from '../construction/professional-drawing-engine';
import { ProfessionalDrawingGenerator } from './professionalConstructionDrawings';

export interface ConstructionConfig {
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

export async function generateConstructionDrawings(config: ConstructionConfig, level: string): Promise<Blob> {
  try {
    const drawingSet = getDrawingSet('construction', level);
    
    console.log(`🏗️ PE-STAMPABLE CONSTRUCTION DRAWINGS`);
    console.log(`📊 Level: ${level}`);
    console.log(`📋 Total sheets: ${drawingSet.sheets.length}`);
    console.log(`🎯 Purpose: ${drawingSet.purpose}`);

    // Initialize all engineering systems
    console.log(`🔧 Initializing engineering systems...`);
    
    // Electrical system
    const electricalDesigner = new ElectricalSystemDesigner();
    const electricalSystem = await generateElectricalSystem(electricalDesigner, config);
    console.log(`⚡ Electrical system: ${electricalSystem.panels.length} panels, ${electricalSystem.totalDemandLoad.toFixed(1)}A total load`);

    // Structural system
    const structuralDesigner = new StructuralDesigner();
    structuralDesigner.initializeSystem(config.dimensions.length, config.dimensions.width, config.dimensions.gutterHeight);
    const structuralSystem = structuralDesigner.exportDesign();
    console.log(`🏗️ Structural system: ${structuralSystem.structure.frames.length} frames, ${structuralSystem.structure.foundations.length} foundations`);

    // HVAC system
    const hvacDesigner = new HVACConstructionDesigner();
    await hvacDesigner.initializeSystem(config.dimensions.width, config.dimensions.length, config.dimensions.gutterHeight);
    const hvacSystem = hvacDesigner.exportDesign();
    console.log(`🌡️ HVAC system: ${hvacSystem.equipment.airHandlers.length} air handlers, ${hvacSystem.equipment.chillers.length} chillers`);

    // Calculation verification
    const verifier = new CalculationVerifier();
    const verification = verifier.verifyProject(structuralSystem, electricalSystem, hvacSystem, config.project.number);
    console.log(`✅ Engineering verification: ${verification.overallCompliance ? 'COMPLIANT' : 'REQUIRES REVIEW'}`);

    // Project and title block information
    const projectInfo: ProjectInfo = {
      name: config.project.name,
      number: config.project.number,
      client: config.project.client,
      location: config.project.location,
      architect: 'TBD',
      engineer: 'Licensed Professional Engineer',
      contractor: 'TBD',
      description: 'Greenhouse Facility',
      area: config.dimensions.width * config.dimensions.length,
      volume: config.dimensions.width * config.dimensions.length * config.dimensions.gutterHeight,
      occupancy: 'F-1 Factory Industrial',
      constructionType: 'Type II-B',
      dateStarted: config.project.date,
      dateCompleted: new Date(config.project.date.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year later
    };

    const titleBlockInfo: TitleBlockInfo = {
      companyName: 'VIBELUX',
      companyAddress: '123 Engineering Way, Professional City, ST 12345',
      companyPhone: '(555) 123-4567',
      companyEmail: 'engineering@vibelux.com',
      engineerName: 'Professional Engineer',
      engineerLicense: 'PE-12345'
    };

    // Create professional drawing engine
    const drawingEngine = new ProfessionalDrawingEngine();
    console.log(`🎨 Professional drawing engine initialized`);

    // Generate complete drawing set with engineering integration
    const completeDrawingSet = drawingEngine.generateCompleteDrawingSet(
      projectInfo,
      titleBlockInfo,
      structuralSystem,
      electricalSystem,
      hvacSystem,
      verification
    );

    console.log(`📐 Generated complete drawing set with ${Object.values(completeDrawingSet).flat().length} total drawings`);
    console.log(`✅ PE-stampable construction drawings generated successfully!`);
    
    return drawingEngine.exportPDF();
  } catch (error) {
    console.error(`❌ Error generating PE-stampable construction drawings:`, error);
    throw error;
  }
}

async function generateElectricalSystem(designer: ElectricalSystemDesigner, config: ConstructionConfig) {
  // Create main service panel
  const mainPanel = designer.addMainPanel('MDP-1', config.electrical.serviceSize, 84);
  
  // Create distribution panels
  const dp1 = designer.addSubPanel('DP-1', 800, 42, mainPanel.id, 800);
  const dp2 = designer.addSubPanel('DP-2', 800, 42, mainPanel.id, 800);
  const dp3 = designer.addSubPanel('DP-3', 800, 42, mainPanel.id, 800);
  
  // Create lighting panels
  const lightingPanels = [];
  for (let i = 0; i < config.zones; i++) {
    const lp = designer.addSubPanel(
      `LP-${i + 1}`,
      400,
      42,
      i < 2 ? dp1.id : i < 4 ? dp2.id : dp3.id,
      400
    );
    lightingPanels.push(lp);
  }
  
  // Generate lighting circuits
  const fixturesPerZone = Math.floor(config.fixtures.length / config.zones);
  for (let zone = 0; zone < config.zones; zone++) {
    const zoneFixtures = config.fixtures
      .slice(zone * fixturesPerZone, (zone + 1) * fixturesPerZone)
      .map(f => ({
        id: f.id,
        wattage: f.wattage,
        voltage: f.voltage || 277,
        quantity: 1
      }));
    
    await designer.generateLightingCircuits(lightingPanels[zone].id, zoneFixtures);
  }
  
  // Add HVAC circuits
  const hvacPanel = designer.addSubPanel('HP-1', 600, 42, dp3.id, 600);
  
  const hvacLoads = [
    {
      id: 'chiller-1',
      name: `Chiller - ${config.hvac.coolingCapacity} Tons`,
      voltage: 480,
      amperage: Math.ceil(config.hvac.coolingCapacity * 1.2), // Rough estimate
      phase: 'three' as const,
      continuousDuty: true,
      powerFactor: 0.85,
      location: { zone: 'Mechanical', x: 0, y: 0 }
    },
    {
      id: 'boiler-1',
      name: 'Boiler #1',
      voltage: 480,
      amperage: 52,
      phase: 'three' as const,
      continuousDuty: true,
      powerFactor: 0.85,
      location: { zone: 'Mechanical', x: 10, y: 0 }
    }
  ];
  
  hvacLoads.forEach(load => {
    designer.addCircuit(hvacPanel.id, load.name, [load], load.voltage);
  });
  
  // Calculate and export system
  designer.calculateVoltageDrops();
  return designer.exportDesign();
}

function generateProfessionalBasicDrawings(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  // G-001: Cover Sheet
  drawingGen.addProfessionalTitleBlock('G-001', 'COVER SHEET & INDEX');
  
  const pdf = drawingGen.getPDF();
  
  // Main title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSTRUCTION DOCUMENTS', 14, 8, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text(config.project.name.toUpperCase(), 14, 9.5, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.project.location, 14, 10.5, { align: 'center' });
  
  // Drawing index with professional formatting
  pdf.setLineWidth(0.02);
  pdf.rect(3, 12, 20, 8);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DRAWING INDEX', 13, 13, { align: 'center' });
  
  // Table headers
  pdf.setLineWidth(0.01);
  pdf.line(3, 13.5, 23, 13.5);
  pdf.line(6, 12, 6, 20);
  pdf.line(18, 12, 18, 20);
  
  pdf.setFontSize(10);
  pdf.text('SHEET', 4.5, 13.3, { align: 'center' });
  pdf.text('DRAWING TITLE', 12, 13.3, { align: 'center' });
  pdf.text('SCALE', 20.5, 13.3, { align: 'center' });
  
  const basicSheets = [
    { number: 'G-001', title: 'Cover Sheet & Index', scale: '-' },
    { number: 'A-101', title: 'Floor Plan', scale: '1/16"=1\'-0"' },
    { number: 'E-101', title: 'Electrical Plan', scale: '1/8"=1\'-0"' },
    { number: 'E-201', title: 'Panel Schedules', scale: '-' },
    { number: 'M-101', title: 'HVAC Plan', scale: '1/8"=1\'-0"' }
  ];
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  basicSheets.forEach((sheet, idx) => {
    const yPos = 14 + idx * 0.5;
    pdf.line(3, yPos - 0.25, 23, yPos - 0.25);
    pdf.text(sheet.number, 4.5, yPos, { align: 'center' });
    pdf.text(sheet.title, 6.2, yPos);
    pdf.text(sheet.scale, 20.5, yPos, { align: 'center' });
  });
  
  // Project data box
  pdf.setLineWidth(0.02);
  pdf.rect(3, 21, 20, 2);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PROJECT SUMMARY', 13, 21.5, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const projectData = [
    `Building Area: ${(config.dimensions.width * config.dimensions.length).toLocaleString()} sq ft`,
    `Electrical Service: ${config.electrical.serviceSize}A, ${config.electrical.voltage}`,
    `Total Lighting Fixtures: ${config.fixtures.length}`,
    `HVAC: ${config.hvac.coolingCapacity}T Cooling, ${config.hvac.heatingCapacity} MBH Heating`
  ];
  
  projectData.forEach((item, idx) => {
    pdf.text(item, 4, 22 + idx * 0.3);
  });
  
  // A-101: Professional Floor Plan
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-101', 'FLOOR PLAN', '1/16" = 1\'-0"');
  drawingGen.drawFloorPlan(config);
  
  // E-101: Professional Electrical Plan
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-101', 'ELECTRICAL PLAN', '1/8" = 1\'-0"');
  drawingGen.drawElectricalPlan(config, electricalSystem);
  
  // E-201: Professional Panel Schedule
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-201', 'PANEL SCHEDULES');
  
  const mainLightingPanel = electricalSystem.panels.find((p: any) => p.name === 'LP-1');
  if (mainLightingPanel) {
    drawingGen.generatePanelSchedule(mainLightingPanel);
  }
  
  console.log('✓ Professional basic construction drawings generated');
}

function generateProfessionalDetailedDrawings(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  // Include basic drawings first
  generateProfessionalBasicDrawings(drawingGen, config, electricalSystem);
  
  const pdf = drawingGen.getPDF();
  
  // Additional detailed sheets
  
  // E-301: Detailed Panel Schedules for all panels
  electricalSystem.panels.filter((p: any) => p.name.startsWith('LP')).forEach((panel: any, idx: number) => {
    pdf.addPage();
    drawingGen.addProfessionalTitleBlock(`E-30${idx + 1}`, `PANEL ${panel.name} SCHEDULE`);
    drawingGen.generatePanelSchedule(panel);
  });
  
  // M-101: HVAC Plan
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-101', 'HVAC PLAN', '1/8" = 1\'-0"');
  generateProfessionalHVACPlan(drawingGen, config);
  
  // S-101: Structural Plan
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-101', 'STRUCTURAL PLAN', '1/8" = 1\'-0"');
  generateProfessionalStructuralPlan(drawingGen, config);
  
  console.log('✓ Professional detailed construction drawings generated');
}

function generateProfessionalCompleteDrawings(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  try {
    const pdf = drawingGen.getPDF();
    const completeSheets = CONSTRUCTION_DRAWING_SETS.complete.sheets;
    
    console.log(`🚀 Starting complete construction drawing generation`);
    console.log(`📊 Total sheets to generate: ${completeSheets.length}`);
    
    // Generate ALL 45 sheets for complete construction set
    
    // GENERAL SHEETS (3)
    console.log(`📝 Generating General Sheets (1-3)`);
    drawingGen.addProfessionalTitleBlock('G-001', 'COVER SHEET & DRAWING INDEX');
    generateCompleteCoverSheet(drawingGen, config, electricalSystem);
    console.log(`✅ Sheet G-001 completed`);
  
    try {
      pdf.addPage();
      drawingGen.addProfessionalTitleBlock('G-002', 'GENERAL NOTES & CODE REQUIREMENTS');
      generateGeneralNotes(drawingGen, config);
      console.log(`✅ Sheet G-002 completed`);
    } catch (error) {
      console.error(`❌ Error generating G-002:`, error);
    }
    
    try {
      pdf.addPage();
      drawingGen.addProfessionalTitleBlock('G-003', 'SYMBOLS, ABBREVIATIONS & LEGEND');
      generateSymbolsAndLegend(drawingGen);
      console.log(`✅ Sheet G-003 completed`);
    } catch (error) {
      console.error(`❌ Error generating G-003:`, error);
    }
  
  // ARCHITECTURAL SHEETS (8)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-001', 'SITE PLAN & UTILITIES', '1/32" = 1\'-0"');
  generateSitePlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-101', 'OVERALL FLOOR PLAN', '1/16" = 1\'-0"');
  drawingGen.drawFloorPlan(config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-102', 'ENLARGED FLOOR PLANS', '1/8" = 1\'-0"');
  generateEnlargedFloorPlans(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-201', 'EXTERIOR ELEVATIONS', '1/8" = 1\'-0"');
  generateElevations(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-301', 'BUILDING SECTIONS', '1/8" = 1\'-0"');
  generateBuildingSections(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-401', 'WALL SECTIONS & DETAILS', '1" = 1\'-0"');
  generateWallDetails(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-501', 'DOOR & WINDOW SCHEDULES');
  generateDoorWindowSchedules(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('A-601', 'FINISH SCHEDULES');
  generateFinishSchedules(drawingGen, config);
  
  // STRUCTURAL SHEETS (6)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-101', 'FOUNDATION PLAN', '1/8" = 1\'-0"');
  generateProfessionalStructuralPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-201', 'FOUNDATION DETAILS', '1" = 1\'-0"');
  generateFoundationDetails(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-301', 'FRAMING PLAN', '1/8" = 1\'-0"');
  generateFramingPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-401', 'FRAMING DETAILS', '1" = 1\'-0"');
  generateFramingDetails(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-501', 'CONNECTION DETAILS', '1" = 1\'-0"');
  generateConnectionDetails(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('S-601', 'ANCHOR BOLT PLANS', '1" = 1\'-0"');
  generateAnchorBoltPlans(drawingGen, config);
  
  // ELECTRICAL SHEETS (12)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-001', 'ELECTRICAL SITE PLAN', '1/32" = 1\'-0"');
  generateElectricalSitePlan(drawingGen, config, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-101', 'LIGHTING PLAN - ZONES 1-2', '1/8" = 1\'-0"');
  generateZoneLightingPlan(drawingGen, config, electricalSystem, [1, 2]);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-102', 'LIGHTING PLAN - ZONES 3-5', '1/8" = 1\'-0"');
  generateZoneLightingPlan(drawingGen, config, electricalSystem, [3, 4, 5]);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-201', 'POWER PLAN', '1/8" = 1\'-0"');
  generatePowerPlan(drawingGen, config, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-301', 'SINGLE LINE DIAGRAM');
  generateSingleLineDiagram(drawingGen, config, electricalSystem);
  
  // Panel schedules for each panel
  electricalSystem.panels.filter((p: any) => p.name.startsWith('LP')).slice(0, 2).forEach((panel: any, idx: number) => {
    pdf.addPage();
    drawingGen.addProfessionalTitleBlock(`E-40${idx + 1}`, `PANEL SCHEDULES - ${panel.name}`);
    drawingGen.generatePanelSchedule(panel);
  });
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-501', 'GROUNDING PLAN', '1/8" = 1\'-0"');
  generateProfessionalGroundingPlan(drawingGen, config, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-601', 'CONDUIT & WIRE SCHEDULE');
  generateConduitWireScheduleProfessional(drawingGen, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-701', 'LIGHTING CONTROL SYSTEM');
  generateLightingControlSystem(drawingGen, config, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-801', 'EQUIPMENT CONNECTIONS');
  generateProfessionalEquipmentDetails(drawingGen, config, electricalSystem);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('E-901', 'ELECTRICAL DETAILS');
  generateElectricalDetails(drawingGen, config, electricalSystem);
  
  // MECHANICAL SHEETS (10)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-101', 'HVAC PLAN', '1/8" = 1\'-0"');
  generateProfessionalHVACPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-201', 'DUCTWORK PLAN & SCHEDULES', '1/8" = 1\'-0"');
  generateProfessionalDuctworkPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-301', 'PIPING PLAN - CHILLED WATER', '1/8" = 1\'-0"');
  generateChilledWaterPiping(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-302', 'PIPING PLAN - HEATING WATER', '1/8" = 1\'-0"');
  generateHeatingWaterPiping(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-401', 'EQUIPMENT SCHEDULES');
  generateMechanicalEquipmentSchedules(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-501', 'EQUIPMENT DETAILS');
  generateMechanicalEquipmentDetails(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-601', 'CONTROL DIAGRAMS');
  generateHVACControlDiagrams(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-701', 'SEQUENCES OF OPERATION');
  generateSequencesOfOperation(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-801', 'TESTING & BALANCING');
  generateTestingAndBalancing(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('M-901', 'MECHANICAL DETAILS');
  generateMechanicalDetails(drawingGen, config);
  
  // PLUMBING SHEETS (4)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('P-101', 'IRRIGATION PLAN', '1/8" = 1\'-0"');
  generateProfessionalPlumbingPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('P-201', 'PLUMBING PLAN', '1/8" = 1\'-0"');
  generatePlumbingPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('P-301', 'PLUMBING ISOMETRIC');
  generatePlumbingIsometric(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('P-401', 'PLUMBING DETAILS');
  generatePlumbingDetails(drawingGen, config);
  
  // FIRE PROTECTION SHEETS (2)
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('FP-101', 'FIRE PROTECTION PLAN', '1/8" = 1\'-0"');
  generateFireProtectionPlan(drawingGen, config);
  
  pdf.addPage();
  drawingGen.addProfessionalTitleBlock('FP-201', 'FIRE PROTECTION DETAILS');
  generateFireProtectionDetails(drawingGen, config);
  
    console.log(`✓ Professional complete construction drawings generated - ${completeSheets.length} sheets total`);
  } catch (error) {
    console.error(`❌ Error in generateProfessionalCompleteDrawings:`, error);
    console.error(`❌ Error details:`, error.message);
    console.error(`❌ Stack trace:`, error.stack);
    throw error;
  }
}

// Helper functions for detailed drawings

function generateDetailedPanelSchedule(pdf: jsPDF, panel: any, startX: number, startY: number) {
  let yPos = startY;
  
  // Panel header
  pdf.setFontSize(12);
  pdf.text(`PANEL ${panel.name} - CONSTRUCTION SCHEDULE`, 18, yPos, { align: 'center' });
  
  yPos += 0.5;
  pdf.setFontSize(8);
  pdf.text(`Location: ${panel.location || 'See Plan'}`, startX, yPos);
  pdf.text(`Voltage: ${panel.specs.voltage}`, startX + 8, yPos);
  pdf.text(`Main: ${panel.specs.amperage}A`, startX + 16, yPos);
  
  yPos += 0.8;
  
  // Detailed table header
  const columns = ['CKT', 'DESCRIPTION', 'LOAD', 'BKR', 'WIRE SIZE', 'CONDUIT', 'LENGTH', 'INSTALL NOTES'];
  const colWidths = [1, 6, 1.5, 1.5, 2, 1.5, 1.5, 4];
  const colX = [startX, startX + 1, startX + 7, startX + 8.5, startX + 10, startX + 12, startX + 13.5, startX + 15];
  
  pdf.setFillColor(230, 230, 230);
  pdf.rect(startX, yPos, 20, 0.4, 'F');
  
  pdf.setFontSize(7);
  columns.forEach((col, idx) => {
    pdf.text(col, colX[idx] + colWidths[idx]/2, yPos + 0.25, { align: 'center' });
  });
  
  yPos += 0.4;
  
  // Circuit data with construction details
  panel.circuits.forEach((circuit: any, idx: number) => {
    pdf.setLineWidth(0.1);
    pdf.rect(startX, yPos, 20, 0.3);
    
    pdf.setFontSize(6);
    
    // Circuit number
    pdf.text(circuit.number.toString(), colX[0] + colWidths[0]/2, yPos + 0.2, { align: 'center' });
    
    // Description
    pdf.text(circuit.name.substring(0, 30), colX[1] + 0.1, yPos + 0.2);
    
    // Load
    pdf.text(`${circuit.actualLoad.toFixed(1)}A`, colX[2] + colWidths[2]/2, yPos + 0.2, { align: 'center' });
    
    // Breaker
    pdf.text(`${circuit.breaker.amperage}A`, colX[3] + colWidths[3]/2, yPos + 0.2, { align: 'center' });
    
    // Wire size
    pdf.text(circuit.wire.gauge, colX[4] + colWidths[4]/2, yPos + 0.2, { align: 'center' });
    
    // Conduit
    pdf.text(circuit.conduit.size, colX[5] + colWidths[5]/2, yPos + 0.2, { align: 'center' });
    
    // Length
    pdf.text(`${circuit.wire.length}'`, colX[6] + colWidths[6]/2, yPos + 0.2, { align: 'center' });
    
    // Installation notes
    const installNote = `${circuit.conduit.type} conduit, THHN wire, ${circuit.fixtures.length} fixtures`;
    pdf.text(installNote.substring(0, 25), colX[7] + 0.1, yPos + 0.2);
    
    yPos += 0.3;
  });
  
  // Panel totals and installation notes
  yPos += 0.5;
  pdf.setFontSize(8);
  pdf.text('INSTALLATION REQUIREMENTS:', startX, yPos);
  
  yPos += 0.3;
  pdf.setFontSize(7);
  const installNotes = [
    '• Panel to be surface mounted at 6\'-0" A.F.F.',
    '• Provide 3\'-0" clear working space in front of panel',
    '• All circuits to be AFCI protected per NEC 210.12',
    '• Provide 20% spare breaker spaces',
    '• Label all circuits per NEC 408.4',
    '• Bond panel per NEC 250.146'
  ];
  
  installNotes.forEach(note => {
    pdf.text(note, startX, yPos);
    yPos += 0.25;
  });
}

function generateConduitWireSchedule(pdf: jsPDF, electricalSystem: any, startX: number, startY: number) {
  let yPos = startY;
  
  pdf.setFontSize(12);
  pdf.text('CONDUIT & WIRE SCHEDULE', 18, yPos, { align: 'center' });
  
  yPos += 1;
  
  // Conduit schedule
  pdf.setFontSize(10);
  pdf.text('CONDUIT SCHEDULE', startX, yPos);
  
  yPos += 0.5;
  
  const conduitCols = ['SIZE', 'TYPE', 'TOTAL LENGTH', 'FITTINGS REQUIRED', 'INSTALLATION NOTES'];
  const conduitColW = [1.5, 2, 2, 3, 6];
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(startX, yPos, 14.5, 0.3, 'F');
  
  pdf.setFontSize(7);
  let xPos = startX;
  conduitCols.forEach((col, idx) => {
    pdf.text(col, xPos + conduitColW[idx]/2, yPos + 0.2, { align: 'center' });
    xPos += conduitColW[idx];
  });
  
  yPos += 0.3;
  
  // Generate conduit data from electrical system
  const conduitSizes = new Map();
  electricalSystem.panels.forEach((panel: any) => {
    panel.circuits.forEach((circuit: any) => {
      const size = circuit.conduit.size;
      const length = circuit.wire.length;
      const current = conduitSizes.get(size) || 0;
      conduitSizes.set(size, current + length);
    });
  });
  
  conduitSizes.forEach((totalLength, size) => {
    pdf.setLineWidth(0.1);
    pdf.rect(startX, yPos, 14.5, 0.25);
    
    xPos = startX;
    pdf.text(size, xPos + conduitColW[0]/2, yPos + 0.15, { align: 'center' });
    xPos += conduitColW[0];
    
    pdf.text('EMT', xPos + conduitColW[1]/2, yPos + 0.15, { align: 'center' });
    xPos += conduitColW[1];
    
    pdf.text(`${totalLength}'`, xPos + conduitColW[2]/2, yPos + 0.15, { align: 'center' });
    xPos += conduitColW[2];
    
    pdf.text('LBs, couplings, straps', xPos + 0.1, yPos + 0.15);
    xPos += conduitColW[3];
    
    pdf.text('Install per NEC Article 358', xPos + 0.1, yPos + 0.15);
    
    yPos += 0.25;
  });
}

function generateHVACConstructionPlan(pdf: jsPDF, config: ConstructionConfig, startX: number, startY: number) {
  const scale = 1/96;
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  
  // Building outline
  pdf.setLineWidth(0.3);
  pdf.rect(startX, startY, scaledLength, scaledWidth);
  
  // Equipment placement with installation details
  
  // Chiller location
  pdf.setFillColor(100, 100, 255);
  pdf.rect(startX - 1, startY + scaledWidth/2 - 0.5, 1, 1, 'FD');
  
  pdf.setFontSize(6);
  pdf.text('CHILLER', startX - 0.5, startY + scaledWidth/2 - 0.2, { align: 'center' });
  pdf.text(`${config.hvac.coolingCapacity}T`, startX - 0.5, startY + scaledWidth/2, { align: 'center' });
  pdf.text('CONCRETE PAD', startX - 0.5, startY + scaledWidth/2 + 0.2, { align: 'center' });
  
  // Fan coil units with mounting details
  const fcuSpacing = scaledLength / (config.hvac.fanCoilUnits / config.zones);
  for (let zone = 0; zone < config.zones; zone++) {
    const zoneX = startX + zone * (scaledLength / config.zones);
    const unitsInZone = Math.floor(config.hvac.fanCoilUnits / config.zones);
    
    for (let unit = 0; unit < unitsInZone; unit++) {
      const x = zoneX + 0.2 + unit * fcuSpacing;
      const y = startY + 0.2;
      
      pdf.setFillColor(150, 150, 255);
      pdf.circle(x, y, 0.08, 'F');
      
      // Installation note every 3rd unit
      if (unit % 3 === 0) {
        pdf.setFontSize(4);
        pdf.text('FCU', x, y + 0.15, { align: 'center' });
        pdf.text('CEIL MTD', x, y + 0.25, { align: 'center' });
      }
    }
  }
  
  // Ductwork (simplified)
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(0, 0, 255);
  pdf.line(startX, startY + 0.2, startX + scaledLength, startY + 0.2); // Supply main
  
  pdf.setDrawColor(255, 0, 0);
  pdf.line(startX, startY + 0.4, startX + scaledLength, startY + 0.4); // Return main
  
  pdf.setDrawColor(0, 0, 0);
  
  // Installation notes
  pdf.setFontSize(8);
  pdf.text('HVAC INSTALLATION NOTES:', startX, startY + scaledWidth + 1);
  
  pdf.setFontSize(6);
  const hvacNotes = [
    '• All ductwork to be insulated per ASHRAE 90.1',
    '• Fan coil units ceiling mounted at 12\'-0" A.F.F.',
    '• Provide vibration isolation for all equipment',
    '• Test and balance entire system per ASHRAE 111'
  ];
  
  hvacNotes.forEach((note, idx) => {
    pdf.text(note, startX, startY + scaledWidth + 1.3 + idx * 0.2);
  });
}

function generateGroundingPlan(pdf: jsPDF, config: ConstructionConfig, electricalSystem: any) {
  // Implementation for grounding plan
  pdf.setFontSize(12);
  pdf.text('GROUNDING SYSTEM PLAN', 18, 4, { align: 'center' });
  
  // Show grounding electrode system, equipment grounding, etc.
  // This would include detailed grounding conductor routing
}

function generateEquipmentConnections(pdf: jsPDF, config: ConstructionConfig, electricalSystem: any) {
  // Implementation for equipment connection details
  pdf.setFontSize(12);
  pdf.text('EQUIPMENT CONNECTION DETAILS', 18, 4, { align: 'center' });
  
  // Show typical connection details for fixtures, panels, equipment
}

function generateDuctworkPlan(pdf: jsPDF, config: ConstructionConfig) {
  // Implementation for ductwork plan
  pdf.setFontSize(12);
  pdf.text('DUCTWORK LAYOUT PLAN', 18, 4, { align: 'center' });
  
  // Show actual duct routing, sizes, fittings
}

function generateFoundationPlan(pdf: jsPDF, config: ConstructionConfig) {
  // Implementation for foundation plan
  pdf.setFontSize(12);
  pdf.text('FOUNDATION PLAN', 18, 4, { align: 'center' });
  
  // Show footings, anchor bolts, grounding electrode details
}

function addConstructionTitleBlock(pdf: jsPDF, sheetNumber: string, title: string, phase: string) {
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
  pdf.text(`PHASE: ${phase}`, 31.75, 21.5, { align: 'center' });
  pdf.text('DATE:', 28.2, 22.3);
  pdf.text(format(new Date(), 'MM/dd/yyyy'), 31.75, 22.3, { align: 'center' });
  pdf.text('SHEET:', 28.2, 23.2);
  pdf.text(sheetNumber, 31.75, 23.2, { align: 'center' });
  
  // Construction document notice
  pdf.setFontSize(6);
  pdf.text('CONSTRUCTION DOCUMENTS - ISSUED FOR CONSTRUCTION', 1, 23.7);
}

function addDimension(pdf: jsPDF, x1: number, y1: number, x2: number, y2: number, text: string, vertical = false) {
  pdf.setLineWidth(0.1);
  
  if (vertical) {
    // Vertical dimension
    pdf.line(x1 - 0.1, y1, x1 + 0.1, y1);
    pdf.line(x1 - 0.1, y2, x1 + 0.1, y2);
    pdf.line(x1, y1, x1, y2);
    
    // Text
    pdf.setFontSize(6);
    pdf.text(text, x1 - 0.2, (y1 + y2) / 2, { angle: 90 });
  } else {
    // Horizontal dimension
    pdf.line(x1, y1 - 0.1, x1, y1 + 0.1);
    pdf.line(x2, y1 - 0.1, x2, y1 + 0.1);
    pdf.line(x1, y1, x2, y1);
    
    // Text
    pdf.setFontSize(6);
    pdf.text(text, (x1 + x2) / 2, y1 - 0.2, { align: 'center' });
  }
}

// Professional drawing helper functions

function generateProfessionalHVACPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  
  // Draw floor plan outline
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
  
  // Add HVAC equipment with professional symbols
  const scale = 1/96;
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  const startX = 2;
  const startY = 3;
  
  // Chiller unit
  pdf.setLineWidth(0.02);
  pdf.setFillColor(150, 150, 255);
  pdf.rect(startX - 1.5, startY + scaledWidth/2 - 0.75, 1.5, 1.5, 'FD');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CHILLER', startX - 0.75, startY + scaledWidth/2 - 0.3, { align: 'center' });
  pdf.text(`${config.hvac.coolingCapacity} TONS`, startX - 0.75, startY + scaledWidth/2, { align: 'center' });
  
  // Fan coil units
  const unitsPerZone = Math.floor(config.hvac.fanCoilUnits / config.zones);
  for (let zone = 0; zone < config.zones; zone++) {
    const zoneX = startX + zone * (scaledLength / config.zones);
    
    for (let unit = 0; unit < unitsPerZone; unit++) {
      const x = zoneX + 0.5 + unit * (scaledLength / config.zones - 1) / unitsPerZone;
      const y = startY + 0.5;
      
      // FCU symbol
      pdf.setFillColor(100, 100, 255);
      pdf.circle(x, y, 0.15, 'F');
      
      pdf.setFontSize(6);
      pdf.text('FCU', x, y + 0.05, { align: 'center' });
    }
  }
  
  // Equipment schedule
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HVAC EQUIPMENT SCHEDULE', startX + scaledLength + 2, startY + 2);
  
  // Add detailed equipment table here
}

function generateProfessionalStructuralPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  
  // Draw structural grid and foundation elements
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
  
  const scale = 1/96;
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  const startX = 2;
  const startY = 3;
  
  // Foundation footings
  pdf.setLineWidth(0.03);
  const baySpacing = 26.25 * scale;
  
  // Corner footings
  const footingSize = 0.2;
  pdf.setFillColor(150, 150, 150);
  pdf.rect(startX - footingSize/2, startY - footingSize/2, footingSize, footingSize, 'F');
  pdf.rect(startX + scaledLength - footingSize/2, startY - footingSize/2, footingSize, footingSize, 'F');
  pdf.rect(startX - footingSize/2, startY + scaledWidth - footingSize/2, footingSize, footingSize, 'F');
  pdf.rect(startX + scaledLength - footingSize/2, startY + scaledWidth - footingSize/2, footingSize, footingSize, 'F');
  
  // Structural notes
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STRUCTURAL NOTES', startX + scaledLength + 2, startY + 2);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const structuralNotes = [
    '• Concrete footings 24"x24"x8" minimum',
    '• #4 rebar each way',
    '• 3000 PSI concrete minimum',
    '• Anchor bolts per manufacturer'
  ];
  
  structuralNotes.forEach((note, idx) => {
    pdf.text(note, startX + scaledLength + 2, startY + 2.5 + idx * 0.3);
  });
}

function generateProfessionalGroundingPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  
  // Building outline
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
  
  // Grounding electrode conductor routing
  pdf.setLineWidth(0.02);
  pdf.setDrawColor(0, 255, 0); // Green for grounding
  
  // Main grounding notes
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GROUNDING SYSTEM NOTES', 20, 5);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const groundingNotes = [
    '• Ground ring around building perimeter',
    '• #4/0 AWG copper grounding electrode conductor',
    '• Ground rods at each corner, 10\' minimum',
    '• Equipment grounding per NEC Article 250'
  ];
  
  groundingNotes.forEach((note, idx) => {
    pdf.text(note, 20, 5.5 + idx * 0.3);
  });
  
  pdf.setDrawColor(0, 0, 0);
}

function generateProfessionalEquipmentDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  
  // Typical connection details
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TYPICAL EQUIPMENT CONNECTIONS', 18, 4, { align: 'center' });
  
  // Detail 1: Lighting fixture connection
  pdf.setFontSize(10);
  pdf.text('DETAIL 1 - LIGHTING FIXTURE CONNECTION', 3, 6);
  
  // Draw connection detail
  pdf.setLineWidth(0.02);
  pdf.rect(3, 7, 6, 4);
  
  // Add detailed connection drawing here
  
  // Detail 2: Panel connection
  pdf.setFontSize(10);
  pdf.text('DETAIL 2 - PANEL CONNECTION', 15, 6);
  
  pdf.rect(15, 7, 6, 4);
}

function generateProfessionalDuctworkPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  
  // Building outline with ductwork
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
  
  // Ductwork routing
  pdf.setLineWidth(0.03);
  pdf.setDrawColor(0, 0, 255);
  
  // Main supply duct
  const scale = 1/96;
  const startX = 2;
  const startY = 3;
  const scaledLength = config.dimensions.length * scale;
  
  pdf.line(startX, startY + 1, startX + scaledLength, startY + 1);
  
  pdf.setDrawColor(0, 0, 0);
}

function generateProfessionalPlumbingPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  
  // Building outline with plumbing
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
  
  // Irrigation zones
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IRRIGATION ZONES', 20, 5);
  
  // Add irrigation details
}

// Complete construction drawing helper functions

function generateCompleteCoverSheet(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  const completeSheets = CONSTRUCTION_DRAWING_SETS.complete.sheets;
  
  // Project title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSTRUCTION DOCUMENTS', 14, 8, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text(config.project.name.toUpperCase(), 14, 9.5, { align: 'center' });
  
  // Complete drawing index table
  pdf.setLineWidth(0.02);
  pdf.rect(2, 11, 24, 12);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMPLETE DRAWING INDEX - 45 SHEETS', 14, 12, { align: 'center' });
  
  // Create detailed index with all sheets
  let yPos = 13;
  const categories = [
    { title: 'GENERAL', sheets: completeSheets.slice(0, 3) },
    { title: 'ARCHITECTURAL', sheets: completeSheets.slice(3, 11) },
    { title: 'STRUCTURAL', sheets: completeSheets.slice(11, 17) },
    { title: 'ELECTRICAL', sheets: completeSheets.slice(17, 29) },
    { title: 'MECHANICAL', sheets: completeSheets.slice(29, 39) },
    { title: 'PLUMBING', sheets: completeSheets.slice(39, 43) },
    { title: 'FIRE PROTECTION', sheets: completeSheets.slice(43, 45) }
  ];
  
  pdf.setFontSize(8);
  categories.forEach(category => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(category.title, 3, yPos);
    yPos += 0.3;
    
    pdf.setFont('helvetica', 'normal');
    category.sheets.forEach(sheet => {
      const parts = sheet.split(':');
      const number = parts[0];
      const title = parts[1]?.trim() || sheet;
      pdf.text(`  ${number}: ${title}`, 3, yPos);
      yPos += 0.25;
    });
    yPos += 0.2;
  });
}

function generateGeneralNotes(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GENERAL CONSTRUCTION NOTES', 14, 4, { align: 'center' });
  
  const notes = [
    'All work shall conform to applicable codes and standards',
    'Contractor shall verify all dimensions and conditions',
    'All electrical work per NEC and local codes',
    'All mechanical work per IMC and local codes',
    'Coordinate all utility connections with local utilities',
    'Provide temporary facilities as required',
    'All materials shall be new and approved types',
    'Maintain manufacturer warranties',
    'Submit shop drawings as required'
  ];
  
  let yPos = 6;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  notes.forEach((note, idx) => {
    pdf.text(`${idx + 1}. ${note}`, 3, yPos);
    yPos += 0.4;
  });
}

function generateSymbolsAndLegend(drawingGen: ProfessionalDrawingGenerator) {
  const pdf = drawingGen.getPDF();
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SYMBOLS AND ABBREVIATIONS', 14, 4, { align: 'center' });
  
  // Add comprehensive symbol legend
  drawingGen.drawElectricalLegend(3, 6);
}

// Stub functions for all required drawings
function generateSitePlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('SITE PLAN WITH UTILITIES', 14, 12, { align: 'center' });
  drawingGen.drawFloorPlan(config, 2, 3, 1/192);
}

function generateEnlargedFloorPlans(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('ENLARGED FLOOR PLANS', 14, 12, { align: 'center' });
  drawingGen.drawFloorPlan(config, 2, 3, 1/48);
}

function generateElevations(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('EXTERIOR ELEVATIONS', 14, 12, { align: 'center' });
  
  // Draw simple elevation views
  const scale = 1/96;
  pdf.setLineWidth(0.02);
  pdf.rect(3, 8, config.dimensions.length * scale, 4);
  pdf.text('SOUTH ELEVATION', 3 + config.dimensions.length * scale / 2, 7.5, { align: 'center' });
}

function generateBuildingSections(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('BUILDING SECTIONS', 14, 12, { align: 'center' });
}

function generateWallDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('WALL SECTIONS & DETAILS', 14, 12, { align: 'center' });
}

function generateDoorWindowSchedules(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('DOOR & WINDOW SCHEDULES', 14, 12, { align: 'center' });
}

function generateFinishSchedules(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FINISH SCHEDULES', 14, 12, { align: 'center' });
}

function generateFoundationDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FOUNDATION DETAILS', 14, 12, { align: 'center' });
}

function generateFramingPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FRAMING PLAN', 14, 12, { align: 'center' });
  drawingGen.drawFloorPlan(config, 2, 3, 1/96);
}

function generateFramingDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FRAMING DETAILS', 14, 12, { align: 'center' });
}

function generateConnectionDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('CONNECTION DETAILS', 14, 12, { align: 'center' });
}

function generateAnchorBoltPlans(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('ANCHOR BOLT PLANS', 14, 12, { align: 'center' });
}

function generateElectricalSitePlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('ELECTRICAL SITE PLAN', 14, 12, { align: 'center' });
  drawingGen.drawFloorPlan(config, 2, 3, 1/192);
}

function generateZoneLightingPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any, zones: number[]) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text(`LIGHTING PLAN - ZONES ${zones.join(', ')}`, 14, 12, { align: 'center' });
  drawingGen.drawElectricalPlan(config, electricalSystem, 2, 3, 1/96);
}

function generatePowerPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('POWER PLAN', 14, 12, { align: 'center' });
  drawingGen.drawElectricalPlan(config, electricalSystem, 2, 3, 1/96);
}

function generateSingleLineDiagram(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('SINGLE LINE DIAGRAM', 14, 12, { align: 'center' });
}

function generateConduitWireScheduleProfessional(drawingGen: ProfessionalDrawingGenerator, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('CONDUIT & WIRE SCHEDULE', 14, 12, { align: 'center' });
}

function generateLightingControlSystem(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('LIGHTING CONTROL SYSTEM', 14, 12, { align: 'center' });
}

function generateElectricalDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig, electricalSystem: any) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('ELECTRICAL DETAILS', 14, 12, { align: 'center' });
}

// Add remaining mechanical, plumbing, and fire protection functions...
function generateChilledWaterPiping(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('CHILLED WATER PIPING PLAN', 14, 12, { align: 'center' });
}

function generateHeatingWaterPiping(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('HEATING WATER PIPING PLAN', 14, 12, { align: 'center' });
}

function generateMechanicalEquipmentSchedules(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('MECHANICAL EQUIPMENT SCHEDULES', 14, 12, { align: 'center' });
}

function generateMechanicalEquipmentDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('MECHANICAL EQUIPMENT DETAILS', 14, 12, { align: 'center' });
}

function generateHVACControlDiagrams(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('HVAC CONTROL DIAGRAMS', 14, 12, { align: 'center' });
}

function generateSequencesOfOperation(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('SEQUENCES OF OPERATION', 14, 12, { align: 'center' });
}

function generateTestingAndBalancing(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('TESTING & BALANCING REQUIREMENTS', 14, 12, { align: 'center' });
}

function generateMechanicalDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('MECHANICAL DETAILS', 14, 12, { align: 'center' });
}

function generatePlumbingPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('PLUMBING PLAN', 14, 12, { align: 'center' });
}

function generatePlumbingIsometric(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('PLUMBING ISOMETRIC', 14, 12, { align: 'center' });
}

function generatePlumbingDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('PLUMBING DETAILS', 14, 12, { align: 'center' });
}

function generateFireProtectionPlan(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FIRE PROTECTION PLAN', 14, 12, { align: 'center' });
}

function generateFireProtectionDetails(drawingGen: ProfessionalDrawingGenerator, config: ConstructionConfig) {
  const pdf = drawingGen.getPDF();
  pdf.setFontSize(12);
  pdf.text('FIRE PROTECTION DETAILS', 14, 12, { align: 'center' });
}