# How to Add Real Sensors to VibeLux

This guide explains different methods to add real sensors to your VibeLux Alert Detection system.

## 🚀 Quick Start (Automated)

### Run the Automated Setup

```bash
node add-real-sensors-guide.js
```

This will:
- ✅ Check your existing facilities
- ✅ Create greenhouse zones if needed
- ✅ Add 5 different sensor types automatically
- ✅ Create alert configurations for each sensor
- ✅ Submit sample sensor readings
- ✅ Save sensor IDs to `sensor-ids.json`

---

## 📋 Method 1: Using Prisma Studio (Visual GUI)

### Step 1: Open Prisma Studio

```bash
npx prisma studio
```

Open your browser to **http://localhost:5555**

### Step 2: Navigate to ZoneSensor Table

1. Click on `ZoneSensor` in the left sidebar
2. Click "Add record" button

### Step 3: Fill in Sensor Details

**Required Fields:**
- **zoneId**: Select from existing greenhouse zones
- **sensorType**: Choose from dropdown (TEMPERATURE, HUMIDITY, CO2, LIGHT, VPD, etc.)
- **name**: Give it a descriptive name (e.g., "Temperature Sensor - Zone A")
- **unit**: Measurement unit (°C, %, ppm, μmol/m²/s, kPa, etc.)
- **isActive**: Set to `true`

**Optional but Recommended:**
- **minValue**: Minimum expected reading
- **maxValue**: Maximum expected reading
- **accuracy**: Sensor accuracy (e.g., 0.5 for ±0.5°C)
- **x, y, z**: Physical position in the zone (meters)

### Step 4: Save the Sensor

Click "Save 1 change" and note the sensor ID.

---

## 📋 Method 2: Using Node.js Script

### Create a Simple Script

Create `add-my-sensors.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMySensors() {
  // Replace with your actual zone ID
  const zoneId = 'YOUR_ZONE_ID_HERE';

  // Add Temperature Sensor
  const tempSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'TEMPERATURE',
      name: 'My Temperature Sensor',
      unit: '°C',
      isActive: true,
      minValue: 0,
      maxValue: 40,
      accuracy: 0.5
    }
  });
  console.log('✅ Created temperature sensor:', tempSensor.id);

  // Add more sensors as needed...

  await prisma.$disconnect();
}

addMySensors();
```

Run it:
```bash
node add-my-sensors.js
```

---

## 📋 Method 3: Using the API (Coming Soon)

Once your app is running, you can add sensors via the API:

```bash
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "zoneId": "YOUR_ZONE_ID",
    "sensorType": "TEMPERATURE",
    "name": "Temperature Sensor 1",
    "unit": "°C",
    "minValue": 0,
    "maxValue": 40,
    "accuracy": 0.5,
    "isActive": true
  }'
```

---

## 📊 Available Sensor Types

The system supports these sensor types:

| Sensor Type | Unit | Typical Range | Use Case |
|-------------|------|---------------|----------|
| **TEMPERATURE** | °C or °F | -10 to 50°C | Air temperature monitoring |
| **HUMIDITY** | % | 0 to 100% | Relative humidity |
| **CO2** | ppm | 300 to 2000 ppm | CO2 concentration |
| **LIGHT** | μmol/m²/s | 0 to 2000 | PPFD (light intensity) |
| **VPD** | kPa | 0 to 5 kPa | Vapor Pressure Deficit |
| **PH** | pH | 0 to 14 | pH levels (water/nutrients) |
| **EC** | mS/cm | 0 to 5 | Electrical Conductivity |
| **WATER_LEVEL** | cm or L | Varies | Water level monitoring |
| **FLOW** | L/min | Varies | Water flow rate |
| **PRESSURE** | bar or PSI | Varies | System pressure |

---

## 🎯 Complete Example: Setting Up a Full Zone

Here's a complete example of setting up all sensors for a growing zone:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupCompleteZone() {
  const facilityId = 'YOUR_FACILITY_ID';
  const zoneId = 'YOUR_ZONE_ID';

  // 1. Temperature Sensor
  const tempSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'TEMPERATURE',
      name: 'Zone A - Temperature',
      unit: '°C',
      isActive: true,
      minValue: 10,
      maxValue: 35,
      accuracy: 0.5,
      x: 5, y: 7.5, z: 2 // Position in zone
    }
  });

  // 2. Humidity Sensor
  const humiditySensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'HUMIDITY',
      name: 'Zone A - Humidity',
      unit: '%',
      isActive: true,
      minValue: 0,
      maxValue: 100,
      accuracy: 2,
      x: 5, y: 7.5, z: 2
    }
  });

  // 3. CO2 Sensor
  const co2Sensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'CO2',
      name: 'Zone A - CO2',
      unit: 'ppm',
      isActive: true,
      minValue: 0,
      maxValue: 5000,
      accuracy: 50,
      x: 5, y: 7.5, z: 2
    }
  });

  // 4. Light Sensor (PPFD)
  const lightSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'LIGHT',
      name: 'Zone A - PPFD Sensor',
      unit: 'μmol/m²/s',
      isActive: true,
      minValue: 0,
      maxValue: 2000,
      accuracy: 10,
      x: 5, y: 7.5, z: 1.5 // At canopy level
    }
  });

  // 5. VPD Sensor
  const vpdSensor = await prisma.zoneSensor.create({
    data: {
      zoneId,
      sensorType: 'VPD',
      name: 'Zone A - VPD',
      unit: 'kPa',
      isActive: true,
      minValue: 0,
      maxValue: 5,
      accuracy: 0.1,
      x: 5, y: 7.5, z: 2
    }
  });

  console.log('✅ Created 5 sensors!');
  
  // Now create alert configurations
  await createAlertsForSensors(facilityId, {
    tempSensor,
    humiditySensor,
    co2Sensor,
    lightSensor,
    vpdSensor
  });

  await prisma.$disconnect();
}

async function createAlertsForSensors(facilityId, sensors) {
  // High temperature alert
  await prisma.alertConfiguration.create({
    data: {
      facilityId,
      sensorId: sensors.tempSensor.id,
      name: 'High Temperature Alert',
      enabled: true,
      alertType: 'TEMPERATURE_HIGH',
      condition: 'GT',
      threshold: 30,
      severity: 'HIGH',
      cooldownMinutes: 15,
      actions: { email: true, push: true }
    }
  });

  // Low temperature alert
  await prisma.alertConfiguration.create({
    data: {
      facilityId,
      sensorId: sensors.tempSensor.id,
      name: 'Low Temperature Alert',
      enabled: true,
      alertType: 'TEMPERATURE_LOW',
      condition: 'LT',
      threshold: 15,
      severity: 'MEDIUM',
      cooldownMinutes: 15,
      actions: { email: true, push: true }
    }
  });

  // Humidity range alert
  await prisma.alertConfiguration.create({
    data: {
      facilityId,
      sensorId: sensors.humiditySensor.id,
      name: 'Humidity Range Alert',
      enabled: true,
      alertType: 'HUMIDITY_HIGH',
      condition: 'BETWEEN',
      threshold: 40,      // Min
      thresholdMax: 70,   // Max
      severity: 'MEDIUM',
      cooldownMinutes: 20,
      actions: { email: true }
    }
  });

  // High CO2 alert
  await prisma.alertConfiguration.create({
    data: {
      facilityId,
      sensorId: sensors.co2Sensor.id,
      name: 'High CO2 Alert',
      enabled: true,
      alertType: 'CO2_HIGH',
      condition: 'GT',
      threshold: 1500,
      severity: 'CRITICAL',
      cooldownMinutes: 10,
      actions: { email: true, sms: true, push: true }
    }
  });

  console.log('✅ Created alert configurations!');
}

setupCompleteZone();
```

---

## 📡 Sending Sensor Data

Once sensors are created, you can send data to them:

### Method 1: Direct Database Insert

```javascript
await prisma.sensorReading.create({
  data: {
    facilityId: 'YOUR_FACILITY_ID',
    zoneSensorId: 'YOUR_SENSOR_ID',
    sensorId: 'YOUR_SENSOR_ID',
    sensorType: 'TEMPERATURE',
    value: 22.5,
    unit: '°C',
    quality: 100,
    timestamp: new Date()
  }
});
```

### Method 2: Using the Alert Detector

```javascript
const { alertDetector } = require('./src/lib/sensors/alert-detector');

await alertDetector.detectAlerts({
  sensorId: 'YOUR_SENSOR_ID',
  value: 22.5,
  unit: '°C',
  timestamp: new Date(),
  metadata: {
    sensorName: 'Temperature Sensor 1',
    location: 'Zone A',
    facilityId: 'YOUR_FACILITY_ID'
  }
});
```

### Method 3: Bulk Data Submission

```javascript
const readings = [
  { sensorId: 'temp-sensor-id', value: 22.5, unit: '°C' },
  { sensorId: 'humidity-sensor-id', value: 55, unit: '%' },
  { sensorId: 'co2-sensor-id', value: 800, unit: 'ppm' }
];

for (const reading of readings) {
  await alertDetector.detectAlerts({
    ...reading,
    timestamp: new Date(),
    metadata: { facilityId: 'YOUR_FACILITY_ID' }
  });
}
```

---

## 🔍 Verifying Your Sensors

### Check Sensors in Database

```bash
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c 'SELECT id, name, "sensorType", unit, "isActive" FROM "ZoneSensor" LIMIT 10;'
```

### Check via Prisma Studio

```bash
npx prisma studio
```

Navigate to ZoneSensor table to see all sensors.

### Check Sensor Count

```javascript
const count = await prisma.zoneSensor.count({
  where: { isActive: true }
});
console.log(`Active sensors: ${count}`);
```

---

## 🎯 Best Practices

### 1. Sensor Naming Convention

Use a clear naming convention:
```
[Zone Name] - [Sensor Type] - [Location/Number]

Examples:
- "Zone A - Temperature - North"
- "Zone B - Humidity - Center"
- "Veg Room 1 - CO2 - Main"
```

### 2. Position Tracking

Always set x, y, z coordinates:
- **x**: Distance from west wall (meters)
- **y**: Distance from south wall (meters)
- **z**: Height from floor (meters)

### 3. Accuracy Specification

Set realistic accuracy values:
- Temperature: ±0.5°C
- Humidity: ±2%
- CO2: ±50 ppm
- PPFD: ±10 μmol/m²/s

### 4. Min/Max Values

Set appropriate ranges to catch outliers:
```javascript
{
  minValue: 0,    // Sensor can't read below this
  maxValue: 50,   // Sensor can't read above this
}
```

---

## 🚨 Creating Alert Rules for New Sensors

After adding sensors, create alert rules:

```javascript
await prisma.alertConfiguration.create({
  data: {
    facilityId: 'YOUR_FACILITY_ID',
    sensorId: 'YOUR_NEW_SENSOR_ID',
    name: 'Descriptive Alert Name',
    enabled: true,
    alertType: 'TEMPERATURE_HIGH',     // Choose appropriate type
    condition: 'GT',                    // GT, GTE, LT, LTE, BETWEEN, RATE
    threshold: 30,                      // Your threshold value
    severity: 'HIGH',                   // LOW, MEDIUM, HIGH, CRITICAL
    cooldownMinutes: 15,                // Prevent alert spam
    actions: {
      email: true,
      push: true,
      sms: false
    },
    notificationMessage: 'Custom message with {{value}} and {{threshold}}'
  }
});
```

---

## 📊 Monitoring Your Sensors

### View Latest Readings

```sql
SELECT 
  s.name,
  s."sensorType",
  sr.value,
  sr.unit,
  sr.timestamp
FROM "SensorReading" sr
JOIN "ZoneSensor" s ON s.id = sr."zoneSensorId"
ORDER BY sr.timestamp DESC
LIMIT 20;
```

### View Active Alerts

```sql
SELECT 
  al.message,
  al.severity,
  al.status,
  al."triggeredValue",
  al."thresholdValue",
  al."createdAt"
FROM "AlertLog" al
WHERE al.status = 'ACTIVE'
ORDER BY al."createdAt" DESC;
```

---

## 🎉 Quick Setup Summary

1. **Run automated setup**:
   ```bash
   node add-real-sensors-guide.js
   ```

2. **Check created sensors**:
   ```bash
   npx prisma studio
   ```

3. **View sensor IDs**:
   ```bash
   cat sensor-ids.json
   ```

4. **Start sending data** to your sensors

5. **Monitor alerts**:
   ```bash
   node test-alert-detection-simple.js
   ```

---

## 💡 Troubleshooting

### Problem: Can't find zone ID

**Solution:**
```javascript
const zones = await prisma.greenhouseZone.findMany({
  include: { design: { select: { facilityId: true } } }
});
console.log(zones);
```

### Problem: Sensor creation fails

**Solution:** Check that all required fields are provided and zone exists.

### Problem: No alerts triggering

**Solution:** 
1. Verify sensor has alert configurations
2. Check that alert is enabled
3. Verify threshold values are correct
4. Check cooldown hasn't been exceeded

---

## 📚 Additional Resources

- [Alert Detection README](./ALERT_DETECTION_README.md)
- [Testing Guide](./ALERT_DETECTION_TESTING_GUIDE.md)
- [Implementation Success](./ALERT_DETECTION_IMPLEMENTATION_SUCCESS.md)

---

**Need Help?** Check the sensor IDs in `sensor-ids.json` or run the setup script again!

