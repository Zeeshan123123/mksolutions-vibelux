# 🎨 Frontend Alert Detection System Guide

## ✅ Yes, You Have a Complete Frontend!

Your VibeLux platform includes:
- **527+ pages** in React/Next.js
- **Multiple dashboards** for different purposes
- **Sensor monitoring** components
- **Real-time updates** via WebSocket
- **Existing alert/alarm systems** ready to integrate

---

## 🔄 How the Alert Detection System Works (Full Flow)

### **Architecture Overview:**

```
┌──────────────┐
│   Frontend   │ (React Components)
│              │
│ • Dashboard  │◄──── WebSocket ────┐
│ • Alerts UI  │                     │
│ • Sensors UI │◄──── REST API ──────┤
└──────────────┘                     │
                                     │
┌──────────────┐                     │
│   Backend    │                     │
│              │                     │
│ • API Routes │─────────────────────┤
│ • WebSocket  │                     │
│ • Services   │                     │
└──────────────┘                     │
        ↓                            │
┌──────────────┐                     │
│Alert Detector│                     │
│   Service    │                     │
│              │                     │
│ • Monitors   │──── Alerts ─────────┘
│ • Evaluates  │
│ • Triggers   │
└──────────────┘
        ↓
┌──────────────┐
│   Database   │
│              │
│ • AlertLog   │
│ • SensorData │
└──────────────┘
```

---

## 📊 Existing Frontend Components You Can Use

### **1. Dashboard Pages** (Already Built!)

#### **Main Dashboard**
```
src/app/dashboard/page.tsx
```
- Central hub for all monitoring
- Can integrate alert widgets

#### **Cultivation Dashboard**
```
src/app/cultivation/page.tsx
```
- Has "alarms" tab (line 188-201)
- Currently shows placeholder
- **Perfect place to integrate your Alert Detection!**

#### **Monitoring Pages**
```
src/app/plant-monitoring/page.tsx
src/app/sensors/page.tsx
src/app/monitoring/page.tsx
```
- Already have sensor displays
- Can show alert status

### **2. Sensor Components** (Already Built!)

You have multiple sensor dashboards:
- `SensorDashboard.tsx` - Displays sensor cards
- `SensorStatusDashboard.tsx` - Shows sensor status
- `SensorManagementDashboard.tsx` - Manage sensors
- `WirelessSensorDashboard.tsx` - Wireless sensors
- `RealTimeSensorMonitor.tsx` - Real-time data

### **3. Alert Components** (Already Built!)

Located in `UnifiedDashboard.tsx`:
```typescript
'alerts': React.lazy(() => import('../AlertDashboard').then(module => ({ 
  default: module.AlertDashboard || module.default 
})))
```

You already have an `AlertDashboard` component!

---

## 🎯 How to Connect Frontend to Alert Detection

### **Step 1: Create Alert Display Component**

Create: `src/components/alerts/AlertDetectionDashboard.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggeredValue: number;
  thresholdValue: number;
  unit: string;
  sensorName: string;
  createdAt: string;
}

export function AlertDetectionDashboard({ facilityId }: { facilityId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from API
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(
          `/api/alerts/logs?facilityId=${facilityId}&status=ACTIVE`
        );
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [facilityId]);

  // Handle alert acknowledgment
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/alerts/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          action: 'acknowledge'
        })
      });
      
      // Refresh alerts
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-900 border-red-500 text-red-100';
      case 'HIGH': return 'bg-orange-900 border-orange-500 text-orange-100';
      case 'MEDIUM': return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 'LOW': return 'bg-blue-900 border-blue-500 text-blue-100';
      default: return 'bg-gray-900 border-gray-500 text-gray-100';
    }
  };

  if (loading) {
    return <div className="text-white">Loading alerts...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Active Alerts ({alerts.length})
        </h2>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-gray-400">No active alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-lg border-2 p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">{alert.severity}</span>
                    <span className="text-sm opacity-75">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold mb-1">{alert.sensorName}</h4>
                  <p className="text-sm mb-2">{alert.message}</p>
                  
                  <div className="flex gap-4 text-sm">
                    <span>
                      Current: <strong>{alert.triggeredValue}{alert.unit}</strong>
                    </span>
                    <span>
                      Threshold: <strong>{alert.thresholdValue}{alert.unit}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Acknowledge"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### **Step 2: Add Real-time Updates (WebSocket)**

Create: `src/hooks/useAlertWebSocket.ts`

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useAlertWebSocket(facilityId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newAlert, setNewAlert] = useState<any | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket']
    });

    // Join facility room
    socketInstance.emit('join', { facilityId });

    // Listen for alert events
    socketInstance.on('alert:created', (alert) => {
      console.log('New alert received:', alert);
      setNewAlert(alert);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(`${alert.severity} Alert`, {
          body: alert.message,
          icon: '/icon.png'
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [facilityId]);

  return { socket, newAlert };
}
```

### **Step 3: Integrate into Cultivation Dashboard**

Update: `src/app/cultivation/page.tsx`

```typescript
// Add import
import { AlertDetectionDashboard } from '@/components/alerts/AlertDetectionDashboard';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';

// Inside the component
const facilityId = 'YOUR_FACILITY_ID'; // Get from user context

// Add WebSocket hook
const { newAlert } = useAlertWebSocket(facilityId);

// Replace the alarms tab content (line 188-201) with:
{activeTab === 'alarms' && (
  <AlertDetectionDashboard facilityId={facilityId} />
)}
```

---

## 🚀 Quick Integration Guide

### **Option 1: Replace Existing Alarm Placeholder**

1. **Open**: `src/app/cultivation/page.tsx`
2. **Find**: Line 188-201 (alarms tab)
3. **Replace** with the AlertDetectionDashboard component
4. **Done!** Your alerts will show in the cultivation dashboard

### **Option 2: Add to Main Dashboard**

1. **Open**: `src/app/dashboard/page.tsx`
2. **Add** AlertDetectionDashboard as a widget
3. **Position** it prominently for visibility

### **Option 3: Create Dedicated Alerts Page**

Create: `src/app/alerts/page.tsx`

```typescript
'use client';

import { NavigationLayout } from '@/components/navigation/NavigationLayout';
import { AlertDetectionDashboard } from '@/components/alerts/AlertDetectionDashboard';

export default function AlertsPage() {
  return (
    <NavigationLayout>
      <div className="p-6">
        <AlertDetectionDashboard facilityId="YOUR_FACILITY_ID" />
      </div>
    </NavigationLayout>
  );
}
```

---

## 📡 How Data Flows

### **1. Sensor Data → Backend**

```typescript
// Sensor sends data
POST /api/sensors/readings
{
  sensorId: "sensor-123",
  value: 35,
  unit: "°C",
  timestamp: "2024-01-19T10:30:00Z"
}
```

### **2. Alert Detector Processes**

```
Backend → AlertDetector.detectAlerts()
  → Checks thresholds
  → Creates AlertLog if violated
  → Sends WebSocket notification
```

### **3. Frontend Receives Update**

```typescript
// Via WebSocket
socket.on('alert:created', (alert) => {
  // Show notification
  // Update UI
  // Play sound
});

// Or via API polling
fetch('/api/alerts/logs?facilityId=xxx&status=ACTIVE')
```

---

## 🎨 UI/UX Recommendations

### **1. Alert Badge in Navigation**

Add a notification badge to your nav bar:

```typescript
<nav>
  <NavItem href="/alerts">
    Alerts
    {alertCount > 0 && (
      <span className="badge">{alertCount}</span>
    )}
  </NavItem>
</nav>
```

### **2. Toast Notifications**

Use a toast library for real-time alerts:

```bash
npm install react-hot-toast
```

```typescript
import toast from 'react-hot-toast';

socket.on('alert:created', (alert) => {
  toast.error(`${alert.severity}: ${alert.message}`, {
    duration: 5000,
    position: 'top-right'
  });
});
```

### **3. Alert Sound**

Play a sound when critical alerts arrive:

```typescript
const alertSound = new Audio('/sounds/alert.mp3');

if (alert.severity === 'CRITICAL') {
  alertSound.play();
}
```

### **4. Dashboard Widget**

Create a compact widget for main dashboard:

```typescript
<div className="alert-widget">
  <h3>Recent Alerts</h3>
  <div className="alert-summary">
    <span className="critical">{criticalCount}</span>
    <span className="high">{highCount}</span>
    <span className="medium">{mediumCount}</span>
  </div>
  <Link href="/alerts">View All →</Link>
</div>
```

---

## 📊 Example: Complete Integration

Here's a complete example showing all pieces together:

### **File: src/app/alerts/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Bell, Filter, Download } from 'lucide-react';
import { NavigationLayout } from '@/components/navigation/NavigationLayout';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ACTIVE');
  const facilityId = 'YOUR_FACILITY_ID'; // Get from context
  
  // WebSocket for real-time updates
  const { newAlert } = useAlertWebSocket(facilityId);
  
  // Load alerts
  useEffect(() => {
    async function loadAlerts() {
      const res = await fetch(
        `/api/alerts/logs?facilityId=${facilityId}&status=${filter}`
      );
      const data = await res.json();
      setAlerts(data.alerts);
    }
    loadAlerts();
  }, [facilityId, filter]);
  
  // Handle new alerts
  useEffect(() => {
    if (newAlert) {
      setAlerts(prev => [newAlert, ...prev]);
      toast.error(`New ${newAlert.severity} alert!`);
    }
  }, [newAlert]);
  
  return (
    <NavigationLayout>
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Alert Management
          </h1>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Alert list */}
        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </NavigationLayout>
  );
}
```

---

## 🔔 Push Notifications

Enable browser notifications:

```typescript
// Request permission
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

// Send notification
if (Notification.permission === 'granted') {
  new Notification('Alert!', {
    body: alert.message,
    icon: '/logo.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
}
```

---

## 📱 Mobile Responsiveness

Your alerts UI should be mobile-friendly:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {alerts.map(alert => (
    <AlertCard key={alert.id} alert={alert} />
  ))}
</div>
```

---

## 🎯 Next Steps

### **1. Choose Integration Point**
- Cultivation Dashboard (alarms tab) ← **Recommended**
- Main Dashboard (widget)
- Dedicated Alerts Page

### **2. Create Components**
- AlertDetectionDashboard
- AlertCard
- AlertFilters

### **3. Add Real-time**
- WebSocket hook
- Toast notifications
- Browser notifications

### **4. Test**
- Create test alerts in Prisma Studio
- Verify they appear in UI
- Test acknowledgment

---

## 📚 Summary

**You have everything you need:**
✅ **Backend API**: `/api/alerts/configurations` & `/api/alerts/logs`  
✅ **Alert Detector**: Monitoring sensors 24/7  
✅ **WebSocket**: Real-time updates ready  
✅ **Frontend**: 527+ pages, multiple dashboards  
✅ **Components**: Sensor dashboards already built  
✅ **Placeholder**: Alarm tab waiting for integration  

**Just need to:**
1. Create `AlertDetectionDashboard.tsx` component
2. Add it to the cultivation dashboard
3. Connect WebSocket for real-time updates
4. Done! 🎉

Want me to help you create the React components now?

