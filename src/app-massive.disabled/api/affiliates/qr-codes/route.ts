import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { affiliateQRGenerator } from '@/lib/affiliates/qr-code-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/affiliates/qr-codes - Generate QR codes for affiliate links
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, linkId, options, batchData, platformData, eventData } = body;

    // Get affiliate record
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('user_id', userId)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    if (affiliate.status !== 'active') {
      return NextResponse.json({ error: 'Affiliate account not active' }, { status: 403 });
    }

    let result;

    switch (type) {
      case 'single':
        // Generate QR for single existing link
        if (!linkId) {
          return NextResponse.json({ error: 'Link ID required for single QR generation' }, { status: 400 });
        }
        result = await affiliateQRGenerator.generateLinkQR(affiliate.id, linkId, options);
        break;

      case 'batch':
        // Generate QR codes for multiple URLs
        if (!batchData?.urls) {
          return NextResponse.json({ error: 'URLs array required for batch generation' }, { status: 400 });
        }
        result = await affiliateQRGenerator.generateBatchQR(affiliate.id, batchData.urls, options);
        break;

      case 'platform':
        // Generate platform-specific QR codes
        if (!platformData?.baseUrl || !platformData?.platforms) {
          return NextResponse.json({ error: 'Base URL and platforms required for platform generation' }, { status: 400 });
        }
        result = await affiliateQRGenerator.generatePlatformQRs(
          affiliate.id, 
          platformData.baseUrl, 
          platformData.platforms, 
          options
        );
        break;

      case 'printable':
        // Generate print-ready QR codes
        if (!batchData?.products) {
          return NextResponse.json({ error: 'Products array required for printable generation' }, { status: 400 });
        }
        result = await affiliateQRGenerator.generatePrintableQRs(
          affiliate.id, 
          batchData.products, 
          options
        );
        break;

      case 'event':
        // Generate event-specific QR codes
        if (!eventData?.event || !eventData?.materials) {
          return NextResponse.json({ error: 'Event and materials data required for event generation' }, { status: 400 });
        }
        result = await affiliateQRGenerator.generateEventQRs(
          affiliate.id,
          eventData.event,
          eventData.materials,
          options
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid QR generation type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: result
    });

  } catch (error) {
    console.error('QR generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}

// GET /api/affiliates/qr-codes - Get QR code templates and options
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('template');

    const templates = {
      platforms: [
        {
          platform: 'instagram',
          name: 'Instagram',
          color: '#E4405F',
          suggestedSize: 300,
          description: 'Perfect for Instagram posts and stories'
        },
        {
          platform: 'tiktok',
          name: 'TikTok',
          color: '#000000',
          suggestedSize: 300,
          description: 'Optimized for TikTok videos'
        },
        {
          platform: 'youtube',
          name: 'YouTube',
          color: '#FF0000',
          suggestedSize: 400,
          description: 'Great for video descriptions'
        },
        {
          platform: 'facebook',
          name: 'Facebook',
          color: '#1877F2',
          suggestedSize: 300,
          description: 'Facebook posts and ads'
        },
        {
          platform: 'twitter',
          name: 'Twitter',
          color: '#1DA1F2',
          suggestedSize: 300,
          description: 'Twitter posts and profile'
        }
      ],
      materials: [
        {
          type: 'business-card',
          name: 'Business Card',
          suggestedSize: 150,
          errorCorrection: 'H',
          description: 'Small size, high error correction'
        },
        {
          type: 'flyer',
          name: 'Flyer',
          suggestedSize: 200,
          errorCorrection: 'M',
          description: 'Medium size for flyers and brochures'
        },
        {
          type: 'banner',
          name: 'Banner',
          suggestedSize: 400,
          errorCorrection: 'L',
          description: 'Large size for banners and posters'
        },
        {
          type: 'booth-display',
          name: 'Trade Show Booth',
          suggestedSize: 500,
          errorCorrection: 'M',
          description: 'Extra large for trade show displays'
        }
      ],
      defaultOptions: {
        size: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#8b5cf6',
          light: '#FFFFFF'
        },
        format: 'dataurl'
      }
    };

    if (templateType) {
      return NextResponse.json({
        success: true,
        template: templates[templateType as keyof typeof templates] || null
      });
    }

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('QR templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to load QR templates' },
      { status: 500 }
    );
  }
}