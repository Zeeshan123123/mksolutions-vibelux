import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { analyzePlantImage } from '@/lib/cloudinary';
import { enhancedPlantAnalysis } from '@/lib/advanced-ai-analysis';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Enhanced AI analysis using multiple sources
    const useAdvancedAI = process.env.NEXT_PUBLIC_USE_GOOGLE_VISION === 'true';
    
    let analysis;
    let cloudinaryResult;
    
    if (useAdvancedAI) {
      try {
        // Use enhanced multi-AI analysis
        analysis = await enhancedPlantAnalysis(imageUrl);
        // Still get Cloudinary result for image optimization
        cloudinaryResult = await analyzePlantImage(imageUrl);
      } catch (error) {
        logger.warn('api', 'Enhanced AI analysis failed, falling back to basic analysis:', error);
        // Fallback to basic analysis
        cloudinaryResult = await analyzePlantImage(imageUrl);
        analysis = await analyzeImageData(cloudinaryResult);
      }
    } else {
      // Use basic Cloudinary analysis
      cloudinaryResult = await analyzePlantImage(imageUrl);
      analysis = await analyzeImageData(cloudinaryResult);
    }

    return NextResponse.json({
      success: true,
      enhancedImageUrl: cloudinaryResult.optimizedUrl,
      originalTags: cloudinaryResult.tags,
      detectedIssues: analysis.diseases || analysis.issues || [],
      healthScore: analysis.healthScore,
      recommendations: analysis.recommendations,
      colorAnalysis: cloudinaryResult.colors,
      // Enhanced analysis results
      deficiencies: analysis.deficiencies || [],
      environmentalStress: analysis.environmentalStress || [],
      growthStage: analysis.growthStage || 'unknown',
      confidence: analysis.confidence || 85,
      analysisType: useAdvancedAI ? 'enhanced_multi_ai' : 'basic_cloudinary',
      imageMetrics: {
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
        size: cloudinaryResult.bytes
      }
    });

  } catch (error) {
    logger.error('api', 'Plant analysis API error:', error );
    return NextResponse.json(
      { error: 'Failed to analyze plant image' },
      { status: 500 }
    );
  }
}

async function analyzeImageData(cloudinaryResult: any) {
  const { tags, colors } = cloudinaryResult;
  const issues: any[] = [];
  const recommendations: string[] = [];
  let healthScore = 100;

  // Analyze tags for plant health indicators
  const concernTags = ['yellow', 'brown', 'wilted', 'spots', 'damage', 'dying'];
  const healthyTags = ['green', 'lush', 'vibrant', 'growing', 'healthy'];

  const foundConcernTags = tags.filter((tag: string) => 
    concernTags.some(concern => tag.toLowerCase().includes(concern))
  );

  const foundHealthyTags = tags.filter((tag: string) => 
    healthyTags.some(healthy => tag.toLowerCase().includes(healthy))
  );

  // Color analysis for plant health
  if (colors && colors.length > 0) {
    const dominantColor = colors[0];
    const colorHex = dominantColor[0];
    
    // Analyze dominant colors
    if (isYellowish(colorHex)) {
      issues.push({
        id: 'yellowing',
        type: 'nutrient',
        severity: 'medium',
        confidence: 75,
        name: 'Leaf Yellowing',
        description: 'Yellowing leaves detected, may indicate nutrient deficiency or overwatering',
        recommendations: [
          'Check nitrogen levels in nutrient solution',
          'Verify proper drainage and watering schedule',
          'Monitor pH levels (should be 5.5-6.5 for hydroponics)'
        ]
      });
      healthScore -= 15;
    }

    if (isBrownish(colorHex)) {
      issues.push({
        id: 'browning',
        type: 'environmental',
        severity: 'high',
        confidence: 80,
        name: 'Leaf Browning',
        description: 'Brown discoloration suggests possible nutrient burn or heat stress',
        recommendations: [
          'Reduce nutrient concentration',
          'Check light intensity and distance',
          'Improve air circulation',
          'Monitor temperature (ideal: 70-80°F)'
        ]
      });
      healthScore -= 25;
    }
  }

  // Tag-based analysis
  foundConcernTags.forEach(tag => {
    if (tag.includes('spot')) {
      issues.push({
        id: 'spots',
        type: 'disease',
        severity: 'medium',
        confidence: 70,
        name: 'Leaf Spots',
        description: 'Spotted pattern detected, possible fungal or bacterial infection',
        recommendations: [
          'Improve air circulation',
          'Reduce humidity if excessive',
          'Apply appropriate fungicide if confirmed',
          'Remove affected leaves'
        ]
      });
      healthScore -= 20;
    }

    if (tag.includes('yellow')) {
      // Already handled in color analysis
    }

    if (tag.includes('wilt')) {
      issues.push({
        id: 'wilting',
        type: 'environmental',
        severity: 'high',
        confidence: 85,
        name: 'Wilting',
        description: 'Plant shows signs of wilting, check water and root health',
        recommendations: [
          'Check root system for rot or damage',
          'Verify proper watering schedule',
          'Ensure adequate drainage',
          'Monitor for pests in root zone'
        ]
      });
      healthScore -= 30;
    }
  });

  // Positive indicators
  foundHealthyTags.forEach(tag => {
    if (tag.includes('green') || tag.includes('healthy')) {
      healthScore += 5; // Slight boost for healthy indicators
    }
  });

  // General recommendations
  if (issues.length === 0) {
    recommendations.push(
      'Plant appears healthy! Continue current care routine',
      'Monitor regularly for early detection of issues',
      'Maintain consistent environmental conditions'
    );
  } else {
    recommendations.push(
      'Take photos regularly to track progress',
      'Adjust environmental conditions gradually',
      'Consult with cultivation experts if issues persist'
    );
  }

  // Ensure health score stays within bounds
  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    issues,
    healthScore,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}

function isYellowish(hex: string): boolean {
  // Simple color analysis - convert hex to RGB and check for yellow tones
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Yellow is high R and G, low B
  return g > 180 && r > 150 && b < 120;
}

function isBrownish(hex: string): boolean {
  // Brown detection
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Brown is medium R, lower G, low B
  return r > 100 && r < 200 && g > 50 && g < 150 && b < 100;
}