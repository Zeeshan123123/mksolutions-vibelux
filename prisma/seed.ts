import { PrismaClient, UserRole } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create default crop categories
  console.log('Creating crop categories...');
  const categories = [
    'lettuce', 'herbs', 'tomatoes', 'peppers', 'cannabis', 
    'strawberries', 'microgreens', 'flowers'
  ];

  for (const category of categories) {
    await prisma.cropCategory.upsert({
      where: { name: category },
      update: {},
      create: {
        name: category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1),
        description: `${category} varieties for controlled environment agriculture`,
      },
    });
  }

  // 2. Create default fixture manufacturers
  console.log('Creating fixture manufacturers...');
  const manufacturers = [
    { name: 'Fluence', website: 'https://fluence.science' },
    { name: 'Gavita', website: 'https://gavita.com' },
    { name: 'Signify', website: 'https://signify.com' },
    { name: 'California Lightworks', website: 'https://californialightworks.com' },
    { name: 'Heliospectra', website: 'https://heliospectra.com' },
  ];

  for (const mfr of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: mfr.name },
      update: {},
      create: mfr,
    });
  }

  // 3. Create default sensor types
  console.log('Creating sensor types...');
  const sensorTypes = [
    { type: 'temperature', unit: '°C', displayName: 'Temperature' },
    { type: 'humidity', unit: '%', displayName: 'Humidity' },
    { type: 'co2', unit: 'ppm', displayName: 'CO2' },
    { type: 'ppfd', unit: 'μmol/m²/s', displayName: 'PPFD' },
    { type: 'vpd', unit: 'kPa', displayName: 'VPD' },
  ];

  for (const sensor of sensorTypes) {
    await prisma.sensorType.upsert({
      where: { type: sensor.type },
      update: {},
      create: sensor,
    });
  }

  // 4. Create admin user (if ADMIN_EMAIL is provided)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_CLERK_ID) {
    console.log('Creating admin user...');
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL,
        clerkId: process.env.ADMIN_CLERK_ID,
        name: 'Admin',
        role: UserRole.ADMIN,
        subscriptionTier: 'BUSINESS',
      },
    });
  }

  // 5. Create default environmental zones
  console.log('Creating environmental zones...');
  const zones = [
    { name: 'propagation', displayName: 'Propagation', targetTemp: 24, targetHumidity: 70 },
    { name: 'vegetative', displayName: 'Vegetative', targetTemp: 25, targetHumidity: 65 },
    { name: 'flowering', displayName: 'Flowering', targetTemp: 23, targetHumidity: 55 },
    { name: 'drying', displayName: 'Drying', targetTemp: 20, targetHumidity: 50 },
  ];

  for (const zone of zones) {
    await prisma.environmentalZone.upsert({
      where: { name: zone.name },
      update: {},
      create: zone,
    });
  }

  // 6. Create default compliance standards
  console.log('Creating compliance standards...');
  const standards = [
    { name: 'globalGAP', displayName: 'GlobalG.A.P.', version: '5.4' },
    { name: 'sqf', displayName: 'Safe Quality Food', version: '9.0' },
    { name: 'organic', displayName: 'USDA Organic', version: '2023' },
    { name: 'gmp', displayName: 'Good Manufacturing Practices', version: '2023' },
  ];

  for (const standard of standards) {
    await prisma.complianceStandard.upsert({
      where: { name: standard.name },
      update: {},
      create: standard,
    });
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });