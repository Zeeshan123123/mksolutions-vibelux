/**
 * API Route: Parse Utility Bill
 * Accepts PDF or image uploads and extracts billing data using OCR
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { UtilityBillParser } from '@/lib/utility-integration/bill-parser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const utilityName = formData.get('utilityName') as string;
    const facilityId = formData.get('facilityId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.includes('pdf') && !fileType.includes('image')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or image files.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new UtilityBillParser();

    logger.info('api', `🔍 Parsing ${fileType} file: ${file.name} (${file.size} bytes)`);

    // Parse based on file type
    const result = fileType.includes('pdf') 
      ? await parser.parseBillFromPDF(buffer, utilityName)
      : await parser.parseBillFromImage(buffer, utilityName);

    // Clean up parser resources
    await parser.cleanup();

    // Log parsing results
    logger.info('api', `📊 Parsing result: ${result.success ? 'Success' : 'Failed'} (${result.confidence}% confidence)`);
    if (result.warnings.length > 0) {
      logger.info('api', `⚠️ Warnings:`, { data: result.warnings });
    }
    if (result.errors.length > 0) {
      logger.info('api', `❌ Errors:`, { data: result.errors });
    }

    // Store parsed data if successful and facilityId provided
    if (result.success && result.data && facilityId) {
      try {
        await storeParsedBill(facilityId, result.data, userId);
      } catch (error) {
        logger.error('api', 'Error storing parsed bill:', error );
        result.warnings.push('Bill data could not be stored');
      }
    }

    return NextResponse.json({
      success: result.success,
      data: result.data,
      confidence: result.confidence,
      warnings: result.warnings,
      errors: result.errors,
      processingTime: result.processingTime,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        utilityDetected: result.data?.utilityName
      }
    });

  } catch (error) {
    logger.error('api', 'Bill parsing API error:', error );
    return NextResponse.json(
      { error: 'Internal server error during bill parsing' },
      { status: 500 }
    );
  }
}

async function storeParsedBill(facilityId: string, billData: any, userId: string) {
  // This would store the parsed bill data in the database
  // For now, we'll just log it
  logger.info('api', `💾 Storing parsed bill for facility ${facilityId}`);
  logger.info('api', `📊 Bill data:`, { data: billData });
  
  // In a real implementation, you would:
  // 1. Insert into utility_bills table
  // 2. Link to facility
  // 3. Update baseline data if needed
  // 4. Trigger savings calculations
}