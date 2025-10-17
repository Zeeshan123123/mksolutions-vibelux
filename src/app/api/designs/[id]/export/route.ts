/**
 * Design Export API Routes
 * Generate and manage design exports (PDF, CAD, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { pdfGenerator } from '@/lib/reports/pdf-generator';
export const dynamic = 'force-dynamic'
import { excelGenerator } from '@/lib/reports/excel-generator';
import { s3Client } from '@/lib/storage/s3-client';

const exportRequestSchema = z.object({
  exportType: z.enum(['BLUEPRINT', 'REPORT', 'SPECIFICATION', 'BOM', 'PROPOSAL', 'MAINTENANCE_GUIDE']),
  format: z.enum(['PDF', 'DWG', 'XLSX', 'DOCX', 'IFC', 'GLTF', 'OBJ', 'PNG', 'JPG']),
  quality: z.enum(['DRAFT', 'STANDARD', 'HIGH', 'PRESENTATION']).optional(),
  options: z.object({
    includeZones: z.boolean().optional(),
    includeEquipment: z.boolean().optional(),
    includeMaterials: z.boolean().optional(),
    includeSpecs: z.boolean().optional(),
    includeCosts: z.boolean().optional(),
    includeSchedule: z.boolean().optional(),
    customCover: z.boolean().optional(),
    logoUrl: z.string().url().optional(),
    companyName: z.string().optional(),
    watermark: z.boolean().optional()
  }).optional()
});

// GET /api/designs/[id]/export - List design exports
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify design ownership
    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    const exports = await prisma.designExport.findMany({
      where: { designId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(exports);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/export error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch exports' },
      { status: 500 }
    );
  }
}

// POST /api/designs/[id]/export - Create new export
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = exportRequestSchema.parse(body);

    // Verify design ownership and get full design data
    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        facility: true,
        user: {
          select: { name: true, email: true }
        },
        zones: {
          include: {
            equipment: true,
            sensors: true,
            climateData: {
              take: 100,
              orderBy: { readingAt: 'desc' }
            }
          }
        },
        equipment: {
          include: {
            sensors: true
          }
        }
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    // Create export record
    const exportRecord = await prisma.designExport.create({
      data: {
        designId: params.id,
        exportType: validatedData.exportType,
        format: validatedData.format,
        quality: validatedData.quality || 'STANDARD',
        options: validatedData.options || {},
        fileName: `${design.name}-${validatedData.exportType.toLowerCase()}-${Date.now()}`,
        filePath: '', // Will be updated after generation
        status: 'PROCESSING'
      }
    });

    // Generate export based on type and format
    let filePath: string;
    let fileBuffer: Buffer;

    try {
      switch (validatedData.format) {
        case 'PDF':
          fileBuffer = await generatePDFExport(design, validatedData, exportRecord.id);
          break;
        case 'XLSX':
          fileBuffer = await generateExcelExport(design, validatedData, exportRecord.id);
          break;
        default:
          throw new Error(`Format ${validatedData.format} not yet implemented`);
      }

      // Upload to S3
      const fileName = `${exportRecord.fileName}.${validatedData.format.toLowerCase()}`;
      const s3Key = s3Client.generateKey('exports', fileName);

      const uploadResult = await s3Client.upload(s3Key, fileBuffer, {
        contentType: getContentType(validatedData.format),
        metadata: {
          designId: params.id,
          exportType: validatedData.exportType,
          userId: userId,
          version: design.version.toString()
        }
      });

      // Update export record
      const completedExport = await prisma.designExport.update({
        where: { id: exportRecord.id },
        data: {
          status: 'COMPLETED',
          filePath: uploadResult.url,
          fileSize: fileBuffer.length,
          completedAt: new Date()
        }
      });

      return NextResponse.json(completedExport, { status: 201 });

    } catch (exportError) {
      // Update export record with error
      await prisma.designExport.update({
        where: { id: exportRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: exportError instanceof Error ? exportError.message : 'Unknown error'
        }
      });

      throw exportError;
    }

  } catch (error) {
    console.error(`POST /api/designs/${params.id}/export error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create export' },
      { status: 500 }
    );
  }
}

// Helper functions
async function generatePDFExport(design: any, options: any, exportId: string): Promise<Buffer> {
  const sections: any[] = [];

  // Cover page
  sections.push({
    title: 'Project Overview',
    content: [
      { type: 'heading', value: design.name, level: 1 },
      { type: 'text', value: design.description || 'Greenhouse design project' },
      { type: 'spacer', height: 20 },
      {
        type: 'table',
        headers: ['Property', 'Value'],
        rows: [
          ['Facility', design.facility.name],
          ['Dimensions', `${design.width}m × ${design.length}m × ${design.height}m`],
          ['Area', `${design.area.toFixed(2)} m²`],
          ['Volume', `${design.volume.toFixed(2)} m³`],
          ['Structure Type', design.structureType],
          ['Glazing Type', design.glazingType],
          ['Frame Type', design.frameType],
          ['Status', design.status]
        ]
      }
    ]
  });

  // Zones section
  if (options.options?.includeZones && design.zones.length > 0) {
    sections.push({
      title: 'Zone Configuration',
      content: [
        {
          type: 'table',
          headers: ['Zone', 'Type', 'Size (m²)', 'Target Temp (°C)', 'Target Humidity (%)', 'Crop Type'],
          rows: design.zones.map((zone: any) => [
            zone.name,
            zone.zoneType,
            zone.area.toFixed(2),
            zone.targetTemp?.toString() || 'N/A',
            zone.targetHumidity?.toString() || 'N/A',
            zone.cropType || 'N/A'
          ])
        }
      ]
    });
  }

  // Equipment section
  if (options.options?.includeEquipment && design.equipment.length > 0) {
    sections.push({
      title: 'Equipment List',
      content: [
        {
          type: 'table',
          headers: ['Equipment', 'Type', 'Manufacturer', 'Model', 'Status', 'Power (W)'],
          rows: design.equipment.map((eq: any) => [
            eq.name,
            eq.equipmentType,
            eq.manufacturer || 'N/A',
            eq.model || 'N/A',
            eq.status,
            eq.powerRating?.toString() || 'N/A'
          ])
        }
      ]
    });
  }

  // Generate PDF
  const generator = new (await import('@/lib/reports/pdf-generator')).PDFReportGenerator({
    title: `${design.name} - ${options.exportType}`,
    author: design.user.name || 'VibeLux User',
    headerColor: '#4CAF50'
  });

  return generator.generateBuffer(sections);
}

async function generateExcelExport(design: any, options: any, exportId: string): Promise<Buffer> {
  const worksheets: any[] = [];

  // Summary worksheet
  worksheets.push({
    name: 'Design Summary',
    headers: ['Property', 'Value'],
    rows: [
      ['Design Name', design.name],
      ['Facility', design.facility.name],
      ['Width (m)', design.width],
      ['Length (m)', design.length],
      ['Height (m)', design.height],
      ['Area (m²)', design.area],
      ['Volume (m³)', design.volume],
      ['Structure Type', design.structureType],
      ['Glazing Type', design.glazingType],
      ['Frame Type', design.frameType],
      ['Status', design.status],
      ['Created', design.createdAt.toLocaleDateString()],
      ['Last Updated', design.updatedAt.toLocaleDateString()]
    ],
    formatting: [
      { column: 1, width: 25 },
      { column: 2, width: 30 }
    ]
  });

  // Zones worksheet
  if (design.zones.length > 0) {
    worksheets.push({
      name: 'Zones',
      headers: [
        'Zone Name', 'Type', 'X Position', 'Y Position', 'Width', 'Length',
        'Height', 'Area (m²)', 'Target Temp (°C)', 'Target Humidity (%)',
        'Target CO2 (ppm)', 'Crop Type', 'Plant Density'
      ],
      rows: design.zones.map((zone: any) => [
        zone.name,
        zone.zoneType,
        zone.x,
        zone.y,
        zone.width,
        zone.length,
        zone.height,
        zone.area,
        zone.targetTemp || '',
        zone.targetHumidity || '',
        zone.targetCO2 || '',
        zone.cropType || '',
        zone.plantDensity || ''
      ]),
      autoFilter: true,
      formatting: [
        { column: 1, width: 20 },
        { column: 2, width: 15 },
        { column: 9, format: '0.0' },
        { column: 10, format: '0.0' }
      ]
    });
  }

  // Equipment worksheet
  if (design.equipment.length > 0) {
    worksheets.push({
      name: 'Equipment',
      headers: [
        'Equipment Name', 'Type', 'Manufacturer', 'Model', 'Status',
        'Power Rating (W)', 'Efficiency', 'X Position', 'Y Position', 'Z Position'
      ],
      rows: design.equipment.map((eq: any) => [
        eq.name,
        eq.equipmentType,
        eq.manufacturer || '',
        eq.model || '',
        eq.status,
        eq.powerRating || '',
        eq.efficiency || '',
        eq.x || '',
        eq.y || '',
        eq.z || ''
      ]),
      autoFilter: true,
      formatting: [
        { column: 1, width: 25 },
        { column: 2, width: 15 },
        { column: 6, format: '#,##0' }
      ]
    });
  }

  const generator = new (await import('@/lib/reports/excel-generator')).ExcelReportGenerator({
    title: `${design.name} - ${options.exportType}`,
    author: design.user.name || 'VibeLux User',
    company: design.facility.name
  });

  return generator.generateReport(worksheets) as Promise<Buffer>;
}

function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    PDF: 'application/pdf',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DWG: 'application/acad',
    PNG: 'image/png',
    JPG: 'image/jpeg'
  };
  return contentTypes[format] || 'application/octet-stream';
}