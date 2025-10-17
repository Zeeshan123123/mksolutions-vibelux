import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logging/production-logger';
import { BasicTransformations, SocialMediaAutomation } from '@/lib/cloudinary-advanced';
export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, equipmentName, action } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Upload original image to Cloudinary if it's not already there
    let publicId = imageUrl;
    if (!imageUrl.includes('cloudinary')) {
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: `equipment/${userId}`,
        tags: ['equipment', 'marketplace', userId],
      });
      publicId = uploadResult.public_id;
    }

    let result: any = {};

    switch (action) {
      case 'remove-background':
        // Basic background removal using Cloudinary transformations
        result.enhanced = cloudinary.url(publicId, {
          transformation: [
            { background_removal: 'cloudinary_ai' },
            { width: 1200, height: 1200, crop: 'pad', background: 'white' },
            { quality: 'auto:best' },
            { format: 'auto' }
          ]
        });
        
        // Also create a product showcase version
        result.showcase = BasicTransformations.optimizeEquipment(publicId).toURL();
        
        // Generate thumbnail
        result.thumbnail = cloudinary.url(publicId, {
          transformation: [
            { background_removal: 'cloudinary_ai' },
            { width: 300, height: 300, crop: 'pad', background: 'white' },
            { quality: 'auto:good' },
            { format: 'auto' }
          ]
        });
        break;

      case 'enhance-lighting':
        // Basic color correction for grow light photos
        result.enhanced = BasicTransformations.enhancePlantImage(publicId).toURL();
        
        // Create comparison slider
        result.comparison = cloudinary.url(publicId, {
          transformation: [
            { width: 1000, crop: 'scale' },
            { 
              overlay: publicId,
              transformation: [
                { effect: 'gen_replace', from: 'purple light', to: 'natural light' }
              ],
              width: 0.5,
              flags: 'relative',
              gravity: 'east'
            },
            {
              overlay: {
                text: 'Original | Enhanced',
                font_family: 'Arial',
                font_size: 30,
                font_weight: 'bold',
                color: 'white',
                background: 'black',
                opacity: 70
              },
              gravity: 'south',
              y: 20
            }
          ]
        });
        break;

      case 'create-360':
        // Create 360-degree view from multiple images
        const images = await request.json().then(data => data.images || []);
        if (images.length < 4) {
          return NextResponse.json({ 
            error: 'At least 4 images required for 360 view' 
          }, { status: 400 });
        }

        const spinResult = await cloudinary.uploader.create_slideshow({
          manifest_transformation: {
            width: 800,
            height: 800,
            crop: 'fill',
            duration: 0.1, // Fast transition for smooth spin
            transition: { name: 'none' }
          },
          manifest_json: {
            vars: {
              slides: images.map((img: string) => ({ media: `i:${img}` }))
            }
          },
          upload_preset: 'vibelux_360_spin'
        });

        result.spin360 = spinResult.secure_url;
        result.spinGif = cloudinary.url(spinResult.public_id, {
          format: 'gif',
          delay: 100,
          flags: 'animated'
        });
        break;

      case 'extract-specs':
        // Use OCR to extract specifications from equipment labels
        const ocrResult = await cloudinary.uploader.upload(imageUrl, {
          ocr: 'adv_ocr',
          detection: 'adv_ocr:document',
          moderation: 'aws_rek_text'
        });

        result.extractedText = ocrResult.info?.ocr?.adv_ocr?.data || [];
        
        // Parse equipment specifications
        const specs = parseEquipmentSpecs(result.extractedText);
        result.specifications = specs;
        
        // Create an annotated version highlighting detected text
        result.annotated = cloudinary.url(publicId, {
          transformation: [
            { 
              overlay: {
                font_family: 'Arial',
                font_size: 20,
                text: 'Detected: ' + specs.model || 'Unknown',
                background: 'yellow',
                color: 'black'
              },
              gravity: 'north',
              y: 10
            }
          ]
        });
        break;

      case 'marketplace-ready':
        // Complete marketplace preparation
        const marketplaceVersions = await Promise.all([
          // Main listing image - background removed
          cloudinary.url(publicId, {
            transformation: [
              { background_removal: 'cloudinary_ai' },
              { width: 800, height: 800, crop: 'pad', background: 'white' },
              { effect: 'drop_shadow:azimuth_315;elevation_45;spread_50' },
              { quality: 'auto:best' },
              { format: 'auto' }
            ]
          }),
          
          // Thumbnail
          cloudinary.url(publicId, {
            transformation: [
              { background_removal: 'cloudinary_ai' },
              { width: 200, height: 200, crop: 'pad', background: '#f5f5f5' },
              { quality: 'auto:good' },
              { format: 'auto' }
            ]
          }),
          
          // Mobile version
          cloudinary.url(publicId, {
            transformation: [
              { background_removal: 'cloudinary_ai' },
              { width: 400, height: 400, crop: 'pad', background: 'white' },
              { quality: 'auto:eco' },
              { format: 'auto' },
              { dpr: 'auto' }
            ]
          }),
          
          // Social sharing
          SocialMediaAutomation.createTwitterPost(publicId).toURL()
        ]);

        result = {
          main: marketplaceVersions[0],
          thumbnail: marketplaceVersions[1],
          mobile: marketplaceVersions[2],
          social: marketplaceVersions[3],
          originalPublicId: publicId
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Track usage for analytics
    await trackCloudinaryUsage(userId, action, publicId);

    return NextResponse.json({
      success: true,
      ...result,
      publicId,
      credits_used: calculateCreditsUsed(action)
    });

  } catch (error) {
    logger.error('api', 'Equipment photo enhancement error:', error );
    return NextResponse.json(
      { error: 'Failed to enhance equipment photo' },
      { status: 500 }
    );
  }
}

// Helper function to parse equipment specifications from OCR text
function parseEquipmentSpecs(ocrData: any[]): any {
  const specs: any = {};
  
  const text = ocrData.map(item => item.text).join(' ').toLowerCase();
  
  // Extract common equipment specifications
  const patterns = {
    model: /model[:\s]+([a-z0-9\-]+)/i,
    wattage: /(\d+)[w\s]+(watt|watts)/i,
    voltage: /(\d+)[v\s]+(volt|volts)/i,
    dimensions: /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i,
    weight: /(\d+\.?\d*)\s*(kg|lbs|pounds)/i,
    efficiency: /(\d+\.?\d*)\s*%/i,
  };
  
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      specs[key] = match[0];
    }
  });
  
  return specs;
}

// Track Cloudinary usage for monitoring
async function trackCloudinaryUsage(userId: string, action: string, publicId: string) {
  // Implement tracking logic
  // This could be stored in your database for analytics
  logger.info('api', 'Cloudinary usage:', { data: { userId, action, publicId, timestamp: new Date() } });
}

// Calculate credits used for billing purposes
function calculateCreditsUsed(action: string): number {
  const creditCosts = {
    'remove-background': 1.5,
    'enhance-lighting': 1.0,
    'create-360': 3.0,
    'extract-specs': 2.0,
    'marketplace-ready': 2.5
  };
  
  return creditCosts[action as keyof typeof creditCosts] || 0.5;
}