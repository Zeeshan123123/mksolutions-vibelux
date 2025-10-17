'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertTriangle, 
  Zap, 
  Wrench, 
  Wifi, 
  TestTube,
  FileCheck,
  X,
  HelpCircle
} from 'lucide-react';

interface EquipmentInstallationWizardProps {
  equipmentType: 'fixture' | 'sensor' | 'controller' | 'hvac' | 'irrigation';
  onComplete: (installationData: any) => void;
  onClose: () => void;
}

export function EquipmentInstallationWizard({ 
  equipmentType, 
  onComplete, 
  onClose 
}: EquipmentInstallationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    equipment: {
      model: '',
      serialNumber: '',
      location: '',
      mountingHeight: 0
    },
    safety: {
      powerOff: false,
      safetyGear: false,
      areaCleared: false
    },
    physical: {
      mounted: false,
      positioned: false,
      secured: false
    },
    electrical: {
      powerConnected: false,
      groundConnected: false,
      voltageChecked: false,
      currentDraw: 0
    },
    network: {
      connected: false,
      ipAddress: '',
      signalStrength: 0
    },
    testing: {
      powerOn: false,
      functionality: false,
      calibration: false,
      dataLogging: false
    },
    documentation: {
      warrantyRegistered: false,
      manualDownloaded: false,
      maintenanceScheduled: false
    }
  });

  const totalSteps = 6;

  const steps = [
    {
      id: 1,
      title: 'Equipment Info',
      icon: FileCheck,
      description: 'Verify equipment details and prepare for installation'
    },
    {
      id: 2,
      title: 'Safety Check',
      icon: AlertTriangle,
      description: 'Complete safety preparations before starting'
    },
    {
      id: 3,
      title: 'Physical Install',
      icon: Wrench,
      description: 'Mount and position equipment properly'
    },
    {
      id: 4,
      title: 'Electrical Setup',
      icon: Zap,
      description: 'Connect power and verify electrical safety'
    },
    {
      id: 5,
      title: 'Network Config',
      icon: Wifi,
      description: 'Configure network connectivity and communication'
    },
    {
      id: 6,
      title: 'Testing & Docs',
      icon: TestTube,
      description: 'Test functionality and complete documentation'
    }
  ];

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return formData.equipment.model && formData.equipment.serialNumber && formData.equipment.location;
      case 2:
        return formData.safety.powerOff && formData.safety.safetyGear && formData.safety.areaCleared;
      case 3:
        return formData.physical.mounted && formData.physical.positioned && formData.physical.secured;
      case 4:
        return formData.electrical.powerConnected && formData.electrical.groundConnected && formData.electrical.voltageChecked;
      case 5:
        return formData.network.connected && formData.network.ipAddress;
      case 6:
        return formData.testing.powerOn && formData.testing.functionality && formData.documentation.warrantyRegistered;
      default:
        return false;
    }
  };

  const canProceed = (): boolean => {
    return isStepComplete(currentStep);
  };

  const nextStep = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (isStepComplete(currentStep)) {
      onComplete({
        ...formData,
        installationDate: new Date().toISOString(),
        installedBy: 'Current User', // In production, get from auth
        status: 'completed'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Equipment Model/Part Number *
              </label>
              <input
                type="text"
                value={formData.equipment.model}
                onChange={(e) => updateFormData('equipment', 'model', e.target.value)}
                placeholder="e.g., VibeLux Pro 600W"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.equipment.serialNumber}
                onChange={(e) => updateFormData('equipment', 'serialNumber', e.target.value)}
                placeholder="Found on equipment label"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Installation Location *
              </label>
              <input
                type="text"
                value={formData.equipment.location}
                onChange={(e) => updateFormData('equipment', 'location', e.target.value)}
                placeholder="e.g., Zone A, Row 3, Position 2"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mounting Height (feet)
              </label>
              <input
                type="number"
                value={formData.equipment.mountingHeight}
                onChange={(e) => updateFormData('equipment', 'mountingHeight', parseFloat(e.target.value))}
                placeholder="8"
                min="0"
                max="20"
                step="0.5"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Safety First - Complete ALL Items Before Proceeding
              </h4>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.safety.powerOff}
                  onChange={(e) => updateFormData('safety', 'powerOff', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Power circuit turned OFF at breaker</div>
                  <div className="text-gray-400 text-sm">Verify with multimeter - 0V at installation point</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.safety.safetyGear}
                  onChange={(e) => updateFormData('safety', 'safetyGear', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Safety equipment ready</div>
                  <div className="text-gray-400 text-sm">Safety glasses, gloves, proper ladder/lift</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.safety.areaCleared}
                  onChange={(e) => updateFormData('safety', 'areaCleared', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Work area cleared and secured</div>
                  <div className="text-gray-400 text-sm">Remove plants, tools, ensure stable work platform</div>
                </div>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.physical.mounted}
                  onChange={(e) => updateFormData('physical', 'mounted', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Equipment securely mounted</div>
                  <div className="text-gray-400 text-sm">Use appropriate mounting hardware for ceiling type</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.physical.positioned}
                  onChange={(e) => updateFormData('physical', 'positioned', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Positioned correctly over coverage area</div>
                  <div className="text-gray-400 text-sm">Check alignment with design layout</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.physical.secured}
                  onChange={(e) => updateFormData('physical', 'secured', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">All connections tight and secure</div>
                  <div className="text-gray-400 text-sm">Check mounting bolts, safety cables if required</div>
                </div>
              </label>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Installation Tip
              </h4>
              <p className="text-gray-300 text-sm">
                For optimal light distribution, maintain consistent spacing between fixtures. 
                Most fixtures perform best at 6-8 feet above plant canopy.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Electrical Safety Warning
              </h4>
              <p className="text-gray-300 text-sm">
                Verify power is OFF before making any electrical connections. 
                Follow local electrical codes and consider hiring a licensed electrician.
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.electrical.powerConnected}
                  onChange={(e) => updateFormData('electrical', 'powerConnected', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Power wires connected correctly</div>
                  <div className="text-gray-400 text-sm">Hot, neutral, ground - check wire colors match</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.electrical.groundConnected}
                  onChange={(e) => updateFormData('electrical', 'groundConnected', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Ground wire properly connected</div>
                  <div className="text-gray-400 text-sm">Essential for electrical safety</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.electrical.voltageChecked}
                  onChange={(e) => updateFormData('electrical', 'voltageChecked', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Voltage verified with multimeter</div>
                  <div className="text-gray-400 text-sm">Should match equipment specifications</div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Measured Current Draw (Amps)
              </label>
              <input
                type="number"
                value={formData.electrical.currentDraw}
                onChange={(e) => updateFormData('electrical', 'currentDraw', parseFloat(e.target.value))}
                placeholder="e.g., 2.5"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.network.connected}
                  onChange={(e) => updateFormData('network', 'connected', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Network connection established</div>
                  <div className="text-gray-400 text-sm">WiFi or Ethernet connection active</div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                IP Address *
              </label>
              <input
                type="text"
                value={formData.network.ipAddress}
                onChange={(e) => updateFormData('network', 'ipAddress', e.target.value)}
                placeholder="e.g., 192.168.1.100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Signal Strength (%)
              </label>
              <input
                type="number"
                value={formData.network.signalStrength}
                onChange={(e) => updateFormData('network', 'signalStrength', parseInt(e.target.value))}
                placeholder="85"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.testing.powerOn}
                  onChange={(e) => updateFormData('testing', 'powerOn', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Equipment powers on successfully</div>
                  <div className="text-gray-400 text-sm">No error lights or unusual sounds</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.testing.functionality}
                  onChange={(e) => updateFormData('testing', 'functionality', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Basic functionality test passed</div>
                  <div className="text-gray-400 text-sm">Light output, dimming, communication working</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documentation.warrantyRegistered}
                  onChange={(e) => updateFormData('documentation', 'warrantyRegistered', e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Warranty registered online</div>
                  <div className="text-gray-400 text-sm">Protects your investment</div>
                </div>
              </label>
            </div>
            
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Installation Complete!</h4>
              <p className="text-gray-300 text-sm">
                Your equipment is now installed and ready for operation. 
                Remember to schedule regular maintenance to ensure optimal performance.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              Equipment Installation Wizard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep || isStepComplete(step.id);
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isActive 
                        ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                        : 'border-gray-600 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-600 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Complete Installation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}