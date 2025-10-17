/**
 * Linear Programming Optimizer for Energy Management
 * Uses javascript-lp-solver for optimal resource allocation
 */

import solver from 'javascript-lp-solver';

interface OptimizationConstraints {
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  minPPFD: number;
  maxPPFD: number;
  minCO2: number;
  maxCO2: number;
  maxPowerDraw: number;
  utilityRates: {
    peak: number;
    offPeak: number;
    shoulder: number;
  };
}

interface EquipmentSpec {
  id: string;
  type: 'light' | 'hvac' | 'dehumidifier' | 'co2';
  powerDraw: number;
  output: number;
  efficiency: number;
  minOutput: number;
  maxOutput: number;
}

interface OptimizationResult {
  status: 'optimal' | 'infeasible' | 'unbounded';
  equipmentSettings: Map<string, number>;
  totalPowerDraw: number;
  estimatedCost: number;
  constraints: {
    temperature: number;
    humidity: number;
    ppfd: number;
    co2: number;
  };
}

export class LinearProgrammingOptimizer {
  /**
   * Optimize equipment settings to minimize energy cost while maintaining environmental constraints
   */
  static optimizeEnergyUsage(
    equipment: EquipmentSpec[],
    constraints: OptimizationConstraints,
    currentHour: number
  ): OptimizationResult {
    // Determine current utility rate based on hour
    const utilityRate = this.getUtilityRate(currentHour, constraints.utilityRates);
    
    // Build LP model
    const model = {
      optimize: 'cost',
      opType: 'min',
      constraints: {} as any,
      variables: {} as any,
    };

    // Add power constraint
    model.constraints.power = { max: constraints.maxPowerDraw };

    // Add environmental constraints
    model.constraints.temperature = { 
      min: constraints.minTemperature, 
      max: constraints.maxTemperature 
    };
    model.constraints.humidity = { 
      min: constraints.minHumidity, 
      max: constraints.maxHumidity 
    };
    model.constraints.ppfd = { 
      min: constraints.minPPFD, 
      max: constraints.maxPPFD 
    };
    model.constraints.co2 = { 
      min: constraints.minCO2, 
      max: constraints.maxCO2 
    };

    // Add equipment variables
    equipment.forEach(eq => {
      const varName = `${eq.type}_${eq.id}`;
      
      model.variables[varName] = {
        cost: eq.powerDraw * utilityRate,
        power: eq.powerDraw,
      };

      // Add equipment contribution to environmental factors
      switch (eq.type) {
        case 'light':
          model.variables[varName].ppfd = eq.output;
          model.variables[varName].temperature = eq.powerDraw * 0.1; // Heat generation
          break;
        case 'hvac':
          model.variables[varName].temperature = -eq.output; // Cooling effect
          model.variables[varName].humidity = -eq.output * 0.2; // Dehumidification
          break;
        case 'dehumidifier':
          model.variables[varName].humidity = -eq.output;
          model.variables[varName].temperature = eq.powerDraw * 0.05; // Slight heat
          break;
        case 'co2':
          model.variables[varName].co2 = eq.output;
          break;
      }

      // Add bounds for each equipment
      model.constraints[`${varName}_min`] = { min: eq.minOutput };
      model.constraints[`${varName}_max`] = { max: eq.maxOutput };
    });

    // Solve the linear program
    const solution = solver.Solve(model);

    // Parse results
    const equipmentSettings = new Map<string, number>();
    let totalPowerDraw = 0;

    equipment.forEach(eq => {
      const varName = `${eq.type}_${eq.id}`;
      const setting = solution[varName] || 0;
      equipmentSettings.set(eq.id, setting);
      totalPowerDraw += setting * eq.powerDraw;
    });

    return {
      status: solution.feasible ? 'optimal' : 'infeasible',
      equipmentSettings,
      totalPowerDraw,
      estimatedCost: solution.result || 0,
      constraints: {
        temperature: solution.temperature || 0,
        humidity: solution.humidity || 0,
        ppfd: solution.ppfd || 0,
        co2: solution.co2 || 0,
      },
    };
  }

  /**
   * Multi-period optimization for demand response
   */
  static optimizeDemandResponse(
    equipment: EquipmentSpec[],
    constraints: OptimizationConstraints,
    forecastHours: number = 24
  ): Map<number, OptimizationResult> {
    const results = new Map<number, OptimizationResult>();
    
    for (let hour = 0; hour < forecastHours; hour++) {
      // Adjust constraints based on time of day (e.g., lower light at night)
      const hourlyConstraints = this.adjustConstraintsForHour(constraints, hour);
      
      const result = this.optimizeEnergyUsage(
        equipment,
        hourlyConstraints,
        hour
      );
      
      results.set(hour, result);
    }
    
    return results;
  }

  /**
   * Optimize equipment replacement decisions
   */
  static optimizeEquipmentUpgrade(
    currentEquipment: EquipmentSpec[],
    availableUpgrades: EquipmentSpec[],
    budget: number,
    timeHorizon: number = 365 * 24 // 1 year in hours
  ): {
    recommendedUpgrades: EquipmentSpec[];
    roi: number;
    paybackPeriod: number;
  } {
    // Build capital budgeting LP model
    const model = {
      optimize: 'savings',
      opType: 'max',
      constraints: {
        budget: { max: budget },
      },
      variables: {} as any,
    };

    availableUpgrades.forEach(upgrade => {
      const currentEq = currentEquipment.find(eq => eq.type === upgrade.type);
      if (!currentEq) return;

      const powerSavings = currentEq.powerDraw - upgrade.powerDraw;
      const annualSavings = powerSavings * timeHorizon * 0.12; // Average utility rate

      model.variables[upgrade.id] = {
        savings: annualSavings,
        budget: upgrade.powerDraw * 100, // Rough cost estimate
      };
    });

    const solution = solver.Solve(model);
    
    const recommendedUpgrades = availableUpgrades.filter(
      upgrade => solution[upgrade.id] > 0.5
    );

    const totalInvestment = recommendedUpgrades.reduce(
      (sum, eq) => sum + eq.powerDraw * 100, 
      0
    );
    
    const annualSavings = solution.result || 0;
    const paybackPeriod = totalInvestment / annualSavings;

    return {
      recommendedUpgrades,
      roi: (annualSavings / totalInvestment) * 100,
      paybackPeriod,
    };
  }

  /**
   * Optimize load scheduling for batch processes
   */
  static optimizeLoadScheduling(
    loads: Array<{
      id: string;
      powerDraw: number;
      duration: number;
      mustStartBy?: number;
      mustFinishBy?: number;
    }>,
    constraints: {
      maxPower: number;
      utilityRates: OptimizationConstraints['utilityRates'];
      planningHorizon: number;
    }
  ): Map<string, number> {
    // Binary integer programming for scheduling
    const model = {
      optimize: 'cost',
      opType: 'min',
      constraints: {} as any,
      variables: {} as any,
      binaries: {} as any,
    };

    // Add power constraints for each time period
    for (let t = 0; t < constraints.planningHorizon; t++) {
      model.constraints[`power_t${t}`] = { max: constraints.maxPower };
    }

    // Add load variables
    loads.forEach(load => {
      for (let t = 0; t < constraints.planningHorizon - load.duration; t++) {
        const varName = `${load.id}_t${t}`;
        const rate = this.getUtilityRate(t, constraints.utilityRates);
        
        model.variables[varName] = {
          cost: load.powerDraw * load.duration * rate,
        };
        
        // Binary variable for start time
        model.binaries[varName] = 1;
        
        // Add power consumption to relevant time periods
        for (let d = 0; d < load.duration; d++) {
          if (!model.variables[varName][`power_t${t + d}`]) {
            model.variables[varName][`power_t${t + d}`] = 0;
          }
          model.variables[varName][`power_t${t + d}`] = load.powerDraw;
        }
      }

      // Ensure each load runs exactly once
      const loadVars = Object.keys(model.variables).filter(v => v.startsWith(load.id));
      model.constraints[`${load.id}_once`] = { equal: 1 };
      loadVars.forEach(v => {
        model.variables[v][`${load.id}_once`] = 1;
      });

      // Time window constraints
      if (load.mustStartBy !== undefined) {
        for (let t = load.mustStartBy + 1; t < constraints.planningHorizon; t++) {
          delete model.variables[`${load.id}_t${t}`];
        }
      }
      if (load.mustFinishBy !== undefined) {
        for (let t = load.mustFinishBy - load.duration + 1; t < constraints.planningHorizon; t++) {
          delete model.variables[`${load.id}_t${t}`];
        }
      }
    });

    const solution = solver.Solve(model);
    
    const schedule = new Map<string, number>();
    loads.forEach(load => {
      for (let t = 0; t < constraints.planningHorizon; t++) {
        if (solution[`${load.id}_t${t}`] > 0.5) {
          schedule.set(load.id, t);
          break;
        }
      }
    });
    
    return schedule;
  }

  private static getUtilityRate(
    hour: number, 
    rates: OptimizationConstraints['utilityRates']
  ): number {
    // Peak hours: 4-9 PM
    if (hour >= 16 && hour < 21) return rates.peak;
    // Off-peak hours: 10 PM - 8 AM
    if (hour >= 22 || hour < 8) return rates.offPeak;
    // Shoulder hours: 8 AM - 4 PM, 9 PM - 10 PM
    return rates.shoulder;
  }

  private static adjustConstraintsForHour(
    baseConstraints: OptimizationConstraints,
    hour: number
  ): OptimizationConstraints {
    const constraints = { ...baseConstraints };
    
    // Night period (10 PM - 6 AM): Lower light requirements
    if (hour >= 22 || hour < 6) {
      constraints.minPPFD = 0;
      constraints.maxPPFD = 0;
      constraints.minTemperature -= 5; // Allow cooler temps at night
    }
    
    // Morning ramp (6 AM - 8 AM): Gradual increase
    else if (hour >= 6 && hour < 8) {
      const rampFactor = (hour - 6) / 2;
      constraints.minPPFD *= rampFactor;
    }
    
    // Evening ramp (8 PM - 10 PM): Gradual decrease
    else if (hour >= 20 && hour < 22) {
      const rampFactor = (22 - hour) / 2;
      constraints.minPPFD *= rampFactor;
    }
    
    return constraints;
  }
}