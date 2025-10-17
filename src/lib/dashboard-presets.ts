import { Widget, DashboardLayout } from '@/components/dashboard/EditableDashboard';

// Predefined dashboard layouts for different user types and tiers
export const DASHBOARD_PRESETS: Record<string, DashboardLayout> = {
  // Free User Dashboard
  'free-user': {
    id: 'free-user-default',
    name: 'Free User Dashboard',
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [
      {
        id: '1',
        type: 'stats',
        title: 'Getting Started',
        size: 'medium',
        data: {
          stats: [
            { label: 'Fixtures Used', value: '3/5', change: '2 remaining', type: 'neutral' },
            { label: 'Projects', value: '2', change: 'Free limit: 5', type: 'neutral' }
          ]
        }
      },
      {
        id: '2',
        type: 'quickActions',
        title: 'Try VibeLux Features',
        size: 'large',
        data: {
          actions: [
            { label: 'PPFD Calculator', href: '/calculators', icon: 'Calculator' },
            { label: 'Location Analysis', href: '/dashboard?tab=analysis', icon: 'MapPin' },
            { label: 'Browse Fixtures', href: '/fixtures', icon: 'Lightbulb' },
            { label: 'View Pricing', href: '/pricing', icon: 'Crown' }
          ]
        }
      },
      {
        id: '3',
        type: 'activity',
        title: 'Get Started',
        size: 'medium',
        data: {
          activities: [
            { title: 'Welcome to VibeLux', description: 'Explore our features', status: 'completed' },
            { title: 'Try Calculator Demo', description: 'Free PPFD calculations', status: 'available' },
            { title: 'Analyze a Location', description: 'Climate assessment', status: 'pending' }
          ]
        }
      }
    ]
  },

  // Professional User Dashboard
  'professional-user': {
    id: 'pro-user-default',
    name: 'Professional Dashboard',
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [
      {
        id: '1',
        type: 'stats',
        title: 'Performance Metrics',
        size: 'large',
        data: {
          stats: [
            { label: 'Energy Saved', value: '$2,847', change: '+12%', type: 'positive' },
            { label: 'Active Projects', value: '12', change: '+3 this month', type: 'positive' },
            { label: 'Efficiency', value: '94.2%', change: '+2.1%', type: 'positive' },
            { label: 'ROI', value: '24.5%', change: '+3.2%', type: 'positive' }
          ]
        }
      },
      {
        id: '2',
        type: 'energySavings',
        title: 'Energy Analytics',
        size: 'medium',
        data: {
          currentMonth: 2847,
          lastMonth: 2541,
          yearToDate: 28470,
          projectedAnnual: 34164
        }
      },
      {
        id: '3',
        type: 'chart',
        title: 'Growth Trends',
        size: 'large',
        data: {
          type: 'line',
          period: 'monthly'
        }
      },
      {
        id: '4',
        type: 'projectOverview',
        title: 'Active Projects',
        size: 'medium',
        data: {
          projects: [
            { name: 'Greenhouse A', status: 'active', completion: 85 },
            { name: 'Vertical Farm B', status: 'active', completion: 60 },
            { name: 'Research Lab C', status: 'planning', completion: 20 }
          ]
        }
      },
      {
        id: '5',
        type: 'systemHealth',
        title: 'System Status',
        size: 'small',
        data: {
          overall: 98.5,
          services: [
            { name: 'API', status: 'healthy' },
            { name: 'Database', status: 'healthy' },
            { name: 'Analytics', status: 'healthy' }
          ]
        }
      }
    ]
  },

  // Enterprise User Dashboard
  'enterprise-user': {
    id: 'enterprise-user-default',
    name: 'Enterprise Dashboard',
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [
      {
        id: '1',
        type: 'stats',
        title: 'Enterprise Overview',
        size: 'full',
        data: {
          stats: [
            { label: 'Total Facilities', value: '24', change: '+2 this quarter', type: 'positive' },
            { label: 'Energy Saved', value: '$142K', change: '+18%', type: 'positive' },
            { label: 'Active Projects', value: '156', change: '+12 this month', type: 'positive' },
            { label: 'Team Members', value: '48', change: '+6', type: 'positive' },
            { label: 'System Uptime', value: '99.9%', change: 'Excellent', type: 'positive' },
            { label: 'ROI', value: '42.8%', change: '+5.2%', type: 'positive' }
          ]
        }
      },
      {
        id: '2',
        type: 'chart',
        title: 'Multi-Site Performance',
        size: 'large',
        data: {
          type: 'multisite',
          sites: ['Site A', 'Site B', 'Site C', 'Site D']
        }
      },
      {
        id: '3',
        type: 'revenueTracking',
        title: 'Financial Overview',
        size: 'large',
        data: {
          revenue: 842000,
          savings: 142000,
          costs: 320000,
          profit: 522000
        }
      }
    ]
  },

  // Admin Dashboard
  'admin': {
    id: 'admin-default',
    name: 'Admin Dashboard',
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [
      {
        id: '1',
        type: 'stats',
        title: 'System Overview',
        size: 'full',
        data: {
          stats: [
            { label: 'Total Users', value: '1,247', change: '+89 this week', type: 'positive' },
            { label: 'Active Sessions', value: '342', change: 'Real-time', type: 'neutral' },
            { label: 'API Calls', value: '2.4M', change: 'This month', type: 'neutral' },
            { label: 'System Load', value: '42%', change: 'Normal', type: 'positive' },
            { label: 'Error Rate', value: '0.02%', change: '-0.01%', type: 'positive' },
            { label: 'Uptime', value: '99.99%', change: '30 days', type: 'positive' }
          ]
        }
      },
      {
        id: '2',
        type: 'systemHealth',
        title: 'Infrastructure Health',
        size: 'large',
        data: {
          services: [
            { name: 'Database Cluster', status: 'healthy', cpu: 35, memory: 42 },
            { name: 'API Gateway', status: 'healthy', cpu: 28, memory: 31 },
            { name: 'Worker Pool', status: 'healthy', cpu: 65, memory: 58 },
            { name: 'Cache Layer', status: 'healthy', cpu: 12, memory: 78 }
          ]
        }
      },
      {
        id: '3',
        type: 'activity',
        title: 'Admin Activity Log',
        size: 'medium',
        data: {
          activities: [
            { title: 'User suspended', description: 'Policy violation - User #4821', status: 'completed' },
            { title: 'System backup', description: 'Daily backup completed', status: 'completed' },
            { title: 'Security scan', description: 'No vulnerabilities found', status: 'completed' }
          ]
        }
      }
    ]
  },

  // Developer Dashboard
  'developer': {
    id: 'developer-default',
    name: 'Developer Dashboard',
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [
      {
        id: '1',
        type: 'stats',
        title: 'Development Metrics',
        size: 'large',
        data: {
          stats: [
            { label: 'API Endpoints', value: '247', change: '+12 this sprint', type: 'positive' },
            { label: 'Code Coverage', value: '87%', change: '+2%', type: 'positive' },
            { label: 'Build Time', value: '3.2m', change: '-0.4m', type: 'positive' },
            { label: 'Open Issues', value: '34', change: '-8', type: 'positive' }
          ]
        }
      },
      {
        id: '2',
        type: 'systemHealth',
        title: 'API Performance',
        size: 'medium',
        data: {
          endpoints: [
            { path: '/api/design', latency: '142ms', calls: '12.4k/day' },
            { path: '/api/calculate', latency: '89ms', calls: '8.2k/day' },
            { path: '/api/auth', latency: '23ms', calls: '42.1k/day' }
          ]
        }
      },
      {
        id: '3',
        type: 'activity',
        title: 'Recent Deployments',
        size: 'medium',
        data: {
          deployments: [
            { version: 'v2.4.1', environment: 'Production', status: 'success', time: '2h ago' },
            { version: 'v2.5.0-beta', environment: 'Staging', status: 'success', time: '5h ago' },
            { version: 'v2.5.0-alpha', environment: 'Dev', status: 'success', time: '1d ago' }
          ]
        }
      }
    ]
  }
};

// Function to get appropriate preset based on user role and tier
export function getDashboardPreset(
  userRole: 'user' | 'admin' | 'developer',
  subscriptionTier: 'free' | 'professional' | 'enterprise'
): DashboardLayout {
  if (userRole === 'admin') {
    return DASHBOARD_PRESETS['admin'];
  }
  
  if (userRole === 'developer') {
    return DASHBOARD_PRESETS['developer'];
  }
  
  // For regular users, return based on subscription tier
  switch (subscriptionTier) {
    case 'free':
      return DASHBOARD_PRESETS['free-user'];
    case 'professional':
      return DASHBOARD_PRESETS['professional-user'];
    case 'enterprise':
      return DASHBOARD_PRESETS['enterprise-user'];
    default:
      return DASHBOARD_PRESETS['free-user'];
  }
}

// Function to merge user customizations with preset
export function mergeWithPreset(
  preset: DashboardLayout,
  customizations: Partial<DashboardLayout>
): DashboardLayout {
  return {
    ...preset,
    ...customizations,
    widgets: customizations.widgets || preset.widgets,
    updatedAt: new Date()
  };
}