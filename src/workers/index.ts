#!/usr/bin/env node
import 'dotenv/config';
import { logger } from '../lib/logging/production-logger';
import { queueManager } from '../lib/queue/queue-manager';

// Import all workers
import '../lib/queue/workers/email-worker';
import '../lib/queue/workers/report-worker';
import '../lib/queue/workers/sensor-data-worker';
import '../lib/queue/workers/data-processing-worker';
import '../lib/queue/workers/scheduled-jobs-worker';
import '../lib/queue/workers/notification-worker';

// Worker configuration
const WORKER_NAME = process.env.WORKER_NAME || 'vibelux-worker';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');

// Health check server
import express from 'express';
const app = express();
const PORT = process.env.WORKER_PORT || 3002;

// Add health check endpoint
app.get('/health', async (req, res) => {
  try {
    const stats = await queueManager.getQueueStats();
    res.json({
      status: 'healthy',
      worker: WORKER_NAME,
      queues: stats,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: (error as Error).message
    });
  }
});

// Add Bull Board UI
app.use('/admin/queues', queueManager.getBullBoardAdapter().getRouter());

// Start health check server
app.listen(PORT, () => {
  logger.info('api', `Worker health check server running on port ${PORT}`);
});

// Graceful shutdown
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('api', `Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new jobs
    await queueManager.shutdown();
    
    // Wait for active jobs to complete (max 30 seconds)
    const timeout = setTimeout(() => {
      logger.error('api', 'Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 30000);

    // Clean up
    clearTimeout(timeout);
    logger.info('api', 'Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('api', 'Error during shutdown', error as Error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('api', 'Uncaught exception', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('api', 'Unhandled rejection', reason as Error);
  shutdown('unhandledRejection');
});

// Log worker startup
logger.info('api', 'Worker process started', {
  name: WORKER_NAME,
  concurrency: WORKER_CONCURRENCY,
  pid: process.pid,
  node: process.version
});

// Schedule periodic tasks
(async () => {
  try {
    // Clean old jobs every hour
    await queueManager.addScheduledJob(
      'clean-old-jobs',
      { gracePeriod: 86400000 }, // 24 hours
      '0 * * * *' // Every hour
    );

    // Generate daily reports
    await queueManager.addScheduledJob(
      'generate-daily-reports',
      { reportType: 'daily' },
      '0 2 * * *' // 2 AM daily
    );

    // Aggregate sensor data every 15 minutes
    await queueManager.addScheduledJob(
      'aggregate-sensor-data',
      { interval: '15m' },
      '*/15 * * * *' // Every 15 minutes
    );

    // Check system health every 5 minutes
    await queueManager.addScheduledJob(
      'system-health-check',
      { checkType: 'full' },
      '*/5 * * * *' // Every 5 minutes
    );

    logger.info('api', 'Scheduled jobs registered successfully');
  } catch (error) {
    logger.error('api', 'Failed to register scheduled jobs', error as Error);
  }
})();