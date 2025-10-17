import { Job } from 'bull';
import { queues, ReportJobData } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { db } from '../../prisma';
import { generatePDFReport } from '../../reports/pdf-generator';
import { generateExcelReport } from '../../reports/excel-generator';
import { uploadToS3 } from '../../storage/s3-client';
import { queueManager } from '../queue-manager';

// Report worker processor
queues.reportQueue.process('generate-report', async (job: Job<ReportJobData>) => {
  const { reportType, userId, facilityId, dateRange, format, options } = job.data;
  
  try {
    logger.info('api', `Processing report job ${job.id}`, {
      reportType,
      userId,
      format
    });
    
    await job.progress(10);
    
    // Fetch report data based on type
    let reportData: any;
    
    switch (reportType) {
      case 'facility':
        reportData = await generateFacilityReport(facilityId!, dateRange);
        await job.progress(30);
        break;
        
      case 'energy':
        reportData = await generateEnergyReport(facilityId!, dateRange);
        await job.progress(30);
        break;
        
      case 'compliance':
        reportData = await generateComplianceReport(facilityId!, dateRange);
        await job.progress(30);
        break;
        
      case 'financial':
        reportData = await generateFinancialReport(userId, dateRange);
        await job.progress(30);
        break;
        
      case 'custom':
        reportData = await generateCustomReport(options);
        await job.progress(30);
        break;
        
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    // Generate report file
    let fileBuffer: Buffer;
    let mimeType: string;
    let extension: string;
    
    await job.progress(50);
    
    switch (format) {
      case 'pdf':
        fileBuffer = await generatePDFReport(reportData, reportType);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
        
      case 'excel':
        fileBuffer = await generateExcelReport(reportData, reportType);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
        
      case 'csv':
        fileBuffer = Buffer.from(convertToCSV(reportData));
        mimeType = 'text/csv';
        extension = 'csv';
        break;
        
      default:
        throw new Error(`Unknown format: ${format}`);
    }
    
    await job.progress(70);
    
    // Upload to S3
    const fileName = `reports/${userId}/${reportType}-${Date.now()}.${extension}`;
    const fileUrl = await uploadToS3(fileBuffer, fileName, mimeType);
    
    await job.progress(90);
    
    // Save report record to database
    const report = await db.report.create({
      data: {
        userId,
        facilityId,
        type: reportType,
        format,
        fileName,
        fileUrl,
        status: 'completed',
        metadata: {
          dateRange,
          options,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
    // Send email notification with report link
    await queueManager.addEmailJob({
      to: await getUserEmail(userId),
      subject: `Your ${reportType} report is ready`,
      template: 'generic',
      data: {
        html: `
          <h2>Your report is ready!</h2>
          <p>Your ${reportType} report for ${dateRange.start} to ${dateRange.end} has been generated.</p>
          <a href="${fileUrl}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Report</a>
        `,
        text: `Your ${reportType} report is ready. Download it here: ${fileUrl}`
      }
    });
    
    await job.progress(100);
    
    return {
      success: true,
      reportId: report.id,
      fileUrl,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('api', `Report job ${job.id} failed`, error as Error);
    
    // Update report status to failed
    if (job.data.reportId) {
      await db.report.update({
        where: { id: job.data.reportId },
        data: { status: 'failed', error: (error as Error).message }
      });
    }
    
    throw error;
  }
});

// Report generation functions
async function generateFacilityReport(facilityId: string, dateRange: any) {
  const [facility, rooms, fixtures, sensors, energyUsage] = await Promise.all([
    db.facility.findUnique({ where: { id: facilityId }, include: { address: true } }),
    db.room.findMany({ where: { facilityId } }),
    db.fixture.count({ where: { room: { facilityId } } }),
    db.sensor.findMany({ where: { facilityId }, include: { readings: { take: 100 } } }),
    db.powerReading.aggregate({
      where: {
        facilityId,
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      _sum: { energyUsage: true },
      _avg: { powerDemand: true }
    })
  ]);
  
  return {
    facility,
    summary: {
      totalRooms: rooms.length,
      totalFixtures: fixtures,
      totalSensors: sensors.length,
      energyUsage: energyUsage._sum.energyUsage || 0,
      avgPowerDemand: energyUsage._avg.powerDemand || 0
    },
    rooms,
    sensors: sensors.map(s => ({
      ...s,
      latestReading: s.readings[0]
    }))
  };
}

async function generateEnergyReport(facilityId: string, dateRange: any) {
  const powerReadings = await db.powerReading.findMany({
    where: {
      facilityId,
      timestamp: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  
  const dailyUsage = powerReadings.reduce((acc: any, reading) => {
    const date = reading.timestamp.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        totalEnergy: 0,
        peakDemand: 0,
        readings: 0
      };
    }
    acc[date].totalEnergy += reading.energyUsage;
    acc[date].peakDemand = Math.max(acc[date].peakDemand, reading.powerDemand);
    acc[date].readings++;
    return acc;
  }, {});
  
  return {
    summary: {
      totalEnergy: powerReadings.reduce((sum, r) => sum + r.energyUsage, 0),
      avgDailyUsage: Object.values(dailyUsage).reduce((sum: number, d: any) => sum + d.totalEnergy, 0) / Object.keys(dailyUsage).length,
      peakDemand: Math.max(...powerReadings.map(r => r.powerDemand))
    },
    dailyBreakdown: Object.values(dailyUsage),
    hourlyProfile: generateHourlyProfile(powerReadings)
  };
}

async function generateComplianceReport(facilityId: string, dateRange: any) {
  const [complianceChecks, incidents, audits] = await Promise.all([
    db.complianceCheck.findMany({
      where: {
        facilityId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.incident.findMany({
      where: {
        facilityId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.audit.findMany({
      where: {
        facilityId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    })
  ]);
  
  return {
    summary: {
      totalChecks: complianceChecks.length,
      passedChecks: complianceChecks.filter(c => c.status === 'passed').length,
      totalIncidents: incidents.length,
      resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
      totalAudits: audits.length
    },
    complianceRate: (complianceChecks.filter(c => c.status === 'passed').length / complianceChecks.length) * 100,
    checks: complianceChecks,
    incidents,
    audits
  };
}

async function generateFinancialReport(userId: string, dateRange: any) {
  // Implement financial report logic
  return {
    revenue: 0,
    expenses: 0,
    profit: 0,
    transactions: []
  };
}

async function generateCustomReport(options: any) {
  // Implement custom report logic based on options
  return options;
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - would need enhancement for complex data
  if (Array.isArray(data)) {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return [headers, ...rows].join('\n');
  }
  return JSON.stringify(data);
}

function generateHourlyProfile(readings: any[]): any[] {
  const hourlyData = Array(24).fill(null).map((_, hour) => ({
    hour,
    avgPower: 0,
    count: 0
  }));
  
  readings.forEach(reading => {
    const hour = reading.timestamp.getHours();
    hourlyData[hour].avgPower += reading.powerDemand;
    hourlyData[hour].count++;
  });
  
  return hourlyData.map(h => ({
    hour: h.hour,
    avgPower: h.count > 0 ? h.avgPower / h.count : 0
  }));
}

async function getUserEmail(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  return user?.email || '';
}

export default queues.reportQueue;