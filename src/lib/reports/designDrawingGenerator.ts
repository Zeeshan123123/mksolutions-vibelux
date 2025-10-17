/**
 * Design Drawing Generator
 * Creates conceptual and schematic drawings for planning and presentations
 */

import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { DESIGN_DRAWING_SETS, getDrawingSet } from './drawingTypes';

export interface DesignConfig {
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

export async function generateDesignDrawings(config: DesignConfig, level: string): Promise<Blob> {
  const drawingSet = getDrawingSet('design', level);
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [24, 18] // Smaller format for design drawings
  });

  console.log(`Generating ${drawingSet.sheets.length} design drawing sheets...`);

  // Generate sheets based on level
  switch (level) {
    case 'basic':
      generateConceptualDrawings(pdf, config);
      break;
    case 'detailed':
      generateSchematicDrawings(pdf, config);
      break;
    case 'complete':
      generateDesignDevelopmentDrawings(pdf, config);
      break;
    default:
      generateConceptualDrawings(pdf, config);
  }

  return pdf.output('blob');
}

function generateConceptualDrawings(pdf: jsPDF, config: DesignConfig) {
  // Cover Sheet
  addTitleBlock(pdf, 'D-001', 'PROJECT OVERVIEW', 'DESIGN PHASE');
  
  pdf.setFontSize(20);
  pdf.text('DESIGN CONCEPT', 12, 4, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(config.project.name.toUpperCase(), 12, 5, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(config.project.location, 12, 5.5, { align: 'center' });
  
  // Project stats
  pdf.setFontSize(12);
  pdf.text('PROJECT PARAMETERS', 2, 7);
  
  pdf.setFontSize(9);
  const stats = [
    `Total Area: ${(config.dimensions.width * config.dimensions.length).toLocaleString()} sq ft`,
    `Building Length: ${config.dimensions.length}'`,
    `Building Width: ${config.dimensions.width}'`,
    `Growing Zones: ${config.zones}`,
    `Light Fixtures: ${config.fixtures.length}`,
    `Electrical Service: ${config.electrical.serviceSize}A ${config.electrical.voltage}`,
    `HVAC Cooling: ${config.hvac.coolingCapacity} tons`,
    `HVAC Heating: ${config.hvac.heatingCapacity} MBH`
  ];
  
  stats.forEach((stat, idx) => {
    pdf.text(`• ${stat}`, 2, 8 + idx * 0.3);
  });
  
  // Simple site plan
  pdf.addPage();
  addTitleBlock(pdf, 'D-002', 'SITE PLAN CONCEPT', '1" = 100\'');
  
  const scale = 0.01; // 1" = 100'
  const buildingWidth = config.dimensions.width * scale;
  const buildingLength = config.dimensions.length * scale;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(12 - buildingLength/2, 9 - buildingWidth/2, buildingLength, buildingWidth, 'FD');
  
  pdf.setFontSize(10);
  pdf.text('GREENHOUSE FACILITY', 12, 9, { align: 'center' });
  
  // Zone layout
  pdf.addPage();
  addTitleBlock(pdf, 'D-003', 'ZONE LAYOUT CONCEPT', '1/32" = 1\'');
  
  const zoneScale = 1/384;
  const scaledWidth = config.dimensions.width * zoneScale;
  const scaledLength = config.dimensions.length * zoneScale;
  
  pdf.setLineWidth(0.3);
  pdf.rect(4, 4, scaledLength, scaledWidth);
  
  // Show zones
  for (let i = 0; i < config.zones; i++) {
    const zoneX = 4 + i * (scaledLength / config.zones);
    const zoneWidth = scaledLength / config.zones;
    
    pdf.setLineDash([0.1, 0.1]);
    if (i > 0) pdf.line(zoneX, 4, zoneX, 4 + scaledWidth);
    pdf.setLineDash([]);
    
    pdf.setFontSize(8);
    pdf.text(`ZONE ${i + 1}`, zoneX + zoneWidth/2, 4 + scaledWidth/2, { align: 'center' });
  }
  
  // Systems overview
  pdf.addPage();
  addTitleBlock(pdf, 'D-004', 'SYSTEMS OVERVIEW', 'CONCEPTUAL');
  
  pdf.setFontSize(14);
  pdf.text('MAJOR BUILDING SYSTEMS', 12, 4, { align: 'center' });
  
  // System blocks
  const systems = [
    { name: 'ELECTRICAL SYSTEM', specs: `${config.electrical.serviceSize}A Service\n${config.fixtures.length} Fixtures`, x: 3, y: 6 },
    { name: 'HVAC SYSTEM', specs: `${config.hvac.coolingCapacity}T Cooling\n${config.hvac.heatingCapacity} MBH Heat`, x: 12, y: 6 },
    { name: 'IRRIGATION SYSTEM', specs: 'Zone-based Control\nAutomated Dosing', x: 21, y: 6 },
    { name: 'CONTROL SYSTEM', specs: 'Integrated Platform\nRemote Monitoring', x: 7.5, y: 11 }
  ];
  
  systems.forEach(system => {
    pdf.setFillColor(220, 220, 220);
    pdf.rect(system.x - 1.5, system.y - 1, 3, 2, 'FD');
    
    pdf.setFontSize(10);
    pdf.text(system.name, system.x, system.y - 0.5, { align: 'center' });
    
    pdf.setFontSize(8);
    const lines = system.specs.split('\n');
    lines.forEach((line, idx) => {
      pdf.text(line, system.x, system.y + idx * 0.3, { align: 'center' });
    });
  });
  
  console.log('✓ Conceptual design drawings generated');
}

function generateSchematicDrawings(pdf: jsPDF, config: DesignConfig) {
  // Start with conceptual drawings
  generateConceptualDrawings(pdf, config);
  
  // Add schematic-level detail
  pdf.addPage();
  addTitleBlock(pdf, 'D-005', 'ELECTRICAL SCHEMATIC', 'SINGLE LINE');
  
  // Simple single line diagram
  pdf.setFontSize(12);
  pdf.text('ELECTRICAL DISTRIBUTION', 12, 3, { align: 'center' });
  
  let yPos = 5;
  
  // Service
  pdf.rect(11, yPos, 2, 0.8);
  pdf.setFontSize(8);
  pdf.text('UTILITY SERVICE', 12, yPos + 0.4, { align: 'center' });
  pdf.text(config.electrical.voltage, 12, yPos + 0.6, { align: 'center' });
  
  // Main panel
  yPos += 2;
  pdf.rect(10.5, yPos, 3, 1);
  pdf.text('MAIN PANEL', 12, yPos + 0.4, { align: 'center' });
  pdf.text(`${config.electrical.serviceSize}A`, 12, yPos + 0.7, { align: 'center' });
  
  // Distribution
  yPos += 2;
  for (let i = 0; i < config.zones; i++) {
    const x = 6 + i * 2.4;
    pdf.rect(x, yPos, 1.6, 0.8);
    pdf.text(`ZONE ${i + 1}`, x + 0.8, yPos + 0.4, { align: 'center' });
    
    // Connect to main
    pdf.line(12, yPos - 1, x + 0.8, yPos);
  }
  
  // HVAC schematic
  pdf.addPage();
  addTitleBlock(pdf, 'D-006', 'HVAC SCHEMATIC', 'CONCEPTUAL');
  
  pdf.setFontSize(12);
  pdf.text('HVAC SYSTEM CONCEPT', 12, 3, { align: 'center' });
  
  // Equipment layout
  const equipment = [
    { name: 'CHILLER', capacity: `${config.hvac.coolingCapacity}T`, x: 4, y: 6 },
    { name: 'BOILER', capacity: `${config.hvac.heatingCapacity} MBH`, x: 12, y: 6 },
    { name: 'FAN COILS', capacity: `${config.hvac.fanCoilUnits} Units`, x: 20, y: 6 }
  ];
  
  equipment.forEach(equip => {
    pdf.setFillColor(200, 220, 255);
    pdf.rect(equip.x - 1, equip.y - 0.8, 2, 1.6, 'FD');
    
    pdf.setFontSize(9);
    pdf.text(equip.name, equip.x, equip.y - 0.2, { align: 'center' });
    pdf.text(equip.capacity, equip.x, equip.y + 0.2, { align: 'center' });
  });
  
  // Connect with pipes
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(0, 0, 255);
  pdf.line(5, 6, 19, 6); // Supply main
  pdf.setDrawColor(255, 0, 0);
  pdf.line(5, 6.5, 19, 6.5); // Return main
  pdf.setDrawColor(0, 0, 0);
  
  console.log('✓ Schematic design drawings generated');
}

function generateDesignDevelopmentDrawings(pdf: jsPDF, config: DesignConfig) {
  // Include schematic drawings
  generateSchematicDrawings(pdf, config);
  
  // Add design development details
  pdf.addPage();
  addTitleBlock(pdf, 'D-007', 'DETAILED FLOOR PLAN', '1/16" = 1\'');
  
  const scale = 1/192;
  const scaledWidth = config.dimensions.width * scale;
  const scaledLength = config.dimensions.length * scale;
  
  pdf.setLineWidth(0.3);
  pdf.rect(2, 2, scaledLength, scaledWidth);
  
  // Zone details with equipment
  for (let i = 0; i < config.zones; i++) {
    const zoneX = 2 + i * (scaledLength / config.zones);
    const zoneWidth = scaledLength / config.zones;
    
    // Zone boundary
    pdf.setLineDash([0.05, 0.05]);
    if (i > 0) pdf.line(zoneX, 2, zoneX, 2 + scaledWidth);
    pdf.setLineDash([]);
    
    // Equipment in zone
    const equipCount = Math.floor(config.hvac.fanCoilUnits / config.zones);
    for (let j = 0; j < equipCount && j < 5; j++) {
      const equipX = zoneX + 0.2 + j * (zoneWidth - 0.4) / 5;
      const equipY = 2 + 0.2;
      
      pdf.setFillColor(200, 200, 255);
      pdf.circle(equipX, equipY, 0.1, 'F');
    }
    
    // Zone label
    pdf.setFontSize(6);
    pdf.text(`ZONE ${i + 1}`, zoneX + zoneWidth/2, 2 + scaledWidth + 0.2, { align: 'center' });
  }
  
  // Equipment schedules
  pdf.addPage();
  addTitleBlock(pdf, 'D-008', 'EQUIPMENT SCHEDULES', 'N.T.S.');
  
  pdf.setFontSize(12);
  pdf.text('MAJOR EQUIPMENT SCHEDULE', 12, 3, { align: 'center' });
  
  // Equipment table
  pdf.setFontSize(8);
  const equipHeaders = ['EQUIPMENT', 'QUANTITY', 'CAPACITY', 'ELECTRICAL', 'NOTES'];
  const equipData = [
    ['Chiller', '1', `${config.hvac.coolingCapacity} Tons`, '415A, 480V', 'Air-cooled'],
    ['Boiler', '2', `${config.hvac.heatingCapacity/2} MBH ea`, '40HP ea', 'Natural gas'],
    ['Fan Coil Units', config.hvac.fanCoilUnits.toString(), '60 MBH ea', '12A, 208V', 'Ceiling mounted'],
    ['HPS Fixtures', config.fixtures.length.toString(), '1000W ea', '277V', 'Adjustable height']
  ];
  
  // Table header
  let yPos = 5;
  equipHeaders.forEach((header, idx) => {
    pdf.text(header, 2 + idx * 4, yPos);
  });
  
  yPos += 0.3;
  pdf.line(2, yPos, 22, yPos);
  yPos += 0.2;
  
  // Table data
  equipData.forEach(row => {
    row.forEach((cell, idx) => {
      pdf.text(cell, 2 + idx * 4, yPos);
    });
    yPos += 0.3;
  });
  
  // Energy analysis
  pdf.addPage();
  addTitleBlock(pdf, 'D-009', 'ENERGY ANALYSIS', 'DESIGN');
  
  pdf.setFontSize(12);
  pdf.text('ENERGY PERFORMANCE ANALYSIS', 12, 3, { align: 'center' });
  
  const totalLightingLoad = config.fixtures.length * 1000; // 1000W per fixture
  const totalHVACLoad = (config.hvac.coolingCapacity * 3.5 + config.hvac.heatingCapacity) * 1000; // Rough conversion
  const totalLoad = totalLightingLoad + totalHVACLoad;
  
  pdf.setFontSize(10);
  pdf.text('LOAD SUMMARY', 2, 6);
  
  pdf.setFontSize(9);
  const energyData = [
    `Lighting Load: ${(totalLightingLoad/1000).toLocaleString()} kW`,
    `HVAC Load: ${(totalHVACLoad/1000).toLocaleString()} kW`,
    `Total Connected Load: ${(totalLoad/1000).toLocaleString()} kW`,
    `Power Density: ${((totalLoad/1000)/(config.dimensions.width * config.dimensions.length)*1000).toFixed(1)} W/sq ft`,
    `Annual Energy (est): ${((totalLoad/1000) * 4000).toLocaleString()} kWh`
  ];
  
  energyData.forEach((item, idx) => {
    pdf.text(`• ${item}`, 2, 7 + idx * 0.4);
  });
  
  console.log('✓ Design development drawings generated');
}

function addTitleBlock(pdf: jsPDF, sheetNumber: string, title: string, phase: string) {
  // Border
  pdf.setLineWidth(0.5);
  pdf.rect(0.5, 0.5, 23, 17);
  pdf.rect(0.75, 0.75, 22.5, 16.5);
  
  // Title block
  pdf.rect(18, 15, 5.5, 2.5);
  pdf.line(18, 16, 23.5, 16);
  pdf.line(20.75, 15, 20.75, 17.5);
  
  // Text
  pdf.setFontSize(10);
  pdf.text(title, 20.75, 15.7, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text(`PHASE: ${phase}`, 20.75, 16.3, { align: 'center' });
  pdf.text('DATE:', 18.2, 16.8);
  pdf.text(format(new Date(), 'MM/dd/yyyy'), 20.75, 16.8, { align: 'center' });
  pdf.text('SHEET:', 18.2, 17.3);
  pdf.text(sheetNumber, 20.75, 17.3, { align: 'center' });
  
  // Design phase watermark
  pdf.setFontSize(6);
  pdf.text('DESIGN PHASE - NOT FOR CONSTRUCTION', 1, 17.7);
}