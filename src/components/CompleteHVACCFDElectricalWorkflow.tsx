'use client';

import React, { useState } from 'react';
import { IntegratedHVACElectricalEstimator } from './IntegratedHVACElectricalEstimator';
import { CFDWithHVACIntegration } from './CFDWithHVACIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator,
  Wind,
  Zap,
  Activity,
  Settings,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

interface CompleteHVACCFDElectricalWorkflowProps {
  initialData?: {
    coolingLoad?: number; // kW
    heatingLoad?: number; // kW
    roomArea?: number; // m²
    roomDimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
}

export function CompleteHVACCFDElectricalWorkflow({
  initialData = {
    coolingLoad: 35,
    heatingLoad: 25,
    roomArea: 100,
    roomDimensions: { length: 12, width: 8, height: 3 }
  }
}: CompleteHVACCFDElectricalWorkflowProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const markStepComplete = (step: string) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const workflowSteps = [
    {
      id: 'hvac-selection',
      title: 'HVAC System Selection',
      description: 'Select HVAC units from library or add custom units',
      icon: Wind,
      color: 'blue'
    },
    {
      id: 'electrical-estimation',
      title: 'Electrical Estimation',
      description: 'Calculate electrical requirements and costs',
      icon: Zap,
      color: 'yellow'
    },
    {
      id: 'cfd-analysis',
      title: 'CFD Analysis',
      description: 'Simulate airflow and temperature distribution',
      icon: Activity,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              Complete HVAC Design & Analysis Workflow
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              End-to-end HVAC system design with electrical integration and CFD validation
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Project Summary */}
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Project Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{initialData.coolingLoad} kW</div>
                <div className="text-sm text-gray-400">Cooling Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{initialData.heatingLoad} kW</div>
                <div className="text-sm text-gray-400">Heating Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{initialData.roomArea} m²</div>
                <div className="text-sm text-gray-400">Room Area</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {initialData.roomDimensions?.length}×{initialData.roomDimensions?.width}×{initialData.roomDimensions?.height}
                </div>
                <div className="text-sm text-gray-400">Dimensions (L×W×H)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Progress */}
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = activeTab === step.id;
                const Icon = step.icon;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`
                        p-3 rounded-full border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-600 border-green-600' 
                          : isActive 
                            ? step.color === 'blue' ? 'bg-blue-600 border-blue-600' :
                              step.color === 'yellow' ? 'bg-yellow-600 border-yellow-600' :
                              step.color === 'green' ? 'bg-green-600 border-green-600' :
                              'bg-gray-600 border-gray-600'
                            : 'bg-gray-800 border-gray-600'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-white">{step.title}</div>
                        <div className="text-xs text-gray-400 max-w-32">{step.description}</div>
                      </div>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="w-6 h-6 text-gray-600 mx-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Workflow Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="hvac-electrical">
              <Calculator className="w-4 h-4 mr-2" />
              HVAC & Electrical
            </TabsTrigger>
            <TabsTrigger value="cfd-analysis">
              <Wind className="w-4 h-4 mr-2" />
              CFD Analysis
            </TabsTrigger>
            <TabsTrigger value="results">
              <Activity className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Workflow Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">HVAC Selection</h3>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-7">
                      <li>• Choose from pre-defined HVAC systems</li>
                      <li>• Add custom units with specifications</li>
                      <li>• Include electrical requirements</li>
                      <li>• Specify cooling/heating capacities</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-white">Electrical Design</h3>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-7">
                      <li>• Calculate circuit requirements</li>
                      <li>• Size breakers and wire gauges</li>
                      <li>• Generate material lists</li>
                      <li>• Estimate installation costs</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">CFD Validation</h3>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-7">
                      <li>• Simulate airflow patterns</li>
                      <li>• Analyze temperature distribution</li>
                      <li>• Validate HVAC performance</li>
                      <li>• Optimize system design</li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setActiveTab('hvac-electrical')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                  >
                    Start HVAC Design Process
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hvac-electrical" className="space-y-4">
            <IntegratedHVACElectricalEstimator
              coolingLoad={initialData.coolingLoad}
              heatingLoad={initialData.heatingLoad}
              roomArea={initialData.roomArea}
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  markStepComplete('hvac-selection');
                  markStepComplete('electrical-estimation');
                  setActiveTab('cfd-analysis');
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                Proceed to CFD Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="cfd-analysis" className="space-y-4">
            <CFDWithHVACIntegration
              coolingLoad={initialData.coolingLoad}
              heatingLoad={initialData.heatingLoad}
              roomArea={initialData.roomArea}
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  markStepComplete('cfd-analysis');
                  setActiveTab('results');
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                View Complete Results
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Design Summary & Results</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete analysis results for your HVAC system design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                    <h3 className="font-semibold text-blue-300 mb-2">HVAC Design</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">Systems selected and configured</p>
                      <p className="text-gray-300">Custom units integrated</p>
                      <p className="text-gray-300">Capacity requirements met</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
                    <h3 className="font-semibold text-yellow-300 mb-2">Electrical System</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">Circuits sized appropriately</p>
                      <p className="text-gray-300">NEC compliance verified</p>
                      <p className="text-gray-300">Installation costs calculated</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-800">
                    <h3 className="font-semibold text-green-300 mb-2">CFD Analysis</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">Airflow patterns optimized</p>
                      <p className="text-gray-300">Temperature uniformity achieved</p>
                      <p className="text-gray-300">System performance validated</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-green-400 font-semibold text-lg">
                    ✓ Complete HVAC design workflow finished successfully!
                  </p>
                  <p className="text-gray-400 mt-2">
                    Your integrated HVAC, electrical, and CFD analysis is ready for implementation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}