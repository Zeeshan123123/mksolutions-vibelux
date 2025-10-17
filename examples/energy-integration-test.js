#!/usr/bin/env node

/**
 * VibeLux Energy Integration Test Script
 * 
 * This script demonstrates how to send energy readings to the VibeLux platform.
 * Modify the configuration section to match your setup.
 */

const https = require('https');

// === CONFIGURATION ===
const config = {
  apiUrl: 'https://app.vibelux.com/api/energy/usage', // Change to your VibeLux instance
  apiKey: 'YOUR_API_KEY_HERE', // Your VibeLux API key
  facilityId: 'facility-001', // Your facility ID
  zoneId: 'zone-1', // Optional: specific zone ID
};

// === TEST DATA GENERATOR ===
function generateTestReading() {
  // Generate realistic power usage data
  const baseLoad = 100; // kW
  const variation = Math.sin(Date.now() / 3600000) * 20; // Sine wave variation
  const randomNoise = (Math.random() - 0.5) * 10; // Random noise
  
  const powerKw = Math.max(0, baseLoad + variation + randomNoise);
  const voltage = 480 + (Math.random() - 0.5) * 10; // 480V ± 5V
  const current = (powerKw * 1000) / (voltage * Math.sqrt(3) * 0.95); // Calculate current
  
  return {
    facilityId: config.facilityId,
    zoneId: config.zoneId,
    timestamp: new Date().toISOString(),
    powerKw: parseFloat(powerKw.toFixed(2)),
    energyKwh: parseFloat((powerKw * 0.25).toFixed(2)), // 15-minute reading
    voltage: parseFloat(voltage.toFixed(1)),
    current: parseFloat(current.toFixed(2)),
    powerFactor: 0.95,
    source: 'meter',
    deviceId: 'test-meter-001'
  };
}

// === SEND READING TO API ===
function sendReading(reading) {
  const data = JSON.stringify(reading);
  
  const url = new URL(config.apiUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${config.apiKey}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✓ Reading sent successfully at ${reading.timestamp}`);
          console.log(`  Power: ${reading.powerKw} kW, Energy: ${reading.energyKwh} kWh`);
          resolve(JSON.parse(body));
        } else {
          console.error(`✗ Failed to send reading: ${res.statusCode} ${res.statusMessage}`);
          console.error(`  Response: ${body}`);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('✗ Connection error:', error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// === BATCH UPLOAD TEST ===
async function testBatchUpload() {
  console.log('Testing batch upload...');
  
  const readings = [];
  const now = new Date();
  
  // Generate 24 hours of historical data (96 readings at 15-minute intervals)
  for (let i = 95; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
    const reading = generateTestReading();
    reading.timestamp = timestamp.toISOString();
    readings.push(reading);
  }
  
  const batchData = JSON.stringify({ readings });
  
  const url = new URL(config.apiUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': batchData.length,
      'Authorization': `Bearer ${config.apiKey}`
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✓ Batch upload successful: ${readings.length} readings`);
          resolve(JSON.parse(body));
        } else {
          console.error(`✗ Batch upload failed: ${res.statusCode}`);
          console.error(`  Response: ${body}`);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(batchData);
    req.end();
  });
}

// === MAIN TEST RUNNER ===
async function runTests() {
  console.log('VibeLux Energy Integration Test');
  console.log('================================');
  console.log(`API URL: ${config.apiUrl}`);
  console.log(`Facility ID: ${config.facilityId}`);
  console.log(`Zone ID: ${config.zoneId || 'Not specified'}`);
  console.log('');
  
  if (config.apiKey === 'YOUR_API_KEY_HERE') {
    console.error('⚠️  Please update the API key in the configuration section!');
    process.exit(1);
  }
  
  try {
    // Test 1: Send a single reading
    console.log('Test 1: Sending single reading...');
    const reading = generateTestReading();
    await sendReading(reading);
    console.log('');
    
    // Test 2: Send readings every 15 seconds for 1 minute
    console.log('Test 2: Sending readings every 15 seconds for 1 minute...');
    let count = 0;
    const interval = setInterval(async () => {
      try {
        const reading = generateTestReading();
        await sendReading(reading);
        count++;
        
        if (count >= 4) {
          clearInterval(interval);
          console.log('');
          
          // Test 3: Batch upload
          console.log('Test 3: Batch upload of historical data...');
          await testBatchUpload();
          
          console.log('');
          console.log('✅ All tests completed successfully!');
          console.log('Check your Energy Dashboard to see the data.');
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Test failed:', error.message);
        process.exit(1);
      }
    }, 15000);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();