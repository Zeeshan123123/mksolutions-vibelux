# Alert Detection System

A comprehensive alert detection system for the VibeLux platform that monitors sensor readings in real-time, checks against configured thresholds, and creates alerts when conditions are violated.

## Overview

The Alert Detection system provides:

- **Real-time monitoring** of sensor readings
- **Configurable threshold rules** with multiple condition types
- **Duration-based alerts** to prevent false positives
- **Cooldown periods** to prevent alert spam
- **Multi-channel notifications** (email, SMS, push, in-app)
- **WebSocket broadcasting** for real-time updates
- **Comprehensive audit trail** of all alerts
- **Rate-of-change detection** for rapid sensor changes

## Architecture

### Components

1. **AlertDetector Service** (`src/lib/sensors/alert-detector.ts`)
   - Core alert detection logic
   - Threshold evaluation
   - State management for duration-based alerts
   - Cooldown management

2. **Database Models**
   - `AlertConfiguration`: Alert rules and thresholds
   - `AlertLog`: Historical alert events

3. **API Endpoints**
   - `/api/alerts/configurations`: Manage alert rules
   - `/api/alerts/logs`: Query and manage alert history

4. **Integration Points**
   - `sensor-data-worker.ts`: Processes sensor readings
   - `notification-worker.ts`: Sends notifications
   - WebSocket server: Real-time broadcasting

## Database Schema

### AlertConfiguration

```sql
CREATE TABLE "AlertConfiguration" (
  id              TEXT PRIMARY KEY,
  facilityId      TEXT NOT NULL,
  sensorId        TEXT NOT NULL,
  name            TEXT NOT NULL,
  enabled         BOOLEAN DEFAULT true,
  alertType       AlertType NOT NULL,
  condition       AlertCondition NOT NULL,
  threshold       DOUBLE PRECISION NOT NULL,
  thresholdMax    DOUBLE PRECISION,
  severity        AlertSeverity DEFAULT 'MEDIUM',
  duration        INTEGER,
  cooldownMinutes INTEGER DEFAULT 15,
  actions         JSONB NOT NULL,
  notificationMessage TEXT,
  metadata        JSONB,
  lastTriggeredAt TIMESTAMP,
  triggerCount    INTEGER DEFAULT 0,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP NOT NULL
);
```

### AlertLog

```sql
CREATE TABLE "AlertLog" (
  id              TEXT PRIMARY KEY,
  alertConfigId   TEXT NOT NULL,
  sensorId        TEXT NOT NULL,
  facilityId      TEXT NOT NULL,
  alertType       AlertType NOT NULL,
  severity        AlertSeverity NOT NULL,
  message         TEXT NOT NULL,
  triggeredValue  DOUBLE PRECISION NOT NULL,
  thresholdValue  DOUBLE PRECISION NOT NULL,
  unit            TEXT,
  status          AlertStatus DEFAULT 'ACTIVE',
  acknowledgedBy  TEXT,
  acknowledgedAt  TIMESTAMP,
  resolvedAt      TIMESTAMP,
  resolvedBy      TEXT,
  resolutionNotes TEXT,
  sensorName      TEXT,
  location        TEXT,
  metadata        JSONB,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP NOT NULL
);
```

## Alert Conditions

### Supported Conditions

- **GT**: Greater than threshold
- **GTE**: Greater than or equal to threshold
- **LT**: Less than threshold
- **LTE**: Less than or equal to threshold
- **BETWEEN**: Outside range (value < min OR value > max)
- **RATE**: Rate of change exceeds threshold

### Example Configurations

```javascript
// High temperature alert
{
  name: "High Temperature Alert",
  condition: "GT",
  threshold: 30,
  severity: "HIGH",
  cooldownMinutes: 15
}

// Temperature range alert
{
  name: "Temperature Range Alert", 
  condition: "BETWEEN",
  threshold: 20,
  thresholdMax: 35,
  severity: "CRITICAL",
  duration: 5, // Must persist for 5 minutes
  cooldownMinutes: 10
}

// Rapid temperature change alert
{
  name: "Rapid Temperature Change",
  condition: "RATE",
  threshold: 5, // 5 degrees per second
  severity: "MEDIUM",
  cooldownMinutes: 5
}
```

## Usage

### 1. Create Alert Configuration

```javascript
// POST /api/alerts/configurations
{
  "facilityId": "facility-123",
  "sensorId": "sensor-456", 
  "name": "High Temperature Alert",
  "alertType": "TEMPERATURE_HIGH",
  "condition": "GT",
  "threshold": 30,
  "severity": "HIGH",
  "cooldownMinutes": 15,
  "actions": {
    "email": true,
    "push": true,
    "sms": false
  },
  "notificationMessage": "Temperature alert: {{sensorName}} is {{value}}°C (threshold: {{threshold}}°C)"
}
```

### 2. Query Alert Logs

```javascript
// GET /api/alerts/logs?facilityId=facility-123&status=ACTIVE&limit=20
{
  "success": true,
  "alerts": [
    {
      "id": "alert-789",
      "message": "Temperature alert: Sensor 1 is 35°C (threshold: 30°C)",
      "severity": "HIGH",
      "status": "ACTIVE",
      "triggeredValue": 35,
      "thresholdValue": 30,
      "createdAt": "2024-01-19T10:30:00Z",
      "sensor": {
        "name": "Temperature Sensor 1",
        "sensorType": "TEMPERATURE"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### 3. Acknowledge/Resolve Alerts

```javascript
// PATCH /api/alerts/logs
{
  "alertId": "alert-789",
  "action": "acknowledge" // or "resolve"
}
```

## Integration

### Sensor Data Worker

The AlertDetector is automatically called when processing sensor readings:

```typescript
// In sensor-data-worker.ts
for (const reading of readings) {
  await alertDetector.detectAlerts({
    sensorId,
    value: reading.value,
    unit: reading.unit,
    timestamp: reading.timestamp,
    metadata: {
      sensorName: sensor.name,
      location: sensor.location,
      sensorType: sensor.type,
      facilityId: sensor.facilityId
    }
  });
}
```

### WebSocket Events

Alerts are broadcast in real-time:

```javascript
// Client-side WebSocket listener
ws.on('alert:created', (alert) => {
  console.log('New alert:', alert);
  // Update UI, show notification, etc.
});
```

### Event Emission

The AlertDetector emits events for monitoring:

```typescript
alertDetector.on('alert:created', (alert) => {
  // Handle new alert
});

alertDetector.on('metrics', (metrics) => {
  // Handle performance metrics
});

alertDetector.on('error', (error) => {
  // Handle errors
});
```

## Performance Considerations

### Caching

- Alert configurations are cached in memory (5-minute TTL)
- Cache is invalidated when configurations change
- Redis is used for alert counters and state

### Rate Limiting

- Cooldown periods prevent alert spam
- Maximum 1 alert per minute per configuration
- Duration-based alerts require persistence

### Database Optimization

- Comprehensive indexes for common query patterns
- Partitioned by facility and time for large datasets
- Efficient queries with proper WHERE clauses

## Monitoring

### Metrics

The system emits metrics for monitoring:

- `alerts_triggered_total`: Total alerts triggered
- `alert_evaluation_duration_ms`: Time to evaluate alerts
- Alert counters in Redis (daily totals by facility/severity)

### Logging

Structured logging with context:

```typescript
logger.info('alert-detector', 'Alert created successfully', {
  alertId: 'alert-123',
  configId: 'config-456', 
  sensorId: 'sensor-789',
  severity: 'HIGH',
  value: 35,
  threshold: 30
});
```

## Testing

### Unit Tests

```bash
npm test src/lib/sensors/__tests__/alert-detector.test.ts
```

### Integration Test

```bash
node test-alert-detection.js
```

### Test Coverage

- Threshold evaluation (all conditions)
- Duration-based alerts
- Cooldown management
- Rate-of-change detection
- Error handling
- Database operations

## Migration

### Run Migration

```bash
npx prisma migrate dev --name add_alert_detection
```

### Verify Tables

```bash
node test-alert-detection.js
```

## Configuration Examples

### Temperature Monitoring

```javascript
// High temperature alert
{
  name: "Critical Temperature",
  condition: "GT",
  threshold: 35,
  severity: "CRITICAL",
  duration: 2, // 2 minutes
  cooldownMinutes: 30,
  actions: { email: true, sms: true, push: true }
}

// Low temperature alert  
{
  name: "Low Temperature",
  condition: "LT", 
  threshold: 15,
  severity: "HIGH",
  cooldownMinutes: 15,
  actions: { email: true, push: true }
}
```

### Humidity Monitoring

```javascript
// High humidity alert
{
  name: "High Humidity",
  condition: "GT",
  threshold: 80,
  severity: "MEDIUM", 
  cooldownMinutes: 20,
  actions: { email: true }
}

// Humidity range alert
{
  name: "Humidity Range",
  condition: "BETWEEN",
  threshold: 30,
  thresholdMax: 70,
  severity: "HIGH",
  duration: 5,
  cooldownMinutes: 15,
  actions: { email: true, push: true }
}
```

### CO2 Monitoring

```javascript
// High CO2 alert
{
  name: "High CO2",
  condition: "GT",
  threshold: 1000,
  severity: "CRITICAL",
  duration: 1,
  cooldownMinutes: 10,
  actions: { email: true, sms: true, push: true }
}
```

## Troubleshooting

### Common Issues

1. **Alerts not triggering**
   - Check if configuration is enabled
   - Verify sensor is active
   - Check cooldown periods
   - Review threshold values

2. **Too many alerts**
   - Increase cooldown periods
   - Add duration requirements
   - Review threshold values
   - Check for sensor drift

3. **Performance issues**
   - Monitor cache hit rates
   - Check database query performance
   - Review alert configuration count
   - Monitor memory usage

### Debug Mode

Enable debug logging:

```typescript
logger.debug('alert-detector', 'Alert evaluation', {
  sensorId,
  configsEvaluated: configs.length,
  violationsFound: violations.length
});
```

## Future Enhancements

- Machine learning-based anomaly detection
- Predictive alerting based on trends
- Alert correlation and grouping
- Advanced notification scheduling
- Integration with external monitoring systems
- Alert escalation workflows
- Custom alert templates and branding

## Support

For issues or questions:

1. Check the logs for error messages
2. Verify database connectivity
3. Test with the provided test script
4. Review configuration settings
5. Check sensor data flow

The Alert Detection system is designed to be robust, scalable, and easy to configure while providing comprehensive monitoring capabilities for the VibeLux platform.


