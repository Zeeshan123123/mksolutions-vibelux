'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar,
  Plus,
  Target,
  MapPin,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sprout,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import {
  getPlantingRecommendations,
  generateHarvestPrediction,
  generateMockWeatherData,
  CROP_GDD_DATABASE,
  type PlantingRecord,
  type HarvestPrediction
} from '@/lib/harvest-prediction';

interface PlantingPlan {
  id: string;
  cropName: string;
  variety: string;
  targetHarvestDate: Date;
  recommendedPlantingDate: Date;
  plantingWindow: { earliest: Date; latest: Date };
  quantity: number;
  unit: string;
  fieldId: string;
  notes: string;
  status: 'planned' | 'planted' | 'cancelled';
  createdAt: Date;
}

export default function PlantingPlanner() {
  const [plans, setPlans] = useState<PlantingPlan[]>([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('heads');
  const [fieldId, setFieldId] = useState('');
  const [notes, setNotes] = useState('');

  // Mock planting plans
  useEffect(() => {
    const mockPlans: PlantingPlan[] = [
      {
        id: 'plan_1',
        cropName: 'Butter Lettuce',
        variety: 'Boston Bibb',
        targetHarvestDate: new Date('2024-03-15'),
        recommendedPlantingDate: new Date('2024-01-30'),
        plantingWindow: { earliest: new Date('2024-01-23'), latest: new Date('2024-02-06') },
        quantity: 500,
        unit: 'heads',
        fieldId: 'greenhouse_a',
        notes: 'Premium market demand',
        status: 'planned',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'plan_2',
        cropName: 'Roma Tomatoes',
        variety: 'San Marzano',
        targetHarvestDate: new Date('2024-04-01'),
        recommendedPlantingDate: new Date('2024-01-25'),
        plantingWindow: { earliest: new Date('2024-01-18'), latest: new Date('2024-02-01') },
        quantity: 1000,
        unit: 'plants',
        fieldId: 'field_b',
        notes: 'Restaurant contract delivery',
        status: 'planted',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 'plan_3',
        cropName: 'Spinach',
        variety: 'Space',
        targetHarvestDate: new Date('2024-02-28'),
        recommendedPlantingDate: new Date('2024-01-20'),
        plantingWindow: { earliest: new Date('2024-01-13'), latest: new Date('2024-01-27') },
        quantity: 800,
        unit: 'bunches',
        fieldId: 'tunnel_c',
        notes: 'Succession planting series',
        status: 'planned',
        createdAt: new Date('2024-01-08')
      }
    ];

    setPlans(mockPlans);
  }, []);

  const handleAddPlan = () => {
    if (!selectedCrop || !selectedVariety || !targetDate || !quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const recommendation = getPlantingRecommendations(
      selectedCrop,
      { latitude: 36.6777, longitude: -121.6555 },
      new Date(targetDate)
    );

    if (!recommendation) {
      alert('Unable to generate planting recommendation for this crop');
      return;
    }

    const newPlan: PlantingPlan = {
      id: `plan_${Date.now()}`,
      cropName: selectedCrop,
      variety: selectedVariety,
      targetHarvestDate: new Date(targetDate),
      recommendedPlantingDate: recommendation.recommendedPlantingDate,
      plantingWindow: recommendation.plantingWindow,
      quantity: parseInt(quantity),
      unit,
      fieldId: fieldId || 'unassigned',
      notes,
      status: 'planned',
      createdAt: new Date()
    };

    setPlans(prev => [...prev, newPlan]);
    resetForm();
    setShowAddPlan(false);
  };

  const resetForm = () => {
    setSelectedCrop('');
    setSelectedVariety('');
    setTargetDate('');
    setQuantity('');
    setUnit('heads');
    setFieldId('');
    setNotes('');
  };

  const handleConvertToPlanting = (plan: PlantingPlan) => {
    const plantingRecord: PlantingRecord = {
      id: `plant_${Date.now()}`,
      cropName: plan.cropName,
      variety: plan.variety,
      plantingDate: new Date(),
      location: { latitude: 36.6777, longitude: -121.6555, city: 'Salinas', state: 'CA' },
      quantity: plan.quantity,
      unit: plan.unit,
      fieldId: plan.fieldId,
      notes: plan.notes
    };

    // Update plan status
    setPlans(prev => prev.map(p => 
      p.id === plan.id ? { ...p, status: 'planted' as const } : p
    ));

    // In production, this would create the actual planting record
    console.log('Created planting record:', plantingRecord);
    alert('Planting record created! The crop is now being tracked for harvest prediction.');
  };

  const deletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this planting plan?')) {
      setPlans(prev => prev.filter(p => p.id !== planId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-400 bg-blue-900/20';
      case 'planted': return 'text-green-400 bg-green-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const isPlantingWindowActive = (plan: PlantingPlan) => {
    const now = new Date();
    return now >= plan.plantingWindow.earliest && now <= plan.plantingWindow.latest;
  };

  const daysUntilPlanting = (plan: PlantingPlan) => {
    const now = new Date();
    const diff = plan.recommendedPlantingDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const availableVarieties = selectedCrop ? Object.keys(CROP_GDD_DATABASE[selectedCrop]?.varieties || {}) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Planting Planner</h2>
          <p className="text-gray-400 mt-1">
            Plan your plantings based on target harvest dates and GDD requirements
          </p>
        </div>
        
        <button
          onClick={() => setShowAddPlan(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Planting Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Plans</p>
              <p className="text-xl font-bold text-white">{plans.length}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ready to Plant</p>
              <p className="text-xl font-bold text-white">
                {plans.filter(p => isPlantingWindowActive(p) && p.status === 'planned').length}
              </p>
            </div>
            <Sprout className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Already Planted</p>
              <p className="text-xl font-bold text-white">
                {plans.filter(p => p.status === 'planted').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Upcoming</p>
              <p className="text-xl font-bold text-white">
                {plans.filter(p => daysUntilPlanting(p) > 0 && daysUntilPlanting(p) <= 7).length}
              </p>
            </div>
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Active Planting Windows Alert */}
      {plans.some(p => isPlantingWindowActive(p) && p.status === 'planned') && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Active Planting Windows</p>
              <p className="text-gray-300 text-sm mt-1">
                {plans.filter(p => isPlantingWindowActive(p) && p.status === 'planned').length} plans are in their optimal planting window right now!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planting Plans List */}
      <div className="space-y-4">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
              isPlantingWindowActive(plan) && plan.status === 'planned' 
                ? 'border-yellow-400' 
                : plan.status === 'planted' 
                ? 'border-green-400' 
                : 'border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {plan.cropName} ({plan.variety})
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                  {isPlantingWindowActive(plan) && plan.status === 'planned' && (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-900/20 text-yellow-400">
                      Plant Now!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Target Harvest</p>
                    <p className="text-white font-medium">{plan.targetHarvestDate.toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Recommended Planting</p>
                    <p className="text-white font-medium">{plan.recommendedPlantingDate.toLocaleDateString()}</p>
                    {daysUntilPlanting(plan) > 0 && (
                      <p className="text-xs text-gray-500">In {daysUntilPlanting(plan)} days</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Planting Window</p>
                    <p className="text-white font-medium">
                      {plan.plantingWindow.earliest.toLocaleDateString()} - {plan.plantingWindow.latest.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Quantity</p>
                    <p className="text-white font-medium">{plan.quantity.toLocaleString()} {plan.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Field/Location</p>
                    <p className="text-white">{plan.fieldId}</p>
                  </div>
                  
                  {plan.notes && (
                    <div>
                      <p className="text-gray-400 text-sm">Notes</p>
                      <p className="text-white">{plan.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {plan.status === 'planned' && (
                  <button
                    onClick={() => handleConvertToPlanting(plan)}
                    disabled={!isPlantingWindowActive(plan)}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Sprout className="w-4 h-4" />
                    Plant Now
                  </button>
                )}
                
                <button
                  onClick={() => setEditingPlan(plan.id)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">New Planting Plan</h3>
              <button
                onClick={() => setShowAddPlan(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Crop *
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => {
                      setSelectedCrop(e.target.value);
                      setSelectedVariety('');
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select crop</option>
                    {Object.keys(CROP_GDD_DATABASE).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Variety *
                  </label>
                  <select
                    value={selectedVariety}
                    onChange={(e) => setSelectedVariety(e.target.value)}
                    disabled={!selectedCrop}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 disabled:opacity-50"
                  >
                    <option value="">Select variety</option>
                    {availableVarieties.map(variety => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Harvest Date *
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    placeholder="0"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="heads">heads</option>
                    <option value="plants">plants</option>
                    <option value="bunches">bunches</option>
                    <option value="cases">cases</option>
                    <option value="boxes">boxes</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Field/Location ID
                </label>
                <input
                  type="text"
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g., greenhouse_a, field_1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="Additional notes about this planting..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddPlan(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlan}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}