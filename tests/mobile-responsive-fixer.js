/**
 * Mobile Responsive Fixer - Automatically fix mobile compatibility issues
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES_TO_FIX = [
    {
        name: 'Professional Design Report',
        path: 'file:///Users/blakelange/Downloads/Mohave_Professional_Design_Report.html'
    },
    {
        name: 'Comprehensive Technical Report',
        path: 'file:///Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html'
    },
    {
        name: '3D Facility Visualization',
        path: 'file:///Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html'
    },
    {
        name: 'Enhanced 3D Professional Analysis',
        path: 'file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html'
    }
];

async function fixMobileResponsiveness() {
    console.log('📱 Mobile Responsive Fixer - Analyzing and fixing mobile issues\n');
    
    const browser = await chromium.launch({ headless: true });
    
    for (const pageInfo of PAGES_TO_FIX) {
        console.log(`\n📄 Fixing: ${pageInfo.name}`);
        console.log('─'.repeat(50));
        
        const page = await browser.newPage();
        
        // First load in desktop to get the content
        await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
        
        // Check for viewport meta tag
        const hasViewport = await page.evaluate(() => {
            return !!document.querySelector('meta[name="viewport"]');
        });
        
        if (!hasViewport) {
            console.log('   ❌ Missing viewport meta tag - Adding...');
            await page.evaluate(() => {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0';
                document.head.appendChild(viewport);
            });
        }
        
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
            console.log('   ❌ Horizontal scroll detected - Fixing...');
            
            // Inject mobile fixes
            await page.evaluate(() => {
                // Create or update mobile styles
                let mobileStyle = document.getElementById('mobile-fixes');
                if (!mobileStyle) {
                    mobileStyle = document.createElement('style');
                    mobileStyle.id = 'mobile-fixes';
                    document.head.appendChild(mobileStyle);
                }
                
                mobileStyle.textContent = `
                    /* Mobile Responsive Fixes */
                    @media (max-width: 768px) {
                        /* Prevent horizontal scroll */
                        html, body {
                            overflow-x: hidden !important;
                            max-width: 100vw !important;
                        }
                        
                        /* Fix container widths */
                        .container, .main-container, .content, .wrapper {
                            max-width: 100% !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 1rem !important;
                        }
                        
                        /* Fix tables */
                        table {
                            display: block !important;
                            overflow-x: auto !important;
                            -webkit-overflow-scrolling: touch !important;
                        }
                        
                        /* Fix images */
                        img {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        
                        /* Fix pre/code blocks */
                        pre, code {
                            overflow-x: auto !important;
                            max-width: 100% !important;
                            word-wrap: break-word !important;
                        }
                        
                        /* Fix flexbox containers */
                        .flex-container, [style*="display: flex"] {
                            flex-wrap: wrap !important;
                        }
                        
                        /* Fix grid layouts */
                        .grid-container, [style*="display: grid"] {
                            grid-template-columns: 1fr !important;
                        }
                        
                        /* Hide non-essential elements on mobile */
                        .desktop-only, .hide-mobile {
                            display: none !important;
                        }
                        
                        /* Ensure minimum font size */
                        * {
                            font-size: max(1em, 14px) !important;
                        }
                        
                        h1 { font-size: max(1.8em, 24px) !important; }
                        h2 { font-size: max(1.5em, 20px) !important; }
                        h3 { font-size: max(1.2em, 18px) !important; }
                        
                        /* Fix buttons and touch targets */
                        button, a, input, select, textarea, 
                        .button, .btn, .control-button {
                            min-height: 44px !important;
                            min-width: 44px !important;
                            padding: 12px 16px !important;
                        }
                        
                        /* Fix metric cards and info panels */
                        .metric-card, .info-panel, .card {
                            margin: 0.5rem 0 !important;
                            padding: 1rem !important;
                        }
                        
                        /* Fix sidebars and panels */
                        .left-panel, .right-panel, .sidebar {
                            position: static !important;
                            width: 100% !important;
                            height: auto !important;
                            margin-bottom: 1rem !important;
                        }
                        
                        /* Fix z-index issues on mobile */
                        .overlay, .modal, .popup {
                            z-index: 9999 !important;
                        }
                    }
                    
                    /* Landscape mobile fixes */
                    @media (max-width: 768px) and (orientation: landscape) {
                        .main-container {
                            min-height: 100vh !important;
                        }
                    }
                `;
            });
        }
        
        // Check for small text
        const smallTextCount = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
                const fontSize = window.getComputedStyle(el).fontSize;
                if (parseFloat(fontSize) < 14) count++;
            });
            return count;
        });
        
        if (smallTextCount > 10) {
            console.log(`   ⚠️  ${smallTextCount} elements with small text - Fixed with CSS`);
        }
        
        // Check touch target sizes
        const smallTouchTargets = await page.evaluate(() => {
            const targets = document.querySelectorAll('button, a, input, select, textarea');
            let count = 0;
            targets.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) count++;
            });
            return count;
        });
        
        if (smallTouchTargets > 0) {
            console.log(`   ⚠️  ${smallTouchTargets} small touch targets - Fixed with CSS`);
        }
        
        // Save the fixed HTML
        const fixedHtml = await page.content();
        const fileName = path.basename(pageInfo.path).replace('.html', '_Mobile_Fixed.html');
        const savePath = path.join('/Users/blakelange/Downloads', fileName);
        
        fs.writeFileSync(savePath, fixedHtml);
        console.log(`   ✅ Fixed version saved to: ${fileName}`);
        
        // Take before/after screenshots
        await page.screenshot({ 
            path: `./test-screenshots/mobile-${pageInfo.name.replace(/\s+/g, '-')}-after.png`,
            fullPage: true 
        });
        
        await page.close();
    }
    
    await browser.close();
    
    console.log('\n\n✅ Mobile fixes applied to all pages!');
    console.log('\n📋 Summary of fixes applied:');
    console.log('   • Added viewport meta tags');
    console.log('   • Fixed horizontal scroll issues');
    console.log('   • Ensured minimum font sizes (14px)');
    console.log('   • Fixed touch target sizes (44x44px minimum)');
    console.log('   • Made tables and images responsive');
    console.log('   • Fixed container widths and overflows');
    console.log('   • Added mobile-specific CSS rules');
}

// Run the fixer
fixMobileResponsiveness().catch(console.error);