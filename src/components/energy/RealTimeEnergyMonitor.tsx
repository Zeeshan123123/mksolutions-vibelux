'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  UtilityAPIClient, 
  EnergyReading, 
  DemandData, 
  TariffData, 
  GridStatus,
  UTILITY_PROVIDERS 
} from '@/lib/energy/utility-api-client';
import { DemandResponseManager } from '@/lib/energy/demand-response-manager';
import {
  Zap,
  Battery,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Activity,
  Clock,
  Gauge,
  Sun,
  Moon,
  Cloud,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Settings
} from 'lucide-react';

interface Props {
  utilityProvider?: string;
  apiKey?: string;
  accountId?: string;
  className?: string;
}

export function RealTimeEnergyMonitor({ 
  utilityProvider = 'generic',
  apiKey,
  accountId,
  className = ''
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<EnergyReading | null>(null);
  const [demand, setDemand] = useState<DemandData | null>(null);
  const [tariff, setTariff] = useState<TariffData | null>(null);
  const [gridStatus, setGridStatus] = useState<GridStatus | null>(null);
  const [historicalData, setHistoricalData] = useState<EnergyReading[]>([]);
  const [optimizationStatus, setOptimizationStatus] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Initialize utility client and demand response manager
    if (!apiKey || !accountId) {
      setError('Missing utility API credentials. Please configure in settings.');
      setLoading(false);
      return;
    }

    const client = new UtilityAPIClient(utilityProvider, apiKey, accountId);
    const drManager = new DemandResponseManager(client);

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data types supported by the provider
        const provider = UTILITY_PROVIDERS.find(p => p.id === utilityProvider);
        if (!provider) {
          throw new Error('Invalid utility provider');
        }

        const promises: Promise<any>[] = [
          client.getRealtimeReadings().then(data => setReading(data))
        ];

        if (provider.supportedMetrics.includes('demand')) {
          promises.push(client.getDemandData().then(data => setDemand(data)));
        }

        if (provider.supportedMetrics.includes('tariff')) {
          promises.push(client.getTariffData().then(data => setTariff(data)));
        }

        if (provider.supportedMetrics.includes('grid')) {
          promises.push(client.getGridStatus().then(data => setGridStatus(data)));
        }

        // Get historical data for the last 24 hours
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        promises.push(
          client.getHistoricalData(startDate, endDate, 'hour')
            .then(data => setHistoricalData(data))
        );

        await Promise.all(promises);
        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        logger.error('energy', 'Error fetching initial data:', err);
        setError('Failed to connect to utility API');
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time updates
    const unsubscribe = client.subscribeToUpdates({
      onReading: (newReading) => {
        setReading(newReading);
        setConnectionStatus('connected');
      },
      onDemand: (newDemand) => {
        setDemand(newDemand);
      },
      onGridEvent: (newStatus) => {
        setGridStatus(newStatus);
      }
    });

    // Monitor and respond to grid conditions
    const monitorInterval = setInterval(() => {
      drManager.monitorAndRespond();
      setOptimizationStatus(drManager.getOptimizationStatus());
    }, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(monitorInterval);
    };
  }, [utilityProvider, apiKey, accountId]);

  // Helper functions
  const getCurrentTouPeriod = () => {
    if (!tariff) return 'unknown';
    const rate = tariff.currentRate;
    if (rate === tariff.timeOfUse.offPeak) return 'off-peak';
    if (rate === tariff.timeOfUse.midPeak) return 'mid-peak';
    if (rate === tariff.timeOfUse.onPeak) return 'on-peak';
    return 'unknown';
  };

  const getTouIcon = () => {
    const period = getCurrentTouPeriod();
    if (period === 'off-peak') return <Moon className="w-4 h-4" />;
    if (period === 'mid-peak') return <Cloud className="w-4 h-4" />;
    if (period === 'on-peak') return <Sun className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getTouColor = () => {
    const period = getCurrentTouPeriod();
    if (period === 'off-peak') return 'text-green-600';
    if (period === 'mid-peak') return 'text-yellow-600';
    if (period === 'on-peak') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <XCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Energy Monitoring Error</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <a
          href="/settings/energy"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <Settings className="w-4 h-4" />
          Configure Energy Settings
        </a>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold">Real-Time Energy Monitor</h3>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : connectionStatus === 'connecting' ? (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500">
              {UTILITY_PROVIDERS.find(p => p.id === utilityProvider)?.name || 'Unknown Provider'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Current Power */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
          <p className="text-2xl font-bold">{reading?.power.toFixed(0) || '0'}W</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Power</p>
          {reading && (
            <p className="text-xs text-gray-500 mt-1">
              {reading.voltage.toFixed(0)}V • {reading.current.toFixed(1)}A
            </p>
          )}
        </div>

        {/* Current Demand */}
        {demand && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-5 h-5 text-orange-600" />
              {demand.demand > demand.threshold * 0.9 && (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <p className="text-2xl font-bold">{demand.demand.toFixed(1)} kW</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Demand</p>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${
                    demand.demand > demand.threshold * 0.9 ? 'bg-orange-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(100, (demand.demand / demand.threshold) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Current Rate */}
        {tariff && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              {getTouIcon()}
            </div>
            <p className={`text-2xl font-bold ${getTouColor()}`}>
              ${tariff.currentRate.toFixed(3)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">per kWh</p>
            <p className={`text-xs mt-1 ${getTouColor()}`}>
              {getCurrentTouPeriod().replace('-', ' ')}
            </p>
          </div>
        )}

        {/* Grid Status */}
        {gridStatus && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Battery className="w-5 h-5 text-green-600" />
              {gridStatus.demandResponse.active && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  DR Active
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{gridStatus.frequency.toFixed(2)} Hz</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Grid {gridStatus.stability}</p>
            {gridStatus.demandResponse.active && (
              <p className="text-xs text-yellow-600 mt-1">
                ${gridStatus.demandResponse.incentiveRate}/kWh incentive
              </p>
            )}
          </div>
        )}
      </div>

      {/* Historical Chart */}
      {historicalData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">24-Hour Energy Usage</h4>
          <div className="h-48 relative">
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {historicalData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer"
                    style={{ 
                      height: `${(data.power / Math.max(...historicalData.map(d => d.power))) * 100}%` 
                    }}
                    title={`${new Date(data.timestamp).toLocaleTimeString()} - ${data.power.toFixed(0)}W`}
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Status */}
      {optimizationStatus && optimizationStatus.activeEvents.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Active Optimization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reducing load by {optimizationStatus.totalReduction.toFixed(1)} kW
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estimated savings: ${optimizationStatus.estimatedSavings.toFixed(2)}
              </p>
              {optimizationStatus.currentStrategies.map((strategy: any, index: number) => (
                <div key={index} className="text-xs text-gray-500 mt-1">
                  • {strategy.type}: {strategy.targetReduction.toFixed(1)} kW reduction
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time-of-Use Schedule */}
      {tariff && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <Moon className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-semibold">Off-Peak</p>
            <p className="text-lg font-bold text-green-600">
              ${tariff.timeOfUse.offPeak.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">11pm - 7am</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <Cloud className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-sm font-semibold">Mid-Peak</p>
            <p className="text-lg font-bold text-yellow-600">
              ${tariff.timeOfUse.midPeak.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">7am-4pm, 9pm-11pm</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <Sun className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-sm font-semibold">On-Peak</p>
            <p className="text-lg font-bold text-red-600">
              ${tariff.timeOfUse.onPeak.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">4pm - 9pm</p>
          </div>
        </div>
      )}
    </div>
  );
}