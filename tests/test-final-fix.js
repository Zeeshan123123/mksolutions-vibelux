/**
 * Test Final Z-Index Fix
 */

const { chromium } = require('playwright');

async function testFinalFix() {
    console.log('🧪 Testing Final Z-Index Fix\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Test our final fix
        await page.goto('file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html', {
            waitUntil: 'networkidle'
        });
        
        console.log('✅ Page loaded successfully');
        
        // Wait for 3D to initialize
        await page.waitForTimeout(2000);
        
        // Test each electrical system button
        const buttons = [
            { selector: 'button[onclick="toggleElectrical()"]', name: 'Conduit Routing' },
            { selector: 'button[onclick="toggleCircuits()"]', name: 'Circuit Distribution' },
            { selector: 'button[onclick="togglePanels()"]', name: 'Electrical Panels' },
            { selector: 'button[onclick="toggleLoadAnalysis()"]', name: 'Load Analysis' }
        ];
        
        console.log('\n🔍 Testing Button Clickability:');
        console.log('─'.repeat(40));
        
        let allButtonsWork = true;
        
        for (const button of buttons) {
            try {
                // Get the button element
                const buttonElement = await page.$(button.selector);
                if (!buttonElement) {
                    console.log(`❌ ${button.name}: Button not found`);
                    allButtonsWork = false;
                    continue;
                }
                
                // Check if button is visible and clickable
                const isVisible = await buttonElement.isVisible();
                const isEnabled = await buttonElement.isEnabled();
                
                if (!isVisible) {
                    console.log(`❌ ${button.name}: Button not visible`);
                    allButtonsWork = false;
                    continue;
                }
                
                if (!isEnabled) {
                    console.log(`❌ ${button.name}: Button not enabled`);
                    allButtonsWork = false;
                    continue;
                }
                
                // Check what element is at the button's position
                const box = await buttonElement.boundingBox();
                if (!box) {
                    console.log(`❌ ${button.name}: No bounding box`);
                    allButtonsWork = false;
                    continue;
                }
                
                const centerX = box.x + box.width / 2;
                const centerY = box.y + box.height / 2;
                
                const elementAtPoint = await page.evaluateHandle((x, y) => {
                    return document.elementFromPoint(x, y);
                }, centerX, centerY);
                
                const isButtonAtPoint = await page.evaluate((button, elementAtPoint) => {
                    return button === elementAtPoint || button.contains(elementAtPoint);
                }, buttonElement, elementAtPoint);
                
                if (!isButtonAtPoint) {
                    const blockerInfo = await page.evaluate((elementAtPoint) => {
                        if (!elementAtPoint) return 'Unknown element';
                        return `<${elementAtPoint.tagName} class="${elementAtPoint.className}">`;
                    }, elementAtPoint);
                    
                    console.log(`❌ ${button.name}: Blocked by ${blockerInfo}`);
                    allButtonsWork = false;
                    continue;
                }
                
                // Try to click the button
                await buttonElement.click();
                console.log(`✅ ${button.name}: Successfully clicked`);
                
                // Wait a moment between clicks
                await page.waitForTimeout(500);
                
            } catch (error) {
                console.log(`❌ ${button.name}: Error - ${error.message}`);
                allButtonsWork = false;
            }
        }
        
        console.log('\n📊 Test Results:');
        console.log('─'.repeat(40));
        
        if (allButtonsWork) {
            console.log('🎉 SUCCESS: All electrical system buttons are working!');
            console.log('✅ Z-index fix has resolved the button overlay issues');
        } else {
            console.log('⚠️  ISSUES REMAIN: Some buttons still have problems');
        }
        
        // Test other functionality
        console.log('\n🔧 Testing Other Controls:');
        console.log('─'.repeat(40));
        
        try {
            await page.click('button[onclick="toggleLighting()"]');
            console.log('✅ Lighting toggle works');
        } catch (e) {
            console.log('❌ Lighting toggle failed');
        }
        
        try {
            await page.click('button[onclick="toggleHeatmap()"]');
            console.log('✅ Heatmap toggle works');
        } catch (e) {
            console.log('❌ Heatmap toggle failed');
        }
        
        // Check circuit monitor
        try {
            await page.click('.circuit-box');
            console.log('✅ Circuit monitor works');
        } catch (e) {
            console.log('❌ Circuit monitor failed');
        }
        
        // Test tabs
        try {
            await page.click('button[onclick="showTab(\'electrical\')"]');
            console.log('✅ Tab switching works');
        } catch (e) {
            console.log('❌ Tab switching failed');
        }
        
        console.log('\n📸 Taking final screenshot...');
        await page.screenshot({ 
            path: './test-screenshots/final-fix-test.png',
            fullPage: true 
        });
        
        console.log('\n🎯 FINAL ASSESSMENT:');
        console.log('═'.repeat(50));
        
        if (allButtonsWork) {
            console.log('🟢 CRITICAL ISSUE RESOLVED: Z-index button problems fixed');
            console.log('📋 The Enhanced 3D Professional Analysis page is now fully functional');
            console.log('🚀 All electrical system controls are accessible and clickable');
        } else {
            console.log('🔴 CRITICAL ISSUE PERSISTS: Button problems remain');
            console.log('🔧 Additional fixes may be needed');
        }
        
        console.log('\n⏰ Keeping browser open for 30 seconds for manual verification...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    await browser.close();
}

testFinalFix().catch(console.error);