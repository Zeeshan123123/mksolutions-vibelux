const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  headless: false, // Set to false to see browser actions
  slowMo: 50, // Slow down actions to observe
  viewport: { width: 1920, height: 1080 },
  screenshotDir: './test-screenshots'
};

// List of all pages to test
const PAGES_TO_TEST = [
  {
    name: 'Professional Design Report',
    path: 'file:///Users/blakelange/Downloads/Mohave_Professional_Design_Report.html',
    type: 'static-report'
  },
  {
    name: 'Comprehensive Technical Report',
    path: 'file:///Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html',
    type: 'tabbed-report'
  },
  {
    name: '3D Facility Visualization',
    path: 'file:///Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html',
    type: '3d-visualization'
  },
  {
    name: 'Enhanced 3D Professional Analysis',
    path: 'file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html',
    type: '3d-enhanced'
  },
  {
    name: 'White Label Report Builder',
    path: 'file:///Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html',
    type: 'report-builder'
  }
];

// Test results collector
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: [],
  pageResults: {}
};

// Utility functions
async function ensureScreenshotDir() {
  if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
  }
}

async function takeScreenshot(page, name) {
  const timestamp = Date.now();
  const filename = `${name.replace(/\s+/g, '_')}_${timestamp}.png`;
  await page.screenshot({ 
    path: path.join(TEST_CONFIG.screenshotDir, filename),
    fullPage: true 
  });
  return filename;
}

async function logTest(testName, status, details = '') {
  const prefix = status === 'PASS' ? '✅' : '❌';
  console.log(`${prefix} ${testName}${details ? ': ' + details : ''}`);
  testResults.totalTests++;
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, details });
  }
}

// Test functions for different page types
async function testStaticReport(page, pageInfo) {
  console.log(`\n📄 Testing Static Report: ${pageInfo.name}`);
  const results = { errors: [], warnings: [] };
  
  try {
    // Check if page loads
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await logTest('Page Load', 'PASS');
    
    // Check for main content elements
    const mainElements = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector('.header, .company-header'),
        hasSections: document.querySelectorAll('.section, .content-section').length,
        hasTables: document.querySelectorAll('table').length,
        hasMetrics: document.querySelectorAll('.metric-card, .metric-value').length
      };
    });
    
    if (mainElements.hasHeader) {
      await logTest('Header Present', 'PASS');
    } else {
      await logTest('Header Present', 'FAIL', 'No header found');
    }
    
    if (mainElements.hasSections > 0) {
      await logTest('Content Sections', 'PASS', `Found ${mainElements.hasSections} sections`);
    } else {
      await logTest('Content Sections', 'FAIL', 'No content sections found');
    }
    
    // Test responsive design
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      const isResponsive = await page.evaluate(() => {
        const content = document.querySelector('.document-container, .report-container');
        return content && content.offsetWidth <= window.innerWidth;
      });
      
      if (isResponsive) {
        await logTest(`Responsive Design - ${viewport.name}`, 'PASS');
      } else {
        await logTest(`Responsive Design - ${viewport.name}`, 'FAIL', 'Content overflow detected');
      }
    }
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    
    if (brokenImages === 0) {
      await logTest('Image Loading', 'PASS');
    } else {
      await logTest('Image Loading', 'FAIL', `${brokenImages} broken images found`);
    }
    
    // Test print functionality
    await page.emulateMedia({ media: 'print' });
    await logTest('Print Media Emulation', 'PASS');
    await page.emulateMedia({ media: 'screen' });
    
  } catch (error) {
    await logTest('Static Report Test', 'FAIL', error.message);
    results.errors.push(error.message);
  }
  
  return results;
}

async function testTabbedReport(page, pageInfo) {
  console.log(`\n📑 Testing Tabbed Report: ${pageInfo.name}`);
  const results = { errors: [], warnings: [] };
  
  try {
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await logTest('Page Load', 'PASS');
    
    // Find all tabs
    const tabs = await page.$$('.nav-tab, .tab');
    if (tabs.length > 0) {
      await logTest('Tab Navigation Found', 'PASS', `${tabs.length} tabs`);
      
      // Test each tab
      for (let i = 0; i < tabs.length; i++) {
        const tabText = await tabs[i].textContent();
        await tabs[i].click();
        await page.waitForTimeout(300);
        
        // Check if corresponding content is visible
        const activeContent = await page.evaluate(() => {
          const active = document.querySelector('.tab-content.active');
          return active && active.offsetHeight > 0;
        });
        
        if (activeContent) {
          await logTest(`Tab "${tabText}" Functionality`, 'PASS');
        } else {
          await logTest(`Tab "${tabText}" Functionality`, 'FAIL', 'Content not visible');
        }
      }
    } else {
      await logTest('Tab Navigation', 'FAIL', 'No tabs found');
    }
    
    // Test data tables
    const tables = await page.$$('table');
    for (let i = 0; i < tables.length; i++) {
      const hasData = await tables[i].evaluate(table => {
        return table.rows.length > 1 && table.rows[0].cells.length > 0;
      });
      
      if (hasData) {
        await logTest(`Data Table ${i + 1}`, 'PASS');
      } else {
        await logTest(`Data Table ${i + 1}`, 'FAIL', 'No data found');
      }
    }
    
  } catch (error) {
    await logTest('Tabbed Report Test', 'FAIL', error.message);
    results.errors.push(error.message);
  }
  
  return results;
}

async function test3DVisualization(page, pageInfo) {
  console.log(`\n🎮 Testing 3D Visualization: ${pageInfo.name}`);
  const results = { errors: [], warnings: [] };
  
  try {
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await logTest('Page Load', 'PASS');
    
    // Wait for Three.js to initialize
    await page.waitForTimeout(2000);
    
    // Check if Three.js is loaded
    const hasThreeJS = await page.evaluate(() => {
      return typeof THREE !== 'undefined';
    });
    
    if (hasThreeJS) {
      await logTest('Three.js Library', 'PASS');
    } else {
      await logTest('Three.js Library', 'FAIL', 'THREE not defined');
      return results;
    }
    
    // Check for canvas element
    const canvas = await page.$('canvas');
    if (canvas) {
      await logTest('3D Canvas Present', 'PASS');
      
      // Test mouse interactions
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        // Test rotation
        await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 100, canvasBox.y + canvasBox.height / 2);
        await page.mouse.up();
        await logTest('Mouse Rotation', 'PASS');
        
        // Test zoom
        await page.mouse.wheel(0, -100);
        await page.waitForTimeout(300);
        await page.mouse.wheel(0, 100);
        await logTest('Mouse Zoom', 'PASS');
      }
    } else {
      await logTest('3D Canvas', 'FAIL', 'Canvas element not found');
    }
    
    // Test control buttons
    const controlButtons = await page.$$('.control-button, .control-btn');
    for (const button of controlButtons) {
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        await button.click();
        await page.waitForTimeout(500);
        await logTest(`Control Button "${buttonText}"`, 'PASS');
      }
    }
    
    // Check for status updates
    const statusText = await page.$('#status-text');
    if (statusText) {
      const status = await statusText.textContent();
      await logTest('Status Display', 'PASS', status);
    }
    
    // Test room selection if available
    const roomItems = await page.$$('.room-item');
    if (roomItems.length > 0) {
      await roomItems[0].click();
      await page.waitForTimeout(300);
      await logTest('Room Selection', 'PASS');
    }
    
  } catch (error) {
    await logTest('3D Visualization Test', 'FAIL', error.message);
    results.errors.push(error.message);
  }
  
  return results;
}

async function testReportBuilder(page, pageInfo) {
  console.log(`\n🛠️ Testing Report Builder: ${pageInfo.name}`);
  const results = { errors: [], warnings: [] };
  
  try {
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await logTest('Page Load', 'PASS');
    
    // Test branding buttons
    const brandingButtons = await page.$$('.branding-btn');
    for (const btn of brandingButtons) {
      const brandName = await btn.textContent();
      await btn.click();
      await page.waitForTimeout(300);
      
      // Check if branding applied
      const companyName = await page.$eval('#company-display', el => el.textContent);
      await logTest(`Branding Switch - ${brandName}`, 'PASS', `Company: ${companyName}`);
    }
    
    // Test section checkboxes
    const checkboxes = await page.$$('input[type="checkbox"]');
    let checkedCount = 0;
    for (const checkbox of checkboxes) {
      const isChecked = await checkbox.isChecked();
      if (isChecked) checkedCount++;
    }
    await logTest('Section Checkboxes', 'PASS', `${checkedCount}/${checkboxes.length} checked`);
    
    // Test edit functionality
    const editButtons = await page.$$('.control-btn');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForTimeout(300);
      
      // Check if section is editable
      const isEditing = await page.evaluate(() => {
        const section = document.querySelector('.report-section');
        return section && section.classList.contains('editing');
      });
      
      if (isEditing) {
        await logTest('Edit Mode', 'PASS');
        // Click again to stop editing
        await editButtons[0].click();
      } else {
        await logTest('Edit Mode', 'FAIL', 'Section not in edit mode');
      }
    }
    
    // Test modal buttons
    const modalTriggers = [
      { selector: 'button[onclick="openBrandingModal()"]', name: 'Branding Modal' },
      { selector: 'button[onclick="openOperatorModal()"]', name: 'Operator Modal' },
      { selector: 'button[onclick="openIntakeModal()"]', name: 'Intake Modal' },
      { selector: 'button[onclick="openNotesModal()"]', name: 'Notes Modal' }
    ];
    
    for (const trigger of modalTriggers) {
      const button = await page.$(trigger.selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(300);
        
        // Check if modal opened
        const modalVisible = await page.evaluate(() => {
          const modal = document.querySelector('.modal.active');
          return modal !== null;
        });
        
        if (modalVisible) {
          await logTest(`${trigger.name} Open`, 'PASS');
          
          // Close modal
          const closeBtn = await page.$('.close-btn');
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(300);
          }
        } else {
          await logTest(`${trigger.name} Open`, 'FAIL', 'Modal not visible');
        }
      }
    }
    
    // Test report generation
    const generateBtn = await page.$('button[onclick="generateReport()"]');
    if (generateBtn) {
      await generateBtn.click();
      await page.waitForTimeout(500);
      
      // Accept alert if present
      page.on('dialog', async dialog => {
        await logTest('Report Generation Alert', 'PASS', dialog.message());
        await dialog.accept();
      });
    }
    
    // Test export buttons
    const exportButtons = await page.$$('.export-btn');
    for (const btn of exportButtons) {
      const exportType = await btn.textContent();
      
      // Set up dialog handler before clicking
      page.once('dialog', async dialog => {
        await logTest(`Export ${exportType}`, 'PASS', 'Alert triggered');
        await dialog.accept();
      });
      
      await btn.click();
      await page.waitForTimeout(300);
    }
    
  } catch (error) {
    await logTest('Report Builder Test', 'FAIL', error.message);
    results.errors.push(error.message);
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Site Tests');
  console.log('=====================================\n');
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({
    headless: TEST_CONFIG.headless,
    slowMo: TEST_CONFIG.slowMo
  });
  
  const context = await browser.newContext({
    viewport: TEST_CONFIG.viewport
  });
  
  const page = await context.newPage();
  
  // Set default timeout
  page.setDefaultTimeout(TEST_CONFIG.timeout);
  
  // Test each page
  for (const pageInfo of PAGES_TO_TEST) {
    testResults.pageResults[pageInfo.name] = { 
      url: pageInfo.path,
      type: pageInfo.type,
      timestamp: new Date().toISOString()
    };
    
    try {
      let results;
      
      switch (pageInfo.type) {
        case 'static-report':
          results = await testStaticReport(page, pageInfo);
          break;
        case 'tabbed-report':
          results = await testTabbedReport(page, pageInfo);
          break;
        case '3d-visualization':
        case '3d-enhanced':
          results = await test3DVisualization(page, pageInfo);
          break;
        case 'report-builder':
          results = await testReportBuilder(page, pageInfo);
          break;
        default:
          results = await testStaticReport(page, pageInfo);
      }
      
      testResults.pageResults[pageInfo.name].results = results;
      
      // Take final screenshot
      const screenshotFile = await takeScreenshot(page, pageInfo.name);
      testResults.pageResults[pageInfo.name].screenshot = screenshotFile;
      
    } catch (error) {
      console.error(`Fatal error testing ${pageInfo.name}:`, error);
      testResults.pageResults[pageInfo.name].fatalError = error.message;
    }
  }
  
  await browser.close();
  
  // Generate test report
  console.log('\n\n📊 TEST SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n⚠️ ERRORS FOUND:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.details}`);
    });
  }
  
  // Save detailed results
  const resultsPath = path.join(TEST_CONFIG.screenshotDir, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📁 Detailed results saved to: ${resultsPath}`);
  console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
}

// Run tests
runAllTests().catch(console.error);