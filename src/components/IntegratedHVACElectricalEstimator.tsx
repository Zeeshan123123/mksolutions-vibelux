'use client';

import React, { useState } from 'react';
import { HVACSystemSelector, CustomHVACUnit, HVACSystemType } from './HVACSystemSelector';
import { ElectricalEstimator } from './ElectricalEstimator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator,
  Zap,
  Wind,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface IntegratedHVACElectricalEstimatorProps {
  coolingLoad?: number; // kW
  heatingLoad?: number; // kW
  roomArea?: number; // m²
}

export function IntegratedHVACElectricalEstimator({
  coolingLoad = 35,
  heatingLoad = 25,
  roomArea = 100
}: IntegratedHVACElectricalEstimatorProps) {
  const [selectedHVACUnits, setSelectedHVACUnits] = useState<Array<{
    id: string;
    manufacturer: string;
    model: string;
    coolingCapacity: number;
    electricalSpecs: {
      voltage: number;
      phase: 1 | 3;
      minCircuitAmpacity: number;
      maxOvercurrentProtection: number;
      fanPowerConsumption: number;
    };
    quantity: number;
    enabled: boolean;
  }>>([]);

  const [activeTab, setActiveTab] = useState('hvac');

  // Handle HVAC system selection (from library)
  const handleSystemSelect = (system: HVACSystemType) => {
    // Convert library system to electrical estimator format
    const hvacUnit = {
      id: system.id,
      manufacturer: system.name.split(' ')[0] || 'Unknown',
      model: system.name,
      coolingCapacity: system.capacityRange.min, // Use min capacity as default
      electricalSpecs: {
        voltage: 460, // Default voltage
        phase: 3 as const,
        minCircuitAmpacity: Math.round(system.capacityRange.min * 3.5), // Estimate based on tonnage
        maxOvercurrentProtection: Math.round(system.capacityRange.min * 4.5),
        fanPowerConsumption: Math.round(system.capacityRange.min * 1000) // Estimate 1kW per ton
      },
      quantity: 1,
      enabled: true
    };

    setSelectedHVACUnits([...selectedHVACUnits, hvacUnit]);
  };

  // Handle custom HVAC unit addition
  const handleCustomUnitSelect = (customUnit: CustomHVACUnit) => {
    const hvacUnit = {
      id: `custom-${Date.now()}`,
      manufacturer: customUnit.manufacturer,
      model: customUnit.model,
      coolingCapacity: customUnit.coolingCapacity,
      electricalSpecs: {
        voltage: customUnit.electricalSpecs.voltage,
        phase: customUnit.electricalSpecs.phase,
        minCircuitAmpacity: customUnit.electricalSpecs.minCircuitAmpacity,
        maxOvercurrentProtection: customUnit.electricalSpecs.maxOvercurrentProtection,
        fanPowerConsumption: customUnit.electricalSpecs.fanPowerConsumption
      },
      quantity: 1,
      enabled: true
    };

    setSelectedHVACUnits([...selectedHVACUnits, hvacUnit]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg">
              <Wind className="w-6 h-6 text-white" />
            </div>
            Integrated HVAC & Electrical Estimator
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select HVAC equipment and automatically calculate electrical requirements
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selected Units Summary */}
      {selectedHVACUnits.length > 0 && (
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Selected HVAC Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedHVACUnits.map((unit, index) => (
                <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">{unit.manufacturer} {unit.model}</p>
                      <p className="text-sm text-gray-400">
                        {unit.coolingCapacity} tons • {unit.electricalSpecs.voltage}V • 
                        {unit.electricalSpecs.minCircuitAmpacity}A MCA
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedHVACUnits(selectedHVACUnits.filter((_, i) => i !== index));
                    }}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Total Cooling Capacity: {selectedHVACUnits.reduce((sum, unit) => sum + unit.coolingCapacity * unit.quantity, 0)} tons
              </p>
              <p className="text-sm text-gray-400">
                Total Electrical Load: {selectedHVACUnits.reduce((sum, unit) => {
                  const power = unit.electricalSpecs.phase === 3 
                    ? unit.electricalSpecs.voltage * unit.electricalSpecs.minCircuitAmpacity * Math.sqrt(3) * 0.8 / 1000
                    : unit.electricalSpecs.voltage * unit.electricalSpecs.minCircuitAmpacity / 1000;
                  return sum + power * unit.quantity;
                }, 0).toFixed(1)} kW
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for HVAC Selection and Electrical Estimation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="hvac" className="data-[state=active]:bg-gray-700">
            <Wind className="w-4 h-4 mr-2" />
            HVAC Selection
          </TabsTrigger>
          <TabsTrigger value="electrical" className="data-[state=active]:bg-gray-700">
            <Zap className="w-4 h-4 mr-2" />
            Electrical Estimation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hvac" className="space-y-4">
          <HVACSystemSelector
            coolingLoad={coolingLoad}
            heatingLoad={heatingLoad}
            roomArea={roomArea}
            onSystemSelect={handleSystemSelect}
            onCustomUnitSelect={handleCustomUnitSelect}
          />
          {selectedHVACUnits.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setActiveTab('electrical')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-lg text-white font-medium transition-all"
              >
                Proceed to Electrical Estimation
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="electrical" className="space-y-4">
          <ElectricalEstimator
            initialHVACEquipment={selectedHVACUnits}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}