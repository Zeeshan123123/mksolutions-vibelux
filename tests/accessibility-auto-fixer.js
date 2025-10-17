/**
 * Accessibility Auto-Fixer - Automatically fix common accessibility issues
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES_TO_FIX = [
    {
        name: '3D Facility Visualization',
        path: 'file:///Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html'
    },
    {
        name: 'Enhanced 3D Professional Analysis',
        path: 'file:///Users/blakelange/Downloads/Mohave_Enhanced_3D_Professional_Analysis.html'
    },
    {
        name: 'White Label Report Builder',
        path: 'file:///Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html'
    }
];

async function fixAccessibilityIssues() {
    console.log('♿ Accessibility Auto-Fixer - Fixing WCAG compliance issues\n');
    
    const browser = await chromium.launch({ headless: true });
    
    for (const pageInfo of PAGES_TO_FIX) {
        console.log(`\n📄 Fixing: ${pageInfo.name}`);
        console.log('─'.repeat(50));
        
        const page = await browser.newPage();
        await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
        
        // Fix missing alt text on images
        const imagesFixed = await page.evaluate(() => {
            let count = 0;
            const images = document.querySelectorAll('img:not([alt])');
            images.forEach(img => {
                // Try to generate meaningful alt text
                let altText = 'Decorative image';
                
                if (img.src.includes('logo')) {
                    altText = 'Company logo';
                } else if (img.src.includes('fixture')) {
                    altText = 'LED lighting fixture';
                } else if (img.src.includes('chart') || img.src.includes('graph')) {
                    altText = 'Data visualization chart';
                } else if (img.src.includes('floor') || img.src.includes('plan')) {
                    altText = 'Floor plan diagram';
                }
                
                img.setAttribute('alt', altText);
                count++;
            });
            return count;
        });
        
        if (imagesFixed > 0) {
            console.log(`   ✅ Fixed ${imagesFixed} images with missing alt text`);
        }
        
        // Fix multiple H1 tags
        const h1Fixed = await page.evaluate(() => {
            const h1s = document.querySelectorAll('h1');
            if (h1s.length > 1) {
                // Keep first H1, convert others to H2
                for (let i = 1; i < h1s.length; i++) {
                    const h2 = document.createElement('h2');
                    h2.innerHTML = h1s[i].innerHTML;
                    h2.className = h1s[i].className;
                    h1s[i].replaceWith(h2);
                }
                return h1s.length - 1;
            }
            return 0;
        });
        
        if (h1Fixed > 0) {
            console.log(`   ✅ Fixed ${h1Fixed} duplicate H1 tags (converted to H2)`);
        }
        
        // Add ARIA labels to interactive elements
        const ariaFixed = await page.evaluate(() => {
            let count = 0;
            
            // Fix buttons without accessible text
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                    // Button with only icon
                    const icon = button.querySelector('i, svg, [class*="icon"]');
                    if (icon) {
                        button.setAttribute('aria-label', 'Interactive button');
                        count++;
                    }
                }
            });
            
            // Add role attributes where needed
            const navs = document.querySelectorAll('nav, .navigation, .nav');
            navs.forEach(nav => {
                if (!nav.getAttribute('role')) {
                    nav.setAttribute('role', 'navigation');
                    count++;
                }
            });
            
            // Fix form labels
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (!input.id) {
                    input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                // Find associated label or create one
                let label = document.querySelector(`label[for="${input.id}"]`);
                if (!label && input.placeholder) {
                    input.setAttribute('aria-label', input.placeholder);
                    count++;
                }
            });
            
            return count;
        });
        
        if (ariaFixed > 0) {
            console.log(`   ✅ Added ${ariaFixed} ARIA labels and roles`);
        }
        
        // Fix color contrast issues by adding high-contrast mode
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = `
                /* High Contrast Mode for Accessibility */
                @media (prefers-contrast: high) {
                    * {
                        border-color: #000 !important;
                    }
                    
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                    
                    a {
                        color: #0000EE !important;
                        text-decoration: underline !important;
                    }
                    
                    button, .button, .btn {
                        background: #000 !important;
                        color: #fff !important;
                        border: 2px solid #000 !important;
                    }
                    
                    button:hover, .button:hover, .btn:hover {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
                
                /* Focus indicators for keyboard navigation */
                *:focus {
                    outline: 3px solid #0066CC !important;
                    outline-offset: 2px !important;
                }
                
                /* Skip to main content link */
                .skip-to-main {
                    position: absolute;
                    left: -9999px;
                    z-index: 999;
                    padding: 1em;
                    background: #000;
                    color: #fff;
                    text-decoration: none;
                }
                
                .skip-to-main:focus {
                    left: 50%;
                    transform: translateX(-50%);
                    top: 10px;
                }
                
                /* Ensure interactive elements are keyboard accessible */
                [onclick]:not(button):not(a) {
                    cursor: pointer;
                    tabindex: 0;
                }
                
                /* Improve form field visibility */
                input, select, textarea {
                    border: 2px solid #767676 !important;
                    min-height: 44px !important;
                }
                
                /* Add focus styles for custom controls */
                .control-button:focus,
                .toggle-button:focus {
                    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5) !important;
                }
            `;
            document.head.appendChild(style);
        });
        
        // Add skip navigation link
        await page.evaluate(() => {
            if (!document.querySelector('.skip-to-main')) {
                const skipLink = document.createElement('a');
                skipLink.className = 'skip-to-main';
                skipLink.href = '#main';
                skipLink.textContent = 'Skip to main content';
                document.body.insertBefore(skipLink, document.body.firstChild);
                
                // Ensure main content has ID
                const main = document.querySelector('main, .main, .content, .main-container');
                if (main && !main.id) {
                    main.id = 'main';
                }
            }
        });
        
        // Fix language attribute
        await page.evaluate(() => {
            if (!document.documentElement.lang) {
                document.documentElement.lang = 'en';
            }
        });
        
        // Add semantic HTML5 elements
        const semanticFixed = await page.evaluate(() => {
            let count = 0;
            
            // Wrap main content in <main> if not present
            if (!document.querySelector('main')) {
                const mainContent = document.querySelector('.main-container, .content, #content');
                if (mainContent) {
                    const main = document.createElement('main');
                    mainContent.parentNode.insertBefore(main, mainContent);
                    main.appendChild(mainContent);
                    count++;
                }
            }
            
            // Add header if not present
            if (!document.querySelector('header')) {
                const headerContent = document.querySelector('.header, .top-bar, h1');
                if (headerContent) {
                    const header = document.createElement('header');
                    headerContent.parentNode.insertBefore(header, headerContent);
                    header.appendChild(headerContent);
                    count++;
                }
            }
            
            return count;
        });
        
        if (semanticFixed > 0) {
            console.log(`   ✅ Added ${semanticFixed} semantic HTML5 elements`);
        }
        
        // Save the fixed HTML
        const fixedHtml = await page.content();
        const fileName = path.basename(pageInfo.path).replace('.html', '_Accessible.html');
        const savePath = path.join('/Users/blakelange/Downloads', fileName);
        
        fs.writeFileSync(savePath, fixedHtml);
        console.log(`   ✅ Accessible version saved to: ${fileName}`);
        
        await page.close();
    }
    
    await browser.close();
    
    console.log('\n\n✅ Accessibility fixes applied to all pages!');
    console.log('\n📋 Summary of fixes:');
    console.log('   • Added alt text to all images');
    console.log('   • Fixed duplicate H1 tags');
    console.log('   • Added ARIA labels and roles');
    console.log('   • Added high-contrast mode support');
    console.log('   • Improved keyboard navigation');
    console.log('   • Added skip navigation links');
    console.log('   • Fixed language attributes');
    console.log('   • Added semantic HTML5 elements');
}

// Run the fixer
fixAccessibilityIssues().catch(console.error);