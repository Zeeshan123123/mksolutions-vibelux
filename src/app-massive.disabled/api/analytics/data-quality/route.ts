import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { dataValidationService } from '@/lib/analytics/data-validation'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const facilityId = searchParams.get('facilityId')
    const period = searchParams.get('period') || '30d'
    const reportType = searchParams.get('type') || 'summary'

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // Verify user has access to this facility
    // In production, implement proper access control
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    if (reportType === 'full') {
      // Generate comprehensive data quality report
      const report = await dataValidationService.generateDataQualityReport(
        facilityId,
        startDate,
        endDate
      )
      
      return NextResponse.json({
        success: true,
        report,
        generatedAt: new Date().toISOString()
      })
    } else {
      // Return summary metrics only
      const report = await dataValidationService.generateDataQualityReport(
        facilityId,
        startDate,
        endDate
      )
      
      return NextResponse.json({
        success: true,
        summary: {
          overallScore: report.overallScore,
          metrics: report.metrics,
          issuesSummary: report.issuesSummary,
          topRecommendations: report.recommendations.slice(0, 3)
        },
        generatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    logger.error('api', 'Error generating data quality report:', error )
    return NextResponse.json(
      { error: 'Failed to generate data quality report' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { facilityId, dataType, data } = body

    if (!facilityId || !dataType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: facilityId, dataType, data' },
        { status: 400 }
      )
    }

    // Validate data based on type
    let validationResult
    
    switch (dataType) {
      case 'sensor':
        validationResult = await dataValidationService.validateSensorData(
          facilityId,
          Array.isArray(data) ? data : [data]
        )
        break
        
      case 'harvest':
        validationResult = await dataValidationService.validateHarvestData(
          facilityId,
          Array.isArray(data) ? data : [data]
        )
        break
        
      case 'financial':
        validationResult = await dataValidationService.validateFinancialData(
          facilityId,
          Array.isArray(data) ? data : [data]
        )
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid dataType. Must be: sensor, harvest, or financial' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      validation: validationResult,
      validatedAt: new Date().toISOString()
    })
  } catch (error) {
    logger.error('api', 'Error validating data:', error )
    return NextResponse.json(
      { error: 'Failed to validate data' },
      { status: 500 }
    )
  }
}