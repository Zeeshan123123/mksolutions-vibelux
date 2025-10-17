'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DLCFixtureData, searchDLCFixtures, mockDLCFixtures } from '@/lib/dlc-fixture-search';
import { 
  Search, 
  ArrowRight, 
  X, 
  Hash, 
  FileText, 
  Settings, 
  Calculator, 
  Sparkles,
  Home,
  Building,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  FlaskConical,
  Brain,
  Zap,
  Monitor,
  Leaf,
  DollarSign,
  Shield,
  Activity,
  BookOpen,
  Info,
  Layers,
  Lightbulb,
  Cpu,
  Thermometer,
  Droplets,
  Battery,
  Camera,
  Globe,
  Smartphone,
  Scale,
  Target,
  Database,
  Wrench,
  Sun,
  CreditCard,
  Award,
  HelpCircle,
  Command,
  ChevronRight
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  subcategory?: string;
  icon: React.ElementType;
  keywords: string[];
  badge?: string;
  priority: number; // Lower numbers = higher priority
  type?: 'page' | 'fixture'; // Add type to distinguish between pages and fixtures
  fixtureData?: DLCFixtureData; // Store fixture data for fixture results
}

// Comprehensive search index
const searchIndex: SearchItem[] = [
  // Core Navigation
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Main dashboard and control center',
    href: '/dashboard',
    category: 'Navigation',
    icon: Home,
    keywords: ['dashboard', 'home', 'overview', 'main'],
    priority: 1
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Complete feature overview and capabilities',
    href: '/features',
    category: 'Navigation',
    icon: Sparkles,
    keywords: ['features', 'capabilities', 'overview'],
    priority: 2
  },
  {
    id: 'demo',
    title: 'Demo',
    description: 'Interactive demo and product showcase',
    href: '/demo',
    category: 'Navigation',
    icon: Sparkles,
    keywords: ['demo', 'showcase', 'tour', 'preview'],
    badge: 'NEW',
    priority: 2
  },

  // Design & Engineering
  {
    id: 'advanced-designer',
    title: 'Advanced Designer',
    description: 'Professional 3D lighting design with CAD integration',
    href: '/design/advanced',
    category: 'Design Studio',
    subcategory: 'Design Tools',
    icon: Layers,
    keywords: ['design', 'advanced', 'cad', '3d', 'lighting', 'professional', 'autodesk'],
    badge: 'Pro',
    priority: 1
  },
  {
    id: 'quick-designer',
    title: 'Quick Design',
    description: 'Simple and fast lighting design tool',
    href: '/designer',
    category: 'Design Studio',
    subcategory: 'Design Tools',
    icon: Lightbulb,
    keywords: ['design', 'quick', 'simple', 'fast', 'lighting'],
    priority: 2
  },
  {
    id: 'mobile-designer',
    title: 'Mobile Designer',
    description: 'Touch-optimized design interface for mobile devices',
    href: '/mobile-designer',
    category: 'Design Studio',
    subcategory: 'Design Tools',
    icon: Smartphone,
    keywords: ['mobile', 'design', 'touch', 'responsive'],
    priority: 3
  },
  {
    id: 'climate-integrated',
    title: 'Climate Integration',
    description: 'Lighting design with climate control integration',
    href: '/design/climate-integrated',
    category: 'Design Studio',
    subcategory: 'Integration',
    icon: Thermometer,
    keywords: ['climate', 'hvac', 'integration', 'environmental'],
    priority: 2
  },
  {
    id: 'digital-twin',
    title: 'Digital Twin',
    description: 'Virtual facility modeling and simulation',
    href: '/digital-twin',
    category: 'Design Studio',
    subcategory: 'Simulation',
    icon: Building,
    keywords: ['digital', 'twin', 'simulation', 'virtual', 'modeling'],
    priority: 2
  },
  {
    id: 'vertical-farming',
    title: 'Vertical Farming Suite',
    description: 'Specialized tools for vertical farming operations',
    href: '/vertical-farming-suite',
    category: 'Design Studio',
    subcategory: 'Specialized',
    icon: Layers,
    keywords: ['vertical', 'farming', 'multi-tier', 'stacked'],
    priority: 2
  },
  {
    id: 'cad-lighting',
    title: 'CAD/Lighting Tools',
    description: 'Professional CAD integration and lighting tools',
    href: '/lighting-tools',
    category: 'Design Studio',
    subcategory: 'Tools',
    icon: FileText,
    keywords: ['cad', 'lighting', 'tools', 'professional', 'dwg', 'revit'],
    priority: 2
  },

  // Operations & Monitoring
  {
    id: 'operations-center',
    title: 'Operations Center',
    description: 'Centralized facility operations and monitoring',
    href: '/operations',
    category: 'Operations',
    subcategory: 'Control',
    icon: Monitor,
    keywords: ['operations', 'monitoring', 'control', 'facility'],
    priority: 1
  },
  {
    id: 'zone-configuration',
    title: 'Zone Configuration',
    description: 'Configure and manage growing zones',
    href: '/settings/zones',
    category: 'Operations',
    subcategory: 'Setup',
    icon: Settings,
    keywords: ['zone', 'configuration', 'setup', 'growing'],
    badge: 'Setup',
    priority: 2
  },
  {
    id: 'hmi-control',
    title: 'HMI Control',
    description: 'Human Machine Interface for real-time control',
    href: '/operations/hmi',
    category: 'Operations',
    subcategory: 'Control',
    icon: Monitor,
    keywords: ['hmi', 'control', 'interface', 'real-time'],
    badge: 'Real-time',
    priority: 2
  },
  {
    id: 'cultivation-hub',
    title: 'Cultivation Hub',
    description: 'Central cultivation management and planning',
    href: '/cultivation',
    category: 'Operations',
    subcategory: 'Cultivation',
    icon: Leaf,
    keywords: ['cultivation', 'growing', 'management', 'planning'],
    priority: 2
  },
  {
    id: 'crop-steering',
    title: 'Crop Steering',
    description: 'Advanced crop steering and optimization',
    href: '/cultivation/crop-steering',
    category: 'Operations',
    subcategory: 'Cultivation',
    icon: Target,
    keywords: ['crop', 'steering', 'optimization', 'advanced'],
    priority: 2
  },
  {
    id: 'autopilot',
    title: 'AutoPilot',
    description: 'AI-powered automated facility management',
    href: '/autopilot',
    category: 'Operations',
    subcategory: 'Automation',
    icon: Brain,
    keywords: ['autopilot', 'ai', 'automation', 'automated'],
    badge: 'AI',
    priority: 2
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Facility automation and control systems',
    href: '/automation',
    category: 'Operations',
    subcategory: 'Automation',
    icon: Cpu,
    keywords: ['automation', 'control', 'systems', 'automated'],
    priority: 2
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Equipment maintenance tracking and scheduling',
    href: '/maintenance-tracker',
    category: 'Operations',
    subcategory: 'Maintenance',
    icon: Wrench,
    keywords: ['maintenance', 'tracking', 'scheduling', 'equipment'],
    priority: 2
  },
  {
    id: 'equipment',
    title: 'Equipment',
    description: 'Equipment management and monitoring',
    href: '/equipment',
    category: 'Operations',
    subcategory: 'Equipment',
    icon: Package,
    keywords: ['equipment', 'management', 'monitoring', 'hardware'],
    priority: 2
  },
  {
    id: 'schedule',
    title: 'Schedule',
    description: 'Task and operation scheduling',
    href: '/schedule',
    category: 'Operations',
    subcategory: 'Planning',
    icon: Calendar,
    keywords: ['schedule', 'planning', 'tasks', 'operations'],
    priority: 2
  },
  {
    id: 'multi-site',
    title: 'Multi-Site',
    description: 'Multi-facility management and coordination',
    href: '/multi-site',
    category: 'Operations',
    subcategory: 'Enterprise',
    icon: Globe,
    keywords: ['multi-site', 'facility', 'enterprise', 'coordination'],
    priority: 2
  },

  // Analytics & Intelligence
  {
    id: 'analytics',
    title: 'Performance Analytics',
    description: 'Comprehensive performance analytics and insights',
    href: '/analytics',
    category: 'Analytics & AI',
    subcategory: 'Analytics',
    icon: BarChart3,
    keywords: ['analytics', 'performance', 'insights', 'data'],
    priority: 1
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    description: 'Financial analysis and reporting tools',
    href: '/reports',
    category: 'Analytics & AI',
    subcategory: 'Reports',
    icon: FileText,
    keywords: ['reports', 'financial', 'analysis', 'business'],
    priority: 2
  },
  {
    id: 'monitoring',
    title: 'Environmental Monitoring',
    description: 'Real-time environmental monitoring and alerts',
    href: '/monitoring',
    category: 'Analytics & AI',
    subcategory: 'Monitoring',
    icon: Activity,
    keywords: ['monitoring', 'environmental', 'sensors', 'alerts'],
    priority: 2
  },
  {
    id: 'predictions',
    title: 'AI Predictions',
    description: 'Machine learning predictions and insights',
    href: '/predictions',
    category: 'Analytics & AI',
    subcategory: 'AI',
    icon: Brain,
    keywords: ['ai', 'predictions', 'machine learning', 'insights'],
    badge: 'AI',
    priority: 2
  },
  {
    id: 'intelligence',
    title: 'Intelligence Center',
    description: 'Centralized intelligence and decision support',
    href: '/intelligence',
    category: 'Analytics & AI',
    subcategory: 'Intelligence',
    icon: Brain,
    keywords: ['intelligence', 'decision', 'support', 'ai'],
    priority: 2
  },
  {
    id: 'yield-prediction',
    title: 'Yield Prediction',
    description: 'AI-powered yield forecasting and optimization',
    href: '/yield-prediction',
    category: 'Analytics & AI',
    subcategory: 'Prediction',
    icon: Target,
    keywords: ['yield', 'prediction', 'forecasting', 'ai'],
    priority: 2
  },
  {
    id: 'hyperspectral',
    title: 'Hyperspectral Analysis',
    description: 'Advanced hyperspectral imaging and analysis',
    href: '/hyperspectral',
    category: 'Analytics & AI',
    subcategory: 'Imaging',
    icon: Camera,
    keywords: ['hyperspectral', 'imaging', 'analysis', 'spectrum'],
    priority: 3
  },
  {
    id: 'plant-identifier',
    title: 'Plant Identifier',
    description: 'AI-powered plant identification and health analysis',
    href: '/plant-identifier',
    category: 'Analytics & AI',
    subcategory: 'AI',
    icon: Leaf,
    keywords: ['plant', 'identifier', 'ai', 'health', 'analysis'],
    priority: 2
  },

  // Research & Analysis
  {
    id: 'research-library',
    title: 'Research Library',
    description: 'Comprehensive research database and literature access',
    href: '/research-library',
    category: 'Research & Analysis',
    subcategory: 'Research',
    icon: BookOpen,
    keywords: ['research', 'library', 'literature', 'papers', 'database'],
    badge: 'NEW',
    priority: 2
  },
  {
    id: 'research-tools',
    title: 'Research Tools',
    description: 'Advanced research and analysis tools',
    href: '/research',
    category: 'Research & Analysis',
    subcategory: 'Tools',
    icon: FlaskConical,
    keywords: ['research', 'tools', 'analysis', 'scientific'],
    priority: 2
  },
  {
    id: 'experiment-designer',
    title: 'Experiment Designer',
    description: 'Design and manage research experiments',
    href: '/research/experiment-designer',
    category: 'Research & Analysis',
    subcategory: 'Experiments',
    icon: FlaskConical,
    keywords: ['experiment', 'design', 'research', 'trials'],
    priority: 3
  },
  {
    id: 'statistical-analysis',
    title: 'Statistical Analysis',
    description: 'Advanced statistical analysis and modeling',
    href: '/research/statistical-analysis',
    category: 'Research & Analysis',
    subcategory: 'Statistics',
    icon: BarChart3,
    keywords: ['statistical', 'analysis', 'modeling', 'anova'],
    priority: 3
  },
  {
    id: 'data-logger',
    title: 'Data Logger',
    description: 'Research data collection and logging',
    href: '/research/data-logger',
    category: 'Research & Analysis',
    subcategory: 'Data',
    icon: Database,
    keywords: ['data', 'logger', 'collection', 'research'],
    priority: 3
  },

  // Tools & Calculators
  {
    id: 'calculators',
    title: 'All Calculators',
    description: 'Complete suite of professional calculators',
    href: '/calculators',
    category: 'Tools & Calculators',
    subcategory: 'Calculators',
    icon: Calculator,
    keywords: ['calculators', 'tools', 'professional', 'suite'],
    priority: 1
  },
  {
    id: 'climate-tools',
    title: 'Climate Tools',
    description: 'Environmental and climate calculation tools',
    href: '/climate-tools',
    category: 'Tools & Calculators',
    subcategory: 'Climate',
    icon: Thermometer,
    keywords: ['climate', 'environmental', 'tools', 'vpd', 'psychrometric'],
    priority: 2
  },
  {
    id: 'spectrum-builder',
    title: 'Spectrum Builder',
    description: 'Custom light spectrum design and analysis',
    href: '/spectrum-builder',
    category: 'Tools & Calculators',
    subcategory: 'Lighting',
    icon: Sun,
    keywords: ['spectrum', 'builder', 'light', 'design', 'analysis'],
    priority: 2
  },
  {
    id: 'spectrum-analysis',
    title: 'Spectrum Analysis',
    description: 'Advanced spectral analysis and optimization',
    href: '/spectrum',
    category: 'Tools & Calculators',
    subcategory: 'Lighting',
    icon: Sun,
    keywords: ['spectrum', 'analysis', 'optimization', 'light'],
    priority: 2
  },
  {
    id: 'light-recipes',
    title: 'Light Recipes',
    description: 'Pre-configured lighting recipes for optimal growth',
    href: '/light-recipes',
    category: 'Tools & Calculators',
    subcategory: 'Lighting',
    icon: FlaskConical,
    keywords: ['light', 'recipes', 'lighting', 'growth', 'optimization'],
    priority: 2
  },
  {
    id: 'water-analysis',
    title: 'Water Analysis',
    description: 'Water quality analysis and nutrient management',
    href: '/water-analysis',
    category: 'Tools & Calculators',
    subcategory: 'Water',
    icon: Droplets,
    keywords: ['water', 'analysis', 'quality', 'nutrients'],
    priority: 2
  },
  {
    id: 'nutrient-dosing',
    title: 'Nutrient Dosing',
    description: 'Precise nutrient dosing calculations',
    href: '/nutrient-dosing',
    category: 'Tools & Calculators',
    subcategory: 'Nutrients',
    icon: Droplets,
    keywords: ['nutrient', 'dosing', 'fertilizer', 'calculation'],
    priority: 2
  },
  {
    id: 'thermal-management',
    title: 'Thermal Management',
    description: 'Heat management and thermal analysis tools',
    href: '/thermal-management',
    category: 'Tools & Calculators',
    subcategory: 'Thermal',
    icon: Thermometer,
    keywords: ['thermal', 'heat', 'management', 'cooling'],
    priority: 2
  },

  // Financial & Investment
  {
    id: 'investment-dashboard',
    title: 'Investment Dashboard',
    description: 'Investment tracking and portfolio management',
    href: '/investment',
    category: 'Financial & Investment',
    subcategory: 'Investment',
    icon: DollarSign,
    keywords: ['investment', 'portfolio', 'tracking', 'finance'],
    priority: 2
  },
  {
    id: 'tco-calculator',
    title: 'TCO Calculator',
    description: 'Total cost of ownership analysis',
    href: '/tco-calculator',
    category: 'Financial & Investment',
    subcategory: 'Analysis',
    icon: Calculator,
    keywords: ['tco', 'total cost', 'ownership', 'analysis'],
    priority: 2
  },
  {
    id: 'business-modeling',
    title: 'Business Modeling',
    description: 'Financial modeling and business planning',
    href: '/business-modeling',
    category: 'Financial & Investment',
    subcategory: 'Planning',
    icon: BarChart3,
    keywords: ['business', 'modeling', 'financial', 'planning'],
    priority: 2
  },
  {
    id: 'revenue-sharing',
    title: 'Revenue Sharing',
    description: 'Revenue sharing programs and management',
    href: '/revenue-sharing',
    category: 'Financial & Investment',
    subcategory: 'Revenue',
    icon: DollarSign,
    keywords: ['revenue', 'sharing', 'programs', 'partnership'],
    badge: 'NEW',
    priority: 2
  },
  {
    id: 'rebate-calculator',
    title: 'Rebate Calculator',
    description: 'Utility rebate calculations and opportunities',
    href: '/rebate-calculator',
    category: 'Financial & Investment',
    subcategory: 'Rebates',
    icon: DollarSign,
    keywords: ['rebate', 'utility', 'calculator', 'savings'],
    priority: 2
  },
  {
    id: 'equipment-leasing',
    title: 'Equipment Leasing',
    description: 'Equipment leasing and financing options',
    href: '/equipment-leasing',
    category: 'Financial & Investment',
    subcategory: 'Leasing',
    icon: Package,
    keywords: ['equipment', 'leasing', 'financing', 'rental'],
    priority: 2
  },
  {
    id: 'carbon-credits',
    title: 'Carbon Credits',
    description: 'Carbon credit tracking and trading',
    href: '/carbon-credits',
    category: 'Financial & Investment',
    subcategory: 'Sustainability',
    icon: Leaf,
    keywords: ['carbon', 'credits', 'trading', 'sustainability'],
    priority: 2
  },

  // Energy & Sustainability
  {
    id: 'battery-optimization',
    title: 'Battery Optimization',
    description: 'Energy storage optimization and management',
    href: '/battery-optimization',
    category: 'Energy & Sustainability',
    subcategory: 'Storage',
    icon: Battery,
    keywords: ['battery', 'optimization', 'energy', 'storage'],
    priority: 2
  },
  {
    id: 'demand-response',
    title: 'Demand Response',
    description: 'Grid demand response and load management',
    href: '/demand-response',
    category: 'Energy & Sustainability',
    subcategory: 'Grid',
    icon: Zap,
    keywords: ['demand', 'response', 'grid', 'load', 'management'],
    priority: 2
  },
  {
    id: 'bms-integration',
    title: 'BMS Integration',
    description: 'Building management system integration',
    href: '/bms',
    category: 'Energy & Sustainability',
    subcategory: 'Integration',
    icon: Building,
    keywords: ['bms', 'building', 'management', 'integration'],
    priority: 2
  },
  {
    id: 'weather-adaptive',
    title: 'Weather Adaptive',
    description: 'Weather-based energy optimization',
    href: '/weather-adaptive',
    category: 'Energy & Sustainability',
    subcategory: 'Weather',
    icon: Globe,
    keywords: ['weather', 'adaptive', 'optimization', 'climate'],
    priority: 2
  },

  // Sensors & IoT
  {
    id: 'sensor-dashboard',
    title: 'Sensor Dashboard',
    description: 'Comprehensive sensor monitoring and management',
    href: '/sensors',
    category: 'Sensors & IoT',
    subcategory: 'Monitoring',
    icon: Activity,
    keywords: ['sensor', 'dashboard', 'monitoring', 'iot'],
    priority: 2
  },
  {
    id: 'wireless-sensors',
    title: 'Wireless Sensors',
    description: 'Wireless sensor network management',
    href: '/sensors/wireless',
    category: 'Sensors & IoT',
    subcategory: 'Wireless',
    icon: Wifi,
    keywords: ['wireless', 'sensors', 'network', 'iot'],
    priority: 2
  },
  {
    id: 'iot-devices',
    title: 'IoT Devices',
    description: 'Internet of Things device management',
    href: '/iot-devices',
    category: 'Sensors & IoT',
    subcategory: 'Devices',
    icon: Cpu,
    keywords: ['iot', 'devices', 'internet', 'things'],
    priority: 2
  },

  // Compliance
  {
    id: 'dlc-compliance',
    title: 'DLC Compliance',
    description: 'DesignLights Consortium compliance checking',
    href: '/dlc-compliance',
    category: 'Compliance',
    subcategory: 'Lighting',
    icon: Shield,
    keywords: ['dlc', 'compliance', 'lighting', 'qualification'],
    priority: 2
  },
  {
    id: 'thd-compliance',
    title: 'THD Compliance',
    description: 'Total Harmonic Distortion compliance analysis',
    href: '/thd-compliance',
    category: 'Compliance',
    subcategory: 'Electrical',
    icon: Zap,
    keywords: ['thd', 'compliance', 'harmonic', 'distortion'],
    priority: 2
  },

  // Fixtures & Equipment
  {
    id: 'fixtures',
    title: 'Fixtures',
    description: 'Comprehensive lighting fixture database with 2000+ DLC qualified fixtures',
    href: '/fixtures',
    category: 'Fixtures',
    subcategory: 'Database',
    icon: Package,
    keywords: ['fixtures', 'lighting', 'database', 'dlc', '2000', 'qualified', 'certified'],
    priority: 2
  },
  {
    id: 'fixtures-search',
    title: 'DLC Fixture Search',
    description: 'Search and filter through 2000+ DLC qualified horticultural fixtures',
    href: '/fixtures?search=true',
    category: 'Fixtures',
    subcategory: 'Search',
    icon: Search,
    keywords: ['dlc', 'fixtures', 'search', 'filter', 'database', 'horticultural', 'certified'],
    priority: 2
  },

  // Marketplace
  {
    id: 'marketplace',
    title: 'Equipment & Fixtures',
    description: 'Equipment and fixture marketplace',
    href: '/marketplace',
    category: 'Marketplace',
    subcategory: 'Equipment',
    icon: ShoppingCart,
    keywords: ['marketplace', 'equipment', 'fixtures', 'buying'],
    priority: 2
  },
  {
    id: 'produce-board',
    title: 'Produce Board',
    description: 'Fresh produce trading marketplace',
    href: '/marketplace/produce-board',
    category: 'Marketplace',
    subcategory: 'Produce',
    icon: Leaf,
    keywords: ['produce', 'board', 'trading', 'marketplace'],
    badge: 'NEW',
    priority: 2
  },
  {
    id: 'fresh-produce',
    title: 'Fresh Produce',
    description: 'Fresh produce marketplace and trading',
    href: '/marketplace/produce',
    category: 'Marketplace',
    subcategory: 'Produce',
    icon: Leaf,
    keywords: ['fresh', 'produce', 'marketplace', 'trading'],
    priority: 2
  },

  // Settings & Support
  {
    id: 'settings',
    title: 'Settings',
    description: 'Account and application settings',
    href: '/settings',
    category: 'Settings',
    subcategory: 'Account',
    icon: Settings,
    keywords: ['settings', 'account', 'configuration', 'preferences'],
    priority: 2
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    description: 'Help documentation and support resources',
    href: '/help',
    category: 'Help & Support',
    subcategory: 'Support',
    icon: HelpCircle,
    keywords: ['help', 'support', 'documentation', 'assistance'],
    priority: 2
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'Developer API documentation and guides',
    href: '/api-docs',
    category: 'Help & Support',
    subcategory: 'Documentation',
    icon: FileText,
    keywords: ['api', 'documentation', 'developer', 'integration'],
    priority: 3
  },
  {
    id: 'about',
    title: 'About',
    description: 'About VibeLux and company information',
    href: '/about',
    category: 'Information',
    subcategory: 'Company',
    icon: Info,
    keywords: ['about', 'company', 'information', 'vibelux'],
    priority: 3
  }
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search function with fuzzy matching and relevance scoring
  const searchItems = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return searchIndex.slice(0, 10).sort((a, b) => a.priority - b.priority);
    }

    const query = searchQuery.toLowerCase();
    
    // Search in navigation/page items
    const pageResults = searchIndex.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descriptionMatch = item.description.toLowerCase().includes(query);
      const categoryMatch = item.category.toLowerCase().includes(query);
      const subcategoryMatch = item.subcategory?.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some(keyword => 
        keyword.toLowerCase().includes(query)
      );
      
      return titleMatch || descriptionMatch || categoryMatch || subcategoryMatch || keywordMatch;
    });

    // Search in DLC fixtures
    const fixtureResults: SearchItem[] = [];
    if (query.length >= 2) { // Only search fixtures for queries with 2+ characters
      const dlcMatches = searchDLCFixtures(mockDLCFixtures, query);
      dlcMatches.forEach(fixture => {
        fixtureResults.push({
          id: `fixture-${fixture.id}`,
          title: `${fixture.brand} ${fixture.productName}`,
          description: `${fixture.wattage}W, ${fixture.ppf} PPF, ${fixture.efficacy.toFixed(2)} μmol/J efficacy`,
          href: `/fixtures/${fixture.id}`,
          category: 'DLC Fixtures',
          subcategory: fixture.manufacturer,
          icon: Package,
          keywords: fixture.keywords,
          priority: 10, // Lower priority than pages
          type: 'fixture',
          fixtureData: fixture,
          badge: fixture.dlcQualified ? 'DLC' : undefined
        });
      });
    }

    // Combine results
    const allResults = [...pageResults, ...fixtureResults];

    // Sort by relevance (title match first, then description, then keywords)
    return allResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
      const aDescription = a.description.toLowerCase().includes(query) ? 1 : 0;
      const bDescription = b.description.toLowerCase().includes(query) ? 1 : 0;
      
      if (aTitle !== bTitle) return bTitle - aTitle;
      if (aDescription !== bDescription) return bDescription - aDescription;
      return a.priority - b.priority;
    });
  }, []);

  const filteredItems = searchItems(query);
  const categorizedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  const allCategories = Object.keys(categorizedItems);
  const displayItems = selectedCategory 
    ? categorizedItems[selectedCategory] || []
    : filteredItems.slice(0, 8);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl/Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelectedCategory(null);
      }
      
      if (isOpen) {
        // Navigate with arrow keys
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < displayItems.length - 1 ? prev + 1 : 0
          );
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : displayItems.length - 1
          );
        }
        
        // Select with Enter
        if (e.key === 'Enter' && displayItems[selectedIndex]) {
          e.preventDefault();
          handleItemSelect(displayItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayItems, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Auto-focus and scroll selected item into view
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, isOpen]);

  const handleItemSelect = (item: SearchItem) => {
    setIsOpen(false);
    setQuery('');
    setSelectedCategory(null);
    router.push(item.href);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedIndex(0);
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors group"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:block text-sm">Search...</span>
        <kbd className="hidden sm:block px-1.5 py-0.5 text-xs bg-gray-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative min-h-screen flex items-start justify-center pt-[10vh]">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
              {/* Search header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search features, tools, calculators..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category filters */}
              {allCategories.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        !selectedCategory 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {allCategories.slice(0, 6).map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Results */}
              <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
                {displayItems.length > 0 ? (
                  <div className="py-2">
                    {displayItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          data-index={index}
                          onClick={() => handleItemSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                            selectedIndex === index
                              ? 'bg-purple-600/20 text-white'
                              : 'text-gray-300 hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{item.title}</span>
                              {item.badge && (
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  item.badge === 'DLC' 
                                    ? 'bg-green-600/20 text-green-300' 
                                    : 'bg-purple-600/20 text-purple-300'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{item.description}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {item.category}
                              {item.subcategory && ` • ${item.subcategory}`}
                              {item.type === 'fixture' && item.fixtureData && (
                                <span className="ml-2 text-blue-400">
                                  Model: {item.fixtureData.modelNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    {query ? `No results found for "${query}"` : 'Start typing to search...'}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↵</kbd>
                    to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">esc</kbd>
                    to close
                  </span>
                </div>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">⌘K</kbd>
                  to search
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}