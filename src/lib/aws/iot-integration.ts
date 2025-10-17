/**
 * VibeLux AWS IoT Integration
 * ADDITIVE: Enhances existing platform without replacing functionality
 * Provides optional AWS IoT capabilities alongside existing features
 */

import { IoT, DynamoDB, SecretsManager } from '@aws-sdk/client-aws-sdk-js-v3';

export interface VibeLuxSensorReading {
  facilityId: string;
  sensorId: string;
  sensorType: 'environmental' | 'light' | 'soil' | 'camera' | 'power';
  location?: {
    zone: string;
    coordinates?: { x: number; y: number; z?: number };
  };
  readings: {
    ppfd?: number;           // µmol/m²/s
    temperature?: number;    // °C
    humidity?: number;       // %
    co2?: number;           // ppm
    ph?: number;            // pH scale
    ec?: number;            // Electrical conductivity
    moisture?: number;      // Soil moisture %
    lightSpectrum?: {       // Light spectrum analysis
      red?: number;
      blue?: number;
      green?: number;
      farRed?: number;
      uv?: number;
    };
    power?: {               // Power consumption
      watts?: number;
      voltage?: number;
      current?: number;
      powerFactor?: number;
    };
  };
  metadata?: {
    deviceVersion?: string;
    batteryLevel?: number;
    signalStrength?: number;
    calibrationDate?: string;
  };
}

export interface AlertCondition {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  threshold?: number;
  currentValue?: number;
}

/**
 * AWS IoT Integration for VibeLux Platform
 * Provides optional cloud-based sensor data management
 */
export class VibeLuxAWSIntegration {
  private dynamodb: DynamoDB.DocumentClient;
  private secretsManager: SecretsManager;
  private isEnabled: boolean = false;

  constructor(config?: { 
    region?: string; 
    accessKeyId?: string; 
    secretAccessKey?: string;
    enabled?: boolean;
  }) {
    // Only initialize if AWS integration is enabled
    this.isEnabled = config?.enabled ?? false;
    
    if (this.isEnabled) {
      this.dynamodb = new DynamoDB.DocumentClient({
        region: config?.region || 'us-east-1',
        ...(config?.accessKeyId && {
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey!
          }
        })
      });
      
      this.secretsManager = new SecretsManager({
        region: config?.region || 'us-east-1'
      });
    }
  }

  /**
   * Store sensor data in AWS (optional enhancement)
   * Falls back gracefully if AWS is not available
   */
  async storeSensorData(reading: VibeLuxSensorReading): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('AWS integration disabled, skipping cloud storage');
      return false;
    }

    try {
      const item = {
        FacilityId: reading.facilityId,
        Timestamp: Date.now(),
        SensorId: reading.sensorId,
        SensorType: reading.sensorType,
        Readings: reading.readings,
        Location: reading.location || {},
        Metadata: {
          ...reading.metadata,
          processedAt: new Date().toISOString(),
          source: 'vibelux-platform'
        }
      };

      await this.dynamodb.put({
        TableName: 'VibeLuxSensorData',
        Item: item
      }).promise();

      console.log(`Stored sensor data for facility ${reading.facilityId}`);
      return true;

    } catch (error) {
      console.error('Failed to store sensor data in AWS:', error);
      // Don't throw - AWS failure shouldn't break existing functionality
      return false;
    }
  }

  /**
   * Query historical sensor data from AWS
   * Optional enhancement - existing local data queries still work
   */
  async querySensorData(
    facilityId: string, 
    startTime?: number, 
    endTime?: number,
    sensorType?: string
  ): Promise<VibeLuxSensorReading[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const params: any = {
        TableName: 'VibeLuxSensorData',
        KeyConditionExpression: 'FacilityId = :facilityId',
        ExpressionAttributeValues: {
          ':facilityId': facilityId
        }
      };

      // Add time range if specified
      if (startTime && endTime) {
        params.KeyConditionExpression += ' AND #timestamp BETWEEN :startTime AND :endTime';
        params.ExpressionAttributeNames = { '#timestamp': 'Timestamp' };
        params.ExpressionAttributeValues[':startTime'] = startTime;
        params.ExpressionAttributeValues[':endTime'] = endTime;
      }

      // Add sensor type filter if specified
      if (sensorType) {
        params.FilterExpression = 'SensorType = :sensorType';
        params.ExpressionAttributeValues[':sensorType'] = sensorType;
      }

      const result = await this.dynamodb.query(params).promise();
      
      return (result.Items || []).map(item => ({
        facilityId: item.FacilityId,
        sensorId: item.SensorId,
        sensorType: item.SensorType,
        location: item.Location,
        readings: item.Readings,
        metadata: item.Metadata
      }));

    } catch (error) {
      console.error('Failed to query sensor data from AWS:', error);
      return [];
    }
  }

  /**
   * Get facility analytics from AWS data
   * Complements existing analytics without replacing them
   */
  async getFacilityAnalytics(facilityId: string, timeRange: 'day' | 'week' | 'month') {
    if (!this.isEnabled) {
      return null;
    }

    const now = Date.now();
    const timeRanges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const startTime = now - timeRanges[timeRange];
    const data = await this.querySensorData(facilityId, startTime, now);

    if (data.length === 0) {
      return null;
    }

    // Calculate analytics
    const analytics = {
      totalReadings: data.length,
      timeRange,
      metrics: {
        avgPPFD: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        avgCO2: 0,
        totalPowerConsumption: 0
      },
      trends: {
        ppfdTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
        temperatureTrend: 'stable' as 'increasing' | 'decreasing' | 'stable'
      },
      alerts: [] as AlertCondition[]
    };

    // Calculate averages
    let ppfdSum = 0, tempSum = 0, humiditySum = 0, co2Sum = 0, powerSum = 0;
    let ppfdCount = 0, tempCount = 0, humidityCount = 0, co2Count = 0, powerCount = 0;

    data.forEach(reading => {
      if (reading.readings.ppfd !== undefined) {
        ppfdSum += reading.readings.ppfd;
        ppfdCount++;
      }
      if (reading.readings.temperature !== undefined) {
        tempSum += reading.readings.temperature;
        tempCount++;
      }
      if (reading.readings.humidity !== undefined) {
        humiditySum += reading.readings.humidity;
        humidityCount++;
      }
      if (reading.readings.co2 !== undefined) {
        co2Sum += reading.readings.co2;
        co2Count++;
      }
      if (reading.readings.power?.watts !== undefined) {
        powerSum += reading.readings.power.watts;
        powerCount++;
      }
    });

    analytics.metrics.avgPPFD = ppfdCount > 0 ? ppfdSum / ppfdCount : 0;
    analytics.metrics.avgTemperature = tempCount > 0 ? tempSum / tempCount : 0;
    analytics.metrics.avgHumidity = humidityCount > 0 ? humiditySum / humidityCount : 0;
    analytics.metrics.avgCO2 = co2Count > 0 ? co2Sum / co2Count : 0;
    analytics.metrics.totalPowerConsumption = powerSum;

    return analytics;
  }

  /**
   * Get secure credentials from AWS Secrets Manager
   * Optional enhancement for secure credential management
   */
  async getSecureCredentials(secretName: string): Promise<Record<string, any> | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretName
      }).promise();

      if (result.SecretString) {
        return JSON.parse(result.SecretString);
      }

      return null;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      return null;
    }
  }

  /**
   * Check if AWS integration is available and working
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; services: Record<string, boolean> }> {
    if (!this.isEnabled) {
      return { status: 'unhealthy', services: { aws: false } };
    }

    const services = {
      dynamodb: false,
      secretsManager: false
    };

    // Test DynamoDB connection
    try {
      await this.dynamodb.scan({
        TableName: 'VibeLuxSensorData',
        Limit: 1
      }).promise();
      services.dynamodb = true;
    } catch (error) {
      console.error('DynamoDB health check failed:', error);
    }

    // Test Secrets Manager connection
    try {
      await this.secretsManager.listSecrets({ MaxResults: 1 }).promise();
      services.secretsManager = true;
    } catch (error) {
      console.error('Secrets Manager health check failed:', error);
    }

    const allHealthy = Object.values(services).every(status => status);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services
    };
  }
}

// Global instance (only created if enabled)
export const awsIntegration = new VibeLuxAWSIntegration({
  enabled: process.env.NEXT_PUBLIC_AWS_INTEGRATION_ENABLED === 'true',
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * React Hook for AWS Integration
 * Optional enhancement that works alongside existing hooks
 */
export function useAWSIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      const health = await awsIntegration.healthCheck();
      setHealthStatus(health.status);
      setIsConnected(health.status === 'healthy');
    };

    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    healthStatus,
    storeSensorData: awsIntegration.storeSensorData.bind(awsIntegration),
    querySensorData: awsIntegration.querySensorData.bind(awsIntegration),
    getFacilityAnalytics: awsIntegration.getFacilityAnalytics.bind(awsIntegration)
  };
}