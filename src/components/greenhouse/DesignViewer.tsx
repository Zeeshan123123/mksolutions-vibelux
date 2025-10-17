'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Edit,
  Download,
  Share,
  MoreHorizontal,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  MapPin,
  Ruler,
  Building,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Maximize,
  Camera,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Design {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_CONSTRUCTION' | 'COMPLETED' | 'ARCHIVED';
  width: number;
  length: number;
  height: number;
  sideHeight: number;
  area: number;
  volume: number;
  structureType: string;
  glazingType: string;
  frameType: string;
  roofType: string;
  facility: {
    id: string;
    name: string;
    type: string;
  };
  zones: Array<{
    id: string;
    name: string;
    zoneType: string;
    area: number;
    x: number;
    y: number;
    width: number;
    length: number;
    targetTemp?: number;
    targetHumidity?: number;
    targetCO2?: number;
    cropType?: string;
    equipment: Array<{
      id: string;
      name: string;
      equipmentType: string;
      status: string;
    }>;
    sensors: Array<{
      id: string;
      name: string;
      sensorType: string;
      readings: Array<{
        value: number;
        unit: string;
        timestamp: string;
      }>;
    }>;
    climateData: Array<{
      temperature: number;
      humidity: number;
      co2?: number;
      readingAt: string;
    }>;
  }>;
  equipment: Array<{
    id: string;
    name: string;
    equipmentType: string;
    status: string;
    powerRating?: number;
    x: number;
    y: number;
    z?: number;
  }>;
  exports: Array<{
    id: string;
    exportType: string;
    format: string;
    status: string;
    filePath?: string;
    createdAt: string;
  }>;
  revisions: Array<{
    id: string;
    version: number;
    title: string;
    description: string;
    changeType: string;
    createdAt: string;
  }>;
  forgeUrn?: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignViewerProps {
  designId: string;
}

export function DesignViewer({ designId }: DesignViewerProps) {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewerLoaded, setViewerLoaded] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDesign();
  }, [designId]);

  useEffect(() => {
    if (design?.forgeUrn && activeTab === '3d' && !viewerLoaded) {
      initializeForgeViewer();
    }
  }, [design, activeTab, viewerLoaded]);

  const fetchDesign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/designs/${designId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch design');
      }

      const data = await response.json();
      setDesign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeForgeViewer = async () => {
    if (!design?.forgeUrn || !viewerRef.current) return;

    try {
      // Get viewer token
      const tokenResponse = await fetch('/api/forge/viewer-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId: design.id })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get viewer token');
      }

      const { access_token, urn } = await tokenResponse.json();

      // Initialize Autodesk Forge Viewer
      const script = document.createElement('script');
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
      script.onload = () => {
        const options = {
          env: 'AutodeskProduction',
          accessToken: access_token,
        };

        // @ts-ignore
        Autodesk.Viewing.Initializer(options, () => {
          const viewer = new Autodesk.Viewing.GuiViewer3D(viewerRef.current);
          viewer.start();
          
          viewer.loadDocumentNode(`urn:${urn}`, {}, (model: any) => {
            setViewerLoaded(true);
          });
        });
      };

      document.head.appendChild(script);

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
      document.head.appendChild(link);

    } catch (err) {
      console.error('Failed to initialize Forge Viewer:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      IN_CONSTRUCTION: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      ARCHIVED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      DRAFT: Clock,
      IN_REVIEW: AlertTriangle,
      APPROVED: CheckCircle,
      IN_CONSTRUCTION: Activity,
      COMPLETED: CheckCircle,
      ARCHIVED: AlertTriangle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const handleExport = async (exportType: string, format: string) => {
    try {
      const response = await fetch(`/api/designs/${designId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportType,
          format,
          options: {
            includeZones: true,
            includeEquipment: true,
            includeMaterials: true,
            includeSpecs: true
          }
        })
      });

      if (response.ok) {
        alert('Export initiated. You will receive a download link shortly.');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      alert('Failed to start export');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Design not found'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{design.name}</h1>
            <Badge className={getStatusColor(design.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(design.status)}
                {design.status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
          <p className="text-gray-600">{design.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {design.facility.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Updated {new Date(design.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('REPORT', 'PDF')}>
                Design Report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('BLUEPRINT', 'PDF')}>
                Technical Blueprint (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('SPECIFICATION', 'PDF')}>
                Specifications (PDF)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('BOM', 'XLSX')}>
                Bill of Materials (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('REPORT', 'XLSX')}>
                Data Export (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Design
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="3d">3D View</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Width:</span>
                  <span className="font-medium">{design.width} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Length:</span>
                  <span className="font-medium">{design.length} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Height:</span>
                  <span className="font-medium">{design.height} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Side Height:</span>
                  <span className="font-medium">{design.sideHeight} m</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor Area:</span>
                  <span className="font-medium">{design.area} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">{design.volume} m³</span>
                </div>
              </CardContent>
            </Card>

            {/* Structure Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {design.structureType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Glazing:</span>
                  <span className="font-medium">{design.glazingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frame:</span>
                  <span className="font-medium">{design.frameType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roof:</span>
                  <span className="font-medium">
                    {design.roofType.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Project Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zones:</span>
                  <span className="font-medium">{design.zones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipment:</span>
                  <span className="font-medium">{design.equipment.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exports:</span>
                  <span className="font-medium">{design.exports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revisions:</span>
                  <span className="font-medium">{design.revisions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {design.revisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {design.revisions.slice(0, 5).map((revision) => (
                    <div key={revision.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          v{revision.version}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{revision.title}</div>
                        <div className="text-sm text-gray-600">{revision.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(revision.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {revision.changeType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-6">
          {design.zones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No zones configured
                </h3>
                <p className="text-gray-600 mb-4">
                  Add zones to organize your greenhouse layout
                </p>
                <Button>Add Zone</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {design.zones.map((zone) => (
                <Card key={zone.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {zone.zoneType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{zone.area} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{zone.x}, {zone.y}</span>
                      </div>
                    </div>

                    {zone.targetTemp && (
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span>Target: {zone.targetTemp}°C</span>
                      </div>
                    )}

                    {zone.targetHumidity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>Humidity: {zone.targetHumidity}%</span>
                      </div>
                    )}

                    {zone.cropType && (
                      <div className="text-sm">
                        <span className="text-gray-600">Crop: </span>
                        <span className="font-medium">{zone.cropType}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{zone.equipment.length} equipment</span>
                      <span>{zone.sensors.length} sensors</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          {design.equipment.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No equipment configured
                </h3>
                <p className="text-gray-600 mb-4">
                  Add equipment to control your greenhouse environment
                </p>
                <Button>Add Equipment</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {design.equipment.map((equipment) => (
                <Card key={equipment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{equipment.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {equipment.equipmentType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge className={
                        equipment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        equipment.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {equipment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">
                          {equipment.x}, {equipment.y}
                          {equipment.z && `, ${equipment.z}`}
                        </span>
                      </div>
                      {equipment.powerRating && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Power:</span>
                          <span className="font-medium">{equipment.powerRating}W</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3D View Tab */}
        <TabsContent value="3d" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  3D Model View
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Screenshot
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {design.forgeUrn ? (
                <div
                  ref={viewerRef}
                  className="w-full h-[600px] border rounded-lg bg-gray-100"
                />
              ) : (
                <div className="w-full h-[600px] border rounded-lg bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No 3D model available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload a CAD file to view your design in 3D
                    </p>
                    <Button>Upload Model</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design History</CardTitle>
            </CardHeader>
            <CardContent>
              {design.revisions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No revision history
                  </h3>
                  <p className="text-gray-600">
                    Changes to this design will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {design.revisions.map((revision) => (
                    <div key={revision.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant="outline">v{revision.version}</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{revision.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {revision.changeType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {revision.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          {new Date(revision.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}