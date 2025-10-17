'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar,
  Thermometer,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Droplets,
  Sun,
  CloudRain,
  Target,
  Zap,
  Activity,
  Sprout,
  Flower,
  Package,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import {
  generateHarvestPrediction,
  generateBulkHarvestPredictions,
  generateMockWeatherData,
  getPlantingRecommendations,
  CROP_GDD_DATABASE,
  type PlantingRecord,
  type HarvestPrediction,
  type WeatherData
} from '@/lib/harvest-prediction';

interface HarvestPredictionDashboardProps {
  userType: 'grower' | 'buyer';
  growerId?: string;
}

export default function HarvestPredictionDashboard({ userType, growerId }: HarvestPredictionDashboardProps) {
  const [plantings, setPlantings] = useState<PlantingRecord[]>([]);
  const [predictions, setPredictions] = useState<HarvestPrediction[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'season'>('month');
  const [showAddPlanting, setShowAddPlanting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Generate mock planting records
      const mockPlantings: PlantingRecord[] = [
        {
          id: 'plant_1',
          cropName: 'Butter Lettuce',
          variety: 'Boston Bibb',
          plantingDate: new Date('2024-01-01'),
          location: { latitude: 36.6777, longitude: -121.6555, city: 'Salinas', state: 'CA' },
          quantity: 500,
          unit: 'heads',
          fieldId: 'field_a',
          notes: 'Premium greenhouse section'
        },
        {
          id: 'plant_2',
          cropName: 'Roma Tomatoes',
          variety: 'San Marzano',
          plantingDate: new Date('2024-01-05'),
          location: { latitude: 36.7378, longitude: -119.7871, city: 'Fresno', state: 'CA' },
          quantity: 1200,
          unit: 'plants',
          fieldId: 'field_b',
          notes: 'Open field cultivation'
        },
        {
          id: 'plant_3',
          cropName: 'Spinach',
          variety: 'Space',
          plantingDate: new Date('2024-01-10'),
          location: { latitude: 36.6777, longitude: -121.6555, city: 'Salinas', state: 'CA' },
          quantity: 800,
          unit: 'bunches',
          fieldId: 'field_c',
          notes: 'Cold frame protection'
        },
        {
          id: 'plant_4',
          cropName: 'Basil',
          variety: 'Genovese',
          plantingDate: new Date('2024-01-12'),
          location: { latitude: 36.6777, longitude: -121.6555, city: 'Salinas', state: 'CA' },
          quantity: 300,
          unit: 'plants',
          fieldId: 'field_d',
          notes: 'Hydroponic system'
        },
        {
          id: 'plant_5',
          cropName: 'Broccoli',
          variety: 'Calabrese',
          plantingDate: new Date('2024-01-08'),
          location: { latitude: 36.7378, longitude: -119.7871, city: 'Fresno', state: 'CA' },
          quantity: 600,
          unit: 'heads',
          fieldId: 'field_e',
          notes: 'Succession planting #1'
        }
      ];

      // Generate weather data for the past 90 days and next 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const weather = generateMockWeatherData(
        startDate,
        endDate,
        { latitude: 36.6777, longitude: -121.6555 }
      );

      // Generate predictions
      const predictions = generateBulkHarvestPredictions(mockPlantings, weather);

      setPlantings(mockPlantings);
      setWeatherData(weather);
      setPredictions(predictions);
      setLoading(false);
    };

    initializeData();
  }, []);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'germination': return <Sprout className="w-4 h-4 text-green-400" />;
      case 'vegetative': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'flowering': return <Flower className="w-4 h-4 text-purple-400" />;
      case 'maturity': return <Target className="w-4 h-4 text-orange-400" />;
      case 'harvest': return <Package className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'text-green-400 bg-green-900/20';
      case 'standard': return 'text-blue-400 bg-blue-900/20';
      case 'processing': return 'text-orange-400 bg-orange-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    if (!selectedCrop) return true;
    return prediction.cropName === selectedCrop;
  });

  const upcomingHarvests = filteredPredictions
    .filter(p => {
      const daysToHarvest = (p.estimatedHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysToHarvest <= 30 && daysToHarvest >= 0;
    })
    .sort((a, b) => a.estimatedHarvestDate.getTime() - b.estimatedHarvestDate.getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading harvest predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {userType === 'grower' ? 'Harvest Predictions' : 'Incoming Harvests'}
          </h2>
          <p className="text-gray-400 mt-1">
            Growing Degree Day (GDD) based harvest timing predictions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">All Crops</option>
            {Object.keys(CROP_GDD_DATABASE).map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="week">Next Week</option>
            <option value="month">Next Month</option>
            <option value="season">This Season</option>
          </select>

          {userType === 'grower' && (
            <button
              onClick={() => setShowAddPlanting(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Planting
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Plantings</p>
              <p className="text-2xl font-bold text-white">{predictions.length}</p>
            </div>
            <Sprout className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ready This Month</p>
              <p className="text-2xl font-bold text-white">{upcomingHarvests.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Premium Quality</p>
              <p className="text-2xl font-bold text-white">
                {predictions.filter(p => p.qualityPrediction === 'premium').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Upcoming Harvests Timeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Harvests (Next 30 Days)
        </h3>
        
        {upcomingHarvests.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No harvests scheduled for the next 30 days</p>
        ) : (
          <div className="space-y-4">
            {upcomingHarvests.map(prediction => {
              const daysToHarvest = Math.ceil(
                (prediction.estimatedHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={prediction.plantingId} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStageIcon(prediction.currentStage)}
                    <div>
                      <div className="font-medium text-white">
                        {prediction.cropName} ({prediction.variety})
                      </div>
                      <div className="text-sm text-gray-400">
                        {prediction.quantity.toLocaleString()} {prediction.unit} • 
                        {daysToHarvest === 0 ? ' Ready today!' : 
                         daysToHarvest === 1 ? ' Ready tomorrow' : 
                         ` Ready in ${daysToHarvest} days`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-white">
                        {prediction.estimatedHarvestDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-xs ${getQualityColor(prediction.qualityPrediction)}`}>
                      {prediction.qualityPrediction}
                    </span>
                    
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(prediction.weatherRisk)}`}>
                      {prediction.weatherRisk} risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPredictions.map(prediction => (
          <div key={prediction.plantingId} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">
                  {prediction.cropName}
                </h4>
                <p className="text-gray-400">{prediction.variety}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {getStageIcon(prediction.currentStage)}
                <span className="text-sm text-gray-400 capitalize">
                  {prediction.currentStage}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Growth Progress</span>
                <span className="text-white">{Math.round(prediction.progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${prediction.progressPercent}%` }}
                />
              </div>
            </div>

            {/* GDD Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Current GDD</div>
                <div className="text-lg font-semibold text-white">
                  {Math.round(prediction.currentGDD)}°F
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Required GDD</div>
                <div className="text-lg font-semibold text-white">
                  {prediction.requiredGDD}°F
                </div>
              </div>
            </div>

            {/* Harvest Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Estimated Harvest</span>
                <span className="text-white font-medium">
                  {prediction.estimatedHarvestDate.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Harvest Window</span>
                <span className="text-white">
                  {prediction.harvestWindow.earliest.toLocaleDateString()} - {prediction.harvestWindow.latest.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Expected Quantity</span>
                <span className="text-white">
                  {prediction.quantity.toLocaleString()} {prediction.unit}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Planted</span>
                <span className="text-white">
                  {prediction.plantingDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
              <span className={`px-2 py-1 rounded text-xs ${getQualityColor(prediction.qualityPrediction)}`}>
                {prediction.qualityPrediction} quality
              </span>
              
              <span className={`px-2 py-1 rounded text-xs ${getRiskColor(prediction.weatherRisk)}`}>
                {prediction.weatherRisk} weather risk
              </span>
              
              <span className="px-2 py-1 rounded text-xs bg-blue-900/20 text-blue-400">
                {Math.round(prediction.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Weather Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          Recent Weather Impact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Temperature</span>
            </div>
            <p className="text-gray-400 text-sm">
              Average daily GDD accumulation has been optimal for most crops this week.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Moisture</span>
            </div>
            <p className="text-gray-400 text-sm">
              Adequate rainfall recorded. No irrigation stress expected.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Forecast</span>
            </div>
            <p className="text-gray-400 text-sm">
              Favorable conditions expected to continue for the next 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}