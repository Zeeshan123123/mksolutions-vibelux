'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Brain,
  Upload,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Check,
  RefreshCw,
  Download,
  Settings,
  Play,
  ChevronRight,
  Info,
  Zap,
  Target,
  Database,
  GitBranch
} from 'lucide-react';
import { MLTrainingService, TrainingResult, ModelMetrics } from '@/lib/ml-training-service';

interface MLModelTrainingProps {
  onModelTrained?: (model: TrainingResult) => void;
}

export function MLModelTraining({ onModelTrained }: MLModelTrainingProps) {
  const [activeTab, setActiveTab] = useState<'train' | 'models' | 'performance'>('train');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('gradient-boosting');
  const [trainedModels, setTrainedModels] = useState<TrainingResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<TrainingResult | null>(null);
  
  const mlService = new MLTrainingService();

  // Simulate training progress
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // Simulate generating training data
      const mockTrainingData = generateMockTrainingData(1000);
      
      // Train the model
      const result = await mlService.trainModel(mockTrainingData, {
        algorithm: selectedAlgorithm as any,
        validationSplit: 0.2,
        hyperparameters: getDefaultHyperparameters(selectedAlgorithm)
      });
      
      setTrainedModels(prev => [result, ...prev]);
      setSelectedModel(result);
      
      if (onModelTrained) {
        onModelTrained(result);
      }
      
      // Show success message
      alert('Model trained successfully!');
    } catch (error) {
      logger.error('system', 'Training error:', error );
      alert('Training failed: ' + (error as Error).message);
    } finally {
      setIsTraining(false);
      setTrainingProgress(100);
    }
  };

  const algorithms = [
    {
      id: 'gradient-boosting',
      name: 'Gradient Boosting',
      description: 'Best for general failure prediction',
      accuracy: '92%',
      speed: 'Fast',
      icon: TrendingUp
    },
    {
      id: 'neural-network',
      name: 'Neural Network',
      description: 'Complex pattern recognition',
      accuracy: '94%',
      speed: 'Medium',
      icon: Brain
    },
    {
      id: 'lstm',
      name: 'LSTM Network',
      description: 'Time-series prediction',
      accuracy: '93%',
      speed: 'Slow',
      icon: GitBranch
    },
    {
      id: 'random-forest',
      name: 'Random Forest',
      description: 'Robust and interpretable',
      accuracy: '90%',
      speed: 'Fast',
      icon: Database
    }
  ];

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          ML Model Training Center
        </h2>
        <p className="text-gray-400">
          Train custom predictive maintenance models with your equipment data
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {['train', 'models', 'performance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'train' && (
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Select Algorithm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {algorithms.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAlgorithm === algo.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <algo.icon className="w-6 h-6 text-purple-400 mt-1" />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-white">{algo.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{algo.description}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-green-400">Accuracy: {algo.accuracy}</span>
                        <span className="text-blue-400">Speed: {algo.speed}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Training Configuration */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Training Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Training Data Source
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option>Last 6 months (Recommended)</option>
                  <option>Last 12 months</option>
                  <option>Last 24 months</option>
                  <option>Custom date range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipment Types
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option>All Equipment</option>
                  <option>LED Grow Lights</option>
                  <option>HVAC Systems</option>
                  <option>Pumps & Motors</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Validation Split
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  defaultValue="20"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10%</span>
                  <span>20%</span>
                  <span>30%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feature Selection
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Sensor Data (Temperature, Vibration, Current)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Maintenance History</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Environmental Factors</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Quality Check */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-300 mb-1">Data Quality Check</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>1,247 equipment records available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>98.5% data completeness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>43 failure events for training</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Current Stage:</span>
                    <span className="ml-2 text-white">
                      {trainingProgress < 30 ? 'Data Preprocessing' :
                       trainingProgress < 70 ? 'Model Training' :
                       trainingProgress < 90 ? 'Validation' : 'Finalizing'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Time Remaining:</span>
                    <span className="ml-2 text-white">
                      ~{Math.max(0, Math.floor((100 - trainingProgress) / 10))} minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start Training Button */}
          <button
            onClick={startTraining}
            disabled={isTraining}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              isTraining
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Training
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Trained Models</h3>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Model
            </button>
          </div>

          {trainedModels.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No trained models yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Train your first model to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainedModels.map((model) => (
                <div
                  key={model.modelId}
                  className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel?.modelId === model.modelId
                      ? 'border-purple-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {model.parameters.algorithm.replace('-', ' ').split(' ')
                          .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                          v{model.version}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Trained on {new Date(model.trainedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Accuracy</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">F1 Score:</span>
                      <span className="ml-2 text-white">
                        {model.metrics.f1Score.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">MSE:</span>
                      <span className="ml-2 text-white">
                        {model.metrics.mse.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Confidence:</span>
                      <span className="ml-2 text-white">
                        ±{((model.metrics.confidenceInterval.upper - 
                            model.metrics.confidenceInterval.lower) / 2).toFixed(1)} days
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Size:</span>
                      <span className="ml-2 text-white">
                        {model.parameters.trainingDataSize}
                      </span>
                    </div>
                  </div>

                  {selectedModel?.modelId === model.modelId && (
                    <div className="mt-4 pt-4 border-t border-gray-700 flex gap-3">
                      <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Deploy Model
                      </button>
                      <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Retrain
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && selectedModel && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Model Performance Metrics</h3>
            
            {/* Performance Chart */}
            <div className="h-64 bg-gray-900 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">Accuracy Over Time</div>
              {/* Placeholder for chart */}
              <div className="h-full flex items-center justify-center text-gray-600">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>

            {/* Feature Importance */}
            <div>
              <h4 className="font-medium mb-3">Feature Importance</h4>
              <div className="space-y-2">
                {[
                  { name: 'Runtime Hours', importance: 95 },
                  { name: 'Temperature Trend', importance: 88 },
                  { name: 'Vibration Max', importance: 82 },
                  { name: 'Days Since Maintenance', importance: 76 },
                  { name: 'Efficiency Drop', importance: 71 }
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-40">{feature.name}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${feature.importance}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-10 text-right">
                      {feature.importance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {(selectedModel.metrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">Overall Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {(selectedModel.metrics.precision * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {(selectedModel.metrics.recall * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">Recall</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {selectedModel.metrics.mse.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400 mt-1">MSE (days)</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium text-green-300">Model Ready for Deployment</div>
                  <div className="text-sm text-gray-300 mt-1">
                    This model meets the accuracy threshold and is ready for production use
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate mock training data
function generateMockTrainingData(count: number): any[] {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    data.push({
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000), // Daily data
      equipmentId: `equipment-${Math.floor(Math.random() * 50)}`,
      sensorData: {
        temperature: 65 + Math.random() * 20,
        vibration: 0.5 + Math.random() * 2,
        current: 10 + Math.random() * 5,
        runtime: i * 24 + Math.random() * 24,
        efficiency: 95 - Math.random() * 15
      },
      maintenanceEvents: Math.random() > 0.9 ? [{
        type: Math.random() > 0.5 ? 'preventive' : 'corrective',
        date: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000),
        cost: 100 + Math.random() * 1000
      }] : [],
      environmentalFactors: {
        ambientTemp: 70 + Math.random() * 10,
        humidity: 40 + Math.random() * 30,
        dustLevel: Math.random() * 100
      }
    });
  }
  
  return data;
}

function getDefaultHyperparameters(algorithm: string): Record<string, any> {
  const params: Record<string, any> = {
    'gradient-boosting': {
      n_estimators: 100,
      learning_rate: 0.1,
      max_depth: 5
    },
    'neural-network': {
      layers: [64, 32, 16, 1],
      activation: 'relu',
      epochs: 100
    },
    'lstm': {
      units: 128,
      sequence_length: 30,
      dropout: 0.2
    },
    'random-forest': {
      n_trees: 50,
      max_depth: 10
    }
  };
  
  return params[algorithm] || params['gradient-boosting'];
}