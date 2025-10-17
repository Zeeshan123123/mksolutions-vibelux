'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Building2, Droplets, Thermometer, Leaf, Zap, Settings, Grid, Eye, EyeOff, Cable } from 'lucide-react';

// Lazy load existing facility components
const DetailedGreenhouse3D = React.lazy(() => 
  import('../../temp-disabled.bak/3d/DetailedGreenhouse3D').then(module => ({ default: module.DetailedGreenhouse3D }))
);
const IrrigationControlPanel = React.lazy(() => 
  import('../cultivation/IrrigationControlPanel').then(module => ({ default: module.IrrigationControlPanel }))
);
const HVACSystemDashboard = React.lazy(() => 
  import('../cultivation/HVACSystemDashboard').then(module => ({ default: module.HVACSystemDashboard }))
);

// New facility design components
const GreenhouseStructureDesigner = React.lazy(() => 
  import('./GreenhouseStructureDesigner').then(module => ({ default: module.GreenhouseStructureDesigner }))
);
const IrrigationSystemDesigner = React.lazy(() => 
  import('./IrrigationSystemDesigner').then(module => ({ default: module.IrrigationSystemDesigner }))
);
const EnvironmentalControlsDesigner = React.lazy(() => 
  import('./EnvironmentalControlsDesigner').then(module => ({ default: module.EnvironmentalControlsDesigner }))
);
const ElectricalSystemDesigner = React.lazy(() => 
  import('./ElectricalSystemDesigner').then(module => ({ default: module.ElectricalSystemDesigner }))
);
const CultivationWorkflowDesigner = React.lazy(() => 
  import('./CultivationWorkflowDesigner').then(module => ({ default: module.CultivationWorkflowDesigner }))
);
const AutomationNetworkDesigner = React.lazy(() => 
  import('./AutomationNetworkDesigner').then(module => ({ default: module.AutomationNetworkDesigner }))
);
const StructuralDesignPanel = React.lazy(() => Promise.resolve({ default: StructuralDesignPanelComponent }));
const CultivationLayoutPanel = React.lazy(() => Promise.resolve({ default: CultivationLayoutPanelComponent }));
const AutomationSystemsPanel = React.lazy(() => Promise.resolve({ default: AutomationSystemsPanelComponent }));

interface FacilityConfig {
  type: 'greenhouse' | 'indoor' | 'hybrid';
  dimensions: { length: number; width: number; height: number };
  structure: {
    frame: 'aluminum' | 'galvanized_steel' | 'steel';
    glazing: 'glass' | 'polycarbonate' | 'polyethylene';
    roofType: 'gable' | 'gothic' | 'venlo' | 'tunnel';
  };
  systems: {
    irrigation: boolean;
    hvac: boolean;
    automation: boolean;
    lighting: boolean;
    co2: boolean;
  };
}

interface FacilityDesignerProps {
  initialConfig?: FacilityConfig;
  onConfigChange?: (config: FacilityConfig) => void;
}

type DesignMode = 'overview' | 'greenhouse' | 'irrigation' | 'hvac' | 'electrical' | 'structural' | 'cultivation' | 'automation' | 'integration';

export function ComprehensiveFacilityDesigner({ 
  initialConfig, 
  onConfigChange 
}: FacilityDesignerProps) {
  const [designMode, setDesignMode] = useState<DesignMode>('overview');
  const [facilityConfig, setFacilityConfig] = useState<FacilityConfig>(
    initialConfig || {
      type: 'greenhouse',
      dimensions: { length: 120, width: 60, height: 16 },
      structure: {
        frame: 'aluminum',
        glazing: 'polycarbonate',
        roofType: 'gable'
      },
      systems: {
        irrigation: true,
        hvac: true,
        automation: true,
        lighting: true,
        co2: true
      }
    }
  );
  
  const [showSystemOverlay, setShowSystemOverlay] = useState(true);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  useEffect(() => {
    onConfigChange?.(facilityConfig);
  }, [facilityConfig, onConfigChange]);

  const systemPanels = useMemo(() => ({
    greenhouse: { 
      component: GreenhouseStructureDesigner, 
      title: 'Greenhouse Structure', 
      icon: Building2,
      color: 'from-green-500 to-emerald-600'
    },
    irrigation: { 
      component: IrrigationSystemDesigner, 
      title: 'Irrigation Systems', 
      icon: Droplets,
      color: 'from-blue-500 to-cyan-600'
    },
    hvac: { 
      component: EnvironmentalControlsDesigner, 
      title: 'Environmental Controls', 
      icon: Thermometer,
      color: 'from-orange-500 to-red-600'
    },
    electrical: { 
      component: ElectricalSystemDesigner, 
      title: 'Electrical Systems', 
      icon: Cable,
      color: 'from-yellow-500 to-orange-600'
    },
    structural: { 
      component: StructuralDesignPanel, 
      title: 'Structural Design', 
      icon: Grid,
      color: 'from-gray-500 to-slate-600'
    },
    cultivation: { 
      component: CultivationWorkflowDesigner, 
      title: 'Cultivation Workflow', 
      icon: Leaf,
      color: 'from-green-600 to-lime-600'
    },
    automation: { 
      component: AutomationNetworkDesigner, 
      title: 'Automation & Controls', 
      icon: Settings,
      color: 'from-purple-500 to-indigo-600'
    }
  }), []);

  const renderDesignMode = () => {
    switch (designMode) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Facility Overview */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Facility Overview</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Type</h4>
                  <p className="text-white font-medium capitalize">{facilityConfig.type}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Size</h4>
                  <p className="text-white font-medium">
                    {facilityConfig.dimensions.length}' × {facilityConfig.dimensions.width}'
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Area</h4>
                  <p className="text-white font-medium">
                    {(facilityConfig.dimensions.length * facilityConfig.dimensions.width).toLocaleString()} sq ft
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Active Systems</h4>
                  <p className="text-white font-medium">
                    {Object.values(facilityConfig.systems).filter(Boolean).length}/5
                  </p>
                </div>
              </div>
            </div>

            {/* 3D Facility View */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">3D Facility View</h3>
                <button
                  onClick={() => setShowSystemOverlay(!showSystemOverlay)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  {showSystemOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Systems Overlay
                </button>
              </div>
              <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
                <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading 3D view...</div>}>
                  <DetailedGreenhouse3D 
                    structure={{
                      type: facilityConfig.structure.roofType,
                      materials: {
                        frame: facilityConfig.structure.frame,
                        glazing: facilityConfig.structure.glazing
                      }
                    }}
                  />
                </Suspense>
                
                {/* System overlay indicators */}
                {showSystemOverlay && (
                  <div className="absolute inset-0 pointer-events-none">
                    {facilityConfig.systems.irrigation && (
                      <div className="absolute top-4 left-4 bg-blue-500/20 border border-blue-500 rounded-lg p-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                    {facilityConfig.systems.hvac && (
                      <div className="absolute top-4 right-4 bg-orange-500/20 border border-orange-500 rounded-lg p-2">
                        <Thermometer className="w-4 h-4 text-orange-400" />
                      </div>
                    )}
                    {facilityConfig.systems.lighting && (
                      <div className="absolute bottom-4 left-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(systemPanels).map(([key, panel]) => {
                const isActive = facilityConfig.systems[key as keyof typeof facilityConfig.systems];
                const IconComponent = panel.icon;
                
                return (
                  <div
                    key={key}
                    className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-750 ${
                      activeSystem === key ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => {
                      setActiveSystem(activeSystem === key ? null : key);
                      setDesignMode(key as DesignMode);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 bg-gradient-to-br ${panel.color} rounded-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-600'}`} />
                    </div>
                    <h4 className="text-white font-medium mb-1">{panel.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {isActive ? 'Active & Configured' : 'Available'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'greenhouse':
      case 'irrigation':
      case 'hvac':
      case 'electrical':
      case 'structural':
      case 'cultivation':
      case 'automation':
        const panel = systemPanels[designMode];
        const PanelComponent = panel.component;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 bg-gradient-to-br ${panel.color} rounded-xl`}>
                <panel.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{panel.title}</h2>
                <p className="text-gray-400">Configure and monitor system components</p>
              </div>
            </div>
            
            <Suspense fallback={<div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">Loading {panel.title.toLowerCase()}...</div>}>
              <PanelComponent facilityConfig={facilityConfig} onSystemUpdate={() => {}} />
            </Suspense>
          </div>
        );

      default:
        return <div className="text-white">Unknown design mode</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with mode selector */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Comprehensive Facility Designer</h1>
            <p className="text-gray-400">Complete cultivation facility design and management</p>
          </div>
          
          {/* Mode selector */}
          <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: Building2 },
              { key: 'greenhouse', label: 'Structure', icon: Building2 },
              { key: 'irrigation', label: 'Irrigation', icon: Droplets },
              { key: 'hvac', label: 'HVAC', icon: Thermometer },
              { key: 'electrical', label: 'Electrical', icon: Cable },
              { key: 'structural', label: 'Structural', icon: Grid },
              { key: 'cultivation', label: 'Cultivation', icon: Leaf },
              { key: 'automation', label: 'Automation', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setDesignMode(key as DesignMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  designMode === key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {renderDesignMode()}
      </div>
    </div>
  );
}

// Placeholder components for new facility design panels

function StructuralDesignPanelComponent({ facilityConfig }: { facilityConfig: FacilityConfig }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Structural Engineering</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Foundation Design</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Foundation Type</p>
              <p className="text-white">Concrete Slab with Footings</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Load Capacity</p>
              <p className="text-white">250 PSF</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Frame Analysis</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Wind Load</p>
              <p className="text-white">120 MPH Design</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Snow Load</p>
              <p className="text-white">40 PSF</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Bench Layout</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Growing Area</p>
              <p className="text-white">5,400 sq ft</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Walkway Width</p>
              <p className="text-white">4 feet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CultivationLayoutPanelComponent({ facilityConfig }: { facilityConfig: FacilityConfig }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Cultivation Systems Layout</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Growing Systems</h4>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white">Propagation Area</span>
                <span className="text-green-400">20%</span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white">Vegetative Growth</span>
                <span className="text-blue-400">30%</span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white">Flowering</span>
                <span className="text-purple-400">40%</span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white">Processing/Storage</span>
                <span className="text-orange-400">10%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Layout Preview</h4>
            <div className="aspect-square bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-1 h-full">
                <div className="bg-green-500 rounded"></div>
                <div className="bg-blue-500 rounded"></div>
                <div className="bg-blue-500 rounded"></div>
                <div className="bg-purple-500 rounded"></div>
                <div className="bg-green-500 rounded"></div>
                <div className="bg-purple-500 rounded"></div>
                <div className="bg-purple-500 rounded"></div>
                <div className="bg-orange-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationSystemsPanelComponent({ facilityConfig }: { facilityConfig: FacilityConfig }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Automation & Control Systems</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Sensor Network</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Temperature</span>
                <span className="text-green-400">✓ 24 sensors</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Humidity</span>
                <span className="text-green-400">✓ 24 sensors</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">CO₂</span>
                <span className="text-green-400">✓ 8 sensors</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Light</span>
                <span className="text-green-400">✓ 16 sensors</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Control Systems</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Climate Control</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Irrigation</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Lighting</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Security</span>
                <span className="text-yellow-400">Setup Required</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Network Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Wireless Coverage</span>
                <span className="text-green-400">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Device Connectivity</span>
                <span className="text-green-400">156/160</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Data Sync</span>
                <span className="text-green-400">Real-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Backup Systems</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComprehensiveFacilityDesigner;