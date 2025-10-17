'use client';

import { useState } from 'react';
import { FacilityMap } from '@/components/maps/FacilityMap';
import { 
  MapPin, TrendingUp, Users, Package, 
  Building, Info, ExternalLink, Star
} from 'lucide-react';
import Link from 'next/link';

// Demo facilities data
const DEMO_FACILITIES = [
  {
    id: '1',
    name: 'VibeLux Demo Facility',
    type: 'indoor' as const,
    coordinates: [-122.4194, 37.7749] as [number, number], // San Francisco
    address: '123 Market St, San Francisco, CA 94105',
    size: 50000,
    crops: ['Cannabis', 'Herbs'],
    certifications: ['GACP', 'Organic']
  },
  {
    id: '2',
    name: 'Green Valley Greenhouse',
    type: 'greenhouse' as const,
    coordinates: [-73.935242, 40.730610] as [number, number], // New York
    address: '456 Green St, Brooklyn, NY 11222',
    size: 75000,
    crops: ['Tomatoes', 'Peppers', 'Cucumbers'],
    certifications: ['USDA Organic']
  },
  {
    id: '3',
    name: 'Urban Vertical Farms',
    type: 'vertical' as const,
    coordinates: [-87.629798, 41.878114] as [number, number], // Chicago
    address: '789 Tower Ave, Chicago, IL 60601',
    size: 25000,
    crops: ['Leafy Greens', 'Microgreens'],
    certifications: ['SQF', 'GFSI']
  },
  {
    id: '4',
    name: 'Hydro Equipment Supply',
    type: 'supplier' as const,
    coordinates: [-118.2437, 34.0522] as [number, number], // Los Angeles
    address: '321 Supply Blvd, Los Angeles, CA 90001',
    description: 'Full-service hydroponic equipment supplier'
  },
  {
    id: '5',
    name: 'Rocky Mountain Grows',
    type: 'indoor' as const,
    coordinates: [-104.990251, 39.739236] as [number, number], // Denver
    address: '555 High St, Denver, CO 80202',
    size: 100000,
    crops: ['Cannabis'],
    certifications: ['GMP', 'ISO 9001']
  },
  {
    id: '6',
    name: 'Southeast AgTech Supply',
    type: 'supplier' as const,
    coordinates: [-84.3880, 33.7490] as [number, number], // Atlanta
    address: '999 Tech Way, Atlanta, GA 30301',
    description: 'Advanced growing technology and automation'
  }
];

export default function FacilityMapPage() {
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showSuppliers, setShowSuppliers] = useState(true);

  // Calculate statistics
  const totalFacilities = DEMO_FACILITIES.filter(f => f.type !== 'supplier').length;
  const totalSqFt = DEMO_FACILITIES
    .filter(f => f.size)
    .reduce((sum, f) => sum + (f.size || 0), 0);
  const totalSuppliers = DEMO_FACILITIES.filter(f => f.type === 'supplier').length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Facility Network Map</h1>
              <p className="text-gray-400">
                Explore VibeLux-powered growing facilities and equipment suppliers across the country
              </p>
            </div>
            <Link
              href="/facilities/add"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your Facility
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Building className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{totalFacilities}</span>
              </div>
              <p className="text-sm text-gray-400">Active Facilities</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {(totalSqFt / 1000).toFixed(0)}K
                </span>
              </div>
              <p className="text-sm text-gray-400">Total Sq Ft</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">{totalSuppliers}</span>
              </div>
              <p className="text-sm text-gray-400">Equipment Suppliers</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">2.5K+</span>
              </div>
              <p className="text-sm text-gray-400">Active Growers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Interactive Map</h2>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showSuppliers}
                      onChange={(e) => setShowSuppliers(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Show Suppliers</span>
                  </label>
                </div>
              </div>
              
              <FacilityMap
                facilities={DEMO_FACILITIES}
                showSuppliers={showSuppliers}
                onFacilityClick={setSelectedFacility}
                height="600px"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Facility Details */}
            {selectedFacility ? (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {selectedFacility.name}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">{selectedFacility.address}</p>
                    </div>
                  </div>
                  
                  {selectedFacility.size && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-300">
                        {selectedFacility.size.toLocaleString()} sq ft
                      </p>
                    </div>
                  )}
                  
                  {selectedFacility.crops && (
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Crops:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedFacility.crops.map((crop: string) => (
                            <span
                              key={crop}
                              className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedFacility.certifications && (
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedFacility.certifications.map((cert: string) => (
                            <span
                              key={cert}
                              className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Contact Facility
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <p className="text-gray-400 text-center">
                  Click on a facility marker to view details
                </p>
              </div>
            )}

            {/* Add Your Facility CTA */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-800/30">
              <h3 className="text-lg font-semibold text-white mb-2">
                Add Your Facility
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Join the VibeLux network and showcase your growing operation to the community
              </p>
              <Link
                href="/facilities/add"
                className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Get Listed
              </Link>
            </div>

            {/* Equipment Suppliers */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Featured Suppliers
              </h3>
              <div className="space-y-3">
                {DEMO_FACILITIES
                  .filter(f => f.type === 'supplier')
                  .map(supplier => (
                    <div
                      key={supplier.id}
                      className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedFacility(supplier)}
                    >
                      <h4 className="text-white font-medium">{supplier.name}</h4>
                      <p className="text-sm text-gray-400">{supplier.address?.split(',')[1]}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}