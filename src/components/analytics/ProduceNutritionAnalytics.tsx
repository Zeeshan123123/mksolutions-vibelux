'use client';

import React, { useState } from 'react';
import {
  Apple,
  Carrot,
  Cherry,
  Grape,
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  Activity,
  TrendingUp,
  AlertCircle,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Award,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  Info,
  Zap,
  Shield,
  Heart,
  Brain,
  Eye,
  Bone
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

interface NutrientData {
  id: string;
  crop: string;
  variety: string;
  harvestDate: string;
  growthMethod: 'hydroponic' | 'aquaponic' | 'aeroponic';
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminE: number;
    vitaminK: number;
    thiamine: number;
    riboflavin: number;
    niacin: number;
    vitaminB6: number;
    folate: number;
    vitaminB12: number;
  };
  minerals: {
    calcium: number;
    iron: number;
    magnesium: number;
    phosphorus: number;
    potassium: number;
    sodium: number;
    zinc: number;
    copper: number;
    manganese: number;
    selenium: number;
  };
  macronutrients: {
    protein: number;
    carbohydrates: number;
    fiber: number;
    totalFat: number;
    saturatedFat: number;
    omega3: number;
    omega6: number;
  };
  antioxidants: {
    betaCarotene: number;
    lycopene: number;
    lutein: number;
    zeaxanthin: number;
    anthocyanins: number;
    flavonoids: number;
    polyphenols: number;
  };
  qualityMetrics: {
    brix: number;
    ph: number;
    texture: number;
    color: number;
    shelfLife: number;
  };
}

const cropIcons: Record<string, React.ReactNode> = {
  lettuce: <Leaf className="w-5 h-5" />,
  tomato: <Cherry className="w-5 h-5" />,
  spinach: <Leaf className="w-5 h-5" />,
  kale: <Leaf className="w-5 h-5" />,
  strawberry: <Cherry className="w-5 h-5" />,
  pepper: <Apple className="w-5 h-5" />,
  cucumber: <Carrot className="w-5 h-5" />,
  herbs: <Leaf className="w-5 h-5" />
};

export function ProduceNutritionAnalytics() {
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState<'vitamins' | 'minerals' | 'antioxidants'>('vitamins');

  // Sample nutrient tracking data
  const nutrientHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    vitaminC: 35 + Math.sin(i / 5) * 10 + (Math.random() - 0.5) * 5,
    vitaminA: 800 + Math.sin(i / 4) * 200 + (Math.random() - 0.5) * 100,
    calcium: 40 + Math.sin(i / 6) * 15 + (Math.random() - 0.5) * 8,
    iron: 2.5 + Math.sin(i / 7) * 0.8 + (Math.random() - 0.5) * 0.3,
    antioxidants: 150 + Math.sin(i / 5) * 40 + (Math.random() - 0.5) * 20
  }));

  // Crop comparison data
  const cropComparison = [
    { crop: 'Lettuce', vitaminC: 45, vitaminA: 950, calcium: 55, iron: 3.2, antioxidants: 180 },
    { crop: 'Spinach', vitaminC: 65, vitaminA: 1200, calcium: 85, iron: 4.5, antioxidants: 220 },
    { crop: 'Kale', vitaminC: 85, vitaminA: 1500, calcium: 120, iron: 3.8, antioxidants: 280 },
    { crop: 'Tomato', vitaminC: 55, vitaminA: 800, calcium: 25, iron: 2.1, antioxidants: 320 },
    { crop: 'Strawberry', vitaminC: 95, vitaminA: 200, calcium: 30, iron: 1.5, antioxidants: 380 }
  ];

  // Nutritional goals vs actual
  const nutritionalGoals = [
    { nutrient: 'Vitamin C', goal: 60, actual: 85, unit: 'mg/100g' },
    { nutrient: 'Vitamin A', goal: 1000, actual: 1200, unit: 'IU' },
    { nutrient: 'Calcium', goal: 80, actual: 75, unit: 'mg/100g' },
    { nutrient: 'Iron', goal: 3.5, actual: 4.2, unit: 'mg/100g' },
    { nutrient: 'Fiber', goal: 3.0, actual: 2.8, unit: 'g/100g' },
    { nutrient: 'Antioxidants', goal: 250, actual: 280, unit: 'ORAC' }
  ];

  // Environmental impact on nutrition
  const environmentalImpact = [
    { factor: 'Light Intensity', vitaminC: 85, antioxidants: 92, minerals: 78 },
    { factor: 'Temperature', vitaminC: 75, antioxidants: 80, minerals: 88 },
    { factor: 'CO2 Level', vitaminC: 90, antioxidants: 85, minerals: 82 },
    { factor: 'Nutrient EC', vitaminC: 70, antioxidants: 75, minerals: 95 },
    { factor: 'pH Balance', vitaminC: 80, antioxidants: 78, minerals: 90 },
    { factor: 'Water Quality', vitaminC: 82, antioxidants: 80, minerals: 85 }
  ];

  // Health benefit scores
  const healthBenefits = [
    { benefit: 'Immune Support', score: 92, color: '#10b981' },
    { benefit: 'Bone Health', score: 78, color: '#3b82f6' },
    { benefit: 'Eye Health', score: 85, color: '#8b5cf6' },
    { benefit: 'Heart Health', score: 88, color: '#ef4444' },
    { benefit: 'Brain Function', score: 75, color: '#f59e0b' },
    { benefit: 'Anti-inflammatory', score: 90, color: '#06b6d4' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Apple className="w-8 h-8 text-green-500" />
              Produce Nutrition Analytics
            </h2>
            <p className="text-gray-400 mt-1">
              Track and optimize nutritional content in your produce
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Crop Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCrop('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCrop === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Crops
          </button>
          {Object.entries(cropIcons).map(([crop, icon]) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                selectedCrop === crop
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {icon}
              <span className="capitalize">{crop}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-green-500 text-sm font-medium">+15%</span>
          </div>
          <h3 className="text-gray-400 text-sm">Avg. Vitamin Content</h3>
          <p className="text-2xl font-bold text-white mt-1">125% RDA</p>
          <p className="text-gray-500 text-xs mt-2">Exceeds standard targets</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-blue-500 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-gray-400 text-sm">Mineral Density</h3>
          <p className="text-2xl font-bold text-white mt-1">92/100</p>
          <p className="text-gray-500 text-xs mt-2">High mineral content</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-purple-500 text-sm font-medium">+22%</span>
          </div>
          <h3 className="text-gray-400 text-sm">Antioxidant Level</h3>
          <p className="text-2xl font-bold text-white mt-1">280 ORAC</p>
          <p className="text-gray-500 text-xs mt-2">Superior antioxidant activity</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-yellow-500 text-sm font-medium">A+</span>
          </div>
          <h3 className="text-gray-400 text-sm">Nutritional Grade</h3>
          <p className="text-2xl font-bold text-white mt-1">96/100</p>
          <p className="text-gray-500 text-xs mt-2">Premium quality produce</p>
        </div>
      </div>

      {/* Nutrient Tracking Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Nutrient Development Over Time</h3>
            <div className="flex items-center gap-2">
              {['vitamins', 'minerals', 'antioxidants'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedNutrient(type as any)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                    selectedNutrient === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={nutrientHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              {selectedNutrient === 'vitamins' && (
                <>
                  <Area type="monotone" dataKey="vitaminC" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Vitamin C (mg)" />
                  <Area type="monotone" dataKey="vitaminA" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Vitamin A (IU)" />
                </>
              )}
              {selectedNutrient === 'minerals' && (
                <>
                  <Area type="monotone" dataKey="calcium" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Calcium (mg)" />
                  <Area type="monotone" dataKey="iron" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Iron (mg)" />
                </>
              )}
              {selectedNutrient === 'antioxidants' && (
                <Area type="monotone" dataKey="antioxidants" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Total Antioxidants (ORAC)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Comparison */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nutritional Comparison by Crop</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={cropComparison}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="crop" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Radar name="Vitamin C" dataKey="vitaminC" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Antioxidants" dataKey="antioxidants" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals vs Actual */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nutritional Goals Achievement</h3>
        <div className="space-y-4">
          {nutritionalGoals.map((goal) => {
            const percentage = (goal.actual / goal.goal) * 100;
            const isExceeded = percentage >= 100;
            
            return (
              <div key={goal.nutrient} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{goal.nutrient}</span>
                    <span className="text-gray-400 text-sm">({goal.unit})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">Goal: {goal.goal}</span>
                    <span className={`font-medium ${isExceeded ? 'text-green-400' : 'text-yellow-400'}`}>
                      Actual: {goal.actual}
                    </span>
                    <span className={`text-sm font-medium ${isExceeded ? 'text-green-400' : 'text-yellow-400'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isExceeded ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental Impact and Health Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Impact */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact on Nutrition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={environmentalImpact} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="factor" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="vitaminC" fill="#10b981" name="Vitamin C Impact" />
              <Bar dataKey="antioxidants" fill="#ef4444" name="Antioxidant Impact" />
              <Bar dataKey="minerals" fill="#3b82f6" name="Mineral Impact" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Benefits */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Health Benefit Scores</h3>
          <div className="space-y-4">
            {healthBenefits.map((benefit) => (
              <div key={benefit.benefit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {benefit.benefit === 'Immune Support' && <Shield className="w-5 h-5 text-green-500" />}
                    {benefit.benefit === 'Bone Health' && <Bone className="w-5 h-5 text-blue-500" />}
                    {benefit.benefit === 'Eye Health' && <Eye className="w-5 h-5 text-purple-500" />}
                    {benefit.benefit === 'Heart Health' && <Heart className="w-5 h-5 text-red-500" />}
                    {benefit.benefit === 'Brain Function' && <Brain className="w-5 h-5 text-yellow-500" />}
                    {benefit.benefit === 'Anti-inflammatory' && <Activity className="w-5 h-5 text-cyan-500" />}
                    <span className="text-white font-medium">{benefit.benefit}</span>
                  </div>
                  <span className="text-white font-semibold">{benefit.score}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ 
                      width: `${benefit.score}%`,
                      backgroundColor: benefit.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Nutritional Insight</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your produce shows exceptional antioxidant levels and immune support properties. 
              Consider slight adjustments to mineral supplementation to optimize bone health benefits.
            </p>
          </div>
        </div>
      </div>

      {/* Production Recommendations */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Production Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Sun className="w-5 h-5 text-yellow-500" />
              <h4 className="text-white font-medium">Light Optimization</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Increase UV-B exposure by 15% during final growth stage to boost vitamin C and antioxidant production.
            </p>
            <button className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:text-purple-300">
              Apply Protocol <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h4 className="text-white font-medium">Nutrient Adjustment</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Optimize calcium and magnesium ratios (2.5:1) to improve mineral absorption and storage.
            </p>
            <button className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:text-purple-300">
              Update Recipe <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <h4 className="text-white font-medium">Climate Control</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Implement mild cold stress (18°C nights) to enhance anthocyanin and polyphenol synthesis.
            </p>
            <button className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:text-purple-300">
              Schedule Change <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}