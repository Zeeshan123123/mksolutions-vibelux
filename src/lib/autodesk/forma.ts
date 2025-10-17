import { getAccessToken } from './auth';

// Forma API for automated design optimization
export class FormaAPI {
  private baseUrl = 'https://developer.api.autodesk.com/forma/v1';
  
  // Create optimized grow room layout
  async optimizeGrowRoomLayout(params: {
    dimensions: { length: number; width: number; height: number };
    targetPPFD: number;
    targetDLI: number;
    cropType: string;
    fixtureOptions: any[];
    constraints?: {
      maxPowerDraw?: number;
      minUniformity?: number;
      maxFixtures?: number;
      aisleWidth?: number;
      workingHeight?: number;
    };
  }) {
    try {
      const token = await getAccessToken();
      
      // Prepare optimization request
      const optimizationParams = {
        space: {
          type: 'rectangular',
          dimensions: params.dimensions,
          units: 'meters'
        },
        objectives: {
          primary: 'maximize_uniformity',
          secondary: ['minimize_fixtures', 'minimize_power'],
          targets: {
            ppfd: params.targetPPFD,
            dli: params.targetDLI,
            uniformity: params.constraints?.minUniformity || 0.7
          }
        },
        constraints: {
          fixtures: {
            catalog: params.fixtureOptions,
            maxCount: params.constraints?.maxFixtures || 100,
            mountingHeight: params.dimensions.height - (params.constraints?.workingHeight || 2.5)
          },
          electrical: {
            maxPower: params.constraints?.maxPowerDraw || 50000, // Watts
            voltage: 240,
            phases: 3
          },
          layout: {
            aisleWidth: params.constraints?.aisleWidth || 1.2,
            edgeDistance: 0.5,
            fixtureSpacing: 'optimize'
          }
        },
        cropProfile: this.getCropProfile(params.cropType)
      };

      const response = await fetch(`${this.baseUrl}/optimize/lighting`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(optimizationParams)
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`);
      }

      const result = await response.json();
      return this.processOptimizationResult(result);
    } catch (error) {
      logger.error('api', 'Layout optimization error:', error );
      throw error;
    }
  }

  // Get crop-specific growth profile
  private getCropProfile(cropType: string) {
    const profiles: Record<string, any> = {
      cannabis: {
        stages: [
          { name: 'clone', dli: 12, ppfd: 200, duration: 14 },
          { name: 'veg', dli: 25, ppfd: 400, duration: 28 },
          { name: 'flower', dli: 40, ppfd: 800, duration: 60 }
        ],
        canopyPenetration: 'high',
        uniformityRequirement: 'critical'
      },
      lettuce: {
        stages: [
          { name: 'seedling', dli: 8, ppfd: 150, duration: 7 },
          { name: 'growth', dli: 14, ppfd: 250, duration: 21 }
        ],
        canopyPenetration: 'low',
        uniformityRequirement: 'moderate'
      },
      tomatoes: {
        stages: [
          { name: 'seedling', dli: 10, ppfd: 200, duration: 14 },
          { name: 'vegetative', dli: 20, ppfd: 350, duration: 30 },
          { name: 'fruiting', dli: 25, ppfd: 450, duration: 90 }
        ],
        canopyPenetration: 'medium',
        uniformityRequirement: 'high'
      }
    };

    return profiles[cropType] || profiles.lettuce;
  }

  // Process and enhance optimization results
  private processOptimizationResult(result: any) {
    return {
      layout: {
        fixtures: result.fixtures.map((f: any) => ({
          id: f.id,
          model: f.model,
          position: f.position,
          rotation: f.rotation,
          power: f.power,
          coverage: f.coverage
        })),
        rows: result.layout.rows,
        columns: result.layout.columns,
        spacing: result.layout.spacing
      },
      performance: {
        averagePPFD: result.metrics.avgPPFD,
        minPPFD: result.metrics.minPPFD,
        maxPPFD: result.metrics.maxPPFD,
        uniformity: result.metrics.uniformity,
        dli: result.metrics.dli,
        coverage: result.metrics.coveragePercent
      },
      electrical: {
        totalPower: result.electrical.totalPower,
        powerPerArea: result.electrical.powerDensity,
        circuits: result.electrical.circuitLayout,
        efficiency: result.electrical.efficiency
      },
      cost: {
        fixtures: result.cost.fixturesCost,
        installation: result.cost.installationEstimate,
        annual: {
          energy: result.cost.annualEnergy,
          maintenance: result.cost.annualMaintenance
        },
        roi: result.cost.roiMonths
      },
      alternatives: result.alternatives || []
    };
  }

  // Generate multiple design options
  async generateDesignOptions(params: any) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/generate/options`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...params,
          count: 5, // Generate 5 different options
          variation: {
            fixtureTypes: true,
            layoutPatterns: true,
            powerConfigurations: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate design options');
      }

      const options = await response.json();
      return options.map((opt: any) => this.processOptimizationResult(opt));
    } catch (error) {
      logger.error('api', 'Design generation error:', error );
      throw error;
    }
  }

  // Optimize existing layout
  async improveExistingLayout(currentLayout: any, objectives: string[]) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/optimize/improve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current: currentLayout,
          objectives: objectives,
          constraints: {
            preserveFixtureTypes: false,
            maxChanges: 10
          }
        })
      });

      if (!response.ok) {
        throw new Error('Layout improvement failed');
      }

      const improvements = await response.json();
      return {
        original: currentLayout,
        improved: improvements.layout,
        changes: improvements.changes,
        metrics: improvements.comparison
      };
    } catch (error) {
      logger.error('api', 'Layout improvement error:', error );
      throw error;
    }
  }

  // Analyze grow room efficiency
  async analyzeEfficiency(layout: any, roomData: any) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/analyze/efficiency`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          layout: layout,
          room: roomData,
          analysis: [
            'light_distribution',
            'power_efficiency',
            'coverage_gaps',
            'hotspots',
            'uniformity_map',
            'spectrum_analysis'
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Efficiency analysis failed');
      }

      return await response.json();
    } catch (error) {
      logger.error('api', 'Efficiency analysis error:', error );
      throw error;
    }
  }

  // Generate parametric variations
  async generateParametricDesigns(baseParams: any, variables: any[]) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/parametric/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base: baseParams,
          variables: variables,
          iterations: 20,
          optimization: 'multi-objective'
        })
      });

      if (!response.ok) {
        throw new Error('Parametric generation failed');
      }

      const results = await response.json();
      return {
        designs: results.designs,
        paretoFront: results.paretoOptimal,
        sensitivity: results.sensitivityAnalysis
      };
    } catch (error) {
      logger.error('api', 'Parametric generation error:', error );
      throw error;
    }
  }

  // Export to various formats
  async exportDesign(layout: any, format: 'dwg' | 'ifc' | 'revit' | 'json') {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/export/${format}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          layout: layout,
          includeMetadata: true,
          units: 'metric'
        })
      });

      if (!response.ok) {
        throw new Error(`Export to ${format} failed`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      logger.error('api', 'Export error:', error );
      throw error;
    }
  }

  // Validate design against standards
  async validateDesign(layout: any, standards: string[] = ['DLC', 'IES', 'ASHRAE']) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/validate/standards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          layout: layout,
          standards: standards,
          cropType: layout.cropType
        })
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const validation = await response.json();
      return {
        compliant: validation.overallCompliance,
        results: validation.standardResults,
        recommendations: validation.recommendations,
        warnings: validation.warnings
      };
    } catch (error) {
      logger.error('api', 'Validation error:', error );
      throw error;
    }
  }
}