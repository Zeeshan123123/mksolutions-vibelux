import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  project: {
    name: string;
    date: string;
    client?: string;
    location?: string;
    designer?: string;
    projectValue?: string;
  };
  facility: {
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    area: number;
    roomCount?: number;
    type?: string;
    greenhouseCount?: number;
  };
  layout: {
    tables: number;
    canopyArea: number;
    utilization: number;
  };
  lighting: {
    fixtures: number;
    model: string;
    manufacturer?: string;
    totalPower: number;
    powerDensity: number;
    averagePPFD: number;
    uniformity: number;
    dli?: number;
    mountingHeight?: number;
    zones?: Record<string, number>;
  };
  electrical?: {
    voltage: string;
    totalLoad: number;
    breakerSize: number;
    panelRequirement?: string;
    estimatedInstallationCost?: number;
  };
  hvac?: {
    heating?: {
      boilers?: string;
      capacity?: string;
      distribution?: string;
    };
    cooling?: {
      chiller?: string;
      fanCoils?: string;
      hafFans?: string;
    };
    automation?: string;
  };
  irrigation?: {
    waterStorage?: string;
    treatment?: string;
    pumps?: string;
  };
  structural?: {
    frameType?: string;
    frameMaterial?: string;
    glazingType?: string;
    ventilation?: string;
  };
  financial: {
    equipmentCost: number;
    installationCost: number;
    totalInvestment?: number;
    annualEnergyCost?: number;
    annualSavings?: number;
    roi: number;
    paybackPeriod?: number;
  };
  environmental?: {
    co2Reduction?: number;
    heatLoadReduction?: number;
    waterSavings?: number;
  };
  performance?: {
    calculationTime?: number;
    totalFixtures?: number;
    gridResolution?: number;
    memoryUsage?: number;
  };
}

export function generateHTMLReport(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.project.name} - Vibelux Lighting Design Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #6b46c1 0%, #ec4899 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 2rem;
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section-title {
            font-size: 1.8rem;
            color: #6b46c1;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            text-align: center;
            transition: transform 0.2s;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #6b46c1;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .table-container {
            overflow-x: auto;
            margin-bottom: 2rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
        }
        
        th, td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        
        .highlight-row {
            background: #f3f4f6;
        }
        
        .footer {
            background: #1f2937;
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .footer-text {
            opacity: 0.8;
            font-size: 0.9rem;
        }
        
        .roi-positive {
            color: #10b981;
        }
        
        .roi-negative {
            color: #ef4444;
        }
        
        .visual-section {
            background: #f9fafb;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .chart-placeholder {
            background: #e5e7eb;
            height: 300px;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            margin-top: 1rem;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
            }
            
            .metric-card:hover {
                transform: none;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${data.project.name}</h1>
            <div class="subtitle">Professional Lighting Design Report</div>
            <div style="margin-top: 1rem; opacity: 0.8;">
                Generated by Vibelux • ${currentDate}
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Project Information -->
            <div class="section">
                <h2 class="section-title">Project Information</h2>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Client</td>
                            <td>${data.project.client || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Location</td>
                            <td>${data.project.location || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Designer</td>
                            <td>${data.project.designer || 'Vibelux Advanced Design System'}</td>
                        </tr>
                        <tr>
                            <td>Report Date</td>
                            <td>${new Date(data.project.date).toLocaleDateString()}</td>
                        </tr>
                        ${data.project.projectValue ? `
                        <tr>
                            <td>Project Value</td>
                            <td><strong>${data.project.projectValue}</strong></td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
            </div>
            
            <!-- Project Overview -->
            <div class="section">
                <h2 class="section-title">Facility Overview</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${data.facility.area.toLocaleString()}</div>
                        <div class="metric-label">Total Area (sq ft)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.lighting.fixtures}</div>
                        <div class="metric-label">Total Fixtures</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${(data.lighting.totalPower / 1000).toFixed(1)} kW</div>
                        <div class="metric-label">Total Power</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.financial.roi.toFixed(1)} yrs</div>
                        <div class="metric-label">ROI Period</div>
                    </div>
                    ${data.facility.greenhouseCount ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.facility.greenhouseCount}</div>
                        <div class="metric-label">Connected Greenhouses</div>
                    </div>
                    ` : ''}
                    ${data.facility.type ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.facility.type}</div>
                        <div class="metric-label">Structure Type</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Facility Details -->
            <div class="section">
                <h2 class="section-title">Facility Specifications</h2>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                            <th>Unit</th>
                        </tr>
                        <tr>
                            <td>Room Dimensions</td>
                            <td>${data.facility.dimensions.length} × ${data.facility.dimensions.width} × ${data.facility.dimensions.height}</td>
                            <td>${data.facility.dimensions.unit}</td>
                        </tr>
                        <tr>
                            <td>Total Floor Area</td>
                            <td>${data.facility.area.toLocaleString()}</td>
                            <td>sq ft</td>
                        </tr>
                        <tr>
                            <td>Cultivation Tables</td>
                            <td>${data.layout.tables}</td>
                            <td>units</td>
                        </tr>
                        <tr>
                            <td>Canopy Area</td>
                            <td>${data.layout.canopyArea.toLocaleString()}</td>
                            <td>sq ft</td>
                        </tr>
                        <tr class="highlight-row">
                            <td>Space Utilization</td>
                            <td><strong>${data.layout.utilization.toFixed(1)}%</strong></td>
                            <td>-</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Lighting Design -->
            <div class="section">
                <h2 class="section-title">Lighting System Design</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${data.lighting.averagePPFD.toFixed(0)}</div>
                        <div class="metric-label">Avg PPFD (μmol/m²/s)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.lighting.uniformity.toFixed(2)}</div>
                        <div class="metric-label">Uniformity Ratio</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.lighting.powerDensity.toFixed(1)}</div>
                        <div class="metric-label">Power Density (W/sq ft)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.lighting.dli?.toFixed(1) || 'N/A'}</div>
                        <div class="metric-label">DLI (mol/m²/day)</div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Fixture Details</th>
                            <th>Specification</th>
                        </tr>
                        <tr>
                            <td>Model</td>
                            <td>${data.lighting.model}</td>
                        </tr>
                        <tr>
                            <td>Manufacturer</td>
                            <td>${data.lighting.manufacturer || 'Fluence'}</td>
                        </tr>
                        <tr>
                            <td>Quantity</td>
                            <td>${data.lighting.fixtures} units</td>
                        </tr>
                        <tr>
                            <td>Power per Fixture</td>
                            <td>${(data.lighting.totalPower / data.lighting.fixtures).toFixed(0)}W</td>
                        </tr>
                        ${data.lighting.mountingHeight ? `
                        <tr>
                            <td>Mounting Height</td>
                            <td>${data.lighting.mountingHeight} ft</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                ${data.lighting.zones ? `
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Zone</th>
                            <th>Fixtures</th>
                        </tr>
                        ${Object.entries(data.lighting.zones).map(([zone, count]) => `
                        <tr>
                            <td>${zone.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                            <td>${count} units</td>
                        </tr>
                        `).join('')}
                    </table>
                </div>
                ` : ''}
            </div>
            
            <!-- Structural Design -->
            ${data.structural ? `
            <div class="section">
                <h2 class="section-title">Structural Design</h2>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Component</th>
                            <th>Specification</th>
                        </tr>
                        ${data.structural.frameType ? `
                        <tr>
                            <td>Frame Type</td>
                            <td>${data.structural.frameType}</td>
                        </tr>
                        ` : ''}
                        ${data.structural.frameMaterial ? `
                        <tr>
                            <td>Frame Material</td>
                            <td>${data.structural.frameMaterial}</td>
                        </tr>
                        ` : ''}
                        ${data.structural.glazingType ? `
                        <tr>
                            <td>Glazing Type</td>
                            <td>${data.structural.glazingType}</td>
                        </tr>
                        ` : ''}
                        ${data.structural.ventilation ? `
                        <tr>
                            <td>Ventilation System</td>
                            <td>${data.structural.ventilation}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- HVAC Systems -->
            ${data.hvac ? `
            <div class="section">
                <h2 class="section-title">HVAC & Environmental Systems</h2>
                ${data.hvac.heating ? `
                <div class="table-container">
                    <table>
                        <tr>
                            <th colspan="2">Heating System</th>
                        </tr>
                        ${data.hvac.heating.boilers ? `
                        <tr>
                            <td>Boilers</td>
                            <td>${data.hvac.heating.boilers}</td>
                        </tr>
                        ` : ''}
                        ${data.hvac.heating.capacity ? `
                        <tr>
                            <td>Total Capacity</td>
                            <td>${data.hvac.heating.capacity}</td>
                        </tr>
                        ` : ''}
                        ${data.hvac.heating.distribution ? `
                        <tr>
                            <td>Distribution</td>
                            <td>${data.hvac.heating.distribution}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                ` : ''}
                
                ${data.hvac.cooling ? `
                <div class="table-container">
                    <table>
                        <tr>
                            <th colspan="2">Cooling System</th>
                        </tr>
                        ${data.hvac.cooling.chiller ? `
                        <tr>
                            <td>Chiller</td>
                            <td>${data.hvac.cooling.chiller}</td>
                        </tr>
                        ` : ''}
                        ${data.hvac.cooling.fanCoils ? `
                        <tr>
                            <td>Fan Coils</td>
                            <td>${data.hvac.cooling.fanCoils}</td>
                        </tr>
                        ` : ''}
                        ${data.hvac.cooling.hafFans ? `
                        <tr>
                            <td>HAF Fans</td>
                            <td>${data.hvac.cooling.hafFans}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                ` : ''}
                
                ${data.hvac.automation ? `
                <div class="table-container">
                    <table>
                        <tr>
                            <td>Automation System</td>
                            <td>${data.hvac.automation}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- Irrigation Systems -->
            ${data.irrigation ? `
            <div class="section">
                <h2 class="section-title">Irrigation & Water Systems</h2>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Component</th>
                            <th>Specification</th>
                        </tr>
                        ${data.irrigation.waterStorage ? `
                        <tr>
                            <td>Water Storage</td>
                            <td>${data.irrigation.waterStorage}</td>
                        </tr>
                        ` : ''}
                        ${data.irrigation.treatment ? `
                        <tr>
                            <td>Water Treatment</td>
                            <td>${data.irrigation.treatment}</td>
                        </tr>
                        ` : ''}
                        ${data.irrigation.pumps ? `
                        <tr>
                            <td>Pump Systems</td>
                            <td>${data.irrigation.pumps}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- Electrical Requirements -->
            ${data.electrical ? `
            <div class="section">
                <h2 class="section-title">Electrical Requirements</h2>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Parameter</th>
                            <th>Specification</th>
                        </tr>
                        <tr>
                            <td>Recommended Voltage</td>
                            <td>${data.electrical.voltage}</td>
                        </tr>
                        <tr>
                            <td>Total Connected Load</td>
                            <td>${(data.electrical.totalLoad / 1000).toFixed(1)} kW</td>
                        </tr>
                        <tr>
                            <td>Circuit Breaker Size</td>
                            <td>${data.electrical.breakerSize}A</td>
                        </tr>
                        <tr>
                            <td>Panel Requirement</td>
                            <td>${data.electrical.panelRequirement || '100A sub-panel minimum'}</td>
                        </tr>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- Financial Analysis -->
            <div class="section">
                <h2 class="section-title">Financial Analysis</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$${data.financial.equipmentCost.toLocaleString()}</div>
                        <div class="metric-label">Equipment Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${data.financial.installationCost.toLocaleString()}</div>
                        <div class="metric-label">Installation Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${(data.financial.totalInvestment || (data.financial.equipmentCost + data.financial.installationCost)).toLocaleString()}</div>
                        <div class="metric-label">Total Investment</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value ${data.financial.roi <= 5 ? 'roi-positive' : ''}">
                            ${data.financial.roi.toFixed(1)} years
                        </div>
                        <div class="metric-label">Return on Investment</div>
                    </div>
                </div>
                
                ${data.financial.annualSavings ? `
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Annual Metrics</th>
                            <th>Amount</th>
                        </tr>
                        <tr>
                            <td>Energy Cost</td>
                            <td>$${data.financial.annualEnergyCost?.toLocaleString() || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Annual Savings vs HPS</td>
                            <td class="roi-positive">$${data.financial.annualSavings.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>10-Year Net Benefit</td>
                            <td class="roi-positive">$${(data.financial.annualSavings * 10 - (data.financial.totalInvestment || 0)).toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}
            </div>
            
            <!-- Environmental Impact -->
            ${data.environmental ? `
            <div class="section">
                <h2 class="section-title">Environmental Impact</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${data.environmental.co2Reduction?.toLocaleString() || 'N/A'}</div>
                        <div class="metric-label">CO₂ Reduction (lbs/year)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.environmental.heatLoadReduction?.toLocaleString() || 'N/A'}</div>
                        <div class="metric-label">Heat Load Reduction (BTU/hr)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${data.environmental.waterSavings?.toLocaleString() || 'N/A'}</div>
                        <div class="metric-label">Water Savings (gal/day)</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Performance Metrics -->
            ${data.performance ? `
            <div class="section">
                <h2 class="section-title">Design Performance Metrics</h2>
                <div class="metrics-grid">
                    ${data.performance.calculationTime ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.performance.calculationTime.toFixed(2)}ms</div>
                        <div class="metric-label">Calculation Time</div>
                    </div>
                    ` : ''}
                    ${data.performance.totalFixtures ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.performance.totalFixtures.toLocaleString()}</div>
                        <div class="metric-label">Processed Fixtures</div>
                    </div>
                    ` : ''}
                    ${data.performance.gridResolution ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.performance.gridResolution}×${data.performance.gridResolution}</div>
                        <div class="metric-label">Grid Resolution</div>
                    </div>
                    ` : ''}
                    ${data.performance.memoryUsage ? `
                    <div class="metric-card">
                        <div class="metric-value">${data.performance.memoryUsage.toFixed(1)} MB</div>
                        <div class="metric-label">Memory Usage</div>
                    </div>
                    ` : ''}
                </div>
                <div class="visual-section">
                    <h3>System Capabilities Demonstrated</h3>
                    <p>This report demonstrates Vibelux's capability to handle commercial-scale greenhouse projects with complex lighting layouts, HVAC integration, and comprehensive system analysis.</p>
                </div>
            </div>
            ` : ''}
            
            <!-- Visual Analysis -->
            <div class="section">
                <h2 class="section-title">Design Analysis</h2>
                <div class="visual-section">
                    <h3>PPFD Heat Map</h3>
                    <div class="chart-placeholder">
                        Light Distribution Analysis
                        <br><small>Heat map showing PPFD distribution across facility</small>
                    </div>
                </div>
                <div class="visual-section">
                    <h3>3D Facility Layout</h3>
                    <div class="chart-placeholder">
                        3D Greenhouse Visualization
                        <br><small>Interactive 3D model with fixture placement</small>
                    </div>
                </div>
            </div>
            
            <!-- Report Summary -->
            <div class="section">
                <h2 class="section-title">Executive Summary</h2>
                <div class="visual-section">
                    <h3>Project Highlights</h3>
                    <ul style="text-align: left; max-width: 800px; margin: 0 auto;">
                        <li><strong>Professional Design:</strong> ${data.lighting.fixtures} fixtures optimized for ${data.facility.area.toLocaleString()} sq ft facility</li>
                        <li><strong>Energy Efficiency:</strong> ${data.lighting.powerDensity.toFixed(1)} W/sq ft power density with ${(data.lighting.uniformity * 100).toFixed(0)}% light uniformity</li>
                        <li><strong>Financial Performance:</strong> ${data.financial.roi.toFixed(1)}-year ROI with $${data.financial.totalInvestment?.toLocaleString() || (data.financial.equipmentCost + data.financial.installationCost).toLocaleString()} total investment</li>
                        ${data.facility.greenhouseCount ? `<li><strong>Commercial Scale:</strong> ${data.facility.greenhouseCount} connected greenhouse structures with integrated systems</li>` : ''}
                        <li><strong>Technology Integration:</strong> Complete system design including lighting, HVAC, irrigation, and automation</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">VIBELUX</div>
            <div class="footer-text">
                Professional Lighting Design Software<br>
                © ${new Date().getFullYear()} Vibelux. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
`;
}

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  // Create a temporary div to render the HTML
  const container = document.createElement('div');
  container.innerHTML = generateHTMLReport(data);
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1200px';
  document.body.appendChild(container);

  try {
    // Use html2canvas to capture the HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF, handling multiple pages
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Clean up
    document.body.removeChild(container);

    return pdf.output('blob');
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
}

export function downloadHTMLReport(data: ReportData, filename: string = 'vibelux-report') {
  const html = generateHTMLReport(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPDFReport(data: ReportData, filename: string = 'vibelux-report') {
  try {
    const blob = await generatePDFReport(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}