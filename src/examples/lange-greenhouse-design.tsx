'use client';

import React, { useState } from 'react';
import { ComprehensiveFacilityDesigner } from '@/components/facility/ComprehensiveFacilityDesigner';
import { ComprehensiveFacilityReportBuilder } from '@/components/reports/ComprehensiveFacilityReportBuilder';

// Lange Group Greenhouse Configuration based on Rough Brothers Proposal
const langeGreenhouseConfig = {
  projectInfo: {
    name: "Lange Group Commercial Greenhouse Facility",
    client: "Lange Group",
    location: "Brochton, Illinois 61617",
    date: new Date().toISOString(),
    proposalNumber: "VLX-16375-01",
    designer: "Vibelux Design System"
  },
  
  // 5 Gutter Connected Venlo Greenhouses
  structures: Array(5).fill(null).map((_, index) => ({
    id: `greenhouse-${index + 1}`,
    type: 'greenhouse',
    style: 'venlo',
    dimensions: {
      length: 170.6, // 52m = 170.6 ft
      width: 31.5,   // 9.6m = 31.5 ft
      height: 18,    // 18 ft gutter height as specified
      ridgeHeight: 24 // Estimated
    },
    structure: {
      frame: 'aluminum',
      glazing: 'glass',
      glassType: 'tempered_diffused',
      hazeFactor: 50,
      roofType: 'venlo',
      peaks: 3,
      peakWidth: 10.5, // 3.2m = 10.5 ft
      gutterPitch: 0.002, // 0.2%
      energyTrusses: {
        spacing: 13.125, // 13'1.5" centers
        depth: 24,
        height: 5.75 // Below gutter
      }
    },
    ventilation: {
      roofVents: {
        zones: 4,
        type: '3-hinged',
        width: 3.33, // 40" down slope
        length: 9,   // 108" along ridge
        mechanism: 'rack_and_pinion',
        motors: 8,   // Ridder motors
        alternating: true
      },
      insectNetting: {
        type: 'Ludvig Svensson Econet 4045',
        pests: [
          'Serpentine Leafminer',
          'Asian Citrus Psyllid',
          'Green Peach Aphid',
          'Melon Aphid',
          'Greenhouse Whitefly',
          'Silverleaf Whitefly'
        ]
      }
    },
    walls: {
      gables: {
        material: '2_inch_insulated_panel',
        glazing: '4mm_glass',
        kneeWallHeight: 1 // 12"
      },
      sidewalls: {
        material: '2_inch_insulated_panel',
        glazing: 'corrugated_polycarbonate'
      }
    },
    doors: {
      passage: [
        { type: 'vistawall_glass', size: '3x7', location: 'vegetative_gable' },
        { type: 'ceco_steel_insulated', size: '3.5x7', count: 9, ada: true }
      ],
      overhead: [
        { type: 'coil_door', size: '5x5.25', location: 'partition', count: 3 },
        { type: 'coil_door', size: '14x5.25', location: 'gables', count: 2 },
        { type: 'insulated_rollup', size: '8x8', location: 'headhouse' }
      ]
    }
  })),

  // HVAC System Configuration
  hvacSystem: {
    heating: {
      boilers: [
        {
          manufacturer: 'RBI',
          model: 'Futera III MB2500',
          quantity: 2,
          type: 'high_efficiency_pressurized',
          fuel: 'natural_gas',
          controls: '8-stage_controller',
          features: ['Modulating', 'Copper ASME Heat Exchanger', 'CSD-1 Code']
        }
      ],
      finTube: [
        {
          type: 'Delta Fin TF2',
          capacity: 1374720, // BTU/hr
          coverage: 0.39, // 39% of heat load
          length: 10080, // linear feet
          diameter: 0.875, // 7/8" OD
          location: 'under_bench'
        },
        {
          type: 'Delta Fin SF125',
          capacity: 3830682, // BTU/hr
          coverage: 1.09, // 109% of heat load
          length: 5594,
          diameter: 1.25,
          location: 'perimeter_and_gutter'
        }
      ],
      unitHeaters: {
        manufacturer: 'Sterling',
        model: 'HS Series Hot Water',
        quantity: 2
      },
      zones: 16,
      pumps: 3,
      vfd: 3
    },
    cooling: {
      chiller: {
        manufacturer: 'AWS',
        model: '290 Air Cooled',
        quantity: 1,
        type: 'screw_chiller'
      },
      fanCoils: {
        manufacturer: 'Sigma',
        model: 'Overhead Fan Coil',
        quantity: 67,
        features: ['Galvanized cabinet', 'Dual fans', 'Chilled water coil']
      },
      zones: 5,
      pumps: 6
    },
    airMovement: {
      hafFans: {
        manufacturer: 'Dramm',
        model: 'AME 400/4',
        quantity: 30,
        power: 330, // watts
        features: [
          'Increased Efficiency',
          'Speed Regulation',
          'Low Maintenance',
          'Anti-Corrosion Design',
          'Thermal Overload Protection'
        ]
      }
    }
  },

  // Shade and Energy Curtain Systems
  curtainSystems: {
    shade: {
      material: 'HARMONY 4515 O FR',
      zones: 4,
      features: {
        shading: 45, // % in direct light
        energySaving: 15, // %
        flameRetardant: true,
        system: 'push_pull',
        drive: 'rack_and_pinion'
      }
    },
    blackout: {
      material: 'OBSCURA 10070 FR WB+BW',
      zones: 3,
      features: {
        shading: 100, // %
        energySaving: 70, // %
        flameRetardant: true,
        system: 'push_pull'
      },
      partitionWalls: {
        quantity: 2,
        motors: 8,
        type: 'RB50_tube_motors'
      }
    }
  },

  // Environmental Controls - Priva System
  automationSystem: {
    manufacturer: 'Priva',
    components: [
      'Priva Office for Windows',
      'Priva Connext',
      'Priva Neutralizer',
      'Priva NutriJet'
    ],
    features: [
      'Complete climate control',
      'Boiler and CHP management',
      'Screen control',
      'CO2 management',
      'Lighting control',
      'Irrigation and fertigation'
    ]
  },

  // Irrigation System
  irrigationSystem: {
    waterStorage: {
      freshWater: {
        capacity: 7000, // gallons
        diameter: 144, // inches
        height: 142,
        material: 'FDA_polyethylene'
      },
      propagation: {
        capacity: 200,
        diameter: 31,
        height: 72
      },
      batchTanks: [
        { capacity: 7000, quantity: 2, type: 'subgrade_concrete' },
        { capacity: 4000, quantity: 2, type: 'subgrade_concrete' }
      ]
    },
    nutrientInjection: {
      neutralizer: {
        type: 'Priva Neutralizer',
        features: [
          'Bicarbonate removal',
          'Acid dosing 40L/hr',
          'Cross flow mixer',
          'CO2 degassing'
        ]
      },
      fertilizer: {
        type: 'Priva NutriJet',
        capacity: 50, // GPM
        channels: 3,
        features: ['Dual EC/pH measurement', 'Optical flow meter', 'VFD pump']
      }
    },
    pumps: [
      { capacity: 60, pressure: 20, type: 'Ebarra Submersible', quantity: 2 },
      { capacity: 110, pressure: 20, type: 'Ebarra Submersible', quantity: 2 }
    ]
  },

  // Supplemental Lighting System
  lightingSystem: {
    fixtures: {
      manufacturer: 'GAN',
      model: 'Electronic 1000W',
      voltage: 480,
      phase: 3,
      bulbs: 'Philips Green Power 1000W/400V EL HPS',
      distribution: {
        zone1: 147, // Mothers & Vegetative
        zone2: 420, // Flower 1
        zone3: 420  // Flower 2
      },
      totalCount: 987
    },
    reflectors: {
      standard: { type: 'GAN Ecomax', quantity: 850 },
      asymmetric: { type: 'Asymmetric Ecomax', quantity: 132 }
    },
    mounting: {
      height: 14.5, // feet above floor
      brackets: 'truss_mounted',
      chords: '72_inch'
    }
  },

  // Material Handling Equipment
  materialHandling: {
    pottingMachine: {
      model: 'DPM 10',
      capacity: {
        potSizes: '2.5-10.5 inches',
        soilHopper: 2.5, // cubic yards
        potsPerHour: 4000
      }
    },
    wateringTunnel: {
      capacity: '17.5 inch wide x 31.5 inch tall',
      speed: 'Variable up to 80 ft/min',
      length: 7, // feet
      curtains: 4
    },
    conveyors: {
      type: 'Aluminum frame roller bed',
      features: ['Variable speed', 'Emergency stop', 'Folding stations']
    }
  },

  // Benching Systems
  benchingSystems: {
    rollingBenches: {
      quantity: 310,
      dimensions: {
        length: 13.5, // feet
        width: 4, // feet
      },
      material: 'aluminum',
      bottom: 'ebb_and_flood',
      loading: 100, // kg/m²
    },
    gutterSystem: {
      type: 'Meteor GM-15',
      width: 340, // mm inside
      runs: 6,
      length: 78.75, // feet per run
      material: 'galvanized_epoxy'
    }
  },

  // Total Project Summary
  projectSummary: {
    totalArea: 26847.5, // sq ft (5 houses x 5369.5 sq ft each)
    contractAmount: 3097186, // USD
    deliveryTerms: 'FOB source',
    engineeringDrawings: 'Stamped structural drawings for Illinois',
    installation: 'Customer labor with RB foreman supervision'
  }
};

export default function LangeGreenhouseDesign() {
  const [showReport, setShowReport] = useState(false);
  const [facilityData, setFacilityData] = useState(null);

  const handleDesignComplete = (data: any) => {
    setFacilityData(data);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {!showReport ? (
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Lange Group Greenhouse Facility Design
            </h1>
            <p className="text-gray-400">
              5 Gutter-Connected Venlo Greenhouses - 26,847 sq ft Total
            </p>
          </div>
          
          <ComprehensiveFacilityDesigner
            initialConfig={{
              type: 'greenhouse',
              dimensions: { 
                length: langeGreenhouseConfig.structures[0].dimensions.length * 5,
                width: langeGreenhouseConfig.structures[0].dimensions.width,
                height: langeGreenhouseConfig.structures[0].dimensions.height
              },
              structure: {
                frame: 'aluminum',
                glazing: 'glass',
                roofType: 'venlo'
              },
              systems: {
                irrigation: true,
                hvac: true,
                automation: true,
                lighting: true,
                co2: true
              }
            }}
            onConfigChange={handleDesignComplete}
          />
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setShowReport(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Professional Report
            </button>
          </div>
        </div>
      ) : (
        <ComprehensiveFacilityReportBuilder
          facilityData={facilityData || langeGreenhouseConfig}
          projectInfo={langeGreenhouseConfig.projectInfo}
        />
      )}
    </div>
  );
}