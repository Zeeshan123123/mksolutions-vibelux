// Cultivation-specific task templates and labor management
// Includes depruning, LST, SCROG, defol, and other plant training techniques

export interface CultivationTask {
  id: string;
  name: string;
  description: string;
  category: 'training' | 'pruning' | 'maintenance' | 'harvest' | 'inspection';
  technique: string;
  growthStage: 'seedling' | 'vegetative' | 'early-flower' | 'mid-flower' | 'late-flower';
  estimatedTime: number; // minutes per plant
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredTools: string[];
  safetyNotes: string[];
  qualityChecks: string[];
  timing: {
    frequency: string;
    optimalWindow: string;
    avoidTimes: string[];
  };
  expectedOutcomes: string[];
  commonMistakes: string[];
  qrCodeData?: {
    type: 'technique' | 'plant' | 'location';
    instructions: string[];
    videoLinks?: string[];
  };
}

export interface LaborEfficiencyMetrics {
  taskId: string;
  workerId: string;
  plantsProcessed: number;
  timeSpent: number; // minutes
  qualityScore: number; // 1-10
  errorCount: number;
  timestamp: Date;
  notes?: string;
}

export const cultivationTaskTemplates: Record<string, CultivationTask> = {
  // PRUNING TECHNIQUES
  'depruning-lower-branches': {
    id: 'depruning-lower-branches',
    name: 'Depruning - Lower Branch Removal',
    description: 'Remove lower branches that receive insufficient light to focus plant energy on top colas',
    category: 'pruning',
    technique: 'Depruning',
    growthStage: 'early-flower',
    estimatedTime: 8,
    difficulty: 'intermediate',
    requiredTools: [
      'Sharp pruning shears',
      'Sterilizing alcohol',
      'Disposable gloves',
      'Collection container',
      'Plant labels'
    ],
    safetyNotes: [
      'Sterilize tools between plants to prevent disease spread',
      'Wear gloves to avoid contamination',
      'Do not remove more than 30% of plant material at once',
      'Work during lights-on period when stomata are open'
    ],
    qualityChecks: [
      'Clean cuts made at 45-degree angle',
      'No damage to main stem or remaining branches',
      'Removed material properly disposed',
      'Plant stress minimized'
    ],
    timing: {
      frequency: 'Once during early flower (days 1-21)',
      optimalWindow: '2-3 hours after lights on',
      avoidTimes: ['Last 2 hours before lights off', 'Within 24hrs of watering']
    },
    expectedOutcomes: [
      'Improved light penetration to upper canopy',
      'Reduced risk of mold/mildew in lower canopy',
      'Energy focus on top cola development',
      'Easier access for maintenance'
    ],
    commonMistakes: [
      'Removing too much material at once',
      'Cutting too close to main stem',
      'Not sterilizing tools between plants',
      'Performing during stress periods'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Identify branches below 12" from soil surface',
        'Sterilize pruning shears with alcohol',
        'Make clean cut at 45° angle close to main stem',
        'Remove no more than 30% of total plant mass',
        'Document plant response in next 24-48 hours'
      ]
    }
  },

  'lollipopping': {
    id: 'lollipopping',
    name: 'Lollipopping',
    description: 'Remove all growth below the canopy level to create a "lollipop" shape focusing energy on top colas',
    category: 'pruning',
    technique: 'Lollipopping',
    growthStage: 'early-flower',
    estimatedTime: 15,
    difficulty: 'advanced',
    requiredTools: [
      'Sharp pruning shears',
      'Trimming scissors',
      'Sterilizing alcohol',
      'Disposable gloves',
      'Measuring tape'
    ],
    safetyNotes: [
      'This is an aggressive technique - ensure plants are healthy',
      'Never lollipop stressed or recently transplanted plants',
      'Consider plant genetics - some strains respond better than others',
      'Monitor plants closely for 48 hours post-treatment'
    ],
    qualityChecks: [
      'Uniform canopy height maintained',
      'Clean cuts with no jagged edges',
      'Main stem and cola sites undamaged',
      'Proper disposal of removed material'
    ],
    timing: {
      frequency: 'Once during flip to flower (days 1-14)',
      optimalWindow: 'Early in light cycle',
      avoidTimes: ['Late flower', 'During feeding', 'Hot weather']
    },
    expectedOutcomes: [
      'Significantly improved cola development',
      'Better air circulation',
      'Reduced risk of lower canopy issues',
      'Higher quality harvest'
    ],
    commonMistakes: [
      'Performing too late in flower cycle',
      'Removing too much too quickly',
      'Not considering strain characteristics',
      'Poor timing relative to other stressors'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Identify the bottom 1/3 of the plant',
        'Remove ALL growth below canopy line',
        'Focus on preserving 6-8 main cola sites',
        'Clean up any remaining sucker shoots',
        'Monitor recovery for 48 hours'
      ]
    }
  },

  // TRAINING TECHNIQUES
  'lst-low-stress-training': {
    id: 'lst-low-stress-training',
    name: 'LST - Low Stress Training',
    description: 'Gently bend and tie branches to create an even canopy and increase cola sites',
    category: 'training',
    technique: 'LST',
    growthStage: 'vegetative',
    estimatedTime: 12,
    difficulty: 'beginner',
    requiredTools: [
      'Soft plant ties',
      'Training clips',
      'Small stakes',
      'Measuring tape',
      'Plant labels'
    ],
    safetyNotes: [
      'Never force branches - work gradually over multiple sessions',
      'Check ties regularly to prevent cutting into stems',
      'Ensure adequate support for bent branches',
      'Avoid training immediately after watering'
    ],
    qualityChecks: [
      'Even canopy height across all trained branches',
      'No damage to branch tissue',
      'Proper tie placement avoiding nodes',
      'Adequate support structure'
    ],
    timing: {
      frequency: 'Weekly during vegetative growth',
      optimalWindow: 'When stems are pliable (early in day)',
      avoidTimes: ['Immediately after watering', 'During heat stress']
    },
    expectedOutcomes: [
      'Increased number of cola sites',
      'More even light distribution',
      'Better plant structure',
      'Increased yield potential'
    ],
    commonMistakes: [
      'Training too aggressively',
      'Not adjusting ties as plant grows',
      'Poor anchor point selection',
      'Training during stress periods'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Identify main stem and primary branches',
        'Gently bend main stem to horizontal position',
        'Secure with soft ties to container edge',
        'Train secondary branches outward',
        'Adjust ties weekly as plant grows'
      ]
    }
  },

  'scrog-screen-of-green': {
    id: 'scrog-screen-of-green',
    name: 'SCROG - Screen of Green',
    description: 'Use a screen to train plants horizontally and create an even canopy for maximum light utilization',
    category: 'training',
    technique: 'SCROG',
    growthStage: 'vegetative',
    estimatedTime: 20,
    difficulty: 'intermediate',
    requiredTools: [
      'SCROG net/screen',
      'Support posts',
      'Zip ties',
      'Pruning shears',
      'Measuring tape'
    ],
    safetyNotes: [
      'Install screen before plant reaches 12" height',
      'Ensure screen is level and properly supported',
      'Regularly check for branches growing through screen',
      'Plan for flower stretch (2-3x height increase)'
    ],
    qualityChecks: [
      'Screen properly installed and level',
      'Even distribution of branches across screen',
      'No branches left hanging below screen',
      'Adequate spacing between cola sites'
    ],
    timing: {
      frequency: 'Daily weaving during vegetative growth',
      optimalWindow: 'When new growth is 2-3 inches above screen',
      avoidTimes: ['After stretch phase begins', 'During watering']
    },
    expectedOutcomes: [
      'Maximum canopy utilization',
      'Uniform cola development',
      'Increased yield per square foot',
      'Better light penetration'
    ],
    commonMistakes: [
      'Installing screen too late',
      'Insufficient weaving during veg',
      'Not accounting for stretch',
      'Poor screen support structure'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Install screen 8-12" above container',
        'Train branches horizontally under screen',
        'Weave new growth through screen holes',
        'Maintain even canopy level',
        'Switch to flower when screen is 75% full'
      ]
    }
  },

  // MAINTENANCE TASKS
  'defoliation-selective': {
    id: 'defoliation-selective',
    name: 'Selective Defoliation',
    description: 'Remove specific fan leaves to improve light penetration and air circulation',
    category: 'maintenance',
    technique: 'Defoliation',
    growthStage: 'early-flower',
    estimatedTime: 10,
    difficulty: 'advanced',
    requiredTools: [
      'Sharp trimming scissors',
      'Sterilizing alcohol',
      'Disposable gloves',
      'Collection container',
      'Magnifying glass'
    ],
    safetyNotes: [
      'Only remove leaves blocking bud sites',
      'Never remove more than 20% of leaves at once',
      'Avoid defoliation during stress periods',
      'Monitor plant response closely'
    ],
    qualityChecks: [
      'Only fan leaves removed (no sugar leaves)',
      'Clean cuts at petiole base',
      'No damage to surrounding growth',
      'Plant health maintained'
    ],
    timing: {
      frequency: 'Twice during flower (day 1 and day 21)',
      optimalWindow: 'Mid-day when plants are active',
      avoidTimes: ['Late flower', 'Environmental stress', 'Recent feeding']
    },
    expectedOutcomes: [
      'Improved light penetration to lower bud sites',
      'Better air circulation',
      'Reduced humidity pockets',
      'Enhanced cola development'
    ],
    commonMistakes: [
      'Removing too many leaves at once',
      'Taking healthy leaves instead of blocking ones',
      'Poor timing relative to flower stage',
      'Not sterilizing tools'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Identify leaves blocking bud sites',
        'Remove only large fan leaves',
        'Cut at petiole base with clean scissors',
        'Maximum 20% leaf removal per session',
        'Monitor for stress next 24 hours'
      ]
    }
  },

  'supercropping': {
    id: 'supercropping',
    name: 'Supercropping',
    description: 'Stress technique involving pinching/bending stems to create knuckles and increase yield',
    category: 'training',
    technique: 'Supercropping',
    growthStage: 'vegetative',
    estimatedTime: 5,
    difficulty: 'expert',
    requiredTools: [
      'Clean hands',
      'Soft plant ties (backup)',
      'Support stakes',
      'Plant labels',
      'Documentation system'
    ],
    safetyNotes: [
      'HIGH RISK technique - only for experienced growers',
      'Never supercrop sick or stressed plants',
      'Work slowly and feel for the "pop" in stem fibers',
      'Have support ready in case stem breaks'
    ],
    qualityChecks: [
      'Stem bent but not broken',
      'Knuckle formation visible',
      'No complete breaks in vascular system',
      'Plant maintains upright growth'
    ],
    timing: {
      frequency: 'Once per branch during mid-vegetative',
      optimalWindow: 'When stems are thick but still pliable',
      avoidTimes: ['Early veg', 'Flower stage', 'Stress periods']
    },
    expectedOutcomes: [
      'Increased stem strength',
      'Enhanced nutrient flow',
      'Multiple cola development',
      'Increased yield potential'
    ],
    commonMistakes: [
      'Breaking stem completely',
      'Supercropping too late in cycle',
      'Not providing adequate support',
      'Performing on unsuitable genetics'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Select healthy thick stem',
        'Pinch and roll stem between fingers',
        'Feel for internal fiber separation',
        'Gently bend to desired angle',
        'Support if needed with soft tie'
      ]
    }
  },

  // HARVEST TASKS
  'trichome-inspection': {
    id: 'trichome-inspection',
    name: 'Trichome Inspection',
    description: 'Examine trichomes under magnification to determine optimal harvest timing',
    category: 'inspection',
    technique: 'Microscopy',
    growthStage: 'late-flower',
    estimatedTime: 15,
    difficulty: 'intermediate',
    requiredTools: [
      'Jeweler\'s loupe (60x-100x)',
      'Digital microscope',
      'Documentation sheets',
      'Camera for records',
      'Sample collection tools'
    ],
    safetyNotes: [
      'Handle plants gently during inspection',
      'Use clean tools to avoid contamination',
      'Take multiple samples from different bud sites',
      'Document findings thoroughly'
    ],
    qualityChecks: [
      'Multiple sample sites examined',
      'Clear documentation of trichome state',
      'Photos taken for records',
      'Consistent findings across samples'
    ],
    timing: {
      frequency: 'Daily during final 2 weeks of flower',
      optimalWindow: 'Mid-day with good lighting',
      avoidTimes: ['Immediately after watering', 'Low light conditions']
    },
    expectedOutcomes: [
      'Optimal harvest timing determined',
      'Quality predictions made',
      'Documentation for next cycle',
      'Consistent product quality'
    ],
    commonMistakes: [
      'Insufficient sample sites',
      'Poor documentation',
      'Rushing harvest decision',
      'Not accounting for strain variation'
    ],
    qrCodeData: {
      type: 'technique',
      instructions: [
        'Select representative bud sites',
        'Use 60x+ magnification',
        'Look for cloudy/amber ratio',
        'Document percentage breakdown',
        'Take photos for records'
      ]
    }
  }
};

// Labor efficiency tracking
export function calculateLaborEfficiency(
  metrics: LaborEfficiencyMetrics[],
  taskTemplate: CultivationTask
): {
  averageTimePerPlant: number;
  efficiencyScore: number;
  qualityAverage: number;
  recommendations: string[];
} {
  if (metrics.length === 0) {
    return {
      averageTimePerPlant: taskTemplate.estimatedTime,
      efficiencyScore: 0,
      qualityAverage: 0,
      recommendations: ['No data available - start tracking performance']
    };
  }

  const totalPlants = metrics.reduce((sum, m) => sum + m.plantsProcessed, 0);
  const totalTime = metrics.reduce((sum, m) => sum + m.timeSpent, 0);
  const averageTimePerPlant = totalTime / totalPlants;
  
  const qualityAverage = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length;
  const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorCount, 0) / metrics.length;
  
  // Efficiency score based on time vs target and quality
  const timeEfficiency = Math.max(0, 100 - ((averageTimePerPlant - taskTemplate.estimatedTime) / taskTemplate.estimatedTime * 100));
  const qualityFactor = (qualityAverage / 10) * 100;
  const errorPenalty = avgErrorRate * 10;
  
  const efficiencyScore = Math.max(0, Math.min(100, (timeEfficiency + qualityFactor) / 2 - errorPenalty));

  const recommendations: string[] = [];
  
  if (averageTimePerPlant > taskTemplate.estimatedTime * 1.2) {
    recommendations.push('Consider additional training on technique efficiency');
  }
  if (qualityAverage < 7) {
    recommendations.push('Focus on quality improvement - review technique guidelines');
  }
  if (avgErrorRate > 1) {
    recommendations.push('Implement additional quality checks to reduce errors');
  }
  if (efficiencyScore > 90) {
    recommendations.push('Excellent performance - consider mentoring others');
  }

  return {
    averageTimePerPlant,
    efficiencyScore,
    qualityAverage,
    recommendations
  };
}

// QR Code generation for cultivation tasks
export function generateCultivationTaskQR(
  taskId: string,
  plantId: string,
  locationId: string
): {
  qrData: string;
  instructions: string[];
  safetyNotes: string[];
} {
  const task = cultivationTaskTemplates[taskId];
  if (!task) {
    throw new Error(`Unknown task ID: ${taskId}`);
  }

  const qrData = JSON.stringify({
    type: 'cultivation-task',
    taskId,
    plantId,
    locationId,
    timestamp: new Date().toISOString(),
    technique: task.technique
  });

  return {
    qrData,
    instructions: task.qrCodeData?.instructions || [],
    safetyNotes: task.safetyNotes
  };
}

// Workflow templates for common cultivation sequences
export const cultivationWorkflows = {
  'veg-to-flower-prep': {
    name: 'Vegetative to Flower Preparation',
    tasks: [
      'lst-low-stress-training',
      'defoliation-selective',
      'depruning-lower-branches'
    ],
    estimatedTotalTime: 35,
    description: 'Complete plant preparation sequence before flowering'
  },
  'mid-flower-maintenance': {
    name: 'Mid-Flower Maintenance',
    tasks: [
      'lollipopping',
      'defoliation-selective',
      'trichome-inspection'
    ],
    estimatedTotalTime: 40,
    description: 'Essential maintenance during peak flower development'
  }
};

// Helper function to get tasks by growth stage
export function getTasksByGrowthStage(stage: CultivationTask['growthStage']): CultivationTask[] {
  return Object.values(cultivationTaskTemplates).filter(task => task.growthStage === stage);
}

// Helper function to get tasks by difficulty
export function getTasksByDifficulty(difficulty: CultivationTask['difficulty']): CultivationTask[] {
  return Object.values(cultivationTaskTemplates).filter(task => task.difficulty === difficulty);
}