'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  Leaf, 
  Package, 
  Truck, 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  BarChart3,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';

interface ComplianceStatus {
  isCompliant: boolean;
  plantsInCompliance: number;
  totalPlants: number;
  packagesInCompliance: number;
  totalPackages: number;
  pendingLabTests: number;
  overdueTransfers: number;
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

interface METRCConfig {
  facilityId: string;
  licenseNumber: string;
  state: string;
  environment: 'sandbox' | 'production';
  settings: {
    autoSyncEnabled: boolean;
    syncInterval: number;
    complianceSettings: {
      trackPlants: boolean;
      trackPackages: boolean;
      trackHarvests: boolean;
      trackTransfers: boolean;
      trackLabTests: boolean;
      autoCreateMETRCEntries: boolean;
      requireLabTestApproval: boolean;
      alertOnComplianceIssues: boolean;
    };
  };
}

export default function METRCCompliancePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [config, setConfig] = useState<Partial<METRCConfig>>({
    facilityId: '',
    licenseNumber: '',
    state: '',
    environment: 'sandbox',
    settings: {
      autoSyncEnabled: true,
      syncInterval: 60,
      complianceSettings: {
        trackPlants: true,
        trackPackages: true,
        trackHarvests: true,
        trackTransfers: true,
        trackLabTests: true,
        autoCreateMETRCEntries: false,
        requireLabTestApproval: true,
        alertOnComplianceIssues: true
      }
    }
  });
  const [credentials, setCredentials] = useState({
    apiKey: '',
    userKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const states = [
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'NV', label: 'Nevada' },
    { value: 'OR', label: 'Oregon' },
    { value: 'WA', label: 'Washington' },
    { value: 'MI', label: 'Michigan' },
    { value: 'IL', label: 'Illinois' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MD', label: 'Maryland' },
    { value: 'PA', label: 'Pennsylvania' }
  ];

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/compliance/metrc/connect?facilityId=${config.facilityId || 'default'}`);
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setComplianceStatus(data.complianceStatus);
      }
    } catch (error) {
      console.error('Failed to check METRC connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!config.facilityId || !config.licenseNumber || !config.state || !credentials.apiKey || !credentials.userKey) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/compliance/metrc/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...config,
          ...credentials
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsConnected(true);
        alert('Successfully connected to METRC!');
        await checkConnectionStatus();
      } else {
        alert(`Failed to connect: ${data.error}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to METRC');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/compliance/metrc/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityId: config.facilityId,
          operation: 'sync'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLastSyncTime(new Date());
        await checkConnectionStatus();
        alert('Sync completed successfully!');
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync with METRC');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleComplianceCheck = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/compliance/metrc/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityId: config.facilityId,
          operation: 'compliance_check'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setComplianceStatus(data.complianceStatus);
      } else {
        alert(`Compliance check failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Compliance check error:', error);
      alert('Failed to check compliance status');
    } finally {
      setIsLoading(false);
    }
  };

  const ComplianceOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
          {complianceStatus?.isCompliant ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceStatus?.isCompliant ? 'Compliant' : 'Issues Found'}
          </div>
          <Badge variant={complianceStatus?.isCompliant ? 'default' : 'destructive'} className="mt-1">
            {complianceStatus?.alerts?.length || 0} Active Alerts
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plants</CardTitle>
          <Leaf className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceStatus?.plantsInCompliance || 0}/{complianceStatus?.totalPlants || 0}
          </div>
          <Progress 
            value={complianceStatus?.totalPlants ? (complianceStatus.plantsInCompliance / complianceStatus.totalPlants) * 100 : 0} 
            className="mt-2" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Packages</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceStatus?.packagesInCompliance || 0}/{complianceStatus?.totalPackages || 0}
          </div>
          <Progress 
            value={complianceStatus?.totalPackages ? (complianceStatus.packagesInCompliance / complianceStatus.totalPackages) * 100 : 0} 
            className="mt-2" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
          <TestTube className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceStatus?.pendingLabTests || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Lab tests waiting</p>
        </CardContent>
      </Card>
    </div>
  );

  const AlertsSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Compliance Alerts
        </CardTitle>
        <CardDescription>
          Active compliance issues requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {complianceStatus?.alerts?.length ? (
          <div className="space-y-3">
            {complianceStatus.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="capitalize">{alert.type.replace('_', ' ')}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p>No compliance alerts. Everything looks good!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">METRC Cannabis Compliance</h1>
            <p className="text-muted-foreground">Connect to METRC for automated compliance tracking</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connect to METRC</CardTitle>
            <CardDescription>
              Enter your METRC API credentials to enable automated compliance tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facilityId">Facility ID</Label>
                <Input
                  id="facilityId"
                  value={config.facilityId}
                  onChange={(e) => setConfig({ ...config, facilityId: e.target.value })}
                  placeholder="Your facility identifier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={config.licenseNumber}
                  onChange={(e) => setConfig({ ...config, licenseNumber: e.target.value })}
                  placeholder="METRC license number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select 
                  value={config.state} 
                  onValueChange={(value) => setConfig({ ...config, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select 
                  value={config.environment} 
                  onValueChange={(value: 'sandbox' | 'production') => setConfig({ ...config, environment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  placeholder="Your METRC API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userKey">User Key</Label>
                <Input
                  id="userKey"
                  type="password"
                  value={credentials.userKey}
                  onChange={(e) => setCredentials({ ...credentials, userKey: e.target.value })}
                  placeholder="Your METRC user key"
                />
              </div>
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect to METRC'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">METRC Compliance Dashboard</h1>
            <p className="text-muted-foreground">
              License: {config.licenseNumber} • State: {config.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleComplianceCheck}
            disabled={isLoading}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Check Status
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      <ComplianceOverview />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AlertsSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sync Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span className="font-medium">
                      {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Sync:</span>
                    <Badge variant={config.settings?.autoSyncEnabled ? 'default' : 'secondary'}>
                      {config.settings?.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sync Interval:</span>
                    <span className="font-medium">{config.settings?.syncInterval || 60} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Leaf className="h-4 w-4 mr-2" />
                  Create Plant Batch
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  Manage Transfers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TestTube className="h-4 w-4 mr-2" />
                  Lab Test Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsSection />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Compliance Settings
              </CardTitle>
              <CardDescription>
                Configure how VibeLux integrates with METRC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync with METRC</p>
                  </div>
                  <Switch
                    id="autoSync"
                    checked={config.settings?.autoSyncEnabled}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        settings: { ...config.settings!, autoSyncEnabled: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trackPlants">Track Plants</Label>
                    <p className="text-sm text-muted-foreground">Monitor plant lifecycle in METRC</p>
                  </div>
                  <Switch
                    id="trackPlants"
                    checked={config.settings?.complianceSettings?.trackPlants}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings!,
                          complianceSettings: {
                            ...config.settings!.complianceSettings,
                            trackPlants: checked
                          }
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trackPackages">Track Packages</Label>
                    <p className="text-sm text-muted-foreground">Monitor package creation and movement</p>
                  </div>
                  <Switch
                    id="trackPackages"
                    checked={config.settings?.complianceSettings?.trackPackages}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings!,
                          complianceSettings: {
                            ...config.settings!.complianceSettings,
                            trackPackages: checked
                          }
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="alertOnIssues">Compliance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of compliance issues</p>
                  </div>
                  <Switch
                    id="alertOnIssues"
                    checked={config.settings?.complianceSettings?.alertOnComplianceIssues}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings!,
                          complianceSettings: {
                            ...config.settings!.complianceSettings,
                            alertOnComplianceIssues: checked
                          }
                        }
                      })
                    }
                  />
                </div>
              </div>

              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}