"use client"

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/production-logger';
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  CloudRain,
  Thermometer,
  AlertTriangle,
  Shield,
  Layers,
  Timer,
  Activity,
  Settings,
  ChevronRight,
  Power,
  Zap,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Flower2,
  Sprout,
  BarChart3
} from 'lucide-react';
import { 
  blackoutController,
  cannabisAutomation,
  ScreenType,
  ScreenLayer,
  DeploymentState,
  ScreenConfig,
  ScreenStatus,
  PhotoperiodConfig,
  DeploymentStrategy
} from '@/lib/greenhouse/blackout-curtain-control';

interface ScreenControlProps {
  screen: ScreenConfig;
  status: ScreenStatus;
  onDeploy: (position: number, strategy?: DeploymentStrategy) => void;
}

const ScreenControl: React.FC<ScreenControlProps> = ({ screen, status, onDeploy }) => {
  const [targetPosition, setTargetPosition] = useState(status.currentPosition);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deploymentMode, setDeploymentMode] = useState<'immediate' | 'gradual' | 'staged'>('immediate');

  const getScreenIcon = () => {
    switch (screen.type) {
      case ScreenType.BLACKOUT: return <Moon className="w-4 h-4" />;
      case ScreenType.SHADE: return <Sun className="w-4 h-4" />;
      case ScreenType.THERMAL: return <Thermometer className="w-4 h-4" />;
      case ScreenType.ENERGY: return <Zap className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getStateColor = () => {
    switch (status.state) {
      case DeploymentState.DEPLOYING:
      case DeploymentState.RETRACTING:
        return 'text-yellow-400';
      case DeploymentState.ERROR:
        return 'text-red-400';
      case DeploymentState.MAINTENANCE:
        return 'text-orange-400';
      default:
        return 'text-green-400';
    }
  };

  const handleDeploy = () => {
    const strategy: DeploymentStrategy = {
      mode: deploymentMode,
      speed: 'normal',
      checkpoints: deploymentMode === 'staged' ? [25, 50, 75] : [],
      weatherOverrides: {
        highWind: 'hold',
        rain: screen.type === ScreenType.BLACKOUT ? 'deploy' : 'hold',
        snow: 'retract',
        highTemp: screen.type === ScreenType.SHADE ? 'deploy' : 'hold'
      }
    };
    
    onDeploy(targetPosition, strategy);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-700/50 ${getStateColor()}`}>
            {getScreenIcon()}
          </div>
          <div>
            <h3 className="font-medium text-white">{screen.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="capitalize">{screen.layer} Layer</span>
              <span>•</span>
              <span>{screen.zone || 'All Zones'}</span>
              <span>•</span>
              <span className={getStateColor()}>{status.state}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Position Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Current Position</span>
          <span className="text-white font-medium">{status.currentPosition}%</span>
        </div>
        
        <div className="relative">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
              style={{ width: `${status.currentPosition}%` }}
            />
          </div>
          
          {status.targetPosition !== status.currentPosition && (
            <div 
              className="absolute top-0 h-2 w-1 bg-yellow-400 rounded"
              style={{ left: `${status.targetPosition}%` }}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={screen.maxPosition}
            value={targetPosition}
            onChange={(e) => setTargetPosition(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium w-12 text-right">{targetPosition}%</span>
          <button
            onClick={handleDeploy}
            disabled={status.state === DeploymentState.DEPLOYING || status.state === DeploymentState.RETRACTING}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Deploy
          </button>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Deployment Mode</label>
              <select
                value={deploymentMode}
                onChange={(e) => setDeploymentMode(e.target.value as any)}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="immediate">Immediate</option>
                <option value="gradual">Gradual</option>
                <option value="staged">Staged</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Motor Temperature</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      status.motorTemp > 60 ? 'bg-red-500' : 
                      status.motorTemp > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(status.motorTemp / 80) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{status.motorTemp}°C</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Light Transmission</span>
              <p className="font-medium">{screen.lightTransmission}%</p>
            </div>
            <div>
              <span className="text-gray-400">Energy Savings</span>
              <p className="font-medium">{screen.energySavings}%</p>
            </div>
            <div>
              <span className="text-gray-400">Deploy Speed</span>
              <p className="font-medium">{screen.deploymentSpeed}s</p>
            </div>
          </div>

          {status.maintenanceRequired && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Maintenance required</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PhotoperiodControlProps {
  config: PhotoperiodConfig;
  onUpdate: (config: PhotoperiodConfig) => void;
}

const PhotoperiodControl: React.FC<PhotoperiodControlProps> = ({ config, onUpdate }) => {
  const [lightHours, setLightHours] = useState(
    config.growthStage === 'vegetative' ? 18 : 12
  );
  const [startTime, setStartTime] = useState(
    config.lightDeprivation.startTime || '06:00'
  );

  const getStageIcon = () => {
    switch (config.growthStage) {
      case 'vegetative': return <Sprout className="w-5 h-5" />;
      case 'flowering': return <Flower2 className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            {getStageIcon()}
          </div>
          <div>
            <h3 className="font-medium text-white">{config.name}</h3>
            <p className="text-sm text-gray-400">
              {config.cropType} - {config.growthStage} stage
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {config.blackoutRequired && (
            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium">
              Blackout Active
            </div>
          )}
          {config.darkPeriodProtection.enabled && (
            <div className="p-2 rounded-lg bg-gray-700/50" title="Dark Period Protection">
              <EyeOff className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Photoperiod Schedule */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Light Period</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="24"
                value={lightHours}
                onChange={(e) => setLightHours(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-medium w-12">{lightHours}h</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Visual Schedule */}
        <div className="relative h-16 bg-gray-700/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 24 }, (_, hour) => {
              const isLight = hour >= parseInt(startTime) && 
                             hour < (parseInt(startTime) + lightHours) % 24;
              return (
                <div
                  key={hour}
                  className={`flex-1 border-r border-gray-700/50 ${
                    isLight ? 'bg-yellow-500/30' : 'bg-purple-500/30'
                  }`}
                  title={`${hour}:00`}
                />
              );
            })}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm">
              <Sunrise className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">{startTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sunset className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">
                {`${(parseInt(startTime) + lightHours) % 24}:00`}
              </span>
            </div>
          </div>
        </div>

        {/* Light Deprivation Settings */}
        {config.lightDeprivation.enabled && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">Light Deprivation Active</span>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{config.lightDeprivation.duration}h blackout period</span>
              </div>
            </div>
            
            {config.lightDeprivation.gradualTransition && (
              <div className="text-sm text-gray-400">
                Gradual transition over {config.lightDeprivation.transitionMinutes} minutes
              </div>
            )}
          </div>
        )}

        {/* Dark Period Protection */}
        {config.darkPeriodProtection.enabled && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg">
            <div>
              <span className="text-sm text-gray-400">Max Light During Dark</span>
              <p className="font-medium">{config.darkPeriodProtection.maxAllowedLux} lux</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Alert on Breach</span>
              <p className="font-medium">{config.darkPeriodProtection.alertOnBreach ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function BlackoutCurtainPanel() {
  const [screens, setScreens] = useState<Map<string, ScreenConfig>>(new Map());
  const [statuses, setStatuses] = useState<Map<string, ScreenStatus>>(new Map());
  const [photoperiods, setPhotoperiods] = useState<PhotoperiodConfig[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<ScreenLayer | 'all'>('all');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [cannabisStage, setCannabisStage] = useState<'vegetative' | 'flowering'>('vegetative');

  useEffect(() => {
    // Initialize demo screens
    const demoScreens: ScreenConfig[] = [
      {
        id: 'blackout-1',
        name: 'Main Blackout Screen',
        type: ScreenType.BLACKOUT,
        layer: ScreenLayer.MIDDLE,
        zone: 'Zone A',
        lightTransmission: 0,
        energySavings: 15,
        deploymentSpeed: 180,
        motorType: 'servo',
        maxPosition: 100,
        safetyFeatures: {
          windSpeedLimit: 20,
          rainSensor: true,
          snowLoadLimit: 50,
          temperatureLimit: 45
        }
      },
      {
        id: 'shade-1',
        name: 'Shade Screen 30%',
        type: ScreenType.SHADE,
        layer: ScreenLayer.UPPER,
        zone: 'Zone A',
        lightTransmission: 70,
        energySavings: 10,
        deploymentSpeed: 120,
        motorType: 'stepper',
        maxPosition: 100,
        safetyFeatures: {
          windSpeedLimit: 15,
          rainSensor: false,
          snowLoadLimit: 30,
          temperatureLimit: 50
        }
      },
      {
        id: 'thermal-1',
        name: 'Thermal Energy Screen',
        type: ScreenType.THERMAL,
        layer: ScreenLayer.UPPER,
        zone: 'Zone A',
        lightTransmission: 85,
        energySavings: 35,
        deploymentSpeed: 150,
        motorType: 'servo',
        maxPosition: 100,
        safetyFeatures: {
          windSpeedLimit: 25,
          rainSensor: false,
          snowLoadLimit: 40,
          temperatureLimit: 40
        }
      }
    ];

    // Register screens
    demoScreens.forEach(screen => {
      blackoutController.registerScreen(screen);
    });

    // Setup event listeners
    const handleScreenPosition = (data: any) => {
      setStatuses(blackoutController.getAllStatuses());
    };

    const handleAlert = (alert: any) => {
      setAlerts(prev => [...prev, { ...alert, timestamp: new Date() }]);
    };

    blackoutController.on('screen:position', handleScreenPosition);
    blackoutController.on('darkperiod:breach', handleAlert);
    blackoutController.on('motor:overheat', handleAlert);
    blackoutController.on('maintenance:required', handleAlert);

    // Initial status update
    const interval = setInterval(() => {
      setStatuses(blackoutController.getAllStatuses());
    }, 1000);

    // Mock weather data
    setWeatherData({
      temperature: 25,
      humidity: 65,
      windSpeed: 8,
      rain: false,
      cloudCover: 30
    });

    return () => {
      clearInterval(interval);
      blackoutController.removeAllListeners();
    };
  }, []);

  const handleScreenDeploy = async (screenId: string, position: number, strategy?: DeploymentStrategy) => {
    try {
      await blackoutController.deployScreen(screenId, position, strategy);
    } catch (error) {
      logger.error('system', 'Deployment error:', error );
    }
  };

  const handleEmergencyRetract = async () => {
    await blackoutController.emergencyRetract('Manual emergency retract');
  };

  const handleCannabisStageChange = (stage: 'vegetative' | 'flowering') => {
    if (stage === 'vegetative') {
      const config = cannabisAutomation.configureVegetativeStage(18, ['Zone A']);
      setPhotoperiods([config]);
    } else {
      const config = cannabisAutomation.configureFloweringStage(['Zone A']);
      setPhotoperiods([config]);
    }
    setCannabisStage(stage);
  };

  const filteredScreens = Array.from(statuses.entries()).filter(([id, status]) => {
    const screen = blackoutController.getScreensByType(ScreenType.BLACKOUT)
      .concat(blackoutController.getScreensByType(ScreenType.SHADE))
      .concat(blackoutController.getScreensByType(ScreenType.THERMAL))
      .find(s => s.id === id);
    
    return selectedLayer === 'all' || screen?.layer === selectedLayer;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blackout & Screen Control</h1>
            <p className="text-gray-400 mt-1">Advanced multi-layer greenhouse screen management</p>
          </div>
          
          <button
            onClick={handleEmergencyRetract}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Retract
          </button>
        </div>

        {/* Weather & System Status */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weatherData && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </div>
                <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Wind className="w-4 h-4" />
                  <span>Wind Speed</span>
                </div>
                <p className="text-2xl font-bold">{weatherData.windSpeed} m/s</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <CloudRain className="w-4 h-4" />
                  <span>Rain</span>
                </div>
                <p className="text-2xl font-bold">{weatherData.rain ? 'Yes' : 'No'}</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Activity className="w-4 h-4" />
                  <span>Active Screens</span>
                </div>
                <p className="text-2xl font-bold">
                  {Array.from(statuses.values()).filter(s => s.currentPosition > 0).length}
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Active Alerts</span>
                </div>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </>
          )}
        </div>

        {/* Layer Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter by layer:</span>
          <div className="flex gap-2">
            {(['all', ...Object.values(ScreenLayer)] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedLayer === layer
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {layer === 'all' ? 'All Layers' : layer}
              </button>
            ))}
          </div>
        </div>

        {/* Screen Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredScreens.map(([id, status]) => {
            const screen = blackoutController.getScreensByType(ScreenType.BLACKOUT)
              .concat(blackoutController.getScreensByType(ScreenType.SHADE))
              .concat(blackoutController.getScreensByType(ScreenType.THERMAL))
              .find(s => s.id === id);
            
            if (!screen) return null;
            
            return (
              <ScreenControl
                key={id}
                screen={screen}
                status={status}
                onDeploy={(position, strategy) => handleScreenDeploy(id, position, strategy)}
              />
            );
          })}
        </div>

        {/* Photoperiod Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Photoperiod Management</h2>
          
          {/* Cannabis Quick Controls */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 p-6">
            <h3 className="font-medium mb-4">Cannabis Growth Stage Control</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleCannabisStageChange('vegetative')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  cannabisStage === 'vegetative'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <Sprout className="w-5 h-5" />
                Vegetative (18/6)
              </button>
              
              <button
                onClick={() => handleCannabisStageChange('flowering')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  cannabisStage === 'flowering'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <Flower2 className="w-5 h-5" />
                Flowering (12/12)
              </button>
            </div>
          </div>

          {/* Photoperiod Configs */}
          {photoperiods.map(config => (
            <PhotoperiodControl
              key={config.id}
              config={config}
              onUpdate={(updated) => blackoutController.configurePhotoperiod(updated)}
            />
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recent Alerts</h2>
            <div className="space-y-2">
              {alerts.slice(-5).reverse().map((alert, index) => (
                <div
                  key={index}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.type || 'Alert'}</p>
                    <p className="text-sm text-gray-400">
                      {JSON.stringify(alert, null, 2)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}