/**
 * Cleanup Test Data
 * Removes test data created by test-alert-system-complete.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n');

  try {
    // Read test data IDs
    if (!fs.existsSync('test-data-ids.json')) {
      console.log('❌ test-data-ids.json not found. No test data to clean up.');
      return;
    }

    const testInfo = JSON.parse(fs.readFileSync('test-data-ids.json', 'utf8'));
    const { facilityId, zoneId, sensorId, alertConfigIds, alertLogIds } = testInfo;

    console.log('📋 Test Data to Remove:');
    console.log(`   - Facility ID: ${facilityId}`);
    console.log(`   - Zone ID: ${zoneId}`);
    console.log(`   - Sensor ID: ${sensorId}`);
    console.log(`   - Alert Configs: ${alertConfigIds.length}`);
    console.log(`   - Alert Logs: ${alertLogIds.length}\n`);

    // Delete alert logs
    console.log('🗑️  Deleting alert logs...');
    const deletedLogs = await prisma.alertLog.deleteMany({
      where: { facilityId }
    });
    console.log(`✅ Deleted ${deletedLogs.count} alert logs\n`);

    // Delete alert configurations
    console.log('🗑️  Deleting alert configurations...');
    const deletedConfigs = await prisma.alertConfiguration.deleteMany({
      where: { facilityId }
    });
    console.log(`✅ Deleted ${deletedConfigs.count} alert configurations\n`);

    // Delete sensor readings
    console.log('🗑️  Deleting sensor readings...');
    const deletedReadings = await prisma.sensorReading.deleteMany({
      where: { facilityId }
    });
    console.log(`✅ Deleted ${deletedReadings.count} sensor readings\n`);

    // Delete sensor
    console.log('🗑️  Deleting sensor...');
    await prisma.zoneSensor.delete({
      where: { id: sensorId }
    });
    console.log(`✅ Deleted sensor\n`);

    // Delete zone
    console.log('🗑️  Deleting zone...');
    await prisma.greenhouseZone.delete({
      where: { id: zoneId }
    });
    console.log(`✅ Deleted zone\n`);

    // Delete facility
    console.log('🗑️  Deleting facility...');
    await prisma.facility.delete({
      where: { id: facilityId }
    });
    console.log(`✅ Deleted facility\n`);

    // Remove test data IDs file
    fs.unlinkSync('test-data-ids.json');
    console.log('✅ Removed test-data-ids.json\n');

    console.log('🎉 Cleanup completed successfully!\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupTestData();

