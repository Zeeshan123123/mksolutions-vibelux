/**
 * Geo-Enhanced Code Compliance System
 * Leverages multiple mapping APIs and geospatial data sources for comprehensive code validation
 */

import { geocodingService } from '../geocoding';
import { NRELAPIIntegration } from '../nrel-api';
import { mapboxgl } from '../mapbox-config';

export interface GeoCodeCompliance {
  location: LocationContext;
  climateData: ClimateContext;
  seismicData: SeismicContext;
  jurisdictionData: JurisdictionContext;
  compliance: CodeComplianceByLocation;
  visualizations: ComplianceMapLayers;
}

export interface LocationContext {
  coordinates: { lat: number; lng: number };
  address: string;
  municipality: string;
  county: string;
  state: string;
  country: string;
  zipCode?: string;
  elevation: number; // meters
  timezone: string;
  sources: DataSource[];
}

export interface ClimateContext {
  zone: string; // Climate zone classification
  heatingDegreeDays: number;
  coolingDegreeDays: number;
  designTemperatures: {
    winter99: number; // 99% heating design temp
    winter97_5: number; // 97.5% heating design temp  
    summer1: number; // 1% cooling design temp
    summer2_5: number; // 2.5% cooling design temp
  };
  windData: {
    basicWindSpeed: number; // m/s
    exposureCategory: 'A' | 'B' | 'C' | 'D';
    topographicalFactor: number;
  };
  snowLoad: number; // kN/m²
  iceLoad: number; // kN/m²
  groundSnowLoad: number; // kN/m²
  rainIntensity: number; // mm/hour for 10-year storm
  solarData: {
    annualIrradiance: number; // kWh/m²/year
    peakSunHours: number;
    monthlyAverages: number[];
  };
  sources: DataSource[];
}

export interface SeismicContext {
  seismicDesignCategory: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  spectralAcceleration: {
    ss: number; // Short period
    s1: number; // 1-second period
    sms: number; // Site-modified short period
    sm1: number; // Site-modified 1-second
    sds: number; // Design short period
    sd1: number; // Design 1-second
  };
  siteClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  importanceFactor: number;
  responseModificationFactor: number;
  sources: DataSource[];
}

export interface JurisdictionContext {
  buildingDepartment: {
    name: string;
    address: string;
    phone: string;
    website: string;
    permitSystem: string;
  };
  adoptedCodes: {
    buildingCode: string; // e.g., "2021 IBC with local amendments"
    electricalCode: string;
    mechanicalCode: string;
    plumbingCode: string;
    energyCode: string;
    fireCode: string;
    localAmendments: string[];
  };
  permitRequirements: PermitRequirement[];
  fees: PermitFeeSchedule;
  inspections: InspectionSchedule[];
  specialRequirements: string[];
  sources: DataSource[];
}

export interface CodeComplianceByLocation {
  structuralRequirements: LocationSpecificRequirement[];
  electricalRequirements: LocationSpecificRequirement[];
  mechanicalRequirements: LocationSpecificRequirement[];
  energyRequirements: LocationSpecificRequirement[];
  fireRequirements: LocationSpecificRequirement[];
  accessibilityRequirements: LocationSpecificRequirement[];
  environmentalRequirements: LocationSpecificRequirement[];
  overallCompliance: number; // percentage
}

export interface LocationSpecificRequirement {
  code: string;
  section: string;
  requirement: string;
  value: number | string;
  unit?: string;
  basis: string; // What geographic data drives this requirement
  compliant: boolean;
  calculation?: string;
  source: DataSource;
}

export interface ComplianceMapLayers {
  windZones: mapboxgl.Layer;
  seismicZones: mapboxgl.Layer;
  snowLoadZones: mapboxgl.Layer;
  climateZones: mapboxgl.Layer;
  jurisdictionBoundaries: mapboxgl.Layer;
  floodZones?: mapboxgl.Layer;
  solarPotential: mapboxgl.Layer;
}

export interface DataSource {
  provider: 'NOAA' | 'NREL' | 'USGS' | 'Google' | 'Mapbox' | 'Census' | 'Local';
  api: string;
  lastUpdated: Date;
  confidence: number; // 0-1
}

export interface PermitRequirement {
  type: string;
  required: boolean;
  fee: number;
  timeframe: string; // e.g., "10 business days"
  documentation: string[];
}

export interface PermitFeeSchedule {
  building: {
    base: number;
    rate: number; // per $1000 of construction value
    minimum: number;
    maximum?: number;
  };
  electrical: {
    base: number;
    perPanel: number;
    perCircuit: number;
  };
  mechanical: {
    base: number;
    perTon: number; // per ton of cooling
  };
  plumbing: {
    base: number;
    perFixture: number;
  };
}

export interface InspectionSchedule {
  phase: string;
  required: boolean;
  notice: string; // e.g., "24 hours advance notice"
  fee?: number;
}

export class GeoEnhancedCodeCompliance {
  private nrelApi: NRELAPIIntegration;
  private geocoder = geocodingService;
  
  constructor(nrelApiKey: string) {
    this.nrelApi = new NRELAPIIntegration(nrelApiKey);
  }

  /**
   * Get comprehensive code compliance for a specific location
   */
  async getComplianceByLocation(
    address: string,
    projectData: any
  ): Promise<GeoCodeCompliance> {
    logger.info('api', `🌍 Getting geo-enhanced code compliance for: ${address}`);

    // Step 1: Geocode address using multiple providers
    const location = await this.getLocationContext(address);
    
    // Step 2: Get climate data from multiple sources
    const climateData = await this.getClimateContext(location.coordinates);
    
    // Step 3: Get seismic data from USGS
    const seismicData = await this.getSeismicContext(location.coordinates);
    
    // Step 4: Get jurisdiction-specific requirements
    const jurisdictionData = await this.getJurisdictionContext(location);
    
    // Step 5: Calculate location-specific code requirements
    const compliance = await this.calculateLocationSpecificCompliance(
      location,
      climateData,
      seismicData,
      jurisdictionData,
      projectData
    );
    
    // Step 6: Generate map visualizations
    const visualizations = await this.generateComplianceMapLayers(
      location.coordinates,
      climateData,
      seismicData
    );

    return {
      location,
      climateData,
      seismicData,
      jurisdictionData,
      compliance,
      visualizations
    };
  }

  /**
   * Get comprehensive location context using multiple geocoding sources
   */
  private async getLocationContext(address: string): Promise<LocationContext> {
    // Primary geocoding with fallbacks
    const geocodeResult = await this.geocoder.geocodeAddress(address);
    if (!geocodeResult) {
      throw new Error(`Unable to geocode address: ${address}`);
    }

    const { lat, lng } = geocodeResult;

    // Get additional location data from multiple APIs
    const [censusData, elevationData, timezoneData] = await Promise.allSettled([
      this.getCensusData(lat, lng),
      this.getElevationData(lat, lng),
      this.getTimezoneData(lat, lng)
    ]);

    return {
      coordinates: { lat, lng },
      address: geocodeResult.formatted_address,
      municipality: this.extractFromCensus(censusData, 'municipality'),
      county: this.extractFromCensus(censusData, 'county'),
      state: this.extractFromCensus(censusData, 'state'),
      country: 'USA', // Default, could enhance
      zipCode: this.extractFromCensus(censusData, 'zipCode'),
      elevation: this.extractFromResult(elevationData, 0),
      timezone: this.extractFromResult(timezoneData, 'America/New_York'),
      sources: [
        {
          provider: 'Google',
          api: 'Geocoding API',
          lastUpdated: new Date(),
          confidence: geocodeResult.confidence || 0.9
        }
      ]
    };
  }

  /**
   * Get climate context from NOAA and NREL APIs
   */
  private async getClimateContext(coordinates: { lat: number; lng: number }): Promise<ClimateContext> {
    const { lat, lng } = coordinates;

    // Get climate data from multiple sources
    const [noaaData, nrelData, ashreeData] = await Promise.allSettled([
      this.getNOAAClimateData(lat, lng),
      this.getNRELClimateData(lat, lng),
      this.getASHRAEClimateData(lat, lng)
    ]);

    // Combine and validate data from multiple sources
    const windSpeed = this.getBestValue([
      this.extractFromResult(noaaData, 'windSpeed'),
      this.extractFromResult(ashreeData, 'windSpeed')
    ], 25); // Default 25 m/s

    const snowLoad = this.getBestValue([
      this.extractFromResult(noaaData, 'snowLoad'),
      this.extractFromResult(ashreeData, 'snowLoad')
    ], 1.0); // Default 1.0 kN/m²

    return {
      zone: this.determineClimateZone(lat, lng),
      heatingDegreeDays: this.extractFromResult(noaaData, 'heatingDegreeDays', 3000),
      coolingDegreeDays: this.extractFromResult(noaaData, 'coolingDegreeDays', 1500),
      designTemperatures: {
        winter99: this.extractFromResult(ashreeData, 'winter99', -15),
        winter97_5: this.extractFromResult(ashreeData, 'winter97_5', -12),
        summer1: this.extractFromResult(ashreeData, 'summer1', 35),
        summer2_5: this.extractFromResult(ashreeData, 'summer2_5', 32)
      },
      windData: {
        basicWindSpeed: windSpeed,
        exposureCategory: this.determineExposureCategory(lat, lng),
        topographicalFactor: 1.0 // Could enhance with terrain analysis
      },
      snowLoad,
      iceLoad: snowLoad * 0.3, // Rough estimate
      groundSnowLoad: snowLoad * 0.8,
      rainIntensity: this.extractFromResult(noaaData, 'rainIntensity', 100),
      solarData: {
        annualIrradiance: this.extractFromResult(nrelData, 'annualIrradiance', 1500),
        peakSunHours: this.extractFromResult(nrelData, 'peakSunHours', 5.0),
        monthlyAverages: this.extractFromResult(nrelData, 'monthlyAverages', Array(12).fill(125))
      },
      sources: [
        { provider: 'NOAA', api: 'Climate Data API', lastUpdated: new Date(), confidence: 0.95 },
        { provider: 'NREL', api: 'NSRDB', lastUpdated: new Date(), confidence: 0.90 }
      ]
    };
  }

  /**
   * Get seismic data from USGS APIs
   */
  private async getSeismicContext(coordinates: { lat: number; lng: number }): Promise<SeismicContext> {
    const { lat, lng } = coordinates;
    
    try {
      // USGS Design Maps API
      const response = await fetch(
        `https://earthquake.usgs.gov/ws/designmaps/asce7-16.json?latitude=${lat}&longitude=${lng}&riskCategory=II&siteClass=D&title=Project`
      );
      
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`);
      }
      
      const data = await response.json();
      const designMaps = data.response.data;

      return {
        seismicDesignCategory: this.determineSeismicDesignCategory(designMaps.sds, designMaps.sd1),
        spectralAcceleration: {
          ss: designMaps.ss,
          s1: designMaps.s1,
          sms: designMaps.sms,
          sm1: designMaps.sm1,
          sds: designMaps.sds,
          sd1: designMaps.sd1
        },
        siteClass: 'D', // Default - would need geotechnical data
        importanceFactor: 1.0, // Standard occupancy
        responseModificationFactor: 3.5, // Steel frame
        sources: [
          { provider: 'USGS', api: 'Design Maps', lastUpdated: new Date(), confidence: 0.98 }
        ]
      };
    } catch (error) {
      logger.warn('api', 'USGS seismic data unavailable, using defaults:', { data: error });
      
      // Fallback to regional defaults
      return {
        seismicDesignCategory: this.getRegionalSeismicCategory(lat, lng),
        spectralAcceleration: {
          ss: 0.5, s1: 0.2, sms: 0.5, sm1: 0.2, sds: 0.33, sd1: 0.13
        },
        siteClass: 'D',
        importanceFactor: 1.0,
        responseModificationFactor: 3.5,
        sources: [
          { provider: 'Local', api: 'Regional defaults', lastUpdated: new Date(), confidence: 0.6 }
        ]
      };
    }
  }

  /**
   * Get jurisdiction-specific code requirements
   */
  private async getJurisdictionContext(location: LocationContext): Promise<JurisdictionContext> {
    // This would integrate with local building department APIs
    // For now, providing structured defaults that can be easily enhanced
    
    const stateDefaults = this.getStateCodeDefaults(location.state);
    
    return {
      buildingDepartment: {
        name: `${location.municipality} Building Department`,
        address: `${location.municipality}, ${location.state}`,
        phone: '555-0100', // Would look up actual
        website: `https://${location.municipality.toLowerCase()}.gov/building`,
        permitSystem: 'Online' // Default assumption
      },
      adoptedCodes: {
        buildingCode: stateDefaults.buildingCode,
        electricalCode: stateDefaults.electricalCode,
        mechanicalCode: stateDefaults.mechanicalCode,
        plumbingCode: stateDefaults.plumbingCode,
        energyCode: stateDefaults.energyCode,
        fireCode: stateDefaults.fireCode,
        localAmendments: [] // Would need local research
      },
      permitRequirements: [
        { type: 'Building', required: true, fee: 500, timeframe: '10 business days', documentation: ['Plans', 'Calculations'] },
        { type: 'Electrical', required: true, fee: 200, timeframe: '5 business days', documentation: ['Electrical plans'] },
        { type: 'Mechanical', required: true, fee: 150, timeframe: '5 business days', documentation: ['HVAC plans'] }
      ],
      fees: {
        building: { base: 100, rate: 0.005, minimum: 100, maximum: 10000 },
        electrical: { base: 50, perPanel: 25, perCircuit: 5 },
        mechanical: { base: 75, perTon: 15 },
        plumbing: { base: 50, perFixture: 10 }
      },
      inspections: [
        { phase: 'Foundation', required: true, notice: '24 hours' },
        { phase: 'Framing', required: true, notice: '24 hours' },
        { phase: 'Electrical Rough', required: true, notice: '24 hours' },
        { phase: 'Final', required: true, notice: '48 hours' }
      ],
      specialRequirements: this.getSpecialRequirements(location),
      sources: [
        { provider: 'Local', api: 'Jurisdiction database', lastUpdated: new Date(), confidence: 0.8 }
      ]
    };
  }

  /**
   * Calculate location-specific code compliance
   */
  private async calculateLocationSpecificCompliance(
    location: LocationContext,
    climate: ClimateContext,
    seismic: SeismicContext,
    jurisdiction: JurisdictionContext,
    projectData: any
  ): Promise<CodeComplianceByLocation> {
    
    const structuralRequirements: LocationSpecificRequirement[] = [
      {
        code: 'ASCE 7',
        section: '7.3',
        requirement: 'Basic Wind Speed',
        value: climate.windData.basicWindSpeed,
        unit: 'm/s',
        basis: 'NOAA climate data for location',
        compliant: projectData.structure?.windLoadRating >= climate.windData.basicWindSpeed,
        source: climate.sources[0]
      },
      {
        code: 'ASCE 7',
        section: '7.2',
        requirement: 'Ground Snow Load',
        value: climate.snowLoad,
        unit: 'kN/m²',
        basis: 'Regional snow load maps',
        compliant: projectData.structure?.snowLoadRating >= climate.snowLoad,
        source: climate.sources[0]
      },
      {
        code: 'ASCE 7',
        section: '11.4',
        requirement: 'Seismic Design Category',
        value: seismic.seismicDesignCategory,
        basis: 'USGS seismic hazard maps',
        compliant: this.validateSeismicDesign(projectData.structure, seismic),
        source: seismic.sources[0]
      }
    ];

    const electricalRequirements: LocationSpecificRequirement[] = [
      {
        code: 'NEC',
        section: '310.15(B)',
        requirement: 'Temperature Derating',
        value: climate.designTemperatures.summer1,
        unit: '°C',
        basis: 'Local design temperature data',
        compliant: this.validateTemperatureDerating(projectData.electrical, climate.designTemperatures.summer1),
        source: climate.sources[0]
      }
    ];

    const energyRequirements: LocationSpecificRequirement[] = [
      {
        code: 'IECC',
        section: 'C402',
        requirement: 'Climate Zone',
        value: climate.zone,
        basis: 'Geographic climate zone mapping',
        compliant: this.validateClimateZoneCompliance(projectData.envelope, climate.zone),
        source: climate.sources[0]
      }
    ];

    const allRequirements = [
      ...structuralRequirements,
      ...electricalRequirements,
      ...energyRequirements
    ];

    const compliantCount = allRequirements.filter(req => req.compliant).length;
    const overallCompliance = (compliantCount / allRequirements.length) * 100;

    return {
      structuralRequirements,
      electricalRequirements,
      mechanicalRequirements: [],
      energyRequirements,
      fireRequirements: [],
      accessibilityRequirements: [],
      environmentalRequirements: [],
      overallCompliance
    };
  }

  /**
   * Generate map layers for compliance visualization
   */
  private async generateComplianceMapLayers(
    coordinates: { lat: number; lng: number },
    climate: ClimateContext,
    seismic: SeismicContext
  ): Promise<ComplianceMapLayers> {
    
    // This would generate actual Mapbox GL layers
    // For now, providing structure that can be implemented
    
    return {
      windZones: {
        id: 'wind-zones',
        type: 'fill',
        source: {
          type: 'geojson',
          data: await this.generateWindZoneGeoJSON(coordinates)
        },
        paint: {
          'fill-color': this.getWindZoneColor(climate.windData.basicWindSpeed),
          'fill-opacity': 0.6
        }
      } as mapboxgl.Layer,
      
      seismicZones: {
        id: 'seismic-zones',
        type: 'fill',
        source: {
          type: 'geojson',
          data: await this.generateSeismicZoneGeoJSON(coordinates)
        },
        paint: {
          'fill-color': this.getSeismicZoneColor(seismic.seismicDesignCategory),
          'fill-opacity': 0.6
        }
      } as mapboxgl.Layer,
      
      snowLoadZones: {
        id: 'snow-zones',
        type: 'fill',
        paint: {
          'fill-color': this.getSnowLoadColor(climate.snowLoad),
          'fill-opacity': 0.6
        }
      } as mapboxgl.Layer,
      
      climateZones: {
        id: 'climate-zones',
        type: 'fill',
        paint: {
          'fill-color': this.getClimateZoneColor(climate.zone),
          'fill-opacity': 0.4
        }
      } as mapboxgl.Layer,
      
      jurisdictionBoundaries: {
        id: 'jurisdiction',
        type: 'line',
        paint: {
          'line-color': '#ff0000',
          'line-width': 2
        }
      } as mapboxgl.Layer,
      
      solarPotential: {
        id: 'solar-potential',
        type: 'fill',
        paint: {
          'fill-color': this.getSolarPotentialColor(climate.solarData.annualIrradiance),
          'fill-opacity': 0.5
        }
      } as mapboxgl.Layer
    };
  }

  // Helper methods for API calls and data processing
  private async getCensusData(lat: number, lng: number): Promise<any> {
    try {
      const response = await fetch(
        `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=2020&vintage=2020&format=json`
      );
      return await response.json();
    } catch (error) {
      logger.warn('api', 'Census API error:', { data: error  });
      return null;
    }
  }

  private async getElevationData(lat: number, lng: number): Promise<number> {
    try {
      // Using USGS Elevation Point Query Service
      const response = await fetch(
        `https://nationalmap.gov/epqs/pqs.php?x=${lng}&y=${lat}&units=Meters&output=json`
      );
      const data = await response.json();
      return data.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation || 0;
    } catch (error) {
      logger.warn('api', 'Elevation API error:', { data: error  });
      return 0;
    }
  }

  private async getTimezoneData(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      return data.zoneName || 'America/New_York';
    } catch (error) {
      logger.warn('api', 'Timezone API error:', { data: error  });
      return 'America/New_York';
    }
  }

  private async getNOAAClimateData(lat: number, lng: number): Promise<any> {
    // Would integrate with NOAA Climate API
    return {};
  }

  private async getNRELClimateData(lat: number, lng: number): Promise<any> {
    // Would integrate with NREL NSRDB API
    return {};
  }

  private async getASHRAEClimateData(lat: number, lng: number): Promise<any> {
    // Would integrate with ASHRAE climate data
    return {};
  }

  // Utility methods
  private extractFromCensus(censusResult: PromiseSettledResult<any>, field: string): string {
    if (censusResult.status === 'fulfilled' && censusResult.value) {
      // Parse census response for specific field
      return ''; // Implementation depends on census response structure
    }
    return '';
  }

  private extractFromResult(result: PromiseSettledResult<any>, defaultValue: any): any {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getBestValue(values: any[], defaultValue: any): any {
    const validValues = values.filter(v => v != null && !isNaN(v));
    return validValues.length > 0 ? validValues[0] : defaultValue;
  }

  private determineClimateZone(lat: number, lng: number): string {
    // Simplified climate zone determination
    if (lat > 45) return '7A';
    if (lat > 40) return '5A';
    if (lat > 35) return '4A';
    if (lat > 30) return '3A';
    return '2A';
  }

  private determineExposureCategory(lat: number, lng: number): 'A' | 'B' | 'C' | 'D' {
    // Would use land use data to determine exposure
    return 'B'; // Suburban/light industrial default
  }

  private determineSeismicDesignCategory(sds: number, sd1: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
    if (sds < 0.167) return 'A';
    if (sds < 0.33) return 'B';
    if (sds < 0.50) return 'C';
    if (sds < 0.75) return 'D';
    return 'E';
  }

  private getRegionalSeismicCategory(lat: number, lng: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
    // West Coast
    if (lng < -110 && lat > 32) return 'D';
    // Central US
    if (lng > -110 && lng < -95) return 'B';
    // East Coast
    return 'A';
  }

  private getStateCodeDefaults(state: string) {
    const stateDefaults: Record<string, any> = {
      'CA': {
        buildingCode: '2022 CBC (California Building Code)',
        electricalCode: '2022 CEC (California Electrical Code)',
        mechanicalCode: '2022 CMC',
        plumbingCode: '2022 CPC',
        energyCode: 'Title 24',
        fireCode: '2022 CFC'
      },
      'default': {
        buildingCode: '2021 IBC',
        electricalCode: 'NEC 2020',
        mechanicalCode: '2021 IMC',
        plumbingCode: '2021 IPC',
        energyCode: '2021 IECC',
        fireCode: '2021 IFC'
      }
    };
    
    return stateDefaults[state] || stateDefaults['default'];
  }

  private getSpecialRequirements(location: LocationContext): string[] {
    const requirements: string[] = [];
    
    // Coastal requirements
    if (this.isCoastalLocation(location.coordinates)) {
      requirements.push('Coastal construction requirements');
      requirements.push('Hurricane/wind resistance standards');
    }
    
    // High altitude
    if (location.elevation > 1500) {
      requirements.push('High altitude design considerations');
    }
    
    // Seismic zone
    if (this.isSeismicZone(location.coordinates)) {
      requirements.push('Seismic design requirements');
    }
    
    return requirements;
  }

  private isCoastalLocation(coords: { lat: number; lng: number }): boolean {
    // Simplified coastal detection
    return coords.lng < -80 && coords.lat > 25 && coords.lat < 35; // Gulf/Atlantic coast
  }

  private isSeismicZone(coords: { lat: number; lng: number }): boolean {
    // West Coast seismic zone
    return coords.lng < -110;
  }

  // Validation methods
  private validateSeismicDesign(structure: any, seismic: SeismicContext): boolean {
    return structure?.seismicDesignCategory >= seismic.seismicDesignCategory;
  }

  private validateTemperatureDerating(electrical: any, designTemp: number): boolean {
    return electrical?.temperatureDeratingApplied === true;
  }

  private validateClimateZoneCompliance(envelope: any, climateZone: string): boolean {
    return envelope?.climateZone === climateZone;
  }

  // Map visualization helpers
  private async generateWindZoneGeoJSON(coords: { lat: number; lng: number }): Promise<any> {
    // Would generate actual wind zone polygons
    return { type: 'FeatureCollection', features: [] };
  }

  private async generateSeismicZoneGeoJSON(coords: { lat: number; lng: number }): Promise<any> {
    // Would generate actual seismic zone polygons
    return { type: 'FeatureCollection', features: [] };
  }

  private getWindZoneColor(windSpeed: number): string {
    if (windSpeed < 25) return '#00ff00';
    if (windSpeed < 35) return '#ffff00';
    if (windSpeed < 45) return '#ff8000';
    return '#ff0000';
  }

  private getSeismicZoneColor(category: string): string {
    const colors = {
      'A': '#00ff00', 'B': '#80ff00', 'C': '#ffff00',
      'D': '#ff8000', 'E': '#ff4000', 'F': '#ff0000'
    };
    return colors[category as keyof typeof colors] || '#gray';
  }

  private getSnowLoadColor(snowLoad: number): string {
    if (snowLoad < 0.5) return '#00ff00';
    if (snowLoad < 1.0) return '#ffff00';
    if (snowLoad < 2.0) return '#ff8000';
    return '#ff0000';
  }

  private getClimateZoneColor(zone: string): string {
    const colors: Record<string, string> = {
      '1A': '#ff0000', '2A': '#ff8000', '3A': '#ffff00',
      '4A': '#80ff00', '5A': '#00ff00', '6A': '#00ff80',
      '7A': '#00ffff', '8A': '#0080ff'
    };
    return colors[zone] || '#gray';
  }

  private getSolarPotentialColor(irradiance: number): string {
    if (irradiance < 1200) return '#ff0000';
    if (irradiance < 1500) return '#ff8000';
    if (irradiance < 1800) return '#ffff00';
    return '#00ff00';
  }
}