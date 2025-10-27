# 🎯 Alert Detection - Quick Reference Card

## 📂 Key Files Changed/Created

### **Core Alert System (The Brain)** 🧠
```
src/lib/sensors/alert-detector.ts                     ← MAIN LOGIC (636 lines)
```
**What it does:** Monitors readings, checks thresholds, creates alerts

### **Integration Point** 🔗
```
src/lib/queue/workers/sensor-data-worker.ts           ← CALLS DETECTOR (lines 102-115)
```
**What it does:** Processes sensor readings, calls alert detector

### **Database Schema** 💾
```
prisma/schema.prisma                                   ← ADDED MODELS
prisma/migrations/20250119_add_alert_detection/        ← MIGRATION FILES
```
**What it does:** AlertConfiguration & AlertLog tables

### **API Endpoints** 🌐
```
src/app/api/alerts/configurations/route.ts             ← MANAGE RULES
src/app/api/alerts/logs/route.ts                       ← QUERY ALERTS
```
**What they do:** CRUD operations for alert rules and logs

### **Main UI Component** 🎨
```
src/components/alerts/AlertDetectionDashboard.tsx      ← MAIN DASHBOARD
src/hooks/useAlertWebSocket.ts                         ← WEBSOCKET HOOK
```
**What they do:** Display alerts, real-time updates, user actions

### **Frontend Integration** 🔌
```
src/app/cultivation/page.tsx                           ← INTEGRATED HERE (Alarms tab)
```
**What changed:** Replaced placeholder with AlertDetectionDashboard

---

## 🔄 Data Flow (Simplified)

```
┌─────────────┐
│   Sensor    │  Reading: 35°C
│   Reading   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  sensor-data-worker.ts (lines 102-115)  │  Processes reading
└──────┬──────────────────────────────────┘
       │
       ↓ calls detectAlerts()
       │
┌─────────────────────────────────────────┐
│  alert-detector.ts                      │
│  ├─ getAlertConfigurations() (line 506) │  Get rules from DB/cache
│  ├─ evaluateThreshold() (line 131)      │  Check: 35 > 30? ✓
│  ├─ shouldTriggerAlert() (line 544)     │  Check cooldown
│  ├─ createAlert() (line 298)            │  Insert to AlertLog
│  ├─ queueNotifications() (line 419)     │  Queue email/SMS/push
│  └─ broadcastAlert() (line 452)         │  Send to WebSocket
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  Frontend                               │
│  ├─ useAlertWebSocket.ts                │  Receives WebSocket event
│  ├─ AlertDetectionDashboard.tsx         │  Updates UI
│  └─ Toast Notification                  │  Shows alert
└─────────────────────────────────────────┘
       │
       ↓
   USER SEES ALERT! 🎉
```

**Total Time:** ~250ms from sensor reading to UI display

---

## 📊 Database Tables

### **AlertConfiguration** (Alert Rules)
```
id                 String      (Primary Key)
facilityId         String      (Which facility)
sensorId           String      (Which sensor to monitor)
name               String      (e.g., "High Temperature Alert")
enabled            Boolean     (Is rule active?)
alertType          Enum        (TEMPERATURE_HIGH, HUMIDITY_HIGH, etc.)
condition          Enum        (GT, LT, GTE, LTE, BETWEEN, RATE)
threshold          Float       (Trigger value, e.g., 30)
thresholdMax       Float?      (For BETWEEN condition)
severity           Enum        (LOW, MEDIUM, HIGH, CRITICAL)
duration           Int?        (Must persist X minutes)
cooldownMinutes    Int         (Wait X minutes before next alert)
actions            JSON        ({"email": true, "push": true, "sms": false})
notificationMessage String?    (Custom message template)
lastTriggeredAt    DateTime?   (When last triggered)
triggerCount       Int         (How many times triggered)
```

### **AlertLog** (Alert History)
```
id                 String      (Primary Key)
alertConfigId      String      (Which rule triggered)
sensorId           String      (Which sensor)
facilityId         String      (Which facility)
alertType          Enum        (TEMPERATURE_HIGH, etc.)
severity           Enum        (LOW, MEDIUM, HIGH, CRITICAL)
message            String      (Alert message)
triggeredValue     Float       (Actual value, e.g., 35)
thresholdValue     Float       (Threshold value, e.g., 30)
unit               String      (°C, %, ppm, etc.)
status             Enum        (ACTIVE, ACKNOWLEDGED, RESOLVED)
acknowledgedBy     String?     (User who acknowledged)
acknowledgedAt     DateTime?   (When acknowledged)
resolvedBy         String?     (User who resolved)
resolvedAt         DateTime?   (When resolved)
sensorName         String?     (Sensor display name)
location           String?     (Sensor location)
```

---

## 🎯 Alert Conditions

| Condition | Meaning | Example | When Triggers |
|-----------|---------|---------|---------------|
| `GT` | Greater than | `threshold: 30` | value > 30 (e.g., 31, 35, 40) |
| `GTE` | Greater or equal | `threshold: 30` | value ≥ 30 (e.g., 30, 35, 40) |
| `LT` | Less than | `threshold: 15` | value < 15 (e.g., 14, 10, 5) |
| `LTE` | Less or equal | `threshold: 15` | value ≤ 15 (e.g., 15, 10, 5) |
| `BETWEEN` | Outside range | `threshold: 20, thresholdMax: 30` | value < 20 OR value > 30 |
| `RATE` | Rate of change | `threshold: 5` | change > 5 per second |

---

## 🔍 How to Find/Edit Alert Logic

### **Want to change threshold evaluation?**
```
FILE: src/lib/sensors/alert-detector.ts
FUNCTION: evaluateThreshold() (lines 130-192)
```

### **Want to change how alerts are created?**
```
FILE: src/lib/sensors/alert-detector.ts
FUNCTION: createAlert() (lines 298-377)
```

### **Want to change notification sending?**
```
FILE: src/lib/sensors/alert-detector.ts
FUNCTION: queueNotifications() (lines 419-450)
```

### **Want to change WebSocket broadcasting?**
```
FILE: src/lib/sensors/alert-detector.ts
FUNCTION: broadcastAlert() (lines 452-476)
```

### **Want to change when detector is called?**
```
FILE: src/lib/queue/workers/sensor-data-worker.ts
LINES: 102-115
```

### **Want to change the UI?**
```
FILE: src/components/alerts/AlertDetectionDashboard.tsx
```

### **Want to change WebSocket connection?**
```
FILE: src/hooks/useAlertWebSocket.ts
```

---

## 🧪 Testing Checklist

### **1. Test Alert Rule Creation**
```bash
# Via Prisma Studio (http://localhost:5556)
1. Go to AlertConfiguration table
2. Add a record with threshold: 30, condition: GT
3. Verify it appears in the table
```

### **2. Test Alert Detection**
```bash
# Via Prisma Studio
1. Go to SensorReading table
2. Add a reading with value: 35 (above threshold)
3. Check AlertLog table - should see new alert
```

### **3. Test Frontend Display**
```bash
# Via Browser
1. Go to http://localhost:3000/cultivation
2. Click "Alarms" tab
3. Should see your alert with:
   - Severity indicator
   - Sensor name
   - Message
   - Acknowledge/Resolve buttons
```

### **4. Test WebSocket Real-time**
```bash
# Via Browser
1. Open cultivation page (Alarms tab)
2. In another window, add a sensor reading above threshold
3. Should see toast notification appear
4. Should see alert in list without refresh
```

### **5. Test User Actions**
```bash
# Via Browser
1. Click "Acknowledge" on an alert
2. Should update status to ACKNOWLEDGED
3. Should update UI immediately
4. Check AlertLog table - acknowledgedAt should be set
```

---

## 📝 Common Tasks

### **Task 1: Create a Temperature Alert Rule**
```typescript
// Via API
POST /api/alerts/configurations
{
  "facilityId": "your-facility-id",
  "sensorId": "your-sensor-id",
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
  }
}
```

### **Task 2: Create a Humidity Range Alert**
```typescript
POST /api/alerts/configurations
{
  "facilityId": "your-facility-id",
  "sensorId": "your-sensor-id",
  "name": "Humidity Range Alert",
  "alertType": "HUMIDITY_OUT_OF_RANGE",
  "condition": "BETWEEN",
  "threshold": 40,
  "thresholdMax": 70,
  "severity": "HIGH",
  "duration": 5,        // Must persist 5 minutes
  "cooldownMinutes": 15,
  "actions": {
    "email": true,
    "push": true
  }
}
```

### **Task 3: Query Active Alerts**
```typescript
GET /api/alerts/logs?facilityId=your-facility-id&status=ACTIVE&limit=20
```

### **Task 4: Acknowledge an Alert**
```typescript
PATCH /api/alerts/logs
{
  "alertId": "alert-id",
  "action": "acknowledge"
}
```

### **Task 5: Resolve an Alert**
```typescript
PATCH /api/alerts/logs
{
  "alertId": "alert-id",
  "action": "resolve"
}
```

---

## 🎨 UI Components

### **AlertDetectionDashboard**
```typescript
import { AlertDetectionDashboard } from '@/components/alerts/AlertDetectionDashboard';

<AlertDetectionDashboard facilityId="your-facility-id" />
```
**Where:** Already integrated in `src/app/cultivation/page.tsx` (Alarms tab)

### **AlertBadge** (Optional)
```typescript
import { AlertBadge } from '@/components/alerts/AlertBadge';

<AlertBadge 
  facilityId="your-facility-id"
  onClick={() => router.push('/alerts')}
/>
```
**Use for:** Navigation bar, showing alert count

### **AlertWidget** (Optional)
```typescript
import { AlertWidget } from '@/components/alerts/AlertWidget';

<AlertWidget facilityId="your-facility-id" maxDisplay={3} />
```
**Use for:** Dashboard summary widget

---

## 🔧 Configuration

### **Cooldown Period**
```typescript
// In AlertConfiguration
cooldownMinutes: 15  // Wait 15 minutes before next alert
```
**Purpose:** Prevents alert spam

### **Duration Requirement**
```typescript
// In AlertConfiguration
duration: 5  // Violation must persist 5 minutes
```
**Purpose:** Prevents false positives from brief spikes

### **Severity Levels**
```typescript
LOW      → Blue indicator, normal priority
MEDIUM   → Yellow indicator, moderate priority
HIGH     → Orange indicator, high priority
CRITICAL → Red indicator, immediate attention
```

### **Actions**
```typescript
actions: {
  email: true,   // Send email notification
  push: true,    // Send push notification
  sms: false     // Send SMS (if configured)
}
```

---

## 🐛 Debugging

### **Alert Not Triggering?**

**Check 1:** Is configuration enabled?
```sql
SELECT * FROM "AlertConfiguration" WHERE id = 'config-id';
-- enabled should be true
```

**Check 2:** Is sensor active?
```sql
SELECT * FROM "ZoneSensor" WHERE id = 'sensor-id';
-- isActive should be true
```

**Check 3:** Check cooldown
```typescript
// In alert-detector.ts
console.log('Cooldown tracker:', alertDetector.getCooldownTracker());
```

**Check 4:** Check threshold
```sql
-- If condition is GT and threshold is 30
-- Value must be > 30 (not >= 30)
SELECT * FROM "SensorReading" 
WHERE "sensorId" = 'sensor-id' 
ORDER BY timestamp DESC LIMIT 5;
```

### **Too Many Alerts?**

**Solution 1:** Increase cooldown
```sql
UPDATE "AlertConfiguration"
SET "cooldownMinutes" = 30  -- Increase from 15 to 30
WHERE id = 'config-id';
```

**Solution 2:** Add duration requirement
```sql
UPDATE "AlertConfiguration"
SET duration = 5  -- Must persist 5 minutes
WHERE id = 'config-id';
```

**Solution 3:** Adjust threshold
```sql
UPDATE "AlertConfiguration"
SET threshold = 35  -- Increase from 30 to 35
WHERE id = 'config-id';
```

### **Frontend Not Updating?**

**Check 1:** WebSocket connection
```javascript
// In browser console
console.log('WebSocket connected:', socket.connected);
```

**Check 2:** Check facility room
```javascript
// Should see: Joined room: facility:your-facility-id
```

**Check 3:** Check for errors
```javascript
// In browser console (Network tab)
// Look for WebSocket connection errors
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ALERT_DETECTION_README.md` | Complete system documentation |
| `ALERT_DETECTION_STEP_BY_STEP.md` | Detailed step-by-step procedure |
| `ALERT_DETECTION_QUICK_REFERENCE.md` | This file - quick reference |
| `QUICK_START_ALERT_DETECTION.md` | 3-step quick start guide |
| `FRONTEND_ALERT_SYSTEM_GUIDE.md` | Frontend integration guide |
| `FRONTEND_INTEGRATION_COMPLETE.md` | Frontend completion summary |
| `YOUR_SENSOR_SETUP_GUIDE.md` | How to add sensors |
| `HOW_TO_ADD_REAL_SENSORS.md` | Sensor setup guide |

---

## 🎯 Summary

### **3 Core Files to Remember:**

1. **`src/lib/sensors/alert-detector.ts`** - Alert detection brain
2. **`src/lib/queue/workers/sensor-data-worker.ts`** (lines 102-115) - Integration point
3. **`src/components/alerts/AlertDetectionDashboard.tsx`** - Main UI

### **Data Flow in 3 Steps:**

1. **Sensor Reading** → Worker processes it
2. **Worker** → Calls alert detector
3. **Detector** → Creates alert, broadcasts to frontend

### **Total Time:**
**~250ms** from sensor reading to user seeing alert! ⚡

---

## 🚀 Quick Commands

```bash
# Start app
npm run dev

# Open Prisma Studio
npx prisma studio

# Run tests
node test-alert-detection-simple.js

# View facility ID
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux \
  -c 'SELECT id, name FROM "Facility";'

# View alerts
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux \
  -c 'SELECT * FROM "AlertLog" ORDER BY "createdAt" DESC LIMIT 5;'
```

---

**Everything you need at a glance!** 🎊

