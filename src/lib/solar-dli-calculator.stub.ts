// Stub for solar DLI calculator
export const calculateSolarDLI = (params: any) => {
  return {
    dli: 0,
    monthlyAverage: [],
    yearlyTotal: 0
  }
}

export const SOLAR_DATA = {
  locations: {},
  seasonal: {}
}

export default {
  calculateSolarDLI,
  SOLAR_DATA
}