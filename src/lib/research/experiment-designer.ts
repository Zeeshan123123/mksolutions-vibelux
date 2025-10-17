import { Experiment, Treatment, Block } from '@prisma/client';

export interface ExperimentDesign {
  type: 'CRD' | 'RCBD' | 'Factorial' | 'SplitPlot' | 'LatinSquare';
  treatments: TreatmentDesign[];
  blocks?: BlockDesign[];
  replications: number;
  totalUnits: number;
  randomization: RandomizationScheme;
  layout: ExperimentalUnit[][];
}

export interface TreatmentDesign {
  name: string;
  levels?: { factor: string; level: string }[];
  description?: string;
}

export interface BlockDesign {
  name: string;
  size: number;
  description?: string;
}

export interface RandomizationScheme {
  method: string;
  seed?: number;
  assignments: {
    unit: number;
    treatment: string;
    block?: string;
    row?: number;
    column?: number;
  }[];
}

export interface ExperimentalUnit {
  id: number;
  treatment: string;
  block?: string;
  row?: number;
  column?: number;
  position?: { x: number; y: number };
}

export interface SampleSizeParams {
  alpha?: number;
  power?: number;
  effectSize?: number;
  variability?: number;
  designType: 'CRD' | 'RCBD' | 'Factorial';
  numTreatments?: number;
  numBlocks?: number;
  numFactors?: number;
  levelsPerFactor?: number[];
}

export class ExperimentDesigner {
  // Completely Randomized Design (CRD)
  static createCRD(
    treatments: string[],
    replications: number,
    seed?: number
  ): ExperimentDesign {
    const totalUnits = treatments.length * replications;
    const units: ExperimentalUnit[] = [];
    const assignments: RandomizationScheme['assignments'] = [];

    // Create units with treatments
    let unitId = 0;
    for (const treatment of treatments) {
      for (let rep = 0; rep < replications; rep++) {
        units.push({
          id: unitId,
          treatment,
        });
        unitId++;
      }
    }

    // Randomize
    const randomized = this.fisherYatesShuffle(units, seed);
    
    // Create assignments
    randomized.forEach((unit, index) => {
      assignments.push({
        unit: index,
        treatment: unit.treatment,
      });
    });

    // Create layout (single row for CRD)
    const layout = [randomized];

    return {
      type: 'CRD',
      treatments: treatments.map(t => ({ name: t })),
      replications,
      totalUnits,
      randomization: {
        method: 'Complete Randomization',
        seed,
        assignments,
      },
      layout,
    };
  }

  // Randomized Complete Block Design (RCBD)
  static createRCBD(
    treatments: string[],
    numBlocks: number,
    seed?: number
  ): ExperimentDesign {
    const totalUnits = treatments.length * numBlocks;
    const blocks: BlockDesign[] = [];
    const units: ExperimentalUnit[] = [];
    const assignments: RandomizationScheme['assignments'] = [];
    const layout: ExperimentalUnit[][] = [];

    // Create blocks
    for (let b = 0; b < numBlocks; b++) {
      blocks.push({
        name: `Block ${b + 1}`,
        size: treatments.length,
      });
    }

    // Randomize within each block
    let unitId = 0;
    const rng = this.createRNG(seed);

    for (let b = 0; b < numBlocks; b++) {
      const blockUnits: ExperimentalUnit[] = [];
      
      // Create units for this block
      const blockTreatments = [...treatments];
      const randomizedTreatments = this.fisherYatesShuffle(blockTreatments, rng());

      randomizedTreatments.forEach((treatment, index) => {
        const unit: ExperimentalUnit = {
          id: unitId,
          treatment,
          block: blocks[b].name,
          row: b,
          column: index,
        };
        units.push(unit);
        blockUnits.push(unit);
        
        assignments.push({
          unit: unitId,
          treatment,
          block: blocks[b].name,
          row: b,
          column: index,
        });
        
        unitId++;
      });

      layout.push(blockUnits);
    }

    return {
      type: 'RCBD',
      treatments: treatments.map(t => ({ name: t })),
      blocks,
      replications: numBlocks,
      totalUnits,
      randomization: {
        method: 'Randomized Complete Blocks',
        seed,
        assignments,
      },
      layout,
    };
  }

  // Factorial Design
  static createFactorial(
    factors: { name: string; levels: string[] }[],
    replications: number,
    seed?: number
  ): ExperimentDesign {
    // Generate all treatment combinations
    const treatments = this.generateFactorialTreatments(factors);
    const totalUnits = treatments.length * replications;
    const units: ExperimentalUnit[] = [];
    const assignments: RandomizationScheme['assignments'] = [];

    // Create units
    let unitId = 0;
    treatments.forEach(treatment => {
      for (let rep = 0; rep < replications; rep++) {
        units.push({
          id: unitId,
          treatment: treatment.name,
        });
        unitId++;
      }
    });

    // Randomize
    const randomized = this.fisherYatesShuffle(units, seed);
    
    // Create assignments
    randomized.forEach((unit, index) => {
      assignments.push({
        unit: index,
        treatment: unit.treatment,
      });
    });

    // Create layout
    const layout = [randomized];

    return {
      type: 'Factorial',
      treatments,
      replications,
      totalUnits,
      randomization: {
        method: 'Complete Randomization (Factorial)',
        seed,
        assignments,
      },
      layout,
    };
  }

  // Latin Square Design
  static createLatinSquare(
    treatments: string[],
    seed?: number
  ): ExperimentDesign {
    const n = treatments.length;
    const totalUnits = n * n;
    const units: ExperimentalUnit[] = [];
    const assignments: RandomizationScheme['assignments'] = [];
    const layout: ExperimentalUnit[][] = [];

    // Generate standard Latin square
    const square = this.generateStandardLatinSquare(n);
    
    // Randomize rows, columns, and treatment labels
    const rng = this.createRNG(seed);
    const rowPerm = this.generatePermutation(n, rng());
    const colPerm = this.generatePermutation(n, rng());
    const treatPerm = this.generatePermutation(n, rng());

    // Apply permutations
    let unitId = 0;
    for (let i = 0; i < n; i++) {
      const row: ExperimentalUnit[] = [];
      for (let j = 0; j < n; j++) {
        const origRow = rowPerm[i];
        const origCol = colPerm[j];
        const treatIndex = square[origRow][origCol];
        const treatment = treatments[treatPerm[treatIndex]];
        
        const unit: ExperimentalUnit = {
          id: unitId,
          treatment,
          row: i,
          column: j,
        };
        
        units.push(unit);
        row.push(unit);
        
        assignments.push({
          unit: unitId,
          treatment,
          row: i,
          column: j,
        });
        
        unitId++;
      }
      layout.push(row);
    }

    return {
      type: 'LatinSquare',
      treatments: treatments.map(t => ({ name: t })),
      replications: 1,
      totalUnits,
      randomization: {
        method: 'Latin Square',
        seed,
        assignments,
      },
      layout,
    };
  }

  // Sample size calculation
  static calculateSampleSize(params: SampleSizeParams): {
    sampleSize: number;
    totalUnits: number;
    power: number;
    detailsdetectable: string;
  } {
    const {
      alpha = 0.05,
      power = 0.8,
      effectSize = 0.5,
      variability = 1,
      designType,
      numTreatments = 2,
      numBlocks = 1,
    } = params;

    let sampleSize: number;
    let totalUnits: number;
    let details: string;

    switch (designType) {
      case 'CRD': {
        // For CRD: n = 2σ²(z_α/2 + z_β)² / δ²
        const zAlpha = this.normalQuantile(1 - alpha / 2);
        const zBeta = this.normalQuantile(power);
        const delta = effectSize * variability;
        
        sampleSize = Math.ceil(
          2 * Math.pow(variability, 2) * Math.pow(zAlpha + zBeta, 2) / Math.pow(delta, 2)
        );
        
        totalUnits = sampleSize * numTreatments;
        details = `${sampleSize} replications per treatment`;
        break;
      }

      case 'RCBD': {
        // For RCBD: Adjust for blocking efficiency
        const blockingEfficiency = 0.75; // Assumed efficiency
        const zAlpha = this.normalQuantile(1 - alpha / 2);
        const zBeta = this.normalQuantile(power);
        const delta = effectSize * variability;
        
        const baseSampleSize = Math.ceil(
          2 * Math.pow(variability, 2) * Math.pow(zAlpha + zBeta, 2) / Math.pow(delta, 2)
        );
        
        sampleSize = Math.ceil(baseSampleSize * blockingEfficiency);
        totalUnits = numTreatments * numBlocks;
        details = `${numBlocks} complete blocks`;
        break;
      }

      case 'Factorial': {
        // For factorial: Account for main effects and interactions
        const numFactors = params.numFactors || 2;
        const levelsPerFactor = params.levelsPerFactor || [2, 2];
        const numCombinations = levelsPerFactor.reduce((a, b) => a * b, 1);
        
        const zAlpha = this.normalQuantile(1 - alpha / 2);
        const zBeta = this.normalQuantile(power);
        const delta = effectSize * variability;
        
        const baseSampleSize = Math.ceil(
          2 * Math.pow(variability, 2) * Math.pow(zAlpha + zBeta, 2) / Math.pow(delta, 2)
        );
        
        // Adjust for factorial complexity
        const adjustmentFactor = 1 + 0.1 * (numFactors - 1);
        sampleSize = Math.ceil(baseSampleSize * adjustmentFactor / numCombinations);
        
        totalUnits = sampleSize * numCombinations;
        details = `${sampleSize} replications per treatment combination`;
        break;
      }

      default:
        throw new Error(`Unsupported design type: ${designType}`);
    }

    return {
      sampleSize,
      totalUnits,
      power,
      detectable: details,
    };
  }

  // Generate protocol document
  static generateProtocol(
    design: ExperimentDesign,
    metadata: {
      title: string;
      objectives: string[];
      hypothesis: string;
      duration: string;
      location: string;
      personnel: string[];
    }
  ): string {
    const protocol = `
# Experimental Protocol

## Title
${metadata.title}

## Objectives
${metadata.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## Hypothesis
${metadata.hypothesis}

## Experimental Design
- **Design Type**: ${design.type}
- **Number of Treatments**: ${design.treatments.length}
- **Replications**: ${design.replications}
- **Total Experimental Units**: ${design.totalUnits}
${design.blocks ? `- **Number of Blocks**: ${design.blocks.length}` : ''}

## Treatments
${design.treatments.map((t, i) => `${i + 1}. ${t.name}${t.description ? `: ${t.description}` : ''}`).join('\n')}

## Randomization
- **Method**: ${design.randomization.method}
${design.randomization.seed ? `- **Random Seed**: ${design.randomization.seed}` : ''}

## Layout
\`\`\`
${this.formatLayout(design.layout)}
\`\`\`

## Timeline
- **Duration**: ${metadata.duration}
- **Location**: ${metadata.location}

## Personnel
${metadata.personnel.map((person, i) => `${i + 1}. ${person}`).join('\n')}

## Data Collection
1. Record all measurements according to the randomized layout
2. Note any deviations from the protocol
3. Document environmental conditions
4. Take photographs for visual documentation

## Statistical Analysis Plan
1. Check assumptions (normality, homogeneity of variance)
2. Perform ${design.type === 'CRD' ? 'one-way ANOVA' : design.type === 'RCBD' ? 'two-way ANOVA with blocking' : 'factorial ANOVA'}
3. If significant, conduct post-hoc tests (Tukey HSD)
4. Report means, standard errors, and confidence intervals

## Quality Control
1. Calibrate all measurement instruments before use
2. Use standardized data collection forms
3. Double-check data entry
4. Maintain chain of custody for samples
`;

    return protocol;
  }

  // Helper functions
  private static fisherYatesShuffle<T>(array: T[], seed?: number): T[] {
    const result = [...array];
    const rng = this.createRNG(seed);
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
  }

  private static createRNG(seed?: number): () => number {
    if (!seed) {
      return Math.random;
    }
    
    // Simple linear congruential generator
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  private static generatePermutation(n: number, seed?: number): number[] {
    const perm = Array.from({ length: n }, (_, i) => i);
    return this.fisherYatesShuffle(perm, seed);
  }

  private static generateStandardLatinSquare(n: number): number[][] {
    const square: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        row.push((i + j) % n);
      }
      square.push(row);
    }
    return square;
  }

  private static generateFactorialTreatments(
    factors: { name: string; levels: string[] }[]
  ): TreatmentDesign[] {
    const treatments: TreatmentDesign[] = [];
    
    // Generate all combinations
    const generateCombinations = (
      index: number,
      current: { factor: string; level: string }[]
    ): void => {
      if (index === factors.length) {
        const name = current.map(c => c.level).join('');
        treatments.push({
          name,
          levels: [...current],
        });
        return;
      }
      
      for (const level of factors[index].levels) {
        generateCombinations(index + 1, [
          ...current,
          { factor: factors[index].name, level },
        ]);
      }
    };
    
    generateCombinations(0, []);
    return treatments;
  }

  private static formatLayout(layout: ExperimentalUnit[][]): string {
    if (layout.length === 1) {
      // Single row layout (CRD)
      return layout[0].map(u => u.treatment).join(' ');
    }
    
    // Multi-row layout (RCBD, Latin Square)
    return layout
      .map(row => row.map(u => u.treatment.padEnd(8)).join(' '))
      .join('\n');
  }

  private static normalQuantile(p: number): number {
    // Approximation using rational function
    const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
    const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
    
    const y = p - 0.5;
    const r = y * y;
    return y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) /
               ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
  }
}