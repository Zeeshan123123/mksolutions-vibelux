// Simple test for ultra-professional drawings
const { jsPDF } = require('jspdf');

// Create test drawings directly
async function testUltraProfessionalDrawings() {
  console.log('Testing ultra-professional construction drawing generation...');
  
  try {
    // Create a new PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [36, 24] // D-size sheet
    });
    
    // Add title
    pdf.setFontSize(24);
    pdf.text('ULTRA-PROFESSIONAL DRAWING TEST', 18, 3, { align: 'center' });
    
    // Create test structural data
    const structural = {
      dimensions: { length: 480, width: 144, height: 20 },
      frameType: 'Rigid Frame',
      material: 'Steel'
    };
    
    // Create test electrical data
    const electrical = {
      serviceSize: 3000,
      voltage: 480,
      panels: [
        { name: 'MDP', amps: 3000, voltage: '480/277V' }
      ]
    };
    
    // Create test HVAC data
    const hvac = {
      systemType: 'Rooftop Units',
      totalCapacity: 240
    };
    
    // Test the ultra-professional structural module
    console.log('Testing UltraProfessionalDrawingEngine...');
    const { UltraProfessionalDrawingEngine } = require('./src/lib/construction/ultra-professional-drawing-engine.ts');
    const ultraEngine = new UltraProfessionalDrawingEngine();
    ultraEngine.generateStructuralPlan(structural);
    const structuralBlob = ultraEngine.getOutput();
    
    // Save structural PDF
    const fs = require('fs');
    const structuralBuffer = await structuralBlob.arrayBuffer();
    fs.writeFileSync('ultra-professional-structural.pdf', Buffer.from(structuralBuffer));
    console.log('✅ Saved structural drawing:', structuralBlob.size, 'bytes');
    
    // Test the main professional drawing engine
    console.log('\nTesting ProfessionalDrawingEngine...');
    const { ProfessionalDrawingEngine } = require('./src/lib/construction/professional-drawing-engine.ts');
    const engine = new ProfessionalDrawingEngine();
    
    // Create minimal project info
    const projectInfo = {
      name: 'Test Project',
      number: 'TP-001',
      client: 'Test Client',
      location: 'Test Location',
      area: 69120,
      volume: 1382400,
      occupancy: 'F-1',
      constructionType: 'Type II-B',
      engineer: 'Test Engineer, PE'
    };
    
    const titleBlockInfo = {
      companyName: 'VIBELUX',
      companyAddress: 'Test Address',
      companyPhone: '555-1234',
      companyEmail: 'test@vibelux.ai',
      engineerName: 'Test Engineer',
      engineerLicense: 'PE-12345'
    };
    
    const verification = {
      structuralCompliance: true,
      electricalCompliance: true,
      mechanicalCompliance: true,
      energyCompliance: true,
      codeReferences: ['IBC 2021', 'NEC 2020']
    };
    
    // Generate drawings
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
      mechanicalPlans: drawingSet.mechanicalPlans.length
    });
    
    // Export PDF
    const pdfBlob = engine.exportPDF();
    const pdfBuffer = await pdfBlob.arrayBuffer();
    fs.writeFileSync('ultra-professional-complete.pdf', Buffer.from(pdfBuffer));
    console.log('✅ Saved complete drawing set:', pdfBlob.size, 'bytes');
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Generated PDFs:');
    console.log('  - ultra-professional-structural.pdf');
    console.log('  - ultra-professional-complete.pdf');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

testUltraProfessionalDrawings();