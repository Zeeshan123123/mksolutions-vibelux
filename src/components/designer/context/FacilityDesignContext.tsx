'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { useDesigner } from './DesignerContext';

// Unified facility data interfaces
interface SystemLoad {
  electrical: number; // watts
  thermal: number; // BTU/hr
  structural: number; // lbs
  water: number; // GPM
}

interface SystemCost {
  equipment: number;
  installation: number;
  maintenance: number;
  energy: number; // annual
}

interface FacilitySystem {
  id: string;
  type: 'hvac' | 'structural' | 'electrical' | 'irrigation' | 'environmental';
  status: 'designing' | 'configured' | 'validated' | 'error';
  loads: SystemLoad;
  costs: SystemCost;
  components: any[];
  dependencies: string[]; // Other system IDs this depends on
  conflicts: string[]; // Systems with conflicting requirements
  lastUpdated: Date;
  data: any; // System-specific data
}

interface FacilityMetrics {
  totalElectricalLoad: number; // watts
  totalThermalLoad: number; // BTU/hr
  totalStructuralLoad: number; // lbs
  totalWaterFlow: number; // GPM
  totalCost: SystemCost;
  totalArea: number; // sq ft
  energyEfficiency: number; // kWh/sq ft/year
  roi: {
    paybackPeriod: number; // years
    npv: number; // $
    irr: number; // %
  };
  sustainabilityScore: number; // 0-100
}

interface SystemDependency {
  fromSystem: string;
  toSystem: string;
  dependencyType: 'electrical-load' | 'thermal-load' | 'structural-load' | 'space-allocation' | 'water-flow';
  value: number;
  critical: boolean;
}

interface SystemConflict {
  systems: string[];
  conflictType: 'space' | 'capacity' | 'environmental' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolution?: string;
}

interface FacilityDesignState {
  systems: Record<string, FacilitySystem>;
  metrics: FacilityMetrics;
  dependencies: SystemDependency[];
  conflicts: SystemConflict[];
  isValidated: boolean;
  lastCalculated: Date;
  optimizationSuggestions: any[];
}

type FacilityDesignAction = 
  | { type: 'UPDATE_SYSTEM'; payload: { systemId: string; updates: Partial<FacilitySystem> } }
  | { type: 'ADD_DEPENDENCY'; payload: SystemDependency }
  | { type: 'REMOVE_DEPENDENCY'; payload: { fromSystem: string; toSystem: string } }
  | { type: 'ADD_CONFLICT'; payload: SystemConflict }
  | { type: 'RESOLVE_CONFLICT'; payload: { systems: string[]; resolution: string } }
  | { type: 'RECALCULATE_METRICS' }
  | { type: 'VALIDATE_DESIGN' }
  | { type: 'RESET_FACILITY' };

const initialState: FacilityDesignState = {
  systems: {},
  metrics: {
    totalElectricalLoad: 0,
    totalThermalLoad: 0,
    totalStructuralLoad: 0,
    totalWaterFlow: 0,
    totalCost: { equipment: 0, installation: 0, maintenance: 0, energy: 0 },
    totalArea: 0,
    energyEfficiency: 0,
    roi: { paybackPeriod: 0, npv: 0, irr: 0 },
    sustainabilityScore: 0
  },
  dependencies: [],
  conflicts: [],
  isValidated: false,
  lastCalculated: new Date(),
  optimizationSuggestions: []
};

function facilityDesignReducer(state: FacilityDesignState, action: FacilityDesignAction): FacilityDesignState {
  switch (action.type) {
    case 'UPDATE_SYSTEM':
      const { systemId, updates } = action.payload;
      const updatedSystem = {
        ...state.systems[systemId],
        ...updates,
        lastUpdated: new Date()
      };
      
      return {
        ...state,
        systems: {
          ...state.systems,
          [systemId]: updatedSystem
        },
        isValidated: false
      };

    case 'ADD_DEPENDENCY':
      return {
        ...state,
        dependencies: [...state.dependencies, action.payload]
      };

    case 'REMOVE_DEPENDENCY':
      return {
        ...state,
        dependencies: state.dependencies.filter(
          dep => !(dep.fromSystem === action.payload.fromSystem && dep.toSystem === action.payload.toSystem)
        )
      };

    case 'ADD_CONFLICT':
      return {
        ...state,
        conflicts: [...state.conflicts, action.payload]
      };

    case 'RESOLVE_CONFLICT':
      return {
        ...state,
        conflicts: state.conflicts.filter(
          conflict => !arraysEqual(conflict.systems, action.payload.systems)
        )
      };

    case 'RECALCULATE_METRICS':
      return {
        ...state,
        metrics: calculateFacilityMetrics(state.systems),
        lastCalculated: new Date()
      };

    case 'VALIDATE_DESIGN':
      const conflicts = validateSystemCompatibility(state.systems);
      return {
        ...state,
        conflicts,
        isValidated: conflicts.length === 0,
        lastCalculated: new Date()
      };

    case 'RESET_FACILITY':
      return initialState;

    default:
      return state;
  }
}

// Helper functions
function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

function calculateFacilityMetrics(systems: Record<string, FacilitySystem>): FacilityMetrics {
  const systemArray = Object.values(systems);
  
  const totalElectricalLoad = systemArray.reduce((sum, sys) => sum + sys.loads.electrical, 0);
  const totalThermalLoad = systemArray.reduce((sum, sys) => sum + sys.loads.thermal, 0);
  const totalStructuralLoad = systemArray.reduce((sum, sys) => sum + sys.loads.structural, 0);
  const totalWaterFlow = systemArray.reduce((sum, sys) => sum + sys.loads.water, 0);
  
  const totalCost = systemArray.reduce((sum, sys) => ({
    equipment: sum.equipment + sys.costs.equipment,
    installation: sum.installation + sys.costs.installation,
    maintenance: sum.maintenance + sys.costs.maintenance,
    energy: sum.energy + sys.costs.energy
  }), { equipment: 0, installation: 0, maintenance: 0, energy: 0 });

  // Calculate energy efficiency (simplified)
  const totalArea = 1000; // TODO: Get from room context
  const energyEfficiency = totalElectricalLoad * 8760 / 1000 / totalArea; // kWh/sq ft/year

  // Calculate ROI (simplified)
  const totalInvestment = totalCost.equipment + totalCost.installation;
  const annualSavings = totalCost.energy * 0.2; // Assume 20% energy savings
  const paybackPeriod = totalInvestment / annualSavings;

  return {
    totalElectricalLoad,
    totalThermalLoad,
    totalStructuralLoad,
    totalWaterFlow,
    totalCost,
    totalArea,
    energyEfficiency,
    roi: {
      paybackPeriod,
      npv: annualSavings * 10 - totalInvestment, // 10-year NPV simplified
      irr: annualSavings / totalInvestment * 100
    },
    sustainabilityScore: calculateSustainabilityScore(systems)
  };
}

function calculateSustainabilityScore(systems: Record<string, FacilitySystem>): number {
  // Simplified sustainability scoring
  let score = 50; // Base score
  
  // Bonus for energy efficiency
  const hvacSystem = Object.values(systems).find(s => s.type === 'hvac');
  if (hvacSystem && hvacSystem.data?.efficiency > 16) score += 20;
  
  // Bonus for water conservation
  const irrigationSystem = Object.values(systems).find(s => s.type === 'irrigation');
  if (irrigationSystem && irrigationSystem.data?.waterEfficiency > 0.8) score += 15;
  
  // Bonus for renewable energy integration
  const electricalSystem = Object.values(systems).find(s => s.type === 'electrical');
  if (electricalSystem && electricalSystem.data?.renewablePercentage > 0.3) score += 15;
  
  return Math.min(100, score);
}

function validateSystemCompatibility(systems: Record<string, FacilitySystem>): SystemConflict[] {
  const conflicts: SystemConflict[] = [];
  const systemArray = Object.values(systems);
  
  // Check electrical capacity conflicts
  const totalElectricalLoad = systemArray.reduce((sum, sys) => sum + sys.loads.electrical, 0);
  if (totalElectricalLoad > 50000) { // 50kW limit example
    conflicts.push({
      systems: systemArray.filter(s => s.loads.electrical > 0).map(s => s.id),
      conflictType: 'capacity',
      severity: 'high',
      description: `Total electrical load (${totalElectricalLoad}W) exceeds facility capacity (50kW)`,
      resolution: 'Consider load balancing or electrical service upgrade'
    });
  }
  
  // Check structural load conflicts
  const totalStructuralLoad = systemArray.reduce((sum, sys) => sum + sys.loads.structural, 0);
  if (totalStructuralLoad > 100000) { // 100k lbs limit example
    conflicts.push({
      systems: systemArray.filter(s => s.loads.structural > 0).map(s => s.id),
      conflictType: 'capacity',
      severity: 'critical',
      description: `Total structural load (${totalStructuralLoad} lbs) exceeds building capacity`,
      resolution: 'Structural reinforcement required or reduce equipment density'
    });
  }
  
  // Check space allocation conflicts
  // TODO: Add spatial conflict detection
  
  return conflicts;
}

interface FacilityDesignContextValue {
  state: FacilityDesignState;
  dispatch: React.Dispatch<FacilityDesignAction>;
  // Helper methods
  updateSystem: (systemId: string, updates: Partial<FacilitySystem>) => void;
  addSystemDependency: (dependency: SystemDependency) => void;
  removeSystemDependency: (fromSystem: string, toSystem: string) => void;
  recalculateMetrics: () => void;
  validateDesign: () => void;
  getSystemDependencies: (systemId: string) => SystemDependency[];
  getSystemConflicts: (systemId: string) => SystemConflict[];
  exportFacilityReport: () => any;
  optimizeFacility: () => any[];
}

const FacilityDesignContext = createContext<FacilityDesignContextValue | undefined>(undefined);

export function FacilityDesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(facilityDesignReducer, initialState);
  const { state: designerState } = useDesigner();

  // Auto-recalculate when systems change
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'RECALCULATE_METRICS' });
    }, 1000); // Debounce recalculation

    return () => clearTimeout(timer);
  }, [state.systems]);

  const updateSystem = useCallback((systemId: string, updates: Partial<FacilitySystem>) => {
    dispatch({ type: 'UPDATE_SYSTEM', payload: { systemId, updates } });
  }, []);

  const addSystemDependency = useCallback((dependency: SystemDependency) => {
    dispatch({ type: 'ADD_DEPENDENCY', payload: dependency });
  }, []);

  const removeSystemDependency = useCallback((fromSystem: string, toSystem: string) => {
    dispatch({ type: 'REMOVE_DEPENDENCY', payload: { fromSystem, toSystem } });
  }, []);

  const recalculateMetrics = useCallback(() => {
    dispatch({ type: 'RECALCULATE_METRICS' });
  }, []);

  const validateDesign = useCallback(() => {
    dispatch({ type: 'VALIDATE_DESIGN' });
  }, []);

  const getSystemDependencies = useCallback((systemId: string) => {
    return state.dependencies.filter(dep => dep.fromSystem === systemId || dep.toSystem === systemId);
  }, [state.dependencies]);

  const getSystemConflicts = useCallback((systemId: string) => {
    return state.conflicts.filter(conflict => conflict.systems.includes(systemId));
  }, [state.conflicts]);

  const exportFacilityReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      facility: {
        area: designerState.room.width * designerState.room.height,
        type: designerState.room.roomType,
        dimensions: `${designerState.room.width}' x ${designerState.room.height}' x ${designerState.room.ceilingHeight || 10}'`
      },
      systems: state.systems,
      metrics: state.metrics,
      dependencies: state.dependencies,
      conflicts: state.conflicts,
      validation: {
        isValid: state.isValidated,
        lastValidated: state.lastCalculated,
        criticalIssues: state.conflicts.filter(c => c.severity === 'critical').length
      },
      recommendations: state.optimizationSuggestions
    };
  }, [state, designerState.room]);

  const optimizeFacility = useCallback(() => {
    const suggestions = [];
    
    // Energy efficiency suggestions
    if (state.metrics.energyEfficiency > 20) {
      suggestions.push({
        type: 'energy',
        priority: 'high',
        description: 'Consider LED retrofit to reduce energy consumption by 40%',
        impact: { energy: -40, cost: 15000 }
      });
    }

    // Load balancing suggestions
    if (state.metrics.totalElectricalLoad > 40000) {
      suggestions.push({
        type: 'electrical',
        priority: 'medium',
        description: 'Implement load scheduling to reduce peak demand',
        impact: { peakLoad: -20, cost: 5000 }
      });
    }

    // Space optimization suggestions
    const structuralSystem = Object.values(state.systems).find(s => s.type === 'structural');
    if (structuralSystem && structuralSystem.loads.structural > 80000) {
      suggestions.push({
        type: 'structural',
        priority: 'high',
        description: 'Consider lightweight materials to reduce structural load',
        impact: { structuralLoad: -25, cost: 10000 }
      });
    }

    return suggestions;
  }, [state]);

  const value: FacilityDesignContextValue = {
    state,
    dispatch,
    updateSystem,
    addSystemDependency,
    removeSystemDependency,
    recalculateMetrics,
    validateDesign,
    getSystemDependencies,
    getSystemConflicts,
    exportFacilityReport,
    optimizeFacility
  };

  return (
    <FacilityDesignContext.Provider value={value}>
      {children}
    </FacilityDesignContext.Provider>
  );
}

export function useFacilityDesign() {
  const context = useContext(FacilityDesignContext);
  if (context === undefined) {
    throw new Error('useFacilityDesign must be used within a FacilityDesignProvider');
  }
  return context;
}

// Export types for use in other components
export type { FacilitySystem, SystemLoad, SystemCost, FacilityMetrics, SystemDependency, SystemConflict };