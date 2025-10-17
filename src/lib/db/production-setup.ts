/**
 * Production Database Setup
 * Ensures all required models and configurations are in place
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logging/production-logger';

// Create a singleton PrismaClient instance for production
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  error?: string;
  stats?: {
    tables: number;
    users: number;
    facilities: number;
  };
}> {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic stats
    const [userCount, facilityCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.facility.count().catch(() => 0)
    ]);
    
    // Count tables
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `.catch(() => [{ count: BigInt(0) }]);
    
    return {
      connected: true,
      stats: {
        tables: Number(tables[0].count),
        users: userCount,
        facilities: facilityCount
      }
    };
  } catch (error) {
    logger.error('db', 'Database health check failed', error as Error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Initialize production database
export async function initializeProductionDatabase(): Promise<void> {
  try {
    logger.info('db', 'Initializing production database...');
    
    // Check connection
    const health = await checkDatabaseHealth();
    if (!health.connected) {
      throw new Error(`Database connection failed: ${health.error}`);
    }
    
    logger.info('db', 'Database connected', health.stats);
    
    // Create default system health record
    await prisma.systemHealth.upsert({
      where: { 
        id: 'system-health-check' 
      },
      update: {
        status: 'healthy',
        checkedAt: new Date()
      },
      create: {
        id: 'system-health-check',
        service: 'database',
        status: 'healthy',
        responseTime: 0,
        uptime: 100,
        checkedAt: new Date()
      }
    }).catch(() => {
      // Model might not exist yet in some environments
      logger.warn('db', 'Could not create system health record');
    });
    
    logger.info('db', 'Production database initialized successfully');
    
  } catch (error) {
    logger.error('db', 'Failed to initialize production database', error as Error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('db', 'Database connection closed');
}

// Handle process termination
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

// Export production-ready Prisma client
export default prisma;