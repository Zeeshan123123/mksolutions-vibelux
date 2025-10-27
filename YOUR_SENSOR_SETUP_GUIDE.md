# 🎯 Your Personal Sensor Setup Guide

## ✅ Prisma Studio is Now Running!

Open your browser and go to: **http://localhost:5555**

---

## 📋 Step-by-Step Instructions

### **Your Facility IDs:**
```
Facility 1: cmh5wpg2p0000vdm4hfg2e5q6
Facility 2: cmh5wpxdp0000vdoreyqnzsqo  
Facility 3: cmh5wqf7o0000vdt1srnyxdfh
```

We'll use: **`cmh5wpg2p0000vdm4hfg2e5q6`**

---

## 🏗️ **Step 1: Create a Greenhouse Zone First**

Since you don't have zones yet, let's create one:

### In Prisma Studio:

1. Click **`GreenhouseDesign`** in left sidebar
2. Click **"Add record"**
3. Fill in:

```
facilityId: cmh5wpg2p0000vdm4hfg2e5q6
name: Main Greenhouse
version: 1.0
status: ACTIVE
width: 30
length: 50
height: 6
area: 1500
designData: {}
```

4. Click **"Save 1 change"**
5. **Copy the new design ID** (something like `cmXXXXXXXXXX`)

### Create a Zone:

1. Click **`GreenhouseZone`** in left sidebar
2. Click **"Add record"**
3. Fill in:

```
designId: (paste the design ID from above)
name: Growing Zone A
zoneType: GROW
x: 0
y: 0
width: 10
length: 15
height: 3
area: 150
config: {"temperature": {"min": 18, "max": 28}, "humidity": {"min": 40, "max": 70}}
```

4. Click **"Save 1 change"**
5. **Copy the new zone ID** (we'll need this for sensors)

---

## 🌡️ **Step 2: Add Your First Sensor**

Now let's add a temperature sensor!

1. Click **`ZoneSensor`** in left sidebar
2. Click **"Add record"**
3. Fill in these fields:

### **Copy and paste these exact values:**

```
zoneId: (paste your zone ID from Step 1)
sensorType: TEMPERATURE
name: Temperature Sensor - Main Area
unit: °C
isActive: ✓ (check the box)
minValue: 0
maxValue: 50
accuracy: 0.5
x: 5
y: 7.5
z: 2
```

4. Click **"Save 1 change"**
5. ✅ **Your sensor is created!**
6. **Copy the sensor ID** (you'll need it for alerts)

---

## 🚨 **Step 3: Create Alert Configuration**

Let's create a high temperature alert:

1. Click **`AlertConfiguration`** in left sidebar
2. Click **"Add record"**
3. Fill in:

### **Copy these values:**

```
facilityId: cmh5wpg2p0000vdm4hfg2e5q6
sensorId: (paste your sensor ID from Step 2)
name: High Temperature Alert
enabled: ✓ (check the box)
alertType: TEMPERATURE_HIGH
condition: GT
threshold: 30
severity: HIGH
cooldownMinutes: 15
triggerCount: 0
actions: {"email": true, "push": true, "sms": false}
notificationMessage: Temperature is {{value}}°C (threshold: {{threshold}}°C)
```

4. Click **"Save 1 change"**
5. ✅ **Your alert is configured!**

---

## 🧪 **Step 4: Test With Sample Data**

Let's trigger your first alert!

1. Click **`SensorReading`** in left sidebar
2. Click **"Add record"**
3. Fill in:

```
facilityId: cmh5wpg2p0000vdm4hfg2e5q6
zoneSensorId: (paste your sensor ID)
sensorId: (paste your sensor ID again)
sensorType: TEMPERATURE
value: 35
unit: °C
quality: 100
timestamp: (click calendar icon, select today and current time)
```

4. Click **"Save 1 change"**

---

## 🎉 **Step 5: Check Your Alert!**

1. Click **`AlertLog`** in left sidebar
2. Look for your alert!

You should see:
- **Message**: "Temperature is 35°C (threshold: 30°C)"
- **Status**: ACTIVE
- **Severity**: HIGH
- **triggeredValue**: 35
- **thresholdValue**: 30

### ✅ **Congratulations! Your Alert Detection System is Working!** 🎊

---

## 📊 **What You Just Built:**

✅ **Greenhouse Design** → Container for zones  
✅ **Greenhouse Zone** → Physical growing area  
✅ **Temperature Sensor** → Monitoring device  
✅ **Alert Configuration** → Rule to trigger alerts  
✅ **Sensor Reading** → Test data  
✅ **Alert Log** → Your first alert! 🚨

---

## 🚀 **Next Steps:**

### Add More Sensors:

Repeat Step 2 with these sensor types:

**Humidity Sensor:**
```
sensorType: HUMIDITY
name: Humidity Sensor - Main Area
unit: %
minValue: 0
maxValue: 100
accuracy: 2
```

**CO2 Sensor:**
```
sensorType: CO2
name: CO2 Sensor - Main Area
unit: ppm
minValue: 0
maxValue: 5000
accuracy: 50
```

**Light Sensor (PPFD):**
```
sensorType: LIGHT
name: PPFD Sensor - Canopy Level
unit: μmol/m²/s
minValue: 0
maxValue: 2000
accuracy: 10
```

### Add More Alerts:

Create a **Low Temperature Alert**:
```
name: Low Temperature Alert
alertType: TEMPERATURE_LOW
condition: LT
threshold: 15
severity: MEDIUM
```

Create a **Humidity Range Alert**:
```
name: Humidity Range Alert
alertType: HUMIDITY_HIGH
condition: BETWEEN
threshold: 40
thresholdMax: 70
severity: MEDIUM
```

---

## 💡 **Pro Tips:**

1. **Check AlertLog regularly** to see triggered alerts
2. **Adjust thresholds** based on your actual needs
3. **Use different severity levels**: LOW, MEDIUM, HIGH, CRITICAL
4. **Set appropriate cooldowns** to avoid alert spam
5. **Test each sensor** before going live

---

## 🔍 **Troubleshooting:**

### Can't see Prisma Studio?
```bash
# Restart it:
npx prisma studio
```

### Need to check your data?
```bash
# View sensors
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c 'SELECT * FROM "ZoneSensor" LIMIT 5;'

# View alerts
PGPASSWORD=vibelux psql -h localhost -U vibelux -d vibelux -c 'SELECT * FROM "AlertLog" ORDER BY "createdAt" DESC LIMIT 5;'
```

### Lost your IDs?
They're all visible in Prisma Studio - just click the table and look at the `id` column!

---

## 📚 **More Resources:**

- Simple Guide: `cat SIMPLE_ADD_SENSORS_GUIDE.md`
- Full Guide: `cat HOW_TO_ADD_REAL_SENSORS.md`
- Testing Guide: `cat ALERT_DETECTION_TESTING_GUIDE.md`

---

## ✨ **You're All Set!**

Your Alert Detection System is now:
- ✅ **Fully configured**
- ✅ **Ready for real data**
- ✅ **Monitoring 24/7**

**Start sending real sensor data and alerts will trigger automatically!** 🚀

Need help? Just ask! 😊

