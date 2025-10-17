'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Activity,
  TrendingUp,
  CheckCircle,
  Calendar,
  Settings,
  Database,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import CMMSIntegration from '@/components/maintenance/CMMSIntegration';
import { MaintenanceScheduler } from '@/components/MaintenanceScheduler';
import { PredictiveAnalyticsControl } from '@/components/PredictiveAnalyticsControl';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

interface MaintenanceAlert {
  id: string;
  equipment: string;
  type: 'predictive' | 'scheduled' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  dueDate?: Date;
  assignedTo?: string;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
}

interface MaintenanceMetrics {
  totalWorkOrders: number;
  openWorkOrders: number;
  overdueTasks: number;
  completionRate: number;
  mttr: number; // Mean Time To Repair
  mtbf: number; // Mean Time Between Failures
  maintenanceCost: number;
  equipmentUptime: number;
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [metrics, setMetrics] = useState<MaintenanceMetrics>({
    totalWorkOrders: 0,
    openWorkOrders: 0,
    overdueTasks: 0,
    completionRate: 0,
    mttr: 0,
    mtbf: 0,
    maintenanceCost: 0,
    equipmentUptime: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    setIsLoading(true);
    try {
      // Load maintenance alerts
      const alertsResponse = await fetch('/api/maintenance/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      // Load maintenance statistics
      const statsResponse = await fetch('/api/maintenance/statistics');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setMetrics(statsData.metrics || metrics);
      }
    } catch (error) {
      logger.error('system', 'Failed to load maintenance data:', error );
      toast.error('Failed to load maintenance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkOrderCreated = (workOrder: any) => {
    toast.success(`Work order ${workOrder.number} created successfully`);
    loadMaintenanceData();
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch('/api/maintenance/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alertId,
          status: 'acknowledged',
        }),
      });

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
        ));
        toast.success('Alert acknowledged');
      } else {
        toast.error('Failed to acknowledge alert');
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive':
        return <TrendingUp className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'acknowledged':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive maintenance management with CMMS integration
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="cmms">CMMS Integration</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalWorkOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openWorkOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.overdueTasks} overdue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  On-time completion
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.equipmentUptime}%</div>
                <p className="text-xs text-muted-foreground">
                  Facility average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Recent Maintenance Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(alert.type)}
                      <div>
                        <div className="font-medium">{alert.equipment}</div>
                        <div className="text-sm text-gray-500">{alert.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <span className={`text-sm ${getStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ')}
                      </span>
                      {alert.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlertAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No maintenance alerts at this time
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">MTTR (Mean Time To Repair)</span>
                    <span className="text-sm">{metrics.mttr}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">MTBF (Mean Time Between Failures)</span>
                    <span className="text-sm">{metrics.mtbf}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Maintenance Cost</span>
                    <span className="text-sm">${metrics.maintenanceCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span className="text-sm">CMMS Systems</span>
                    </div>
                    <Badge variant="outline">3 Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Predictive Analytics</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Real-time Monitoring</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(alert.type)}
                        <div>
                          <div className="font-medium">{alert.equipment}</div>
                          <div className="text-sm text-gray-500 capitalize">{alert.type} maintenance</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                        <span className={`text-sm ${getStatusColor(alert.status)}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">{alert.message}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                      {alert.dueDate && (
                        <span>Due: {new Date(alert.dueDate).toLocaleString()}</span>
                      )}
                    </div>
                    {alert.status === 'open' && (
                      <div className="mt-3 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlertAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                        <Button variant="outline" size="sm">
                          Create Work Order
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No maintenance alerts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cmms" className="space-y-6">
          <CMMSIntegration onWorkOrderCreated={handleWorkOrderCreated} />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <MaintenanceScheduler fixtures={[]} hoursPerDay={8} />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalyticsControl />
          
          <Card>
            <CardHeader>
              <CardTitle>Predictive Maintenance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Predictive analytics is analyzing equipment performance data to identify potential issues before they occur.
                  Current models are trained on historical maintenance data and real-time sensor readings.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">LED Fixture Bank 1A</div>
                      <div className="text-sm text-gray-500">Predicted failure probability increasing</div>
                    </div>
                    <Badge className="bg-orange-500 text-white">72% Risk</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">HVAC Unit 3</div>
                      <div className="text-sm text-gray-500">Filter replacement due soon</div>
                    </div>
                    <Badge className="bg-yellow-500 text-white">45% Risk</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Irrigation Pump B2</div>
                      <div className="text-sm text-gray-500">Performance within normal parameters</div>
                    </div>
                    <Badge className="bg-green-500 text-white">15% Risk</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Maintenance Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Preventive Maintenance</span>
                      <span>$12,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Corrective Maintenance</span>
                      <span>$8,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Repairs</span>
                      <span>$3,800</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>$24,500</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Work Order Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Scheduled</span>
                      <span>65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Predictive</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reactive</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Equipment Reliability Trends</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">LED Lighting Systems</span>
                      <span className="text-green-600">↑ 5% improvement</span>
                    </div>
                    <div className="text-sm text-gray-500">Average uptime: 98.5%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">HVAC Systems</span>
                      <span className="text-yellow-600">→ Stable</span>
                    </div>
                    <div className="text-sm text-gray-500">Average uptime: 96.2%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Irrigation Systems</span>
                      <span className="text-red-600">↓ 2% decline</span>
                    </div>
                    <div className="text-sm text-gray-500">Average uptime: 94.8%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}