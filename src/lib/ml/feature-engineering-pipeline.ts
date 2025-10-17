/**
 * Advanced Feature Engineering Pipeline for Cultivation Data
 * Automated feature extraction, transformation, and selection for ML workflows
 */

export interface FeatureConfig {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'boolean';
  role: 'feature' | 'target' | 'identifier' | 'ignore';
  transformations?: string[];
  encoding?: 'onehot' | 'label' | 'target' | 'binary';
}

export interface EngineeringResult {
  features: Record<string, number[]>;
  featureNames: string[];
  metadata: {
    originalFeatures: number;
    engineeredFeatures: number;
    transformationsApplied: string[];
    featureImportance?: Record<string, number>;
  };
  preprocessing: {
    scalers: Record<string, { mean: number; std: number }>;
    encoders: Record<string, { mapping: Record<string, number> }>;
    imputationValues: Record<string, number | string>;
  };
}

export interface TimeSeriesFeatures {
  rollingMeans: Record<string, number[]>;
  rollingStds: Record<string, number[]>;
  lagFeatures: Record<string, number[]>;
  trendFeatures: Record<string, number[]>;
  seasonalFeatures: Record<string, number[]>;
}

export interface InteractionFeatures {
  ratios: Record<string, number[]>;
  products: Record<string, number[]>;
  differences: Record<string, number[]>;
  customInteractions: Record<string, number[]>;
}

export class FeatureEngineeringPipeline {
  private config: Map<string, FeatureConfig> = new Map();
  private cultivationDomainKnowledge: Map<string, any> = new Map();

  constructor() {
    this.initializeCultivationKnowledge();
  }

  /**
   * Main feature engineering pipeline
   */
  async engineerFeatures(
    data: Record<string, any>[],
    config: FeatureConfig[],
    options: {
      createInteractions?: boolean;
      timeSeriesFeatures?: boolean;
      polynomialFeatures?: boolean;
      targetVariable?: string;
    } = {}
  ): Promise<EngineeringResult> {
    if (!data || data.length === 0) {
      throw new Error('No data provided for feature engineering');
    }

    // Set up configuration
    config.forEach(c => this.config.set(c.name, c));

    // Extract base features
    let features = this.extractBaseFeatures(data, config);
    const transformationsApplied = [];

    // Apply basic transformations
    features = this.applyBasicTransformations(features, config);
    transformationsApplied.push('basic_transformations');

    // Create domain-specific features
    const domainFeatures = this.createCultivationFeatures(data);
    features = { ...features, ...domainFeatures };
    transformationsApplied.push('cultivation_features');

    // Time series features (if temporal data exists)
    if (options.timeSeriesFeatures && this.hasTemporalData(data)) {
      const timeFeatures = this.createTimeSeriesFeatures(data);
      features = { ...features, ...timeFeatures.rollingMeans, ...timeFeatures.lagFeatures };
      transformationsApplied.push('time_series_features');
    }

    // Interaction features
    if (options.createInteractions) {
      const interactions = this.createInteractionFeatures(features);
      features = { ...features, ...interactions.ratios, ...interactions.products };
      transformationsApplied.push('interaction_features');
    }

    // Polynomial features
    if (options.polynomialFeatures) {
      const polyFeatures = this.createPolynomialFeatures(features, 2);
      features = { ...features, ...polyFeatures };
      transformationsApplied.push('polynomial_features');
    }

    // Feature selection based on importance
    const selectedFeatures = await this.selectFeatures(features, options.targetVariable);
    
    // Prepare preprocessing information
    const preprocessing = this.preparePreprocessing(selectedFeatures);

    return {
      features: selectedFeatures,
      featureNames: Object.keys(selectedFeatures),
      metadata: {
        originalFeatures: config.length,
        engineeredFeatures: Object.keys(selectedFeatures).length,
        transformationsApplied
      },
      preprocessing
    };
  }

  /**
   * Create cultivation-specific features based on domain knowledge
   */
  private createCultivationFeatures(data: Record<string, any>[]): Record<string, number[]> {
    const features: Record<string, number[]> = {};

    // VPD calculation (if not already present)
    if (this.hasFields(data, ['temperature', 'humidity']) && !this.hasFields(data, ['vpd'])) {
      features.vpd_calculated = data.map(row => {
        const temp = Number(row.temperature);
        const rh = Number(row.humidity);
        return this.calculateVPD(temp, rh);
      });
    }

    // Daily Light Integral (if PPFD and photoperiod available)
    if (this.hasFields(data, ['ppfd', 'photoperiod']) && !this.hasFields(data, ['dli'])) {
      features.dli_calculated = data.map(row => {
        const ppfd = Number(row.ppfd);
        const photoperiod = Number(row.photoperiod);
        return (ppfd * photoperiod * 3600) / 1000000; // Convert to mol/m²/day
      });
    }

    // Light efficiency metrics
    if (this.hasFields(data, ['ppfd', 'power_consumption'])) {
      features.light_efficiency = data.map(row => {
        const ppfd = Number(row.ppfd);
        const power = Number(row.power_consumption);
        return power > 0 ? ppfd / power : 0;
      });
    }

    // Nutrient ratios
    if (this.hasFields(data, ['n_ppm', 'p_ppm', 'k_ppm'])) {
      features.npk_ratio = data.map(row => {
        const n = Number(row.n_ppm);
        const p = Number(row.p_ppm);
        const k = Number(row.k_ppm);
        return n + p + k > 0 ? n / (n + p + k) : 0;
      });
    }

    // Environmental stress indicators
    if (this.hasFields(data, ['temperature', 'humidity', 'vpd'])) {
      features.environmental_stress = data.map(row => {
        const temp = Number(row.temperature);
        const rh = Number(row.humidity);
        const vpd = Number(row.vpd);
        
        let stress = 0;
        if (temp < 18 || temp > 30) stress += 1; // Temperature stress
        if (rh < 40 || rh > 70) stress += 1; // Humidity stress  
        if (vpd < 0.4 || vpd > 1.6) stress += 1; // VPD stress
        
        return stress;
      });
    }

    // Growth stage indicators (if growth stage data is categorical)
    if (this.hasFields(data, ['growth_stage'])) {
      const stages = ['seedling', 'vegetative', 'flowering', 'harvest'];
      stages.forEach(stage => {
        features[`stage_${stage}`] = data.map(row => 
          row.growth_stage === stage ? 1 : 0
        );
      });
    }

    // Light spectrum ratios (if spectral data available)
    if (this.hasFields(data, ['red_light', 'blue_light', 'green_light'])) {
      features.red_blue_ratio = data.map(row => {
        const red = Number(row.red_light);
        const blue = Number(row.blue_light);
        return blue > 0 ? red / blue : 0;
      });

      features.blue_green_ratio = data.map(row => {
        const blue = Number(row.blue_light);
        const green = Number(row.green_light);
        return green > 0 ? blue / green : 0;
      });
    }

    return features;
  }

  /**
   * Create time series features for temporal cultivation data
   */
  private createTimeSeriesFeatures(data: Record<string, any>[]): TimeSeriesFeatures {
    const numericFields = this.getNumericFields(data);
    const result: TimeSeriesFeatures = {
      rollingMeans: {},
      rollingStds: {},
      lagFeatures: {},
      trendFeatures: {},
      seasonalFeatures: {}
    };

    for (const field of numericFields) {
      const values = data.map(row => Number(row[field]));
      
      // Rolling statistics (3-day, 7-day windows)
      result.rollingMeans[`${field}_rolling_3d`] = this.calculateRollingMean(values, 3);
      result.rollingMeans[`${field}_rolling_7d`] = this.calculateRollingMean(values, 7);
      result.rollingStds[`${field}_rolling_std_7d`] = this.calculateRollingStd(values, 7);

      // Lag features (1-day, 3-day, 7-day lags)
      result.lagFeatures[`${field}_lag_1d`] = this.createLagFeature(values, 1);
      result.lagFeatures[`${field}_lag_3d`] = this.createLagFeature(values, 3);
      result.lagFeatures[`${field}_lag_7d`] = this.createLagFeature(values, 7);

      // Trend features
      result.trendFeatures[`${field}_trend_7d`] = this.calculateTrend(values, 7);
      
      // Change features
      result.trendFeatures[`${field}_pct_change`] = this.calculatePercentageChange(values);
    }

    return result;
  }

  /**
   * Create interaction features between variables
   */
  private createInteractionFeatures(features: Record<string, number[]>): InteractionFeatures {
    const featureNames = Object.keys(features);
    const result: InteractionFeatures = {
      ratios: {},
      products: {},
      differences: {},
      customInteractions: {}
    };

    // Important cultivation ratios
    const cultivationRatios = [
      ['temperature', 'humidity', 'temp_humidity_ratio'],
      ['ppfd', 'co2', 'light_co2_ratio'],
      ['n_ppm', 'k_ppm', 'n_k_ratio'],
      ['ec', 'ph', 'ec_ph_interaction']
    ];

    for (const [feature1, feature2, ratioName] of cultivationRatios) {
      if (features[feature1] && features[feature2]) {
        result.ratios[ratioName] = features[feature1].map((val, idx) => {
          const denom = features[feature2][idx];
          return denom !== 0 ? val / denom : 0;
        });
      }
    }

    // Environmental interaction products
    const environmentalProducts = [
      ['temperature', 'humidity'],
      ['ppfd', 'co2'],
      ['vpd', 'temperature']
    ];

    for (const [f1, f2] of environmentalProducts) {
      if (features[f1] && features[f2]) {
        const productName = `${f1}_x_${f2}`;
        result.products[productName] = features[f1].map((val, idx) => 
          val * features[f2][idx]
        );
      }
    }

    // Custom cultivation interactions
    if (features.temperature && features.humidity && features.ppfd) {
      result.customInteractions.environmental_index = features.temperature.map((temp, idx) => {
        const humidity = features.humidity[idx];
        const ppfd = features.ppfd[idx];
        // Custom environmental favorability index
        return (temp * 0.3 + humidity * 0.3 + ppfd * 0.4) / 100;
      });
    }

    return result;
  }

  /**
   * Create polynomial features up to specified degree
   */
  private createPolynomialFeatures(
    features: Record<string, number[]>,
    degree: number = 2
  ): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    const numericFeatures = Object.keys(features).filter(name => 
      !name.includes('_encoded') && !name.includes('_binary')
    );

    for (const featureName of numericFeatures) {
      const values = features[featureName];
      
      // Create polynomial features
      for (let d = 2; d <= degree; d++) {
        result[`${featureName}_poly_${d}`] = values.map(val => Math.pow(val, d));
      }

      // Create square root features (for non-negative values)
      if (values.every(val => val >= 0)) {
        result[`${featureName}_sqrt`] = values.map(val => Math.sqrt(val));
      }

      // Create log features (for positive values)
      if (values.every(val => val > 0)) {
        result[`${featureName}_log`] = values.map(val => Math.log(val));
      }
    }

    return result;
  }

  /**
   * Feature selection based on importance and correlation
   */
  private async selectFeatures(
    features: Record<string, number[]>,
    targetVariable?: string
  ): Promise<Record<string, number[]>> {
    const featureNames = Object.keys(features);
    const selectedFeatures: Record<string, number[]> = {};

    // Remove features with zero variance
    for (const name of featureNames) {
      const values = features[name];
      const variance = this.calculateVariance(values);
      
      if (variance > 0.001) { // Keep features with sufficient variance
        selectedFeatures[name] = values;
      }
    }

    // Remove highly correlated features (correlation > 0.95)
    const correlationMatrix = this.calculateCorrelationMatrix(selectedFeatures);
    const toRemove = new Set<string>();

    Object.keys(correlationMatrix).forEach(feature1 => {
      Object.keys(correlationMatrix[feature1]).forEach(feature2 => {
        if (feature1 !== feature2 && 
            Math.abs(correlationMatrix[feature1][feature2]) > 0.95 &&
            !toRemove.has(feature1) && !toRemove.has(feature2)) {
          toRemove.add(feature2); // Remove the second feature
        }
      });
    });

    // Remove highly correlated features
    toRemove.forEach(feature => {
      delete selectedFeatures[feature];
    });

    return selectedFeatures;
  }

  /**
   * Extract base features from raw data
   */
  private extractBaseFeatures(
    data: Record<string, any>[],
    config: FeatureConfig[]
  ): Record<string, number[]> {
    const features: Record<string, number[]> = {};

    for (const featureConfig of config) {
      if (featureConfig.role === 'ignore') continue;

      const values = data.map(row => row[featureConfig.name]);
      
      if (featureConfig.type === 'numeric') {
        features[featureConfig.name] = values.map(v => Number(v) || 0);
      } else if (featureConfig.type === 'categorical') {
        const encoded = this.encodeCategorical(values, featureConfig.encoding || 'onehot');
        Object.assign(features, encoded);
      } else if (featureConfig.type === 'boolean') {
        features[featureConfig.name] = values.map(v => v ? 1 : 0);
      }
    }

    return features;
  }

  /**
   * Apply basic transformations (scaling, normalization)
   */
  private applyBasicTransformations(
    features: Record<string, number[]>,
    config: FeatureConfig[]
  ): Record<string, number[]> {
    const transformed: Record<string, number[]> = {};

    Object.keys(features).forEach(featureName => {
      const values = features[featureName];
      const featureConfig = config.find(c => c.name === featureName);
      
      if (featureConfig?.transformations?.includes('standardize')) {
        transformed[featureName] = this.standardizeFeature(values);
      } else if (featureConfig?.transformations?.includes('normalize')) {
        transformed[featureName] = this.normalizeFeature(values);
      } else {
        transformed[featureName] = values;
      }
    });

    return transformed;
  }

  // Utility methods
  private calculateVPD(temperature: number, humidity: number): number {
    const saturationVaporPressure = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const actualVaporPressure = saturationVaporPressure * (humidity / 100);
    return saturationVaporPressure - actualVaporPressure;
  }

  private hasFields(data: Record<string, any>[], fields: string[]): boolean {
    return fields.every(field => data[0] && data[0][field] !== undefined);
  }

  private hasTemporalData(data: Record<string, any>[]): boolean {
    const timeFields = ['timestamp', 'date', 'datetime', 'created_at'];
    return timeFields.some(field => data[0] && data[0][field] !== undefined);
  }

  private getNumericFields(data: Record<string, any>[]): string[] {
    if (!data[0]) return [];
    
    return Object.keys(data[0]).filter(key => {
      const sample = data.slice(0, 10).map(row => row[key]);
      return sample.every(val => !isNaN(Number(val)));
    });
  }

  private calculateRollingMean(values: number[], window: number): number[] {
    const result = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = values.slice(start, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      result.push(mean);
    }
    return result;
  }

  private calculateRollingStd(values: number[], window: number): number[] {
    const result = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = values.slice(start, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / slice.length;
      result.push(Math.sqrt(variance));
    }
    return result;
  }

  private createLagFeature(values: number[], lag: number): number[] {
    const result = new Array(lag).fill(0);
    return result.concat(values.slice(0, -lag));
  }

  private calculateTrend(values: number[], window: number): number[] {
    const result = [];
    for (let i = 0; i < values.length; i++) {
      if (i < window) {
        result.push(0);
      } else {
        const current = values[i];
        const previous = values[i - window];
        const trend = previous !== 0 ? (current - previous) / previous : 0;
        result.push(trend);
      }
    }
    return result;
  }

  private calculatePercentageChange(values: number[]): number[] {
    const result = [0]; // First value has no change
    for (let i = 1; i < values.length; i++) {
      const change = values[i - 1] !== 0 ? 
        (values[i] - values[i - 1]) / values[i - 1] : 0;
      result.push(change);
    }
    return result;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateCorrelationMatrix(features: Record<string, number[]>): Record<string, Record<string, number>> {
    const featureNames = Object.keys(features);
    const matrix: Record<string, Record<string, number>> = {};

    featureNames.forEach(f1 => {
      matrix[f1] = {};
      featureNames.forEach(f2 => {
        matrix[f1][f2] = this.calculateCorrelation(features[f1], features[f2]);
      });
    });

    return matrix;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private encodeCategorical(values: any[], encoding: string): Record<string, number[]> {
    const unique = Array.from(new Set(values));
    const result: Record<string, number[]> = {};

    if (encoding === 'onehot') {
      unique.forEach(category => {
        const encoded = values.map(val => val === category ? 1 : 0);
        result[`${category}_encoded`] = encoded;
      });
    } else if (encoding === 'label') {
      const mapping = Object.fromEntries(unique.map((cat, idx) => [cat, idx]));
      result.label_encoded = values.map(val => mapping[val] || 0);
    }

    return result;
  }

  private standardizeFeature(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(this.calculateVariance(values));
    return std === 0 ? values : values.map(val => (val - mean) / std);
  }

  private normalizeFeature(values: number[]): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    return range === 0 ? values : values.map(val => (val - min) / range);
  }

  private preparePreprocessing(features: Record<string, number[]>) {
    const scalers: Record<string, { mean: number; std: number }> = {};
    const encoders: Record<string, { mapping: Record<string, number> }> = {};
    const imputationValues: Record<string, number | string> = {};

    Object.keys(features).forEach(featureName => {
      const values = features[featureName];
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = this.calculateVariance(values);
      
      scalers[featureName] = {
        mean,
        std: Math.sqrt(variance)
      };
      
      imputationValues[featureName] = mean;
    });

    return { scalers, encoders, imputationValues };
  }

  private initializeCultivationKnowledge(): void {
    // Initialize domain-specific knowledge for cultivation
    this.cultivationDomainKnowledge.set('optimal_ranges', {
      temperature: { min: 20, max: 28 },
      humidity: { min: 50, max: 70 },
      vpd: { min: 0.8, max: 1.2 },
      co2: { min: 800, max: 1200 },
      ph: { min: 5.5, max: 6.5 },
      ec: { min: 1.2, max: 2.0 }
    });

    this.cultivationDomainKnowledge.set('growth_stages', [
      'seedling', 'vegetative', 'flowering', 'harvest'
    ]);

    this.cultivationDomainKnowledge.set('important_ratios', [
      'red_blue_ratio', 'n_k_ratio', 'temp_humidity_ratio'
    ]);
  }
}

export default FeatureEngineeringPipeline;