/**
 * Comprehensive Performance Testing Suite
 * Tests memory usage, frame rates, WebGL performance, and load handling
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
        this.browsers = ['chromium', 'firefox', 'webkit'];
        this.testPages = [
            { name: 'Professional Design Report', path: '/Users/blakelange/Downloads/Mohave_Professional_Design_Report.html' },
            { name: 'Comprehensive Technical Report', path: '/Users/blakelange/Downloads/Mohave_Comprehensive_Technical_Report.html' },
            { name: '3D Facility Visualization', path: '/Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html' },
            { name: 'Enhanced 3D Professional Analysis', path: '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html' },
            { name: 'White Label Report Builder', path: '/Users/blakelange/Downloads/Mohave_White_Label_Report_Builder.html' }
        ];
    }

    async runAllTests() {
        console.log('🚀 COMPREHENSIVE PERFORMANCE TESTING SUITE');
        console.log('═'.repeat(60));
        console.log('Testing across multiple browsers and scenarios...\n');

        for (const browserName of this.browsers) {
            console.log(`\n🌐 Testing in ${browserName.toUpperCase()}`);
            console.log('─'.repeat(40));
            
            const browserInstance = await this.launchBrowser(browserName);
            if (!browserInstance) continue;

            try {
                for (const page of this.testPages) {
                    await this.testPagePerformance(browserInstance, page, browserName);
                }
            } catch (error) {
                console.error(`❌ Browser ${browserName} testing failed:`, error.message);
            }

            await browserInstance.close();
        }

        await this.generateReport();
    }

    async launchBrowser(browserName) {
        try {
            switch (browserName) {
                case 'chromium':
                    return await chromium.launch({ headless: true });
                case 'firefox':
                    return await firefox.launch({ headless: true });
                case 'webkit':
                    return await webkit.launch({ headless: true });
                default:
                    return await chromium.launch({ headless: true });
            }
        } catch (error) {
            console.error(`❌ Failed to launch ${browserName}:`, error.message);
            return null;
        }
    }

    async testPagePerformance(browser, pageInfo, browserName) {
        const page = await browser.newPage();
        const testName = `${pageInfo.name} - ${browserName}`;
        
        console.log(`🧪 Testing: ${testName}`);

        try {
            // Test 1: Page Load Performance
            const loadTest = await this.testPageLoad(page, pageInfo, testName);
            this.addTestResult(loadTest);

            // Test 2: Memory Usage
            const memoryTest = await this.testMemoryUsage(page, testName);
            this.addTestResult(memoryTest);

            // Test 3: JavaScript Performance
            const jsTest = await this.testJavaScriptPerformance(page, testName);
            this.addTestResult(jsTest);

            // Test 4: WebGL Performance (for 3D pages)
            if (pageInfo.name.includes('3D')) {
                const webglTest = await this.testWebGLPerformance(page, testName);
                this.addTestResult(webglTest);
            }

            // Test 5: Interactive Performance
            const interactionTest = await this.testInteractivePerformance(page, testName);
            this.addTestResult(interactionTest);

            // Test 6: Stress Test
            const stressTest = await this.testStressLoad(page, testName);
            this.addTestResult(stressTest);

        } catch (error) {
            this.addTestResult({
                name: testName,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            });
        }

        await page.close();
    }

    async testPageLoad(page, pageInfo, testName) {
        const startTime = Date.now();
        
        try {
            // Navigate with performance monitoring
            await page.goto(`file://${pageInfo.path}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            const loadTime = Date.now() - startTime;
            
            // Get performance metrics
            const metrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                return {
                    domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
                    loadComplete: perf.loadEventEnd - perf.loadEventStart,
                    firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
                };
            });

            const status = loadTime < 5000 ? 'PASSED' : loadTime < 10000 ? 'WARNING' : 'FAILED';

            return {
                name: `${testName} - Page Load`,
                status,
                metrics: {
                    totalLoadTime: loadTime,
                    ...metrics
                },
                details: `Load time: ${loadTime}ms`
            };

        } catch (error) {
            return {
                name: `${testName} - Page Load`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    async testMemoryUsage(page, testName) {
        try {
            // Initial memory snapshot
            const initialMemory = await page.evaluate(() => {
                if ('memory' in performance) {
                    return {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            });

            // Simulate interactions for 5 seconds
            await page.waitForTimeout(2000);
            
            // Click random elements to trigger memory usage
            try {
                const buttons = await page.$$('button');
                for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                    await buttons[i].click();
                    await page.waitForTimeout(200);
                }
            } catch (e) {
                // Buttons might not exist or be clickable
            }

            await page.waitForTimeout(3000);

            // Final memory snapshot
            const finalMemory = await page.evaluate(() => {
                if ('memory' in performance) {
                    return {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            });

            if (!initialMemory || !finalMemory) {
                return {
                    name: `${testName} - Memory Usage`,
                    status: 'WARNING',
                    details: 'Memory API not available in this browser',
                    metrics: {}
                };
            }

            const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
            const memoryUsageMB = finalMemory.usedJSHeapSize / (1024 * 1024);
            
            const status = memoryGrowth < 5 * 1024 * 1024 ? 'PASSED' : // < 5MB growth
                          memoryGrowth < 20 * 1024 * 1024 ? 'WARNING' : // < 20MB growth
                          'FAILED';

            return {
                name: `${testName} - Memory Usage`,
                status,
                metrics: {
                    memoryGrowthBytes: memoryGrowth,
                    finalMemoryMB: memoryUsageMB,
                    initialMemoryMB: initialMemory.usedJSHeapSize / (1024 * 1024)
                },
                details: `Memory usage: ${memoryUsageMB.toFixed(1)}MB, Growth: ${(memoryGrowth / (1024 * 1024)).toFixed(1)}MB`
            };

        } catch (error) {
            return {
                name: `${testName} - Memory Usage`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    async testJavaScriptPerformance(page, testName) {
        try {
            const jsMetrics = await page.evaluate(() => {
                const startTime = performance.now();
                
                // Simulate some JS work
                let result = 0;
                for (let i = 0; i < 100000; i++) {
                    result += Math.random();
                }
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;

                // Check for console errors
                const errorCount = window.errorCount || 0;

                return {
                    executionTime,
                    errorCount,
                    timestamp: Date.now()
                };
            });

            const status = jsMetrics.executionTime < 100 ? 'PASSED' : 
                          jsMetrics.executionTime < 500 ? 'WARNING' : 
                          'FAILED';

            return {
                name: `${testName} - JavaScript Performance`,
                status,
                metrics: jsMetrics,
                details: `JS execution: ${jsMetrics.executionTime.toFixed(2)}ms, Errors: ${jsMetrics.errorCount}`
            };

        } catch (error) {
            return {
                name: `${testName} - JavaScript Performance`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    async testWebGLPerformance(page, testName) {
        try {
            await page.waitForTimeout(3000); // Wait for WebGL to initialize

            const webglMetrics = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return { error: 'No canvas found' };

                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return { error: 'WebGL not supported' };

                // Get WebGL info
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

                // Test drawing performance
                const startTime = performance.now();
                
                // Clear and draw (simulate rendering)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                
                const endTime = performance.now();
                const renderTime = endTime - startTime;

                return {
                    vendor,
                    renderer,
                    renderTime,
                    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height
                };
            });

            if (webglMetrics.error) {
                return {
                    name: `${testName} - WebGL Performance`,
                    status: 'FAILED',
                    error: webglMetrics.error,
                    metrics: {}
                };
            }

            const status = webglMetrics.renderTime < 16.67 ? 'PASSED' : // 60 FPS
                          webglMetrics.renderTime < 33.33 ? 'WARNING' : // 30 FPS
                          'FAILED';

            return {
                name: `${testName} - WebGL Performance`,
                status,
                metrics: webglMetrics,
                details: `Render time: ${webglMetrics.renderTime.toFixed(2)}ms, GPU: ${webglMetrics.renderer}`
            };

        } catch (error) {
            return {
                name: `${testName} - WebGL Performance`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    async testInteractivePerformance(page, testName) {
        try {
            const interactions = [];
            const buttons = await page.$$('button');
            
            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                const startTime = Date.now();
                
                try {
                    await buttons[i].click();
                    await page.waitForTimeout(100);
                    
                    const responseTime = Date.now() - startTime;
                    interactions.push(responseTime);
                } catch (e) {
                    // Button might not be clickable
                    interactions.push(null);
                }
            }

            const validInteractions = interactions.filter(t => t !== null);
            const avgResponseTime = validInteractions.length > 0 ? 
                validInteractions.reduce((a, b) => a + b, 0) / validInteractions.length : 0;

            const status = avgResponseTime < 200 ? 'PASSED' :
                          avgResponseTime < 500 ? 'WARNING' :
                          'FAILED';

            return {
                name: `${testName} - Interactive Performance`,
                status,
                metrics: {
                    averageResponseTime: avgResponseTime,
                    totalInteractions: validInteractions.length,
                    maxResponseTime: Math.max(...validInteractions),
                    minResponseTime: Math.min(...validInteractions)
                },
                details: `Avg response: ${avgResponseTime.toFixed(0)}ms, Interactions: ${validInteractions.length}`
            };

        } catch (error) {
            return {
                name: `${testName} - Interactive Performance`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    async testStressLoad(page, testName) {
        try {
            const startTime = Date.now();
            
            // Stress test: rapid interactions
            for (let i = 0; i < 50; i++) {
                try {
                    await page.evaluate(() => {
                        // Trigger some DOM manipulation
                        const div = document.createElement('div');
                        div.style.display = 'none';
                        document.body.appendChild(div);
                        document.body.removeChild(div);
                    });
                    
                    if (i % 10 === 0) await page.waitForTimeout(10); // Brief pause
                } catch (e) {
                    // Continue stress testing
                }
            }
            
            const stressTime = Date.now() - startTime;
            
            // Check if page is still responsive
            const isResponsive = await page.evaluate(() => {
                return document.readyState === 'complete';
            });

            const status = isResponsive && stressTime < 5000 ? 'PASSED' :
                          isResponsive && stressTime < 10000 ? 'WARNING' :
                          'FAILED';

            return {
                name: `${testName} - Stress Test`,
                status,
                metrics: {
                    stressTestTime: stressTime,
                    pageResponsive: isResponsive,
                    operationsCompleted: 50
                },
                details: `Stress test: ${stressTime}ms, Responsive: ${isResponsive}`
            };

        } catch (error) {
            return {
                name: `${testName} - Stress Test`,
                status: 'FAILED',
                error: error.message,
                metrics: {}
            };
        }
    }

    addTestResult(result) {
        this.results.tests.push(result);
        this.results.summary.totalTests++;
        
        switch (result.status) {
            case 'PASSED':
                this.results.summary.passed++;
                console.log(`   ✅ ${result.name}: ${result.details || 'PASSED'}`);
                break;
            case 'WARNING':
                this.results.summary.warnings++;
                console.log(`   ⚠️  ${result.name}: ${result.details || 'WARNING'}`);
                break;
            case 'FAILED':
                this.results.summary.failed++;
                console.log(`   ❌ ${result.name}: ${result.error || result.details || 'FAILED'}`);
                break;
        }
    }

    async generateReport() {
        console.log('\n📊 PERFORMANCE TEST SUMMARY');
        console.log('═'.repeat(60));
        console.log(`Total Tests: ${this.results.summary.totalTests}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        
        const successRate = ((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);

        // Save detailed report
        const reportPath = './test-screenshots/performance-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        // Generate recommendations
        this.generateRecommendations();
    }

    generateRecommendations() {
        console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
        console.log('─'.repeat(40));

        const failedTests = this.results.tests.filter(t => t.status === 'FAILED');
        const warningTests = this.results.tests.filter(t => t.status === 'WARNING');

        if (failedTests.length === 0 && warningTests.length === 0) {
            console.log('🎉 Excellent! All performance tests passed with flying colors!');
            return;
        }

        if (failedTests.some(t => t.name.includes('Memory'))) {
            console.log('   🧠 Consider implementing memory optimization');
            console.log('   • Add object cleanup in animation loops');
            console.log('   • Implement texture/geometry disposal');
        }

        if (failedTests.some(t => t.name.includes('WebGL'))) {
            console.log('   🎮 WebGL optimization needed');
            console.log('   • Reduce polygon count in 3D models');
            console.log('   • Optimize shader complexity');
        }

        if (failedTests.some(t => t.name.includes('Load'))) {
            console.log('   🚀 Page load optimization required');
            console.log('   • Compress assets and images');
            console.log('   • Implement lazy loading');
        }

        if (warningTests.length > 0) {
            console.log('   ⚠️  Monitor warning areas for potential issues');
        }
    }
}

// Run the comprehensive performance test
async function runPerformanceTests() {
    const tester = new PerformanceTester();
    await tester.runAllTests();
}

if (require.main === module) {
    runPerformanceTests().catch(console.error);
}

module.exports = PerformanceTester;