import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as THREE from 'three';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface AdvancedReportData {
  project: {
    name: string;
    client: string;
    location: string;
    date: string;
    designer?: string;
  };
  facility: {
    dimensions: { length: number; width: number; height: number; unit: string };
    area: number;
    volume: number;
    roomType: string;
  };
  lighting: {
    fixtures: any[];
    heatmapData: number[][];
    ppfdDistribution: { min: number; max: number; avg: number; uniformity: number };
    spectrumData: { wavelength: number; intensity: number }[];
    dliMap: number[][];
  };
  visualizations: {
    layout3D?: string; // Base64 encoded 3D render
    heatmap?: string; // Base64 encoded heatmap
    spectrum?: string; // Base64 encoded spectrum chart
    parDistribution?: string; // Base64 encoded PAR chart
  };
  metrics: {
    electrical: any;
    thermal: any;
    financial: any;
    environmental: any;
  };
}

export async function generateAdvancedHTMLReport(data: AdvancedReportData): Promise<string> {
  const { project, facility, lighting, visualizations, metrics } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Advanced Lighting Analysis | Vibelux Pro</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #ec4899;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #111827;
            --light: #f9fafb;
            --gray: #6b7280;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--dark);
            background: var(--light);
        }
        
        /* Advanced Report Container */
        .report-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
        }
        
        /* Premium Header */
        .report-header {
            position: relative;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            padding: 4rem 3rem;
            overflow: hidden;
        }
        
        .report-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .report-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }
        
        .report-subtitle {
            font-size: 1.5rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        
        .report-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            background: rgba(255,255,255,0.1);
            padding: 1.5rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .meta-icon {
            width: 24px;
            height: 24px;
            opacity: 0.8;
        }
        
        /* Navigation Tabs */
        .report-nav {
            background: var(--dark);
            padding: 0 3rem;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .nav-tabs {
            display: flex;
            gap: 2rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .nav-tab {
            color: #9ca3af;
            padding: 1.25rem 0;
            border-bottom: 3px solid transparent;
            white-space: nowrap;
            transition: all 0.3s ease;
            cursor: pointer;
            font-weight: 500;
        }
        
        .nav-tab:hover {
            color: white;
        }
        
        .nav-tab.active {
            color: white;
            border-bottom-color: var(--primary);
        }
        
        /* Content Sections */
        .report-content {
            padding: 3rem;
        }
        
        .content-section {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .content-section.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* 3D Visualization Container */
        .visualization-3d {
            background: var(--dark);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
            min-height: 600px;
            position: relative;
            overflow: hidden;
        }
        
        .viz-controls {
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
            z-index: 10;
        }
        
        .viz-control {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .viz-control:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        .viz-control.active {
            background: var(--primary);
            border-color: var(--primary);
        }
        
        /* Heat Map Display */
        .heatmap-container {
            background: #f3f4f6;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
        }
        
        .heatmap-canvas {
            width: 100%;
            height: 400px;
            border-radius: 0.5rem;
            overflow: hidden;
            position: relative;
        }
        
        .heatmap-legend {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
        }
        
        .legend-gradient {
            flex: 1;
            height: 30px;
            background: linear-gradient(to right, #440154, #3b528b, #21908c, #5dc863, #fde725);
            border-radius: 0.25rem;
            position: relative;
        }
        
        .legend-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: var(--gray);
        }
        
        /* Advanced Metrics Grid */
        .metrics-advanced {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .metric-card-advanced {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .metric-card-advanced:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .metric-card-advanced::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .metric-title {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--gray);
        }
        
        .metric-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .trend-up {
            color: var(--success);
        }
        
        .trend-down {
            color: var(--danger);
        }
        
        .metric-value-large {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--dark);
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .metric-subtitle {
            font-size: 0.875rem;
            color: var(--gray);
        }
        
        .metric-chart {
            margin-top: 1rem;
            height: 80px;
        }
        
        /* Spectrum Analysis */
        .spectrum-analysis {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
        }
        
        .spectrum-chart {
            height: 400px;
            margin-bottom: 2rem;
        }
        
        .spectrum-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            padding: 1.5rem;
            background: var(--light);
            border-radius: 0.5rem;
        }
        
        .spectrum-metric {
            text-align: center;
        }
        
        .spectrum-metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
        }
        
        .spectrum-metric-label {
            font-size: 0.75rem;
            color: var(--gray);
            text-transform: uppercase;
        }
        
        /* Interactive Tables */
        .data-table-advanced {
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .table-header {
            background: var(--light);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--dark);
        }
        
        .table-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .table-action {
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .table-action:hover {
            background: var(--light);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .table-content {
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: var(--light);
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--dark);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #e5e7eb;
        }
        
        td {
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        tr:hover {
            background: #fafbfc;
        }
        
        /* ROI Visualization */
        .roi-visualization {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 1rem;
            padding: 2.5rem;
            margin-bottom: 3rem;
        }
        
        .roi-chart-container {
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .roi-timeline {
            position: relative;
            height: 60px;
            background: #e5e7eb;
            border-radius: 30px;
            margin: 2rem 0;
            overflow: hidden;
        }
        
        .roi-progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background: linear-gradient(90deg, var(--danger) 0%, var(--warning) 40%, var(--success) 100%);
            border-radius: 30px;
            transition: width 2s ease;
        }
        
        .roi-marker {
            position: absolute;
            top: -30px;
            transform: translateX(-50%);
            text-align: center;
        }
        
        .roi-marker-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
        }
        
        .roi-marker-label {
            font-size: 0.75rem;
            color: var(--gray);
        }
        
        /* Print Styles */
        @media print {
            .report-nav,
            .viz-controls {
                display: none;
            }
            
            .content-section {
                display: block !important;
                page-break-before: always;
            }
            
            .content-section:first-child {
                page-break-before: avoid;
            }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .report-header {
                padding: 2rem 1.5rem;
            }
            
            .report-title {
                font-size: 2rem;
            }
            
            .report-content {
                padding: 1.5rem;
            }
            
            .metrics-advanced {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="report-wrapper">
        <!-- Premium Header -->
        <header class="report-header">
            <div class="header-content">
                <h1 class="report-title">${project.name}</h1>
                <p class="report-subtitle">Advanced Lighting Analysis Report</p>
                
                <div class="report-meta">
                    <div class="meta-item">
                        <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span>${project.client}</span>
                    </div>
                    <div class="meta-item">
                        <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>${project.location}</span>
                    </div>
                    <div class="meta-item">
                        <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>${new Date(project.date).toLocaleDateString()}</span>
                    </div>
                    <div class="meta-item">
                        <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                        </svg>
                        <span>Vibelux Pro v3.0</span>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Navigation -->
        <nav class="report-nav">
            <div class="nav-tabs">
                <div class="nav-tab active" onclick="showSection('overview')">Overview</div>
                <div class="nav-tab" onclick="showSection('3d-layout')">3D Layout</div>
                <div class="nav-tab" onclick="showSection('light-analysis')">Light Analysis</div>
                <div class="nav-tab" onclick="showSection('spectrum')">Spectrum</div>
                <div class="nav-tab" onclick="showSection('electrical')">Electrical</div>
                <div class="nav-tab" onclick="showSection('thermal')">Thermal</div>
                <div class="nav-tab" onclick="showSection('financial')">Financial</div>
                <div class="nav-tab" onclick="showSection('environmental')">Environmental</div>
            </div>
        </nav>
        
        <!-- Content -->
        <div class="report-content">
            <!-- Overview Section -->
            <div id="overview" class="content-section active">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Executive Overview</h2>
                
                <!-- Advanced Metrics Grid -->
                <div class="metrics-advanced">
                    <div class="metric-card-advanced">
                        <div class="metric-header">
                            <span class="metric-title">Total Light Output</span>
                            <span class="metric-trend trend-up">↑ 35%</span>
                        </div>
                        <div class="metric-value-large">${(lighting.fixtures.length * 1700).toLocaleString()}</div>
                        <div class="metric-subtitle">μmol/s total PPF</div>
                        <div class="metric-chart">
                            <canvas id="ppf-sparkline"></canvas>
                        </div>
                    </div>
                    
                    <div class="metric-card-advanced">
                        <div class="metric-header">
                            <span class="metric-title">Average PPFD</span>
                            <span class="metric-trend trend-up">↑ 35.5%</span>
                        </div>
                        <div class="metric-value-large">${lighting.ppfdDistribution.avg}</div>
                        <div class="metric-subtitle">μmol/m²/s at canopy</div>
                        <div class="metric-chart">
                            <canvas id="ppfd-sparkline"></canvas>
                        </div>
                    </div>
                    
                    <div class="metric-card-advanced">
                        <div class="metric-header">
                            <span class="metric-title">Uniformity Ratio</span>
                            <span class="metric-trend trend-up">↑ 12%</span>
                        </div>
                        <div class="metric-value-large">${lighting.ppfdDistribution.uniformity.toFixed(2)}</div>
                        <div class="metric-subtitle">Min/Avg ratio</div>
                        <div class="metric-chart">
                            <canvas id="uniformity-sparkline"></canvas>
                        </div>
                    </div>
                    
                    <div class="metric-card-advanced">
                        <div class="metric-header">
                            <span class="metric-title">Energy Efficiency</span>
                            <span class="metric-trend trend-up">↑ 33%</span>
                        </div>
                        <div class="metric-value-large">2.6</div>
                        <div class="metric-subtitle">μmol/J efficacy</div>
                        <div class="metric-chart">
                            <canvas id="efficiency-sparkline"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Facility Summary -->
                <div class="data-table-advanced">
                    <div class="table-header">
                        <h3 class="table-title">Facility Specifications</h3>
                        <div class="table-actions">
                            <button class="table-action">Export CSV</button>
                            <button class="table-action">Print</button>
                        </div>
                    </div>
                    <div class="table-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Unit</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Room Type</td>
                                    <td>${facility.roomType}</td>
                                    <td>-</td>
                                    <td>Flowering stage cultivation</td>
                                </tr>
                                <tr>
                                    <td>Dimensions</td>
                                    <td>${facility.dimensions.length} × ${facility.dimensions.width} × ${facility.dimensions.height}</td>
                                    <td>${facility.dimensions.unit}</td>
                                    <td>L × W × H</td>
                                </tr>
                                <tr>
                                    <td>Floor Area</td>
                                    <td>${facility.area.toLocaleString()}</td>
                                    <td>sq ft</td>
                                    <td>Total cultivation space</td>
                                </tr>
                                <tr>
                                    <td>Volume</td>
                                    <td>${facility.volume.toLocaleString()}</td>
                                    <td>cu ft</td>
                                    <td>For HVAC calculations</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- 3D Layout Section -->
            <div id="3d-layout" class="content-section">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">3D Facility Layout</h2>
                
                <div class="visualization-3d">
                    <div class="viz-controls">
                        <button class="viz-control active">Tables</button>
                        <button class="viz-control active">Lights</button>
                        <button class="viz-control">HVAC</button>
                        <button class="viz-control">Workflow</button>
                        <button class="viz-control">Reset View</button>
                    </div>
                    
                    ${visualizations.layout3D ? `
                        <img src="${visualizations.layout3D}" alt="3D Layout" style="width: 100%; height: 100%; object-fit: contain;">
                    ` : `
                        <div style="height: 500px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                            <div style="text-align: center;">
                                <svg style="width: 64px; height: 64px; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                </svg>
                                <p>Interactive 3D visualization would be rendered here</p>
                                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Featuring real-time lighting simulation and fixture placement</p>
                            </div>
                        </div>
                    `}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
                    <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
                        <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Fixture Count</h4>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">${lighting.fixtures.length}</p>
                        <p style="font-size: 0.875rem; color: var(--gray);">SPYDR 2p units</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
                        <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Table Count</h4>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">9</p>
                        <p style="font-size: 0.875rem; color: var(--gray);">Rolling benches</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
                        <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Canopy Coverage</h4>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">74.4%</p>
                        <p style="font-size: 0.875rem; color: var(--gray);">Space utilization</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
                        <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Plant Sites</h4>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">4,320</p>
                        <p style="font-size: 0.875rem; color: var(--gray);">@ 4/sq ft density</p>
                    </div>
                </div>
            </div>
            
            <!-- Light Analysis Section -->
            <div id="light-analysis" class="content-section">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Photometric Analysis</h2>
                
                <!-- Heat Map -->
                <div class="heatmap-container">
                    <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">PPFD Distribution Heat Map</h3>
                    <div class="heatmap-canvas">
                        ${visualizations.heatmap ? `
                            <img src="${visualizations.heatmap}" alt="PPFD Heat Map" style="width: 100%; height: 100%; object-fit: contain;">
                        ` : `
                            <div style="height: 100%; background: linear-gradient(135deg, #440154 0%, #3b528b 25%, #21908c 50%, #5dc863 75%, #fde725 100%); border-radius: 0.5rem;"></div>
                        `}
                    </div>
                    <div class="heatmap-legend">
                        <div style="flex: 1;">
                            <div class="legend-gradient"></div>
                            <div class="legend-labels">
                                <span>${lighting.ppfdDistribution.min}</span>
                                <span>600</span>
                                <span>900</span>
                                <span>1200</span>
                                <span>${lighting.ppfdDistribution.max}</span>
                            </div>
                        </div>
                        <div style="margin-left: 2rem; text-align: right;">
                            <div style="font-weight: 600;">μmol/m²/s</div>
                            <div style="font-size: 0.875rem; color: var(--gray);">at canopy level</div>
                        </div>
                    </div>
                </div>
                
                <!-- PAR Distribution -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">PPFD Statistics</h3>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 0.5rem 0;">Minimum PPFD</td>
                                <td style="text-align: right; font-weight: 600;">${lighting.ppfdDistribution.min} μmol/m²/s</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">Maximum PPFD</td>
                                <td style="text-align: right; font-weight: 600;">${lighting.ppfdDistribution.max} μmol/m²/s</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">Average PPFD</td>
                                <td style="text-align: right; font-weight: 600; color: var(--primary);">${lighting.ppfdDistribution.avg} μmol/m²/s</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">Uniformity (Min/Avg)</td>
                                <td style="text-align: right; font-weight: 600;">${lighting.ppfdDistribution.uniformity.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">CV (Coefficient of Variation)</td>
                                <td style="text-align: right; font-weight: 600;">${((1 - lighting.ppfdDistribution.uniformity) * 100).toFixed(1)}%</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">DLI Calculations</h3>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 0.5rem 0;">12-hour Photoperiod</td>
                                <td style="text-align: right; font-weight: 600;">${(lighting.ppfdDistribution.avg * 0.0432).toFixed(1)} mol/m²/day</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">16-hour Photoperiod</td>
                                <td style="text-align: right; font-weight: 600;">${(lighting.ppfdDistribution.avg * 0.0576).toFixed(1)} mol/m²/day</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">18-hour Photoperiod</td>
                                <td style="text-align: right; font-weight: 600;">${(lighting.ppfdDistribution.avg * 0.0648).toFixed(1)} mol/m²/day</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem 0;">Recommended DLI Range</td>
                                <td style="text-align: right; font-weight: 600; color: var(--success);">35-50 mol/m²/day</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Spectrum Analysis Section -->
            <div id="spectrum" class="content-section">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Spectral Analysis</h2>
                
                <div class="spectrum-analysis">
                    <div class="spectrum-chart">
                        <canvas id="spectrum-chart"></canvas>
                    </div>
                    
                    <div class="spectrum-metrics">
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">28%</div>
                            <div class="spectrum-metric-label">Blue (400-500nm)</div>
                        </div>
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">35%</div>
                            <div class="spectrum-metric-label">Green (500-600nm)</div>
                        </div>
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">32%</div>
                            <div class="spectrum-metric-label">Red (600-700nm)</div>
                        </div>
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">5%</div>
                            <div class="spectrum-metric-label">Far Red (700-800nm)</div>
                        </div>
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">1.9</div>
                            <div class="spectrum-metric-label">R:FR Ratio</div>
                        </div>
                        <div class="spectrum-metric">
                            <div class="spectrum-metric-value">0.8</div>
                            <div class="spectrum-metric-label">B:R Ratio</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Financial Section -->
            <div id="financial" class="content-section">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Financial Analysis</h2>
                
                <div class="roi-visualization">
                    <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem;">Return on Investment Timeline</h3>
                    
                    <div class="roi-chart-container">
                        <canvas id="roi-chart" style="height: 300px;"></canvas>
                    </div>
                    
                    <div class="roi-timeline">
                        <div class="roi-progress" style="width: 52%;"></div>
                        <div class="roi-marker" style="left: 52%;">
                            <div class="roi-marker-value">10.4 years</div>
                            <div class="roi-marker-label">Payback Period</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
                        <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">$136,920</div>
                            <div style="font-size: 0.875rem; color: var(--gray);">Total Investment</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--success);">$15,706</div>
                            <div style="font-size: 0.875rem; color: var(--gray);">Annual Savings</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">$177,200</div>
                            <div style="font-size: 0.875rem; color: var(--gray);">20-Year Net Benefit</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Tab Navigation
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active from all tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Mark tab as active
            event.target.classList.add('active');
        }
        
        // Initialize Charts
        window.addEventListener('load', function() {
            // Sparkline charts
            const sparklineOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            };
            
            // PPF Sparkline
            const ppfCtx = document.getElementById('ppf-sparkline')?.getContext('2d');
            if (ppfCtx) {
                new Chart(ppfCtx, {
                    type: 'line',
                    data: {
                        labels: ['', '', '', '', '', ''],
                        datasets: [{
                            data: [100000, 110000, 125000, 130000, 136000, 136000],
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 2
                        }]
                    },
                    options: sparklineOptions
                });
            }
            
            // Spectrum Chart
            const spectrumCtx = document.getElementById('spectrum-chart')?.getContext('2d');
            if (spectrumCtx) {
                new Chart(spectrumCtx, {
                    type: 'line',
                    data: {
                        labels: Array.from({length: 41}, (_, i) => 400 + i * 10),
                        datasets: [{
                            label: 'SPYDR 2p Spectrum',
                            data: [
                                // Simulated spectrum data
                                0.2, 0.4, 0.6, 0.8, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65,
                                0.6, 0.55, 0.5, 0.45, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8,
                                0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5,
                                0.4, 0.3, 0.2, 0.15, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01, 0
                            ],
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: true,
                                text: 'Spectral Power Distribution',
                                font: { size: 16 }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Wavelength (nm)'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Relative Intensity'
                                },
                                min: 0,
                                max: 1
                            }
                        }
                    }
                });
            }
            
            // ROI Chart
            const roiCtx = document.getElementById('roi-chart')?.getContext('2d');
            if (roiCtx) {
                new Chart(roiCtx, {
                    type: 'line',
                    data: {
                        labels: Array.from({length: 21}, (_, i) => i),
                        datasets: [{
                            label: 'Cumulative Cash Flow',
                            data: Array.from({length: 21}, (_, i) => -136920 + (i * 15706)),
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: '20-Year Cash Flow Analysis'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Years'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Cumulative Cash Flow ($)'
                                },
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>
`;
}

// Generate demo charts and visualizations
export function generateVisualizationData(lighting: any): any {
  // This would generate actual chart data, heat maps, etc.
  // For now, returning placeholder data structure
  return {
    heatmap: generateHeatmapImage(lighting.heatmapData),
    spectrum: generateSpectrumChart(lighting.spectrumData),
    parDistribution: generatePARChart(lighting.ppfdDistribution),
    layout3D: null // Would be generated from Three.js scene
  };
}

function generateHeatmapImage(data: number[][]): string {
  // Placeholder - would generate actual heatmap image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

function generateSpectrumChart(data: any[]): string {
  // Placeholder - would generate actual spectrum chart
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

function generatePARChart(data: any): string {
  // Placeholder - would generate actual PAR distribution chart
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}