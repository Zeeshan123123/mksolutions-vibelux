'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { X, Layers, Eye, Building, Settings2, Lightbulb, DollarSign, Users } from 'lucide-react';
import { DesignerProvider, useDesigner } from './context/DesignerContext';
import { NotificationProvider } from './context/NotificationContext';
import { FacilityDesignProvider } from './context/FacilityDesignContext';
import { ProfessionalLayout } from './layout/ProfessionalLayout';
import { AIDesignAssistant } from '../AIDesignAssistant';
import { ToolPaletteSidebar } from './tools/ToolPaletteSidebar';
import { clientLogger as logger } from '@/lib/client-logger';
import { CompactPropertiesPanel } from './panels/CompactPropertiesPanel';
import { CompactCalculationsPanel } from './panels/CompactCalculationsPanel';
import { SimpleCanvas2D } from './canvas/SimpleCanvas2D';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';
import { SplitViewLayout } from './layout/SplitViewLayout';
import { CompactTopToolbar } from './panels/CompactTopToolbar';
import { ArrayTool } from './tools/ArrayTool';
import { useSelectedObject } from './context/DesignerContext';
import { ElectricalEstimatorPanel } from './panels/ElectricalEstimatorPanel';
import { ElectricalDesignOutputPanel } from './panels/ElectricalDesignOutputPanel';
import { IrrigationDesignPanel } from './panels/IrrigationDesignPanel';
import { HVACSystemDesignPanel } from './panels/HVACSystemDesignPanel';
import { StructuralDesignPanel } from './panels/StructuralDesignPanel';
import { SolarDLIPanel } from './panels/SolarDLIPanel';
import { EnvironmentalIntegrationPanel } from './panels/EnvironmentalIntegrationPanel';
import { EnvironmentalControlsPanel } from './panels/EnvironmentalControlsPanel';
import { CostAnalysisPanel } from './panels/CostAnalysisPanel';
import { FacilityDashboardPanel } from './panels/FacilityDashboardPanel';
import { SystemValidationPanel } from './panels/SystemValidationPanel';
import { CogenerationDesignPanel } from './panels/CogenerationDesignPanel';
import { FixtureLibraryCompact } from './panels/FixtureLibraryCompact';
import { LayersPanel } from './panels/LayersPanel';
import { RoomConfigurationPanel } from './panels/RoomConfigurationPanel';
import { GreenhouseConfigurationPanel } from './panels/GreenhouseConfigurationPanel';
import { useCalculations } from './hooks/useCalculations';
import { calculatePowerDensity, calculateEfficacy } from './utils/calculations';
import { PPFDTargetArrayTool } from './tools/PPFDTargetArrayTool';
import { BatchPlacementTool } from './tools/BatchPlacementTool';
import { 
  Advanced3DVisualizationPanel,
  AdvancedPPFDMappingPanel,
  LEDThermalManagementPanel,
  PlantBiologyIntegrationPanel,
  MultiZoneControlSystemPanel,
  ResearchPropagationToolsPanel,
  GPURayTracingPanel
} from './panels/AdvancedPanels';
// Heavy components now enabled
import { MonteCarloRayTracingPanel } from './panels/MonteCarloRayTracingPanel';
import { PredictiveROIModule } from './panels/PredictiveROIModule';
import { FixtureImportWizard } from './panels/FixtureImportWizard';
import { FanLibraryPanel } from './panels/FanLibraryPanel';
import { DehumidifierLibraryPanel } from './panels/DehumidifierLibraryPanel';
import { CO2SystemPanel } from './panels/CO2SystemPanel';
import { HVACSystemPanel } from './panels/HVACSystemPanel';
import { IrrigationSystemPanel } from './panels/IrrigationSystemPanel';
import { EnvironmentalControllerPanel } from './panels/EnvironmentalControllerPanel';
import { ElectricalInfrastructurePanel } from './panels/ElectricalInfrastructurePanel';
import { BenchingRackingPanel } from './panels/BenchingRackingPanel';

// Simple ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      logger.error('system', 'ErrorBoundary caught an error:', error, errorInfo );
    } catch (loggerError) {
      console.error('Logger error:', loggerError);
      console.error('Original error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p>The application encountered an error. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
import { QuickArrayTool } from './tools/QuickArrayTool';
import { UnistrustTool } from './tools/UnistrustTool';
import { IESLightDistributionComparison } from '../IESLightDistributionComparison';
import { WorkflowSelector } from './workflows/IntegratedWorkflows';
import { PowerSafetyModule } from './panels/PowerSafetyModule';
import { CommissioningWorkflow } from './panels/CommissioningWorkflow';
import { NativeZoneManager } from './panels/NativeZoneManager';
import { SensorFusionSystem } from './panels/SensorFusionSystem';
import { ModbusLightingControlPanel } from './panels/ModbusLightingControl';
import { RecipeSyncSystem } from './panels/RecipeSyncSystem';
import { CADToolsPanel } from './panels/CADToolsPanel';
import { PhotometricEnginePanel } from './panels/PhotometricEnginePanel';
import { ProjectManagerPanel } from './panels/ProjectManagerPanel';
import { StandardsCompliancePanel } from './panels/StandardsCompliancePanel';
import { IESManagerPanel } from './panels/IESManagerPanel';
import { SpectrumAnalysisPanel } from './panels/SpectrumAnalysisPanel';
import { BatchValidationSystem } from './panels/BatchValidationSystem';
import { UnifiedAlertSystem } from './panels/UnifiedAlertSystem';
import { SpectrumOptimizationSystem } from './panels/SpectrumOptimizationSystem';
import { ResearchAssistantPanel } from './panels/ResearchAssistantPanel';
import { AIRecommendationsPanel } from './panels/AIRecommendationsPanel';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { useAuth } from '@clerk/nextjs';
import { SolarAnalysisPanel } from './panels/SolarAnalysisPanel';
import { VerticalFarmRayTracingPanel } from './panels/VerticalFarmRayTracingPanel';
import { TallPlantsAnalysisPanel } from './panels/TallPlantsAnalysisPanel';
import { 
  AquacultureTankPanel, 
  AquaculturePipingPanel, 
  AquacultureEquipmentPanel,
  AquacultureSystemAnalysis 
} from './panels/AquaculturePanels';

// Lazy load heavy components
import dynamic from 'next/dynamic';
import { FixtureSelectionModal } from './modals/FixtureSelectionModal';
import type { FixtureModel } from '@/components/FixtureLibrary';

// CADToolsPanel is now imported from ./panels/CADToolsPanel

// PhotometricEnginePanel is now imported from ./panels/PhotometricEnginePanel
const PhotometricEngine = PhotometricEnginePanel; // Alias for compatibility

const AdvancedVisualizationPanel = ({ onClose }: { onClose: () => void }) => (
  <div className="p-4 text-white">
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold">Advanced Visualization</div>
      <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
    </div>
    <div className="text-sm text-gray-300">3D previews and enhanced visuals will appear here.</div>
  </div>
);

const ProfessionalReports = ({ onClose }: { onClose: () => void }) => (
  <div className="p-4 text-white">
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold">Professional Reports</div>
      <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
    </div>
    <div className="text-sm text-gray-300">Export comprehensive deliverables from the Project Management modal (Export tab).</div>
  </div>
);
// StandardsCompliancePanel is now imported from ./panels/StandardsCompliancePanel
const StandardsCompliance = StandardsCompliancePanel; // Alias for compatibility
// IESManagerPanel is now imported from ./panels/IESManagerPanel
const IESManager = IESManagerPanel; // Alias for compatibility
// SpectrumAnalysisPanel is now imported from ./panels/SpectrumAnalysisPanel
const SpectrumAnalysis = SpectrumAnalysisPanel; // Alias for compatibility
// ProjectManagerPanel is now imported from ./panels/ProjectManagerPanel
const ProjectManager = ProjectManagerPanel; // Alias for compatibility
const RackSystem3D = () => <div className="p-4 text-white">3D Rack System - Coming Soon</div>;
const FullspaceDesigner = () => <div className="p-4 text-white">Fullspace Designer - Coming Soon</div>;
import CFDAnalysisPanel from '../CFDAnalysisPanel';

// Compact fixture library panel is now imported from ./panels/FixtureLibraryCompact

function ProfessionalDesignerContent() {
  const { state, dispatch, undo, redo, canUndo, canRedo, showNotification, updateRoom } = useDesigner();
  const { ui, calculations, objects, room } = state;
  const { userId } = useAuth();
  
  // State definitions - moved to top to prevent reference errors
  const [selectedTool, setSelectedTool] = useState('select');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [showFixtureSelection, setShowFixtureSelection] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('custom');
  const [dliTarget, setDliTarget] = useState(30);
  const [photoperiod, setPhotoperiod] = useState(12);
  const [currentMode, setCurrentMode] = useState<'design' | 'analyze' | 'simulate' | 'output'>('design');
  
  // Panel visibility state - moved here before any useEffect that uses it
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    photometricEngine: false,
    advancedVisualization: false,
    projectManager: false,
    cadTools: false,
    professionalReports: false,
    standardsCompliance: false,
    iesManager: false,
    spectrumAnalysis: false,
    monteCarloSimulation: false,
    arrayTool: false,
    ppfdArrayTool: false,
    batchPlacement: false,
    quickArrayTool: false,
    electricalEstimator: false,
    electricalDesignOutput: false,
    irrigationDesign: false,
    hvacSystemDesign: false,
    cogenerationDesign: false,
    structuralDesign: false,
    environmentalControls: false,
    environmentalIntegration: false,
    solarDLI: false,
    // Advanced dropdown panels
    advanced3DVisualization: false,
    advancedPPFDMapping: false,
    ledThermalManagement: false,
    plantBiologyIntegration: false,
    multiZoneControlSystem: false,
    researchPropagationTools: false,
    facilityDesign: false,
    cfdAnalysis: false,
    predictiveROI: false,
    fixtureImportWizard: false,
    roomConfiguration: false,
    greenhouseConfiguration: false,
    fixtures: false,
    environmentalSettings: false,
    calculations: false,
    layers: false,
    iesDistributionComparison: false,
    fans: false,
    dehumidifiers: false,
    co2System: false,
    hvacSystem: false,
    irrigationSystem: false,
    environmentalController: false,
    electricalInfrastructure: false,
    benchingRacking: false,
    unistrut: false,
    workflowSelector: false,
    powerSafety: false,
    commissioning: false,
    nativeZoneManager: false,
    sensorFusion: false,
    modbusControl: false,
    recipeSync: false,
    batchValidation: false,
    unifiedAlerts: false,
    spectrumOptimization: false,
    researchAssistant: false,
    gpuRayTracing: false,
    collaboration: false,
    costAnalysis: false,
    facilityDashboard: false,
    systemValidation: false,
    solarAnalysis: false,
    aquacultureTanks: false,
    aquaculturePiping: false,
    aquacultureEquipment: false,
    aquacultureAnalysis: false,
    verticalFarmRayTracing: false,
    tallPlantsAnalysis: false,
  });
  
  // Monitor objects array changes for debugging Apply Design
  useEffect(() => {
  }, [objects]);
  
  // Enable live PPFD calculations
  const { recalculate, isCalculating } = useCalculations();
  
  // Get actual calculation results from state
  const calculationResults = {
    averagePPFD: state.calculations.averagePPFD || 0,
    uniformity: state.calculations.uniformityMetrics?.minAvgRatio || 0,
    dli: state.calculations.dli || 0,
    energyDensity: calculatePowerDensity(objects.filter(obj => obj.type === 'fixture' && obj.enabled), room.width * room.length),
    efficacy: calculateEfficacy(objects.filter(obj => obj.type === 'fixture' && obj.enabled)),
    totalFixtures: objects.filter(obj => obj.type === 'fixture' && obj.enabled).length,
    totalWattage: objects.filter(obj => obj.type === 'fixture' && obj.enabled).reduce((sum, obj) => sum + (obj.model?.wattage || 0), 0),
    compliance: {
      status: state.calculations.averagePPFD >= 400 ? 'pass' : state.calculations.averagePPFD >= 200 ? 'warning' : 'fail',
      standard: `${selectedCrop} PPFD Requirements`,
      message: state.calculations.averagePPFD >= 400 ? 'Target PPFD achieved' : 'Below recommended PPFD levels'
    }
  };
  
  // Crop preset configurations
  const cropPresets = {
    lettuce: { name: 'Lettuce', dli: 14, ppfd: 250, photoperiod: 16, spectrum: { red: 65, blue: 25, green: 10 } },
    tomatoes: { name: 'Tomatoes', dli: 25, ppfd: 450, photoperiod: 12, spectrum: { red: 70, blue: 20, green: 10 } },
    cannabis: { name: 'Cannabis', dli: 40, ppfd: 800, photoperiod: 12, spectrum: { red: 60, blue: 30, green: 10 } },
    herbs: { name: 'Herbs', dli: 20, ppfd: 350, photoperiod: 16, spectrum: { red: 60, blue: 30, green: 10 } },
    strawberries: { name: 'Strawberries', dli: 18, ppfd: 300, photoperiod: 16, spectrum: { red: 75, blue: 20, green: 5 } },
    custom: { name: 'Custom', dli: 30, ppfd: 500, photoperiod: 12, spectrum: { red: 65, blue: 25, green: 10 } }
  };
  
  // Handle crop change
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    const preset = cropPresets[crop as keyof typeof cropPresets];
    if (preset) {
      setDliTarget(preset.dli);
      setPhotoperiod(preset.photoperiod);
      
      // Update room with target DLI from preset
      updateRoom({ 
        targetDLI: preset.dli
      });
      
      // Trigger recalculation to update metrics
      recalculate();
      
      // Show notification
      showNotification('success', `Applied ${preset.name} preset: ${preset.dli} DLI target, ${preset.photoperiod}h photoperiod`);
    }
  };

  // Handle mode changes
  React.useEffect(() => {
    // Update UI based on current mode
    switch (currentMode) {
      case 'design':
        // Focus on design tools
        dispatch({ type: 'SET_TOOL', payload: 'select' });
        break;
      case 'analyze':
        // Show analysis panels
        setOpenPanels(prev => ({ ...prev, calculations: true, photometricEngine: true }));
        break;
      case 'simulate':
        // Enable simulation features
        // dispatch({ type: 'UPDATE_UI', payload: { showRealTimeSimulation: true } });
        break;
      case 'output':
        // Show output/export panels
        setOpenPanels(prev => ({ ...prev, professionalReports: true }));
        break;
    }
  }, [currentMode, dispatch]);

  // Define togglePanel function with useCallback to prevent infinite loops
  const togglePanel = useCallback((panelId: string) => {
    setOpenPanels(prev => {
      const newState = {
        ...prev,
        [panelId]: !prev[panelId]
      };
      return newState;
    });
  }, []); // Empty dependency array since we're using functional setState

  // Listen for custom events
  React.useEffect(() => {
    const handleSetObjectType = (e: CustomEvent) => {
      dispatch({ type: 'SET_OBJECT_TYPE', payload: e.detail });
    };
    const handleOpenArrayTool = () => {
      setOpenPanels(prev => ({ ...prev, arrayTool: true }));
    };
    const handleOpenPPFDArrayTool = () => {
      setOpenPanels(prev => ({ ...prev, ppfdArrayTool: true }));
    };
    const handleOpenBatchPlacementTool = () => {
      setOpenPanels(prev => ({ ...prev, batchPlacement: true }));
    };
    const handleTogglePanel = (e: CustomEvent) => {
      const panelId = e.detail;
      if (panelId && typeof panelId === 'string') {
        togglePanel(panelId);
      }
    };
    const handleOpenRoomConfiguration = () => {
      setOpenPanels(prev => ({ ...prev, roomConfiguration: true }));
    };
    const handleOpenGreenhouseConfiguration = () => {
      setOpenPanels(prev => ({ ...prev, greenhouseConfiguration: true }));
    };
    window.addEventListener('setObjectType', handleSetObjectType as EventListener);
    window.addEventListener('openArrayTool', handleOpenArrayTool);
    window.addEventListener('openPPFDArrayTool', handleOpenPPFDArrayTool);
    window.addEventListener('openBatchPlacementTool', handleOpenBatchPlacementTool);
    window.addEventListener('togglePanel', handleTogglePanel as EventListener);
    window.addEventListener('openRoomConfiguration', handleOpenRoomConfiguration);
    window.addEventListener('openGreenhouseConfiguration', handleOpenGreenhouseConfiguration);
    return () => {
      window.removeEventListener('setObjectType', handleSetObjectType as EventListener);
      window.removeEventListener('openArrayTool', handleOpenArrayTool);
      window.removeEventListener('openPPFDArrayTool', handleOpenPPFDArrayTool);
      window.removeEventListener('openBatchPlacementTool', handleOpenBatchPlacementTool);
      window.removeEventListener('togglePanel', handleTogglePanel as EventListener);
      window.removeEventListener('openRoomConfiguration', handleOpenRoomConfiguration);
      window.removeEventListener('openGreenhouseConfiguration', handleOpenGreenhouseConfiguration);
    };
  }, [dispatch, togglePanel]);


  // Add keyboard shortcuts for undo/redo and layers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
      
      if (isInputField) return;
      
      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
      
      // Layer panel shortcut (Cmd/Ctrl + L)
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setOpenPanels(prev => ({ ...prev, layers: !prev.layers }));
      }
      
      // Collaboration panel shortcut (Cmd/Ctrl + Shift + C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        setOpenPanels(prev => ({ ...prev, collaboration: !prev.collaboration }));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, undo, redo]);


  const handleFixtureSelect = (fixture: FixtureModel) => {
    // Convert the fixture model to the format expected by the designer
    const convertedFixture = {
      id: fixture.id || `fixture_${Date.now()}`,
      brand: fixture.brand,
      model: fixture.model,
      wattage: fixture.wattage,
      ppf: fixture.ppf,
      efficacy: fixture.efficacy,
      spectrum: fixture.spectrum || 'Full Spectrum',
      dlcQualified: fixture.dlcQualified || false,
      price: fixture.price,
      mountingType: fixture.mountingType || 'overhead',
      dimensions: fixture.dimensions || { length: 48, width: 12, height: 6 },
      beamAngle: fixture.beamAngle || 120,
      category: fixture.category || 'toplighting'
    };
    
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: convertedFixture });
    setShowFixtureSelection(false);
    dispatch({ type: 'SET_OBJECT_TYPE', payload: 'fixture' });
    
    // Dispatch custom event to open array tool
    window.dispatchEvent(new CustomEvent('openArrayTool'));
  };

  // Auto-show fixture selection when place tool is selected
  useEffect(() => {
    if (selectedTool === 'place') {
      setShowFixtureSelection(true);
    }
  }, [selectedTool]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen overflow-hidden bg-gray-900 text-gray-100 relative" style={{ 
        minHeight: '900px'
      }}>
        {/* Tool Palette Sidebar */}
        <ToolPaletteSidebar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onPanelOpen={(panelId) => {
            setOpenPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
          }}
          spaceType={state.room.spaceType}
          className="tool-palette-sidebar"
        />
        
        {/* Layers Panel - Floating */}
        {openPanels.layers && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            width: '300px',
            maxHeight: '80vh',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} />
                <span style={{ fontWeight: 500 }}>Layers</span>
              </div>
              <button
                onClick={() => setOpenPanels(prev => ({ ...prev, layers: false }))}
                className="flex items-center gap-1 hover:text-white transition-colors ${openPanels.layers ? 'text-purple-400' : ''}"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
              {/* Collaboration Button */}
              <button
                onClick={() => setOpenPanels(prev => ({ ...prev, collaboration: !prev.collaboration }))}
                className={`sidebar-icon ${openPanels.collaboration ? 'active' : ''}`}
                title="Collaboration (Ctrl+Shift+C)"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: openPanels.collaboration ? '#a855f7' : '#9ca3af',
                  padding: '4px',
                  marginLeft: '8px'
                }}
              >
                <Users size={20} />
              </button>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)' }}>
              <LayersPanel />
            </div>
          </div>
        )}
        
        {/* Collaboration Panel */}
        {openPanels.collaboration && userId && (
          <div className="fixed top-0 right-0 w-80 h-screen z-50" style={{
            minHeight: '900px'
          }}>
            <CollaborationPanel
              roomId={room.id || 'default-room'}
              userId={userId}
              userName="Designer User"
              wsUrl={process.env.NEXT_PUBLIC_WEBSOCKET_URL}
              onObjectAdded={(data) => {
              }}
              onObjectUpdated={(data) => {
              }}
              onObjectDeleted={(data) => {
              }}
            />
          </div>
        )}
        
        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: '60px'
        }}>
          {/* Compact Top Toolbar */}
          <CompactTopToolbar
            onCropChange={handleCropChange}
            onPhotoperiodChange={setPhotoperiod}
            photoperiod={photoperiod}
          />
          
          <SplitViewLayout
            leftContent={
              <div style={{ height: '100%', position: 'relative' }}>
                <SimpleCanvas2D
                  activeTool={selectedTool}
                  canvasRef={React.useRef<HTMLCanvasElement>(null)}
                />
              </div>
            }
            rightContent={
              <div style={{ 
                height: '100%', 
                backgroundColor: '#1f2937',
                borderLeft: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Properties Panel */}
                <CompactPropertiesPanel />
                {/* Calculations Panel */}
                <CompactCalculationsPanel 
                  results={calculationResults}
                  isCalculating={isCalculating}
                  onCalculate={recalculate}
                  onExport={() => {
                    // Export calculation results
                    const data = JSON.stringify(calculationResults, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ppfd-calculations.json';
                    a.click();
                  }}
                  onViewDetails={() => {
                    // Open detailed calculations panel
                    setOpenPanels(prev => ({ ...prev, photometricEngine: true }));
                  }}
                />
              </div>
            }
            rightPanelWidth={rightPanelWidth}
            onWidthChange={setRightPanelWidth}
            rightPanelCollapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          />
        </main>
        
        {/* Floating Panels */}
        {openPanels.arrayTool && (
          <ArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, arrayTool: false }))}
            isOpen={openPanels.arrayTool}
          />
        )}
        
        {openPanels.ppfdArrayTool && (
          <PPFDTargetArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, ppfdArrayTool: false }))}
            isOpen={openPanels.ppfdArrayTool}
          />
        )}
        
        {openPanels.batchPlacement && (
          <BatchPlacementTool
            onClose={() => setOpenPanels(prev => ({ ...prev, batchPlacement: false }))}
            isOpen={openPanels.batchPlacement}
          />
        )}
        
        {openPanels.quickArrayTool && (
          <QuickArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, quickArrayTool: false }))}
          />
        )}
        
        {openPanels.electricalEstimator && (
          <ElectricalEstimatorPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, electricalEstimator: false }))}
          />
        )}
        
        {openPanels.electricalDesignOutput && (
          <ElectricalDesignOutputPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, electricalDesignOutput: false }))}
          />
        )}
        
        {openPanels.irrigationDesign && (
          <IrrigationDesignPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, irrigationDesign: false }))}
          />
        )}
        
        {openPanels.hvacSystemDesign && (
          <HVACSystemDesignPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, hvacSystemDesign: false }))}
          />
        )}
        
        {openPanels.cogenerationDesign && (
          <CogenerationDesignPanel />
        )}
        
        {openPanels.structuralDesign && (
          <StructuralDesignPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, structuralDesign: false }))}
          />
        )}
        
        {openPanels.environmentalControls && (
          <EnvironmentalControlsPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, environmentalControls: false }))}
          />
        )}
        
        {openPanels.solarDLI && (
          <SolarDLIPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, solarDLI: false }))}
          />
        )}
        
        {openPanels.solarAnalysis && (
          <SolarAnalysisPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, solarAnalysis: false }))}
          />
        )}
        
        {openPanels.environmentalIntegration && (
          <EnvironmentalIntegrationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, environmentalIntegration: false }))}
          />
        )}
        
        {openPanels.roomConfiguration && (
          <RoomConfigurationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, roomConfiguration: false }))}
          />
        )}
        
        {openPanels.greenhouseConfiguration && (
          <GreenhouseConfigurationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, greenhouseConfiguration: false }))}
          />
        )}
        
        {/* Aquaculture Panels */}
        {state.room.spaceType === 'aquaculture' && (
          <>
            {openPanels.aquacultureTanks && (
              <AquacultureTankPanel />
            )}
            {openPanels.aquaculturePiping && (
              <AquaculturePipingPanel />
            )}
            {openPanels.aquacultureEquipment && (
              <AquacultureEquipmentPanel />
            )}
            {openPanels.aquacultureAnalysis && (
              <AquacultureSystemAnalysis />
            )}
          </>
        )}
        
        {openPanels.fixtures && (
          <FixtureLibraryCompact
            onClose={() => setOpenPanels(prev => ({ ...prev, fixtures: false }))}
            onSelectFixture={() => {
              setShowFixtureSelection(true);
              setOpenPanels(prev => ({ ...prev, fixtures: false }));
            }}
          />
        )}
        
        {/* Professional Panels - Lazy Loaded */}
        {openPanels.photometricEngine && (
          <Suspense fallback={<div>Loading...</div>}>
            <PhotometricEngine
              onClose={() => setOpenPanels(prev => ({ ...prev, photometricEngine: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.advancedVisualization && (
          <Suspense fallback={<div>Loading...</div>}>
            <AdvancedVisualizationPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, advancedVisualization: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.projectManager && (
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectManager
              onClose={() => setOpenPanels(prev => ({ ...prev, projectManager: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.cadTools && (
          <Suspense fallback={<div>Loading...</div>}>
            <CADToolsPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, cadTools: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.professionalReports && (
          <Suspense fallback={<div>Loading...</div>}>
            <ProfessionalReports
              onClose={() => setOpenPanels(prev => ({ ...prev, professionalReports: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.standardsCompliance && (
          <Suspense fallback={<div>Loading...</div>}>
            <StandardsCompliance
              onClose={() => setOpenPanels(prev => ({ ...prev, standardsCompliance: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.iesManager && (
          <Suspense fallback={<div>Loading...</div>}>
            <IESManager
              onClose={() => setOpenPanels(prev => ({ ...prev, iesManager: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.spectrumAnalysis && (
          <Suspense fallback={<div>Loading...</div>}>
            <SpectrumAnalysis
              onClose={() => setOpenPanels(prev => ({ ...prev, spectrumAnalysis: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.monteCarloSimulation && (
          <MonteCarloRayTracingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, monteCarloSimulation: false }))}
          />
        )}
        
        {openPanels.cfdAnalysis && (
          <Suspense fallback={<div>Loading...</div>}>
            <CFDAnalysisPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, cfdAnalysis: false }))}
            />
          </Suspense>
        )}
        
        {/* Advanced Panels */}
        {openPanels.advanced3DVisualization && (
          <Advanced3DVisualizationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, advanced3DVisualization: false }))}
          />
        )}
        
        {openPanels.advancedPPFDMapping && (
          <AdvancedPPFDMappingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, advancedPPFDMapping: false }))}
          />
        )}
        
        {openPanels.ledThermalManagement && (
          <LEDThermalManagementPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, ledThermalManagement: false }))}
          />
        )}
        
        {openPanels.plantBiologyIntegration && (
          <PlantBiologyIntegrationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, plantBiologyIntegration: false }))}
          />
        )}
        
        {openPanels.multiZoneControlSystem && (
          <MultiZoneControlSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, multiZoneControlSystem: false }))}
          />
        )}
        
        {openPanels.researchPropagationTools && (
          <ResearchPropagationToolsPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, researchPropagationTools: false }))}
          />
        )}
        
        {openPanels.gpuRayTracing && (
          <GPURayTracingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, gpuRayTracing: false }))}
          />
        )}
        
        {openPanels.predictiveROI && (
          <PredictiveROIModule
            onClose={() => setOpenPanels(prev => ({ ...prev, predictiveROI: false }))}
          />
        )}
        
        {openPanels.fixtureImportWizard && (
          <FixtureImportWizard
            onClose={() => setOpenPanels(prev => ({ ...prev, fixtureImportWizard: false }))}
          />
        )}
        
        {openPanels.iesDistributionComparison && (
          <IESLightDistributionComparison
            onClose={() => setOpenPanels(prev => ({ ...prev, iesDistributionComparison: false }))}
          />
        )}
        
        {/* Equipment Panels */}
        {openPanels.fans && (
          <FanLibraryPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, fans: false }))}
          />
        )}
        
        {openPanels.dehumidifiers && (
          <DehumidifierLibraryPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, dehumidifiers: false }))}
          />
        )}
        
        {openPanels.co2System && (
          <CO2SystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, co2System: false }))}
          />
        )}
        
        {openPanels.hvacSystem && (
          <HVACSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, hvacSystem: false }))}
          />
        )}
        
        {openPanels.irrigationSystem && (
          <IrrigationSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, irrigationSystem: false }))}
          />
        )}
        
        {openPanels.environmentalController && (
          <EnvironmentalControllerPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, environmentalController: false }))}
          />
        )}
        
        {openPanels.electricalInfrastructure && (
          <ElectricalInfrastructurePanel
            onClose={() => setOpenPanels(prev => ({ ...prev, electricalInfrastructure: false }))}
          />
        )}
        
        {openPanels.benchingRacking && (
          <BenchingRackingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, benchingRacking: false }))}
          />
        )}
        
        {openPanels.unistrut && (
          <UnistrustTool
            onClose={() => setOpenPanels(prev => ({ ...prev, unistrut: false }))}
          />
        )}
        
        {/* Workflow and Integration Panels */}
        {openPanels.workflowSelector && (
          <WorkflowSelector
            onClose={() => setOpenPanels(prev => ({ ...prev, workflowSelector: false }))}
          />
        )}
        
        {openPanels.powerSafety && (
          <PowerSafetyModule
            onClose={() => setOpenPanels(prev => ({ ...prev, powerSafety: false }))}
          />
        )}
        
        {openPanels.commissioning && (
          <CommissioningWorkflow
            onClose={() => setOpenPanels(prev => ({ ...prev, commissioning: false }))}
          />
        )}
        
        {openPanels.nativeZoneManager && (
          <NativeZoneManager
            onClose={() => setOpenPanels(prev => ({ ...prev, nativeZoneManager: false }))}
          />
        )}
        
        {openPanels.sensorFusion && (
          <SensorFusionSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, sensorFusion: false }))}
          />
        )}
        
        {openPanels.modbusControl && (
          <ModbusLightingControlPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, modbusControl: false }))}
          />
        )}
        
        {openPanels.recipeSync && (
          <RecipeSyncSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, recipeSync: false }))}
          />
        )}
        
        {openPanels.batchValidation && (
          <BatchValidationSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, batchValidation: false }))}
          />
        )}
        
        {openPanels.unifiedAlerts && (
          <UnifiedAlertSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, unifiedAlerts: false }))}
          />
        )}
        
        {openPanels.spectrumOptimization && (
          <SpectrumOptimizationSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, spectrumOptimization: false }))}
          />
        )}
        
        {openPanels.researchAssistant && (
          <ResearchAssistantPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, researchAssistant: false }))}
          />
        )}
        
        {openPanels.costAnalysis && (
          <CostAnalysisPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, costAnalysis: false }))}
          />
        )}
        
        {openPanels.facilityDashboard && (
          <FacilityDashboardPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, facilityDashboard: false }))}
          />
        )}
        
        {openPanels.systemValidation && (
          <SystemValidationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, systemValidation: false }))}
          />
        )}
        
        {/* Advanced Ray Tracing Panels */}
        {openPanels.verticalFarmRayTracing && (
          <VerticalFarmRayTracingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, verticalFarmRayTracing: false }))}
          />
        )}
        
        {openPanels.tallPlantsAnalysis && (
          <TallPlantsAnalysisPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, tallPlantsAnalysis: false }))}
          />
        )}
        
        {/* AI Recommendations Panel - Shows proactive suggestions */}
        <AIRecommendationsPanel />
        
        {/* AI Design Assistant - Always visible */}
        <div className="ai-assistant-container">
          <AIDesignAssistant />
        </div>
        
        {/* Fixture Selection Modal */}
        {showFixtureSelection && (
          <FixtureSelectionModal
            isOpen={showFixtureSelection}
            onClose={() => setShowFixtureSelection(false)}
            onSelect={handleFixtureSelect}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

interface AdvancedDesignerProfessionalProps {
  initialSpaceType?: 'indoor' | 'greenhouse' | 'aquaculture';
  initialDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  initialUnit?: 'feet' | 'meters';
}

export function AdvancedDesignerProfessional(props: AdvancedDesignerProfessionalProps) {
  return (
    <NotificationProvider>
      <DesignerProvider initialSpaceType={props.initialSpaceType} initialDimensions={props.initialDimensions}>
        <FacilityDesignProvider>
          <ProfessionalDesignerContent />
        </FacilityDesignProvider>
      </DesignerProvider>
    </NotificationProvider>
  );
}