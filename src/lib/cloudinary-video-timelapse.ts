import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryAdvanced } from './cloudinary-advanced';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface TimelapseOptions {
  userId: string;
  plantId: string;
  title?: string;
  duration?: number; // Total video duration in seconds
  fps?: number; // Frames per second
  watermark?: boolean;
  musicTrack?: 'upbeat' | 'calm' | 'none';
  annotations?: boolean;
  format?: 'mp4' | 'webm' | 'gif';
}

export interface TimelapseResult {
  videoUrl: string;
  gifUrl: string;
  thumbnailUrl: string;
  socialVersions: {
    instagram: string;
    twitter: string;
    tiktok: string;
  };
  analytics: {
    totalFrames: number;
    duration: number;
    fileSize: number;
    growthRate: string;
  };
}

// Create professional growth time-lapse
export async function createGrowthTimelapse(
  images: Array<{
    url: string;
    timestamp: Date;
    day: number;
    notes?: string;
  }>,
  options: TimelapseOptions
): Promise<TimelapseResult> {
  try {
    // Sort images by timestamp
    const sortedImages = images.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Upload images with metadata
    const uploadPromises = sortedImages.map(async (img, index) => {
      const publicId = `timelapse/${options.userId}/${options.plantId}/frame_${index.toString().padStart(4, '0')}`;
      
      return cloudinary.uploader.upload(img.url, {
        public_id: publicId,
        tags: ['timelapse', options.plantId, `day_${img.day}`],
        context: {
          day: img.day,
          timestamp: img.timestamp.toISOString(),
          notes: img.notes || '',
          frame_number: index
        }
      });
    });

    const uploadedFrames = await Promise.all(uploadPromises);

    // Calculate video parameters
    const fps = options.fps || 30;
    const frameDuration = 1 / fps;
    const totalDuration = options.duration || Math.min(30, images.length * 0.5);
    const framesPerImage = Math.ceil(totalDuration * fps / images.length);

    // Create manifest for video generation
    const manifest = {
      w: 1920,
      h: 1080,
      du: totalDuration,
      fps: fps,
      vars: {
        transition: 'fade',
        transition_du: 0.2,
        slides: uploadedFrames.map((frame, index) => ({
          media: `i:${frame.public_id}`,
          du: framesPerImage * frameDuration,
          
          // Add day counter overlay
          overlay: options.annotations ? {
            text: {
              text: `Day ${sortedImages[index].day}`,
              font_family: 'Arial',
              font_size: 60,
              font_weight: 'bold',
              color: 'white',
              background: '#000000',
              opacity: 70
            },
            gravity: 'north_east',
            x: 20,
            y: 20
          } : undefined,
          
          // Ken Burns effect for dynamic movement
          zoompan: {
            mode: 'ken_burns',
            du: framesPerImage * frameDuration,
            from: {
              zoom: 1.0,
              x: 0,
              y: 0
            },
            to: {
              zoom: 1.1,
              x: 0.05,
              y: 0.05
            }
          }
        })),
        
        // Add title card at beginning
        title_card: options.title ? {
          media: 'text:Arial_100_bold:' + encodeURIComponent(options.title || 'Growth Time-lapse'),
          du: 3,
          background: '#000000',
          text_color: '#FFFFFF',
          gravity: 'center'
        } : undefined,
        
        // Add logo watermark
        watermark: options.watermark ? {
          media: 'l:vibelux_logo',
          gravity: 'south_west',
          x: 20,
          y: 20,
          opacity: 50,
          w: 150
        } : undefined
      }
    };

    // Create main video
    const videoResult = await cloudinary.uploader.create_video({
      manifest_json: JSON.stringify(manifest),
      upload_preset: 'vibelux_timelapse',
      public_id: `timelapse/${options.userId}/${options.plantId}/final_${Date.now()}`,
      eager: [
        // HD version
        {
          width: 1920,
          height: 1080,
          video_codec: 'h264',
          audio_codec: options.musicTrack !== 'none' ? 'aac' : 'none',
          format: 'mp4'
        },
        // Mobile version
        {
          width: 720,
          height: 720,
          crop: 'fill',
          gravity: 'center',
          video_codec: 'h264',
          format: 'mp4'
        },
        // GIF preview
        {
          width: 480,
          height: 270,
          video_codec: 'gif',
          duration: 5,
          video_sampling: 10
        }
      ],
      eager_async: true,
      notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
    });

    // Generate social media versions
    const socialVersions = {
      // Instagram (1:1 square)
      instagram: cloudinary.url(videoResult.public_id, {
        resource_type: 'video',
        width: 1080,
        height: 1080,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        format: 'mp4',
        video_codec: 'h264',
        
        // Add Instagram-style branding
        transformation: [
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              text: '@vibelux',
              font_weight: 'bold'
            },
            color: 'white',
            gravity: 'south_east',
            x: 20,
            y: 20
          }
        ]
      }),
      
      // Twitter (16:9)
      twitter: cloudinary.url(videoResult.public_id, {
        resource_type: 'video',
        width: 1200,
        height: 675,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        format: 'mp4',
        duration: 30 // Twitter limit
      }),
      
      // TikTok (9:16 vertical)
      tiktok: cloudinary.url(videoResult.public_id, {
        resource_type: 'video',
        width: 1080,
        height: 1920,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        format: 'mp4',
        video_codec: 'h264',
        
        // Add trending music if specified
        audio: options.musicTrack !== 'none' ? {
          resource_type: 'video',
          public_id: `music/${options.musicTrack}_track`
        } : undefined
      })
    };

    // Generate thumbnail
    const thumbnailUrl = cloudinary.url(videoResult.public_id, {
      resource_type: 'video',
      width: 1280,
      height: 720,
      crop: 'fill',
      gravity: 'center',
      format: 'jpg',
      start_offset: '35%', // Get frame from middle of video
      
      // Add play button overlay
      transformation: [
        {
          overlay: {
            public_id: 'play_button_overlay',
            width: 120,
            height: 120
          },
          gravity: 'center'
        },
        {
          effect: 'brightness:-20' // Darken slightly
        }
      ]
    });

    // Calculate growth analytics
    const analytics = calculateGrowthAnalytics(sortedImages);

    // Store timelapse metadata
    await storeTimelapseMetadata({
      userId: options.userId,
      plantId: options.plantId,
      videoId: videoResult.public_id,
      frames: uploadedFrames.map(f => f.public_id),
      analytics,
      createdAt: new Date()
    });

    return {
      videoUrl: videoResult.secure_url,
      gifUrl: videoResult.eager[2]?.secure_url || '',
      thumbnailUrl,
      socialVersions,
      analytics: {
        totalFrames: images.length,
        duration: totalDuration,
        fileSize: videoResult.bytes || 0,
        growthRate: analytics.growthRate
      }
    };

  } catch (error) {
    logger.error('api', 'Timelapse creation error:', error );
    throw new Error('Failed to create growth timelapse');
  }
}

// Create quick highlight reel
export async function createHighlightReel(
  plantId: string,
  highlights: Array<{
    imageUrl: string;
    caption: string;
    importance: 'high' | 'medium' | 'low';
  }>
): Promise<string> {
  // Filter and sort by importance
  const sortedHighlights = highlights
    .filter(h => h.importance === 'high' || h.importance === 'medium')
    .slice(0, 10); // Max 10 highlights

  const manifest = {
    w: 1080,
    h: 1080,
    du: 15, // 15 second reel
    fps: 30,
    vars: {
      slides: sortedHighlights.map((highlight, index) => ({
        media: `fetch:${encodeURIComponent(highlight.imageUrl)}`,
        du: 1.5,
        
        // Zoom effect
        zoompan: {
          mode: 'zoom',
          du: 1.5,
          from: { zoom: 1.2 },
          to: { zoom: 1.0 }
        },
        
        // Caption overlay
        overlay: {
          text: {
            text: highlight.caption,
            font_family: 'Arial',
            font_size: 36,
            color: 'white',
            background: '#000000',
            opacity: 80
          },
          gravity: 'south',
          y: 50,
          start_offset: 0.2,
          end_offset: 1.3
        }
      }))
    }
  };

  const result = await cloudinary.uploader.create_video({
    manifest_json: JSON.stringify(manifest),
    public_id: `highlights/${plantId}/${Date.now()}`,
    format: 'mp4',
    video_codec: 'h264'
  });

  return result.secure_url;
}

// Helper functions
function calculateGrowthAnalytics(images: Array<{ day: number; timestamp: Date }>) {
  if (images.length < 2) {
    return { growthRate: 'N/A' };
  }

  const firstDay = images[0].day;
  const lastDay = images[images.length - 1].day;
  const totalDays = lastDay - firstDay;
  
  // Simple growth rate calculation
  const growthRate = `${(images.length / totalDays * 100).toFixed(1)}% daily documentation rate`;
  
  return { growthRate };
}

async function storeTimelapseMetadata(metadata: any) {
  // Store in database - implement based on your schema
  logger.info('api', 'Storing timelapse metadata:', { data: metadata });
}

// Export timelapse as downloadable file
export async function exportTimelapse(
  videoPublicId: string,
  format: 'mp4' | 'webm' | 'gif' = 'mp4'
): Promise<string> {
  return cloudinary.url(videoPublicId, {
    resource_type: 'video',
    format,
    flags: 'attachment',
    quality: 'auto:best'
  });
}