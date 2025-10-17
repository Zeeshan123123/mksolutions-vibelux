// Test professional report generator
import { generateProfessionalReport, generateLangeProfessionalData } from './src/lib/reports/professionalReportGenerator.ts';

async function testExport() {
  console.log('Testing professional report generator...');
  
  try {
    // Generate professional data
    const professionalData = generateLangeProfessionalData();
    console.log('Generated professional data:', {
      project: professionalData.project.name,
      value: professionalData.project.totalValue,
      sqft: professionalData.project.squareFootage,
      sections: Object.keys(professionalData.costBreakdown)
    });
    
    // Generate PDF
    const blob = await generateProfessionalReport(professionalData);
    console.log('Generated PDF blob:', blob.size, 'bytes');
    
    // Save to file
    const fs = require('fs');
    const buffer = await blob.arrayBuffer();
    fs.writeFileSync('test-professional-report.pdf', Buffer.from(buffer));
    console.log('Saved test report to test-professional-report.pdf');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testExport();