const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// User flow pages to capture
const userFlowPages = [
  // Authentication & Onboarding Flow
  { name: '01_homepage', url: 'http://localhost:3001', description: 'Landing page' },
  { name: '02_features', url: 'http://localhost:3001/features', description: 'Features showcase' },
  { name: '03_pricing', url: 'http://localhost:3001/pricing', description: 'Subscription tiers' },
  { name: '04_signup', url: 'http://localhost:3001/signup', description: 'User registration' },
  { name: '05_login', url: 'http://localhost:3001/login', description: 'User login' },
  
  // Free/Basic Tier Flow
  { name: '06_dashboard_basic', url: 'http://localhost:3001/dashboard', description: 'Basic dashboard' },
  { name: '07_calculators', url: 'http://localhost:3001/calculators', description: 'Lighting calculators' },
  { name: '08_design_basic', url: 'http://localhost:3001/design', description: 'Basic design tools' },
  
  // Professional Tier Flow  
  { name: '09_design_advanced', url: 'http://localhost:3001/design/advanced', description: 'Advanced CAD design' },
  { name: '10_equipment_board', url: 'http://localhost:3001/equipment-board', description: 'Equipment marketplace' },
  { name: '11_energy_monitoring', url: 'http://localhost:3001/energy-monitoring', description: 'Energy optimization' },
  { name: '12_fixtures', url: 'http://localhost:3001/fixtures', description: 'Fixture library' },
  
  // Enterprise Tier Flow
  { name: '13_operations', url: 'http://localhost:3001/operations', description: 'Operations suite' },
  { name: '14_multi_site', url: 'http://localhost:3001/multi-site', description: 'Multi-facility management' },
  { name: '15_analytics', url: 'http://localhost:3001/analytics', description: 'Advanced analytics' },
  { name: '16_reports', url: 'http://localhost:3001/reports', description: 'Professional reports' },
  
  // Supporting Features
  { name: '17_research_library', url: 'http://localhost:3001/research-library', description: 'Research resources' },
  { name: '18_marketplace', url: 'http://localhost:3001/marketplace', description: 'Equipment marketplace' },
  { name: '19_get_started', url: 'http://localhost:3001/get-started', description: 'Onboarding flow' }
];

async function captureUserFlow() {
  console.log('🚀 Starting VibeLux user flow capture...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  // Create downloads directory for screenshots
  const screenshotsDir = '/Users/blakelange/Downloads/vibelux_screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const pageInfo of userFlowPages) {
    try {
      console.log(`📸 Capturing: ${pageInfo.name} - ${pageInfo.description}`);
      
      // Navigate to page with longer timeout
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle2', 
        timeout: 10000 
      });
      
      // Wait a bit for any animations or loading
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, `${pageInfo.name}.jpg`);
      await page.screenshot({ 
        path: screenshotPath, 
        type: 'jpeg',
        quality: 90,
        fullPage: true 
      });
      
      console.log(`✅ Saved: ${pageInfo.name}.jpg`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error capturing ${pageInfo.name}: ${error.message}`);
      errors.push({ page: pageInfo.name, error: error.message });
      errorCount++;
    }
  }

  await browser.close();
  
  // Create summary report
  const reportPath = path.join(screenshotsDir, 'capture_report.txt');
  const report = [
    'VibeLux User Flow Screenshot Capture Report',
    '==========================================',
    `Total pages: ${userFlowPages.length}`,
    `Successful captures: ${successCount}`,
    `Errors: ${errorCount}`,
    '',
    'Captured Pages:',
    ...userFlowPages.slice(0, successCount).map(p => `✅ ${p.name} - ${p.description}`),
    '',
    'Errors:',
    ...errors.map(e => `❌ ${e.page}: ${e.error}`),
    '',
    'All screenshots saved to: ' + screenshotsDir
  ].join('\n');
  
  fs.writeFileSync(reportPath, report);
  
  console.log('\n📋 Capture Complete!');
  console.log(`✅ Successfully captured: ${successCount}/${userFlowPages.length} pages`);
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
  console.log(`📄 Report saved to: ${reportPath}`);
}

// Check if Puppeteer is available
try {
  captureUserFlow().catch(console.error);
} catch (error) {
  console.log('❌ Puppeteer not available. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run this script again.');
}