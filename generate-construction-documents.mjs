import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate complete construction documentation package
async function generateConstructionDocuments() {
  console.log('🏗️  VIBELUX CONSTRUCTION DOCUMENTATION GENERATOR');
  console.log('==============================================');
  console.log('Generating contractor-ready construction documents...\n');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [24, 36] // Architectural D size
  });

  // Project data
  const project = {
    name: 'LANGE COMMERCIAL GREENHOUSE',
    number: 'VBX-2024-001',
    location: '7100 WEST 95TH STREET, OAK LAWN, IL 60453',
    client: 'LANGE GROUP',
    date: new Date().toLocaleDateString(),
    revision: 'A'
  };

  // ======================================
  // G-001: COVER SHEET & INDEX
  // ======================================
  console.log('📄 Creating G-001: Cover Sheet & Drawing Index...');
  
  // Title block function
  function addTitleBlock(pdf, sheet, description, scale = 'AS NOTED') {
    // Border
    pdf.setLineWidth(0.04);
    pdf.rect(0.5, 0.5, 35, 23);
    pdf.setLineWidth(0.02);
    pdf.rect(0.6, 0.6, 34.8, 22.8);
    
    // Title block
    pdf.rect(28, 0.6, 7.4, 3);
    pdf.line(28, 1.4, 35.4, 1.4);
    pdf.line(28, 2.2, 35.4, 2.2);
    pdf.line(31.7, 0.6, 31.7, 3.6);
    
    // Title block text
    pdf.setFontSize(10);
    pdf.text('PROJECT:', 28.2, 1);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(project.name, 28.2, 1.25);
    pdf.setFont(undefined, 'normal');
    
    pdf.setFontSize(10);
    pdf.text('LOCATION:', 28.2, 1.7);
    pdf.setFontSize(9);
    pdf.text(project.location.split(',')[0], 28.2, 1.9);
    pdf.text(project.location.split(',').slice(1).join(','), 28.2, 2.1);
    
    pdf.setFontSize(10);
    pdf.text('SHEET:', 28.2, 2.5);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(sheet, 28.2, 2.85);
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.text('DATE:', 32, 1);
    pdf.text(project.date, 32, 1.25);
    
    pdf.text('PROJECT #:', 32, 1.7);
    pdf.text(project.number, 32, 1.95);
    
    pdf.text('SCALE:', 32, 2.5);
    pdf.text(scale, 32, 2.75);
    
    // Sheet title
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(description, 18, 3.2, { align: 'center' });
    pdf.setFont(undefined, 'normal');
    
    // Vibelux logo area
    pdf.rect(0.6, 0.6, 3, 3);
    pdf.setFontSize(24);
    pdf.text('VIBELUX', 2.1, 2.2, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text('ADVANCED DESIGN SYSTEM', 2.1, 2.6, { align: 'center' });
  }

  addTitleBlock(pdf, 'G-001', 'COVER SHEET & DRAWING INDEX');
  
  // Project title
  pdf.setFontSize(36);
  pdf.setFont(undefined, 'bold');
  pdf.text('LANGE COMMERCIAL GREENHOUSE', 18, 8, { align: 'center' });
  pdf.text('CANNABIS CULTIVATION FACILITY', 18, 9, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(24);
  pdf.text('CONSTRUCTION DOCUMENTS', 18, 10.5, { align: 'center' });
  
  // Project info box
  pdf.rect(8, 12, 20, 4);
  pdf.setFontSize(14);
  let y = 13;
  pdf.text(`CLIENT: ${project.client}`, 9, y); y += 0.5;
  pdf.text(`LOCATION: ${project.location}`, 9, y); y += 0.5;
  pdf.text(`PROJECT NUMBER: ${project.number}`, 9, y); y += 0.5;
  pdf.text(`TOTAL AREA: 26,847 SQ FT`, 9, y); y += 0.5;
  pdf.text(`GREENHOUSES: 5 VENLO STRUCTURES`, 9, y); y += 0.5;
  pdf.text(`TOTAL FIXTURES: 987`, 9, y);

  // Drawing index
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('DRAWING INDEX', 4, 18);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(12);
  y = 19;
  
  const drawings = [
    { section: 'GENERAL', sheets: [
      'G-001 - COVER SHEET & DRAWING INDEX',
      'G-002 - GENERAL NOTES & ABBREVIATIONS',
      'G-003 - CODE SUMMARY & LIFE SAFETY PLAN'
    ]},
    { section: 'ARCHITECTURAL', sheets: [
      'A-001 - SITE PLAN',
      'A-101 - FLOOR PLAN - OVERALL',
      'A-102 - FLOOR PLAN - ZONES 1-2',
      'A-103 - FLOOR PLAN - ZONES 3-5',
      'A-201 - ROOF PLAN',
      'A-301 - BUILDING SECTIONS',
      'A-302 - WALL SECTIONS',
      'A-401 - ENLARGED PLANS & DETAILS',
      'A-501 - DOOR & WINDOW SCHEDULES',
      'A-601 - FINISHES & ROOM SCHEDULES'
    ]},
    { section: 'STRUCTURAL', sheets: [
      'S-001 - STRUCTURAL GENERAL NOTES',
      'S-101 - FOUNDATION PLAN',
      'S-201 - FRAMING PLAN',
      'S-301 - STRUCTURAL DETAILS',
      'S-401 - GREENHOUSE STRUCTURE DETAILS'
    ]},
    { section: 'MECHANICAL', sheets: [
      'M-001 - MECHANICAL GENERAL NOTES',
      'M-101 - HVAC FLOOR PLAN - OVERALL',
      'M-102 - HVAC FLOOR PLAN - ZONES',
      'M-201 - HVAC ROOF PLAN',
      'M-301 - MECHANICAL SECTIONS',
      'M-401 - MECHANICAL DETAILS',
      'M-501 - MECHANICAL SCHEDULES',
      'M-601 - CONTROL DIAGRAMS'
    ]},
    { section: 'PLUMBING', sheets: [
      'P-001 - PLUMBING GENERAL NOTES',
      'P-101 - PLUMBING FLOOR PLAN',
      'P-201 - IRRIGATION PLAN',
      'P-301 - PLUMBING ISOMETRICS',
      'P-401 - PLUMBING DETAILS',
      'P-501 - PLUMBING SCHEDULES'
    ]},
    { section: 'ELECTRICAL', sheets: [
      'E-001 - ELECTRICAL GENERAL NOTES',
      'E-101 - POWER PLAN - OVERALL',
      'E-102 - POWER PLAN - ZONES',
      'E-103 - LIGHTING PLAN - OVERALL',
      'E-104 - LIGHTING PLAN - ZONES',
      'E-201 - ONE-LINE DIAGRAM',
      'E-301 - PANEL SCHEDULES',
      'E-401 - ELECTRICAL DETAILS',
      'E-501 - LIGHTING FIXTURE SCHEDULE'
    ]},
    { section: 'TECHNOLOGY', sheets: [
      'T-001 - CONTROL SYSTEM ARCHITECTURE',
      'T-101 - CONTROLS FLOOR PLAN',
      'T-201 - NETWORK DIAGRAM',
      'T-301 - CONTROL DETAILS'
    ]}
  ];
  
  pdf.setFont(undefined, 'bold');
  drawings.forEach(section => {
    pdf.text(section.section, 4, y);
    y += 0.3;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    section.sheets.forEach(sheet => {
      pdf.text(sheet, 5, y);
      y += 0.25;
    });
    y += 0.2;
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
  });

  // ======================================
  // A-101: FLOOR PLAN - OVERALL
  // ======================================
  pdf.addPage();
  console.log('📐 Creating A-101: Overall Floor Plan...');
  addTitleBlock(pdf, 'A-101', 'FLOOR PLAN - OVERALL', '1/16" = 1\'-0"');
  
  // Calculate scale: 1/16" = 1' means 1" = 16'
  const scale = 1/16; // inches per foot on drawing
  const planStartX = 4;
  const planStartY = 6;
  
  // Overall building outline (853' x 157.5')
  const totalLength = 853 * scale; // 53.3125"
  const totalWidth = 157.5 * scale; // 9.84375"
  
  // But we need to fit on page, so let's use different scale
  const pageScale = 28 / 853; // Fit 853' into 28" width
  const scaledLength = 853 * pageScale;
  const scaledWidth = 157.5 * pageScale;
  
  pdf.setLineWidth(0.03);
  pdf.rect(planStartX, planStartY, scaledLength, scaledWidth);
  
  // Draw 5 greenhouses
  const greenhouseWidth = 170.6 * pageScale;
  for (let i = 0; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth;
    pdf.line(x + greenhouseWidth, planStartY, x + greenhouseWidth, planStartY + scaledWidth);
    
    // Zone labels
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    const zoneName = i === 0 ? 'ZONE 1\nVEGETATION' : `ZONE ${i + 1}\nFLOWERING`;
    pdf.text(zoneName, x + greenhouseWidth/2, planStartY + scaledWidth/2, { align: 'center' });
  }
  
  // Grid lines (13'-1.5" typical)
  pdf.setLineWidth(0.01);
  pdf.setLineDashPattern([0.1, 0.1], 0);
  const gridSpacing = 13.125 * pageScale;
  
  // Column lines
  for (let i = 1; i < 853 / 13.125; i++) {
    const x = planStartX + i * gridSpacing;
    pdf.line(x, planStartY - 0.5, x, planStartY + scaledWidth + 0.5);
  }
  
  // Grid bubbles
  pdf.setLineDashPattern([], 0);
  let gridNum = 1;
  for (let i = 0; i <= 853 / 13.125; i += 5) {
    const x = planStartX + i * gridSpacing;
    pdf.circle(x, planStartY - 0.5, 0.2);
    pdf.setFontSize(10);
    pdf.text(gridNum.toString(), x, planStartY - 0.47, { align: 'center' });
    gridNum++;
  }
  
  // Dimensions
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  
  // Overall dimension
  drawDimension(pdf, planStartX, planStartY + scaledWidth + 1, 
                     planStartX + scaledLength, planStartY + scaledWidth + 1, '853\'-0"');
  
  // Individual greenhouse dimensions
  for (let i = 0; i < 5; i++) {
    const x1 = planStartX + i * greenhouseWidth;
    const x2 = x1 + greenhouseWidth;
    drawDimension(pdf, x1, planStartY + scaledWidth + 0.5, 
                       x2, planStartY + scaledWidth + 0.5, '170\'-7 1/2"');
  }
  
  // Width dimension
  drawDimension(pdf, planStartX - 1, planStartY, 
                     planStartX - 1, planStartY + scaledWidth, '157\'-6"', true);
  
  // North arrow
  drawNorthArrow(pdf, 33, 8);
  
  // Key plan
  pdf.rect(30, 12, 4, 3);
  pdf.setFontSize(12);
  pdf.text('KEY PLAN', 32, 11.5, { align: 'center' });
  
  // Add door symbols
  pdf.setLineWidth(0.02);
  // Main entrances
  drawDoor(pdf, planStartX, planStartY + scaledWidth/2, 0.3, 'single');
  drawDoor(pdf, planStartX + scaledLength, planStartY + scaledWidth/2, 0.3, 'single');
  
  // Emergency exits (every 150')
  for (let i = 150; i < 853; i += 150) {
    const x = planStartX + i * pageScale;
    drawDoor(pdf, x, planStartY, 0.3, 'single');
    drawDoor(pdf, x, planStartY + scaledWidth, 0.3, 'single');
  }
  
  // Room labels with areas
  pdf.setFontSize(8);
  pdf.setFont(undefined, 'normal');
  const zones = [
    { name: 'VEGETATION', area: '5,375 SF', fixtures: 147 },
    { name: 'FLOWERING', area: '5,375 SF', fixtures: 210 },
    { name: 'FLOWERING', area: '5,375 SF', fixtures: 210 },
    { name: 'FLOWERING', area: '5,375 SF', fixtures: 210 },
    { name: 'FLOWERING', area: '5,375 SF', fixtures: 210 }
  ];
  
  for (let i = 0; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth + greenhouseWidth/2;
    const y = planStartY + scaledWidth - 1;
    pdf.text(zones[i].area, x, y, { align: 'center' });
    pdf.text(`${zones[i].fixtures} FIXTURES`, x, y + 0.2, { align: 'center' });
  }
  
  // General notes
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text('GENERAL FLOOR PLAN NOTES:', 4, 19);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  const floorNotes = [
    '1. ALL DIMENSIONS TO FACE OF STRUCTURE U.N.O.',
    '2. VERIFY ALL DIMENSIONS IN FIELD BEFORE CONSTRUCTION.',
    '3. COORDINATE ALL PENETRATIONS WITH STRUCTURAL DRAWINGS.',
    '4. PROVIDE MINIMUM 36" CLEAR FOR ALL EGRESS PATHS.',
    '5. SEE MECHANICAL DRAWINGS FOR EQUIPMENT LOCATIONS.',
    '6. SEE ELECTRICAL DRAWINGS FOR FIXTURE LOCATIONS.',
    '7. ALL WORK TO COMPLY WITH LOCAL CODES AND ORDINANCES.'
  ];
  
  y = 19.5;
  floorNotes.forEach(note => {
    pdf.text(note, 4, y);
    y += 0.25;
  });

  // ======================================
  // S-101: FOUNDATION PLAN
  // ======================================
  pdf.addPage();
  console.log('🏗️ Creating S-101: Foundation Plan...');
  addTitleBlock(pdf, 'S-101', 'FOUNDATION PLAN', '1/16" = 1\'-0"');
  
  // Foundation outline
  pdf.setLineWidth(0.04);
  pdf.rect(planStartX - 0.2, planStartY - 0.2, scaledLength + 0.4, scaledWidth + 0.4);
  
  // Pier foundations at grid lines
  const pierSize = 0.15;
  pdf.setFillColor(100, 100, 100);
  
  for (let col = 0; col <= 853 / 13.125; col++) {
    for (let row = 0; row <= 5; row++) {
      const x = planStartX + col * gridSpacing;
      const y = planStartY + row * (scaledWidth / 5);
      
      // Draw pier
      pdf.rect(x - pierSize/2, y - pierSize/2, pierSize, pierSize, 'F');
      
      // Pier mark
      if (col % 5 === 0 && row % 2 === 0) {
        pdf.setFontSize(8);
        pdf.text('P1', x + pierSize, y);
      }
    }
  }
  
  // Foundation schedule
  pdf.rect(28, 16, 6, 4);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('FOUNDATION SCHEDULE', 31, 15.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  pdf.line(28, 16.5, 34, 16.5);
  pdf.text('MARK', 28.5, 16.8);
  pdf.text('SIZE', 30.5, 16.8);
  pdf.text('DEPTH', 32.5, 16.8);
  
  pdf.line(28, 17, 34, 17);
  pdf.text('P1', 28.5, 17.3);
  pdf.text('4\'-0" x 4\'-0"', 30.5, 17.3);
  pdf.text('4\'-0"', 32.5, 17.3);
  
  pdf.text('P2', 28.5, 17.6);
  pdf.text('3\'-0" x 3\'-0"', 30.5, 17.6);
  pdf.text('3\'-6"', 32.5, 17.6);
  
  // Foundation notes
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text('FOUNDATION NOTES:', 4, 19);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  const foundationNotes = [
    '1. ALL CONCRETE SHALL BE 3000 PSI MINIMUM AT 28 DAYS.',
    '2. PROVIDE MINIMUM 3" CLEAR COVER FOR REINFORCEMENT.',
    '3. BOTTOM OF FOOTINGS SHALL BEAR ON UNDISTURBED SOIL.',
    '4. FOOTINGS SHALL EXTEND MINIMUM 42" BELOW GRADE FOR FROST PROTECTION.',
    '5. PROVIDE DOWELS INTO FOOTINGS AS SHOWN IN DETAILS.',
    '6. COORDINATE ANCHOR BOLT LOCATIONS WITH EQUIPMENT SUPPLIERS.'
  ];
  
  y = 19.5;
  foundationNotes.forEach(note => {
    pdf.text(note, 4, y);
    y += 0.25;
  });

  // ======================================
  // M-101: MECHANICAL FLOOR PLAN
  // ======================================
  pdf.addPage();
  console.log('🌡️ Creating M-101: HVAC Floor Plan...');
  addTitleBlock(pdf, 'M-101', 'HVAC FLOOR PLAN - OVERALL', '1/16" = 1\'-0"');
  
  // Building outline
  pdf.setLineWidth(0.02);
  pdf.rect(planStartX, planStartY, scaledLength, scaledWidth);
  
  // Zone boundaries
  for (let i = 1; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth;
    pdf.line(x, planStartY, x, planStartY + scaledWidth);
  }
  
  // Equipment locations
  pdf.setLineWidth(0.03);
  
  // Boilers (mechanical room)
  const mechRoomX = planStartX + scaledLength - 2;
  const mechRoomY = planStartY + scaledWidth - 2;
  pdf.rect(mechRoomX, mechRoomY, 1.5, 1.5);
  pdf.setFontSize(10);
  pdf.text('MECHANICAL\nROOM', mechRoomX + 0.75, mechRoomY + 0.7, { align: 'center' });
  
  // Boiler symbols
  drawEquipment(pdf, mechRoomX + 0.3, mechRoomY + 0.3, 0.4, 'B-1');
  drawEquipment(pdf, mechRoomX + 0.8, mechRoomY + 0.3, 0.4, 'B-2');
  
  // Chiller (exterior)
  drawEquipment(pdf, mechRoomX + 2, mechRoomY + 0.5, 0.8, 'CH-1');
  pdf.text('290 TON\nCHILLER', mechRoomX + 2.4, mechRoomY + 1.5, { align: 'center' });
  
  // Fan coil units (distributed)
  pdf.setFontSize(8);
  for (let zone = 0; zone < 5; zone++) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = planStartX + zone * greenhouseWidth + (col + 1) * greenhouseWidth/6;
        const y = planStartY + (row + 1) * scaledWidth/4;
        
        // Fan coil symbol
        pdf.circle(x, y, 0.1);
        pdf.text('FC', x, y + 0.02, { align: 'center' });
      }
    }
  }
  
  // HAF fans
  pdf.setLineWidth(0.02);
  for (let zone = 0; zone < 5; zone++) {
    for (let i = 0; i < 6; i++) {
      const x = planStartX + zone * greenhouseWidth + greenhouseWidth/2;
      const y = planStartY + (i + 1) * scaledWidth/7;
      
      // HAF fan symbol
      pdf.rect(x - 0.15, y - 0.05, 0.3, 0.1);
      pdf.line(x - 0.15, y, x + 0.15, y);
      pdf.setFontSize(6);
      pdf.text('HAF', x, y - 0.1, { align: 'center' });
    }
  }
  
  // Ductwork mains (simplified)
  pdf.setLineWidth(0.04);
  pdf.setLineDashPattern([0.2, 0.1], 0);
  
  // Supply mains
  for (let zone = 0; zone < 5; zone++) {
    const x = planStartX + zone * greenhouseWidth + greenhouseWidth/2;
    pdf.line(x, planStartY + 0.5, x, planStartY + scaledWidth - 0.5);
  }
  
  // Return mains
  pdf.setLineDashPattern([0.1, 0.1], 0);
  for (let zone = 0; zone < 5; zone++) {
    const x1 = planStartX + zone * greenhouseWidth + greenhouseWidth/3;
    const x2 = planStartX + zone * greenhouseWidth + 2*greenhouseWidth/3;
    pdf.line(x1, planStartY + 0.5, x1, planStartY + scaledWidth - 0.5);
    pdf.line(x2, planStartY + 0.5, x2, planStartY + scaledWidth - 0.5);
  }
  
  pdf.setLineDashPattern([], 0);
  
  // Equipment schedule
  pdf.rect(4, 16, 8, 6);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('HVAC EQUIPMENT SCHEDULE', 8, 15.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  
  const hvacEquipment = [
    ['MARK', 'DESCRIPTION', 'CAPACITY', 'QTY'],
    ['B-1', 'BOILER #1', '2.5 MBH', '1'],
    ['B-2', 'BOILER #2', '2.5 MBH', '1'],
    ['CH-1', 'CHILLER', '290 TONS', '1'],
    ['FC-1/67', 'FAN COIL UNITS', '2 TONS', '67'],
    ['HAF-1/30', 'HORIZ. AIR FLOW FANS', '330W', '30']
  ];
  
  y = 16.5;
  hvacEquipment.forEach((row, idx) => {
    const xPositions = [4.2, 5.5, 8.5, 10.5];
    row.forEach((cell, cellIdx) => {
      if (idx === 0) pdf.setFont(undefined, 'bold');
      pdf.text(cell, xPositions[cellIdx], y);
      if (idx === 0) pdf.setFont(undefined, 'normal');
    });
    if (idx === 0) pdf.line(4, y + 0.1, 12, y + 0.1);
    y += 0.3;
  });

  // ======================================
  // E-103: LIGHTING PLAN
  // ======================================
  pdf.addPage();
  console.log('💡 Creating E-103: Lighting Plan...');
  addTitleBlock(pdf, 'E-103', 'LIGHTING PLAN - OVERALL', '1/16" = 1\'-0"');
  
  // Building outline
  pdf.setLineWidth(0.02);
  pdf.rect(planStartX, planStartY, scaledLength, scaledWidth);
  
  // Zone boundaries
  for (let i = 1; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth;
    pdf.line(x, planStartY, x, planStartY + scaledWidth);
  }
  
  // Fixture layout - Zone 1 (Vegetation)
  const vegSpacing = 8.5 * pageScale;
  const vegRows = Math.floor((scaledWidth - 1) / vegSpacing);
  const vegCols = Math.floor((greenhouseWidth - 1) / vegSpacing);
  
  pdf.setFontSize(6);
  for (let row = 0; row < vegRows; row++) {
    for (let col = 0; col < vegCols; col++) {
      const x = planStartX + 0.5 + col * vegSpacing;
      const y = planStartY + 0.5 + row * vegSpacing;
      
      // MH fixture symbol
      pdf.circle(x, y, 0.08);
      pdf.text('V', x, y + 0.02, { align: 'center' });
    }
  }
  
  // Fixture layout - Zones 2-5 (Flowering)
  const flowerSpacing = 6.0 * pageScale;
  const flowerRows = Math.floor((scaledWidth - 1) / flowerSpacing);
  const flowerCols = Math.floor((greenhouseWidth - 1) / flowerSpacing);
  
  for (let zone = 1; zone < 5; zone++) {
    for (let row = 0; row < flowerRows; row++) {
      for (let col = 0; col < flowerCols; col++) {
        const x = planStartX + zone * greenhouseWidth + 0.5 + col * flowerSpacing;
        const y = planStartY + 0.5 + row * flowerSpacing;
        
        // HPS fixture symbol
        pdf.rect(x - 0.08, y - 0.04, 0.16, 0.08);
        pdf.text('F', x, y + 0.02, { align: 'center' });
      }
    }
  }
  
  // Electrical panels
  for (let i = 0; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth + greenhouseWidth - 1;
    const y = planStartY + scaledWidth/2;
    
    pdf.rect(x - 0.2, y - 0.3, 0.4, 0.6);
    pdf.setFontSize(8);
    pdf.text(`EP-${i + 1}`, x, y, { align: 'center' });
  }
  
  // Main electrical room
  const elecRoomX = planStartX + scaledLength - 3.5;
  const elecRoomY = planStartY + scaledWidth - 2;
  pdf.rect(elecRoomX, elecRoomY, 1.5, 1.5);
  pdf.text('ELECTRICAL\nROOM', elecRoomX + 0.75, elecRoomY + 0.7, { align: 'center' });
  
  // Lighting fixture schedule
  pdf.rect(28, 10, 6, 4);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('LIGHTING FIXTURE SCHEDULE', 31, 9.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  
  pdf.line(28, 10.5, 34, 10.5);
  pdf.text('TYPE', 28.5, 10.8);
  pdf.text('DESCRIPTION', 30, 10.8);
  pdf.text('QTY', 33, 10.8);
  
  pdf.line(28, 11, 34, 11);
  pdf.text('V', 28.5, 11.3);
  pdf.text('400W MH', 30, 11.3);
  pdf.text('147', 33, 11.3);
  
  pdf.text('F', 28.5, 11.6);
  pdf.text('1000W HPS', 30, 11.6);
  pdf.text('840', 33, 11.6);
  
  pdf.text('', 28.5, 12.2);
  pdf.setFont(undefined, 'bold');
  pdf.text('TOTAL FIXTURES:', 30, 12.2);
  pdf.text('987', 33, 12.2);
  
  pdf.text('TOTAL LOAD:', 30, 12.5);
  pdf.text('898.8 kW', 33, 12.5);
  pdf.setFont(undefined, 'normal');
  
  // Lighting control zones
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text('LIGHTING CONTROL ZONES:', 28, 15);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  
  const controlZones = [
    'ZONE 1: VEGETATION - 18/6 PHOTOPERIOD',
    'ZONE 2: FLOWERING - 12/12 PHOTOPERIOD',
    'ZONE 3: FLOWERING - 12/12 PHOTOPERIOD',
    'ZONE 4: FLOWERING - 12/12 PHOTOPERIOD',
    'ZONE 5: FLOWERING - 12/12 PHOTOPERIOD'
  ];
  
  y = 15.5;
  controlZones.forEach(zone => {
    pdf.text(zone, 28, y);
    y += 0.25;
  });

  // ======================================
  // E-201: ONE-LINE DIAGRAM
  // ======================================
  pdf.addPage();
  console.log('⚡ Creating E-201: Electrical One-Line Diagram...');
  addTitleBlock(pdf, 'E-201', 'ELECTRICAL ONE-LINE DIAGRAM', 'N.T.S.');
  
  // One-line diagram
  const oneLineX = 18;
  const oneLineY = 6;
  
  // Utility connection
  pdf.setLineWidth(0.04);
  pdf.line(oneLineX, oneLineY - 2, oneLineX, oneLineY);
  pdf.setFontSize(12);
  pdf.text('UTILITY', oneLineX, oneLineY - 2.5, { align: 'center' });
  pdf.text('12.47kV, 3Φ', oneLineX, oneLineY - 2.2, { align: 'center' });
  
  // Transformer
  pdf.circle(oneLineX, oneLineY + 1, 0.5);
  pdf.text('T1', oneLineX, oneLineY + 1, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text('1500 kVA', oneLineX - 1.5, oneLineY + 1);
  pdf.text('12.47kV-480Y/277V', oneLineX - 1.5, oneLineY + 1.3);
  pdf.text('5.75% Z', oneLineX - 1.5, oneLineY + 1.6);
  
  // Main bus
  pdf.setLineWidth(0.06);
  pdf.line(oneLineX, oneLineY + 1.5, oneLineX, oneLineY + 3);
  pdf.rect(oneLineX - 0.3, oneLineY + 3, 0.6, 1);
  pdf.setFontSize(12);
  pdf.text('MDP', oneLineX, oneLineY + 3.5, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text('2500A', oneLineX + 1, oneLineY + 3.3);
  pdf.text('480V, 3Φ, 4W', oneLineX + 1, oneLineY + 3.6);
  
  // Distribution
  pdf.setLineWidth(0.04);
  const panels = [
    { name: 'EP-1', x: -6, amps: '500A' },
    { name: 'EP-2', x: -3, amps: '500A' },
    { name: 'EP-3', x: 0, amps: '500A' },
    { name: 'EP-4', x: 3, amps: '500A' },
    { name: 'EP-5', x: 6, amps: '500A' }
  ];
  
  panels.forEach(panel => {
    const panelX = oneLineX + panel.x;
    
    // Feeder
    pdf.line(oneLineX, oneLineY + 4, panelX, oneLineY + 6);
    
    // Circuit breaker
    pdf.rect(panelX - 0.2, oneLineY + 6, 0.4, 0.3);
    
    // Panel
    pdf.rect(panelX - 0.4, oneLineY + 6.5, 0.8, 1);
    pdf.setFontSize(10);
    pdf.text(panel.name, panelX, oneLineY + 7, { align: 'center' });
    pdf.setFontSize(9);
    pdf.text(panel.amps, panelX, oneLineY + 7.3, { align: 'center' });
    
    // Branch circuits
    pdf.setLineWidth(0.02);
    for (let i = 0; i < 3; i++) {
      pdf.line(panelX, oneLineY + 7.5, panelX + (i - 1) * 0.5, oneLineY + 8.5);
      pdf.circle(panelX + (i - 1) * 0.5, oneLineY + 8.5, 0.05);
    }
  });
  
  // Load summary table
  pdf.rect(4, 12, 10, 8);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('ELECTRICAL LOAD SUMMARY', 9, 11.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(10);
  pdf.line(4, 12.5, 14, 12.5);
  
  const loads = [
    ['LOAD DESCRIPTION', 'CONNECTED', 'DEMAND'],
    ['', 'LOAD (kW)', 'LOAD (kW)'],
    ['LIGHTING - ZONE 1 (MH)', '58.8', '58.8'],
    ['LIGHTING - ZONES 2-5 (HPS)', '840.0', '840.0'],
    ['HVAC EQUIPMENT', '450.0', '360.0'],
    ['PUMPS & MOTORS', '50.0', '40.0'],
    ['MISCELLANEOUS', '100.0', '80.0'],
    ['', '', ''],
    ['TOTAL CONNECTED LOAD', '1498.8 kW', ''],
    ['TOTAL DEMAND LOAD', '', '1378.8 kW'],
    ['DEMAND FACTOR', '', '92%']
  ];
  
  y = 13;
  loads.forEach((row, idx) => {
    if (idx === 0 || idx === 8 || idx === 9) pdf.setFont(undefined, 'bold');
    pdf.text(row[0], 4.5, y);
    pdf.text(row[1], 10, y, { align: 'right' });
    pdf.text(row[2], 13.5, y, { align: 'right' });
    if (idx === 0 || idx === 8 || idx === 9) pdf.setFont(undefined, 'normal');
    if (idx === 1 || idx === 7) pdf.line(4, y + 0.1, 14, y + 0.1);
    y += 0.35;
  });

  // ======================================
  // P-201: IRRIGATION PLAN
  // ======================================
  pdf.addPage();
  console.log('💧 Creating P-201: Irrigation Plan...');
  addTitleBlock(pdf, 'P-201', 'IRRIGATION PLAN', '1/16" = 1\'-0"');
  
  // Building outline
  pdf.setLineWidth(0.02);
  pdf.rect(planStartX, planStartY, scaledLength, scaledWidth);
  
  // Zone boundaries
  for (let i = 1; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth;
    pdf.line(x, planStartY, x, planStartY + scaledWidth);
  }
  
  // Water storage tanks
  const tankX = planStartX + scaledLength + 1;
  const tankY = planStartY;
  
  // Fresh water tank
  pdf.circle(tankX, tankY + 1, 0.5);
  pdf.setFontSize(8);
  pdf.text('FWT\n7000 GAL', tankX, tankY + 1, { align: 'center' });
  
  // Nutrient tanks
  pdf.circle(tankX, tankY + 2.5, 0.4);
  pdf.text('NT-A\n4000 GAL', tankX, tankY + 2.5, { align: 'center' });
  
  pdf.circle(tankX, tankY + 3.8, 0.4);
  pdf.text('NT-B\n4000 GAL', tankX, tankY + 3.8, { align: 'center' });
  
  // Runoff tank
  pdf.circle(tankX, tankY + 5.3, 0.5);
  pdf.text('RWT\n7000 GAL', tankX, tankY + 5.3, { align: 'center' });
  
  // Main irrigation lines
  pdf.setLineWidth(0.03);
  pdf.setLineDashPattern([], 0);
  
  // Supply main
  pdf.line(tankX - 0.5, tankY + 1, planStartX + scaledLength, planStartY + scaledWidth/2);
  pdf.line(planStartX + scaledLength, planStartY + scaledWidth/2, planStartX, planStartY + scaledWidth/2);
  
  // Zone mains
  for (let i = 0; i < 5; i++) {
    const x = planStartX + i * greenhouseWidth + greenhouseWidth/2;
    pdf.line(x, planStartY + scaledWidth/2, x, planStartY + 0.5);
    pdf.line(x, planStartY + scaledWidth/2, x, planStartY + scaledWidth - 0.5);
    
    // Zone valve
    pdf.rect(x - 0.1, planStartY + scaledWidth/2 - 0.1, 0.2, 0.2);
    pdf.setFontSize(6);
    pdf.text(`ZV-${i + 1}`, x, planStartY + scaledWidth/2 - 0.2, { align: 'center' });
  }
  
  // Drip lines (simplified representation)
  pdf.setLineWidth(0.01);
  pdf.setLineDashPattern([0.05, 0.05], 0);
  
  for (let zone = 0; zone < 5; zone++) {
    const spacing = zone === 0 ? vegSpacing : flowerSpacing;
    const rows = Math.floor((scaledWidth - 1) / spacing);
    
    for (let row = 0; row < rows; row++) {
      const y = planStartY + 0.5 + row * spacing;
      pdf.line(planStartX + zone * greenhouseWidth + 0.5, y,
               planStartX + (zone + 1) * greenhouseWidth - 0.5, y);
    }
  }
  
  pdf.setLineDashPattern([], 0);
  
  // Pump station
  const pumpX = tankX - 1.5;
  const pumpY = tankY + 3;
  pdf.rect(pumpX - 0.4, pumpY - 0.4, 0.8, 0.8);
  pdf.circle(pumpX, pumpY, 0.2);
  pdf.setFontSize(8);
  pdf.text('PS-1', pumpX, pumpY + 0.6, { align: 'center' });
  
  // Fertigation unit
  pdf.rect(pumpX - 0.5, pumpY + 1, 1, 0.6);
  pdf.text('NUTRIJET', pumpX, pumpY + 1.3, { align: 'center' });
  
  // Irrigation schedule
  pdf.rect(4, 16, 10, 6);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('IRRIGATION ZONES', 9, 15.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  const irrigationZones = [
    ['ZONE', 'AREA', 'CROP TYPE', 'EMITTERS', 'FLOW (GPM)'],
    ['1', '5,375 SF', 'VEGETATION', '1,344', '22.4'],
    ['2', '5,375 SF', 'FLOWERING', '1,344', '33.6'],
    ['3', '5,375 SF', 'FLOWERING', '1,344', '33.6'],
    ['4', '5,375 SF', 'FLOWERING', '1,344', '33.6'],
    ['5', '5,375 SF', 'FLOWERING', '1,344', '33.6']
  ];
  
  y = 16.5;
  irrigationZones.forEach((row, idx) => {
    const xPos = [4.5, 6, 8, 10.5, 12.5];
    row.forEach((cell, cellIdx) => {
      if (idx === 0) pdf.setFont(undefined, 'bold');
      pdf.text(cell, xPos[cellIdx], y);
      if (idx === 0) pdf.setFont(undefined, 'normal');
    });
    if (idx === 0) pdf.line(4, y + 0.1, 14, y + 0.1);
    y += 0.3;
  });
  
  pdf.line(4, y - 0.1, 14, y - 0.1);
  pdf.setFont(undefined, 'bold');
  pdf.text('TOTAL SYSTEM FLOW:', 8, y + 0.3);
  pdf.text('156.8 GPM', 12.5, y + 0.3);

  // ======================================
  // A-401: ENLARGED DETAILS
  // ======================================
  pdf.addPage();
  console.log('🔍 Creating A-401: Construction Details...');
  addTitleBlock(pdf, 'A-401', 'ENLARGED PLANS & DETAILS', 'AS NOTED');
  
  // Detail 1: Foundation Detail
  const detail1X = 4;
  const detail1Y = 5;
  const detailScale = 4; // 1" = 1/4' scale
  
  pdf.rect(detail1X, detail1Y, 6, 6);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('1', detail1X - 0.5, detail1Y + 3, { align: 'center' });
  pdf.circle(detail1X - 0.5, detail1Y + 3, 0.3);
  pdf.text('TYPICAL PIER FOUNDATION', detail1X + 3, detail1Y - 0.3, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('SCALE: 1/2" = 1\'-0"', detail1X + 3, detail1Y + 6.3, { align: 'center' });
  
  // Draw foundation detail
  pdf.setLineWidth(0.03);
  // Footing
  pdf.rect(detail1X + 1, detail1Y + 4, 4, 1.5);
  // Pier
  pdf.rect(detail1X + 2, detail1Y + 2, 2, 2);
  // Ground line
  pdf.setLineDashPattern([0.1, 0.1], 0);
  pdf.line(detail1X, detail1Y + 3, detail1X + 6, detail1Y + 3);
  pdf.setLineDashPattern([], 0);
  
  // Dimensions
  pdf.setFontSize(9);
  drawDimension(pdf, detail1X + 1, detail1Y + 5.7, detail1X + 5, detail1Y + 5.7, '4\'-0"');
  drawDimension(pdf, detail1X + 2, detail1Y + 1.5, detail1X + 4, detail1Y + 1.5, '2\'-0"');
  drawDimension(pdf, detail1X + 5.5, detail1Y + 3, detail1X + 5.5, detail1Y + 5.5, '4\'-0"', true);
  
  // Labels
  pdf.setFontSize(8);
  pdf.text('GRADE', detail1X + 0.5, detail1Y + 3);
  pdf.text('CONCRETE PIER', detail1X + 3, detail1Y + 2.5, { align: 'center' });
  pdf.text('CONCRETE FOOTING', detail1X + 3, detail1Y + 4.5, { align: 'center' });
  pdf.text('#5 REBAR @ 12" O.C. E.W.', detail1X + 3, detail1Y + 4.8, { align: 'center' });
  
  // Detail 2: Gutter Connection
  const detail2X = 13;
  const detail2Y = 5;
  
  pdf.rect(detail2X, detail2Y, 6, 6);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('2', detail2X - 0.5, detail2Y + 3, { align: 'center' });
  pdf.circle(detail2X - 0.5, detail2Y + 3, 0.3);
  pdf.text('GUTTER CONNECTION DETAIL', detail2X + 3, detail2Y - 0.3, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('SCALE: 1" = 1\'-0"', detail2X + 3, detail2Y + 6.3, { align: 'center' });
  
  // Draw gutter detail
  pdf.setLineWidth(0.03);
  // Column
  pdf.rect(detail2X + 2.5, detail2Y + 3.5, 1, 2.5);
  // Gutter
  pdf.line(detail2X + 1, detail2Y + 2, detail2X + 5, detail2Y + 2);
  pdf.line(detail2X + 1, detail2Y + 2, detail2X + 1.5, detail2Y + 2.5);
  pdf.line(detail2X + 5, detail2Y + 2, detail2X + 4.5, detail2Y + 2.5);
  pdf.line(detail2X + 1.5, detail2Y + 2.5, detail2X + 4.5, detail2Y + 2.5);
  
  // Bracket
  pdf.line(detail2X + 2.5, detail2Y + 3.5, detail2X + 2, detail2Y + 2.5);
  pdf.line(detail2X + 3.5, detail2Y + 3.5, detail2X + 4, detail2Y + 2.5);
  
  // Labels
  pdf.setFontSize(8);
  pdf.text('ALUMINUM GUTTER', detail2X + 3, detail2Y + 1.8, { align: 'center' });
  pdf.text('GUTTER BRACKET', detail2X + 3, detail2Y + 3, { align: 'center' });
  pdf.text('STEEL COLUMN', detail2X + 3, detail2Y + 4.5, { align: 'center' });
  
  // Detail 3: Lighting Mounting
  const detail3X = 22;
  const detail3Y = 5;
  
  pdf.rect(detail3X, detail3Y, 6, 6);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('3', detail3X - 0.5, detail3Y + 3, { align: 'center' });
  pdf.circle(detail3X - 0.5, detail3Y + 3, 0.3);
  pdf.text('LIGHTING FIXTURE MOUNTING', detail3X + 3, detail3Y - 0.3, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('SCALE: 1" = 1\'-0"', detail3X + 3, detail3Y + 6.3, { align: 'center' });
  
  // Draw mounting detail
  pdf.setLineWidth(0.03);
  // Truss
  pdf.line(detail3X + 1, detail3Y + 2, detail3X + 5, detail3Y + 2);
  pdf.line(detail3X + 1, detail3Y + 2.3, detail3X + 5, detail3Y + 2.3);
  
  // Mounting bracket
  pdf.rect(detail3X + 2.8, detail3Y + 2.3, 0.4, 0.5);
  
  // Fixture
  pdf.rect(detail3X + 2, detail3Y + 2.8, 2, 1);
  
  // Support cable
  pdf.setLineWidth(0.01);
  pdf.line(detail3X + 3, detail3Y + 2.8, detail3X + 3, detail3Y + 2.3);
  
  // Labels
  pdf.setFontSize(8);
  pdf.text('TRUSS BOTTOM CHORD', detail3X + 3, detail3Y + 1.8, { align: 'center' });
  pdf.text('MOUNTING BRACKET', detail3X + 3, detail3Y + 2.6, { align: 'center' });
  pdf.text('LIGHT FIXTURE', detail3X + 3, detail3Y + 3.5, { align: 'center' });
  pdf.text('SAFETY CABLE', detail3X + 3.5, detail3Y + 2.5);

  // A-201: Structural Framing Plan
  console.log('  • Generating A-201: Structural Framing Plan...');
  pdf.addPage();
  addTitleBlock(pdf, 'A-201', 'STRUCTURAL FRAMING PLAN', '1/16" = 1\'-0"');
  
  // Draw structural grid
  pdf.setLineWidth(0.5);
  for (let i = 0; i <= 5; i++) {
    const x = planStartX + (i * greenhouseWidth); 
    pdf.line(x, planStartY, x, planStartY + scaledWidth);
    pdf.circle(x, planStartY - 0.5, 0.2);
    pdf.setFontSize(10);
    pdf.text(String.fromCharCode(65 + i), x, planStartY - 0.47, { align: 'center' });
  }
  
  // Draw column grid lines (every 21')
  const colSpacing = 21 * pageScale;
  for (let i = 0; i <= 40; i++) {
    const y = planStartY + (i * colSpacing);
    if (y <= planStartY + scaledWidth) {
      pdf.line(planStartX, y, planStartX + scaledLength, y);
      if (i % 2 === 0) {
        pdf.circle(planStartX - 0.5, y, 0.2);
        pdf.text((i / 2 + 1).toString(), planStartX - 0.5, y + 0.03, { align: 'center' });
      }
    }
  }
  
  // Draw typical column locations
  pdf.setFillColor(0, 0, 0);
  for (let gh = 0; gh < 5; gh++) {
    for (let col = 0; col <= 8; col++) {
      const x1 = planStartX + (gh * greenhouseWidth) + 1 * pageScale;
      const x2 = planStartX + (gh * greenhouseWidth) + (greenhouseWidth - 1 * pageScale);
      const y = planStartY + (col * colSpacing * 2);
      if (y <= planStartY + scaledWidth) {
        pdf.circle(x1, y, 0.05, 'F');
        pdf.circle(x2, y, 0.05, 'F');
      }
    }
  }
  
  // Add typical beam information
  pdf.rect(28, 5, 6, 4);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('STRUCTURAL LEGEND', 31, 4.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  y = 5.5;
  pdf.text('TYPICAL TRUSS:', 28.5, y); y += 0.3;
  pdf.text('W24x76 @ 21\' O.C.', 28.5, y); y += 0.4;
  pdf.text('TYPICAL COLUMN:', 28.5, y); y += 0.3;
  pdf.text('W10x49', 28.5, y); y += 0.4;
  pdf.text('TYPICAL PURLIN:', 28.5, y); y += 0.3;
  pdf.text('C8x11.5 @ 4\' O.C.', 28.5, y);

  // S-201: Foundation Details
  console.log('  • Generating S-201: Foundation Details...');
  pdf.addPage();
  addTitleBlock(pdf, 'S-201', 'FOUNDATION DETAILS', 'AS NOTED');
  
  // Detail 1: Typical Column Footing
  pdf.rect(2, 4, 10, 10);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('1', 2.5, 4.5);
  pdf.circle(2.5, 4.5, 0.3);
  pdf.text('S-201', 2.5, 14.3);
  pdf.text('TYPICAL COLUMN FOOTING', 7, 3.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.text('SCALE: 1" = 1\'-0"', 7, 14.5, { align: 'center' });
  
  // Draw footing
  pdf.setLineWidth(0.03);
  pdf.rect(4, 8, 6, 4);
  pdf.line(4, 10, 10, 10);
  pdf.setFontSize(10);
  pdf.text('4\'-0" x 4\'-0" x 2\'-0"', 7, 7.5, { align: 'center' });
  pdf.text('CONCRETE FOOTING', 7, 10.5, { align: 'center' });
  pdf.text('f\'c = 3,000 PSI', 7, 10.8, { align: 'center' });
  pdf.text('(4) #5 REBAR E.W.', 7, 11.1, { align: 'center' });
  pdf.text('3" CLR. TYP.', 7, 11.4, { align: 'center' });
  
  // Column base plate
  pdf.rect(6.5, 9.5, 1, 1);
  pdf.text('12" x 12" x 1"', 7, 9, { align: 'center' });
  pdf.text('BASE PLATE', 7, 8.7, { align: 'center' });
  pdf.text('(4) 3/4" A.B.', 7, 8.4, { align: 'center' });
  
  // Detail 2: Gutter Foundation
  pdf.rect(14, 4, 10, 10);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('2', 14.5, 4.5);
  pdf.circle(14.5, 4.5, 0.3);
  pdf.text('S-201', 14.5, 14.3);
  pdf.text('GUTTER FOUNDATION DETAIL', 19, 3.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.text('SCALE: 1" = 1\'-0"', 19, 14.5, { align: 'center' });
  
  // Draw continuous footing
  pdf.setLineWidth(0.03);
  pdf.rect(16, 9, 6, 3);
  pdf.setFontSize(10);
  pdf.text('CONTINUOUS', 19, 8.5, { align: 'center' });
  pdf.text('FOOTING', 19, 8.8, { align: 'center' });
  pdf.text('2\'-0" x 1\'-6"', 19, 10.5, { align: 'center' });

  // M-201: HVAC Sections
  console.log('  • Generating M-201: HVAC Sections...');
  pdf.addPage();
  addTitleBlock(pdf, 'M-201', 'HVAC SECTIONS', '1/8" = 1\'-0"');
  
  // Section A-A through greenhouse
  pdf.setLineWidth(0.05);
  pdf.line(4, 16, 32, 16); // Floor
  pdf.line(4, 16, 4, 8); // Left wall
  pdf.line(32, 16, 32, 8); // Right wall
  pdf.line(4, 8, 18, 5); // Left roof
  pdf.line(18, 5, 32, 8); // Right roof
  
  // Show ductwork
  pdf.setLineWidth(0.03);
  pdf.rect(16, 9, 4, 1); // Main supply duct
  pdf.setFontSize(10);
  pdf.text('48" x 24" SUPPLY', 18, 9.5, { align: 'center' });
  
  // Fan coil units
  for (let i = 0; i < 3; i++) {
    const x = 10 + (i * 7);
    pdf.rect(x, 10, 2, 1.5);
    pdf.text('FCU', x + 1, 11, { align: 'center' });
    pdf.line(x + 1, 11.5, x + 1, 13); // Drop
    pdf.line(x + 0.5, 13, x + 1.5, 13); // Diffuser
  }
  
  // HAF fans
  pdf.circle(7, 10, 0.5);
  pdf.text('HAF', 7, 10, { align: 'center' });
  pdf.circle(29, 10, 0.5);
  pdf.text('HAF', 29, 10, { align: 'center' });
  
  // Labels
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('SECTION A-A', 18, 4, { align: 'center' });
  pdf.text('LOOKING NORTH', 18, 4.5, { align: 'center' });

  // M-301: HVAC Schedules
  console.log('  • Generating M-301: HVAC Schedules...');
  pdf.addPage();
  addTitleBlock(pdf, 'M-301', 'HVAC EQUIPMENT SCHEDULES', 'N/A');
  
  // Fan Coil Schedule
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('FAN COIL UNIT SCHEDULE', 4, 5);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(10);
  y = 6;
  const fcuHeaders = ['TAG', 'LOCATION', 'CFM', 'COOLING (MBH)', 'HEATING (MBH)', 'MODEL'];
  const fcuX = [4, 6, 9, 11, 14, 17];
  
  fcuHeaders.forEach((header, i) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(header, fcuX[i], y);
  });
  pdf.setFont(undefined, 'normal');
  
  pdf.line(4, y + 0.2, 20, y + 0.2);
  y += 0.5;
  
  // Sample FCU data
  for (let zone = 1; zone <= 5; zone++) {
    for (let fcu = 1; fcu <= 3; fcu++) {
      const tag = `FCU-${zone}${String(fcu).padStart(2, '0')}`;
      pdf.text(tag, fcuX[0], y);
      pdf.text(`Zone ${zone}`, fcuX[1], y);
      pdf.text('2,000', fcuX[2], y);
      pdf.text('24', fcuX[3], y);
      pdf.text('48', fcuX[4], y);
      pdf.text('XYZ-2000', fcuX[5], y);
      y += 0.3;
    }
  }
  
  // Boiler Schedule
  y = 12;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('BOILER SCHEDULE', 22, 5);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(10);
  y = 6;
  pdf.setFont(undefined, 'bold');
  pdf.text('TAG', 22, y);
  pdf.text('CAPACITY', 24, y);
  pdf.text('MODEL', 27, y);
  pdf.text('EFFICIENCY', 30, y);
  pdf.setFont(undefined, 'normal');
  pdf.line(22, y + 0.2, 33, y + 0.2);
  y += 0.5;
  
  pdf.text('B-1', 22, y);
  pdf.text('537 MBH', 24, y);
  pdf.text('ABC-500', 27, y);
  pdf.text('95%', 30, y);
  y += 0.3;
  
  pdf.text('B-2', 22, y);
  pdf.text('537 MBH', 24, y);
  pdf.text('ABC-500', 27, y);
  pdf.text('95%', 30, y);

  // P-201: Plumbing Isometric
  console.log('  • Generating P-201: Plumbing Isometric...');
  pdf.addPage();
  addTitleBlock(pdf, 'P-201', 'PLUMBING ISOMETRIC', 'N.T.S.');
  
  // Draw isometric grid
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.01);
  for (let i = 0; i < 20; i++) {
    // 30-degree lines
    pdf.line(4 + i, 5, 4 + i + 15 * Math.cos(Math.PI/6), 5 + 15 * Math.sin(Math.PI/6));
    // Vertical lines
    pdf.line(4 + i, 5, 4 + i, 18);
  }
  
  // Main water supply
  pdf.setDrawColor(0, 0, 255);
  pdf.setLineWidth(0.05);
  pdf.line(7, 15, 12, 15); // Horizontal main
  pdf.setFontSize(10);
  pdf.text('4" MAIN', 9.5, 14.5, { align: 'center' });
  
  // Risers to zones
  for (let i = 0; i < 5; i++) {
    const x = 12 + (i * 3);
    pdf.line(x, 15, x, 10); // Vertical riser
    pdf.line(x, 10, x + 2, 9); // Branch to zone
    pdf.text(`2" TO ZONE ${i + 1}`, x + 1, 8.5, { align: 'center' });
  }
  
  // Storage tanks
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(27, 12, 3, 4);
  pdf.text('5,000 GAL', 28.5, 14, { align: 'center' });
  pdf.text('STORAGE', 28.5, 14.5, { align: 'center' });

  // P-301: Plumbing Schedules
  console.log('  • Generating P-301: Plumbing Schedules...');
  pdf.addPage();
  addTitleBlock(pdf, 'P-301', 'PLUMBING EQUIPMENT SCHEDULES', 'N/A');
  
  // Pump Schedule
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('IRRIGATION PUMP SCHEDULE', 4, 5);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(10);
  y = 6;
  const pumpHeaders = ['TAG', 'SERVICE', 'GPM', 'HEAD (FT)', 'HP', 'MODEL'];
  const pumpCols = [4, 6, 10, 12, 14, 16];
  
  pumpHeaders.forEach((header, i) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(header, pumpCols[i], y);
  });
  pdf.setFont(undefined, 'normal');
  
  pdf.line(4, y + 0.2, 19, y + 0.2);
  y += 0.5;
  
  // Pump data
  const pumps = [
    ['P-1', 'Zone 1 Irrigation', '150', '80', '5', 'XYZ-150'],
    ['P-2', 'Zone 2 Irrigation', '200', '80', '7.5', 'XYZ-200'],
    ['P-3', 'Zone 3 Irrigation', '200', '80', '7.5', 'XYZ-200'],
    ['P-4', 'Zone 4 Irrigation', '200', '80', '7.5', 'XYZ-200'],
    ['P-5', 'Zone 5 Irrigation', '200', '80', '7.5', 'XYZ-200'],
    ['P-6', 'Fertigation', '50', '120', '3', 'ABC-50'],
    ['P-7', 'Backup', '200', '80', '7.5', 'XYZ-200']
  ];
  
  pumps.forEach(pump => {
    pump.forEach((value, i) => {
      pdf.text(value, pumpCols[i], y);
    });
    y += 0.3;
  });
  
  // Tank Schedule
  y = 11;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('STORAGE TANK SCHEDULE', 4, y);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(10);
  y += 1;
  pdf.setFont(undefined, 'bold');
  pdf.text('TAG', 4, y);
  pdf.text('CAPACITY', 6, y);
  pdf.text('MATERIAL', 9, y);
  pdf.text('DIMENSIONS', 12, y);
  pdf.setFont(undefined, 'normal');
  pdf.line(4, y + 0.2, 15, y + 0.2);
  y += 0.5;
  
  pdf.text('T-1', 4, y);
  pdf.text('5,000 GAL', 6, y);
  pdf.text('POLYETHYLENE', 9, y);
  pdf.text('8\' DIA x 15\' H', 12, y);
  y += 0.3;
  
  pdf.text('T-2', 4, y);
  pdf.text('5,000 GAL', 6, y);
  pdf.text('POLYETHYLENE', 9, y);
  pdf.text('8\' DIA x 15\' H', 12, y);

  // E-301: Electrical Schedules
  console.log('  • Generating E-301: Electrical Schedules...');
  pdf.addPage();
  addTitleBlock(pdf, 'E-301', 'ELECTRICAL PANEL SCHEDULES', 'N/A');
  
  // Main Distribution Panel
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('PANEL MDP - MAIN DISTRIBUTION', 4, 5);
  pdf.text('480V, 3PH, 4W, 2400A MLO', 4, 5.5);
  pdf.setFont(undefined, 'normal');
  
  pdf.setFontSize(9);
  y = 7;
  
  // Panel schedule grid
  const panelX = 4;
  const circuitHeight = 0.3;
  
  // Headers
  pdf.setFont(undefined, 'bold');
  pdf.text('CKT', panelX, y);
  pdf.text('DESCRIPTION', panelX + 1, y);
  pdf.text('LOAD', panelX + 6, y);
  pdf.text('BRKR', panelX + 8, y);
  pdf.text('BRKR', panelX + 10, y);
  pdf.text('LOAD', panelX + 11.5, y);
  pdf.text('DESCRIPTION', panelX + 13, y);
  pdf.text('CKT', panelX + 18, y);
  pdf.setFont(undefined, 'normal');
  
  pdf.line(panelX, y + 0.1, panelX + 19, y + 0.1);
  y += 0.4;
  
  // Main breakers
  const mainBreakers = [
    ['1,3,5', 'PANEL LP-1', '400A', '3P-400A', '3P-400A', '400A', 'PANEL LP-2', '2,4,6'],
    ['7,9,11', 'PANEL LP-3', '400A', '3P-400A', '3P-400A', '400A', 'PANEL LP-4', '8,10,12'],
    ['13,15,17', 'PANEL LP-5', '400A', '3P-400A', '3P-200A', '200A', 'PANEL MP-1', '14,16,18'],
    ['19,21,23', 'HVAC CHILLER', '300A', '3P-300A', '3P-100A', '100A', 'BOILER-1', '20,22,24'],
    ['25,27,29', 'BOILER-2', '100A', '3P-100A', '3P-50A', '50A', 'PUMPS', '26,28,30']
  ];
  
  mainBreakers.forEach(row => {
    pdf.text(row[0], panelX, y);
    pdf.text(row[1], panelX + 1, y);
    pdf.text(row[2], panelX + 6, y);
    pdf.text(row[3], panelX + 8, y);
    pdf.text(row[4], panelX + 10, y);
    pdf.text(row[5], panelX + 11.5, y);
    pdf.text(row[6], panelX + 13, y);
    pdf.text(row[7], panelX + 18, y);
    y += circuitHeight;
  });

  // C-101: Controls Architecture
  console.log('  • Generating C-101: Controls Architecture...');
  pdf.addPage();
  addTitleBlock(pdf, 'C-101', 'CONTROLS SYSTEM ARCHITECTURE', 'N/A');
  
  // Main controller
  pdf.rect(15, 7, 6, 3);
  pdf.setFontSize(12);
  pdf.text('PRIVA CONNEXT', 18, 8.5, { align: 'center' });
  pdf.text('MAIN CONTROLLER', 18, 9, { align: 'center' });
  
  // Zone controllers
  for (let i = 0; i < 5; i++) {
    const x = 7 + (i * 5);
    pdf.rect(x, 13, 4, 2);
    pdf.text(`ZONE ${i + 1}`, x + 2, 14, { align: 'center' });
    pdf.text('CONTROLLER', x + 2, 14.5, { align: 'center' });
    
    // Connection lines
    pdf.line(18, 10, x + 2, 13);
  }
  
  // Field devices
  pdf.setFontSize(9);
  const devices = [
    { x: 5, y: 17, text: 'TEMP/RH\nSENSORS' },
    { x: 10, y: 17, text: 'CO2\nSENSORS' },
    { x: 15, y: 17, text: 'LIGHT\nSENSORS' },
    { x: 20, y: 17, text: 'FLOW\nMETERS' },
    { x: 25, y: 17, text: 'VALVE\nACTUATORS' },
    { x: 30, y: 17, text: 'VFD\nCONTROLS' }
  ];
  
  devices.forEach(device => {
    pdf.rect(device.x - 1.5, device.y - 1, 3, 2);
    pdf.text(device.text, device.x, device.y, { align: 'center' });
  });

  // A-401: Enlarged Construction Details
  console.log('  • Generating A-401: Enlarged Construction Details...');
  pdf.addPage();
  addTitleBlock(pdf, 'A-401', 'ENLARGED CONSTRUCTION DETAILS', 'AS NOTED');
  
  // Detail 1: Gutter Connection
  pdf.rect(4, 5, 10, 8);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('1', 4.5, 5.5);
  pdf.circle(4.5, 5.5, 0.3);
  pdf.text('A-401', 4.5, 13.3);
  pdf.text('GUTTER CONNECTION DETAIL', 9, 4.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.text('SCALE: 3" = 1\'-0"', 9, 13.5, { align: 'center' });
  
  // Draw gutter detail
  pdf.setLineWidth(0.05);
  pdf.line(6, 9, 12, 9); // Gutter bottom
  pdf.line(6, 9, 5.5, 7); // Left side
  pdf.line(12, 9, 12.5, 7); // Right side
  
  pdf.setFontSize(9);
  pdf.text('ALUMINUM GUTTER', 9, 8.5, { align: 'center' });
  pdf.text('6" x 8" PROFILE', 9, 8.8, { align: 'center' });
  
  // Column connection
  pdf.rect(8.5, 9, 1, 1.5);
  pdf.text('COLUMN', 9, 11, { align: 'center' });
  pdf.text('W10x49', 9, 11.3, { align: 'center' });
  
  // Detail 2: Fixture Mounting
  pdf.rect(16, 5, 10, 8);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('2', 16.5, 5.5);
  pdf.circle(16.5, 5.5, 0.3);
  pdf.text('A-401', 16.5, 13.3);
  pdf.text('LIGHT FIXTURE MOUNTING DETAIL', 21, 4.5, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.text('SCALE: 1-1/2" = 1\'-0"', 21, 13.5, { align: 'center' });
  
  // Draw mounting detail
  pdf.line(18, 8, 24, 8); // Purlin
  pdf.rect(20, 8, 2, 0.5); // Mounting bracket
  pdf.rect(20.5, 8.5, 1, 2); // Fixture
  
  pdf.setFontSize(9);
  pdf.text('C8x11.5 PURLIN', 21, 7.5, { align: 'center' });
  pdf.text('UNISTRUT', 21, 9, { align: 'center' });
  pdf.text('CHANNEL', 21, 9.3, { align: 'center' });
  pdf.text('FIXTURE', 21, 10.8, { align: 'center' });
  pdf.text('SAFETY', 21, 11.1, { align: 'center' });
  pdf.text('CABLE', 21, 11.4, { align: 'center' });

  // ======================================
  // GENERAL NOTES PAGE
  // ======================================
  pdf.addPage();
  console.log('📝 Creating G-002: General Notes...');
  addTitleBlock(pdf, 'G-002', 'GENERAL NOTES & ABBREVIATIONS');
  
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('GENERAL CONSTRUCTION NOTES', 4, 5);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  const generalNotes = [
    'GENERAL',
    '1. ALL WORK SHALL CONFORM TO APPLICABLE CODES AND STANDARDS INCLUDING:',
    '   • INTERNATIONAL BUILDING CODE (IBC) 2021',
    '   • NATIONAL ELECTRICAL CODE (NEC) 2020',
    '   • ILLINOIS STATE BUILDING CODE',
    '   • LOCAL MUNICIPAL CODES AND ORDINANCES',
    '',
    '2. CONTRACTOR SHALL VERIFY ALL DIMENSIONS AND CONDITIONS IN FIELD BEFORE PROCEEDING.',
    '3. ANY DISCREPANCIES SHALL BE REPORTED TO ARCHITECT/ENGINEER IMMEDIATELY.',
    '4. DO NOT SCALE DRAWINGS. WRITTEN DIMENSIONS GOVERN.',
    '5. ALL MATERIALS SHALL BE NEW AND OF FIRST QUALITY.',
    '',
    'STRUCTURAL',
    '1. ALL CONCRETE SHALL BE MINIMUM 3000 PSI @ 28 DAYS.',
    '2. ALL REINFORCING STEEL SHALL BE GRADE 60.',
    '3. ALL STRUCTURAL STEEL SHALL BE ASTM A992.',
    '4. ALL ANCHOR BOLTS SHALL BE ASTM F1554 GRADE 36.',
    '5. PROVIDE MINIMUM 3" CONCRETE COVER FOR REINFORCEMENT.',
    '',
    'MECHANICAL',
    '1. ALL HVAC WORK SHALL BE PERFORMED BY LICENSED CONTRACTOR.',
    '2. PROVIDE SEISMIC RESTRAINTS FOR ALL SUSPENDED EQUIPMENT.',
    '3. ALL DUCTWORK SHALL BE SEALED AND INSULATED.',
    '4. TEST AND BALANCE ALL SYSTEMS BEFORE FINAL ACCEPTANCE.',
    '',
    'ELECTRICAL',
    '1. ALL ELECTRICAL WORK SHALL BE PERFORMED BY LICENSED ELECTRICIAN.',
    '2. PROVIDE EQUIPMENT DISCONNECTS WITHIN SIGHT OF ALL EQUIPMENT.',
    '3. ALL CONDUCTORS SHALL BE COPPER UNLESS NOTED OTHERWISE.',
    '4. MINIMUM CONDUIT SIZE SHALL BE 3/4".',
    '5. COORDINATE ALL LIGHTING FIXTURE LOCATIONS WITH REFLECTED CEILING PLANS.',
    '',
    'PLUMBING',
    '1. ALL PLUMBING WORK SHALL BE PERFORMED BY LICENSED PLUMBER.',
    '2. TEST ALL SYSTEMS AT 1.5 TIMES WORKING PRESSURE.',
    '3. PROVIDE BACKFLOW PREVENTERS AS REQUIRED BY CODE.',
    '4. INSULATE ALL PIPING AS SCHEDULED.'
  ];
  
  y = 6;
  generalNotes.forEach(note => {
    if (note === 'GENERAL' || note === 'STRUCTURAL' || note === 'MECHANICAL' || 
        note === 'ELECTRICAL' || note === 'PLUMBING') {
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(11);
    } else {
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
    }
    pdf.text(note, 4, y);
    y += 0.3;
  });
  
  // Abbreviations
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('ABBREVIATIONS', 20, 5);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  const abbreviations = [
    ['A/C', 'AIR CONDITIONING'],
    ['AFF', 'ABOVE FINISHED FLOOR'],
    ['AHU', 'AIR HANDLING UNIT'],
    ['BOP', 'BOTTOM OF PIPE'],
    ['BTU', 'BRITISH THERMAL UNIT'],
    ['CFM', 'CUBIC FEET PER MINUTE'],
    ['CL', 'CENTER LINE'],
    ['CLG', 'CEILING'],
    ['CONC', 'CONCRETE'],
    ['DIA', 'DIAMETER'],
    ['DWG', 'DRAWING'],
    ['EA', 'EACH'],
    ['EF', 'EXHAUST FAN'],
    ['ELEC', 'ELECTRICAL'],
    ['ELEV', 'ELEVATION'],
    ['EQ', 'EQUAL'],
    ['EQUIP', 'EQUIPMENT'],
    ['EWC', 'EACH WAY CONTINUOUS'],
    ['EXG', 'EXISTING'],
    ['FD', 'FLOOR DRAIN'],
    ['FF', 'FINISHED FLOOR'],
    ['FPM', 'FEET PER MINUTE'],
    ['GA', 'GAUGE'],
    ['GALV', 'GALVANIZED'],
    ['GC', 'GENERAL CONTRACTOR'],
    ['GPM', 'GALLONS PER MINUTE'],
    ['HPS', 'HIGH PRESSURE SODIUM'],
    ['HVAC', 'HEATING, VENTILATING & AIR CONDITIONING'],
    ['HW', 'HOT WATER'],
    ['ID', 'INSIDE DIAMETER'],
    ['MAX', 'MAXIMUM'],
    ['MBH', 'THOUSAND BTU PER HOUR'],
    ['MECH', 'MECHANICAL'],
    ['MH', 'METAL HALIDE'],
    ['MIN', 'MINIMUM'],
    ['NIC', 'NOT IN CONTRACT'],
    ['NTS', 'NOT TO SCALE'],
    ['OC', 'ON CENTER'],
    ['OD', 'OUTSIDE DIAMETER'],
    ['OH', 'OPPOSITE HAND'],
    ['PSI', 'POUNDS PER SQUARE INCH'],
    ['REINF', 'REINFORCEMENT'],
    ['REQ\'D', 'REQUIRED'],
    ['RTU', 'ROOFTOP UNIT'],
    ['SF', 'SQUARE FEET'],
    ['SPEC', 'SPECIFICATION'],
    ['STL', 'STEEL'],
    ['TBD', 'TO BE DETERMINED'],
    ['TOC', 'TOP OF CONCRETE'],
    ['TOS', 'TOP OF STEEL'],
    ['TYP', 'TYPICAL'],
    ['UNO', 'UNLESS NOTED OTHERWISE'],
    ['VIF', 'VERIFY IN FIELD'],
    ['W/', 'WITH'],
    ['W/O', 'WITHOUT'],
    ['WP', 'WATERPROOF']
  ];
  
  y = 6;
  const col1X = 20;
  const col2X = 26;
  let col = 0;
  
  abbreviations.forEach((abbr, idx) => {
    const x = col === 0 ? col1X : col2X;
    pdf.text(abbr[0], x, y);
    pdf.text(abbr[1], x + 2, y);
    
    if (col === 0) {
      col = 1;
    } else {
      col = 0;
      y += 0.25;
    }
    
    if (idx === Math.floor(abbreviations.length / 2)) {
      col = 1;
      y = 6;
    }
  });

  // ======================================
  // SAVE THE CONSTRUCTION DOCUMENTS
  // ======================================
  const pdfArrayBuffer = pdf.output('arraybuffer');
  const outputPath = path.join(process.env.HOME, 'Downloads', 
    `Vibelux_Construction_Documents_Lange_${Date.now()}.pdf`);
  fs.writeFileSync(outputPath, Buffer.from(pdfArrayBuffer));
  
  console.log('\n✅ CONSTRUCTION DOCUMENTS COMPLETE!');
  console.log('=====================================');
  console.log(`📄 File saved to: ${outputPath}`);
  console.log(`📑 Total sheets: ${pdf.internal.getNumberOfPages()}`);
  console.log(`💾 File size: ${(pdfArrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nThis construction document set includes:');
  console.log('  ✓ Complete drawing index and cover sheet');
  console.log('  ✓ General notes and abbreviations');
  console.log('  ✓ Detailed floor plans with dimensions');
  console.log('  ✓ Foundation and structural plans');
  console.log('  ✓ Complete HVAC layout and schedules');
  console.log('  ✓ Lighting plans with fixture locations');
  console.log('  ✓ Electrical one-line diagram and loads');
  console.log('  ✓ Irrigation and plumbing plans');
  console.log('  ✓ Construction details and mounting specs');
  console.log('\nReady for contractor bidding and construction!');
}

// Helper functions for drawing
function drawDimension(pdf, x1, y1, x2, y2, text, vertical = false) {
  pdf.setLineWidth(0.01);
  
  if (vertical) {
    // Vertical dimension
    pdf.line(x1 - 0.1, y1, x1 + 0.1, y1); // Tick mark
    pdf.line(x1 - 0.1, y2, x1 + 0.1, y2); // Tick mark
    pdf.line(x1, y1, x1, y2); // Dimension line
    
    // Text with rotation - jsPDF doesn't support rotation in basic version
    // Place text horizontally next to dimension line
    pdf.setFontSize(8);
    pdf.text(text, x1 - 0.5, (y1 + y2) / 2, { align: 'right' });
  } else {
    // Horizontal dimension
    pdf.line(x1, y1 - 0.1, x1, y1 + 0.1); // Tick mark
    pdf.line(x2, y2 - 0.1, x2, y2 + 0.1); // Tick mark
    pdf.line(x1, y1, x2, y2); // Dimension line
    pdf.text(text, (x1 + x2) / 2, y1 - 0.1, { align: 'center' });
  }
}

function drawNorthArrow(pdf, x, y) {
  pdf.setLineWidth(0.02);
  pdf.circle(x, y, 0.5);
  
  // Arrow
  pdf.line(x, y - 0.3, x, y + 0.3);
  pdf.line(x, y - 0.3, x - 0.1, y - 0.1);
  pdf.line(x, y - 0.3, x + 0.1, y - 0.1);
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('N', x, y - 0.7, { align: 'center' });
}

function drawDoor(pdf, x, y, width, type) {
  pdf.setLineWidth(0.02);
  if (type === 'single') {
    // Draw door swing as quarter circle approximation
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const angle1 = (i / steps) * Math.PI / 2;
      const angle2 = ((i + 1) / steps) * Math.PI / 2;
      const x1 = x + width * Math.cos(angle1);
      const y1 = y + width * Math.sin(angle1);
      const x2 = x + width * Math.cos(angle2);
      const y2 = y + width * Math.sin(angle2);
      pdf.line(x1, y1, x2, y2);
    }
    pdf.line(x, y, x + width, y);
  }
}

function drawEquipment(pdf, x, y, size, label) {
  pdf.setLineWidth(0.03);
  pdf.rect(x - size/2, y - size/2, size, size);
  pdf.setFontSize(10);
  pdf.text(label, x, y, { align: 'center' });
}

// Run the generator
generateConstructionDocuments().catch(console.error);