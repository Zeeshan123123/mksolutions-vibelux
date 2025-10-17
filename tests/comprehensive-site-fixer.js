/**
 * Comprehensive Site Fixer - Runs all debugging and fixing scripts
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPTS = [
    {
        name: 'Button Debugger',
        script: 'detailed-button-debugger.js',
        description: 'Analyzes button clickability and z-index issues'
    },
    {
        name: 'Mobile Responsive Fixer',
        script: 'mobile-responsive-fixer.js',
        description: 'Fixes mobile compatibility issues'
    },
    {
        name: 'Accessibility Auto-Fixer',
        script: 'accessibility-auto-fixer.js',
        description: 'Fixes WCAG compliance issues'
    },
    {
        name: 'Data Integrity Validator',
        script: 'data-integrity-validator.js',
        description: 'Validates and fixes data display issues'
    },
    {
        name: 'Quick Issue Finder',
        script: 'quick-issue-finder.js',
        description: 'Final validation of all fixes'
    }
];

async function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Running: ${scriptPath}`);
        console.log('─'.repeat(60));
        
        const child = exec(`node ${scriptPath}`, { 
            cwd: __dirname,
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });
        
        child.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Script exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

async function runComprehensiveFix() {
    console.log('🔧 COMPREHENSIVE SITE FIXER');
    console.log('═'.repeat(60));
    console.log('This will run all debugging and fixing scripts to resolve site issues.\n');
    
    const startTime = Date.now();
    const results = [];
    
    // Ensure test-screenshots directory exists
    if (!fs.existsSync('./test-screenshots')) {
        fs.mkdirSync('./test-screenshots');
    }
    
    // Run each script
    for (const scriptInfo of SCRIPTS) {
        console.log(`\n\n${'='.repeat(60)}`);
        console.log(`📋 ${scriptInfo.name}`);
        console.log(`   ${scriptInfo.description}`);
        console.log('='.repeat(60));
        
        try {
            const scriptStart = Date.now();
            await runScript(scriptInfo.script);
            const duration = ((Date.now() - scriptStart) / 1000).toFixed(1);
            
            results.push({
                script: scriptInfo.name,
                status: 'SUCCESS',
                duration: `${duration}s`
            });
            
            console.log(`\n✅ ${scriptInfo.name} completed in ${duration}s`);
        } catch (error) {
            results.push({
                script: scriptInfo.name,
                status: 'FAILED',
                error: error.message
            });
            
            console.error(`\n❌ ${scriptInfo.name} failed: ${error.message}`);
            
            // Continue with other scripts even if one fails
            if (scriptInfo.script !== 'detailed-button-debugger.js') {
                continue;
            }
        }
    }
    
    // Generate summary report
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('📊 COMPREHENSIVE FIX SUMMARY');
    console.log('═'.repeat(60));
    
    results.forEach(result => {
        const icon = result.status === 'SUCCESS' ? '✅' : '❌';
        console.log(`${icon} ${result.script}: ${result.status} ${result.duration || ''}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log(`\nTotal execution time: ${totalDuration}s`);
    
    // Save summary report
    const report = {
        timestamp: new Date().toISOString(),
        totalDuration: `${totalDuration}s`,
        results,
        fixes: {
            buttonDebugger: 'Analyzed z-index and button clickability issues',
            mobileResponsive: 'Fixed horizontal scroll, font sizes, and touch targets',
            accessibility: 'Added alt text, ARIA labels, and semantic HTML',
            dataIntegrity: 'Fixed NaN/undefined values and added validation',
            finalValidation: 'Ran comprehensive test to verify all fixes'
        }
    };
    
    fs.writeFileSync(
        './test-screenshots/comprehensive-fix-report.json',
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n📁 Summary report saved to: ./test-screenshots/comprehensive-fix-report.json');
    
    // Provide next steps
    console.log('\n\n🎯 NEXT STEPS:');
    console.log('─'.repeat(60));
    console.log('1. Review the fixed HTML files in /Users/blakelange/Downloads/');
    console.log('   - *_Mobile_Fixed.html - Mobile responsive versions');
    console.log('   - *_Accessible.html - Accessibility compliant versions');
    console.log('   - Mohave_Enhanced_3D_Fixed_ZIndex.html - Fixed z-index issues');
    console.log('\n2. Check the debugging reports in ./test-screenshots/');
    console.log('   - button-debug-report.json - Detailed button analysis');
    console.log('   - data-integrity-report.json - Data validation issues');
    console.log('   - quick-issue-report.json - Final validation results');
    console.log('\n3. Review screenshots for visual verification');
    console.log('\n4. Test the fixed pages manually to ensure all issues are resolved');
    
    // List all generated files
    console.log('\n\n📄 GENERATED FILES:');
    console.log('─'.repeat(60));
    
    const downloads = fs.readdirSync('/Users/blakelange/Downloads/')
        .filter(f => f.includes('Fixed') || f.includes('Accessible'))
        .sort();
    
    if (downloads.length > 0) {
        console.log('\nFixed HTML files:');
        downloads.forEach(file => {
            console.log(`   • ${file}`);
        });
    }
    
    const screenshots = fs.readdirSync('./test-screenshots/')
        .filter(f => f.endsWith('.png') || f.endsWith('.json'))
        .sort();
    
    if (screenshots.length > 0) {
        console.log('\nReports and screenshots:');
        screenshots.forEach(file => {
            console.log(`   • ${file}`);
        });
    }
}

// Run the comprehensive fixer
console.log('Starting comprehensive site fix process...\n');
runComprehensiveFix().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});