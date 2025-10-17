/**
 * Email Automation Flows
 * Triggered by utility connection events
 */

import { SendGridClient } from './sendgrid-client';
import { sql } from '@/lib/db';

export class EmailAutomation {
  /**
   * Onboarding email sequence
   */
  static async startOnboardingSequence(
    userId: string,
    email: string,
    facilityId: string,
    facilityName: string
  ) {
    // Day 0: Send connection invite
    await SendGridClient.sendUtilityConnectionInvite(
      email,
      facilityId,
      facilityName
    );

    // Schedule follow-ups if not connected
    await this.scheduleFollowUp(userId, email, facilityId, facilityName);
  }

  /**
   * Handle successful connection
   */
  static async handleConnectionSuccess(
    email: string,
    utilityName: string,
    facilityId: string
  ) {
    // Send immediate confirmation
    await SendGridClient.sendConnectionSuccess(email, utilityName);

    // Cancel any pending follow-ups
    await this.cancelFollowUps(facilityId);

    // Schedule savings report notification for 48 hours
    await this.scheduleSavingsReport(email, facilityId, 48);
  }

  /**
   * Handle connection failure
   */
  static async handleConnectionFailure(
    email: string,
    facilityName: string,
    reason?: string
  ) {
    await SendGridClient.sendConnectionFailure(
      email,
      facilityName,
      reason
    );
  }

  /**
   * Schedule follow-up reminders
   */
  private static async scheduleFollowUp(
    userId: string,
    email: string,
    facilityId: string,
    facilityName: string
  ) {
    // Day 3: First reminder
    setTimeout(async () => {
      const isConnected = await this.checkIfConnected(facilityId);
      if (!isConnected) {
        await this.sendReminder(email, facilityId, facilityName, 1);
      }
    }, 3 * 24 * 60 * 60 * 1000);

    // Day 7: Second reminder with urgency
    setTimeout(async () => {
      const isConnected = await this.checkIfConnected(facilityId);
      if (!isConnected) {
        await this.sendReminder(email, facilityId, facilityName, 2);
      }
    }, 7 * 24 * 60 * 60 * 1000);

    // Day 14: Final reminder with incentive
    setTimeout(async () => {
      const isConnected = await this.checkIfConnected(facilityId);
      if (!isConnected) {
        await this.sendReminder(email, facilityId, facilityName, 3);
      }
    }, 14 * 24 * 60 * 60 * 1000);
  }

  /**
   * Send reminder emails
   */
  private static async sendReminder(
    email: string,
    facilityId: string,
    facilityName: string,
    reminderNumber: number
  ) {
    const subjects = [
      '⏰ Reminder: Connect Your Utility to Start Saving',
      '💡 You\'re Missing Out on Energy Savings',
      '🎁 Last Chance: Exclusive Bonus for Connecting Today'
    ];

    const bonuses = [
      'Complete your connection today',
      'Limited time: Extra 5% savings bonus',
      'Connect now and get priority optimization'
    ];

    // Use same template with different subject/data
    await SendGridClient.sendUtilityConnectionInvite(
      email,
      facilityId,
      facilityName,
      bonuses[reminderNumber - 1]
    );
  }

  /**
   * Check if facility is connected
   */
  private static async checkIfConnected(facilityId: string): Promise<boolean> {
    const result = await sql`
      SELECT connection_status 
      FROM utility_connections 
      WHERE facility_id = ${facilityId} 
      AND connection_status = 'active'
      LIMIT 1
    `;
    return result.length > 0;
  }

  /**
   * Cancel pending follow-ups
   */
  private static async cancelFollowUps(facilityId: string) {
    // In production, use a job queue like Bull or database scheduled jobs
    logger.info('api', `Cancelling follow-ups for facility ${facilityId}`);
  }

  /**
   * Schedule savings report
   */
  private static async scheduleSavingsReport(
    email: string,
    facilityId: string,
    hoursDelay: number
  ) {
    setTimeout(async () => {
      // Get savings data
      const savings = await this.calculateSavings(facilityId);
      
      if (savings.annual > 0) {
        await SendGridClient.sendSavingsReportReady(
          email,
          savings.facilityName,
          savings.annual,
          savings.customerShare
        );
      }
    }, hoursDelay * 60 * 60 * 1000);
  }

  /**
   * Calculate savings for facility
   */
  private static async calculateSavings(facilityId: string) {
    // This would pull from your actual calculations
    const mockSavings = {
      facilityName: 'Main Office',
      annual: 15000,
      customerShare: 10500, // 70% of 15000
      vibeluxShare: 4500
    };
    
    return mockSavings;
  }

  /**
   * Send monthly updates
   */
  static async sendMonthlyUpdates() {
    const activeCustomers = await sql`
      SELECT DISTINCT 
        u.email,
        f.name as facility_name,
        uc.facility_id
      FROM utility_connections uc
      JOIN facilities f ON uc.facility_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE uc.connection_status = 'active'
    `;

    for (const customer of activeCustomers) {
      const monthlyData = await this.getMonthlyData(customer.facility_id);
      
      await SendGridClient.sendMonthlySavingsUpdate(
        customer.email,
        monthlyData.month,
        monthlyData.savedAmount,
        monthlyData.carbonReduced,
        monthlyData.yearToDateSavings
      );
    }
  }

  private static async getMonthlyData(facilityId: string) {
    // Mock data - replace with actual calculations
    return {
      month: 'December',
      savedAmount: 1250,
      carbonReduced: 2.5,
      yearToDateSavings: 15000
    };
  }
}