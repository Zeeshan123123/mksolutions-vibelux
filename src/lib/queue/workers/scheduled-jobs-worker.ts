import { Job } from 'bull';
import { queues } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { db } from '../../prisma';
import { queueManager } from '../queue-manager';

// Clean old jobs
queues.scheduledJobsQueue.process('clean-old-jobs', async (job: Job) => {
  const { gracePeriod } = job.data;
  
  try {
    logger.info('api', 'Cleaning old jobs', { gracePeriod });
    
    const results = await queueManager.cleanQueues(gracePeriod);
    
    logger.info('api', 'Old jobs cleaned', results);
    
    return results;
  } catch (error) {
    logger.error('api', 'Failed to clean old jobs', error as Error);
    throw error;
  }
});

// Generate daily reports
queues.scheduledJobsQueue.process('generate-daily-reports', async (job: Job) => {
  try {
    logger.info('api', 'Generating daily reports');
    
    // Get all facilities
    const facilities = await db.facility.findMany({
      where: { status: 'active' },
      include: { users: true }
    });
    
    for (const facility of facilities) {
      // Queue report generation for each facility
      await queueManager.addReportJob({
        reportType: 'facility',
        userId: facility.users[0]?.id || '',
        facilityId: facility.id,
        dateRange: {
          start: new Date(Date.now() - 86400000), // Yesterday
          end: new Date()
        },
        format: 'pdf'
      });
    }
    
    return { facilitiesProcessed: facilities.length };
  } catch (error) {
    logger.error('api', 'Failed to generate daily reports', error as Error);
    throw error;
  }
});

// Aggregate sensor data
queues.scheduledJobsQueue.process('aggregate-sensor-data', async (job: Job) => {
  const { interval } = job.data;
  
  try {
    logger.info('api', 'Aggregating sensor data', { interval });
    
    const facilities = await db.facility.findMany({
      where: { status: 'active' },
      select: { id: true }
    });
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 900000); // 15 minutes ago
    
    for (const facility of facilities) {
      await queues.sensorDataQueue.add('aggregate-sensor-data', {
        facilityId: facility.id,
        interval,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
    }
    
    return { facilitiesQueued: facilities.length };
  } catch (error) {
    logger.error('api', 'Failed to queue sensor aggregation', error as Error);
    throw error;
  }
});

// System health check
queues.scheduledJobsQueue.process('system-health-check', async (job: Job) => {
  try {
    logger.info('api', 'Running system health check');
    
    const healthChecks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      influxdb: await checkInfluxDB(),
      storage: await checkStorage(),
      queues: await checkQueues()
    };
    
    const unhealthy = Object.entries(healthChecks).filter(([_, status]) => !status.healthy);
    
    if (unhealthy.length > 0) {
      // Send alerts
      await sendHealthAlerts(unhealthy);
    }
    
    // Store health check results
    await db.systemHealth.create({
      data: {
        checks: healthChecks,
        status: unhealthy.length === 0 ? 'healthy' : 'unhealthy',
        timestamp: new Date()
      }
    });
    
    return healthChecks;
  } catch (error) {
    logger.error('api', 'System health check failed', error as Error);
    throw error;
  }
});

// Weekly digest emails
queues.scheduledJobsQueue.process('send-weekly-digest', async (job: Job) => {
  try {
    logger.info('api', 'Sending weekly digests');
    
    // Get users with weekly digest enabled
    const users = await db.user.findMany({
      where: {
        notificationSettings: {
          path: ['email', 'weeklyDigest'],
          equals: true
        }
      }
    });
    
    for (const user of users) {
      // Get unread notifications from past week
      const notifications = await db.notification.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 86400000) // 7 days
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (notifications.length > 0) {
        await queues.emailQueue.add('send-digest', {
          userId: user.id,
          email: user.email,
          notifications,
          period: 'Weekly'
        });
      }
    }
    
    return { usersProcessed: users.length };
  } catch (error) {
    logger.error('api', 'Failed to send weekly digests', error as Error);
    throw error;
  }
});

// Helper functions
async function checkDatabase(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { healthy: true, latency: Date.now() - start };
  } catch {
    return { healthy: false, latency: -1 };
  }
}

async function checkRedis(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  try {
    // Check if Redis is accessible via queue manager
    await queueManager.getQueueStats();
    return { healthy: true, latency: Date.now() - start };
  } catch {
    return { healthy: false, latency: -1 };
  }
}

async function checkInfluxDB(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  try {
    const { influxDB } = await import('../../influxdb-client');
    const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG!);
    await queryApi.collectRows('buckets()');
    return { healthy: true, latency: Date.now() - start };
  } catch {
    return { healthy: false, latency: -1 };
  }
}

async function checkStorage(): Promise<{ healthy: boolean; freeSpace: number }> {
  try {
    // Check S3 or local storage
    // This is a placeholder - implement actual storage check
    return { healthy: true, freeSpace: 1000000000 }; // 1GB
  } catch {
    return { healthy: false, freeSpace: 0 };
  }
}

async function checkQueues(): Promise<{ healthy: boolean; stats: any }> {
  try {
    const stats = await queueManager.getQueueStats();
    const healthy = Object.values(stats).every((queue: any) => 
      queue.failed < 100 && queue.waiting < 1000
    );
    return { healthy, stats };
  } catch {
    return { healthy: false, stats: {} };
  }
}

async function sendHealthAlerts(unhealthyChecks: Array<[string, any]>) {
  // Send alerts to admin users
  const admins = await db.user.findMany({
    where: { role: 'admin' }
  });
  
  for (const admin of admins) {
    await queues.notificationQueue.add('send-alert', {
      userId: admin.id,
      type: 'system-health',
      severity: 'critical',
      title: 'System Health Alert',
      message: `The following systems are unhealthy: ${unhealthyChecks.map(([name]) => name).join(', ')}`,
      data: unhealthyChecks
    });
  }
}

export default queues.scheduledJobsQueue;