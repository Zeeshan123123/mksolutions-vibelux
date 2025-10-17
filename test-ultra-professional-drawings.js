// Test ultra-professional construction drawing generation
import { ProfessionalDrawingEngine } from './src/lib/construction/professional-drawing-engine.ts';
import { StructuralDesignSystem } from './src/lib/construction/structural-designer.ts';
import { ElectricalSystemDesigner } from './src/lib/construction/electrical-system-designer.ts';
import { HVACDesignSystem } from './src/lib/hvac/hvac-construction-designer.ts';
import { CalculationVerificationReport } from './src/lib/construction/calculation-verification.ts';

async function testUltraProfessionalDrawings() {
  console.log('Testing ultra-professional construction drawing generation...');
  
  try {
    // Create test project info
    const projectInfo = {
      name: 'Vibelux Ultra-Professional Test',
      number: 'VP-2024-001',
      client: 'Test Client',
      location: '1234 Test Street, Test City, TC 12345',
      architect: 'Test Architect',
      engineer: 'Professional Engineer, PE',
      contractor: 'Test Contractor LLC',
      area: 69120, // 480' x 144'
      volume: 1382400, // 20' height
      occupancy: 'F-1 (Factory Industrial)',
      constructionType: 'Type II-B'
    };
    
    const titleBlockInfo = {
      companyName: 'VIBELUX ENGINEERING',
      companyAddress: '123 Engineering Blvd, Suite 100',
      companyPhone: '(555) 123-4567',
      companyEmail: 'engineering@vibelux.ai',
      engineerName: 'Blake Lange, PE',
      engineerLicense: 'PE-123456'
    };
    
    // Create test structural system
    const structural = {
      dimensions: { length: 480, width: 144, height: 20 },
      frameType: 'Rigid Frame',
      material: 'Steel',
      foundationType: 'Spread Footing',
      columnSpacing: 24,
      baySpacing: 24,
      beamDepth: 21,
      columnSize: 'W10x49',
      beamSize: 'W21x44',
      windSpeed: 115,
      seismicCategory: 'D',
      soilBearing: 3000,
      roofType: 'Standing Seam Metal',
      roofSlope: 0.25
    };
    
    // Create test electrical system
    const electrical = {
      serviceSize: 3000,
      voltage: 480,
      phase: 3,
      panels: [
        { name: 'MDP', amps: 3000, voltage: '480/277V' },
        { name: 'LP-1', amps: 400, voltage: '277V' },
        { name: 'LP-2', amps: 400, voltage: '277V' },
        { name: 'LP-3', amps: 400, voltage: '277V' },
        { name: 'LP-4', amps: 400, voltage: '277V' },
        { name: 'PP-1', amps: 200, voltage: '480V' },
        { name: 'PP-2', amps: 200, voltage: '480V' }
      ],
      lightingPower: 138.24, // kW
      plugLoadPower: 69.12, // kW
      mechanicalPower: 345.6, // kW
      lightingType: 'LED High Bay',
      fixtureCount: 576,
      fixtureWattage: 240,
      controlSystem: 'Integrated BAS',
      emergencyPower: 34.56 // kW
    };
    
    // Create test HVAC system
    const hvac = {
      systemType: 'Rooftop Units',
      totalCapacity: 240, // tons
      unitCount: 8,
      unitCapacity: 30, // tons each
      ventilationRate: 14400, // CFM
      heatingCapacity: 2400000, // BTU/hr
      coolingCapacity: 2880000, // BTU/hr
      ductworkType: 'Galvanized Steel',
      controlType: 'DDC with BAS Integration',
      exhaustFans: 16,
      exhaustCapacity: 4800, // CFM each
      makeupAir: 76800 // CFM total
    };
    
    // Create test verification report
    const verification = {
      structuralCompliance: true,
      electricalCompliance: true,
      mechanicalCompliance: true,
      energyCompliance: true,
      codeReferences: [
        'IBC 2021',
        'NEC 2020',
        'IMC 2021',
        'IECC 2021',
        'ASHRAE 90.1-2019',
        'ASCE 7-16'
      ]
    };
    
    // Create drawing engine and generate drawings
    console.log('Creating professional drawing engine...');
    const engine = new ProfessionalDrawingEngine();
    
    console.log('Generating complete drawing set...');
    const drawingSet = engine.generateCompleteDrawingSet(
      projectInfo,
      titleBlockInfo,
      structural,
      electrical,
      hvac,
      verification
    );
    
    console.log('Drawing set generated:', {
      coverSheet: drawingSet.coverSheet.id,
      structuralPlans: drawingSet.structuralPlans.length,
      electricalPlans: drawingSet.electricalPlans.length,
      mechanicalPlans: drawingSet.mechanicalPlans.length,
      details: drawingSet.details.length,
      schedules: drawingSet.schedules.length
    });
    
    // Export PDF
    console.log('Exporting to PDF...');
    const pdfBlob = engine.exportPDF();
    console.log('Generated PDF size:', pdfBlob.size, 'bytes');
    
    // Save to file
    const fs = require('fs');
    const buffer = await pdfBlob.arrayBuffer();
    fs.writeFileSync('ultra-professional-drawings.pdf', Buffer.from(buffer));
    console.log('✅ Saved ultra-professional drawings to ultra-professional-drawings.pdf');
    
    // Also test individual modules
    console.log('\nTesting individual ultra-professional modules...');
    
    // Test structural module alone
    const { UltraProfessionalDrawingEngine } = await import('./src/lib/construction/ultra-professional-drawing-engine.ts');
    const structuralEngine = new UltraProfessionalDrawingEngine();
    structuralEngine.generateStructuralPlan(structural);
    const structuralBlob = structuralEngine.getOutput();
    const structuralBuffer = await structuralBlob.arrayBuffer();
    fs.writeFileSync('ultra-professional-structural.pdf', Buffer.from(structuralBuffer));
    console.log('✅ Saved structural drawing:', structuralBlob.size, 'bytes');
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

testUltraProfessionalDrawings();