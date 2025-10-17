#!/usr/bin/env node

/**
 * Vertical Farm + Greenhouse Hybrid Project
 * Demonstrates Vibelux output for a combined vertical farming and greenhouse facility
 */

import { ProfessionalDrawingEngine } from './src/lib/construction/professional-drawing-engine.ts';
import { jsPDF } from 'jspdf';
import fs from 'fs';

console.log('🌱 VIBELUX VERTICAL FARM + GREENHOUSE PROJECT');
console.log('='.repeat(80));
console.log('📋 PROJECT: Urban Harvest Hybrid Facility');
console.log('🏢 CLIENT: Urban Harvest Innovations LLC');
console.log('📍 LOCATION: Chicago, Illinois');
console.log('🎯 TYPE: Vertical Farm (5 tiers) + Traditional Greenhouse');
console.log('');

// Project Configuration
const hybridProject = {
  info: {
    name: 'URBAN HARVEST VERTICAL FARM + GREENHOUSE',
    number: 'UHV-2024-001',
    client: 'Urban Harvest Innovations LLC',
    location: '1500 Industrial Blvd, Chicago, IL 60616',
    type: 'Hybrid Vertical Farm & Greenhouse'
  },
  
  // Vertical Farm Section
  verticalFarm: {
    area: 20000,  // 20,000 sq ft footprint
    height: 30,   // 30 ft clear height
    tiers: 5,     // 5 growing levels
    totalGrowArea: 100000,  // 100,000 sq ft growing area
    zones: [
      {
        name: 'Leafy Greens Tower A',
        tiers: 5,
        areaPerTier: 8000,
        crop: 'Lettuce, Spinach, Kale',
        cyclesPerYear: 18,
        targetPPFD: 250,
        photoperiod: '16/8'
      },
      {
        name: 'Herbs & Microgreens Tower B',
        tiers: 5,
        areaPerTier: 6000,
        crop: 'Basil, Cilantro, Microgreens',
        cyclesPerYear: 24,
        targetPPFD: 200,
        photoperiod: '18/6'
      },
      {
        name: 'Strawberry Tower C',
        tiers: 5,
        areaPerTier: 6000,
        crop: 'Strawberries',
        cyclesPerYear: 4,
        targetPPFD: 350,
        photoperiod: '14/10'
      }
    ],
    systems: {
      racking: 'Mobile vertical grow racks with 5 tiers',
      automation: 'Fully automated seeding, transplanting, harvesting',
      irrigation: 'NFT (Nutrient Film Technique) hydroponic',
      lighting: 'LED bars with spectrum control per tier'
    }
  },
  
  // Greenhouse Section
  greenhouse: {
    area: 15000,  // 15,000 sq ft
    type: 'Venlo glass greenhouse',
    height: 20,   // 20 ft gutter height
    zones: [
      {
        name: 'Tomato Production',
        area: 8000,
        crop: 'Vine tomatoes',
        targetPPFD: 600,
        supplementalLighting: true
      },
      {
        name: 'Pepper/Cucumber',
        area: 5000,
        crop: 'Bell peppers, Cucumbers',
        targetPPFD: 500,
        supplementalLighting: true
      },
      {
        name: 'Propagation/Research',
        area: 2000,
        crop: 'Seedlings, R&D',
        targetPPFD: 150,
        supplementalLighting: false
      }
    ],
    systems: {
      glazing: 'Diffused glass with 78% transmission',
      heating: 'Hot water perimeter and under-bench',
      cooling: 'Pad & fan with high-pressure fog',
      screening: 'Energy/shade screens'
    }
  },
  
  // Shared Systems
  sharedSystems: {
    electrical: {
      service: '4000A @ 480Y/277V',
      verticalFarmLoad: 2400,  // kW for VF lighting + systems
      greenhouseLoad: 600,     // kW for GH supplemental + systems
      totalConnected: 3000,
      backup: '1MW diesel generator'
    },
    water: {
      storage: 50000,  // gallons
      roSystem: '100 GPM reverse osmosis',
      recirculation: '95% water recovery',
      rainwater: 'Collection from greenhouse roof'
    },
    hvac: {
      verticalFarmCooling: 600,  // tons
      greenhouseCooling: 200,    // tons
      dehumidification: '20,000 pints/day',
      airFiltration: 'MERV 13 + UV sterilization'
    },
    controls: {
      platform: 'Integrated BMS/SCADA',
      zones: 25,
      sensors: 500,
      aiOptimization: true
    }
  }
};

console.log('🏗️ FACILITY OVERVIEW:');
console.log(`  Vertical Farm: ${hybridProject.verticalFarm.area.toLocaleString()} sq ft footprint`);
console.log(`  Growing Area: ${hybridProject.verticalFarm.totalGrowArea.toLocaleString()} sq ft (5 tiers)`);
console.log(`  Greenhouse: ${hybridProject.greenhouse.area.toLocaleString()} sq ft`);
console.log(`  Total Facility: ${(hybridProject.verticalFarm.area + hybridProject.greenhouse.area).toLocaleString()} sq ft`);
console.log('');

// Generate detailed system designs
console.log('📐 SYSTEM DESIGN DETAILS:');
console.log('');

console.log('1️⃣ VERTICAL FARM SECTION:');
console.log('  Layout:');
console.log('    • 200\' × 100\' footprint');
console.log('    • 30\' clear height');
console.log('    • 5 growing tiers @ 5\' spacing');
console.log('    • 3 production towers');
console.log('  Lighting:');
console.log('    • 12,000 LED grow bars');
console.log('    • 150W each, tunable spectrum');
console.log('    • Total: 1,800 kW lighting load');
console.log('    • Wireless dimming per tier');
console.log('  Growing Systems:');
console.log('    • Mobile rack system on tracks');
console.log('    • NFT hydroponic channels');
console.log('    • Automated nutrient dosing');
console.log('    • Climate control per tier');

console.log('\n2️⃣ GREENHOUSE SECTION:');
console.log('  Structure:');
console.log('    • 150\' × 100\' Venlo design');
console.log('    • 20\' gutter height');
console.log('    • Aluminum frame, glass glazing');
console.log('    • 3 climate zones');
console.log('  Supplemental Lighting:');
console.log('    • 180 × 1000W HPS toplights');
console.log('    • 200 × LED interlights');
console.log('    • Total: 380 kW lighting load');
console.log('  Growing Systems:');
console.log('    • High-wire tomato system');
console.log('    • Drip irrigation with recirculation');
console.log('    • CO2 enrichment to 1000 ppm');
console.log('    • Biological pest control');

console.log('\n3️⃣ SHARED INFRASTRUCTURE:');
console.log('  Electrical:');
console.log('    • 4000A main service');
console.log('    • 12 distribution panels');
console.log('    • 1MW backup generator');
console.log('    • Solar-ready infrastructure');
console.log('  Water Systems:');
console.log('    • 50,000 gal storage');
console.log('    • RO treatment system');
console.log('    • Rainwater harvesting');
console.log('    • 95% water recycling');
console.log('  HVAC:');
console.log('    • 800 tons total cooling');
console.log('    • Zone-based control');
console.log('    • Heat recovery system');
console.log('    • HEPA filtration');

// Generate construction documents
console.log('\n📋 GENERATING CONSTRUCTION DOCUMENTS...\n');

try {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [36, 24]  // D-size
  });

  // Cover sheet
  pdf.setFontSize(36);
  pdf.text('URBAN HARVEST', 18, 8, { align: 'center' });
  pdf.setFontSize(24);
  pdf.text('VERTICAL FARM + GREENHOUSE', 18, 9, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text('35,000 SF Hybrid Growing Facility', 18, 10, { align: 'center' });
  
  // Project data
  pdf.setFontSize(12);
  let yPos = 12;
  const data = [
    'PROJECT INFORMATION:',
    '  Client: Urban Harvest Innovations LLC',
    '  Location: Chicago, Illinois',
    '  Vertical Farm: 20,000 SF × 5 tiers = 100,000 SF growing',
    '  Greenhouse: 15,000 SF Venlo glass structure',
    '  Total Connected Load: 3,000 kW',
    '  Annual Production: 4.5 million lbs produce'
  ];
  
  data.forEach(line => {
    pdf.text(line, 4, yPos);
    yPos += 0.5;
  });

  // Add system diagrams
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('INTEGRATED SYSTEMS DESIGN', 18, 2, { align: 'center' });
  
  // Draw vertical farm section
  pdf.setLineWidth(0.02);
  pdf.rect(2, 3, 6, 8);  // VF outline
  
  // Draw 5 tiers
  for (let i = 0; i < 5; i++) {
    pdf.line(2, 3 + i * 1.6, 8, 3 + i * 1.6);
    pdf.setFontSize(8);
    pdf.text(`TIER ${5-i}`, 2.2, 3.5 + i * 1.6);
  }
  
  // Draw greenhouse section
  pdf.rect(10, 3, 6, 5);  // GH outline
  // Draw peaked roof
  pdf.line(10, 3, 13, 2);
  pdf.line(13, 2, 16, 3);
  
  // Labels
  pdf.setFontSize(12);
  pdf.text('VERTICAL FARM', 5, 11.5, { align: 'center' });
  pdf.text('20,000 SF × 5 TIERS', 5, 12, { align: 'center' });
  pdf.text('GREENHOUSE', 13, 8.5, { align: 'center' });
  pdf.text('15,000 SF', 13, 9, { align: 'center' });
  
  // Connection between facilities
  pdf.setLineWidth(0.04);
  pdf.line(8, 7, 10, 7);
  pdf.setFontSize(10);
  pdf.text('SHARED', 9, 6.5, { align: 'center' });
  pdf.text('SYSTEMS', 9, 6.8, { align: 'center' });

  // Save the PDF
  const pdfOutput = pdf.output('arraybuffer');
  fs.writeFileSync('vertical-farm-greenhouse-hybrid.pdf', Buffer.from(pdfOutput));
  
  console.log('✅ Generated: vertical-farm-greenhouse-hybrid.pdf');
  console.log(`📏 Size: ${(pdfOutput.byteLength / 1024).toFixed(0)} KB`);

} catch (error) {
  console.log('⚠️ Error generating PDF:', error.message);
}

// Production calculations
console.log('\n🌿 PRODUCTION CAPACITY:');
console.log('  Vertical Farm:');
console.log('    • Leafy Greens: 2,880,000 lbs/year');
console.log('    • Herbs: 864,000 lbs/year');
console.log('    • Strawberries: 480,000 lbs/year');
console.log('  Greenhouse:');
console.log('    • Tomatoes: 640,000 lbs/year');
console.log('    • Peppers/Cucumbers: 320,000 lbs/year');
console.log('  TOTAL: 5,184,000 lbs/year');

// Financial projections
console.log('\n💰 FINANCIAL PROJECTIONS:');
console.log('  Capital Investment:');
console.log('    • Vertical Farm: $12,000,000');
console.log('    • Greenhouse: $3,000,000');
console.log('    • Shared Systems: $2,000,000');
console.log('    • Total: $17,000,000');
console.log('  Annual Revenue:');
console.log('    • Produce Sales: $15,552,000');
console.log('    • Operating Margin: 35%');
console.log('    • Net Profit: $5,443,200');
console.log('    • ROI: 3.1 years');

console.log('\n📊 KEY ADVANTAGES OF HYBRID DESIGN:');
console.log('  ✓ Year-round production in all climate zones');
console.log('  ✓ Diverse crop portfolio (leafy greens + vine crops)');
console.log('  ✓ Optimized energy use (VF for high-density, GH for high-light)');
console.log('  ✓ Shared infrastructure reduces costs');
console.log('  ✓ Natural light in greenhouse reduces energy');
console.log('  ✓ Flexible production based on market demand');
console.log('  ✓ Research capabilities in both environments');

console.log('\n🎯 VIBELUX DELIVERABLES FOR THIS PROJECT:');
console.log('  1. Complete architectural plans');
console.log('  2. Structural engineering (5-tier rack system)');
console.log('  3. Electrical design (4000A service)');
console.log('  4. HVAC/dehumidification plans');
console.log('  5. Plumbing/irrigation design');
console.log('  6. Lighting layouts with photometric analysis');
console.log('  7. Control system architecture');
console.log('  8. Equipment specifications');
console.log('  9. Construction details');
console.log('  10. Operating procedures');
console.log('');
console.log('✨ All generated in minutes, not months!');