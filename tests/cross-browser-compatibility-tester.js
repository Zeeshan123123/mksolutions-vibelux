/**
 * Cross-Browser Compatibility Tester
 * Tests functionality across Chromium, Firefox, and WebKit
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');

class CrossBrowserTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            browsers: {},
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                compatibility: 'UNKNOWN'
            },
            recommendations: []
        };
        
        this.testPages = [
            { name: 'Professional Design Report', path: '/Users/blakelange/Downloads/Mohave_Professional_Design_Report.html' },
            { name: 'Comprehensive Technical Report', path: '/Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html' },
            { name: '3D Facility Visualization', path: '/Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html' },
            { name: 'Enhanced 3D Professional Analysis', path: '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html' },
            { name: 'White Label Report Builder', path: '/Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html' }
        ];

        this.browsers = [
            { name: 'Chromium', launcher: chromium },
            { name: 'Firefox', launcher: firefox },
            { name: 'WebKit', launcher: webkit }
        ];
    }

    async runCompatibilityTests() {
        console.log('🌐 CROSS-BROWSER COMPATIBILITY TESTING SUITE');
        console.log('═'.repeat(60));
        console.log('Testing across Chromium, Firefox, and WebKit...\n');

        for (const browser of this.browsers) {
            console.log(`\n🔍 Testing in ${browser.name}`);
            console.log('─'.repeat(40));
            
            this.results.browsers[browser.name] = {
                tests: [],
                summary: { passed: 0, failed: 0, warnings: 0 },
                features: {},
                issues: []
            };

            try {
                const browserInstance = await browser.launcher.launch({ 
                    headless: true,
                    args: ['--enable-webgl', '--use-gl=desktop']
                });
                
                for (const page of this.testPages) {
                    await this.testPageInBrowser(browserInstance, page, browser.name);
                }
                
                await browserInstance.close();
                
            } catch (error) {
                console.error(`❌ Failed to test in ${browser.name}: ${error.message}`);
                this.results.browsers[browser.name].issues.push({
                    type: 'BROWSER_LAUNCH_FAILED',
                    message: error.message
                });
            }
        }

        await this.analyzeCompatibility();
        await this.generateCompatibilityReport();
    }

    async testPageInBrowser(browser, pageInfo, browserName) {
        const page = await browser.newPage();
        const testName = `${pageInfo.name} - ${browserName}`;
        
        console.log(`🧪 Testing: ${testName}`);

        try {
            // Test 1: Basic Page Loading
            await this.testBasicLoading(page, pageInfo, browserName);

            // Test 2: CSS Compatibility
            await this.testCSSCompatibility(page, pageInfo, browserName);

            // Test 3: JavaScript Functionality
            await this.testJavaScriptCompatibility(page, pageInfo, browserName);

            // Test 4: HTML5 Features
            await this.testHTML5Features(page, pageInfo, browserName);

            // Test 5: WebGL Support (for 3D pages)
            if (pageInfo.name.includes('3D')) {
                await this.testWebGLCompatibility(page, pageInfo, browserName);
            }

            // Test 6: Event Handling
            await this.testEventHandling(page, pageInfo, browserName);

            // Test 7: Layout and Rendering
            await this.testLayoutRendering(page, pageInfo, browserName);

            // Test 8: Performance in Browser
            await this.testBrowserPerformance(page, pageInfo, browserName);

            // Test 9: API Compatibility
            await this.testAPICompatibility(page, pageInfo, browserName);

            // Test 10: User Interaction
            await this.testUserInteraction(page, pageInfo, browserName);

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'GENERAL_COMPATIBILITY',
                status: 'FAILED',
                error: error.message
            });
        }

        await page.close();
    }

    async testBasicLoading(page, pageInfo, browserName) {
        try {
            const startTime = Date.now();
            
            await page.goto(`file://${pageInfo.path}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            const loadTime = Date.now() - startTime;
            
            // Check if page loaded successfully
            const title = await page.title();
            const hasContent = await page.evaluate(() => document.body.children.length > 0);

            if (hasContent && title) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Basic Loading',
                    status: 'PASSED',
                    details: `Loaded in ${loadTime}ms`,
                    metrics: { loadTime, title }
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Basic Loading',
                    status: 'FAILED',
                    details: 'Page failed to load content properly'
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'Basic Loading',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testCSSCompatibility(page, pageInfo, browserName) {
        try {
            const cssIssues = await page.evaluate(() => {
                const issues = [];
                const computedStyles = window.getComputedStyle(document.body);
                
                // Check for CSS Grid support
                const gridSupport = CSS.supports('display', 'grid');
                if (!gridSupport) issues.push('CSS Grid not supported');
                
                // Check for Flexbox support
                const flexSupport = CSS.supports('display', 'flex');
                if (!flexSupport) issues.push('Flexbox not supported');
                
                // Check for custom properties (CSS variables)
                const customPropSupport = CSS.supports('color', 'var(--test)');
                if (!customPropSupport) issues.push('CSS custom properties not supported');
                
                // Check for backdrop-filter
                const backdropSupport = CSS.supports('backdrop-filter', 'blur(10px)');
                if (!backdropSupport) issues.push('backdrop-filter not supported');
                
                // Check for CSS transforms
                const transformSupport = CSS.supports('transform', 'translateZ(0)');
                if (!transformSupport) issues.push('3D transforms not supported');
                
                return {
                    issues,
                    gridSupport,
                    flexSupport,
                    customPropSupport,
                    backdropSupport,
                    transformSupport
                };
            });

            this.results.browsers[browserName].features.css = cssIssues;

            if (cssIssues.issues.length === 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'CSS Compatibility',
                    status: 'PASSED',
                    details: 'All modern CSS features supported'
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'CSS Compatibility',
                    status: 'WARNING',
                    details: `Some CSS features unsupported: ${cssIssues.issues.join(', ')}`
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'CSS Compatibility',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testJavaScriptCompatibility(page, pageInfo, browserName) {
        try {
            const jsCompatibility = await page.evaluate(() => {
                const features = {};
                
                // ES6+ Features
                features.arrowFunctions = (() => { try { eval('() => {}'); return true; } catch(e) { return false; } })();
                features.asyncAwait = (() => { try { eval('async function test() { await Promise.resolve(); }'); return true; } catch(e) { return false; } })();
                features.destructuring = (() => { try { eval('const {a} = {a: 1}'); return true; } catch(e) { return false; } })();
                features.templateLiterals = (() => { try { eval('`template`'); return true; } catch(e) { return false; } })();
                features.classes = (() => { try { eval('class Test {}'); return true; } catch(e) { return false; } })();
                
                // Web APIs
                features.fetch = typeof fetch !== 'undefined';
                features.promises = typeof Promise !== 'undefined';
                features.localStorage = typeof localStorage !== 'undefined';
                features.sessionStorage = typeof sessionStorage !== 'undefined';
                features.webGL = (() => {
                    try {
                        const canvas = document.createElement('canvas');
                        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                    } catch(e) { return false; }
                })();
                features.requestAnimationFrame = typeof requestAnimationFrame !== 'undefined';
                
                // Check for console errors
                const errorCount = window.jsErrorCount || 0;
                
                return { features, errorCount };
            });

            this.results.browsers[browserName].features.javascript = jsCompatibility.features;

            const unsupportedFeatures = Object.entries(jsCompatibility.features)
                .filter(([key, value]) => !value)
                .map(([key]) => key);

            if (unsupportedFeatures.length === 0 && jsCompatibility.errorCount === 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'JavaScript Compatibility',
                    status: 'PASSED',
                    details: 'All JavaScript features supported'
                });
            } else if (unsupportedFeatures.length > 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'JavaScript Compatibility',
                    status: 'WARNING',
                    details: `Unsupported features: ${unsupportedFeatures.join(', ')}`
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'JavaScript Compatibility',
                    status: 'FAILED',
                    details: `${jsCompatibility.errorCount} JavaScript errors detected`
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'JavaScript Compatibility',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testHTML5Features(page, pageInfo, browserName) {
        try {
            const html5Support = await page.evaluate(() => {
                const features = {};
                
                // HTML5 Input Types
                const input = document.createElement('input');
                input.type = 'range';
                features.rangeInput = input.type === 'range';
                
                input.type = 'date';
                features.dateInput = input.type === 'date';
                
                input.type = 'color';
                features.colorInput = input.type === 'color';
                
                // HTML5 APIs
                features.canvas = !!document.createElement('canvas').getContext;
                features.svg = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
                features.audio = !!document.createElement('audio').canPlayType;
                features.video = !!document.createElement('video').canPlayType;
                features.geolocation = !!navigator.geolocation;
                features.fileAPI = !!(window.File && window.FileReader && window.FileList && window.Blob);
                features.dragDrop = 'draggable' in document.createElement('div');
                
                // Storage APIs
                features.websockets = !!window.WebSocket;
                features.workers = !!window.Worker;
                features.indexedDB = !!window.indexedDB;
                
                return features;
            });

            this.results.browsers[browserName].features.html5 = html5Support;

            const unsupportedHTML5 = Object.entries(html5Support)
                .filter(([key, value]) => !value)
                .map(([key]) => key);

            if (unsupportedHTML5.length === 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'HTML5 Features',
                    status: 'PASSED',
                    details: 'All HTML5 features supported'
                });
            } else if (unsupportedHTML5.length <= 2) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'HTML5 Features',
                    status: 'WARNING',
                    details: `Limited support: ${unsupportedHTML5.join(', ')}`
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'HTML5 Features',
                    status: 'FAILED',
                    details: `Poor HTML5 support: ${unsupportedHTML5.length} features missing`
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'HTML5 Features',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testWebGLCompatibility(page, pageInfo, browserName) {
        try {
            await page.waitForTimeout(3000); // Wait for WebGL initialization

            const webglInfo = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return { error: 'No canvas found' };

                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return { error: 'WebGL not supported' };

                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                return {
                    version: gl.getParameter(gl.VERSION),
                    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
                    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
                    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
                    extensions: gl.getSupportedExtensions(),
                    contextLost: gl.isContextLost()
                };
            });

            if (webglInfo.error) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'WebGL Compatibility',
                    status: 'FAILED',
                    details: webglInfo.error
                });
            } else if (webglInfo.contextLost) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'WebGL Compatibility',
                    status: 'FAILED',
                    details: 'WebGL context lost'
                });
            } else {
                this.results.browsers[browserName].features.webgl = webglInfo;
                
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'WebGL Compatibility',
                    status: 'PASSED',
                    details: `WebGL working - ${webglInfo.renderer}`,
                    metrics: webglInfo
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'WebGL Compatibility',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testEventHandling(page, pageInfo, browserName) {
        try {
            const eventTest = await page.evaluate(() => {
                let clickHandled = false;
                let keyHandled = false;
                let mouseHandled = false;
                
                // Create test elements
                const testDiv = document.createElement('div');
                testDiv.style.width = '100px';
                testDiv.style.height = '100px';
                testDiv.style.position = 'absolute';
                testDiv.style.top = '-1000px';
                document.body.appendChild(testDiv);
                
                // Test click events
                testDiv.addEventListener('click', () => { clickHandled = true; });
                testDiv.click();
                
                // Test keyboard events
                document.addEventListener('keydown', () => { keyHandled = true; });
                const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
                document.dispatchEvent(keyEvent);
                
                // Test mouse events
                testDiv.addEventListener('mouseenter', () => { mouseHandled = true; });
                const mouseEvent = new MouseEvent('mouseenter');
                testDiv.dispatchEvent(mouseEvent);
                
                // Cleanup
                document.body.removeChild(testDiv);
                
                return { clickHandled, keyHandled, mouseHandled };
            });

            const handledEvents = Object.values(eventTest).filter(Boolean).length;
            
            if (handledEvents === 3) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Event Handling',
                    status: 'PASSED',
                    details: 'All event types handled correctly'
                });
            } else if (handledEvents >= 2) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Event Handling',
                    status: 'WARNING',
                    details: `${handledEvents}/3 event types working`
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Event Handling',
                    status: 'FAILED',
                    details: 'Event handling issues detected'
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'Event Handling',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testLayoutRendering(page, pageInfo, browserName) {
        try {
            const layoutInfo = await page.evaluate(() => {
                const body = document.body;
                const computedStyle = window.getComputedStyle(body);
                
                return {
                    hasContent: body.children.length > 0,
                    bodyWidth: body.offsetWidth,
                    bodyHeight: body.offsetHeight,
                    overflow: computedStyle.overflow,
                    position: computedStyle.position,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    scrollHeight: document.documentElement.scrollHeight,
                    scrollWidth: document.documentElement.scrollWidth
                };
            });

            if (layoutInfo.hasContent && layoutInfo.bodyWidth > 0 && layoutInfo.bodyHeight > 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Layout Rendering',
                    status: 'PASSED',
                    details: `Rendered ${layoutInfo.bodyWidth}x${layoutInfo.bodyHeight}`,
                    metrics: layoutInfo
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Layout Rendering',
                    status: 'FAILED',
                    details: 'Layout rendering issues detected'
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'Layout Rendering',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testBrowserPerformance(page, pageInfo, browserName) {
        try {
            const performanceMetrics = await page.evaluate(() => {
                if (!window.performance) return { error: 'Performance API not available' };
                
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
                    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : null,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
                    memoryUsage: performance.memory ? {
                        used: performance.memory.usedJSHeapSize / (1024 * 1024),
                        total: performance.memory.totalJSHeapSize / (1024 * 1024),
                        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024)
                    } : null
                };
            });

            if (performanceMetrics.error) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Browser Performance',
                    status: 'WARNING',
                    details: performanceMetrics.error
                });
            } else {
                const loadTime = performanceMetrics.loadTime || 0;
                const status = loadTime < 2000 ? 'PASSED' : loadTime < 5000 ? 'WARNING' : 'FAILED';
                
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'Browser Performance',
                    status,
                    details: `Load time: ${loadTime.toFixed(0)}ms`,
                    metrics: performanceMetrics
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'Browser Performance',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testAPICompatibility(page, pageInfo, browserName) {
        try {
            const apiSupport = await page.evaluate(() => {
                const apis = {
                    intersectionObserver: !!window.IntersectionObserver,
                    mutationObserver: !!window.MutationObserver,
                    resizeObserver: !!window.ResizeObserver,
                    requestIdleCallback: !!window.requestIdleCallback,
                    customElements: !!window.customElements,
                    shadowDOM: !!Element.prototype.attachShadow,
                    modules: 'noModule' in document.createElement('script'),
                    serviceWorker: !!navigator.serviceWorker,
                    webAssembly: !!window.WebAssembly,
                    clipboard: !!navigator.clipboard
                };
                
                return apis;
            });

            this.results.browsers[browserName].features.apis = apiSupport;

            const supportedAPIs = Object.values(apiSupport).filter(Boolean).length;
            const totalAPIs = Object.keys(apiSupport).length;
            
            if (supportedAPIs === totalAPIs) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'API Compatibility',
                    status: 'PASSED',
                    details: 'All modern APIs supported'
                });
            } else if (supportedAPIs >= totalAPIs * 0.8) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'API Compatibility',
                    status: 'WARNING',
                    details: `${supportedAPIs}/${totalAPIs} APIs supported`
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'API Compatibility',
                    status: 'FAILED',
                    details: `Poor API support: ${supportedAPIs}/${totalAPIs}`
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'API Compatibility',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    async testUserInteraction(page, pageInfo, browserName) {
        try {
            // Test button clicks
            const buttons = await page.$$('button');
            let clickableButtons = 0;
            
            for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                try {
                    await buttons[i].click();
                    clickableButtons++;
                    await page.waitForTimeout(100);
                } catch (e) {
                    // Button might not be clickable
                }
            }
            
            // Test form interactions
            const inputs = await page.$$('input, textarea, select');
            let workingInputs = 0;
            
            for (let i = 0; i < Math.min(inputs.length, 3); i++) {
                try {
                    await inputs[i].focus();
                    await inputs[i].fill('test');
                    workingInputs++;
                } catch (e) {
                    // Input might not be fillable
                }
            }

            const totalInteractions = clickableButtons + workingInputs;
            const totalElements = Math.min(buttons.length, 5) + Math.min(inputs.length, 3);
            
            if (totalElements === 0) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'User Interaction',
                    status: 'WARNING',
                    details: 'No interactive elements found'
                });
            } else if (totalInteractions === totalElements) {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'User Interaction',
                    status: 'PASSED',
                    details: `All ${totalInteractions} interactions working`
                });
            } else {
                this.addTestResult(browserName, {
                    page: pageInfo.name,
                    test: 'User Interaction',
                    status: 'WARNING',
                    details: `${totalInteractions}/${totalElements} interactions working`
                });
            }

        } catch (error) {
            this.addTestResult(browserName, {
                page: pageInfo.name,
                test: 'User Interaction',
                status: 'FAILED',
                error: error.message
            });
        }
    }

    addTestResult(browserName, result) {
        this.results.browsers[browserName].tests.push(result);
        this.results.summary.totalTests++;
        
        switch (result.status) {
            case 'PASSED':
                this.results.browsers[browserName].summary.passed++;
                this.results.summary.passed++;
                console.log(`   ✅ ${result.test}: ${result.details || 'PASSED'}`);
                break;
            case 'WARNING':
                this.results.browsers[browserName].summary.warnings++;
                this.results.summary.warnings++;
                console.log(`   ⚠️  ${result.test}: ${result.details || 'WARNING'}`);
                break;
            case 'FAILED':
                this.results.browsers[browserName].summary.failed++;
                this.results.summary.failed++;
                console.log(`   ❌ ${result.test}: ${result.error || result.details || 'FAILED'}`);
                break;
        }
    }

    async analyzeCompatibility() {
        const browserNames = Object.keys(this.results.browsers);
        const commonIssues = [];
        const browserSpecificIssues = {};

        // Find issues that appear across all browsers
        browserNames.forEach(browser => {
            const failedTests = this.results.browsers[browser].tests.filter(t => t.status === 'FAILED');
            failedTests.forEach(test => {
                const isCommon = browserNames.every(b => 
                    this.results.browsers[b].tests.some(t => 
                        t.test === test.test && t.status === 'FAILED'
                    )
                );
                
                if (isCommon && !commonIssues.some(i => i.test === test.test)) {
                    commonIssues.push(test);
                }
            });
        });

        // Find browser-specific issues
        browserNames.forEach(browser => {
            const uniqueIssues = this.results.browsers[browser].tests.filter(test => 
                test.status === 'FAILED' && 
                !commonIssues.some(common => common.test === test.test)
            );
            
            if (uniqueIssues.length > 0) {
                browserSpecificIssues[browser] = uniqueIssues;
            }
        });

        // Calculate overall compatibility score
        const totalPassed = this.results.summary.passed;
        const totalTests = this.results.summary.totalTests;
        const compatibilityScore = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

        if (compatibilityScore >= 95) {
            this.results.summary.compatibility = 'EXCELLENT';
        } else if (compatibilityScore >= 85) {
            this.results.summary.compatibility = 'GOOD';
        } else if (compatibilityScore >= 70) {
            this.results.summary.compatibility = 'FAIR';
        } else {
            this.results.summary.compatibility = 'POOR';
        }

        this.results.analysis = {
            compatibilityScore,
            commonIssues,
            browserSpecificIssues
        };
    }

    async generateCompatibilityReport() {
        console.log('\n🌐 CROSS-BROWSER COMPATIBILITY SUMMARY');
        console.log('═'.repeat(60));
        
        // Overall summary
        console.log(`📊 Overall Compatibility: ${this.results.summary.compatibility}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`📈 Success Rate: ${this.results.analysis.compatibilityScore.toFixed(1)}%`);

        // Browser-specific summaries
        console.log('\n🔍 Browser Breakdown:');
        console.log('─'.repeat(40));
        Object.entries(this.results.browsers).forEach(([browser, data]) => {
            const total = data.tests.length;
            const passed = data.summary.passed;
            const rate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
            console.log(`   ${browser}: ${passed}/${total} passed (${rate}%)`);
        });

        // Common issues across all browsers
        if (this.results.analysis.commonIssues.length > 0) {
            console.log('\n🚨 Common Issues (All Browsers):');
            console.log('─'.repeat(40));
            this.results.analysis.commonIssues.forEach(issue => {
                console.log(`   • ${issue.test}: ${issue.details || issue.error}`);
            });
        }

        // Browser-specific issues
        if (Object.keys(this.results.analysis.browserSpecificIssues).length > 0) {
            console.log('\n🔧 Browser-Specific Issues:');
            console.log('─'.repeat(40));
            Object.entries(this.results.analysis.browserSpecificIssues).forEach(([browser, issues]) => {
                console.log(`   ${browser}:`);
                issues.forEach(issue => {
                    console.log(`     • ${issue.test}: ${issue.details || issue.error}`);
                });
            });
        }

        // Save detailed report
        const reportPath = './test-screenshots/cross-browser-compatibility-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        this.generateRecommendations();
    }

    generateRecommendations() {
        console.log('\n💡 COMPATIBILITY RECOMMENDATIONS:');
        console.log('═'.repeat(60));

        if (this.results.summary.compatibility === 'EXCELLENT') {
            console.log('🎉 Excellent cross-browser compatibility!');
            console.log('   • Continue current development practices');
            console.log('   • Consider progressive enhancement for new features');
            return;
        }

        if (this.results.analysis.commonIssues.length > 0) {
            console.log('🚨 CRITICAL - Fix Common Issues First:');
            this.results.analysis.commonIssues.slice(0, 3).forEach(issue => {
                console.log(`   • ${issue.test}: Use polyfills or fallbacks`);
            });
        }

        if (Object.keys(this.results.analysis.browserSpecificIssues).length > 0) {
            console.log('🔧 Browser-Specific Fixes:');
            Object.entries(this.results.analysis.browserSpecificIssues).forEach(([browser, issues]) => {
                console.log(`   ${browser}: Consider feature detection and fallbacks`);
            });
        }

        console.log('\n📋 General Recommendations:');
        console.log('   • Use CSS feature queries (@supports) for advanced features');
        console.log('   • Implement progressive enhancement strategies');
        console.log('   • Add polyfills for unsupported features');
        console.log('   • Test regularly across different browser versions');
        console.log('   • Consider using a CSS reset or normalize.css');
        console.log('   • Implement graceful degradation for WebGL content');
        
        if (this.results.summary.compatibility === 'POOR') {
            console.log('\n⚠️  URGENT: Poor compatibility detected!');
            console.log('   • Audit code for browser-specific dependencies');
            console.log('   • Consider using a more compatible framework');
            console.log('   • Implement comprehensive feature detection');
        }
    }
}

// Run the cross-browser compatibility test
async function runCompatibilityTests() {
    const tester = new CrossBrowserTester();
    await tester.runCompatibilityTests();
}

if (require.main === module) {
    runCompatibilityTests().catch(console.error);
}

module.exports = CrossBrowserTester;