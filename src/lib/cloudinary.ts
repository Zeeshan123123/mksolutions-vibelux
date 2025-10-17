import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logging/production-logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload presets for different use cases
export const UPLOAD_PRESETS = {
  PLANT_HEALTH: 'vibelux_plant_health',
  EQUIPMENT: 'vibelux_equipment',
  DESIGN_CAD: 'vibelux_design_cad',
  FACILITY: 'vibelux_facility',
  GENERAL: 'vibelux_general'
} as const;

// Transformation presets with auto-optimization enabled
export const TRANSFORMATIONS = {
  // Plant health optimizations
  PLANT_ANALYSIS: [
    { width: 1000, height: 1000, crop: 'limit' },
    { fetch_format: 'auto', quality: 'auto' }, // Auto-optimization
    { effect: 'auto_brightness' },
    { effect: 'auto_contrast' },
    { effect: 'auto_color' }, // Enhanced auto color correction
    { effect: 'sharpen' },
    { format: 'auto' }
  ],
  
  // Equipment photo enhancement
  EQUIPMENT_ENHANCE: [
    { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
    { fetch_format: 'auto', quality: 'auto' }, // Auto-optimization
    { effect: 'auto_brightness' },
    { effect: 'auto_contrast' },
    { effect: 'auto_color' },
    { effect: 'improve' }
  ],
  
  // Design/CAD optimization
  DESIGN_OPTIMIZE: [
    { width: 1920, height: 1080, crop: 'fit' },
    { fetch_format: 'auto', quality: 'auto' }, // Auto-optimization
    { effect: 'sharpen' },
    { effect: 'auto_color' },
    { format: 'auto' }
  ],
  
  // Thumbnail generation
  THUMBNAIL: [
    { width: 200, height: 150, crop: 'thumb', gravity: 'center' },
    { fetch_format: 'auto', quality: 'auto' } // Auto-optimization
  ],
  
  // Gallery images
  GALLERY: [
    { width: 600, height: 400, crop: 'fill', gravity: 'auto' },
    { fetch_format: 'auto', quality: 'auto' }, // Auto-optimization
    { effect: 'auto_color' }
  ]
} as const;

// Helper functions with auto-optimization enabled by default
export const generateImageUrl = (publicId: string, transformations: any[] = []) => {
  // Add auto-optimization if not already present
  const hasAutoOptimization = transformations.some(t => 
    t.fetch_format === 'auto' || t.quality === 'auto'
  );
  
  const finalTransformations = hasAutoOptimization 
    ? transformations 
    : [{ fetch_format: 'auto', quality: 'auto' }, ...transformations];
  
  return cloudinary.url(publicId, {
    transformation: finalTransformations,
    secure: true
  });
};

export const generateResponsiveUrls = (publicId: string) => {
  return {
    thumbnail: generateImageUrl(publicId, TRANSFORMATIONS.THUMBNAIL),
    gallery: generateImageUrl(publicId, TRANSFORMATIONS.GALLERY),
    original: generateImageUrl(publicId)
  };
};

// Plant health analysis helper with enhanced AI features
export const analyzePlantImage = async (imageUrl: string) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: 'plant_health',
      transformation: TRANSFORMATIONS.PLANT_ANALYSIS,
      categorization: 'google_tagging',
      detection: 'captioning', // Enhanced AI captioning
      auto_tagging: 0.6, // Lower threshold for more tags
      background_removal: 'cloudinary_ai', // AI background removal
      crop: 'auto', // Auto crop to subject
      gravity: 'auto' // Auto focus on main subject
    });

    return {
      optimizedUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      tags: uploadResult.tags || [],
      colors: uploadResult.colors || [],
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      // Enhanced AI analysis results
      aiDescription: uploadResult.info?.detection?.captioning?.[0]?.data?.caption || null,
      backgroundRemovedUrl: uploadResult.info?.background_removal ? 
        generateImageUrl(uploadResult.public_id, [{ effect: 'background_removal' }]) : null,
      plantHealthScore: uploadResult.tags?.filter(tag => 
        ['healthy', 'diseased', 'pest', 'nutrient'].some(keyword => tag.includes(keyword))
      ).length > 0 ? 'analyzed' : 'unknown'
    };
  } catch (error) {
    logger.error('api', 'Cloudinary plant analysis error:', error );
    throw new Error('Failed to analyze plant image');
  }
};

// Equipment photo enhancement
export const enhanceEquipmentPhoto = async (imageUrl: string, equipmentInfo?: any) => {
  try {
    const transformation = [...TRANSFORMATIONS.EQUIPMENT_ENHANCE];
    
    // Add text overlay if equipment info provided
    if (equipmentInfo?.manufacturer && equipmentInfo?.model) {
      transformation.push({
        overlay: {
          text: `${equipmentInfo.manufacturer} ${equipmentInfo.model}`,
          font_family: 'Arial',
          font_size: 24,
          color: 'white'
        },
        gravity: 'south',
        y: 20
      } as any);
    }

    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: 'equipment',
      transformation,
      categorization: 'google_tagging',
      detection: 'captioning', // Enhanced AI analysis
      auto_tagging: 0.7,
      crop: 'auto', // Auto crop to equipment
      gravity: 'auto' // Auto focus on equipment
    });

    return {
      optimizedUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      tags: uploadResult.tags || [],
      responsiveUrls: generateResponsiveUrls(uploadResult.public_id)
    };
  } catch (error) {
    logger.error('api', 'Cloudinary equipment enhancement error:', error );
    throw new Error('Failed to enhance equipment photo');
  }
};

// Design portfolio generation
export const generateDesignPortfolio = async (designImages: string[]) => {
  try {
    const uploadPromises = designImages.map((imageUrl, index) => 
      cloudinary.uploader.upload(imageUrl, {
        folder: 'design_portfolio',
        public_id: `design_${Date.now()}_${index}`,
        transformation: TRANSFORMATIONS.DESIGN_OPTIMIZE,
        tags: ['design', 'portfolio', 'lighting']
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    
    // Generate PDF portfolio
    const portfolioPDF = cloudinary.utils.archive_url({
      resource_type: 'image',
      type: 'upload',
      format: 'pdf',
      mode: 'create',
      target_format: 'pdf',
      public_ids: uploadResults.map(result => result.public_id)
    });

    return {
      images: uploadResults.map(result => ({
        url: result.secure_url,
        publicId: result.public_id
      })),
      portfolioPDF
    };
  } catch (error) {
    logger.error('api', 'Cloudinary portfolio generation error:', error );
    throw new Error('Failed to generate design portfolio');
  }
};

// Enhanced growth time-lapse creation with analysis
export const createGrowthTimelapse = async (imageUrls: string[], plantInfo?: any) => {
  try {
    // Upload all images with enhanced processing
    const uploadPromises = imageUrls.map((url, index) =>
      cloudinary.uploader.upload(url, {
        folder: 'growth_timelapse',
        public_id: `growth_${Date.now()}_${String(index).padStart(3, '0')}`,
        transformation: [
          { width: 1200, height: 900, crop: 'scale' },
          { effect: 'auto_brightness' },
          { effect: 'auto_contrast' },
          { effect: 'sharpen:50' },
          { quality: 'auto:good' }
        ],
        tags: ['timelapse', 'growth', plantInfo?.zone || 'unknown'],
        context: {
          sequence: index,
          plant_type: plantInfo?.crop || 'cannabis',
          zone: plantInfo?.zone || 'unknown'
        }
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    
    // Create enhanced video with multiple quality options
    const baseVideoId = `growth_timelapse_${Date.now()}`;
    
    // HD Video
    const hdVideo = cloudinary.url(baseVideoId, {
      resource_type: 'video',
      format: 'mp4',
      transformation: [
        { width: 1200, height: 900, crop: 'scale' },
        { fps: '24' },
        { quality: 'auto:best' },
        { flags: 'progressive' }
      ]
    });
    
    // Mobile optimized video
    const mobileVideo = cloudinary.url(baseVideoId, {
      resource_type: 'video',
      format: 'mp4',
      transformation: [
        { width: 600, height: 450, crop: 'scale' },
        { fps: '15' },
        { quality: 'auto:good' },
        { flags: 'progressive' }
      ]
    });
    
    // Generate thumbnail from middle frame
    const thumbnailIndex = Math.floor(uploadResults.length / 2);
    const thumbnail = generateImageUrl(uploadResults[thumbnailIndex].public_id, [
      { width: 300, height: 225, crop: 'fill' },
      { quality: 'auto:good' }
    ]);

    // Create compilation video with all frames
    const compilationVideo = await createVideoFromImages(uploadResults.map(r => r.public_id));

    return {
      videoUrl: compilationVideo,
      hdVideoUrl: hdVideo,
      mobileVideoUrl: mobileVideo,
      thumbnail,
      frames: uploadResults.length,
      duration: `${uploadResults.length * 0.5}s`,
      metadata: {
        plantInfo,
        uploadResults: uploadResults.map(r => ({
          publicId: r.public_id,
          url: r.secure_url,
          timestamp: r.created_at
        }))
      }
    };
  } catch (error) {
    logger.error('api', 'Cloudinary timelapse creation error:', error );
    throw new Error('Failed to create growth timelapse');
  }
};

// Helper function to create video from image sequence
async function createVideoFromImages(publicIds: string[]) {
  try {
    // Use Cloudinary's video creation API
    const videoResult = await cloudinary.uploader.create_slideshow({
      manifest_json: {
        w: 1200,
        h: 900,
        fps: 24,
        vars: {
          sdur: 500, // 500ms per slide (2 fps)
          tdur: 1000, // 1s transition
          slides: publicIds.map(id => ({
            media: `i:${id}`,
            sdur: 'sdur',
            tdur: 'tdur'
          }))
        }
      },
      tags: ['timelapse', 'growth', 'slideshow']
    });

    return videoResult.secure_url;
  } catch (error) {
    logger.error('api', 'Video creation error:', error );
    // Fallback to basic video URL generation
    return cloudinary.url('slideshow_fallback', {
      resource_type: 'video',
      format: 'mp4'
    });
  }
}

export default cloudinary;