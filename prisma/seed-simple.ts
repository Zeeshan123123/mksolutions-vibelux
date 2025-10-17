import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');
  
  // Check if we can connect
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Count existing users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} existing users`);
    
    // Create a test admin user if none exist
    if (userCount === 0 && process.env.ADMIN_EMAIL) {
      console.log('Creating test admin user...');
      const admin = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL || 'admin@vibelux.ai',
          name: 'Admin',
          role: 'ADMIN',
          subscriptionTier: 'PROFESSIONAL',
          clerkId: process.env.ADMIN_CLERK_ID || 'test_admin_clerk_id'
        }
      });
      console.log('✅ Created admin user:', admin.email);
    }
    
    console.log('✅ Database seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });