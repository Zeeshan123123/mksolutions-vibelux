/**
 * Base class for ML Yield Predictors
 * Contains shared functionality
 */

export abstract class MLYieldPredictorBase {
  /**
   * Farquhar-von Caemmerer-Berry photosynthesis model
   * More accurate than simple light response curves
   */
  protected calculateFarquharPhotosynthesis(
    ppfd: number,
    co2: number,
    temperature: number,
    vpd: number
  ): number {
    // Constants at 25°C
    const Vcmax25 = 100 // Maximum carboxylation rate
    const Jmax25 = 180 // Maximum electron transport rate
    const Rd25 = 1.5 // Dark respiration rate
    
    // Temperature adjustments using Arrhenius equation
    const R = 8.314 // Gas constant
    const TK = temperature + 273.15
    const TK25 = 298.15
    
    // Activation energies (J/mol)
    const Ea_Vcmax = 65330
    const Ea_Jmax = 43540
    const Ea_Rd = 46390
    
    // Temperature-adjusted parameters
    const Vcmax = Vcmax25 * Math.exp(Ea_Vcmax * (TK - TK25) / (R * TK * TK25))
    const Jmax = Jmax25 * Math.exp(Ea_Jmax * (TK - TK25) / (R * TK * TK25))
    const Rd = Rd25 * Math.exp(Ea_Rd * (TK - TK25) / (R * TK * TK25))
    
    // Electron transport rate (J)
    const theta = 0.7 // Curvature factor
    const alpha = 0.3 // Quantum yield
    const I = ppfd * 4.6 // Convert PPFD to PAR
    
    const J = (alpha * I + Jmax - Math.sqrt(
      Math.pow(alpha * I + Jmax, 2) - 4 * theta * alpha * I * Jmax
    )) / (2 * theta)
    
    // CO2 compensation point (Pa)
    const Gamma = 4.5 * Math.exp(0.05 * (temperature - 25))
    
    // Michaelis constants for CO2 and O2
    const Kc = 40.4 * Math.exp(0.06 * (temperature - 25))
    const Ko = 24800 * Math.exp(0.015 * (temperature - 25))
    const O = 21000 // Atmospheric O2 (Pa)
    
    // Internal CO2 concentration (simplified Ball-Berry model)
    const gs_factor = Math.max(0.3, 1 - vpd / 3) // Stomatal response to VPD
    const Ci = co2 * 0.7 * gs_factor // Internal CO2
    
    // Rubisco-limited rate
    const Ac = Vcmax * (Ci - Gamma) / (Ci + Kc * (1 + O / Ko))
    
    // RuBP-limited rate
    const Aj = J * (Ci - Gamma) / (4 * (Ci + 2 * Gamma))
    
    // Gross photosynthesis (minimum of limiting processes)
    const Ag = Math.min(Ac, Aj)
    
    // Net photosynthesis
    const An = Ag - Rd
    
    // Normalize to 0-1 scale (30 μmol/m²/s is typical max for C3 plants)
    return Math.max(0, Math.min(1, An / 30))
  }
}