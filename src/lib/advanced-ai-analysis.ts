import { v2 as cloudinary } from 'cloudinary';

// Google Vision API types
interface GoogleVisionResult {
  cropHints?: any[];
  localizedObjectAnnotations?: any[];
  labelAnnotations?: any[];
  textAnnotations?: any[];
  safeSearchAnnotation?: any;
  imagePropertiesAnnotation?: any;
}

interface PlantDiseaseDetection {
  diseaseType: string;
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatment: string[];
}

interface AdvancedPlantAnalysis {
  healthScore: number;
  diseases: PlantDiseaseDetection[];
  deficiencies: any[];
  pests: any[];
  environmentalStress: any[];
  growthStage: string;
  recommendations: string[];
  confidence: number;
}

// Enhanced plant analysis combining multiple AI sources
export async function enhancedPlantAnalysis(imageUrl: string): Promise<AdvancedPlantAnalysis> {
  try {
    // 1. Cloudinary AI analysis
    const cloudinaryResult = await analyzeWithCloudinary(imageUrl);
    
    // 2. Google Vision API analysis
    const googleVisionResult = await analyzeWithGoogleVision(imageUrl);
    
    // 3. Custom plant disease detection
    const diseaseAnalysis = await detectPlantDiseases(imageUrl, googleVisionResult);
    
    // 4. Nutrient deficiency analysis
    const deficiencyAnalysis = await analyzeNutrientDeficiencies(cloudinaryResult, googleVisionResult);
    
    // 5. Environmental stress detection
    const stressAnalysis = await detectEnvironmentalStress(cloudinaryResult, googleVisionResult);
    
    // Combine all analyses
    const combinedAnalysis = combineAnalysisResults({
      cloudinary: cloudinaryResult,
      googleVision: googleVisionResult,
      diseases: diseaseAnalysis,
      deficiencies: deficiencyAnalysis,
      stress: stressAnalysis
    });

    return combinedAnalysis;
  } catch (error) {
    logger.error('api', 'Enhanced plant analysis error:', error );
    throw new Error('Failed to perform enhanced plant analysis');
  }
}

async function analyzeWithCloudinary(imageUrl: string) {
  const uploadResult = await cloudinary.uploader.upload(imageUrl, {
    folder: 'plant_health_advanced',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { effect: 'auto_brightness' },
      { effect: 'auto_contrast' },
      { effect: 'sharpen' },
      { quality: 'auto:good' }
    ],
    categorization: 'google_tagging',
    detection: 'adv_face',
    auto_tagging: 0.8,
    colors: true,
    faces: true,
    quality_analysis: true
  });

  return {
    tags: uploadResult.tags || [],
    colors: uploadResult.colors || [],
    quality: uploadResult.quality_analysis || {},
    optimizedUrl: uploadResult.secure_url,
    faces: uploadResult.faces || []
  };
}

async function analyzeWithGoogleVision(imageUrl: string): Promise<GoogleVisionResult> {
  try {
    const response = await fetch('/api/google-vision/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      throw new Error('Google Vision API request failed');
    }

    return await response.json();
  } catch (error) {
    logger.error('api', 'Google Vision analysis error:', error );
    return {};
  }
}

async function detectPlantDiseases(imageUrl: string, visionResult: GoogleVisionResult): Promise<PlantDiseaseDetection[]> {
  const diseases: PlantDiseaseDetection[] = [];
  
  // Disease detection based on Google Vision labels and objects
  const labels = visionResult.labelAnnotations || [];
  const objects = visionResult.localizedObjectAnnotations || [];
  
  // Common cannabis diseases and their indicators
  const diseasePatterns = {
    'powdery_mildew': {
      keywords: ['white', 'powder', 'mildew', 'spots'],
      confidence_threshold: 0.7,
      severity: 'high' as const,
      treatment: [
        'Reduce humidity below 50%',
        'Improve air circulation',
        'Apply potassium bicarbonate spray',
        'Remove affected leaves'
      ]
    },
    'bud_rot': {
      keywords: ['brown', 'rot', 'mold', 'decay'],
      confidence_threshold: 0.8,
      severity: 'critical' as const,
      treatment: [
        'Remove affected buds immediately',
        'Reduce humidity to 40%',
        'Increase air circulation',
        'Quarantine plant if necessary'
      ]
    },
    'spider_mites': {
      keywords: ['web', 'mite', 'stippling', 'yellow dots'],
      confidence_threshold: 0.6,
      severity: 'medium' as const,
      treatment: [
        'Increase humidity around plant',
        'Apply predatory mites',
        'Use neem oil spray',
        'Remove heavily infested leaves'
      ]
    },
    'nutrient_burn': {
      keywords: ['burn', 'brown tips', 'crispy'],
      confidence_threshold: 0.7,
      severity: 'medium' as const,
      treatment: [
        'Flush with pH balanced water',
        'Reduce nutrient concentration',
        'Check EC/PPM levels',
        'Monitor pH levels'
      ]
    }
  };

  // Analyze labels for disease indicators
  for (const [diseaseType, pattern] of Object.entries(diseasePatterns)) {
    const relevantLabels = labels.filter(label => 
      pattern.keywords.some(keyword => 
        label.description?.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (relevantLabels.length > 0) {
      const maxConfidence = Math.max(...relevantLabels.map(l => l.score || 0));
      
      if (maxConfidence >= pattern.confidence_threshold) {
        diseases.push({
          diseaseType: diseaseType.replace('_', ' '),
          confidence: Math.round(maxConfidence * 100),
          location: { x: 0, y: 0, width: 100, height: 100 }, // Would need object detection for precise location
          severity: pattern.severity,
          treatment: pattern.treatment
        });
      }
    }
  }

  return diseases;
}

async function analyzeNutrientDeficiencies(cloudinaryResult: any, visionResult: GoogleVisionResult) {
  const deficiencies = [];
  
  // Color-based nutrient deficiency detection
  const colors = cloudinaryResult.colors || [];
  const dominantColors = colors.slice(0, 5);

  for (const colorData of dominantColors) {
    const [hex, percentage] = colorData;
    const rgb = hexToRgb(hex);
    
    if (rgb) {
      // Yellowing indicates nitrogen deficiency
      if (isYellowish(rgb) && percentage > 20) {
        deficiencies.push({
          type: 'nitrogen_deficiency',
          confidence: Math.min(95, percentage * 2),
          symptoms: 'Yellowing of lower leaves',
          treatment: [
            'Increase nitrogen in nutrient solution',
            'Check pH levels (6.0-7.0 for soil)',
            'Ensure proper drainage'
          ]
        });
      }
      
      // Purple stems/leaves indicate phosphorus deficiency
      if (isPurplish(rgb) && percentage > 15) {
        deficiencies.push({
          type: 'phosphorus_deficiency',
          confidence: Math.min(90, percentage * 3),
          symptoms: 'Purple stems and leaf undersides',
          treatment: [
            'Add phosphorus supplement',
            'Check temperature (should be 65-80°F)',
            'Verify pH levels'
          ]
        });
      }
    }
  }

  return deficiencies;
}

async function detectEnvironmentalStress(cloudinaryResult: any, visionResult: GoogleVisionResult) {
  const stressFactors = [];
  
  // Light stress detection
  const quality = cloudinaryResult.quality || {};
  if (quality.focus && quality.focus < 0.7) {
    stressFactors.push({
      type: 'light_stress',
      severity: 'medium',
      description: 'Potential light burn or insufficient lighting',
      recommendations: [
        'Check light distance and intensity',
        'Monitor leaf temperature',
        'Adjust photoperiod if necessary'
      ]
    });
  }

  // Heat stress indicators from Google Vision
  const labels = visionResult.labelAnnotations || [];
  const heatStressIndicators = labels.filter(label => 
    ['wilting', 'drooping', 'curling'].some(indicator => 
      label.description?.toLowerCase().includes(indicator)
    )
  );

  if (heatStressIndicators.length > 0) {
    stressFactors.push({
      type: 'heat_stress',
      severity: 'high',
      description: 'Signs of heat stress detected',
      recommendations: [
        'Reduce ambient temperature',
        'Increase air circulation',
        'Check VPD levels',
        'Ensure adequate water supply'
      ]
    });
  }

  return stressFactors;
}

function combineAnalysisResults(analyses: any): AdvancedPlantAnalysis {
  const { cloudinary, googleVision, diseases, deficiencies, stress } = analyses;
  
  // Calculate overall health score
  let healthScore = 100;
  
  // Deduct points for issues
  diseases.forEach(disease => {
    switch (disease.severity) {
      case 'critical': healthScore -= 30; break;
      case 'high': healthScore -= 20; break;
      case 'medium': healthScore -= 15; break;
      case 'low': healthScore -= 10; break;
    }
  });
  
  deficiencies.forEach(() => healthScore -= 15);
  stress.forEach(() => healthScore -= 10);
  
  healthScore = Math.max(0, healthScore);
  
  // Determine growth stage based on visual cues
  const growthStage = determineGrowthStage(googleVision.labelAnnotations || []);
  
  // Generate comprehensive recommendations
  const recommendations = generateRecommendations(diseases, deficiencies, stress, healthScore);
  
  return {
    healthScore,
    diseases,
    deficiencies,
    pests: [], // Would expand this with pest detection
    environmentalStress: stress,
    growthStage,
    recommendations,
    confidence: calculateOverallConfidence(diseases, deficiencies, stress)
  };
}

function determineGrowthStage(labels: any[]): string {
  const stageIndicators = {
    'seedling': ['seedling', 'sprout', 'small'],
    'vegetative': ['leaf', 'green', 'growing'],
    'flowering': ['flower', 'bud', 'bloom'],
    'harvest': ['mature', 'ready', 'dense']
  };

  for (const [stage, keywords] of Object.entries(stageIndicators)) {
    const matches = labels.filter(label =>
      keywords.some(keyword =>
        label.description?.toLowerCase().includes(keyword)
      )
    );
    
    if (matches.length >= 2) {
      return stage;
    }
  }
  
  return 'unknown';
}

function generateRecommendations(diseases: any[], deficiencies: any[], stress: any[], healthScore: number): string[] {
  const recommendations = [];
  
  if (healthScore >= 90) {
    recommendations.push('Plant appears very healthy! Continue current care routine.');
  } else if (healthScore >= 70) {
    recommendations.push('Plant is generally healthy with minor issues to address.');
  } else if (healthScore >= 50) {
    recommendations.push('Plant needs attention. Address identified issues promptly.');
  } else {
    recommendations.push('Plant requires immediate intervention to prevent further damage.');
  }
  
  // Priority-based recommendations
  if (diseases.some(d => d.severity === 'critical')) {
    recommendations.push('URGENT: Address critical disease issues immediately.');
  }
  
  if (deficiencies.length > 0) {
    recommendations.push('Adjust nutrient regimen to address deficiencies.');
  }
  
  if (stress.length > 0) {
    recommendations.push('Optimize environmental conditions to reduce plant stress.');
  }
  
  // General care recommendations
  recommendations.push('Monitor daily for changes and maintain consistent care schedule.');
  recommendations.push('Document progress with regular photos for trend analysis.');
  
  return recommendations;
}

function calculateOverallConfidence(diseases: any[], deficiencies: any[], stress: any[]): number {
  const allConfidences = [
    ...diseases.map(d => d.confidence || 70),
    ...deficiencies.map(d => d.confidence || 70),
    ...stress.map(s => 75) // Default confidence for stress factors
  ];
  
  if (allConfidences.length === 0) return 95; // High confidence for healthy plants
  
  return Math.round(allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length);
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function isYellowish(rgb: { r: number; g: number; b: number }): boolean {
  return rgb.g > 180 && rgb.r > 150 && rgb.b < 120;
}

function isPurplish(rgb: { r: number; g: number; b: number }): boolean {
  return rgb.r > 100 && rgb.b > 100 && rgb.g < 100;
}