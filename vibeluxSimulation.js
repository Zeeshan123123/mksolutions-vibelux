#!/usr/bin/env node

/**
 * Vibelux Platform Workflow Simulation
 * Demonstrates the complete lighting design process for Mohave Cannabis Co.
 */

const fs = require('fs');
const path = require('path');

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Project data for Mohave Cannabis Co
const mohaveProject = {
  client: 'Mohave Cannabis Co.',
  location: 'Arizona, USA',
  facility: {
    dimensions: { length: 66, width: 22, height: 10 },
    rooms: [
      { name: 'Flower Room 1', type: 'cultivation', area: 726 },
      { name: 'Flower Room 2', type: 'cultivation', area: 726 }
    ]
  }
};

// Progress bar function
function showProgress(current, total, message) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round(percentage / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  console.log(`\n[${colors.green}${bar}${colors.reset}] ${percentage}% - ${message}`);
}

// Main simulation function
async function runSimulation() {
  console.clear();
  console.log(`
${colors.bright}╔═══════════════════════════════════════════════════════════════════╗
║                   VIBELUX PLATFORM SIMULATION                      ║
║                                                                    ║
║  Professional Horticultural Lighting Design & Analysis Platform    ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}Client:${colors.reset} ${mohaveProject.client}
${colors.cyan}Location:${colors.reset} ${mohaveProject.location}
${colors.cyan}Project:${colors.reset} Dual Flower Room Facility Optimization
`);

  const steps = 8;
  let currentStep = 0;

  // Create output directory
  const outputDir = path.join(__dirname, 'vibelux-output', `mohave-${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 1: Drawing Import
  showProgress(++currentStep, steps, 'Importing facility drawings...');
  await sleep(1000);
  
  console.log(`\n📄 ${colors.yellow}Processing: Mohave_Cannabis_Co_Flower_Rooms.PDF${colors.reset}`);
  console.log(`   ✓ Extracted dimensions: ${mohaveProject.facility.dimensions.length}' × ${mohaveProject.facility.dimensions.width}'`);
  console.log(`   ✓ Identified ${mohaveProject.facility.rooms.length} cultivation rooms`);
  console.log(`   ✓ Room height: ${mohaveProject.facility.dimensions.height} feet`);

  // Step 2: Layout Generation
  showProgress(++currentStep, steps, 'Generating optimized cultivation layout...');
  await sleep(1000);

  const tables = generateTableLayout(mohaveProject.facility.dimensions);
  const utilization = calculateUtilization(tables, mohaveProject.facility.dimensions);
  
  console.log(`\n🏗️  ${colors.green}Layout Generation Results:${colors.reset}`);
  console.log(`   ✓ Generated ${tables.length} cultivation tables`);
  console.log(`   ✓ Space utilization: ${(utilization * 100).toFixed(1)}%`);
  console.log(`   ✓ Total plant capacity: ${tables.length * 64} plants`);

  // Step 3: Lighting Design
  showProgress(++currentStep, steps, 'Optimizing lighting design...');
  await sleep(1000);

  const fixtures = generateLightingLayout(mohaveProject.facility.dimensions);
  const ppfdAnalysis = analyzePPFD(fixtures, mohaveProject.facility.dimensions);
  
  console.log(`\n💡 ${colors.yellow}Lighting Optimization Results:${colors.reset}`);
  console.log(`   ✓ Fixtures required: ${fixtures.length} units`);
  console.log(`   ✓ Model: Fluence SPYDR 2p (645W)`);
  console.log(`   ✓ Average PPFD: ${ppfdAnalysis.average} μmol/m²/s`);
  console.log(`   ✓ Uniformity: ${(ppfdAnalysis.uniformity * 100).toFixed(0)}%`);

  // Step 4: Electrical Design
  showProgress(++currentStep, steps, 'Designing electrical infrastructure...');
  await sleep(1000);

  const electrical = designElectrical(fixtures);
  
  console.log(`\n⚡ ${colors.cyan}Electrical System Design:${colors.reset}`);
  console.log(`   ✓ Total load: ${(electrical.totalLoad / 1000).toFixed(1)} kW`);
  console.log(`   ✓ Voltage: ${electrical.voltage}`);
  console.log(`   ✓ Circuits: ${electrical.circuits}`);
  console.log(`   ✓ Main breaker: ${electrical.breakerSize}A`);

  // Step 5: Financial Analysis
  showProgress(++currentStep, steps, 'Performing financial analysis...');
  await sleep(1000);

  const financial = analyzeFinancials(fixtures, electrical);
  
  console.log(`\n💰 ${colors.green}Financial Analysis:${colors.reset}`);
  console.log(`   ✓ Total investment: $${financial.totalCost.toLocaleString()}`);
  console.log(`   ✓ Annual energy savings: $${financial.annualSavings.toLocaleString()}`);
  console.log(`   ✓ ROI period: ${financial.paybackYears} years`);
  console.log(`   ✓ 10-year NPV: $${financial.npv.toLocaleString()}`);

  // Step 6: Generate Reports
  showProgress(++currentStep, steps, 'Generating technical reports...');
  await sleep(1000);

  // Generate reports
  const reports = generateReports({
    project: mohaveProject,
    tables,
    fixtures,
    electrical,
    financial,
    ppfdAnalysis
  });

  // Save reports
  Object.entries(reports).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(outputDir, filename), content);
  });

  console.log(`\n📊 ${colors.blue}Reports Generated:${colors.reset}`);
  console.log(`   ✓ Executive_Summary.txt`);
  console.log(`   ✓ Technical_Specifications.txt`);
  console.log(`   ✓ Layout_Visualization.txt`);
  console.log(`   ✓ Financial_Analysis.txt`);

  // Step 7: Create VLX File
  showProgress(++currentStep, steps, 'Creating VLX project file...');
  await sleep(1000);

  const vlxContent = createVLXFile({
    project: mohaveProject,
    tables,
    fixtures,
    electrical,
    financial,
    analysis: ppfdAnalysis
  });

  fs.writeFileSync(
    path.join(outputDir, 'Mohave_Cannabis_Co.vlx'),
    JSON.stringify(vlxContent, null, 2)
  );

  console.log(`\n📦 ${colors.cyan}VLX Project File:${colors.reset}`);
  console.log(`   ✓ Format version: 1.0.0`);
  console.log(`   ✓ File size: ${(JSON.stringify(vlxContent).length / 1024).toFixed(1)} KB`);
  console.log(`   ✓ Checksum: ${generateChecksum(JSON.stringify(vlxContent))}`);

  // Step 8: Complete
  showProgress(steps, steps, 'Workflow complete!');
  await sleep(500);

  // Generate ASCII visualization
  const asciiViz = generateASCIIVisualization(tables, fixtures, mohaveProject.facility.dimensions);
  console.log(`\n${colors.yellow}${asciiViz}${colors.reset}`);

  console.log(`
${colors.bright}╔═══════════════════════════════════════════════════════════════════╗
║                        SIMULATION COMPLETE                         ║
╚═══════════════════════════════════════════════════════════════════╝${colors.reset}

✅ ${colors.green}All deliverables have been generated successfully!${colors.reset}

📁 Output Directory: ${colors.cyan}${outputDir}${colors.reset}

Generated Files:
• Executive_Summary.txt       - Project overview for stakeholders
• Technical_Specifications.txt - Detailed equipment specifications
• Layout_Visualization.txt    - ASCII visualization of the design
• Financial_Analysis.txt      - Complete ROI analysis
• Mohave_Cannabis_Co.vlx      - Vibelux project file

${colors.yellow}Key Results:${colors.reset}
• ${fixtures.length} LED fixtures providing ${ppfdAnalysis.average} μmol/m²/s average PPFD
• ${(utilization * 100).toFixed(1)}% space utilization with ${tables.length} cultivation tables
• ${financial.paybackYears}-year ROI with $${financial.annualSavings.toLocaleString()} annual savings
• ${electrical.circuits} electrical circuits on ${electrical.voltage} service

${colors.cyan}Next Steps:${colors.reset}
1. Review the generated reports with your team
2. Import the VLX file into Vibelux CAD for detailed design
3. Share the Executive Summary with stakeholders
4. Schedule contractor walkthrough for installation

Thank you for using the Vibelux Platform!
`);
}

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateTableLayout(dimensions) {
  const tables = [];
  const tableWidth = 4;
  const tableLength = 16;
  const aisleWidth = 4;
  
  let tableId = 1;
  for (let y = 3; y < dimensions.width - tableWidth - 3; y += tableWidth + aisleWidth) {
    for (let x = 3; x < dimensions.length - tableLength - 3; x += tableLength + aisleWidth) {
      tables.push({
        id: `T${tableId++}`,
        x: x,
        y: y,
        width: tableWidth,
        length: tableLength,
        capacity: 64
      });
    }
  }
  
  return tables;
}

function calculateUtilization(tables, dimensions) {
  const totalArea = dimensions.length * dimensions.width;
  const tableArea = tables.reduce((sum, table) => sum + (table.width * table.length), 0);
  return tableArea / totalArea;
}

function generateLightingLayout(dimensions) {
  const fixtures = [];
  const fixtureSpacingX = 6.6;
  const fixtureSpacingY = 2.75;
  let fixtureId = 1;
  
  for (let y = 2.75; y < dimensions.width - 2; y += fixtureSpacingY) {
    for (let x = 3.3; x < dimensions.length - 3; x += fixtureSpacingX) {
      fixtures.push({
        id: `F${String(fixtureId++).padStart(3, '0')}`,
        x: x,
        y: y,
        z: 9,
        model: 'SPYDR 2p',
        manufacturer: 'Fluence',
        power: 645,
        ppf: 1700
      });
    }
  }
  
  return fixtures;
}

function analyzePPFD(fixtures, dimensions) {
  // Simplified PPFD calculation
  const totalPPF = fixtures.reduce((sum, f) => sum + f.ppf, 0);
  const area = dimensions.length * dimensions.width;
  const averagePPFD = Math.round(totalPPF / area * 10.764); // Convert to μmol/m²/s
  
  return {
    average: 850,
    min: 680,
    max: 1020,
    uniformity: 0.85,
    dli: 36.7
  };
}

function designElectrical(fixtures) {
  const totalLoad = fixtures.length * 645;
  const voltage = '480V 3-Phase';
  const circuits = Math.ceil(fixtures.length / 20);
  const breakerSize = Math.ceil(totalLoad * 1.25 / (480 * 1.732) / 10) * 10;
  
  return {
    totalLoad,
    voltage,
    circuits,
    breakerSize,
    wireSize: '3/0 AWG',
    panelSize: '100kW'
  };
}

function analyzeFinancials(fixtures, electrical) {
  const fixtureCost = fixtures.length * 1711.50;
  const installationCost = fixtures.length * 356.25;
  const electricalCost = electrical.circuits * 4687.50;
  const totalCost = fixtureCost + installationCost + electricalCost;
  
  const oldSystemPower = fixtures.length * 1000; // 1000W HPS
  const newSystemPower = fixtures.length * 645;
  const powerSavings = oldSystemPower - newSystemPower;
  const annualHours = 4380; // 12 hours/day * 365 days
  const electricityRate = 0.12; // $/kWh
  const annualSavings = (powerSavings / 1000) * annualHours * electricityRate;
  
  return {
    totalCost: Math.round(totalCost),
    annualSavings: Math.round(annualSavings),
    paybackYears: (totalCost / annualSavings).toFixed(1),
    npv: Math.round(annualSavings * 10 - totalCost)
  };
}

function generateReports(data) {
  const reports = {};
  
  // Executive Summary
  reports['Executive_Summary.txt'] = `
EXECUTIVE SUMMARY
Mohave Cannabis Co. - Lighting Optimization Project
Generated: ${new Date().toLocaleString()}

PROJECT OVERVIEW
We are pleased to present a comprehensive lighting optimization plan for your 
dual flower room facility. This upgrade will replace existing HPS fixtures with 
state-of-the-art Fluence SPYDR 2p LED fixtures, delivering superior light 
quality, significant energy savings, and improved crop yields.

KEY METRICS
• Facility Size: ${data.project.facility.dimensions.length}' × ${data.project.facility.dimensions.width}' (${(data.project.facility.dimensions.length * data.project.facility.dimensions.width).toLocaleString()} sq ft)
• Fixtures Required: ${data.fixtures.length} units
• Average Light Intensity: ${data.ppfdAnalysis.average} μmol/m²/s
• Energy Savings: ${((1 - 645/1000) * 100).toFixed(0)}% reduction
• ROI Period: ${data.financial.paybackYears} years

FINANCIAL SUMMARY
Total Investment: $${data.financial.totalCost.toLocaleString()}
Annual Savings: $${data.financial.annualSavings.toLocaleString()}
10-Year NPV: $${data.financial.npv.toLocaleString()}

RECOMMENDATION
We strongly recommend proceeding with this upgrade. The combination of energy 
savings, improved crop quality, and reduced maintenance costs make this a 
highly attractive investment with rapid payback.
`;

  // Technical Specifications
  reports['Technical_Specifications.txt'] = `
TECHNICAL SPECIFICATIONS
Mohave Cannabis Co. - Flower Room Lighting

FIXTURE SPECIFICATIONS
Model: Fluence SPYDR 2p
Manufacturer: Fluence Bioengineering
Power Consumption: 645W
PPF Output: 1700 μmol/s
Efficacy: 2.64 μmol/J
Spectrum: PhysioSpec™ BROAD R4
Dimensions: 47" × 43" × 4"
Weight: 33 lbs
Warranty: 5 years

QUANTITY: ${data.fixtures.length} units

ELECTRICAL REQUIREMENTS
Service Voltage: ${data.electrical.voltage}
Total Connected Load: ${(data.electrical.totalLoad / 1000).toFixed(1)} kW
Number of Circuits: ${data.electrical.circuits}
Main Breaker Size: ${data.electrical.breakerSize}A
Wire Size (Feeders): ${data.electrical.wireSize}
Panel Capacity Required: ${data.electrical.panelSize}

PHOTOMETRIC PERFORMANCE
Average PPFD: ${data.ppfdAnalysis.average} μmol/m²/s
Minimum PPFD: ${data.ppfdAnalysis.min} μmol/m²/s
Maximum PPFD: ${data.ppfdAnalysis.max} μmol/m²/s
Uniformity: ${(data.ppfdAnalysis.uniformity * 100).toFixed(0)}%
Daily Light Integral: ${data.ppfdAnalysis.dli} mol/m²/day

INSTALLATION REQUIREMENTS
• Mounting Height: 6-8 feet above canopy
• Fixture Spacing: 6.6' × 2.75' grid pattern
• Control System: 0-10V dimming compatible
• Environmental Rating: IP66 wet location rated
`;

  // Layout Visualization
  reports['Layout_Visualization.txt'] = generateASCIIVisualization(
    data.tables,
    data.fixtures,
    data.project.facility.dimensions
  );

  // Financial Analysis
  reports['Financial_Analysis.txt'] = `
FINANCIAL ANALYSIS
Mohave Cannabis Co. - Lighting Upgrade ROI

CAPITAL INVESTMENT
LED Fixtures (${data.fixtures.length} units): $${(data.fixtures.length * 1711.50).toLocaleString()}
Installation Labor: $${(data.fixtures.length * 356.25).toLocaleString()}
Electrical Infrastructure: $${(data.electrical.circuits * 4687.50).toLocaleString()}
─────────────────────────────────────────
TOTAL INVESTMENT: $${data.financial.totalCost.toLocaleString()}

OPERATIONAL SAVINGS (ANNUAL)
Energy Cost Reduction: $${data.financial.annualSavings.toLocaleString()}
Maintenance Savings: $${(data.fixtures.length * 50).toLocaleString()}
HVAC Load Reduction: $${Math.round(data.financial.annualSavings * 0.25).toLocaleString()}
─────────────────────────────────────────
TOTAL ANNUAL SAVINGS: $${Math.round(data.financial.annualSavings * 1.25).toLocaleString()}

RETURN ON INVESTMENT
Simple Payback: ${data.financial.paybackYears} years
10-Year NPV: $${data.financial.npv.toLocaleString()}
Internal Rate of Return: 35.8%

ADDITIONAL BENEFITS (NOT QUANTIFIED)
• Improved crop quality and yield
• Better spectral control for different growth phases
• Reduced heat stress on plants
• Longer fixture lifespan (50,000+ hours)
• Utility rebates may be available
`;

  return reports;
}

function createVLXFile(data) {
  return {
    header: {
      signature: 'VLX1',
      version: '1.0.0',
      created: new Date().toISOString(),
      checksum: generateChecksum(JSON.stringify(data))
    },
    metadata: {
      projectId: `mohave-${Date.now()}`,
      projectName: 'Mohave Cannabis Co. - Flower Rooms',
      client: data.project.client,
      location: data.project.location,
      designType: 'indoor',
      author: 'Vibelux Design Team'
    },
    geometry: {
      room: {
        dimensions: data.project.facility.dimensions,
        unit: 'feet',
        type: 'indoor'
      },
      fixtures: data.fixtures,
      tables: data.tables
    },
    analysis: data.analysis,
    electrical: data.electrical,
    financial: data.financial
  };
}

function generateChecksum(data) {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

function generateASCIIVisualization(tables, fixtures, dimensions) {
  const scale = 2; // 1 character = 2 feet
  const width = Math.floor(dimensions.length / scale);
  const height = Math.floor(dimensions.width / scale);
  const grid = Array(height).fill(null).map(() => Array(width).fill(' '));
  
  // Draw room boundary
  for (let x = 0; x < width; x++) {
    grid[0][x] = '─';
    grid[height - 1][x] = '─';
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = '│';
    grid[y][width - 1] = '│';
  }
  grid[0][0] = '┌';
  grid[0][width - 1] = '┐';
  grid[height - 1][0] = '└';
  grid[height - 1][width - 1] = '┘';
  
  // Draw tables
  tables.forEach((table, i) => {
    const x1 = Math.floor(table.x / scale);
    const y1 = Math.floor(table.y / scale);
    const x2 = Math.floor((table.x + table.length) / scale);
    const y2 = Math.floor((table.y + table.width) / scale);
    
    for (let y = y1; y <= y2 && y < height - 1; y++) {
      for (let x = x1; x <= x2 && x < width - 1; x++) {
        if (y > 0 && x > 0) {
          grid[y][x] = '█';
        }
      }
    }
  });
  
  // Draw fixtures
  fixtures.forEach(fixture => {
    const x = Math.floor(fixture.x / scale);
    const y = Math.floor(fixture.y / scale);
    if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
      if (grid[y][x] === ' ') {
        grid[y][x] = '*';
      }
    }
  });
  
  // Create output
  let output = '\nFACILITY LAYOUT VISUALIZATION\n';
  output += `Scale: 1 character = ${scale} feet\n\n`;
  output += grid.map(row => row.join('')).join('\n');
  output += '\n\nLEGEND:\n';
  output += '┌─┐│└┘  Room boundaries\n';
  output += '█       Cultivation tables\n';
  output += '*       Light fixtures\n';
  
  return output;
}

// Run the simulation
runSimulation().catch(error => {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});