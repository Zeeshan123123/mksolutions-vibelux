#!/usr/bin/env node

/**
 * Test Complete Vibelux Workflow with Boundary Cone Data
 * This demonstrates the full project flow from drawing import to professional report
 */

const fs = require('fs');
const path = require('path');

// Boundary Cone room data from the PDF
const boundaryConeData = {
  metadata: {
    fileName: 'Mohave_Cannabis_Co_Flower_Rooms.PDF',
    roomName: 'Boundary Cone',
    projectName: 'Mohave Cannabis Co. Cultivation Facility',
    importDate: new Date().toISOString()
  },
  dimensions: {
    length: 66,
    width: 22,
    height: 10,
    unit: 'feet'
  },
  area: 1452, // sq ft
  rooms: [{
    name: 'Boundary Cone',
    dimensions: { length: 66, width: 22, height: 10 },
    area: 1452,
    type: 'flower'
  }]
};

// Step 1: Parse Drawing (simulated)
console.log('=== STEP 1: Drawing Import ===');
console.log(`Importing: ${boundaryConeData.metadata.fileName}`);
console.log(`Room: ${boundaryConeData.metadata.roomName}`);
console.log(`Dimensions: ${boundaryConeData.dimensions.length}' × ${boundaryConeData.dimensions.width}' × ${boundaryConeData.dimensions.height}'`);
console.log(`Area: ${boundaryConeData.area} sq ft\n`);

// Step 2: Generate Layout
console.log('=== STEP 2: Layout Generation ===');
const layoutData = {
  tables: [],
  totalCanopyArea: 0,
  utilizationRate: 0
};

// Generate 9 rolling tables (3x3 grid)
const tableWidth = 20;
const tableDepth = 6;
const aisleWidth = 3;

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const table = {
      id: `table-${row * 3 + col + 1}`,
      position: {
        x: 1 + col * (tableWidth + aisleWidth),
        y: 1 + row * (tableDepth + aisleWidth)
      },
      dimensions: {
        width: tableWidth,
        depth: tableDepth,
        height: 3
      }
    };
    layoutData.tables.push(table);
  }
}

layoutData.totalCanopyArea = layoutData.tables.length * tableWidth * tableDepth;
layoutData.utilizationRate = (layoutData.totalCanopyArea / boundaryConeData.area) * 100;

console.log(`Tables: ${layoutData.tables.length} rolling tables`);
console.log(`Table Size: ${tableWidth}' × ${tableDepth}'`);
console.log(`Total Canopy: ${layoutData.totalCanopyArea} sq ft`);
console.log(`Utilization: ${layoutData.utilizationRate.toFixed(1)}%\n`);

// Step 3: Lighting Design
console.log('=== STEP 3: Lighting Design ===');
const lightingDesign = {
  lights: [],
  totalPower: 0,
  metrics: {
    averagePPFD: 0,
    uniformity: 0.85,
    dli: 0
  },
  financial: {
    equipmentCost: 0,
    installationCost: 0,
    annualSavings: 0,
    roiYears: 0
  }
};

// SPYDR 2p specifications
const spydr2p = {
  model: 'Fluence SPYDR 2p',
  wattage: 645,
  ppf: 1700,
  coverage: 16, // 4x4 ft
  price: 1499
};

// Generate lighting grid (4' spacing)
const lightSpacing = 4;
let lightCount = 0;

for (let x = lightSpacing / 2; x <= boundaryConeData.dimensions.width - lightSpacing / 2; x += lightSpacing) {
  for (let y = lightSpacing / 2; y <= boundaryConeData.dimensions.length - lightSpacing / 2; y += lightSpacing) {
    lightingDesign.lights.push({
      id: `light-${++lightCount}`,
      x: x,
      y: y,
      z: 8,
      fixture: spydr2p.model,
      wattage: spydr2p.wattage,
      ppf: spydr2p.ppf
    });
  }
}

// Calculate metrics
lightingDesign.totalPower = lightingDesign.lights.length * spydr2p.wattage;
const totalPPF = lightingDesign.lights.length * spydr2p.ppf;
lightingDesign.metrics.averagePPFD = (totalPPF / layoutData.totalCanopyArea) * 10.764; // Convert to PPFD
lightingDesign.metrics.dli = lightingDesign.metrics.averagePPFD * 0.0432; // 12 hour photoperiod

// Financial calculations
lightingDesign.financial.equipmentCost = lightingDesign.lights.length * spydr2p.price;
lightingDesign.financial.installationCost = lightingDesign.lights.length * 150;

// HPS comparison
const hpsCount = 59; // From original design
const hpsPower = hpsCount * 1000;
const powerSavings = hpsPower - lightingDesign.totalPower;
const annualEnergySavings = (powerSavings * 12 * 365 / 1000) * 0.12;
const annualBulbSavings = hpsCount * 150;
lightingDesign.financial.annualSavings = annualEnergySavings + annualBulbSavings;
lightingDesign.financial.roiYears = (lightingDesign.financial.equipmentCost + lightingDesign.financial.installationCost) / lightingDesign.financial.annualSavings;

console.log(`Fixture: ${spydr2p.model}`);
console.log(`Total Fixtures: ${lightingDesign.lights.length}`);
console.log(`Total Power: ${(lightingDesign.totalPower / 1000).toFixed(1)} kW`);
console.log(`Average PPFD: ${lightingDesign.metrics.averagePPFD.toFixed(0)} μmol/m²/s`);
console.log(`DLI: ${lightingDesign.metrics.dli.toFixed(1)} mol/m²/day`);
console.log(`Investment: $${lightingDesign.financial.equipmentCost.toLocaleString()}`);
console.log(`ROI: ${lightingDesign.financial.roiYears.toFixed(1)} years\n`);

// Step 4: Generate Report Data
console.log('=== STEP 4: Report Generation ===');
const reportData = {
  project: {
    name: 'Boundary Cone Cultivation Facility',
    date: new Date().toISOString(),
    client: 'Mohave Cannabis Co.',
    location: 'Nevada'
  },
  facility: {
    dimensions: boundaryConeData.dimensions,
    area: boundaryConeData.area,
    roomCount: 1
  },
  layout: layoutData,
  lighting: {
    fixtures: lightingDesign.lights.length,
    model: spydr2p.model,
    manufacturer: 'Fluence',
    totalPower: lightingDesign.totalPower,
    powerDensity: lightingDesign.totalPower / boundaryConeData.area,
    averagePPFD: lightingDesign.metrics.averagePPFD,
    uniformity: lightingDesign.metrics.uniformity,
    dli: lightingDesign.metrics.dli
  },
  electrical: {
    voltage: '480V 3-Phase',
    totalLoad: lightingDesign.totalPower,
    breakerSize: Math.ceil(lightingDesign.totalPower * 1.25 / (480 * 1.732) / 20) * 20,
    panelRequirement: '100A sub-panel minimum'
  },
  financial: lightingDesign.financial,
  environmental: {
    co2Reduction: powerSavings * 12 * 365 / 1000 * 0.92,
    heatLoadReduction: powerSavings * 3.412,
    waterSavings: powerSavings * 0.15
  }
};

// Save test data
const outputDir = path.join(__dirname, 'test-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const timestamp = new Date().toISOString().split('T')[0];

// Save parsed drawing data
fs.writeFileSync(
  path.join(outputDir, `parsed-drawing-${timestamp}.json`),
  JSON.stringify(boundaryConeData, null, 2)
);

// Save layout data
fs.writeFileSync(
  path.join(outputDir, `generated-layout-${timestamp}.json`),
  JSON.stringify(layoutData, null, 2)
);

// Save lighting design
fs.writeFileSync(
  path.join(outputDir, `lighting-design-${timestamp}.json`),
  JSON.stringify(lightingDesign, null, 2)
);

// Save report data
fs.writeFileSync(
  path.join(outputDir, `report-data-${timestamp}.json`),
  JSON.stringify(reportData, null, 2)
);

console.log('\n=== WORKFLOW COMPLETE ===');
console.log(`Test data saved to: ${outputDir}`);
console.log('\nNext Steps:');
console.log('1. Open Vibelux app');
console.log('2. Go to /design/advanced');
console.log('3. Use Import feature to load the test data');
console.log('4. Generate professional HTML/PDF reports');
console.log('\nSummary:');
console.log(`- ${boundaryConeData.area} sq ft facility`);
console.log(`- ${layoutData.tables.length} cultivation tables`);
console.log(`- ${lightingDesign.lights.length} Fluence SPYDR 2p fixtures`);
console.log(`- ${(lightingDesign.totalPower / 1000).toFixed(1)} kW total power`);
console.log(`- ${lightingDesign.metrics.averagePPFD.toFixed(0)} μmol/m²/s average PPFD`);
console.log(`- ${lightingDesign.financial.roiYears.toFixed(1)} year ROI`);
console.log(`- $${lightingDesign.financial.annualSavings.toLocaleString()} annual savings`);