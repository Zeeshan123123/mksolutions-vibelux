#!/usr/bin/env node

/**
 * Generate Boundary Cone lighting design outputs
 * Run with: node generateBoundaryCone.js
 */

const fs = require('fs');
const path = require('path');

// Boundary Cone Room specifications
const room = {
  name: 'Boundary Cone Room',
  width: 66,
  height: 22,
  area: 1452
};

// Generate table layout (9 tables, 8' x 64' each)
const tables = [];
const tableWidth = 8;
const tableLength = 64;
const aisleWidth = 3;

// Place tables in 3 columns
for (let col = 0; col < 3; col++) {
  for (let row = 0; row < 3; row++) {
    // Skip one position to make 9 tables instead of 9
    if (col === 2 && row === 2) continue;
    
    tables.push({
      id: `table_${tables.length + 1}`,
      x: 1 + col * (tableWidth + aisleWidth),
      y: 1 + row * (tableLength / 3 + aisleWidth),
      width: tableWidth,
      length: tableLength / 3
    });
  }
}

// Add the 9th table
tables.push({
  id: 'table_9',
  x: 1 + 2 * (tableWidth + aisleWidth),
  y: 1 + 2 * (tableLength / 3 + aisleWidth),
  width: tableWidth,
  length: tableLength / 3
});

// Generate SPYDR 2p lighting layout
const lights = [];
const lightSpacing = 6; // 6 ft spacing for 4x4 coverage
const fixtureSpec = {
  model: 'Fluence SPYDR 2p',
  wattage: 645,
  ppf: 1700,
  coverage: 16, // 4x4 ft
  price: 1499
};

// Create light grid
for (let x = lightSpacing / 2; x < room.width; x += lightSpacing) {
  for (let y = lightSpacing / 2; y < room.height; y += lightSpacing) {
    // Check if light is over or near a table
    const overTable = tables.some(table => 
      x >= table.x - 1 && x <= table.x + table.width + 1 &&
      y >= table.y - 1 && y <= table.y + table.length + 1
    );
    
    if (overTable) {
      lights.push({ x, y, fixture: 'SPYDR 2p' });
    }
  }
}

// Calculate metrics
const totalPower = lights.length * fixtureSpec.wattage;
const powerDensity = totalPower / room.area;
const totalCanopyArea = tables.reduce((sum, t) => sum + (t.width * t.length), 0);
const avgPPFD = (lights.length * fixtureSpec.ppf) / totalCanopyArea * 10.764;

// Generate report
const report = `
VIBELUX LIGHTING DESIGN OUTPUT
==============================
Generated: ${new Date().toISOString()}
Project: Boundary Cone Cultivation Facility

ROOM SPECIFICATIONS
------------------
Name: ${room.name}
Dimensions: ${room.width}' × ${room.height}'
Total Area: ${room.area.toLocaleString()} sq ft

TABLE LAYOUT
------------
Table Count: ${tables.length}
Table Size: 8' × 21.3' (64' total length divided)
Total Canopy Area: ${totalCanopyArea.toLocaleString()} sq ft
Space Utilization: ${((totalCanopyArea / room.area) * 100).toFixed(1)}%

LIGHTING SYSTEM - FLUENCE SPYDR 2p
----------------------------------
Fixture Count: ${lights.length}
Wattage per Fixture: ${fixtureSpec.wattage}W
Total Power: ${totalPower.toLocaleString()}W (${(totalPower/1000).toFixed(1)} kW)
Power Density: ${powerDensity.toFixed(1)} W/sq ft
Average PPFD: ${avgPPFD.toFixed(0)} μmol/m²/s
Grid Spacing: ${lightSpacing}' × ${lightSpacing}'

FINANCIAL ANALYSIS
-----------------
Equipment Cost: $${(lights.length * fixtureSpec.price).toLocaleString()}
Annual Energy: ${((totalPower * 12 * 365) / 1000).toLocaleString()} kWh
Annual Energy Cost: $${((totalPower * 12 * 365 * 0.12) / 1000).toLocaleString()}

HPS COMPARISON
--------------
HPS 1000W Fixtures Replaced: ${Math.ceil(room.area / 25)} (@ 25 sq ft coverage)
HPS Total Power: ${Math.ceil(room.area / 25) * 1000}W
Power Difference: ${(totalPower - (Math.ceil(room.area / 25) * 1000)).toLocaleString()}W
HVAC Savings: 30% reduction in cooling costs
`;

// Generate visual grid
const gridScale = 3; // 3 ft per character
const gridWidth = Math.ceil(room.width / gridScale);
const gridHeight = Math.ceil(room.height / gridScale);
const grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(' '));

// Mark tables
tables.forEach(table => {
  const startX = Math.floor(table.x / gridScale);
  const startY = Math.floor(table.y / gridScale);
  const endX = Math.ceil((table.x + table.width) / gridScale);
  const endY = Math.ceil((table.y + table.length) / gridScale);
  
  for (let y = startY; y < endY && y < gridHeight; y++) {
    for (let x = startX; x < endX && x < gridWidth; x++) {
      grid[y][x] = '█';
    }
  }
});

// Mark lights
lights.forEach((light, index) => {
  const x = Math.floor(light.x / gridScale);
  const y = Math.floor(light.y / gridScale);
  if (x < gridWidth && y < gridHeight) {
    if (grid[y][x] === '█') {
      grid[y][x] = '▓'; // Light over table
    } else {
      grid[y][x] = '☀'; // Light in aisle
    }
  }
});

let visualGrid = '\nLIGHTING LAYOUT VISUALIZATION\n';
visualGrid += `Scale: 1 character = ${gridScale}' × ${gridScale}'\n\n`;
visualGrid += '  ';
for (let x = 0; x < gridWidth; x += 5) {
  visualGrid += (x * gridScale).toString().padEnd(5);
}
visualGrid += '\n ┌' + '─'.repeat(gridWidth) + '┐\n';

for (let y = 0; y < gridHeight; y++) {
  visualGrid += y.toString().padStart(2) + '│' + grid[y].join('') + '│';
  if (y % 2 === 0) visualGrid += ` ${y * gridScale}'`;
  visualGrid += '\n';
}

visualGrid += ' └' + '─'.repeat(gridWidth) + '┘\n';
visualGrid += '   0' + ' '.repeat(gridWidth - 5) + room.width + '\'\n\n';
visualGrid += 'Legend: █=Table  ☀=Light  ▓=Light over table\n';

// Save outputs
const outputDir = './output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const timestamp = new Date().toISOString().split('T')[0];

// Save report
fs.writeFileSync(
  path.join(outputDir, `BoundaryCone_Report_${timestamp}.txt`),
  report
);

// Save visual grid
fs.writeFileSync(
  path.join(outputDir, `BoundaryCone_Grid_${timestamp}.txt`),
  visualGrid
);

// Save JSON data
const jsonData = {
  room,
  tables,
  lights,
  metrics: {
    fixtureCount: lights.length,
    totalPower,
    powerDensity,
    avgPPFD,
    totalCanopyArea,
    utilizationRate: (totalCanopyArea / room.area) * 100
  },
  fixture: fixtureSpec
};

fs.writeFileSync(
  path.join(outputDir, `BoundaryCone_Layout_${timestamp}.json`),
  JSON.stringify(jsonData, null, 2)
);

console.log('✅ VIBELUX OUTPUT GENERATED SUCCESSFULLY!\n');
console.log(`📁 Files saved to: ${path.resolve(outputDir)}`);
console.log(`   - BoundaryCone_Report_${timestamp}.txt`);
console.log(`   - BoundaryCone_Grid_${timestamp}.txt`);
console.log(`   - BoundaryCone_Layout_${timestamp}.json\n`);
console.log('📊 Summary:');
console.log(`   - ${lights.length} SPYDR 2p fixtures`);
console.log(`   - ${totalPower.toLocaleString()}W total power`);
console.log(`   - ${avgPPFD.toFixed(0)} μmol/m²/s average PPFD`);
console.log(`   - $${(lights.length * fixtureSpec.price).toLocaleString()} equipment cost\n`);
console.log(visualGrid);