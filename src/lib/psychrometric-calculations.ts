/**
 * Psychrometric Calculations for HVAC System Design
 * Implements ASHRAE psychrometric formulas for air properties
 * Used for cooling/heating load calculations and system sizing
 */

export interface PsychrometricState {
  dryBulb: number; // °F
  wetBulb?: number; // °F
  dewPoint?: number; // °F
  relativeHumidity?: number; // %
  humidityRatio?: number; // lb moisture/lb dry air
  enthalpy?: number; // BTU/lb
  specificVolume?: number; // ft³/lb
  pressure?: number; // psia (default 14.696)
}

export interface PsychrometricProcess {
  name: string;
  inlet: PsychrometricState;
  outlet: PsychrometricState;
  sensibleHeat?: number; // BTU/hr
  latentHeat?: number; // BTU/hr
  totalHeat?: number; // BTU/hr
  moistureChange?: number; // lb/hr
  airFlow?: number; // CFM
}

export interface ComfortZone {
  summer: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
  };
  winter: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
  };
}

// ASHRAE Standard atmospheric pressure at sea level
const STANDARD_PRESSURE = 14.696; // psia
const WATER_MOLECULAR_WEIGHT = 18.01528;
const AIR_MOLECULAR_WEIGHT = 28.9647;
const RATIO_MOLECULAR_WEIGHTS = WATER_MOLECULAR_WEIGHT / AIR_MOLECULAR_WEIGHT;

export class PsychrometricCalculator {
  /**
   * Calculate all psychrometric properties from dry bulb and one other property
   */
  static calculateProperties(input: PsychrometricState): PsychrometricState {
    const pressure = input.pressure || STANDARD_PRESSURE;
    let state = { ...input, pressure };

    // We need dry bulb and one other property
    if (!state.dryBulb) {
      throw new Error('Dry bulb temperature is required');
    }

    // Calculate missing properties based on what we have
    if (state.wetBulb !== undefined) {
      // From dry bulb and wet bulb
      state = this.fromDryBulbWetBulb(state.dryBulb, state.wetBulb, pressure);
    } else if (state.relativeHumidity !== undefined) {
      // From dry bulb and relative humidity
      state = this.fromDryBulbRH(state.dryBulb, state.relativeHumidity, pressure);
    } else if (state.dewPoint !== undefined) {
      // From dry bulb and dew point
      state = this.fromDryBulbDewPoint(state.dryBulb, state.dewPoint, pressure);
    } else if (state.humidityRatio !== undefined) {
      // From dry bulb and humidity ratio
      state = this.fromDryBulbHumidityRatio(state.dryBulb, state.humidityRatio, pressure);
    } else if (state.enthalpy !== undefined) {
      // From dry bulb and enthalpy (iterative)
      state = this.fromDryBulbEnthalpy(state.dryBulb, state.enthalpy, pressure);
    } else {
      throw new Error('Need at least two properties to calculate psychrometric state');
    }

    return state;
  }

  /**
   * Calculate saturation pressure at given temperature (ASHRAE 2017)
   */
  static saturationPressure(temperature: number): number {
    const T = temperature + 459.67; // Convert to Rankine
    
    if (temperature < 32) {
      // Over ice
      const c1 = -10214.165;
      const c2 = -4.8932428;
      const c3 = -0.0053765794;
      const c4 = 0.00000019202377;
      const c5 = 3.5575832e-10;
      const c6 = -9.0344688e-14;
      const c7 = 4.1635019;
      
      const lnPws = c1/T + c2 + c3*T + c4*T*T + c5*T*T*T + c6*T*T*T*T + c7*Math.log(T);
      return Math.exp(lnPws);
    } else {
      // Over water
      const c8 = -10440.397;
      const c9 = -11.29465;
      const c10 = -0.027022355;
      const c11 = 0.00001289036;
      const c12 = -2.4780681e-9;
      const c13 = 6.5459673;
      
      const lnPws = c8/T + c9 + c10*T + c11*T*T + c12*T*T*T + c13*Math.log(T);
      return Math.exp(lnPws);
    }
  }

  /**
   * Calculate humidity ratio from partial pressure of water vapor
   */
  static humidityRatioFromPartialPressure(pv: number, p: number): number {
    return RATIO_MOLECULAR_WEIGHTS * pv / (p - pv);
  }

  /**
   * Calculate partial pressure from humidity ratio
   */
  static partialPressureFromHumidityRatio(W: number, p: number): number {
    return p * W / (RATIO_MOLECULAR_WEIGHTS + W);
  }

  /**
   * Calculate relative humidity
   */
  static relativeHumidity(pv: number, pws: number): number {
    return 100 * pv / pws;
  }

  /**
   * Calculate dew point temperature
   */
  static dewPointTemperature(pv: number): number {
    if (pv < 0.18) return -100; // Below valid range
    
    const alpha = Math.log(pv);
    let tdp: number;
    
    if (pv >= 0.18 && pv <= 0.88654) {
      // -100°F to 32°F
      tdp = 100.45 + 33.193*alpha + 2.319*alpha*alpha + 0.17074*alpha*alpha*alpha + 
            1.2063*Math.pow(pv, 0.1984);
    } else {
      // 32°F to 200°F
      tdp = 90.12 + 26.142*alpha + 0.8927*alpha*alpha;
    }
    
    return tdp;
  }

  /**
   * Calculate enthalpy of moist air
   */
  static enthalpy(t: number, W: number): number {
    // h = 0.240*t + W*(1061 + 0.444*t)
    return 0.240 * t + W * (1061 + 0.444 * t);
  }

  /**
   * Calculate specific volume
   */
  static specificVolume(t: number, W: number, p: number): number {
    const R = 53.35; // ft·lbf/(lbm·°R)
    const T = t + 459.67; // °R
    return R * T * (1 + 1.6078 * W) / (144 * p);
  }

  /**
   * Calculate wet bulb temperature (iterative)
   */
  static wetBulbTemperature(t: number, W: number, p: number): number {
    let twb = t; // Initial guess
    const h = this.enthalpy(t, W);
    
    // Iterate to find wet bulb
    for (let i = 0; i < 100; i++) {
      const pws_wb = this.saturationPressure(twb);
      const Ws_wb = this.humidityRatioFromPartialPressure(pws_wb, p);
      const h_wb = this.enthalpy(twb, Ws_wb);
      
      // Psychrometric equation
      const W_calc = ((1093 - 0.556*twb)*Ws_wb - 0.240*(t - twb))/(1093 + 0.444*t - twb);
      
      if (Math.abs(W_calc - W) < 0.00001) break;
      
      // Adjust wet bulb temperature
      twb -= (W_calc - W) * 50;
    }
    
    return twb;
  }

  /**
   * Calculate all properties from dry bulb and wet bulb
   */
  static fromDryBulbWetBulb(tdb: number, twb: number, p: number): PsychrometricState {
    const pws_wb = this.saturationPressure(twb);
    const Ws_wb = this.humidityRatioFromPartialPressure(pws_wb, p);
    
    // Psychrometric equation
    const W = ((1093 - 0.556*twb)*Ws_wb - 0.240*(tdb - twb))/(1093 + 0.444*tdb - twb);
    
    const pv = this.partialPressureFromHumidityRatio(W, p);
    const pws = this.saturationPressure(tdb);
    const rh = this.relativeHumidity(pv, pws);
    const tdp = this.dewPointTemperature(pv);
    const h = this.enthalpy(tdb, W);
    const v = this.specificVolume(tdb, W, p);
    
    return {
      dryBulb: tdb,
      wetBulb: twb,
      dewPoint: tdp,
      relativeHumidity: rh,
      humidityRatio: W,
      enthalpy: h,
      specificVolume: v,
      pressure: p
    };
  }

  /**
   * Calculate all properties from dry bulb and relative humidity
   */
  static fromDryBulbRH(tdb: number, rh: number, p: number): PsychrometricState {
    const pws = this.saturationPressure(tdb);
    const pv = pws * rh / 100;
    const W = this.humidityRatioFromPartialPressure(pv, p);
    const tdp = this.dewPointTemperature(pv);
    const h = this.enthalpy(tdb, W);
    const v = this.specificVolume(tdb, W, p);
    const twb = this.wetBulbTemperature(tdb, W, p);
    
    return {
      dryBulb: tdb,
      wetBulb: twb,
      dewPoint: tdp,
      relativeHumidity: rh,
      humidityRatio: W,
      enthalpy: h,
      specificVolume: v,
      pressure: p
    };
  }

  /**
   * Calculate all properties from dry bulb and dew point
   */
  static fromDryBulbDewPoint(tdb: number, tdp: number, p: number): PsychrometricState {
    const pv = this.saturationPressure(tdp);
    const pws = this.saturationPressure(tdb);
    const rh = this.relativeHumidity(pv, pws);
    const W = this.humidityRatioFromPartialPressure(pv, p);
    const h = this.enthalpy(tdb, W);
    const v = this.specificVolume(tdb, W, p);
    const twb = this.wetBulbTemperature(tdb, W, p);
    
    return {
      dryBulb: tdb,
      wetBulb: twb,
      dewPoint: tdp,
      relativeHumidity: rh,
      humidityRatio: W,
      enthalpy: h,
      specificVolume: v,
      pressure: p
    };
  }

  /**
   * Calculate all properties from dry bulb and humidity ratio
   */
  static fromDryBulbHumidityRatio(tdb: number, W: number, p: number): PsychrometricState {
    const pv = this.partialPressureFromHumidityRatio(W, p);
    const pws = this.saturationPressure(tdb);
    const rh = this.relativeHumidity(pv, pws);
    const tdp = this.dewPointTemperature(pv);
    const h = this.enthalpy(tdb, W);
    const v = this.specificVolume(tdb, W, p);
    const twb = this.wetBulbTemperature(tdb, W, p);
    
    return {
      dryBulb: tdb,
      wetBulb: twb,
      dewPoint: tdp,
      relativeHumidity: rh,
      humidityRatio: W,
      enthalpy: h,
      specificVolume: v,
      pressure: p
    };
  }

  /**
   * Calculate all properties from dry bulb and enthalpy (iterative)
   */
  static fromDryBulbEnthalpy(tdb: number, h: number, p: number): PsychrometricState {
    // Initial guess for humidity ratio
    let W = 0.01;
    
    for (let i = 0; i < 50; i++) {
      const h_calc = this.enthalpy(tdb, W);
      if (Math.abs(h_calc - h) < 0.01) break;
      
      // Adjust humidity ratio
      W = W * (h / h_calc);
    }
    
    return this.fromDryBulbHumidityRatio(tdb, W, p);
  }

  /**
   * Mixing of two air streams
   */
  static mixAirStreams(
    stream1: { state: PsychrometricState; cfm: number },
    stream2: { state: PsychrometricState; cfm: number }
  ): PsychrometricState {
    const m1 = stream1.cfm / stream1.state.specificVolume!;
    const m2 = stream2.cfm / stream2.state.specificVolume!;
    const mt = m1 + m2;
    
    // Mass-weighted average
    const h_mix = (m1 * stream1.state.enthalpy! + m2 * stream2.state.enthalpy!) / mt;
    const W_mix = (m1 * stream1.state.humidityRatio! + m2 * stream2.state.humidityRatio!) / mt;
    
    // Find temperature that gives this enthalpy
    let t_mix = (m1 * stream1.state.dryBulb + m2 * stream2.state.dryBulb) / mt;
    
    for (let i = 0; i < 20; i++) {
      const h_calc = this.enthalpy(t_mix, W_mix);
      if (Math.abs(h_calc - h_mix) < 0.01) break;
      t_mix += (h_mix - h_calc) / 0.24;
    }
    
    return this.fromDryBulbHumidityRatio(t_mix, W_mix, stream1.state.pressure!);
  }

  /**
   * Sensible cooling/heating process (constant humidity ratio)
   */
  static sensibleProcess(
    inlet: PsychrometricState,
    outletTemp: number
  ): PsychrometricProcess {
    const outlet = this.fromDryBulbHumidityRatio(
      outletTemp,
      inlet.humidityRatio!,
      inlet.pressure!
    );
    
    const sensibleHeat = 0.24 * (outlet.dryBulb - inlet.dryBulb);
    
    return {
      name: outletTemp > inlet.dryBulb ? 'Sensible Heating' : 'Sensible Cooling',
      inlet,
      outlet,
      sensibleHeat,
      latentHeat: 0,
      totalHeat: sensibleHeat
    };
  }

  /**
   * Cooling and dehumidification process
   */
  static coolingDehumidification(
    inlet: PsychrometricState,
    coilTemp: number,
    bypassFactor: number = 0.1
  ): PsychrometricProcess {
    // Coil surface conditions (saturated at coil temp)
    const coilState = this.fromDryBulbRH(coilTemp, 100, inlet.pressure!);
    
    // Outlet conditions with bypass factor
    const outletTemp = coilTemp + bypassFactor * (inlet.dryBulb - coilTemp);
    const outletW = coilState.humidityRatio! + 
                   bypassFactor * (inlet.humidityRatio! - coilState.humidityRatio!);
    
    const outlet = this.fromDryBulbHumidityRatio(outletTemp, outletW, inlet.pressure!);
    
    const sensibleHeat = 0.24 * (outlet.dryBulb - inlet.dryBulb);
    const latentHeat = 1061 * (outlet.humidityRatio! - inlet.humidityRatio!);
    const totalHeat = outlet.enthalpy! - inlet.enthalpy!;
    
    return {
      name: 'Cooling & Dehumidification',
      inlet,
      outlet,
      sensibleHeat,
      latentHeat,
      totalHeat,
      moistureChange: outlet.humidityRatio! - inlet.humidityRatio!
    };
  }

  /**
   * Evaporative cooling process (adiabatic)
   */
  static evaporativeCooling(
    inlet: PsychrometricState,
    effectiveness: number = 0.85
  ): PsychrometricProcess {
    // Constant enthalpy process toward saturation
    const h_const = inlet.enthalpy!;
    const tdb_sat = inlet.wetBulb!;
    
    const outletTemp = inlet.dryBulb - effectiveness * (inlet.dryBulb - tdb_sat);
    const outlet = this.fromDryBulbEnthalpy(outletTemp, h_const, inlet.pressure!);
    
    return {
      name: 'Evaporative Cooling',
      inlet,
      outlet,
      sensibleHeat: 0.24 * (outlet.dryBulb - inlet.dryBulb),
      latentHeat: 1061 * (outlet.humidityRatio! - inlet.humidityRatio!),
      totalHeat: 0, // Adiabatic process
      moistureChange: outlet.humidityRatio! - inlet.humidityRatio!
    };
  }

  /**
   * Check if conditions are within ASHRAE comfort zone
   */
  static isInComfortZone(
    state: PsychrometricState,
    season: 'summer' | 'winter' = 'summer'
  ): boolean {
    const zones: ComfortZone = {
      summer: {
        temperatureMin: 73,
        temperatureMax: 79,
        humidityMin: 30,
        humidityMax: 60
      },
      winter: {
        temperatureMin: 68,
        temperatureMax: 74,
        humidityMin: 30,
        humidityMax: 60
      }
    };
    
    const zone = zones[season];
    
    return state.dryBulb >= zone.temperatureMin &&
           state.dryBulb <= zone.temperatureMax &&
           state.relativeHumidity! >= zone.humidityMin &&
           state.relativeHumidity! <= zone.humidityMax;
  }

  /**
   * Calculate air density
   */
  static airDensity(state: PsychrometricState): number {
    return 1 / state.specificVolume!; // lb/ft³
  }

  /**
   * Calculate cooling load from space conditions
   */
  static calculateCoolingLoad(
    indoor: PsychrometricState,
    outdoor: PsychrometricState,
    cfm: number,
    sensibleGain: number = 0, // BTU/hr
    latentGain: number = 0 // BTU/hr
  ): {
    sensibleLoad: number;
    latentLoad: number;
    totalLoad: number;
    requiredSupplyTemp: number;
    requiredSupplyHumidity: number;
  } {
    const density = this.airDensity(indoor);
    const massFlow = cfm * density * 60; // lb/hr
    
    // Ventilation loads
    const ventSensible = massFlow * 0.24 * (outdoor.dryBulb - indoor.dryBulb);
    const ventLatent = massFlow * 1061 * (outdoor.humidityRatio! - indoor.humidityRatio!);
    
    // Total loads
    const sensibleLoad = sensibleGain + ventSensible;
    const latentLoad = latentGain + ventLatent;
    const totalLoad = sensibleLoad + latentLoad;
    
    // Required supply conditions
    const deltaT = sensibleLoad / (1.08 * cfm);
    const requiredSupplyTemp = indoor.dryBulb - deltaT;
    
    const deltaW = latentLoad / (4840 * cfm);
    const requiredSupplyHumidity = indoor.humidityRatio! - deltaW;
    
    return {
      sensibleLoad,
      latentLoad,
      totalLoad,
      requiredSupplyTemp,
      requiredSupplyHumidity
    };
  }
}