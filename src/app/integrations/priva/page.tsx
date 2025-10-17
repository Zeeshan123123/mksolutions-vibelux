'use client';

import React, { useState } from 'react';
import { PrivaSetupWizard } from '@/components/integrations/PrivaSetupWizard';
import { PrivaConnectionConfig } from '@/lib/integrations/priva/priva-config-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Factory, 
  Settings, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Database,
  Globe,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  BarChart3
} from 'lucide-react';

export default function PrivaIntegrationPage() {
  const [showSetup, setShowSetup] = useState(false);
  const [config, setConfig] = useState<PrivaConnectionConfig | null>(null);
  
  const handleSetupComplete = (newConfig: PrivaConnectionConfig) => {
    setConfig(newConfig);
    setShowSetup(false);
    toast({
      title: 'Priva Integration Complete',
      description: newConfig.isDemo 
        ? 'Demo mode activated - viewing simulated data'
        : 'Successfully connected to your Priva system',
    });
  };
  
  if (showSetup) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <PrivaSetupWizard 
          onComplete={handleSetupComplete}
          onClose={() => setShowSetup(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Priva Climate Computer Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Priva system for real-time greenhouse monitoring and control
          </p>
        </div>
        <Button onClick={() => setShowSetup(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Configure Priva
        </Button>
      </div>
      
      {/* Status Overview */}
      {config ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5" />
                <CardTitle>Integration Status</CardTitle>
              </div>
              <Badge variant={config.connectionStatus === 'connected' ? 'default' : 
                           config.connectionStatus === 'demo' ? 'secondary' : 'destructive'}>
                {config.connectionStatus === 'connected' ? 'Connected' :
                 config.connectionStatus === 'demo' ? 'Demo Mode' :
                 config.connectionStatus === 'error' ? 'Error' : 'Disconnected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.isDemo && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Running in demo mode with simulated data. Configure real credentials to connect to your Priva system.
                  </p>
                </div>
              )}
              
              {config.facilities.map(facility => (
                <div key={facility.id} className="space-y-2">
                  <h3 className="font-semibold">{facility.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Area:</span>
                      <p className="font-medium">{facility.totalArea} m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Compartments:</span>
                      <p className="font-medium">{facility.compartments.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{facility.location.address}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Connected:</span>
                      <p className="font-medium">
                        {config.lastConnected ? new Date(config.lastConnected).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Priva System Connected</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your Priva climate computer to monitor and control your greenhouse environment in real-time.
              </p>
              <Button onClick={() => setShowSetup(true)}>
                <ChevronRight className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Real-Time Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor temperature, humidity, CO2, and radiation levels in real-time from your Priva system.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Remote Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Adjust setpoints and control equipment remotely through the Priva API.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Historical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access historical climate data for analysis and optimization insights.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Priva Integration Works</CardTitle>
          <CardDescription>
            Connect VibeLux to your Priva climate computer in three simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Configure Credentials</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your Priva username, password, and farm code. Or use demo mode to test without hardware.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Test Connection</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Verify the connection to your Priva system and discover available compartments.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Start Monitoring</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  View real-time data, receive alarms, and control your greenhouse environment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements for Real Connection</CardTitle>
          <CardDescription>
            What you need to connect to an actual Priva system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Hardware Requirements
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• Priva Connext or Compact CC climate computer</li>
                <li>• Network connectivity (Ethernet/WiFi)</li>
                <li>• Configured compartments and sensors</li>
                <li>• Active Priva Office or Operator license</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Software Requirements
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• Priva Digital Services subscription</li>
                <li>• OAuth application registration</li>
                <li>• API access credentials</li>
                <li>• Proper user permissions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> If you don't have a Priva system, you can use Demo Mode to explore 
              the integration with simulated greenhouse data.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Pricing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Costs</CardTitle>
          <CardDescription>
            Estimated costs for Priva system integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Hardware</h4>
                <p className="text-2xl font-bold mt-2">€50,000 - €500,000</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Climate computer, sensors, installation
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Software License</h4>
                <p className="text-2xl font-bold mt-2">€2,000 - €10,000/year</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Priva Office, Digital Services
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">API Access</h4>
                <p className="text-2xl font-bold mt-2">€500 - €5,000/year</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enterprise API subscription
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>VibeLux Integration:</strong> Free with your VibeLux subscription. 
                Use Demo Mode to test without any Priva hardware investment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}