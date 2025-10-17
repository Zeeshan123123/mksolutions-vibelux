// Stub for light requirement calculator
export const calculateLightRequirements = (params: any) => {
  return {
    ppfd: 0,
    dli: 0,
    photoperiod: 12,
    fixtureCount: 1,
    coverage: 0
  }
}

export const CROP_LIGHT_REQUIREMENTS = {
  tomato: { ppfd: 600, dli: 25 },
  lettuce: { ppfd: 200, dli: 12 },
  cannabis: { ppfd: 900, dli: 40 }
}

export default {
  calculateLightRequirements,
  CROP_LIGHT_REQUIREMENTS
}