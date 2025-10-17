/**
 * Detailed Button Debugger - Deep analysis of button clickability issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function debugButtonIssues() {
    console.log('🔍 Detailed Button Debugger - Analyzing button clickability\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const page = await browser.newPage();
    
    // Focus on the problematic page
    const targetPage = 'file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html';
    
    console.log('Loading page with DevTools open...');
    await page.goto(targetPage, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('\n📊 Analyzing Button Structure:');
    console.log('─'.repeat(50));
    
    // Get detailed information about all buttons
    const buttonAnalysis = await page.evaluate(() => {
        const results = {
            allButtons: [],
            blockedButtons: [],
            overlappingElements: [],
            zIndexHierarchy: []
        };
        
        // Find all buttons
        const buttons = document.querySelectorAll('button, .control-button, .toggle-button');
        
        buttons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(button);
            
            // Get element at center of button
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const elementAtPoint = document.elementFromPoint(centerX, centerY);
            
            // Check if button is clickable
            const isClickable = elementAtPoint === button || button.contains(elementAtPoint);
            
            // Get z-index hierarchy
            let element = button;
            const hierarchy = [];
            while (element && element !== document.body) {
                const style = window.getComputedStyle(element);
                if (style.position !== 'static') {
                    hierarchy.push({
                        tag: element.tagName,
                        class: element.className,
                        zIndex: style.zIndex,
                        position: style.position
                    });
                }
                element = element.parentElement;
            }
            
            const buttonInfo = {
                index,
                text: button.textContent.trim(),
                position: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                },
                styles: {
                    zIndex: computedStyle.zIndex,
                    position: computedStyle.position,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    pointerEvents: computedStyle.pointerEvents,
                    opacity: computedStyle.opacity
                },
                isClickable,
                elementAtPoint: elementAtPoint ? {
                    tag: elementAtPoint.tagName,
                    class: elementAtPoint.className,
                    id: elementAtPoint.id
                } : null,
                hierarchy
            };
            
            results.allButtons.push(buttonInfo);
            
            if (!isClickable) {
                results.blockedButtons.push(buttonInfo);
                
                // Find what's blocking it
                const allElementsAtPoint = document.elementsFromPoint(centerX, centerY);
                const blockingElements = allElementsAtPoint.filter(el => 
                    el !== button && !button.contains(el)
                );
                
                blockingElements.forEach(blocker => {
                    const blockerStyle = window.getComputedStyle(blocker);
                    results.overlappingElements.push({
                        buttonText: button.textContent.trim(),
                        blocker: {
                            tag: blocker.tagName,
                            class: blocker.className,
                            id: blocker.id,
                            zIndex: blockerStyle.zIndex,
                            position: blockerStyle.position,
                            rect: blocker.getBoundingClientRect()
                        }
                    });
                });
            }
        });
        
        // Get z-index hierarchy of problematic elements
        const elements = document.querySelectorAll('*');
        const zIndexedElements = [];
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.zIndex !== 'auto' && style.position !== 'static') {
                zIndexedElements.push({
                    tag: el.tagName,
                    class: el.className,
                    id: el.id,
                    zIndex: parseInt(style.zIndex) || 0,
                    position: style.position,
                    rect: el.getBoundingClientRect()
                });
            }
        });
        
        // Sort by z-index
        results.zIndexHierarchy = zIndexedElements
            .sort((a, b) => b.zIndex - a.zIndex)
            .slice(0, 20); // Top 20 elements
        
        return results;
    });
    
    // Print analysis
    console.log(`\nTotal buttons found: ${buttonAnalysis.allButtons.length}`);
    console.log(`Blocked buttons: ${buttonAnalysis.blockedButtons.length}`);
    
    if (buttonAnalysis.blockedButtons.length > 0) {
        console.log('\n❌ BLOCKED BUTTONS:');
        console.log('─'.repeat(50));
        
        buttonAnalysis.blockedButtons.forEach(button => {
            console.log(`\nButton: "${button.text}"`);
            console.log(`  Position: ${button.position.left}px, ${button.position.top}px`);
            console.log(`  Z-Index: ${button.styles.zIndex}`);
            console.log(`  CSS Position: ${button.styles.position}`);
            console.log(`  Blocked by: ${button.elementAtPoint ? 
                `<${button.elementAtPoint.tag} class="${button.elementAtPoint.class}">` : 
                'Unknown'}`);
        });
    }
    
    if (buttonAnalysis.overlappingElements.length > 0) {
        console.log('\n🔄 OVERLAPPING ELEMENTS:');
        console.log('─'.repeat(50));
        
        buttonAnalysis.overlappingElements.forEach(overlap => {
            console.log(`\nButton "${overlap.buttonText}" is blocked by:`);
            console.log(`  Element: <${overlap.blocker.tag} class="${overlap.blocker.class}">`);
            console.log(`  Blocker Z-Index: ${overlap.blocker.zIndex}`);
            console.log(`  Blocker Position: ${overlap.blocker.position}`);
        });
    }
    
    console.log('\n📊 Z-INDEX HIERARCHY (Top 20):');
    console.log('─'.repeat(50));
    
    buttonAnalysis.zIndexHierarchy.forEach(el => {
        console.log(`Z-Index ${el.zIndex}: <${el.tag} class="${el.class}" id="${el.id}">`);
    });
    
    // Generate fix suggestions
    console.log('\n🔧 SUGGESTED FIXES:');
    console.log('─'.repeat(50));
    
    const fixes = generateFixes(buttonAnalysis);
    fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. ${fix.description}`);
        console.log(`   Code:`);
        console.log(`   ${fix.code}`);
    });
    
    // Take screenshots
    console.log('\n📸 Taking diagnostic screenshots...');
    
    // Highlight blocked buttons
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('.control-button');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(
                rect.left + rect.width/2, 
                rect.top + rect.height/2
            );
            
            if (elementAtPoint !== button && !button.contains(elementAtPoint)) {
                button.style.border = '3px solid red';
                button.style.boxShadow = '0 0 10px red';
            }
        });
    });
    
    await page.screenshot({ 
        path: './test-screenshots/blocked-buttons-highlighted.png',
        fullPage: true 
    });
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        analysis: buttonAnalysis,
        fixes: fixes
    };
    
    fs.writeFileSync(
        './test-screenshots/button-debug-report.json', 
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n📁 Report saved to: ./test-screenshots/button-debug-report.json');
    console.log('📸 Screenshot saved to: ./test-screenshots/blocked-buttons-highlighted.png');
    
    // Keep browser open for manual inspection
    console.log('\n⚠️  Browser left open for manual inspection. Close when done.');
    console.log('💡 TIP: Use DevTools Elements panel to inspect the blocked buttons');
    
    // Wait for user to close browser
    await page.waitForTimeout(300000); // 5 minutes timeout
    await browser.close();
}

function generateFixes(analysis) {
    const fixes = [];
    
    if (analysis.blockedButtons.length > 0) {
        // Check for common issues
        const hasLowZIndex = analysis.blockedButtons.some(b => 
            parseInt(b.styles.zIndex) < 100 || b.styles.zIndex === 'auto'
        );
        
        if (hasLowZIndex) {
            fixes.push({
                description: 'Increase z-index for control buttons',
                code: `.control-button {
    position: relative;
    z-index: 1000 !important;
    pointer-events: all !important;
}`
            });
        }
        
        // Check for parent container issues
        const hasPositionIssues = analysis.blockedButtons.some(b => 
            b.styles.position === 'static'
        );
        
        if (hasPositionIssues) {
            fixes.push({
                description: 'Ensure buttons have proper positioning',
                code: `.control-button {
    position: relative;
}

.control-section {
    position: relative;
    z-index: 500;
}`
            });
        }
        
        // Check for overflow issues
        fixes.push({
            description: 'Ensure parent containers don\'t hide overflow',
            code: `.left-panel {
    overflow: visible;
}

.control-section {
    overflow: visible;
}`
        });
        
        // Add isolation fix
        fixes.push({
            description: 'Use CSS isolation to create new stacking context',
            code: `.control-section {
    isolation: isolate;
    position: relative;
    z-index: 1000;
}`
        });
    }
    
    return fixes;
}

// Run the debugger
debugButtonIssues().catch(console.error);