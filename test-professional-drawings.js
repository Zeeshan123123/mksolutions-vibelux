const { generateConstructionDrawings } = require('./src/lib/reports/constructionDrawingGenerator.ts');
const fs = require('fs');

async function testProfessionalDrawings() {
  const config = {
    project: {
      name: 'Lange Commercial Greenhouse',
      number: 'VLX-2024-001',
      location: 'Minnesota, USA',
      client: 'Lange Farms LLC',
      date: new Date()
    },
    dimensions: {
      width: 144,
      length: 186.25,
      gutterHeight: 16,
      ridgeHeight: 20
    },
    zones: 5,
    fixtures: Array.from({ length: 987 }, (_, i) => ({
      id: `fixture-${i + 1}`,
      type: 'HPS-1000W',
      wattage: 1000,
      voltage: 277,
      position: { x: 0, y: 0, z: 16 }
    })),
    hvac: {
      coolingCapacity: 346,
      heatingCapacity: 1074,
      fanCoilUnits: 67
    },
    electrical: {
      serviceSize: 2400,
      voltage: '277/480V'
    }
  };

  try {
    console.log('Testing professional construction drawings...');
    
    // Test basic drawings
    const basicBlob = await generateConstructionDrawings(config, 'basic');
    fs.writeFileSync('/Users/blakelange/vibelux-app/downloads/Professional_Lange_Basic_Construction.pdf', Buffer.from(await basicBlob.arrayBuffer()));
    console.log('✓ Professional basic construction drawings generated');
    
    // Test detailed drawings
    const detailedBlob = await generateConstructionDrawings(config, 'detailed');
    fs.writeFileSync('/Users/blakelange/vibelux-app/downloads/Professional_Lange_Detailed_Construction.pdf', Buffer.from(await detailedBlob.arrayBuffer()));
    console.log('✓ Professional detailed construction drawings generated');
    
    console.log('\n✅ All professional construction documents generated successfully!');
    console.log('Files saved to downloads folder');
    
  } catch (error) {
    console.error('❌ Error generating professional drawings:', error);
  }
}

testProfessionalDrawings();