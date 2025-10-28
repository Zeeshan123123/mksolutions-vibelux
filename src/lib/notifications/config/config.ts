import { NotificationConfig } from '@/lib/notifications/alert-notifications';

export const notificationConfig: NotificationConfig = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    fromEmail: process.env.SENDGRID_FROM_EMAIL!,
    fromName: process.env.SENDGRID_FROM_NAME || 'Alert System',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    fromPhone: process.env.TWILIO_FROM_PHONE!,
  },
};