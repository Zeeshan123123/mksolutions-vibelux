'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, Cable, Cpu, Globe, 
  Thermometer, Droplets, Wind, TestTube, Sun, Zap,
  CheckCircle, AlertCircle, Activity, Settings,
  WifiOff, RefreshCw, AlertTriangle
} from 'lucide-react';
import { realSensorService, SensorConfig, SensorStatus } from '@/lib/sensors/real-sensor-service';
import { toast } from 'react-hot-toast';

interface RealSensorSetupWizardProps {
  roomId: string;
  roomName: string;
  onComplete?: () => void;
}

export function RealSensorSetupWizard({ 
  roomId,
  roomName,
  onComplete 
}: RealSensorSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [configuredSensors, setConfiguredSensors] = useState<SensorConfig[]>([]);
  const [sensorStatus, setSensorStatus] = useState<Map<string, SensorStatus>>(new Map());
  const [lastReadings, setLastReadings] = useState<Map<string, any>>(new Map());
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [formData, setFormData] = useState<Partial<SensorConfig>>({
    name: '',
    type: 'temperature',
    protocol: 'modbus',
    connectionDetails: {},
    calibration: {
      offset: 0,
      scale: 1,
      lastCalibrated: new Date()
    },
    pollingInterval: 5
  });

  const protocols = [
    {
      id: 'modbus',
      name: 'Modbus RTU/TCP',
      icon: <Cable className="w-5 h-5" />,
      description: 'Industrial sensors with Modbus protocol',
      popular: ['Trolmaster', 'TempCo', 'Omega']
    },
    {
      id: 'mqtt',
      name: 'MQTT',
      icon: <Wifi className="w-5 h-5" />,
      description: 'IoT sensors with MQTT protocol',
      popular: ['Shelly', 'Sonoff', 'Tasmota']
    },
    {
      id: 'serial',
      name: 'Serial/USB',
      icon: <Cpu className="w-5 h-5" />,
      description: 'Direct serial or USB connection',
      popular: ['Arduino', 'Atlas Scientific', 'SenseCAP']
    },
    {
      id: 'http',
      name: 'HTTP/REST API',
      icon: <Globe className="w-5 h-5" />,
      description: 'Cloud-connected sensors with APIs',
      popular: ['Weather APIs', 'Cloud sensors', 'Smart home']
    }
  ];

  const sensorTypes = [
    { value: 'temperature', label: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
    { value: 'humidity', label: 'Humidity', icon: <Droplets className="w-4 h-4" /> },
    { value: 'co2', label: 'CO2', icon: <Wind className="w-4 h-4" /> },
    { value: 'ph', label: 'pH', icon: <TestTube className="w-4 h-4" /> },
    { value: 'ec', label: 'EC/TDS', icon: <Zap className="w-4 h-4" /> },
    { value: 'light', label: 'Light/PAR', icon: <Sun className="w-4 h-4" /> }
  ];

  useEffect(() => {
    // Subscribe to sensor events
    const handleSensorReading = (reading: any) => {
      setLastReadings(prev => new Map(prev).set(reading.sensorId, reading));
    };

    const handleSensorDisconnected = (data: any) => {
      setSensorStatus(prev => new Map(prev).set(data.sensorId, 'disconnected'));
      toast.error(`Sensor ${data.name} disconnected!`);
    };

    const handleSensorReconnected = (data: any) => {
      setSensorStatus(prev => new Map(prev).set(data.sensorId, 'connected'));
      toast.success(`Sensor ${data.name} reconnected!`);
    };

    const handleThresholdViolation = (data: any) => {
      toast.warning(`${data.name}: ${data.type === 'high' ? 'High' : 'Low'} threshold exceeded (${data.value})`);
    };

    realSensorService.on('sensorReading', handleSensorReading);
    realSensorService.on('sensorDisconnected', handleSensorDisconnected);
    realSensorService.on('sensorReconnected', handleSensorReconnected);
    realSensorService.on('thresholdViolation', handleThresholdViolation);

    // Load existing sensors
    loadExistingSensors();

    return () => {
      realSensorService.off('sensorReading', handleSensorReading);
      realSensorService.off('sensorDisconnected', handleSensorDisconnected);
      realSensorService.off('sensorReconnected', handleSensorReconnected);
      realSensorService.off('thresholdViolation', handleThresholdViolation);
    };
  }, []);

  const loadExistingSensors = () => {
    const sensors = realSensorService.getAllSensors();
    setConfiguredSensors(sensors);
    
    // Update status for each sensor
    sensors.forEach(sensor => {
      const status = realSensorService.getSensorStatus(sensor.id);
      setSensorStatus(prev => new Map(prev).set(sensor.id, status));
      
      const reading = realSensorService.getLastReading(sensor.id);
      if (reading) {
        setLastReadings(prev => new Map(prev).set(sensor.id, reading));
      }
    });
  };

  const handleAddSensor = async () => {
    setIsConfiguring(true);
    
    try {
      const config: SensorConfig = {
        id: `sensor_${Date.now()}`,
        name: formData.name || 'Unnamed Sensor',
        type: formData.type as any,
        protocol: formData.protocol as any,
        connectionDetails: formData.connectionDetails || {},
        calibration: formData.calibration || {
          offset: 0,
          scale: 1,
          lastCalibrated: new Date()
        },
        pollingInterval: formData.pollingInterval || 5,
        alertThresholds: formData.alertThresholds
      };

      await realSensorService.registerSensor(config);
      
      setConfiguredSensors(prev => [...prev, config]);
      setSensorStatus(prev => new Map(prev).set(config.id, 'connected'));
      
      toast.success(`Sensor ${config.name} added successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        type: 'temperature',
        protocol: 'modbus',
        connectionDetails: {},
        calibration: {
          offset: 0,
          scale: 1,
          lastCalibrated: new Date()
        },
        pollingInterval: 5
      });
      
      setCurrentStep(3); // Go to monitoring step
      
    } catch (error) {
      toast.error(`Failed to add sensor: ${error}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleCalibrateSensor = async (sensorId: string) => {
    const referenceValue = prompt('Enter the reference value for calibration:');
    if (!referenceValue) return;
    
    try {
      await realSensorService.calibrateSensor(sensorId, parseFloat(referenceValue));
      toast.success('Sensor calibrated successfully!');
    } catch (error) {
      toast.error(`Calibration failed: ${error}`);
    }
  };

  const handleRemoveSensor = async (sensorId: string) => {
    if (!confirm('Are you sure you want to remove this sensor?')) return;
    
    try {
      await realSensorService.disconnectSensor(sensorId);
      setConfiguredSensors(prev => prev.filter(s => s.id !== sensorId));
      setSensorStatus(prev => {
        const newMap = new Map(prev);
        newMap.delete(sensorId);
        return newMap;
      });
      setLastReadings(prev => {
        const newMap = new Map(prev);
        newMap.delete(sensorId);
        return newMap;
      });
      toast.success('Sensor removed');
    } catch (error) {
      toast.error(`Failed to remove sensor: ${error}`);
    }
  };

  const getSensorStatusIcon = (status: SensorStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'calibrating':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSensorIcon = (type: string) => {
    const typeConfig = sensorTypes.find(t => t.value === type);
    return typeConfig?.icon || <Activity className="w-5 h-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Real Sensor Setup for {roomName}
        </h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Real Hardware Required</p>
              <p>This wizard connects to actual sensors. Ensure your sensors are powered on and connected to your network or computer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Sensors */}
      {configuredSensors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Sensors ({configuredSensors.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configuredSensors.map(sensor => {
              const status = sensorStatus.get(sensor.id) || 'disconnected';
              const reading = lastReadings.get(sensor.id);
              
              return (
                <div
                  key={sensor.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {sensor.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {sensor.protocol.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {getSensorStatusIcon(status)}
                  </div>
                  
                  {reading && (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reading.value.toFixed(1)} {reading.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                        {reading.quality !== 'good' && (
                          <span className="ml-2 text-yellow-600">
                            ({reading.quality})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCalibrateSensor(sensor.id)}
                      className="flex-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 
                               text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 
                               dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Calibrate
                    </button>
                    <button
                      onClick={() => handleRemoveSensor(sensor.id)}
                      className="flex-1 px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 
                               text-red-600 dark:text-red-400 rounded hover:bg-red-100 
                               dark:hover:bg-red-900/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Sensor Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New Sensor
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Sensor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sensor Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Room Temperature"
            />
          </div>
          
          {/* Sensor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sensor Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sensorTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Protocol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection Protocol
            </label>
            <select
              value={formData.protocol}
              onChange={(e) => setFormData(prev => ({ ...prev, protocol: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {protocols.map(protocol => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Polling Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Polling Interval (seconds)
            </label>
            <input
              type="number"
              value={formData.pollingInterval}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pollingInterval: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max="3600"
            />
          </div>
        </div>
        
        {/* Protocol-specific configuration */}
        {formData.protocol === 'modbus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modbus Address
              </label>
              <input
                type="number"
                value={formData.connectionDetails?.modbusAddress || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connectionDetails: {
                    ...prev.connectionDetails,
                    modbusAddress: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Register Address
              </label>
              <input
                type="number"
                value={formData.connectionDetails?.modbusRegister || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connectionDetails: {
                    ...prev.connectionDetails,
                    modbusRegister: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connection Type
              </label>
              <select
                onChange={(e) => {
                  const isSerial = e.target.value === 'serial';
                  setFormData(prev => ({
                    ...prev,
                    connectionDetails: {
                      ...prev.connectionDetails,
                      modbusPort: isSerial ? '/dev/ttyUSB0' : undefined,
                      modbusIp: !isSerial ? '192.168.1.100' : undefined
                    }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="tcp">TCP/IP</option>
                <option value="serial">Serial/RTU</option>
              </select>
            </div>
            {formData.connectionDetails?.modbusIp !== undefined ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.connectionDetails?.modbusIp || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    connectionDetails: {
                      ...prev.connectionDetails,
                      modbusIp: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="192.168.1.100"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Serial Port
                </label>
                <input
                  type="text"
                  value={formData.connectionDetails?.modbusPort || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    connectionDetails: {
                      ...prev.connectionDetails,
                      modbusPort: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="/dev/ttyUSB0"
                />
              </div>
            )}
          </div>
        )}
        
        {formData.protocol === 'mqtt' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                MQTT Broker
              </label>
              <input
                type="text"
                value={formData.connectionDetails?.mqttBroker || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connectionDetails: {
                    ...prev.connectionDetails,
                    mqttBroker: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="mqtt://localhost:1883"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topic
              </label>
              <input
                type="text"
                value={formData.connectionDetails?.mqttTopic || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connectionDetails: {
                    ...prev.connectionDetails,
                    mqttTopic: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="sensors/temperature/room1"
              />
            </div>
          </div>
        )}
        
        {/* Alert Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Threshold (optional)
            </label>
            <input
              type="number"
              value={formData.alertThresholds?.min || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                alertThresholds: {
                  ...prev.alertThresholds,
                  min: e.target.value ? parseFloat(e.target.value) : undefined
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 18 for temperature"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Threshold (optional)
            </label>
            <input
              type="number"
              value={formData.alertThresholds?.max || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                alertThresholds: {
                  ...prev.alertThresholds,
                  max: e.target.value ? parseFloat(e.target.value) : undefined
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 28 for temperature"
            />
          </div>
        </div>
        
        {/* Add Sensor Button */}
        <button
          onClick={handleAddSensor}
          disabled={isConfiguring || !formData.name}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg 
                   hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors flex items-center justify-center gap-2"
        >
          {isConfiguring ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Configuring Sensor...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Add Sensor
            </>
          )}
        </button>
      </div>
      
      {/* Complete Setup Button */}
      {configuredSensors.length > 0 && onComplete && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                     transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
}