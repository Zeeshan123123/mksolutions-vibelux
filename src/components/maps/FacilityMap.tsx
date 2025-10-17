'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, Search, Navigation, Layers, 
  Building, Package, TrendingUp, Filter
} from 'lucide-react';
import {
  DEFAULT_MAP_CONFIG,
  MAP_STYLES,
  createCustomMarker,
  geocodeAddress,
  findNearestLocations,
  FACILITY_ICONS
} from '@/lib/mapbox-config';

interface Facility {
  id: string;
  name: string;
  type: 'indoor' | 'greenhouse' | 'vertical' | 'supplier' | 'retail';
  coordinates: [number, number];
  address?: string;
  size?: number; // sq ft
  crops?: string[];
  certifications?: string[];
  description?: string;
}

interface FacilityMapProps {
  facilities?: Facility[];
  showSuppliers?: boolean;
  onFacilityClick?: (facility: Facility) => void;
  height?: string;
}

export function FacilityMap({ 
  facilities = [], 
  showSuppliers = true,
  onFacilityClick,
  height = '600px'
}: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.vibelux_dark);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...DEFAULT_MAP_CONFIG,
      style: mapStyle
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(coords);
          
          // Add user location marker
          new mapboxgl.Marker({
            color: '#8b5cf6'
          })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML('<p>Your Location</p>'))
            .addTo(map.current!);
        },
        (error) => {
          logger.info('system', 'Geolocation error:', { data: error  });
        }
      );
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  // Add facilities to map
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter facilities
    const filteredFacilities = facilities.filter(facility => {
      if (!showSuppliers && (facility.type === 'supplier' || facility.type === 'retail')) {
        return false;
      }
      if (selectedType && facility.type !== selectedType) {
        return false;
      }
      return true;
    });

    // Add markers for each facility
    filteredFacilities.forEach(facility => {
      const marker = createCustomMarker(
        facility.type,
        facility.coordinates,
        {
          name: facility.name,
          address: facility.address,
          description: `${facility.type === 'supplier' ? 'Equipment Supplier' : 'Growing Facility'}${
            facility.size ? ` • ${facility.size.toLocaleString()} sq ft` : ''
          }${facility.crops ? ` • ${facility.crops.join(', ')}` : ''}`
        }
      );

      marker.addTo(map.current!);
      markers.current.push(marker);

      // Handle click event
      marker.getElement().addEventListener('click', () => {
        onFacilityClick?.(facility);
      });
    });

    // Fit map to show all markers
    if (filteredFacilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredFacilities.forEach(facility => {
        bounds.extend(facility.coordinates);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [facilities, showSuppliers, selectedType, onFacilityClick]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery || !map.current) return;

    const coordinates = await geocodeAddress(searchQuery);
    if (coordinates) {
      map.current.flyTo({
        center: coordinates,
        zoom: 12,
        duration: 2000
      });

      // Add search result marker
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<p>${searchQuery}</p>`))
        .addTo(map.current);
    }
  };

  // Find nearest facilities
  const findNearest = () => {
    if (!userLocation) {
      alert('Please enable location services to find nearest facilities');
      return;
    }

    const nearest = findNearestLocations(userLocation, facilities, 50); // Within 50 miles
    
    if (nearest.length > 0) {
      // Zoom to nearest facility
      map.current?.flyTo({
        center: nearest[0].location.coordinates,
        zoom: 10,
        duration: 2000
      });
    }
  };

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        {/* Search Box */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-400 mb-2">Filter by Type</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                !selectedType ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Locations
            </button>
            <button
              onClick={() => setSelectedType('indoor')}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                selectedType === 'indoor' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Indoor Facilities
            </button>
            <button
              onClick={() => setSelectedType('greenhouse')}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                selectedType === 'greenhouse' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Greenhouses
            </button>
            {showSuppliers && (
              <button
                onClick={() => setSelectedType('supplier')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedType === 'supplier' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Suppliers
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <button
            onClick={findNearest}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Find Nearest
          </button>
        </div>
      </div>

      {/* Map Style Switcher */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 shadow-lg flex gap-1">
          <button
            onClick={() => setMapStyle(MAP_STYLES.vibelux_dark)}
            className={`p-2 rounded transition-colors ${
              mapStyle === MAP_STYLES.vibelux_dark ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Dark Mode"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapStyle(MAP_STYLES.vibelux_light)}
            className={`p-2 rounded transition-colors ${
              mapStyle === MAP_STYLES.vibelux_light ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Light Mode"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapStyle(MAP_STYLES.satellite)}
            className={`p-2 rounded transition-colors ${
              mapStyle === MAP_STYLES.satellite ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Satellite"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg"
        style={{ height }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-2">Facility Types</p>
        <div className="space-y-1">
          {Object.entries(FACILITY_ICONS)
            .filter(([key]) => showSuppliers || (key !== 'supplier' && key !== 'retail'))
            .map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <span className="text-xs text-gray-300 capitalize">{key}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Import required for Globe icon
import { Globe } from 'lucide-react';
import { logger } from '@/lib/client-logger';