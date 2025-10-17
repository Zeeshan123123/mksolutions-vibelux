/**
 * Accessibility Deep Scanner
 * Comprehensive WCAG 2.1 compliance testing and accessibility analysis
 */

const { chromium } = require('playwright');
const fs = require('fs');

class AccessibilityDeepScanner {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            wcagLevel: 'AA',
            pages: {},
            summary: {
                totalViolations: 0,
                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0,
                complianceScore: 0
            },
            guidelines: {}
        };
        
        this.testPages = [
            { name: 'Professional Design Report', path: '/Users/blakelange/Downloads/Mohave_Professional_Design_Report.html' },
            { name: 'Comprehensive Technical Report', path: '/Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html' },
            { name: '3D Facility Visualization', path: '/Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html' },
            { name: 'Enhanced 3D Professional Analysis', path: '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html' },
            { name: 'White Label Report Builder', path: '/Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html' }
        ];

        this.wcagGuidelines = {
            '1.1.1': { name: 'Non-text Content', level: 'A' },
            '1.3.1': { name: 'Info and Relationships', level: 'A' },
            '1.3.2': { name: 'Meaningful Sequence', level: 'A' },
            '1.4.1': { name: 'Use of Color', level: 'A' },
            '1.4.3': { name: 'Contrast (Minimum)', level: 'AA' },
            '1.4.4': { name: 'Resize Text', level: 'AA' },
            '1.4.10': { name: 'Reflow', level: 'AA' },
            '1.4.11': { name: 'Non-text Contrast', level: 'AA' },
            '1.4.12': { name: 'Text Spacing', level: 'AA' },
            '1.4.13': { name: 'Content on Hover or Focus', level: 'AA' },
            '2.1.1': { name: 'Keyboard', level: 'A' },
            '2.1.2': { name: 'No Keyboard Trap', level: 'A' },
            '2.1.4': { name: 'Character Key Shortcuts', level: 'A' },
            '2.4.1': { name: 'Bypass Blocks', level: 'A' },
            '2.4.2': { name: 'Page Titled', level: 'A' },
            '2.4.3': { name: 'Focus Order', level: 'A' },
            '2.4.4': { name: 'Link Purpose (In Context)', level: 'A' },
            '2.4.6': { name: 'Headings and Labels', level: 'AA' },
            '2.4.7': { name: 'Focus Visible', level: 'AA' },
            '3.1.1': { name: 'Language of Page', level: 'A' },
            '3.2.1': { name: 'On Focus', level: 'A' },
            '3.2.2': { name: 'On Input', level: 'A' },
            '3.3.1': { name: 'Error Identification', level: 'A' },
            '3.3.2': { name: 'Labels or Instructions', level: 'A' },
            '4.1.1': { name: 'Parsing', level: 'A' },
            '4.1.2': { name: 'Name, Role, Value', level: 'A' },
            '4.1.3': { name: 'Status Messages', level: 'AA' }
        };
    }

    async runAccessibilityScan() {
        console.log('♿ COMPREHENSIVE ACCESSIBILITY DEEP SCAN');
        console.log('═'.repeat(60));
        console.log('WCAG 2.1 Level AA Compliance Testing...\n');

        const browser = await chromium.launch({ headless: true });

        for (const page of this.testPages) {
            console.log(`🔍 Scanning: ${page.name}`);
            console.log('─'.repeat(40));
            
            this.results.pages[page.name] = {
                violations: [],
                summary: { critical: 0, serious: 0, moderate: 0, minor: 0 },
                score: 0,
                recommendations: []
            };

            const browserPage = await browser.newPage();
            
            try {
                await this.scanPageAccessibility(browserPage, page);
            } catch (error) {
                this.addViolation(page.name, {
                    guideline: 'SCAN_ERROR',
                    severity: 'critical',
                    description: `Failed to scan page: ${error.message}`,
                    impact: 'Cannot assess accessibility compliance',
                    solution: 'Fix page loading issues before accessibility assessment'
                });
            }
            
            await browserPage.close();
        }

        await browser.close();
        await this.generateAccessibilityReport();
    }

    async scanPageAccessibility(page, pageInfo) {
        await page.goto(`file://${pageInfo.path}`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });

        // Test 1: Document Structure and Semantics
        await this.testDocumentStructure(page, pageInfo.name);

        // Test 2: Keyboard Navigation
        await this.testKeyboardNavigation(page, pageInfo.name);

        // Test 3: Color and Contrast
        await this.testColorContrast(page, pageInfo.name);

        // Test 4: Images and Alt Text
        await this.testImagesAltText(page, pageInfo.name);

        // Test 5: Form Accessibility
        await this.testFormAccessibility(page, pageInfo.name);

        // Test 6: Focus Management
        await this.testFocusManagement(page, pageInfo.name);

        // Test 7: ARIA Implementation
        await this.testARIAImplementation(page, pageInfo.name);

        // Test 8: Text and Typography
        await this.testTextAccessibility(page, pageInfo.name);

        // Test 9: Interactive Elements
        await this.testInteractiveElements(page, pageInfo.name);

        // Test 10: Screen Reader Compatibility
        await this.testScreenReaderCompatibility(page, pageInfo.name);

        // Test 11: Mobile Accessibility
        await this.testMobileAccessibility(page, pageInfo.name);

        // Test 12: Video/Audio Content
        await this.testMediaAccessibility(page, pageInfo.name);

        // Calculate page score
        this.calculatePageScore(pageInfo.name);
    }

    async testDocumentStructure(page, pageName) {
        try {
            const structureIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check for page title
                if (!document.title || document.title.trim() === '') {
                    issues.push({ type: '2.4.2', issue: 'Missing or empty page title' });
                }
                
                // Check for lang attribute
                const html = document.documentElement;
                if (!html.getAttribute('lang')) {
                    issues.push({ type: '3.1.1', issue: 'Missing lang attribute on <html>' });
                }
                
                // Check heading structure
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const h1Count = document.querySelectorAll('h1').length;
                
                if (h1Count === 0) {
                    issues.push({ type: '1.3.1', issue: 'No H1 heading found' });
                } else if (h1Count > 1) {
                    issues.push({ type: '1.3.1', issue: 'Multiple H1 headings found' });
                }
                
                // Check heading hierarchy
                let lastLevel = 0;
                headings.forEach((heading, index) => {
                    const level = parseInt(heading.tagName.charAt(1));
                    if (index > 0 && level > lastLevel + 1) {
                        issues.push({ 
                            type: '1.3.1', 
                            issue: `Heading level skipped: ${heading.tagName} after H${lastLevel}`,
                            element: heading.textContent.substring(0, 50)
                        });
                    }
                    lastLevel = level;
                });
                
                // Check for landmarks
                const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby]');
                if (landmarks.length === 0) {
                    issues.push({ type: '1.3.1', issue: 'No ARIA landmarks found' });
                }
                
                // Check for skip links
                const skipLinks = document.querySelectorAll('a[href^="#"]');
                const hasSkipToMain = Array.from(skipLinks).some(link => 
                    /skip.*main|skip.*content/i.test(link.textContent)
                );
                if (!hasSkipToMain) {
                    issues.push({ type: '2.4.1', issue: 'No "skip to main content" link found' });
                }
                
                return issues;
            });

            structureIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: issue.type,
                    severity: this.getSeverity(issue.type),
                    description: issue.issue,
                    element: issue.element || 'Document',
                    impact: 'Screen readers and keyboard users may have difficulty navigating',
                    solution: this.getSolution(issue.type, issue.issue)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Document structure test failed: ${error.message}`);
        }
    }

    async testKeyboardNavigation(page, pageName) {
        try {
            // Test tab navigation
            const focusableElements = await page.evaluate(() => {
                const focusable = document.querySelectorAll(
                    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
                );
                
                return Array.from(focusable).map(el => ({
                    tagName: el.tagName,
                    type: el.type || null,
                    hasTabindex: el.hasAttribute('tabindex'),
                    tabindex: el.getAttribute('tabindex'),
                    visible: el.offsetParent !== null,
                    disabled: el.disabled || false,
                    ariaHidden: el.getAttribute('aria-hidden') === 'true'
                }));
            });

            // Check for keyboard traps
            let trapDetected = false;
            try {
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                // If we get here without hanging, likely no trap
            } catch (e) {
                trapDetected = true;
            }

            if (trapDetected) {
                this.addViolation(pageName, {
                    guideline: '2.1.2',
                    severity: 'critical',
                    description: 'Keyboard trap detected',
                    impact: 'Users cannot navigate away from element using keyboard',
                    solution: 'Ensure all focusable elements allow keyboard navigation away'
                });
            }

            // Check for elements with positive tabindex
            const positiveTabindex = focusableElements.filter(el => 
                el.hasTabindex && parseInt(el.tabindex) > 0
            );
            
            if (positiveTabindex.length > 0) {
                this.addViolation(pageName, {
                    guideline: '2.4.3',
                    severity: 'moderate',
                    description: `${positiveTabindex.length} elements use positive tabindex values`,
                    impact: 'Disrupts natural tab order for keyboard users',
                    solution: 'Use tabindex="0" or rely on natural document order'
                });
            }

            // Check for invisible focusable elements
            const hiddenFocusable = focusableElements.filter(el => 
                !el.visible && !el.disabled && !el.ariaHidden
            );
            
            if (hiddenFocusable.length > 0) {
                this.addViolation(pageName, {
                    guideline: '2.4.3',
                    severity: 'serious',
                    description: `${hiddenFocusable.length} hidden elements are still focusable`,
                    impact: 'Keyboard users may focus on invisible elements',
                    solution: 'Add tabindex="-1" to hidden interactive elements'
                });
            }

        } catch (error) {
            console.log(`   ⚠️  Keyboard navigation test failed: ${error.message}`);
        }
    }

    async testColorContrast(page, pageName) {
        try {
            const contrastIssues = await page.evaluate(() => {
                function getContrast(foreground, background) {
                    // Simplified contrast calculation
                    const rgb1 = foreground.match(/\d+/g).map(Number);
                    const rgb2 = background.match(/\d+/g).map(Number);
                    
                    function getLuminance(r, g, b) {
                        const [rs, gs, bs] = [r, g, b].map(c => {
                            c = c / 255;
                            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                        });
                        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                    }
                    
                    const l1 = getLuminance(...rgb1);
                    const l2 = getLuminance(...rgb2);
                    
                    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                }
                
                const issues = [];
                const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
                
                Array.from(textElements).slice(0, 50).forEach(el => {
                    if (el.textContent.trim() === '') return;
                    
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const backgroundColor = style.backgroundColor;
                    
                    if (color && backgroundColor && 
                        color !== 'rgba(0, 0, 0, 0)' && 
                        backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        
                        try {
                            const contrast = getContrast(color, backgroundColor);
                            const fontSize = parseFloat(style.fontSize);
                            const isBold = style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700;
                            
                            const requiredRatio = (fontSize >= 18 || (fontSize >= 14 && isBold)) ? 3 : 4.5;
                            
                            if (contrast < requiredRatio) {
                                issues.push({
                                    element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                                    contrast: contrast.toFixed(2),
                                    required: requiredRatio,
                                    text: el.textContent.substring(0, 30)
                                });
                            }
                        } catch (e) {
                            // Skip contrast calculation errors
                        }
                    }
                });
                
                return issues;
            });

            contrastIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '1.4.3',
                    severity: 'serious',
                    description: `Low color contrast: ${issue.contrast}:1 (required: ${issue.required}:1)`,
                    element: `${issue.element}: "${issue.text}..."`,
                    impact: 'Text may be difficult to read for users with visual impairments',
                    solution: 'Increase color contrast to meet WCAG AA standards'
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Color contrast test failed: ${error.message}`);
        }
    }

    async testImagesAltText(page, pageName) {
        try {
            const imageIssues = await page.evaluate(() => {
                const issues = [];
                const images = document.querySelectorAll('img');
                
                images.forEach(img => {
                    const alt = img.getAttribute('alt');
                    const src = img.src;
                    
                    if (alt === null) {
                        issues.push({
                            type: 'missing-alt',
                            src: src.substring(src.lastIndexOf('/') + 1),
                            issue: 'Missing alt attribute'
                        });
                    } else if (alt.trim() === '' && img.getAttribute('role') !== 'presentation') {
                        // Empty alt is OK for decorative images, but should have role="presentation"
                        issues.push({
                            type: 'empty-alt-no-role',
                            src: src.substring(src.lastIndexOf('/') + 1),
                            issue: 'Empty alt without role="presentation"'
                        });
                    } else if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
                        issues.push({
                            type: 'redundant-alt',
                            src: src.substring(src.lastIndexOf('/') + 1),
                            alt: alt.substring(0, 50),
                            issue: 'Alt text contains redundant words'
                        });
                    }
                });
                
                // Check for background images that convey information
                const elementsWithBgImages = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.backgroundImage !== 'none' && style.backgroundImage !== '';
                });
                
                elementsWithBgImages.forEach(el => {
                    if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && el.textContent.trim() === '') {
                        issues.push({
                            type: 'bg-image-no-alt',
                            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                            issue: 'Background image without alternative text'
                        });
                    }
                });
                
                return issues;
            });

            imageIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '1.1.1',
                    severity: issue.type === 'missing-alt' ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.src || issue.element || 'Image',
                    impact: 'Screen reader users cannot understand image content',
                    solution: this.getImageSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Images alt text test failed: ${error.message}`);
        }
    }

    async testFormAccessibility(page, pageName) {
        try {
            const formIssues = await page.evaluate(() => {
                const issues = [];
                const forms = document.querySelectorAll('form');
                const inputs = document.querySelectorAll('input, textarea, select');
                
                // Check form labels
                inputs.forEach(input => {
                    if (input.type === 'hidden') return;
                    
                    const id = input.id;
                    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                    const ariaLabel = input.getAttribute('aria-label');
                    const ariaLabelledby = input.getAttribute('aria-labelledby');
                    const placeholder = input.getAttribute('placeholder');
                    
                    if (!label && !ariaLabel && !ariaLabelledby) {
                        issues.push({
                            type: 'missing-label',
                            element: `${input.tagName}[type="${input.type}"]`,
                            issue: 'Form control missing label'
                        });
                    }
                    
                    if (placeholder && !label && !ariaLabel) {
                        issues.push({
                            type: 'placeholder-only',
                            element: `${input.tagName}[type="${input.type}"]`,
                            issue: 'Using placeholder as only label'
                        });
                    }
                });
                
                // Check fieldsets for grouped controls
                const radioGroups = document.querySelectorAll('input[type="radio"]');
                const checkboxGroups = document.querySelectorAll('input[type="checkbox"]');
                
                if (radioGroups.length > 1) {
                    const fieldset = document.querySelector('fieldset');
                    if (!fieldset) {
                        issues.push({
                            type: 'missing-fieldset',
                            element: 'Radio buttons',
                            issue: 'Related form controls not grouped in fieldset'
                        });
                    }
                }
                
                // Check for required field indicators
                const requiredFields = document.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    const hasAriaRequired = field.getAttribute('aria-required') === 'true';
                    const hasVisualIndicator = field.parentElement.textContent.includes('*') || 
                                               field.parentElement.textContent.toLowerCase().includes('required');
                    
                    if (!hasAriaRequired && !hasVisualIndicator) {
                        issues.push({
                            type: 'required-not-indicated',
                            element: field.tagName,
                            issue: 'Required field not properly indicated'
                        });
                    }
                });
                
                return issues;
            });

            formIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: issue.type.includes('label') ? '3.3.2' : '1.3.1',
                    severity: 'serious',
                    description: issue.issue,
                    element: issue.element,
                    impact: 'Form may be difficult or impossible to use with assistive technology',
                    solution: this.getFormSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Form accessibility test failed: ${error.message}`);
        }
    }

    async testFocusManagement(page, pageName) {
        try {
            const focusIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check for focus indicators
                const style = document.createElement('style');
                style.textContent = `
                    .focus-test:focus { outline: 2px solid blue; }
                `;
                document.head.appendChild(style);
                
                const focusableElements = document.querySelectorAll(
                    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
                );
                
                let elementsWithoutFocusIndicator = 0;
                
                focusableElements.forEach(el => {
                    el.classList.add('focus-test');
                    el.focus();
                    
                    const computedStyle = window.getComputedStyle(el, ':focus');
                    const outline = computedStyle.outline;
                    const outlineWidth = computedStyle.outlineWidth;
                    const boxShadow = computedStyle.boxShadow;
                    
                    if (outline === 'none' || outlineWidth === '0px') {
                        if (!boxShadow || boxShadow === 'none') {
                            elementsWithoutFocusIndicator++;
                        }
                    }
                    
                    el.classList.remove('focus-test');
                });
                
                document.head.removeChild(style);
                
                if (elementsWithoutFocusIndicator > 0) {
                    issues.push({
                        type: 'no-focus-indicator',
                        count: elementsWithoutFocusIndicator,
                        issue: 'Elements lack visible focus indicators'
                    });
                }
                
                // Check for proper focus order
                const firstFocusable = focusableElements[0];
                if (firstFocusable && firstFocusable.tagName !== 'A' && !firstFocusable.textContent.toLowerCase().includes('skip')) {
                    issues.push({
                        type: 'no-skip-link-first',
                        element: firstFocusable.tagName,
                        issue: 'First focusable element is not a skip link'
                    });
                }
                
                return issues;
            });

            focusIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '2.4.7',
                    severity: issue.type === 'no-focus-indicator' ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.element || `${issue.count} elements`,
                    impact: 'Keyboard users cannot see which element has focus',
                    solution: 'Add visible focus indicators using CSS :focus pseudo-class'
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Focus management test failed: ${error.message}`);
        }
    }

    async testARIAImplementation(page, pageName) {
        try {
            const ariaIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check for proper ARIA usage
                const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
                
                elementsWithAria.forEach(el => {
                    const role = el.getAttribute('role');
                    const ariaLabel = el.getAttribute('aria-label');
                    const ariaLabelledby = el.getAttribute('aria-labelledby');
                    const ariaDescribedby = el.getAttribute('aria-describedby');
                    
                    // Check for empty ARIA attributes
                    if (ariaLabel === '') {
                        issues.push({
                            type: 'empty-aria-label',
                            element: el.tagName,
                            issue: 'Empty aria-label attribute'
                        });
                    }
                    
                    // Check for invalid ARIA references
                    if (ariaLabelledby) {
                        const ids = ariaLabelledby.split(' ');
                        ids.forEach(id => {
                            if (!document.getElementById(id)) {
                                issues.push({
                                    type: 'invalid-aria-reference',
                                    element: el.tagName,
                                    issue: `aria-labelledby references non-existent ID: ${id}`
                                });
                            }
                        });
                    }
                    
                    if (ariaDescribedby) {
                        const ids = ariaDescribedby.split(' ');
                        ids.forEach(id => {
                            if (!document.getElementById(id)) {
                                issues.push({
                                    type: 'invalid-aria-reference',
                                    element: el.tagName,
                                    issue: `aria-describedby references non-existent ID: ${id}`
                                });
                            }
                        });
                    }
                });
                
                // Check for interactive elements without proper roles
                const buttons = document.querySelectorAll('div[onclick], span[onclick]');
                buttons.forEach(btn => {
                    if (!btn.getAttribute('role') && !btn.getAttribute('tabindex')) {
                        issues.push({
                            type: 'missing-button-role',
                            element: btn.tagName,
                            issue: 'Interactive element missing role and tabindex'
                        });
                    }
                });
                
                // Check for proper heading structure with ARIA
                const ariaHeadings = document.querySelectorAll('[role="heading"]');
                ariaHeadings.forEach(heading => {
                    if (!heading.getAttribute('aria-level')) {
                        issues.push({
                            type: 'missing-aria-level',
                            element: heading.tagName,
                            issue: 'Heading role without aria-level'
                        });
                    }
                });
                
                return issues;
            });

            ariaIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '4.1.2',
                    severity: issue.type.includes('invalid') ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.element,
                    impact: 'Assistive technology may not function correctly',
                    solution: this.getARIASolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  ARIA implementation test failed: ${error.message}`);
        }
    }

    async testTextAccessibility(page, pageName) {
        try {
            const textIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check text size and spacing
                const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
                
                textElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const fontSize = parseFloat(style.fontSize);
                    const lineHeight = parseFloat(style.lineHeight);
                    
                    if (fontSize < 12) {
                        issues.push({
                            type: 'small-text',
                            element: el.tagName,
                            size: fontSize,
                            issue: 'Text size too small'
                        });
                    }
                    
                    if (lineHeight && lineHeight < fontSize * 1.2) {
                        issues.push({
                            type: 'insufficient-line-height',
                            element: el.tagName,
                            lineHeight: lineHeight,
                            issue: 'Insufficient line height'
                        });
                    }
                });
                
                // Check for justified text
                const justifiedText = Array.from(textElements).filter(el => 
                    window.getComputedStyle(el).textAlign === 'justify'
                );
                
                if (justifiedText.length > 0) {
                    issues.push({
                        type: 'justified-text',
                        count: justifiedText.length,
                        issue: 'Justified text can be difficult to read'
                    });
                }
                
                // Check for low contrast text
                const lowContrastElements = Array.from(textElements).filter(el => {
                    const style = window.getComputedStyle(el);
                    const opacity = parseFloat(style.opacity);
                    return opacity < 0.7;
                });
                
                if (lowContrastElements.length > 0) {
                    issues.push({
                        type: 'low-opacity-text',
                        count: lowContrastElements.length,
                        issue: 'Text with low opacity may be hard to read'
                    });
                }
                
                return issues;
            });

            textIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '1.4.12',
                    severity: issue.type === 'small-text' ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.element || `${issue.count} elements`,
                    impact: 'Text may be difficult to read for users with visual impairments',
                    solution: this.getTextSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Text accessibility test failed: ${error.message}`);
        }
    }

    async testInteractiveElements(page, pageName) {
        try {
            const interactiveIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check touch target sizes
                const interactive = document.querySelectorAll('button, a, input, [role="button"], [onclick]');
                
                interactive.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const minSize = 44; // WCAG recommended minimum
                    
                    if (rect.width < minSize || rect.height < minSize) {
                        issues.push({
                            type: 'small-touch-target',
                            element: el.tagName,
                            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
                            issue: 'Touch target smaller than 44x44 pixels'
                        });
                    }
                });
                
                // Check for accessible names
                const buttons = document.querySelectorAll('button, [role="button"]');
                buttons.forEach(btn => {
                    const text = btn.textContent.trim();
                    const ariaLabel = btn.getAttribute('aria-label');
                    const ariaLabelledby = btn.getAttribute('aria-labelledby');
                    
                    if (!text && !ariaLabel && !ariaLabelledby) {
                        issues.push({
                            type: 'button-no-name',
                            element: btn.tagName,
                            issue: 'Button has no accessible name'
                        });
                    }
                });
                
                // Check links
                const links = document.querySelectorAll('a[href]');
                links.forEach(link => {
                    const text = link.textContent.trim();
                    const ariaLabel = link.getAttribute('aria-label');
                    
                    if (!text && !ariaLabel) {
                        issues.push({
                            type: 'link-no-name',
                            element: 'A',
                            issue: 'Link has no accessible name'
                        });
                    }
                    
                    if (text && (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more' || text.toLowerCase() === 'more')) {
                        issues.push({
                            type: 'vague-link-text',
                            element: 'A',
                            text: text,
                            issue: 'Link text is not descriptive'
                        });
                    }
                });
                
                return issues;
            });

            interactiveIssues.forEach(issue => {
                const guideline = issue.type.includes('touch-target') ? '2.5.5' : '2.4.4';
                this.addViolation(pageName, {
                    guideline,
                    severity: issue.type === 'small-touch-target' ? 'moderate' : 'serious',
                    description: issue.issue,
                    element: issue.element + (issue.size ? ` (${issue.size})` : ''),
                    impact: 'Interactive elements may be difficult to use',
                    solution: this.getInteractiveSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Interactive elements test failed: ${error.message}`);
        }
    }

    async testScreenReaderCompatibility(page, pageName) {
        try {
            const srIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check for screen reader only content
                const srOnlyElements = document.querySelectorAll('.sr-only, .screen-reader-only, .visually-hidden');
                if (srOnlyElements.length === 0) {
                    const hasSkipLink = document.querySelector('a[href^="#"]');
                    if (!hasSkipLink) {
                        issues.push({
                            type: 'no-sr-helpers',
                            issue: 'No screen reader helper text found'
                        });
                    }
                }
                
                // Check for proper table structure
                const tables = document.querySelectorAll('table');
                tables.forEach(table => {
                    const hasCaption = table.querySelector('caption');
                    const hasHeaders = table.querySelector('th');
                    
                    if (!hasCaption) {
                        issues.push({
                            type: 'table-no-caption',
                            element: 'TABLE',
                            issue: 'Table missing caption'
                        });
                    }
                    
                    if (!hasHeaders) {
                        issues.push({
                            type: 'table-no-headers',
                            element: 'TABLE',
                            issue: 'Table missing header cells'
                        });
                    }
                });
                
                // Check for lists markup
                const listLikeElements = document.querySelectorAll('div, span');
                let suspiciousLists = 0;
                
                listLikeElements.forEach(el => {
                    const text = el.textContent;
                    if ((text.match(/^\s*[\u2022\u2023\u25E6\u2043\u2219]\s/m) || // bullet characters
                         text.match(/^\s*\d+\.\s/m)) && // numbered lists
                        !el.closest('ul, ol, li')) {
                        suspiciousLists++;
                    }
                });
                
                if (suspiciousLists > 0) {
                    issues.push({
                        type: 'improper-list-markup',
                        count: suspiciousLists,
                        issue: 'List-like content not using proper list markup'
                    });
                }
                
                return issues;
            });

            srIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '1.3.1',
                    severity: 'moderate',
                    description: issue.issue,
                    element: issue.element || `${issue.count} elements`,
                    impact: 'Screen reader users may miss important content structure',
                    solution: this.getScreenReaderSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Screen reader compatibility test failed: ${error.message}`);
        }
    }

    async testMobileAccessibility(page, pageName) {
        try {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mobileIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check if content reflows properly
                const horizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
                if (horizontalScroll) {
                    issues.push({
                        type: 'horizontal-scroll',
                        issue: 'Content causes horizontal scrolling on mobile'
                    });
                }
                
                // Check for zoom accessibility
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    const content = viewport.getAttribute('content');
                    if (content.includes('user-scalable=no') || content.includes('maximum-scale=1')) {
                        issues.push({
                            type: 'zoom-disabled',
                            issue: 'User zoom is disabled'
                        });
                    }
                }
                
                // Check touch target spacing
                const interactive = document.querySelectorAll('button, a, input, [role="button"]');
                const overlapping = [];
                
                for (let i = 0; i < interactive.length; i++) {
                    const rect1 = interactive[i].getBoundingClientRect();
                    for (let j = i + 1; j < interactive.length; j++) {
                        const rect2 = interactive[j].getBoundingClientRect();
                        
                        const distance = Math.sqrt(
                            Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2)
                        );
                        
                        if (distance < 8) { // Too close
                            overlapping.push(`${interactive[i].tagName} and ${interactive[j].tagName}`);
                        }
                    }
                }
                
                if (overlapping.length > 0) {
                    issues.push({
                        type: 'touch-targets-close',
                        count: overlapping.length,
                        issue: 'Touch targets too close together'
                    });
                }
                
                return issues;
            });

            mobileIssues.forEach(issue => {
                this.addViolation(pageName, {
                    guideline: '1.4.10',
                    severity: issue.type === 'zoom-disabled' ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.count ? `${issue.count} pairs` : 'Mobile viewport',
                    impact: 'Mobile users may have difficulty accessing content',
                    solution: this.getMobileSolution(issue.type)
                });
            });

            // Reset viewport
            await page.setViewportSize({ width: 1280, height: 720 });

        } catch (error) {
            console.log(`   ⚠️  Mobile accessibility test failed: ${error.message}`);
        }
    }

    async testMediaAccessibility(page, pageName) {
        try {
            const mediaIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check videos
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    const hasControls = video.hasAttribute('controls');
                    const hasTrack = video.querySelector('track');
                    const hasAutoplay = video.hasAttribute('autoplay');
                    
                    if (!hasControls) {
                        issues.push({
                            type: 'video-no-controls',
                            element: 'VIDEO',
                            issue: 'Video missing controls'
                        });
                    }
                    
                    if (!hasTrack) {
                        issues.push({
                            type: 'video-no-captions',
                            element: 'VIDEO',
                            issue: 'Video missing captions track'
                        });
                    }
                    
                    if (hasAutoplay) {
                        issues.push({
                            type: 'video-autoplay',
                            element: 'VIDEO',
                            issue: 'Video autoplays (may cause seizures)'
                        });
                    }
                });
                
                // Check audio
                const audios = document.querySelectorAll('audio');
                audios.forEach(audio => {
                    const hasControls = audio.hasAttribute('controls');
                    const hasAutoplay = audio.hasAttribute('autoplay');
                    
                    if (!hasControls) {
                        issues.push({
                            type: 'audio-no-controls',
                            element: 'AUDIO',
                            issue: 'Audio missing controls'
                        });
                    }
                    
                    if (hasAutoplay) {
                        issues.push({
                            type: 'audio-autoplay',
                            element: 'AUDIO',
                            issue: 'Audio autoplays'
                        });
                    }
                });
                
                return issues;
            });

            mediaIssues.forEach(issue => {
                const guideline = issue.type.includes('autoplay') ? '2.2.2' : '1.2.1';
                this.addViolation(pageName, {
                    guideline,
                    severity: issue.type.includes('autoplay') ? 'serious' : 'moderate',
                    description: issue.issue,
                    element: issue.element,
                    impact: 'Media content may be inaccessible to users with disabilities',
                    solution: this.getMediaSolution(issue.type)
                });
            });

        } catch (error) {
            console.log(`   ⚠️  Media accessibility test failed: ${error.message}`);
        }
    }

    getSeverity(guideline) {
        const level = this.wcagGuidelines[guideline]?.level || 'A';
        switch (level) {
            case 'A': return 'serious';
            case 'AA': return 'moderate';
            case 'AAA': return 'minor';
            default: return 'moderate';
        }
    }

    getSolution(guideline, issue) {
        const solutions = {
            '2.4.2': 'Add a descriptive page title',
            '3.1.1': 'Add lang attribute to <html> element',
            '1.3.1': 'Use proper heading hierarchy and semantic markup',
            '2.4.1': 'Add a "skip to main content" link',
            '2.1.2': 'Ensure all focusable elements can be unfocused',
            '2.4.3': 'Use logical tab order and avoid positive tabindex values'
        };
        return solutions[guideline] || 'Review and fix accessibility issue';
    }

    getImageSolution(type) {
        const solutions = {
            'missing-alt': 'Add alt attribute with descriptive text',
            'empty-alt-no-role': 'Add role="presentation" for decorative images',
            'redundant-alt': 'Remove redundant words like "image" from alt text',
            'bg-image-no-alt': 'Add aria-label for background images with meaning'
        };
        return solutions[type] || 'Fix image accessibility';
    }

    getFormSolution(type) {
        const solutions = {
            'missing-label': 'Add proper label element or aria-label',
            'placeholder-only': 'Use label element instead of relying on placeholder',
            'missing-fieldset': 'Group related form controls in fieldset',
            'required-not-indicated': 'Add visual and programmatic indication for required fields'
        };
        return solutions[type] || 'Fix form accessibility';
    }

    getARIASolution(type) {
        const solutions = {
            'empty-aria-label': 'Provide meaningful aria-label text',
            'invalid-aria-reference': 'Ensure referenced IDs exist in the document',
            'missing-button-role': 'Add role="button" and tabindex="0"',
            'missing-aria-level': 'Add aria-level attribute to heading roles'
        };
        return solutions[type] || 'Fix ARIA implementation';
    }

    getTextSolution(type) {
        const solutions = {
            'small-text': 'Increase font size to at least 12px',
            'insufficient-line-height': 'Set line-height to at least 1.2em',
            'justified-text': 'Use left-aligned text instead of justified',
            'low-opacity-text': 'Increase text opacity for better readability'
        };
        return solutions[type] || 'Fix text accessibility';
    }

    getInteractiveSolution(type) {
        const solutions = {
            'small-touch-target': 'Increase button size to at least 44x44 pixels',
            'button-no-name': 'Add descriptive text or aria-label',
            'link-no-name': 'Add descriptive link text or aria-label',
            'vague-link-text': 'Use descriptive link text that explains the destination'
        };
        return solutions[type] || 'Fix interactive element accessibility';
    }

    getScreenReaderSolution(type) {
        const solutions = {
            'no-sr-helpers': 'Add screen reader helper text and skip links',
            'table-no-caption': 'Add caption element to describe table purpose',
            'table-no-headers': 'Use th elements for table headers',
            'improper-list-markup': 'Use proper ul/ol and li elements for lists'
        };
        return solutions[type] || 'Fix screen reader compatibility';
    }

    getMobileSolution(type) {
        const solutions = {
            'horizontal-scroll': 'Use responsive design to prevent horizontal scroll',
            'zoom-disabled': 'Remove user-scalable=no from viewport meta tag',
            'touch-targets-close': 'Increase spacing between touch targets'
        };
        return solutions[type] || 'Fix mobile accessibility';
    }

    getMediaSolution(type) {
        const solutions = {
            'video-no-controls': 'Add controls attribute to video element',
            'video-no-captions': 'Add track element with captions',
            'video-autoplay': 'Remove autoplay or add user controls',
            'audio-no-controls': 'Add controls attribute to audio element',
            'audio-autoplay': 'Remove autoplay from audio elements'
        };
        return solutions[type] || 'Fix media accessibility';
    }

    addViolation(pageName, violation) {
        this.results.pages[pageName].violations.push(violation);
        this.results.pages[pageName].summary[violation.severity]++;
        this.results.summary[violation.severity]++;
        this.results.summary.totalViolations++;

        const severityEmoji = {
            'critical': '🚨',
            'serious': '🔴',
            'moderate': '🟠',
            'minor': '🟡'
        };

        console.log(`   ${severityEmoji[violation.severity]} ${violation.severity.toUpperCase()}: ${violation.description}`);
    }

    calculatePageScore(pageName) {
        const pageData = this.results.pages[pageName];
        const weights = { critical: 25, serious: 15, moderate: 8, minor: 3 };
        
        const deductions = 
            pageData.summary.critical * weights.critical +
            pageData.summary.serious * weights.serious +
            pageData.summary.moderate * weights.moderate +
            pageData.summary.minor * weights.minor;
        
        pageData.score = Math.max(0, 100 - deductions);
    }

    async generateAccessibilityReport() {
        console.log('\n♿ ACCESSIBILITY COMPLIANCE SUMMARY');
        console.log('═'.repeat(60));
        
        // Calculate overall score
        const pageScores = Object.values(this.results.pages).map(p => p.score);
        const overallScore = pageScores.length > 0 ? 
            pageScores.reduce((a, b) => a + b, 0) / pageScores.length : 0;
        
        this.results.summary.complianceScore = overallScore;

        console.log(`📊 Overall Compliance Score: ${overallScore.toFixed(1)}/100`);
        console.log(`🚨 Critical: ${this.results.summary.critical}`);
        console.log(`🔴 Serious: ${this.results.summary.serious}`);
        console.log(`🟠 Moderate: ${this.results.summary.moderate}`);
        console.log(`🟡 Minor: ${this.results.summary.minor}`);
        console.log(`\n📋 Total Issues: ${this.results.summary.totalViolations}`);

        // Page breakdown
        console.log('\n📄 Page Breakdown:');
        console.log('─'.repeat(40));
        Object.entries(this.results.pages).forEach(([page, data]) => {
            console.log(`   ${page}: ${data.score.toFixed(1)}/100 (${data.violations.length} issues)`);
        });

        // WCAG compliance level
        let complianceLevel = 'Non-compliant';
        if (overallScore >= 95 && this.results.summary.critical === 0) {
            complianceLevel = 'WCAG 2.1 AA Compliant';
        } else if (overallScore >= 80 && this.results.summary.critical === 0) {
            complianceLevel = 'Mostly Compliant';
        } else if (overallScore >= 60) {
            complianceLevel = 'Partially Compliant';
        }

        console.log(`\n🏆 Compliance Level: ${complianceLevel}`);

        // Save detailed report
        const reportPath = './test-screenshots/accessibility-deep-scan-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        this.generateAccessibilityActionPlan();
    }

    generateAccessibilityActionPlan() {
        console.log('\n🎯 ACCESSIBILITY ACTION PLAN');
        console.log('═'.repeat(60));

        if (this.results.summary.critical > 0) {
            console.log('🚨 IMMEDIATE ACTION REQUIRED (Critical Issues):');
            const criticalIssues = [];
            Object.values(this.results.pages).forEach(page => {
                page.violations.filter(v => v.severity === 'critical').forEach(v => {
                    if (!criticalIssues.some(i => i.description === v.description)) {
                        criticalIssues.push(v);
                    }
                });
            });
            criticalIssues.slice(0, 3).forEach(issue => {
                console.log(`   • ${issue.description}`);
                console.log(`     Solution: ${issue.solution}`);
            });
        }

        if (this.results.summary.serious > 0) {
            console.log('\n🔴 HIGH PRIORITY (Serious Issues):');
            console.log('   • Focus on keyboard navigation and screen reader compatibility');
            console.log('   • Fix missing form labels and alt text');
            console.log('   • Improve color contrast ratios');
        }

        if (this.results.summary.moderate > 0) {
            console.log('\n🟠 MEDIUM PRIORITY (Moderate Issues):');
            console.log('   • Enhance ARIA implementation');
            console.log('   • Improve text spacing and sizing');
            console.log('   • Fix minor navigation issues');
        }

        console.log('\n💡 RECOMMENDED NEXT STEPS:');
        console.log('   1. Install automated accessibility testing tools');
        console.log('   2. Conduct user testing with disabled users');
        console.log('   3. Implement accessibility code review process');
        console.log('   4. Train development team on WCAG guidelines');
        console.log('   5. Regular accessibility audits');

        if (this.results.summary.complianceScore < 70) {
            console.log('\n⚠️  URGENT: Low accessibility score detected!');
            console.log('   • Consider accessibility consulting services');
            console.log('   • Implement comprehensive accessibility strategy');
            console.log('   • Review design system for accessibility');
        }
    }
}

// Run the accessibility deep scan
async function runAccessibilityScan() {
    const scanner = new AccessibilityDeepScanner();
    await scanner.runAccessibilityScan();
}

if (require.main === module) {
    runAccessibilityScan().catch(console.error);
}

module.exports = AccessibilityDeepScanner;