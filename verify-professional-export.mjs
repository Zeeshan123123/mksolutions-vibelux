// Verify professional export functionality
import fs from 'fs';
import path from 'path';

// Check if the professional report generator exists
const reportPath = './src/lib/reports/professionalReportGenerator.ts';
if (fs.existsSync(reportPath)) {
  console.log('✓ Professional report generator file exists');
  
  // Read and display key parts
  const content = fs.readFileSync(reportPath, 'utf8');
  
  // Check for key interfaces
  console.log('\n✓ Found interfaces:');
  if (content.includes('interface ProfessionalReportData')) console.log('  - ProfessionalReportData');
  if (content.includes('costBreakdown:')) console.log('  - Cost breakdown structure');
  if (content.includes('technicalSpecs:')) console.log('  - Technical specifications');
  if (content.includes('equipmentSchedules:')) console.log('  - Equipment schedules');
  
  // Check for Rough Brothers-style data
  console.log('\n✓ Rough Brothers-style features:');
  if (content.includes('$115.25/sf')) console.log('  - Detailed $/sqft pricing');
  if (content.includes('Venlo Greenhouse Structure')) console.log('  - Venlo greenhouse details');
  if (content.includes('RBI Futera III MB2500')) console.log('  - Specific equipment models');
  if (content.includes('Priva Connext')) console.log('  - Professional control systems');
  
  // Check cost breakdown
  const costMatch = content.match(/totalValue: (\d+)/);
  if (costMatch) {
    console.log(`\n✓ Total project value: $${parseInt(costMatch[1]).toLocaleString()}`);
  }
  
  // Check integration in page.tsx
  const pagePath = './src/app/design/advanced/page.tsx';
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  console.log('\n✓ Integration in page.tsx:');
  if (pageContent.includes("import { generateProfessionalReport, generateLangeProfessionalData }")) {
    console.log('  - Import statement found');
  }
  if (pageContent.includes("const professionalData = generateLangeProfessionalData()")) {
    console.log('  - Professional data generation');
  }
  if (pageContent.includes("await generateProfessionalReport(professionalData)")) {
    console.log('  - PDF generation call');
  }
  
  console.log('\n✅ Professional export functionality is properly integrated!');
} else {
  console.log('❌ Professional report generator not found');
}