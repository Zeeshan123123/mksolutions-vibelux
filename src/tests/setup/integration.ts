/**
 * Integration Test Setup
 * Configures test environment for integration tests
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/vibelux_test';
process.env.INFLUXDB_URL = 'http://localhost:8086';
process.env.INFLUXDB_TOKEN = 'test-token';
process.env.INFLUXDB_ORG = 'test-org';
process.env.INFLUXDB_BUCKET = 'test-bucket';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.UTILITY_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Mock external services
jest.mock('@influxdata/influxdb-client', () => ({
  InfluxDB: jest.fn().mockImplementation(() => ({
    getWriteApi: jest.fn().mockReturnValue({
      writePoint: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined)
    }),
    getQueryApi: jest.fn().mockReturnValue({
      queryRows: jest.fn()
    })
  })),
  Point: jest.fn().mockImplementation(() => ({
    tag: jest.fn().mockReturnThis(),
    floatField: jest.fn().mockReturnThis(),
    intField: jest.fn().mockReturnThis(),
    stringField: jest.fn().mockReturnThis(),
    booleanField: jest.fn().mockReturnThis(),
    timestamp: jest.fn().mockReturnThis()
  }))
}));

jest.mock('stripe', () => ({
  default: jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test_123' }),
      update: jest.fn().mockResolvedValue({ id: 'cus_test_123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_test_123' })
    },
    invoices: {
      create: jest.fn().mockResolvedValue({ id: 'inv_test_123' }),
      sendInvoice: jest.fn().mockResolvedValue({ id: 'inv_test_123' }),
      pay: jest.fn().mockResolvedValue({ id: 'inv_test_123' })
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 135000
      })
    }
  }))
}));

jest.mock('modbus-serial', () => ({
  default: jest.fn().mockImplementation(() => ({
    connectTCP: jest.fn().mockResolvedValue(undefined),
    connectRTUBuffered: jest.fn().mockResolvedValue(undefined),
    setID: jest.fn(),
    setTimeout: jest.fn(),
    readHoldingRegisters: jest.fn().mockResolvedValue({
      data: [100, 200] // Mock register values
    }),
    close: jest.fn()
  }))
}));

jest.mock('mqtt', () => ({
  connect: jest.fn().mockImplementation(() => {
    const EventEmitter = require('events');
    const client = new EventEmitter();
    
    // Simulate connection
    setTimeout(() => client.emit('connect'), 100);
    
    client.subscribe = jest.fn((topic, cb) => cb(null));
    client.publish = jest.fn();
    client.end = jest.fn();
    
    return client;
  })
}));

// Mock Claude AI service
jest.mock('@/lib/ai/claude-service', () => ({
  getAnthropicClient: jest.fn().mockReturnValue({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            assessment: 'Mock AI assessment',
            recommendations: ['Recommendation 1', 'Recommendation 2'],
            savingsEstimate: 18
          })
        }]
      })
    }
  }),
  CLAUDE_4_OPUS_CONFIG: {
    model: 'claude-4-opus-test',
    max_tokens: 2048
  }
}));

// Mock database operations
jest.mock('@/lib/db', () => ({
  sql: {
    begin: jest.fn().mockResolvedValue({
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

// Global test utilities
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global timeout for async operations
jest.setTimeout(30000);

logger.info('api', 'Integration test environment configured.');