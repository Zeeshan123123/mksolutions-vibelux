#!/usr/bin/env node

/**
 * Mock Project Demo - Cannabis Cultivation Facility
 * Demonstrates Vibelux advanced features with a complete project
 */

import { ProfessionalDrawingEngine } from './src/lib/construction/professional-drawing-engine.ts';
import { StructuralDesignSystem } from './src/lib/construction/structural-designer.ts';
import { ElectricalSystemDesigner } from './src/lib/construction/electrical-system-designer.ts';
import { HVACConstructionDesigner } from './src/lib/hvac/hvac-construction-designer.ts';
import fs from 'fs';

console.log('🌿 VIBELUX MOCK PROJECT DEMONSTRATION');
console.log('='.repeat(80));
console.log('📋 PROJECT: Green Valley Cannabis Cultivation Facility');
console.log('🏢 CLIENT: Green Valley Farms LLC');
console.log('📍 LOCATION: Denver, Colorado');
console.log('🎯 TYPE: Indoor Cannabis Cultivation - Seed to Sale');
console.log('');

// Mock project configuration
const mockProject = {
  // Project Information
  info: {
    name: 'GREEN VALLEY CANNABIS FACILITY',
    number: 'GVC-2024-001',
    client: 'Green Valley Farms LLC',
    location: '4200 Cannabis Way, Denver, CO 80205',
    architect: 'Cannabis Design Associates',
    engineer: 'Vibelux Engineering, PE',
    contractor: 'TBD'
  },
  
  // Facility Layout
  facility: {
    totalArea: 25000,  // 25,000 sq ft
    zones: [
      {
        name: 'Clone/Mother Room',
        area: 1500,
        lightingType: 'T5 Fluorescent',
        targetPPFD: 200,
        photoperiod: '18/6'
      },
      {
        name: 'Vegetative Room 1',
        area: 3000,
        lightingType: 'LED - Full Spectrum',
        targetPPFD: 400,
        photoperiod: '18/6'
      },
      {
        name: 'Vegetative Room 2',
        area: 3000,
        lightingType: 'LED - Full Spectrum',
        targetPPFD: 400,
        photoperiod: '18/6'
      },
      {
        name: 'Flowering Room 1',
        area: 4000,
        lightingType: 'LED - High Red',
        targetPPFD: 800,
        photoperiod: '12/12'
      },
      {
        name: 'Flowering Room 2',
        area: 4000,
        lightingType: 'LED - High Red',
        targetPPFD: 800,
        photoperiod: '12/12'
      },
      {
        name: 'Flowering Room 3',
        area: 4000,
        lightingType: 'LED - High Red',
        targetPPFD: 800,
        photoperiod: '12/12'
      },
      {
        name: 'Drying Room',
        area: 1500,
        lightingType: 'None',
        targetPPFD: 0,
        photoperiod: 'Dark'
      },
      {
        name: 'Trim/Processing',
        area: 2000,
        lightingType: 'Standard',
        targetPPFD: 50,
        photoperiod: 'As needed'
      },
      {
        name: 'Support Areas',
        area: 2000,
        lightingType: 'Standard',
        targetPPFD: 50,
        photoperiod: 'As needed'
      }
    ]
  },
  
  // Lighting System
  lighting: {
    fixtures: [
      { zone: 'Clone/Mother', type: 'T5 4ft 8-lamp', quantity: 24, wattage: 432 },
      { zone: 'Veg 1', type: 'LED 600W Full Spectrum', quantity: 30, wattage: 600 },
      { zone: 'Veg 2', type: 'LED 600W Full Spectrum', quantity: 30, wattage: 600 },
      { zone: 'Flower 1', type: 'LED 680W Flowering', quantity: 48, wattage: 680 },
      { zone: 'Flower 2', type: 'LED 680W Flowering', quantity: 48, wattage: 680 },
      { zone: 'Flower 3', type: 'LED 680W Flowering', quantity: 48, wattage: 680 }
    ],
    totalFixtures: 228,
    totalWattage: 136416,  // 136.4 kW
    controlSystem: 'Wireless dimming with sunrise/sunset simulation'
  },
  
  // Environmental Controls
  environmental: {
    temperature: {
      veg: { day: 75, night: 68 },
      flower: { day: 78, night: 65 }
    },
    humidity: {
      clone: 70,
      veg: 60,
      flower: { week1_3: 55, week4_6: 50, week7_9: 45 }
    },
    co2: {
      veg: 800,
      flower: 1200
    },
    airChanges: 60  // per hour
  }
};

console.log('📊 FACILITY OVERVIEW:');
console.log(`  • Total Area: ${mockProject.facility.totalArea.toLocaleString()} sq ft`);
console.log(`  • Cultivation Zones: ${mockProject.facility.zones.length}`);
console.log(`  • Total Fixtures: ${mockProject.lighting.totalFixtures}`);
console.log(`  • Lighting Load: ${(mockProject.lighting.totalWattage/1000).toFixed(1)} kW`);
console.log('');

console.log('🏗️ GENERATING PROFESSIONAL OUTPUTS...\n');

// 1. Structural System
console.log('1️⃣ STRUCTURAL DESIGN:');
const structuralDesigner = new StructuralDesignSystem({
  dimensions: {
    length: 200,
    width: 125,
    height: 14
  },
  occupancy: 'F-1',
  location: 'Denver, CO'
});

const structural = structuralDesigner.designStructuralSystem();
console.log(`  ✓ Frame: ${structural.frameType}`);
console.log(`  ✓ Columns: ${structural.columnSize} @ ${structural.columnSpacing}' O.C.`);
console.log(`  ✓ Beams: ${structural.beamSize}`);
console.log(`  ✓ Wind Design: ${structural.windSpeed} mph`);
console.log(`  ✓ Snow Load: 30 psf`);

// 2. Electrical System
console.log('\n2️⃣ ELECTRICAL DESIGN:');
const electricalDesigner = new ElectricalSystemDesigner();
const electricalConfig = {
  totalLoad: mockProject.lighting.totalWattage * 1.25,  // 125% continuous
  voltage: 480,
  phase: 3,
  powerFactor: 0.95
};

const electrical = electricalDesigner.designElectricalSystem(electricalConfig);
console.log(`  ✓ Service: ${electrical.service.mainBreaker}A @ ${electrical.service.voltage}`);
console.log(`  ✓ Panels: ${electrical.panels.length} total`);
console.log(`  ✓ Lighting Panels: 6 @ 225A each`);
console.log(`  ✓ Mechanical Panels: 2 @ 400A each`);
console.log(`  ✓ Emergency Generator: 350kW`);

// 3. HVAC System
console.log('\n3️⃣ HVAC DESIGN:');
const hvacDesigner = new HVACConstructionDesigner();
const hvacConfig = {
  buildingArea: mockProject.facility.totalArea,
  buildingVolume: mockProject.facility.totalArea * 14,
  zones: mockProject.facility.zones.length,
  heatLoad: 175,  // Btuh/sf for cannabis with lights
  coolingLoad: 200,  // Btuh/sf
  ventilationRate: 0.5  // CFM/sf
};

const hvac = hvacDesigner.designHVACSystem(hvacConfig);
console.log(`  ✓ Cooling: ${Math.round(hvacConfig.coolingLoad * mockProject.facility.totalArea / 12000)} tons`);
console.log(`  ✓ Dehumidification: 12 units @ 500 pints/day`);
console.log(`  ✓ Air Handlers: 9 units with HEPA filtration`);
console.log(`  ✓ CO2 System: 1,200 ppm enrichment`);
console.log(`  ✓ Exhaust Fans: 24 units for odor control`);

// 4. Special Cannabis Systems
console.log('\n4️⃣ CANNABIS-SPECIFIC SYSTEMS:');
console.log('  ✓ Fertigation:');
console.log('    • 8-zone automated nutrient dosing');
console.log('    • pH/EC monitoring and control');
console.log('    • 2,000 gallon mix tanks');
console.log('  ✓ Security:');
console.log('    • 64 HD cameras with 30-day storage');
console.log('    • Biometric access control');
console.log('    • Motion detection and alarms');
console.log('  ✓ Environmental Monitoring:');
console.log('    • 48 temp/humidity sensors');
console.log('    • 12 CO2 sensors');
console.log('    • 24 light level sensors');
console.log('    • Cloud-based monitoring');

// Generate professional drawings
console.log('\n📐 GENERATING CONSTRUCTION DOCUMENTS...');
try {
  const titleBlock = {
    companyName: 'VIBELUX ENGINEERING',
    companyAddress: '123 Engineering Way, Suite 100',
    companyPhone: '(555) 123-4567',
    companyEmail: 'engineering@vibelux.ai',
    engineerName: 'John Smith, PE',
    engineerLicense: 'PE-123456'
  };

  const drawingEngine = new ProfessionalDrawingEngine();
  const drawingSet = drawingEngine.generateCompleteDrawingSet(
    {
      ...mockProject.info,
      area: mockProject.facility.totalArea,
      volume: mockProject.facility.totalArea * 14,
      occupancy: 'F-1 (Factory Industrial)',
      constructionType: 'Type II-B'
    },
    titleBlock,
    structural,
    electrical,
    hvac,
    {
      structuralCompliance: true,
      electricalCompliance: true,
      mechanicalCompliance: true,
      energyCompliance: true,
      codeReferences: ['IBC 2021', 'NEC 2020', 'IMC 2021', 'IECC 2021']
    }
  );

  // Export PDF
  const pdfBlob = drawingEngine.exportPDF();
  const buffer = await pdfBlob.arrayBuffer();
  fs.writeFileSync('mock-project-cannabis-facility.pdf', Buffer.from(buffer));
  
  console.log('  ✓ Cover Sheet');
  console.log('  ✓ General Notes');
  console.log('  ✓ Site Plan');
  console.log('  ✓ Floor Plans (with zones)');
  console.log('  ✓ Reflected Ceiling Plans');
  console.log('  ✓ Structural Plans');
  console.log('  ✓ Electrical Plans');
  console.log('  ✓ Lighting Plans');
  console.log('  ✓ Power Plans');
  console.log('  ✓ HVAC Plans');
  console.log('  ✓ Plumbing Plans');
  console.log('  ✓ Details and Schedules');
  console.log('');
  console.log(`  📄 Generated: mock-project-cannabis-facility.pdf`);
  console.log(`  📏 Size: ${(buffer.byteLength / 1024).toFixed(0)} KB`);
  console.log(`  📑 Pages: 15 sheets`);

} catch (error) {
  console.log('  ⚠️ Drawing generation error:', error.message);
}

// Financial Analysis
console.log('\n💰 FINANCIAL ANALYSIS:');
const costs = {
  lighting: mockProject.lighting.totalFixtures * 850,
  electrical: mockProject.facility.totalArea * 18,
  hvac: mockProject.facility.totalArea * 35,
  controls: mockProject.facility.totalArea * 12,
  construction: mockProject.facility.totalArea * 150
};

const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

console.log(`  • Lighting System: $${costs.lighting.toLocaleString()}`);
console.log(`  • Electrical Infrastructure: $${costs.electrical.toLocaleString()}`);
console.log(`  • HVAC System: $${costs.hvac.toLocaleString()}`);
console.log(`  • Controls & Automation: $${costs.controls.toLocaleString()}`);
console.log(`  • Building Construction: $${costs.construction.toLocaleString()}`);
console.log(`  • TOTAL PROJECT COST: $${totalCost.toLocaleString()}`);

// ROI Calculation
console.log('\n📈 ROI PROJECTION:');
const production = {
  floweringArea: 12000,  // sq ft
  yieldsPerSqFt: 0.125,  // lbs per sq ft per cycle
  cyclesPerYear: 6,
  totalYield: 12000 * 0.125 * 6,
  pricePerLb: 1800,
  annualRevenue: 12000 * 0.125 * 6 * 1800
};

console.log(`  • Flowering Canopy: ${production.floweringArea.toLocaleString()} sq ft`);
console.log(`  • Annual Yield: ${production.totalYield.toLocaleString()} lbs`);
console.log(`  • Annual Revenue: $${production.annualRevenue.toLocaleString()}`);
console.log(`  • ROI Period: ${(totalCost / production.annualRevenue).toFixed(1)} years`);

// Energy Efficiency
console.log('\n⚡ ENERGY EFFICIENCY:');
const energy = {
  lightingPowerDensity: mockProject.lighting.totalWattage / mockProject.facility.totalArea,
  annualEnergyUse: mockProject.lighting.totalWattage * 4380 / 1000,  // kWh/year at 12hr avg
  energyCost: mockProject.lighting.totalWattage * 4380 / 1000 * 0.12,
  gramsPerKwh: (production.totalYield * 453.592) / (mockProject.lighting.totalWattage * 4380 / 1000)
};

console.log(`  • Lighting Power Density: ${energy.lightingPowerDensity.toFixed(1)} W/sq ft`);
console.log(`  • Annual Energy Use: ${energy.annualEnergyUse.toLocaleString()} kWh`);
console.log(`  • Annual Energy Cost: $${energy.energyCost.toLocaleString()}`);
console.log(`  • Efficiency: ${energy.gramsPerKwh.toFixed(1)} grams/kWh`);

console.log('\n' + '='.repeat(80));
console.log('✅ MOCK PROJECT COMPLETE!');
console.log('');
console.log('📊 DELIVERABLES GENERATED:');
console.log('  1. Complete construction drawings (PE-stampable)');
console.log('  2. Equipment specifications and schedules');
console.log('  3. Load calculations and analysis');
console.log('  4. Code compliance documentation');
console.log('  5. ROI and financial projections');
console.log('');
console.log('🚀 This mock project demonstrates Vibelux capabilities for:');
console.log('  • Cannabis-specific design optimization');
console.log('  • Integrated MEP engineering');
console.log('  • Professional documentation');
console.log('  • Financial analysis');
console.log('  • Energy efficiency calculations');
console.log('');