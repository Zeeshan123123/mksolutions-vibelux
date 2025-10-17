interface CADData {
  project: {
    name: string;
    date: string;
    client: string;
    location: string;
  };
  room: {
    dimensions: {
      length: number;
      width: number; 
      height: number;
    };
    unit: string;
  };
  fixtures: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    z: number;
    model: string;
    manufacturer: string;
    power: number;
    ppf: number;
  }>;
  electrical: {
    voltage: string;
    totalLoad: number;
    circuits: number;
    breakerSize: number;
  };
  lighting: {
    totalPower: number;
    powerDensity: number;
    averagePPFD: number;
    uniformity: number;
  };
}

export async function generateCADReport(data: CADData, filename: string): Promise<void> {
  const { room, fixtures, electrical, lighting, project } = data;
  
  // Convert dimensions to standard units (feet)
  const scale = room.unit === 'meters' ? 3.28084 : 1;
  const roomLength = room.dimensions.length * scale;
  const roomWidth = room.dimensions.width * scale;
  const roomHeight = room.dimensions.height * scale;
  
  // SVG dimensions for technical drawing (scale: 1 foot = 20 pixels)
  const svgScale = 20;
  const svgWidth = roomLength * svgScale + 200; // Add margin
  const svgHeight = roomWidth * svgScale + 200;
  
  // Calculate PPFD at grid points using inverse square law
  function calculatePPFD(x: number, y: number): number {
    let totalPPFD = 0;
    fixtures.forEach(fixture => {
      const distance = Math.sqrt(
        Math.pow(x - fixture.x, 2) + 
        Math.pow(y - fixture.y, 2) + 
        Math.pow(fixture.z, 2)
      );
      const ppfd = (fixture.ppf * 10.764) / (4 * Math.PI * Math.pow(distance, 2));
      totalPPFD += ppfd;
    });
    return Math.round(totalPPFD);
  }
  
  // Generate isolux contour data
  const contourData: Array<{x: number, y: number, ppfd: number}> = [];
  for (let x = 2; x <= roomLength - 2; x += 2) {
    for (let y = 2; y <= roomWidth - 2; y += 2) {
      contourData.push({
        x, y, 
        ppfd: calculatePPFD(x, y)
      });
    }
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - CAD Engineering Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            line-height: 1.4;
        }
        
        .cad-interface {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }
        
        .toolbar {
            width: 60px;
            background: #2d2d2d;
            border-right: 1px solid #444;
            display: flex;
            flex-direction: column;
            padding: 10px 5px;
            gap: 5px;
        }
        
        .tool-btn {
            width: 50px;
            height: 50px;
            background: #3a3a3a;
            border: 1px solid #555;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border-radius: 3px;
        }
        
        .tool-btn:hover {
            background: #4a4a4a;
        }
        
        .tool-btn.active {
            background: #0078d4;
            border-color: #106ebe;
        }
        
        .main-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .top-menu {
            height: 40px;
            background: #2d2d2d;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            padding: 0 15px;
            gap: 20px;
        }
        
        .menu-item {
            color: #fff;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
        }
        
        .menu-item:hover {
            background: #3a3a3a;
        }
        
        .drawing-area {
            flex: 1;
            background: #0a0a0a;
            position: relative;
            overflow: auto;
        }
        
        .properties-panel {
            width: 300px;
            background: #2d2d2d;
            border-left: 1px solid #444;
            padding: 15px;
            overflow-y: auto;
        }
        
        .panel-section {
            margin-bottom: 20px;
        }
        
        .panel-title {
            font-size: 14px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 10px;
            border-bottom: 1px solid #444;
            padding-bottom: 5px;
        }
        
        .property-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
        }
        
        .property-label {
            color: #ccc;
        }
        
        .property-value {
            color: #fff;
            font-weight: bold;
        }
        
        .layers-panel {
            background: #3a3a3a;
            border: 1px solid #555;
            border-radius: 5px;
            padding: 10px;
        }
        
        .layer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .layer-item:hover {
            background: #4a4a4a;
        }
        
        .layer-checkbox {
            width: 15px;
            height: 15px;
        }
        
        .layer-color {
            width: 15px;
            height: 15px;
            border: 1px solid #666;
        }
        
        .title-block {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #2d2d2d;
            border: 2px solid #555;
            padding: 15px;
            width: 300px;
            font-size: 11px;
        }
        
        .title-row {
            display: flex;
            border-bottom: 1px solid #444;
            margin-bottom: 5px;
            padding-bottom: 3px;
        }
        
        .title-label {
            width: 80px;
            color: #ccc;
        }
        
        .title-value {
            flex: 1;
            color: #fff;
            font-weight: bold;
        }
        
        .electrical-diagram {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            border: 1px solid #555;
            padding: 15px;
            width: 280px;
        }
        
        .diagram-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            color: #fff;
            border-bottom: 1px solid #444;
            padding-bottom: 5px;
        }
        
        .photometric-analysis {
            position: absolute;
            top: 20px;
            left: 20px;
            background: #1a1a1a;
            border: 1px solid #555;
            padding: 15px;
            width: 250px;
        }
        
        .analysis-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #fff;
        }
        
        .metric-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
        }
        
        .metric-label {
            color: #ccc;
        }
        
        .metric-value {
            color: #00ff88;
            font-weight: bold;
        }
        
        .svg-drawing {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .fixture-symbol {
            fill: #ffff00;
            stroke: #ffaa00;
            stroke-width: 2;
        }
        
        .room-outline {
            fill: none;
            stroke: #ffffff;
            stroke-width: 2;
        }
        
        .dimension-line {
            stroke: #00ff88;
            stroke-width: 1;
            fill: none;
        }
        
        .dimension-text {
            fill: #00ff88;
            font-size: 12px;
            text-anchor: middle;
        }
        
        .grid-line {
            stroke: #333;
            stroke-width: 0.5;
        }
        
        .contour-line {
            fill: none;
            stroke-width: 1;
            opacity: 0.7;
        }
        
        .contour-300 { stroke: #ff0000; }
        .contour-500 { stroke: #ff8800; }
        .contour-700 { stroke: #ffff00; }
        .contour-900 { stroke: #88ff00; }
        .contour-1100 { stroke: #00ff88; }
        
        .circuit-line {
            stroke: #ff4444;
            stroke-width: 2;
            fill: none;
        }
        
        .fixture-label {
            fill: #ffffff;
            font-size: 10px;
            text-anchor: middle;
        }
        
        .coordinate-text {
            fill: #888;
            font-size: 8px;
            text-anchor: middle;
        }
    </style>
</head>
<body>
    <div class="cad-interface">
        <!-- Left Toolbar -->
        <div class="toolbar">
            <div class="tool-btn active" title="Select">📍</div>
            <div class="tool-btn" title="Line">📏</div>
            <div class="tool-btn" title="Rectangle">⬜</div>
            <div class="tool-btn" title="Circle">⭕</div>
            <div class="tool-btn" title="Dimension">📐</div>
            <div class="tool-btn" title="Text">📝</div>
            <div class="tool-btn" title="Zoom">🔍</div>
            <div class="tool-btn" title="Pan">✋</div>
        </div>
        
        <!-- Main Drawing Area -->
        <div class="main-area">
            <div class="top-menu">
                <a href="#" class="menu-item">File</a>
                <a href="#" class="menu-item">Edit</a>
                <a href="#" class="menu-item">View</a>
                <a href="#" class="menu-item">Insert</a>
                <a href="#" class="menu-item">Format</a>
                <a href="#" class="menu-item">Tools</a>
                <a href="#" class="menu-item">Help</a>
            </div>
            
            <div class="drawing-area">
                <!-- Technical Drawing SVG -->
                <svg class="svg-drawing" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                    <!-- Grid -->
                    <defs>
                        <pattern id="grid" width="${svgScale}" height="${svgScale}" patternUnits="userSpaceOnUse">
                            <path d="M ${svgScale} 0 L 0 0 0 ${svgScale}" class="grid-line"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
                    
                    <!-- Room Outline -->
                    <rect x="100" y="100" 
                          width="${roomLength * svgScale}" 
                          height="${roomWidth * svgScale}" 
                          class="room-outline"/>
                    
                    <!-- Fixtures -->
                    ${fixtures.map((fixture, index) => {
                      const x = 100 + fixture.x * svgScale;
                      const y = 100 + fixture.y * svgScale;
                      return `
                        <g>
                          <circle cx="${x}" cy="${y}" r="8" class="fixture-symbol"/>
                          <text x="${x}" y="${y - 15}" class="fixture-label">${fixture.label}</text>
                          <text x="${x}" y="${y + 25}" class="coordinate-text">(${fixture.x.toFixed(1)}, ${fixture.y.toFixed(1)})</text>
                        </g>
                      `;
                    }).join('')}
                    
                    <!-- Electrical Circuits -->
                    ${Array.from({length: electrical.circuits}, (_, circuitIndex) => {
                      const fixturesInCircuit = fixtures.slice(circuitIndex * 20, (circuitIndex + 1) * 20);
                      return fixturesInCircuit.map((fixture, index) => {
                        if (index === 0) return '';
                        const prevFixture = fixturesInCircuit[index - 1];
                        const x1 = 100 + prevFixture.x * svgScale;
                        const y1 = 100 + prevFixture.y * svgScale;
                        const x2 = 100 + fixture.x * svgScale;
                        const y2 = 100 + fixture.y * svgScale;
                        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="circuit-line"/>`;
                      }).join('');
                    }).join('')}
                    
                    <!-- Isolux Contours -->
                    ${[300, 500, 700, 900, 1100].map(ppfdLevel => {
                      const contourPoints = contourData.filter(p => Math.abs(p.ppfd - ppfdLevel) < 50);
                      if (contourPoints.length < 3) return '';
                      
                      const path = contourPoints.map((point, index) => {
                        const x = 100 + point.x * svgScale;
                        const y = 100 + point.y * svgScale;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ') + ' Z';
                      
                      return `<path d="${path}" class="contour-line contour-${ppfdLevel}"/>`;
                    }).join('')}
                    
                    <!-- Dimensions -->
                    <!-- Length dimension -->
                    <line x1="100" y1="${100 + roomWidth * svgScale + 30}" 
                          x2="${100 + roomLength * svgScale}" y2="${100 + roomWidth * svgScale + 30}" 
                          class="dimension-line"/>
                    <text x="${100 + (roomLength * svgScale) / 2}" y="${100 + roomWidth * svgScale + 45}" 
                          class="dimension-text">${roomLength.toFixed(1)}'</text>
                    
                    <!-- Width dimension -->
                    <line x1="${100 + roomLength * svgScale + 30}" y1="100" 
                          x2="${100 + roomLength * svgScale + 30}" y2="${100 + roomWidth * svgScale}" 
                          class="dimension-line"/>
                    <text x="${100 + roomLength * svgScale + 45}" y="${100 + (roomWidth * svgScale) / 2}" 
                          class="dimension-text" transform="rotate(90, ${100 + roomLength * svgScale + 45}, ${100 + (roomWidth * svgScale) / 2})">${roomWidth.toFixed(1)}'</text>
                </svg>
                
                <!-- Photometric Analysis Panel -->
                <div class="photometric-analysis">
                    <div class="analysis-title">Photometric Analysis</div>
                    <div class="metric-row">
                        <span class="metric-label">Average PPFD:</span>
                        <span class="metric-value">${lighting.averagePPFD} μmol/m²/s</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Uniformity:</span>
                        <span class="metric-value">${(lighting.uniformity * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Power Density:</span>
                        <span class="metric-value">${lighting.powerDensity.toFixed(1)} W/ft²</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Power:</span>
                        <span class="metric-value">${(lighting.totalPower/1000).toFixed(1)} kW</span>
                    </div>
                    
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #444;">
                        <div style="font-size: 11px; color: #ccc; margin-bottom: 5px;">Isolux Contours (μmol/m²/s):</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            <div style="display: flex; align-items: center; gap: 3px; font-size: 10px;">
                                <div style="width: 10px; height: 2px; background: #ff0000;"></div>
                                <span>300</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 3px; font-size: 10px;">
                                <div style="width: 10px; height: 2px; background: #ff8800;"></div>
                                <span>500</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 3px; font-size: 10px;">
                                <div style="width: 10px; height: 2px; background: #ffff00;"></div>
                                <span>700</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 3px; font-size: 10px;">
                                <div style="width: 10px; height: 2px; background: #88ff00;"></div>
                                <span>900</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 3px; font-size: 10px;">
                                <div style="width: 10px; height: 2px; background: #00ff88;"></div>
                                <span>1100</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Electrical Single-Line Diagram -->
                <div class="electrical-diagram">
                    <div class="diagram-title">Electrical Single-Line Diagram</div>
                    <svg width="250" height="200" style="background: #0a0a0a;">
                        <!-- Main Panel -->
                        <rect x="10" y="10" width="40" height="60" fill="none" stroke="#fff" stroke-width="2"/>
                        <text x="30" y="85" class="dimension-text">Main Panel</text>
                        <text x="30" y="100" class="dimension-text">${electrical.breakerSize}A</text>
                        
                        <!-- Branch Circuits -->
                        ${Array.from({length: electrical.circuits}, (_, i) => {
                          const x = 80 + (i % 2) * 80;
                          const y = 20 + Math.floor(i / 2) * 40;
                          const fixturesCount = Math.min(20, fixtures.length - i * 20);
                          return `
                            <line x1="50" y1="40" x2="${x}" y2="${y + 15}" stroke="#ff4444" stroke-width="2"/>
                            <rect x="${x}" y="${y}" width="30" height="30" fill="none" stroke="#fff" stroke-width="1"/>
                            <text x="${x + 15}" y="${y + 20}" class="dimension-text">C${i + 1}</text>
                            <text x="${x + 15}" y="${y + 45}" class="coordinate-text">${fixturesCount} fixtures</text>
                            <text x="${x + 15}" y="${y + 55}" class="coordinate-text">${(fixturesCount * 645 / 1000).toFixed(1)}kW</text>
                          `;
                        }).join('')}
                        
                        <!-- Load Summary -->
                        <text x="10" y="170" class="dimension-text">Total Load: ${(electrical.totalLoad/1000).toFixed(1)} kW</text>
                        <text x="10" y="185" class="dimension-text">Voltage: ${electrical.voltage}</text>
                    </svg>
                </div>
                
                <!-- Title Block -->
                <div class="title-block">
                    <div class="title-row">
                        <span class="title-label">Project:</span>
                        <span class="title-value">${project.name}</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Client:</span>
                        <span class="title-value">${project.client}</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Location:</span>
                        <span class="title-value">${project.location}</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Date:</span>
                        <span class="title-value">${new Date(project.date).toLocaleDateString()}</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Drawing:</span>
                        <span class="title-value">E-001 Lighting Plan</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Scale:</span>
                        <span class="title-value">1" = ${svgScale/20}"</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Drawn By:</span>
                        <span class="title-value">Vibelux CAD</span>
                    </div>
                    <div class="title-row">
                        <span class="title-label">Checked:</span>
                        <span class="title-value">Engineering Dept.</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Properties Panel -->
        <div class="properties-panel">
            <div class="panel-section">
                <div class="panel-title">Project Properties</div>
                <div class="property-row">
                    <span class="property-label">Room Size:</span>
                    <span class="property-value">${roomLength}' × ${roomWidth}' × ${roomHeight}'</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Floor Area:</span>
                    <span class="property-value">${(roomLength * roomWidth).toLocaleString()} ft²</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Fixtures:</span>
                    <span class="property-value">${fixtures.length} units</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Fixture Model:</span>
                    <span class="property-value">${fixtures[0]?.model || 'SPYDR 2p'}</span>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-title">Electrical Specifications</div>
                <div class="property-row">
                    <span class="property-label">Total Load:</span>
                    <span class="property-value">${(electrical.totalLoad/1000).toFixed(1)} kW</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Voltage:</span>
                    <span class="property-value">${electrical.voltage}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Circuits:</span>
                    <span class="property-value">${electrical.circuits}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Main Breaker:</span>
                    <span class="property-value">${electrical.breakerSize}A</span>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-title">Photometric Data</div>
                <div class="property-row">
                    <span class="property-label">Average PPFD:</span>
                    <span class="property-value">${lighting.averagePPFD} μmol/m²/s</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Min PPFD:</span>
                    <span class="property-value">${Math.min(...contourData.map(p => p.ppfd))} μmol/m²/s</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Max PPFD:</span>
                    <span class="property-value">${Math.max(...contourData.map(p => p.ppfd))} μmol/m²/s</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Uniformity:</span>
                    <span class="property-value">${(lighting.uniformity * 100).toFixed(1)}%</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Power Density:</span>
                    <span class="property-value">${lighting.powerDensity.toFixed(1)} W/ft²</span>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-title">Layers</div>
                <div class="layers-panel">
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #ffffff;"></div>
                        <span>Room Outline</span>
                    </div>
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #ffff00;"></div>
                        <span>Lighting Fixtures</span>
                    </div>
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #ff4444;"></div>
                        <span>Electrical</span>
                    </div>
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #00ff88;"></div>
                        <span>Dimensions</span>
                    </div>
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #888888;"></div>
                        <span>Grid</span>
                    </div>
                    <div class="layer-item">
                        <input type="checkbox" class="layer-checkbox" checked>
                        <div class="layer-color" style="background: #ff8800;"></div>
                        <span>Isolux Contours</span>
                    </div>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-title">Fixture Schedule</div>
                <div style="max-height: 200px; overflow-y: auto; font-size: 11px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #3a3a3a;">
                                <th style="padding: 5px; border: 1px solid #555; text-align: left;">ID</th>
                                <th style="padding: 5px; border: 1px solid #555; text-align: left;">X</th>
                                <th style="padding: 5px; border: 1px solid #555; text-align: left;">Y</th>
                                <th style="padding: 5px; border: 1px solid #555; text-align: left;">Power</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fixtures.slice(0, 10).map(fixture => `
                                <tr>
                                    <td style="padding: 3px; border: 1px solid #555;">${fixture.label}</td>
                                    <td style="padding: 3px; border: 1px solid #555;">${fixture.x.toFixed(1)}'</td>
                                    <td style="padding: 3px; border: 1px solid #555;">${fixture.y.toFixed(1)}'</td>
                                    <td style="padding: 3px; border: 1px solid #555;">${fixture.power}W</td>
                                </tr>
                            `).join('')}
                            ${fixtures.length > 10 ? `
                                <tr>
                                    <td colspan="4" style="padding: 5px; text-align: center; font-style: italic; color: #888;">
                                        ... and ${fixtures.length - 10} more fixtures
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Create and download the HTML file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}