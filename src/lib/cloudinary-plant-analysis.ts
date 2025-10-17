import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryAdvanced } from './cloudinary-advanced';

// Configure Cloudinary with advanced options
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  analytics: true
});

interface PlantAnalysisResult {
  publicId: string;
  originalUrl: string;
  enhancedUrl: string;
  thumbnailUrl: string;
  analysis: {
    health_score: number;
    issues_detected: string[];
    recommendations: string[];
    growth_stage: string;
    leaf_color_analysis: {
      dominant_color: string;
      health_indicator: string;
      nutrient_status: string;
    };
    ai_tags: string[];
    text_detected: string[];
    objects_detected: Array<{
      object: string;
      confidence: number;
      location: string;
    }>;
  };
  metadata: {
    timestamp: string;
    location?: string;
    device?: string;
    lighting_conditions?: string;
  };
  transformations: {
    [key: string]: string;
  };
}

export async function performAdvancedPlantAnalysis(
  imageFile: File | string,
  options?: {
    userId?: string;
    plantId?: string;
    location?: string;
    notes?: string;
  }
): Promise<PlantAnalysisResult> {
  try {
    // Upload with advanced AI analysis
    const uploadResult = await cloudinary.uploader.upload(
      typeof imageFile === 'string' ? imageFile : await fileToDataUri(imageFile),
      {
        upload_preset: 'vibelux_plant_health',
        folder: `plant_health/${options?.userId || 'anonymous'}`,
        public_id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        
        // Advanced AI features
        detection: 'adv_face', // Detects plant parts
        ocr: 'adv_ocr', // Reads any labels or tags
        categorization: 'google_tagging',
        auto_tagging: 0.6,
        moderation: 'aws_rek', // Check for inappropriate content
        quality_analysis: true,
        accessibility_analysis: true,
        
        // Color extraction for health analysis
        colors: true,
        phash: true, // For duplicate detection
        
        // Eager transformations
        eager: [
          // Enhanced version
          {
            transformation: [
              { effect: 'gen_restore' }, // AI restoration
              { effect: 'sharpen:100' },
              { effect: 'auto_brightness' },
              { effect: 'auto_contrast' },
              { quality: 'auto:best' }
            ]
          },
          // Analysis overlay
          {
            width: 1200,
            height: 1200,
            crop: 'fill',
            gravity: 'auto:subject',
            overlay: {
              font_family: 'Arial',
              font_size: 30,
              font_weight: 'bold',
              text: 'ANALYSIS'
            },
            effect: 'colorize:30',
            color: '#00FF00',
            opacity: 20
          },
          // Thumbnail
          {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'auto:classic',
            quality: 'auto:low'
          },
          // Edge detection for leaf analysis
          {
            effect: 'edge:100',
            width: 800,
            height: 800
          },
          // Heatmap for issue detection
          {
            effect: 'gradient_fade:symmetric',
            y: 0.5,
            color: '#FF0000',
            color2: '#00FF00'
          }
        ],
        
        // Contextual metadata
        context: {
          userId: options?.userId || 'anonymous',
          plantId: options?.plantId || 'unknown',
          location: options?.location || 'unknown',
          timestamp: new Date().toISOString(),
          analysisVersion: '2.0',
          notes: options?.notes || ''
        },
        
        // Notifications
        notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
        eager_notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
      }
    );

    // Extract analysis data
    const colorAnalysis = analyzeColors(uploadResult.colors);
    const healthScore = calculateHealthScore(uploadResult, colorAnalysis);
    const issues = detectIssues(uploadResult, colorAnalysis);
    const recommendations = generateRecommendations(issues, healthScore);

    // Generate additional transformations
    const transformations = {
      original: uploadResult.secure_url,
      enhanced: CloudinaryAdvanced.ai.enhancePlantImage(uploadResult.public_id).toURL(),
      thumbnail: uploadResult.eager[2]?.secure_url || uploadResult.secure_url,
      edgeDetection: uploadResult.eager[3]?.secure_url,
      heatmap: uploadResult.eager[4]?.secure_url,
      
      // Generate comparison slider
      comparison: cloudinary.url(uploadResult.public_id, {
        transformation: [
          { width: 1000, crop: 'scale' },
          { 
            overlay: {
              url: uploadResult.public_id,
              transformation: [{ effect: 'gen_restore' }]
            },
            width: 0.5,
            flags: 'relative',
            gravity: 'east'
          },
          {
            overlay: {
              text: {
                text: 'Before | After',
                font_family: 'Arial',
                font_size: 40,
                font_weight: 'bold'
              }
            },
            gravity: 'south',
            y: 20
          }
        ]
      }),
      
      // Social media ready
      instagram: CloudinaryAdvanced.cropping.socialMediaCrop(uploadResult.public_id, 'instagram').toURL(),
      
      // Zoomed problem areas
      zoomedArea: cloudinary.url(uploadResult.public_id, {
        transformation: [
          { 
            crop: 'crop',
            width: 500,
            height: 500,
            gravity: 'auto:subject',
            zoom: 2
          },
          { border: '5px_solid_red' },
          { effect: 'sharpen:200' }
        ]
      })
    };

    // Create comprehensive result
    const result: PlantAnalysisResult = {
      publicId: uploadResult.public_id,
      originalUrl: uploadResult.secure_url,
      enhancedUrl: transformations.enhanced,
      thumbnailUrl: transformations.thumbnail,
      analysis: {
        health_score: healthScore,
        issues_detected: issues,
        recommendations: recommendations,
        growth_stage: detectGrowthStage(uploadResult),
        leaf_color_analysis: colorAnalysis,
        ai_tags: uploadResult.tags || [],
        text_detected: uploadResult.info?.ocr?.adv_ocr?.data || [],
        objects_detected: parseObjectDetection(uploadResult.info?.detection)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        location: options?.location,
        device: uploadResult.exif?.Model,
        lighting_conditions: analyzeLightingConditions(uploadResult)
      },
      transformations
    };

    // Store analysis in database (implement as needed)
    await storeAnalysisResult(result);

    return result;

  } catch (error) {
    logger.error('api', 'Plant analysis error:', error );
    throw new Error('Failed to analyze plant image');
  }
}

// Helper functions
function analyzeColors(colors: any) {
  if (!colors || colors.length === 0) {
    return {
      dominant_color: 'unknown',
      health_indicator: 'unknown',
      nutrient_status: 'unknown'
    };
  }

  const dominantColor = colors[0];
  const rgb = hexToRgb(dominantColor[0]);
  
  // Analyze green levels for plant health
  const greenLevel = rgb.g / 255;
  const yellowLevel = (rgb.r + rgb.g) / (2 * 255) - rgb.b / 255;
  
  let health_indicator = 'healthy';
  let nutrient_status = 'optimal';
  
  if (greenLevel < 0.4) {
    health_indicator = 'poor';
    nutrient_status = 'deficient';
  } else if (greenLevel < 0.6) {
    health_indicator = 'fair';
    nutrient_status = 'low';
  } else if (yellowLevel > 0.3) {
    health_indicator = 'stressed';
    nutrient_status = 'nitrogen deficiency suspected';
  }
  
  return {
    dominant_color: dominantColor[0],
    health_indicator,
    nutrient_status
  };
}

function calculateHealthScore(uploadResult: any, colorAnalysis: any): number {
  let score = 70; // Base score
  
  // Color-based scoring
  if (colorAnalysis.health_indicator === 'healthy') score += 20;
  else if (colorAnalysis.health_indicator === 'fair') score += 10;
  else if (colorAnalysis.health_indicator === 'poor') score -= 20;
  
  // AI tag-based scoring
  const tags = uploadResult.tags || [];
  const positiveIndicators = ['healthy', 'green', 'lush', 'vibrant'];
  const negativeIndicators = ['wilted', 'yellow', 'brown', 'diseased', 'pest'];
  
  tags.forEach((tag: string) => {
    if (positiveIndicators.some(indicator => tag.includes(indicator))) score += 5;
    if (negativeIndicators.some(indicator => tag.includes(indicator))) score -= 10;
  });
  
  // Quality analysis
  if (uploadResult.quality_analysis?.focus > 0.8) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function detectIssues(uploadResult: any, colorAnalysis: any): string[] {
  const issues = [];
  
  if (colorAnalysis.nutrient_status.includes('deficiency')) {
    issues.push(colorAnalysis.nutrient_status);
  }
  
  const tags = uploadResult.tags || [];
  const issueKeywords = {
    'yellow': 'Yellowing leaves detected',
    'brown': 'Brown spots or edges detected',
    'wilted': 'Wilting detected',
    'pest': 'Possible pest presence',
    'mold': 'Possible mold or fungus',
    'spot': 'Leaf spots detected'
  };
  
  Object.entries(issueKeywords).forEach(([keyword, issue]) => {
    if (tags.some((tag: string) => tag.includes(keyword))) {
      issues.push(issue);
    }
  });
  
  return [...new Set(issues)]; // Remove duplicates
}

function generateRecommendations(issues: string[], healthScore: number): string[] {
  const recommendations = [];
  
  if (healthScore < 50) {
    recommendations.push('Immediate attention required');
  }
  
  issues.forEach(issue => {
    if (issue.includes('nitrogen')) {
      recommendations.push('Check nitrogen levels and adjust fertilizer');
    }
    if (issue.includes('Yellow')) {
      recommendations.push('Review watering schedule and check for nutrient deficiencies');
    }
    if (issue.includes('pest')) {
      recommendations.push('Inspect for pests and consider IPM treatment');
    }
    if (issue.includes('Brown')) {
      recommendations.push('Check for overwatering or light burn');
    }
  });
  
  if (recommendations.length === 0 && healthScore > 80) {
    recommendations.push('Plant appears healthy - maintain current care routine');
  }
  
  return recommendations;
}

function detectGrowthStage(uploadResult: any): string {
  const tags = uploadResult.tags || [];
  
  if (tags.some((tag: string) => tag.includes('seedling'))) return 'seedling';
  if (tags.some((tag: string) => tag.includes('flower'))) return 'flowering';
  if (tags.some((tag: string) => tag.includes('fruit'))) return 'fruiting';
  if (tags.some((tag: string) => tag.includes('mature'))) return 'mature';
  
  return 'vegetative';
}

function analyzeLightingConditions(uploadResult: any): string {
  const exif = uploadResult.exif || {};
  const iso = exif.ISO;
  const exposure = exif.ExposureTime;
  
  if (iso > 1600) return 'low light';
  if (iso < 200 && exposure < 1/500) return 'bright light';
  
  return 'moderate light';
}

function parseObjectDetection(detection: any): any[] {
  if (!detection || !detection.data) return [];
  
  return detection.data.map((obj: any) => ({
    object: obj.tag,
    confidence: obj.confidence,
    location: `${obj.bounding_box.x},${obj.bounding_box.y}`
  }));
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function storeAnalysisResult(result: PlantAnalysisResult) {
  // Implement database storage
  // This is a placeholder - implement based on your database
  logger.info('api', 'Storing analysis result:', { data: result.publicId });
}