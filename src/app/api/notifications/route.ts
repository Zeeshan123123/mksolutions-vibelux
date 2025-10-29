import { NextRequest, NextResponse } from 'next/server';
import { getNotificationService, initNotificationService } from '@/lib/notifications/alert-notifications';
import { notificationConfig } from '@/lib/notifications/config/config';

// Initialize service once when the API route loads
let isInitialized = false;

function ensureInitialized() {
  if (!isInitialized) {
    try {
      console.log('🚀 Initializing notification service in API route...');
      initNotificationService(notificationConfig);
      console.log('✅ Notification service initialized');
      isInitialized = true;
    } catch (error: any) {
      console.error('❌ Failed to initialize:', error.message);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize service if not already done
    ensureInitialized();
    
    const body = await request.json();
    const { type, ...params } = body;

    const service = getNotificationService();

    switch (type) {
      case 'email': {
        const { to, subject, html, text, template } = params;
        
        if (!to || !subject) {
          return NextResponse.json(
            { error: 'Missing required fields: to, subject' },
            { status: 400 }
          );
        }

        const result = await service.sendEmail({ to, subject, html, text, template });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 429 });
        }

        return NextResponse.json({ success: true, messageId: result.messageId });
      }

      case 'sms': {
        const { to, message } = params;
        
        if (!to || !message) {
          return NextResponse.json(
            { error: 'Missing required fields: to, message' },
            { status: 400 }
          );
        }

        const result = await service.sendSMS({ to, message });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 429 });
        }

        return NextResponse.json({ success: true, messageId: result.messageId });
      }

      case 'alert': {
        const { email, sms } = params;
        
        if (!email && !sms) {
          return NextResponse.json(
            { error: 'At least one notification type (email or sms) is required' },
            { status: 400 }
          );
        }

        const results = await service.sendAlert({ email, sms });
        return NextResponse.json({ success: true, results });
      }

      case 'critical': {
        const { to, title, message } = params;
        
        if (!to || !title || !message) {
          return NextResponse.json(
            { error: 'Missing required fields: to, title, message' },
            { status: 400 }
          );
        }

        await service.sendCriticalAlert({ to, title, message });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid notification type. Use: email, sms, alert, or critical' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
