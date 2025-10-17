export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
/**
 * Energy Billing Setup API
 * Onboards customers for automated energy savings billing
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateAcceptance, REVENUE_SHARING_AGREEMENT } from '@/lib/legal/revenue-sharing-terms';
import { logger } from '@/lib/logging/production-logger';
import { z } from 'zod';

// Request validation schema
const setupSchema = z.object({
  // Customer information
  email: z.string().email(),
  name: z.string().min(2),
  company: z.string().min(2),
  facilityAddress: z.string().min(10),
  
  // Utility information
  utilityCompany: z.string(),
  utilityAccountNumber: z.string(),
  utilityCredentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional()
  }).optional(),
  
  // Payment method
  paymentMethod: z.object({
    type: z.enum(['ach', 'card']),
    token: z.string().optional(), // Stripe token for card
    accountNumber: z.string().optional(), // For ACH
    routingNumber: z.string().optional(), // For ACH
    accountType: z.enum(['checking', 'savings']).optional()
  }),
  
  // Legal agreement
  agreementAccepted: z.object({
    version: z.string(),
    checkboxes: z.object({
      payment_auth: z.boolean(),
      utility_access: z.boolean(),
      terms_accept: z.boolean(),
      min_guarantee: z.boolean().optional()
    }),
    signature: z.object({
      name: z.string(),
      title: z.string(),
      company: z.string(),
      date: z.string()
    })
  })
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request
    const validatedData = setupSchema.parse(body);
    
    // Get IP address for agreement
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Validate agreement acceptance
    const agreementValidation = validateAcceptance({
      ...validatedData.agreementAccepted,
      version: REVENUE_SHARING_AGREEMENT.version,
      timestamp: new Date(),
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    if (!agreementValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid agreement acceptance',
          details: agreementValidation.errors 
        },
        { status: 400 }
      );
    }
    
    // Setup customer in Stripe and database
    const { stripeEnergyInvoicing } = await import('@/lib/billing/stripe-energy-invoicing');
    const result = await stripeEnergyInvoicing.setupCustomer({
      ...validatedData,
      agreementAccepted: {
        ...validatedData.agreementAccepted,
        timestamp: new Date(),
        ipAddress
      }
    });
    
    // Connect to utility API if credentials provided
    if (validatedData.utilityCredentials) {
      try {
        const { utilityBillParser } = await import('@/lib/billing/utility-bill-parser');
        
        await utilityBillParser.connectToUtilityAPI({
          utilityCompany: validatedData.utilityCompany,
          accountNumber: validatedData.utilityAccountNumber,
          credentials: validatedData.utilityCredentials
        });
        
        logger.info('billing', 'Utility API connected successfully');
      } catch (error) {
        logger.warn('billing', 'Utility API connection failed, will use manual upload', error as Error);
      }
    }
    
    // Send success response
    return NextResponse.json({
      success: true,
      customerId: result.customerId,
      message: 'Energy billing setup complete',
      nextSteps: [
        'Upload or forward your latest utility bill',
        'We will establish your baseline from historical data',
        'Savings calculation begins with your next bill',
        'You will be invoiced only when savings exceed 15%'
      ]
    });
    
  } catch (error) {
    logger.error('billing', 'Energy billing setup failed', error as Error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Setup failed' 
      },
      { status: 500 }
    );
  }
}

// Process uploaded utility bill
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    const billFile = formData.get('bill') as File;
    
    if (!customerId || !billFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await billFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process the bill
    const { stripeEnergyInvoicing } = await import('@/lib/billing/stripe-energy-invoicing');
    const invoice = await stripeEnergyInvoicing.processUtilityBill({
      customerId,
      billData: {
        source: {
          type: billFile.type.includes('pdf') ? 'pdf' : 'image',
          data: buffer,
          utilityCompany: formData.get('utilityCompany') as string
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        period: invoice.billingMonth,
        savingsAmount: invoice.costSaved,
        savingsPercentage: invoice.savingsPercentage,
        vibeluxShare: invoice.vibeluxShare,
        customerSavings: invoice.customerSavings,
        paymentStatus: invoice.paymentStatus,
        dueDate: invoice.dueDate
      },
      message: invoice.vibeluxShare > 0 
        ? `Invoice generated for $${invoice.vibeluxShare.toFixed(2)}`
        : 'No charge this month - savings below guarantee threshold'
    });
    
  } catch (error) {
    logger.error('billing', 'Bill processing failed', error as Error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
}

// Get billing history
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }
    
    const { stripeEnergyInvoicing } = await import('@/lib/billing/stripe-energy-invoicing');
    const history = await stripeEnergyInvoicing.getBillingHistory(customerId);
    
    // Calculate totals
    const totalSaved = history.reduce((sum, inv) => sum + inv.costSaved, 0);
    const totalPaid = history.reduce((sum, inv) => 
      inv.paymentStatus === 'paid' ? sum + inv.vibeluxShare : sum, 0
    );
    const totalRetained = history.reduce((sum, inv) => sum + inv.customerSavings, 0);
    
    return NextResponse.json({
      invoices: history,
      summary: {
        totalInvoices: history.length,
        totalSaved,
        totalPaid,
        totalRetained,
        averageSavingsPercentage: history.length > 0 
          ? history.reduce((sum, inv) => sum + inv.savingsPercentage, 0) / history.length
          : 0
      }
    });
    
  } catch (error) {
    logger.error('billing', 'Failed to get billing history', error as Error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get history' 
      },
      { status: 500 }
    );
  }
}