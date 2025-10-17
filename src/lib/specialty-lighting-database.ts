// Specialty lighting database for controlled environment agriculture
// Includes UV lights, far-red, green work lights, and supplemental lighting

export interface SpecialtyLight {
  id: string;
  manufacturer: string;
  model: string;
  category: 'UV-A' | 'UV-B' | 'UV-C' | 'FarRed' | 'Green' | 'Intracanopy' | 'Photoperiod' | 'Supplemental';
  type: 'LED' | 'Fluorescent' | 'HID' | 'Germicidal';
  specifications: {
    wattage: number;
    ppf?: number; // µmol/s for photosynthetic lights
    uvOutput?: number; // mW/cm² for UV lights
    wavelengthPeak: number; // nm
    wavelengthRange?: { min: number; max: number }; // nm
    beamAngle?: number; // degrees
    lifespan: number; // hours
  };
  electrical: {
    voltage: number;
    amps: number;
    powerFactor?: number;
    thd?: number; // %
  };
  physical: {
    width: number; // inches
    height: number;
    length: number;
    weight: number; // lbs
    cooling: 'Passive' | 'Active' | 'Water';
  };
  features: string[];
  safety?: {
    uvClass?: 'Class 1' | 'Class 2' | 'Class 3';
    eyeProtection: boolean;
    skinProtection: boolean;
    ozoneProduction: boolean;
  };
  mounting: 'Hanging' | 'Surface' | 'Rail' | 'Stand';
  price?: number;
  certifications?: string[];
}

export const specialtyLightCategories = {
  'UV-A': {
    name: 'UV-A Lights (315-400nm)',
    description: 'Stress response and secondary metabolite production',
    icon: 'sun',
    pros: ['Enhanced flavonoids', 'Pest deterrence', 'Safe exposure', 'Quality improvement'],
    cons: ['Additional cost', 'Heat generation', 'Limited penetration']
  },
  'UV-B': {
    name: 'UV-B Lights (280-315nm)',
    description: 'Controlled stress for enhanced cannabinoid/terpene production',
    icon: 'alert-triangle',
    pros: ['Increased THC/CBD', 'Enhanced terpenes', 'Pathogen control', 'Compact growth'],
    cons: ['Safety hazards', 'DNA damage risk', 'Requires monitoring', 'Short exposure only']
  },
  'UV-C': {
    name: 'UV-C Germicidal (200-280nm)',
    description: 'Pathogen control and sterilization',
    icon: 'shield',
    pros: ['Kills pathogens', 'Mold prevention', 'Air/surface sterilization', 'Chemical-free'],
    cons: ['Extremely dangerous', 'No plant exposure', 'Ozone production', 'Special handling']
  },
  'FarRed': {
    name: 'Far-Red Lights (700-800nm)',
    description: 'Flowering triggers and shade avoidance responses',
    icon: 'sunset',
    pros: ['Flowering control', 'Stem elongation', 'Emerson effect', 'Sleep induction'],
    cons: ['Stretching risk', 'Timing critical', 'Limited models']
  },
  'Green': {
    name: 'Green Work Lights',
    description: 'Safe lighting for dark period work',
    icon: 'eye',
    pros: ['No photoperiod disruption', 'Safe for work', 'Good visibility', 'Plant inspection'],
    cons: ['Limited brightness', 'Color distortion', 'Not for growth']
  },
  'Intracanopy': {
    name: 'Intracanopy Lighting',
    description: 'Supplemental lighting within the plant canopy',
    icon: 'layers',
    pros: ['Lower bud development', 'Increased yield', 'Better light distribution', 'Reduced larf'],
    cons: ['Heat management', 'Installation complexity', 'Additional cost']
  },
  'Photoperiod': {
    name: 'Photoperiod Control',
    description: 'Low-intensity lights for daylength manipulation',
    icon: 'clock',
    pros: ['Flowering control', 'Energy efficient', 'Precise timing', 'Season extension'],
    cons: ['Timing critical', 'Light pollution', 'Controller needed']
  },
  'Supplemental': {
    name: 'Supplemental Lighting',
    description: 'Additional spectrum or intensity boosters',
    icon: 'plus-circle',
    pros: ['Targeted enhancement', 'Flexible deployment', 'Quality improvement', 'Fill lighting'],
    cons: ['Integration complexity', 'Cost addition', 'Power requirements']
  }
};

export const specialtyLightDatabase: Record<string, SpecialtyLight> = {
  // UV-A Lights
  'california-lightworks-uva': {
    id: 'california-lightworks-uva',
    manufacturer: 'California Lightworks',
    model: 'UVA Supplemental Bar',
    category: 'UV-A',
    type: 'LED',
    specifications: {
      wattage: 30,
      wavelengthPeak: 385,
      wavelengthRange: { min: 365, max: 395 },
      beamAngle: 120,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.25,
      powerFactor: 0.95
    },
    physical: {
      width: 2,
      height: 2,
      length: 48,
      weight: 5,
      cooling: 'Passive'
    },
    features: [
      'Dedicated UV-A spectrum',
      'IP65 rated',
      'Daisy chainable',
      'Dimming compatible',
      'Timer ready',
      '5-year warranty'
    ],
    safety: {
      uvClass: 'Class 1',
      eyeProtection: false,
      skinProtection: false,
      ozoneProduction: false
    },
    mounting: 'Hanging',
    price: 395,
    certifications: ['UL', 'CE', 'RoHS']
  },
  'solacure-flower-power': {
    id: 'solacure-flower-power',
    manufacturer: 'Solacure',
    model: 'Flower Power T5',
    category: 'UV-B',
    type: 'Fluorescent',
    specifications: {
      wattage: 32,
      uvOutput: 3.5,
      wavelengthPeak: 308,
      wavelengthRange: { min: 280, max: 320 },
      lifespan: 1000
    },
    electrical: {
      voltage: 120,
      amps: 0.28
    },
    physical: {
      width: 1,
      height: 1,
      length: 46,
      weight: 1,
      cooling: 'Passive'
    },
    features: [
      'High UV-B output',
      'T5 HO compatible',
      'Reflector recommended',
      'Timer required',
      'Made in USA',
      'Proven results'
    ],
    safety: {
      uvClass: 'Class 3',
      eyeProtection: true,
      skinProtection: true,
      ozoneProduction: false
    },
    mounting: 'Surface',
    price: 85,
    certifications: ['FDA registered']
  },

  // UV-C Germicidal
  'bio-shield-uvc-55': {
    id: 'bio-shield-uvc-55',
    manufacturer: 'Bio-Shield',
    model: 'UVC-55 Germicidal',
    category: 'UV-C',
    type: 'Germicidal',
    specifications: {
      wattage: 55,
      uvOutput: 185,
      wavelengthPeak: 254,
      lifespan: 9000
    },
    electrical: {
      voltage: 120,
      amps: 0.5
    },
    physical: {
      width: 4,
      height: 4,
      length: 24,
      weight: 8,
      cooling: 'Active'
    },
    features: [
      'Hospital grade',
      'Ozone-free model',
      'Motion sensor safety',
      'Remote control',
      'Timer function',
      'Protective housing'
    ],
    safety: {
      uvClass: 'Class 3',
      eyeProtection: true,
      skinProtection: true,
      ozoneProduction: false
    },
    mounting: 'Stand',
    price: 685,
    certifications: ['EPA', 'FDA', 'UL']
  },
  'american-uv-gg36': {
    id: 'american-uv-gg36',
    manufacturer: 'American Ultraviolet',
    model: 'GG36 Germicidal',
    category: 'UV-C',
    type: 'Germicidal',
    specifications: {
      wattage: 36,
      uvOutput: 120,
      wavelengthPeak: 254,
      lifespan: 10000
    },
    electrical: {
      voltage: 120,
      amps: 0.35
    },
    physical: {
      width: 3,
      height: 3,
      length: 36,
      weight: 6,
      cooling: 'Passive'
    },
    features: [
      'Commercial grade',
      'Quick start ballast',
      'Shatterproof coating',
      'Wall mount included',
      'Safety interlock',
      'Indicator light'
    ],
    safety: {
      uvClass: 'Class 3',
      eyeProtection: true,
      skinProtection: true,
      ozoneProduction: false
    },
    mounting: 'Surface',
    price: 425,
    certifications: ['UL', 'CE']
  },

  // Far-Red Lights
  'photonic-farred-730': {
    id: 'photonic-farred-730',
    manufacturer: 'Photonic',
    model: 'FR-730 Bar',
    category: 'FarRed',
    type: 'LED',
    specifications: {
      wattage: 40,
      ppf: 85,
      wavelengthPeak: 730,
      wavelengthRange: { min: 720, max: 740 },
      beamAngle: 120,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.35,
      powerFactor: 0.92
    },
    physical: {
      width: 2,
      height: 2,
      length: 48,
      weight: 4,
      cooling: 'Passive'
    },
    features: [
      'End-of-day treatment',
      'Emerson enhancement',
      'Flowering trigger',
      'Waterproof design',
      'Chain linkable',
      'Sunrise/sunset simulation'
    ],
    mounting: 'Hanging',
    price: 285,
    certifications: ['ETL', 'CE']
  },
  'kind-led-farred-flower': {
    id: 'kind-led-farred-flower',
    manufacturer: 'Kind LED',
    model: 'Far Red Flower Initiator',
    category: 'FarRed',
    type: 'LED',
    specifications: {
      wattage: 45,
      ppf: 95,
      wavelengthPeak: 735,
      wavelengthRange: { min: 710, max: 750 },
      beamAngle: 90,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.4,
      powerFactor: 0.95
    },
    physical: {
      width: 12,
      height: 12,
      length: 3,
      weight: 8,
      cooling: 'Active'
    },
    features: [
      'Programmable timer',
      'Intensity control',
      'Quick flowering',
      'Sleep induction',
      'Compact design',
      'Research proven'
    ],
    mounting: 'Hanging',
    price: 425,
    certifications: ['UL', 'DLC']
  },

  // Green Work Lights
  'method-seven-led-green': {
    id: 'method-seven-led-green',
    manufacturer: 'Method Seven',
    model: 'LED Green Work Light',
    category: 'Green',
    type: 'LED',
    specifications: {
      wattage: 15,
      wavelengthPeak: 525,
      wavelengthRange: { min: 510, max: 540 },
      beamAngle: 60,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.13
    },
    physical: {
      width: 6,
      height: 8,
      length: 6,
      weight: 2,
      cooling: 'Passive'
    },
    features: [
      'True green spectrum',
      'No photoperiod disruption',
      'Magnetic base',
      'Flexible neck',
      'USB rechargeable',
      'Portable design'
    ],
    mounting: 'Stand',
    price: 125,
    certifications: ['CE', 'RoHS']
  },
  'iluminar-green-led': {
    id: 'iluminar-green-led',
    manufacturer: 'Iluminar',
    model: 'Green LED Work Light',
    category: 'Green',
    type: 'LED',
    specifications: {
      wattage: 20,
      wavelengthPeak: 520,
      wavelengthRange: { min: 505, max: 535 },
      beamAngle: 120,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.17
    },
    physical: {
      width: 12,
      height: 12,
      length: 2,
      weight: 3,
      cooling: 'Passive'
    },
    features: [
      'Wide coverage',
      'Ceiling mount',
      'Motion sensor option',
      'Dimmable',
      'Silent operation',
      'Professional grade'
    ],
    mounting: 'Surface',
    price: 185,
    certifications: ['UL', 'ETL']
  },

  // Intracanopy Lighting
  'fohse-aries': {
    id: 'fohse-aries',
    manufacturer: 'Fohse',
    model: 'Aries Intracanopy',
    category: 'Intracanopy',
    type: 'LED',
    specifications: {
      wattage: 80,
      ppf: 200,
      wavelengthPeak: 660,
      beamAngle: 150,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.7,
      powerFactor: 0.98,
      thd: 10
    },
    physical: {
      width: 1.5,
      height: 1.5,
      length: 44,
      weight: 5,
      cooling: 'Passive'
    },
    features: [
      'Waterproof IP67',
      'Slim profile',
      'Full spectrum',
      'Daisy chain 10 units',
      'Flexible mounting',
      '5-year warranty'
    ],
    mounting: 'Rail',
    price: 425,
    certifications: ['UL', 'DLC', 'IP67']
  },
  'scynce-dragon-uv': {
    id: 'scynce-dragon-uv',
    manufacturer: 'Scynce',
    model: 'Dragon UV Supplemental',
    category: 'Supplemental',
    type: 'LED',
    specifications: {
      wattage: 50,
      ppf: 20,
      wavelengthPeak: 395,
      wavelengthRange: { min: 280, max: 400 },
      beamAngle: 120,
      lifespan: 50000
    },
    electrical: {
      voltage: 120,
      amps: 0.42,
      powerFactor: 0.95
    },
    physical: {
      width: 3,
      height: 2,
      length: 40,
      weight: 6,
      cooling: 'Passive'
    },
    features: [
      'UV-A and UV-B combo',
      'Programmable spectrum',
      'Remote control',
      'Safety lockout',
      'Research data included',
      'Premium build'
    ],
    safety: {
      uvClass: 'Class 2',
      eyeProtection: true,
      skinProtection: true,
      ozoneProduction: false
    },
    mounting: 'Hanging',
    price: 695,
    certifications: ['ETL', 'CE', 'RoHS']
  },

  // Photoperiod Control
  'philips-greenpower-flowering': {
    id: 'philips-greenpower-flowering',
    manufacturer: 'Philips',
    model: 'GreenPower Flowering Lamp',
    category: 'Photoperiod',
    type: 'LED',
    specifications: {
      wattage: 10,
      ppf: 25,
      wavelengthPeak: 660,
      wavelengthRange: { min: 640, max: 680 },
      lifespan: 35000
    },
    electrical: {
      voltage: 120,
      amps: 0.08
    },
    physical: {
      width: 2,
      height: 2,
      length: 48,
      weight: 3,
      cooling: 'Passive'
    },
    features: [
      'Photoperiod extension',
      'Low intensity design',
      'Cyclic lighting compatible',
      'Energy efficient',
      'Professional grade',
      'Research validated'
    ],
    mounting: 'Surface',
    price: 165,
    certifications: ['UL', 'CE']
  }
};

// Helper functions for specialty lighting
export function calculateUVDose(
  intensity: number, // mW/cm²
  exposureTime: number, // minutes
  distance: number // inches from canopy
): {
  dose: number; // J/m²
  category: 'low' | 'medium' | 'high' | 'dangerous';
  recommendations: string[];
} {
  // Adjust intensity for distance (inverse square law)
  const adjustedIntensity = intensity * Math.pow(12 / distance, 2);
  
  // Calculate dose in J/m²
  const dose = adjustedIntensity * exposureTime * 60 / 10; // Convert to J/m²
  
  let category: 'low' | 'medium' | 'high' | 'dangerous';
  const recommendations: string[] = [];
  
  if (dose < 100) {
    category = 'low';
    recommendations.push('Safe for extended exposure');
  } else if (dose < 500) {
    category = 'medium';
    recommendations.push('Monitor plant response');
    recommendations.push('Limit to 15-30 minutes per day');
  } else if (dose < 1000) {
    category = 'high';
    recommendations.push('Use only during late flowering');
    recommendations.push('Maximum 15 minutes per day');
    recommendations.push('Provide recovery time');
  } else {
    category = 'dangerous';
    recommendations.push('Reduce intensity or exposure time');
    recommendations.push('Risk of plant damage');
    recommendations.push('Use protective equipment');
  }
  
  return { dose, category, recommendations };
}

export function recommendSpecialtyLighting(
  primaryLightPPFD: number,
  growthStage: 'vegetative' | 'flowering' | 'late-flowering',
  goals: ('quality' | 'yield' | 'pest-control' | 'morphology')[]
): {
  recommended: SpecialtyLight[];
  timing: Record<string, string>;
  notes: string[];
} {
  const recommendations: any = {
    recommended: [],
    timing: {},
    notes: []
  };
  
  const lights = Object.values(specialtyLightDatabase);
  
  // UV recommendations based on stage and goals
  if (growthStage === 'late-flowering' && goals.includes('quality')) {
    const uvbLights = lights.filter(l => l.category === 'UV-B');
    if (uvbLights.length > 0) {
      recommendations.recommended.push(uvbLights[0]);
      recommendations.timing['UV-B'] = 'Last 2-3 weeks, 15 min mid-day';
      recommendations.notes.push('UV-B enhances trichome production');
    }
  }
  
  // Far-red for flowering and morphology
  if ((growthStage === 'flowering' || goals.includes('morphology'))) {
    const farRedLights = lights.filter(l => l.category === 'FarRed');
    if (farRedLights.length > 0) {
      recommendations.recommended.push(farRedLights[0]);
      recommendations.timing['Far-Red'] = 'End of day, 10-15 minutes';
      recommendations.notes.push('Far-red accelerates flowering');
    }
  }
  
  // Intracanopy for yield
  if (goals.includes('yield') && primaryLightPPFD > 800) {
    const intracanopyLights = lights.filter(l => l.category === 'Intracanopy');
    if (intracanopyLights.length > 0) {
      recommendations.recommended.push(intracanopyLights[0]);
      recommendations.timing['Intracanopy'] = 'Same as primary photoperiod';
      recommendations.notes.push('Intracanopy lighting improves lower bud development');
    }
  }
  
  // Green work light always useful
  const greenLights = lights.filter(l => l.category === 'Green');
  if (greenLights.length > 0) {
    recommendations.recommended.push(greenLights[0]);
    recommendations.timing['Green'] = 'As needed during dark period';
    recommendations.notes.push('Green light safe for dark period work');
  }
  
  return recommendations;
}