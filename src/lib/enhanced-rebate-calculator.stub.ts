// Stub for enhanced rebate calculator
export const calculateRebate = (params: any) => {
  return {
    totalRebate: 0,
    federalRebate: 0,
    stateRebate: 0,
    utilityRebate: 0,
    estimatedSavings: 0
  }
}

export const REBATE_PROGRAMS = []

export const getRebatePrograms = (location: string) => []

export default {
  calculateRebate,
  REBATE_PROGRAMS,
  getRebatePrograms
}