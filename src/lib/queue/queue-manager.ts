import Bull, { Queue, Job, DoneCallback } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Redis from 'ioredis';
import { logger } from '../logging/production-logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis clients for Bull
const createRedisClient = () => new Redis(redisConfig);

// Queue definitions
export const queues = {
  emailQueue: new Bull('email', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  }),
  
  reportQueue: new Bull('reports', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      attempts: 2,
      timeout: 300000 // 5 minutes
    }
  }),
  
  dataProcessingQueue: new Bull('data-processing', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 3
    }
  }),
  
  sensorDataQueue: new Bull('sensor-data', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 100,
      attempts: 1 // Don't retry sensor data
    }
  }),
  
  scheduledJobsQueue: new Bull('scheduled-jobs', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 50
    }
  }),
  
  notificationQueue: new Bull('notifications', {
    createClient: () => createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    }
  })
};

// Job type definitions
export interface EmailJobData {
  to: string;
  from?: string;
  subject: string;
  template: string;
  data: any;
  priority?: number;
}

export interface ReportJobData {
  reportType: 'facility' | 'energy' | 'compliance' | 'financial' | 'custom';
  userId: string;
  facilityId?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'pdf' | 'excel' | 'csv';
  options?: any;
}

export interface SensorDataJobData {
  sensorId: string;
  readings: Array<{
    timestamp: Date;
    value: number;
    unit: string;
    metadata?: any;
  }>;
  batchId?: string;
}

export interface DataProcessingJobData {
  type: 'aggregation' | 'ml-training' | 'data-cleanup' | 'export';
  targetId: string;
  options: any;
}

// Queue manager class
export class QueueManager {
  private static instance: QueueManager;
  private bullBoard: any;
  
  private constructor() {
    this.setupBullBoard();
    this.setupQueueEventHandlers();
  }
  
  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }
  
  private setupBullBoard() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    
    this.bullBoard = createBullBoard({
      queues: Object.values(queues).map(queue => new BullAdapter(queue)),
      serverAdapter
    });
  }
  
  private setupQueueEventHandlers() {
    // Email queue events
    queues.emailQueue.on('completed', (job) => {
      logger.info('api', `Email job ${job.id} completed`, { 
        to: job.data.to,
        subject: job.data.subject 
      });
    });
    
    queues.emailQueue.on('failed', (job, err) => {
      logger.error('api', `Email job ${job.id} failed`, err);
    });
    
    // Report queue events
    queues.reportQueue.on('progress', (job, progress) => {
      logger.info('api', `Report job ${job.id} progress: ${progress}%`);
    });
    
    queues.reportQueue.on('completed', (job, result) => {
      logger.info('api', `Report job ${job.id} completed`, {
        reportType: job.data.reportType,
        userId: job.data.userId
      });
    });
    
    // Sensor data queue events
    queues.sensorDataQueue.on('completed', (job) => {
      logger.debug('queue', `Sensor data batch ${job.data.batchId} processed`);
    });
    
    // Global error handler
    Object.values(queues).forEach(queue => {
      queue.on('error', (error) => {
        logger.error('api', `Queue error in ${queue.name}`, error);
      });
      
      queue.on('stalled', (job) => {
        logger.warn('api', `Job ${job.id} stalled in ${queue.name}`);
      });
    });
  }
  
  // Add job methods
  async addEmailJob(data: EmailJobData, options?: Bull.JobOptions) {
    return await queues.emailQueue.add('send-email', data, {
      priority: data.priority || 0,
      ...options
    });
  }
  
  async addReportJob(data: ReportJobData, options?: Bull.JobOptions) {
    return await queues.reportQueue.add('generate-report', data, options);
  }
  
  async addSensorDataJob(data: SensorDataJobData, options?: Bull.JobOptions) {
    return await queues.sensorDataQueue.add('process-sensor-data', data, options);
  }
  
  async addDataProcessingJob(data: DataProcessingJobData, options?: Bull.JobOptions) {
    const jobName = `process-${data.type}`;
    return await queues.dataProcessingQueue.add(jobName, data, options);
  }
  
  async addScheduledJob(name: string, data: any, cronPattern: string) {
    return await queues.scheduledJobsQueue.add(name, data, {
      repeat: {
        cron: cronPattern,
        tz: 'America/New_York'
      }
    });
  }
  
  // Bulk operations
  async addBulkSensorData(readings: SensorDataJobData[]) {
    const jobs = readings.map(reading => ({
      name: 'process-sensor-data',
      data: reading
    }));
    
    return await queues.sensorDataQueue.addBulk(jobs);
  }
  
  // Queue management
  async pauseQueue(queueName: keyof typeof queues) {
    await queues[queueName].pause();
  }
  
  async resumeQueue(queueName: keyof typeof queues) {
    await queues[queueName].resume();
  }
  
  async getQueueStats() {
    const stats: any = {};
    
    for (const [name, queue] of Object.entries(queues)) {
      const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
        queue.isPaused()
      ]);
      
      stats[name] = {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused
      };
    }
    
    return stats;
  }
  
  // Clean up old jobs
  async cleanQueues(gracePeriod: number = 86400000) { // 24 hours default
    const results: any = {};
    
    for (const [name, queue] of Object.entries(queues)) {
      const [completed, failed] = await Promise.all([
        queue.clean(gracePeriod, 'completed'),
        queue.clean(gracePeriod, 'failed')
      ]);
      
      results[name] = { completed, failed };
    }
    
    return results;
  }
  
  // Graceful shutdown
  async shutdown() {
    logger.info('api', 'Shutting down queues...');
    
    await Promise.all(
      Object.values(queues).map(queue => queue.close())
    );
    
    logger.info('api', 'All queues shut down successfully');
  }
  
  getBullBoardAdapter() {
    return this.bullBoard.serverAdapter;
  }
}

// Export singleton instance
export const queueManager = QueueManager.getInstance();