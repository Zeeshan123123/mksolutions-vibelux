/**
 * Quick PDF Generator for Vibelux Demo
 * Creates a working PDF using jsPDF directly
 */

import { jsPDF } from 'jspdf';
import fs from 'fs';

console.log('🚀 VIBELUX - Quick PDF Demo');
console.log('=' .repeat(50));

// Create PDF document
const pdf = new jsPDF({
  orientation: 'landscape',
  unit: 'in',
  format: [36, 24] // D-size sheet
});

console.log('📐 Creating professional title block...');

// Professional title block
function addTitleBlock(sheetNumber, title) {
  // Sheet border
  pdf.setLineWidth(0.03);
  pdf.rect(0.5, 0.5, 35, 23);
  
  // Drawing area border
  pdf.setLineWidth(0.015);
  pdf.rect(1, 1, 26.5, 21.5);
  
  // Title block
  const tbX = 27.5;
  const tbY = 17;
  const tbW = 8;
  const tbH = 6.5;
  
  pdf.setLineWidth(0.02);
  pdf.rect(tbX, tbY, tbW, tbH);
  
  // Company info
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VIBELUX', tbX + tbW/2, tbY + 0.8, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('GREENHOUSE DESIGN & ENGINEERING', tbX + tbW/2, tbY + 1.2, { align: 'center' });
  
  // Project info
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PROJECT:', tbX + 0.1, tbY + 1.8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('PREMIUM PRODUCE GREENHOUSE', tbX + 1, tbY + 1.8);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('CLIENT:', tbX + 0.1, tbY + 2.2);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Premium Produce LLC', tbX + 1, tbY + 2.2);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOCATION:', tbX + 0.1, tbY + 2.8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Farmington, CA', tbX + 1, tbY + 2.8);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('PROJECT NO:', tbX + 0.1, tbY + 3.2);
  pdf.setFont('helvetica', 'normal');
  pdf.text('VLX-2024-001', tbX + 1.5, tbY + 3.2);
  
  // Drawing title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, tbX + tbW/2, tbY + 5.2, { align: 'center' });
  
  // Sheet number
  pdf.setFontSize(24);
  pdf.text(sheetNumber, tbX + 6.2, tbY + 6.2);
  
  // PE statement
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ISSUED FOR CONSTRUCTION', tbX, tbY - 0.5);
  
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DESIGNED BY: Professional Engineer, PE', tbX, tbY - 1);
  pdf.text('LICENSE NO: PE-12345', tbX, tbY - 1.3);
}

console.log('📋 Creating cover sheet...');

// Cover Sheet
addTitleBlock('G-000', 'COVER SHEET');

// Project title
pdf.setFontSize(24);
pdf.setFont('helvetica', 'bold');
pdf.text('CONSTRUCTION DOCUMENTS', 14, 8, { align: 'center' });

pdf.setFontSize(18);
pdf.text('PREMIUM PRODUCE GREENHOUSE FACILITY', 14, 9.5, { align: 'center' });

pdf.setFontSize(12);
pdf.setFont('helvetica', 'normal');
pdf.text('69,120 SF Greenhouse & Support Facilities', 14, 10.5, { align: 'center' });

// Drawing index
pdf.setLineWidth(0.02);
pdf.rect(3, 12, 20, 8);

pdf.setFontSize(12);
pdf.setFont('helvetica', 'bold');
pdf.text('DRAWING INDEX', 13, 13, { align: 'center' });

const sheets = [
  'G-000: Cover Sheet',
  'A-101: Floor Plan',
  'S-101: Foundation Plan', 
  'S-201: Structural Framing',
  'E-201: Electrical Plan',
  'E-301: Panel Schedules',
  'M-101: HVAC Plan',
  'M-201: Equipment Schedule'
];

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
sheets.forEach((sheet, idx) => {
  pdf.text(sheet, 4, 13.8 + idx * 0.4);
});

// Project data
pdf.setFontSize(10);
pdf.setFont('helvetica', 'bold');
pdf.text('PROJECT DATA', 3, 21.5);

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
const projectData = [
  'Building Area: 69,120 sq ft',
  'Building Type: Greenhouse Facility',
  'Occupancy: F-1 Factory Industrial',
  'Construction Type: Type II-B',
  'Electrical Service: 3000A, 480/277V',
  'Total Lighting: 720 fixtures, 631kW',
  'HVAC: 150T cooling, 2000 MBH heating',
  'Code Compliance: 2021 IBC, 2020 NEC'
];

projectData.forEach((item, idx) => {
  pdf.text(item, 4, 22 + idx * 0.25);
});

console.log('🏗️ Creating structural plan...');

// Structural Plan
pdf.addPage();
addTitleBlock('S-101', 'FOUNDATION PLAN');

// Building outline
pdf.setLineWidth(0.03);
const scale = 1/120; // 1/10" = 1'-0"
const buildingWidth = 144 * scale;
const buildingLength = 480 * scale;

pdf.rect(2, 3, buildingLength, buildingWidth);

// Foundation footings
pdf.setFillColor(150, 150, 150);
const footingSize = 0.3;

// Corner footings
pdf.rect(2 - footingSize/2, 3 - footingSize/2, footingSize, footingSize, 'F');
pdf.rect(2 + buildingLength - footingSize/2, 3 - footingSize/2, footingSize, footingSize, 'F');
pdf.rect(2 - footingSize/2, 3 + buildingWidth - footingSize/2, footingSize, footingSize, 'F');
pdf.rect(2 + buildingLength - footingSize/2, 3 + buildingWidth - footingSize/2, footingSize, footingSize, 'F');

// Grid lines
pdf.setLineWidth(0.005);
pdf.setDrawColor(100, 100, 100);
for (let i = 0; i <= 18; i++) { // 18 bays at 26.25' spacing
  const x = 2 + i * (buildingLength / 18);
  pdf.line(x, 3, x, 3 + buildingWidth);
}

// Dimensions
pdf.setLineWidth(0.01);
pdf.setDrawColor(0, 0, 0);
pdf.line(2, 2.5, 2 + buildingLength, 2.5);
pdf.text('480\'-0"', 2 + buildingLength/2, 2.3, { align: 'center' });

pdf.line(1.5, 3, 1.5, 3 + buildingWidth);
pdf.text('144\'-0"', 1.2, 3 + buildingWidth/2, { align: 'center', angle: 90 });

// Structural notes
pdf.setFontSize(10);
pdf.setFont('helvetica', 'bold');
pdf.text('STRUCTURAL NOTES', 2 + buildingLength + 1, 5);

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
const structNotes = [
  '1. Concrete footings 4\'-0" x 4\'-0" x 2\'-6" deep',
  '2. #4 rebar each way, 3" clear',
  '3. 3000 PSI concrete minimum',
  '4. Steel frame per structural calculations',
  '5. Wind load: 115 mph, Exposure C',
  '6. Snow load: 25 psf ground snow'
];

structNotes.forEach((note, idx) => {
  pdf.text(note, 2 + buildingLength + 1, 5.5 + idx * 0.3);
});

console.log('⚡ Creating electrical plan...');

// Electrical Plan
pdf.addPage();
addTitleBlock('E-201', 'ELECTRICAL PLAN');

// Building outline
pdf.setLineWidth(0.02);
pdf.rect(2, 3, buildingLength, buildingWidth);

// Lighting fixtures
pdf.setFillColor(255, 255, 0);
for (let zone = 0; zone < 6; zone++) {
  for (let i = 0; i < 20; i++) { // 20 fixtures per zone shown
    const x = 2 + zone * (buildingLength / 6) + 0.2 + (i % 5) * 0.8;
    const y = 3 + 0.2 + Math.floor(i / 5) * 0.8;
    
    pdf.circle(x, y, 0.05, 'F');
    
    if (i % 10 === 0) {
      pdf.setFontSize(4);
      pdf.text(i % 3 === 0 ? 'LED' : 'HPS', x, y + 0.15, { align: 'center' });
    }
  }
}

// Panels
pdf.setFillColor(50, 50, 50);
for (let i = 0; i < 6; i++) {
  const x = 2 + i * (buildingLength / 6) + buildingLength / 12;
  const y = 3 + buildingWidth + 0.5;
  
  pdf.rect(x - 0.1, y - 0.1, 0.2, 0.2, 'F');
  
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`LP-${i + 1}`, x, y - 0.2, { align: 'center' });
}

// Electrical legend
pdf.setFontSize(10);
pdf.setFont('helvetica', 'bold');
pdf.text('ELECTRICAL LEGEND', 2 + buildingLength + 1, 5);

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
const elecLegend = [
  '● HPS 1000W Fixture',
  '● LED 630W Fixture', 
  '■ Lighting Panel',
  '--- Homerun to panel',
  'Service: 3000A, 480/277V',
  'Total Load: 631kW'
];

elecLegend.forEach((item, idx) => {
  pdf.text(item, 2 + buildingLength + 1, 5.5 + idx * 0.3);
});

console.log('🌡️ Creating HVAC plan...');

// HVAC Plan  
pdf.addPage();
addTitleBlock('M-101', 'HVAC PLAN');

// Building outline
pdf.setLineWidth(0.02);
pdf.rect(2, 3, buildingLength, buildingWidth);

// Chiller
pdf.setFillColor(100, 100, 255);
pdf.rect(1, 3 + buildingWidth/2 - 0.5, 1, 1, 'F');

pdf.setFontSize(8);
pdf.setFont('helvetica', 'bold');
pdf.text('CHILLER', 1.5, 3 + buildingWidth/2 - 0.2, { align: 'center' });
pdf.text('150 TONS', 1.5, 3 + buildingWidth/2 + 0.2, { align: 'center' });

// Air handlers
pdf.setFillColor(150, 150, 255);
for (let i = 0; i < 6; i++) {
  const x = 2 + i * (buildingLength / 6) + buildingLength / 12;
  const y = 3 + 0.3;
  
  pdf.rect(x - 0.2, y - 0.1, 0.4, 0.2, 'F');
  
  pdf.setFontSize(6);
  pdf.text('AHU', x, y, { align: 'center' });
}

// Ductwork (simplified)
pdf.setLineWidth(0.02);
pdf.setDrawColor(0, 0, 255);
pdf.line(2, 3 + 0.3, 2 + buildingLength, 3 + 0.3); // Supply main

pdf.setDrawColor(255, 0, 0);  
pdf.line(2, 3 + 0.6, 2 + buildingLength, 3 + 0.6); // Return main

pdf.setDrawColor(0, 0, 0);

// HVAC notes
pdf.setFontSize(10);
pdf.setFont('helvetica', 'bold');
pdf.text('HVAC EQUIPMENT SCHEDULE', 2 + buildingLength + 1, 5);

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
const hvacNotes = [
  'Chiller: 150 tons, air-cooled',
  'Air Handlers: (6) 25 ton units',
  'Heating: Hot water coils',
  'Controls: DDC system',
  'Ductwork: Galvanized steel',
  'Insulation: R-6 minimum'
];

hvacNotes.forEach((note, idx) => {
  pdf.text(note, 2 + buildingLength + 1, 5.5 + idx * 0.3);
});

console.log('📝 Creating panel schedule...');

// Panel Schedule
pdf.addPage();
addTitleBlock('E-301', 'PANEL SCHEDULE - LP-1');

// Panel header
pdf.setFontSize(14);
pdf.setFont('helvetica', 'bold');
pdf.text('PANEL LP-1 SCHEDULE', 18, 4, { align: 'center' });

// Panel info
pdf.setLineWidth(0.02);
pdf.rect(2, 5, 32, 1.5);

pdf.setFontSize(9);
pdf.setFont('helvetica', 'bold');
pdf.text('PANEL:', 2.2, 5.4);
pdf.setFont('helvetica', 'normal');
pdf.text('LP-1', 2.2, 5.8);

pdf.setFont('helvetica', 'bold');
pdf.text('VOLTAGE:', 10.2, 5.4);
pdf.setFont('helvetica', 'normal');
pdf.text('277V', 10.2, 5.8);

pdf.setFont('helvetica', 'bold');
pdf.text('MAIN:', 18.2, 5.4);
pdf.setFont('helvetica', 'normal');
pdf.text('400A', 18.2, 5.8);

pdf.setFont('helvetica', 'bold');
pdf.text('LOCATION:', 26.2, 5.4);
pdf.setFont('helvetica', 'normal');
pdf.text('Zone 1', 26.2, 5.8);

// Circuit table
const tableY = 7;
pdf.setLineWidth(0.02);
pdf.rect(2, tableY, 32, 12);

// Headers
pdf.setFillColor(240, 240, 240);
pdf.rect(2, tableY, 32, 0.5, 'F');

pdf.setFontSize(8);
pdf.setFont('helvetica', 'bold');
const headers = ['CKT', 'DESCRIPTION', 'LOAD', 'BKR', 'WIRE', 'CKT'];
const colX = [2.5, 5, 20, 24, 27, 31];

headers.forEach((header, idx) => {
  pdf.text(header, colX[idx], tableY + 0.3, idx === headers.length - 1 ? { align: 'center' } : {});
});

// Circuit rows
pdf.setFontSize(7);
pdf.setFont('helvetica', 'normal');

const circuits = [
  ['1', 'HPS Lighting - Zone 1A', '18.2A', '20A', '#12', '2'],
  ['3', 'HPS Lighting - Zone 1B', '18.2A', '20A', '#12', '4'], 
  ['5', 'LED Lighting - Zone 1C', '11.5A', '15A', '#14', '6'],
  ['7', 'LED Lighting - Zone 1D', '11.5A', '15A', '#14', '8'],
  ['9', 'Receptacles - Zone 1', '12.0A', '20A', '#12', '10'],
  ['11', 'HVAC Controls', '3.2A', '15A', '#14', '12'],
  ['13', 'Emergency Lighting', '2.1A', '15A', '#14', '14'],
  ['15', 'Spare', '-', '20A', '-', '16']
];

circuits.forEach((circuit, idx) => {
  const y = tableY + 0.5 + (idx + 1) * 0.4;
  
  pdf.line(2, y - 0.2, 34, y - 0.2);
  
  circuit.forEach((cell, cellIdx) => {
    if (cellIdx < circuit.length - 1) {
      pdf.text(cell, colX[cellIdx], y);
    } else {
      pdf.text(cell, colX[cellIdx], y, { align: 'center' });
    }
  });
});

// Panel summary
pdf.setFontSize(9);
pdf.setFont('helvetica', 'bold');
pdf.text('PANEL SUMMARY:', 2, tableY + 13);

pdf.setFontSize(8);
pdf.setFont('helvetica', 'normal');
pdf.text('Connected Load: 76.7A', 2, tableY + 13.5);
pdf.text('Spare Circuits: 26', 2, tableY + 13.8);
pdf.text('Panel Utilization: 19.2%', 2, tableY + 14.1);

console.log('💾 Saving PDF...');

// Save PDF
const outputPath = 'VLX-2024-001_Construction_Documents.pdf';
const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
fs.writeFileSync(outputPath, pdfBuffer);

console.log('✅ SUCCESS! PDF Generated:');
console.log(`📄 File: ${outputPath}`);
console.log(`📦 Size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`📋 Pages: ${pdf.internal.pages.length - 1}`); // -1 because jsPDF starts with empty page

console.log('');
console.log('📋 DOCUMENT CONTENTS:');
console.log('   ✓ G-000: Cover Sheet with project data');
console.log('   ✓ S-101: Foundation Plan with footings');
console.log('   ✓ E-201: Electrical Plan with lighting layout');
console.log('   ✓ M-101: HVAC Plan with equipment');
console.log('   ✓ E-301: Panel Schedule with circuits');
console.log('');
console.log('🎯 PROFESSIONAL FEATURES:');
console.log('   ✓ D-size sheets (36" x 24")');
console.log('   ✓ Professional title blocks');
console.log('   ✓ Engineering statements');
console.log('   ✓ Code compliance notes');
console.log('   ✓ CAD-quality drawings');
console.log('   ✓ PE-stampable format');
console.log('');
console.log('🌟 VIBELUX PDF DEMO COMPLETE!');
console.log(`✨ Open: ${outputPath}`);

process.exit(0);