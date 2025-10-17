/**
 * Commercial lighting specifications for cultivation
 */

export interface LightingFixture {
  manufacturer: string;
  model: string;
  type: 'led' | 'hps' | 'cmh';
  wattage: number;
  ppf: number; // μmol/s
  efficacy: number; // μmol/J
  coverage: number; // sq ft at optimal height
  dimensions: {
    length: number; // inches
    width: number; // inches
    height: number; // inches
  };
  weight: number; // lbs
  price: number; // USD
  lifespan: number; // hours
  spectrum: string;
  dimming: boolean;
  waterproof: boolean;
}

// Fluence Lighting Specifications
export const fluenceLights: Record<string, LightingFixture> = {
  'SPYDR 2p': {
    manufacturer: 'Fluence',
    model: 'SPYDR 2p',
    type: 'led',
    wattage: 645,
    ppf: 1700,
    efficacy: 2.6,
    coverage: 16, // 4x4 ft at 6-12" height
    dimensions: {
      length: 47,
      width: 44,
      height: 4
    },
    weight: 33,
    price: 1499,
    lifespan: 50000,
    spectrum: 'PhysioSpec Indoor',
    dimming: true,
    waterproof: true
  },
  'SPYDR 2i': {
    manufacturer: 'Fluence',
    model: 'SPYDR 2i',
    type: 'led',
    wattage: 630,
    ppf: 1650,
    efficacy: 2.6,
    coverage: 16,
    dimensions: {
      length: 47,
      width: 44,
      height: 4
    },
    weight: 33,
    price: 1399,
    lifespan: 50000,
    spectrum: 'PhysioSpec Indoor',
    dimming: true,
    waterproof: true
  },
  'VYPR 2p': {
    manufacturer: 'Fluence',
    model: 'VYPR 2p',
    type: 'led',
    wattage: 540,
    ppf: 1450,
    efficacy: 2.7,
    coverage: 12,
    dimensions: {
      length: 47,
      width: 44,
      height: 4
    },
    weight: 28,
    price: 1199,
    lifespan: 50000,
    spectrum: 'PhysioSpec Indoor',
    dimming: true,
    waterproof: true
  }
};

// HPS Specifications for comparison
export const hpsLights: Record<string, LightingFixture> = {
  'HPS 1000W DE': {
    manufacturer: 'Generic',
    model: '1000W Double Ended',
    type: 'hps',
    wattage: 1000,
    ppf: 1950,
    efficacy: 1.95,
    coverage: 25, // 5x5 ft
    dimensions: {
      length: 20,
      width: 10,
      height: 8
    },
    weight: 15,
    price: 350,
    lifespan: 24000,
    spectrum: 'High Pressure Sodium',
    dimming: false,
    waterproof: false
  },
  'HPS 600W': {
    manufacturer: 'Generic',
    model: '600W Single Ended',
    type: 'hps',
    wattage: 600,
    ppf: 1100,
    efficacy: 1.83,
    coverage: 16, // 4x4 ft
    dimensions: {
      length: 16,
      width: 8,
      height: 6
    },
    weight: 10,
    price: 250,
    lifespan: 24000,
    spectrum: 'High Pressure Sodium',
    dimming: false,
    waterproof: false
  }
};

/**
 * Calculate 1:1 HPS to LED replacement
 */
export function calculateHPStoLEDReplacement(
  hpsFixture: LightingFixture,
  ledOptions: LightingFixture[]
): {
  recommended: LightingFixture;
  quantity: number;
  analysis: {
    ppfMatch: number;
    powerSavings: number;
    coverageMatch: number;
    roi: {
      initialCost: number;
      annualSavings: number;
      paybackPeriod: number; // years
    };
  };
} {
  // Find LED with closest PPF output
  let bestMatch = ledOptions[0];
  let bestScore = Infinity;

  ledOptions.forEach(led => {
    const ppfDiff = Math.abs(led.ppf - hpsFixture.ppf);
    const coverageDiff = Math.abs(led.coverage - hpsFixture.coverage);
    const score = ppfDiff + (coverageDiff * 10); // Weight coverage difference

    if (score < bestScore) {
      bestScore = score;
      bestMatch = led;
    }
  });

  // Calculate if we need multiple LED fixtures
  const quantity = Math.ceil(hpsFixture.ppf / bestMatch.ppf);

  // ROI Calculation
  const kwhPrice = 0.12; // $/kWh average
  const hoursPerDay = 12; // Flowering cycle
  const daysPerYear = 365;

  const hpsAnnualEnergy = (hpsFixture.wattage / 1000) * hoursPerDay * daysPerYear * kwhPrice;
  const ledAnnualEnergy = (bestMatch.wattage * quantity / 1000) * hoursPerDay * daysPerYear * kwhPrice;
  const annualSavings = hpsAnnualEnergy - ledAnnualEnergy;

  // Add HVAC savings (LEDs produce less heat)
  const hvacSavings = annualSavings * 0.3; // 30% additional savings from reduced cooling
  const totalAnnualSavings = annualSavings + hvacSavings;

  const initialCost = bestMatch.price * quantity - hpsFixture.price;
  const paybackPeriod = initialCost / totalAnnualSavings;

  return {
    recommended: bestMatch,
    quantity,
    analysis: {
      ppfMatch: (bestMatch.ppf * quantity) / hpsFixture.ppf,
      powerSavings: 1 - (bestMatch.wattage * quantity) / hpsFixture.wattage,
      coverageMatch: (bestMatch.coverage * quantity) / hpsFixture.coverage,
      roi: {
        initialCost,
        annualSavings: totalAnnualSavings,
        paybackPeriod
      }
    }
  };
}

/**
 * Generate lighting layout with specific fixtures
 */
export function generateLightingLayout(
  roomWidth: number,
  roomLength: number,
  fixture: LightingFixture,
  targetPPFD: number = 700
): {
  fixtures: Array<{
    position: { x: number; y: number; z: number };
    fixture: LightingFixture;
  }>;
  metrics: {
    totalFixtures: number;
    totalPower: number;
    avgPPFD: number;
    uniformity: number;
    powerDensity: number; // W/sq ft
  };
} {
  const fixtures: Array<{ position: { x: number; y: number; z: number }; fixture: LightingFixture }> = [];
  
  // Calculate optimal spacing based on coverage
  const fixtureSpacing = Math.sqrt(fixture.coverage);
  const mountHeight = 8; // 8 ft mounting height

  // Calculate grid
  const numFixturesX = Math.ceil(roomWidth / fixtureSpacing);
  const numFixturesY = Math.ceil(roomLength / fixtureSpacing);

  // Adjust spacing for even distribution
  const actualSpacingX = roomWidth / numFixturesX;
  const actualSpacingY = roomLength / numFixturesY;

  // Place fixtures
  for (let i = 0; i < numFixturesX; i++) {
    for (let j = 0; j < numFixturesY; j++) {
      fixtures.push({
        position: {
          x: actualSpacingX / 2 + i * actualSpacingX,
          y: actualSpacingY / 2 + j * actualSpacingY,
          z: mountHeight
        },
        fixture
      });
    }
  }

  // Calculate metrics
  const totalFixtures = fixtures.length;
  const totalPower = totalFixtures * fixture.wattage;
  const roomArea = roomWidth * roomLength;
  const avgPPFD = (fixture.ppf * totalFixtures) / roomArea * 10.764; // Convert to μmol/m²/s
  const uniformity = 0.85; // Typical for good LED layout
  const powerDensity = totalPower / roomArea;

  return {
    fixtures,
    metrics: {
      totalFixtures,
      totalPower,
      avgPPFD,
      uniformity,
      powerDensity
    }
  };
}