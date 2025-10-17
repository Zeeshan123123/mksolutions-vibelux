'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedCFDAnalysisPanel } from './EnhancedCFDAnalysisPanel';
import { HVACSystemSelector, HVACSystemType, CustomHVACUnit } from './HVACSystemSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wind,
  Thermometer,
  Info,
  Plus,
  Settings,
  CheckCircle
} from 'lucide-react';

// Extend the DomainObject type to include HVAC units
interface HVACDomainObject {
  id: string;
  name: string;
  type: 'hvac-unit';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  properties: {
    coolingCapacity: number; // kW
    airflow: number; // m³/s
    supplyTemperature: number; // °C
    returnTemperature: number; // °C
    efficiency: number; // COP
    manufacturer: string;
    model: string;
  };
}

interface CFDWithHVACIntegrationProps {
  coolingLoad?: number;
  heatingLoad?: number;
  roomArea?: number;
}

export function CFDWithHVACIntegration({
  coolingLoad = 35,
  heatingLoad = 25,
  roomArea = 100
}: CFDWithHVACIntegrationProps) {
  const [selectedHVACUnits, setSelectedHVACUnits] = useState<HVACDomainObject[]>([]);
  const [showHVACSelector, setShowHVACSelector] = useState(false);

  // Convert HVAC system selection to CFD domain object
  const handleHVACSystemSelect = (system: HVACSystemType) => {
    const hvacObject: HVACDomainObject = {
      id: `hvac-${Date.now()}`,
      name: system.name,
      type: 'hvac-unit',
      position: { x: 15, y: 10, z: 4 }, // Default position (can be adjusted)
      dimensions: { width: 2, height: 2, depth: 1 },
      properties: {
        coolingCapacity: system.capacityRange.min * 3.517, // tons to kW
        airflow: system.capacityRange.min * 0.566, // Estimate 400 CFM/ton to m³/s
        supplyTemperature: 13, // Default supply temp
        returnTemperature: 24, // Default return temp
        efficiency: system.efficiency.cooling.min,
        manufacturer: system.name.split(' ')[0],
        model: system.name
      }
    };
    
    setSelectedHVACUnits([...selectedHVACUnits, hvacObject]);
    setShowHVACSelector(false);
  };

  // Convert custom HVAC unit to CFD domain object
  const handleCustomUnitSelect = (customUnit: CustomHVACUnit) => {
    const hvacObject: HVACDomainObject = {
      id: `hvac-custom-${Date.now()}`,
      name: `${customUnit.manufacturer} ${customUnit.model}`,
      type: 'hvac-unit',
      position: { x: 15, y: 10, z: 4 }, // Default position
      dimensions: { 
        width: customUnit.physicalDimensions.width * (customUnit.physicalDimensions.unit === 'inches' ? 0.0254 : 0.001),
        height: customUnit.physicalDimensions.height * (customUnit.physicalDimensions.unit === 'inches' ? 0.0254 : 0.001),
        depth: customUnit.physicalDimensions.length * (customUnit.physicalDimensions.unit === 'inches' ? 0.0254 : 0.001)
      },
      properties: {
        coolingCapacity: customUnit.coolingCapacity * 3.517, // tons to kW
        airflow: customUnit.airflow.nominal * 0.000472, // CFM to m³/s
        supplyTemperature: 13,
        returnTemperature: 24,
        efficiency: customUnit.coolingEfficiency,
        manufacturer: customUnit.manufacturer,
        model: customUnit.model
      }
    };
    
    setSelectedHVACUnits([...selectedHVACUnits, hvacObject]);
    setShowHVACSelector(false);
  };

  // Update position of HVAC unit
  const updateHVACPosition = (id: string, position: { x: number; y: number; z: number }) => {
    setSelectedHVACUnits(units => 
      units.map(unit => 
        unit.id === id ? { ...unit, position } : unit
      )
    );
  };

  // Remove HVAC unit
  const removeHVACUnit = (id: string) => {
    setSelectedHVACUnits(units => units.filter(unit => unit.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HVAC Units Management */}
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">HVAC Units for CFD Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Add HVAC units to simulate airflow and temperature distribution
              </CardDescription>
            </div>
            <button
              onClick={() => setShowHVACSelector(!showHVACSelector)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add HVAC Unit
            </button>
          </div>
        </CardHeader>
        {selectedHVACUnits.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              {selectedHVACUnits.map(unit => (
                <div key={unit.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h4 className="text-white font-medium">{unit.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Cooling Capacity</p>
                          <p className="text-white">{(unit.properties.coolingCapacity / 3.517).toFixed(1)} tons</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Airflow</p>
                          <p className="text-white">{(unit.properties.airflow * 2118.88).toFixed(0)} CFM</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Supply Temp</p>
                          <p className="text-white">{unit.properties.supplyTemperature}°C</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Position</p>
                          <p className="text-white text-xs">
                            X:{unit.position.x.toFixed(1)}, Y:{unit.position.y.toFixed(1)}, Z:{unit.position.z.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          const newX = prompt('Enter X position (m):', unit.position.x.toString());
                          const newY = prompt('Enter Y position (m):', unit.position.y.toString());
                          const newZ = prompt('Enter Z position (m):', unit.position.z.toString());
                          if (newX && newY && newZ) {
                            updateHVACPosition(unit.id, {
                              x: parseFloat(newX),
                              y: parseFloat(newY),
                              z: parseFloat(newZ)
                            });
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Edit Position"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeHVACUnit(unit.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* HVAC Selector Modal */}
      {showHVACSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Select HVAC System</h2>
                <button
                  onClick={() => setShowHVACSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <HVACSystemSelector
                coolingLoad={coolingLoad}
                heatingLoad={heatingLoad}
                roomArea={roomArea}
                onSystemSelect={handleHVACSystemSelect}
                onCustomUnitSelect={handleCustomUnitSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CFD Analysis Panel with HVAC Integration */}
      <EnhancedCFDAnalysisPanel 
        initialHVACUnits={selectedHVACUnits}
      />

      {/* Info Card */}
      <Card className="bg-blue-900/20 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Info className="w-5 h-5" />
            HVAC Integration with CFD
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>• HVAC units are automatically converted to inlet/outlet boundary conditions</p>
          <p>• Supply air diffusers are placed based on unit airflow and temperature</p>
          <p>• Return air paths are calculated based on room geometry</p>
          <p>• Custom units use actual specifications for accurate simulation</p>
          <p>• Results show temperature distribution and air velocity patterns</p>
        </CardContent>
      </Card>
    </div>
  );
}