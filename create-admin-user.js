/**
 * Create Admin User for VibeLux
 * Quick script to create an admin user for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👤 Creating Admin User for VibeLux...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}\n`);

    // Admin user data
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vibelux.com';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const clerkId = process.env.ADMIN_CLERK_ID || 'admin_local_' + Date.now();

    console.log('Creating admin user with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Tier: BUSINESS\n`);

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: 'ADMIN',
        subscriptionTier: 'BUSINESS'
      },
      create: {
        email: adminEmail,
        clerkId: clerkId,
        name: adminName,
        role: 'ADMIN',
        subscriptionTier: 'BUSINESS',
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          theme: 'dark'
        }
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('───────────────────────────────────────────────────────────');
    console.log('Admin User Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Subscription: ${admin.subscriptionTier}`);
    console.log(`   Clerk ID: ${admin.clerkId}`);
    console.log('───────────────────────────────────────────────────────────\n');

    // Create a test facility for the admin
    console.log('🏢 Creating test facility for admin...\n');
    
    const facility = await prisma.facility.create({
      data: {
        name: 'Admin Test Facility',
        type: 'GREENHOUSE',
        ownerId: admin.id,
        address: '123 Admin Street',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        zipCode: '97201',
        settings: {
          timezone: 'America/Los_Angeles',
          units: 'metric'
        }
      }
    });

    console.log('✅ Facility created successfully!');
    console.log(`   ID: ${facility.id}`);
    console.log(`   Name: ${facility.name}\n`);

    // Create facility user relationship
    const facilityUser = await prisma.facilityUser.create({
      data: {
        userId: admin.id,
        facilityId: facility.id,
        role: 'OWNER'
      }
    });

    console.log('✅ Admin assigned as facility owner\n');

    // Create a greenhouse design
    console.log('🏗️  Creating greenhouse design...\n');
    
    const design = await prisma.greenhouseDesign.create({
      data: {
        facilityId: facility.id,
        name: 'Main Greenhouse Design',
        version: '1.0',
        status: 'ACTIVE',
        width: 30,
        length: 50,
        height: 6,
        area: 1500,
        designData: {
          type: 'commercial',
          structure: 'gutter-connected',
          covering: 'glass'
        }
      }
    });

    console.log('✅ Greenhouse design created');
    console.log(`   ID: ${design.id}\n`);

    // Create zones
    console.log('📍 Creating greenhouse zones...\n');
    
    const zones = await Promise.all([
      prisma.greenhouseZone.create({
        data: {
          designId: design.id,
          name: 'Growing Zone A',
          zoneType: 'GROW',
          x: 0,
          y: 0,
          width: 15,
          length: 20,
          height: 3,
          area: 300,
          targetTemp: 24,
          targetHumidity: 65,
          targetCO2: 1000,
          config: {
            temperature: { min: 18, max: 28 },
            humidity: { min: 40, max: 75 },
            co2: { min: 400, max: 1500 }
          }
        }
      }),
      prisma.greenhouseZone.create({
        data: {
          designId: design.id,
          name: 'Growing Zone B',
          zoneType: 'GROW',
          x: 15,
          y: 0,
          width: 15,
          length: 20,
          height: 3,
          area: 300,
          targetTemp: 22,
          targetHumidity: 60,
          targetCO2: 800,
          config: {
            temperature: { min: 18, max: 26 },
            humidity: { min: 40, max: 70 },
            co2: { min: 400, max: 1200 }
          }
        }
      })
    ]);

    console.log(`✅ Created ${zones.length} zones\n`);

    // Create sensors for each zone
    console.log('🌡️  Creating sensors...\n');
    
    const sensorsCreated = [];
    
    for (const zone of zones) {
      // Temperature sensor
      const tempSensor = await prisma.zoneSensor.create({
        data: {
          zoneId: zone.id,
          sensorType: 'TEMPERATURE',
          name: `${zone.name} - Temperature Sensor`,
          unit: '°C',
          isActive: true,
          minValue: 0,
          maxValue: 50,
          accuracy: 0.5,
          x: zone.width / 2,
          y: zone.length / 2,
          z: 2
        }
      });
      sensorsCreated.push(tempSensor);

      // Humidity sensor
      const humiditySensor = await prisma.zoneSensor.create({
        data: {
          zoneId: zone.id,
          sensorType: 'HUMIDITY',
          name: `${zone.name} - Humidity Sensor`,
          unit: '%',
          isActive: true,
          minValue: 0,
          maxValue: 100,
          accuracy: 2,
          x: zone.width / 2,
          y: zone.length / 2,
          z: 2
        }
      });
      sensorsCreated.push(humiditySensor);

      // CO2 sensor
      const co2Sensor = await prisma.zoneSensor.create({
        data: {
          zoneId: zone.id,
          sensorType: 'CO2',
          name: `${zone.name} - CO2 Sensor`,
          unit: 'ppm',
          isActive: true,
          minValue: 0,
          maxValue: 5000,
          accuracy: 50,
          x: zone.width / 2,
          y: zone.length / 2,
          z: 2
        }
      });
      sensorsCreated.push(co2Sensor);

      console.log(`   ✅ Created 3 sensors for ${zone.name}`);
    }

    console.log(`\n✅ Total sensors created: ${sensorsCreated.length}\n`);

    // Create alert configurations
    console.log('🚨 Creating alert configurations...\n');
    
    let alertConfigCount = 0;
    
    for (const sensor of sensorsCreated) {
      let alertType, condition, threshold, thresholdMax, severity;

      switch (sensor.sensorType) {
        case 'TEMPERATURE':
          // High temperature alert
          await prisma.alertConfiguration.create({
            data: {
              facilityId: facility.id,
              sensorId: sensor.id,
              name: `${sensor.name} - High Temperature`,
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

          // Low temperature alert
          await prisma.alertConfiguration.create({
            data: {
              facilityId: facility.id,
              sensorId: sensor.id,
              name: `${sensor.name} - Low Temperature`,
              enabled: true,
              alertType: 'TEMPERATURE_LOW',
              condition: 'LT',
              threshold: 15,
              severity: 'MEDIUM',
              cooldownMinutes: 15,
              actions: { email: true, push: true }
            }
          });
          alertConfigCount += 2;
          break;

        case 'HUMIDITY':
          // Humidity range alert
          await prisma.alertConfiguration.create({
            data: {
              facilityId: facility.id,
              sensorId: sensor.id,
              name: `${sensor.name} - Range Alert`,
              enabled: true,
              alertType: 'HUMIDITY_HIGH',
              condition: 'BETWEEN',
              threshold: 40,
              thresholdMax: 75,
              severity: 'MEDIUM',
              cooldownMinutes: 20,
              actions: { email: true }
            }
          });
          alertConfigCount += 1;
          break;

        case 'CO2':
          // High CO2 alert
          await prisma.alertConfiguration.create({
            data: {
              facilityId: facility.id,
              sensorId: sensor.id,
              name: `${sensor.name} - High CO2`,
              enabled: true,
              alertType: 'CO2_HIGH',
              condition: 'GT',
              threshold: 1500,
              severity: 'CRITICAL',
              cooldownMinutes: 10,
              actions: { email: true, sms: true, push: true }
            }
          });
          alertConfigCount += 1;
          break;
      }
    }

    console.log(`✅ Created ${alertConfigCount} alert configurations\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Database Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   • 1 Admin User: ${admin.email}`);
    console.log(`   • 1 Facility: ${facility.name}`);
    console.log(`   • 1 Greenhouse Design`);
    console.log(`   • ${zones.length} Zones`);
    console.log(`   • ${sensorsCreated.length} Sensors`);
    console.log(`   • ${alertConfigCount} Alert Configurations\n`);

    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Clerk ID: ${admin.clerkId}`);
    console.log(`   Role: ${admin.role}\n`);

    console.log('🏢 Your Facility:');
    console.log(`   ID: ${facility.id}`);
    console.log(`   Name: ${facility.name}\n`);

    console.log('📝 Next Steps:');
    console.log('   1. Start your app: npm run dev');
    console.log('   2. Visit: http://localhost:3000/cultivation');
    console.log('   3. Click "Alarms" tab to see alert system');
    console.log('   4. Add test sensor readings in Prisma Studio');
    console.log('   5. Watch alerts appear in real-time!\n');

    console.log('💾 Data saved to: admin-credentials.json\n');

    // Save credentials to file
    const credentials = {
      adminUser: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        clerkId: admin.clerkId
      },
      facility: {
        id: facility.id,
        name: facility.name
      },
      zones: zones.map(z => ({ id: z.id, name: z.name })),
      sensors: sensorsCreated.map(s => ({
        id: s.id,
        name: s.name,
        type: s.sensorType,
        unit: s.unit
      })),
      alertConfigCount
    };

    require('fs').writeFileSync(
      'admin-credentials.json',
      JSON.stringify(credentials, null, 2)
    );

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('\nStack:', error.stack);
    
    if (error.code === 'P2002') {
      console.log('\n💡 User already exists. Checking existing users...\n');
      
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          clerkId: true
        }
      });

      console.log('Existing users:');
      users.forEach((user, i) => {
        console.log(`\n${i + 1}. ${user.name || user.email}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user.id}`);
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();

