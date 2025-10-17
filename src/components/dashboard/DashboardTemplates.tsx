/**
 * Dashboard Templates for VibeLux
 * Pre-configured dashboard layouts for different user roles
 */

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  role: string;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'grower-default',
    name: 'Grower Dashboard',
    description: 'Standard dashboard for greenhouse growers',
    role: 'grower',
    widgets: [
      {
        id: 'climate-overview',
        type: 'climate',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
        config: {
          metrics: ['temperature', 'humidity', 'co2', 'light']
        }
      },
      {
        id: 'crop-status',
        type: 'crops',
        position: { x: 6, y: 0 },
        size: { width: 6, height: 4 },
        config: {
          showGrowthStage: true,
          showHealth: true
        }
      },
      {
        id: 'alerts',
        type: 'alerts',
        position: { x: 0, y: 4 },
        size: { width: 4, height: 3 },
        config: {
          maxAlerts: 5,
          severity: ['critical', 'warning']
        }
      },
      {
        id: 'energy-usage',
        type: 'energy',
        position: { x: 4, y: 4 },
        size: { width: 4, height: 3 },
        config: {
          timeRange: '24h'
        }
      },
      {
        id: 'tasks',
        type: 'tasks',
        position: { x: 8, y: 4 },
        size: { width: 4, height: 3 },
        config: {
          showUpcoming: true
        }
      }
    ]
  },
  {
    id: 'manager-default',
    name: 'Manager Dashboard',
    description: 'Dashboard for facility managers',
    role: 'manager',
    widgets: [
      {
        id: 'facility-overview',
        type: 'facility',
        position: { x: 0, y: 0 },
        size: { width: 12, height: 3 },
        config: {
          showAllZones: true
        }
      },
      {
        id: 'productivity',
        type: 'productivity',
        position: { x: 0, y: 3 },
        size: { width: 6, height: 4 },
        config: {
          metrics: ['yield', 'efficiency', 'labor']
        }
      },
      {
        id: 'financial',
        type: 'financial',
        position: { x: 6, y: 3 },
        size: { width: 6, height: 4 },
        config: {
          showRevenue: true,
          showCosts: true,
          showProfit: true
        }
      }
    ]
  },
  {
    id: 'technician-default',
    name: 'Technician Dashboard',
    description: 'Dashboard for technical staff',
    role: 'technician',
    widgets: [
      {
        id: 'equipment-status',
        type: 'equipment',
        position: { x: 0, y: 0 },
        size: { width: 8, height: 4 },
        config: {
          showMaintenance: true,
          showAlarms: true
        }
      },
      {
        id: 'sensor-readings',
        type: 'sensors',
        position: { x: 8, y: 0 },
        size: { width: 4, height: 4 },
        config: {
          refreshRate: 5000
        }
      },
      {
        id: 'maintenance-schedule',
        type: 'maintenance',
        position: { x: 0, y: 4 },
        size: { width: 6, height: 3 },
        config: {
          daysAhead: 7
        }
      },
      {
        id: 'system-logs',
        type: 'logs',
        position: { x: 6, y: 4 },
        size: { width: 6, height: 3 },
        config: {
          maxLogs: 100
        }
      }
    ]
  }
];

export function getDashboardTemplate(roleOrId: string): DashboardTemplate | undefined {
  return dashboardTemplates.find(t => t.id === roleOrId || t.role === roleOrId);
}

export function createCustomTemplate(name: string, role: string, widgets: DashboardWidget[]): DashboardTemplate {
  return {
    id: `custom-${Date.now()}`,
    name,
    description: 'Custom dashboard template',
    role,
    widgets
  };
}