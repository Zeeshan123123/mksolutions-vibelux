#!/usr/bin/env node

/**
 * Generate Advanced Designer Report - Boundary Cone
 * This demonstrates what the /design/advanced route would produce
 */

const fs = require('fs');
const path = require('path');

// Advanced report HTML with all features
const advancedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boundary Cone - Advanced Lighting Analysis | Vibelux Pro</title>
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
        
        /* Navigation */
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
        
        .nav-tab.active {
            color: white;
            border-bottom-color: var(--primary);
        }
        
        /* Content */
        .report-content {
            padding: 3rem;
        }
        
        /* 3D Visualization */
        .viz-3d {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
            min-height: 600px;
            position: relative;
            overflow: hidden;
        }
        
        .viz-3d::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
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
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .viz-control:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        /* Heat Map */
        .heatmap-advanced {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-bottom: 3rem;
        }
        
        .heatmap-canvas {
            width: 100%;
            height: 500px;
            background: linear-gradient(135deg, 
                #440154 0%, #482878 10%, #3e4a89 20%, 
                #31688e 30%, #26838e 40%, #1f9e89 50%, 
                #35b779 60%, #6dce59 70%, #b4de2c 80%, 
                #fde725 100%);
            border-radius: 0.5rem;
            position: relative;
            overflow: hidden;
        }
        
        .heatmap-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: grid;
            grid-template-columns: repeat(16, 1fr);
            grid-template-rows: repeat(5, 1fr);
            gap: 1px;
            padding: 1rem;
        }
        
        .heatmap-cell {
            background: rgba(255,255,255,0.1);
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        
        /* Spectrum Analysis */
        .spectrum-viz {
            background: #f9fafb;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
        }
        
        .spectrum-chart {
            height: 400px;
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            position: relative;
            overflow: hidden;
        }
        
        .spectrum-curve {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                #4c1d95 0%, #5b21b6 15%, #1e40af 30%, 
                #059669 45%, #eab308 60%, #dc2626 75%, 
                #7c2d12 90%, #450a0a 100%);
            mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,350 Q100,300 200,250 T400,200 T600,150 T800,200 T1000,250' fill='none' stroke='black' stroke-width='8'/%3E%3C/svg%3E");
            mask-size: 100% 100%;
            mask-repeat: no-repeat;
        }
        
        /* Advanced Metrics */
        .metrics-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .metric-widget {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        
        .metric-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        }
        
        .metric-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            color: white;
        }
        
        .metric-value {
            font-size: 3rem;
            font-weight: 800;
            color: var(--dark);
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 0.875rem;
            color: var(--gray);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }
        
        .metric-chart-mini {
            height: 60px;
            background: linear-gradient(to top, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
            border-radius: 0.5rem;
            position: relative;
            overflow: hidden;
        }
        
        .metric-chart-line {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary);
            transform-origin: left;
            animation: growLine 2s ease-out;
        }
        
        @keyframes growLine {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
        
        /* ROI Visualization */
        .roi-analysis {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            border-radius: 1rem;
            padding: 3rem;
            margin-bottom: 3rem;
        }
        
        .roi-timeline {
            position: relative;
            height: 80px;
            background: white;
            border-radius: 40px;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .roi-progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background: linear-gradient(90deg, var(--danger) 0%, var(--warning) 40%, var(--success) 100%);
            border-radius: 40px;
            width: 52%;
            animation: fillProgress 2s ease-out;
        }
        
        @keyframes fillProgress {
            from { width: 0; }
            to { width: 52%; }
        }
        
        .roi-markers {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            pointer-events: none;
        }
        
        .roi-marker {
            text-align: center;
        }
        
        .roi-year {
            font-size: 0.75rem;
            color: var(--gray);
        }
        
        .roi-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--dark);
        }
        
        /* Tables */
        .data-table-pro {
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
        }
        
        .table-header-pro {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-title-pro {
            font-size: 1.25rem;
            font-weight: 600;
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
        }
        
        td {
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        tr:hover {
            background: #fafbfc;
        }
        
        /* Footer */
        .report-footer {
            background: var(--dark);
            color: white;
            padding: 4rem 3rem;
            text-align: center;
        }
        
        .vibelux-logo {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
    <div class="report-wrapper">
        <!-- Premium Header -->
        <header class="report-header">
            <div class="header-content">
                <h1 class="report-title">Boundary Cone Facility</h1>
                <p class="report-subtitle">Advanced Photometric Analysis & System Design</p>
                
                <div class="report-meta">
                    <div class="meta-item">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span>Mohave Cannabis Co.</span>
                    </div>
                    <div class="meta-item">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Nevada, USA</span>
                    </div>
                    <div class="meta-item">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        <span>80 × SPYDR 2p</span>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Navigation -->
        <nav class="report-nav">
            <div class="nav-tabs">
                <div class="nav-tab active">Overview</div>
                <div class="nav-tab">3D Visualization</div>
                <div class="nav-tab">Light Analysis</div>
                <div class="nav-tab">Spectrum</div>
                <div class="nav-tab">Electrical</div>
                <div class="nav-tab">Thermal</div>
                <div class="nav-tab">Financial</div>
                <div class="nav-tab">Environmental</div>
            </div>
        </nav>
        
        <!-- Content -->
        <div class="report-content">
            <!-- 3D Visualization -->
            <div class="viz-3d">
                <div class="viz-controls">
                    <button class="viz-control">🎯 Reset View</button>
                    <button class="viz-control">📐 Measurements</button>
                    <button class="viz-control">💡 Light Cones</button>
                    <button class="viz-control">🌡️ Heat Map</button>
                </div>
                <div style="position: relative; z-index: 1; height: 500px; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: white;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🏭</div>
                        <h3 style="font-size: 2rem; margin-bottom: 1rem;">Interactive 3D Facility Model</h3>
                        <p style="opacity: 0.8;">66' × 22' × 10' Cultivation Room</p>
                        <p style="opacity: 0.8;">80 Fixtures • 9 Rolling Tables • Optimized Layout</p>
                        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                            <div style="background: rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700;">1,355</div>
                                <div style="font-size: 0.875rem; opacity: 0.8;">Avg PPFD</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700;">0.85</div>
                                <div style="font-size: 0.875rem; opacity: 0.8;">Uniformity</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700;">74.4%</div>
                                <div style="font-size: 0.875rem; opacity: 0.8;">Coverage</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Metrics Dashboard -->
            <div class="metrics-dashboard">
                <div class="metric-widget">
                    <div class="metric-icon">💡</div>
                    <div class="metric-value">136,000</div>
                    <div class="metric-label">Total PPF Output (μmol/s)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line"></div>
                    </div>
                </div>
                
                <div class="metric-widget">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-value">51.6</div>
                    <div class="metric-label">Total Power (kW)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line" style="animation-delay: 0.2s;"></div>
                    </div>
                </div>
                
                <div class="metric-widget">
                    <div class="metric-icon">🌱</div>
                    <div class="metric-value">58.6</div>
                    <div class="metric-label">DLI @ 12hr (mol/m²/day)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line" style="animation-delay: 0.4s;"></div>
                    </div>
                </div>
                
                <div class="metric-widget">
                    <div class="metric-icon">💰</div>
                    <div class="metric-value">10.4</div>
                    <div class="metric-label">ROI Period (years)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line" style="animation-delay: 0.6s;"></div>
                    </div>
                </div>
                
                <div class="metric-widget">
                    <div class="metric-icon">🌡️</div>
                    <div class="metric-value">25,249</div>
                    <div class="metric-label">Heat Reduction (BTU/hr)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line" style="animation-delay: 0.8s;"></div>
                    </div>
                </div>
                
                <div class="metric-widget">
                    <div class="metric-icon">🌍</div>
                    <div class="metric-value">29,819</div>
                    <div class="metric-label">CO₂ Saved (lbs/year)</div>
                    <div class="metric-chart-mini">
                        <div class="metric-chart-line" style="animation-delay: 1s;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Heat Map -->
            <div class="heatmap-advanced">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">PPFD Distribution Analysis</h2>
                <div class="heatmap-canvas">
                    <div class="heatmap-grid">
                        ${Array(80).fill(0).map((_, i) => {
                            const intensity = 1100 + Math.random() * 500;
                            const opacity = (intensity - 1100) / 500;
                            return `<div class="heatmap-cell" style="background: rgba(253, 231, 37, ${0.5 + opacity * 0.5});">${Math.round(intensity)}</div>`;
                        }).join('')}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                    <div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">PPFD Statistics</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray);">Minimum</div>
                                <div style="font-size: 1.5rem; font-weight: 700;">1,150 μmol/m²/s</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray);">Maximum</div>
                                <div style="font-size: 1.5rem; font-weight: 700;">1,560 μmol/m²/s</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray);">Average</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">1,355 μmol/m²/s</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray);">Uniformity</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">0.85</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Uniformity Map</h3>
                        <div style="width: 200px; height: 200px; background: conic-gradient(from 0deg, #10b981 0deg, #10b981 306deg, #f59e0b 306deg, #f59e0b 360deg); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <div style="background: white; width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                                <div style="font-size: 2rem; font-weight: 700;">85%</div>
                                <div style="font-size: 0.75rem; color: var(--gray);">Uniformity</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Spectrum Analysis -->
            <div class="spectrum-viz">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Spectral Power Distribution</h2>
                <div class="spectrum-chart">
                    <div class="spectrum-curve"></div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-top: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: #4c1d95; border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">UV</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">2%</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: #1e40af; border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">Blue</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">28%</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: #059669; border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">Green</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">35%</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: #dc2626; border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">Red</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">30%</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: #7c2d12; border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">Far Red</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">5%</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(90deg, #1e40af 0%, #dc2626 100%); border-radius: 50%; margin: 0 auto 0.5rem;"></div>
                        <div style="font-weight: 600;">B:R Ratio</div>
                        <div style="font-size: 0.875rem; color: var(--gray);">0.93</div>
                    </div>
                </div>
            </div>
            
            <!-- Financial ROI Analysis -->
            <div class="roi-analysis">
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Financial Return Analysis</h2>
                
                <div class="roi-timeline">
                    <div class="roi-progress"></div>
                    <div class="roi-markers">
                        <div class="roi-marker">
                            <div class="roi-year">Year 0</div>
                            <div class="roi-label">-$136,920</div>
                        </div>
                        <div class="roi-marker">
                            <div class="roi-year">Year 5</div>
                            <div class="roi-label">-$58,390</div>
                        </div>
                        <div class="roi-marker">
                            <div class="roi-year">Year 10.4</div>
                            <div class="roi-label" style="color: var(--success);">$0</div>
                        </div>
                        <div class="roi-marker">
                            <div class="roi-year">Year 15</div>
                            <div class="roi-label">+$71,714</div>
                        </div>
                        <div class="roi-marker">
                            <div class="roi-year">Year 20</div>
                            <div class="roi-label">+$177,200</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem;">
                    <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Initial Investment</h3>
                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--danger);">$136,920</div>
                        <div style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">Equipment + Installation</div>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Annual Savings</h3>
                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--success);">$15,706</div>
                        <div style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">Energy + Maintenance</div>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">20-Year Benefit</h3>
                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary);">$177,200</div>
                        <div style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">Net Positive Cash Flow</div>
                    </div>
                </div>
            </div>
            
            <!-- Professional Data Tables -->
            <div class="data-table-pro">
                <div class="table-header-pro">
                    <h3 class="table-title-pro">Electrical Load Analysis</h3>
                    <div style="display: flex; gap: 1rem;">
                        <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Export CSV</button>
                        <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Print</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Circuit</th>
                            <th>Fixtures</th>
                            <th>Load (kW)</th>
                            <th>Voltage</th>
                            <th>Current (A)</th>
                            <th>Breaker Size</th>
                            <th>Wire Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Circuit A1</td>
                            <td>20</td>
                            <td>12.9</td>
                            <td>480V 3φ</td>
                            <td>15.5</td>
                            <td>20A</td>
                            <td>12 AWG</td>
                        </tr>
                        <tr>
                            <td>Circuit A2</td>
                            <td>20</td>
                            <td>12.9</td>
                            <td>480V 3φ</td>
                            <td>15.5</td>
                            <td>20A</td>
                            <td>12 AWG</td>
                        </tr>
                        <tr>
                            <td>Circuit B1</td>
                            <td>20</td>
                            <td>12.9</td>
                            <td>480V 3φ</td>
                            <td>15.5</td>
                            <td>20A</td>
                            <td>12 AWG</td>
                        </tr>
                        <tr>
                            <td>Circuit B2</td>
                            <td>20</td>
                            <td>12.9</td>
                            <td>480V 3φ</td>
                            <td>15.5</td>
                            <td>20A</td>
                            <td>12 AWG</td>
                        </tr>
                        <tr style="background: var(--light); font-weight: 600;">
                            <td>Total</td>
                            <td>80</td>
                            <td>51.6</td>
                            <td>480V 3φ</td>
                            <td>62.1</td>
                            <td>80A Main</td>
                            <td>4 AWG Feed</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="report-footer">
            <div class="vibelux-logo">VIBELUX PRO</div>
            <p style="font-size: 1.125rem; margin-bottom: 2rem;">Advanced Lighting Design Software</p>
            <p style="opacity: 0.8; max-width: 600px; margin: 0 auto 2rem;">
                This report was generated using Vibelux Pro's advanced photometric analysis engine, 
                incorporating real-time 3D visualization, spectral optimization, and comprehensive 
                financial modeling for commercial cultivation facilities.
            </p>
            <div style="display: flex; justify-content: center; gap: 3rem; font-size: 0.875rem; opacity: 0.7;">
                <span>© ${new Date().getFullYear()} Vibelux</span>
                <span>www.vibelux.com</span>
                <span>support@vibelux.com</span>
                <span>1-800-VIBELUX</span>
            </div>
        </footer>
    </div>
</body>
</html>
`;

// Save the advanced report
const timestamp = new Date().toISOString().split('T')[0];
const fileName = `Vibelux_BoundaryCone_Advanced_Designer_Report_${timestamp}.html`;
const outputPath = path.join(process.env.HOME, 'Downloads', fileName);

fs.writeFileSync(outputPath, advancedHTML);

console.log('✨ Advanced Designer Report Generated!');
console.log(`📄 File saved to: ${outputPath}`);
console.log('\nThis demonstrates what /design/advanced would produce:');
console.log('- Interactive 3D visualization with WebGL');
console.log('- Real-time PPFD heat maps with GPU acceleration');
console.log('- Spectral power distribution analysis');
console.log('- Advanced metrics dashboard with live charts');
console.log('- Detailed electrical load balancing');
console.log('- Professional ROI timeline visualization');
console.log('- Export to PDF, DWG, Excel formats');
console.log('\nThe actual app would have:');
console.log('- Live 3D scene you can rotate/zoom');
console.log('- Real-time lighting cone visualization');
console.log('- Interactive heat map overlays');
console.log('- Fixture drag-and-drop editing');
console.log('- Multi-layer visibility controls');
console.log('- Animated transitions and effects');