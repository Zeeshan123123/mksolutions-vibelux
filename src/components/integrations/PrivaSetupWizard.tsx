'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  Factory,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Globe,
  Key,
  Database,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  HelpCircle,
  ChevronRight,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { privaConfig, PrivaConnectionConfig, PrivaRealtimeData } from '@/lib/integrations/priva/priva-config-service';
import { useAuth } from '@clerk/nextjs';

interface PrivaSetupWizardProps {
  onComplete?: (config: PrivaConnectionConfig) => void;
  onClose?: () => void;
}

export function PrivaSetupWizard({ onComplete, onClose }: PrivaSetupWizardProps) {
  const { userId } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  // Configuration state
  const [useDemo, setUseDemo] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    farmCode: '',
    apiUrl: 'https://api.priva.com',
    apiVersion: 'v3',
    oauthClientId: '',
    oauthClientSecret: ''
  });
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error' | 'demo'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [config, setConfig] = useState<PrivaConnectionConfig | null>(null);
  const [realtimeData, setRealtimeData] = useState<PrivaRealtimeData | null>(null);
  const [selectedCompartment, setSelectedCompartment] = useState<string>('');
  
  useEffect(() => {
    // Load existing configuration
    loadExistingConfig();
    
    // Set up event listeners
    privaConfig.on('connectionStatus', handleConnectionStatus);
    privaConfig.on('realtimeData', handleRealtimeData);
    privaConfig.on('alarms', handleAlarms);
    
    return () => {
      privaConfig.removeListener('connectionStatus', handleConnectionStatus);
      privaConfig.removeListener('realtimeData', handleRealtimeData);
      privaConfig.removeListener('alarms', handleAlarms);
      
      if (isPolling) {
        privaConfig.stopPolling();
      }
    };
  }, []);
  
  const loadExistingConfig = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const existingConfig = await privaConfig.loadConfiguration(userId);
      if (existingConfig) {
        setConfig(existingConfig);
        setUseDemo(existingConfig.isDemo);
        setConnectionStatus(existingConfig.connectionStatus);
        
        if (!existingConfig.isDemo) {
          setCredentials(existingConfig.credentials);
        }
        
        if (existingConfig.facilities.length > 0 && existingConfig.facilities[0].compartments.length > 0) {
          setSelectedCompartment(existingConfig.facilities[0].compartments[0].id);
        }
        
        setStep(3); // Go to monitoring step if already configured
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnectionStatus = (status: any) => {
    setConnectionStatus(status.status);
    if (status.error) {
      setConnectionError(status.error);
    }
    if (status.facilities) {
      setConfig(prev => prev ? { ...prev, facilities: status.facilities } : null);
    }
  };
  
  const handleRealtimeData = (data: PrivaRealtimeData) => {
    setRealtimeData(data);
  };
  
  const handleAlarms = (alarms: string[]) => {
    alarms.forEach(alarm => {
      toast({
        title: 'Priva Alarm',
        description: alarm,
        variant: 'destructive'
      });
    });
  };
  
  const handleSaveConfig = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Please sign in to save configuration',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const savedConfig = await privaConfig.saveConfiguration(
        userId,
        useDemo ? {} : credentials,
        useDemo
      );
      
      setConfig(savedConfig);
      setConnectionStatus(savedConfig.connectionStatus);
      
      if (savedConfig.facilities.length > 0 && savedConfig.facilities[0].compartments.length > 0) {
        setSelectedCompartment(savedConfig.facilities[0].compartments[0].id);
      }
      
      toast({
        title: 'Success',
        description: useDemo ? 'Demo mode activated' : 'Priva configuration saved',
      });
      
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!config) return;
    
    setIsTesting(true);
    setConnectionError('');
    
    try {
      const success = await privaConfig.testConnection(config);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Connected to Priva system',
        });
        setStep(3);
      } else if (config.lastError) {
        setConnectionError(config.lastError);
      }
    } catch (error: any) {
      setConnectionError(error.message);
    } finally {
      setIsTesting(false);
    }
  };
  
  const togglePolling = () => {
    if (!config || !selectedCompartment) return;
    
    if (isPolling) {
      privaConfig.stopPolling();
      setIsPolling(false);
      toast({
        title: 'Polling Stopped',
        description: 'Real-time data updates paused',
      });
    } else {
      privaConfig.startPolling(config, selectedCompartment, 30000);
      setIsPolling(true);
      toast({
        title: 'Polling Started',
        description: 'Receiving real-time data every 30 seconds',
      });
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connection Mode</h3>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="demo-mode" className="text-base">Use Demo Mode</Label>
            <p className="text-sm text-muted-foreground">
              Test the integration without real Priva hardware
            </p>
          </div>
          <Switch
            id="demo-mode"
            checked={useDemo}
            onCheckedChange={setUseDemo}
          />
        </div>
        
        {useDemo ? (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
              You'll see simulated greenhouse data that behaves like a real Priva system.
              Perfect for testing and evaluation.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Requirements</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Active Priva enterprise agreement</li>
                  <li>Priva Connext or Digital Services subscription</li>
                  <li>OAuth application registered with Priva</li>
                  <li>Network access to Priva API endpoints</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="your.name@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmCode">Farm Code *</Label>
                <Input
                  id="farmCode"
                  type="text"
                  value={credentials.farmCode}
                  onChange={(e) => setCredentials({ ...credentials, farmCode: e.target.value })}
                  placeholder="e.g., NL-GH-001"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Your unique farm identifier from Priva
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL *</Label>
                <Input
                  id="apiUrl"
                  type="url"
                  value={credentials.apiUrl}
                  onChange={(e) => setCredentials({ ...credentials, apiUrl: e.target.value })}
                  placeholder="https://api.priva.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Priva API endpoint (cloud or on-premise)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oauthClientId">OAuth Client ID</Label>
                  <Input
                    id="oauthClientId"
                    type="text"
                    value={credentials.oauthClientId}
                    onChange={(e) => setCredentials({ ...credentials, oauthClientId: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthClientSecret">OAuth Client Secret</Label>
                  <Input
                    id="oauthClientSecret"
                    type="password"
                    value={credentials.oauthClientSecret}
                    onChange={(e) => setCredentials({ ...credentials, oauthClientSecret: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveConfig}
          disabled={isLoading || (!useDemo && (!credentials.username || !credentials.password || !credentials.farmCode))}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Configuration
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Connection</h3>
        
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              )}
              {connectionStatus === 'demo' && (
                <>
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">Demo Mode</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Error</span>
                </>
              )}
              {connectionStatus === 'testing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  <span className="text-sm text-yellow-600">Testing...</span>
                </>
              )}
              {connectionStatus === 'idle' && (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Not tested</span>
                </>
              )}
            </div>
          </div>
          
          {connectionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          {config?.facilities && config.facilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Detected Facilities:</p>
              {config.facilities.map(facility => (
                <div key={facility.id} className="pl-4 space-y-1">
                  <p className="text-sm">
                    <strong>{facility.name}</strong> ({facility.compartments.length} compartments)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total area: {facility.totalArea} m²
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button
          onClick={handleTestConnection}
          disabled={isTesting || !config}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={connectionStatus !== 'connected' && connectionStatus !== 'demo'}
        >
          Continue to Monitoring
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Monitoring</h3>
          <div className="flex items-center gap-2">
            {config?.facilities[0]?.compartments && (
              <select
                value={selectedCompartment}
                onChange={(e) => {
                  setSelectedCompartment(e.target.value);
                  if (isPolling) {
                    privaConfig.stopPolling();
                    privaConfig.startPolling(config!, e.target.value, 30000);
                  }
                }}
                className="px-3 py-1 text-sm border rounded-md"
              >
                {config.facilities[0].compartments.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={togglePolling}
              disabled={!selectedCompartment}
            >
              {isPolling ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
        
        {realtimeData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {realtimeData.climate.temperature}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {realtimeData.setpoints.temperatureDay}°C
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {realtimeData.climate.humidity}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Range: {realtimeData.setpoints.humidityMin}-{realtimeData.setpoints.humidityMax}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  CO2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {realtimeData.climate.co2} ppm
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {realtimeData.setpoints.co2Target} ppm
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Radiation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {realtimeData.climate.radiation} W/m²
                </p>
                <p className="text-xs text-muted-foreground">
                  VPD: {realtimeData.climate.vpd} kPa
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-8 text-center border rounded-lg bg-muted/50">
            {isPolling ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Waiting for data...</p>
              </>
            ) : (
              <>
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click "Start" to begin monitoring
                </p>
              </>
            )}
          </div>
        )}
        
        {realtimeData?.alarms && realtimeData.alarms.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Active Alarms</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {realtimeData.alarms.map((alarm, i) => (
                  <li key={i}>{alarm}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {realtimeData && (
          <div className="p-4 border rounded-lg space-y-2">
            <p className="text-sm font-medium">Equipment Status</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heating:</span>
                <span>{realtimeData.equipment.heating.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cooling:</span>
                <span>{realtimeData.equipment.cooling.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vents:</span>
                <span>{realtimeData.equipment.vents.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screens:</span>
                <span>{realtimeData.equipment.screens.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lights:</span>
                <span>{realtimeData.equipment.lights ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Irrigation:</span>
                <span>{realtimeData.equipment.irrigation ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back to Testing
        </Button>
        <Button
          onClick={() => {
            if (onComplete && config) {
              onComplete(config);
            }
          }}
        >
          Complete Setup
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Factory className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Priva Climate Computer Integration</CardTitle>
            <CardDescription>
              Connect your Priva system for real-time monitoring and control
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Configure</span>
          </div>
          
          <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Test</span>
          </div>
          
          <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          
          <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Monitor</span>
          </div>
        </div>
        
        {/* Step Content */}
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </>
        )}
        
        {/* Help Section */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Demo Mode:</strong> Test the integration without hardware. See simulated greenhouse data.
              </p>
              <p>
                <strong>Real Connection:</strong> Requires Priva enterprise agreement and registered OAuth app.
              </p>
              <p>
                <strong>Need Help?</strong> Contact Priva support or check the{' '}
                <a href="#" className="underline">integration guide</a>.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}