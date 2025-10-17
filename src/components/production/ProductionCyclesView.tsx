'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Package,
  Leaf,
  Sun,
  Droplets,
  Thermometer,
  Activity,
  ChevronRight,
  Filter,
  Search,
  Download,
  Upload,
  BarChart3,
  Calendar as CalendarIcon,
  Settings,
  Users,
  Zap,
  DollarSign,
  Info,
  ArrowRight,
  RefreshCw,
  MapPin
} from 'lucide-react';

// Interfaces
interface CropTemplate {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  defaultDuration: number; // days
  phases: CyclePhase[];
  requirements: {
    temperature: { min: number; max: number; optimal: number };
    humidity: { min: number; max: number; optimal: number };
    ppfd: { min: number; max: number; optimal: number };
    dli: { min: number; max: number; optimal: number };
    ph: { min: number; max: number; optimal: number };
    ec: { min: number; max: number; optimal: number };
  };
  expectedYield: {
    min: number;
    max: number;
    unit: string;
  };
}

interface CyclePhase {
  id: string;
  name: string;
  duration: number; // days
  order: number;
  requirements: {
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    ppfd: number;
    photoperiod: number;
    co2: number;
    irrigation: {
      frequency: string;
      amount: number;
      ec: number;
      ph: number;
    };
  };
  tasks: string[];
  milestones: string[];
}

interface ProductionCycle {
  id: string;
  name: string;
  templateId: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  location: {
    facility: string;
    zone: string;
    area: number;
  };
  currentPhase: string;
  progress: number; // 0-100
  health: 'excellent' | 'good' | 'fair' | 'poor';
  yield: {
    projected: number;
    actual?: number;
    unit: string;
  };
  costs: {
    projected: number;
    actual: number;
  };
  assignedTo: string[];
  notes: string;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'environmental' | 'task' | 'resource' | 'quality';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Sample crop templates
const cropTemplates: CropTemplate[] = [
  {
    id: 'lettuce-hydro',
    name: 'Lettuce (Hydroponic)',
    scientificName: 'Lactuca sativa',
    category: 'Leafy Greens',
    defaultDuration: 35,
    phases: [
      {
        id: 'germination',
        name: 'Germination',
        duration: 3,
        order: 1,
        requirements: {
          temperature: { day: 20, night: 18 },
          humidity: { day: 70, night: 70 },
          ppfd: 100,
          photoperiod: 16,
          co2: 400,
          irrigation: {
            frequency: '2x daily',
            amount: 50,
            ec: 0.8,
            ph: 5.8
          }
        },
        tasks: ['Sow seeds', 'Monitor germination', 'Maintain moisture'],
        milestones: ['90% germination rate']
      },
      {
        id: 'seedling',
        name: 'Seedling',
        duration: 7,
        order: 2,
        requirements: {
          temperature: { day: 22, night: 18 },
          humidity: { day: 65, night: 65 },
          ppfd: 200,
          photoperiod: 16,
          co2: 600,
          irrigation: {
            frequency: '3x daily',
            amount: 100,
            ec: 1.2,
            ph: 5.8
          }
        },
        tasks: ['Transplant to NFT', 'Monitor root development', 'Adjust nutrients'],
        milestones: ['First true leaves', 'Root establishment']
      },
      {
        id: 'vegetative',
        name: 'Vegetative Growth',
        duration: 18,
        order: 3,
        requirements: {
          temperature: { day: 24, night: 20 },
          humidity: { day: 60, night: 60 },
          ppfd: 300,
          photoperiod: 18,
          co2: 800,
          irrigation: {
            frequency: 'Continuous',
            amount: 200,
            ec: 1.8,
            ph: 6.0
          }
        },
        tasks: ['Monitor growth rate', 'Adjust lighting', 'IPM scouting'],
        milestones: ['6-8 leaves', 'Canopy closure']
      },
      {
        id: 'harvest',
        name: 'Harvest Ready',
        duration: 7,
        order: 4,
        requirements: {
          temperature: { day: 22, night: 18 },
          humidity: { day: 55, night: 55 },
          ppfd: 250,
          photoperiod: 16,
          co2: 600,
          irrigation: {
            frequency: 'Continuous',
            amount: 150,
            ec: 1.5,
            ph: 6.0
          }
        },
        tasks: ['Quality assessment', 'Harvest planning', 'Pack and ship'],
        milestones: ['Target weight reached', 'Quality standards met']
      }
    ],
    requirements: {
      temperature: { min: 18, max: 26, optimal: 22 },
      humidity: { min: 50, max: 70, optimal: 60 },
      ppfd: { min: 150, max: 400, optimal: 300 },
      dli: { min: 12, max: 20, optimal: 17 },
      ph: { min: 5.5, max: 6.5, optimal: 6.0 },
      ec: { min: 0.8, max: 2.0, optimal: 1.5 }
    },
    expectedYield: {
      min: 150,
      max: 200,
      unit: 'g/plant'
    }
  },
  {
    id: 'tomato-greenhouse',
    name: 'Tomato (Greenhouse)',
    scientificName: 'Solanum lycopersicum',
    category: 'Fruiting Crops',
    defaultDuration: 120,
    phases: [
      {
        id: 'nursery',
        name: 'Nursery',
        duration: 21,
        order: 1,
        requirements: {
          temperature: { day: 25, night: 20 },
          humidity: { day: 70, night: 70 },
          ppfd: 200,
          photoperiod: 16,
          co2: 600,
          irrigation: {
            frequency: '2x daily',
            amount: 100,
            ec: 1.5,
            ph: 6.0
          }
        },
        tasks: ['Seed sowing', 'Pricking out', 'Grafting (if applicable)'],
        milestones: ['Germination complete', 'Ready for transplant']
      },
      {
        id: 'vegetative',
        name: 'Vegetative',
        duration: 28,
        order: 2,
        requirements: {
          temperature: { day: 26, night: 18 },
          humidity: { day: 65, night: 70 },
          ppfd: 400,
          photoperiod: 18,
          co2: 1000,
          irrigation: {
            frequency: '4-6x daily',
            amount: 500,
            ec: 2.0,
            ph: 5.8
          }
        },
        tasks: ['Transplanting', 'Trellising', 'Pruning', 'Deleafing'],
        milestones: ['First flower cluster', 'Plant height 1.5m']
      },
      {
        id: 'flowering',
        name: 'Flowering & Fruit Set',
        duration: 35,
        order: 3,
        requirements: {
          temperature: { day: 24, night: 17 },
          humidity: { day: 60, night: 65 },
          ppfd: 500,
          photoperiod: 16,
          co2: 1200,
          irrigation: {
            frequency: '6-8x daily',
            amount: 800,
            ec: 2.5,
            ph: 5.8
          }
        },
        tasks: ['Pollination', 'Cluster pruning', 'Continue deleafing'],
        milestones: ['5 clusters set', 'First fruit color break']
      },
      {
        id: 'harvest',
        name: 'Continuous Harvest',
        duration: 36,
        order: 4,
        requirements: {
          temperature: { day: 22, night: 16 },
          humidity: { day: 60, night: 65 },
          ppfd: 450,
          photoperiod: 14,
          co2: 1000,
          irrigation: {
            frequency: '8-10x daily',
            amount: 1000,
            ec: 2.8,
            ph: 5.8
          }
        },
        tasks: ['Harvest ripe fruit', 'Topping plants', 'Maintain plant balance'],
        milestones: ['Weekly harvest target', 'Quality standards']
      }
    ],
    requirements: {
      temperature: { min: 16, max: 30, optimal: 24 },
      humidity: { min: 50, max: 80, optimal: 65 },
      ppfd: { min: 300, max: 700, optimal: 500 },
      dli: { min: 20, max: 35, optimal: 30 },
      ph: { min: 5.5, max: 6.5, optimal: 5.8 },
      ec: { min: 1.5, max: 3.5, optimal: 2.5 }
    },
    expectedYield: {
      min: 40,
      max: 60,
      unit: 'kg/m²'
    }
  },
  {
    id: 'cannabis-indoor',
    name: 'Cannabis (Indoor)',
    scientificName: 'Cannabis sativa',
    category: 'Medicinal Crops',
    defaultDuration: 84,
    phases: [
      {
        id: 'clone-veg',
        name: 'Clone/Vegetative',
        duration: 14,
        order: 1,
        requirements: {
          temperature: { day: 25, night: 20 },
          humidity: { day: 70, night: 70 },
          ppfd: 400,
          photoperiod: 18,
          co2: 800,
          irrigation: {
            frequency: '2x daily',
            amount: 300,
            ec: 1.2,
            ph: 5.8
          }
        },
        tasks: ['Clone rooting', 'Transplant', 'Initial training'],
        milestones: ['Roots established', 'New growth visible']
      },
      {
        id: 'veg-growth',
        name: 'Vegetative Growth',
        duration: 14,
        order: 2,
        requirements: {
          temperature: { day: 26, night: 20 },
          humidity: { day: 60, night: 65 },
          ppfd: 600,
          photoperiod: 18,
          co2: 1200,
          irrigation: {
            frequency: '3x daily',
            amount: 500,
            ec: 1.8,
            ph: 6.0
          }
        },
        tasks: ['Topping', 'LST/HST', 'Defoliation', 'IPM'],
        milestones: ['Target height', 'Canopy filled']
      },
      {
        id: 'flowering',
        name: 'Flowering',
        duration: 56,
        order: 3,
        requirements: {
          temperature: { day: 24, night: 18 },
          humidity: { day: 45, night: 50 },
          ppfd: 800,
          photoperiod: 12,
          co2: 1200,
          irrigation: {
            frequency: '4x daily',
            amount: 700,
            ec: 2.2,
            ph: 6.2
          }
        },
        tasks: ['Trellis support', 'Defoliation', 'Monitor trichomes'],
        milestones: ['Week 4 flower', 'Week 8 flower', 'Harvest ready']
      }
    ],
    requirements: {
      temperature: { min: 18, max: 28, optimal: 24 },
      humidity: { min: 40, max: 70, optimal: 50 },
      ppfd: { min: 400, max: 1000, optimal: 800 },
      dli: { min: 30, max: 45, optimal: 40 },
      ph: { min: 5.5, max: 6.5, optimal: 6.0 },
      ec: { min: 1.0, max: 2.5, optimal: 2.0 }
    },
    expectedYield: {
      min: 400,
      max: 600,
      unit: 'g/m²'
    }
  }
];

export function ProductionCyclesView() {
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<ProductionCycle | null>(null);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Mock data for demonstration
  useEffect(() => {
    const mockCycles: ProductionCycle[] = [
      {
        id: '1',
        name: 'Lettuce Batch A-24',
        templateId: 'lettuce-hydro',
        status: 'active',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-06'),
        actualStartDate: new Date('2024-11-01'),
        location: {
          facility: 'Greenhouse 1',
          zone: 'NFT System A',
          area: 200
        },
        currentPhase: 'vegetative',
        progress: 65,
        health: 'excellent',
        yield: {
          projected: 30,
          unit: 'kg'
        },
        costs: {
          projected: 1500,
          actual: 980
        },
        assignedTo: ['John Doe', 'Jane Smith'],
        notes: 'Growing well, slight EC adjustment made on day 18',
        alerts: []
      },
      {
        id: '2',
        name: 'Tomato Crop 2024-Q4',
        templateId: 'tomato-greenhouse',
        status: 'active',
        startDate: new Date('2024-09-15'),
        endDate: new Date('2025-01-14'),
        actualStartDate: new Date('2024-09-15'),
        location: {
          facility: 'Greenhouse 2',
          zone: 'High-wire Section',
          area: 500
        },
        currentPhase: 'harvest',
        progress: 75,
        health: 'good',
        yield: {
          projected: 25000,
          actual: 18500,
          unit: 'kg'
        },
        costs: {
          projected: 15000,
          actual: 13200
        },
        assignedTo: ['Mike Johnson'],
        notes: 'Harvest ongoing, quality excellent',
        alerts: [
          {
            id: 'a1',
            type: 'warning',
            category: 'environmental',
            message: 'Temperature spike detected - check climate control',
            timestamp: new Date(),
            resolved: false
          }
        ]
      },
      {
        id: '3',
        name: 'Cannabis Room 3',
        templateId: 'cannabis-indoor',
        status: 'planned',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2025-03-09'),
        location: {
          facility: 'Indoor Facility',
          zone: 'Flower Room 3',
          area: 150
        },
        currentPhase: 'clone-veg',
        progress: 0,
        health: 'excellent',
        yield: {
          projected: 90,
          unit: 'kg'
        },
        costs: {
          projected: 25000,
          actual: 0
        },
        assignedTo: ['Sarah Wilson'],
        notes: 'Mother plants selected, clones ready',
        alerts: []
      }
    ];
    setCycles(mockCycles);
  }, []);

  const filteredCycles = cycles.filter(cycle => {
    const matchesStatus = filterStatus === 'all' || cycle.status === filterStatus;
    const matchesSearch = cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cycle.location.facility.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'planned': return 'text-blue-400 bg-blue-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'completed': return 'text-purple-400 bg-purple-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Production Cycles</h2>
          <p className="text-gray-400 mt-1">Manage and track all your production cycles</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowNewCycleModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Cycle
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cycles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-l-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 rounded-r-lg transition-colors ${
              viewMode === 'timeline' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cycles Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCycles.map((cycle) => {
            const template = cropTemplates.find(t => t.id === cycle.templateId);
            const currentPhaseData = template?.phases.find(p => p.id === cycle.currentPhase);
            
            return (
              <div
                key={cycle.id}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCycle(cycle)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{cycle.name}</h3>
                    <p className="text-sm text-gray-400">{template?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                    {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{cycle.location.facility} - {cycle.location.zone}</span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{cycle.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${cycle.progress}%` }}
                    />
                  </div>
                </div>

                {/* Current Phase */}
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Current Phase</p>
                      <p className="text-sm font-medium text-white">{currentPhaseData?.name}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${getHealthColor(cycle.health)}`}>
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">{cycle.health}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Yield</p>
                    <p className="text-lg font-semibold text-white">
                      {cycle.yield.actual || cycle.yield.projected} {cycle.yield.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cycle.yield.actual ? 'Actual' : 'Projected'}
                    </p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Cost</p>
                    <p className="text-lg font-semibold text-white">
                      ${cycle.costs.actual.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      of ${cycle.costs.projected.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Alerts */}
                {cycle.alerts.length > 0 && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{cycle.alerts.length} active alerts</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <div className="flex -space-x-2">
                    {cycle.assignedTo.slice(0, 3).map((person, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-900 flex items-center justify-center"
                        title={person}
                      >
                        <span className="text-xs text-white">
                          {person.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    ))}
                    {cycle.assignedTo.length > 3 && (
                      <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <span className="text-xs text-white">+{cycle.assignedTo.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle copy
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="text-center text-gray-400 py-12">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>Timeline view coming soon...</p>
          </div>
        </div>
      )}

      {/* New Cycle Modal */}
      {showNewCycleModal && (
        <NewCycleModal
          templates={cropTemplates}
          onClose={() => setShowNewCycleModal(false)}
          onCreate={(newCycle) => {
            setCycles([...cycles, newCycle]);
            setShowNewCycleModal(false);
          }}
        />
      )}

      {/* Cycle Details Modal */}
      {selectedCycle && (
        <CycleDetailsModal
          cycle={selectedCycle}
          template={cropTemplates.find(t => t.id === selectedCycle.templateId)!}
          onClose={() => setSelectedCycle(null)}
          onUpdate={(updatedCycle) => {
            setCycles(cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c));
            setSelectedCycle(null);
          }}
        />
      )}
    </div>
  );
}

// New Cycle Modal Component
function NewCycleModal({ 
  templates, 
  onClose, 
  onCreate 
}: { 
  templates: CropTemplate[];
  onClose: () => void;
  onCreate: (cycle: ProductionCycle) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0].id);
  const [formData, setFormData] = useState({
    name: '',
    facility: '',
    zone: '',
    area: 100,
    startDate: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });

  const template = templates.find(t => t.id === selectedTemplate)!;
  const endDate = new Date(formData.startDate);
  endDate.setDate(endDate.getDate() + template.defaultDuration);

  const handleCreate = () => {
    const newCycle: ProductionCycle = {
      id: Date.now().toString(),
      name: formData.name,
      templateId: selectedTemplate,
      status: 'planned',
      startDate: new Date(formData.startDate),
      endDate: endDate,
      location: {
        facility: formData.facility,
        zone: formData.zone,
        area: formData.area
      },
      currentPhase: template.phases[0].id,
      progress: 0,
      health: 'excellent',
      yield: {
        projected: (template.expectedYield.min + template.expectedYield.max) / 2,
        unit: template.expectedYield.unit
      },
      costs: {
        projected: formData.area * 50, // Simple calculation
        actual: 0
      },
      assignedTo: formData.assignedTo.split(',').map(s => s.trim()).filter(s => s),
      notes: '',
      alerts: []
    };
    onCreate(newCycle);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">New Production Cycle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Crop Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.defaultDuration} days)
                </option>
              ))}
            </select>
          </div>

          {/* Cycle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cycle Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lettuce Batch A-25"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Facility
              </label>
              <input
                type="text"
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                placeholder="e.g., Greenhouse 1"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Zone/Room
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="e.g., NFT System A"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Area and Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Growing Area (m²)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assigned To (comma separated)
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="e.g., John Doe, Jane Smith"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="text-white">{template.defaultDuration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date:</span>
                <span className="text-white">{endDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Yield:</span>
                <span className="text-white">
                  {template.expectedYield.min}-{template.expectedYield.max} {template.expectedYield.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!formData.name || !formData.facility || !formData.zone}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Cycle
          </button>
        </div>
      </div>
    </div>
  );
}

// Cycle Details Modal Component
function CycleDetailsModal({
  cycle,
  template,
  onClose,
  onUpdate
}: {
  cycle: ProductionCycle;
  template: CropTemplate;
  onClose: () => void;
  onUpdate: (cycle: ProductionCycle) => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'tasks' | 'data' | 'alerts'>('overview');
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{cycle.name}</h3>
            <p className="text-gray-400">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-800">
          {['overview', 'phases', 'tasks', 'data', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Status and Progress */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Status & Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                        {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Health:</span>
                      <span className={`font-medium ${getHealthColor(cycle.health)}`}>
                        {cycle.health}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress:</span>
                        <span className="text-white">{cycle.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${cycle.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Yield:</span>
                      <span className="text-white font-medium">
                        {cycle.yield.actual || cycle.yield.projected} {cycle.yield.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Cost:</span>
                      <span className="text-white font-medium">
                        ${cycle.costs.actual.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-white font-medium">
                        {Math.floor((cycle.endDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Team */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Location</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-white">{cycle.location.facility}</p>
                    <p className="text-gray-400">{cycle.location.zone}</p>
                    <p className="text-gray-400">{cycle.location.area} m²</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Team</h4>
                  <div className="space-y-2">
                    {cycle.assignedTo.map((person, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">
                            {person.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm text-white">{person}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Cancel Cycle
                </button>
              </div>
            </>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-4">
              {template.phases.map((phase, index) => {
                const isActive = phase.id === cycle.currentPhase;
                const isPast = phase.order < (template.phases.find(p => p.id === cycle.currentPhase)?.order || 0);
                
                return (
                  <div
                    key={phase.id}
                    className={`bg-gray-800/50 rounded-lg p-4 border ${
                      isActive ? 'border-purple-500' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isPast ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-gray-700'
                        }`}>
                          {isPast ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-white font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{phase.name}</h4>
                          <p className="text-sm text-gray-400">{phase.duration} days</p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Temperature:</p>
                        <p className="text-white">
                          Day: {phase.requirements.temperature.day}°C / Night: {phase.requirements.temperature.night}°C
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Light:</p>
                        <p className="text-white">
                          {phase.requirements.ppfd} PPFD, {phase.requirements.photoperiod}h
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'overview' && activeTab !== 'phases' && (
            <div className="text-center py-12 text-gray-400">
              <Info className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component imports
import { X } from 'lucide-react';