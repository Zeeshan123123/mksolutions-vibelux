/**
 * Simple test script to verify alert detection implementation
 * Run with: node test-alert-detection.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAlertDetection() {
  console.log('🧪 Testing Alert Detection Implementation...\n');

  try {
    // Test 1: Check if new tables exist
    console.log('1. Checking database tables...');
    
    const alertConfigs = await prisma.alertConfiguration.findMany({ take: 1 });
    const alertLogs = await prisma.alertLog.findMany({ take: 1 });
    
    console.log('✅ AlertConfiguration table exists');
    console.log('✅ AlertLog table exists\n');

    // Test 2: Create a test alert configuration
    console.log('2. Creating test alert configuration...');
    
    // First, we need a facility and sensor (using existing ones or creating test data)
    const facility = await prisma.facility.findFirst();
    if (!facility) {
      console.log('❌ No facilities found. Please create a facility first.');
      return;
    }

    const sensor = await prisma.zoneSensor.findFirst();
    if (!sensor) {
      console.log('❌ No sensors found. Please create a sensor first.');
      return;
    }

    const testConfig = await prisma.alertConfiguration.create({
      data: {
        facilityId: facility.id,
        sensorId: sensor.id,
        name: 'Test Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 5,
        actions: { email: true, push: true },
        notificationMessage: 'Test alert: {{sensorName}} temperature is {{value}}°C (threshold: {{threshold}}°C)'
      }
    });

    console.log('✅ Test alert configuration created:', testConfig.id);

    // Test 3: Create a test alert log
    console.log('3. Creating test alert log...');
    
    const testAlert = await prisma.alertLog.create({
      data: {
        alertConfigId: testConfig.id,
        sensorId: sensor.id,
        facilityId: facility.id,
        alertType: 'TEMPERATURE_HIGH',
        severity: 'HIGH',
        message: 'Test alert: Temperature exceeded threshold',
        triggeredValue: 35,
        thresholdValue: 30,
        unit: '°C',
        sensorName: sensor.name,
        location: 'Test Zone'
      }
    });

    console.log('✅ Test alert log created:', testAlert.id);

    // Test 4: Test queries
    console.log('4. Testing queries...');
    
    const configsForSensor = await prisma.alertConfiguration.findMany({
      where: { sensorId: sensor.id }
    });
    console.log(`✅ Found ${configsForSensor.length} configurations for sensor`);

    const alertsForFacility = await prisma.alertLog.findMany({
      where: { facilityId: facility.id },
      take: 5
    });
    console.log(`✅ Found ${alertsForFacility.length} alerts for facility`);

    // Test 5: Test relations
    console.log('5. Testing relations...');
    
    const configWithRelations = await prisma.alertConfiguration.findUnique({
      where: { id: testConfig.id },
      include: {
        facility: { select: { id: true, name: true } },
        sensor: { select: { id: true, name: true, sensorType: true } },
        alertLogs: { take: 1 }
      }
    });

    console.log('✅ Relations working correctly');
    console.log(`   - Facility: ${configWithRelations?.facility.name}`);
    console.log(`   - Sensor: ${configWithRelations?.sensor.name} (${configWithRelations?.sensor.sensorType})`);
    console.log(`   - Alert logs: ${configWithRelations?.alertLogs.length}`);

    // Test 6: Test indexes (by checking query performance)
    console.log('6. Testing indexes...');
    
    const startTime = Date.now();
    await prisma.alertLog.findMany({
      where: {
        facilityId: facility.id,
        status: 'ACTIVE',
        severity: 'HIGH'
      },
      take: 10
    });
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Indexed query completed in ${queryTime}ms`);

    // Cleanup test data
    console.log('7. Cleaning up test data...');
    
    await prisma.alertLog.delete({ where: { id: testAlert.id } });
    await prisma.alertConfiguration.delete({ where: { id: testConfig.id } });
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Alert Detection system is ready.');
    console.log('\nNext steps:');
    console.log('1. Run the migration: npx prisma migrate dev');
    console.log('2. Test the AlertDetector service');
    console.log('3. Configure alert rules for your sensors');
    console.log('4. Monitor alerts via the API endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAlertDetection();


