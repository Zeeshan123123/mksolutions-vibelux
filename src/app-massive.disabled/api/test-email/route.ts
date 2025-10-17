/**
 * Test endpoint for SendGrid email
 * DELETE THIS FILE after testing
 */

import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logging/production-logger';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
    }

    const msg = {
      to: 'your-email@example.com', // Change this to your email
      from: 'noreply@vibelux.ai', // Must be verified in SendGrid
      subject: 'VibeLux SendGrid Test',
      text: 'This is a test email from VibeLux!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">SendGrid Connected Successfully! 🎉</h1>
          <p>Your SendGrid integration is working perfectly.</p>
          <p>Next steps:</p>
          <ul>
            <li>Create dynamic templates in SendGrid</li>
            <li>Add template IDs to .env.local</li>
            <li>Start sending automated emails</li>
          </ul>
          <p style="color: #666; font-size: 14px;">
            This is a test email. Please delete the test endpoint after verification.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent! Check your inbox.' 
    });

  } catch (error: any) {
    logger.error('api', 'SendGrid error:', error );
    
    // Detailed error for debugging
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error.response?.body || error.message,
      hint: 'Make sure to verify your sender email in SendGrid'
    }, { status: 500 });
  }
}