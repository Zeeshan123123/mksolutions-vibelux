// Mapbox configuration for VibeLux
import { isBrowser } from './browser-check';
import { logger } from '@/lib/logging/production-logger';
// DOMPurify removed - not critical for build

// Only import mapbox-gl in browser environment
let mapboxgl: any;
if (isBrowser) {
  mapboxgl = require('mapbox-gl');
  require('mapbox-gl/dist/mapbox-gl.css');
  
  // Set the access token
  if (mapboxgl && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  }
}

// VibeLux brand colors for map styling
export const VIBELUX_MAP_COLORS = {
  primary: '#8b5cf6', // Purple
  secondary: '#3b82f6', // Blue
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  dark: '#1f2937',
  light: '#f3f4f6'
};

// Map styles
export const MAP_STYLES = {
  // Clean, modern style for facility visualization
  vibelux_light: 'mapbox://styles/mapbox/light-v11',
  vibelux_dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12'
};

// Default map settings - satellite for enhanced demos and site analysis
export const DEFAULT_MAP_CONFIG = {
  style: MAP_STYLES.satellite, // Changed to satellite for enhanced demos
  center: [-98.5795, 39.8283] as [number, number], // Center of USA
  zoom: 4,
  pitch: 0,
  bearing: 0,
  antialias: true,
  attributionControl: false
};

// Marker icons for different facility types
export const FACILITY_ICONS = {
  indoor: {
    icon: '🏢',
    color: VIBELUX_MAP_COLORS.primary,
    size: 'large'
  },
  greenhouse: {
    icon: '🌿',
    color: VIBELUX_MAP_COLORS.success,
    size: 'large'
  },
  vertical: {
    icon: '🏗️',
    color: VIBELUX_MAP_COLORS.secondary,
    size: 'large'
  },
  supplier: {
    icon: '📦',
    color: VIBELUX_MAP_COLORS.warning,
    size: 'medium'
  },
  retail: {
    icon: '🛒',
    color: VIBELUX_MAP_COLORS.danger,
    size: 'medium'
  }
};

// Climate zone overlays
export const CLIMATE_ZONES = {
  optimal: {
    color: VIBELUX_MAP_COLORS.success,
    opacity: 0.3,
    name: 'Optimal Growing Zone'
  },
  moderate: {
    color: VIBELUX_MAP_COLORS.warning,
    opacity: 0.3,
    name: 'Moderate Growing Zone'
  },
  challenging: {
    color: VIBELUX_MAP_COLORS.danger,
    opacity: 0.3,
    name: 'Challenging Growing Zone'
  }
};

// Geocoding service wrapper
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
    
    return null;
  } catch (error) {
    logger.error('api', 'Geocoding error:', error );
    return null;
  }
}

// Calculate distance between two points
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const R = 3959; // Earth's radius in miles
  const lat1Rad = point1[1] * Math.PI / 180;
  const lat2Rad = point2[1] * Math.PI / 180;
  const deltaLat = (point2[1] - point1[1]) * Math.PI / 180;
  const deltaLon = (point2[0] - point1[0]) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
}

// Find nearest facilities/suppliers
export function findNearestLocations(
  userLocation: [number, number],
  locations: Array<{ coordinates: [number, number]; [key: string]: any }>,
  maxDistance?: number
): Array<{ distance: number; location: any }> {
  const results = locations
    .map(location => ({
      distance: calculateDistance(userLocation, location.coordinates),
      location
    }))
    .filter(result => !maxDistance || result.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
  
  return results;
}

// Create custom map marker
export function createCustomMarker(
  type: keyof typeof FACILITY_ICONS,
  coordinates: [number, number],
  properties?: any
): mapboxgl.Marker {
  const config = FACILITY_ICONS[type];
  
  // Create custom marker element
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.width = config.size === 'large' ? '40px' : '30px';
  el.style.height = config.size === 'large' ? '40px' : '30px';
  el.style.backgroundColor = config.color;
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.fontSize = config.size === 'large' ? '20px' : '16px';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  // Set icon content - simplified without DOMPurify
  el.textContent = config.icon;
  
  // Add hover effect
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.1)';
    el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
  });
  
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  });
  
  const marker = new mapboxgl.Marker(el)
    .setLngLat(coordinates);
  
  if (properties) {
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="mapbox-popup">
          <h3 class="font-bold text-gray-900">${properties.name || 'Location'}</h3>
          ${properties.address ? `<p class="text-sm text-gray-600">${properties.address}</p>` : ''}
          ${properties.description ? `<p class="text-sm mt-2">${properties.description}</p>` : ''}
        </div>
      `);
    marker.setPopup(popup);
  }
  
  return marker;
}

// Measurement tools for site analysis
export class MapMeasurementTools {
  private map: any;
  private geojson: any;
  private lineString: any;

  constructor(map: any) {
    this.map = map;
    this.geojson = {
      type: 'FeatureCollection',
      features: []
    };
    this.lineString = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };
    this.initializeMeasurementLayer();
  }

  private initializeMeasurementLayer() {
    if (!this.map.getSource('measurement-source')) {
      this.map.addSource('measurement-source', {
        type: 'geojson',
        data: this.geojson
      });

      this.map.addLayer({
        id: 'measurement-line',
        type: 'line',
        source: 'measurement-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': VIBELUX_MAP_COLORS.primary,
          'line-width': 3
        },
        filter: ['==', '$type', 'LineString']
      });

      this.map.addLayer({
        id: 'measurement-points',
        type: 'circle',
        source: 'measurement-source',
        paint: {
          'circle-radius': 6,
          'circle-color': VIBELUX_MAP_COLORS.primary,
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2
        },
        filter: ['==', '$type', 'Point']
      });
    }
  }

  public startMeasurement() {
    this.map.getCanvas().style.cursor = 'crosshair';
    this.geojson.features = [];
    this.lineString.geometry.coordinates = [];
    this.map.getSource('measurement-source').setData(this.geojson);

    this.map.on('click', this.onMapClick.bind(this));
    this.map.on('mousemove', this.onMouseMove.bind(this));
  }

  public stopMeasurement() {
    this.map.getCanvas().style.cursor = '';
    this.map.off('click', this.onMapClick.bind(this));
    this.map.off('mousemove', this.onMouseMove.bind(this));
  }

  private onMapClick(e: any) {
    const coords = [e.lngLat.lng, e.lngLat.lat];
    
    // Add measurement point
    const point = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coords
      },
      properties: {
        id: String(new Date().getTime())
      }
    };

    this.geojson.features.push(point);
    this.lineString.geometry.coordinates.push(coords);

    if (this.lineString.geometry.coordinates.length > 1) {
      this.geojson.features.push(this.lineString);
      
      // Calculate distance
      const distance = this.calculateLineDistance();
      
      // Add distance label
      const midpoint = this.getMidpoint();
      const label = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: midpoint
        },
        properties: {
          distance: distance,
          id: 'distance-label'
        }
      };
      
      this.geojson.features.push(label);
    }

    this.map.getSource('measurement-source').setData(this.geojson);
  }

  private onMouseMove(e: any) {
    if (this.lineString.geometry.coordinates.length > 0) {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      this.lineString.geometry.coordinates[this.lineString.geometry.coordinates.length] = coords;
      this.map.getSource('measurement-source').setData(this.geojson);
    }
  }

  private calculateLineDistance(): number {
    let distance = 0;
    for (let i = 0; i < this.lineString.geometry.coordinates.length - 1; i++) {
      distance += calculateDistance(
        this.lineString.geometry.coordinates[i],
        this.lineString.geometry.coordinates[i + 1]
      );
    }
    return Math.round(distance * 5280); // Convert to feet
  }

  private getMidpoint(): [number, number] {
    const coords = this.lineString.geometry.coordinates;
    const midIndex = Math.floor(coords.length / 2);
    return coords[midIndex];
  }

  public clearMeasurements() {
    this.geojson.features = [];
    this.lineString.geometry.coordinates = [];
    this.map.getSource('measurement-source').setData(this.geojson);
  }

  public getLastMeasurement(): { distance: number; area?: number } | null {
    if (this.lineString.geometry.coordinates.length < 2) return null;
    
    return {
      distance: this.calculateLineDistance()
    };
  }
}

// Shadow analysis for solar calculations
export function addShadowAnalysis(map: any, buildingHeight: number = 30) {
  const now = new Date();
  const sunPosition = calculateSunPosition(
    DEFAULT_MAP_CONFIG.center[1], // latitude
    DEFAULT_MAP_CONFIG.center[0], // longitude
    now
  );

  // Calculate shadow length based on sun angle
  const shadowLength = buildingHeight / Math.tan(sunPosition.elevation * Math.PI / 180);
  
  return {
    shadowLength,
    shadowDirection: sunPosition.azimuth,
    sunElevation: sunPosition.elevation
  };
}

// Simple sun position calculation
function calculateSunPosition(lat: number, lng: number, date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Simplified solar position calculation
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const hourAngle = 15 * (hour - 12);
  
  const elevation = Math.asin(
    Math.sin(declination * Math.PI / 180) * Math.sin(lat * Math.PI / 180) +
    Math.cos(declination * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
  ) * 180 / Math.PI;
  
  const azimuth = Math.atan2(
    Math.sin(hourAngle * Math.PI / 180),
    Math.cos(hourAngle * Math.PI / 180) * Math.sin(lat * Math.PI / 180) - Math.tan(declination * Math.PI / 180) * Math.cos(lat * Math.PI / 180)
  ) * 180 / Math.PI;
  
  return { elevation, azimuth };
}

// Export mapbox instance
export { mapboxgl };