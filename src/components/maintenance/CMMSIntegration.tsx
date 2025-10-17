'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  Database,
  ExternalLink,
  Activity,
  Monitor,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { CMMSPlatform, CMMSConfig, WorkOrder, Asset, SyncStatus, AssetMapping } from '@/lib/cmms-integration-service';

interface CMMSIntegrationProps {
  facilityId?: string;
  onWorkOrderCreated?: (workOrder: WorkOrder) => void;
}

export default function CMMSIntegration({ facilityId, onWorkOrderCreated }: CMMSIntegrationProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [cmmsConfigs, setCMMSConfigs] = useState<Array<{ id: string; config: CMMSConfig; status: string }>>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>({});
  const [assetMappings, setAssetMappings] = useState<AssetMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  
  // Form states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [newConfigForm, setNewConfigForm] = useState({
    id: '',
    platform: 'servicenow' as CMMSPlatform,
    config: {} as any,
  });
  const [newWorkOrderForm, setNewWorkOrderForm] = useState({
    number: '',
    title: '',
    description: '',
    priority: 'medium' as const,
    assetId: '',
    workType: 'corrective' as const,
    estimatedHours: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    loadCMMSConfigs();
    loadWorkOrders();
    loadAssetMappings();
  }, []);

  const loadCMMSConfigs = async () => {
    try {
      const response = await fetch('/api/cmms/config');
      const data = await response.json();
      
      if (response.ok) {
        setCMMSConfigs(data.configs || []);
      } else {
        toast.error(data.error || 'Failed to load CMMS configurations');
      }
    } catch (error) {
      toast.error('Failed to load CMMS configurations');
    }
  };

  const loadWorkOrders = async () => {
    try {
      const response = await fetch('/api/cmms/work-orders');
      const data = await response.json();
      
      if (response.ok) {
        setWorkOrders(data.workOrders || []);
      } else {
        toast.error(data.error || 'Failed to load work orders');
      }
    } catch (error) {
      toast.error('Failed to load work orders');
    }
  };

  const loadAssetMappings = async () => {
    try {
      const response = await fetch('/api/cmms/asset-mapping');
      const data = await response.json();
      
      if (response.ok) {
        setAssetMappings(data.assetMappings || []);
      } else {
        toast.error(data.error || 'Failed to load asset mappings');
      }
    } catch (error) {
      toast.error('Failed to load asset mappings');
    }
  };

  const testConnection = async (configId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cmms/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: configId }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.connected) {
        toast.success(`Connection test successful (${data.responseTime}ms)`);
      } else {
        toast.error(data.error || 'Connection test failed');
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async (configId: string, syncType: 'full' | 'incremental' = 'incremental') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cmms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: configId, syncType }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Sync completed: ${data.syncStatus.recordsSynced} records`);
        setSyncStatuses(prev => ({ ...prev, [configId]: data.syncStatus }));
        loadWorkOrders();
        loadAssetMappings();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const addCMMSConfig = async () => {
    if (!newConfigForm.id || !newConfigForm.config) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cmms/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newConfigForm.id,
          config: {
            platform: newConfigForm.platform,
            ...newConfigForm.config,
          },
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('CMMS configuration added successfully');
        setShowAddDialog(false);
        setNewConfigForm({ id: '', platform: 'servicenow', config: {} });
        loadCMMSConfigs();
      } else {
        toast.error(data.error || 'Failed to add CMMS configuration');
      }
    } catch (error) {
      toast.error('Failed to add CMMS configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkOrder = async () => {
    if (!newWorkOrderForm.title || !newWorkOrderForm.assetId || !selectedConfig) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const workOrderData = {
        ...newWorkOrderForm,
        estimatedHours: newWorkOrderForm.estimatedHours ? parseFloat(newWorkOrderForm.estimatedHours) : undefined,
        dueDate: newWorkOrderForm.dueDate || undefined,
      };

      const response = await fetch('/api/cmms/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmmsId: selectedConfig,
          workOrder: workOrderData,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Work order created successfully');
        setShowWorkOrderDialog(false);
        setNewWorkOrderForm({
          number: '',
          title: '',
          description: '',
          priority: 'medium',
          assetId: '',
          workType: 'corrective',
          estimatedHours: '',
          dueDate: '',
          notes: '',
        });
        loadWorkOrders();
        onWorkOrderCreated?.(data.workOrder);
      } else {
        toast.error(data.error || 'Failed to create work order');
      }
    } catch (error) {
      toast.error('Failed to create work order');
    } finally {
      setIsLoading(false);
    }
  };

  const autoMapAssets = async (configId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cmms/asset-mapping/auto-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmmsId: configId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Auto-mapping completed: ${data.count} mappings created`);
        loadAssetMappings();
      } else {
        toast.error(data.error || 'Auto-mapping failed');
      }
    } catch (error) {
      toast.error('Auto-mapping failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderConfigForm = () => {
    const platform = newConfigForm.platform;
    const commonFields = (
      <>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="config-id">Configuration ID</Label>
          <Input
            id="config-id"
            placeholder="e.g., main-servicenow"
            value={newConfigForm.id}
            onChange={(e) => setNewConfigForm({ ...newConfigForm, id: e.target.value })}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="platform">Platform</Label>
          <Select
            value={newConfigForm.platform}
            onValueChange={(value) => setNewConfigForm({ ...newConfigForm, platform: value as CMMSPlatform })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select CMMS platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servicenow">ServiceNow</SelectItem>
              <SelectItem value="sap_pm">SAP PM</SelectItem>
              <SelectItem value="maximo">IBM Maximo</SelectItem>
              <SelectItem value="upkeep">UpKeep</SelectItem>
              <SelectItem value="fiix">Fiix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    );

    const platformSpecificFields = () => {
      switch (platform) {
        case 'servicenow':
          return (
            <>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="instance-url">Instance URL</Label>
                <Input
                  id="instance-url"
                  placeholder="https://your-instance.service-now.com"
                  value={newConfigForm.config.instanceUrl || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, instanceUrl: e.target.value }
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newConfigForm.config.username || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, username: e.target.value }
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newConfigForm.config.password || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, password: e.target.value }
                  })}
                />
              </div>
            </>
          );
        case 'upkeep':
          return (
            <>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newConfigForm.config.apiKey || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, apiKey: e.target.value }
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="base-url">Base URL</Label>
                <Input
                  id="base-url"
                  placeholder="https://api.onupkeep.com"
                  value={newConfigForm.config.baseUrl || 'https://api.onupkeep.com'}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, baseUrl: e.target.value }
                  })}
                />
              </div>
            </>
          );
        case 'maximo':
          return (
            <>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="server-url">Server URL</Label>
                <Input
                  id="server-url"
                  placeholder="https://your-maximo-server.com"
                  value={newConfigForm.config.serverUrl || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, serverUrl: e.target.value }
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newConfigForm.config.username || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, username: e.target.value }
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newConfigForm.config.password || ''}
                  onChange={(e) => setNewConfigForm({
                    ...newConfigForm,
                    config: { ...newConfigForm.config, password: e.target.value }
                  })}
                />
              </div>
            </>
          );
        // Add more platform-specific forms as needed
        default:
          return (
            <div className="text-sm text-gray-500">
              Configuration form for {platform} coming soon
            </div>
          );
      }
    };

    return (
      <div className="space-y-4">
        {commonFields}
        {platformSpecificFields()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CMMS Integration</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add CMMS System
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add CMMS System</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderConfigForm()}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addCMMSConfig} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add System'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="assets">Asset Mapping</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Systems</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cmmsConfigs.length}</div>
                <p className="text-xs text-muted-foreground">
                  CMMS platforms integrated
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workOrders.filter(wo => wo.status === 'open' || wo.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Open and in progress
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asset Mappings</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assetMappings.length}</div>
                <p className="text-xs text-muted-foreground">
                  Vibelux to CMMS mappings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(syncStatuses).length > 0 ? '2h ago' : 'Never'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent sync
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmmsConfigs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(config.status)}
                      <div>
                        <div className="font-medium">{config.id}</div>
                        <div className="text-sm text-gray-500 capitalize">{config.config.platform}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(config.id)}
                        disabled={isLoading}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncData(config.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync
                      </Button>
                    </div>
                  </div>
                ))}
                {cmmsConfigs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No CMMS systems connected. Add one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CMMS Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmmsConfigs.map((config) => (
                  <div key={config.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(config.status)}
                        <div>
                          <div className="font-medium">{config.id}</div>
                          <div className="text-sm text-gray-500 capitalize">{config.config.platform}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(config.id)}
                          disabled={isLoading}
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncData(config.id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Data
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => autoMapAssets(config.id)}
                          disabled={isLoading}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Auto Map
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Orders</h3>
            <Dialog open={showWorkOrderDialog} onOpenChange={setShowWorkOrderDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Work Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-number">Work Order Number</Label>
                      <Input
                        id="wo-number"
                        placeholder="WO-2024-001"
                        value={newWorkOrderForm.number}
                        onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, number: e.target.value })}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-priority">Priority</Label>
                      <Select
                        value={newWorkOrderForm.priority}
                        onValueChange={(value) => setNewWorkOrderForm({ ...newWorkOrderForm, priority: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="wo-title">Title</Label>
                    <Input
                      id="wo-title"
                      placeholder="Replace LED fixture"
                      value={newWorkOrderForm.title}
                      onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, title: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="wo-description">Description</Label>
                    <Textarea
                      id="wo-description"
                      placeholder="Detailed description of the work to be performed..."
                      value={newWorkOrderForm.description}
                      onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-asset">Asset ID</Label>
                      <Input
                        id="wo-asset"
                        placeholder="ASSET-001"
                        value={newWorkOrderForm.assetId}
                        onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, assetId: e.target.value })}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-work-type">Work Type</Label>
                      <Select
                        value={newWorkOrderForm.workType}
                        onValueChange={(value) => setNewWorkOrderForm({ ...newWorkOrderForm, workType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
                          <SelectItem value="predictive">Predictive</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-hours">Estimated Hours</Label>
                      <Input
                        id="wo-hours"
                        type="number"
                        placeholder="2.5"
                        value={newWorkOrderForm.estimatedHours}
                        onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, estimatedHours: e.target.value })}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="wo-due-date">Due Date</Label>
                      <Input
                        id="wo-due-date"
                        type="date"
                        value={newWorkOrderForm.dueDate}
                        onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="wo-cmms">CMMS System</Label>
                    <Select
                      value={selectedConfig || ''}
                      onValueChange={setSelectedConfig}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CMMS system" />
                      </SelectTrigger>
                      <SelectContent>
                        {cmmsConfigs.map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            {config.id} ({config.config.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowWorkOrderDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createWorkOrder} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Work Order'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-2">
                {workOrders.map((workOrder) => (
                  <div key={workOrder.id} className="p-4 border-b last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(workOrder.priority)} text-white`}>
                            {workOrder.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(workOrder.status)} text-white`}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">{workOrder.number}</div>
                          <div className="text-sm text-gray-500">{workOrder.title}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {workOrder.workType} • {workOrder.assetId}
                      </div>
                    </div>
                  </div>
                ))}
                {workOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No work orders found. Create one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetMappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">Vibelux: {mapping.vibeluxEquipmentId}</div>
                          <div className="text-sm text-gray-500">
                            CMMS: {mapping.cmmsAssetId} ({mapping.platform})
                          </div>
                        </div>
                        <Badge variant={mapping.mappingType === 'automatic' ? 'default' : 'outline'}>
                          {mapping.mappingType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          {Math.round(mapping.confidence * 100)}% confidence
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {assetMappings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No asset mappings found. Use auto-mapping or create manual mappings.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(syncStatuses).map(([configId, status]) => (
                  <div key={configId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{configId}</div>
                      <Badge className={status.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                        {status.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Last Sync</div>
                        <div>{new Date(status.lastSync).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Records Synced</div>
                        <div>{status.recordsSynced}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Duration</div>
                        <div>{(status.syncDuration / 1000).toFixed(1)}s</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Errors</div>
                        <div>{status.errorCount}</div>
                      </div>
                    </div>
                    {status.errorMessages.length > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {status.errorMessages.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
                {Object.keys(syncStatuses).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No sync history available. Perform a sync to see status.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}