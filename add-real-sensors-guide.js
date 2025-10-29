/**
 * Guide: How to Add Real Sensors
 * This script demonstrates different ways to add sensors to your VibeLux system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addRealSensors() {
  console.log('🌡️  VibeLux - Adding Real Sensors Guide\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Check existing facilities
    console.log('1️⃣  Checking existing facilities...\n');
    
    const facilities = await prisma.facility.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        type: true,
        city: true
      }
    });

    if (facilities.length === 0) {
      console.log('❌ No facilities found. Creating a test facility first...\n');
      const facility = await createTestFacility();
      await demonstrateSensorCreation(facility.id);
      return;
    }

    console.log('✅ Found facilities:\n');
    facilities.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name} (${f.type}) - ${f.city || 'N/A'}`);
      console.log(`      ID: ${f.id}\n`);
    });

    // Use first facility for demonstration
    const facilityId = facilities[0].id;
    console.log(`Using facility: ${facilities[0].name}\n`);

    // Step 2: Check for greenhouse designs
    console.log('2️⃣  Checking greenhouse designs and zones...\n');
    
    const designs = await prisma.greenhouseDesign.findMany({
      where: { facilityId },
      include: {
        zones: {
          take: 3,
          select: {
            id: true,
            name: true,
            zoneType: true
          }
        }
      },
      take: 1
    });

    let zoneId;

    if (designs.length === 0 || designs[0].zones.length === 0) {
      console.log('⚠️  No greenhouse zones found. Creating one...\n');
      const zone = await createTestZone(facilityId);
      zoneId = zone.id;
    } else {
      const zone = designs[0].zones[0];
      zoneId = zone.id;
      console.log('✅ Found zones:\n');
      designs[0].zones.forEach((z, i) => {
        console.log(`   ${i + 1}. ${z.name} (${z.zoneType})`);
        console.log(`      ID: ${z.id}\n`);
      });
      console.log(`Using zone: ${zone.name}\n`);
    }

    // Step 3: Demonstrate sensor creation
    await demonstrateSensorCreation(facilityId, zoneId);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestFacility() {
  console.log('Creating test facility...\n');
  
  const facility = await prisma.facility.create({
    data: {
      name: 'VibeLux Demo Facility',
      type: 'GREENHOUSE',
      address: '123 Growing Lane',
      city: 'Portland',
      state: 'OR',
      country: 'USA',
      zipCode: '97201'
    }
  });

  console.log(`✅ Created facility: ${facility.name} (${facility.id})\n`);
  return facility;
}

async function createTestZone(facilityId) {
  console.log('Creating test greenhouse design and zone...\n');

  // Create a greenhouse design first
  const design = await prisma.greenhouseDesign.create({
    data: {
      facilityId,
      name: 'Main Greenhouse Design',
      version: '1.0',
      status: 'ACTIVE',
      designData: {
        type: 'commercial',
        dimensions: { width: 30, length: 50, height: 6 }
      }
    }
  });

  // Create a zone
  const zone = await prisma.greenhouseZone.create({
    data: {
      designId: design.id,
      name: 'Growing Zone A',
      zoneType: 'GROW',
      x: 0,
      y: 0,
      width: 10,
      length: 15,
      height: 3,
      area: 150,
      config: {
        temperature: { min: 18, max: 28 },
        humidity: { min: 40, max: 70 },
        co2: { min: 400, max: 1200 }
      }
    }
  });

  console.log(`✅ Created zone: ${zone.name} (${zone.id})\n`);
  return zone;
}

async function demonstrateSensorCreation(facilityId, zoneId) {
  console.log('3️⃣  Creating Real Sensors (Examples)...\n');
  console.log('───────────────────────────────────────────────────────────\n');

  const sensors = [];

  // Example 1: Temperature Sensor
  console.log('📊 Example 1: Temperature Sensor\n');
  const tempSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'TEMPERATURE',
      name: 'Temperature Sensor - Main Area',
      unit: '°C',
      isActive: true,
      minValue: -10,
      maxValue: 50,
      accuracy: 0.5,
      x: 5,
      y: 7.5,
      z: 2
    }
  });
  console.log(`   ✅ Created: ${tempSensor.name}`);
  console.log(`      ID: ${tempSensor.id}`);
  console.log(`      Type: ${tempSensor.sensorType}`);
  console.log(`      Range: ${tempSensor.minValue}°C to ${tempSensor.maxValue}°C`);
  console.log(`      Position: (${tempSensor.x}, ${tempSensor.y}, ${tempSensor.z})\n`);
  sensors.push(tempSensor);

  // Example 2: Humidity Sensor
  console.log('📊 Example 2: Humidity Sensor\n');
  const humiditySensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'HUMIDITY',
      name: 'Humidity Sensor - Main Area',
      unit: '%',
      isActive: true,
      minValue: 0,
      maxValue: 100,
      accuracy: 2,
      x: 5,
      y: 7.5,
      z: 2
    }
  });
  console.log(`   ✅ Created: ${humiditySensor.name}`);
  console.log(`      ID: ${humiditySensor.id}`);
  console.log(`      Type: ${humiditySensor.sensorType}`);
  console.log(`      Range: ${humiditySensor.minValue}% to ${humiditySensor.maxValue}%\n`);
  sensors.push(humiditySensor);

  // Example 3: CO2 Sensor
  console.log('📊 Example 3: CO2 Sensor\n');
  const co2Sensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'CO2',
      name: 'CO2 Sensor - Main Area',
      unit: 'ppm',
      isActive: true,
      minValue: 0,
      maxValue: 5000,
      accuracy: 50,
      x: 5,
      y: 7.5,
      z: 2
    }
  });
  console.log(`   ✅ Created: ${co2Sensor.name}`);
  console.log(`      ID: ${co2Sensor.id}`);
  console.log(`      Type: ${co2Sensor.sensorType}`);
  console.log(`      Range: ${co2Sensor.minValue}ppm to ${co2Sensor.maxValue}ppm\n`);
  sensors.push(co2Sensor);

  // Example 4: Light Sensor (PPFD)
  console.log('📊 Example 4: Light (PPFD) Sensor\n');
  const lightSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'LIGHT',
      name: 'PPFD Sensor - Canopy Level',
      unit: 'μmol/m²/s',
      isActive: true,
      minValue: 0,
      maxValue: 2000,
      accuracy: 10,
      x: 5,
      y: 7.5,
      z: 1.5
    }
  });
  console.log(`   ✅ Created: ${lightSensor.name}`);
  console.log(`      ID: ${lightSensor.id}`);
  console.log(`      Type: ${lightSensor.sensorType}`);
  console.log(`      Range: ${lightSensor.minValue} to ${lightSensor.maxValue} μmol/m²/s\n`);
  sensors.push(lightSensor);

  // Example 5: VPD Sensor
  console.log('📊 Example 5: VPD Sensor\n');
  const vpdSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'VPD',
      name: 'VPD Sensor - Main Area',
      unit: 'kPa',
      isActive: true,
      minValue: 0,
      maxValue: 5,
      accuracy: 0.1,
      x: 5,
      y: 7.5,
      z: 2
    }
  });
  console.log(`   ✅ Created: ${vpdSensor.name}`);
  console.log(`      ID: ${vpdSensor.id}`);
  console.log(`      Type: ${vpdSensor.sensorType}`);
  console.log(`      Range: ${vpdSensor.minValue} to ${vpdSensor.maxValue} kPa\n`);
  sensors.push(vpdSensor);

  console.log('───────────────────────────────────────────────────────────\n');
  console.log(`✅ Successfully created ${sensors.length} sensors!\n`);

  // Step 4: Now create alert configurations for these sensors
  console.log('4️⃣  Creating Alert Configurations for Sensors...\n');
  await createAlertConfigurations(facilityId, sensors);

  // Step 5: Show how to send sensor data
  console.log('5️⃣  Demonstrating Sensor Data Submission...\n');
  await demonstrateSensorDataSubmission(facilityId, sensors);

  // Save sensor IDs for future use
  const fs = require('fs');
  fs.writeFileSync('sensor-ids.json', JSON.stringify({
    facilityId,
    zoneId,
    sensors: sensors.map(s => ({
      id: s.id,
      name: s.name,
      type: s.sensorType,
      unit: s.unit
    }))
  }, null, 2));
  console.log('✅ Sensor IDs saved to sensor-ids.json\n');
}

async function createAlertConfigurations(facilityId, sensors) {
  const configs = [];

  // Temperature alerts
  const tempSensor = sensors.find(s => s.sensorType === 'TEMPERATURE');
  if (tempSensor) {
    const highTemp = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId: tempSensor.id,
        name: 'High Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 15,
        actions: { email: true, push: true },
        notificationMessage: 'Temperature is {{value}}°C (threshold: {{threshold}}°C)'
      }
    });
    configs.push(highTemp);
    console.log(`   ✅ Alert: ${highTemp.name} (> 30°C)`);

    const lowTemp = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId: tempSensor.id,
        name: 'Low Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_LOW',
        condition: 'LT',
        threshold: 15,
        severity: 'MEDIUM',
        cooldownMinutes: 15,
        actions: { email: true, push: true }
      }
    });
    configs.push(lowTemp);
    console.log(`   ✅ Alert: ${lowTemp.name} (< 15°C)`);
  }

  // Humidity alerts
  const humiditySensor = sensors.find(s => s.sensorType === 'HUMIDITY');
  if (humiditySensor) {
    const humidityAlert = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId: humiditySensor.id,
        name: 'Humidity Range Alert',
        enabled: true,
        alertType: 'HUMIDITY_HIGH',
        condition: 'BETWEEN',
        threshold: 40,
        thresholdMax: 70,
        severity: 'MEDIUM',
        cooldownMinutes: 20,
        actions: { email: true }
      }
    });
    configs.push(humidityAlert);
    console.log(`   ✅ Alert: ${humidityAlert.name} (outside 40-70%)`);
  }

  // CO2 alerts
  const co2Sensor = sensors.find(s => s.sensorType === 'CO2');
  if (co2Sensor) {
    const co2Alert = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId: co2Sensor.id,
        name: 'High CO2 Alert',
        enabled: true,
        alertType: 'CO2_HIGH',
        condition: 'GT',
        threshold: 1500,
        severity: 'CRITICAL',
        cooldownMinutes: 10,
        actions: { email: true, sms: true, push: true }
      }
    });
    configs.push(co2Alert);
    console.log(`   ✅ Alert: ${co2Alert.name} (> 1500 ppm)`);
  }

  console.log(`\n✅ Created ${configs.length} alert configurations\n`);
}

async function demonstrateSensorDataSubmission(facilityId, sensors) {
  console.log('Submitting sample sensor readings...\n');

  for (const sensor of sensors.slice(0, 3)) { // Just first 3 for demo
    let sampleValue;
    
    switch (sensor.sensorType) {
      case 'TEMPERATURE':
        sampleValue = 22.5;
        break;
      case 'HUMIDITY':
        sampleValue = 55;
        break;
      case 'CO2':
        sampleValue = 800;
        break;
      case 'LIGHT':
        sampleValue = 600;
        break;
      case 'VPD':
        sampleValue = 1.2;
        break;
      default:
        sampleValue = 50;
    }

    await prisma.sensorReading.create({
      data: {
        facilityId,
        zoneSensorId: sensor.id,
        sensorId: sensor.id,
        sensorType: sensor.sensorType,
        value: sampleValue,
        unit: sensor.unit,
        quality: 100,
        timestamp: new Date()
      }
    });

    console.log(`   📊 ${sensor.name}: ${sampleValue}${sensor.unit}`);
  }

  console.log('\n✅ Sample readings submitted\n');
}

// Run the guide
addRealSensors().then(() => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Sensor Setup Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Check sensor-ids.json for your sensor IDs');
  console.log('   2. Start sending real sensor data');
  console.log('   3. Monitor alerts in Prisma Studio: npx prisma studio');
  console.log('   4. View alerts via API: GET /api/alerts/logs');
  console.log('   5. Test alert detection: node test-alert-detection-simple.js\n');
});

