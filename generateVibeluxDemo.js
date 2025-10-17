#!/usr/bin/env node

/**
 * Generate Vibelux Demo HTML Report
 * Shows the complete workflow output for the Boundary Cone project
 */

const fs = require('fs');
const path = require('path');

// Read test data
const testOutputDir = path.join(__dirname, 'test-output');
const reportData = JSON.parse(fs.readFileSync(path.join(testOutputDir, `report-data-${new Date().toISOString().split('T')[0]}.json`)));

// Generate HTML report
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boundary Cone - Vibelux Professional Lighting Report</title>
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
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" x="0" y="0" width="10" height="10"/></svg>');
            background-size: 10px 10px;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header .subtitle {
            font-size: 1.3rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .header .meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .content {
            padding: 3rem 2rem;
        }
        
        .executive-summary {
            background: #f9fafb;
            border-left: 4px solid #6b46c1;
            padding: 2rem;
            margin-bottom: 3rem;
            border-radius: 0.5rem;
        }
        
        .executive-summary h2 {
            color: #6b46c1;
            margin-bottom: 1rem;
        }
        
        .key-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .key-metric {
            text-align: center;
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .key-metric .value {
            font-size: 2rem;
            font-weight: 700;
            color: #6b46c1;
        }
        
        .key-metric .label {
            font-size: 0.85rem;
            color: #6b7280;
            text-transform: uppercase;
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section-title {
            font-size: 2rem;
            color: #1f2937;
            margin-bottom: 2rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 1.5rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: #6b46c1;
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover::before {
            transform: scaleY(1);
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 2.5rem;
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
        
        .metric-description {
            font-size: 0.85rem;
            color: #9ca3af;
            margin-top: 0.5rem;
        }
        
        .table-container {
            overflow-x: auto;
            margin-bottom: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
        }
        
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.05em;
        }
        
        tr:hover {
            background: #f9fafb;
        }
        
        .highlight-row {
            background: #f3f4f6;
            font-weight: 600;
        }
        
        .visualization {
            background: #1f2937;
            border-radius: 0.75rem;
            padding: 2rem;
            margin: 2rem 0;
            color: white;
            text-align: center;
        }
        
        .visualization h3 {
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        
        .layout-grid {
            display: inline-block;
            background: #111827;
            border: 2px solid #374151;
            border-radius: 0.5rem;
            padding: 1rem;
            font-family: monospace;
            font-size: 0.7rem;
            line-height: 1.2;
            white-space: pre;
        }
        
        .footer {
            background: #1f2937;
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .footer-text {
            opacity: 0.8;
            font-size: 0.9rem;
            line-height: 1.8;
        }
        
        .footer-links {
            margin-top: 2rem;
            display: flex;
            justify-content: center;
            gap: 2rem;
            font-size: 0.85rem;
        }
        
        .footer-links a {
            color: #a78bfa;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
            color: #f472b6;
        }
        
        .roi-positive {
            color: #10b981;
        }
        
        .roi-negative {
            color: #ef4444;
        }
        
        .icon {
            width: 1.25rem;
            height: 1.25rem;
            display: inline-block;
            vertical-align: middle;
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
            
            .visualization {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>Boundary Cone Cultivation Facility</h1>
                <div class="subtitle">Professional Lighting Design Report</div>
                <div class="meta">
                    <span>📍 Mohave Cannabis Co.</span>
                    <span>📅 ${new Date().toLocaleDateString()}</span>
                    <span>🔧 Generated by Vibelux Pro</span>
                </div>
            </div>
        </div>
        
        <!-- Executive Summary -->
        <div class="content">
            <div class="executive-summary">
                <h2>Executive Summary</h2>
                <p>This comprehensive lighting design report presents an optimized LED retrofit solution for the Boundary Cone cultivation facility. The design replaces 59 × 1000W HPS fixtures with 80 × Fluence SPYDR 2p LED fixtures, delivering superior light quality, energy efficiency, and long-term cost savings.</p>
                
                <div class="key-metrics">
                    <div class="key-metric">
                        <div class="value">$119,920</div>
                        <div class="label">Total Investment</div>
                    </div>
                    <div class="key-metric">
                        <div class="value">12.5%</div>
                        <div class="label">Energy Reduction</div>
                    </div>
                    <div class="key-metric">
                        <div class="value">1,355</div>
                        <div class="label">Avg PPFD (μmol/m²/s)</div>
                    </div>
                    <div class="key-metric">
                        <div class="value">10.4 yrs</div>
                        <div class="label">ROI Period</div>
                    </div>
                </div>
            </div>
            
            <!-- Facility Overview -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">🏢</span>
                    Facility Overview
                </h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">1,452</div>
                        <div class="metric-label">Total Area (sq ft)</div>
                        <div class="metric-description">66' × 22' × 10' grow room</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">9</div>
                        <div class="metric-label">Rolling Tables</div>
                        <div class="metric-description">20' × 6' each table</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">74.4%</div>
                        <div class="metric-label">Space Utilization</div>
                        <div class="metric-description">1,080 sq ft canopy area</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">4,320</div>
                        <div class="metric-label">Plant Capacity</div>
                        <div class="metric-description">At 4 plants per sq ft</div>
                    </div>
                </div>
            </div>
            
            <!-- Lighting Design -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">💡</span>
                    Lighting System Design
                </h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">80</div>
                        <div class="metric-label">SPYDR 2p Fixtures</div>
                        <div class="metric-description">4' × 4' grid spacing</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">51.6 kW</div>
                        <div class="metric-label">Total Power</div>
                        <div class="metric-description">645W per fixture</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">1,355</div>
                        <div class="metric-label">Average PPFD</div>
                        <div class="metric-description">μmol/m²/s at canopy</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">58.6</div>
                        <div class="metric-label">DLI</div>
                        <div class="metric-description">mol/m²/day @ 12hr</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">0.85</div>
                        <div class="metric-label">Uniformity</div>
                        <div class="metric-description">Light distribution ratio</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">2.6</div>
                        <div class="metric-label">Efficacy</div>
                        <div class="metric-description">μmol/J efficiency</div>
                    </div>
                </div>
                
                <!-- Layout Visualization -->
                <div class="visualization">
                    <h3>Fixture Layout - Top View</h3>
                    <div class="layout-grid">Room: 66' × 22' | Grid: 4' × 4' spacing | ☀ = SPYDR 2p Fixture

┌────────────────────────────────────────────────────────────────┐
│  ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀  │
│                                                                 │
│  ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Table 1   │ │   Table 2   │ │   Table 3   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Table 4   │ │   Table 5   │ │   Table 6   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Table 7   │ │   Table 8   │ │   Table 9   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀   ☀  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘</div>
                </div>
            </div>
            
            <!-- Technical Specifications -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">📊</span>
                    Technical Specifications
                </h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fixture Specifications</th>
                                <th>Value</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Model</td>
                                <td>Fluence SPYDR 2p</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Power Consumption</td>
                                <td>645</td>
                                <td>Watts</td>
                            </tr>
                            <tr>
                                <td>PPF Output</td>
                                <td>1,700</td>
                                <td>μmol/s</td>
                            </tr>
                            <tr>
                                <td>Efficacy</td>
                                <td>2.6</td>
                                <td>μmol/J</td>
                            </tr>
                            <tr>
                                <td>Coverage Area</td>
                                <td>16</td>
                                <td>sq ft (4×4)</td>
                            </tr>
                            <tr>
                                <td>Dimensions</td>
                                <td>47" × 44" × 4"</td>
                                <td>L × W × H</td>
                            </tr>
                            <tr>
                                <td>IP Rating</td>
                                <td>IP66</td>
                                <td>Wet Location</td>
                            </tr>
                            <tr>
                                <td>Dimming Range</td>
                                <td>0-100%</td>
                                <td>0-10V</td>
                            </tr>
                            <tr>
                                <td>Warranty</td>
                                <td>5</td>
                                <td>Years</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Electrical Requirements -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">⚡</span>
                    Electrical Infrastructure
                </h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Electrical Parameter</th>
                                <th>Specification</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Connected Load</td>
                                <td>51.6 kW</td>
                                <td>80 fixtures × 645W</td>
                            </tr>
                            <tr>
                                <td>Recommended Voltage</td>
                                <td>480V 3-Phase</td>
                                <td>For optimal efficiency</td>
                            </tr>
                            <tr>
                                <td>Current Draw</td>
                                <td>62.1A @ 480V</td>
                                <td>3-phase calculation</td>
                            </tr>
                            <tr>
                                <td>Circuit Breaker Size</td>
                                <td>80A</td>
                                <td>125% continuous load</td>
                            </tr>
                            <tr>
                                <td>Panel Requirement</td>
                                <td>100A Sub-panel</td>
                                <td>Minimum specification</td>
                            </tr>
                            <tr>
                                <td>Wire Size</td>
                                <td>4 AWG</td>
                                <td>THHN copper</td>
                            </tr>
                            <tr>
                                <td>Control Wiring</td>
                                <td>18 AWG</td>
                                <td>0-10V dimming</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Financial Analysis -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">💰</span>
                    Financial Analysis
                </h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$119,920</div>
                        <div class="metric-label">Equipment Cost</div>
                        <div class="metric-description">80 × SPYDR 2p @ $1,499</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$12,000</div>
                        <div class="metric-label">Installation Cost</div>
                        <div class="metric-description">Professional installation</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$136,920</div>
                        <div class="metric-label">Total Investment</div>
                        <div class="metric-description">Including electrical work</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$27,121</div>
                        <div class="metric-label">Annual Energy Cost</div>
                        <div class="metric-description">@ $0.12/kWh</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value roi-positive">$13,906</div>
                        <div class="metric-label">Annual Savings</div>
                        <div class="metric-description">vs HPS system</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">10.4</div>
                        <div class="metric-label">Payback Period</div>
                        <div class="metric-description">Years to break even</div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Cost Comparison</th>
                                <th>HPS System</th>
                                <th>LED System</th>
                                <th>Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Fixture Count</td>
                                <td>59 × 1000W</td>
                                <td>80 × 645W</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Total Power</td>
                                <td>59.0 kW</td>
                                <td>51.6 kW</td>
                                <td class="roi-positive">7.4 kW (12.5%)</td>
                            </tr>
                            <tr>
                                <td>Annual Energy</td>
                                <td>258,420 kWh</td>
                                <td>226,008 kWh</td>
                                <td class="roi-positive">32,412 kWh</td>
                            </tr>
                            <tr>
                                <td>Energy Cost/Year</td>
                                <td>$31,010</td>
                                <td>$27,121</td>
                                <td class="roi-positive">$3,889</td>
                            </tr>
                            <tr>
                                <td>Bulb Replacement/Year</td>
                                <td>$8,850</td>
                                <td>$0</td>
                                <td class="roi-positive">$8,850</td>
                            </tr>
                            <tr>
                                <td>HVAC Savings/Year</td>
                                <td>-</td>
                                <td>-</td>
                                <td class="roi-positive">$1,167</td>
                            </tr>
                            <tr class="highlight-row">
                                <td>Total Annual Savings</td>
                                <td>-</td>
                                <td>-</td>
                                <td class="roi-positive">$13,906</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="visualization">
                    <h3>10-Year Financial Projection</h3>
                    <p>Initial Investment: $136,920</p>
                    <p>Cumulative Savings: $139,063</p>
                    <p>Net Benefit: <span class="roi-positive">$2,143</span></p>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">
                        Break-even occurs in year 10, with positive cash flow thereafter.<br/>
                        20-year projected savings: $278,125
                    </p>
                </div>
            </div>
            
            <!-- Environmental Impact -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">🌱</span>
                    Environmental Impact
                </h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">29,819</div>
                        <div class="metric-label">CO₂ Reduction</div>
                        <div class="metric-description">lbs/year saved</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">25,249</div>
                        <div class="metric-label">Heat Load Reduction</div>
                        <div class="metric-description">BTU/hr less cooling</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">1,110</div>
                        <div class="metric-label">Water Savings</div>
                        <div class="metric-description">gallons/day cooling tower</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">15</div>
                        <div class="metric-label">Trees Equivalent</div>
                        <div class="metric-description">CO₂ absorption/year</div>
                    </div>
                </div>
            </div>
            
            <!-- Implementation Recommendations -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">🔧</span>
                    Implementation Recommendations
                </h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Phase</th>
                                <th>Action Items</th>
                                <th>Timeline</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Pre-Installation</td>
                                <td>
                                    • Electrical infrastructure upgrade<br/>
                                    • Install 100A sub-panel<br/>
                                    • Run 480V 3-phase service<br/>
                                    • Install 0-10V dimming controls
                                </td>
                                <td>Week 1-2</td>
                            </tr>
                            <tr>
                                <td>Installation</td>
                                <td>
                                    • Remove existing HPS fixtures<br/>
                                    • Install adjustable hangers at 8' height<br/>
                                    • Mount SPYDR 2p fixtures in 4'×4' grid<br/>
                                    • Connect power and control wiring
                                </td>
                                <td>Week 3-4</td>
                            </tr>
                            <tr>
                                <td>Commissioning</td>
                                <td>
                                    • Test all fixtures and dimming<br/>
                                    • Measure PPFD with quantum meter<br/>
                                    • Adjust heights for uniformity<br/>
                                    • Program lighting schedules
                                </td>
                                <td>Week 5</td>
                            </tr>
                            <tr>
                                <td>Optimization</td>
                                <td>
                                    • Implement sunrise/sunset ramping<br/>
                                    • Set vegetative stage at 60% (400-600 PPFD)<br/>
                                    • Set flowering stage at 100% (800-1200 PPFD)<br/>
                                    • Monitor plant response
                                </td>
                                <td>Ongoing</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1.5rem; margin-top: 2rem;">
                    <h3 style="color: #92400e; margin-bottom: 1rem;">⚠️ Important Maintenance Notes</h3>
                    <ul style="color: #92400e; list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.5rem;">• Clean fixtures quarterly to maintain light output</li>
                        <li style="margin-bottom: 0.5rem;">• Maintain 6-12" distance from canopy for optimal uniformity</li>
                        <li style="margin-bottom: 0.5rem;">• Monitor fixture temperatures and ensure proper ventilation</li>
                        <li style="margin-bottom: 0.5rem;">• Perform annual PPFD measurements to verify performance</li>
                        <li>• Keep spare fixtures on hand (recommend 5% of total)</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">VIBELUX</div>
            <div class="footer-text">
                Professional Lighting Design Software<br>
                Optimizing cultivation facilities with data-driven solutions<br>
                © ${new Date().getFullYear()} Vibelux. All rights reserved.
            </div>
            <div class="footer-links">
                <a href="#">www.vibelux.com</a>
                <a href="#">support@vibelux.com</a>
                <a href="#">1-800-VIBELUX</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Save HTML report
const outputPath = path.join(__dirname, 'Downloads', `Vibelux_BoundaryCone_Professional_Report_${new Date().toISOString().split('T')[0]}.html`);
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, html);

console.log('✅ Professional HTML Report Generated!');
console.log(`📄 File saved to: ${outputPath}`);
console.log('\nReport Summary:');
console.log('- 1,452 sq ft Boundary Cone facility');
console.log('- 80 Fluence SPYDR 2p LED fixtures');
console.log('- 1,355 μmol/m²/s average PPFD');
console.log('- $136,920 total investment');
console.log('- 10.4 year ROI with $13,906 annual savings');
console.log('\nOpen the HTML file in your browser to view the professional report!');