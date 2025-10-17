#!/usr/bin/env node

/**
 * Test Vibelux Advanced Design System
 * Creates a greenhouse project to test electrical and structural outputs
 */

const fs = require('fs');
const path = require('path');

// Import the advanced design modules
const { GreenhouseDesigner } = require('./src/design/advanced/greenhouse-designer');
const { generateConstructionDocuments } = require('./src/lib/construction/document-generator');

async function testVibeluxAdvancedDesign() {
  console.log('🏗️ Testing Vibelux Advanced Design System');
  console.log('=' .repeat(60));
  
  // Create test greenhouse project
  const projectConfig = {
    name: 'Test Greenhouse Project',
    client: 'Quality Test Farms',
    location: 'California, USA',
    type: 'commercial-greenhouse',
    
    // Greenhouse specifications
    greenhouse: {
      type: 'venlo',
      dimensions: {
        length: 200,  // feet
        width: 100,   // feet
        gutterHeight: 14,
        ridgeHeight: 20
      },
      bays: 5,
      spanWidth: 40,
      
      // Growing systems
      cultivation: {
        type: 'hydroponic',
        crops: ['tomatoes', 'peppers'],
        benchLayout: 'rolling-benches',
        growingArea: 18000  // sq ft
      },
      
      // Environmental controls
      climate: {
        heatingSystem: 'hot-water',
        coolingSystem: 'evaporative',
        ventilation: 'natural-roof-vents',
        shading: 'automated-curtains'
      }
    },
    
    // Electrical requirements
    electrical: {
      serviceVoltage: '480V',
      estimatedLoad: 250,  // kW
      lighting: {
        type: 'LED',
        intensity: 200,  // μmol/m²/s supplemental
        photoperiod: 16
      }
    },
    
    // Structural requirements
    structural: {
      windSpeed: 90,  // mph
      snowLoad: 25,   // psf
      seismicCategory: 'D',
      soilBearing: 2000  // psf
    }
  };
  
  console.log('\n📋 Project Configuration:');
  console.log(`   Name: ${projectConfig.name}`);
  console.log(`   Type: ${projectConfig.greenhouse.type} greenhouse`);
  console.log(`   Size: ${projectConfig.greenhouse.dimensions.length}' × ${projectConfig.greenhouse.dimensions.width}'`);
  console.log(`   Electrical: ${projectConfig.electrical.estimatedLoad} kW @ ${projectConfig.electrical.serviceVoltage}`);
  
  try {
    // Initialize greenhouse designer
    console.log('\n🔧 Initializing Greenhouse Designer...');
    const designer = new GreenhouseDesigner(projectConfig);
    
    // Generate design
    console.log('\n📐 Generating Advanced Design...');
    const design = await designer.generateDesign();
    
    console.log('\n✅ Design Generated Successfully!');
    console.log(`   Structure: ${design.structural.frameType}`);
    console.log(`   Electrical Panels: ${design.electrical.panels.length}`);
    console.log(`   HVAC Zones: ${design.hvac.zones.length}`);
    console.log(`   Total Fixtures: ${design.lighting.fixtures.length}`);
    
    // Generate construction documents
    console.log('\n📄 Generating Construction Documents...');
    const documents = await generateConstructionDocuments(design);
    
    // Create output directory
    const outputDir = path.join(__dirname, 'vibelux-test-output', `greenhouse-${Date.now()}`);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Save the generated documents
    console.log('\n💾 Saving Output Files...');
    
    // Save design JSON
    fs.writeFileSync(
      path.join(outputDir, 'design-output.json'),
      JSON.stringify(design, null, 2)
    );
    console.log('   ✓ Saved: design-output.json');
    
    // Save construction documents
    if (documents.drawings) {
      documents.drawings.forEach((drawing, index) => {
        const filename = `${drawing.number}-${drawing.title.replace(/\s+/g, '-')}.pdf`;
        fs.writeFileSync(
          path.join(outputDir, filename),
          drawing.content
        );
        console.log(`   ✓ Saved: ${filename}`);
      });
    }
    
    // Display sample of what's in the structural drawing
    if (design.structural) {
      console.log('\n📊 Structural Drawing Contents:');
      console.log(`   • Foundation type: ${design.structural.foundation.type}`);
      console.log(`   • Column spacing: ${design.structural.columnSpacing}'`);
      console.log(`   • Truss type: ${design.structural.trussType}`);
      console.log(`   • Materials: ${design.structural.materials.primary}`);
    }
    
    // Display sample of electrical drawing
    if (design.electrical) {
      console.log('\n⚡ Electrical Drawing Contents:');
      console.log(`   • Main panel: ${design.electrical.mainPanel.size}A`);
      console.log(`   • Distribution panels: ${design.electrical.panels.length}`);
      console.log(`   • Total circuits: ${design.electrical.circuits.length}`);
      console.log(`   • Lighting zones: ${design.electrical.lightingZones}`);
    }
    
    console.log('\n✨ Test Complete!');
    console.log(`📁 Output saved to: ${outputDir}`);
    
  } catch (error) {
    console.error('\n❌ Error during design generation:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Run the test
testVibeluxAdvancedDesign();