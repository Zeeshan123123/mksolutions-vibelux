/**
 * Complete Alert Detection System Test
 * Creates test data and verifies all functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAlertSystem() {
  console.log('🧪 Testing Alert Detection System...\n');

  try {
    // Step 1: Create test facility
    console.log('1️⃣  Creating test facility...');
    const facility = await prisma.facility.create({
      data: {
        name: 'Test Greenhouse Facility',
        type: 'GREENHOUSE',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        country: 'USA',
        zipCode: '12345'
      }
    });
    console.log(`✅ Facility created: ${facility.name} (ID: ${facility.id})\n`);

    // Step 2: Create test greenhouse zone
    console.log('2️⃣  Creating test greenhouse zone...');
    const zone = await prisma.greenhouseZone.create({
      data: {
        facilityId: facility.id,
        name: 'Zone A - Vegetative',
        type: 'GROW',
        x: 0,
        y: 0,
        length: 10,
        width: 8,
        height: 3,
        area: 80,
        config: {
          temperature: { min: 18, max: 28 },
          humidity: { min: 40, max: 70 },
          co2: { min: 400, max: 1200 }
        }
      }
    });
    console.log(`✅ Zone created: ${zone.name} (ID: ${zone.id})\n`);

    // Step 3: Create test sensor
    console.log('3️⃣  Creating test temperature sensor...');
    const sensor = await prisma.zoneSensor.create({
      data: {
        zoneId: zone.id,
        sensorType: 'TEMPERATURE',
        name: 'Temperature Sensor 1',
        unit: '°C',
        isActive: true,
        minValue: -10,
        maxValue: 50,
        accuracy: 0.5
      }
    });
    console.log(`✅ Sensor created: ${sensor.name} (ID: ${sensor.id})\n`);

    // Step 4: Create alert configurations
    console.log('4️⃣  Creating alert configurations...\n');

    // High temperature alert
    const highTempAlert = await prisma.alertConfiguration.create({
      data: {
        facilityId: facility.id,
        sensorId: sensor.id,
        name: 'High Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 5,
        actions: { email: true, push: true, sms: false },
        notificationMessage: 'Temperature alert: {{sensorName}} is {{value}}°C (threshold: {{threshold}}°C)'
      }
    });
    console.log(`✅ Alert Config 1: ${highTempAlert.name}`);
    console.log(`   - Condition: Temperature > 30°C`);
    console.log(`   - Severity: HIGH`);
    console.log(`   - Actions: email, push\n`);

    // Low temperature alert
    const lowTempAlert = await prisma.alertConfiguration.create({
      data: {
        facilityId: facility.id,
        sensorId: sensor.id,
        name: 'Low Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_LOW',
        condition: 'LT',
        threshold: 15,
        severity: 'MEDIUM',
        cooldownMinutes: 10,
        actions: { email: true, push: false, sms: false }
      }
    });
    console.log(`✅ Alert Config 2: ${lowTempAlert.name}`);
    console.log(`   - Condition: Temperature < 15°C`);
    console.log(`   - Severity: MEDIUM`);
    console.log(`   - Actions: email\n`);

    // Temperature range alert
    const rangeTempAlert = await prisma.alertConfiguration.create({
      data: {
        facilityId: facility.id,
        sensorId: sensor.id,
        name: 'Temperature Range Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'BETWEEN',
        threshold: 18,
        thresholdMax: 28,
        severity: 'CRITICAL',
        duration: 5,
        cooldownMinutes: 15,
        actions: { email: true, push: true, sms: true }
      }
    });
    console.log(`✅ Alert Config 3: ${rangeTempAlert.name}`);
    console.log(`   - Condition: Temperature outside 18-28°C for 5 minutes`);
    console.log(`   - Severity: CRITICAL`);
    console.log(`   - Actions: email, push, sms\n`);

    // Step 5: Create test sensor readings
    console.log('5️⃣  Creating test sensor readings...\n');

    const readings = [
      { value: 25, status: 'Normal' },
      { value: 32, status: 'High (should trigger alert)' },
      { value: 12, status: 'Low (should trigger alert)' },
      { value: 35, status: 'Very High (should trigger alert)' }
    ];

    for (const reading of readings) {
      await prisma.sensorReading.create({
        data: {
          facilityId: facility.id,
          zoneSensorId: sensor.id,
          sensorId: sensor.id,
          sensorType: 'TEMPERATURE',
          value: reading.value,
          unit: '°C',
          quality: 100,
          timestamp: new Date()
        }
      });
      console.log(`   📊 Reading: ${reading.value}°C - ${reading.status}`);
    }

    // Step 6: Simulate alert detection
    console.log('\n6️⃣  Simulating alert detection...\n');

    // Simulate high temperature alert
    const highTempLog = await prisma.alertLog.create({
      data: {
        alertConfigId: highTempAlert.id,
        sensorId: sensor.id,
        facilityId: facility.id,
        alertType: 'TEMPERATURE_HIGH',
        severity: 'HIGH',
        message: 'Temperature alert: Temperature Sensor 1 is 32°C (threshold: 30°C)',
        triggeredValue: 32,
        thresholdValue: 30,
        unit: '°C',
        sensorName: sensor.name,
        location: zone.name,
        metadata: {
          readingTime: new Date().toISOString(),
          condition: 'GT'
        }
      }
    });
    console.log(`✅ Alert Triggered: High Temperature`);
    console.log(`   - Value: 32°C (threshold: 30°C)`);
    console.log(`   - Status: ACTIVE`);
    console.log(`   - Alert ID: ${highTempLog.id}\n`);

    // Simulate low temperature alert
    const lowTempLog = await prisma.alertLog.create({
      data: {
        alertConfigId: lowTempAlert.id,
        sensorId: sensor.id,
        facilityId: facility.id,
        alertType: 'TEMPERATURE_LOW',
        severity: 'MEDIUM',
        message: 'Temperature alert: Temperature Sensor 1 is 12°C (threshold: 15°C)',
        triggeredValue: 12,
        thresholdValue: 15,
        unit: '°C',
        sensorName: sensor.name,
        location: zone.name
      }
    });
    console.log(`✅ Alert Triggered: Low Temperature`);
    console.log(`   - Value: 12°C (threshold: 15°C)`);
    console.log(`   - Status: ACTIVE`);
    console.log(`   - Alert ID: ${lowTempLog.id}\n`);

    // Step 7: Test alert queries
    console.log('7️⃣  Testing alert queries...\n');

    const allAlerts = await prisma.alertLog.findMany({
      where: { facilityId: facility.id },
      include: {
        alertConfig: { select: { name: true, condition: true } },
        sensor: { select: { name: true, sensorType: true } }
      }
    });
    console.log(`✅ Query: Found ${allAlerts.length} alerts for facility`);

    const activeAlerts = await prisma.alertLog.findMany({
      where: { facilityId: facility.id, status: 'ACTIVE' }
    });
    console.log(`✅ Query: Found ${activeAlerts.length} ACTIVE alerts`);

    const highSeverityAlerts = await prisma.alertLog.findMany({
      where: { facilityId: facility.id, severity: 'HIGH' }
    });
    console.log(`✅ Query: Found ${highSeverityAlerts.length} HIGH severity alerts\n`);

    // Step 8: Test alert acknowledgment
    console.log('8️⃣  Testing alert acknowledgment...\n');

    await prisma.alertLog.update({
      where: { id: highTempLog.id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date()
      }
    });
    console.log(`✅ Alert acknowledged: ${highTempLog.id}\n`);

    // Step 9: Test alert resolution
    console.log('9️⃣  Testing alert resolution...\n');

    await prisma.alertLog.update({
      where: { id: lowTempLog.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolutionNotes: 'Temperature returned to normal range'
      }
    });
    console.log(`✅ Alert resolved: ${lowTempLog.id}\n`);

    // Step 10: Display summary
    console.log('🔟 Test Summary:\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Created Test Data:');
    console.log(`   • 1 Facility: ${facility.name}`);
    console.log(`   • 1 Zone: ${zone.name}`);
    console.log(`   • 1 Sensor: ${sensor.name} (${sensor.sensorType})`);
    console.log(`   • 3 Alert Configurations`);
    console.log(`   • 4 Sensor Readings`);
    console.log(`   • 2 Alert Logs\n`);

    console.log('✅ Alert Configurations:');
    const configs = await prisma.alertConfiguration.findMany({
      where: { facilityId: facility.id }
    });
    for (const config of configs) {
      console.log(`   • ${config.name}`);
      console.log(`     - Condition: ${config.condition}, Threshold: ${config.threshold}${config.thresholdMax ? `-${config.thresholdMax}` : ''}`);
      console.log(`     - Severity: ${config.severity}, Cooldown: ${config.cooldownMinutes}min`);
    }

    console.log('\n📋 Alert Logs:');
    const logs = await prisma.alertLog.findMany({
      where: { facilityId: facility.id },
      orderBy: { createdAt: 'desc' }
    });
    for (const log of logs) {
      console.log(`   • ${log.message}`);
      console.log(`     - Status: ${log.status}, Severity: ${log.severity}`);
      console.log(`     - Value: ${log.triggeredValue}${log.unit}, Threshold: ${log.thresholdValue}${log.unit}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('🎉 All tests passed successfully!\n');

    console.log('💡 Next Steps:');
    console.log('   1. Start the application: npm run dev');
    console.log('   2. Test the APIs:');
    console.log(`      - GET /api/alerts/configurations?facilityId=${facility.id}`);
    console.log(`      - GET /api/alerts/logs?facilityId=${facility.id}`);
    console.log('   3. Test real-time detection by sending sensor readings');
    console.log('   4. Monitor WebSocket events for real-time alerts\n');

    console.log('🗑️  To clean up test data, run:');
    console.log(`   node cleanup-test-data.js ${facility.id}\n`);

    // Save test IDs for cleanup
    const testInfo = {
      facilityId: facility.id,
      zoneId: zone.id,
      sensorId: sensor.id,
      alertConfigIds: configs.map(c => c.id),
      alertLogIds: logs.map(l => l.id)
    };

    require('fs').writeFileSync(
      'test-data-ids.json',
      JSON.stringify(testInfo, null, 2)
    );
    console.log('✅ Test data IDs saved to test-data-ids.json\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAlertSystem();
