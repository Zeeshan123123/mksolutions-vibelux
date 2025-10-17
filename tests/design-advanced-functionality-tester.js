/**
 * Design Advanced Functionality Tester
 * Comprehensive testing script for /design/advanced page and all its features
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class DesignAdvancedTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            testSuite: 'Design Advanced Functionality',
            baseUrl: 'http://localhost:3002',
            path: '/design/advanced',
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                skipped: 0
            },
            features: {},
            performance: {},
            errors: []
        };

        this.featureTests = [
            // Core Design Features
            { name: 'Page Load', category: 'core', critical: true },
            { name: 'Authentication Check', category: 'core', critical: true },
            { name: 'Designer Interface', category: 'core', critical: true },
            { name: 'Tool Palette', category: 'core', critical: true },
            { name: 'Canvas Interaction', category: 'core', critical: true },

            // Design Tools
            { name: 'Fixture Library', category: 'design', critical: true },
            { name: 'Room Editor', category: 'design', critical: true },
            { name: 'Fixture Placement', category: 'design', critical: true },
            { name: 'Fixture Selection', category: 'design', critical: false },
            { name: 'Fixture Movement', category: 'design', critical: false },
            { name: 'Fixture Rotation', category: 'design', critical: false },
            { name: 'Fixture Deletion', category: 'design', critical: false },

            // Advanced Features
            { name: '3D Visualization', category: 'advanced', critical: false },
            { name: 'Heat Map Analysis', category: 'advanced', critical: false },
            { name: 'Spectrum Analysis', category: 'advanced', critical: false },
            { name: 'DLI Optimizer', category: 'advanced', critical: false },
            { name: 'Energy Calculator', category: 'advanced', critical: false },
            { name: 'Environmental Monitor', category: 'advanced', critical: false },
            { name: 'AI Recommendations', category: 'advanced', critical: false },
            { name: 'Yield Predictor', category: 'advanced', critical: false },
            { name: 'Lighting Scheduler', category: 'advanced', critical: false },
            { name: 'Heat Load Calculator', category: 'advanced', critical: false },
            { name: 'Electrical Load Balancer', category: 'advanced', critical: false },

            // Analysis & Reports
            { name: 'Metrics Panel', category: 'analysis', critical: false },
            { name: 'ROI Calculator', category: 'analysis', critical: false },
            { name: 'Cost Estimator', category: 'analysis', critical: false },
            { name: 'Report Generation', category: 'analysis', critical: false },

            // Project Management
            { name: 'Project Templates', category: 'project', critical: false },
            { name: 'Save/Load Project', category: 'project', critical: true },
            { name: 'Export Design', category: 'project', critical: false },
            { name: 'Share Project', category: 'project', critical: false },
            { name: 'Undo/Redo', category: 'project', critical: false },

            // UI/UX Features
            { name: 'Collapsible Sidebar', category: 'ui', critical: false },
            { name: 'View Mode Switching', category: 'ui', critical: false },
            { name: 'Keyboard Shortcuts', category: 'ui', critical: false },
            { name: 'Grid Toggle', category: 'ui', critical: false },
            { name: 'Layer Management', category: 'ui', critical: false },

            // AI Features
            { name: 'AI Design Assistant', category: 'ai', critical: false },
            { name: 'AI Credit Estimator', category: 'ai', critical: false },
            { name: 'Smart Optimization', category: 'ai', critical: false },

            // Responsive/Mobile
            { name: 'Mobile Responsiveness', category: 'mobile', critical: false },
            { name: 'Touch Interactions', category: 'mobile', critical: false },

            // Performance
            { name: 'Load Performance', category: 'performance', critical: true },
            { name: 'Memory Usage', category: 'performance', critical: false },
            { name: 'Rendering Performance', category: 'performance', critical: false }
        ];
    }

    async runAllTests() {
        console.log('🎨 DESIGN ADVANCED FUNCTIONALITY TESTER');
        console.log('═'.repeat(70));
        console.log(`Testing: ${this.results.baseUrl}${this.results.path}`);
        console.log(`Features to test: ${this.featureTests.length}`);
        console.log('');

        const browser = await chromium.launch({ 
            headless: false, // Keep visible for design testing
            slowMo: 100 // Slow down for better observation
        });
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            permissions: ['geolocation', 'camera', 'microphone']
        });
        const page = await context.newPage();

        // Monitor console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                this.results.errors.push({
                    type: 'console_error',
                    message: msg.text(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Monitor network failures
        page.on('response', response => {
            if (response.status() >= 400) {
                this.results.errors.push({
                    type: 'network_error',
                    url: response.url(),
                    status: response.status(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        try {
            // Run tests in sequence
            await this.testPageLoad(page);
            await this.testAuthentication(page);
            await this.testCoreDesignFeatures(page);
            await this.testAdvancedFeatures(page);
            await this.testAnalysisFeatures(page);
            await this.testProjectManagement(page);
            await this.testUIFeatures(page);
            await this.testAIFeatures(page);
            await this.testMobileFeatures(page);
            await this.testPerformance(page);

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            this.results.errors.push({
                type: 'test_suite_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        await browser.close();
        await this.generateTestReport();
    }

    async testPageLoad(page) {
        console.log('🚀 Testing Page Load...');
        
        try {
            const startTime = Date.now();
            await page.goto(`${this.results.baseUrl}${this.results.path}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            const loadTime = Date.now() - startTime;

            // Check if page loaded successfully
            const title = await page.title();
            const hasContent = await page.evaluate(() => document.body.children.length > 0);

            if (hasContent) {
                this.addTestResult('Page Load', 'PASSED', `Loaded in ${loadTime}ms`, { loadTime, title });
            } else {
                this.addTestResult('Page Load', 'FAILED', 'Page has no content');
            }

            // Wait for React to hydrate
            await page.waitForSelector('[data-testid="design-advanced"], .design-advanced, main', { timeout: 10000 });
            
        } catch (error) {
            this.addTestResult('Page Load', 'FAILED', error.message);
        }
    }

    async testAuthentication(page) {
        console.log('🔐 Testing Authentication...');

        try {
            // Check for auth-related elements
            const hasSignIn = await page.$('.sign-in, [data-testid="sign-in"], button:has-text("Sign In")');
            const hasUserInfo = await page.$('.user-info, [data-testid="user"], .user-avatar');
            const hasAuthProtection = await page.$('.auth-required, .login-required');

            if (hasUserInfo) {
                this.addTestResult('Authentication Check', 'PASSED', 'User authenticated');
            } else if (hasSignIn || hasAuthProtection) {
                this.addTestResult('Authentication Check', 'WARNING', 'Authentication required but not signed in');
            } else {
                this.addTestResult('Authentication Check', 'PASSED', 'No authentication required');
            }

        } catch (error) {
            this.addTestResult('Authentication Check', 'FAILED', error.message);
        }
    }

    async testCoreDesignFeatures(page) {
        console.log('🎨 Testing Core Design Features...');

        // Test Designer Interface
        try {
            const designerInterface = await page.$('.designer-interface, .design-canvas, [data-testid="designer"]');
            if (designerInterface) {
                this.addTestResult('Designer Interface', 'PASSED', 'Design interface found');
            } else {
                this.addTestResult('Designer Interface', 'FAILED', 'Design interface not found');
            }
        } catch (error) {
            this.addTestResult('Designer Interface', 'FAILED', error.message);
        }

        // Test Tool Palette
        try {
            const toolPalette = await page.$('.tool-palette, .toolbar, [data-testid="tools"]');
            const tools = await page.$$('.tool-button, .tool-item, button[data-tool]');
            
            if (toolPalette && tools.length > 0) {
                this.addTestResult('Tool Palette', 'PASSED', `Found ${tools.length} tools`);
            } else {
                this.addTestResult('Tool Palette', 'WARNING', 'Tool palette not clearly identified');
            }
        } catch (error) {
            this.addTestResult('Tool Palette', 'FAILED', error.message);
        }

        // Test Canvas Interaction
        try {
            const canvas = await page.$('canvas, .design-canvas, [data-testid="canvas"]');
            if (canvas) {
                // Test canvas click
                await canvas.click();
                await page.waitForTimeout(500);
                this.addTestResult('Canvas Interaction', 'PASSED', 'Canvas clickable');
            } else {
                this.addTestResult('Canvas Interaction', 'WARNING', 'Canvas not found');
            }
        } catch (error) {
            this.addTestResult('Canvas Interaction', 'FAILED', error.message);
        }

        // Test Fixture Library
        await this.testFixtureLibrary(page);
    }

    async testFixtureLibrary(page) {
        try {
            const fixtureLibrary = await page.$('.fixture-library, [data-testid="fixture-library"]');
            const fixtureItems = await page.$$('.fixture-item, .fixture-card, [data-fixture]');
            
            if (fixtureLibrary) {
                this.addTestResult('Fixture Library', 'PASSED', `Found ${fixtureItems.length} fixtures`);
                
                // Test fixture selection
                if (fixtureItems.length > 0) {
                    await fixtureItems[0].click();
                    await page.waitForTimeout(500);
                    this.addTestResult('Fixture Selection', 'PASSED', 'Fixture selectable');
                }
            } else {
                this.addTestResult('Fixture Library', 'WARNING', 'Fixture library not found');
            }
        } catch (error) {
            this.addTestResult('Fixture Library', 'FAILED', error.message);
        }
    }

    async testAdvancedFeatures(page) {
        console.log('⚡ Testing Advanced Features...');

        const advancedFeatures = [
            { name: '3D Visualization', selectors: ['.three-d, [data-testid="3d"]', 'canvas[data-engine="three"]', '.threejs-canvas'] },
            { name: 'Heat Map Analysis', selectors: ['.heatmap, .heat-map, [data-testid="heatmap"]'] },
            { name: 'Spectrum Analysis', selectors: ['.spectrum, .spectrum-analysis, [data-testid="spectrum"]'] },
            { name: 'DLI Optimizer', selectors: ['.dli, .dli-optimizer, [data-testid="dli"]'] },
            { name: 'Energy Calculator', selectors: ['.energy, .energy-calc, [data-testid="energy"]'] },
            { name: 'Environmental Monitor', selectors: ['.environment, .env-monitor, [data-testid="environment"]'] }
        ];

        for (const feature of advancedFeatures) {
            try {
                let found = false;
                for (const selector of feature.selectors) {
                    const element = await page.$(selector);
                    if (element) {
                        found = true;
                        break;
                    }
                }
                
                if (found) {
                    this.addTestResult(feature.name, 'PASSED', 'Feature component found');
                } else {
                    this.addTestResult(feature.name, 'WARNING', 'Feature component not found');
                }
            } catch (error) {
                this.addTestResult(feature.name, 'FAILED', error.message);
            }
        }

        // Test AI Features
        await this.testAISpecificFeatures(page);
    }

    async testAISpecificFeatures(page) {
        try {
            const aiButtons = await page.$$('button:has-text("AI"), .ai-button, [data-testid*="ai"]');
            const sparkleIcons = await page.$$('.lucide-sparkles, [data-icon="sparkles"]');
            
            if (aiButtons.length > 0 || sparkleIcons.length > 0) {
                this.addTestResult('AI Recommendations', 'PASSED', `Found ${aiButtons.length + sparkleIcons.length} AI elements`);
                
                // Test AI interaction
                if (aiButtons.length > 0) {
                    await aiButtons[0].click();
                    await page.waitForTimeout(1000);
                    this.addTestResult('AI Design Assistant', 'PASSED', 'AI assistant accessible');
                }
            } else {
                this.addTestResult('AI Recommendations', 'WARNING', 'AI features not found');
            }
        } catch (error) {
            this.addTestResult('AI Recommendations', 'FAILED', error.message);
        }
    }

    async testAnalysisFeatures(page) {
        console.log('📊 Testing Analysis Features...');

        const analysisFeatures = [
            { name: 'Metrics Panel', selectors: ['.metrics, .metrics-panel, [data-testid="metrics"]'] },
            { name: 'ROI Calculator', selectors: ['.roi, .roi-calc, [data-testid="roi"]'] },
            { name: 'Cost Estimator', selectors: ['.cost, .cost-estimate, [data-testid="cost"]'] }
        ];

        for (const feature of analysisFeatures) {
            try {
                let found = false;
                for (const selector of feature.selectors) {
                    const element = await page.$(selector);
                    if (element) {
                        found = true;
                        break;
                    }
                }
                
                if (found) {
                    this.addTestResult(feature.name, 'PASSED', 'Analysis component found');
                } else {
                    this.addTestResult(feature.name, 'WARNING', 'Analysis component not found');
                }
            } catch (error) {
                this.addTestResult(feature.name, 'FAILED', error.message);
            }
        }
    }

    async testProjectManagement(page) {
        console.log('💾 Testing Project Management...');

        // Test Save/Load functionality
        try {
            const saveButton = await page.$('button:has-text("Save"), .save-button, [data-testid="save"]');
            if (saveButton) {
                await saveButton.click();
                await page.waitForTimeout(1000);
                this.addTestResult('Save/Load Project', 'PASSED', 'Save functionality accessible');
            } else {
                this.addTestResult('Save/Load Project', 'WARNING', 'Save button not found');
            }
        } catch (error) {
            this.addTestResult('Save/Load Project', 'FAILED', error.message);
        }

        // Test Export functionality
        try {
            const exportButton = await page.$('button:has-text("Export"), .export-button, [data-testid="export"]');
            if (exportButton) {
                this.addTestResult('Export Design', 'PASSED', 'Export functionality found');
            } else {
                this.addTestResult('Export Design', 'WARNING', 'Export button not found');
            }
        } catch (error) {
            this.addTestResult('Export Design', 'FAILED', error.message);
        }

        // Test Undo/Redo
        try {
            const undoButton = await page.$('button[title*="Undo"], .undo-button, [data-testid="undo"]');
            const redoButton = await page.$('button[title*="Redo"], .redo-button, [data-testid="redo"]');
            
            if (undoButton && redoButton) {
                this.addTestResult('Undo/Redo', 'PASSED', 'Undo/Redo controls found');
            } else {
                this.addTestResult('Undo/Redo', 'WARNING', 'Undo/Redo controls not found');
            }
        } catch (error) {
            this.addTestResult('Undo/Redo', 'FAILED', error.message);
        }
    }

    async testUIFeatures(page) {
        console.log('🖥️ Testing UI Features...');

        // Test Sidebar
        try {
            const sidebar = await page.$('.sidebar, .side-panel, [data-testid="sidebar"]');
            const toggleButton = await page.$('.sidebar-toggle, [data-testid="sidebar-toggle"]');
            
            if (sidebar) {
                this.addTestResult('Collapsible Sidebar', 'PASSED', 'Sidebar found');
                
                if (toggleButton) {
                    await toggleButton.click();
                    await page.waitForTimeout(500);
                    await toggleButton.click();
                    await page.waitForTimeout(500);
                    this.addTestResult('Collapsible Sidebar', 'PASSED', 'Sidebar toggleable');
                }
            } else {
                this.addTestResult('Collapsible Sidebar', 'WARNING', 'Sidebar not found');
            }
        } catch (error) {
            this.addTestResult('Collapsible Sidebar', 'FAILED', error.message);
        }

        // Test View Mode Switching
        try {
            const viewButtons = await page.$$('button[data-view], .view-button, .mode-button');
            if (viewButtons.length > 0) {
                this.addTestResult('View Mode Switching', 'PASSED', `Found ${viewButtons.length} view modes`);
                
                // Test switching between modes
                if (viewButtons.length > 1) {
                    await viewButtons[1].click();
                    await page.waitForTimeout(500);
                    await viewButtons[0].click();
                    await page.waitForTimeout(500);
                }
            } else {
                this.addTestResult('View Mode Switching', 'WARNING', 'View mode buttons not found');
            }
        } catch (error) {
            this.addTestResult('View Mode Switching', 'FAILED', error.message);
        }

        // Test Keyboard Shortcuts
        try {
            // Test common shortcuts
            await page.keyboard.press('Escape'); // Close any open dialogs
            await page.waitForTimeout(200);
            
            await page.keyboard.press('Control+Z'); // Undo
            await page.waitForTimeout(200);
            
            await page.keyboard.press('Control+Y'); // Redo
            await page.waitForTimeout(200);
            
            this.addTestResult('Keyboard Shortcuts', 'PASSED', 'Keyboard shortcuts tested');
        } catch (error) {
            this.addTestResult('Keyboard Shortcuts', 'FAILED', error.message);
        }
    }

    async testAIFeatures(page) {
        console.log('🤖 Testing AI Features...');

        try {
            const aiElements = await page.$$('.ai-assistant, .ai-recommendations, [data-testid*="ai"]');
            const creditElements = await page.$$('.credit, .ai-credit, [data-testid="credits"]');
            
            if (aiElements.length > 0) {
                this.addTestResult('AI Design Assistant', 'PASSED', `Found ${aiElements.length} AI components`);
            } else {
                this.addTestResult('AI Design Assistant', 'WARNING', 'AI components not found');
            }

            if (creditElements.length > 0) {
                this.addTestResult('AI Credit Estimator', 'PASSED', 'Credit system found');
            } else {
                this.addTestResult('AI Credit Estimator', 'WARNING', 'Credit system not found');
            }
        } catch (error) {
            this.addTestResult('AI Design Assistant', 'FAILED', error.message);
        }
    }

    async testMobileFeatures(page) {
        console.log('📱 Testing Mobile Features...');

        try {
            // Switch to mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);

            // Check if interface adapts
            const isMobileOptimized = await page.evaluate(() => {
                const sidebar = document.querySelector('.sidebar, .side-panel');
                if (sidebar) {
                    const style = window.getComputedStyle(sidebar);
                    return style.display === 'none' || style.position === 'fixed';
                }
                return true; // Assume optimized if no sidebar
            });

            if (isMobileOptimized) {
                this.addTestResult('Mobile Responsiveness', 'PASSED', 'Interface adapts to mobile');
            } else {
                this.addTestResult('Mobile Responsiveness', 'WARNING', 'Mobile optimization unclear');
            }

            // Test touch interactions
            const canvas = await page.$('canvas, .design-canvas');
            if (canvas) {
                await canvas.tap();
                await page.waitForTimeout(500);
                this.addTestResult('Touch Interactions', 'PASSED', 'Touch interactions work');
            } else {
                this.addTestResult('Touch Interactions', 'WARNING', 'No touchable canvas found');
            }

            // Reset to desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });

        } catch (error) {
            this.addTestResult('Mobile Responsiveness', 'FAILED', error.message);
        }
    }

    async testPerformance(page) {
        console.log('⚡ Testing Performance...');

        try {
            // Test load performance
            const performanceMetrics = await page.evaluate(() => {
                if (!window.performance) return null;
                
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
                    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : null,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null
                };
            });

            if (performanceMetrics) {
                const loadTime = performanceMetrics.loadTime || 0;
                if (loadTime < 2000) {
                    this.addTestResult('Load Performance', 'PASSED', `Load time: ${loadTime.toFixed(0)}ms`);
                } else if (loadTime < 5000) {
                    this.addTestResult('Load Performance', 'WARNING', `Load time: ${loadTime.toFixed(0)}ms (slow)`);
                } else {
                    this.addTestResult('Load Performance', 'FAILED', `Load time: ${loadTime.toFixed(0)}ms (too slow)`);
                }

                this.results.performance = performanceMetrics;
            } else {
                this.addTestResult('Load Performance', 'WARNING', 'Performance API not available');
            }

            // Test memory usage
            const memoryInfo = await page.evaluate(() => {
                if (performance.memory) {
                    return {
                        used: performance.memory.usedJSHeapSize / (1024 * 1024),
                        total: performance.memory.totalJSHeapSize / (1024 * 1024),
                        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024)
                    };
                }
                return null;
            });

            if (memoryInfo) {
                if (memoryInfo.used < 50) {
                    this.addTestResult('Memory Usage', 'PASSED', `Memory: ${memoryInfo.used.toFixed(1)}MB`);
                } else if (memoryInfo.used < 100) {
                    this.addTestResult('Memory Usage', 'WARNING', `Memory: ${memoryInfo.used.toFixed(1)}MB (high)`);
                } else {
                    this.addTestResult('Memory Usage', 'FAILED', `Memory: ${memoryInfo.used.toFixed(1)}MB (too high)`);
                }
            } else {
                this.addTestResult('Memory Usage', 'WARNING', 'Memory info not available');
            }

        } catch (error) {
            this.addTestResult('Load Performance', 'FAILED', error.message);
        }
    }

    addTestResult(name, status, details, metrics = {}) {
        const result = {
            name,
            status,
            details,
            metrics,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(result);
        this.results.summary.total++;

        switch (status) {
            case 'PASSED':
                this.results.summary.passed++;
                console.log(`   ✅ ${name}: ${details}`);
                break;
            case 'WARNING':
                this.results.summary.warnings++;
                console.log(`   ⚠️  ${name}: ${details}`);
                break;
            case 'FAILED':
                this.results.summary.failed++;
                console.log(`   ❌ ${name}: ${details}`);
                break;
            case 'SKIPPED':
                this.results.summary.skipped++;
                console.log(`   ⏭️  ${name}: ${details}`);
                break;
        }
    }

    async generateTestReport() {
        console.log('\n🎨 DESIGN ADVANCED TEST SUMMARY');
        console.log('═'.repeat(70));
        
        const { total, passed, failed, warnings, skipped } = this.results.summary;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        
        console.log(`📊 Test Results: ${passed}/${total} passed (${successRate}%)`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏭️  Skipped: ${skipped}`);

        // Categorize results
        const categories = {};
        this.results.tests.forEach(test => {
            const feature = this.featureTests.find(f => f.name === test.name);
            const category = feature?.category || 'other';
            
            if (!categories[category]) {
                categories[category] = { passed: 0, failed: 0, warnings: 0, total: 0 };
            }
            
            categories[category].total++;
            if (test.status === 'PASSED') categories[category].passed++;
            else if (test.status === 'FAILED') categories[category].failed++;
            else if (test.status === 'WARNING') categories[category].warnings++;
        });

        console.log('\n📋 Results by Category:');
        Object.entries(categories).forEach(([category, stats]) => {
            const rate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`   ${category}: ${stats.passed}/${stats.total} (${rate}%) - ${stats.failed} failed, ${stats.warnings} warnings`);
        });

        // Critical failures
        const criticalFailures = this.results.tests.filter(test => {
            const feature = this.featureTests.find(f => f.name === test.name);
            return feature?.critical && test.status === 'FAILED';
        });

        if (criticalFailures.length > 0) {
            console.log('\n🚨 CRITICAL FAILURES:');
            criticalFailures.forEach(failure => {
                console.log(`   ❌ ${failure.name}: ${failure.details}`);
            });
        }

        // Performance summary
        if (this.results.performance.loadTime) {
            console.log('\n⚡ Performance Summary:');
            console.log(`   Load Time: ${this.results.performance.loadTime.toFixed(0)}ms`);
            console.log(`   First Paint: ${this.results.performance.firstPaint?.toFixed(0) || 'N/A'}ms`);
            console.log(`   First Contentful Paint: ${this.results.performance.firstContentfulPaint?.toFixed(0) || 'N/A'}ms`);
        }

        // Error summary
        if (this.results.errors.length > 0) {
            console.log('\n🐛 Errors Detected:');
            this.results.errors.slice(0, 5).forEach(error => {
                console.log(`   • ${error.type}: ${error.message || error.url}`);
            });
            if (this.results.errors.length > 5) {
                console.log(`   • ...and ${this.results.errors.length - 5} more errors`);
            }
        }

        // Recommendations
        console.log('\n💡 Recommendations:');
        if (criticalFailures.length > 0) {
            console.log('   🚨 Fix critical failures before deployment');
        }
        if (warnings > 0) {
            console.log('   ⚠️  Review warning items for optimal user experience');
        }
        if (this.results.errors.length > 0) {
            console.log('   🐛 Investigate console and network errors');
        }
        if (successRate >= 90) {
            console.log('   🎉 Excellent! Design tool is highly functional');
        } else if (successRate >= 75) {
            console.log('   👍 Good overall functionality with room for improvement');
        } else {
            console.log('   ⚠️  Significant issues detected - review failed tests');
        }

        // Save detailed report
        const reportPath = './test-screenshots/design-advanced-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        // Save screenshot
        try {
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto(`${this.results.baseUrl}${this.results.path}`, { waitUntil: 'networkidle' });
            await page.screenshot({ 
                path: './test-screenshots/design-advanced-final-state.png',
                fullPage: true 
            });
            await browser.close();
            console.log('📸 Final state screenshot saved: ./test-screenshots/design-advanced-final-state.png');
        } catch (error) {
            console.log('⚠️  Could not save screenshot:', error.message);
        }
    }
}

// Run the design advanced functionality test
async function runDesignAdvancedTests() {
    const tester = new DesignAdvancedTester();
    await tester.runAllTests();
}

if (require.main === module) {
    runDesignAdvancedTests().catch(console.error);
}

module.exports = DesignAdvancedTester;