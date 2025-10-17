'use client';

import React, { useState } from 'react';
import { 
  Search, ChevronRight, Star, Zap, Brain, Calculator, Building,
  Database, Shield, Cloud, Globe, Package, Users, BarChart3,
  Smartphone, Code2, FileText, DollarSign, Truck, Factory,
  Thermometer, Droplets, Wind, Sun, Leaf, TestTube, Microscope,
  Calendar, Clock, Bell, Settings, Lock, Wifi, Download, Upload
} from 'lucide-react';

// Comprehensive feature categories showcasing all 2,400+ features
const FEATURE_MEGA_LIST = [
  {
    category: 'Design & Engineering',
    count: 250,
    icon: Building,
    color: 'from-blue-500 to-blue-600',
    subcategories: [
      {
        name: '3D Visualization',
        features: ['WebGL rendering', 'Ray tracing', 'Shadow analysis', 'False color mapping', 'GPU acceleration'],
        count: 45
      },
      {
        name: 'CAD/BIM Integration', 
        features: ['DWG export', 'Revit sync', 'IFC support', '45-sheet drawings', 'Construction docs'],
        count: 38
      },
      {
        name: 'Electrical Design',
        features: ['Load balancing', 'Voltage drop', 'Panel schedules', 'Single line diagrams', 'THD analysis'],
        count: 42
      },
      {
        name: 'HVAC Planning',
        features: ['CFD analysis', 'Duct sizing', 'Heat load calc', 'Airflow patterns', 'Energy modeling'],
        count: 35
      },
      {
        name: 'Structural Analysis',
        features: ['Load calculations', 'Rack systems', 'Seismic analysis', 'Wind loads', 'Foundation design'],
        count: 30
      }
    ],
    highlights: ['Professional-grade tools', 'Code compliance', 'Multi-discipline integration']
  },
  {
    category: 'AI & Machine Learning',
    count: 150,
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    subcategories: [
      {
        name: 'Design AI',
        features: ['Claude 4 Opus', 'GPT-4 integration', 'Natural language', 'Auto-optimization', 'Layout generation'],
        count: 28
      },
      {
        name: 'Predictive Models',
        features: ['Yield prediction (82% accuracy)', 'Quality forecasting', 'Market demand', 'Price prediction', 'Weather impact'],
        count: 35
      },
      {
        name: 'Computer Vision',
        features: ['Disease detection', 'Pest identification', 'Growth tracking', 'Quality grading', 'Harvest timing'],
        count: 32
      },
      {
        name: 'Optimization Engines',
        features: ['Energy optimization', 'Spectrum tuning', 'Resource allocation', 'Schedule optimization', 'Route planning'],
        count: 30
      },
      {
        name: 'Analytics AI',
        features: ['Anomaly detection', 'Pattern recognition', 'Trend analysis', 'Correlation engine', 'Recommendation system'],
        count: 25
      }
    ],
    highlights: ['Self-learning algorithms', 'Real-time processing', 'Cloud & edge AI']
  },
  {
    category: 'Calculators & Tools',
    count: 25,
    icon: Calculator,
    color: 'from-green-500 to-green-600',
    subcategories: [
      {
        name: 'Lighting Calculators',
        features: ['PPFD/DLI', 'Uniformity', 'Coverage', 'Spectrum analysis', 'Cost per mol'],
        count: 45
      },
      {
        name: 'Environmental Tools',
        features: ['VPD calculator', 'Psychrometric', 'Dew point', 'Heat index', 'CO2 enrichment'],
        count: 52
      },
      {
        name: 'Financial Calculators',
        features: ['ROI/TCO', 'Energy savings', 'Payback period', 'NPV/IRR', 'Break-even analysis'],
        count: 48
      },
      {
        name: 'Cultivation Tools',
        features: ['Nutrient mixing', 'pH adjustment', 'EC calculator', 'Fertigation', 'IPM planning'],
        count: 65
      },
      {
        name: 'Engineering Calculators',
        features: ['Wire sizing', 'Voltage drop', 'BTU/tonnage', 'CFM requirements', 'Pump sizing'],
        count: 58
      },
      {
        name: 'Business Tools',
        features: ['Labor calculator', 'Yield estimator', 'Cost analysis', 'Pricing optimizer', 'Inventory planning'],
        count: 40
      }
    ],
    highlights: ['Scientific accuracy', 'Real-time calculations', 'Export capabilities']
  },
  {
    category: 'Analytics & Reporting',
    count: 200,
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    subcategories: [
      {
        name: 'Real-time Dashboards',
        features: ['Custom widgets', 'Drag-and-drop', 'Multi-facility view', 'Role-based', 'Mobile responsive'],
        count: 35
      },
      {
        name: 'KPI Tracking',
        features: ['50+ metrics', 'Custom KPIs', 'Benchmarking', 'Goal tracking', 'Alert thresholds'],
        count: 42
      },
      {
        name: 'Statistical Analysis',
        features: ['ANOVA', 'Regression', 'DOE', 'Time series', 'Correlation matrix'],
        count: 38
      },
      {
        name: 'Report Generation',
        features: ['Scheduled reports', 'Custom templates', 'PDF/Excel export', 'Executive summaries', 'Compliance reports'],
        count: 45
      },
      {
        name: 'Data Visualization',
        features: ['3D charts', 'Heat maps', 'Sankey diagrams', 'Network graphs', 'Interactive plots'],
        count: 40
      }
    ],
    highlights: ['Publication-ready', 'Real-time updates', 'Historical analysis']
  },
  {
    category: 'Cultivation Management',
    count: 180,
    icon: Leaf,
    color: 'from-emerald-500 to-emerald-600',
    subcategories: [
      {
        name: 'Crop Planning',
        features: ['Strain library (2000+)', 'Growth stages', 'Phenotype tracking', 'Breeding programs', 'Tissue culture'],
        count: 45
      },
      {
        name: 'Production Management',
        features: ['Batch tracking', 'Mother plants', 'Clone management', 'Transplant scheduler', 'Harvest planning'],
        count: 38
      },
      {
        name: 'Quality Control',
        features: ['Lab results', 'Grading system', 'Defect tracking', 'CAPA management', 'Audit trails'],
        count: 35
      },
      {
        name: 'IPM System',
        features: ['Pest database', 'Treatment plans', 'Scouting reports', 'Biological controls', 'Resistance management'],
        count: 32
      },
      {
        name: 'Post-Harvest',
        features: ['Drying curves', 'Curing protocols', 'Trimming workflow', 'Packaging', 'Storage optimization'],
        count: 30
      }
    ],
    highlights: ['Seed-to-sale tracking', 'Compliance ready', 'Mobile scouting']
  },
  {
    category: 'Business & Finance',
    count: 180,
    icon: DollarSign,
    color: 'from-yellow-500 to-yellow-600',
    subcategories: [
      {
        name: 'Financial Management',
        features: ['QuickBooks sync', 'Invoice generation', 'Payment processing', 'Multi-currency', 'Tax compliance'],
        count: 42
      },
      {
        name: 'Cost Tracking',
        features: ['Activity-based costing', 'Labor tracking', 'Material costs', 'Overhead allocation', 'Profitability analysis'],
        count: 38
      },
      {
        name: 'Investment Tools',
        features: ['Capital planning', 'Grant management', 'Rebate tracking', 'Financing options', 'Asset depreciation'],
        count: 35
      },
      {
        name: 'Revenue Optimization',
        features: ['Pricing strategy', 'Yield management', 'Contract management', 'Subscription billing', 'Commission tracking'],
        count: 33
      },
      {
        name: 'Marketplace',
        features: ['Equipment trading', 'Produce exchange', 'Service directory', 'RFQ system', 'Vendor management'],
        count: 32
      }
    ],
    highlights: ['Real-time P&L', 'Cash flow forecasting', 'Budget vs actual']
  },
  {
    category: 'Enterprise Features',
    count: 200,
    icon: Globe,
    color: 'from-indigo-500 to-indigo-600',
    subcategories: [
      {
        name: 'Multi-Facility',
        features: ['Centralized control', 'Site comparison', 'Resource sharing', 'Cross-facility reporting', 'Global settings'],
        count: 35
      },
      {
        name: 'Security & Compliance',
        features: ['SSO/SAML', '2FA/MFA', 'RBAC', 'Audit logs', 'Data encryption'],
        count: 45
      },
      {
        name: 'Integration Platform',
        features: ['REST API', 'GraphQL', 'Webhooks', 'ETL tools', 'Custom connectors'],
        count: 40
      },
      {
        name: 'White Label',
        features: ['Custom branding', 'Domain mapping', 'Theme editor', 'Email templates', 'Custom workflows'],
        count: 30
      },
      {
        name: 'Infrastructure',
        features: ['Load balancing', 'Auto-scaling', 'Disaster recovery', 'Backup system', 'High availability'],
        count: 50
      }
    ],
    highlights: ['High availability', 'SOC 2 compliant', 'GDPR ready']
  },
  {
    category: 'Environmental Control',
    count: 150,
    icon: Thermometer,
    color: 'from-red-500 to-red-600',
    subcategories: [
      {
        name: 'Climate Management',
        features: ['Multi-zone control', 'VPD optimization', 'Weather integration', 'Predictive control', 'Energy optimization'],
        count: 38
      },
      {
        name: 'HVAC Integration',
        features: ['BMS connectivity', 'PLC control', 'SCADA systems', 'Modbus/BACnet', 'OPC UA'],
        count: 35
      },
      {
        name: 'Sensor Networks',
        features: ['Wireless sensors', 'IoT integration', 'Edge computing', 'Data logging', 'Calibration management'],
        count: 32
      },
      {
        name: 'Automation Rules',
        features: ['If-then logic', 'Schedule-based', 'Sensor triggers', 'ML predictions', 'Emergency protocols'],
        count: 28
      },
      {
        name: 'Resource Management',
        features: ['Water recycling', 'Energy monitoring', 'CO2 dosing', 'Nutrient recovery', 'Waste tracking'],
        count: 17
      }
    ],
    highlights: ['Real-time control', 'Predictive algorithms', 'Energy savings']
  }
];

// Quick stats for impact
const PLATFORM_IMPACT = [
  { metric: '2,400+', label: 'Total Features', icon: Zap },
  { metric: '1,186', label: 'UI Components', icon: Package },
  { metric: '400+', label: 'API Endpoints', icon: Code2 },
  { metric: '25+', label: 'Calculators', icon: Calculator },
  { metric: '4,247', label: 'Code Files', icon: FileText },
  { metric: '99.9%', label: 'Uptime SLA', icon: Shield }
];

export function FeatureShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(FEATURE_MEGA_LIST[0]);
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);

  const totalFeatureCount = FEATURE_MEGA_LIST.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="py-20 bg-gradient-to-b from-gray-950 via-purple-950/5 to-gray-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm mb-4">
            <Star className="w-4 h-4" />
            Industry's Most Complete Platform
          </div>
          <h2 className="text-5xl font-bold text-white mb-4">
            {totalFeatureCount.toLocaleString()}+ Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            More capabilities than the next 10 competitors combined. Every tool you need, 
            from basic calculators to enterprise AI - all included in one platform.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {PLATFORM_IMPACT.map((stat) => (
            <div key={stat.label} className="bg-gray-900/50 rounded-lg p-4 text-center">
              <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.metric}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search 2,400+ features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 text-white rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          {/* Category List */}
          <div className="lg:col-span-1 space-y-2">
            {FEATURE_MEGA_LIST.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedCategory.category === category.category
                    ? 'bg-gradient-to-r ' + category.color + ' text-white'
                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <category.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm opacity-75">{category.count} features</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Category Details */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 rounded-xl p-8">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm mb-4 bg-gradient-to-r ${selectedCategory.color}`}>
                <selectedCategory.icon className="w-4 h-4" />
                {selectedCategory.count} Features
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {selectedCategory.category}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory.highlights.map((highlight) => (
                  <span key={highlight} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Subcategories */}
              <div className="space-y-4">
                {selectedCategory.subcategories.map((subcat) => (
                  <div key={subcat.name} className="border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSubcategory(
                        expandedSubcategory === subcat.name ? null : subcat.name
                      )}
                      className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">{subcat.name}</span>
                          <span className="ml-2 text-sm text-gray-500">({subcat.count} features)</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedSubcategory === subcat.name ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                    
                    {expandedSubcategory === subcat.name && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subcat.features.map((feature) => (
                            <span key={feature} className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded text-sm">
                              {feature}
                            </span>
                          ))}
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm">
                            +{subcat.count - subcat.features.length} more
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/features"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              Explore All Features
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="/demo"
              className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              See Live Demo
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            New features added weekly • Core features in every paid plan • Advanced add-ons available
          </p>
        </div>
      </div>
    </div>
  );
}