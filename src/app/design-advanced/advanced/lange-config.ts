// Lange Group Greenhouse Configuration for Vibelux Advanced Design
export const langeGreenhouseConfig = {
  // Facility Overview
  facilityName: "Lange Group Commercial Greenhouse",
  location: "Brochton, Illinois 61617",
  totalArea: 26847.5, // sq ft
  
  // Structure Configuration - 5 Venlo Greenhouses
  structures: {
    count: 5,
    type: 'venlo',
    dimensions: {
      length: 170.6, // 52m in feet
      width: 31.5,   // 9.6m in feet
      gutterHeight: 18,
      ridgeHeight: 24
    },
    construction: {
      frame: 'aluminum',
      glazing: 'glass',
      glassType: 'tempered_diffused',
      hazeFactor: 50,
      peaks: 3,
      baySpacing: 13.125, // 13'1.5"
      gutterPitch: 0.002
    },
    ventilation: {
      roofVents: {
        zones: 4,
        type: '3-hinged',
        size: { width: 40, length: 108 }, // inches
        mechanism: 'rack_and_pinion',
        motors: 8
      },
      screening: 'Ludvig Svensson Econet 4045'
    }
  },
  
  // HVAC Configuration
  hvac: {
    heating: {
      boilers: {
        model: 'RBI Futera III MB2500',
        quantity: 2,
        fuel: 'natural_gas',
        capacity: 2500000 // BTU
      },
      distribution: {
        underBench: {
          type: 'Delta Fin TF2',
          length: 10080, // linear feet
          capacity: 1374720 // BTU/hr
        },
        perimeter: {
          type: 'Delta Fin SF125',
          length: 5594,
          capacity: 3830682
        }
      },
      zones: 16
    },
    cooling: {
      chiller: {
        model: 'AWS 290',
        type: 'air_cooled_screw',
        quantity: 1
      },
      fanCoils: {
        model: 'Sigma Overhead',
        quantity: 67
      },
      hafFans: {
        model: 'Dramm AME 400/4',
        quantity: 30,
        power: 330 // watts
      }
    }
  },
  
  // Irrigation System
  irrigation: {
    waterStorage: {
      freshWater: 7000, // gallons
      propagation: 200,
      batchTanks: [
        { capacity: 7000, quantity: 2 },
        { capacity: 4000, quantity: 2 }
      ]
    },
    treatment: {
      neutralizer: {
        type: 'Priva Neutralizer',
        acidDosing: 40 // L/hr
      },
      nutrientInjection: {
        type: 'Priva NutriJet',
        capacity: 50, // GPM
        channels: 3
      }
    },
    pumps: {
      submersible: [
        { capacity: 60, quantity: 2 },
        { capacity: 110, quantity: 2 }
      ]
    }
  },
  
  // Lighting System
  lighting: {
    fixtures: {
      type: 'GAN Electronic 1000W',
      voltage: 480,
      phase: 3,
      bulbs: 'Philips Green Power 1000W/400V',
      total: 987
    },
    distribution: {
      zone1_veg: 147,
      zone2_flower: 420,
      zone3_flower: 420
    },
    reflectors: {
      standard: 850,
      asymmetric: 132
    },
    mountingHeight: 14.5 // feet
  },
  
  // Automation
  automation: {
    system: 'Priva',
    components: [
      'Priva Office',
      'Priva Connext',
      'Climate Control',
      'Irrigation Control',
      'Screen Control'
    ]
  },
  
  // Screening Systems
  screening: {
    shade: {
      material: 'HARMONY 4515 O FR',
      shading: 45, // percent
      zones: 4
    },
    blackout: {
      material: 'OBSCURA 10070 FR WB+BW',
      shading: 100,
      zones: 3,
      partitionWalls: 2
    }
  },
  
  // Benching
  benching: {
    rollingBenches: {
      quantity: 310,
      size: { length: 13.5, width: 4 }, // feet
      material: 'aluminum',
      type: 'ebb_and_flood'
    },
    gutterSystem: {
      type: 'Meteor GM-15',
      runs: 6,
      length: 78.75 // feet per run
    }
  },
  
  // Material Handling
  equipment: {
    pottingMachine: {
      model: 'DPM 10',
      capacity: 4000 // pots/hour
    },
    wateringTunnel: {
      length: 7, // feet
      speed: 80 // ft/min max
    }
  }
};

// Export for use in advanced design page
export default langeGreenhouseConfig;