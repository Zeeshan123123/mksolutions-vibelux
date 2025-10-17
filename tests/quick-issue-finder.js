/**
 * Quick Issue Finder - Efficient testing focusing on known problem areas
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES = [
  {
    name: 'Professional Design Report',
    path: 'file:///Users/blakelange/Downloads/Mohave_Professional_Design_Report.html',
    type: 'report'
  },
  {
    name: 'Comprehensive Technical Report', 
    path: 'file:///Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html',
    type: 'technical'
  },
  {
    name: '3D Facility Visualization',
    path: 'file:///Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html',
    type: '3d'
  },
  {
    name: 'Enhanced 3D Professional Analysis',
    path: 'file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html',
    type: '3d-enhanced'
  },
  {
    name: 'White Label Report Builder',
    path: 'file:///Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html',
    type: 'builder'
  }
];

// Consolidated issue categories
const ISSUES_FOUND = {
  CRITICAL: [],
  HIGH: [],
  MEDIUM: [],
  LOW: []
};

async function findIssues() {
  console.log('🔍 Quick Issue Finder - Scanning all pages for problems\n');
  
  const browser = await chromium.launch({
    headless: true, // Run headless for speed
    timeout: 30000
  });
  
  for (const pageInfo of PAGES) {
    console.log(`\n📄 Analyzing: ${pageInfo.name}`);
    console.log('─'.repeat(50));
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Set up console monitoring
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      
      // 1. Check for z-index issues (especially for 3D pages)
      if (pageInfo.type.includes('3d')) {
        const zIndexIssues = await page.evaluate(() => {
          const overlappingElements = [];
          const buttons = document.querySelectorAll('.control-button, .control-btn');
          
          buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(rect.x + rect.width/2, rect.y + rect.height/2);
            
            if (elementAtPoint !== btn && !btn.contains(elementAtPoint)) {
              overlappingElements.push({
                button: btn.textContent,
                blocker: elementAtPoint ? elementAtPoint.className : 'unknown'
              });
            }
          });
          
          return overlappingElements;
        });
        
        if (zIndexIssues.length > 0) {
          ISSUES_FOUND.CRITICAL.push({
            page: pageInfo.name,
            issue: `Z-index layering problems: ${zIndexIssues.length} buttons blocked by other elements`,
            details: zIndexIssues
          });
          console.log(`   ❌ CRITICAL: ${zIndexIssues.length} buttons have z-index issues`);
        }
      }
      
      // 2. Check for data integrity issues
      const dataIssues = await page.evaluate(() => {
        const issues = [];
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
          const text = el.textContent;
          if (text && (text.includes('NaN') || text.includes('undefined') || text.includes('null'))) {
            if (!el.children.length) { // Only leaf nodes
              issues.push({
                element: el.tagName,
                class: el.className,
                text: text.substring(0, 50)
              });
            }
          }
        });
        
        return issues;
      });
      
      if (dataIssues.length > 0) {
        ISSUES_FOUND.HIGH.push({
          page: pageInfo.name,
          issue: `Data integrity issues: ${dataIssues.length} elements with invalid values`,
          details: dataIssues.slice(0, 5) // First 5 examples
        });
        console.log(`   ⚠️  HIGH: ${dataIssues.length} data integrity issues found`);
      }
      
      // 3. Check accessibility
      const a11yIssues = await page.evaluate(() => {
        const issues = [];
        
        // Missing alt text
        const imagesNoAlt = document.querySelectorAll('img:not([alt])').length;
        if (imagesNoAlt > 0) {
          issues.push(`${imagesNoAlt} images missing alt text`);
        }
        
        // Multiple h1s
        const h1Count = document.querySelectorAll('h1').length;
        if (h1Count > 1) {
          issues.push(`${h1Count} H1 tags (should be 1)`);
        }
        
        // Small touch targets
        const buttons = document.querySelectorAll('button, a');
        let smallTargets = 0;
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            smallTargets++;
          }
        });
        if (smallTargets > 0) {
          issues.push(`${smallTargets} touch targets < 44px`);
        }
        
        return issues;
      });
      
      if (a11yIssues.length > 0) {
        ISSUES_FOUND.HIGH.push({
          page: pageInfo.name,
          issue: 'Accessibility violations',
          details: a11yIssues
        });
        console.log(`   ⚠️  HIGH: ${a11yIssues.length} accessibility issues`);
      }
      
      // 4. Check performance
      const perfIssues = await page.evaluate(() => {
        const issues = [];
        
        // DOM node count
        const nodeCount = document.querySelectorAll('*').length;
        if (nodeCount > 1500) {
          issues.push(`Excessive DOM nodes: ${nodeCount}`);
        }
        
        // Inline styles
        const inlineStyles = document.querySelectorAll('[style]').length;
        if (inlineStyles > 50) {
          issues.push(`Many inline styles: ${inlineStyles}`);
        }
        
        // Large inline images
        const largeImages = Array.from(document.querySelectorAll('img')).filter(img => 
          img.src.startsWith('data:') && img.src.length > 100000
        ).length;
        if (largeImages > 0) {
          issues.push(`${largeImages} large inline images`);
        }
        
        return issues;
      });
      
      if (perfIssues.length > 0) {
        ISSUES_FOUND.MEDIUM.push({
          page: pageInfo.name,
          issue: 'Performance concerns',
          details: perfIssues
        });
        console.log(`   🟡 MEDIUM: ${perfIssues.length} performance issues`);
      }
      
      // 5. Check mobile responsiveness
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileIssues = await page.evaluate(() => {
        const issues = [];
        
        // Horizontal scroll
        if (document.documentElement.scrollWidth > window.innerWidth) {
          issues.push('Horizontal scroll on mobile');
        }
        
        // Text too small
        const smallText = Array.from(document.querySelectorAll('*')).filter(el => {
          const fontSize = window.getComputedStyle(el).fontSize;
          return parseFloat(fontSize) < 12;
        }).length;
        if (smallText > 10) {
          issues.push(`${smallText} elements with font size < 12px`);
        }
        
        return issues;
      });
      
      if (mobileIssues.length > 0) {
        ISSUES_FOUND.MEDIUM.push({
          page: pageInfo.name,
          issue: 'Mobile compatibility issues',
          details: mobileIssues
        });
        console.log(`   🟡 MEDIUM: ${mobileIssues.length} mobile issues`);
      }
      
      // 6. Console errors
      if (consoleErrors.length > 0) {
        ISSUES_FOUND.HIGH.push({
          page: pageInfo.name,
          issue: `Console errors: ${consoleErrors.length}`,
          details: consoleErrors.slice(0, 3)
        });
        console.log(`   ⚠️  HIGH: ${consoleErrors.length} console errors`);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
    } catch (error) {
      ISSUES_FOUND.CRITICAL.push({
        page: pageInfo.name,
        issue: 'Page load error',
        details: error.message
      });
      console.log(`   ❌ CRITICAL: Failed to load page - ${error.message}`);
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Generate summary report
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 ISSUE SUMMARY REPORT');
  console.log('='.repeat(60) + '\n');
  
  let totalIssues = 0;
  
  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
    const issues = ISSUES_FOUND[severity];
    if (issues.length > 0) {
      console.log(`\n${getSeverityEmoji(severity)} ${severity} ISSUES (${issues.length}):`);
      console.log('─'.repeat(40));
      
      issues.forEach(issue => {
        console.log(`\n📄 ${issue.page}`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.details) {
          if (Array.isArray(issue.details)) {
            issue.details.forEach(detail => {
              console.log(`   • ${typeof detail === 'object' ? JSON.stringify(detail) : detail}`);
            });
          } else {
            console.log(`   Details: ${issue.details}`);
          }
        }
      });
      
      totalIssues += issues.length;
    }
  });
  
  // Priority fixes
  console.log('\n\n' + '='.repeat(60));
  console.log('🔧 RECOMMENDED FIXES (Priority Order)');
  console.log('='.repeat(60) + '\n');
  
  console.log('1. FIX Z-INDEX ISSUES (Critical for 3D pages):');
  console.log('   Add to 3D page CSS:');
  console.log('   .controls-overlay { z-index: 1000; position: relative; }');
  console.log('   .legend { z-index: 999; }');
  console.log('   .status-bar { z-index: 998; }');
  console.log('   .info-panel { position: relative; z-index: 10; }');
  console.log('   #threejs-container { position: relative; z-index: 1; }');
  
  console.log('\n2. DATA VALIDATION (High priority):');
  console.log('   - Add null/undefined checks before displaying data');
  console.log('   - Use default values: value || "N/A"');
  console.log('   - Validate calculations before display');
  
  console.log('\n3. ACCESSIBILITY FIXES (High priority):');
  console.log('   - Add alt="" to all decorative images');
  console.log('   - Use only one H1 per page');
  console.log('   - Ensure all buttons are min 44x44px');
  
  console.log('\n4. PERFORMANCE OPTIMIZATION (Medium priority):');
  console.log('   - Move inline styles to CSS classes');
  console.log('   - Optimize DOM structure');
  console.log('   - Convert large inline images to external files');
  
  console.log('\n5. MOBILE RESPONSIVENESS (Medium priority):');
  console.log('   - Add viewport meta tag if missing');
  console.log('   - Use min font-size: 14px for mobile');
  console.log('   - Test and fix horizontal scroll issues');
  
  console.log(`\n\n📈 Total Issues Found: ${totalIssues}`);
  console.log(`   🔴 Critical: ${ISSUES_FOUND.CRITICAL.length}`);
  console.log(`   🟠 High: ${ISSUES_FOUND.HIGH.length}`);
  console.log(`   🟡 Medium: ${ISSUES_FOUND.MEDIUM.length}`);
  console.log(`   🔵 Low: ${ISSUES_FOUND.LOW.length}`);
  
  // Save report
  const reportPath = './test-screenshots/quick-issue-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues,
      critical: ISSUES_FOUND.CRITICAL.length,
      high: ISSUES_FOUND.HIGH.length,
      medium: ISSUES_FOUND.MEDIUM.length,
      low: ISSUES_FOUND.LOW.length
    },
    issues: ISSUES_FOUND
  }, null, 2));
  
  console.log(`\n📁 Detailed report saved to: ${reportPath}`);
}

function getSeverityEmoji(severity) {
  const emojis = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🔵'
  };
  return emojis[severity] || '⚪';
}

// Run the quick issue finder
findIssues().catch(console.error);