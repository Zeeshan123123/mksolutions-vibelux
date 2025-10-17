#!/usr/bin/env node

/**
 * Vibelux Debugging Toolkit
 * Master script to run various debugging and fixing tools
 */

const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOLS = [
    {
        id: 1,
        name: 'Quick Issue Finder',
        script: 'quick-issue-finder.js',
        description: 'Fast scan for common issues across all pages',
        time: '~30 seconds'
    },
    {
        id: 2,
        name: 'Comprehensive Site Test',
        script: 'comprehensive-site-test.js',
        description: 'Full test suite with screenshots and performance metrics',
        time: '~2-3 minutes'
    },
    {
        id: 3,
        name: 'Extensive Review Simulation',
        script: 'extensive-review-simulation.js',
        description: 'Simulates 50 different programmers reviewing the site',
        time: '~5-10 minutes'
    },
    {
        id: 4,
        name: 'Detailed Button Debugger',
        script: 'detailed-button-debugger.js',
        description: 'Deep analysis of button clickability and z-index issues',
        time: '~1 minute'
    },
    {
        id: 5,
        name: 'Z-Index Specific Fixer',
        script: 'z-index-specific-fixer.js',
        description: 'Targeted fix for button overlay issues',
        time: '~1 minute'
    },
    {
        id: 6,
        name: 'Mobile Responsive Fixer',
        script: 'mobile-responsive-fixer.js',
        description: 'Automatically fixes mobile compatibility issues',
        time: '~1 minute'
    },
    {
        id: 7,
        name: 'Accessibility Auto-Fixer',
        script: 'accessibility-auto-fixer.js',
        description: 'Fixes WCAG compliance issues automatically',
        time: '~1 minute'
    },
    {
        id: 8,
        name: 'Data Integrity Validator',
        script: 'data-integrity-validator.js',
        description: 'Finds and fixes NaN/undefined/null display issues',
        time: '~30 seconds'
    },
    {
        id: 9,
        name: 'Comprehensive Site Fixer',
        script: 'comprehensive-site-fixer.js',
        description: 'Runs all fixing scripts in sequence',
        time: '~5 minutes'
    },
    {
        id: 10,
        name: 'View Test Reports',
        action: 'viewReports',
        description: 'Display all generated test reports',
        time: 'Instant'
    },
    {
        id: 11,
        name: 'Clean Test Artifacts',
        action: 'clean',
        description: 'Remove all test screenshots and reports',
        time: 'Instant'
    }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayMenu() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║               VIBELUX DEBUGGING TOOLKIT                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nAvailable debugging and fixing tools:\n');
    
    TOOLS.forEach(tool => {
        console.log(`  ${tool.id}. ${tool.name} (${tool.time})`);
        console.log(`     ${tool.description}\n`);
    });
    
    console.log('  0. Exit\n');
}

function runTool(toolId) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) {
        console.log('Invalid selection!');
        return Promise.resolve();
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Running: ${tool.name}`);
    console.log('═'.repeat(60) + '\n');
    
    if (tool.action === 'viewReports') {
        return viewReports();
    } else if (tool.action === 'clean') {
        return cleanArtifacts();
    }
    
    return new Promise((resolve) => {
        const child = exec(`node ${tool.script}`, { 
            cwd: __dirname,
            maxBuffer: 1024 * 1024 * 10
        });
        
        child.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                console.log(`\n⚠️  Tool exited with code ${code}`);
            }
            console.log('\n✅ Tool completed!');
            resolve();
        });
    });
}

function viewReports() {
    console.log('\n📊 Available Test Reports:\n');
    
    const reportsDir = './test-screenshots';
    if (!fs.existsSync(reportsDir)) {
        console.log('No reports found.');
        return Promise.resolve();
    }
    
    const reports = fs.readdirSync(reportsDir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => {
            const statA = fs.statSync(path.join(reportsDir, a));
            const statB = fs.statSync(path.join(reportsDir, b));
            return statB.mtime - statA.mtime;
        });
    
    if (reports.length === 0) {
        console.log('No reports found.');
        return Promise.resolve();
    }
    
    reports.forEach((report, index) => {
        const stat = fs.statSync(path.join(reportsDir, report));
        const modified = new Date(stat.mtime).toLocaleString();
        console.log(`${index + 1}. ${report}`);
        console.log(`   Modified: ${modified}`);
        console.log(`   Size: ${(stat.size / 1024).toFixed(1)} KB\n`);
    });
    
    return new Promise((resolve) => {
        rl.question('Enter report number to view (or 0 to go back): ', (answer) => {
            const num = parseInt(answer);
            if (num > 0 && num <= reports.length) {
                const reportPath = path.join(reportsDir, reports[num - 1]);
                const content = fs.readFileSync(reportPath, 'utf8');
                console.log('\n' + '─'.repeat(60));
                console.log(content);
                console.log('─'.repeat(60) + '\n');
            }
            resolve();
        });
    });
}

function cleanArtifacts() {
    console.log('\n🧹 Cleaning test artifacts...\n');
    
    const reportsDir = './test-screenshots';
    if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir);
        files.forEach(file => {
            fs.unlinkSync(path.join(reportsDir, file));
            console.log(`   Removed: ${file}`);
        });
        console.log(`\n✅ Cleaned ${files.length} files`);
    } else {
        console.log('No artifacts to clean.');
    }
    
    return Promise.resolve();
}

async function main() {
    let running = true;
    
    while (running) {
        displayMenu();
        
        const answer = await new Promise((resolve) => {
            rl.question('Select a tool (0-11): ', resolve);
        });
        
        const selection = parseInt(answer);
        
        if (selection === 0) {
            running = false;
        } else if (selection >= 1 && selection <= 11) {
            await runTool(selection);
            
            await new Promise((resolve) => {
                rl.question('\nPress Enter to continue...', resolve);
            });
        } else {
            console.log('\nInvalid selection! Please choose 0-11.');
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
    
    console.log('\nGoodbye! 👋\n');
    rl.close();
}

// Check if all required scripts exist
console.log('Checking for required scripts...');
let missingScripts = [];

TOOLS.forEach(tool => {
    if (tool.script && !fs.existsSync(path.join(__dirname, tool.script))) {
        missingScripts.push(tool.script);
    }
});

if (missingScripts.length > 0) {
    console.error('\n❌ Missing required scripts:');
    missingScripts.forEach(script => console.error(`   - ${script}`));
    console.error('\nPlease ensure all scripts are in the tests directory.');
    process.exit(1);
}

// Start the toolkit
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});