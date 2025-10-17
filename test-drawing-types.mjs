#!/usr/bin/env node

/**
 * Test the separated Design and Construction Drawing Systems
 */

import { DESIGN_DRAWING_SETS, CONSTRUCTION_DRAWING_SETS, getDrawingSet, getSheetCount } from './src/lib/reports/drawingTypes.js';

console.log('🎨 Testing Vibelux Drawing Type System\n');

console.log('=== DESIGN DRAWINGS ===\n');

Object.entries(DESIGN_DRAWING_SETS).forEach(([level, set]) => {
  console.log(`📐 ${level.toUpperCase()} DESIGN DRAWINGS`);
  console.log(`   Purpose: ${set.purpose}`);
  console.log(`   Sheets: ${set.sheets.length}`);
  set.sheets.forEach((sheet, idx) => {
    console.log(`   ${idx + 1}. ${sheet}`);
  });
  console.log('');
});

console.log('=== CONSTRUCTION DRAWING SETS ===\n');

Object.entries(CONSTRUCTION_DRAWING_SETS).forEach(([level, set]) => {
  console.log(`🔨 ${level.toUpperCase()} CONSTRUCTION DRAWINGS`);
  console.log(`   Purpose: ${set.purpose}`);
  console.log(`   Sheets: ${set.sheets.length}`);
  
  if (Array.isArray(set.sheets)) {
    // For basic level (array of strings)
    set.sheets.forEach((sheet, idx) => {
      console.log(`   ${idx + 1}. ${sheet}`);
    });
  } else {
    // For detailed/complete levels (arrays of sheet objects)
    set.sheets.forEach((sheet, idx) => {
      console.log(`   ${idx + 1}. ${sheet}`);
    });
  }
  console.log('');
});

console.log('=== DRAWING TYPE COMPARISON ===\n');

console.log('Design Drawings vs Construction Drawings:');
console.log('┌─────────────────┬─────────────────┬─────────────────┐');
console.log('│ Level           │ Design Sheets   │ Construction    │');
console.log('├─────────────────┼─────────────────┼─────────────────┤');
console.log(`│ Basic/Conceptual│ ${getSheetCount('design', 'basic').toString().padEnd(15)} │ ${getSheetCount('construction', 'basic').toString().padEnd(15)} │`);
console.log(`│ Detailed/Schema │ ${getSheetCount('design', 'detailed').toString().padEnd(15)} │ ${getSheetCount('construction', 'detailed').toString().padEnd(15)} │`);
console.log(`│ Complete/Full   │ ${getSheetCount('design', 'complete').toString().padEnd(15)} │ ${getSheetCount('construction', 'complete').toString().padEnd(15)} │`);
console.log('└─────────────────┴─────────────────┴─────────────────┘');

console.log('\n=== USE CASES ===\n');

console.log('📐 DESIGN DRAWINGS - When to Use:');
console.log('   • Client presentations and approvals');
console.log('   • Permit applications');
console.log('   • Design development and bidding');
console.log('   • Conceptual planning and layouts');
console.log('   • System sizing and selection');
console.log('');

console.log('🔨 CONSTRUCTION DRAWINGS - When to Use:');
console.log('   • Actual building and installation');
console.log('   • Contractor bidding with details');
console.log('   • Field installation guidance');
console.log('   • Code compliance verification');
console.log('   • Inspection and commissioning');
console.log('');

console.log('=== VIBELUX EXPORT OPTIONS ===\n');

const exportOptions = [
  {
    type: 'Design Drawings',
    levels: [
      { name: 'Conceptual', sheets: getSheetCount('design', 'basic'), use: 'Early planning, client review' },
      { name: 'Schematic', sheets: getSheetCount('design', 'detailed'), use: 'Permits, design approval' },
      { name: 'Design Development', sheets: getSheetCount('design', 'complete'), use: 'Final design, bidding' }
    ]
  },
  {
    type: 'Construction Drawings',
    levels: [
      { name: 'Basic Construction', sheets: getSheetCount('construction', 'basic'), use: 'Simple projects, experienced contractors' },
      { name: 'Detailed Construction', sheets: getSheetCount('construction', 'detailed'), use: 'Standard commercial construction' },
      { name: 'Complete Construction', sheets: getSheetCount('construction', 'complete'), use: 'Complex projects, full details' }
    ]
  }
];

exportOptions.forEach(option => {
  console.log(`${option.type}:`);
  option.levels.forEach(level => {
    console.log(`   • ${level.name}: ${level.sheets} sheets - ${level.use}`);
  });
  console.log('');
});

console.log('=== WORKFLOW EXAMPLE ===\n');

console.log('Typical Vibelux Project Workflow:');
console.log('');
console.log('1. 📐 CONCEPTUAL DESIGN (6 sheets)');
console.log('   → Initial client presentation');
console.log('   → Basic layout and system sizing');
console.log('   → Budget estimates');
console.log('');
console.log('2. 📐 SCHEMATIC DESIGN (9 sheets)');
console.log('   → Permit application submittal');
console.log('   → Detailed system design');
console.log('   → Engineering review');
console.log('');
console.log('3. 📐 DESIGN DEVELOPMENT (11 sheets)');
console.log('   → Final design approval');
console.log('   → Contractor bidding package');
console.log('   → Equipment specifications');
console.log('');
console.log('4. 🔨 CONSTRUCTION DRAWINGS (9-45 sheets)');
console.log('   → Buildable construction documents');
console.log('   → Installation details and specs');
console.log('   → Code compliance documentation');
console.log('');

console.log('✅ Drawing Type System Test Complete!');
console.log('   Vibelux now supports both design and construction phases');
console.log('   Users can select appropriate drawing level for their needs');
console.log('   Clear separation between planning and building documents');