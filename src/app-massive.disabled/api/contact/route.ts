import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, company, subject, message, type } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Send an email notification
    // 2. Store in database
    // 3. Create a support ticket
    // 4. Send to CRM

    // For now, we'll just log it and return success
    logger.info('api', 'Contact form submission:', { data: {
      name, email, company, subject, message, type, timestamp: new Date().toISOString()
    } });

    // In production, you might use a service like SendGrid, Resend, etc.
    // Example with Resend (if configured):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'VibeLux Contact <contact@vibelux.ai>',
      to: ['support@vibelux.ai'],
      replyTo: email,
      subject: `[${type}] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    */

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('api', 'Contact form error:', error );
    return NextResponse.json(
      { error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}