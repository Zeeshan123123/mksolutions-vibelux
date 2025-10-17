#!/usr/bin/env node

/**
 * Build Progress Monitor
 * Tracks build progress and identifies bottlenecks
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildMonitor {
  constructor() {
    this.startTime = Date.now();
    this.stages = [];
    this.currentStage = null;
    this.logFile = path.join(__dirname, 'build-performance.log');
  }

  log(message, stage = null) {
    const timestamp = new Date().toISOString();
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const logEntry = `[${timestamp}] [+${elapsed}s] ${stage ? `[${stage}] ` : ''}${message}\n`;
    
    console.log(logEntry.trim());
    fs.appendFileSync(this.logFile, logEntry);
  }

  startStage(stageName) {
    if (this.currentStage) {
      this.endStage();
    }
    
    this.currentStage = {
      name: stageName,
      startTime: Date.now(),
    };
    
    this.log(`Starting stage: ${stageName}`, 'STAGE');
  }

  endStage() {
    if (!this.currentStage) return;
    
    const duration = ((Date.now() - this.currentStage.startTime) / 1000).toFixed(2);
    this.stages.push({
      ...this.currentStage,
      duration: parseFloat(duration),
    });
    
    this.log(`Completed stage: ${this.currentStage.name} (${duration}s)`, 'STAGE');
    this.currentStage = null;
  }

  monitorBuild() {
    this.log('Starting build monitoring', 'MONITOR');
    this.startStage('Build Initialization');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    let errorOutput = '';

    buildProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Parse build stages from Next.js output
      if (text.includes('Creating an optimized production build')) {
        this.startStage('Build Optimization');
      } else if (text.includes('Collecting page data')) {
        this.startStage('Page Data Collection');
      } else if (text.includes('Generating static pages')) {
        this.startStage('Static Page Generation');
      } else if (text.includes('Finalizing page optimization')) {
        this.startStage('Page Optimization');
      } else if (text.includes('Route (pages)') || text.includes('Route (app)')) {
        this.log('Route processing detected', 'BUILD');
      } else if (text.includes('webpack compiled')) {
        this.log('Webpack compilation completed', 'BUILD');
      } else if (text.includes('MB') && text.includes('kB')) {
        this.log(`Bundle size: ${text.trim()}`, 'SIZE');
      }
      
      // Log any performance warnings
      if (text.includes('warning') || text.includes('Warning')) {
        this.log(`Warning: ${text.trim()}`, 'WARN');
      }
    });

    buildProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      this.log(`Error: ${text.trim()}`, 'ERROR');
    });

    buildProcess.on('close', (code) => {
      this.endStage();
      
      const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        this.log(`Build completed successfully in ${totalDuration}s`, 'SUCCESS');
      } else {
        this.log(`Build failed with exit code ${code} after ${totalDuration}s`, 'FAILURE');
      }
      
      this.generateReport();
    });

    // Timeout after 20 minutes
    setTimeout(() => {
      if (!buildProcess.killed) {
        this.log('Build timeout reached (20 minutes), terminating', 'TIMEOUT');
        buildProcess.kill('SIGTERM');
      }
    }, 20 * 60 * 1000);

    return buildProcess;
  }

  generateReport() {
    this.log('Generating performance report', 'REPORT');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: ((Date.now() - this.startTime) / 1000).toFixed(2),
      stages: this.stages,
      recommendations: this.generateRecommendations(),
    };
    
    const reportFile = path.join(__dirname, 'build-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Print summary to console
    console.log('\n=== BUILD PERFORMANCE REPORT ===');
    console.log(`Total Duration: ${report.totalDuration}s`);
    console.log('\nStage Breakdown:');
    
    this.stages.forEach(stage => {
      console.log(`  ${stage.name}: ${stage.duration}s`);
    });
    
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
    
    console.log(`\nDetailed logs: ${this.logFile}`);
    console.log(`Full report: ${reportFile}\n`);
  }

  generateRecommendations() {
    const recommendations = [];
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    if (totalDuration > 600) { // 10 minutes
      recommendations.push('Build time > 10 minutes. Consider reducing dependency count or implementing more aggressive caching.');
    }
    
    const longestStage = this.stages.reduce((longest, stage) => 
      stage.duration > longest.duration ? stage : longest, { duration: 0 });
    
    if (longestStage.duration > 300) { // 5 minutes
      recommendations.push(`Longest stage "${longestStage.name}" took ${longestStage.duration}s. Investigate bottlenecks in this stage.`);
    }
    
    if (this.stages.length < 3) {
      recommendations.push('Build appears to be hanging in early stages. Check for import cycles or heavy synchronous operations.');
    }
    
    return recommendations;
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new BuildMonitor();
  monitor.monitorBuild();
}

module.exports = BuildMonitor;