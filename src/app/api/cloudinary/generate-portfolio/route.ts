import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { generateDesignPortfolio } from '@/lib/cloudinary';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { designImages, projectInfo } = await request.json();

    if (!designImages || !Array.isArray(designImages) || designImages.length === 0) {
      return NextResponse.json(
        { error: 'Design images array is required' },
        { status: 400 }
      );
    }

    // Generate professional portfolio with Cloudinary
    const portfolioResult = await generateDesignPortfolio(designImages);

    // Create project summary for PDF
    const projectSummary = {
      name: projectInfo?.name || 'Untitled Project',
      specifications: projectInfo?.specifications || {},
      fixtures: projectInfo?.fixtures || [],
      analysis: projectInfo?.analysis || null,
      imageCount: designImages.length,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      portfolioPDF: portfolioResult.portfolioPDF,
      images: portfolioResult.images,
      projectSummary,
      message: `Professional portfolio generated with ${designImages.length} design images`
    });

  } catch (error) {
    logger.error('api', 'Portfolio generation API error:', error );
    return NextResponse.json(
      { error: 'Failed to generate design portfolio' },
      { status: 500 }
    );
  }
}