/**
 * Geo-Enhanced Code Compliance Dashboard
 * Visual interface showing location-based code compliance using multiple mapping APIs
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Zap, Building2, Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GeoEnhancedCodeCompliance, GeoCodeCompliance } from '@/lib/construction/geo-enhanced-code-compliance';

interface GeoComplianceDashboardProps {
  projectData?: any;
  onComplianceUpdate?: (compliance: GeoCodeCompliance) => void;
}

export function GeoComplianceDashboard({ projectData, onComplianceUpdate }: GeoComplianceDashboardProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [compliance, setCompliance] = useState<GeoCodeCompliance | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const mapRef = useRef<any>(null);

  const geoCompliance = new GeoEnhancedCodeCompliance(
    process.env.NEXT_PUBLIC_NREL_API_KEY || 'demo'
  );

  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    try {
      const result = await geoCompliance.getComplianceByLocation(address, projectData || {});
      setCompliance(result);
      onComplianceUpdate?.(result);
      
      // Initialize map if available
      if (mapRef.current && result.location.coordinates) {
        initializeMap(result);
      }
    } catch (error) {
      logger.error('system', 'Compliance check failed:', error );
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = (complianceData: GeoCodeCompliance) => {
    // Would initialize Mapbox map with compliance layers
    logger.info('system', 'Initializing map with compliance data:', { data: complianceData });
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = (value: any, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    }
    return String(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Geo-Enhanced Code Compliance</h1>
          <p className="text-gray-600">Multi-API location-based building code validation</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          🌍 Multi-Provider System
        </Badge>
      </div>

      {/* Address Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Project Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter project address (e.g., 123 Main St, Denver, CO)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              className="flex-1"
            />
            <Button onClick={handleAddressSearch} disabled={loading}>
              {loading ? 'Analyzing...' : 'Check Compliance'}
            </Button>
          </div>
          {compliance && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Coordinates</p>
                <p className="font-medium">
                  {compliance.location.coordinates.lat.toFixed(4)}, {compliance.location.coordinates.lng.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Jurisdiction</p>
                <p className="font-medium">{compliance.location.municipality}, {compliance.location.state}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Overall Compliance</p>
                <p className="font-medium text-lg">
                  {compliance.compliance.overallCompliance.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {compliance && (
        <>
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Climate Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{compliance.climateData.zone}</div>
                <p className="text-sm text-gray-600">IECC Climate Zone</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Wind Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compliance.climateData.windData.basicWindSpeed} m/s
                </div>
                <p className="text-sm text-gray-600">Basic Design Wind Speed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Snow Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compliance.climateData.snowLoad} kN/m²
                </div>
                <p className="text-sm text-gray-600">Ground Snow Load</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Seismic Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compliance.seismicData.seismicDesignCategory}
                </div>
                <p className="text-sm text-gray-600">Seismic Design Category</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Multi-API Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* NOAA */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">NOAA</p>
                    <p className="text-sm text-gray-600">Climate Data</p>
                  </div>
                </div>

                {/* NREL */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">NREL</p>
                    <p className="text-sm text-gray-600">Solar & Energy</p>
                  </div>
                </div>

                {/* USGS */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">USGS</p>
                    <p className="text-sm text-gray-600">Seismic & Elevation</p>
                  </div>
                </div>

                {/* Mapbox/Google */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Mapbox/Google</p>
                    <p className="text-sm text-gray-600">Geocoding</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Compliance Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structural">Structural</TabsTrigger>
              <TabsTrigger value="electrical">Electrical</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="jurisdiction">Jurisdiction</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Overall Compliance</span>
                        <span className="font-bold">{compliance.compliance.overallCompliance.toFixed(1)}%</span>
                      </div>
                      <Progress value={compliance.compliance.overallCompliance} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">✅ Compliant Requirements</h4>
                        <div className="text-sm space-y-1">
                          {[
                            ...compliance.compliance.structuralRequirements,
                            ...compliance.compliance.electricalRequirements,
                            ...compliance.compliance.energyRequirements
                          ]
                            .filter(req => req.compliant)
                            .map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>{req.code} {req.section}: {req.requirement}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">⚠️ Non-Compliant Requirements</h4>
                        <div className="text-sm space-y-1">
                          {[
                            ...compliance.compliance.structuralRequirements,
                            ...compliance.compliance.electricalRequirements,
                            ...compliance.compliance.energyRequirements
                          ]
                            .filter(req => !req.compliant)
                            .map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span>{req.code} {req.section}: {req.requirement}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structural" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Structural Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compliance.compliance.structuralRequirements.map((req, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getComplianceIcon(req.compliant)}
                            <span className="font-medium">{req.code} {req.section}</span>
                          </div>
                          <Badge variant={req.compliant ? 'default' : 'destructive'}>
                            {req.compliant ? 'Compliant' : 'Non-Compliant'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{req.requirement}</h4>
                        <p className="text-sm text-gray-600 mb-2">{req.basis}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            <strong>Required:</strong> {formatValue(req.value, req.unit)}
                          </span>
                          <span className="text-gray-500">
                            Source: {req.source.provider} ({req.source.confidence * 100}% confidence)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="electrical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Electrical Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compliance.compliance.electricalRequirements.length > 0 ? (
                      compliance.compliance.electricalRequirements.map((req, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getComplianceIcon(req.compliant)}
                              <span className="font-medium">{req.code} {req.section}</span>
                            </div>
                            <Badge variant={req.compliant ? 'default' : 'destructive'}>
                              {req.compliant ? 'Compliant' : 'Non-Compliant'}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{req.requirement}</h4>
                          <p className="text-sm text-gray-600 mb-2">{req.basis}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              <strong>Required:</strong> {formatValue(req.value, req.unit)}
                            </span>
                            <span className="text-gray-500">
                              Source: {req.source.provider}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No electrical requirements identified for this location.</p>
                        <p className="text-sm">Standard NEC requirements apply.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="energy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Code Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Climate Data</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Climate Zone:</span>
                          <span className="font-medium">{compliance.climateData.zone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heating Degree Days:</span>
                          <span className="font-medium">{compliance.climateData.heatingDegreeDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cooling Degree Days:</span>
                          <span className="font-medium">{compliance.climateData.coolingDegreeDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Solar Irradiance:</span>
                          <span className="font-medium">{compliance.climateData.solarData.annualIrradiance} kWh/m²</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Design Temperatures</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>99% Heating:</span>
                          <span className="font-medium">{compliance.climateData.designTemperatures.winter99}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>97.5% Heating:</span>
                          <span className="font-medium">{compliance.climateData.designTemperatures.winter97_5}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1% Cooling:</span>
                          <span className="font-medium">{compliance.climateData.designTemperatures.summer1}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2.5% Cooling:</span>
                          <span className="font-medium">{compliance.climateData.designTemperatures.summer2_5}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Energy Requirements</h4>
                    <div className="space-y-4">
                      {compliance.compliance.energyRequirements.map((req, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getComplianceIcon(req.compliant)}
                              <span className="font-medium">{req.code} {req.section}</span>
                            </div>
                            <Badge variant={req.compliant ? 'default' : 'destructive'}>
                              {req.compliant ? 'Compliant' : 'Non-Compliant'}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{req.requirement}</h4>
                          <p className="text-sm text-gray-600">{req.basis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jurisdiction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Jurisdiction Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Building Department</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">{compliance.jurisdictionData.buildingDepartment.name}</span>
                        </div>
                        <div className="text-gray-600">
                          {compliance.jurisdictionData.buildingDepartment.address}
                        </div>
                        <div>
                          📞 {compliance.jurisdictionData.buildingDepartment.phone}
                        </div>
                        <div>
                          🌐 <a href={compliance.jurisdictionData.buildingDepartment.website} 
                               className="text-blue-600 hover:underline">
                            {compliance.jurisdictionData.buildingDepartment.website}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Adopted Codes</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Building:</span> {compliance.jurisdictionData.adoptedCodes.buildingCode}
                        </div>
                        <div>
                          <span className="font-medium">Electrical:</span> {compliance.jurisdictionData.adoptedCodes.electricalCode}
                        </div>
                        <div>
                          <span className="font-medium">Mechanical:</span> {compliance.jurisdictionData.adoptedCodes.mechanicalCode}
                        </div>
                        <div>
                          <span className="font-medium">Energy:</span> {compliance.jurisdictionData.adoptedCodes.energyCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Permit Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {compliance.jurisdictionData.permitRequirements.map((permit, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{permit.type}</span>
                            <Badge variant={permit.required ? 'default' : 'secondary'}>
                              {permit.required ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Fee: ${permit.fee}</div>
                            <div>Timeframe: {permit.timeframe}</div>
                            <div>Documents: {permit.documentation.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Map Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Map Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive compliance map would render here</p>
                  <p className="text-sm">Showing wind zones, seismic zones, climate data, and jurisdiction boundaries</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Low Wind Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Moderate Wind Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>High Wind Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Extreme Wind Zone</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!compliance && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Enter Project Location</h3>
            <p className="text-gray-600 mb-4">
              Get comprehensive building code compliance analysis using multiple government and commercial APIs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  🌦️
                </div>
                <div className="font-medium">NOAA</div>
                <div className="text-gray-600">Weather & Climate</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  ☀️
                </div>
                <div className="font-medium">NREL</div>
                <div className="text-gray-600">Solar & Energy</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  🌏
                </div>
                <div className="font-medium">USGS</div>
                <div className="text-gray-600">Seismic & Terrain</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  🗺️
                </div>
                <div className="font-medium">Mapbox</div>
                <div className="text-gray-600">Maps & Geocoding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}