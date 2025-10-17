import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryAdvanced } from './cloudinary-advanced';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface SocialMediaVersions {
  instagram: {
    square: string;
    story: string;
    reel: string;
  };
  facebook: {
    post: string;
    cover: string;
    story: string;
  };
  twitter: {
    post: string;
    header: string;
  };
  linkedin: {
    post: string;
    banner: string;
  };
  pinterest: {
    pin: string;
  };
  youtube: {
    thumbnail: string;
    banner: string;
  };
  tiktok: {
    video: string;
  };
}

// Social media dimensions and specifications
const SOCIAL_SPECS = {
  instagram: {
    square: { width: 1080, height: 1080, aspect: '1:1' },
    story: { width: 1080, height: 1920, aspect: '9:16' },
    reel: { width: 1080, height: 1920, aspect: '9:16', video: true }
  },
  facebook: {
    post: { width: 1200, height: 630, aspect: '1.91:1' },
    cover: { width: 820, height: 312, aspect: '2.63:1' },
    story: { width: 1080, height: 1920, aspect: '9:16' }
  },
  twitter: {
    post: { width: 1200, height: 675, aspect: '16:9' },
    header: { width: 1500, height: 500, aspect: '3:1' }
  },
  linkedin: {
    post: { width: 1200, height: 627, aspect: '1.91:1' },
    banner: { width: 1128, height: 191, aspect: '5.91:1' }
  },
  pinterest: {
    pin: { width: 1000, height: 1500, aspect: '2:3' }
  },
  youtube: {
    thumbnail: { width: 1280, height: 720, aspect: '16:9' },
    banner: { width: 2560, height: 423, aspect: '6.05:1' }
  },
  tiktok: {
    video: { width: 1080, height: 1920, aspect: '9:16', video: true }
  }
};

// Auto-generate all social media versions from a single upload
export async function generateAllSocialVersions(
  publicId: string,
  options?: {
    title?: string;
    subtitle?: string;
    brandOverlay?: boolean;
    hashtags?: string[];
    contentType?: 'product' | 'plant' | 'educational' | 'promotional';
  }
): Promise<SocialMediaVersions> {
  const versions: any = {};
  
  // Process each platform
  for (const [platform, formats] of Object.entries(SOCIAL_SPECS)) {
    versions[platform] = {};
    
    for (const [formatName, spec] of Object.entries(formats)) {
      const transformation = buildSocialTransformation(
        publicId,
        platform as keyof typeof SOCIAL_SPECS,
        formatName,
        spec,
        options
      );
      
      versions[platform][formatName] = transformation;
    }
  }
  
  // Store metadata for analytics
  await storeSocialMediaMetadata(publicId, versions, options);
  
  return versions as SocialMediaVersions;
}

// Build transformation for specific social media format
function buildSocialTransformation(
  publicId: string,
  platform: keyof typeof SOCIAL_SPECS,
  format: string,
  spec: any,
  options?: any
): string {
  const transformations: any[] = [
    // Base resize and crop
    {
      width: spec.width,
      height: spec.height,
      crop: 'fill',
      gravity: 'auto:subject', // AI-powered subject focus
      quality: 'auto:best'
    }
  ];

  // Platform-specific optimizations
  switch (platform) {
    case 'instagram':
      if (format === 'story' || format === 'reel') {
        // Add story-specific elements
        transformations.push({
          overlay: {
            font_family: 'Arial',
            font_size: 80,
            font_weight: 'bold',
            text: options?.title || '',
            text_align: 'center'
          },
          color: 'white',
          background: 'rgb:00000080',
          width: spec.width * 0.9,
          gravity: 'north',
          y: 100,
          flags: 'text_no_trim'
        });
        
        // Add swipe up CTA for stories
        if (format === 'story') {
          transformations.push({
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              text: 'Swipe Up',
              font_weight: 'bold'
            },
            color: 'white',
            gravity: 'south',
            y: 200,
            angle: -5
          });
        }
      }
      
      // Add Instagram-specific filters
      transformations.push({
        effect: 'improve:outdoor:50',
        effect: 'saturation:10'
      });
      break;

    case 'facebook':
      if (format === 'post') {
        // Add engagement overlay
        transformations.push({
          overlay: {
            public_id: 'social_engagement_banner',
            width: 200
          },
          gravity: 'south_east',
          x: 20,
          y: 20
        });
      }
      break;

    case 'twitter':
      // Twitter-specific optimizations
      transformations.push({
        format: 'jpg',
        quality: 85, // Twitter compresses heavily
        flags: 'progressive'
      });
      break;

    case 'pinterest':
      // Pinterest loves vertical images
      transformations.push({
        overlay: {
          font_family: 'Arial',
          font_size: 60,
          font_weight: 'bold',
          text: options?.title || '',
          text_align: 'center'
        },
        color: 'white',
        background: 'rgb:00000080',
        width: spec.width * 0.8,
        gravity: 'center'
      });
      break;

    case 'youtube':
      if (format === 'thumbnail') {
        // Add play button overlay
        transformations.push({
          overlay: {
            public_id: 'youtube_play_button',
            width: 150
          },
          gravity: 'center'
        });
        
        // Add duration badge
        transformations.push({
          overlay: {
            font_family: 'Arial',
            font_size: 24,
            text: '10:24',
            background: 'black',
            opacity: 80
          },
          color: 'white',
          gravity: 'south_east',
          x: 10,
          y: 10,
          radius: 4
        });
      }
      break;
  }

  // Add brand watermark if requested
  if (options?.brandOverlay) {
    transformations.push({
      overlay: {
        public_id: 'vibelux_logo',
        width: platform === 'instagram' ? 150 : 100
      },
      gravity: 'south_west',
      x: 20,
      y: 20,
      opacity: 80
    });
  }

  // Add hashtags for applicable platforms
  if (options?.hashtags && ['instagram', 'twitter', 'linkedin'].includes(platform)) {
    const hashtagText = options.hashtags.map((tag: string) => `#${tag}`).join(' ');
    transformations.push({
      overlay: {
        font_family: 'Arial',
        font_size: 24,
        text: hashtagText,
        text_align: 'left'
      },
      color: 'white',
      background: 'rgb:00000060',
      width: spec.width * 0.9,
      gravity: 'south',
      y: 40
    });
  }

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
    fetch_format: 'auto'
  });
}

// Generate social media post with AI-written captions
export async function generateSocialPost(
  imagePublicId: string,
  contentDetails: {
    topic: string;
    tone?: 'professional' | 'casual' | 'educational' | 'promotional';
    includeHashtags?: boolean;
    includeCTA?: boolean;
    targetAudience?: string;
  }
): Promise<{
  versions: SocialMediaVersions;
  captions: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}> {
  // Generate all image versions
  const versions = await generateAllSocialVersions(imagePublicId, {
    contentType: contentDetails.tone as any,
    hashtags: contentDetails.includeHashtags ? 
      generateHashtags(contentDetails.topic) : undefined
  });

  // Generate platform-specific captions
  const captions = {
    instagram: generateInstagramCaption(contentDetails),
    facebook: generateFacebookCaption(contentDetails),
    twitter: generateTwitterCaption(contentDetails),
    linkedin: generateLinkedInCaption(contentDetails)
  };

  return { versions, captions };
}

// Generate smart hashtags based on content
function generateHashtags(topic: string): string[] {
  const baseHashtags = ['vibelux', 'indoorgrowing', 'CEA'];
  
  const topicHashtags: { [key: string]: string[] } = {
    lighting: ['growlights', 'ledgrowlights', 'horticulturallighting'],
    nutrients: ['plantnutrition', 'hydroponics', 'fertilizer'],
    environment: ['climatecontrol', 'vpd', 'growroom'],
    harvest: ['harvest', 'yield', 'cultivation'],
    equipment: ['growequipment', 'indoorgardening', 'horticulture']
  };

  const relevantTags = Object.entries(topicHashtags)
    .filter(([key]) => topic.toLowerCase().includes(key))
    .flatMap(([, tags]) => tags);

  return [...baseHashtags, ...relevantTags].slice(0, 10);
}

// Platform-specific caption generators
function generateInstagramCaption(details: any): string {
  const emoji = details.tone === 'casual' ? '🌱' : '📊';
  const cta = details.includeCTA ? '\n\n👉 Link in bio for more info!' : '';
  
  return `${emoji} ${details.topic}\n\n${getContentBody(details)}${cta}\n\n${
    details.includeHashtags ? generateHashtags(details.topic).map(tag => `#${tag}`).join(' ') : ''
  }`;
}

function generateFacebookCaption(details: any): string {
  const cta = details.includeCTA ? '\n\nLearn more at vibelux.com' : '';
  return `${details.topic}\n\n${getContentBody(details)}${cta}`;
}

function generateTwitterCaption(details: any): string {
  const maxLength = 280;
  const hashtags = details.includeHashtags ? 
    generateHashtags(details.topic).slice(0, 3).map(tag => `#${tag}`).join(' ') : '';
  
  let caption = `${details.topic} ${getContentBody(details, 100)} ${hashtags}`;
  
  if (caption.length > maxLength) {
    caption = caption.substring(0, maxLength - 3) + '...';
  }
  
  return caption;
}

function generateLinkedInCaption(details: any): string {
  const professionalTone = `Excited to share insights on ${details.topic}.\n\n`;
  const cta = details.includeCTA ? 
    '\n\nInterested in learning more? Visit vibelux.com or connect with me to discuss.' : '';
  
  return `${professionalTone}${getContentBody(details, 500)}${cta}`;
}

function getContentBody(details: any, maxLength?: number): string {
  // This would ideally use AI to generate content
  // For now, return template content
  const templates = {
    professional: 'Our latest analysis shows significant improvements in cultivation efficiency.',
    casual: 'Check out this amazing growth progress! 🚀',
    educational: 'Here are the key factors that contribute to optimal plant growth:',
    promotional: 'Discover how VibeLux can transform your growing operation.'
  };
  
  const content = templates[details.tone || 'professional'];
  return maxLength ? content.substring(0, maxLength) : content;
}

// Store metadata for analytics
async function storeSocialMediaMetadata(
  publicId: string,
  versions: any,
  options: any
): Promise<void> {
  try {
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: {
        social_media_generated: true,
        generated_at: new Date().toISOString(),
        platforms: Object.keys(versions).join(','),
        content_type: options?.contentType || 'general'
      }
    });
  } catch (error) {
    logger.error('api', 'Failed to store social media metadata:', error );
  }
}

// Batch process multiple images for social media campaign
export async function createSocialMediaCampaign(
  images: Array<{
    publicId: string;
    title: string;
    description: string;
  }>,
  campaignOptions: {
    campaignName: string;
    platforms: Array<keyof typeof SOCIAL_SPECS>;
    scheduleDates?: Date[];
    tone: 'professional' | 'casual' | 'educational' | 'promotional';
  }
): Promise<{
  campaignId: string;
  posts: Array<{
    imageId: string;
    versions: Partial<SocialMediaVersions>;
    captions: any;
    scheduleDate?: Date;
  }>;
}> {
  const campaignId = `campaign_${Date.now()}`;
  const posts = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const scheduleDate = campaignOptions.scheduleDates?.[i];
    
    // Generate only requested platform versions
    const versions: any = {};
    for (const platform of campaignOptions.platforms) {
      versions[platform] = {};
      for (const [format, spec] of Object.entries(SOCIAL_SPECS[platform])) {
        versions[platform][format] = buildSocialTransformation(
          image.publicId,
          platform,
          format,
          spec,
          {
            title: image.title,
            contentType: campaignOptions.tone
          }
        );
      }
    }
    
    // Generate captions for each platform
    const captions = await generateSocialPost(image.publicId, {
      topic: image.title,
      tone: campaignOptions.tone,
      includeHashtags: true,
      includeCTA: true
    });
    
    posts.push({
      imageId: image.publicId,
      versions,
      captions: captions.captions,
      scheduleDate
    });
  }

  // Store campaign metadata
  await storeCampaignData(campaignId, posts, campaignOptions);

  return { campaignId, posts };
}

async function storeCampaignData(
  campaignId: string,
  posts: any[],
  options: any
): Promise<void> {
  // This would store in your database
  logger.info('api', 'Storing campaign:', { data: { campaignId, posts: posts.length, options } });
}