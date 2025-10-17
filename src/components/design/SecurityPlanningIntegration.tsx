"use client"

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Camera, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Eye,
  Settings,
  FileText,
  Download,
  Plus,
  Layers,
  Target,
  Users,
  Clock
} from 'lucide-react';

import { SecurityZoneDefinition, SecurityControl, SecurityControlType } from '@/lib/security/security-planning';

interface SecurityPlanningIntegrationProps {
  facilityLayout: any; // This would be the CAD/design layout data
  onSecurityZoneUpdate: (zones: SecurityZoneDefinition[]) => void;
  onSecurityControlUpdate: (controls: SecurityControl[]) => void;
}

export default function SecurityPlanningIntegration({
  facilityLayout,
  onSecurityZoneUpdate,
  onSecurityControlUpdate
}: SecurityPlanningIntegrationProps) {
  const [securityZones, setSecurityZones] = useState<SecurityZoneDefinition[]>([]);
  const [securityControls, setSecurityControls] = useState<SecurityControl[]>([]);
  const [selectedZone, setSelectedZone] = useState<SecurityZoneDefinition | null>(null);
  const [activeMode, setActiveMode] = useState<'zones' | 'controls' | 'assessment'>('zones');
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    // Initialize security zones and controls based on facility layout
    initializeSecurityComponents();
  }, [facilityLayout]);

  const initializeSecurityComponents = () => {
    // Create default security zones based on common facility areas
    const defaultZones: SecurityZoneDefinition[] = [
      {
        id: 'zone-entrance',
        name: 'Main Entrance',
        type: 'Public' as any,
        securityLevel: 'Low' as any,
        purpose: 'Public access and visitor reception',
        threatLevel: 'Low' as any,
        boundaries: [],
        entryPoints: [],
        exitPoints: [],
        requiredControls: [
          {
            id: 'ctrl-entrance-1',
            type: SecurityControlType.Physical,
            description: 'Reception desk with visitor log',
            implementation: 'Staffed reception area',
            effectiveness: 0.7,
            cost: 5000,
            maintenanceRequirements: ['Daily log review', 'Monthly training']
          },
          {
            id: 'ctrl-entrance-2',
            type: SecurityControlType.Technical,
            description: 'Surveillance cameras',
            implementation: 'IP cameras with recording',
            effectiveness: 0.8,
            cost: 3000,
            maintenanceRequirements: ['Weekly maintenance', 'Monthly review']
          }
        ],
        optionalControls: [],
        operatingHours: { start: '08:00', end: '18:00' } as any,
        occupancyLimits: { maximum: 20, current: 0 } as any,
        specialRequirements: ['Visitor badge issuance', 'Escort policy']
      },
      {
        id: 'zone-cultivation',
        name: 'Cultivation Areas',
        type: 'Cultivation' as any,
        securityLevel: 'High' as any,
        purpose: 'Plant cultivation and growing operations',
        threatLevel: 'High' as any,
        boundaries: [],
        entryPoints: [],
        exitPoints: [],
        requiredControls: [
          {
            id: 'ctrl-cultivation-1',
            type: SecurityControlType.Physical,
            description: 'Biometric access control',
            implementation: 'Fingerprint scanners on all doors',
            effectiveness: 0.95,
            cost: 8000,
            maintenanceRequirements: ['Monthly calibration', 'Quarterly enrollment review']
          },
          {
            id: 'ctrl-cultivation-2',
            type: SecurityControlType.Technical,
            description: '24/7 video surveillance',
            implementation: 'High-resolution cameras with motion detection',
            effectiveness: 0.9,
            cost: 15000,
            maintenanceRequirements: ['Weekly system check', 'Monthly storage review']
          },
          {
            id: 'ctrl-cultivation-3',
            type: SecurityControlType.Administrative,
            description: 'Access logging and monitoring',
            implementation: 'Real-time access logs with alerts',
            effectiveness: 0.85,
            cost: 2000,
            maintenanceRequirements: ['Daily log review', 'Weekly alert analysis']
          }
        ],
        optionalControls: [
          {
            id: 'ctrl-cultivation-opt-1',
            type: SecurityControlType.Technical,
            description: 'Environmental monitoring integration',
            implementation: 'Temperature/humidity sensors with security alerts',
            effectiveness: 0.7,
            cost: 5000,
            maintenanceRequirements: ['Monthly calibration']
          }
        ],
        operatingHours: { start: '06:00', end: '22:00' } as any,
        occupancyLimits: { maximum: 10, current: 0 } as any,
        specialRequirements: ['Cannabis license compliance', 'Inventory tracking', 'Waste management']
      },
      {
        id: 'zone-processing',
        name: 'Processing Areas',
        type: 'Processing' as any,
        securityLevel: 'Critical' as any,
        purpose: 'Product processing and packaging',
        threatLevel: 'High' as any,
        boundaries: [],
        entryPoints: [],
        exitPoints: [],
        requiredControls: [
          {
            id: 'ctrl-processing-1',
            type: SecurityControlType.Physical,
            description: 'Dual authentication access',
            implementation: 'Badge + PIN or biometric verification',
            effectiveness: 0.9,
            cost: 10000,
            maintenanceRequirements: ['Monthly system update', 'Quarterly user review']
          },
          {
            id: 'ctrl-processing-2',
            type: SecurityControlType.Technical,
            description: 'Inventory tracking cameras',
            implementation: 'Overhead cameras for product tracking',
            effectiveness: 0.85,
            cost: 12000,
            maintenanceRequirements: ['Weekly cleaning', 'Monthly calibration']
          }
        ],
        optionalControls: [],
        operatingHours: { start: '08:00', end: '20:00' } as any,
        occupancyLimits: { maximum: 8, current: 0 } as any,
        specialRequirements: ['Clean room protocols', 'Chain of custody tracking']
      },
      {
        id: 'zone-vault',
        name: 'Secure Vault',
        type: 'Vault' as any,
        securityLevel: 'Critical' as any,
        purpose: 'Secure storage of finished products',
        threatLevel: 'Very High' as any,
        boundaries: [],
        entryPoints: [],
        exitPoints: [],
        requiredControls: [
          {
            id: 'ctrl-vault-1',
            type: SecurityControlType.Physical,
            description: 'Time-delayed vault door',
            implementation: 'Commercial-grade vault with time delay',
            effectiveness: 0.95,
            cost: 25000,
            maintenanceRequirements: ['Monthly mechanism check', 'Quarterly lock service']
          },
          {
            id: 'ctrl-vault-2',
            type: SecurityControlType.Technical,
            description: 'Motion sensors and alarms',
            implementation: 'Integrated alarm system with monitoring',
            effectiveness: 0.9,
            cost: 8000,
            maintenanceRequirements: ['Weekly test', 'Monthly battery check']
          }
        ],
        optionalControls: [],
        operatingHours: { start: '09:00', end: '17:00' } as any,
        occupancyLimits: { maximum: 2, current: 0 } as any,
        specialRequirements: ['Dual person access', 'Inventory reconciliation']
      }
    ];

    setSecurityZones(defaultZones);
    
    // Flatten all controls from zones
    const allControls = defaultZones.flatMap(zone => 
      [...zone.requiredControls, ...zone.optionalControls]
    );
    setSecurityControls(allControls);
    
    // Calculate initial security score
    calculateSecurityScore(defaultZones);
  };

  const calculateSecurityScore = (zones: SecurityZoneDefinition[]) => {
    let totalScore = 0;
    let totalWeight = 0;
    
    zones.forEach(zone => {
      const zoneWeight = getZoneWeight(zone.securityLevel);
      const zoneScore = calculateZoneScore(zone);
      totalScore += zoneScore * zoneWeight;
      totalWeight += zoneWeight;
    });
    
    const overallScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    setSecurityScore(Math.round(overallScore));
  };

  const getZoneWeight = (securityLevel: string) => {
    switch (securityLevel) {
      case 'Critical': return 4;
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 1;
    }
  };

  const calculateZoneScore = (zone: SecurityZoneDefinition) => {
    if (zone.requiredControls.length === 0) return 0;
    
    const averageEffectiveness = zone.requiredControls.reduce((sum, control) => 
      sum + control.effectiveness, 0
    ) / zone.requiredControls.length;
    
    return averageEffectiveness;
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getControlTypeIcon = (type: SecurityControlType) => {
    switch (type) {
      case SecurityControlType.Physical:
        return <Lock className="w-4 h-4" />;
      case SecurityControlType.Technical:
        return <Camera className="w-4 h-4" />;
      case SecurityControlType.Administrative:
        return <FileText className="w-4 h-4" />;
      case SecurityControlType.Procedural:
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const addSecurityZone = () => {
    const newZone: SecurityZoneDefinition = {
      id: `zone-${Date.now()}`,
      name: 'New Security Zone',
      type: 'Restricted' as any,
      securityLevel: 'Medium' as any,
      purpose: 'Define the purpose of this security zone',
      threatLevel: 'Medium' as any,
      boundaries: [],
      entryPoints: [],
      exitPoints: [],
      requiredControls: [],
      optionalControls: [],
      operatingHours: { start: '08:00', end: '18:00' } as any,
      occupancyLimits: { maximum: 10, current: 0 } as any,
      specialRequirements: []
    };
    
    const updatedZones = [...securityZones, newZone];
    setSecurityZones(updatedZones);
    setSelectedZone(newZone);
    onSecurityZoneUpdate(updatedZones);
  };

  const generateSecurityReport = () => {
    const report = {
      facilityId: 'current-facility',
      securityScore,
      zones: securityZones,
      controls: securityControls,
      generatedAt: new Date().toISOString(),
      recommendations: generateSecurityRecommendations()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const generateSecurityRecommendations = () => {
    const recommendations: string[] = [];
    
    securityZones.forEach(zone => {
      if (zone.securityLevel === 'Critical' && zone.requiredControls.length < 3) {
        recommendations.push(`${zone.name}: Consider additional security controls for critical zone`);
      }
      
      const avgEffectiveness = zone.requiredControls.reduce((sum, ctrl) => 
        sum + ctrl.effectiveness, 0
      ) / zone.requiredControls.length;
      
      if (avgEffectiveness < 0.8) {
        recommendations.push(`${zone.name}: Improve security control effectiveness`);
      }
    });
    
    return recommendations;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Security Planning</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Security Score:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                securityScore >= 80 ? 'bg-green-100 text-green-800' :
                securityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {securityScore}%
              </span>
            </div>
            <button
              onClick={generateSecurityReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Plan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Mode Selection */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'zones', label: 'Security Zones', icon: MapPin },
            { id: 'controls', label: 'Security Controls', icon: Settings },
            { id: 'assessment', label: 'Risk Assessment', icon: AlertTriangle }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeMode === mode.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Security Zones Mode */}
        {activeMode === 'zones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Security Zones</h3>
              <button
                onClick={addSecurityZone}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Zone</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityZones.map(zone => (
                <div
                  key={zone.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedZone?.id === zone.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{zone.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityLevelColor(zone.securityLevel)}`}>
                      {zone.securityLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{zone.purpose}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Required Controls:</span>
                      <span className="font-medium">{zone.requiredControls.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Effectiveness:</span>
                      <span className="font-medium">
                        {zone.requiredControls.length > 0 
                          ? Math.round((zone.requiredControls.reduce((sum, ctrl) => sum + ctrl.effectiveness, 0) / zone.requiredControls.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone Details */}
            {selectedZone && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Zone Details: {selectedZone.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Required Controls</h5>
                    <div className="space-y-2">
                      {selectedZone.requiredControls.map(control => (
                        <div key={control.id} className="flex items-center space-x-2 text-sm">
                          {getControlTypeIcon(control.type)}
                          <span className="text-gray-900">{control.description}</span>
                          <span className="text-gray-500">({Math.round(control.effectiveness * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Special Requirements</h5>
                    <div className="space-y-1">
                      {selectedZone.specialRequirements.map((req, index) => (
                        <div key={index} className="text-sm text-gray-600">• {req}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Controls Mode */}
        {activeMode === 'controls' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Security Controls</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Control
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effectiveness
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Implementation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityControls.map(control => (
                    <tr key={control.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getControlTypeIcon(control.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {control.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {control.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${control.effectiveness * 100}%` }}
                            />
                          </div>
                          {Math.round(control.effectiveness * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${control.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {control.implementation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Risk Assessment Mode */}
        {activeMode === 'assessment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-900">High Risk Areas</h4>
                </div>
                <div className="space-y-2">
                  {securityZones.filter(zone => zone.threatLevel === 'High' || zone.threatLevel === 'Very High').map(zone => (
                    <div key={zone.id} className="text-sm text-red-700">
                      • {zone.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Medium Risk Areas</h4>
                </div>
                <div className="space-y-2">
                  {securityZones.filter(zone => zone.threatLevel === 'Medium').map(zone => (
                    <div key={zone.id} className="text-sm text-yellow-700">
                      • {zone.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Low Risk Areas</h4>
                </div>
                <div className="space-y-2">
                  {securityZones.filter(zone => zone.threatLevel === 'Low').map(zone => (
                    <div key={zone.id} className="text-sm text-green-700">
                      • {zone.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Security Recommendations</h4>
              <div className="space-y-2">
                {generateSecurityRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}