'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Grid3X3,
  X,
  Search,
  Star,
  Clock,
  ArrowRight,
  // Module Icons
  LayoutDashboard,
  Activity,
  BarChart3,
  Leaf,
  Building,
  Lightbulb,
  Droplets,
  Calculator,
  FileText,
  Users,
  ShoppingCart,
  Settings,
  Brain,
  Eye,
  Zap,
  Shield,
  Beaker,
  Package,
  TrendingUp,
  Briefcase,
  HeartHandshake,
  Globe,
  Microscope,
  Cpu,
  Wrench,
  DollarSign,
  Calendar,
  Map,
  Database,
  Bell,
  HelpCircle,
  BookOpen,
  Award,
  Layers,
  Wind,
  Thermometer,
  Factory,
  Gauge,
  LineChart,
  PieChart,
  Target,
  Workflow,
  GitBranch,
  Palette,
  Code,
  UserCheck,
  CreditCard,
  Mail,
  Lock,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Truck,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: any;
  category: 'core' | 'cultivation' | 'analytics' | 'operations' | 'marketplace' | 'tools' | 'admin' | 'settings';
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
  isEnterprise?: boolean;
}

const modules: Module[] = [
  // Core Features
  { id: 'dashboard', name: 'Dashboard', description: 'Main control center', href: '/dashboard', icon: LayoutDashboard, category: 'core' },
  { id: 'facilities', name: 'Facilities', description: 'Manage multiple locations', href: '/facilities', icon: Building, category: 'core' },
  { id: 'monitoring', name: 'Monitoring', description: 'Real-time environmental data', href: '/monitoring', icon: Activity, category: 'core' },
  { id: 'analytics', name: 'Analytics', description: 'Advanced data analysis', href: '/analytics', icon: BarChart3, category: 'core' },
  
  // Cultivation
  { id: 'cultivation', name: 'Cultivation Control', description: 'Grow management system', href: '/cultivation', icon: Leaf, category: 'cultivation' },
  { id: 'recipes', name: 'Light Recipes', description: 'Lighting programs', href: '/light-recipes', icon: Lightbulb, category: 'cultivation' },
  { id: 'plant-monitoring', name: 'Plant Monitoring', description: 'Advanced sensors & AI', href: '/plant-monitoring', icon: Eye, category: 'cultivation', isNew: true },
  { id: 'crop-steering', name: 'Crop Steering', description: 'Growth optimization', href: '/cultivation/crop-steering', icon: Target, category: 'cultivation' },
  { id: 'nutrient', name: 'Nutrient Dosing', description: 'Fertigation control', href: '/nutrient-dosing', icon: Droplets, category: 'cultivation' },
  { id: 'ipm', name: 'IPM', description: 'Pest management', href: '/ipm', icon: Shield, category: 'cultivation' },
  
  // Analytics & Research
  { id: 'yield-prediction', name: 'Yield Prediction', description: 'AI-powered forecasting', href: '/yield-prediction', icon: TrendingUp, category: 'analytics' },
  { id: 'functional-food', name: 'Functional Food', description: 'Nutrition research', href: '/analytics', icon: Beaker, category: 'analytics' },
  { id: 'research', name: 'Research Lab', description: 'Experiment design', href: '/research', icon: Microscope, category: 'analytics' },
  { id: 'benchmarks', name: 'Benchmarks', description: 'Industry comparison', href: '/benchmarks', icon: Award, category: 'analytics' },
  
  // Operations
  { id: 'automation', name: 'Automation', description: 'Workflow automation', href: '/automation', icon: Workflow, category: 'operations' },
  { id: 'maintenance', name: 'Maintenance', description: 'Equipment tracking', href: '/maintenance', icon: Wrench, category: 'operations' },
  { id: 'compliance', name: 'Compliance', description: 'Regulatory tracking', href: '/compliance', icon: FileCheck, category: 'operations' },
  { id: 'workforce', name: 'Workforce', description: 'Team management', href: '/workforce', icon: Users, category: 'operations' },
  { id: 'inventory', name: 'Inventory', description: 'Stock management', href: '/operations/inventory', icon: Package, category: 'operations' },
  { id: 'tasks', name: 'Task Management', description: 'Team coordination', href: '/operations/tasks', icon: ClipboardCheck, category: 'operations' },
  
  // Marketplace & Services
  { id: 'marketplace', name: 'Marketplace', description: 'Equipment & services', href: '/marketplace', icon: ShoppingCart, category: 'marketplace' },
  { id: 'experts', name: 'Expert Network', description: 'Professional consultants', href: '/experts', icon: HeartHandshake, category: 'marketplace' },
  { id: 'equipment', name: 'Equipment Board', description: 'Buy & sell equipment', href: '/equipment', icon: Factory, category: 'marketplace' },
  { id: 'investment', name: 'Investment Portal', description: 'Funding opportunities', href: '/investment', icon: Briefcase, category: 'marketplace' },
  
  // Tools & Calculators
  { id: 'calculators', name: 'Calculators', description: 'Scientific tools', href: '/calculators', icon: Calculator, category: 'tools' },
  { id: 'design', name: 'Facility Design', description: '3D design tools', href: '/design', icon: Palette, category: 'tools', isPro: true },
  { id: 'energy', name: 'Energy Management', description: 'Optimization tools', href: '/energy', icon: Zap, category: 'tools' },
  { id: 'reports', name: 'Reports', description: 'Professional reporting', href: '/reports', icon: FileText, category: 'tools' },
  { id: 'api', name: 'Developer API', description: 'Integration tools', href: '/developer', icon: Code, category: 'tools' },
  
  // Admin & Settings
  { id: 'admin', name: 'Admin Panel', description: 'System administration', href: '/admin', icon: Lock, category: 'admin', isEnterprise: true },
  { id: 'settings', name: 'Settings', description: 'Account settings', href: '/settings', icon: Settings, category: 'settings' },
  { id: 'billing', name: 'Billing', description: 'Subscription & payments', href: '/billing-dashboard', icon: CreditCard, category: 'settings' },
  { id: 'team', name: 'Team', description: 'User management', href: '/settings', icon: UserCheck, category: 'settings' },
];

const categoryLabels = {
  core: 'Core Features',
  cultivation: 'Cultivation',
  analytics: 'Analytics & Research',
  operations: 'Operations',
  marketplace: 'Marketplace & Services',
  tools: 'Tools & Calculators',
  admin: 'Administration',
  settings: 'Account & Settings'
};

export function ModuleNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentModules, setRecentModules] = useState<string[]>([]);
  const pathname = usePathname();

  // Load favorites and recent modules from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('module-favorites');
    const savedRecent = localStorage.getItem('module-recent');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentModules(JSON.parse(savedRecent));
  }, []);

  // Track current module visit
  useEffect(() => {
    const currentModule = modules.find(m => pathname.startsWith(m.href));
    if (currentModule && !recentModules.includes(currentModule.id)) {
      const newRecent = [currentModule.id, ...recentModules.slice(0, 4)];
      setRecentModules(newRecent);
      localStorage.setItem('module-recent', JSON.stringify(newRecent));
    }
  }, [pathname]);

  const toggleFavorite = (moduleId: string) => {
    const newFavorites = favorites.includes(moduleId)
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    setFavorites(newFavorites);
    localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentModule = modules.find(m => pathname.startsWith(m.href));

  return (
    <>
      {/* Module Switcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors group"
      >
        <Grid3X3 className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">
          {currentModule ? currentModule.name : 'Modules'}
        </span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Module Navigator Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative bg-gray-900 rounded-2xl w-full max-w-6xl mt-12 border border-gray-800 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">VibeLux Modules</h2>
                  <p className="text-gray-400 mt-1">Quick access to all platform features</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Favorites */}
                {favorites.length > 0 && !searchQuery && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Favorites
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {favorites.map(favId => {
                        const module = modules.find(m => m.id === favId);
                        if (!module) return null;
                        const Icon = module.icon;
                        
                        return (
                          <Link
                            key={module.id}
                            href={module.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                          >
                            <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                              <Icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                {module.name}
                              </h4>
                              <p className="text-sm text-gray-400">{module.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent */}
                {recentModules.length > 0 && !searchQuery && !favorites.length && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recentModules.slice(0, 6).map(recentId => {
                        const module = modules.find(m => m.id === recentId);
                        if (!module) return null;
                        const Icon = module.icon;
                        
                        return (
                          <Link
                            key={module.id}
                            href={module.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                          >
                            <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                              <Icon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                {module.name}
                              </h4>
                              <p className="text-sm text-gray-400">{module.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Modules by Category */}
                {Object.entries(categoryLabels).map(([category, label]) => {
                  const categoryModules = filteredModules.filter(m => m.category === category);
                  
                  if (categoryModules.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {label}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryModules.map(module => {
                          const Icon = module.icon;
                          const isFavorite = favorites.includes(module.id);
                          
                          return (
                            <div
                              key={module.id}
                              className="relative flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                            >
                              <Link
                                href={module.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 flex-1"
                              >
                                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                                  <Icon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                      {module.name}
                                    </h4>
                                    {module.isNew && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-green-600/20 text-green-400 rounded">
                                        NEW
                                      </span>
                                    )}
                                    {module.isPro && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-600/20 text-purple-400 rounded">
                                        PRO
                                      </span>
                                    )}
                                    {module.isEnterprise && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-600/20 text-blue-400 rounded">
                                        ENTERPRISE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-400">{module.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                              </Link>
                              
                              {/* Favorite Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(module.id);
                                }}
                                className="absolute top-2 right-2 p-1 hover:bg-gray-600 rounded transition-colors"
                              >
                                <Star 
                                  className={`w-4 h-4 ${
                                    isFavorite 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-500 hover:text-gray-400'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-800 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <HelpCircle className="w-4 h-4" />
                      Help
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <BookOpen className="w-4 h-4" />
                      Docs
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <Info className="w-4 h-4" />
                      What's New
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd> to open anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}