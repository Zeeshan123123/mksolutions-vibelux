'use client';

import React, { useState, useEffect } from 'react';
import {
  Map,
  Lightbulb,
  Settings,
  Save,
  RefreshCw,
  ArrowRight,
  Grid3X3,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Move3D,
  Layers,
  Filter,
  Search
} from 'lucide-react';

interface Fixture {
  id: string;
  name: string;
  model: string;
  wattage: number;
  ppf: number;
  x: number;
  y: number;
  zoneId?: string;
  hlpDeviceId?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen?: Date;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  type: string;
  area: number;
  maxFixtures: number;
  fixtures: Fixture[];
  controlAuthority: {
    lighting: 'bms' | 'hmi' | 'manual';
  };
}

interface AssignmentRule {
  id: string;
  name: string;
  criteria: {
    fixtureType?: string;
    wattageRange?: { min: number; max: number };
    locationArea?: { x1: number; y1: number; x2: number; y2: number };
    maxPerZone?: number;
  };
  targetZone: string;
  priority: number;
  enabled: boolean;
}

const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'f1',
    name: 'LED Panel 1',
    model: 'VibeLux Pro-400',
    wattage: 400,
    ppf: 1000,
    x: 25,
    y: 30,
    zoneId: 'zone-1',
    hlpDeviceId: 'hlp-001',
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: 'f2',
    name: 'LED Panel 2',
    model: 'VibeLux Pro-400',
    wattage: 400,
    ppf: 1000,
    x: 45,
    y: 30,
    hlpDeviceId: 'hlp-002',
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: 'f3',
    name: 'LED Strip 1',
    model: 'VibeLux Strip-200',
    wattage: 200,
    ppf: 500,
    x: 75,
    y: 60,
    zoneId: 'zone-2',
    hlpDeviceId: 'hlp-003',
    status: 'offline',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'f4',
    name: 'LED Panel 3',
    model: 'VibeLux Pro-600',
    wattage: 600,
    ppf: 1500,
    x: 35,
    y: 70,
    status: 'online',
    lastSeen: new Date()
  }
];

const MOCK_ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Vegetative Growth',
    color: '#10b981',
    type: 'vegetative',
    area: 100,
    maxFixtures: 8,
    fixtures: [],
    controlAuthority: { lighting: 'hmi' }
  },
  {
    id: 'zone-2',
    name: 'Flowering Room',
    color: '#8b5cf6',
    type: 'flowering',
    area: 150,
    maxFixtures: 12,
    fixtures: [],
    controlAuthority: { lighting: 'bms' }
  },
  {
    id: 'zone-3',
    name: 'Nursery',
    color: '#f59e0b',
    type: 'nursery',
    area: 75,
    maxFixtures: 6,
    fixtures: [],
    controlAuthority: { lighting: 'manual' }
  }
];

export function ZoneAssignmentInterface() {
  const [fixtures, setFixtures] = useState<Fixture[]>(MOCK_FIXTURES);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [unassignedFixtures, setUnassignedFixtures] = useState<Fixture[]>([]);
  const [selectedFixtures, setSelectedFixtures] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'rules' | 'bulk'>('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'unassigned'>('all');

  useEffect(() => {
    // Update zones with their fixtures and find unassigned
    const updatedZones = zones.map(zone => ({
      ...zone,
      fixtures: fixtures.filter(f => f.zoneId === zone.id)
    }));
    setZones(updatedZones);

    const unassigned = fixtures.filter(f => !f.zoneId);
    setUnassignedFixtures(unassigned);
  }, [fixtures]);

  // Filter fixtures based on search and status
  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = fixture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fixture.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'online' && fixture.status === 'online') ||
                         (filterStatus === 'offline' && fixture.status === 'offline') ||
                         (filterStatus === 'unassigned' && !fixture.zoneId);
    
    return matchesSearch && matchesStatus;
  });

  // Assign fixtures to zone
  const assignFixturesToZone = (fixtureIds: string[], zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Check capacity
    const currentCount = fixtures.filter(f => f.zoneId === zoneId).length;
    const newCount = fixtureIds.length;
    
    if (currentCount + newCount > zone.maxFixtures) {
      alert(`Zone capacity exceeded. Can only add ${zone.maxFixtures - currentCount} more fixtures.`);
      return;
    }

    setFixtures(prev => prev.map(f => 
      fixtureIds.includes(f.id) ? { ...f, zoneId } : f
    ));
    
    setSelectedFixtures([]);
    setSelectedZone('');
  };

  // Remove fixtures from zone
  const removeFixturesFromZone = (fixtureIds: string[]) => {
    setFixtures(prev => prev.map(f => 
      fixtureIds.includes(f.id) ? { ...f, zoneId: undefined } : f
    ));
    setSelectedFixtures([]);
  };

  // Auto-assign based on rules
  const autoAssignByRules = () => {
    let updatedFixtures = [...fixtures];
    
    // Sort rules by priority
    const sortedRules = assignmentRules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const eligibleFixtures = updatedFixtures.filter(fixture => {
        // Skip already assigned fixtures
        if (fixture.zoneId) return false;

        // Check criteria
        if (rule.criteria.fixtureType && !fixture.model.includes(rule.criteria.fixtureType)) {
          return false;
        }

        if (rule.criteria.wattageRange) {
          const { min, max } = rule.criteria.wattageRange;
          if (fixture.wattage < min || fixture.wattage > max) {
            return false;
          }
        }

        if (rule.criteria.locationArea) {
          const { x1, y1, x2, y2 } = rule.criteria.locationArea;
          if (fixture.x < x1 || fixture.x > x2 || fixture.y < y1 || fixture.y > y2) {
            return false;
          }
        }

        return true;
      });

      // Check zone capacity
      const targetZone = zones.find(z => z.id === rule.targetZone);
      if (!targetZone) continue;

      const currentInZone = updatedFixtures.filter(f => f.zoneId === rule.targetZone).length;
      const maxToAssign = Math.min(
        eligibleFixtures.length,
        targetZone.maxFixtures - currentInZone,
        rule.criteria.maxPerZone || Infinity
      );

      // Assign fixtures
      for (let i = 0; i < maxToAssign; i++) {
        updatedFixtures = updatedFixtures.map(f => 
          f.id === eligibleFixtures[i].id ? { ...f, zoneId: rule.targetZone } : f
        );
      }
    }

    setFixtures(updatedFixtures);
  };

  // Bulk operations
  const bulkAssignByType = (fixtureType: string, zoneId: string) => {
    const matchingFixtures = fixtures
      .filter(f => f.model.includes(fixtureType) && !f.zoneId)
      .map(f => f.id);
    
    if (matchingFixtures.length > 0) {
      assignFixturesToZone(matchingFixtures, zoneId);
    }
  };

  const bulkAssignByPower = (minWattage: number, maxWattage: number, zoneId: string) => {
    const matchingFixtures = fixtures
      .filter(f => f.wattage >= minWattage && f.wattage <= maxWattage && !f.zoneId)
      .map(f => f.id);
    
    if (matchingFixtures.length > 0) {
      assignFixturesToZone(matchingFixtures, zoneId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Zone Assignment Interface</h1>
            <p className="text-sm text-gray-400 mt-1">
              Assign fixtures to zones based on physical layout and operational requirements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={autoAssignByRules}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Auto-Assign
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <nav className="flex space-x-1">
          {[
            { id: 'manual', label: 'Manual Assignment', icon: Move3D },
            { id: 'rules', label: 'Assignment Rules', icon: Settings },
            { id: 'bulk', label: 'Bulk Operations', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id 
                    ? 'text-white bg-gray-950 border-t border-l border-r border-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Manual Assignment Tab */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Unassigned Fixtures */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Unassigned Fixtures ({unassignedFixtures.length})
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search fixtures..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm w-48"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredFixtures.filter(f => !f.zoneId).map(fixture => (
                  <div
                    key={fixture.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFixtures.includes(fixture.id)
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                    onClick={() => {
                      setSelectedFixtures(prev => 
                        prev.includes(fixture.id)
                          ? prev.filter(id => id !== fixture.id)
                          : [...prev, fixture.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          fixture.status === 'online' ? 'bg-green-400' :
                          fixture.status === 'offline' ? 'bg-gray-400' : 'bg-red-400'
                        }`} />
                        <span className="text-white font-medium">{fixture.name}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {fixture.wattage}W
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{fixture.model}</div>
                    <div className="text-xs text-gray-500">
                      Position: ({fixture.x.toFixed(1)}%, {fixture.y.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>

              {selectedFixtures.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {selectedFixtures.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedFixtures([])}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm mb-2"
                  >
                    <option value="">Select target zone...</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.fixtures.length}/{zone.maxFixtures})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedZone && selectedFixtures.length > 0) {
                        assignFixturesToZone(selectedFixtures, selectedZone);
                      }
                    }}
                    disabled={!selectedZone || selectedFixtures.length === 0}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Assign to Zone
                  </button>
                </div>
              )}
            </div>

            {/* Zone Overview */}
            <div className="xl:col-span-2 space-y-4">
              {zones.map(zone => (
                <div key={zone.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                        <p className="text-sm text-gray-400">
                          {zone.type} • {zone.area}m² • {zone.controlAuthority.lighting.toUpperCase()} control
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {zone.fixtures.length}/{zone.maxFixtures}
                      </div>
                      <div className="text-xs text-gray-400">fixtures</div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Capacity</span>
                      <span>{Math.round((zone.fixtures.length / zone.maxFixtures) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          zone.fixtures.length / zone.maxFixtures > 0.8 ? 'bg-red-500' :
                          zone.fixtures.length / zone.maxFixtures > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((zone.fixtures.length / zone.maxFixtures) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Zone Fixtures */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zone.fixtures.map(fixture => (
                      <div key={fixture.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              fixture.status === 'online' ? 'bg-green-400' :
                              fixture.status === 'offline' ? 'bg-gray-400' : 'bg-red-400'
                            }`} />
                            <span className="text-white text-sm font-medium">{fixture.name}</span>
                          </div>
                          <button
                            onClick={() => removeFixturesFromZone([fixture.id])}
                            className="p-1 text-gray-400 hover:text-red-400 rounded"
                            title="Remove from zone"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400">{fixture.model}</div>
                        <div className="text-xs text-gray-500">
                          {fixture.wattage}W • {fixture.ppf} PPF
                        </div>
                      </div>
                    ))}
                    
                    {zone.fixtures.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No fixtures assigned to this zone</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Assignment Rules</h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Rule
              </button>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Assignment Rules Coming Soon</p>
              <p className="text-sm">
                Create automated rules to assign fixtures based on type, power, location, and more
              </p>
            </div>
          </div>
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bulk by Type */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-blue-400" />
                  Assign by Fixture Type
                </h3>
                
                <div className="space-y-4">
                  {['Pro-400', 'Pro-600', 'Strip-200'].map(type => {
                    const count = fixtures.filter(f => f.model.includes(type) && !f.zoneId).length;
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{type}</div>
                          <div className="text-sm text-gray-400">{count} unassigned</div>
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              bulkAssignByType(type, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          disabled={count === 0}
                        >
                          <option value="">Assign to...</option>
                          {zones.map(zone => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name} ({zone.fixtures.length}/{zone.maxFixtures})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bulk by Power */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Assign by Power Range
                </h3>
                
                <div className="space-y-4">
                  {[
                    { range: '100-300W', min: 100, max: 300 },
                    { range: '301-500W', min: 301, max: 500 },
                    { range: '501W+', min: 501, max: 9999 }
                  ].map(power => {
                    const count = fixtures.filter(f => 
                      f.wattage >= power.min && f.wattage <= power.max && !f.zoneId
                    ).length;
                    return (
                      <div key={power.range} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{power.range}</div>
                          <div className="text-sm text-gray-400">{count} unassigned</div>
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              bulkAssignByPower(power.min, power.max, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          disabled={count === 0}
                        >
                          <option value="">Assign to...</option>
                          {zones.map(zone => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name} ({zone.fixtures.length}/{zone.maxFixtures})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Assignment Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{fixtures.length}</div>
                  <div className="text-sm text-gray-400">Total Fixtures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {fixtures.filter(f => f.zoneId).length}
                  </div>
                  <div className="text-sm text-gray-400">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{unassignedFixtures.length}</div>
                  <div className="text-sm text-gray-400">Unassigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{zones.length}</div>
                  <div className="text-sm text-gray-400">Zones</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}