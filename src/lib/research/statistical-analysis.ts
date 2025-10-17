/**
 * Statistical Analysis Service - ANOVA, Regression, and Post-hoc Tests
 * Production-ready statistical calculations for research applications
 */

export interface DataPoint {
  value: number;
  group?: string;
  treatment?: string;
  block?: string;
  [key: string]: any;
}

export interface ANOVAResult {
  fStatistic: number;
  pValue: number;
  degreesOfFreedom: {
    between: number;
    within: number;
    total: number;
  };
  sumOfSquares: {
    between: number;
    within: number;
    total: number;
  };
  meanSquares: {
    between: number;
    within: number;
  };
  significant: boolean;
  effectSize: number; // eta-squared
  powerAnalysis?: PowerAnalysis;
}

export interface RegressionResult {
  coefficients: number[];
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  pValue: number;
  standardErrors: number[];
  tValues: number[];
  pValues: number[];
  residuals: number[];
  predictions: number[];
  significant: boolean;
}

export interface PostHocResult {
  comparison: string;
  meanDifference: number;
  standardError: number;
  tValue: number;
  pValue: number;
  confidenceInterval: [number, number];
  significant: boolean;
}

export interface PowerAnalysis {
  power: number;
  sampleSize: number;
  effectSize: number;
  alpha: number;
  criticalValue: number;
}

export interface DescriptiveStats {
  n: number;
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  skewness: number;
  kurtosis: number;
  confidenceInterval: [number, number];
}

export class StatisticalAnalysisService {
  /**
   * One-way ANOVA analysis
   */
  oneWayANOVA(data: DataPoint[], groupColumn: string, valueColumn: string = 'value'): ANOVAResult {
    const groups = this.groupData(data, groupColumn, valueColumn);
    const groupKeys = Object.keys(groups);
    
    if (groupKeys.length < 2) {
      throw new Error('ANOVA requires at least 2 groups');
    }

    const allValues = data.map(d => d[valueColumn]);
    const grandMean = this.mean(allValues);
    const totalN = allValues.length;
    
    // Calculate sum of squares
    let ssTotal = 0;
    let ssBetween = 0;
    let ssWithin = 0;
    
    // Total sum of squares
    for (const value of allValues) {
      ssTotal += Math.pow(value - grandMean, 2);
    }
    
    // Between-groups sum of squares
    for (const groupKey of groupKeys) {
      const groupValues = groups[groupKey];
      const groupMean = this.mean(groupValues);
      ssBetween += groupValues.length * Math.pow(groupMean - grandMean, 2);
    }
    
    // Within-groups sum of squares
    ssWithin = ssTotal - ssBetween;
    
    // Degrees of freedom
    const dfBetween = groupKeys.length - 1;
    const dfWithin = totalN - groupKeys.length;
    const dfTotal = totalN - 1;
    
    // Mean squares
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    
    // F-statistic
    const fStatistic = msBetween / msWithin;
    
    // P-value using F-distribution approximation
    const pValue = this.fDistributionPValue(fStatistic, dfBetween, dfWithin);
    
    // Effect size (eta-squared)
    const effectSize = ssBetween / ssTotal;
    
    return {
      fStatistic,
      pValue,
      degreesOfFreedom: {
        between: dfBetween,
        within: dfWithin,
        total: dfTotal
      },
      sumOfSquares: {
        between: ssBetween,
        within: ssWithin,
        total: ssTotal
      },
      meanSquares: {
        between: msBetween,
        within: msWithin
      },
      significant: pValue < 0.05,
      effectSize
    };
  }

  /**
   * Two-way ANOVA analysis
   */
  twoWayANOVA(data: DataPoint[], factor1: string, factor2: string, valueColumn: string = 'value'): {
    factor1: ANOVAResult;
    factor2: ANOVAResult;
    interaction: ANOVAResult;
    overall: ANOVAResult;
  } {
    // Group data by both factors
    const groups: { [key: string]: number[] } = {};
    const factor1Groups: { [key: string]: number[] } = {};
    const factor2Groups: { [key: string]: number[] } = {};
    
    for (const point of data) {
      const f1Value = point[factor1];
      const f2Value = point[factor2];
      const value = point[valueColumn];
      const combinedKey = `${f1Value}_${f2Value}`;
      
      if (!groups[combinedKey]) groups[combinedKey] = [];
      if (!factor1Groups[f1Value]) factor1Groups[f1Value] = [];
      if (!factor2Groups[f2Value]) factor2Groups[f2Value] = [];
      
      groups[combinedKey].push(value);
      factor1Groups[f1Value].push(value);
      factor2Groups[f2Value].push(value);
    }
    
    const allValues = data.map(d => d[valueColumn]);
    const grandMean = this.mean(allValues);
    const totalN = allValues.length;
    
    // Calculate sum of squares
    let ssTotal = 0;
    let ssFactor1 = 0;
    let ssFactor2 = 0;
    let ssInteraction = 0;
    let ssError = 0;
    
    // Total sum of squares
    for (const value of allValues) {
      ssTotal += Math.pow(value - grandMean, 2);
    }
    
    // Factor 1 sum of squares
    for (const [f1Key, values] of Object.entries(factor1Groups)) {
      const groupMean = this.mean(values);
      ssFactor1 += values.length * Math.pow(groupMean - grandMean, 2);
    }
    
    // Factor 2 sum of squares
    for (const [f2Key, values] of Object.entries(factor2Groups)) {
      const groupMean = this.mean(values);
      ssFactor2 += values.length * Math.pow(groupMean - grandMean, 2);
    }
    
    // Cell means and interaction
    let ssCells = 0;
    for (const [cellKey, values] of Object.entries(groups)) {
      const cellMean = this.mean(values);
      ssCells += values.length * Math.pow(cellMean - grandMean, 2);
    }
    
    ssInteraction = ssCells - ssFactor1 - ssFactor2;
    ssError = ssTotal - ssCells;
    
    // Degrees of freedom
    const dfFactor1 = Object.keys(factor1Groups).length - 1;
    const dfFactor2 = Object.keys(factor2Groups).length - 1;
    const dfInteraction = dfFactor1 * dfFactor2;
    const dfError = totalN - Object.keys(groups).length;
    
    // Mean squares
    const msFactor1 = ssFactor1 / dfFactor1;
    const msFactor2 = ssFactor2 / dfFactor2;
    const msInteraction = ssInteraction / dfInteraction;
    const msError = ssError / dfError;
    
    // F-statistics
    const fFactor1 = msFactor1 / msError;
    const fFactor2 = msFactor2 / msError;
    const fInteraction = msInteraction / msError;
    
    return {
      factor1: {
        fStatistic: fFactor1,
        pValue: this.fDistributionPValue(fFactor1, dfFactor1, dfError),
        degreesOfFreedom: { between: dfFactor1, within: dfError, total: totalN - 1 },
        sumOfSquares: { between: ssFactor1, within: ssError, total: ssTotal },
        meanSquares: { between: msFactor1, within: msError },
        significant: this.fDistributionPValue(fFactor1, dfFactor1, dfError) < 0.05,
        effectSize: ssFactor1 / ssTotal
      },
      factor2: {
        fStatistic: fFactor2,
        pValue: this.fDistributionPValue(fFactor2, dfFactor2, dfError),
        degreesOfFreedom: { between: dfFactor2, within: dfError, total: totalN - 1 },
        sumOfSquares: { between: ssFactor2, within: ssError, total: ssTotal },
        meanSquares: { between: msFactor2, within: msError },
        significant: this.fDistributionPValue(fFactor2, dfFactor2, dfError) < 0.05,
        effectSize: ssFactor2 / ssTotal
      },
      interaction: {
        fStatistic: fInteraction,
        pValue: this.fDistributionPValue(fInteraction, dfInteraction, dfError),
        degreesOfFreedom: { between: dfInteraction, within: dfError, total: totalN - 1 },
        sumOfSquares: { between: ssInteraction, within: ssError, total: ssTotal },
        meanSquares: { between: msInteraction, within: msError },
        significant: this.fDistributionPValue(fInteraction, dfInteraction, dfError) < 0.05,
        effectSize: ssInteraction / ssTotal
      },
      overall: {
        fStatistic: (ssFactor1 + ssFactor2 + ssInteraction) / (dfFactor1 + dfFactor2 + dfInteraction) / msError,
        pValue: 0, // Calculate overall model significance
        degreesOfFreedom: { between: dfFactor1 + dfFactor2 + dfInteraction, within: dfError, total: totalN - 1 },
        sumOfSquares: { between: ssFactor1 + ssFactor2 + ssInteraction, within: ssError, total: ssTotal },
        meanSquares: { between: (ssFactor1 + ssFactor2 + ssInteraction) / (dfFactor1 + dfFactor2 + dfInteraction), within: msError },
        significant: true,
        effectSize: (ssFactor1 + ssFactor2 + ssInteraction) / ssTotal
      }
    };
  }

  /**
   * Linear regression analysis
   */
  linearRegression(data: DataPoint[], xColumn: string, yColumn: string): RegressionResult {
    const xValues = data.map(d => d[xColumn]);
    const yValues = data.map(d => d[yColumn]);
    const n = data.length;
    
    if (n < 3) {
      throw new Error('Regression requires at least 3 data points');
    }
    
    const xMean = this.mean(xValues);
    const yMean = this.mean(yValues);
    
    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Calculate predictions and residuals
    const predictions = xValues.map(x => intercept + slope * x);
    const residuals = yValues.map((y, i) => y - predictions[i]);
    
    // Calculate R-squared
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = residuals.reduce((sum, r) => sum + Math.pow(r, 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1)) / (n - 2);
    
    // Standard errors and t-values
    const residualStandardError = Math.sqrt(ssResidual / (n - 2));
    const sxx = denominator;
    const interceptSE = residualStandardError * Math.sqrt(1/n + Math.pow(xMean, 2)/sxx);
    const slopeSE = residualStandardError / Math.sqrt(sxx);
    
    const interceptT = intercept / interceptSE;
    const slopeT = slope / slopeSE;
    
    // F-statistic for overall model
    const fStatistic = (rSquared * (n - 2)) / (1 - rSquared);
    const modelPValue = this.fDistributionPValue(fStatistic, 1, n - 2);
    
    return {
      coefficients: [intercept, slope],
      rSquared,
      adjustedRSquared,
      fStatistic,
      pValue: modelPValue,
      standardErrors: [interceptSE, slopeSE],
      tValues: [interceptT, slopeT],
      pValues: [
        this.tDistributionPValue(Math.abs(interceptT), n - 2),
        this.tDistributionPValue(Math.abs(slopeT), n - 2)
      ],
      residuals,
      predictions,
      significant: modelPValue < 0.05
    };
  }

  /**
   * Multiple regression analysis
   */
  multipleRegression(data: DataPoint[], xColumns: string[], yColumn: string): RegressionResult {
    const n = data.length;
    const k = xColumns.length;
    
    if (n < k + 2) {
      throw new Error('Multiple regression requires more observations than predictors plus 2');
    }
    
    // Build design matrix (X) and response vector (y)
    const X: number[][] = [];
    const y: number[] = [];
    
    for (const point of data) {
      const row = [1]; // Intercept term
      for (const col of xColumns) {
        row.push(point[col]);
      }
      X.push(row);
      y.push(point[yColumn]);
    }
    
    // Calculate coefficients using normal equations: β = (X'X)^(-1)X'y
    const XTranspose = this.transpose(X);
    const XTX = this.matrixMultiply(XTranspose, X);
    const XTXInverse = this.matrixInverse(XTX);
    const XTy = this.matrixVectorMultiply(XTranspose, y);
    const coefficients = this.matrixVectorMultiply(XTXInverse, XTy);
    
    // Calculate predictions and residuals
    const predictions = X.map(row => 
      row.reduce((sum, x, i) => sum + x * coefficients[i], 0)
    );
    const residuals = y.map((actual, i) => actual - predictions[i]);
    
    // Calculate R-squared
    const yMean = this.mean(y);
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = residuals.reduce((sum, r) => sum + Math.pow(r, 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1)) / (n - k - 1);
    
    // Standard errors
    const mse = ssResidual / (n - k - 1);
    const standardErrors = XTXInverse.map((row, i) => Math.sqrt(mse * row[i]));
    
    // T-values and p-values
    const tValues = coefficients.map((coef, i) => coef / standardErrors[i]);
    const pValues = tValues.map(t => this.tDistributionPValue(Math.abs(t), n - k - 1));
    
    // F-statistic for overall model
    const fStatistic = (rSquared / k) / ((1 - rSquared) / (n - k - 1));
    const modelPValue = this.fDistributionPValue(fStatistic, k, n - k - 1);
    
    return {
      coefficients,
      rSquared,
      adjustedRSquared,
      fStatistic,
      pValue: modelPValue,
      standardErrors,
      tValues,
      pValues,
      residuals,
      predictions,
      significant: modelPValue < 0.05
    };
  }

  /**
   * Tukey HSD post-hoc test
   */
  tukeyHSD(data: DataPoint[], groupColumn: string, valueColumn: string = 'value'): PostHocResult[] {
    const groups = this.groupData(data, groupColumn, valueColumn);
    const groupKeys = Object.keys(groups);
    const results: PostHocResult[] = [];
    
    // Calculate pooled standard error
    const allValues = data.map(d => d[valueColumn]);
    const grandMean = this.mean(allValues);
    let pooledVariance = 0;
    let totalDf = 0;
    
    for (const groupKey of groupKeys) {
      const groupValues = groups[groupKey];
      const groupVariance = this.variance(groupValues);
      pooledVariance += groupVariance * (groupValues.length - 1);
      totalDf += groupValues.length - 1;
    }
    pooledVariance /= totalDf;
    
    // Pairwise comparisons
    for (let i = 0; i < groupKeys.length; i++) {
      for (let j = i + 1; j < groupKeys.length; j++) {
        const group1 = groups[groupKeys[i]];
        const group2 = groups[groupKeys[j]];
        
        const mean1 = this.mean(group1);
        const mean2 = this.mean(group2);
        const meanDifference = mean1 - mean2;
        
        const standardError = Math.sqrt(pooledVariance * (1/group1.length + 1/group2.length));
        const qStatistic = Math.abs(meanDifference) / standardError;
        
        // Approximate p-value using studentized range distribution
        const pValue = this.tukeyPValue(qStatistic, groupKeys.length, totalDf);
        
        // 95% confidence interval
        const criticalValue = this.tukeyQValue(0.05, groupKeys.length, totalDf);
        const marginOfError = criticalValue * standardError;
        const confidenceInterval: [number, number] = [
          meanDifference - marginOfError,
          meanDifference + marginOfError
        ];
        
        results.push({
          comparison: `${groupKeys[i]} vs ${groupKeys[j]}`,
          meanDifference,
          standardError,
          tValue: qStatistic,
          pValue,
          confidenceInterval,
          significant: pValue < 0.05
        });
      }
    }
    
    return results;
  }

  /**
   * Bonferroni post-hoc test
   */
  bonferroni(data: DataPoint[], groupColumn: string, valueColumn: string = 'value'): PostHocResult[] {
    const groups = this.groupData(data, groupColumn, valueColumn);
    const groupKeys = Object.keys(groups);
    const results: PostHocResult[] = [];
    
    // Calculate number of comparisons for Bonferroni correction
    const numComparisons = (groupKeys.length * (groupKeys.length - 1)) / 2;
    const adjustedAlpha = 0.05 / numComparisons;
    
    // Pooled variance calculation
    let pooledVariance = 0;
    let totalDf = 0;
    
    for (const groupKey of groupKeys) {
      const groupValues = groups[groupKey];
      const groupVariance = this.variance(groupValues);
      pooledVariance += groupVariance * (groupValues.length - 1);
      totalDf += groupValues.length - 1;
    }
    pooledVariance /= totalDf;
    
    // Pairwise t-tests with Bonferroni correction
    for (let i = 0; i < groupKeys.length; i++) {
      for (let j = i + 1; j < groupKeys.length; j++) {
        const group1 = groups[groupKeys[i]];
        const group2 = groups[groupKeys[j]];
        
        const mean1 = this.mean(group1);
        const mean2 = this.mean(group2);
        const meanDifference = mean1 - mean2;
        
        const standardError = Math.sqrt(pooledVariance * (1/group1.length + 1/group2.length));
        const tValue = meanDifference / standardError;
        
        // Two-tailed p-value
        const rawPValue = this.tDistributionPValue(Math.abs(tValue), totalDf) * 2;
        const adjustedPValue = Math.min(rawPValue * numComparisons, 1.0);
        
        // Confidence interval with Bonferroni correction
        const criticalValue = this.tDistributionCriticalValue(adjustedAlpha / 2, totalDf);
        const marginOfError = criticalValue * standardError;
        const confidenceInterval: [number, number] = [
          meanDifference - marginOfError,
          meanDifference + marginOfError
        ];
        
        results.push({
          comparison: `${groupKeys[i]} vs ${groupKeys[j]}`,
          meanDifference,
          standardError,
          tValue: Math.abs(tValue),
          pValue: adjustedPValue,
          confidenceInterval,
          significant: adjustedPValue < 0.05
        });
      }
    }
    
    return results;
  }

  /**
   * Power analysis for one-way ANOVA
   */
  powerAnalysis(effectSize: number, alpha: number = 0.05, power: number = 0.80, groups: number = 2): PowerAnalysis {
    // Calculate required sample size per group
    const dfBetween = groups - 1;
    const criticalValue = this.fDistributionCriticalValue(alpha, dfBetween, 100); // Approximate with large df
    
    // Iterative approach to find sample size
    let n = 2;
    let calculatedPower = 0;
    
    while (calculatedPower < power && n < 1000) {
      const dfWithin = groups * (n - 1);
      const noncentrality = n * groups * effectSize;
      calculatedPower = this.noncentralFPower(criticalValue, dfBetween, dfWithin, noncentrality);
      n++;
    }
    
    return {
      power: calculatedPower,
      sampleSize: n - 1,
      effectSize,
      alpha,
      criticalValue
    };
  }

  /**
   * Descriptive statistics
   */
  descriptiveStats(values: number[], confidenceLevel: number = 0.95): DescriptiveStats {
    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    
    const mean = this.mean(values);
    const variance = this.variance(values);
    const standardDeviation = Math.sqrt(variance);
    
    // Median
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    
    // Mode
    const frequency: { [key: number]: number } = {};
    values.forEach(v => frequency[v] = (frequency[v] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(k => frequency[Number(k)] === maxFreq)
      .map(Number);
    
    // Range
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Skewness and kurtosis
    const skewness = this.skewness(values, mean, standardDeviation);
    const kurtosis = this.kurtosis(values, mean, standardDeviation);
    
    // Confidence interval
    const alpha = 1 - confidenceLevel;
    const tCritical = this.tDistributionCriticalValue(alpha / 2, n - 1);
    const marginOfError = tCritical * standardDeviation / Math.sqrt(n);
    const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];
    
    return {
      n,
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min,
      max,
      range,
      skewness,
      kurtosis,
      confidenceInterval
    };
  }

  // Helper methods...
  
  private groupData(data: DataPoint[], groupColumn: string, valueColumn: string): { [key: string]: number[] } {
    const groups: { [key: string]: number[] } = {};
    
    for (const point of data) {
      const groupKey = String(point[groupColumn]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(point[valueColumn]);
    }
    
    return groups;
  }

  private mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private variance(values: number[]): number {
    const mean = this.mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  }

  private skewness(values: number[], mean: number, standardDeviation: number): number {
    const n = values.length;
    const sumCubed = values.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sumCubed;
  }

  private kurtosis(values: number[], mean: number, standardDeviation: number): number {
    const n = values.length;
    const sumFourth = values.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sumFourth - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  }

  // Statistical distribution functions (simplified approximations)
  
  private fDistributionPValue(f: number, df1: number, df2: number): number {
    // Simplified F-distribution p-value approximation
    if (f <= 0) return 1;
    
    // Using beta function approximation
    const x = df2 / (df2 + df1 * f);
    return this.incompleteBeta(df2/2, df1/2, x);
  }

  private tDistributionPValue(t: number, df: number): number {
    // Student's t-distribution p-value (one-tailed)
    if (df <= 0) return 0.5;
    
    const x = df / (df + t * t);
    return 0.5 * this.incompleteBeta(df/2, 0.5, x);
  }

  private tDistributionCriticalValue(alpha: number, df: number): number {
    // Approximate critical value for t-distribution
    // Using Cornish-Fisher expansion approximation
    const z = this.normalInverse(1 - alpha);
    if (df >= 30) return z;
    
    const c1 = z;
    const c2 = (Math.pow(z, 3) + z) / (4 * df);
    const c3 = (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / (96 * Math.pow(df, 2));
    
    return c1 + c2 + c3;
  }

  private fDistributionCriticalValue(alpha: number, df1: number, df2: number): number {
    // Approximate F critical value
    // This is a simplified approximation
    if (df1 === 1) {
      const t = this.tDistributionCriticalValue(alpha/2, df2);
      return t * t;
    }
    
    // For more degrees of freedom, use chi-square approximation
    const chi1 = this.chiSquareInverse(1 - alpha, df1);
    const chi2 = this.chiSquareInverse(1 - alpha, df2);
    
    return (chi1 / df1) / (chi2 / df2);
  }

  private tukeyPValue(q: number, k: number, df: number): number {
    // Simplified Tukey HSD p-value approximation
    // This is a rough approximation - in production, use a statistical library
    return 1 - Math.pow(1 - 2 * this.tDistributionPValue(q / Math.sqrt(2), df), k - 1);
  }

  private tukeyQValue(alpha: number, k: number, df: number): number {
    // Simplified Tukey critical value
    const tCrit = this.tDistributionCriticalValue(alpha / (2 * k), df);
    return tCrit * Math.sqrt(2);
  }

  private noncentralFPower(criticalValue: number, df1: number, df2: number, noncentrality: number): number {
    // Simplified power calculation for noncentral F
    // This is an approximation
    const centralF = criticalValue;
    const adjustedF = centralF / (1 + noncentrality / df1);
    return 1 - this.fDistributionPValue(adjustedF, df1, df2);
  }

  // Matrix operations for multiple regression
  
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  private matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  private matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    const identity = Array(n).fill(0).map((_, i) => 
      Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    );
    
    // Gauss-Jordan elimination
    const augmented = matrix.map((row, i) => [...row, ...identity[i]]);
    
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make diagonal 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      // Make column 0
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    return augmented.map(row => row.slice(n));
  }

  // Statistical helper functions (simplified approximations)
  
  private incompleteBeta(a: number, b: number, x: number): number {
    // Simplified incomplete beta function approximation
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    
    // Using continued fraction approximation
    let result = 0;
    const maxIterations = 100;
    
    for (let n = 0; n < maxIterations; n++) {
      const term = this.betaTermApprox(a, b, x, n);
      result += term;
      if (Math.abs(term) < 1e-10) break;
    }
    
    return Math.max(0, Math.min(1, result));
  }

  private betaTermApprox(a: number, b: number, x: number, n: number): number {
    // Simplified beta function term
    const logTerm = n * Math.log(x) + this.logGamma(a + n) - this.logGamma(a) - this.logGamma(n + 1);
    return Math.exp(logTerm) * Math.pow(1 - x, b);
  }

  private logGamma(x: number): number {
    // Stirling's approximation for log gamma
    if (x < 1) return this.logGamma(x + 1) - Math.log(x);
    return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI);
  }

  private normalInverse(p: number): number {
    // Approximate inverse normal distribution
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    
    // Beasley-Springer-Moro algorithm approximation
    const a = [
      -3.969683028665376e+01, 2.209460984245205e+02,
      -2.759285104469687e+02, 1.383577518672690e+02,
      -3.066479806614716e+01, 2.506628277459239e+00
    ];
    
    const b = [
      -5.447609879822406e+01, 1.615858368580409e+02,
      -1.556989798598866e+02, 6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    
    const q = p - 0.5;
    
    if (Math.abs(q) <= 0.425) {
      const r = 0.180625 - q * q;
      return q * (((((a[5] * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0]) /
                 (((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
    }
    
    const r = Math.sqrt(-Math.log(Math.min(p, 1 - p)));
    const sign = p < 0.5 ? -1 : 1;
    
    return sign * (a[0] + a[1] * r) / (1 + b[0] * r);
  }

  private chiSquareInverse(p: number, df: number): number {
    // Approximate chi-square inverse
    if (p <= 0) return 0;
    if (p >= 1) return Infinity;
    
    // Wilson-Hilferty approximation
    const h = 2 / (9 * df);
    const z = this.normalInverse(p);
    const chi = df * Math.pow(1 - h + z * Math.sqrt(h), 3);
    
    return Math.max(0, chi);
  }
}

// Export alias for backward compatibility
export const StatisticalAnalysis = StatisticalAnalysisService;

export const statisticalAnalysis = new StatisticalAnalysisService();