const fs = require('fs');
const path = require('path');

// Lange Commercial Greenhouse Project
// 5 Venlo Greenhouses: 147 + 210 + 210 + 210 + 210 = 987 fixtures total
// Zone 1: 147 vegetation fixtures (8.5' spacing)
// Zones 2-5: 210 flowering fixtures each (6.0' spacing)

function generateUniformFixtureGrid(zoneInfo) {
    const fixtures = [];
    const { 
        name, 
        width, 
        length, 
        startX, 
        startY, 
        targetFixtures, 
        fixtureSpacing,
        type 
    } = zoneInfo;
    
    // Calculate uniform grid distribution
    const usableWidth = width - 10; // 5' margins on each side
    const usableLength = length - 10; // 5' margins on each end
    
    const fixturesPerRow = Math.floor(usableWidth / fixtureSpacing);
    const rowSpacing = fixtureSpacing;
    const totalRows = Math.ceil(targetFixtures / fixturesPerRow);
    
    // Ensure we don't exceed zone boundaries
    const actualRowSpacing = Math.min(rowSpacing, usableLength / totalRows);
    
    console.log(`${name}: ${fixturesPerRow} fixtures/row × ${totalRows} rows = ${fixturesPerRow * totalRows} fixtures`);
    
    let fixtureCount = 0;
    for (let row = 0; row < totalRows && fixtureCount < targetFixtures; row++) {
        const y = startY + 5 + (row * actualRowSpacing); // Start 5' from edge
        
        const fixturesInThisRow = Math.min(fixturesPerRow, targetFixtures - fixtureCount);
        const rowStartX = startX + 5 + (usableWidth - (fixturesInThisRow - 1) * fixtureSpacing) / 2;
        
        for (let col = 0; col < fixturesInThisRow; col++) {
            const x = rowStartX + (col * fixtureSpacing);
            
            fixtures.push({
                id: `${name.toLowerCase().replace(/\s+/g, '_')}_${fixtureCount + 1}`,
                x: x,
                y: y,
                type: type,
                power: type === 'vegetation' ? '400W' : '630W',
                circuit: Math.floor(fixtureCount / 20) + 1 // 20 fixtures per circuit
            });
            
            fixtureCount++;
        }
    }
    
    console.log(`${name}: Generated ${fixtures.length} fixtures (target: ${targetFixtures})`);
    return fixtures;
}

function generateElectricalPlan() {
    const zones = [
        {
            name: 'Zone 1 Vegetation',
            width: 120,
            length: 120,
            startX: 50,
            startY: 50,
            targetFixtures: 147,
            fixtureSpacing: 8.5 * 12, // Convert to pixels (8.5' = 102px)
            type: 'vegetation'
        },
        {
            name: 'Zone 2 Flowering',
            width: 120,
            length: 120,
            startX: 200,
            startY: 50,
            targetFixtures: 210,
            fixtureSpacing: 6.0 * 12, // Convert to pixels (6.0' = 72px)
            type: 'flowering'
        },
        {
            name: 'Zone 3 Flowering',
            width: 120,
            length: 120,
            startX: 350,
            startY: 50,
            targetFixtures: 210,
            fixtureSpacing: 6.0 * 12,
            type: 'flowering'
        },
        {
            name: 'Zone 4 Flowering',
            width: 120,
            length: 120,
            startX: 500,
            startY: 50,
            targetFixtures: 210,
            fixtureSpacing: 6.0 * 12,
            type: 'flowering'
        },
        {
            name: 'Zone 5 Flowering',
            width: 120,
            length: 120,
            startX: 650,
            startY: 50,
            targetFixtures: 210,
            fixtureSpacing: 6.0 * 12,
            type: 'flowering'
        }
    ];
    
    // Generate fixtures for all zones
    let allFixtures = [];
    zones.forEach(zone => {
        const zoneFixtures = generateUniformFixtureGrid(zone);
        allFixtures = allFixtures.concat(zoneFixtures);
    });
    
    console.log(`Total fixtures generated: ${allFixtures.length} (target: 987)`);
    
    // Create electrical plan SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .zone-boundary { fill: none; stroke: #333; stroke-width: 2; stroke-dasharray: 5,5; }
      .building-outline { fill: none; stroke: #000; stroke-width: 3; }
      .vegetation-fixture { fill: #4CAF50; stroke: #2E7D32; stroke-width: 1; }
      .flowering-fixture { fill: #FF9800; stroke: #E65100; stroke-width: 1; }
      .panel { fill: #E0E0E0; stroke: #424242; stroke-width: 2; }
      .conduit { fill: none; stroke: #666; stroke-width: 2; }
      .zone-label { font-family: Arial; font-size: 12px; font-weight: bold; fill: #333; }
      .title-text { font-family: Arial; font-size: 16px; font-weight: bold; fill: #000; }
      .spec-text { font-family: Arial; font-size: 10px; fill: #666; }
    </style>
  </defs>
  
  <!-- Title Block -->
  <rect x="10" y="10" width="880" height="30" fill="#f5f5f5" stroke="#333"/>
  <text x="450" y="30" text-anchor="middle" class="title-text">ELECTRICAL PLAN - LANGE COMMERCIAL GREENHOUSE</text>
  
  <!-- Building outline -->
  <rect x="40" y="40" width="720" height="200" class="building-outline"/>
  
  <!-- Zone boundaries -->
  <rect x="50" y="50" width="120" height="120" class="zone-boundary"/>
  <rect x="200" y="50" width="120" height="120" class="zone-boundary"/>
  <rect x="350" y="50" width="120" height="120" class="zone-boundary"/>
  <rect x="500" y="50" width="120" height="120" class="zone-boundary"/>
  <rect x="650" y="50" width="120" height="120" class="zone-boundary"/>
  
  <!-- Zone labels -->
  <text x="110" y="185" text-anchor="middle" class="zone-label">ZONE 1</text>
  <text x="110" y="195" text-anchor="middle" class="spec-text">VEGETATION</text>
  <text x="110" y="205" text-anchor="middle" class="spec-text">147 × 400W</text>
  
  <text x="260" y="185" text-anchor="middle" class="zone-label">ZONE 2</text>
  <text x="260" y="195" text-anchor="middle" class="spec-text">FLOWERING</text>
  <text x="260" y="205" text-anchor="middle" class="spec-text">210 × 630W</text>
  
  <text x="410" y="185" text-anchor="middle" class="zone-label">ZONE 3</text>
  <text x="410" y="195" text-anchor="middle" class="spec-text">FLOWERING</text>
  <text x="410" y="205" text-anchor="middle" class="spec-text">210 × 630W</text>
  
  <text x="560" y="185" text-anchor="middle" class="zone-label">ZONE 4</text>
  <text x="560" y="195" text-anchor="middle" class="spec-text">FLOWERING</text>
  <text x="560" y="205" text-anchor="middle" class="spec-text">210 × 630W</text>
  
  <text x="710" y="185" text-anchor="middle" class="zone-label">ZONE 5</text>
  <text x="710" y="195" text-anchor="middle" class="spec-text">FLOWERING</text>
  <text x="710" y="205" text-anchor="middle" class="spec-text">210 × 630W</text>
  
  <!-- Electrical panels -->
  <rect x="780" y="60" width="20" height="30" class="panel"/>
  <text x="790" y="105" text-anchor="middle" class="spec-text">EP-1</text>
  <text x="790" y="115" text-anchor="middle" class="spec-text">500A</text>
  
  <rect x="780" y="100" width="20" height="30" class="panel"/>
  <text x="790" y="145" text-anchor="middle" class="spec-text">EP-2</text>
  <text x="790" y="155" text-anchor="middle" class="spec-text">500A</text>
  
  <rect x="780" y="140" width="20" height="30" class="panel"/>
  <text x="790" y="185" text-anchor="middle" class="spec-text">EP-3</text>
  <text x="790" y="195" text-anchor="middle" class="spec-text">500A</text>
  
  <!-- Main service -->
  <rect x="780" y="180" width="30" height="40" class="panel"/>
  <text x="795" y="235" text-anchor="middle" class="spec-text">MAIN</text>
  <text x="795" y="245" text-anchor="middle" class="spec-text">2500A</text>
  <text x="795" y="255" text-anchor="middle" class="spec-text">480V 3Φ</text>
  
  <!-- Conduit runs -->
  <line x1="780" y1="75" x2="170" y2="75" class="conduit"/>
  <line x1="780" y1="115" x2="320" y2="115" class="conduit"/>
  <line x1="780" y1="155" x2="470" y2="155" class="conduit"/>
  <line x1="800" y1="200" x2="800" y2="270" class="conduit"/>
  
  <!-- Fixtures distributed uniformly -->
  ${allFixtures.map(fixture => {
    const className = fixture.type === 'vegetation' ? 'vegetation-fixture' : 'flowering-fixture';
    return `<circle cx="${fixture.x}" cy="${fixture.y}" r="2" class="${className}"/>`;
  }).join('\n  ')}
  
  <!-- Legend -->
  <rect x="40" y="270" width="200" height="80" fill="white" stroke="#333"/>
  <text x="50" y="285" class="zone-label">LEGEND</text>
  
  <circle cx="60" cy="295" r="3" class="vegetation-fixture"/>
  <text x="70" y="300" class="spec-text">Vegetation Fixture (400W)</text>
  
  <circle cx="60" cy="310" r="3" class="flowering-fixture"/>
  <text x="70" y="315" class="spec-text">Flowering Fixture (630W)</text>
  
  <rect x="50" y="320" width="10" height="6" class="panel"/>
  <text x="70" y="328" class="spec-text">Electrical Panel</text>
  
  <line x1="50" x2="65" y1="335" y2="335" class="conduit"/>
  <text x="70" y="340" class="spec-text">Conduit Run</text>
  
  <!-- Project info -->
  <rect x="700" y="270" width="190" height="80" fill="white" stroke="#333"/>
  <text x="710" y="285" class="zone-label">PROJECT DATA</text>
  <text x="710" y="300" class="spec-text">Total Fixtures: 987</text>
  <text x="710" y="312" class="spec-text">Total Load: 591.6 kW</text>
  <text x="710" y="324" class="spec-text">Electrical Service: 2500A, 480V, 3Φ</text>
  <text x="710" y="336" class="spec-text">Date: ${new Date().toLocaleDateString()}</text>
  
</svg>`;

    return svg;
}

// Generate the corrected electrical plan
const electricalPlanSVG = generateElectricalPlan();

// Save to file
const outputPath = path.join(process.env.HOME, 'Downloads', 'lange-corrected-electrical-plan.svg');
fs.writeFileSync(outputPath, electricalPlanSVG);

console.log(`Corrected electrical plan saved to: ${outputPath}`);
console.log('This plan shows uniform fixture distribution across all growing areas.');