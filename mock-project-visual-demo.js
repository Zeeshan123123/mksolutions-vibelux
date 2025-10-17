#!/usr/bin/env node

/**
 * Mock Project Visual Demo - Cannabis Cultivation Facility
 * Shows what the advanced designer would generate
 */

const { jsPDF } = require('jspdf');
const fs = require('fs');

console.log('🌿 VIBELUX ADVANCED DESIGNER - MOCK PROJECT OUTPUT');
console.log('='.repeat(80));
console.log('📋 PROJECT: Green Valley Cannabis Cultivation Facility');
console.log('🏢 CLIENT: Green Valley Farms LLC');
console.log('📍 LOCATION: Denver, Colorado');
console.log('🎯 TYPE: Indoor Cannabis Cultivation - Seed to Sale');
console.log('');

// Create visual representation of project
const pdf = new jsPDF({
  orientation: 'landscape',
  unit: 'in',
  format: [11, 8.5]
});

// Page 1: Project Overview
pdf.setFontSize(24);
pdf.text('GREEN VALLEY CANNABIS FACILITY', 5.5, 1, { align: 'center' });
pdf.setFontSize(12);
pdf.text('Advanced Designer Output Preview', 5.5, 1.5, { align: 'center' });

// Facility layout visualization
pdf.setFontSize(10);
pdf.text('FACILITY LAYOUT (25,000 sq ft)', 1, 2.5);

// Draw zones
const zones = [
  { name: 'CLONE/MOTHER', x: 1, y: 3, w: 2, h: 1, color: [200, 255, 200] },
  { name: 'VEG 1', x: 3.5, y: 3, w: 2, h: 1.5, color: [150, 255, 150] },
  { name: 'VEG 2', x: 5.5, y: 3, w: 2, h: 1.5, color: [150, 255, 150] },
  { name: 'FLOWER 1', x: 1, y: 5, w: 2, h: 2, color: [255, 200, 200] },
  { name: 'FLOWER 2', x: 3.5, y: 5, w: 2, h: 2, color: [255, 200, 200] },
  { name: 'FLOWER 3', x: 6, y: 5, w: 2, h: 2, color: [255, 200, 200] },
  { name: 'DRY/TRIM', x: 8.5, y: 3, w: 1.5, h: 2, color: [200, 200, 255] },
  { name: 'SUPPORT', x: 8.5, y: 5.5, w: 1.5, h: 1.5, color: [220, 220, 220] }
];

zones.forEach(zone => {
  pdf.setFillColor(...zone.color);
  pdf.rect(zone.x, zone.y, zone.w, zone.h, 'F');
  pdf.setFillColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text(zone.name, zone.x + zone.w/2, zone.y + zone.h/2, { align: 'center' });
});

// Add new page for systems
pdf.addPage();
pdf.setFontSize(16);
pdf.text('INTEGRATED SYSTEMS DESIGN', 5.5, 1, { align: 'center' });

// Lighting system info
pdf.setFontSize(12);
pdf.text('LIGHTING SYSTEM:', 1, 2);
pdf.setFontSize(10);
const lightingInfo = [
  '• Total Fixtures: 228 LED fixtures',
  '• Total Load: 136.4 kW',
  '• Clone/Mother: 24 x T5 Fluorescent (200 PPFD)',
  '• Vegetative: 60 x 600W LED Full Spectrum (400 PPFD)',
  '• Flowering: 144 x 680W LED High Red (800 PPFD)',
  '• Control: Wireless dimming with sunrise/sunset simulation',
  '• Photoperiods: 18/6 (Veg), 12/12 (Flower)'
];
lightingInfo.forEach((info, i) => {
  pdf.text(info, 1.5, 2.5 + i * 0.3);
});

// Electrical system
pdf.text('ELECTRICAL SYSTEM:', 6, 2);
const electricalInfo = [
  '• Service: 1200A @ 480Y/277V 3-phase',
  '• Main Distribution: MDP-1 with surge protection',
  '• Lighting Panels: 6 x LP @ 225A each',
  '• Mechanical Panels: 2 x MP @ 400A each',
  '• Emergency Generator: 350kW diesel',
  '• Total Connected Load: 580 kW',
  '• Demand Factor: 85%'
];
electricalInfo.forEach((info, i) => {
  pdf.text(info, 6.5, 2.5 + i * 0.3);
});

// HVAC system
pdf.text('HVAC SYSTEM:', 1, 5.5);
const hvacInfo = [
  '• Cooling: 416 tons (5,000,000 BTU/hr)',
  '• Dehumidification: 12 units @ 500 pints/day',
  '• Air Handlers: 9 units with HEPA filtration',
  '• CO2 Enrichment: 1,200 ppm target',
  '• Exhaust: 24 fans with carbon filtration',
  '• Controls: BAS with zone-based setpoints'
];
hvacInfo.forEach((info, i) => {
  pdf.text(info, 1.5, 6 + i * 0.3);
});

// Environmental setpoints
pdf.text('ENVIRONMENTAL SETPOINTS:', 6, 5.5);
const envInfo = [
  '• Veg Temp: 75°F day / 68°F night',
  '• Flower Temp: 78°F day / 65°F night',
  '• Clone RH: 70%',
  '• Veg RH: 60%',
  '• Flower RH: 55% → 50% → 45%',
  '• Air Changes: 60 per hour'
];
envInfo.forEach((info, i) => {
  pdf.text(info, 6.5, 6 + i * 0.3);
});

// Add financial page
pdf.addPage();
pdf.setFontSize(16);
pdf.text('FINANCIAL ANALYSIS', 5.5, 1, { align: 'center' });

// Cost breakdown chart
pdf.setFontSize(12);
pdf.text('PROJECT COST BREAKDOWN:', 1, 2);

// Draw cost bars
const costs = [
  { category: 'Lighting System', amount: 193800, color: [100, 200, 100] },
  { category: 'Electrical Infrastructure', amount: 450000, color: [200, 100, 100] },
  { category: 'HVAC System', amount: 875000, color: [100, 100, 200] },
  { category: 'Controls & Automation', amount: 300000, color: [200, 200, 100] },
  { category: 'Construction', amount: 3750000, color: [150, 150, 150] }
];

const maxCost = Math.max(...costs.map(c => c.amount));
const barWidth = 6;
const barHeight = 0.4;

costs.forEach((cost, i) => {
  const barLength = (cost.amount / maxCost) * barWidth;
  pdf.setFillColor(...cost.color);
  pdf.rect(1, 2.5 + i * 0.6, barLength, barHeight, 'F');
  pdf.setFillColor(0, 0, 0);
  pdf.text(cost.category, 1, 2.4 + i * 0.6);
  pdf.text(`$${(cost.amount).toLocaleString()}`, 7.5, 2.7 + i * 0.6);
});

pdf.text(`TOTAL: $${costs.reduce((a, b) => a + b.amount, 0).toLocaleString()}`, 7.5, 6);

// ROI Analysis
pdf.setFontSize(12);
pdf.text('ROI PROJECTION:', 1, 6.5);
pdf.setFontSize(10);
const roiInfo = [
  '• Flowering Canopy: 12,000 sq ft',
  '• Annual Yield: 9,000 lbs',
  '• Revenue/Year: $16,200,000',
  '• Operating Costs: $4,860,000',
  '• Net Profit: $11,340,000',
  '• ROI Period: 0.5 years'
];
roiInfo.forEach((info, i) => {
  pdf.text(info, 1.5, 7 + i * 0.25);
});

// Energy efficiency
pdf.text('ENERGY METRICS:', 6, 6.5);
const energyInfo = [
  '• LPD: 5.5 W/sq ft',
  '• Annual Energy: 598,000 kWh',
  '• Energy Cost: $71,760/year',
  '• Yield Efficiency: 6.8 g/kWh',
  '• Carbon Footprint: 423 tons CO2/year'
];
energyInfo.forEach((info, i) => {
  pdf.text(info, 6.5, 7 + i * 0.25);
});

// Save the PDF
const pdfOutput = pdf.output('arraybuffer');
fs.writeFileSync('mock-cannabis-facility-preview.pdf', Buffer.from(pdfOutput));

console.log('📊 MOCK PROJECT OUTPUTS:');
console.log('');
console.log('1️⃣ FACILITY DESIGN:');
console.log('  ✓ 25,000 sq ft multi-zone cultivation facility');
console.log('  ✓ 9 specialized cultivation zones');
console.log('  ✓ Optimized workflow from clone to harvest');
console.log('  ✓ GMP-compliant layout');
console.log('');

console.log('2️⃣ LIGHTING DESIGN:');
console.log('  ✓ 228 fixtures with zone-specific spectrums');
console.log('  ✓ PPFD targets: 200 (clone) → 400 (veg) → 800 (flower)');
console.log('  ✓ DLI calculations for each growth stage');
console.log('  ✓ Wireless control with dimming schedules');
console.log('');

console.log('3️⃣ ELECTRICAL SYSTEM:');
console.log('  ✓ 1200A service with room for expansion');
console.log('  ✓ Dedicated lighting and mechanical panels');
console.log('  ✓ Emergency backup power system');
console.log('  ✓ Surge protection and power monitoring');
console.log('');

console.log('4️⃣ HVAC & ENVIRONMENTAL:');
console.log('  ✓ 416 tons of cooling capacity');
console.log('  ✓ 6,000 pints/day dehumidification');
console.log('  ✓ HEPA filtration for pest/pathogen control');
console.log('  ✓ CO2 enrichment to 1,200 ppm');
console.log('  ✓ Automated environmental controls');
console.log('');

console.log('5️⃣ SPECIAL SYSTEMS:');
console.log('  ✓ Fertigation: 8-zone automated dosing');
console.log('  ✓ Security: 64 cameras, biometric access');
console.log('  ✓ Monitoring: 84 environmental sensors');
console.log('  ✓ Fire suppression: Wet + pre-action systems');
console.log('');

console.log('6️⃣ DOCUMENTATION PACKAGE:');
console.log('  ✓ Construction drawings (15 sheets)');
console.log('  ✓ Equipment specifications');
console.log('  ✓ Operating sequences');
console.log('  ✓ Maintenance schedules');
console.log('  ✓ Compliance documentation');
console.log('');

console.log('💰 FINANCIAL SUMMARY:');
console.log('  • Total Investment: $5,568,800');
console.log('  • Annual Revenue: $16,200,000');
console.log('  • Annual Profit: $11,340,000');
console.log('  • ROI: 6 months');
console.log('  • 10-Year NPV: $78,543,000');
console.log('');

console.log('📈 PERFORMANCE METRICS:');
console.log('  • Yield: 0.75 lbs/sq ft/year');
console.log('  • Energy: 6.8 grams/kWh');
console.log('  • Water: 98% recirculation');
console.log('  • Labor: 12 sq ft/hour');
console.log('');

console.log('✅ FILES GENERATED:');
console.log('  📄 mock-cannabis-facility-preview.pdf');
console.log('  📏 Shows facility layout, systems, and financials');
console.log('');

console.log('🚀 This demonstrates what the /design/advanced page generates:');
console.log('  • Interactive 3D facility model');
console.log('  • Real-time PPFD/DLI calculations');
console.log('  • Automated fixture placement');
console.log('  • MEP system integration');
console.log('  • Professional construction documents');
console.log('  • Financial analysis and ROI');
console.log('  • Energy optimization');
console.log('  • Compliance verification');
console.log('');