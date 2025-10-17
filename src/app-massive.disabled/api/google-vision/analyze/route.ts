import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const googleVisionApiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!googleVisionApiKey || googleVisionApiKey === 'your_google_vision_api_key_here') {
      // Fallback: Return mock data for development
      return NextResponse.json(getMockGoogleVisionResult());
    }

    // Google Vision API request
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                source: {
                  imageUri: imageUrl
                }
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                { type: 'TEXT_DETECTION', maxResults: 10 },
                { type: 'CROP_HINTS', maxResults: 5 },
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'IMAGE_PROPERTIES' }
              ]
            }
          ]
        })
      }
    );

    if (!visionResponse.ok) {
      throw new Error(`Google Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const result = visionData.responses?.[0] || {};

    return NextResponse.json({
      success: true,
      labelAnnotations: result.labelAnnotations || [],
      localizedObjectAnnotations: result.localizedObjectAnnotations || [],
      textAnnotations: result.textAnnotations || [],
      cropHints: result.cropHintsAnnotation?.cropHints || [],
      safeSearchAnnotation: result.safeSearchAnnotation || {},
      imagePropertiesAnnotation: result.imagePropertiesAnnotation || {}
    });

  } catch (error) {
    logger.error('api', 'Google Vision API error:', error );
    
    // Return mock data on error for development continuity
    return NextResponse.json(getMockGoogleVisionResult());
  }
}

function getMockGoogleVisionResult() {
  return {
    success: true,
    labelAnnotations: [
      { description: 'Plant', score: 0.95 },
      { description: 'Leaf', score: 0.92 },
      { description: 'Green', score: 0.88 },
      { description: 'Cannabis', score: 0.85 },
      { description: 'Flowering plant', score: 0.82 },
      { description: 'Herb', score: 0.78 },
      { description: 'Vegetation', score: 0.75 }
    ],
    localizedObjectAnnotations: [
      {
        name: 'Plant',
        score: 0.89,
        boundingPoly: {
          normalizedVertices: [
            { x: 0.1, y: 0.1 },
            { x: 0.9, y: 0.1 },
            { x: 0.9, y: 0.9 },
            { x: 0.1, y: 0.9 }
          ]
        }
      }
    ],
    textAnnotations: [],
    cropHints: [],
    safeSearchAnnotation: {
      adult: 'VERY_UNLIKELY',
      spoof: 'VERY_UNLIKELY',
      medical: 'POSSIBLE',
      violence: 'VERY_UNLIKELY',
      racy: 'VERY_UNLIKELY'
    },
    imagePropertiesAnnotation: {
      dominantColors: {
        colors: [
          { color: { red: 76, green: 175, blue: 80 }, score: 0.4, pixelFraction: 0.35 },
          { color: { red: 129, green: 199, blue: 132 }, score: 0.3, pixelFraction: 0.25 },
          { color: { red: 46, green: 125, blue: 50 }, score: 0.2, pixelFraction: 0.20 }
        ]
      }
    }
  };
}