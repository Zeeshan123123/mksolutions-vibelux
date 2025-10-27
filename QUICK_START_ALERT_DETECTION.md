# ⚡ Alert Detection - Quick Start Card

## 🎯 System Status: ✅ READY

```
Database:  ✅ Running (vibelux)
Tables:    ✅ Created (AlertConfiguration, AlertLog)
Service:   ✅ Implemented (alert-detector.ts)
APIs:      ✅ Ready (/api/alerts/*)
Frontend:  ✅ Ready for integration
Prisma:    ✅ Running (http://localhost:5556)
```

---

## 🚀 Get Started in 3 Steps

### **Step 1: Add a Sensor** (2 min)
```bash
# Open Prisma Studio (already running!)
# URL: http://localhost:5556

1. Go to ZoneSensor table
2. Click "Add record"
3. Fill in:
   - zoneId: (from GreenhouseZone table)
   - sensorType: TEMPERATURE
   - name: Temperature Sensor - Zone A
   - unit: °C
   - isActive: ✓
4. Save & copy sensor ID
```

### **Step 2: Create Alert Rule** (1 min)
```bash
1. Go to AlertConfiguration table
2. Click "Add record"
3. Fill in:
   - facilityId: cmh5wpg2p0000vdm4hfg2e5q6
   - sensorId: (paste from Step 1)
   - name: High Temperature Alert
   - enabled: ✓
   - alertType: TEMPERATURE_HIGH
   - condition: GT
   - threshold: 30
   - severity: HIGH
   - cooldownMinutes: 15
   - actions: {"email": true, "push": true}
4. Save
```

### **Step 3: Test It!** (30 sec)
```bash
1. Go to SensorReading table
2. Add reading with value 35 (above threshold)
3. Go to AlertLog table
4. See your first alert! 🎉
```

---

## 📖 Documentation

| What You Need | Read This |
|---------------|-----------|
| **How it works (Frontend)** | `FRONTEND_ALERT_SYSTEM_GUIDE.md` |
| **How to add sensors** | `YOUR_SENSOR_SETUP_GUIDE.md` |
| **How to test** | `ALERT_DETECTION_TESTING_GUIDE.md` |
| **Complete docs** | `ALERT_DETECTION_README.md` |
| **Implementation details** | `ALERT_DETECTION_COMPLETE_SUMMARY.md` |

---

## 🧪 Quick Tests

```bash
# Test database
node test-alert-detection-simple.js

# Open Prisma Studio
npx prisma studio

# View your facility IDs
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c 'SELECT id, name FROM "Facility";'
```

---

## 🎨 Frontend Integration

**Your app already has:**
- ✅ 527+ pages
- ✅ Sensor dashboards
- ✅ Alert placeholder (cultivation → alarms tab)
- ✅ WebSocket infrastructure
- ✅ Notification system

**To connect frontend:**
1. Create `AlertDetectionDashboard.tsx` component
2. Add `useAlertWebSocket.ts` hook
3. Replace alarm placeholder in cultivation page
4. Done! (2-3 hours)

See `FRONTEND_ALERT_SYSTEM_GUIDE.md` for code examples.

---

## 🔔 Alert Conditions

| Condition | Meaning | Example |
|-----------|---------|---------|
| `GT` | Greater than | Temp > 30°C |
| `GTE` | Greater/equal | Temp ≥ 30°C |
| `LT` | Less than | Temp < 15°C |
| `LTE` | Less/equal | Temp ≤ 15°C |
| `BETWEEN` | Outside range | Temp NOT 18-28°C |
| `RATE` | Rate change | Change > 5°C/sec |

---

## 🎯 Your Facility

```
ID: cmh5wpg2p0000vdm4hfg2e5q6
Name: Test Greenhouse Facility
Type: GREENHOUSE

Use this ID in:
- API calls
- Alert configurations
- Frontend components
```

---

## ⚡ Key Files

**Backend:**
- `src/lib/sensors/alert-detector.ts` - Main service
- `src/app/api/alerts/configurations/route.ts` - Config API
- `src/app/api/alerts/logs/route.ts` - Logs API

**Database:**
- `prisma/schema.prisma` - Schema (updated)
- `prisma/migrations/20250119_add_alert_detection/` - Migration

**Frontend (to create):**
- `src/components/alerts/AlertDetectionDashboard.tsx`
- `src/hooks/useAlertWebSocket.ts`
- `src/app/alerts/page.tsx`

---

## 📞 Need Help?

**All answers are in your docs:**

```bash
# List all docs
ls -1 *ALERT*.md *SENSOR*.md

# Read specific guide
cat FRONTEND_ALERT_SYSTEM_GUIDE.md

# Or open in editor
code FRONTEND_ALERT_SYSTEM_GUIDE.md
```

---

## 🎊 You're Ready!

✅ **System**: Implemented  
✅ **Database**: Set up  
✅ **Tests**: Passing  
✅ **Docs**: Complete  
✅ **Tools**: Running  

**Go to http://localhost:5556 and start adding sensors!** 🚀

---

_Everything you need is documented and ready. You've got this!_ 💪

