'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Brain, Lightbulb,
  Download, Settings, Info, AlertTriangle, CheckCircle,
  Zap, Leaf, TreePine, Eye, Droplets, Target, X, Sliders,
  FileDown, Beaker, Plus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, HeatMapGrid
} from 'recharts';
// Stub imports
const SpectralRegressionEngine = {
  analyzeCorrelations: () => [],
  runRegression: () => null
}
type CorrelationResult = any;
type RegressionResult = any;

interface SpectralCorrelationDashboardProps {
  spaceId?: string;
  experimentId?: string;
}

export function SpectralCorrelationDashboard({ spaceId, experimentId }: SpectralCorrelationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'correlations' | 'regression' | 'optimization' | 'learning'>('correlations');
  const [selectedMetric, setSelectedMetric] = useState<string>('yieldWeight');
  const [correlationData, setCorrelationData] = useState<CorrelationResult[]>([]);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [environmentType, setEnvironmentType] = useState<'INDOOR' | 'GREENHOUSE'>('INDOOR');
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showExperimentsModal, setShowExperimentsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [includeEnvironmental, setIncludeEnvironmental] = useState(true);
  const [selectedVariables, setSelectedVariables] = useState<string[]>([
    'EC', 'pH', 'temperature', 'humidity', 'CO2', 'VPD', 'airFlow', 
    'dissolvedOxygen', 'rootTemp', 'lightIntensity', 'spectrum'
  ]);
  
  const engine = new SpectralRegressionEngine();

  // Available metrics for analysis
  const plantMetrics = [
    // Production & Growth
    { value: 'yieldWeight', label: 'Yield Weight', unit: 'g/m²', category: 'production' },
    { value: 'heightGrowth', label: 'Height Growth', unit: 'mm/day', category: 'growth' },
    { value: 'leafAreaGrowth', label: 'Leaf Area Growth', unit: 'cm²/day', category: 'growth' },
    { value: 'photosynthesisRate', label: 'Photosynthesis Rate', unit: 'μmol CO₂/m²/s', category: 'physiology' },
    { value: 'chlorophyllContent', label: 'Chlorophyll Content', unit: 'SPAD', category: 'physiology' },
    { value: 'stomatalConductance', label: 'Stomatal Conductance', unit: 'mmol/m²/s', category: 'physiology' },
    { value: 'biomassAccumulation', label: 'Biomass Accumulation', unit: 'g/day', category: 'production' },
    
    // Vitamins
    { value: 'vitaminC', label: 'Vitamin C', unit: 'mg/100g', category: 'vitamins' },
    { value: 'vitaminA', label: 'Vitamin A', unit: 'IU/100g', category: 'vitamins' },
    { value: 'vitaminE', label: 'Vitamin E', unit: 'mg/100g', category: 'vitamins' },
    { value: 'vitaminK', label: 'Vitamin K', unit: 'μg/100g', category: 'vitamins' },
    { value: 'folate', label: 'Folate', unit: 'μg/100g', category: 'vitamins' },
    { value: 'thiamine', label: 'Thiamine (B1)', unit: 'mg/100g', category: 'vitamins' },
    { value: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg/100g', category: 'vitamins' },
    
    // Minerals
    { value: 'calcium', label: 'Calcium', unit: 'mg/100g', category: 'minerals' },
    { value: 'iron', label: 'Iron', unit: 'mg/100g', category: 'minerals' },
    { value: 'potassium', label: 'Potassium', unit: 'mg/100g', category: 'minerals' },
    { value: 'magnesium', label: 'Magnesium', unit: 'mg/100g', category: 'minerals' },
    { value: 'zinc', label: 'Zinc', unit: 'mg/100g', category: 'minerals' },
    
    // Proteins & Amino Acids
    { value: 'totalProtein', label: 'Total Protein', unit: 'g/100g', category: 'proteins' },
    { value: 'lysine', label: 'Lysine', unit: 'mg/100g', category: 'proteins' },
    
    // Antioxidants & Phytochemicals
    { value: 'anthocyanins', label: 'Anthocyanins', unit: 'mg/100g', category: 'antioxidants' },
    { value: 'lycopene', label: 'Lycopene', unit: 'mg/100g', category: 'antioxidants' },
    { value: 'betaCarotene', label: 'Beta-Carotene', unit: 'mg/100g', category: 'antioxidants' },
    { value: 'lutein', label: 'Lutein', unit: 'mg/100g', category: 'antioxidants' },
    { value: 'ORAC', label: 'ORAC Value', unit: 'μmol TE/100g', category: 'antioxidants' },
    
    // Quality Metrics
    { value: 'brix', label: 'Brix (Sugar)', unit: '°Bx', category: 'quality' },
    { value: 'firmness', label: 'Firmness', unit: 'N', category: 'quality' },
    { value: 'shelfLife', label: 'Shelf Life', unit: 'days', category: 'quality' },
    { value: 'qualityScore', label: 'Quality Score', unit: '0-100', category: 'quality' }
  ];

  // Comprehensive environmental variables that affect plant growth
  const environmentalVariables = [
    // Nutrient Solution
    { value: 'EC', label: 'EC (Electrical Conductivity)', unit: 'mS/cm', category: 'nutrients' },
    { value: 'nutrientPH', label: 'Nutrient pH', unit: '', category: 'nutrients' },
    { value: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L', category: 'nutrients' },
    { value: 'waterTemp', label: 'Water Temperature', unit: '°C', category: 'nutrients' },
    { value: 'ORP', label: 'ORP (Oxidation-Reduction)', unit: 'mV', category: 'nutrients' },
    
    // Nutrient Concentrations
    { value: 'nitrogen', label: 'Nitrogen (N)', unit: 'ppm', category: 'nutrients' },
    { value: 'phosphorus', label: 'Phosphorus (P)', unit: 'ppm', category: 'nutrients' },
    { value: 'potassiumNutrient', label: 'Potassium (K)', unit: 'ppm', category: 'nutrients' },
    { value: 'calciumNutrient', label: 'Calcium (Ca)', unit: 'ppm', category: 'nutrients' },
    { value: 'magnesiumNutrient', label: 'Magnesium (Mg)', unit: 'ppm', category: 'nutrients' },
    { value: 'sulfur', label: 'Sulfur (S)', unit: 'ppm', category: 'nutrients' },
    
    // Air Environment
    { value: 'airTemp', label: 'Air Temperature', unit: '°C', category: 'climate' },
    { value: 'humidity', label: 'Relative Humidity', unit: '%', category: 'climate' },
    { value: 'CO2', label: 'CO₂ Concentration', unit: 'ppm', category: 'climate' },
    { value: 'VPD', label: 'VPD (Vapor Pressure Deficit)', unit: 'kPa', category: 'climate' },
    { value: 'airFlow', label: 'Air Flow Velocity', unit: 'm/s', category: 'climate' },
    { value: 'leafTemp', label: 'Leaf Temperature', unit: '°C', category: 'climate' },
    
    // Root Zone
    { value: 'rootTemp', label: 'Root Zone Temperature', unit: '°C', category: 'rootzone' },
    { value: 'substrateMoisture', label: 'Substrate Moisture', unit: '%', category: 'rootzone' },
    { value: 'rootZoneEC', label: 'Root Zone EC', unit: 'mS/cm', category: 'rootzone' },
    { value: 'rootZonePH', label: 'Root Zone pH', unit: '', category: 'rootzone' },
    { value: 'runoffVolume', label: 'Runoff Volume', unit: '%', category: 'rootzone' },
    
    // Light Parameters (separate from spectrum bands)
    { value: 'totalPPFD', label: 'Total PPFD', unit: 'μmol/m²/s', category: 'light' },
    { value: 'photoperiod', label: 'Photoperiod', unit: 'hours', category: 'light' },
    { value: 'DLI', label: 'Daily Light Integral', unit: 'mol/m²/day', category: 'light' },
    { value: 'lightDistance', label: 'Light Distance', unit: 'cm', category: 'light' },
    
    // Additional Factors
    { value: 'plantDensity', label: 'Plant Density', unit: 'plants/m²', category: 'cultivation' },
    { value: 'pruningIntensity', label: 'Pruning Intensity', unit: '%', category: 'cultivation' },
    { value: 'irrigationFreq', label: 'Irrigation Frequency', unit: 'times/day', category: 'cultivation' },
    { value: 'fertilizerRatio', label: 'NPK Ratio', unit: '', category: 'cultivation' }
  ];

  // Mock data for demonstration
  useEffect(() => {
    loadCorrelationData();
  }, [selectedMetric, timeRange]);

  const loadCorrelationData = async () => {
    setIsLoading(true);
    
    // In production, this would fetch from database
    // For now, generate mock correlation data
    const mockCorrelations: CorrelationResult[] = [
      { spectralBand: 'blue430_480', correlation: 0.72, pValue: 0.001, confidenceInterval: { lower: 0.65, upper: 0.78 }, sampleSize: 150 },
      { spectralBand: 'red625_660', correlation: 0.85, pValue: 0.0001, confidenceInterval: { lower: 0.80, upper: 0.89 }, sampleSize: 150 },
      { spectralBand: 'farRed700_800', correlation: 0.68, pValue: 0.002, confidenceInterval: { lower: 0.60, upper: 0.75 }, sampleSize: 150 },
      { spectralBand: 'green520_565', correlation: -0.32, pValue: 0.05, confidenceInterval: { lower: -0.45, upper: -0.18 }, sampleSize: 150 },
      { spectralBand: 'uv365_400', correlation: 0.45, pValue: 0.01, confidenceInterval: { lower: 0.35, upper: 0.54 }, sampleSize: 150 },
      { spectralBand: 'violet400_430', correlation: 0.58, pValue: 0.005, confidenceInterval: { lower: 0.48, upper: 0.66 }, sampleSize: 150 },
      { spectralBand: 'cyan480_520', correlation: 0.41, pValue: 0.02, confidenceInterval: { lower: 0.30, upper: 0.51 }, sampleSize: 150 },
      { spectralBand: 'yellow565_590', correlation: -0.15, pValue: 0.15, confidenceInterval: { lower: -0.28, upper: -0.01 }, sampleSize: 150 },
      { spectralBand: 'orange590_625', correlation: 0.62, pValue: 0.003, confidenceInterval: { lower: 0.53, upper: 0.70 }, sampleSize: 150 },
      { spectralBand: 'deepRed660_700', correlation: 0.78, pValue: 0.0005, confidenceInterval: { lower: 0.71, upper: 0.84 }, sampleSize: 150 }
    ];

    setCorrelationData(mockCorrelations);
    setIsLoading(false);
  };

  const runRegressionAnalysis = async () => {
    setIsLoading(true);
    
    // Mock regression results
    const mockRegression: RegressionResult = {
      modelType: 'LINEAR' as any,
      targetMetric: selectedMetric,
      coefficients: [0.023, 0.045, 0.012, -0.008, 0.034, 0.056, 0.021, 0.067, 0.089, 0.041],
      intercept: 12.5,
      r2Score: 0.87,
      rmse: 2.34,
      mape: 8.5,
      pValues: [0.001, 0.0001, 0.05, 0.12, 0.002, 0.0003, 0.01, 0.0001, 0.00001, 0.005],
      featureImportance: {
        'red625_660': 1.0,
        'deepRed660_700': 0.92,
        'blue430_480': 0.78,
        'farRed700_800': 0.65,
        'violet400_430': 0.54,
        'orange590_625': 0.48,
        'uv365_400': 0.42,
        'cyan480_520': 0.35,
        'green520_565': 0.28,
        'yellow565_590': 0.15
      }
    };

    setRegressionResults(mockRegression);
    setIsLoading(false);
  };

  const renderCorrelationsTab = () => (
    <div className="space-y-6">
      {/* Correlation Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Spectral Band Correlations with {plantMetrics.find(m => m.value === selectedMetric)?.label}
        </h3>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correlationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="spectralBand" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9ca3af" domain={[-1, 1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                formatter={(value: number) => value.toFixed(3)}
              />
              <Bar dataKey="correlation">
                {correlationData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.correlation > 0 ? '#10b981' : '#ef4444'}
                    fillOpacity={Math.abs(entry.correlation)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Significance Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500" />
            <span className="text-gray-400">Positive correlation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500" />
            <span className="text-gray-400">Negative correlation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">p-value: </span>
            <span className="text-green-400">*** {'<'} 0.001</span>
            <span className="text-yellow-400">** {'<'} 0.01</span>
            <span className="text-orange-400">* {'<'} 0.05</span>
          </div>
        </div>
      </div>

      {/* Correlation Details Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Correlation Analysis</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-4">Spectral Band</th>
                <th className="text-right py-2 px-4">Wavelength</th>
                <th className="text-right py-2 px-4">Correlation</th>
                <th className="text-right py-2 px-4">p-value</th>
                <th className="text-right py-2 px-4">95% CI</th>
                <th className="text-right py-2 px-4">Significance</th>
              </tr>
            </thead>
            <tbody>
              {correlationData
                .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                .map((row, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-2 px-4 text-white">{row.spectralBand}</td>
                    <td className="py-2 px-4 text-right text-gray-300">
                      {row.spectralBand.split('_').join('-')} nm
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className={row.correlation > 0 ? 'text-green-400' : 'text-red-400'}>
                        {row.correlation.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right text-gray-300">
                      {row.pValue.toFixed(4)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-300">
                      [{row.confidenceInterval.lower.toFixed(2)}, {row.confidenceInterval.upper.toFixed(2)}]
                    </td>
                    <td className="py-2 px-4 text-right">
                      {row.pValue < 0.001 && <span className="text-green-400">***</span>}
                      {row.pValue >= 0.001 && row.pValue < 0.01 && <span className="text-yellow-400">**</span>}
                      {row.pValue >= 0.01 && row.pValue < 0.05 && <span className="text-orange-400">*</span>}
                      {row.pValue >= 0.05 && <span className="text-gray-500">ns</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRegressionTab = () => (
    <div className="space-y-6">
      {/* Variable Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Input Variables Selection</h3>
        
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
            <input
              type="checkbox"
              checked={includeEnvironmental}
              onChange={(e) => setIncludeEnvironmental(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-purple-600"
            />
            Include Environmental Variables (EC, pH, Temperature, etc.)
          </label>
        </div>

        {includeEnvironmental && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Nutrients</h4>
              <div className="space-y-1">
                {environmentalVariables.filter(v => v.category === 'nutrients').slice(0, 4).map(variable => (
                  <label key={variable.value} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedVariables.includes(variable.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVariables([...selectedVariables, variable.value]);
                        } else {
                          setSelectedVariables(selectedVariables.filter(v => v !== variable.value));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300">{variable.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Climate</h4>
              <div className="space-y-1">
                {environmentalVariables.filter(v => v.category === 'climate').slice(0, 4).map(variable => (
                  <label key={variable.value} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedVariables.includes(variable.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVariables([...selectedVariables, variable.value]);
                        } else {
                          setSelectedVariables(selectedVariables.filter(v => v !== variable.value));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300">{variable.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Root Zone</h4>
              <div className="space-y-1">
                {environmentalVariables.filter(v => v.category === 'rootzone').slice(0, 4).map(variable => (
                  <label key={variable.value} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedVariables.includes(variable.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVariables([...selectedVariables, variable.value]);
                        } else {
                          setSelectedVariables(selectedVariables.filter(v => v !== variable.value));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300">{variable.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Light</h4>
              <div className="space-y-1">
                {environmentalVariables.filter(v => v.category === 'light').map(variable => (
                  <label key={variable.value} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedVariables.includes(variable.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVariables([...selectedVariables, variable.value]);
                        } else {
                          setSelectedVariables(selectedVariables.filter(v => v !== variable.value));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300">{variable.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          {selectedVariables.length} environmental variables selected • {10} spectral bands • Analyzing impact on: {plantMetrics.find(m => m.value === selectedMetric)?.label}
        </div>
      </div>

      {!regressionResults ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Run Comprehensive Regression Analysis</h3>
          <p className="text-gray-400 mb-6">
            Analyze spectral bands and environmental factors to understand their combined effect on {plantMetrics.find(m => m.value === selectedMetric)?.label}
          </p>
          <button
            onClick={runRegressionAnalysis}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Run Multiple Regression
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Model Performance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Model Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">R² Score</p>
                <p className="text-2xl font-bold text-green-400">{(regressionResults.r2Score * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Variance explained</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">RMSE</p>
                <p className="text-2xl font-bold text-blue-400">{regressionResults.rmse.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Root mean square error</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">MAPE</p>
                <p className="text-2xl font-bold text-yellow-400">{regressionResults.mape.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Mean absolute % error</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Model Type</p>
                <p className="text-2xl font-bold text-purple-400">{regressionResults.modelType}</p>
                <p className="text-xs text-gray-500 mt-1">Algorithm used</p>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Feature Importance</h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.entries(regressionResults.featureImportance)
                    .map(([feature, importance]) => ({ feature, importance }))
                    .sort((a, b) => b.importance - a.importance)}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" domain={[0, 1]} />
                  <YAxis dataKey="feature" type="category" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    formatter={(value: number) => (value * 100).toFixed(1) + '%'}
                  />
                  <Bar dataKey="importance" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regression Equation */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Regression Equation</h3>
            
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <p className="text-green-400">
                {selectedMetric} = {regressionResults.intercept.toFixed(2)}
              </p>
              {Object.entries(regressionResults.featureImportance)
                .slice(0, 5)
                .map(([feature, _], index) => (
                  <p key={feature} className="text-gray-300 ml-8">
                    + ({regressionResults.coefficients[index]?.toFixed(4)}) × {feature}
                  </p>
                ))}
              <p className="text-gray-500 ml-8">+ ... (other terms)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Spectrum Optimizer */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Optimization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Spectrum */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Current Spectrum</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Blue (430-480nm)</span>
                <span className="text-sm text-blue-400">85 μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Red (625-660nm)</span>
                <span className="text-sm text-red-400">120 μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Far Red (700-800nm)</span>
                <span className="text-sm text-pink-400">25 μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Green (520-565nm)</span>
                <span className="text-sm text-green-400">15 μmol/m²/s</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Total PPFD</span>
                  <span className="text-sm font-bold text-white">245 μmol/m²/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Power Consumption</span>
                  <span className="text-sm font-bold text-white">180W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optimized Spectrum */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">AI-Optimized Spectrum</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Blue (430-480nm)</span>
                <span className="text-sm text-blue-400">95 μmol/m²/s (+11%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Red (625-660nm)</span>
                <span className="text-sm text-red-400">135 μmol/m²/s (+12%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Far Red (700-800nm)</span>
                <span className="text-sm text-pink-400">18 μmol/m²/s (-28%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Green (520-565nm)</span>
                <span className="text-sm text-green-400">8 μmol/m²/s (-47%)</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Total PPFD</span>
                  <span className="text-sm font-bold text-white">256 μmol/m²/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Power Consumption</span>
                  <span className="text-sm font-bold text-green-400">165W (-8.3%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predicted Improvements */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Yield Improvement</p>
            <p className="text-xl font-bold text-green-400">+15.2%</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Energy Savings</p>
            <p className="text-xl font-bold text-yellow-400">8.3%</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Confidence Score</p>
            <p className="text-xl font-bold text-blue-400">92%</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Apply Optimized Spectrum
          </button>
        </div>
      </div>
    </div>
  );

  const renderLearningTab = () => (
    <div className="space-y-6">
      {/* Learning Progress */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Continuous Learning Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Data Points Collected</p>
            <p className="text-2xl font-bold text-blue-400">12,847</p>
            <p className="text-xs text-green-400 mt-1">+326 today</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Models Trained</p>
            <p className="text-2xl font-bold text-purple-400">24</p>
            <p className="text-xs text-gray-500 mt-1">8 active</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Prediction Accuracy</p>
            <p className="text-2xl font-bold text-green-400">94.2%</p>
            <p className="text-xs text-green-400 mt-1">+2.1% this month</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Crops Analyzed</p>
            <p className="text-2xl font-bold text-yellow-400">6</p>
            <p className="text-xs text-gray-500 mt-1">3 cultivars each</p>
          </div>
        </div>

        {/* Learning Curve */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { month: 'Jan', accuracy: 78, dataPoints: 1000 },
                { month: 'Feb', accuracy: 82, dataPoints: 2500 },
                { month: 'Mar', accuracy: 85, dataPoints: 4200 },
                { month: 'Apr', accuracy: 88, dataPoints: 6100 },
                { month: 'May', accuracy: 91, dataPoints: 8500 },
                { month: 'Jun', accuracy: 92.5, dataPoints: 10200 },
                { month: 'Jul', accuracy: 94.2, dataPoints: 12847 }
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#10b981" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Prediction Accuracy (%)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="dataPoints" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Data Points"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discovered Insights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Discoveries</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Blue Light Timing Critical for Lettuce</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Discovered that increasing blue light by 20% during hours 4-8 of photoperiod increases 
                  leaf density by 18% without affecting overall biomass. Confidence: 96%
                </p>
                <p className="text-xs text-gray-500 mt-2">Discovered 3 days ago • 847 data points</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Red:Far-Red Ratio Sweet Spot Found</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Optimal R:FR ratio of 4.2:1 maximizes both yield and quality for tomatoes in 
                  flowering stage. Deviation of ±0.3 reduces fruit set by 12%. Confidence: 89%
                </p>
                <p className="text-xs text-gray-500 mt-2">Discovered 1 week ago • 1,235 data points</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Green Light Not Always Detrimental</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Contrary to common belief, 5-10% green light improves lower canopy photosynthesis 
                  in dense crops by 22%. Effect most pronounced in crops {'>'} 60cm tall. Confidence: 82%
                </p>
                <p className="text-xs text-gray-500 mt-2">Discovered 2 weeks ago • 656 data points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Spectral Correlation & Learning System
          </h2>
          <p className="text-gray-400 mt-1">
            Discover optimal light recipes through continuous analysis and machine learning
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Environment Type Selector */}
          <select
            value={environmentType}
            onChange={(e) => setEnvironmentType(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="INDOOR">Indoor (100% Artificial)</option>
            <option value="GREENHOUSE">Greenhouse (Mixed Light)</option>
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            {plantMetrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label} ({metric.unit})
              </option>
            ))}
          </select>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(['correlations', 'regression', 'optimization', 'learning'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'correlations' && renderCorrelationsTab()}
        {activeTab === 'regression' && renderRegressionTab()}
        {activeTab === 'optimization' && renderOptimizationTab()}
        {activeTab === 'learning' && renderLearningTab()}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Set Learning Goals
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            Define specific targets for the AI to optimize towards
          </p>
          <button 
            onClick={() => setShowGoalsModal(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Configure Goals →
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Live Experiments
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            3 active A/B tests running with different spectra
          </p>
          <button 
            onClick={() => setShowExperimentsModal(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View Experiments →
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Export Models
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            Download trained models for offline use
          </p>
          <button 
            onClick={() => setShowExportModal(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Export Data →
          </button>
        </div>
      </div>

      {/* Goals Configuration Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  Configure Learning Goals
                </h2>
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Primary Optimization Target</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['Maximize Yield', 'Maximize Quality', 'Minimize Cost', 'Balance All'].map((goal) => (
                    <button
                      key={goal}
                      className="p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-purple-500 transition-colors"
                    >
                      <h4 className="font-medium text-white mb-1">{goal}</h4>
                      <p className="text-sm text-gray-400">Optimize spectrum for {goal.toLowerCase()}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Specific Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Target Yield (g/m²)</span>
                    <input type="number" className="bg-gray-700 text-white px-3 py-1 rounded w-24" defaultValue="600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Min Quality Score</span>
                    <input type="number" className="bg-gray-700 text-white px-3 py-1 rounded w-24" defaultValue="85" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Max Energy Cost ($/g)</span>
                    <input type="number" className="bg-gray-700 text-white px-3 py-1 rounded w-24" defaultValue="0.15" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Goals configured successfully!');
                    setShowGoalsModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Goals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experiments Modal */}
      {showExperimentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Beaker className="w-8 h-8 text-green-400" />
                  Active Experiments
                </h2>
                <button
                  onClick={() => setShowExperimentsModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {[
                  {
                    name: 'Blue vs Red Ratio Test',
                    status: 'Active',
                    progress: 65,
                    started: '2024-01-05',
                    samples: 120,
                    confidence: 87
                  },
                  {
                    name: 'UV-A Enhancement Study',
                    status: 'Active',
                    progress: 42,
                    started: '2024-01-10',
                    samples: 80,
                    confidence: 71
                  },
                  {
                    name: 'Far-Red EOD Treatment',
                    status: 'Active',
                    progress: 89,
                    started: '2023-12-28',
                    samples: 200,
                    confidence: 94
                  }
                ].map((experiment) => (
                  <div key={experiment.name} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">{experiment.name}</h3>
                        <p className="text-sm text-gray-400">Started {experiment.started}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
                        {experiment.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{experiment.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${experiment.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Samples: </span>
                          <span className="text-white">{experiment.samples}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence: </span>
                          <span className="text-white">{experiment.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm">
                        Download Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Experiment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileDown className="w-8 h-8 text-blue-400" />
                  Export Data
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Select Export Format</h3>
                <div className="space-y-2">
                  {[
                    { format: 'CSV', description: 'Spreadsheet compatible' },
                    { format: 'JSON', description: 'Machine readable' },
                    { format: 'PDF Report', description: 'Formatted document' },
                    { format: 'Python Model', description: 'Trained ML model' }
                  ].map((option) => (
                    <button
                      key={option.format}
                      className="w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                      <h4 className="font-medium text-white">{option.format}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Date Range</h3>
                <select className="w-full bg-gray-800 text-white p-3 rounded-lg">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  alert('Export started! You will receive an email when ready.');
                  setShowExportModal(false);
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}