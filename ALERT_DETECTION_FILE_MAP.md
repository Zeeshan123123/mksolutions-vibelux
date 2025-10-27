# 🗺️ Alert Detection System - File Map

## 📊 Visual File Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ALERT DETECTION SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   SENSOR READING     │
                    │   arrives via API    │
                    └──────────┬───────────┘
                               │
                               ↓
┌────────────────────────────────────────────────────────────────────┐
│  LAYER 1: SENSOR DATA PROCESSING                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📄 src/lib/queue/workers/sensor-data-worker.ts                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Lines 1-100:                                              │    │
│  │ • Fetch sensor from database                             │    │
│  │ • Write to InfluxDB                                       │    │
│  │ • Write to PostgreSQL                                     │    │
│  │ • Update sensor status                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ ⚡ Lines 102-115: ALERT DETECTION CALL                   │    │
│  │                                                            │    │
│  │   import { alertDetector } from                           │    │
│  │     '../../sensors/alert-detector';                       │    │
│  │                                                            │    │
│  │   await alertDetector.detectAlerts({                      │    │
│  │     sensorId, value, unit, timestamp, metadata            │    │
│  │   });                                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────────────────┐
│  LAYER 2: ALERT DETECTION CORE (THE BRAIN)                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📄 src/lib/sensors/alert-detector.ts (636 lines)                 │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                                                            │    │
│  │  ▶ detectAlerts(reading) ───────────┐                    │    │
│  │                                       │                    │    │
│  │  ▶ getAlertConfigurations() ◄───────┘ (line 506)        │    │
│  │    • Check cache (5-min TTL)                             │    │
│  │    • Query database: AlertConfiguration                  │    │
│  │    • Return enabled rules                                │    │
│  │                                       │                    │    │
│  │  ▶ evaluateThreshold() ◄─────────────┘ (line 131)        │    │
│  │    • Check condition (GT/LT/BETWEEN/RATE)               │    │
│  │    • Check duration persistence                          │    │
│  │    • Return violations                                   │    │
│  │                                       │                    │    │
│  │  ▶ shouldTriggerAlert() ◄────────────┘ (line 544)        │    │
│  │    • Check cooldown period                               │    │
│  │    • Return true/false                                   │    │
│  │                                       │                    │    │
│  │  ▶ createAlert() ◄───────────────────┘ (line 298)        │    │
│  │    • Generate message                                    │    │
│  │    • Insert AlertLog to database                         │    │
│  │    • Update AlertConfiguration                           │    │
│  │    • Set cooldown                                        │    │
│  │                                                            │    │
│  │  ▶ queueNotifications() (line 419)                       │    │
│  │    • Queue email jobs                                    │    │
│  │    • Queue SMS jobs                                      │    │
│  │    • Queue push notification jobs                        │    │
│  │                                                            │    │
│  │  ▶ broadcastAlert() (line 452)                           │    │
│  │    • Send to WebSocket server                            │    │
│  │    • Emit to facility room                               │    │
│  │                                                            │    │
│  │  ▶ updateAlertCounters() (line 478)                      │    │
│  │    • Increment Redis counters                            │    │
│  │    • Set expiry (7 days)                                 │    │
│  │                                                            │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────┬────────────────────────┬──────────────────────────────┘
             │                        │
             ↓                        ↓
┌─────────────────────────┐  ┌──────────────────────────────────┐
│  DATABASE               │  │  NOTIFICATIONS & WEBSOCKET       │
│                         │  │                                  │
│  📄 prisma/schema.prisma│  │  📄 src/lib/queue/workers/      │
│  • AlertConfiguration   │  │     notification-worker.ts       │
│  • AlertLog             │  │  • Process email jobs            │
│                         │  │  • Process SMS jobs              │
│  📄 migration.sql       │  │  • Process push jobs             │
│  • CREATE TABLE         │  │                                  │
│  • CREATE INDEX         │  │  📄 src/lib/websocket/           │
│                         │  │  • Broadcast to clients          │
└─────────────────────────┘  └──────────────────────────────────┘

                                      ↓
┌────────────────────────────────────────────────────────────────────┐
│  LAYER 3: API ENDPOINTS                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📄 src/app/api/alerts/configurations/route.ts                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ GET    /api/alerts/configurations    List rules          │    │
│  │ POST   /api/alerts/configurations    Create rule         │    │
│  │ PATCH  /api/alerts/configurations    Update rule         │    │
│  │ DELETE /api/alerts/configurations    Delete rule         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  📄 src/app/api/alerts/logs/route.ts                              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ GET   /api/alerts/logs               Query alerts        │    │
│  │ PATCH /api/alerts/logs               Acknowledge/resolve │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

                                      ↓
┌────────────────────────────────────────────────────────────────────┐
│  LAYER 4: FRONTEND COMPONENTS                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📄 src/hooks/useAlertWebSocket.ts                                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ • Connect to WebSocket server                            │    │
│  │ • Join facility room                                     │    │
│  │ • Listen: alert:created                                  │    │
│  │ • Listen: alert:updated                                  │    │
│  │ • Handle browser notifications                           │    │
│  │ • Auto-reconnect                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↓                                         │
│  📄 src/components/alerts/AlertDetectionDashboard.tsx             │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ • Display alert list                                     │    │
│  │ • Filter by status/severity                              │    │
│  │ • Show summary statistics                                │    │
│  │ • Acknowledge/resolve buttons                            │    │
│  │ • Toast notifications                                    │    │
│  │ • Auto-refresh (30 sec)                                  │    │
│  │ • Use useAlertWebSocket hook                             │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↓                                         │
│  📄 src/components/alerts/AlertBadge.tsx                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ • Show active alert count                                │    │
│  │ • Pulsing animation                                      │    │
│  │ • Navigate on click                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↓                                         │
│  📄 src/components/alerts/AlertWidget.tsx                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ • Compact dashboard widget                               │    │
│  │ • Show latest 3 alerts                                   │    │
│  │ • Severity indicators                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

                                      ↓
┌────────────────────────────────────────────────────────────────────┐
│  LAYER 5: PAGE INTEGRATION                                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📄 src/app/cultivation/page.tsx                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ import { AlertDetectionDashboard }                       │    │
│  │   from '@/components/alerts/AlertDetectionDashboard'     │    │
│  │                                                            │    │
│  │ {activeTab === 'alarms' && (                             │    │
│  │   <AlertDetectionDashboard                               │    │
│  │     facilityId={facilityId}                              │    │
│  │   />                                                      │    │
│  │ )}                                                        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  📄 src/app/alerts/page.tsx                                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ • Full-page alert interface                              │    │
│  │ • Dedicated alerts route                                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

                                      ↓
                              ┌───────────────┐
                              │  USER SEES    │
                              │  ALERT! 🎉    │
                              └───────────────┘
```

---

## 📋 File Change Summary

### **7 Files Modified** ✏️

```
1. prisma/schema.prisma
   ├─ Added: AlertConfiguration model
   ├─ Added: AlertLog model
   └─ Added: AlertType, AlertCondition, AlertSeverity, AlertStatus enums

2. src/lib/queue/workers/sensor-data-worker.ts
   ├─ Added: import alertDetector (line 8)
   └─ Added: detectAlerts() call (lines 102-115)

3. src/lib/queue/workers/notification-worker.ts
   └─ Added: alert notification handling

4. src/middleware/usage-tracking.ts
   └─ Added: alert API usage tracking

5. src/app/cultivation/page.tsx
   ├─ Added: import AlertDetectionDashboard
   ├─ Added: import Toaster
   └─ Replaced: alarm placeholder with AlertDetectionDashboard

6. package.json
   └─ Added: react-hot-toast dependency

7. yarn.lock / package-lock.json
   └─ Updated: lock files
```

### **13 Files Created** ✨

```
Backend (8 files):
├─ prisma/migrations/20250119_add_alert_detection/migration.sql
├─ src/lib/sensors/alert-detector.ts ⭐ (636 lines - CORE)
├─ src/lib/sensors/__tests__/alert-detector.test.ts
├─ src/app/api/alerts/configurations/route.ts
├─ src/app/api/alerts/logs/route.ts
├─ src/app/api/alerts/test/route.ts
├─ test-alert-detection.js
└─ test-alert-detection-simple.js

Frontend (5 files):
├─ src/components/alerts/AlertDetectionDashboard.tsx ⭐ (MAIN UI)
├─ src/components/alerts/AlertBadge.tsx
├─ src/components/alerts/AlertWidget.tsx
├─ src/hooks/useAlertWebSocket.ts ⭐ (WebSocket)
└─ src/app/alerts/page.tsx
```

---

## 🔗 File Dependencies

```
alert-detector.ts
├─ Imports:
│  ├─ prisma (database client)
│  ├─ redis (caching)
│  ├─ logger (logging)
│  ├─ getWebSocketServer (broadcasting)
│  └─ queues (notifications)
│
└─ Used by:
   ├─ sensor-data-worker.ts (calls detectAlerts)
   └─ API routes (for cache invalidation)

AlertDetectionDashboard.tsx
├─ Imports:
│  ├─ useAlertWebSocket (WebSocket hook)
│  ├─ toast (notifications)
│  └─ lucide-react (icons)
│
└─ Used by:
   ├─ src/app/cultivation/page.tsx (Alarms tab)
   └─ src/app/alerts/page.tsx (Dedicated page)

useAlertWebSocket.ts
├─ Imports:
│  ├─ socket.io-client (WebSocket)
│  └─ React hooks
│
└─ Used by:
   └─ AlertDetectionDashboard.tsx
```

---

## 🎯 Key Integration Points

### **Point 1: Worker → Detector**
```
FILE: src/lib/queue/workers/sensor-data-worker.ts
LINES: 102-115

import { alertDetector } from '../../sensors/alert-detector';

await alertDetector.detectAlerts({
  sensorId, value, unit, timestamp, metadata
});
```

### **Point 2: Detector → Database**
```
FILE: src/lib/sensors/alert-detector.ts
LINES: 306-325

await prisma.alertLog.create({
  data: { ... }
});
```

### **Point 3: Detector → WebSocket**
```
FILE: src/lib/sensors/alert-detector.ts
LINES: 452-476

wsServer.io
  .to(`facility:${facilityId}`)
  .emit('alert:created', { ... });
```

### **Point 4: WebSocket → Frontend**
```
FILE: src/hooks/useAlertWebSocket.ts
LINES: 30-40

socket.on('alert:created', (alert) => {
  onNewAlert(alert);
});
```

### **Point 5: Dashboard → Page**
```
FILE: src/app/cultivation/page.tsx
LINES: 150-160

{activeTab === 'alarms' && (
  <AlertDetectionDashboard facilityId={facilityId} />
)}
```

---

## 📊 Database Schema Files

```
prisma/
├─ schema.prisma
│  ├─ model AlertConfiguration
│  │  ├─ id: String @id
│  │  ├─ facilityId: String
│  │  ├─ sensorId: String
│  │  ├─ name: String
│  │  ├─ enabled: Boolean
│  │  ├─ condition: AlertCondition
│  │  ├─ threshold: Float
│  │  ├─ severity: AlertSeverity
│  │  └─ ...
│  │
│  └─ model AlertLog
│     ├─ id: String @id
│     ├─ alertConfigId: String
│     ├─ sensorId: String
│     ├─ facilityId: String
│     ├─ severity: AlertSeverity
│     ├─ message: String
│     ├─ status: AlertStatus
│     └─ ...
│
└─ migrations/
   └─ 20250119_add_alert_detection/
      └─ migration.sql
         ├─ CREATE TABLE "AlertConfiguration"
         ├─ CREATE TABLE "AlertLog"
         └─ CREATE INDEX
```

---

## 🧪 Test Files

```
test-alert-detection.js
├─ Tests database connection
├─ Creates test alert configuration
├─ Simulates sensor reading
├─ Verifies alert creation
└─ Cleans up test data

test-alert-detection-simple.js
├─ Simplified version
├─ Tests basic flow
└─ Quick verification

src/lib/sensors/__tests__/alert-detector.test.ts
├─ Unit tests for AlertDetector class
├─ Tests all conditions (GT, LT, BETWEEN, RATE)
├─ Tests duration persistence
├─ Tests cooldown management
└─ Tests error handling
```

---

## 📖 Documentation Files

```
ALERT_DETECTION_README.md              (Complete documentation)
ALERT_DETECTION_STEP_BY_STEP.md        (Detailed procedure)
ALERT_DETECTION_QUICK_REFERENCE.md     (Quick reference)
ALERT_DETECTION_FILE_MAP.md            (This file - visual map)
QUICK_START_ALERT_DETECTION.md         (3-step quick start)
FRONTEND_ALERT_SYSTEM_GUIDE.md         (Frontend guide)
FRONTEND_INTEGRATION_COMPLETE.md       (Integration summary)
YOUR_SENSOR_SETUP_GUIDE.md             (Sensor setup)
HOW_TO_ADD_REAL_SENSORS.md             (Sensor guide)
```

---

## 🎯 Where to Find What

### **Want to understand the core logic?**
```
READ: src/lib/sensors/alert-detector.ts
```

### **Want to see where it's called?**
```
READ: src/lib/queue/workers/sensor-data-worker.ts (lines 102-115)
```

### **Want to see the database structure?**
```
READ: prisma/schema.prisma (search for AlertConfiguration and AlertLog)
```

### **Want to understand the UI?**
```
READ: src/components/alerts/AlertDetectionDashboard.tsx
```

### **Want to see the WebSocket integration?**
```
READ: src/hooks/useAlertWebSocket.ts
```

### **Want to see where it's displayed?**
```
READ: src/app/cultivation/page.tsx (search for AlertDetectionDashboard)
```

### **Want to test it?**
```
RUN: node test-alert-detection-simple.js
```

---

## 🚀 Summary

### **20 Total Files Touched:**
- 7 Modified
- 13 Created

### **3 Core Files:**
1. `src/lib/sensors/alert-detector.ts` (636 lines - THE BRAIN)
2. `src/components/alerts/AlertDetectionDashboard.tsx` (MAIN UI)
3. `src/hooks/useAlertWebSocket.ts` (REAL-TIME)

### **Data Flow:**
```
Sensor Reading
  ↓
sensor-data-worker.ts (line 102)
  ↓
alert-detector.ts (line 74)
  ↓
Database (AlertLog)
  ↓
WebSocket Broadcast
  ↓
Frontend (useAlertWebSocket)
  ↓
UI Update (AlertDetectionDashboard)
  ↓
User Sees Alert!
```

**Total time: ~250ms** ⚡

---

**Your complete file map!** 🗺️

