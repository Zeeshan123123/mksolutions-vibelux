/**
 * Z-Index Specific Fixer - Targeted fix for button overlay issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function fixZIndexIssues() {
    console.log('🎯 Z-Index Specific Fixer - Targeting button overlay issues\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 
    });
    
    const page = await browser.newPage();
    
    // Load the problematic page
    await page.goto('file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html', {
        waitUntil: 'networkidle'
    });
    
    console.log('Analyzing button structure...\n');
    
    // Inject comprehensive z-index fix
    await page.evaluate(() => {
        // Remove any existing fix attempts
        const existingFixes = document.querySelectorAll('#z-index-fixes');
        existingFixes.forEach(el => el.remove());
        
        // Create new comprehensive fix
        const style = document.createElement('style');
        style.id = 'z-index-fixes';
        style.textContent = `
            /* Comprehensive Z-Index Fix for Button Overlay Issues */
            
            /* Reset z-index hierarchy */
            * {
                /* Remove any competing z-index values */
                z-index: auto !important;
            }
            
            /* Establish proper stacking context */
            body {
                position: relative;
                z-index: 0 !important;
            }
            
            /* Main container layers */
            .main-container {
                position: relative;
                z-index: 1 !important;
            }
            
            /* 3D viewer should be at the bottom */
            .viewer-container {
                position: relative;
                z-index: 1 !important;
            }
            
            #threejs-container {
                position: relative;
                z-index: 1 !important;
            }
            
            #threejs-container canvas {
                position: relative;
                z-index: 1 !important;
            }
            
            /* Side panels above viewer */
            .left-panel {
                position: relative;
                z-index: 100 !important;
                background: rgba(20, 20, 20, 0.95) !important;
            }
            
            .right-panel {
                position: relative;
                z-index: 100 !important;
                background: rgba(20, 20, 20, 0.95) !important;
            }
            
            /* Control sections */
            .control-section {
                position: relative !important;
                z-index: 200 !important;
                isolation: isolate !important;
            }
            
            /* Buttons must be on top */
            .control-button,
            .toggle-button,
            button {
                position: relative !important;
                z-index: 300 !important;
                pointer-events: all !important;
                cursor: pointer !important;
                isolation: isolate !important;
            }
            
            /* Ensure buttons are clickable */
            .control-button *,
            .toggle-button *,
            button * {
                pointer-events: none !important;
            }
            
            /* Electrical panel should not block buttons */
            .electrical-panel {
                position: relative !important;
                z-index: 150 !important;
                margin-top: 1rem !important;
            }
            
            /* Overlays should be above canvas but not block controls */
            .status-overlay {
                position: absolute !important;
                z-index: 50 !important;
                pointer-events: none !important;
            }
            
            .legend-overlay {
                position: absolute !important;
                z-index: 50 !important;
                pointer-events: none !important;
            }
            
            /* Ensure all overlays don't block interaction */
            .overlay,
            [class*="overlay"] {
                pointer-events: none !important;
            }
            
            /* Fix any absolute positioned elements */
            .info-panel,
            .metric-card,
            .room-item {
                position: relative !important;
                z-index: auto !important;
            }
            
            /* Ensure tooltips are on top */
            .info-tooltip,
            .tooltip,
            [role="tooltip"] {
                z-index: 9999 !important;
            }
            
            /* Debug helper - highlight clickable areas */
            .control-button:hover {
                box-shadow: 0 0 10px 2px rgba(33, 150, 243, 0.8) !important;
                transform: translateY(-2px) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Additional JavaScript fixes
        const buttons = document.querySelectorAll('.control-button, .toggle-button');
        buttons.forEach((button, index) => {
            // Ensure button is interactive
            button.style.cssText += `
                position: relative !important;
                z-index: ${1000 + index} !important;
                pointer-events: all !important;
                cursor: pointer !important;
            `;
            
            // Add tabindex for keyboard accessibility
            if (!button.hasAttribute('tabindex')) {
                button.setAttribute('tabindex', '0');
            }
            
            // Ensure click events work
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Button clicked:', this.textContent.trim());
            }, true);
        });
        
        // Move electrical panel if it's overlapping
        const electricalPanel = document.querySelector('.electrical-panel');
        if (electricalPanel) {
            const controlSection = electricalPanel.previousElementSibling;
            if (controlSection && controlSection.classList.contains('control-section')) {
                // Add spacing
                electricalPanel.style.marginTop = '2rem';
            }
        }
        
        console.log('Z-index fixes applied!');
    });
    
    // Test button clickability
    console.log('\nTesting button clickability...');
    
    const buttonTests = await page.evaluate(() => {
        const results = [];
        const buttons = document.querySelectorAll('.control-button');
        
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Get all elements at this point
            const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
            const topElement = elementsAtPoint[0];
            
            const isClickable = topElement === button || button.contains(topElement);
            
            results.push({
                text: button.textContent.trim(),
                clickable: isClickable,
                topElement: topElement ? {
                    tag: topElement.tagName,
                    class: topElement.className
                } : null,
                zIndex: window.getComputedStyle(button).zIndex
            });
        });
        
        return results;
    });
    
    console.log('\nButton Clickability Results:');
    console.log('─'.repeat(50));
    
    let allClickable = true;
    buttonTests.forEach(test => {
        const status = test.clickable ? '✅' : '❌';
        console.log(`${status} "${test.text}" - z-index: ${test.zIndex}`);
        if (!test.clickable) {
            console.log(`   Blocked by: <${test.topElement.tag} class="${test.topElement.class}">`);
            allClickable = false;
        }
    });
    
    if (allClickable) {
        console.log('\n✅ All buttons are now clickable!');
    } else {
        console.log('\n⚠️  Some buttons still have issues. Applying aggressive fix...');
        
        // Apply more aggressive fix
        await page.evaluate(() => {
            // Nuclear option - move buttons to body level
            const problemButtons = [];
            const buttons = document.querySelectorAll('.control-button');
            
            buttons.forEach(button => {
                const rect = button.getBoundingClientRect();
                const elementAtPoint = document.elementFromPoint(
                    rect.left + rect.width/2,
                    rect.top + rect.height/2
                );
                
                if (elementAtPoint !== button && !button.contains(elementAtPoint)) {
                    problemButtons.push(button);
                }
            });
            
            if (problemButtons.length > 0) {
                console.warn(`Found ${problemButtons.length} blocked buttons. Applying aggressive fix...`);
                
                // Create a floating button panel
                const floatingPanel = document.createElement('div');
                floatingPanel.id = 'floating-button-panel';
                floatingPanel.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 10px;
                    transform: translateY(-50%);
                    z-index: 99999;
                    background: rgba(20, 20, 20, 0.95);
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                `;
                
                // Note about the fix
                const note = document.createElement('div');
                note.style.cssText = 'color: #ff9800; font-size: 12px; margin-bottom: 1rem;';
                note.textContent = 'Controls moved here due to overlay issues';
                floatingPanel.appendChild(note);
                
                // Move problem buttons
                problemButtons.forEach(button => {
                    const clone = button.cloneNode(true);
                    clone.style.cssText = `
                        display: block;
                        width: 200px;
                        margin: 0.5rem 0;
                        position: relative;
                        z-index: 99999;
                    `;
                    
                    // Copy click handlers
                    clone.onclick = button.onclick;
                    
                    floatingPanel.appendChild(clone);
                });
                
                document.body.appendChild(floatingPanel);
            }
        });
    }
    
    // Save the fixed version
    const content = await page.content();
    fs.writeFileSync(
        '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_Fixed_Final.html',
        content
    );
    
    console.log('\n✅ Fixed version saved to: Mohave_Enhanced_3D_ZIndex_Fixed_Final.html');
    
    // Take screenshot
    await page.screenshot({
        path: './test-screenshots/z-index-fixed-final.png',
        fullPage: true
    });
    
    console.log('📸 Screenshot saved to: ./test-screenshots/z-index-fixed-final.png');
    
    console.log('\n💡 Browser left open for manual testing. Close when done.');
    
    // Keep browser open for testing
    await page.waitForTimeout(300000);
    await browser.close();
}

// Run the fixer
fixZIndexIssues().catch(console.error);