// Email module exports
export { EmailService, emailService } from './email-service';
export { sendCollectionNotification } from './collection-notifications';
export { ConsultationEmailService } from './consultation-notifications';
export { sendInvoiceEmail as sendInvoice } from './invoice-mailer';
export { sendPaymentNotification } from './payment-notifications';

// Provide sendEmail as an alias
export const sendEmail = (to: string, subject: string, content: string) => {
  const service = new EmailService();
  return service.sendEmail(to, subject, content);
};

// Provide sendConsultationNotification as an alias
export const sendConsultationNotification = (consultation: any) => {
  const service = new ConsultationEmailService();
  return service.sendNotification(consultation);
};