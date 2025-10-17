'use client';

import Link from 'next/link';
import {
  Calendar,
  BookOpen,
  Navigation,
  Activity,
  Layers,
  Droplets,
  Wind,
  Clock,
  Beaker,
  Building,
  ListTodo,
  DollarSign,
  Zap,
  Shield,
  Bell,
  BarChart3,
  Bug,
  Flame,
  Brain,
  FlaskConical,
  FileCheck,
  Network,
  Gauge,
  Settings,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface MenuSection {
  title: string;
  description: string;
  items: {
    href: string;
    label: string;
    icon: any;
    description: string;
    badge?: string;
  }[];
}

export default function CultivationMenuPage() {
  const menuSections: MenuSection[] = [
    {
      title: 'Core Systems',
      description: 'Essential cultivation control systems',
      items: [
        {
          href: '/cultivation',
          label: 'Control Center',
          icon: Activity,
          description: 'Main cultivation dashboard with system overview'
        },
        {
          href: '/cultivation#recipe',
          label: 'Recipe Control',
          icon: Calendar,
          description: 'Active recipe management and scheduling'
        },
        {
          href: '/cultivation#recipes',
          label: 'Recipe Library',
          icon: BookOpen,
          description: 'Browse and manage cultivation recipes'
        },
        {
          href: '/cultivation/crop-steering',
          label: 'Crop Steering',
          icon: Navigation,
          description: 'Advanced crop steering strategies'
        },
        {
          href: '/cultivation#monitoring',
          label: 'Environmental Monitoring',
          icon: Activity,
          description: 'Real-time environmental data grid'
        }
      ]
    },
    {
      title: 'Equipment Control',
      description: 'Hardware and equipment management',
      items: [
        {
          href: '/cultivation#racks',
          label: 'Multi-Level Racks',
          icon: Layers,
          description: 'Vertical farming rack control'
        },
        {
          href: '/cultivation#irrigation',
          label: 'Irrigation System',
          icon: Droplets,
          description: 'Nutrient and water delivery control'
        },
        {
          href: '/cultivation#hvac',
          label: 'HVAC Control',
          icon: Wind,
          description: 'Climate and airflow management'
        },
        {
          href: '/cultivation#circadian',
          label: 'Circadian Rhythm',
          icon: Clock,
          description: 'Natural light cycle simulation'
        }
      ]
    },
    {
      title: 'Specialized Production',
      description: 'Advanced cultivation methodologies',
      items: [
        {
          href: '/cultivation#vertical',
          label: 'Vertical Farming',
          icon: Building,
          description: 'High-density vertical systems'
        }
      ]
    },
    {
      title: 'Operations & Analytics',
      description: 'Business operations and data analysis',
      items: [
        {
          href: '/cultivation#tasks',
          label: 'Task Management',
          icon: ListTodo,
          description: 'Team tasks and scheduling'
        },
        {
          href: '/cultivation#costs',
          label: 'Cost Tracking',
          icon: DollarSign,
          description: 'Financial tracking and analysis'
        },
        {
          href: '/cultivation#energy',
          label: 'Energy Markets',
          icon: Zap,
          description: 'Energy optimization and trading'
        },
        {
          href: '/cultivation#safety',
          label: 'Worker Safety',
          icon: Shield,
          description: 'Safety protocols and monitoring'
        },
        {
          href: '/cultivation#analytics',
          label: 'Analytics Dashboard',
          icon: BarChart3,
          description: 'Comprehensive data analysis'
        },
        {
          href: '/analytics',
          label: 'Functional Food Research',
          icon: Beaker,
          description: 'Nutritional optimization and recipe discovery',
          badge: 'MOVED TO ANALYTICS'
        }
      ]
    },
    {
      title: 'Advanced Features',
      description: 'Professional-grade cultivation tools',
      items: [
        {
          href: '/cultivation/advanced#ipm',
          label: 'IPM Light Management',
          icon: Bug,
          description: 'Pest management with light',
          badge: 'PRO'
        },
        {
          href: '/cultivation/advanced#burn-prevention',
          label: 'Light Burn Prevention',
          icon: Flame,
          description: 'Automated burn protection',
          badge: 'PRO'
        },
        {
          href: '/cultivation/advanced#quality',
          label: 'Quality Prediction',
          icon: Brain,
          description: 'AI-powered quality forecasting',
          badge: 'AI'
        },
        {
          href: '/cultivation/advanced#strain-library',
          label: 'Strain Recipe Library',
          icon: FlaskConical,
          description: 'Strain-specific protocols',
          badge: 'PRO'
        },
        {
          href: '/cultivation/advanced#compliance',
          label: 'Regulatory Compliance',
          icon: FileCheck,
          description: 'Automated compliance tracking'
        },
        {
          href: '/cultivation/advanced#multi-site',
          label: 'Multi-Site Sync',
          icon: Network,
          description: 'Facility synchronization',
          badge: 'ENTERPRISE'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/cultivation"
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Cultivation Systems</h1>
              <p className="text-gray-400 mt-1">Complete cultivation management platform</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Recipes</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">System Health</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">98.5%</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Zones</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">12/16</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Alerts</span>
              <Bell className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                <p className="text-gray-400">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-purple-600 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Icon className="w-6 h-6 text-purple-400" />
                        {item.badge && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-600/20 text-purple-400 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Access</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400">
                Access documentation, tutorials, and support for all cultivation systems.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                View Docs
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}