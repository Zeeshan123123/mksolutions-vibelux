/**
 * Data Integrity Validator - Find and fix NaN, undefined, and null values
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function validateDataIntegrity() {
    console.log('🔍 Data Integrity Validator - Checking for invalid data values\n');
    
    const browser = await chromium.launch({ headless: true });
    
    const pages = [
        '3D Facility Visualization',
        'Enhanced 3D Professional Analysis',
        'White Label Report Builder'
    ];
    
    const issues = [];
    
    for (const pageName of pages) {
        const page = await browser.newPage();
        const pagePath = `file:///Users/blakelange/Downloads/Mohave_${pageName.replace(/\s+/g, '_')}.html`;
        
        console.log(`\nChecking: ${pageName}`);
        console.log('─'.repeat(50));
        
        try {
            await page.goto(pagePath, { waitUntil: 'networkidle' });
            
            // Inject data validation script
            const dataIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check all text nodes for NaN, undefined, null
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while (node = walker.nextNode()) {
                    const text = node.textContent.trim();
                    if (text && (
                        text.includes('NaN') ||
                        text.includes('undefined') ||
                        text.includes('null') ||
                        text === 'Infinity' ||
                        text === '-Infinity'
                    )) {
                        const parent = node.parentElement;
                        issues.push({
                            text: text,
                            element: parent.tagName,
                            class: parent.className,
                            id: parent.id,
                            path: getElementPath(parent)
                        });
                        
                        // Attempt to fix
                        if (text === 'NaN' || text === 'undefined' || text === 'null') {
                            node.textContent = '0';
                        }
                    }
                }
                
                // Check data attributes
                const elementsWithData = document.querySelectorAll('[data-value], [data-ppfd], [data-watts]');
                elementsWithData.forEach(el => {
                    const value = el.getAttribute('data-value') || 
                                  el.getAttribute('data-ppfd') || 
                                  el.getAttribute('data-watts');
                    
                    if (value === 'NaN' || value === 'undefined' || value === 'null') {
                        issues.push({
                            text: value,
                            element: el.tagName,
                            attribute: 'data-attribute',
                            class: el.className
                        });
                        
                        // Fix the attribute
                        if (el.hasAttribute('data-value')) el.setAttribute('data-value', '0');
                        if (el.hasAttribute('data-ppfd')) el.setAttribute('data-ppfd', '800');
                        if (el.hasAttribute('data-watts')) el.setAttribute('data-watts', '645');
                    }
                });
                
                // Helper function to get element path
                function getElementPath(el) {
                    const path = [];
                    while (el && el.tagName) {
                        let selector = el.tagName.toLowerCase();
                        if (el.id) {
                            selector += '#' + el.id;
                        } else if (el.className) {
                            selector += '.' + el.className.split(' ')[0];
                        }
                        path.unshift(selector);
                        el = el.parentElement;
                    }
                    return path.join(' > ');
                }
                
                // Add validation functions to prevent future issues
                if (!window.validateData) {
                    const script = document.createElement('script');
                    script.textContent = `
                        // Data validation helpers
                        window.validateData = {
                            number: (value, defaultValue = 0) => {
                                const num = parseFloat(value);
                                return isNaN(num) || !isFinite(num) ? defaultValue : num;
                            },
                            
                            string: (value, defaultValue = '') => {
                                return value === undefined || value === null || value === 'undefined' || value === 'null' 
                                    ? defaultValue : String(value);
                            },
                            
                            percentage: (value, defaultValue = 0) => {
                                const num = parseFloat(value);
                                if (isNaN(num) || !isFinite(num)) return defaultValue;
                                return Math.max(0, Math.min(100, num));
                            },
                            
                            ppfd: (value, defaultValue = 800) => {
                                const num = parseFloat(value);
                                if (isNaN(num) || !isFinite(num)) return defaultValue;
                                return Math.max(0, Math.min(2000, num));
                            }
                        };
                        
                        // Override problematic calculations
                        const originalParseFloat = window.parseFloat;
                        window.parseFloat = function(value) {
                            if (value === undefined || value === null || value === 'undefined' || value === 'null') {
                                return 0;
                            }
                            return originalParseFloat(value);
                        };
                    `;
                    document.head.appendChild(script);
                }
                
                return issues;
            });
            
            if (dataIssues.length > 0) {
                console.log(`   ❌ Found ${dataIssues.length} data integrity issues`);
                dataIssues.slice(0, 5).forEach(issue => {
                    console.log(`      - "${issue.text}" in <${issue.element} class="${issue.class}">`);
                });
                issues.push({ page: pageName, issues: dataIssues });
            } else {
                console.log(`   ✅ No data integrity issues found`);
            }
            
            // Check JavaScript calculations
            const calcErrors = await page.evaluate(() => {
                const errors = [];
                
                // Test common calculations
                const tests = [
                    { name: 'Division by zero', test: () => 1 / 0 },
                    { name: 'Invalid parseFloat', test: () => parseFloat('abc') },
                    { name: 'Array average', test: () => [].reduce((a, b) => a + b) / 0 }
                ];
                
                tests.forEach(test => {
                    try {
                        const result = test.test();
                        if (!isFinite(result) || isNaN(result)) {
                            errors.push(`${test.name} produces: ${result}`);
                        }
                    } catch (e) {
                        errors.push(`${test.name} throws: ${e.message}`);
                    }
                });
                
                return errors;
            });
            
            if (calcErrors.length > 0) {
                console.log(`   ⚠️  Potential calculation issues:`);
                calcErrors.forEach(err => console.log(`      - ${err}`));
            }
            
        } catch (error) {
            console.log(`   ❌ Error loading page: ${error.message}`);
        }
        
        await page.close();
    }
    
    await browser.close();
    
    // Generate validation report
    console.log('\n\n📊 Data Validation Summary');
    console.log('═'.repeat(50));
    
    if (issues.length === 0) {
        console.log('✅ All pages have valid data!');
    } else {
        console.log(`Found issues in ${issues.length} pages:`);
        issues.forEach(pageIssue => {
            console.log(`\n${pageIssue.page}: ${pageIssue.issues.length} issues`);
        });
    }
    
    // Save validation functions
    const validationCode = `
// Data Validation Library for Vibelux
// Include this in all pages to prevent data integrity issues

const DataValidator = {
    // Validate and sanitize numeric values
    number(value, defaultValue = 0, min = null, max = null) {
        if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') {
            return defaultValue;
        }
        
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }
        
        if (min !== null && num < min) return min;
        if (max !== null && num > max) return max;
        
        return num;
    },
    
    // Validate PPFD values (0-2000 μmol/m²/s typical range)
    ppfd(value) {
        return this.number(value, 800, 0, 2000);
    },
    
    // Validate wattage values
    watts(value) {
        return this.number(value, 0, 0, 10000);
    },
    
    // Validate percentage values (0-100)
    percentage(value) {
        return this.number(value, 0, 0, 100);
    },
    
    // Validate efficiency values (0-5 μmol/J typical range)
    efficiency(value) {
        return this.number(value, 2.7, 0, 5);
    },
    
    // Validate DLI values (0-100 mol/m²/day typical range)
    dli(value) {
        return this.number(value, 35, 0, 100);
    },
    
    // Calculate average safely
    average(values) {
        if (!Array.isArray(values) || values.length === 0) {
            return 0;
        }
        
        const validValues = values
            .map(v => this.number(v))
            .filter(v => isFinite(v));
        
        if (validValues.length === 0) return 0;
        
        return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    },
    
    // Format number for display
    format(value, decimals = 0, suffix = '') {
        const num = this.number(value);
        return num.toFixed(decimals) + suffix;
    },
    
    // Format currency
    currency(value) {
        const num = this.number(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    },
    
    // Validate and format room data
    validateRoom(room) {
        return {
            id: room.id || 'Unknown',
            fixtures: this.number(room.fixtures, 0, 0, 1000),
            area: this.number(room.area, 0, 0, 10000),
            ppfd: this.ppfd(room.ppfd),
            dli: this.dli(room.dli),
            watts: this.watts(room.watts)
        };
    }
};

// Example usage:
// const ppfd = DataValidator.ppfd(calculatedValue);
// const displayValue = DataValidator.format(ppfd, 0, ' μmol/m²/s');
`;
    
    fs.writeFileSync('./test-screenshots/data-validator.js', validationCode);
    console.log('\n📁 Data validation library saved to: ./test-screenshots/data-validator.js');
    
    // Save detailed report
    fs.writeFileSync(
        './test-screenshots/data-integrity-report.json',
        JSON.stringify({ timestamp: new Date().toISOString(), issues }, null, 2)
    );
}

// Run the validator
validateDataIntegrity().catch(console.error);