/**
 * AlertDetector Test Suite
 * Comprehensive tests for alert detection functionality
 */

import { AlertDetector, SensorReading, AlertConfiguration } from '../alert-detector';
import { prisma } from '../../../prisma';
import { redis } from '../../../redis';
import { logger } from '../../../logging/production-logger';

// Mock dependencies
jest.mock('../../../prisma', () => ({
  prisma: {
    alertConfiguration: {
      findMany: jest.fn(),
    },
    alertLog: {
      create: jest.fn(),
    },
    alertConfiguration: {
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../redis', () => ({
  redis: {
    pipeline: jest.fn(() => ({
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    })),
  },
}));

jest.mock('../../../logging/production-logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../websocket/scalable-websocket-server', () => ({
  getWebSocketServer: jest.fn(() => ({
    io: {
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
    },
  })),
}));

jest.mock('../../../queue/queue-manager', () => ({
  queues: {
    notificationQueue: {
      add: jest.fn(),
    },
  },
}));

describe('AlertDetector', () => {
  let alertDetector: AlertDetector;
  let mockConfigs: AlertConfiguration[];
  let mockReading: SensorReading;

  beforeEach(() => {
    alertDetector = new AlertDetector();
    jest.clearAllMocks();

    // Mock alert configurations
    mockConfigs = [
      {
        id: 'config-1',
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'High Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 15,
        actions: { email: true, push: true },
        triggerCount: 0,
      },
      {
        id: 'config-2',
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'Low Humidity Alert',
        enabled: true,
        alertType: 'HUMIDITY_LOW',
        condition: 'LT',
        threshold: 40,
        severity: 'MEDIUM',
        cooldownMinutes: 10,
        actions: { email: true },
        triggerCount: 0,
      },
      {
        id: 'config-3',
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'Temperature Range Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'BETWEEN',
        threshold: 20,
        thresholdMax: 35,
        severity: 'CRITICAL',
        cooldownMinutes: 5,
        actions: { email: true, sms: true, push: true },
        triggerCount: 0,
      },
    ];

    // Mock sensor reading
    mockReading = {
      sensorId: 'sensor-1',
      value: 32,
      unit: '°C',
      timestamp: new Date(),
      metadata: {
        sensorName: 'Temperature Sensor 1',
        location: 'Zone A',
      },
    };
  });

  describe('detectAlerts', () => {
    it('should process alerts for enabled configurations', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue(mockConfigs);
      (prisma.alertLog.create as jest.Mock).mockResolvedValue({ id: 'alert-1' });
      (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});

      await alertDetector.detectAlerts(mockReading);

      expect(prisma.alertConfiguration.findMany).toHaveBeenCalledWith({
        where: {
          sensorId: 'sensor-1',
          enabled: true,
        },
        orderBy: {
          severity: 'desc',
        },
      });
    });

    it('should not process alerts when no configurations exist', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue([]);

      await alertDetector.detectAlerts(mockReading);

      expect(prisma.alertLog.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully without breaking sensor pipeline', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(alertDetector.detectAlerts(mockReading)).resolves.not.toThrow();
    });
  });

  describe('evaluateThreshold', () => {
    beforeEach(() => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue(mockConfigs);
    });

    it('should detect GT (greater than) violations', async () => {
      const config = mockConfigs[0]; // GT condition with threshold 30
      const reading = { ...mockReading, value: 35 }; // Above threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeTruthy();
      expect(violation?.actualValue).toBe(35);
      expect(violation?.thresholdValue).toBe(30);
      expect(violation?.condition).toBe('GT');
    });

    it('should not trigger GT alert when value is below threshold', async () => {
      const config = mockConfigs[0]; // GT condition with threshold 30
      const reading = { ...mockReading, value: 25 }; // Below threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeNull();
    });

    it('should detect LT (less than) violations', async () => {
      const config = mockConfigs[1]; // LT condition with threshold 40
      const reading = { ...mockReading, value: 35 }; // Below threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeTruthy();
      expect(violation?.actualValue).toBe(35);
      expect(violation?.thresholdValue).toBe(40);
      expect(violation?.condition).toBe('LT');
    });

    it('should detect BETWEEN violations (outside range)', async () => {
      const config = mockConfigs[2]; // BETWEEN condition with range 20-35
      const reading = { ...mockReading, value: 15 }; // Below range

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeTruthy();
      expect(violation?.actualValue).toBe(15);
      expect(violation?.condition).toBe('BETWEEN');
    });

    it('should not trigger BETWEEN alert when value is within range', async () => {
      const config = mockConfigs[2]; // BETWEEN condition with range 20-35
      const reading = { ...mockReading, value: 25 }; // Within range

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeNull();
    });

    it('should handle GTE (greater than or equal) conditions', async () => {
      const config = { ...mockConfigs[0], condition: 'GTE' };
      const reading = { ...mockReading, value: 30 }; // Equal to threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeTruthy();
    });

    it('should handle LTE (less than or equal) conditions', async () => {
      const config = { ...mockConfigs[1], condition: 'LTE' };
      const reading = { ...mockReading, value: 40 }; // Equal to threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeTruthy();
    });
  });

  describe('duration-based alerts', () => {
    it('should not trigger alert immediately if duration requirement exists', async () => {
      const config = { ...mockConfigs[0], duration: 5 }; // 5 minutes duration
      const reading = { ...mockReading, value: 35 }; // Above threshold

      const violation = await alertDetector.evaluateThreshold(config, reading);

      expect(violation).toBeNull(); // Should not trigger immediately
    });

    it('should track violation state for duration-based alerts', async () => {
      const config = { ...mockConfigs[0], duration: 5 };
      const reading = { ...mockReading, value: 35 };

      // First evaluation - should start tracking
      await alertDetector.evaluateThreshold(config, reading);
      
      const states = alertDetector.getAlertStates();
      expect(states.has(config.id)).toBe(true);
    });
  });

  describe('cooldown management', () => {
    it('should respect cooldown periods', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      // First alert - should trigger
      (prisma.alertLog.create as jest.Mock).mockResolvedValue({ id: 'alert-1' });
      (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});
      
      await alertDetector.detectAlerts(reading);
      expect(prisma.alertLog.create).toHaveBeenCalledTimes(1);

      // Second alert immediately - should be blocked by cooldown
      await alertDetector.detectAlerts(reading);
      expect(prisma.alertLog.create).toHaveBeenCalledTimes(1); // Still only 1
    });

    it('should allow alerts after cooldown period expires', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      // First alert
      (prisma.alertLog.create as jest.Mock).mockResolvedValue({ id: 'alert-1' });
      (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});
      
      await alertDetector.detectAlerts(reading);

      // Manually clear cooldown (simulate time passing)
      const cooldownTracker = alertDetector.getCooldownTracker();
      cooldownTracker.delete(config.id);

      // Second alert - should trigger now
      await alertDetector.detectAlerts(reading);
      expect(prisma.alertLog.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('rate of change detection', () => {
    it('should detect rapid rate of change', async () => {
      const config = { ...mockConfigs[0], condition: 'RATE', threshold: 5 }; // 5 units/second
      
      // First reading
      const reading1 = { ...mockReading, value: 20, timestamp: new Date() };
      await alertDetector.evaluateThreshold(config, reading1);

      // Second reading with rapid change (10 units in 1 second = 10 units/sec)
      const reading2 = { 
        ...mockReading, 
        value: 30, 
        timestamp: new Date(Date.now() + 1000) 
      };

      const violation = await alertDetector.evaluateThreshold(config, reading2);

      expect(violation).toBeTruthy();
      expect(violation?.condition).toBe('RATE');
      expect(violation?.actualValue).toBe(10); // 10 units/second
    });

    it('should not trigger rate alert for gradual changes', async () => {
      const config = { ...mockConfigs[0], condition: 'RATE', threshold: 5 };
      
      // First reading
      const reading1 = { ...mockReading, value: 20, timestamp: new Date() };
      await alertDetector.evaluateThreshold(config, reading1);

      // Second reading with gradual change (2 units in 1 second = 2 units/sec)
      const reading2 = { 
        ...mockReading, 
        value: 22, 
        timestamp: new Date(Date.now() + 1000) 
      };

      const violation = await alertDetector.evaluateThreshold(config, reading2);

      expect(violation).toBeNull();
    });
  });

  describe('alert creation', () => {
    beforeEach(() => {
      (prisma.alertLog.create as jest.Mock).mockResolvedValue({ 
        id: 'alert-1',
        createdAt: new Date(),
        triggeredValue: 35,
        thresholdValue: 30
      });
      (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});
    });

    it('should create alert log entry', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      await alertDetector.detectAlerts(reading);

      expect(prisma.alertLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          alertConfigId: config.id,
          sensorId: reading.sensorId,
          facilityId: config.facilityId,
          alertType: config.alertType,
          severity: config.severity,
          triggeredValue: 35,
          thresholdValue: 30,
          unit: reading.unit,
          sensorName: reading.metadata?.sensorName,
          location: reading.metadata?.location,
        }),
      });
    });

    it('should update configuration trigger count', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      await alertDetector.detectAlerts(reading);

      expect(prisma.alertConfiguration.update).toHaveBeenCalledWith({
        where: { id: config.id },
        data: {
          lastTriggeredAt: expect.any(Date),
          triggerCount: { increment: 1 },
        },
      });
    });

    it('should emit alert:created event', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      const eventSpy = jest.fn();
      alertDetector.on('alert:created', eventSpy);

      await alertDetector.detectAlerts(reading);

      expect(eventSpy).toHaveBeenCalledWith({
        alertId: 'alert-1',
        configId: config.id,
        sensorId: reading.sensorId,
        facilityId: config.facilityId,
        severity: config.severity,
        message: expect.any(String),
        value: 35,
        threshold: 30,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('message generation', () => {
    it('should generate default message when no custom template provided', async () => {
      const config = mockConfigs[0];
      const reading = { ...mockReading, value: 35 };

      await alertDetector.detectAlerts(reading);

      expect(prisma.alertLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: expect.stringContaining('High Temperature Alert: exceeded threshold'),
        }),
      });
    });

    it('should use custom notification message template', async () => {
      const config = {
        ...mockConfigs[0],
        notificationMessage: 'Alert: {{sensorName}} value {{value}} {{condition}} threshold {{threshold}}',
      };
      const reading = { ...mockReading, value: 35 };

      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue([config]);

      await alertDetector.detectAlerts(reading);

      expect(prisma.alertLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: expect.stringContaining('Alert: Temperature Sensor 1 value 35 exceeded threshold 30'),
        }),
      });
    });
  });

  describe('caching', () => {
    it('should cache alert configurations', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue(mockConfigs);

      // First call
      await alertDetector.detectAlerts(mockReading);
      
      // Second call should use cache
      await alertDetector.detectAlerts(mockReading);

      expect(prisma.alertConfiguration.findMany).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache when requested', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue(mockConfigs);

      // First call
      await alertDetector.detectAlerts(mockReading);
      
      // Invalidate cache
      alertDetector.invalidateConfigCache('sensor-1');
      
      // Second call should fetch from database again
      await alertDetector.detectAlerts(mockReading);

      expect(prisma.alertConfiguration.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired states and cooldowns', () => {
      const now = new Date();
      const oldTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      // Add old state
      const states = alertDetector.getAlertStates();
      states.set('old-config', {
        configId: 'old-config',
        sensorId: 'sensor-1',
        startTime: oldTime,
        lastValue: 25,
        violationCount: 1,
      });

      // Add old cooldown
      const cooldowns = alertDetector.getCooldownTracker();
      cooldowns.set('old-config', oldTime);

      // Run cleanup
      alertDetector.cleanup();

      expect(states.has('old-config')).toBe(false);
      expect(cooldowns.has('old-config')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      (prisma.alertConfiguration.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const errorSpy = jest.fn();
      alertDetector.on('error', errorSpy);

      await alertDetector.detectAlerts(mockReading);

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle missing thresholdMax for BETWEEN condition', async () => {
      const config = { ...mockConfigs[2], thresholdMax: undefined };
      (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue([config]);

      await alertDetector.detectAlerts(mockReading);

      expect(logger.warn).toHaveBeenCalledWith(
        'alert-detector',
        'BETWEEN condition requires thresholdMax',
        { configId: config.id }
      );
    });
  });
});

describe('AlertDetector Integration', () => {
  let alertDetector: AlertDetector;

  beforeEach(() => {
    alertDetector = new AlertDetector();
    jest.clearAllMocks();
  });

  it('should handle multiple sensor readings in sequence', async () => {
    const configs = [
      {
        id: 'config-1',
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'Temperature Alert',
        enabled: true,
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 1, // Short cooldown for testing
        actions: { email: true },
        triggerCount: 0,
      },
    ];

    (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue(configs);
    (prisma.alertLog.create as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});

    const readings = [
      { ...mockReading, value: 35, timestamp: new Date() },
      { ...mockReading, value: 25, timestamp: new Date(Date.now() + 1000) },
      { ...mockReading, value: 40, timestamp: new Date(Date.now() + 2000) },
    ];

    for (const reading of readings) {
      await alertDetector.detectAlerts(reading);
    }

    // Should create alerts for values 35 and 40 (above threshold)
    expect(prisma.alertLog.create).toHaveBeenCalledTimes(2);
  });

  it('should maintain state across multiple evaluations', async () => {
    const config = {
      id: 'config-1',
      facilityId: 'facility-1',
      sensorId: 'sensor-1',
      name: 'Duration Alert',
      enabled: true,
      alertType: 'TEMPERATURE_HIGH',
      condition: 'GT',
      threshold: 30,
      severity: 'HIGH',
      duration: 2, // 2 minutes
      cooldownMinutes: 1,
      actions: { email: true },
      triggerCount: 0,
    };

    (prisma.alertConfiguration.findMany as jest.Mock).mockResolvedValue([config]);

    // First reading - should start tracking
    const reading1 = { ...mockReading, value: 35, timestamp: new Date() };
    await alertDetector.detectAlerts(reading1);

    // Second reading - should continue tracking
    const reading2 = { ...mockReading, value: 36, timestamp: new Date(Date.now() + 60000) }; // 1 minute later
    await alertDetector.detectAlerts(reading2);

    // Third reading - should trigger after duration
    const reading3 = { ...mockReading, value: 37, timestamp: new Date(Date.now() + 120000) }; // 2 minutes later
    (prisma.alertLog.create as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    (prisma.alertConfiguration.update as jest.Mock).mockResolvedValue({});

    await alertDetector.detectAlerts(reading3);

    expect(prisma.alertLog.create).toHaveBeenCalledTimes(1);
  });
});


