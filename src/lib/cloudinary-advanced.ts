import { Cloudinary } from '@cloudinary/url-gen';
import { 
  fill, scale, crop, pad, fit, 
  limitFill, thumbnail, auto, limitPad 
} from '@cloudinary/url-gen/actions/resize';
import { 
  format, quality 
} from '@cloudinary/url-gen/actions/delivery';

// Cloudinary configuration for advanced features
const cldAdvanced = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vibelux'
  },
  url: {
    secure: true
  }
});

// Basic transformations for production
export const BasicTransformations = {
  // Resize and optimize equipment photos
  optimizeEquipment: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(1200).height(1200))
      .format('auto')
      .quality('auto:good');
  },

  // Enhance plant images
  enhancePlantImage: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(2048).height(2048))
      .quality('auto:eco')
      .format('auto');
  },

  // Generate thumbnails
  generateThumbnail: (publicId: string, width: number = 400, height: number = 400) => {
    return cldAdvanced
      .image(publicId)
      .resize(thumbnail().width(width).height(height))
      .format('auto')
      .quality('auto:good');
  },

  // Create responsive images
  createResponsive: (publicId: string, maxWidth: number = 1920) => {
    return cldAdvanced
      .image(publicId)
      .resize(scale().width(maxWidth))
      .format('auto')
      .quality('auto:good');
  }
};

// Visual search capabilities
export const VisualSearchService = {
  // Generate image search tags
  generateSearchTags: async (publicId: string): Promise<string[]> => {
    try {
      // In production, this would use Cloudinary's AI tagging
      // For now, return mock tags
      return ['equipment', 'lighting', 'grow', 'indoor', 'technology'];
    } catch (error) {
      logger.error('api', 'Error generating search tags:', error );
      return [];
    }
  },

  // Find similar images
  findSimilarImages: async (publicId: string): Promise<any[]> => {
    try {
      // In production, this would use Cloudinary's search API
      return [];
    } catch (error) {
      logger.error('api', 'Error finding similar images:', error );
      return [];
    }
  }
};

// Social media automation
export const SocialMediaAutomation = {
  // Create Instagram-ready images
  createInstagramPost: (publicId: string, caption?: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(1080).height(1080))
      .format('jpg')
      .quality('auto:good');
  },

  // Create Twitter-ready images
  createTwitterPost: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(1200).height(675))
      .format('jpg')
      .quality('auto:good');
  },

  // Create LinkedIn-ready images
  createLinkedInPost: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(1200).height(627))
      .format('jpg')
      .quality('auto:good');
  }
};

// 3D model processing
export const Model3DProcessor = {
  // Generate 3D preview thumbnails
  generate3DPreview: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(800).height(600))
      .format('auto')
      .quality('auto:good');
  },

  // Create 360-degree preview
  create360Preview: (publicId: string) => {
    return cldAdvanced
      .image(publicId)
      .resize(fill().width(1200).height(600))
      .format('auto')
      .quality('auto:good');
  }
};

// Video processing capabilities
export const VideoProcessor = {
  // Create timelapse preview
  createTimelapsePreview: (publicId: string) => {
    return cldAdvanced
      .video(publicId)
      .format('mp4')
      .quality('auto:good');
  },

  // Generate video thumbnail
  generateVideoThumbnail: (publicId: string, timestamp: number = 5) => {
    return cldAdvanced
      .video(publicId)
      .format('jpg')
      .quality('auto:good');
  }
};

// Export main instance
export { cldAdvanced };
export default cldAdvanced;