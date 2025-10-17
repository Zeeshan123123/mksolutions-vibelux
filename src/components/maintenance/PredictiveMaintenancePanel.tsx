'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Brain,
  Target,
  Gauge
} from 'lucide-react';
import { PredictiveAlert, EquipmentHealth } from '@/types/cmms';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

interface PredictiveMaintenancePanelProps {
  facilityId?: string;
  onAlertCreated?: (alert: PredictiveAlert) => void;
}

export default function PredictiveMaintenancePanel({ 
  facilityId, 
  onAlertCreated 
}: PredictiveMaintenancePanelProps) {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [equipmentHealth, setEquipmentHealth] = useState<EquipmentHealth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState({
    isTraining: false,
    lastTraining: null as Date | null,
    accuracy: 0,
    predictionCount: 0,
  });

  useEffect(() => {
    loadPredictiveData();
    const interval = setInterval(loadPredictiveData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [facilityId]);

  const loadPredictiveData = async () => {
    try {
      // Load predictive alerts
      const alertsResponse = await fetch('/api/maintenance/predictive/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      // Load equipment health scores
      const healthResponse = await fetch('/api/maintenance/predictive/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setEquipmentHealth(healthData.health || []);
      }

      // Load model status
      const statusResponse = await fetch('/api/maintenance/ml-training');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setModelStatus(statusData.status || modelStatus);
      }
    } catch (error) {
      logger.error('system', 'Failed to load predictive data:', error );
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/maintenance/predictive/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acknowledgedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledgedAt: new Date() }
            : alert
        ));
        toast.success('Alert acknowledged');
      } else {
        toast.error('Failed to acknowledge alert');
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const triggerModelTraining = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maintenance/ml-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityId,
          trainingType: 'incremental',
        }),
      });

      if (response.ok) {
        toast.success('Model training started');
        setModelStatus({ ...modelStatus, isTraining: true });
      } else {
        toast.error('Failed to start model training');
      }
    } catch (error) {
      toast.error('Failed to start model training');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-green-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 70) return <Activity className="w-4 h-4 text-yellow-500" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const formatTimeToFailure = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    if (hours < 168) return `${Math.round(hours / 24)}d`;
    if (hours < 720) return `${Math.round(hours / 168)}w`;
    return `${Math.round(hours / 720)}mo`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Maintenance</h2>
          <p className="text-muted-foreground">
            AI-powered equipment health monitoring and failure prediction
          </p>
        </div>
        <Button onClick={triggerModelTraining} disabled={isLoading || modelStatus.isTraining}>
          <Brain className="w-4 h-4 mr-2" />
          {modelStatus.isTraining ? 'Training...' : 'Retrain Models'}
        </Button>
      </div>

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>ML Model Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{modelStatus.accuracy}%</div>
              <div className="text-sm text-gray-500">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{modelStatus.predictionCount}</div>
              <div className="text-sm text-gray-500">Predictions Made</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {modelStatus.lastTraining ? 
                  Math.round((Date.now() - new Date(modelStatus.lastTraining).getTime()) / (1000 * 60 * 60 * 24)) 
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Days Since Training</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${modelStatus.isTraining ? 'text-blue-600' : 'text-green-600'}`}>
                {modelStatus.isTraining ? 'Training' : 'Ready'}
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>
          {modelStatus.isTraining && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Model training in progress...</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Predictive Alerts</span>
            <Badge variant="outline">{alerts.filter(a => a.isActive).length} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.filter(alert => alert.isActive).map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <div className="font-medium">{alert.assetName}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {alert.alertType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(alert.probability * 100)}% probability
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-700 mb-2">{alert.recommendedAction}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Time to failure: {formatTimeToFailure(alert.timeToFailure)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                    </span>
                  </div>
                </div>

                {alert.affectedSystems.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Affected Systems:</div>
                    <div className="flex flex-wrap gap-1">
                      {alert.affectedSystems.map((system, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium mb-1">Potential Impact:</div>
                  <div>{alert.potentialImpact}</div>
                </div>

                {!alert.acknowledgedAt && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button variant="outline" size="sm">
                      Create Work Order
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Maintenance
                    </Button>
                  </div>
                )}

                {alert.acknowledgedAt && (
                  <div className="text-xs text-gray-500">
                    Acknowledged on {new Date(alert.acknowledgedAt).toLocaleString()}
                    {alert.acknowledgedBy && ` by ${alert.acknowledgedBy}`}
                  </div>
                )}
              </div>
            ))}
            {alerts.filter(alert => alert.isActive).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div>No active predictive alerts</div>
                <div className="text-sm">All equipment operating within normal parameters</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="w-5 h-5" />
            <span>Equipment Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentHealth.map((health) => (
              <div key={health.assetId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(health.overallScore)}
                    <div className="font-medium text-sm">{health.assetId}</div>
                  </div>
                  <div className={`text-sm font-medium ${getHealthStatusColor(health.healthStatus)}`}>
                    {health.healthStatus}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Health Score</span>
                    <span>{health.overallScore}/100</span>
                  </div>
                  <Progress value={health.overallScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  {health.healthFactors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{factor.factor}</span>
                      <span className={
                        factor.status === 'normal' ? 'text-green-600' :
                        factor.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {factor.score}/100
                      </span>
                    </div>
                  ))}
                </div>

                {health.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Top Recommendation:
                    </div>
                    <div className="text-xs text-gray-700">
                      {health.recommendations[0].action}
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Last assessed: {new Date(health.lastAssessment).toLocaleDateString()}
                </div>
              </div>
            ))}
            {equipmentHealth.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <div>No equipment health data available</div>
                <div className="text-sm">Health monitoring will begin once sensors are connected</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Predictive maintenance has prevented an estimated 3 equipment failures this month, 
                saving approximately $15,000 in emergency repairs and downtime costs.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-1">
                  <TrendingUp className="w-5 h-5" />
                  <span>+15%</span>
                </div>
                <div className="text-sm text-gray-500">Equipment Uptime</div>
                <div className="text-xs text-gray-400 mt-1">vs. previous month</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-1">
                  <TrendingDown className="w-5 h-5" />
                  <span>-25%</span>
                </div>
                <div className="text-sm text-gray-500">Maintenance Costs</div>
                <div className="text-xs text-gray-400 mt-1">vs. previous month</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center space-x-1">
                  <CheckCircle className="w-5 h-5" />
                  <span>98.5%</span>
                </div>
                <div className="text-sm text-gray-500">Prediction Accuracy</div>
                <div className="text-xs text-gray-400 mt-1">last 30 days</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}