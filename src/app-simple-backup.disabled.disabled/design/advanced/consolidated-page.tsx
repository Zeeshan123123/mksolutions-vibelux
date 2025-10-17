'use client';

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef, useReducer } from 'react';
import { useAuth } from '@clerk/nextjs';
import { logger } from '@/lib/client-logger';
import { useDebounce } from '@/hooks/use-debounce';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@/components/ui/use-toast';

// Import access control
import { TierGate, InlineTierGate, TierTabTrigger } from '@/components/access/TierGate';
import { hasFeatureAccess, canUseCredits, type TierLevel } from '@/lib/access-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  BarChart3,
  Leaf,
  Settings,
  Brain,
  FolderOpen,
  Save,
  Share2,
  Download,
  HelpCircle,
  Keyboard,
  Eye,
  EyeOff,
  Grid,
  Sparkles,
  Undo,
  Redo,
  Menu,
  ChevronDown,
  FileText,
  Edit,
  Copy,
  Trash2,
  Plus,
  DollarSign,
  Thermometer,
  Activity,
  TrendingUp,
  Calendar,
  Flame,
  Calculator,
  Droplets,
  AlertTriangle,
  Layers,
  Package,
  LayoutGrid
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Lazy load heavy components
const AdvancedDesignerProfessional = lazy(() => import('@/components/designer/AdvancedDesignerProfessional').then(module => ({ default: module.AdvancedDesignerProfessional })));
const SimpleDesigner = lazy(() => import('@/components/designer/SimpleDesigner').then(module => ({ default: module.SimpleDesigner })));
const DesignOnboarding = lazy(() => import('@/components/designer/DesignOnboarding').then(module => ({ default: module.DesignOnboarding })));

// Analysis components - grouped by category
const HeatMapCanvas = lazy(() => import('@/components/HeatMapCanvas').then(module => ({ default: module.HeatMapCanvas })));
const MetricsPanel = lazy(() => import('@/components/MetricsPanel').then(module => ({ default: module.MetricsPanel })));
const SpectrumAnalysisPanel = lazy(() => import('@/components/SpectrumAnalysisPanel').then(module => ({ default: module.SpectrumAnalysisPanel })));
const DLIOptimizerPanel = lazy(() => import('@/components/DLIOptimizerPanel').then(module => ({ default: module.DLIOptimizerPanel })));
const EnergyCostCalculator = lazy(() => import('@/components/EnergyCostCalculator').then(module => ({ default: module.EnergyCostCalculator })));
const EnvironmentalMonitor = lazy(() => import('@/components/EnvironmentalMonitor').then(module => ({ default: module.EnvironmentalMonitor })));
const CropYieldPredictor = lazy(() => import('@/components/CropYieldPredictor').then(module => ({ default: module.CropYieldPredictor })));
const LightingScheduler = lazy(() => import('@/components/LightingScheduler').then(module => ({ default: module.LightingScheduler })));
const HeatLoadCalculator = lazy(() => import('@/components/HeatLoadCalculator').then(module => ({ default: module.HeatLoadCalculator })));
const ElectricalLoadBalancer = lazy(() => import('@/components/ElectricalLoadBalancer').then(module => ({ default: module.ElectricalLoadBalancer })));

// Combined modal components
const ProjectManagementModal = lazy(() => import('@/components/designer/ProjectManagementModal'));
const FinancialAnalysisModal = lazy(() => import('@/components/designer/FinancialAnalysisModal'));
const HelpAssistanceModal = lazy(() => import('@/components/designer/HelpAssistanceModal'));

// Performance and debugging components
const PerformanceMonitor = lazy(() => import('@/components/designer/PerformanceMonitor').then(module => ({ default: module.PerformanceMonitor })));

import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary';
import { CollapsibleSidebar, type SidebarSection } from '@/components/CollapsibleSidebar';
import { ErrorBoundaryAdvanced } from '@/components/designer/ErrorBoundaryAdvanced';
import { usePerformanceTracking } from '@/hooks/use-performance-tracking';
import { designDebugger } from '@/lib/design-debugger';
import {
  generateOptimalLayout,
  calculatePowerMetrics,
  exportDesign,
  type LightSource
} from '@/lib/lighting-design';
import {
  calculateDetailedHeatmap,
  calculatePPFD,
  calculateDLI,
  generateSpectrumData,
  optimizeLightPlacement,
  type HeatmapPoint,
  type SpectrumDataPoint
} from '@/lib/heatmap-calculations';

// Types
interface DesignConfig {
  spaceType: 'indoor' | 'greenhouse' | 'aquaculture';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  unit: 'feet' | 'meters';
  includeCAD: boolean;
}

interface Room {
  dimensions: { length: number; width: number; height: number };
  unit: 'feet' | 'meters';
}

interface Fixture {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  model: FixtureModel;
}

interface Project {
  id: string;
  name: string;
  room: Room;
  fixtures: Fixture[];
  config: DesignConfig;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

type AnalysisTab = 'design' | 'light' | 'energy' | 'environment' | 'automation';

// Simplified state management
interface DesignState {
  room: Room;
  fixtures: Fixture[];
  history: {
    past: { room: Room; fixtures: Fixture[] }[];
    future: { room: Room; fixtures: Fixture[] }[];
  };
}

const initialDesignState: DesignState = {
  room: {
    dimensions: { length: 40, width: 20, height: 10 },
    unit: 'feet'
  },
  fixtures: [],
  history: {
    past: [],
    future: []
  }
};

// Loading component
const ComponentLoader = React.memo(() => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white flex items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      Loading design tools...
    </div>
  </div>
));

ComponentLoader.displayName = 'ComponentLoader';

export default function ConsolidatedAdvancedDesignerPage() {
  const { isLoaded, userId } = useAuth();
  
  // Performance tracking
  const { measurePerformance, getMetrics } = usePerformanceTracking({
    componentName: 'AdvancedDesigner',
    warnThreshold: 16,
    errorThreshold: 100,
    onSlowRender: (duration) => {
      designDebugger.warn('Slow render detected', { duration }, 'AdvancedDesigner');
    },
    onError: (error) => {
      designDebugger.error('Component error', { error: error.message }, 'AdvancedDesigner');
    }
  });
  
  // Core state
  const [designState, setDesignState] = useState<DesignState>(initialDesignState);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('design');
  const [designConfig, setDesignConfig] = useState<DesignConfig | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // UI state
  const [gridEnabled, setGridEnabled] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [useSimpleDesigner, setUseSimpleDesigner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Modal state - consolidated
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState<'templates' | 'export' | 'share'>('templates');
  const [financialModalTab, setFinancialModalTab] = useState<'cost' | 'roi'>('cost');
  
  // Analysis data with memoization
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [spectrumData, setSpectrumData] = useState<SpectrumDataPoint[]>([]);
  const [powerMetrics, setPowerMetrics] = useState<any>(null);
  
  // Project management
  const [currentProject, setCurrentProject] = useLocalStorage<Project | null>('vibelux_current_project', null);
  const [projects, setProjects] = useLocalStorage<Project[]>('vibelux_projects', []);
  
  // Credits for AI
  const [userCredits, setUserCredits] = useState(120);
  
  // Tier and access control
  const [subscriptionTier, setSubscriptionTier] = useState<TierLevel>('free');
  const [userModules, setUserModules] = useState<string[]>([]);
  
  // Refs for performance
  const calculationCache = useRef(new Map());
  const workerRef = useRef<Worker | null>(null);
  
  // Debounced values
  const debouncedFixtures = useDebounce(designState.fixtures, 300);
  const debouncedRoom = useDebounce(designState.room, 300);
  
  // Computed values
  const canUndo = designState.history.past.length > 0;
  const canRedo = designState.history.future.length > 0;

  // Tab configuration with tier access
  const tabConfig = [
    {
      value: 'design',
      label: 'Design & Layout',
      icon: Layers,
      feature: 'design.basic' as const,
    },
    {
      value: 'light',
      label: 'Light Analysis',
      icon: Activity,
      feature: 'design.basic' as const,
    },
    {
      value: 'energy',
      label: 'Energy & Costs',
      icon: Zap,
      feature: 'design.advanced' as const,
    },
    {
      value: 'environment',
      label: 'Environmental',
      icon: Leaf,
      feature: 'design.advanced' as const,
    },
    {
      value: 'automation',
      label: 'Automation',
      icon: Settings,
      feature: 'design.automation' as const,
    }
  ];

  // Initialize user tier and modules
  useEffect(() => {
    if (isLoaded && userId) {
      // This would typically come from your auth context or API
      setSubscriptionTier('professional'); // Placeholder - professional for demo
      setUserModules(['environmental-monitoring', 'advanced-analytics']); // Placeholder modules
    }
  }, [isLoaded, userId]);

  // Skip onboarding if user has existing projects
  useEffect(() => {
    if (isLoaded && userId) {
      const hasExistingProjects = projects.length > 0 || currentProject !== null;
      if (hasExistingProjects) {
        setShowOnboarding(false);
      }
    }
  }, [isLoaded, userId, projects, currentProject]);

  // Initialize web worker
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker) {
      workerRef.current = new Worker('/workers/lighting-calculator.js');
      workerRef.current.onmessage = (e) => {
        const { type, data } = e.data;
        switch (type) {
          case 'heatmap':
            setHeatmapData(data);
            break;
          case 'spectrum':
            setSpectrumData(data);
            break;
          case 'metrics':
            setPowerMetrics(data);
            break;
        }
      };
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Memoized calculations - wrapped with error handling
  const updateCalculations = useCallback(() => {
    designDebugger.startMeasure('updateCalculations');
    
    try {
      const cacheKey = JSON.stringify({ fixtures: debouncedFixtures, room: debouncedRoom });
      
      if (calculationCache.current.has(cacheKey)) {
        const cached = calculationCache.current.get(cacheKey);
        setHeatmapData(cached.heatmap);
        setPowerMetrics(cached.metrics);
        setSpectrumData(cached.spectrum);
        designDebugger.endMeasure('updateCalculations', { source: 'cache' });
        return;
      }

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'calculate',
          data: { fixtures: debouncedFixtures, room: debouncedRoom }
        });
        designDebugger.endMeasure('updateCalculations', { source: 'worker' });
      } else {
        // Fallback calculation - create LightSource for lighting-design
        const lightDesignSources: LightSource[] = debouncedFixtures.map(f => ({
          position: { x: f.position.x, y: f.position.y },
          ppf: f.model.ppf || 0,
          beamAngle: f.model.beamAngle || 120,
          height: f.position.z,
          enabled: true,
          fixture: f.model.dlcData
        }));

        // Convert to heatmap LightSource format
        const heatmapSources = debouncedFixtures.map(f => ({
          id: f.id,
          x: f.position.x,
          y: f.position.y,
          type: f.model.category,
          power: f.model.wattage,
          ppfd: f.model.ppf || 0,
          efficiency: f.model.efficacy || 2.8,
          spectrum: {
            red: f.model.spectrumData?.red || 25,
            blue: f.model.spectrumData?.blue || 25,
            green: f.model.spectrumData?.green || 25,
            farRed: f.model.spectrumData?.farRed || 25,
            uv: 0
          }
        }));

        const heatmap = calculateDetailedHeatmap(
          heatmapSources,
          debouncedRoom.dimensions.length,
          debouncedRoom.dimensions.width
        );
        
        const metrics = calculatePowerMetrics(
          debouncedFixtures.map(f => ({ wattage: f.model.wattage, enabled: true })),
          debouncedRoom.dimensions.length * debouncedRoom.dimensions.width,
          12, // default hours per day
          0.12 // default electricity rate
        );
        const spectrum = generateSpectrumData(heatmapSources);

        calculationCache.current.set(cacheKey, { heatmap, metrics, spectrum });
        
        if (calculationCache.current.size > 50) {
          const firstKey = calculationCache.current.keys().next().value;
          calculationCache.current.delete(firstKey);
        }

        setHeatmapData(heatmap);
        setPowerMetrics(metrics);
        setSpectrumData(spectrum);
        
        designDebugger.endMeasure('updateCalculations', { source: 'fallback' });
      }
    } catch (error) {
      logger.error('system', 'Failed to update calculations:', error);
      designDebugger.error('Calculation failed', { error: error.message }, 'Calculations');
      designDebugger.endMeasure('updateCalculations', { error: true });
      
      // Show user-friendly error
      toast({
        title: 'Calculation Error',
        description: 'Unable to update lighting calculations. Please try refreshing the page.',
        variant: 'destructive'
      });
    }
  }, [debouncedFixtures, debouncedRoom]);

  useEffect(() => {
    if (debouncedFixtures.length > 0) {
      updateCalculations();
    }
  }, [debouncedFixtures, debouncedRoom, updateCalculations]);

  // History management
  const pushHistory = useCallback(() => {
    setDesignState(prev => ({
      ...prev,
      history: {
        past: [...prev.history.past, { room: prev.room, fixtures: prev.fixtures }],
        future: []
      }
    }));
  }, []);

  const undo = useCallback(() => {
    setDesignState(prev => {
      if (prev.history.past.length === 0) return prev;
      const newPast = [...prev.history.past];
      const previousState = newPast.pop()!;
      return {
        ...previousState,
        history: {
          past: newPast,
          future: [{ room: prev.room, fixtures: prev.fixtures }, ...prev.history.future]
        }
      };
    });
  }, []);

  const redo = useCallback(() => {
    setDesignState(prev => {
      if (prev.history.future.length === 0) return prev;
      const newFuture = [...prev.history.future];
      const nextState = newFuture.shift()!;
      return {
        ...nextState,
        history: {
          past: [...prev.history.past, { room: prev.room, fixtures: prev.fixtures }],
          future: newFuture
        }
      };
    });
  }, []);

  // Keyboard shortcuts
  useHotkeys('ctrl+z, cmd+z', () => canUndo && undo(), [canUndo]);
  useHotkeys('ctrl+shift+z, cmd+shift+z', () => canRedo && redo(), [canRedo]);
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleSaveProject();
  });
  useHotkeys('?', () => {
    setShowHelpModal(true);
  });
  useHotkeys('ctrl+shift+d, cmd+shift+d', () => {
    designDebugger.enable();
    toast({ title: 'Debug Mode Enabled', description: 'Press Ctrl+Shift+D to open debug panel' });
  });
  useHotkeys('ctrl+shift+p, cmd+shift+p', () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  });

  // Handlers - wrapped with performance tracking
  const handleFixtureAdd = useCallback(measurePerformance((model: FixtureModel) => {
    designDebugger.action('Add Fixture', { model: model.model }, 'FixtureLibrary');
    pushHistory();
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      position: { 
        x: designState.room.dimensions.length / 2, 
        y: designState.room.dimensions.width / 2, 
        z: designState.room.dimensions.height - 2 
      },
      rotation: 0,
      model
    };
    setDesignState(prev => ({
      ...prev,
      fixtures: [...prev.fixtures, newFixture]
    }));
    toast({
      title: 'Fixture Added',
      description: `${model.model} has been added to your design.`
    });
  }, 'handleFixtureAdd'), [designState.room, pushHistory, measurePerformance]);

  const handleFixtureRemove = useCallback((id: string) => {
    pushHistory();
    setDesignState(prev => ({
      ...prev,
      fixtures: prev.fixtures.filter(f => f.id !== id)
    }));
    if (selectedFixture?.id === id) {
      setSelectedFixture(null);
    }
  }, [selectedFixture, pushHistory]);

  const handleFixtureUpdate = useCallback((id: string, updates: Partial<Fixture>) => {
    pushHistory();
    setDesignState(prev => ({
      ...prev,
      fixtures: prev.fixtures.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  }, [pushHistory]);

  const handleAutoLayout = useCallback(() => {
    if (designState.fixtures.length === 0) {
      toast({
        title: 'No Fixtures',
        description: 'Add fixtures before using auto-layout.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      pushHistory();
      const optimized = generateOptimalLayout(
        { width: designState.room.dimensions.width, height: designState.room.dimensions.length },
        700, // targetPPFD
        { ppf: designState.fixtures[0].model.ppf, coverage: designState.fixtures[0].model.coverage }
      );
      
      const newFixtures = optimized.map((pos, idx) => ({
        id: `fixture-${Date.now()}-${idx}`,
        position: { x: pos.x, y: pos.y, z: designState.room.dimensions.height - 2 },
        rotation: 0,
        model: designState.fixtures[0].model
      }));
      
      setDesignState(prev => ({
        ...prev,
        fixtures: newFixtures
      }));
      
      toast({
        title: 'Auto Layout Complete',
        description: `Optimized layout with ${newFixtures.length} fixtures.`
      });
    } catch (error) {
      logger.error('system', 'Auto layout failed', error);
      toast({
        title: 'Auto Layout Failed',
        description: 'Could not generate optimal layout.',
        variant: 'destructive'
      });
    }
  }, [designState.fixtures, designState.room, pushHistory]);

  const handleSaveProject = useCallback(async () => {
    try {
      const project: Project = currentProject || {
        id: `project-${Date.now()}`,
        name: `Design ${new Date().toLocaleDateString()}`,
        room: designState.room,
        fixtures: designState.fixtures,
        config: designConfig || {
          spaceType: 'indoor',
          dimensions: designState.room.dimensions,
          unit: designState.room.unit,
          includeCAD: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      if (currentProject) {
        project.updatedAt = new Date();
        project.version += 1;
      }

      setCurrentProject(project);
      if (!projects.find(p => p.id === project.id)) {
        setProjects([...projects, project]);
      } else {
        setProjects(projects.map(p => p.id === project.id ? project : p));
      }

      setLastSaved(new Date());
      toast({
        title: 'Project Saved',
        description: 'Your design has been saved successfully.'
      });
    } catch (error) {
      logger.error('system', 'Save failed', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save your project.',
        variant: 'destructive'
      });
    }
  }, [currentProject, designState, designConfig, projects]);

  // Simplified sidebar with 4 sections
  const sidebarSections: SidebarSection[] = [
    {
      id: 'design-tools',
      title: 'Design Tools',
      icon: <Package className="w-4 h-4" />,
      category: 'advanced' as const,
      component: (
        <div className="space-y-4">
          <FixtureLibrary
            onSelectFixture={handleFixtureAdd}
            compact={true}
          />
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleAutoLayout}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Auto Layout
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      title: 'Analysis & Optimization',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'analysis' as const,
      component: (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-2">
            Analysis tools are available in the main tabs above
          </p>
          <Badge variant="secondary" className="w-full justify-center">
            {designState.fixtures.length} fixtures placed
          </Badge>
          {powerMetrics && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Power:</span>
                <span>{powerMetrics.totalPower}W</span>
              </div>
              <div className="flex justify-between">
                <span>Avg PPFD:</span>
                <span>{powerMetrics.avgPPFD} μmol/m²/s</span>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'project',
      title: 'Project Management',
      icon: <FolderOpen className="w-4 h-4" />,
      category: 'advanced' as const,
      component: (
        <div className="space-y-2">
          <Button
            onClick={() => {
              setProjectModalTab('templates');
              setShowProjectModal(true);
            }}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={handleSaveProject}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
          <Button
            onClick={() => {
              setProjectModalTab('export');
              setShowProjectModal(true);
            }}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              setProjectModalTab('share');
              setShowProjectModal(true);
            }}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      )
    },
    {
      id: 'help',
      title: 'Help & AI',
      icon: <Brain className="w-4 h-4" />,
      category: 'advanced' as const,
      component: (
        <div className="space-y-2">
          <Button
            onClick={() => setShowHelpModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <div className="text-xs text-gray-400 text-center">
            Credits: {userCredits}
          </div>
          <Button
            onClick={() => setShowHelpModal(true)}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Shortcuts
          </Button>
          <Button
            onClick={() => setShowHelpModal(true)}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
        </div>
      )
    }
  ];

  // Show onboarding
  if (showOnboarding && !designConfig) {
    return (
      <ErrorBoundaryAdvanced level="page">
        <Suspense fallback={<ComponentLoader />}>
          <DesignOnboarding
            onComplete={(config) => {
              setDesignConfig(config);
              setShowOnboarding(false);
              setDesignState(prev => ({
                ...prev,
                room: {
                  dimensions: config.dimensions,
                  unit: config.unit
                }
              }));
            }}
            onCADImport={() => {
              // Handle CAD import functionality
              setShowOnboarding(false);
            }}
          />
        </Suspense>
      </ErrorBoundaryAdvanced>
    );
  }

  const DesignerComponent = useSimpleDesigner ? SimpleDesigner : AdvancedDesignerProfessional;

  return (
    <ErrorBoundaryAdvanced level="page" resetKeys={[designState.fixtures.length]}>
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Sidebar */}
        <CollapsibleSidebar
          sections={sidebarSections}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Simplified with dropdowns */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Advanced Lighting Designer</h1>
                <button
                  onClick={() => setUseSimpleDesigner(!useSimpleDesigner)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  {useSimpleDesigner ? 'Advanced Mode' : 'Simple Mode'}
                </button>
                {lastSaved && (
                  <span className="text-xs text-gray-400">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* File Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      File <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => window.location.reload()}>
                      <Plus className="w-4 h-4 mr-2" /> New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.getElementById('file-input')?.click()}>
                      <FolderOpen className="w-4 h-4 mr-2" /> Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveProject}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setProjectModalTab('export');
                      setShowProjectModal(true);
                    }}>
                      <Download className="w-4 h-4 mr-2" /> Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Edit Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Edit <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                      <Undo className="w-4 h-4 mr-2" /> Undo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={redo} disabled={!canRedo}>
                      <Redo className="w-4 h-4 mr-2" /> Redo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => selectedFixture && handleFixtureRemove(selectedFixture.id)}
                      disabled={!selectedFixture}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      View <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowMetrics(!showMetrics)}>
                      {showMetrics ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showMetrics ? 'Hide' : 'Show'} Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGridEnabled(!gridEnabled)}>
                      <Grid className="w-4 h-4 mr-2" />
                      {gridEnabled ? 'Hide' : 'Show'} Grid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-gray-700 mx-1" />

                {/* Quick Actions */}
                <Button
                  onClick={handleAutoLayout}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto Layout
                </Button>

                <Button
                  onClick={() => {
                    setProjectModalTab('share');
                    setShowProjectModal(true);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                <div className="w-px h-6 bg-gray-700 mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowHelpModal(true)}>
                      <Keyboard className="w-4 h-4 mr-2" /> Keyboard Shortcuts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPerformanceMonitor(true)}>
                      <Activity className="w-4 h-4 mr-2" /> Performance Monitor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => designDebugger.enable()}>
                      <AlertTriangle className="w-4 h-4 mr-2" /> Enable Debug Mode
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Tabs Area */}
          <div className="flex-1 relative">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalysisTab)} className="h-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800 rounded-none border-b border-gray-700">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  const hasAccess = hasFeatureAccess(tab.feature, subscriptionTier);
                  
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      disabled={!hasAccess}
                      className="flex items-center gap-2 relative disabled:opacity-50"
                    >
                      <TierTabTrigger
                        value={tab.value}
                        feature={tab.feature as any}
                        userTier={subscriptionTier}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </div>
                      </TierTabTrigger>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Design & Layout Tab */}
              <TabsContent value="design" className="h-full mt-0">
                <Suspense fallback={<ComponentLoader />}>
                  <DesignerComponent
                    initialSpaceType={designConfig?.spaceType}
                    initialDimensions={designConfig?.dimensions}
                    initialUnit={designConfig?.unit}
                  />
                  {showMetrics && powerMetrics && (
                    <MetricsPanel
                      fixtureCount={designState.fixtures.length}
                      totalPower={powerMetrics.totalPower}
                      averagePPFD={powerMetrics.avgPPFD}
                      uniformity={powerMetrics.uniformity || 0}
                      coverage={powerMetrics.coverage || 0}
                      roomArea={designState.room.dimensions.width * designState.room.dimensions.length}
                      targetPPFD={400}
                      powerCost={{
                        daily: powerMetrics.dailyCost || 0,
                        monthly: powerMetrics.monthlyCost || 0,
                        yearly: powerMetrics.yearlyCost || 0
                      }}
                    />
                  )}
                </Suspense>
              </TabsContent>

              {/* Light Analysis Tab */}
              <TabsContent value="light" className="h-full mt-0">
                <div className="h-full bg-gray-850 p-4">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Thermometer className="w-5 h-5" />
                          Heat Map
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading heat map...</div>}>
                          <HeatMapCanvas
                            width={designState.room.dimensions.width}
                            height={designState.room.dimensions.length}
                            fixtures={designState.fixtures.map(f => ({
                              id: f.id,
                              x: f.position.x,
                              y: f.position.y,
                              rotation: f.rotation,
                              model: f.model,
                              enabled: true
                            }))}
                            grid={heatmapData.map(point => ({
                              position: { x: point.x, y: point.y },
                              ppfd: point.ppfd,
                              dli: point.dli
                            }))}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Spectrum Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading spectrum...</div>}>
                          <SpectrumAnalysisPanel
                            fixtures={designState.fixtures.map(f => ({
                              id: f.id,
                              brand: f.model.brand,
                              model: f.model.model,
                              wattage: f.model.wattage,
                              ppf: f.model.ppf,
                              spectrumData: f.model.spectrumData
                            }))}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          DLI Optimizer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading DLI...</div>}>
                          <DLIOptimizerPanel
                            currentPPFD={powerMetrics?.avgPPFD || 400}
                            photoperiod={16}
                            selectedCrop="Lettuce"
                            growthStage="vegetative"
                            onOptimizationChange={(optimization) => {
                              console.log('DLI Optimization:', optimization);
                            }}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Energy & Costs Tab */}
              <TabsContent value="energy" className="h-full mt-0">
                <TierGate
                  feature={"design.advanced" as any}
                  userTier={subscriptionTier}
                  userModules={userModules}
                >
                  <div className="h-full bg-gray-850 p-4">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Energy Usage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading energy data...</div>}>
                          <EnergyCostCalculator
                            fixtures={designState.fixtures.map(f => ({
                              wattage: f.model.wattage,
                              enabled: true
                            }))}
                            photoperiod={16}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Electrical Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading electrical data...</div>}>
                          <ElectricalLoadBalancer
                            fixtures={designState.fixtures.map(f => ({
                              id: f.id,
                              wattage: f.model.wattage,
                              voltage: f.model.voltage ? parseInt(f.model.voltage.split('-')[0]) : 120,
                              enabled: true
                            }))}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      onClick={() => {
                        setFinancialModalTab('cost');
                        setShowFinancialModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Cost Estimator
                    </Button>
                    <Button
                      onClick={() => {
                        setFinancialModalTab('roi');
                        setShowFinancialModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      ROI Calculator
                    </Button>
                  </div>
                </div>
                </TierGate>
              </TabsContent>

              {/* Environmental Tab */}
              <TabsContent value="environment" className="h-full mt-0">
                <TierGate
                  feature={"design.advanced" as any}
                  userTier={subscriptionTier}
                  userModules={userModules}
                >
                  <div className="h-full bg-gray-850 p-4">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Droplets className="w-5 h-5" />
                          Environmental Monitor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading environmental data...</div>}>
                          <EnvironmentalMonitor />
                        </Suspense>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Flame className="w-5 h-5" />
                          Heat Load
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading heat load...</div>}>
                          <HeatLoadCalculator
                            roomDimensions={{
                              width: designState.room.dimensions.width,
                              height: designState.room.dimensions.length,
                              depth: designState.room.dimensions.height
                            }}
                            fixtures={designState.fixtures.map(f => ({
                              wattage: f.model.wattage,
                              enabled: true
                            }))}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-gray-700 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Leaf className="w-5 h-5" />
                          Yield Predictor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-5rem)]">
                        <Suspense fallback={<div>Loading yield data...</div>}>
                          <CropYieldPredictor
                            averagePPFD={powerMetrics?.avgPPFD || 400}
                            photoperiod={16}
                            temperature={72}
                            humidity={55}
                            co2={1200}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                </TierGate>
              </TabsContent>

              {/* Automation Tab */}
              <TabsContent value="automation" className="h-full mt-0">
                <TierGate
                  feature={"design.automation" as any}
                  userTier={subscriptionTier}
                  userModules={userModules}
                >
                  <div className="h-full bg-gray-850 p-4">
                  <Card className="border-gray-700 bg-gray-800 max-w-4xl mx-auto">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Lighting Schedule
                      </CardTitle>
                      <CardDescription>
                        Configure automated lighting schedules for your grow operation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div>Loading scheduler...</div>}>
                        <LightingScheduler
                          fixtures={designState.fixtures}
                          onScheduleUpdate={(schedule) => {
                            logger.info('system', 'Schedule updated', schedule);
                          }}
                        />
                      </Suspense>
                    </CardContent>
                  </Card>
                </div>
                </TierGate>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const data = JSON.parse(e.target?.result as string);
                  setDesignState({
                    room: data.room,
                    fixtures: data.fixtures,
                    history: { past: [], future: [] }
                  });
                  toast({
                    title: 'Project Loaded',
                    description: 'Your project has been loaded successfully.'
                  });
                } catch (error) {
                  toast({
                    title: 'Invalid File',
                    description: 'Could not load the project file.',
                    variant: 'destructive'
                  });
                }
              };
              reader.readAsText(file);
            }
          }}
        />

        {/* Consolidated Modals */}
        {showProjectModal && (
          <Suspense fallback={<ComponentLoader />}>
            <ProjectManagementModal
              isOpen={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              activeTab={projectModalTab}
              projects={projects}
              currentProject={currentProject}
              designState={designState}
              powerMetrics={powerMetrics}
              heatmapData={heatmapData}
              spectrumData={spectrumData}
              onLoadProject={(project) => {
                setDesignState({
                  room: project.room,
                  fixtures: project.fixtures,
                  history: { past: [], future: [] }
                });
                setCurrentProject(project);
                setShowProjectModal(false);
              }}
            />
          </Suspense>
        )}

        {showFinancialModal && (
          <Suspense fallback={<ComponentLoader />}>
            <FinancialAnalysisModal
              isOpen={showFinancialModal}
              onClose={() => setShowFinancialModal(false)}
              activeTab={financialModalTab}
              fixtures={designState.fixtures}
              room={designState.room}
              powerMetrics={powerMetrics}
            />
          </Suspense>
        )}

        {showHelpModal && (
          <Suspense fallback={<ComponentLoader />}>
            <HelpAssistanceModal
              isOpen={showHelpModal}
              onClose={() => setShowHelpModal(false)}
              userCredits={userCredits}
              onUseCredits={(amount) => setUserCredits(prev => Math.max(0, prev - amount))}
              room={designState.room}
              fixtures={designState.fixtures}
            />
          </Suspense>
        )}
        
        {/* Performance Monitor */}
        {showPerformanceMonitor && (
          <Suspense fallback={null}>
            <PerformanceMonitor
              isVisible={showPerformanceMonitor}
              onClose={() => setShowPerformanceMonitor(false)}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundaryAdvanced>
  );
}