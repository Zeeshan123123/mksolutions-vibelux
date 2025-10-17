/**
 * Mobile Responsiveness Auto-Fixer
 * Automatically fixes mobile compatibility issues found in testing
 */

const fs = require('fs');
const path = require('path');

class MobileResponsivenessFixer {
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

        this.breakpoints = {
            mobile: '768px',
            tablet: '1024px',
            desktop: '1200px'
        };
    }

    async fixAllMobileIssues() {
        console.log('📱 MOBILE RESPONSIVENESS AUTO-FIXER');
        console.log('═'.repeat(60));
        console.log('Fixing mobile compatibility and responsiveness issues...\n');

        for (const filePath of this.htmlFiles) {
            if (fs.existsSync(filePath)) {
                console.log(`🔧 Fixing: ${path.basename(filePath)}`);
                await this.fixFileMobileIssues(filePath);
            } else {
                console.log(`⚠️  File not found: ${path.basename(filePath)}`);
            }
        }

        this.generateFixReport();
    }

    async fixFileMobileIssues(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Fix 1: Add proper viewport meta tag
            content = this.fixViewportMeta(content);
            
            // Fix 2: Fix horizontal scrolling
            content = this.fixHorizontalScrolling(content);
            
            // Fix 3: Fix touch target sizes
            content = this.fixTouchTargetSizes(content);
            
            // Fix 4: Add responsive typography
            content = this.addResponsiveTypography(content);
            
            // Fix 5: Fix responsive images
            content = this.fixResponsiveImages(content);
            
            // Fix 6: Add responsive navigation
            content = this.addResponsiveNavigation(content);
            
            // Fix 7: Fix responsive tables
            content = this.fixResponsiveTables(content);
            
            // Fix 8: Add mobile-first CSS
            content = this.addMobileFirstCSS(content);
            
            // Fix 9: Fix responsive forms
            content = this.fixResponsiveForms(content);
            
            // Fix 10: Add mobile-specific JavaScript
            content = this.addMobileJavaScript(content);

            if (content !== originalContent) {
                const backupPath = filePath.replace('.html', '_BACKUP_BEFORE_MOBILE_FIX.html');
                fs.writeFileSync(backupPath, originalContent);
                
                const fixedPath = filePath.replace('.html', '_MOBILE_FIXED.html');
                fs.writeFileSync(fixedPath, content);
                
                console.log(`   ✅ Fixed and saved as: ${path.basename(fixedPath)}`);
                console.log(`   📁 Backup saved as: ${path.basename(backupPath)}`);
                this.fixes.applied++;
            } else {
                console.log(`   ℹ️  No mobile fixes needed`);
                this.fixes.skipped++;
            }

        } catch (error) {
            console.log(`   ❌ Failed to fix: ${error.message}`);
            this.fixes.failed++;
        }
    }

    fixViewportMeta(content) {
        // Check if viewport meta tag exists and is correct
        const viewportRegex = /<meta[^>]*name=["']viewport["'][^>]*>/i;
        const badViewportRegex = /(user-scalable=no|maximum-scale=1)/i;
        
        if (viewportRegex.test(content)) {
            // Fix bad viewport settings
            if (badViewportRegex.test(content)) {
                content = content.replace(
                    viewportRegex,
                    '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">'
                );
            }
        } else {
            // Add proper viewport meta tag
            content = content.replace(
                /<head>/i,
                `<head>\n    <!-- MOBILE FIX: Proper viewport meta tag -->\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">`
            );
        }

        return content;
    }

    fixHorizontalScrolling(content) {
        const horizontalScrollFix = `
    /* MOBILE FIX: Prevent horizontal scrolling */
    * {
        box-sizing: border-box !important;
    }
    
    html, body {
        max-width: 100% !important;
        overflow-x: hidden !important;
    }
    
    .main-container,
    .container,
    .content,
    .wrapper {
        max-width: 100% !important;
        overflow-x: hidden !important;
    }
    
    /* Fix for wide elements */
    table, 
    .table,
    pre,
    code {
        max-width: 100% !important;
        overflow-x: auto !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
    }
    
    img,
    video,
    iframe,
    object,
    embed {
        max-width: 100% !important;
        height: auto !important;
    }`;

        // Add the CSS fix
        if (!content.includes('MOBILE FIX: Prevent horizontal scrolling')) {
            content = content.replace(
                /<\/style>/i,
                `${horizontalScrollFix}\n    </style>`
            );

            // If no style tag exists, create one
            if (!content.includes('<style>')) {
                content = content.replace(
                    /<\/head>/i,
                    `    <style>${horizontalScrollFix}\n    </style>\n</head>`
                );
            }
        }

        return content;
    }

    fixTouchTargetSizes(content) {
        const touchTargetCSS = `
    /* MOBILE FIX: Touch target sizes */
    @media (max-width: ${this.breakpoints.mobile}) {
        button,
        a,
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        [role="button"],
        [onclick],
        .clickable {
            min-height: 48px !important;
            min-width: 48px !important;
            padding: 12px 16px !important;
            margin: 4px !important;
            font-size: 16px !important;
            line-height: 1.2 !important;
        }
        
        input[type="checkbox"],
        input[type="radio"] {
            width: 24px !important;
            height: 24px !important;
            margin: 12px !important;
        }
        
        /* Increase tap area for small elements */
        .small-button,
        .icon-button {
            padding: 16px !important;
            min-height: 48px !important;
            min-width: 48px !important;
        }
        
        /* Navigation items */
        nav a,
        .nav-item,
        .menu-item {
            padding: 16px 20px !important;
            min-height: 48px !important;
            display: block !important;
        }
        
        /* Tab targets */
        .tab,
        .tab-button {
            min-height: 48px !important;
            padding: 12px 16px !important;
        }
    }
    
    @media (max-width: 480px) {
        button,
        a,
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        [role="button"],
        [onclick] {
            min-height: 52px !important;
            padding: 14px 18px !important;
            font-size: 18px !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${touchTargetCSS}\n    </style>`
        );

        return content;
    }

    addResponsiveTypography(content) {
        const responsiveTypography = `
    /* MOBILE FIX: Responsive typography */
    html {
        font-size: 16px !important;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
        line-height: 1.6 !important;
        font-size: 16px !important;
    }
    
    @media (max-width: ${this.breakpoints.mobile}) {
        html {
            font-size: 18px !important;
        }
        
        body {
            font-size: 18px !important;
            line-height: 1.7 !important;
        }
        
        h1 {
            font-size: 2rem !important;
            line-height: 1.3 !important;
            margin-bottom: 1rem !important;
        }
        
        h2 {
            font-size: 1.75rem !important;
            line-height: 1.3 !important;
            margin-bottom: 0.875rem !important;
        }
        
        h3 {
            font-size: 1.5rem !important;
            line-height: 1.4 !important;
            margin-bottom: 0.75rem !important;
        }
        
        h4 {
            font-size: 1.25rem !important;
            line-height: 1.4 !important;
            margin-bottom: 0.625rem !important;
        }
        
        h5, h6 {
            font-size: 1.125rem !important;
            line-height: 1.4 !important;
            margin-bottom: 0.5rem !important;
        }
        
        p, div, span {
            font-size: 18px !important;
            line-height: 1.7 !important;
            margin-bottom: 1rem !important;
        }
        
        small,
        .small-text {
            font-size: 16px !important;
            line-height: 1.6 !important;
        }
        
        /* Improve readability */
        .metric-value {
            font-size: 2.5rem !important;
        }
        
        .metric-label {
            font-size: 1.125rem !important;
        }
        
        .metric-description {
            font-size: 1rem !important;
        }
    }
    
    @media (max-width: 480px) {
        h1 {
            font-size: 1.75rem !important;
        }
        
        h2 {
            font-size: 1.5rem !important;
        }
        
        .metric-value {
            font-size: 2rem !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${responsiveTypography}\n    </style>`
        );

        return content;
    }

    fixResponsiveImages(content) {
        // Add responsive image classes
        const responsiveImageCSS = `
    /* MOBILE FIX: Responsive images */
    img {
        max-width: 100% !important;
        height: auto !important;
        object-fit: contain !important;
    }
    
    .responsive-image {
        width: 100% !important;
        height: auto !important;
        max-width: 100% !important;
    }
    
    @media (max-width: ${this.breakpoints.mobile}) {
        img,
        .image,
        .chart,
        .diagram {
            width: 100% !important;
            height: auto !important;
            margin-bottom: 1rem !important;
        }
        
        .image-container {
            text-align: center !important;
            margin-bottom: 1.5rem !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${responsiveImageCSS}\n    </style>`
        );

        // Add responsive classes to images
        content = content.replace(
            /<img([^>]*?)(?!.*class)([^>]*?)>/gi,
            '<img$1 class="responsive-image"$2>'
        );

        content = content.replace(
            /<img([^>]*?)class=["']([^"']*)["']([^>]*?)>/gi,
            '<img$1class="$2 responsive-image"$3>'
        );

        return content;
    }

    addResponsiveNavigation(content) {
        const responsiveNavCSS = `
    /* MOBILE FIX: Responsive navigation */
    @media (max-width: ${this.breakpoints.mobile}) {
        .main-container {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 1fr auto !important;
        }
        
        .left-panel,
        .right-panel {
            position: fixed !important;
            top: 0 !important;
            left: -100% !important;
            width: 280px !important;
            height: 100vh !important;
            z-index: 9999 !important;
            transition: left 0.3s ease !important;
            overflow-y: auto !important;
        }
        
        .left-panel.open {
            left: 0 !important;
        }
        
        .right-panel {
            left: auto !important;
            right: -100% !important;
        }
        
        .right-panel.open {
            right: 0 !important;
        }
        
        .mobile-nav-toggle {
            display: block !important;
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            z-index: 10000 !important;
            background: #2196F3 !important;
            color: white !important;
            border: none !important;
            padding: 12px !important;
            border-radius: 4px !important;
            min-height: 48px !important;
            min-width: 48px !important;
            font-size: 20px !important;
        }
        
        .mobile-nav-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 9998 !important;
            display: none !important;
        }
        
        .mobile-nav-overlay.open {
            display: block !important;
        }
        
        .viewer-container {
            grid-column: 1 !important;
            grid-row: 2 !important;
            height: calc(100vh - 60px) !important;
        }
    }
    
    @media (min-width: calc(${this.breakpoints.mobile} + 1px)) {
        .mobile-nav-toggle {
            display: none !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${responsiveNavCSS}\n    </style>`
        );

        // Add mobile navigation toggle button
        const mobileNavButton = `
    <!-- MOBILE FIX: Mobile navigation toggle -->
    <button class="mobile-nav-toggle" onclick="toggleMobileNav()" aria-label="Toggle navigation">
        ☰
    </button>
    <div class="mobile-nav-overlay" onclick="closeMobileNav()"></div>`;

        content = content.replace(
            /<body([^>]*)>/i,
            `<body$1>${mobileNavButton}`
        );

        return content;
    }

    fixResponsiveTables(content) {
        const responsiveTableCSS = `
    /* MOBILE FIX: Responsive tables */
    @media (max-width: ${this.breakpoints.mobile}) {
        table {
            font-size: 14px !important;
            border-collapse: collapse !important;
            width: 100% !important;
        }
        
        .table-responsive {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
        }
        
        .table-stack {
            display: block !important;
        }
        
        .table-stack thead {
            display: none !important;
        }
        
        .table-stack tr {
            display: block !important;
            border: 1px solid #ddd !important;
            margin-bottom: 10px !important;
            padding: 10px !important;
            border-radius: 4px !important;
        }
        
        .table-stack td {
            display: block !important;
            text-align: left !important;
            border: none !important;
            padding: 5px 0 !important;
            position: relative !important;
            padding-left: 40% !important;
        }
        
        .table-stack td:before {
            content: attr(data-label) ": " !important;
            position: absolute !important;
            left: 0 !important;
            top: 5px !important;
            font-weight: bold !important;
            color: #333 !important;
            width: 35% !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${responsiveTableCSS}\n    </style>`
        );

        // Wrap tables in responsive containers and add data labels
        content = content.replace(
            /<table([^>]*)>/gi,
            '<div class="table-responsive"><table$1 class="table-stack">'
        );

        content = content.replace(
            /<\/table>/gi,
            '</table></div>'
        );

        // Add data-label attributes to table cells (simplified approach)
        content = content.replace(
            /<td([^>]*)>(.*?)<\/td>/gi,
            (match, attributes, cellContent) => {
                const label = cellContent.replace(/<[^>]*>/g, '').trim().substring(0, 20);
                return `<td${attributes} data-label="${label}">${cellContent}</td>`;
            }
        );

        return content;
    }

    addMobileFirstCSS(content) {
        const mobileFirstCSS = `
    /* MOBILE FIX: Mobile-first responsive design */
    
    /* Base mobile styles */
    .container {
        padding: 1rem !important;
        margin: 0 auto !important;
    }
    
    .grid {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
    }
    
    .flex {
        display: flex !important;
        flex-direction: column !important;
        gap: 1rem !important;
    }
    
    .card,
    .metric-card {
        margin-bottom: 1rem !important;
        padding: 1rem !important;
        border-radius: 8px !important;
    }
    
    /* Tablet styles */
    @media (min-width: ${this.breakpoints.mobile}) {
        .container {
            padding: 1.5rem !important;
            max-width: ${this.breakpoints.tablet} !important;
        }
        
        .grid-tablet-2 {
            grid-template-columns: 1fr 1fr !important;
        }
        
        .flex-tablet-row {
            flex-direction: row !important;
        }
    }
    
    /* Desktop styles */
    @media (min-width: ${this.breakpoints.tablet}) {
        .container {
            padding: 2rem !important;
            max-width: ${this.breakpoints.desktop} !important;
        }
        
        .grid-desktop-3 {
            grid-template-columns: repeat(3, 1fr) !important;
        }
        
        .grid-desktop-4 {
            grid-template-columns: repeat(4, 1fr) !important;
        }
    }
    
    /* Hide/show elements based on screen size */
    .mobile-only {
        display: block !important;
    }
    
    .tablet-up {
        display: none !important;
    }
    
    .desktop-up {
        display: none !important;
    }
    
    @media (min-width: ${this.breakpoints.mobile}) {
        .mobile-only {
            display: none !important;
        }
        
        .tablet-up {
            display: block !important;
        }
    }
    
    @media (min-width: ${this.breakpoints.tablet}) {
        .tablet-up {
            display: none !important;
        }
        
        .desktop-up {
            display: block !important;
        }
    }
    
    /* Spacing utilities */
    @media (max-width: ${this.breakpoints.mobile}) {
        .margin-bottom {
            margin-bottom: 1rem !important;
        }
        
        .padding {
            padding: 1rem !important;
        }
        
        .text-center-mobile {
            text-align: center !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${mobileFirstCSS}\n    </style>`
        );

        return content;
    }

    fixResponsiveForms(content) {
        const responsiveFormCSS = `
    /* MOBILE FIX: Responsive forms */
    @media (max-width: ${this.breakpoints.mobile}) {
        form {
            padding: 1rem !important;
        }
        
        input,
        textarea,
        select {
            width: 100% !important;
            min-height: 48px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
            border: 2px solid #ddd !important;
            border-radius: 4px !important;
            margin-bottom: 1rem !important;
            box-sizing: border-box !important;
        }
        
        label {
            display: block !important;
            margin-bottom: 0.5rem !important;
            font-weight: bold !important;
            font-size: 16px !important;
        }
        
        .form-group {
            margin-bottom: 1.5rem !important;
        }
        
        .form-row {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
        }
        
        .form-actions {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
            margin-top: 2rem !important;
        }
        
        .form-actions button {
            width: 100% !important;
            min-height: 48px !important;
            font-size: 18px !important;
            padding: 14px !important;
        }
        
        /* Prevent zoom on inputs in iOS */
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="search"],
        input[type="tel"],
        input[type="url"],
        textarea {
            font-size: 16px !important;
        }
        
        /* Improve checkbox and radio styling */
        input[type="checkbox"],
        input[type="radio"] {
            width: 20px !important;
            height: 20px !important;
            margin-right: 10px !important;
            margin-bottom: 0 !important;
        }
        
        .checkbox-group,
        .radio-group {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 1rem !important;
            padding: 10px !important;
        }
        
        .checkbox-group label,
        .radio-group label {
            margin-bottom: 0 !important;
            margin-left: 10px !important;
            font-weight: normal !important;
        }
    }`;

        content = content.replace(
            /<\/style>/i,
            `${responsiveFormCSS}\n    </style>`
        );

        return content;
    }

    addMobileJavaScript(content) {
        const mobileJavaScript = `
    <!-- MOBILE FIX: Mobile-specific JavaScript -->
    <script>
        (function() {
            'use strict';
            
            // Mobile navigation functionality
            window.toggleMobileNav = function() {
                const leftPanel = document.querySelector('.left-panel');
                const overlay = document.querySelector('.mobile-nav-overlay');
                
                if (leftPanel) {
                    leftPanel.classList.toggle('open');
                    overlay.classList.toggle('open');
                    
                    // Prevent body scroll when nav is open
                    if (leftPanel.classList.contains('open')) {
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                    }
                }
            };
            
            window.closeMobileNav = function() {
                const leftPanel = document.querySelector('.left-panel');
                const rightPanel = document.querySelector('.right-panel');
                const overlay = document.querySelector('.mobile-nav-overlay');
                
                if (leftPanel) leftPanel.classList.remove('open');
                if (rightPanel) rightPanel.classList.remove('open');
                if (overlay) overlay.classList.remove('open');
                
                document.body.style.overflow = '';
            };
            
            // Touch and gesture support
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;
            
            function handleGesture() {
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const minSwipeDistance = 50;
                
                // Horizontal swipe gestures
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        // Swipe right - open left panel
                        if (touchStartX < 50) {
                            toggleMobileNav();
                        }
                    } else {
                        // Swipe left - close panels
                        closeMobileNav();
                    }
                }
            }
            
            document.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            });
            
            document.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleGesture();
            });
            
            // Orientation change handling
            function handleOrientationChange() {
                setTimeout(function() {
                    // Close mobile nav on orientation change
                    closeMobileNav();
                    
                    // Trigger resize event for canvas/WebGL
                    window.dispatchEvent(new Event('resize'));
                    
                    // Update viewport height for mobile browsers
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', vh + 'px');
                }, 100);
            }
            
            window.addEventListener('orientationchange', handleOrientationChange);
            window.addEventListener('resize', handleOrientationChange);
            
            // Set initial viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
            
            // Improve form input experience on mobile
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                // Prevent zoom on focus for iOS
                input.addEventListener('focus', function() {
                    if (window.innerWidth < 768) {
                        document.querySelector('meta[name=viewport]').setAttribute(
                            'content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                        );
                    }
                });
                
                input.addEventListener('blur', function() {
                    if (window.innerWidth < 768) {
                        document.querySelector('meta[name=viewport]').setAttribute(
                            'content', 
                            'width=device-width, initial-scale=1.0, user-scalable=yes'
                        );
                    }
                });
            });
            
            // Mobile-friendly table interactions
            const tables = document.querySelectorAll('table');
            tables.forEach(function(table) {
                // Add horizontal scroll hint
                if (table.scrollWidth > table.clientWidth) {
                    table.setAttribute('title', 'Swipe horizontally to see more');
                    
                    // Add visual scroll indicator
                    const scrollIndicator = document.createElement('div');
                    scrollIndicator.textContent = '← Swipe for more →';
                    scrollIndicator.style.cssText = 
                        'text-align: center; font-size: 12px; color: #666; margin: 10px 0;';
                    table.parentNode.insertBefore(scrollIndicator, table.nextSibling);
                }
            });
            
            // Enhanced button click feedback
            const buttons = document.querySelectorAll('button, [role="button"], .clickable');
            buttons.forEach(function(button) {
                button.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                    this.style.transition = 'transform 0.1s ease';
                });
                
                button.addEventListener('touchend', function() {
                    this.style.transform = '';
                });
            });
            
            // Detect mobile device capabilities
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (isMobile || isTouch) {
                document.body.classList.add('mobile-device');
                
                // Add mobile-specific optimizations
                if (window.renderer) {
                    // Reduce WebGL performance for mobile
                    window.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                }
            }
            
            // Keyboard accessibility for mobile
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeMobileNav();
                }
            });
            
            console.log('MOBILE FIX: Mobile enhancements loaded');
            
        })();
    </script>`;

        if (!content.includes('MOBILE FIX: Mobile enhancements')) {
            content = content.replace(
                /<\/body>/i,
                `${mobileJavaScript}\n</body>`
            );
        }

        return content;
    }

    generateFixReport() {
        console.log('\n📱 MOBILE RESPONSIVENESS FIXES SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Files Fixed: ${this.fixes.applied}`);
        console.log(`⚠️  Files Skipped: ${this.fixes.skipped}`);
        console.log(`❌ Files Failed: ${this.fixes.failed}`);
        
        const total = this.fixes.applied + this.fixes.skipped + this.fixes.failed;
        const successRate = total > 0 ? ((this.fixes.applied / total) * 100).toFixed(1) : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        console.log('\n🔧 MOBILE FIXES APPLIED:');
        console.log('─'.repeat(40));
        console.log('   ✅ Proper viewport meta tag configuration');
        console.log('   ✅ Horizontal scrolling prevention');
        console.log('   ✅ Touch target size optimization (48px+)');
        console.log('   ✅ Responsive typography scaling');
        console.log('   ✅ Responsive image handling');
        console.log('   ✅ Mobile navigation with swipe gestures');
        console.log('   ✅ Responsive table layouts');
        console.log('   ✅ Mobile-first CSS framework');
        console.log('   ✅ Responsive form improvements');
        console.log('   ✅ Mobile-specific JavaScript enhancements');

        console.log('\n📁 FIXED FILES:');
        console.log('─'.repeat(40));
        this.htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const fixedPath = filePath.replace('.html', '_MOBILE_FIXED.html');
                if (fs.existsSync(fixedPath)) {
                    console.log(`   📄 ${path.basename(fixedPath)}`);
                }
            }
        });

        console.log('\n📱 BREAKPOINTS USED:');
        console.log('─'.repeat(40));
        console.log(`   📱 Mobile: < ${this.breakpoints.mobile}`);
        console.log(`   📟 Tablet: ${this.breakpoints.mobile} - ${this.breakpoints.tablet}`);
        console.log(`   🖥️  Desktop: > ${this.breakpoints.tablet}`);

        console.log('\n💡 NEXT STEPS:');
        console.log('─'.repeat(40));
        console.log('   1. Test on real mobile devices');
        console.log('   2. Verify touch interactions work properly');
        console.log('   3. Test in different orientations');
        console.log('   4. Validate with mobile accessibility tools');
        console.log('   5. Test network performance on slow connections');
        console.log('   6. Verify WebGL fallbacks work on mobile');

        // Save fix report
        const reportData = {
            timestamp: new Date().toISOString(),
            fixes: this.fixes,
            successRate: successRate + '%',
            breakpoints: this.breakpoints,
            fixesApplied: [
                'Viewport Meta Tag',
                'Horizontal Scrolling Prevention',
                'Touch Target Optimization',
                'Responsive Typography',
                'Responsive Images',
                'Mobile Navigation',
                'Responsive Tables',
                'Mobile-First CSS',
                'Responsive Forms',
                'Mobile JavaScript Enhancements'
            ]
        };

        fs.writeFileSync('./test-screenshots/mobile-fixes-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Fix report saved: ./test-screenshots/mobile-fixes-report.json');
    }
}

// Run the mobile responsiveness fixer
async function runMobileFixes() {
    const fixer = new MobileResponsivenessFixer();
    await fixer.fixAllMobileIssues();
}

if (require.main === module) {
    runMobileFixes().catch(console.error);
}

module.exports = MobileResponsivenessFixer;