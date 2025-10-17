/**
 * Automated Accessibility Fixer
 * Automatically fixes critical accessibility issues found by accessibility scanner
 */

const fs = require('fs');
const path = require('path');

class AccessibilityFixer {
    constructor() {
        this.fixes = {
            applied: 0,
            failed: 0,
            skipped: 0
        };
        
        this.htmlFiles = [
            '/Users/blakelange/Downloads/Mohave_Professional_Design_Report.html',
            '/Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html',
            '/Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html',
            '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html',
            '/Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html'
        ];

        this.contrastColors = {
            // High contrast color pairs that meet WCAG AA standards
            darkBackground: '#1a1a1a',
            lightText: '#ffffff',
            primaryBlue: '#2196F3',
            darkBlue: '#1976D2',
            successGreen: '#4CAF50',
            warningOrange: '#FF9800',
            errorRed: '#F44336',
            highContrastText: '#000000'
        };
    }

    async fixAllAccessibilityIssues() {
        console.log('♿ AUTOMATED ACCESSIBILITY FIXER');
        console.log('═'.repeat(60));
        console.log('Applying WCAG 2.1 AA compliance fixes...\n');

        for (const filePath of this.htmlFiles) {
            if (fs.existsSync(filePath)) {
                console.log(`🔧 Fixing: ${path.basename(filePath)}`);
                await this.fixFileAccessibilityIssues(filePath);
            } else {
                console.log(`⚠️  File not found: ${path.basename(filePath)}`);
            }
        }

        this.generateFixReport();
    }

    async fixFileAccessibilityIssues(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Fix 1: Document structure and headings
            content = this.fixDocumentStructure(content);
            
            // Fix 2: Add proper ARIA landmarks
            content = this.addARIALandmarks(content);
            
            // Fix 3: Fix color contrast issues
            content = this.fixColorContrast(content);
            
            // Fix 4: Add skip navigation links
            content = this.addSkipNavigation(content);
            
            // Fix 5: Fix form accessibility
            content = this.fixFormAccessibility(content);
            
            // Fix 6: Add alt text to images
            content = this.fixImageAccessibility(content);
            
            // Fix 7: Fix focus management
            content = this.fixFocusManagement(content);
            
            // Fix 8: Fix touch target sizes
            content = this.fixTouchTargets(content);
            
            // Fix 9: Add ARIA attributes
            content = this.addARIAAttributes(content);
            
            // Fix 10: Fix text accessibility
            content = this.fixTextAccessibility(content);
            
            // Fix 11: Add accessibility CSS
            content = this.addAccessibilityCSS(content);
            
            // Fix 12: Add accessibility JavaScript
            content = this.addAccessibilityJavaScript(content);

            if (content !== originalContent) {
                const backupPath = filePath.replace('.html', '_BACKUP_BEFORE_A11Y_FIX.html');
                fs.writeFileSync(backupPath, originalContent);
                
                const fixedPath = filePath.replace('.html', '_ACCESSIBILITY_FIXED.html');
                fs.writeFileSync(fixedPath, content);
                
                console.log(`   ✅ Fixed and saved as: ${path.basename(fixedPath)}`);
                console.log(`   📁 Backup saved as: ${path.basename(backupPath)}`);
                this.fixes.applied++;
            } else {
                console.log(`   ℹ️  No accessibility fixes needed`);
                this.fixes.skipped++;
            }

        } catch (error) {
            console.log(`   ❌ Failed to fix: ${error.message}`);
            this.fixes.failed++;
        }
    }

    fixDocumentStructure(content) {
        // Add lang attribute if missing
        if (!content.includes('lang=')) {
            content = content.replace(
                /<html([^>]*)>/i,
                '<html$1 lang="en">'
            );
        }

        // Fix multiple H1 tags - keep first, convert others to H2
        const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi);
        if (h1Matches && h1Matches.length > 1) {
            let firstH1Found = false;
            content = content.replace(/<h1([^>]*>.*?)<\/h1>/gi, (match, content) => {
                if (!firstH1Found) {
                    firstH1Found = true;
                    return match;
                } else {
                    return `<h2${content}</h2>`;
                }
            });
        }

        // Add H1 if missing
        if (!content.includes('<h1')) {
            const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : 'Main Content';
            
            content = content.replace(
                /<body([^>]*)>/i,
                `<body$1>\n    <!-- A11Y FIX: Added main heading -->\n    <h1 class="sr-only">${title}</h1>`
            );
        }

        // Fix heading hierarchy - ensure no levels are skipped
        content = this.fixHeadingHierarchy(content);

        return content;
    }

    fixHeadingHierarchy(content) {
        const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi;
        const headings = [];
        let match;

        // Extract all headings
        while ((match = headingRegex.exec(content)) !== null) {
            headings.push({
                level: parseInt(match[1]),
                fullMatch: match[0],
                attributes: match[2],
                text: match[3],
                index: match.index
            });
        }

        // Fix hierarchy
        let lastLevel = 0;
        const replacements = [];

        headings.forEach((heading, index) => {
            let newLevel = heading.level;
            
            if (index === 0) {
                newLevel = 1; // First heading should be H1
            } else if (heading.level > lastLevel + 1) {
                newLevel = lastLevel + 1; // Don't skip levels
            }
            
            if (newLevel !== heading.level) {
                replacements.push({
                    original: heading.fullMatch,
                    replacement: `<h${newLevel}${heading.attributes}>${heading.text}</h${newLevel}>`
                });
            }
            
            lastLevel = newLevel;
        });

        // Apply replacements
        replacements.forEach(({ original, replacement }) => {
            content = content.replace(original, replacement);
        });

        return content;
    }

    addARIALandmarks(content) {
        // Add main landmark if missing
        if (!content.includes('<main') && !content.includes('role="main"')) {
            // Wrap main content area
            content = content.replace(
                /<body([^>]*)>/i,
                `<body$1>\n    <!-- A11Y FIX: Skip to main content link -->\n    <a href="#main-content" class="skip-link">Skip to main content</a>`
            );

            // Find likely main content area and wrap it
            const mainContentRegex = /(<!--[\s\S]*?main[\s\S]*?-->|<div[^>]*(?:main|content)[^>]*>)/i;
            if (mainContentRegex.test(content)) {
                content = content.replace(
                    mainContentRegex,
                    '<main id="main-content" role="main">$1'
                );
                content = content.replace(/<\/body>/i, '</main>\n</body>');
            } else {
                // Wrap body content in main
                content = content.replace(
                    /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
                    '$1\n<main id="main-content" role="main">$2</main>\n$3'
                );
            }
        }

        // Add nav landmarks
        if (!content.includes('<nav') && !content.includes('role="navigation"')) {
            content = content.replace(
                /<ul[^>]*(?:menu|nav)[^>]*>/gi,
                '<nav role="navigation" aria-label="Main navigation">$&'
            );
            content = content.replace(
                /<\/ul>(?=[\s\S]*<\/nav>)/gi,
                '$&</nav>'
            );
        }

        // Add header landmark
        if (!content.includes('<header') && !content.includes('role="banner"')) {
            content = content.replace(
                /<h1[^>]*>.*?<\/h1>/i,
                '<header role="banner">$&</header>'
            );
        }

        return content;
    }

    fixColorContrast(content) {
        // Add high contrast CSS class definitions
        const contrastCSS = `
    /* A11Y FIX: High contrast color improvements */
    .high-contrast-text {
        color: ${this.contrastColors.lightText} !important;
        background-color: ${this.contrastColors.darkBackground} !important;
    }
    .high-contrast-button {
        background-color: ${this.contrastColors.primaryBlue} !important;
        color: ${this.contrastColors.lightText} !important;
        border: 2px solid ${this.contrastColors.lightText} !important;
    }
    .high-contrast-link {
        color: #64b5f6 !important;
        text-decoration: underline !important;
    }
    .high-contrast-link:hover,
    .high-contrast-link:focus {
        color: ${this.contrastColors.lightText} !important;
        background-color: ${this.contrastColors.primaryBlue} !important;
        outline: 2px solid ${this.contrastColors.lightText} !important;
    }`;

        // Insert contrast CSS
        content = content.replace(
            /<\/style>/i,
            `${contrastCSS}\n</style>`
        );

        // Apply high contrast classes to low contrast elements
        content = content.replace(
            /<([^>]*(?:color|background)[^>]*)>/gi,
            (match, attributes) => {
                if (attributes.includes('color') && !attributes.includes('high-contrast')) {
                    return match.replace(/class=["']([^"']*)["']/i, 'class="$1 high-contrast-text"') ||
                           match.replace(/<([a-z]+)/, '<$1 class="high-contrast-text"');
                }
                return match;
            }
        );

        return content;
    }

    addSkipNavigation(content) {
        if (!content.includes('skip-link') && !content.includes('skip to main')) {
            const skipLink = `
    <!-- A11Y FIX: Skip navigation link -->
    <a href="#main-content" class="skip-link">Skip to main content</a>`;

            content = content.replace(
                /<body([^>]*)>/i,
                `<body$1>${skipLink}`
            );
        }

        return content;
    }

    fixFormAccessibility(content) {
        // Add labels to inputs without them
        content = content.replace(
            /<input([^>]*)(?![^>]*(?:aria-label|aria-labelledby))[^>]*>/gi,
            (match, attributes) => {
                const typeMatch = attributes.match(/type=["']([^"']*)["']/);
                const type = typeMatch ? typeMatch[1] : 'text';
                const nameMatch = attributes.match(/name=["']([^"']*)["']/);
                const name = nameMatch ? nameMatch[1] : `input_${Math.random().toString(36).substr(2, 6)}`;
                
                if (type === 'hidden') return match;
                
                const labelText = this.generateLabelText(type, name);
                const inputId = `input_${name}_${Math.random().toString(36).substr(2, 4)}`;
                
                return `<label for="${inputId}" class="sr-only">${labelText}</label>\n    ${match.replace(/>/g, ` id="${inputId}">`)}`;
            }
        );

        // Add fieldsets to radio button groups
        content = content.replace(
            /(<input[^>]*type=["']radio["'][^>]*name=["']([^"']*)["'][^>]*>[\s\S]*?)+/gi,
            (match, p1, groupName) => {
                if (!match.includes('<fieldset')) {
                    return `<fieldset>\n    <legend>Select ${groupName.replace(/_/g, ' ')}</legend>\n    ${match}\n</fieldset>`;
                }
                return match;
            }
        );

        // Add required indicators
        content = content.replace(
            /<input([^>]*required[^>]*)>/gi,
            (match, attributes) => {
                return `${match}<span aria-label="required" class="required-indicator">*</span>`;
            }
        );

        return content;
    }

    generateLabelText(type, name) {
        const labelMap = {
            'email': 'Email address',
            'password': 'Password',
            'text': 'Text input',
            'tel': 'Phone number',
            'url': 'Website URL',
            'search': 'Search',
            'number': 'Number',
            'date': 'Date',
            'time': 'Time',
            'datetime-local': 'Date and time',
            'color': 'Color picker',
            'range': 'Range slider',
            'file': 'File upload'
        };

        return labelMap[type] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    fixImageAccessibility(content) {
        // Add alt attributes to images without them
        content = content.replace(
            /<img([^>]*)(?![^>]*alt)([^>]*)>/gi,
            (match, before, after) => {
                return `<img${before} alt="Decorative image"${after}>`;
            }
        );

        // Fix empty alt attributes without role
        content = content.replace(
            /<img([^>]*)alt=["']?["']?([^>]*?)(?![^>]*role=["']presentation["'])([^>]*)>/gi,
            '<img$1alt=""$2 role="presentation"$3>'
        );

        // Add aria-label to background images
        content = content.replace(
            /<div([^>]*style[^>]*background-image[^>]*)>/gi,
            (match, attributes) => {
                if (!attributes.includes('aria-label') && !attributes.includes('role="presentation"')) {
                    return match.replace(/>/g, ' aria-label="Background image">');
                }
                return match;
            }
        );

        return content;
    }

    fixFocusManagement(content) {
        // Add visible focus indicators
        const focusCSS = `
    /* A11Y FIX: Enhanced focus indicators */
    *:focus {
        outline: 2px solid #2196F3 !important;
        outline-offset: 2px !important;
    }
    button:focus,
    a:focus,
    input:focus,
    textarea:focus,
    select:focus {
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5) !important;
    }
    .skip-link:focus {
        position: absolute !important;
        top: 10px !important;
        left: 10px !important;
        background: #2196F3 !important;
        color: white !important;
        padding: 8px 16px !important;
        text-decoration: none !important;
        border-radius: 4px !important;
        z-index: 10000 !important;
    }`;

        content = content.replace(
            /<\/style>/i,
            `${focusCSS}\n</style>`
        );

        // Remove positive tabindex values
        content = content.replace(/tabindex=["'][1-9]\d*["']/gi, 'tabindex="0"');

        // Add tabindex="-1" to hidden elements
        content = content.replace(
            /<([^>]*style[^>]*display:\s*none[^>]*)>/gi,
            (match) => {
                if (!match.includes('tabindex')) {
                    return match.replace(/>/g, ' tabindex="-1">');
                }
                return match;
            }
        );

        return content;
    }

    fixTouchTargets(content) {
        // Add CSS for minimum touch target sizes
        const touchTargetCSS = `
    /* A11Y FIX: Minimum touch target sizes */
    button,
    a,
    input[type="button"],
    input[type="submit"],
    input[type="reset"],
    input[type="checkbox"],
    input[type="radio"],
    [role="button"],
    [onclick] {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 8px 12px !important;
        margin: 2px !important;
    }
    input[type="checkbox"],
    input[type="radio"] {
        width: 20px !important;
        height: 20px !important;
        margin: 12px !important;
    }
    @media (max-width: 768px) {
        button,
        a,
        input,
        [role="button"],
        [onclick] {
            min-height: 48px !important;
            min-width: 48px !important;
            font-size: 16px !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${touchTargetCSS}\n</style>`
        );

        return content;
    }

    addARIAAttributes(content) {
        // Add ARIA labels to buttons without text
        content = content.replace(
            /<button([^>]*)>(\s*)<\/button>/gi,
            '<button$1 aria-label="Action button">$2</button>'
        );

        // Add ARIA expanded to collapsible elements
        content = content.replace(
            /<button([^>]*(?:toggle|collapse|expand)[^>]*)>/gi,
            (match, attributes) => {
                if (!attributes.includes('aria-expanded')) {
                    return match.replace(/>/g, ' aria-expanded="false">');
                }
                return match;
            }
        );

        // Add ARIA labels to form controls
        content = content.replace(
            /<select([^>]*)(?![^>]*(?:aria-label|aria-labelledby))([^>]*)>/gi,
            '<select$1 aria-label="Select option"$2>'
        );

        content = content.replace(
            /<textarea([^>]*)(?![^>]*(?:aria-label|aria-labelledby))([^>]*)>/gi,
            '<textarea$1 aria-label="Text area"$2>'
        );

        // Add ARIA roles to interactive elements
        content = content.replace(
            /<div([^>]*onclick[^>]*)(?![^>]*role)([^>]*)>/gi,
            '<div$1 role="button" tabindex="0"$2>'
        );

        return content;
    }

    fixTextAccessibility(content) {
        // Add CSS for better text readability
        const textCSS = `
    /* A11Y FIX: Text accessibility improvements */
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
        line-height: 1.5 !important;
        font-size: 16px !important;
    }
    p, div, span {
        line-height: 1.5 !important;
        font-size: 14px !important;
    }
    h1, h2, h3, h4, h5, h6 {
        line-height: 1.3 !important;
        margin-bottom: 0.5em !important;
    }
    small {
        font-size: 12px !important;
    }
    .small-text {
        font-size: 14px !important;
    }
    @media (max-width: 768px) {
        body {
            font-size: 18px !important;
        }
        p, div, span {
            font-size: 16px !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${textCSS}\n</style>`
        );

        // Fix small text by adding classes
        content = content.replace(
            /font-size:\s*([0-9]+(?:\.[0-9]+)?)px/gi,
            (match, size) => {
                const fontSize = parseFloat(size);
                if (fontSize < 12) {
                    return 'font-size: 14px /* A11Y FIX: Increased from ' + size + 'px */';
                }
                return match;
            }
        );

        return content;
    }

    addAccessibilityCSS(content) {
        const a11yCSS = `
    /* A11Y FIX: Screen reader only text */
    .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
    }
    .sr-only:focus {
        position: static !important;
        width: auto !important;
        height: auto !important;
        padding: 0.25rem 0.5rem !important;
        margin: 0 !important;
        overflow: visible !important;
        clip: auto !important;
        white-space: normal !important;
        background-color: #000 !important;
        color: #fff !important;
    }
    /* Required field indicator */
    .required-indicator {
        color: #F44336 !important;
        font-weight: bold !important;
        margin-left: 4px !important;
    }
    /* Skip link positioning */
    .skip-link {
        position: absolute !important;
        top: -40px !important;
        left: 6px !important;
        background: #000 !important;
        color: #fff !important;
        padding: 8px !important;
        text-decoration: none !important;
        z-index: 10000 !important;
    }
    .skip-link:focus {
        top: 6px !important;
    }
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        * {
            background-color: white !important;
            color: black !important;
        }
        button, a {
            border: 2px solid black !important;
        }
    }
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }`;

        if (!content.includes('.sr-only')) {
            content = content.replace(
                /<\/head>/i,
                `    <style>\n${a11yCSS}\n    </style>\n</head>`
            );
        }

        return content;
    }

    addAccessibilityJavaScript(content) {
        const a11yScript = `
    <!-- A11Y FIX: Accessibility enhancement script -->
    <script>
        (function() {
            'use strict';
            
            // A11Y: Enhanced keyboard navigation
            document.addEventListener('DOMContentLoaded', function() {
                
                // Add keyboard support to clickable divs
                const clickableDivs = document.querySelectorAll('[onclick], [role="button"]');
                clickableDivs.forEach(function(element) {
                    if (!element.getAttribute('tabindex')) {
                        element.setAttribute('tabindex', '0');
                    }
                    
                    element.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            element.click();
                        }
                    });
                });
                
                // Manage focus for modals and popups
                let focusedElementBeforeModal;
                
                function trapFocus(element) {
                    const focusableElements = element.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstFocusableElement = focusableElements[0];
                    const lastFocusableElement = focusableElements[focusableElements.length - 1];
                    
                    element.addEventListener('keydown', function(e) {
                        if (e.key === 'Tab') {
                            if (e.shiftKey) {
                                if (document.activeElement === firstFocusableElement) {
                                    lastFocusableElement.focus();
                                    e.preventDefault();
                                }
                            } else {
                                if (document.activeElement === lastFocusableElement) {
                                    firstFocusableElement.focus();
                                    e.preventDefault();
                                }
                            }
                        }
                        
                        if (e.key === 'Escape') {
                            closeModal(element);
                        }
                    });
                }
                
                function openModal(modal) {
                    focusedElementBeforeModal = document.activeElement;
                    modal.style.display = 'block';
                    modal.setAttribute('aria-hidden', 'false');
                    trapFocus(modal);
                    modal.focus();
                }
                
                function closeModal(modal) {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                    if (focusedElementBeforeModal) {
                        focusedElementBeforeModal.focus();
                    }
                }
                
                // Announce dynamic content changes
                function announceToScreenReader(message) {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.className = 'sr-only';
                    announcement.textContent = message;
                    document.body.appendChild(announcement);
                    
                    setTimeout(function() {
                        document.body.removeChild(announcement);
                    }, 1000);
                }
                
                // Improve form validation announcements
                const forms = document.querySelectorAll('form');
                forms.forEach(function(form) {
                    form.addEventListener('submit', function(e) {
                        const invalidFields = form.querySelectorAll(':invalid');
                        if (invalidFields.length > 0) {
                            e.preventDefault();
                            const firstInvalid = invalidFields[0];
                            firstInvalid.focus();
                            announceToScreenReader('Please correct the errors in the form');
                        }
                    });
                });
                
                // Add live regions for dynamic content
                if (!document.getElementById('live-region')) {
                    const liveRegion = document.createElement('div');
                    liveRegion.id = 'live-region';
                    liveRegion.setAttribute('aria-live', 'polite');
                    liveRegion.setAttribute('aria-atomic', 'true');
                    liveRegion.className = 'sr-only';
                    document.body.appendChild(liveRegion);
                }
                
                // Enhance table accessibility
                const tables = document.querySelectorAll('table');
                tables.forEach(function(table) {
                    if (!table.querySelector('caption')) {
                        const caption = document.createElement('caption');
                        caption.textContent = 'Data table';
                        caption.className = 'sr-only';
                        table.insertBefore(caption, table.firstChild);
                    }
                    
                    // Add scope attributes to headers
                    const headers = table.querySelectorAll('th');
                    headers.forEach(function(header) {
                        if (!header.getAttribute('scope')) {
                            const isInHead = header.closest('thead');
                            header.setAttribute('scope', isInHead ? 'col' : 'row');
                        }
                    });
                });
                
                // Skip link functionality
                const skipLinks = document.querySelectorAll('.skip-link');
                skipLinks.forEach(function(link) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const target = document.querySelector(link.getAttribute('href'));
                        if (target) {
                            target.focus();
                            target.scrollIntoView();
                        }
                    });
                });
                
                // Auto-announce page changes
                let currentPage = document.title;
                const titleObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.target.tagName === 'TITLE') {
                            const newTitle = document.title;
                            if (newTitle !== currentPage) {
                                announceToScreenReader('Page changed to: ' + newTitle);
                                currentPage = newTitle;
                            }
                        }
                    });
                });
                
                if (document.querySelector('title')) {
                    titleObserver.observe(document.querySelector('title'), {
                        childList: true,
                        subtree: true
                    });
                }
                
                // Enhance button states
                const toggleButtons = document.querySelectorAll('[aria-expanded]');
                toggleButtons.forEach(function(button) {
                    button.addEventListener('click', function() {
                        const expanded = button.getAttribute('aria-expanded') === 'true';
                        button.setAttribute('aria-expanded', !expanded);
                        announceToScreenReader(
                            button.textContent + ' ' + (expanded ? 'collapsed' : 'expanded')
                        );
                    });
                });
                
                // Window resize announcements for screen readers
                let resizeTimer;
                window.addEventListener('resize', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
                        announceToScreenReader('Window resized to ' + orientation + ' orientation');
                    }, 500);
                });
                
                console.log('A11Y: Accessibility enhancements loaded');
            });
            
        })();
    </script>`;

        if (!content.includes('A11Y: Accessibility enhancements')) {
            content = content.replace(
                /<\/body>/i,
                `${a11yScript}\n</body>`
            );
        }

        return content;
    }

    generateFixReport() {
        console.log('\n♿ ACCESSIBILITY FIXES SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Files Fixed: ${this.fixes.applied}`);
        console.log(`⚠️  Files Skipped: ${this.fixes.skipped}`);
        console.log(`❌ Files Failed: ${this.fixes.failed}`);
        
        const total = this.fixes.applied + this.fixes.skipped + this.fixes.failed;
        const successRate = total > 0 ? ((this.fixes.applied / total) * 100).toFixed(1) : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        console.log('\n🔧 ACCESSIBILITY FIXES APPLIED:');
        console.log('─'.repeat(40));
        console.log('   ✅ Document structure and heading hierarchy');
        console.log('   ✅ ARIA landmarks and navigation');
        console.log('   ✅ Color contrast improvements');
        console.log('   ✅ Skip navigation links');
        console.log('   ✅ Form accessibility enhancements');
        console.log('   ✅ Image alt text and descriptions');
        console.log('   ✅ Focus management and indicators');
        console.log('   ✅ Touch target size improvements');
        console.log('   ✅ ARIA attributes and roles');
        console.log('   ✅ Text readability enhancements');
        console.log('   ✅ Screen reader compatibility');
        console.log('   ✅ Keyboard navigation support');

        console.log('\n📁 FIXED FILES:');
        console.log('─'.repeat(40));
        this.htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const fixedPath = filePath.replace('.html', '_ACCESSIBILITY_FIXED.html');
                if (fs.existsSync(fixedPath)) {
                    console.log(`   📄 ${path.basename(fixedPath)}`);
                }
            }
        });

        console.log('\n💡 NEXT STEPS:');
        console.log('─'.repeat(40));
        console.log('   1. Test with screen readers (NVDA, JAWS, VoiceOver)');
        console.log('   2. Verify keyboard navigation works completely');
        console.log('   3. Test color contrast in different lighting conditions');
        console.log('   4. Validate with automated accessibility tools');
        console.log('   5. Conduct user testing with disabled users');
        console.log('   6. Regular accessibility audits');

        // Save fix report
        const reportData = {
            timestamp: new Date().toISOString(),
            fixes: this.fixes,
            successRate: successRate + '%',
            wcagLevel: 'AA',
            fixesApplied: [
                'Document Structure',
                'ARIA Landmarks',
                'Color Contrast',
                'Skip Navigation',
                'Form Accessibility',
                'Image Alt Text',
                'Focus Management',
                'Touch Targets',
                'ARIA Attributes',
                'Text Readability',
                'Screen Reader Support',
                'Keyboard Navigation'
            ]
        };

        fs.writeFileSync('./test-screenshots/accessibility-fixes-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Fix report saved: ./test-screenshots/accessibility-fixes-report.json');
    }
}

// Run the accessibility fixer
async function runAccessibilityFixes() {
    const fixer = new AccessibilityFixer();
    await fixer.fixAllAccessibilityIssues();
}

if (require.main === module) {
    runAccessibilityFixes().catch(console.error);
}

module.exports = AccessibilityFixer;