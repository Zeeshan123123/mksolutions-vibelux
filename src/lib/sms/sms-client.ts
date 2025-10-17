import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { logger } from '@/lib/logging/production-logger'

export interface SMSAlert {
  phoneNumber: string
  message: string
  alertType: 'critical' | 'warning' | 'info'
  facilityId?: string
  userId?: string
}

export interface SMSTemplate {
  critical: string
  warning: string
  info: string
}

class VibeLuxSMSClient {
  private snsClient: SNSClient
  private isEnabled: boolean

  constructor() {
    this.isEnabled = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    )

    if (this.isEnabled) {
      this.snsClient = new SNSClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
    } else {
      logger.warn('sms', 'SMS client disabled - missing AWS credentials')
    }
  }

  private formatMessage(alert: SMSAlert): string {
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    const prefix = {
      critical: '🚨 CRITICAL',
      warning: '⚠️ WARNING',
      info: 'ℹ️ INFO'
    }[alert.alertType]

    const facilityInfo = alert.facilityId ? ` [${alert.facilityId}]` : ''
    
    return `${prefix}${facilityInfo} - ${alert.message}\n\nTime: ${timestamp}\nVibeLux Platform`
  }

  private validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Check if it's a valid US phone number (10 or 11 digits)
    if (cleaned.length === 10) {
      return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned)
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return /^1[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned)
    }
    
    return false
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    
    return phoneNumber
  }

  async sendAlert(alert: SMSAlert): Promise<boolean> {
    if (!this.isEnabled) {
      logger.warn('sms', 'SMS sending disabled - missing configuration')
      return false
    }

    try {
      // Validate phone number
      if (!this.validatePhoneNumber(alert.phoneNumber)) {
        logger.error('sms', 'Invalid phone number format', { 
          phoneNumber: alert.phoneNumber 
        })
        return false
      }

      const formattedPhone = this.formatPhoneNumber(alert.phoneNumber)
      const message = this.formatMessage(alert)

      const command = new PublishCommand({
        PhoneNumber: formattedPhone,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: alert.alertType === 'critical' ? 'Transactional' : 'Promotional'
          },
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'VibeLux'
          }
        }
      })

      const result = await this.snsClient.send(command)
      
      logger.info('sms', 'SMS alert sent successfully', {
        messageId: result.MessageId,
        phoneNumber: formattedPhone.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
        alertType: alert.alertType,
        facilityId: alert.facilityId
      })

      return true

    } catch (error) {
      logger.error('sms', 'Failed to send SMS alert', {
        error: error instanceof Error ? error.message : 'Unknown error',
        phoneNumber: alert.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        alertType: alert.alertType
      })
      return false
    }
  }

  async sendBulkAlerts(alerts: SMSAlert[]): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      alerts.map(alert => this.sendAlert(alert))
    )

    const sent = results.filter(r => r.status === 'fulfilled' && r.value === true).length
    const failed = results.length - sent

    logger.info('sms', 'Bulk SMS alerts completed', { sent, failed, total: alerts.length })

    return { sent, failed }
  }

  // Predefined alert templates for common VibeLux scenarios
  async sendGrowthAlert(phoneNumber: string, facilityId: string, message: string) {
    return this.sendAlert({
      phoneNumber,
      message: `Growth Alert: ${message}`,
      alertType: 'warning',
      facilityId
    })
  }

  async sendEquipmentAlert(phoneNumber: string, facilityId: string, equipmentName: string, issue: string) {
    return this.sendAlert({
      phoneNumber,
      message: `Equipment Issue - ${equipmentName}: ${issue}`,
      alertType: 'critical',
      facilityId
    })
  }

  async sendEnvironmentAlert(phoneNumber: string, facilityId: string, parameter: string, value: number, threshold: number) {
    return this.sendAlert({
      phoneNumber,
      message: `Environmental Alert - ${parameter}: ${value} (threshold: ${threshold})`,
      alertType: 'warning',
      facilityId
    })
  }

  async sendHarvestAlert(phoneNumber: string, facilityId: string, cropName: string, daysToHarvest: number) {
    return this.sendAlert({
      phoneNumber,
      message: `Harvest Ready - ${cropName} ready for harvest in ${daysToHarvest} days`,
      alertType: 'info',
      facilityId
    })
  }

  async sendMaintenanceAlert(phoneNumber: string, facilityId: string, task: string, dueDate: string) {
    return this.sendAlert({
      phoneNumber,
      message: `Maintenance Due - ${task} scheduled for ${dueDate}`,
      alertType: 'info',
      facilityId
    })
  }

  getStatus(): { enabled: boolean; reason?: string } {
    if (!this.isEnabled) {
      return {
        enabled: false,
        reason: 'Missing AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)'
      }
    }

    return { enabled: true }
  }
}

export const smsClient = new VibeLuxSMSClient()
export default smsClient