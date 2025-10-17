import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma'
import { realTimeMetrics } from '@/lib/analytics/real-time-metrics'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      facilityId,
      dataSource,
      metrics,
      filters,
      dateRange,
      visualizations,
      format,
      aggregation,
      preview
    } = body

    if (!facilityId || !dataSource || !metrics || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: facilityId, dataSource, metrics' },
        { status: 400 }
      )
    }

    // Calculate date range
    const { startDate, endDate } = calculateDateRange(dateRange)

    // Generate report data
    const reportData = await generateReportData({
      facilityId,
      dataSource,
      metrics,
      filters,
      startDate,
      endDate,
      aggregation
    })

    // If this is a preview request, return just the data
    if (preview) {
      return NextResponse.json({
        success: true,
        preview: {
          dataSource,
          dateRange: { startDate, endDate },
          recordCount: reportData.length,
          sampleData: reportData.slice(0, 10), // First 10 records
          metrics: metrics,
          aggregation
        }
      })
    }

    // Generate full report based on format
    let reportOutput
    switch (format) {
      case 'json':
        reportOutput = generateJSONReport(reportData, visualizations)
        break
      case 'csv':
        reportOutput = generateCSVReport(reportData)
        break
      case 'excel':
        reportOutput = await generateExcelReport(reportData, visualizations)
        break
      case 'pdf':
        reportOutput = await generatePDFReport(reportData, visualizations)
        break
      default:
        reportOutput = generateJSONReport(reportData, visualizations)
    }

    // Set appropriate headers for file download
    const headers = new Headers()
    headers.set('Content-Type', getContentType(format))
    headers.set('Content-Disposition', `attachment; filename="report.${format}"`)

    return new NextResponse(reportOutput, { headers })
  } catch (error) {
    logger.error('api', 'Error generating report:', error )
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    )
  }
}

function calculateDateRange(dateRange: any): { startDate: Date; endDate: Date } {
  let endDate = new Date()
  let startDate = new Date()

  if (dateRange.type === 'absolute') {
    startDate = new Date(dateRange.start)
    endDate = new Date(dateRange.end)
  } else {
    // Relative date range
    switch (dateRange.period) {
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
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }
  }

  return { startDate, endDate }
}

async function generateReportData({
  facilityId,
  dataSource,
  metrics,
  filters,
  startDate,
  endDate,
  aggregation
}: any): Promise<any[]> {
  let data: any[] = []

  switch (dataSource) {
    case 'sensor_data':
      data = await generateSensorDataReport(facilityId, metrics, startDate, endDate, aggregation, filters)
      break
    case 'harvest_data':
      data = await generateHarvestDataReport(facilityId, metrics, startDate, endDate, aggregation, filters)
      break
    case 'financial_data':
      data = await generateFinancialDataReport(facilityId, metrics, startDate, endDate, aggregation, filters)
      break
    case 'analytics_summary':
      data = await generateAnalyticsSummaryReport(facilityId, metrics, startDate, endDate, aggregation, filters)
      break
    default:
      throw new Error(`Unsupported data source: ${dataSource}`)
  }

  return data
}

async function generateSensorDataReport(
  facilityId: string,
  metrics: string[],
  startDate: Date,
  endDate: Date,
  aggregation: string,
  filters: any
): Promise<any[]> {
  const sensorReadings = await prisma.sensorReading.findMany({
    where: {
      facilityId,
      timestamp: {
        gte: startDate,
        lte: endDate
      },
      ...(filters.sensorType && { sensorType: { in: filters.sensorType } }),
      ...(filters.zoneId && { zoneId: { in: filters.zoneId } })
    },
    orderBy: { timestamp: 'asc' }
  })

  // Group and aggregate data
  const aggregatedData = groupAndAggregate(sensorReadings, 'sensorType', aggregation, metrics)
  
  return aggregatedData.map(item => ({
    date: item.date,
    sensorType: item.sensorType,
    ...metrics.reduce((acc, metric) => {
      acc[metric] = item[metric] || 0
      return acc
    }, {} as any)
  }))
}

async function generateHarvestDataReport(
  facilityId: string,
  metrics: string[],
  startDate: Date,
  endDate: Date,
  aggregation: string,
  filters: any
): Promise<any[]> {
  const harvests = await prisma.harvestBatch.findMany({
    where: {
      facilityId,
      harvestDate: {
        gte: startDate,
        lte: endDate
      },
      ...(filters.strain && { strain: { in: filters.strain } }),
      ...(filters.qualityGrade && { qualityGrade: { in: filters.qualityGrade } })
    },
    // Note: sales relation doesn't exist in HarvestBatch schema
    orderBy: { harvestDate: 'asc' }
  })

  return harvests.map(harvest => {
    const totalSales = 0 // Sales relation doesn't exist in schema
    const yieldPerPlant = 0 // plantCount field doesn't exist in schema

    return {
      date: harvest.harvestDate,
      batchNumber: harvest.batchNumber,
      strain: harvest.variety, // Use variety instead of strain
      total_yield: harvest.actualYield,
      avg_quality_grade: harvest.qualityGrade,
      harvest_count: 1,
      yield_per_plant: yieldPerPlant,
      revenue: totalSales,
      plant_count: 0 // plantCount field doesn't exist in schema
    }
  })
}

async function generateFinancialDataReport(
  facilityId: string,
  metrics: string[],
  startDate: Date,
  endDate: Date,
  aggregation: string,
  filters: any
): Promise<any[]> {
  // Get expenses
  const expenses = await prisma.expense.findMany({
    where: {
      facilityId,
      expenseDate: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // TODO: Sale model doesn't exist in schema - return empty array
  // const sales = await prisma.sale.findMany({
  //   where: {
  //     harvestBatch: {
  //       facilityId
  //     },
  //     saleDate: {
  //       gte: startDate,
  //       lte: endDate
  //     }
  //   },
  //   include: {
  //     harvestBatch: true
  //   }
  // })
  
  const sales: any[] = [];

  // Group by date (daily aggregation)
  const dailyData = new Map()

  // Process expenses
  expenses.forEach(expense => {
    const dateKey = expense.expenseDate.toISOString().split('T')[0]
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, { date: dateKey, revenue: 0, expenses: 0 })
    }
    dailyData.get(dateKey).expenses += expense.amount
  })

  // Process sales
  sales.forEach(sale => {
    const dateKey = sale.saleDate.toISOString().split('T')[0]
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, { date: dateKey, revenue: 0, expenses: 0 })
    }
    dailyData.get(dateKey).revenue += sale.amount
  })

  return Array.from(dailyData.values()).map(day => ({
    date: day.date,
    revenue: day.revenue,
    expenses: day.expenses,
    profit_margin: day.revenue > 0 ? ((day.revenue - day.expenses) / day.revenue) * 100 : 0,
    cost_per_kg: 0 // Would need yield data to calculate this
  }))
}

async function generateAnalyticsSummaryReport(
  facilityId: string,
  metrics: string[],
  startDate: Date,
  endDate: Date,
  aggregation: string,
  filters: any
): Promise<any[]> {
  // Use the real-time metrics service to get comprehensive analytics
  const facilityMetrics = await realTimeMetrics.calculateFacilityMetrics(facilityId, startDate, endDate)

  return [{
    date: new Date().toISOString().split('T')[0],
    efficiency_score: (facilityMetrics as any)?.efficiencyScore || 0,
    growth_rate: 0, // Would need historical data to calculate
    energy_efficiency: (facilityMetrics as any)?.energyEfficiency || 0,
    space_utilization: (facilityMetrics as any)?.spaceUtilization || 0,
    revenue: (facilityMetrics as any)?.revenue || 0,
    yield_total: (facilityMetrics as any)?.yieldMetrics?.totalYield || 0,
    avg_quality: (facilityMetrics as any)?.yieldMetrics?.averageQuality || 0
  }]
}

function groupAndAggregate(data: any[], groupBy: string, aggregation: string, metrics: string[]): any[] {
  const grouped = new Map()

  data.forEach(item => {
    const key = item[groupBy]
    if (!grouped.has(key)) {
      grouped.set(key, {
        [groupBy]: key,
        values: [],
        count: 0
      })
    }
    grouped.get(key).values.push(item.value)
    grouped.get(key).count++
  })

  return Array.from(grouped.values()).map(group => {
    const result = { [groupBy]: group[groupBy] }
    
    switch (aggregation) {
      case 'avg':
        result.value = group.values.reduce((sum: number, val: number) => sum + val, 0) / group.count
        break
      case 'sum':
        result.value = group.values.reduce((sum: number, val: number) => sum + val, 0)
        break
      case 'count':
        result.value = group.count
        break
      case 'min':
        result.value = Math.min(...group.values)
        break
      case 'max':
        result.value = Math.max(...group.values)
        break
      default:
        result.value = group.values.reduce((sum: number, val: number) => sum + val, 0) / group.count
    }

    return result
  })
}

function generateJSONReport(data: any[], visualizations: any[]): string {
  return JSON.stringify({
    data,
    visualizations,
    generatedAt: new Date().toISOString(),
    recordCount: data.length
  }, null, 2)
}

function generateCSVReport(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}

async function generateExcelReport(data: any[], visualizations: any[]): Promise<Buffer> {
  // In a real implementation, you would use a library like xlsx or exceljs
  // For now, return CSV format as a buffer
  const csvData = generateCSVReport(data)
  return Buffer.from(csvData, 'utf-8')
}

async function generatePDFReport(data: any[], visualizations: any[]): Promise<Buffer> {
  // In a real implementation, you would use a library like puppeteer or pdfkit
  // For now, return JSON format as a buffer
  const jsonData = generateJSONReport(data, visualizations)
  return Buffer.from(jsonData, 'utf-8')
}

function getContentType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'csv':
      return 'text/csv'
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}