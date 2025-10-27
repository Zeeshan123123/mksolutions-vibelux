# 🌡️ Simple Guide: Add Real Sensors in 5 Minutes

## ✨ Easiest Method: Use Prisma Studio (Recommended)

### Step 1: Open Prisma Studio
```bash
npx prisma studio
```

Your browser will open at **http://localhost:5555**

### Step 2: Find Your Zone ID

1. Click `GreenhouseZone` in left sidebar
2. Find your zone and copy the **`id`** value
3. If no zones exist, you'll need to create zones through your application UI first

### Step 3: Add a Sensor

1. Click `ZoneSensor` in left sidebar
2. Click **"Add record"** button
3. Fill in these fields:

#### **Required Fields:**

| Field | Value | Example |
|-------|-------|---------|
| **zoneId** | Your zone ID from Step 2 | `cm12345abcde` |
| **sensorType** | Choose from dropdown | `TEMPERATURE` |
| **name** | Descriptive name | `Temperature Sensor - Zone A` |
| **unit** | Measurement unit | `°C` |
| **isActive** | Check the box | ✅ `true` |

#### **Recommended Fields:**

| Field | Value | Example |
|-------|-------|---------|
| **minValue** | Minimum reading | `0` |
| **maxValue** | Maximum reading | `50` |
| **accuracy** | Sensor accuracy | `0.5` |
| **x** | X position (meters) | `5` |
| **y** | Y position (meters) | `7.5` |
| **z** | Z position (height) | `2` |

### Step 4: Save

Click **"Save 1 change"** button at bottom

### Step 5: Copy Sensor ID

After saving, copy the sensor's **`id`** value for later use

### Step 6: Create Alert Configuration

1. Click `AlertConfiguration` in left sidebar
2. Click **"Add record"**
3. Fill in:

| Field | Value | Example |
|-------|-------|---------|
| **facilityId** | Your facility ID | Get from Facility table |
| **sensorId** | Sensor ID from Step 5 | The ID you just copied |
| **name** | Alert name | `High Temperature Alert` |
| **enabled** | Check the box | ✅ `true` |
| **alertType** | Choose type | `TEMPERATURE_HIGH` |
| **condition** | Choose condition | `GT` (greater than) |
| **threshold** | Trigger value | `30` |
| **severity** | Choose severity | `HIGH` |
| **cooldownMinutes** | Cooldown period | `15` |
| **actions** | JSON object | `{"email": true, "push": true}` |

### Step 7: Save Alert

Click **"Save 1 change"**

---

## 🎯 Quick Sensor Types Reference

Copy these exact values for **sensorType**:

| Type | Unit | Typical Range | Description |
|------|------|---------------|-------------|
| `TEMPERATURE` | `°C` | `0 - 40` | Air temperature |
| `HUMIDITY` | `%` | `0 - 100` | Relative humidity |
| `CO2` | `ppm` | `300 - 2000` | CO2 concentration |
| `LIGHT` | `μmol/m²/s` | `0 - 2000` | PPFD light intensity |
| `VPD` | `kPa` | `0 - 5` | Vapor Pressure Deficit |
| `PH` | `pH` | `0 - 14` | pH level |
| `EC` | `mS/cm` | `0 - 5` | Electrical Conductivity |

---

## 📊 Alert Conditions Reference

| Condition | Meaning | Example |
|-----------|---------|---------|
| `GT` | Greater than | Temperature > 30°C |
| `GTE` | Greater than or equal | Temperature ≥ 30°C |
| `LT` | Less than | Temperature < 15°C |
| `LTE` | Less than or equal | Temperature ≤ 15°C |
| `BETWEEN` | Outside range | Temperature NOT 18-28°C |
| `RATE` | Rate of change | Change > 5°C/second |

For `BETWEEN` condition, also fill in **`thresholdMax`** field.

---

## 🔄 Testing Your Sensor

### Method 1: Add a Test Reading (Prisma Studio)

1. Click `SensorReading` in sidebar
2. Click **"Add record"**
3. Fill in:
   - **facilityId**: Your facility ID
   - **zoneSensorId**: Your sensor ID
   - **sensorId**: Your sensor ID (same as above)
   - **sensorType**: Same as your sensor
   - **value**: Test value (e.g., `35` for high temp)
   - **unit**: Same unit as sensor
   - **quality**: `100`
   - **timestamp**: Click calendar, select now

4. Save and check `AlertLog` table for triggered alerts!

### Method 2: Using SQL

```sql
INSERT INTO "SensorReading" (
  "facilityId",
  "zoneSensorId", 
  "sensorId",
  "sensorType",
  value,
  unit,
  quality,
  timestamp
) VALUES (
  'YOUR_FACILITY_ID',
  'YOUR_SENSOR_ID',
  'YOUR_SENSOR_ID',
  'TEMPERATURE',
  35.0,
  '°C',
  100,
  NOW()
);
```

---

## ✅ Verification Checklist

After adding a sensor, verify:

- [ ] Sensor appears in `ZoneSensor` table
- [ ] `isActive` is set to `true`
- [ ] Alert configuration exists in `AlertConfiguration` table  
- [ ] Alert configuration `enabled` is `true`
- [ ] Test reading was added
- [ ] Check `AlertLog` table for triggered alert (if threshold exceeded)

---

## 🎨 Example: Complete Temperature Sensor Setup

### Sensor Setup (in Prisma Studio)

**ZoneSensor Table → Add record:**
```
zoneId: cmXXXXXXXXXX (your zone ID)
sensorType: TEMPERATURE
name: Temperature Sensor - Main Growing Area
unit: °C
isActive: ✓ true
minValue: 0
maxValue: 50
accuracy: 0.5
x: 5
y: 7.5
z: 2
```

### Alert Setup (in Prisma Studio)

**AlertConfiguration Table → Add record:**

**High Temperature Alert:**
```
facilityId: cmYYYYYYYYYY (your facility ID)
sensorId: cmZZZZZZZZZZ (sensor ID from above)
name: High Temperature Alert - Growing Area
enabled: ✓ true
alertType: TEMPERATURE_HIGH
condition: GT
threshold: 30
severity: HIGH
cooldownMinutes: 15
actions: {"email": true, "push": true, "sms": false}
notificationMessage: Temperature is {{value}}°C (threshold: {{threshold}}°C)
```

**Low Temperature Alert:**
```
facilityId: cmYYYYYYYYYY (same facility)
sensorId: cmZZZZZZZZZZ (same sensor)
name: Low Temperature Alert - Growing Area
enabled: ✓ true
alertType: TEMPERATURE_LOW
condition: LT
threshold: 15
severity: MEDIUM
cooldownMinutes: 15
actions: {"email": true, "push": true}
```

### Test Reading (in Prisma Studio)

**SensorReading Table → Add record:**
```
facilityId: cmYYYYYYYYYY
zoneSensorId: cmZZZZZZZZZZ
sensorId: cmZZZZZZZZZZ
sensorType: TEMPERATURE
value: 32
unit: °C
quality: 100
timestamp: (click calendar, select now)
```

### Check Results

1. Go to `AlertLog` table
2. You should see a new alert:
   - Message: "Temperature is 32°C (threshold: 30°C)"
   - Status: ACTIVE
   - Severity: HIGH

---

## 🚀 Quick Start Commands

### Open Prisma Studio
```bash
npx prisma studio
```

### Check Your Data
```bash
# List all sensors
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c '
SELECT id, name, "sensorType", unit, "isActive" 
FROM "ZoneSensor" 
LIMIT 10;'

# List all alerts
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c '
SELECT message, severity, status, "createdAt" 
FROM "AlertLog" 
ORDER BY "createdAt" DESC 
LIMIT 5;'
```

---

## 💡 Pro Tips

1. **Start Simple**: Add one sensor of each type first
2. **Test Immediately**: Add a test reading to verify alerts work
3. **Use Descriptive Names**: Include zone and location in sensor names
4. **Set Realistic Thresholds**: Based on your actual growing conditions
5. **Monitor First**: Watch your sensors for a few days before setting strict alerts

---

## 🎉 You're Done!

Your sensors are now:
- ✅ Created in the database
- ✅ Connected to alert configurations
- ✅ Ready to receive data
- ✅ Monitoring your facility 24/7

**Start sending real sensor data and the Alert Detection system will automatically monitor and alert you!**

---

## 📚 Need More Help?

- **Full Documentation**: `cat HOW_TO_ADD_REAL_SENSORS.md`
- **Testing Guide**: `cat ALERT_DETECTION_TESTING_GUIDE.md`
- **Alert Detection README**: `cat ALERT_DETECTION_README.md`

Happy Growing! 🌱

